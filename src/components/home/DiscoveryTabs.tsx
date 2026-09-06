"use client";

import { useAppState } from "@/components/providers/AppState";
import { compactNumber, shortenAddress } from "@/lib/utils/format";
import type { RankedToken } from "@/types/token";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiSearch, FiSliders } from "react-icons/fi";
import { RiArrowRightUpLine, RiStarFill, RiStarLine } from "react-icons/ri";

type TabKey = "trending" | "new" | "volume";
type SortField =
  | "rank"
  | "price"
  | "change"
  | "marketCap"
  | "volume"
  | "liquidity"
  | "risk"
  | "age";

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

function getRiskBadge(score: number | null | undefined) {
  const s = score ?? 80;
  if (s >= 98) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-tertiary-fixed bg-surface-container-high">
        {s} · Minimal
      </span>
    );
  }
  if (s >= 80) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-tertiary-fixed bg-surface-container-high">
        {s} · Low
      </span>
    );
  }
  if (s >= 60) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-secondary-fixed bg-surface-container-high">
        {s} · Med
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-error bg-surface-container-high">
      {s} · High
    </span>
  );
}

export function DiscoveryTabs({
  trending: initialTrending,
  newTokens: initialNew,
  volume: initialVolume,
}: {
  trending: RankedToken[];
  newTokens: RankedToken[];
  volume: RankedToken[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("trending");
  const [dataByTab, setDataByTab] = useState<{
    trending: RankedToken[];
    new: RankedToken[];
    volume: RankedToken[];
  }>({
    trending: initialTrending,
    new: initialNew,
    volume: initialVolume,
  });
  const [clientTime, setClientTime] = useState<number | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [page, setPage] = useState(1);
  const [minRiskOnly, setMinRiskOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  const appState = useAppState();
  const router = useRouter();

  // Read current time inside Effect to ensure render purity
  useEffect(() => {
    setClientTime(Date.now());
  }, []);

  // Dynamically fetch from API when switching tabs if list is currently empty
  const handleTabChange = useCallback(
    async (nextTab: TabKey) => {
      setActiveTab(nextTab);
      setPage(1);

      if (dataByTab[nextTab].length === 0) {
        setLoading(true);
        try {
          const endpoint =
            nextTab === "trending"
              ? "/api/trending"
              : nextTab === "new"
                ? "/api/new"
                : "/api/volume";
          const res = await fetch(endpoint);
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json.data)) {
              setDataByTab((prev) => ({ ...prev, [nextTab]: json.data }));
            }
          }
        } catch {
          // Keep current state on error
        } finally {
          setLoading(false);
        }
      }
    },
    [dataByTab],
  );

  // Active dataset
  const baseTokens = dataByTab[activeTab];

  // Client filtering
  const filtered = useMemo(() => {
    let list = baseTokens;
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      list = list.filter(
        (x) =>
          x.token.symbol.toLowerCase().includes(q) ||
          x.token.name.toLowerCase().includes(q) ||
          x.token.address.toLowerCase().includes(q),
      );
    }
    if (minRiskOnly) {
      list = list.filter((x) => (x.risk?.score ?? 0) >= 80);
    }
    return list;
  }, [baseTokens, filterQuery, minRiskOnly]);

  // Client sorting
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
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden mb-space-lg">
      {/* Table Filter & Tab Header */}
      <div className="p-space-md border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-low/40">
        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-surface-container-high/60 p-1 rounded-lg border border-outline-variant">
          <button
            onClick={() => handleTabChange("trending")}
            className={`px-3 py-1 rounded text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === "trending"
                ? "bg-surface-container text-primary border border-outline-variant/60 shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => handleTabChange("new")}
            className={`px-3 py-1 rounded text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === "new"
                ? "bg-surface-container text-primary border border-outline-variant/60 shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            New Tokens
          </button>
          <button
            onClick={() => handleTabChange("volume")}
            className={`px-3 py-1 rounded text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === "volume"
                ? "bg-surface-container text-primary border border-outline-variant/60 shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            High Volume
          </button>
        </div>

        {/* Filter Pill Cluster */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <span className="absolute left-2.5 top-2.5 text-outline">
              <FiSearch className="text-[13px]" />
            </span>
            <input
              value={filterQuery}
              onChange={(e) => {
                setFilterQuery(e.target.value);
                setPage(1);
              }}
              className="bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-3 py-1 text-body-sm text-on-surface focus:outline-none focus:border-primary-fixed focus:ring-0 w-40 md:w-56"
              placeholder="Filter list..."
              type="text"
            />
          </div>
          <button
            onClick={() => setMinRiskOnly(!minRiskOnly)}
            className={`px-2.5 py-1 rounded-lg border text-body-sm flex items-center space-x-1 cursor-pointer transition-colors ${
              minRiskOnly
                ? "bg-[#bdf451] text-[#0d0f0c] border-[#bdf451] font-bold"
                : "bg-surface-container-low border-outline-variant text-on-surface-variant hover:text-on-surface"
            }`}
            title="Toggle low risk filter"
          >
            <FiSliders className="text-[12px]" />
            <span>{minRiskOnly ? "Low Risk Only" : "Filters"}</span>
          </button>
        </div>
      </div>

      {/* Tabular Flow */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="h-8 border-b border-outline-variant bg-surface-container-low/20 text-label-caps font-label-caps text-on-surface-variant select-none">
              <th className="px-3 font-semibold w-10">#</th>
              <th className="px-3 font-semibold">TOKEN</th>
              <th className="px-3 font-semibold">CONTRACT ADDRESS</th>
              <th
                onClick={() => handleSort("price")}
                className="px-3 font-semibold text-right cursor-pointer hover:text-primary"
              >
                PRICE {sortField === "price" ? (sortDir === 1 ? "↑" : "↓") : ""}
              </th>
              <th
                onClick={() => handleSort("change")}
                className="px-3 font-semibold text-right cursor-pointer hover:text-primary"
              >
                24H DELTA{" "}
                {sortField === "change" ? (sortDir === 1 ? "↑" : "↓") : ""}
              </th>
              <th
                onClick={() => handleSort("marketCap")}
                className="px-3 font-semibold text-right cursor-pointer hover:text-primary"
              >
                MARKET CAP{" "}
                {sortField === "marketCap" ? (sortDir === 1 ? "↑" : "↓") : ""}
              </th>
              <th
                onClick={() => handleSort("volume")}
                className="px-3 font-semibold text-right cursor-pointer hover:text-primary"
              >
                24H VOLUME{" "}
                {sortField === "volume" ? (sortDir === 1 ? "↑" : "↓") : ""}
              </th>
              <th
                onClick={() => handleSort("liquidity")}
                className="px-3 font-semibold text-right cursor-pointer hover:text-primary"
              >
                LIQUIDITY{" "}
                {sortField === "liquidity" ? (sortDir === 1 ? "↑" : "↓") : ""}
              </th>
              <th
                onClick={() => handleSort("risk")}
                className="px-3 font-semibold cursor-pointer hover:text-primary"
              >
                RISK SCORE{" "}
                {sortField === "risk" ? (sortDir === 1 ? "↑" : "↓") : ""}
              </th>
              <th
                onClick={() => handleSort("age")}
                className="px-3 font-semibold text-center cursor-pointer hover:text-primary"
              >
                AGE {sortField === "age" ? (sortDir === 1 ? "↑" : "↓") : ""}
              </th>
              <th className="px-3 font-semibold text-right pr-4">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-data-mono-sm font-data-mono-sm">
            {loading ? (
              <tr>
                <td
                  colSpan={11}
                  className="py-12 text-center text-on-surface-variant"
                >
                  <div className="inline-flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse"></span>
                    <span>Loading indexed signals...</span>
                  </div>
                </td>
              </tr>
            ) : pagedTokens.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="py-12 text-center text-on-surface-variant"
                >
                  <p className="text-body-md font-medium text-primary">
                    No indexed tokens found
                  </p>
                  <p className="text-body-sm text-outline mt-1 max-w-md mx-auto">
                    {filterQuery
                      ? "No tokens match your search filter."
                      : "Search or analyze a Robinhood Chain contract address above to populate live analytics."}
                  </p>
                </td>
              </tr>
            ) : (
              pagedTokens.map((item, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index + 1;
                const rankStr =
                  globalIndex < 10 ? `0${globalIndex}` : `${globalIndex}`;
                const change = item.metrics?.priceChange24h;
                const isNegative = change != null && change < 0;
                const isWatched = appState.isWatched(item.token.address);

                return (
                  <tr
                    key={item.token.address}
                    className="h-10 hover:bg-surface-container-high/30 transition-colors group"
                  >
                    <td className="px-3 text-outline">{rankStr}</td>
                    <td className="px-3">
                      <Link
                        href={`/token/${item.token.address}`}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <span className="font-medium text-primary group-hover:text-primary-fixed transition-colors font-body-md text-[13px]">
                          {item.token.symbol}
                        </span>
                        <span className="text-outline text-[11px] truncate max-w-[140px]">
                          {item.token.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 text-on-surface-variant">
                      <Link
                        href={`/token/${item.token.address}`}
                        className="hover:text-primary-fixed cursor-pointer transition-colors font-mono text-[12px]"
                        title={item.token.address}
                      >
                        {shortenAddress(item.token.address)}
                      </Link>
                    </td>
                    <td className="px-3 text-right font-medium text-primary">
                      {item.metrics?.priceUsd != null
                        ? item.metrics.priceUsd < 0.001
                          ? `$${item.metrics.priceUsd.toFixed(6)}`
                          : compactNumber(item.metrics.priceUsd, true)
                        : "$0.00"}
                    </td>
                    <td
                      className={`px-3 text-right font-medium ${
                        isNegative ? "text-error" : "text-tertiary-fixed"
                      }`}
                    >
                      {change == null
                        ? "—"
                        : `${change > 0 ? "+" : ""}${change.toFixed(2)}%`}
                    </td>
                    <td className="px-3 text-right text-on-surface">
                      {compactNumber(item.metrics?.marketCapUsd ?? 0, true)}
                    </td>
                    <td className="px-3 text-right text-on-surface">
                      {compactNumber(item.metrics?.volume24hUsd ?? 0, true)}
                    </td>
                    <td className="px-3 text-right text-on-surface">
                      {compactNumber(item.metrics?.liquidityUsd ?? 0, true)}
                    </td>
                    <td className="px-3">{getRiskBadge(item.risk?.score)}</td>
                    <td className="px-3 text-center text-outline">
                      {getAgeText(item.token.firstSeenAt, clientTime)}
                    </td>
                    <td className="px-3 text-right pr-4">
                      <div className="flex items-center justify-end space-x-2 text-outline group-hover:text-on-surface-variant transition-colors">
                        <button
                          type="button"
                          onClick={() => appState.toggleWatch(item)}
                          className={`p-1 transition-colors cursor-pointer ${
                            isWatched
                              ? "text-primary-fixed"
                              : "hover:text-primary-fixed"
                          }`}
                          title={
                            isWatched
                              ? "Remove from watchlist"
                              : "Add to watchlist"
                          }
                          aria-label={
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
                          onClick={() =>
                            router.push(`/token/${item.token.address}`)
                          }
                          className="hover:text-primary-fixed p-1 transition-colors cursor-pointer"
                          title="Open Token View"
                          aria-label="Open Token View"
                        >
                          <RiArrowRightUpLine className="text-[14px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination/Status Bar */}
      <div className="px-space-md py-2 border-t border-outline-variant flex items-center justify-between text-data-mono-sm font-data-mono-sm text-on-surface-variant bg-surface-container-low/20">
        <div>
          Showing {sorted.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
          {Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}{" "}
          tokens
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="px-2 py-0.5 border border-outline-variant rounded hover:bg-surface-container-high transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-primary font-bold">{currentPage}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="px-2 py-0.5 border border-outline-variant rounded hover:bg-surface-container-high transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
