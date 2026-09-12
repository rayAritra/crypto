"use client";

import { useWalletState } from "@/components/providers/WalletState";
import { Button } from "@/components/shared/Button";
import { notify } from "@/components/shared/ToastViewport";
import { hoodLensAmounts, hoodLensToken } from "@/config/hoodlens-token";
import { useCallback, useEffect, useState } from "react";
import {
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiDatabase,
  FiExternalLink,
  FiLock,
  FiRefreshCw,
  FiSend,
  FiShield,
  FiZap,
} from "react-icons/fi";

type AccessData = {
  configured: boolean;
  paymentsEnabled: boolean;
  databaseReady: boolean;
  address: string;
  symbol: string;
  balance: string;
  premium: boolean;
  credits: number;
  launchCredits: number;
};

type PendingPayment = {
  hash: `0x${string}`;
  address: string;
  purpose: "launch" | "credits";
};

const pendingKey = "hoodlens.pending-payment.v1";

function readPending(): PendingPayment | null {
  try {
    return JSON.parse(localStorage.getItem(pendingKey) || "null") as PendingPayment | null;
  } catch {
    return null;
  }
}

function ProductCard({
  icon,
  title,
  eyebrow,
  description,
  price,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  eyebrow: string;
  description: string;
  price: string;
  children: React.ReactNode;
}) {
  return (
    <article className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col min-h-[300px]">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[#c7ff5b]/10 border border-[#c7ff5b]/20 flex items-center justify-center text-[#c7ff5b] text-lg">
          {icon}
        </div>
        <span className="text-[10px] uppercase tracking-[0.16em] font-mono text-on-surface-variant border border-outline-variant rounded-full px-2 py-1">
          {eyebrow}
        </span>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm leading-relaxed text-on-surface-variant mb-5 flex-1">
        {description}
      </p>
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-wider text-outline font-mono">Cost</div>
        <div className="text-lg text-white font-mono font-semibold">{price}</div>
      </div>
      {children}
    </article>
  );
}

export function AccessClient() {
  const wallet = useWalletState();
  const [access, setAccess] = useState<AccessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState<"launch" | "credits" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingPayment | null>(null);

  const refresh = useCallback(async () => {
    if (!wallet.address) {
      setAccess(null);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/access?address=${wallet.address}`, {
        cache: "no-store",
      });
      const result = (await response.json()) as {
        data?: AccessData;
        error?: { message?: string };
      };
      if (!response.ok || !result.data) {
        throw new Error(result.error?.message || "Could not load access status.");
      }
      setAccess(result.data);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load access status.");
    } finally {
      setLoading(false);
    }
  }, [wallet.address]);

  useEffect(() => {
    setPending(readPending());
    void refresh();
  }, [refresh]);

  async function purchase(purpose: "launch" | "credits") {
    setPaying(purpose);
    setError(null);
    try {
      const hash = await wallet.pay(purpose);
      notify(purpose === "launch" ? "Creator launch credit added." : "Analytics credits added.");
      setPending(null);
      await refresh();
      window.open(`${hoodLensToken.explorerUrl}/tx/${hash}`, "_blank", "noopener,noreferrer");
    } catch (cause) {
      setPending(readPending());
      setError(cause instanceof Error ? cause.message : "Payment failed.");
    } finally {
      setPaying(null);
    }
  }

  async function recoverPending() {
    if (!pending) return;
    setPaying(pending.purpose);
    setError(null);
    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pending),
      });
      const result = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) throw new Error(result.error?.message || "Verification failed.");
      localStorage.removeItem(pendingKey);
      setPending(null);
      notify("Previous payment recovered and credited.");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Verification failed.");
    } finally {
      setPaying(null);
    }
  }

  const ready = Boolean(access?.paymentsEnabled && wallet.correctChain);

  return (
    <main className="min-h-screen bg-background">
      <section className="site-container max-w-[1180px] mx-auto py-12 sm:py-16">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-mono text-[#c7ff5b] mb-4">
            <FiShield /> HoodLens utility layer
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Research freely. Pay only for active utility.
          </h1>
          <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed">
            Search and objective risk data remain free. HoodLens tokens activate creator launches,
            continuous monitoring, and compute-heavy forensic tools.
          </p>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 sm:p-5 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {!wallet.address ? (
            <>
              <div>
                <div className="text-white font-semibold mb-1">Connect your wallet</div>
                <div className="text-sm text-on-surface-variant">
                  HoodLens never requests seed phrases or private keys.
                </div>
              </div>
              <Button size="lg" onClick={() => void wallet.connect()} disabled={wallet.connecting}>
                {wallet.connecting ? "Connecting…" : "Connect wallet"}
              </Button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 flex-1">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-outline font-mono">Wallet</div>
                  <div className="text-sm text-white font-mono mt-1">
                    {wallet.address.slice(0, 7)}…{wallet.address.slice(-5)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-outline font-mono">Balance</div>
                  <div className="text-sm text-white font-mono mt-1">
                    {wallet.balanceLabel} {hoodLensToken.symbol}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-outline font-mono">Credits</div>
                  <div className="text-sm text-white font-mono mt-1">{access?.credits ?? 0}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-outline font-mono">Launch passes</div>
                  <div className="text-sm text-white font-mono mt-1">{access?.launchCredits ?? 0}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={loading}
                className="text-xs text-on-surface-variant hover:text-white inline-flex items-center gap-2"
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </>
          )}
        </div>

        {pending && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-amber-100">
              A previous payment is waiting to be credited. You will not be asked to pay again.
            </div>
            <Button variant="outline" size="sm" onClick={() => void recoverPending()} disabled={Boolean(paying)}>
              Verify payment
            </Button>
          </div>
        )}

        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-error/30 bg-error-container/15 px-4 py-3 text-sm text-on-error-container">
            {error}
          </div>
        )}

        {wallet.address && access && !access.paymentsEnabled && (
          <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container px-4 py-3 text-sm text-on-surface-variant">
            <strong className="text-white">Launch-safe mode:</strong> payments remain disabled until the token addresses,
            prices, and database migration are configured. Free research is unaffected.
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5 mb-10">
          <ProductCard
            icon={<FiSend />}
            eyebrow="Creators"
            title="Launch Pass"
            description="Reserve one creator launch. The pass is recorded against the paying wallet and cannot be credited twice from the same transaction."
            price={`${hoodLensToken.launchPrice} ${hoodLensToken.symbol}`}
          >
            <Button
              size="lg"
              disabled={!ready || hoodLensAmounts.launch <= 0n || Boolean(paying)}
              onClick={() => void purchase("launch")}
              className="w-full"
            >
              {paying === "launch" ? "Confirming…" : "Purchase launch pass"}
            </Button>
          </ProductCard>

          <ProductCard
            icon={<FiDatabase />}
            eyebrow="Forensics"
            title="Analytics Credits"
            description={`Add ${hoodLensToken.creditsPerPayment} credits for deep holder reconstruction, exports, priority refreshes, and future API usage.`}
            price={`${hoodLensToken.creditPrice} ${hoodLensToken.symbol}`}
          >
            <Button
              size="lg"
              variant="outline"
              disabled={!ready || hoodLensAmounts.credits <= 0n || Boolean(paying)}
              onClick={() => void purchase("credits")}
              className="w-full"
            >
              {paying === "credits" ? "Confirming…" : `Buy ${hoodLensToken.creditsPerPayment} credits`}
            </Button>
          </ProductCard>

          <ProductCard
            icon={<FiActivity />}
            eyebrow="Monitoring"
            title="Sentinel Access"
            description="Hold the configured threshold to unlock persistent liquidity, holder, ownership, volume, and risk-deterioration alerts."
            price={`${hoodLensToken.premiumBalance} ${hoodLensToken.symbol} held`}
          >
            <div className={`rounded-xl px-3 py-2.5 text-sm font-semibold flex items-center gap-2 ${access?.premium ? "bg-[#43c98b]/10 text-[#79fbb8] border border-[#43c98b]/20" : "bg-surface-container-high text-on-surface-variant border border-outline-variant"}`}>
              {access?.premium ? <FiCheckCircle /> : <FiLock />}
              {access?.premium ? "Sentinel unlocked" : "Threshold not met"}
            </div>
          </ProductCard>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            [<FiZap key="i" />, "On-chain verification", "Every payment is validated against the ERC-20 Transfer event and required confirmations."],
            [<FiClock key="i" />, "Replay protected", "A transaction hash can grant access only once, enforced atomically in the database."],
            [<FiExternalLink key="i" />, "Publicly auditable", "Payments and balances remain inspectable through the Robinhood Chain explorer."],
          ].map(([icon, title, copy]) => (
            <div key={String(title)} className="rounded-xl border border-outline-variant p-4 bg-surface-container-low">
              <div className="text-[#c7ff5b] mb-3">{icon}</div>
              <div className="text-sm font-semibold text-white mb-1">{title}</div>
              <div className="text-xs leading-relaxed text-on-surface-variant">{copy}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
