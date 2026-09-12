"use client";

import { useWalletState } from "@/components/providers/WalletState";
import { hoodLensToken } from "@/config/hoodlens-token";
import { FiChevronDown, FiWifiOff } from "react-icons/fi";

function short(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletButton({ compact = false }: { compact?: boolean }) {
  const wallet = useWalletState();

  if (!wallet.address) {
    return (
      <button
        type="button"
        onClick={() => void wallet.connect()}
        disabled={wallet.connecting}
        className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg border border-[#bdf451]/50 bg-[#bdf451]/10 text-[#c7ff5b] text-xs font-semibold hover:bg-[#bdf451]/15 transition-colors disabled:opacity-50"
      >
        {wallet.connecting ? "Connecting…" : "Connect wallet"}
      </button>
    );
  }

  if (!wallet.correctChain) {
    return (
      <button
        type="button"
        onClick={() => void wallet.switchNetwork()}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-semibold"
      >
        <FiWifiOff /> Switch network
      </button>
    );
  }

  return (
    <a
      href="/access"
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-outline-variant bg-surface-container-high text-xs hover:border-[#bdf451]/40 transition-colors"
      title={`${wallet.balanceLabel} ${hoodLensToken.symbol}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#43c98b]" />
      <span className="font-mono">{short(wallet.address)}</span>
      {!compact && (
        <span className="hidden xl:inline text-on-surface-variant">
          {wallet.balanceLabel} {hoodLensToken.symbol}
        </span>
      )}
      <FiChevronDown className="text-outline" />
    </a>
  );
}
