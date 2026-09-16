"use client";

import { useAppState } from "@/components/providers/AppState";
import { TokenAvatar } from "@/components/shared/TokenAvatar";
import { compactNumber, shortenAddress } from "@/lib/utils/format";
import Link from "next/link";
import { FiArrowRight, FiCheckCircle, FiEye, FiLock } from "react-icons/fi";

export function WatchlistSimulatorPlayground() {
  const state = useAppState();
  const visible = state.watchlist.slice(0, 4);

  return (
    <section className="py-20 px-4 sm:px-6 border-t border-white/[0.06] relative w-full" id="watchlist-playground">
      <div className="w-full max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-mono mb-3 text-[#c7ff5b] border border-white/10">
          <FiEye className="text-[14px]" />
          <span className="tracking-widest uppercase font-bold text-[10px]">YOUR LOCAL WATCHLIST</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">Zero-tracking watchlist.</h2>
        <p className="text-sm text-on-surface-variant max-w-xl mx-auto mb-10 leading-relaxed">
          Tokens you save are kept in this browser. No demo portfolio, wallet connection, or fabricated performance data.
        </p>

        <div className="glass-card rounded-2xl p-5 sm:p-7 border border-white/10 text-left shadow-2xl relative font-mono">
          <div className="flex items-center justify-between gap-4 pb-5 mb-5 border-b border-white/[0.08]">
            <div>
              <span className="text-[10px] uppercase text-outline block">Saved locally</span>
              <span className="text-lg font-bold text-white">{state.ready ? state.watchlist.length : "—"} tokens</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/10 text-xs text-[#43c98b]">
              <FiLock />
              <span>Browser only</span>
            </div>
          </div>

          {!state.ready ? (
            <div className="rounded-xl border border-white/10 bg-black/20 px-5 py-10 text-center text-sm text-outline">Loading your saved tokens…</div>
          ) : visible.length > 0 ? (
            <div className="space-y-2.5 mb-5">
              {visible.map((item) => (
                <Link key={item.address} href={`/token/${item.address}`} className="p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#c7ff5b]/30 transition-colors flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <TokenAvatar address={item.address} symbol={item.symbol} size={34} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-white text-sm group-hover:text-[#c7ff5b] transition-colors">{item.symbol}</span>
                        <span className="text-[10px] text-outline truncate">{item.name}</span>
                      </div>
                      <span className="text-[10px] text-outline">{shortenAddress(item.address)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-outline uppercase block">Saved price</span>
                    <span className="text-sm font-bold text-white">{compactNumber(item.addedPrice, true)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mb-5 rounded-xl border border-dashed border-white/10 bg-black/20 px-5 py-10 text-center">
              <p className="text-sm font-semibold text-white">Your watchlist is empty.</p>
              <p className="text-xs text-outline mt-1">Save a real indexed token from discovery and it will appear here.</p>
              <Link href="/discover" className="inline-flex items-center gap-1 mt-4 text-xs font-bold text-[#c7ff5b] hover:underline">Browse indexed tokens <FiArrowRight /></Link>
            </div>
          )}

          <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-on-surface-variant">
            <span className="flex items-center gap-1.5 text-outline"><FiCheckCircle className="text-[#c7ff5b]" /><span>Stored in localStorage on this device.</span></span>
            <Link href="/watchlist" className="text-[#c7ff5b] hover:underline font-bold flex items-center gap-1"><span>Open Your Watchlist</span><FiArrowRight className="text-xs" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
