import { getAddress, isAddress, parseUnits, type Address } from "viem";

function address(value: string | undefined): Address | null {
  return value && isAddress(value) ? getAddress(value) : null;
}

function integer(value: string | undefined, fallback: number) {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function amount(value: string | undefined, fallback: string, decimals: number) {
  try {
    return parseUnits(value || fallback, decimals);
  } catch {
    return 0n;
  }
}

const decimals = integer(process.env.NEXT_PUBLIC_HOODLENS_TOKEN_DECIMALS, 18);

export const hoodLensToken = {
  chainId: integer(process.env.NEXT_PUBLIC_HOODLENS_CHAIN_ID, 4663),
  chainName:
    process.env.NEXT_PUBLIC_HOODLENS_CHAIN_NAME || "Robinhood Chain",
  rpcUrl:
    process.env.NEXT_PUBLIC_HOODLENS_RPC_URL ||
    "https://rpc.mainnet.chain.robinhood.com",
  explorerUrl:
    process.env.NEXT_PUBLIC_HOODLENS_EXPLORER_URL ||
    "https://robinhoodchain.blockscout.com",
  address: address(process.env.NEXT_PUBLIC_HOODLENS_TOKEN_ADDRESS),
  recipient: address(process.env.NEXT_PUBLIC_HOODLENS_PAYMENT_RECIPIENT),
  symbol: process.env.NEXT_PUBLIC_HOODLENS_TOKEN_SYMBOL || "HLENS",
  decimals,
  launchPrice: process.env.NEXT_PUBLIC_HOODLENS_LAUNCH_PRICE || "0",
  creditPrice: process.env.NEXT_PUBLIC_HOODLENS_CREDIT_PRICE || "0",
  creditsPerPayment: integer(
    process.env.NEXT_PUBLIC_HOODLENS_CREDITS_PER_PAYMENT,
    100,
  ),
  premiumBalance: process.env.NEXT_PUBLIC_HOODLENS_PREMIUM_BALANCE || "1",
  confirmations: Math.max(
    1,
    integer(process.env.NEXT_PUBLIC_HOODLENS_PAYMENT_CONFIRMATIONS, 2),
  ),
} as const;

export const hoodLensAmounts = {
  launch: amount(
    hoodLensToken.launchPrice,
    "0",
    hoodLensToken.decimals,
  ),
  credits: amount(
    hoodLensToken.creditPrice,
    "0",
    hoodLensToken.decimals,
  ),
  premium: amount(
    hoodLensToken.premiumBalance,
    "0",
    hoodLensToken.decimals,
  ),
};

export const hoodLensPaymentsEnabled = Boolean(
  hoodLensToken.address &&
    hoodLensToken.recipient &&
    (hoodLensAmounts.launch > 0n || hoodLensAmounts.credits > 0n),
);
