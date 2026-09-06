"use client";

import { useAppState } from "@/components/providers/AppState";
import { Button } from "@/components/shared/Button";
import { CopyButton } from "@/components/shared/CopyButton";
import { notify } from "@/components/shared/ToastViewport";
import { TokenAvatar } from "@/components/shared/TokenAvatar";
import { compactNumber, shortenAddress } from "@/lib/utils/format";
import type { TokenAnalytics } from "@/types/token";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowRight, FiPlus, FiShare2, FiTrash2, FiX } from "react-icons/fi";
import { RiArrowLeftRightLine, RiArrowRightUpLine } from "react-icons/ri";

function ratio(a: number | null | undefined, b: number | null | undefined) {
  return a != null && b && b > 0 ? `${(a / b).toFixed(2)}x` : "—";
}

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

type MetricRow = {
  label: string;
  category:
    | "Market & Valuation"
    | "Liquidity & Volume"
    | "Holder Concentration"
    | "Security & Risk";
  format: (x: TokenAnalytics) => React.ReactNode;
};

const comparisonMetrics: MetricRow[] = [
  // Market & Valuation
  {
    label: "Price (USD)",
    category: "Market & Valuation",
    format: (x) => (
      <span className="font-bold text-on-surface">
        {compactNumber(x.metrics?.priceUsd, true)}
      </span>
    ),
  },
  {
    label: "24H Price Change",
    category: "Market & Valuation",
    format: (x) => {
      const c = x.metrics?.priceChange24h;
      if (c == null) return <span className="text-outline">—</span>;
      return (
        <span className={c >= 0 ? "text-primary-fixed" : "text-error"}>
          {c > 0 ? "+" : ""}
          {c.toFixed(2)}%
        </span>
      );
    },
  },
  {
    label: "Circulating Market Cap",
    category: "Market & Valuation",
    format: (x) => compactNumber(x.metrics?.marketCapUsd, true),
  },
  {
    label: "Fully Diluted Val (FDV)",
    category: "Market & Valuation",
    format: (x) => compactNumber(x.metrics?.fdvUsd, true),
  },

  // Liquidity & Volume
  {
    label: "Tracked Liquidity",
    category: "Liquidity & Volume",
    format: (x) => compactNumber(x.metrics?.liquidityUsd, true),
  },
  {
    label: "24H Volume",
    category: "Liquidity & Volume",
    format: (x) => compactNumber(x.metrics?.volume24hUsd, true),
  },
  {
    label: "Volume / Liquidity",
    category: "Liquidity & Volume",
    format: (x) => ratio(x.metrics?.volume24hUsd, x.metrics?.liquidityUsd),
  },
  {
    label: "24H Transactions",
    category: "Liquidity & Volume",
    format: (x) => {
      const buys = x.metrics?.buys24h ?? 0;
      const sells = x.metrics?.sells24h ?? 0;
      const total = buys + sells;
      return total ? (
        <span>
          {total.toLocaleString()}{" "}
          <span className="text-outline text-xs">
            ({buys}B / {sells}S)
          </span>
        </span>
      ) : (
        "—"
      );
    },
  },

  // Holder Concentration
  {
    label: "Total Holder Count",
    category: "Holder Concentration",
    format: (x) =>
      x.holderSummary?.holderCount
        ? x.holderSummary.holderCount.toLocaleString()
        : "—",
  },
  {
    label: "Top Holder Share",
    category: "Holder Concentration",
    format: (x) =>
      x.holderSummary?.topHolderPercentage != null
        ? `${x.holderSummary.topHolderPercentage.toFixed(2)}%`
        : "—",
  },
  {
    label: "Top 10 Holders Share",
    category: "Holder Concentration",
    format: (x) =>
      x.holderSummary?.top10Percentage != null
        ? `${x.holderSummary.top10Percentage.toFixed(2)}%`
        : "—",
  },

  // Security & Risk
  {
    label: "HoodLens Risk Score",
    category: "Security & Risk",
    format: (x) => getRiskBadge(x.risk?.score),
  },
  {
    label: "Risk Deductions",
    category: "Security & Risk",
    format: (x) =>
      x.risk?.deductions?.length ? (
        <span className="text-error font-medium">
          {x.risk.deductions.length} deduction(s)
        </span>
      ) : (
        <span className="text-primary-fixed font-medium">Clean (0)</span>
      ),
  },
];

export function CompareClient() {
  const s = useAppState();
  const params = useSearchParams();
  const [data, setData] = useState<TokenAnalytics[]>([]);
  const [loading, setLoading] = useState(false);

  const query = params.get("tokens");
  const addresses = (
    query ? query.split(",") : s.compare.map((x) => x.address)
  ).slice(0, 4);
  const addressKey = addresses.join(",");

  useEffect(() => {
    if (!s.ready || !addresses.length) {
      if (s.ready && !addresses.length) setData([]);
      return;
    }
    setLoading(true);
    Promise.allSettled(
      addresses.map((x) =>
        fetch(`/api/token/${x}`).then((r) => (r.ok ? r.json() : null)),
      ),
    )
      .then((r) =>
        setData(
          r.flatMap((x) =>
            x.status === "fulfilled" && x.value ? [x.value] : [],
          ),
        ),
      )
      .finally(() => setLoading(false));
  }, [s.ready, addressKey]);

  async function shareComparison() {
    const addressList = data.map((x) => x.token.address).join(",");
    const url = `${window.location.origin}/compare?tokens=${addressList}`;
    const text = `Compare ${data.map((x) => x.token.symbol).join(" vs ")} on HoodLens — Robinhood Chain Intelligence\n${url}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({
        title: "HoodLens Token Comparison Matrix",
        text,
        url,
      });
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      notify("Comparison link copied to clipboard");
    }
  }

  if (!s.ready || loading) {
    return (
      <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 space-y-4 animate-pulse">
        <div className="h-16 bg-surface-container-high/40 rounded-xl w-full" />
        <div className="h-80 bg-surface-container-high/20 rounded-xl w-full" />
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div className="w-full flex flex-col gap-6">
        {/* Status Header Banner */}
        <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/60 flex items-center justify-center shrink-0 text-primary-fixed">
              <RiArrowLeftRightLine className="text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-label-caps text-outline uppercase font-semibold">
                  BENCHMARK STUDIO
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-surface-container border border-outline-variant text-outline">
                  {data.length} / 4 Selected
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-headline font-bold text-on-surface">
                {data.length === 1
                  ? "1 Token Selected — Add 1 More to Activate Matrix"
                  : "Multi-Asset Benchmark Studio"}
              </h2>
              <p className="text-body-sm sm:text-body-md text-on-surface-variant mt-1 max-w-2xl">
                Benchmark market valuation, DEX liquidity pool depth, holder
                concentration, and transparent risk scores side-by-side across 2
                to 4 tokens.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            href="/discover"
            icon={<FiArrowRight className="text-base" />}
            iconPosition="right"
            className="shrink-0"
          >
            Browse Discover Desk
          </Button>
        </div>

        {/* 4 Comparison Slots Studio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          {/* Slot 1 */}
          {data[0] ? (
            <div className="bg-surface-container-lowest border border-primary-fixed/40 rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[260px]">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <TokenAvatar
                      address={data[0].token.address}
                      symbol={data[0].token.symbol}
                      size={44}
                    />
                    <div className="min-w-0">
                      <span className="text-label-caps text-primary-fixed uppercase font-semibold">
                        Slot 01 · Active
                      </span>
                      <p className="font-headline font-bold text-lg text-on-surface truncate">
                        {data[0].token.symbol}
                      </p>
                      <p className="text-xs text-outline truncate">
                        {data[0].token.name}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      s.removeCompare(data[0].token.address);
                      setData((v) =>
                        v.filter(
                          (y) => y.token.address !== data[0].token.address,
                        ),
                      );
                    }}
                    className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-surface-container-high transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <FiX className="text-base" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/50">
                  <div>
                    <span className="text-[11px] text-outline block font-medium">
                      Spot Price
                    </span>
                    <span className="font-data-mono-sm font-bold text-on-surface">
                      {compactNumber(data[0].metrics?.priceUsd, true)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-outline block font-medium">
                      Risk Score
                    </span>
                    <div className="mt-0.5">
                      {getRiskBadge(data[0].risk?.score)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-outline-variant/40 flex items-center justify-between">
                <span className="text-xs text-outline font-mono">
                  {shortenAddress(data[0].token.address)}
                </span>
                <Button
                  variant="secondary"
                  size="xs"
                  href={`/token/${data[0].token.address}`}
                  icon={<RiArrowRightUpLine className="text-xs" />}
                  iconPosition="right"
                >
                  View Token
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border-2 border-dashed border-outline-variant hover:border-primary-fixed/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors group min-h-[260px] shadow-sm">
              <div className="w-12 h-12 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-outline group-hover:text-primary-fixed group-hover:border-primary-fixed/50 transition-colors mb-3">
                <FiPlus className="text-xl" />
              </div>
              <span className="text-label-caps text-outline uppercase font-semibold">
                Slot 01 · Primary
              </span>
              <h3 className="text-base font-headline font-bold text-on-surface mt-1">
                Select First Asset
              </h3>
              <p className="text-xs text-on-surface-variant mt-1.5 max-w-[200px]">
                Choose an asset to establish the benchmark baseline.
              </p>
              <Button
                variant="outline"
                size="sm"
                href="/discover"
                icon={<FiPlus className="text-xs" />}
                className="mt-4"
              >
                Pick from Discover
              </Button>
            </div>
          )}

          {/* Slot 2 */}
          <div
            className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all min-h-[260px] ${
              data.length === 1
                ? "bg-surface-container-low border-2 border-primary-fixed/70 shadow-lg"
                : "bg-surface-container-lowest border-2 border-dashed border-outline-variant hover:border-primary-fixed/60 shadow-sm"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors mb-3 ${
                data.length === 1
                  ? "bg-[#bdf451] text-[#0d0f0c] shadow-md"
                  : "bg-surface-container border border-outline-variant text-outline group-hover:text-primary-fixed"
              }`}
            >
              <FiPlus className="text-xl" />
            </div>
            <span
              className={`text-label-caps uppercase font-semibold ${
                data.length === 1 ? "text-primary-fixed" : "text-outline"
              }`}
            >
              {data.length === 1
                ? "Required to Activate"
                : "Slot 02 · Counterpart"}
            </span>
            <h3 className="text-base font-headline font-bold text-on-surface mt-1">
              {data.length === 1
                ? "Select Counterpart Asset"
                : "Select Second Asset"}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1.5 max-w-[210px]">
              {data.length === 1
                ? "Add a second token to immediately unlock side-by-side matrix comparison."
                : "Pick a second asset to benchmark."}
            </p>
            <Button
              variant={data.length === 1 ? "primary" : "outline"}
              size="sm"
              href="/discover"
              icon={<FiPlus className="text-xs" />}
              className="mt-4"
            >
              {data.length === 1
                ? "Add Counterpart Token"
                : "Pick from Discover"}
            </Button>
          </div>

          {/* Slot 3 */}
          <div className="bg-surface-container-lowest border border-dashed border-outline-variant/80 hover:border-outline rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors group min-h-[260px] shadow-sm">
            <div className="w-12 h-12 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-outline group-hover:text-primary-fixed transition-colors mb-3">
              <FiPlus className="text-xl" />
            </div>
            <span className="text-label-caps text-outline uppercase font-semibold">
              Slot 03 · Optional
            </span>
            <h3 className="text-base font-headline font-bold text-on-surface mt-1">
              Third Asset Slot
            </h3>
            <p className="text-xs text-on-surface-variant mt-1.5 max-w-[200px]">
              Expand benchmark comparison up to 4 concurrent assets.
            </p>
            <Button
              variant="ghost"
              size="xs"
              href="/discover"
              icon={<FiPlus className="text-xs" />}
              className="mt-4"
            >
              Add Token
            </Button>
          </div>

          {/* Slot 4 */}
          <div className="bg-surface-container-lowest border border-dashed border-outline-variant/80 hover:border-outline rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors group min-h-[260px] shadow-sm">
            <div className="w-12 h-12 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-outline group-hover:text-primary-fixed transition-colors mb-3">
              <FiPlus className="text-xl" />
            </div>
            <span className="text-label-caps text-outline uppercase font-semibold">
              Slot 04 · Optional
            </span>
            <h3 className="text-base font-headline font-bold text-on-surface mt-1">
              Fourth Asset Slot
            </h3>
            <p className="text-xs text-on-surface-variant mt-1.5 max-w-[200px]">
              Multi-asset portfolio benchmark across liquidity & risk vectors.
            </p>
            <Button
              variant="ghost"
              size="xs"
              href="/discover"
              icon={<FiPlus className="text-xs" />}
              className="mt-4"
            >
              Add Token
            </Button>
          </div>
        </div>

        {/* Quick select from recently viewed if available */}
        {s.recent.length > 0 && (
          <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <span className="text-label-caps text-outline uppercase font-semibold">
                Quick Add from Recently Viewed:
              </span>
              <span className="text-xs text-on-surface-variant hidden md:inline">
                Click to queue directly into benchmark
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {s.recent.slice(0, 6).map((r) => {
                const isAlreadyAdded = data.some(
                  (d) =>
                    d.token.address.toLowerCase() === r.address.toLowerCase(),
                );
                return (
                  <Button
                    key={r.address}
                    variant={isAlreadyAdded ? "secondary" : "outline"}
                    size="xs"
                    disabled={isAlreadyAdded}
                    onClick={() =>
                      s.toggleCompare({
                        token: {
                          address: r.address,
                          name: r.name,
                          symbol: r.symbol,
                          decimals: 18,
                          totalSupply: "0",
                          chainId: 88899,
                          firstSeenAt: r.lastViewedAt,
                          explorerUrl: "",
                        },
                        metrics: null,
                      })
                    }
                    icon={
                      !isAlreadyAdded ? (
                        <FiPlus className="text-[11px]" />
                      ) : undefined
                    }
                  >
                    {r.symbol} {isAlreadyAdded ? "✓" : ""}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Benchmark Dimensions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          <div className="p-6 bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
            <span className="text-label-caps text-outline uppercase font-semibold">
              DIMENSION 01
            </span>
            <h3 className="text-base font-headline font-bold text-on-surface mt-1.5">
              Market Depth & Valuation
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">
              Compares live spot prices, 24-hour delta shifts, circulating
              market caps, and fully diluted valuations (FDV).
            </p>
          </div>

          <div className="p-6 bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
            <span className="text-label-caps text-outline uppercase font-semibold">
              DIMENSION 02
            </span>
            <h3 className="text-base font-headline font-bold text-on-surface mt-1.5">
              Liquidity & Flow Health
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">
              Analyzes DEX pool liquidity depth, trading volume turnover
              (Vol/Liq ratio), and 24-hour buy vs. sell ratios.
            </p>
          </div>

          <div className="p-6 bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
            <span className="text-label-caps text-outline uppercase font-semibold">
              DIMENSION 03
            </span>
            <h3 className="text-base font-headline font-bold text-on-surface mt-1.5">
              Security & Distribution
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">
              Evaluates top holder and top 10 concentration percentages
              alongside HoodLens transparent risk deductions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Group metrics by category
  const categories = Array.from(
    new Set(comparisonMetrics.map((m) => m.category)),
  );

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Active Matrix Controls Toolbar */}
      <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant text-data-mono-sm text-on-surface">
            Active Benchmark:{" "}
            <strong className="text-primary-fixed font-bold">
              {data.length} / 4 Tokens
            </strong>
          </div>
          <span className="hidden lg:inline text-body-sm text-on-surface-variant">
            Full-width matrix across valuation, DEX liquidity, holder
            dispersion, and security parameters.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {data.length < 4 && (
            <Button
              variant="outline"
              size="sm"
              href="/discover"
              icon={<FiPlus className="text-sm" />}
            >
              Add Token ({4 - data.length} slots free)
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={shareComparison}
            icon={<FiShare2 className="text-sm" />}
          >
            Share Matrix
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              s.clearCompare();
              setData([]);
            }}
            icon={<FiTrash2 className="text-sm" />}
          >
            Clear Matrix
          </Button>
        </div>
      </div>

      {/* Full-width Widescreen Table */}
      <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-2xl">
        {/* Mobile Swipe Hint */}
        <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-surface-container-low/60 border-b border-outline-variant/40 text-[11px] text-outline font-data-mono-sm">
          <span className="flex items-center gap-1.5">
            <FiArrowRight className="text-[12px] animate-pulse text-primary-fixed" />
            <span>Swipe horizontally to compare {data.length} tokens</span>
          </span>
          <span className="text-primary-fixed font-medium">
            Parameters pinned
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full table-fixed text-left border-collapse min-w-[750px] sm:min-w-[800px]">
            <colgroup>
              <col className="w-56 sm:w-72 lg:w-80" />
              {data.map((x) => (
                <col key={x.token.address} />
              ))}
              {data.length < 4 && <col className="w-44 lg:w-52" />}
            </colgroup>
            {/* Table Header: Token Cards */}
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container/30">
                <th className="py-5 px-4 sm:px-6 text-label-caps text-outline uppercase font-semibold align-top sticky left-0 bg-surface-container/95 backdrop-blur z-20 border-r border-outline-variant/40 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
                  Metric / Parameter
                </th>
                {data.map((x) => (
                  <th
                    key={x.token.address}
                    className="py-5 px-6 align-top border-l border-outline-variant/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <Link
                          href={`/token/${x.token.address}`}
                          className="shrink-0 hover:opacity-80 transition-opacity"
                        >
                          <TokenAvatar
                            address={x.token.address}
                            symbol={x.token.symbol}
                            size={42}
                          />
                        </Link>
                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/token/${x.token.address}`}
                            className="font-headline font-bold text-base text-on-surface hover:text-primary-fixed transition-colors truncate flex items-center gap-1"
                          >
                            <span>{x.token.symbol}</span>
                            <RiArrowRightUpLine className="text-sm text-outline" />
                          </Link>
                          <span className="text-body-sm text-outline truncate max-w-[140px]">
                            {x.token.name}
                          </span>
                          <div className="flex items-center gap-1.5 text-data-mono-sm text-outline mt-0.5">
                            <span>{shortenAddress(x.token.address)}</span>
                            <CopyButton value={x.token.address} />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          s.removeCompare(x.token.address);
                          setData((v) =>
                            v.filter(
                              (y) => y.token.address !== x.token.address,
                            ),
                          );
                        }}
                        className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-surface-container-high transition-colors cursor-pointer shrink-0"
                        title={`Remove ${x.token.symbol}`}
                        aria-label={`Remove ${x.token.symbol}`}
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>

                    {/* In-Header Quick Snapshot */}
                    <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-data-mono-sm">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-on-surface">
                          {compactNumber(x.metrics?.priceUsd, true)}
                        </span>
                        {x.metrics?.priceChange24h != null && (
                          <span
                            className={`text-xs font-semibold ${
                              x.metrics.priceChange24h >= 0
                                ? "text-primary-fixed"
                                : "text-error"
                            }`}
                          >
                            {x.metrics.priceChange24h > 0 ? "+" : ""}
                            {x.metrics.priceChange24h.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div>{getRiskBadge(x.risk?.score)}</div>
                    </div>
                  </th>
                ))}
                {data.length < 4 && (
                  <th className="py-5 px-6 align-middle border-l border-dashed border-outline-variant/40 bg-surface-container/10">
                    <div className="flex flex-col items-center justify-center p-3 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        href="/discover"
                        icon={<FiPlus className="text-sm" />}
                        className="w-full"
                      >
                        Add Token
                      </Button>
                      <span className="text-[11px] text-outline mt-2">
                        {4 - data.length} slot(s) available
                      </span>
                    </div>
                  </th>
                )}
              </tr>
            </thead>

            {/* Matrix Body: Grouped Metrics */}
            <tbody className="divide-y divide-outline-variant/30 font-data-mono-sm">
              {categories.map((cat) => (
                <MetricGroup
                  key={cat}
                  category={cat}
                  metrics={comparisonMetrics.filter((m) => m.category === cat)}
                  data={data}
                  hasAddSlot={data.length < 4}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-outline px-1 leading-relaxed">
        * Comparison highlights are mathematically neutral. Missing indexer or
        provider data is indicated as &quot;—&quot; and is never treated as
        zero.
      </p>
    </div>
  );
}

function MetricGroup({
  category,
  metrics,
  data,
  hasAddSlot,
}: {
  category: string;
  metrics: MetricRow[];
  data: TokenAnalytics[];
  hasAddSlot: boolean;
}) {
  return (
    <>
      <tr className="bg-surface-container-low/70 border-y border-outline-variant/40">
        <td
          colSpan={data.length + 1 + (hasAddSlot ? 1 : 0)}
          className="py-3 px-4 sm:px-6 text-label-caps uppercase text-primary-fixed font-bold tracking-wider"
        >
          {category}
        </td>
      </tr>
      {metrics.map((row) => (
        <tr
          key={row.label}
          className="hover:bg-surface-container-high/30 transition-colors border-b border-outline-variant/20 group"
        >
          <td className="py-4 px-4 sm:px-6 text-body-sm font-sans font-medium text-on-surface-variant sticky left-0 bg-surface-container-lowest group-hover:bg-surface-container-high/20 transition-colors z-10 border-r border-outline-variant/40 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
            {row.label}
          </td>
          {data.map((x) => (
            <td
              key={x.token.address}
              className="py-4 px-4 sm:px-6 text-on-surface font-mono text-sm sm:text-base border-l border-outline-variant/20"
            >
              {row.format(x)}
            </td>
          ))}
          {hasAddSlot && (
            <td className="py-4 px-4 sm:px-6 border-l border-dashed border-outline-variant/30 text-outline text-center text-sm">
              —
            </td>
          )}
        </tr>
      ))}
    </>
  );
}
