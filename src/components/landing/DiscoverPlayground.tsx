"use client";

import { useAppState } from "@/components/providers/AppState";
import { TokenAvatar } from "@/components/shared/TokenAvatar";
import { compactNumber, shortenAddress } from "@/lib/utils/format";
import type { RankedToken } from "@/types/token";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { RiArrowRightUpLine, RiRadarLine, RiStarFill, RiStarLine } from "react-icons/ri";

type Category = "all" | "trending" | "new" | "volume" | "safe";
type Props = {
  trending: RankedToken[];
  newTokens: RankedToken[];
  volume: RankedToken[];
};

const tabs: Array<{ id: Category; label: string }> = [
  { id: "all", label: "All Indexed" },
  { id: "trending", label: "Trending" },
  { id: "new", label: "New Tokens" },
  { id: "volume", label: "High Volume" },
  { id: "safe", label: "Score 90+" },
];

function uniqueTokens(groups: RankedToken[][]) {
  return [...new Map(groups.flat().map((item) => [item.token.address.toLowerCase(), item])).values()];
}

export function DiscoverPlayground({ trending, newTokens, volume }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [minLiqK, setMinLiqK] = useState(0);
  const appState = useAppState();
  const allTokens = useMemo(() => uniqueTokens([trending, newTokens, volume]), [trending, newTokens, volume]);
  const trendingAddresses = useMemo(() => new Set(trending.map((item) => item.token.address.toLowerCase())), [trending]);
  const newAddresses = useMemo(() => new Set(newTokens.map((item) => item.token.address.toLowerCase())), [newTokens]);
  const volumeAddresses = useMemo(() => new Set(volume.map((item) => item.token.address.toLowerCase())), [volume]);

  const filtered = allTokens.filter((item) => {
    const address = item.token.address.toLowerCase();
    if (selectedCategory === "trending" && !trendingAddresses.has(address)) return false;
    if (selectedCategory === "new" && !newAddresses.has(address)) return false;
    if (selectedCategory === "volume" && !volumeAddresses.has(address)) return false;
    if (selectedCategory === "safe" && (item.risk?.score ?? 0) < 90) return false;
    return (item.metrics?.liquidityUsd ?? 0) >= minLiqK * 1000;
  });
  const visible = filtered.slice(0, 6);

  return (
    <section className="pt-8 sm:pt-10 pb-20 px-4 sm:px-6 relative w-full" id="discovery-playground">
      <div className="w-full max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-mono mb-3 text-[#c7ff5b] border border-white/10">
          <RiRadarLine className="text-[14px]" />
          <span className="tracking-widest uppercase font-bold text-[10px]">LIVE INDEXED DISCOVERY</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">Real tokens. Current telemetry.</h2>
        <p className="text-sm text-on-surface-variant max-w-xl mx-auto mb-10 leading-relaxed">
          Filter tokens currently indexed from Robinhood Chain. Missing market data stays unavailable instead of being filled with demo numbers.
        </p>

        <div className="glass-card rounded-2xl p-5 sm:p-7 border border-white/10 text-left shadow-2xl relative font-mono">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
              {tabs.map((tab) => (
                <button key={tab.id} type="button" onClick={() => setSelectedCategory(tab.id)} className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer shrink-0 ${selectedCategory === tab.id ? "bg-[#c7ff5b] text-[#080a08] font-bold shadow-[0_0_12px_rgba(199,255,91,0.3)]" : "bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white border border-white/5"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2.5 text-xs text-on-surface-variant self-end sm:self-auto shrink-0 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-[11px] text-outline uppercase">Min Liq:</span>
              <input type="range" min={0} max={500} step={50} value={minLiqK} onChange={(event) => setMinLiqK(Number(event.target.value))} className="w-20 sm:w-24 accent-[#c7ff5b] cursor-pointer" />
              <span className="text-[#c7ff5b] font-bold text-xs min-w-[42px]">{minLiqK === 0 ? "Any" : `>$${minLiqK}K`}</span>
            </label>
          </div>

          {visible.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
              {visible.map((item) => {
                const metrics = item.metrics;
                const change = metrics?.priceChange24h;
                const isWatched = appState.isWatched(item.token.address);
                return (
                  <article key={item.token.address} className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-[#c7ff5b]/40 transition-all duration-200 group flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <TokenAvatar address={item.token.address} symbol={item.token.symbol} iconUrl={item.token.iconUrl} size={38} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-bold text-white text-base group-hover:text-[#c7ff5b] transition-colors shrink-0">{item.token.symbol}</span>
                              <span className="text-[10px] text-outline truncate">{item.token.name}</span>
                            </div>
                            <span className="text-[11px] text-outline block">{shortenAddress(item.token.address)}</span>
                          </div>
                        </div>
                        {item.risk ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-[#43c98b]/15 text-[#43c98b] border-[#43c98b]/30 shrink-0">{item.risk.score}/100</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] border border-white/10 text-outline shrink-0">Unscored</span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-white/[0.02] border border-white/5 text-center text-xs">
                        <Metric label="Price" value={compactNumber(metrics?.priceUsd, true)} />
                        <Metric label="24H Delta" value={change == null ? "—" : `${change > 0 ? "+" : ""}${change.toFixed(1)}%`} tone={change == null ? "muted" : change >= 0 ? "positive" : "negative"} />
                        <Metric label="Liquidity" value={compactNumber(metrics?.liquidityUsd, true)} />
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                      <button type="button" onClick={() => appState.toggleWatch(item)} className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${isWatched ? "bg-[#c7ff5b]/20 text-[#c7ff5b] border-[#c7ff5b]/40 font-bold" : "bg-white/5 text-on-surface-variant hover:text-white border-white/10"}`}>
                        {isWatched ? <RiStarFill className="text-[#c7ff5b] text-xs" /> : <RiStarLine className="text-xs" />}
                        <span>{isWatched ? "Saved" : "Watch"}</span>
                      </button>
                      <Link href={`/token/${item.token.address}`} className="text-[#c7ff5b] hover:underline flex items-center gap-1 text-[11px] font-bold">
                        <span>Inspect</span><RiArrowRightUpLine className="text-xs" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mb-5 rounded-xl border border-dashed border-white/10 bg-black/20 px-5 py-12 text-center">
              <p className="text-sm font-semibold text-white">No indexed tokens match this filter.</p>
              <p className="text-xs text-outline mt-1">Try a lower liquidity threshold or open the discovery terminal.</p>
            </div>
          )}

          <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-on-surface-variant">
            <span className="flex items-center gap-1.5 text-outline"><span className="w-1.5 h-1.5 rounded-full bg-[#c7ff5b]" /><span>Showing {visible.length} of {filtered.length} matching indexed tokens</span></span>
            <Link href="/discover" className="text-[#c7ff5b] hover:underline font-bold flex items-center gap-1"><span>Open Live Discovery</span><FiArrowRight className="text-xs" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "muted" | "positive" | "negative" }) {
  const color = tone === "positive" ? "text-[#43c98b]" : tone === "negative" ? "text-[#ff6b6b]" : tone === "muted" ? "text-outline" : "text-white";
  return <div><span className="text-[9px] text-outline uppercase block">{label}</span><span className={`font-bold ${color}`}>{value}</span></div>;
}
