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
import {
  RiArrowRightUpLine,
  RiLayoutGridLine,
  RiStarLine,
  RiTableLine,
} from "react-icons/ri";

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
  const [mobileView, setMobileView] = useState<"cards" | "table">("cards");

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

      {/* List Header & Mobile View Switcher */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-data-mono-sm font-data-mono-sm text-outline">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>
          <span>{s.watchlist.length} Monitored Assets</span>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex md:hidden items-center bg-surface-container-high/60 p-0.5 rounded-lg border border-outline-variant text-xs">
          <button
            type="button"
            onClick={() => setMobileView("cards")}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
              mobileView === "cards"
                ? "bg-surface-container text-primary font-semibold shadow-sm"
                : "text-outline hover:text-on-surface"
            }`}
          >
            <RiLayoutGridLine className="text-[12px]" />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileView("table")}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
              mobileView === "table"
                ? "bg-surface-container text-primary font-semibold shadow-sm"
                : "text-outline hover:text-on-surface"
            }`}
          >
            <RiTableLine className="text-[12px]" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-lg">
        {/* Mobile Card Stream */}
        <div
          className={
            mobileView === "cards"
              ? "block md:hidden divide-y divide-outline-variant/30"
              : "hidden"
          }
        >
          {s.watchlist.map((saved, idx) => {
            const x = data.find(
              (d) =>
                d.token.address.toLowerCase() === saved.address.toLowerCase(),
            );
            const currentPrice = x?.metrics?.priceUsd;
            const change =
              saved.addedPrice && currentPrice
                ? ((currentPrice - saved.addedPrice) / saved.addedPrice) * 100
                : null;
            const priceChange24h = x?.metrics?.priceChange24h;
            const isNegative24h = priceChange24h != null && priceChange24h < 0;
            const isNegativeSinceAdded = change != null && change < 0;

            return (
              <div
                key={saved.address}
                className="p-4 hover:bg-surface-container-high/20 transition-colors flex flex-col gap-3"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-data-mono-sm text-outline font-medium w-5 text-center shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
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
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/token/${saved.address}`}
                          className="font-bold text-on-surface hover:text-primary-fixed transition-colors text-base truncate"
                        >
                          {saved.symbol}
                        </Link>
                        <span className="text-outline text-xs truncate max-w-[120px]">
                          {saved.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-data-mono-sm text-outline">
                        <span className="font-mono text-[11px]">
                          {shortenAddress(saved.address)}
                        </span>
                        <CopyButton value={saved.address} />
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">{getRiskBadge(x?.risk?.score)}</div>
                </div>

                {/* Price & Performance Row */}
                <div className="flex items-baseline justify-between pt-1 border-t border-outline-variant/20">
                  <div>
                    <span className="text-[10px] text-outline uppercase tracking-wider block font-semibold">
                      Spot Price
                    </span>
                    <span className="font-data-mono-lg font-bold text-lg text-primary">
                      {compactNumber(currentPrice, true)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-[10px] text-outline uppercase tracking-wider block font-semibold">
                        24H
                      </span>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold font-data-mono-sm ${
                          priceChange24h == null
                            ? "text-outline bg-surface-container"
                            : isNegative24h
                              ? "text-error bg-error/15"
                              : "text-tertiary-fixed bg-tertiary-fixed/15"
                        }`}
                      >
                        {priceChange24h == null
                          ? "—"
                          : `${priceChange24h > 0 ? "+" : ""}${priceChange24h.toFixed(1)}%`}
                      </span>
                    </div>
                    {change != null && (
                      <div className="text-right">
                        <span className="text-[10px] text-outline uppercase tracking-wider block font-semibold">
                          Since Added
                        </span>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold font-data-mono-sm ${
                            isNegativeSinceAdded
                              ? "text-error bg-error/15"
                              : "text-tertiary-fixed bg-tertiary-fixed/15"
                          }`}
                        >
                          {change > 0 ? "+" : ""}
                          {change.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Micro Stats Grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-surface-container-low/60 border border-outline-variant/30 text-data-mono-sm">
                  <div>
                    <span className="text-[10px] text-outline uppercase block">
                      24H Volume
                    </span>
                    <span className="text-xs font-semibold text-on-surface">
                      {compactNumber(x?.metrics?.volume24hUsd, true)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block">
                      Liquidity
                    </span>
                    <span className="text-xs font-semibold text-on-surface">
                      {compactNumber(x?.metrics?.liquidityUsd, true)}
                    </span>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-md text-xs font-medium text-outline hover:text-error hover:bg-surface-container-high transition-colors flex items-center gap-1.5 border border-outline-variant cursor-pointer"
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
                  >
                    <FiTrash2 className="text-xs" />
                    <span>Remove</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {x && <CompareButton item={x} compact />}
                    <Link
                      href={`/token/${saved.address}`}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface-container-high hover:bg-surface-container text-primary hover:text-primary-fixed border border-outline-variant transition-colors flex items-center gap-1"
                    >
                      <span>Analysis</span>
                      <RiArrowRightUpLine className="text-xs" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table & Mobile Table Mode */}
        <div className={mobileView === "table" ? "block" : "hidden md:block"}>
          {/* Touch Swipe Hint */}
          <div className="md:hidden flex items-center justify-between px-4 py-2 bg-surface-container-low/60 border-b border-outline-variant/40 text-[11px] text-outline font-data-mono-sm">
            <span className="flex items-center gap-1.5">
              <FiArrowRight className="text-[12px] animate-pulse text-primary-fixed" />
              <span>Swipe horizontally to view all metrics</span>
            </span>
            <span>{s.watchlist.length} assets</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[960px]">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/30 text-label-caps text-outline uppercase">
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-4 sticky left-0 bg-surface-container/95 backdrop-blur z-20 border-r border-outline-variant/40 shadow-[4px_0_10px_rgba(0,0,0,0.3)] min-w-[210px]">
                    Token
                  </th>
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
                      <td className="py-3 px-3 text-center text-data-mono-sm text-outline">
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      {/* Sticky Token Column */}
                      <td className="py-3 px-4 sticky left-0 bg-surface-container-lowest group-hover:bg-surface-container-high/30 transition-colors z-10 border-r border-outline-variant/40 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/token/${saved.address}`}
                            className="shrink-0 hover:opacity-80 transition-opacity"
                          >
                            <TokenAvatar
                              address={saved.address}
                              symbol={saved.symbol}
                              size={34}
                            />
                          </Link>
                          <div className="flex flex-col min-w-0">
                            <Link
                              href={`/token/${saved.address}`}
                              className="font-bold text-on-surface hover:text-primary-fixed transition-colors truncate text-[13px]"
                            >
                              {saved.symbol}
                            </Link>
                            <div className="flex items-center gap-1.5 text-data-mono-sm text-outline">
                              <span className="truncate max-w-[110px]">
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
