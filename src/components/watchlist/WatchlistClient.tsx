"use client";

import { useAppState } from "@/components/providers/AppState";
import { Button } from "@/components/shared/Button";
import { CompareButton } from "@/components/shared/CompareButton";
import { CopyButton } from "@/components/shared/CopyButton";
import { TokenAvatar } from "@/components/shared/TokenAvatar";
import { compactNumber, shortenAddress } from "@/lib/utils/format";
import type { TokenAnalytics } from "@/types/token";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiTrash2 } from "react-icons/fi";
import { RiArrowRightUpLine, RiStarLine } from "react-icons/ri";

function getRiskBadge(score: number | null | undefined) {
  const s = score ?? 80;
  if (s >= 95) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-data-mono-sm font-semibold bg-tertiary-container/20 text-tertiary-fixed border border-tertiary-fixed/30">
        {s} · Minimal
      </span>
    );
  }
  if (s >= 80) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-data-mono-sm font-semibold bg-tertiary-container/20 text-tertiary-fixed border border-tertiary-fixed/30">
        {s} · Low
      </span>
    );
  }
  if (s >= 65) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-data-mono-sm font-semibold bg-surface-container text-on-surface border border-outline">
        {s} · Moderate
      </span>
    );
  }
  if (s >= 50) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-data-mono-sm font-semibold bg-error-container/30 text-error border border-error/40">
        {s} · Elevated
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-data-mono-sm font-semibold bg-error-container text-on-error-container border border-error/50">
      {s} · Critical
    </span>
  );
}

export function WatchlistClient() {
  const s = useAppState();
  const [data, setData] = useState<TokenAnalytics[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!s.ready || !s.watchlist.length) {
      setData([]);
      return;
    }
    setLoading(true);
    Promise.allSettled(
      s.watchlist.map((x) =>
        fetch(`/api/token/${x.address}`).then((r) => (r.ok ? r.json() : null)),
      ),
    )
      .then((results) =>
        setData(
          results.flatMap((r) =>
            r.status === "fulfilled" && r.value ? [r.value] : [],
          ),
        ),
      )
      .finally(() => setLoading(false));
  }, [s.ready, s.watchlist]);

  // Aggregate metrics
  const totals = useMemo(() => {
    let vol = 0;
    let liq = 0;
    let lowRiskCount = 0;
    for (const item of data) {
      vol += item.metrics?.volume24hUsd ?? 0;
      liq += item.metrics?.liquidityUsd ?? 0;
      if ((item.risk?.score ?? 80) >= 80) lowRiskCount++;
    }
    return { vol, liq, lowRiskCount };
  }, [data]);

  if (!s.ready || loading) {
    return <WatchSkeleton />;
  }

  if (!s.watchlist.length) {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 md:p-14 text-center flex flex-col items-center justify-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/60 flex items-center justify-center mb-4 text-outline">
            <RiStarLine className="text-2xl" />
          </div>
          <h2 className="text-xl sm:text-2xl font-headline font-bold text-on-surface">
            No Tokens Monitored Yet
          </h2>
          <p className="text-body-md text-on-surface-variant mt-2 max-w-lg">
            Save tokens you want to track across market moves, liquidity depth
            shifts, and transparent risk scoring. Your watchlist is preserved
            locally in your browser with zero remote profiling.
          </p>
          <Button
            variant="primary"
            size="lg"
            href="/discover"
            icon={<FiArrowRight className="text-base" />}
            iconPosition="right"
            className="mt-6"
          >
            Explore Discovery Desk
          </Button>
        </div>

        {/* Quick Launchpad Cards for Large Screens */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <Link
            href="/discover?view=trending"
            className="p-5 bg-surface-container-lowest border border-outline-variant/70 hover:border-primary-fixed/50 rounded-xl transition-colors group flex flex-col justify-between"
          >
            <div>
              <p className="text-label-caps text-outline uppercase font-semibold">
                SIGNAL 01
              </p>
              <h3 className="text-base font-headline font-bold text-on-surface group-hover:text-primary-fixed transition-colors mt-1">
                Trending Desk
              </h3>
              <p className="text-body-sm text-on-surface-variant mt-1.5">
                Tokens with accelerating trade velocity and active liquidity
                flows on Robinhood Chain.
              </p>
            </div>
            <div className="flex items-center gap-1 text-data-mono-sm text-primary-fixed font-semibold mt-4">
              <span>View Trending</span>
              <FiArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/discover?view=new"
            className="p-5 bg-surface-container-lowest border border-outline-variant/70 hover:border-primary-fixed/50 rounded-xl transition-colors group flex flex-col justify-between"
          >
            <div>
              <p className="text-label-caps text-outline uppercase font-semibold">
                SIGNAL 02
              </p>
              <h3 className="text-base font-headline font-bold text-on-surface group-hover:text-primary-fixed transition-colors mt-1">
                New Tokens
              </h3>
              <p className="text-body-sm text-on-surface-variant mt-1.5">
                Recently deployed ERC-20 smart contracts indexed by Robinhood
                Chain node RPCs.
              </p>
            </div>
            <div className="flex items-center gap-1 text-data-mono-sm text-primary-fixed font-semibold mt-4">
              <span>View New Tokens</span>
              <FiArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/compare"
            className="p-5 bg-surface-container-lowest border border-outline-variant/70 hover:border-primary-fixed/50 rounded-xl transition-colors group flex flex-col justify-between"
          >
            <div>
              <p className="text-label-caps text-outline uppercase font-semibold">
                ANALYSIS
              </p>
              <h3 className="text-base font-headline font-bold text-on-surface group-hover:text-primary-fixed transition-colors mt-1">
                Compare Matrix
              </h3>
              <p className="text-body-sm text-on-surface-variant mt-1.5">
                Side-by-side benchmark comparing liquidity depth, holder
                distribution, and risk scores.
              </p>
            </div>
            <div className="flex items-center gap-1 text-data-mono-sm text-primary-fixed font-semibold mt-4">
              <span>Open Compare</span>
              <FiArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Portfolio Telemetry KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5">
          <p className="text-label-caps text-outline uppercase font-semibold">
            Tracked Assets
          </p>
          <p className="text-xl font-data-mono-lg font-bold text-on-surface mt-1">
            {s.watchlist.length}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5">
          <p className="text-label-caps text-outline uppercase font-semibold">
            Aggregated 24H Volume
          </p>
          <p className="text-xl font-data-mono-lg font-bold text-on-surface mt-1">
            {compactNumber(totals.vol, true)}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5">
          <p className="text-label-caps text-outline uppercase font-semibold">
            Combined Liquidity
          </p>
          <p className="text-xl font-data-mono-lg font-bold text-on-surface mt-1">
            {compactNumber(totals.liq, true)}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5">
          <p className="text-label-caps text-outline uppercase font-semibold">
            Low Risk Assets
          </p>
          <p className="text-xl font-data-mono-lg font-bold text-tertiary-fixed mt-1">
            {totals.lowRiskCount} / {s.watchlist.length}
          </p>
        </div>
      </div>

      {/* Main Dense Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container/30 text-label-caps text-outline uppercase">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">24H Change</th>
                <th className="py-3 px-4 text-right">24H Volume</th>
                <th className="py-3 px-4 text-right">Liquidity</th>
                <th className="py-3 px-4 text-center">HoodLens Risk</th>
                <th className="py-3 px-4 text-right">Since Added</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 font-body-sm">
              {s.watchlist.map((saved, idx) => {
                const x = data.find(
                  (d) =>
                    d.token.address.toLowerCase() ===
                    saved.address.toLowerCase(),
                );
                const currentPrice = x?.metrics?.priceUsd;
                const change =
                  saved.addedPrice && currentPrice
                    ? ((currentPrice - saved.addedPrice) / saved.addedPrice) *
                      100
                    : null;
                const priceChange24h = x?.metrics?.priceChange24h;

                return (
                  <tr
                    key={saved.address}
                    className="hover:bg-surface-container-high/30 transition-colors group"
                  >
                    <td className="py-3 px-4 text-center text-data-mono-sm text-outline">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/token/${saved.address}`}
                          className="shrink-0 hover:opacity-80 transition-opacity"
                        >
                          <TokenAvatar
                            address={saved.address}
                            symbol={saved.symbol}
                            size={36}
                          />
                        </Link>
                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/token/${saved.address}`}
                            className="font-bold text-on-surface hover:text-primary-fixed transition-colors truncate"
                          >
                            {saved.symbol}
                          </Link>
                          <div className="flex items-center gap-1.5 text-data-mono-sm text-outline">
                            <span className="truncate max-w-[120px]">
                              {saved.name}
                            </span>
                            <span>·</span>
                            <span>{shortenAddress(saved.address)}</span>
                            <CopyButton value={saved.address} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-data-mono-sm text-on-surface">
                      {compactNumber(currentPrice, true)}
                    </td>
                    <td className="py-3 px-4 text-right font-data-mono-sm">
                      {priceChange24h == null ? (
                        <span className="text-outline">—</span>
                      ) : (
                        <span
                          className={
                            priceChange24h >= 0
                              ? "text-primary-fixed"
                              : "text-error"
                          }
                        >
                          {priceChange24h > 0 ? "+" : ""}
                          {priceChange24h.toFixed(2)}%
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-data-mono-sm text-on-surface-variant">
                      {compactNumber(x?.metrics?.volume24hUsd, true)}
                    </td>
                    <td className="py-3 px-4 text-right font-data-mono-sm text-on-surface-variant">
                      {compactNumber(x?.metrics?.liquidityUsd, true)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getRiskBadge(x?.risk.score)}
                    </td>
                    <td className="py-3 px-4 text-right font-data-mono-sm">
                      {change == null ? (
                        <span className="text-outline">—</span>
                      ) : (
                        <span
                          className={
                            change >= 0 ? "text-primary-fixed" : "text-error"
                          }
                        >
                          {change > 0 ? "+" : ""}
                          {change.toFixed(2)}%
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {x && <CompareButton item={x} compact />}
                        <Link
                          href={`/token/${saved.address}`}
                          className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
                          title="View Token Analysis"
                          aria-label={`View ${saved.symbol} analysis`}
                        >
                          <RiArrowRightUpLine className="text-base" />
                        </Link>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-surface-container-high transition-colors cursor-pointer"
                          onClick={() => {
                            if (x) {
                              s.toggleWatch(x);
                            } else {
                              s.toggleWatch({
                                token: {
                                  ...saved,
                                  decimals: 0,
                                  totalSupply: "0",
                                  chainId: 88899,
                                  firstSeenAt: saved.addedAt,
                                  explorerUrl: "",
                                },
                                metrics: null,
                              });
                            }
                          }}
                          aria-label={`Remove ${saved.symbol}`}
                          title={`Remove ${saved.symbol} from watchlist`}
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function WatchSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="h-20 bg-surface-container-lowest border border-outline-variant/60 rounded-xl"
          />
        ))}
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden p-6 space-y-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="h-12 bg-surface-container-high/40 rounded-lg w-full"
          />
        ))}
      </div>
    </div>
  );
}
