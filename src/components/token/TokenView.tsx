"use client";

import { useAppState } from "@/components/providers/AppState";
import { Button } from "@/components/shared/Button";
import { CompareButton } from "@/components/shared/CompareButton";
import { CopyButton } from "@/components/shared/CopyButton";
import { notify } from "@/components/shared/ToastViewport";
import { TokenAvatar } from "@/components/shared/TokenAvatar";
import { MetricTooltip } from "@/components/shared/Tooltip";
import { WatchButton } from "@/components/shared/WatchButton";
import {
    compactNumber,
    formatSupply,
    shortenAddress,
} from "@/lib/utils/format";
import type { TokenAnalytics, Transaction } from "@/types/token";
import { useEffect, useState } from "react";
import {
    FiActivity,
    FiExternalLink,
    FiFileText,
    FiLayers,
    FiRefreshCw,
    FiShare2,
    FiShield,
    FiUsers,
    FiX,
} from "react-icons/fi";
import { RiArrowRightUpLine } from "react-icons/ri";
import { PriceChart } from "./PriceChart";

const tips: Record<string, string> = {
  "Market Cap":
    "Current price multiplied by circulating supply when reliable supply data is available.",
  FDV: "Current price multiplied by total supply. It may differ from circulating market value.",
  Liquidity: "Approximate USD value available across tracked liquidity pools.",
  "24H Volume":
    "Tracked trading volume during the latest 24-hour provider window.",
  Holders: "Count reported by the chain indexer.",
  Risk: "A transparent score based only on available concentration, liquidity, metadata, and activity inputs.",
};

function getAgeText(
  isoDate: string | null | undefined,
  clientNow: number | null,
) {
  if (!isoDate) return "—";
  if (!clientNow) {
    const d = new Date(isoDate);
    return isNaN(d.getTime()) ? "—" : `${d.getMonth() + 1}/${d.getDate()}`;
  }
  const diffMs = Math.max(0, clientNow - new Date(isoDate).getTime());
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getRiskBadge(score: number | null | undefined) {
  const s = score ?? 80;
  if (s >= 95) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-data-mono-sm font-semibold bg-tertiary-container/20 text-tertiary-fixed border border-tertiary-fixed/30">
        {s} · Minimal
      </span>
    );
  }
  if (s >= 80) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-data-mono-sm font-semibold bg-tertiary-container/20 text-tertiary-fixed border border-tertiary-fixed/30">
        {s} · Low
      </span>
    );
  }
  if (s >= 65) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-data-mono-sm font-semibold bg-surface-container text-on-surface border border-outline">
        {s} · Moderate
      </span>
    );
  }
  if (s >= 50) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-data-mono-sm font-semibold bg-error-container/30 text-error border border-error/40">
        {s} · Elevated
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-data-mono-sm font-semibold bg-error-container text-on-error-container border border-error/50">
      {s} · Critical
    </span>
  );
}

function statusesFor(x: TokenAnalytics, clientNow: number | null) {
  const out: string[] = [];
  if (
    clientNow &&
    clientNow - new Date(x.token.firstSeenAt).getTime() < 7 * 86400000
  ) {
    out.push("New Token");
  }
  if ((x.metrics?.buys24h ?? 0) + (x.metrics?.sells24h ?? 0) > 100) {
    out.push("High Activity");
  }
  if ((x.holderSummary?.top10Percentage ?? 0) > 50) {
    out.push("Concentrated Holders");
  } else if ((x.metrics?.liquidityUsd ?? Infinity) < 10000) {
    out.push("Low Liquidity");
  }
  return out.slice(0, 3);
}

export function TokenView({ address }: { address: string }) {
  const [data, setData] = useState<TokenAnalytics | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [method, setMethod] = useState(false);
  const [txFilter, setTxFilter] = useState<Transaction["type"] | "ALL">("ALL");
  const [clientNow, setClientNow] = useState<number | null>(null);
  const state = useAppState();

  useEffect(() => {
    setClientNow(Date.now());
    const clock = setInterval(() => setClientNow(Date.now()), 10000);
    return () => clearInterval(clock);
  }, []);

  async function load(background = false) {
    if (background) setRefreshing(true);
    try {
      const response = await fetch(`/api/token/${address}`, {
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message);
      setData(body);
      setError("");
    } catch (reason) {
      if (!data) {
        setError(
          reason instanceof Error ? reason.message : "Unable to load token",
        );
      }
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(true), 60000);
    return () => clearInterval(timer);
  }, [address]);

  useEffect(() => {
    if (data) {
      state.addRecent(data.token);
    }
  }, [data?.token.address]);

  if (error) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 text-center max-w-lg mx-auto my-12 shadow-xl">
        <h2 className="text-xl font-headline font-bold text-on-surface">
          Unable to Analyze Token
        </h2>
        <p className="text-body-md text-on-surface-variant mt-2">{error}</p>
        <Button
          variant="primary"
          size="md"
          onClick={() => load()}
          icon={<FiRefreshCw className="text-sm" />}
          className="mt-6"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!data) return <TokenSkeleton />;

  const { token, metrics, risk } = data;
  const explorerBase = token.explorerUrl.split("/address/")[0];
  const tradeCount = (metrics?.buys24h ?? 0) + (metrics?.sells24h ?? 0);
  const ratio =
    metrics?.volume24hUsd != null && metrics.liquidityUsd
      ? metrics.volume24hUsd / metrics.liquidityUsd
      : null;
  const buySell =
    metrics?.buys24h != null && metrics.sells24h
      ? metrics.buys24h / metrics.sells24h
      : null;
  const filtered = data.transactions.filter(
    (x) => txFilter === "ALL" || x.type === txFilter,
  );
  const statuses = statusesFor(data, clientNow);
  const item = { token, metrics };

  const stats = [
    ["Market Cap", compactNumber(metrics?.marketCapUsd, true)],
    ["FDV", compactNumber(metrics?.fdvUsd, true)],
    ["Liquidity", compactNumber(metrics?.liquidityUsd, true)],
    ["24H Volume", compactNumber(metrics?.volume24hUsd, true)],
    ["Holders", data.holderSummary?.holderCount?.toLocaleString() ?? "—"],
    ["Risk", `${risk.score}/100`],
  ];

  async function share() {
    const summary = `${token.symbol} on Robinhood Chain\n\nPrice: ${compactNumber(
      metrics?.priceUsd,
      true,
    )}\n24H: ${
      metrics?.priceChange24h == null
        ? "Unavailable"
        : `${metrics.priceChange24h.toFixed(2)}%`
    }\nVolume: ${compactNumber(
      metrics?.volume24hUsd,
      true,
    )}\nLiquidity: ${compactNumber(metrics?.liquidityUsd, true)}\nHoodLens Risk: ${
      risk.score
    }/100\n\n${location.href}`;

    if (navigator.share) {
      await navigator.share({
        title: `${token.symbol} on HoodLens`,
        text: summary,
        url: location.href,
      });
    } else {
      await navigator.clipboard.writeText(summary);
      notify("Token summary copied to clipboard");
    }
  }

  const priceChange = metrics?.priceChange24h;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Hero Identity Block */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <TokenAvatar
            address={token.address}
            symbol={token.symbol}
            size={60}
          />
          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-label-caps text-outline uppercase font-semibold">
                {token.symbol} / {token.name}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-surface-container border border-outline-variant text-outline">
                Robinhood Chain · L2
              </span>
              {statuses.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary-fixed/10 border border-primary-fixed/30 text-primary-fixed"
                >
                  {badge}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight truncate">
              {token.name}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-data-mono-sm text-outline mt-1">
              <span className="font-mono">{shortenAddress(token.address)}</span>
              <CopyButton value={token.address} />
              <span>·</span>
              <span>first seen {getAgeText(token.firstSeenAt, clientNow)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex flex-col sm:items-end">
            <span className="text-label-caps text-outline uppercase font-semibold">
              Current Price
            </span>
            <div className="flex items-baseline gap-2.5 mt-0.5">
              <span className="text-2xl sm:text-3xl font-data-mono-lg font-bold text-on-surface">
                {compactNumber(metrics?.priceUsd, true)}
              </span>
              {priceChange != null && (
                <span
                  className={`text-body-sm font-data-mono-sm font-semibold px-2 py-0.5 rounded-md ${
                    priceChange >= 0
                      ? "bg-primary-fixed/15 text-primary-fixed border border-primary-fixed/30"
                      : "bg-error/15 text-error border border-error/30"
                  }`}
                >
                  {priceChange > 0 ? "+" : ""}
                  {priceChange.toFixed(2)}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-outline mt-1">
              <FiRefreshCw
                className={`text-[10px] ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Updated {getAgeText(data.lastUpdated, clientNow)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <WatchButton item={item} />
            <CompareButton item={item} />
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-body-sm font-medium border bg-surface-container-high border-outline-variant/60 text-on-surface hover:bg-surface-container-highest hover:border-outline rounded-lg transition-all cursor-pointer"
              onClick={share}
              title="Share Token Analytics"
            >
              <FiShare2 className="text-sm" />
              <span>Share</span>
            </button>
            <a
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-body-sm font-medium border bg-surface-container-high border-outline-variant/60 text-on-surface hover:bg-surface-container-highest hover:border-outline rounded-lg transition-all"
              href={token.explorerUrl}
              target="_blank"
              rel="noreferrer"
              title="View on Robinhood Chain Explorer"
            >
              <span>Explorer</span>
              <RiArrowRightUpLine className="text-base" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. Anchor Navigation Tabs */}
      <nav
        className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar p-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl"
        aria-label="Token sections"
      >
        {[
          { id: "overview", label: "Overview" },
          { id: "markets", label: "Markets & Pools" },
          { id: "holders", label: "Holders" },
          { id: "transactions", label: "Transactions" },
          { id: "risk", label: "Risk Analysis" },
          { id: "contract", label: "Contract" },
        ].map((tab) => (
          <a
            href={`#${tab.id}`}
            key={tab.id}
            className="px-3 py-1.5 rounded-lg text-body-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors whitespace-nowrap"
          >
            {tab.label}
          </a>
        ))}
      </nav>

      {/* 3. Key Metrics Pulse Grid (6 columns) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-label-caps text-outline uppercase font-semibold">
              <span>{label}</span>
              <MetricTooltip text={tips[label]} />
            </div>
            <strong className="text-lg font-data-mono-lg font-bold text-on-surface mt-1.5">
              {value}
            </strong>
          </div>
        ))}
      </section>

      {/* 4. Overview Grid: Chart + Market Health */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-24"
        id="overview"
      >
        <div className="lg:col-span-2">
          <PriceChart points={data.priceHistory} />
        </div>

        {/* Market Health Desk */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-2 text-primary-fixed">
              <FiActivity className="text-lg" />
              <p className="text-label-caps text-outline uppercase font-semibold">
                DERIVED TELEMETRY
              </p>
            </div>
            <h2 className="text-lg font-headline font-bold text-on-surface pb-3 border-b border-outline-variant/50">
              Market Health
            </h2>

            <div className="flex flex-col divide-y divide-outline-variant/30 mt-1">
              <div className="py-3 flex items-center justify-between">
                <span className="text-body-sm text-on-surface-variant flex items-center gap-1.5">
                  <span>Volume / Liquidity</span>
                  <MetricTooltip text="Tracked 24-hour volume divided by tracked liquidity pool depth." />
                </span>
                <span className="font-data-mono-sm font-semibold text-on-surface">
                  {ratio == null ? "—" : `${ratio.toFixed(2)}x`}
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-body-sm text-on-surface-variant flex items-center gap-1.5">
                  <span>Buy / Sell Ratio</span>
                  <MetricTooltip text="Ratio of provider-classified buy orders to sell orders over 24H." />
                </span>
                <span className="font-data-mono-sm font-semibold text-on-surface">
                  {buySell == null ? "—" : `${buySell.toFixed(2)}:1`}
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-body-sm text-on-surface-variant flex items-center gap-1.5">
                  <span>24H Transactions</span>
                  <MetricTooltip text="Sum of DEX buys and sells recorded in the current window." />
                </span>
                <span className="font-data-mono-sm font-semibold text-on-surface">
                  {tradeCount ? tradeCount.toLocaleString() : "—"}
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-body-sm text-on-surface-variant flex items-center gap-1.5">
                  <span>Tracked DEX Pools</span>
                  <MetricTooltip text="Liquidity pools discovered by Robinhood Chain indexers." />
                </span>
                <span className="font-data-mono-sm font-semibold text-on-surface">
                  {data.pools.length}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-surface-container/40 rounded-xl border border-outline-variant/50 text-xs text-outline leading-relaxed">
            Telemetry updates continuously from on-chain event subscriptions and
            DEX pair contracts.
          </div>
        </section>
      </div>

      {/* 5. Risk Analysis Section */}
      <section
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xl scroll-mt-24 flex flex-col md:flex-row gap-8"
        id="risk"
      >
        <div className="md:w-72 shrink-0 flex flex-col justify-between border-b md:border-b-0 md:border-r border-outline-variant/50 pb-6 md:pb-0 md:pr-8">
          <div>
            <div className="flex items-center gap-2 text-primary-fixed mb-1.5">
              <FiShield className="text-lg" />
              <p className="text-label-caps text-outline uppercase font-semibold">
                TRANSPARENT INDICATORS
              </p>
            </div>
            <h2 className="text-xl font-headline font-bold text-on-surface">
              Risk Analysis
            </h2>

            <div className="my-5 flex items-baseline gap-2">
              <span className="text-5xl font-data-mono-lg font-extrabold text-on-surface">
                {risk.score}
              </span>
              <span className="text-lg font-data-mono-sm text-outline">
                /100
              </span>
            </div>

            <div className="mb-4">{getRiskBadge(risk.score)}</div>
          </div>

          <button
            type="button"
            className="text-left text-xs text-primary-fixed hover:underline cursor-pointer flex items-center gap-1 mt-2"
            onClick={() => setMethod(true)}
          >
            <span>How HoodLens calculates risk</span>
            <RiArrowRightUpLine className="text-sm" />
          </button>
        </div>

        {/* Deductions Breakdown */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-label-caps text-outline uppercase font-semibold mb-3">
            Deductions Breakdown
          </p>
          {risk.deductions.length ? (
            <div className="flex flex-col gap-2.5">
              {risk.deductions.map((x) => (
                <div
                  key={x.label}
                  className="flex items-center justify-between gap-4 p-3.5 bg-surface-container/40 border border-outline-variant/40 rounded-xl"
                >
                  <div className="flex flex-col min-w-0">
                    <strong className="text-body-sm font-semibold text-on-surface">
                      {x.label}
                    </strong>
                    <span className="text-xs text-outline mt-0.5">
                      {x.detail}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-error-container/30 border border-error/40 text-error font-mono font-bold text-xs shrink-0">
                    −{x.points}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-surface-container/30 border border-dashed border-outline-variant/60 rounded-xl text-center">
              <strong className="text-body-md font-semibold text-on-surface block">
                No deductions from available inputs
              </strong>
              <p className="text-xs text-outline mt-1 max-w-md mx-auto">
                No negative parameters detected in current liquidity,
                concentration, or metadata checks. This is not an endorsement or
                safety guarantee.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 6. Detailed Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Holder Distribution Desk */}
        <section
          className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xl scroll-mt-24 flex flex-col"
          id="holders"
        >
          <div className="flex items-center gap-2 mb-1.5 text-primary-fixed">
            <FiUsers className="text-base" />
            <p className="text-label-caps text-outline uppercase font-semibold">
              DISTRIBUTION
            </p>
          </div>
          <h2 className="text-lg font-headline font-bold text-on-surface mb-3">
            Holder Concentration
          </h2>

          {data.holderSummary ? (
            <div className="mb-4 space-y-2">
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden flex">
                <div
                  className="bg-primary-fixed"
                  style={{
                    width: `${Math.min(
                      data.holderSummary.topHolderPercentage ?? 0,
                      100,
                    )}%`,
                  }}
                  title={`Top Holder: ${(
                    data.holderSummary.topHolderPercentage ?? 0
                  ).toFixed(2)}%`}
                />
                <div
                  className="bg-tertiary-fixed-dim"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(
                        (data.holderSummary.top10Percentage ?? 0) -
                          (data.holderSummary.topHolderPercentage ?? 0),
                        100,
                      ),
                    )}%`,
                  }}
                  title={`Top 2-10 Holders: ${(
                    (data.holderSummary.top10Percentage ?? 0) -
                    (data.holderSummary.topHolderPercentage ?? 0)
                  ).toFixed(2)}%`}
                />
              </div>
              <p className="text-xs text-outline flex items-center justify-between">
                <span>
                  Top holder:{" "}
                  <strong className="text-on-surface">
                    {data.holderSummary.topHolderPercentage?.toFixed(2) ?? "—"}%
                  </strong>
                </span>
                <span>
                  Top 10:{" "}
                  <strong className="text-on-surface">
                    {data.holderSummary.top10Percentage?.toFixed(2) ?? "—"}%
                  </strong>
                </span>
                <span>Burn addresses excluded</span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-outline mb-4">
              Holder distribution information is temporarily indexing.
            </p>
          )}

          <div className="overflow-x-auto custom-scrollbar flex-1 border border-outline-variant/50 rounded-xl">
            <table className="w-full text-left text-body-sm min-w-[380px]">
              <thead className="bg-surface-container/50 border-b border-outline-variant text-label-caps text-outline uppercase">
                <tr>
                  <th className="py-2.5 px-3">Address</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Supply %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 font-data-mono-sm">
                {data.holders.slice(0, 10).map((h) => (
                  <tr
                    key={h.address}
                    className="hover:bg-surface-container-high/30 transition-colors"
                  >
                    <td className="py-2 px-3 font-mono">
                      <a
                        href={`${explorerBase}/address/${h.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-primary-fixed transition-colors flex items-center gap-1"
                      >
                        <span>{h.label ?? shortenAddress(h.address)}</span>
                        <RiArrowRightUpLine className="text-xs text-outline" />
                      </a>
                    </td>
                    <td className="py-2 px-3 text-right text-on-surface-variant">
                      {formatSupply(h.balance, token.decimals)}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-xs text-outline">
                        {h.isContract ? "Contract" : "Wallet"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-on-surface">
                      {h.percentage.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Transactions Desk */}
        <section
          className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xl scroll-mt-24 flex flex-col"
          id="transactions"
        >
          <div className="flex items-center justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1 text-primary-fixed">
                <FiActivity className="text-base" />
                <p className="text-label-caps text-outline uppercase font-semibold">
                  INDEXED FEED
                </p>
              </div>
              <h2 className="text-lg font-headline font-bold text-on-surface">
                Transactions
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-outline-variant/60">
              {(["ALL", "BUY", "SELL", "TRANSFER"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={txFilter === filter}
                  onClick={() => setTxFilter(filter)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    txFilter === filter
                      ? "bg-[#bdf451] text-[#0d0f0c] font-bold shadow-sm"
                      : "text-outline hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar flex-1 border border-outline-variant/50 rounded-xl mt-2">
            {filtered.length ? (
              <table className="w-full text-left text-body-sm min-w-[420px]">
                <thead className="bg-surface-container/50 border-b border-outline-variant text-label-caps text-outline uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Wallet</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Age</th>
                    <th className="py-2.5 px-3 text-right">Tx</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 font-data-mono-sm">
                  {filtered.map((tx, i) => (
                    <tr
                      key={`${tx.hash}-${i}`}
                      className="hover:bg-surface-container-high/30 transition-colors"
                    >
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            tx.type === "BUY"
                              ? "bg-primary-fixed/20 text-primary-fixed border border-primary-fixed/30"
                              : tx.type === "SELL"
                                ? "bg-error/20 text-error border border-error/30"
                                : "bg-surface-container text-outline border border-outline-variant"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-outline">
                        {tx.wallet ? shortenAddress(tx.wallet) : "—"}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-on-surface">
                        {tx.tokenAmount ?? "—"}
                      </td>
                      <td className="py-2 px-3 text-right text-outline text-xs">
                        {getAgeText(tx.timestamp, clientNow)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <a
                          href={tx.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded text-outline hover:text-primary-fixed transition-colors inline-block"
                          title="View Transaction"
                        >
                          <FiExternalLink className="text-xs" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-outline text-xs">
                No {txFilter === "ALL" ? "recent" : txFilter.toLowerCase()}{" "}
                transactions indexed. Transfers are never inferred to be trades.
              </div>
            )}
          </div>
        </section>

        {/* Liquidity Sources Desk (Markets) */}
        <section
          className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xl scroll-mt-24 flex flex-col"
          id="markets"
        >
          <div className="flex items-center gap-2 mb-1 text-primary-fixed">
            <FiLayers className="text-base" />
            <p className="text-label-caps text-outline uppercase font-semibold">
              LIQUIDITY SOURCES
            </p>
          </div>
          <h2 className="text-lg font-headline font-bold text-on-surface mb-3">
            Markets & Pools
          </h2>

          <div className="overflow-x-auto custom-scrollbar flex-1 border border-outline-variant/50 rounded-xl">
            {data.pools.length ? (
              <table className="w-full text-left text-body-sm min-w-[380px]">
                <thead className="bg-surface-container/50 border-b border-outline-variant text-label-caps text-outline uppercase">
                  <tr>
                    <th className="py-2.5 px-3">DEX / Pair</th>
                    <th className="py-2.5 px-3 text-right">Liquidity</th>
                    <th className="py-2.5 px-3 text-right">24H Volume</th>
                    <th className="py-2.5 px-3 text-right">Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 font-data-mono-sm">
                  {[...data.pools]
                    .sort(
                      (a, b) => (b.liquidityUsd ?? 0) - (a.liquidityUsd ?? 0),
                    )
                    .map((p) => (
                      <tr
                        key={p.address}
                        className="hover:bg-surface-container-high/30 transition-colors"
                      >
                        <td className="py-2 px-3">
                          <a
                            href={`${explorerBase}/address/${p.address}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-primary-fixed transition-colors block"
                          >
                            <span className="font-bold text-on-surface block">
                              {p.name}
                            </span>
                            <span className="text-xs text-outline">
                              {p.dex}
                            </span>
                          </a>
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-on-surface">
                          {compactNumber(p.liquidityUsd, true)}
                        </td>
                        <td className="py-2 px-3 text-right text-on-surface-variant">
                          {compactNumber(p.volume24hUsd, true)}
                        </td>
                        <td className="py-2 px-3 text-right text-outline text-xs">
                          {getAgeText(p.createdAt, clientNow)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-outline text-xs">
                Liquidity pool records are temporarily indexing.
              </div>
            )}
          </div>
        </section>

        {/* Contract Details Desk */}
        <section
          className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xl scroll-mt-24 flex flex-col justify-between"
          id="contract"
        >
          <div>
            <div className="flex items-center gap-2 mb-1 text-primary-fixed">
              <FiFileText className="text-base" />
              <p className="text-label-caps text-outline uppercase font-semibold">
                VERIFIED SPECIFICATIONS
              </p>
            </div>
            <h2 className="text-lg font-headline font-bold text-on-surface mb-3">
              Contract Details
            </h2>

            <dl className="flex flex-col divide-y divide-outline-variant/30 font-data-mono-sm text-body-sm">
              <div className="py-2.5 flex items-center justify-between gap-2">
                <dt className="text-outline">Contract Address</dt>
                <dd className="flex items-center gap-1.5 font-mono text-on-surface">
                  <span>{token.address}</span>
                  <CopyButton value={token.address} />
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-outline">Token Decimals</dt>
                <dd className="font-bold text-on-surface">{token.decimals}</dd>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-outline">Total Supply</dt>
                <dd className="font-medium text-on-surface">
                  {formatSupply(token.totalSupply, token.decimals)}
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-outline">Network Chain ID</dt>
                <dd className="text-on-surface">
                  {token.chainId} (Robinhood L2)
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/50 flex items-center justify-between text-xs text-outline">
            <span>Verified ERC-20 bytecode</span>
            <a
              href={token.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary-fixed hover:underline flex items-center gap-1"
            >
              <span>View Source on Explorer</span>
              <RiArrowRightUpLine className="text-sm" />
            </a>
          </div>
        </section>
      </div>

      {/* Methodology Slideover / Modal */}
      {method && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMethod(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <div>
                <p className="text-label-caps text-outline uppercase font-semibold">
                  INTELLIGENCE METHODOLOGY
                </p>
                <h3 className="text-lg font-headline font-bold text-on-surface">
                  How HoodLens Calculates Risk
                </h3>
              </div>
              <button
                type="button"
                className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                onClick={() => setMethod(false)}
                aria-label="Close dialog"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="text-body-md text-on-surface-variant space-y-3 leading-relaxed">
              <p>
                The HoodLens risk score begins at <strong>100</strong> and only
                deducts points based on verified, objective data retrieved from
                chain indexers and liquidity pools.
              </p>
              <p>Current deduction factors include:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-outline font-mono">
                <li>Excessive top holder or top 10 concentration</li>
                <li>Very low tracked DEX liquidity depth (&lt; $10k)</li>
                <li>Incomplete or non-standard ERC-20 metadata</li>
                <li>Extreme provider-classified trading imbalances</li>
              </ul>
              <p className="text-xs text-outline pt-2 border-t border-outline-variant/50">
                Missing inputs do not incur artificial deductions, and high
                scores do not guarantee market safety. HoodLens does not offer
                financial advice or safety certifications.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TokenSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 h-44" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-20 bg-surface-container-lowest border border-outline-variant/60 rounded-xl"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 bg-surface-container-lowest border border-outline-variant rounded-2xl" />
        <div className="h-72 bg-surface-container-lowest border border-outline-variant rounded-2xl" />
      </div>
    </div>
  );
}
