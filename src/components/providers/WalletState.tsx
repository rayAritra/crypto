"use client";

import { hoodLensAmounts, hoodLensToken } from "@/config/hoodlens-token";
import { notify } from "@/components/shared/ToastViewport";
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  erc20Abi,
  formatUnits,
  http,
  type Address,
  type EIP1193Provider,
  type Hash,
} from "viem";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type PaymentPurpose = "launch" | "credits";

type EthereumProvider = EIP1193Provider & {
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const chain = defineChain({
  id: hoodLensToken.chainId,
  name: hoodLensToken.chainName,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [hoodLensToken.rpcUrl] } },
  blockExplorers: {
    default: { name: "Robinhood Explorer", url: hoodLensToken.explorerUrl },
  },
});

const publicClient = createPublicClient({
  chain,
  transport: http(hoodLensToken.rpcUrl, { timeout: 10_000, retryCount: 2 }),
});

type WalletStateValue = {
  address: Address | null;
  chainId: number | null;
  balance: bigint | null;
  balanceLabel: string;
  connecting: boolean;
  installed: boolean;
  correctChain: boolean;
  premium: boolean;
  connect(): Promise<void>;
  disconnect(): void;
  switchNetwork(): Promise<void>;
  refreshBalance(): Promise<void>;
  pay(purpose: PaymentPurpose): Promise<Hash>;
};

const WalletState = createContext<WalletStateValue | null>(null);

export function WalletStateProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<Address | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [connecting, setConnecting] = useState(false);
  const installed = typeof window !== "undefined" && Boolean(window.ethereum);

  const refreshBalance = useCallback(async () => {
    if (!address || !hoodLensToken.address) {
      setBalance(null);
      return;
    }
    try {
      const next = await publicClient.readContract({
        address: hoodLensToken.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address],
      });
      setBalance(next);
    } catch {
      setBalance(null);
    }
  }, [address]);

  const syncProvider = useCallback(async () => {
    const provider = window.ethereum;
    if (!provider) return;
    const [accounts, walletChainId] = await Promise.all([
      provider.request({ method: "eth_accounts" }),
      provider.request({ method: "eth_chainId" }),
    ]);
    const values = accounts as Address[];
    setAddress(values[0] ?? null);
    setChainId(Number.parseInt(walletChainId as string, 16));
  }, []);

  useEffect(() => {
    void syncProvider();
    const provider = window.ethereum;
    if (!provider?.on) return;
    const changed = () => void syncProvider();
    provider.on("accountsChanged", changed);
    provider.on("chainChanged", changed);
    return () => {
      provider.removeListener?.("accountsChanged", changed);
      provider.removeListener?.("chainChanged", changed);
    };
  }, [syncProvider]);

  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance, chainId]);

  const switchNetwork = useCallback(async () => {
    const provider = window.ethereum;
    if (!provider) throw new Error("Install a browser wallet first.");
    const chainHex = `0x${hoodLensToken.chainId.toString(16)}` as `0x${string}`;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainHex }],
      });
    } catch (error) {
      const code = (error as { code?: number }).code;
      if (code !== 4902) throw error;
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainHex,
            chainName: hoodLensToken.chainName,
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: [hoodLensToken.rpcUrl],
            blockExplorerUrls: [hoodLensToken.explorerUrl],
          },
        ],
      });
    }
    await syncProvider();
  }, [syncProvider]);

  const connect = useCallback(async () => {
    const provider = window.ethereum;
    if (!provider) {
      notify("Install MetaMask or another browser wallet.", "info");
      return;
    }
    setConnecting(true);
    try {
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as Address[];
      setAddress(accounts[0] ?? null);
      await switchNetwork();
    } finally {
      setConnecting(false);
    }
  }, [switchNetwork]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
  }, []);

  const pay = useCallback(
    async (purpose: PaymentPurpose) => {
      if (!address || !window.ethereum) throw new Error("Connect your wallet.");
      if (!hoodLensToken.address || !hoodLensToken.recipient) {
        throw new Error("HoodLens payments are not configured yet.");
      }
      if (chainId !== hoodLensToken.chainId) await switchNetwork();
      const value = hoodLensAmounts[purpose];
      if (value <= 0n) throw new Error("This payment price is not configured.");
      const walletClient = createWalletClient({
        account: address,
        chain,
        transport: custom(window.ethereum),
      });
      const hash = await walletClient.writeContract({
        address: hoodLensToken.address,
        abi: erc20Abi,
        functionName: "transfer",
        args: [hoodLensToken.recipient, value],
      });
      localStorage.setItem(
        "hoodlens.pending-payment.v1",
        JSON.stringify({ hash, address, purpose }),
      );
      await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: hoodLensToken.confirmations,
        timeout: 120_000,
      });
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash, address, purpose }),
      });
      const result = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) {
        throw new Error(result.error?.message || "Payment verification failed.");
      }
      localStorage.removeItem("hoodlens.pending-payment.v1");
      await refreshBalance();
      return hash;
    },
    [address, chainId, refreshBalance, switchNetwork],
  );

  const value = useMemo<WalletStateValue>(
    () => ({
      address,
      chainId,
      balance,
      balanceLabel:
        balance === null
          ? "—"
          : Number(formatUnits(balance, hoodLensToken.decimals)).toLocaleString(
              undefined,
              { maximumFractionDigits: 4 },
            ),
      connecting,
      installed,
      correctChain: chainId === hoodLensToken.chainId,
      premium:
        balance !== null &&
        hoodLensAmounts.premium > 0n &&
        balance >= hoodLensAmounts.premium,
      connect,
      disconnect,
      switchNetwork,
      refreshBalance,
      pay,
    }),
    [
      address,
      balance,
      chainId,
      connect,
      connecting,
      disconnect,
      installed,
      pay,
      refreshBalance,
      switchNetwork,
    ],
  );

  return <WalletState.Provider value={value}>{children}</WalletState.Provider>;
}

export function useWalletState() {
  const state = useContext(WalletState);
  if (!state) throw new Error("WalletStateProvider missing");
  return state;
}
