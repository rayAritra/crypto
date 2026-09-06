"use client";

import { useAppState } from "@/components/providers/AppState";
import { CopyButton } from "@/components/shared/CopyButton";
import { TokenAvatar } from "@/components/shared/TokenAvatar";
import { compactNumber, shortenAddress } from "@/lib/utils/format";
import type { RankedToken } from "@/types/token";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiSearch } from "react-icons/fi";
import {
    RiArrowRightUpLine,
    RiExchangeLine,
    RiLayoutGridLine,
    RiStarFill,
    RiStarLine,
    RiTableLine,
} from "react-icons/ri";

type ViewKey =
  | "trending"
  | "new"
  | "volume"
  | "liquidity"
  | "activity"
  | "lower"
  | "higher";

type SortField =
  | "rank"
  | "price"
  | "change"
  | "marketCap"
  | "volume"
  | "liquidity"
  | "ratio"
  | "risk"
  | "age";

const viewTabs: { key: ViewKey; label: string }[] = [
  { key: "trending", label: "Trending" },
  { key: "new", label: "New & Active" },
  { key: "volume", label: "High Volume" },
  { key: "liquidity", label: "Liquidity Movers" },
  { key: "activity", label: "Unusual Activity" },
  { key: "lower", label: "Low Risk (80+)" },
  { key: "higher", label: "High Risk (<60)" },
];

function getAgeText(isoDate: string, clientNow: number | null) {
  if (!isoDate) return "—";
  if (!clientNow) {
    const d = new Date(isoDate);
    return isNaN(d.getTime()) ? "—" : `${d.getMonth() + 1}/${d.getDate()}`;
  }
  const diffMs = Math.max(0, clientNow - new Date(isoDate).getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) return `${Math.max(1, hours)}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function volLiqRatio(
  vol: number | null | undefined,
  liq: number | null | undefined,
) {
  if (!vol || !liq || liq <= 0) return "—";
  const r = vol / liq;
  return `${r.toFixed(2)}x`;
}

function getRiskBadge(score: number | null | undefined) {
  const s = score ?? 80;
  if (s >= 95) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-data-mono-sm font-data-mono-sm font-semibold bg-tertiary-container/20 text-tertiary-fixed border border-tertiary-fixed/30">
        {s} · Minimal
      </span>
    );
  }
  if (s >= 80) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-data-mono-sm font-data-mono-sm font-semibold bg-tertiary-container/20 text-tertiary-fixed border border-tertiary-fixed/30">
        {s} · Low
      </span>
    );
  }
  if (s >= 65) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-data-mono-sm font-data-mono-sm font-semibold bg-surface-container text-on-surface border border-outline">
        {s} · Moderate
      </span>
    );
  }
  if (s >= 50) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-data-mono-sm font-data-mono-sm font-semibold bg-error-container/30 text-error border border-error/40">
        {s} · Elevated
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-data-mono-sm font-data-mono-sm font-semibold bg-error-container text-on-error-container border border-error/50">
      {s} · Critical
    </span>
  );
}

export function DiscoverClient({
  trending: initialTrending,
  newTokens: initialNew,
  volume: initialVolume,
}: {
  trending: RankedToken[];
  newTokens: RankedToken[];
  volume: RankedToken[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appState = useAppState();

  const rawView = searchParams.get("view");
  const currentView: ViewKey =
    rawView && viewTabs.some((t) => t.key === rawView)
      ? (rawView as ViewKey)
      : "trending";

  const [dataByView, setDataByView] = useState<{
    trending: RankedToken[];
    new: RankedToken[];
    volume: RankedToken[];
  }>({
    trending: initialTrending,
    new: initialNew,
    volume: initialVolume,
  });

  const [minLiquidity, setMinLiquidity] = useState<number>(
    Number(searchParams.get("minLiq") ?? 0),
  );
  const [minVolume, setMinVolume] = useState<number>(
    Number(searchParams.get("minVol") ?? 0),
  );
  const [filterQuery, setFilterQuery] = useState("");
  const [timeframe, setTimeframe] = useState<"5M" | "1H" | "24H" | "7D">("24H");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [page, setPage] = useState(1);
  const [mobileView, setMobileView] = useState<"cards" | "table">("cards");
  const [clientTime, setClientTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  // Set client time once mounted in effect to keep render pure
  useEffect(() => {
    setClientTime(Date.now());
  }, []);

  // Sync view selection to URL
  const handleViewChange = useCallback(
    async (viewKey: ViewKey) => {
      setPage(1);
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", viewKey);
      router.replace(`/discover?${params.toString()}`);

      // Fetch dynamic updates if tab data is empty
      const baseKey =
        viewKey === "new"
          ? "new"
          : viewKey === "volume"
            ? "volume"
            : "trending";
      if (dataByView[baseKey].length === 0) {
        setLoading(true);
        try {
          const endpoint =
            baseKey === "new"
              ? "/api/new"
              : baseKey === "volume"
                ? "/api/volume"
                : "/api/trending";
          const res = await fetch(endpoint);
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json.data)) {
              setDataByView((prev) => ({ ...prev, [baseKey]: json.data }));
            }
          }
        } catch {
          // Keep current state
        } finally {
          setLoading(false);
        }
      }
    },
    [dataByView, router, searchParams],
  );

  // Compute base list for active view
  const activeBase = useMemo(() => {
    if (currentView === "new") return dataByView.new;
    if (currentView === "volume") return dataByView.volume;
    return dataByView.trending;
  }, [currentView, dataByView]);

  // Telemetry totals across all unique loaded tokens
  const telemetry = useMemo(() => {
    const all = [
      ...dataByView.trending,
      ...dataByView.new,
      ...dataByView.volume,
    ];
    const unique = [...new Map(all.map((x) => [x.token.address, x])).values()];
    const totalVol = unique.reduce(
      (n, x) => n + (x.metrics?.volume24hUsd ?? 0),
      0,
    );
    return {
      totalVolumeFormatted: compactNumber(totalVol, true),
      poolsCount: unique.length,
    };
  }, [dataByView]);

  // Apply filters (view predicates, liquidity, volume, search text)
  const filtered = useMemo(() => {
    let list = activeBase;

    // View-specific filters
    if (currentView === "liquidity") {
      list = [...list].sort(
        (a, b) =>
          (b.metrics?.liquidityUsd ?? 0) - (a.metrics?.liquidityUsd ?? 0),
      );
    } else if (currentView === "activity") {
      list = list.filter(
        (x) => (x.metrics?.buys24h ?? 0) + (x.metrics?.sells24h ?? 0) >= 20,
      );
    } else if (currentView === "lower") {
      list = list.filter((x) => (x.risk?.score ?? 0) >= 80);
    } else if (currentView === "higher") {
      list = list.filter((x) => (x.risk?.score ?? 100) < 60);
    }

    // Min Liquidity
    if (minLiquidity > 0) {
      list = list.filter((x) => (x.metrics?.liquidityUsd ?? 0) >= minLiquidity);
    }

    // Min Volume
    if (minVolume > 0) {
      list = list.filter((x) => (x.metrics?.volume24hUsd ?? 0) >= minVolume);
    }

    // Search filter
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      list = list.filter(
        (x) =>
          x.token.symbol.toLowerCase().includes(q) ||
          x.token.name.toLowerCase().includes(q) ||
          x.token.address.toLowerCase().includes(q),
      );
    }

    return list;
  }, [activeBase, currentView, minLiquidity, minVolume, filterQuery]);

  // Sorting
  const sorted = useMemo(() => {
    if (sortField === "rank") return filtered;
    return [...filtered].sort((a, b) => {
      let vA = 0;
      let vB = 0;
      switch (sortField) {
        case "price":
          vA = a.metrics?.priceUsd ?? 0;
          vB = b.metrics?.priceUsd ?? 0;
          break;
        case "change":
          vA = a.metrics?.priceChange24h ?? 0;
          vB = b.metrics?.priceChange24h ?? 0;
          break;
        case "marketCap":
          vA = a.metrics?.marketCapUsd ?? 0;
          vB = b.metrics?.marketCapUsd ?? 0;
          break;
        case "volume":
          vA = a.metrics?.volume24hUsd ?? 0;
          vB = b.metrics?.volume24hUsd ?? 0;
          break;
        case "liquidity":
          vA = a.metrics?.liquidityUsd ?? 0;
          vB = b.metrics?.liquidityUsd ?? 0;
          break;
        case "ratio":
          vA =
            (a.metrics?.volume24hUsd ?? 0) /
            Math.max(1, a.metrics?.liquidityUsd ?? 1);
          vB =
            (b.metrics?.volume24hUsd ?? 0) /
            Math.max(1, b.metrics?.liquidityUsd ?? 1);
          break;
        case "risk":
          vA = a.risk?.score ?? 0;
          vB = b.risk?.score ?? 0;
          break;
        case "age":
          vA = new Date(a.token.firstSeenAt).getTime();
          vB = new Date(b.token.firstSeenAt).getTime();
          break;
      }
      return sortDir === 1 ? vA - vB : vB - vA;
    });
  }, [filtered, sortField, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedTokens = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortField(field);
      setSortDir(-1);
    }
  }

  return (
    <main className="flex-1 w-full max-w-[1580px] mx-auto px-margin-screen site-container pt-8 sm:pt-10 pb-12 flex flex-col gap-6">
      {/* Page Header Module */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-primary tracking-tight">
            Discover
          </h1>
          <p className="text-body-sm sm:text-body-md text-on-surface-variant max-w-2xl">
            Notable activity, liquidity shifts, and contract telemetry across
            Robinhood Chain tokens.
          </p>
        </div>
        <div className="flex items-center gap-space-lg text-data-mono-sm font-data-mono-sm text-on-surface-variant py-1">
          <div className="flex items-center gap-1.5">
            <span className="text-outline">24h Vol:</span>
            <span className="text-primary font-medium">
              {telemetry.totalVolumeFormatted}
            </span>
          </div>
          <span className="text-outline">/</span>
          <div className="flex items-center gap-1.5">
            <span className="text-outline">Tracked:</span>
            <span className="text-primary font-medium">
              {telemetry.poolsCount}
            </span>
          </div>
          <span className="text-outline">/</span>
          <div className="flex items-center gap-1.5">
            <span className="text-outline">Avg Gas:</span>
            <span className="text-primary-fixed font-medium">0.0024 Gwei</span>
          </div>
        </div>
      </div>

      {/* Preset Intelligence Views (Pill Filter Bar) */}
      <div className="flex items-center gap-space-xs overflow-x-auto custom-scrollbar py-0.5">
        {viewTabs.map((tab) => {
          const active = currentView === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleViewChange(tab.key)}
              className={`px-3 py-1 rounded-full text-label-caps font-label-caps tracking-wider transition-colors shrink-0 cursor-pointer ${
                active
                  ? "bg-[#bdf451] text-[#0d0f0c] font-bold shadow-sm"
                  : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-2 flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Min Liquidity */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded border border-outline-variant">
            <span className="text-data-mono-sm font-data-mono-sm text-on-surface-variant">
              Min Liq:
            </span>
            <select
              value={minLiquidity}
              onChange={(e) => {
                setMinLiquidity(Number(e.target.value));
                setPage(1);
              }}
              className="bg-transparent text-data-mono-sm font-data-mono-sm text-primary-fixed focus:outline-none border-0 p-0 cursor-pointer"
            >
              <option
                className="bg-surface-container text-on-surface"
                value={0}
              >
                Any
              </option>
              <option
                className="bg-surface-container text-on-surface"
                value={10000}
              >
                $10K+
              </option>
              <option
                className="bg-surface-container text-on-surface"
                value={25000}
              >
                $25K+
              </option>
              <option
                className="bg-surface-container text-on-surface"
                value={100000}
              >
                $100K+
              </option>
            </select>
          </div>

          {/* Min Volume */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded border border-outline-variant">
            <span className="text-data-mono-sm font-data-mono-sm text-on-surface-variant">
              Min Vol:
            </span>
            <select
              value={minVolume}
              onChange={(e) => {
                setMinVolume(Number(e.target.value));
                setPage(1);
              }}
              className="bg-transparent text-data-mono-sm font-data-mono-sm text-primary-fixed focus:outline-none border-0 p-0 cursor-pointer"
            >
              <option
                className="bg-surface-container text-on-surface"
                value={0}
              >
                Any
              </option>
              <option
                className="bg-surface-container text-on-surface"
                value={25000}
              >
                $25K+
              </option>
              <option
                className="bg-surface-container text-on-surface"
                value={50000}
              >
                $50K+
              </option>
              <option
                className="bg-surface-container text-on-surface"
                value={250000}
              >
                $250K+
              </option>
            </select>
          </div>

          {/* In-bar Token Search */}
          <div className="relative flex items-center">
            <FiSearch className="absolute left-2 text-[13px] text-outline" />
            <input
              value={filterQuery}
              onChange={(e) => {
                setFilterQuery(e.target.value);
                setPage(1);
              }}
              className="bg-surface-container-low border border-outline-variant rounded text-data-mono-sm font-data-mono-sm text-on-surface pl-7 pr-3 py-1 w-44 focus:w-56 focus:border-primary-fixed focus:outline-none transition-all placeholder:text-outline"
              placeholder="Filter current view..."
              type="text"
            />
          </div>

          {/* Timeframe Selection */}
          <div className="flex items-center gap-0.5 bg-surface-container-low p-0.5 rounded border border-outline-variant text-data-mono-sm font-data-mono-sm">
            {(["5M", "1H", "24H", "7D"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  timeframe === tf
                    ? "bg-surface-container-high text-primary-fixed font-semibold"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Result Counter & Mobile View Switcher */}
        <div className="flex items-center gap-2 text-data-mono-sm font-data-mono-sm">
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

          <div className="flex items-center gap-1.5 text-on-surface-variant text-data-mono-sm font-data-mono-sm">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
            <span>{filtered.length} results</span>
          </div>
        </div>
      </div>

      {/* Main Token Discovery Table Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col mb-16">
        {loading ? (
          <div className="py-20 text-center text-on-surface-variant">
            <div className="inline-flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse"></span>
              <span>Querying on-chain telemetry...</span>
            </div>
          </div>
        ) : pagedTokens.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant px-4">
            <p className="text-body-md font-semibold text-primary">
              No tokens match active discovery criteria
            </p>
            <p className="text-body-sm text-outline mt-1.5 max-w-md mx-auto">
              {filterQuery || minLiquidity > 0 || minVolume > 0
                ? "Try clearing or relaxing liquidity, volume, or search filters."
                : "Analyze and index contracts via the search console to build live telemetry."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card Stream (Active when mobileView === "cards") */}
            <div
              className={
                mobileView === "cards"
                  ? "block md:hidden divide-y divide-outline-variant/30"
                  : "hidden"
              }
            >
              {pagedTokens.map((item) => {
                const change = item.metrics?.priceChange24h;
                const isNegative = change != null && change < 0;
                const isWatched = appState.isWatched(item.token.address);
                const isQueued = appState.compare.some(
                  (x) =>
                    x.address.toLowerCase() ===
                    item.token.address.toLowerCase(),
                );
                const priceStr =
                  item.metrics?.priceUsd != null
                    ? item.metrics.priceUsd < 0.001
                      ? `$${item.metrics.priceUsd.toFixed(6)}`
                      : compactNumber(item.metrics.priceUsd, true)
                    : "$0.00";

                return (
                  <div
                    key={item.token.address}
                    className="p-4 hover:bg-surface-container-high/20 transition-colors flex flex-col gap-3"
                  >
                    {/* Card Header: Avatar, Identity, Risk Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Link
                          href={`/token/${item.token.address}`}
                          className="shrink-0"
                        >
                          <TokenAvatar
                            address={item.token.address}
                            symbol={item.token.symbol}
                            size={38}
                          />
                        </Link>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/token/${item.token.address}`}
                              className="font-bold text-on-surface hover:text-primary-fixed transition-colors text-base truncate"
                            >
                              {item.token.symbol}
                            </Link>
                            <span className="text-outline text-xs truncate max-w-[120px]">
                              {item.token.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-data-mono-sm text-outline">
                            <span className="font-mono text-[11px]">
                              {shortenAddress(item.token.address)}
                            </span>
                            <CopyButton value={item.token.address} />
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {getRiskBadge(item.risk?.score)}
                      </div>
                    </div>

                    {/* Price & 24h Delta Strip */}
                    <div className="flex items-baseline justify-between pt-1 border-t border-outline-variant/20">
                      <div>
                        <span className="text-[10px] text-outline uppercase tracking-wider block font-semibold">
                          Spot Price
                        </span>
                        <span className="font-data-mono-lg font-bold text-lg text-primary">
                          {priceStr}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-outline uppercase tracking-wider block font-semibold">
                          24H Change
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-data-mono-sm ${
                            change == null
                              ? "text-outline bg-surface-container"
                              : isNegative
                                ? "text-error bg-error/15"
                                : "text-tertiary-fixed bg-tertiary-fixed/15"
                          }`}
                        >
                          {change == null
                            ? "—"
                            : `${change > 0 ? "+" : ""}${change.toFixed(2)}%`}
                        </span>
                      </div>
                    </div>

                    {/* 4-Metric Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-lg bg-surface-container-low/60 border border-outline-variant/30 text-data-mono-sm">
                      <div>
                        <span className="text-[10px] text-outline uppercase block">
                          24H Vol
                        </span>
                        <span className="text-xs font-semibold text-on-surface">
                          {compactNumber(item.metrics?.volume24hUsd ?? 0, true)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-outline uppercase block">
                          Market Cap
                        </span>
                        <span className="text-xs font-semibold text-on-surface">
                          {compactNumber(item.metrics?.marketCapUsd ?? 0, true)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-outline uppercase block">
                          Liquidity
                        </span>
                        <span className="text-xs font-semibold text-on-surface">
                          {compactNumber(item.metrics?.liquidityUsd ?? 0, true)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-outline uppercase block">
                          Vol / Liq
                        </span>
                        <span className="text-xs font-semibold text-on-surface-variant">
                          {volLiqRatio(
                            item.metrics?.volume24hUsd,
                            item.metrics?.liquidityUsd,
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between pt-1 text-data-mono-sm">
                      <span className="text-[11px] text-outline">
                        Age: {getAgeText(item.token.firstSeenAt, clientTime)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => appState.toggleWatch(item)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                            isWatched
                              ? "bg-surface-container-high text-primary-fixed border-primary-fixed/40 font-semibold"
                              : "bg-surface-container-low text-outline hover:text-on-surface border-outline-variant"
                          }`}
                          title={
                            isWatched
                              ? "Remove from watchlist"
                              : "Add to watchlist"
                          }
                        >
                          {isWatched ? (
                            <>
                              <RiStarFill className="text-primary-fixed text-sm" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <RiStarLine className="text-sm" />
                              <span>Watch</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => appState.toggleCompare(item)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer border ${
                            isQueued
                              ? "bg-surface-container-high text-primary-fixed border-primary-fixed/40 font-semibold"
                              : "bg-surface-container-low text-outline hover:text-on-surface border-outline-variant"
                          }`}
                        >
                          <RiExchangeLine className="text-xs" />
                          <span>{isQueued ? "Queued" : "Compare"}</span>
                        </button>

                        <Link
                          href={`/token/${item.token.address}`}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface-container-high hover:bg-surface-container text-primary hover:text-primary-fixed border border-outline-variant transition-colors flex items-center gap-1"
                        >
                          <span>View</span>
                          <RiArrowRightUpLine className="text-xs" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View & Mobile Table Mode */}
            <div
              className={mobileView === "table" ? "block" : "hidden md:block"}
            >
              {/* Touch Swipe Hint when in table mode on mobile */}
              <div className="md:hidden flex items-center justify-between px-4 py-2 bg-surface-container-low/60 border-b border-outline-variant/40 text-[11px] text-outline font-data-mono-sm">
                <span className="flex items-center gap-1.5">
                  <FiArrowRight className="text-[12px] animate-pulse text-primary-fixed" />
                  <span>Swipe horizontally to view all 11 metrics</span>
                </span>
                <span>{sorted.length} tokens</span>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1080px]">
                  <thead>
                    <tr className="h-9 border-b border-outline-variant bg-surface-container-low/50 text-label-caps font-label-caps text-on-surface-variant tracking-wider select-none">
                      <th className="px-3 py-1 text-left font-semibold sticky left-0 bg-surface-container-low z-20 border-r border-outline-variant/40 shadow-[4px_0_10px_rgba(0,0,0,0.3)] min-w-[210px]">
                        Token
                      </th>
                      <th
                        onClick={() => handleSort("price")}
                        className="px-3 py-1 text-right font-semibold cursor-pointer hover:text-primary"
                      >
                        Price{" "}
                        {sortField === "price"
                          ? sortDir === 1
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        onClick={() => handleSort("change")}
                        className="px-3 py-1 text-right font-semibold cursor-pointer hover:text-primary"
                      >
                        24h Change{" "}
                        {sortField === "change"
                          ? sortDir === 1
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        onClick={() => handleSort("marketCap")}
                        className="px-3 py-1 text-right font-semibold cursor-pointer hover:text-primary"
                      >
                        Market Cap{" "}
                        {sortField === "marketCap"
                          ? sortDir === 1
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        onClick={() => handleSort("volume")}
                        className="px-3 py-1 text-right font-semibold cursor-pointer hover:text-primary"
                      >
                        24h Volume{" "}
                        {sortField === "volume"
                          ? sortDir === 1
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        onClick={() => handleSort("liquidity")}
                        className="px-3 py-1 text-right font-semibold cursor-pointer hover:text-primary"
                      >
                        Available Liquidity{" "}
                        {sortField === "liquidity"
                          ? sortDir === 1
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        onClick={() => handleSort("ratio")}
                        className="px-3 py-1 text-right font-semibold cursor-pointer hover:text-primary"
                      >
                        Vol / Liq{" "}
                        {sortField === "ratio"
                          ? sortDir === 1
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th className="px-3 py-1 text-right font-semibold">
                        Holders
                      </th>
                      <th
                        onClick={() => handleSort("risk")}
                        className="px-3 py-1 text-center font-semibold cursor-pointer hover:text-primary"
                      >
                        Risk Score{" "}
                        {sortField === "risk"
                          ? sortDir === 1
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        onClick={() => handleSort("age")}
                        className="px-3 py-1 text-right font-semibold cursor-pointer hover:text-primary"
                      >
                        Age{" "}
                        {sortField === "age" ? (sortDir === 1 ? "↑" : "↓") : ""}
                      </th>
                      <th className="px-3 py-1 text-center font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/40 text-body-md font-body-md">
                    {pagedTokens.map((item) => {
                      const change = item.metrics?.priceChange24h;
                      const isNegative = change != null && change < 0;
                      const isWatched = appState.isWatched(item.token.address);
                      const isQueued = appState.compare.some(
                        (x) =>
                          x.address.toLowerCase() ===
                          item.token.address.toLowerCase(),
                      );
                      const priceStr =
                        item.metrics?.priceUsd != null
                          ? item.metrics.priceUsd < 0.001
                            ? `$${item.metrics.priceUsd.toFixed(6)}`
                            : compactNumber(item.metrics.priceUsd, true)
                          : "$0.00";

                      return (
                        <tr
                          key={item.token.address}
                          className="hover:bg-surface-container-high transition-colors group"
                        >
                          {/* Sticky Token Column */}
                          <td className="px-3 py-2.5 sticky left-0 bg-surface-container-lowest group-hover:bg-surface-container-high transition-colors z-10 border-r border-outline-variant/40 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
                            <div className="flex items-center gap-2.5">
                              <Link
                                href={`/token/${item.token.address}`}
                                className="shrink-0"
                              >
                                <TokenAvatar
                                  address={item.token.address}
                                  symbol={item.token.symbol}
                                  size={30}
                                />
                              </Link>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <Link
                                    href={`/token/${item.token.address}`}
                                    className="font-semibold text-primary group-hover:text-primary-fixed transition-colors text-[13px] truncate"
                                  >
                                    {item.token.symbol}
                                  </Link>
                                  <span className="text-data-mono-sm font-data-mono-sm text-outline truncate max-w-[110px]">
                                    {item.token.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Link
                                    href={`/token/${item.token.address}`}
                                    className="text-data-mono-sm font-data-mono-sm text-outline group-hover:text-on-surface-variant font-mono text-[11px]"
                                    title={item.token.address}
                                  >
                                    {shortenAddress(item.token.address)}
                                  </Link>
                                  <CopyButton value={item.token.address} />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right font-data-mono-md text-data-mono-md text-primary">
                            {priceStr}
                          </td>
                          <td
                            className={`px-3 py-2.5 text-right font-data-mono-md text-data-mono-md ${
                              isNegative ? "text-error" : "text-secondary-fixed"
                            }`}
                          >
                            {change == null
                              ? "—"
                              : `${change > 0 ? "+" : ""}${change.toFixed(2)}%`}
                          </td>
                          <td className="px-3 py-2.5 text-right font-data-mono-md text-data-mono-md text-on-surface">
                            {compactNumber(
                              item.metrics?.marketCapUsd ?? 0,
                              true,
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right font-data-mono-md text-data-mono-md text-on-surface">
                            {compactNumber(
                              item.metrics?.volume24hUsd ?? 0,
                              true,
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right font-data-mono-md text-data-mono-md text-on-surface">
                            {compactNumber(
                              item.metrics?.liquidityUsd ?? 0,
                              true,
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right font-data-mono-md text-data-mono-md text-on-surface-variant">
                            {volLiqRatio(
                              item.metrics?.volume24hUsd,
                              item.metrics?.liquidityUsd,
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right font-data-mono-md text-data-mono-md text-on-surface">
                            —
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {getRiskBadge(item.risk?.score)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-data-mono-sm text-data-mono-sm text-outline">
                            {getAgeText(item.token.firstSeenAt, clientTime)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => appState.toggleWatch(item)}
                                className={`p-1 transition-colors cursor-pointer ${
                                  isWatched
                                    ? "text-primary-fixed"
                                    : "hover:text-primary-fixed text-outline"
                                }`}
                                title={
                                  isWatched
                                    ? "Remove from watchlist"
                                    : "Add to watchlist"
                                }
                              >
                                {isWatched ? (
                                  <RiStarFill className="text-primary-fixed text-[14px]" />
                                ) : (
                                  <RiStarLine className="text-[14px]" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => appState.toggleCompare(item)}
                                className={`px-2 py-0.5 rounded text-data-mono-sm font-data-mono-sm cursor-pointer transition-colors ${
                                  isQueued
                                    ? "bg-surface-container-high text-primary-fixed border border-primary-fixed/30 font-medium"
                                    : "text-outline hover:text-primary-fixed border border-outline-variant hover:border-primary-fixed"
                                }`}
                              >
                                {isQueued ? "Queued" : "Compare"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(`/token/${item.token.address}`)
                                }
                                className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container cursor-pointer transition-colors"
                                title="Open Token Intelligence"
                                aria-label="Open Token Intelligence"
                              >
                                <RiArrowRightUpLine className="text-[15px]" />
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
          </>
        )}

        {/* Pagination & Grid Info */}
        <div className="px-3 py-2 bg-surface-container-low/40 border-t border-outline-variant flex flex-wrap items-center justify-between gap-space-xs text-data-mono-sm font-data-mono-sm text-on-surface-variant">
          <div className="flex items-center gap-2 text-outline">
            <span>
              Showing{" "}
              {sorted.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, sorted.length)} of{" "}
              {sorted.length}
            </span>
            <span>·</span>
            <span>Live Indexed Telemetry</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-2 py-0.5 rounded text-outline hover:text-on-surface disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from(
              { length: Math.min(5, totalPages) },
              (_, i) => i + 1,
            ).map((pNum) => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  currentPage === pNum
                    ? "bg-surface-container-high border border-outline text-primary-fixed font-medium"
                    : "text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {pNum}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2 py-0.5 rounded text-outline hover:text-on-surface disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
