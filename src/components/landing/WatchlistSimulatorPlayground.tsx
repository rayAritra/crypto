"use client";

import { TokenAvatar } from "@/components/shared/TokenAvatar";
import { compactNumber } from "@/lib/utils/format";
import Link from "next/link";
import { useState } from "react";
import {
    FiArrowRight,
    FiCheckCircle,
    FiEye,
    FiLock,
    FiTrash2
} from "react-icons/fi";
import { RiStarFill, RiStarLine } from "react-icons/ri";

type WatchlistMockItem = {
  id: string;
  symbol: string;
  name: string;
  address: string;
  basePrice: number;
  volume24h: number;
  liquidity: number;
  riskScore: number;
  selected: boolean;
};

const INITIAL_WATCH_ITEMS: WatchlistMockItem[] = [
  {
    id: "hood",
    symbol: "$HOOD",
    name: "Hood Protocol",
    address: "0x71c5000000000000000000000000000000004490",
    basePrice: 1.25,
    volume24h: 1128450,
    liquidity: 840420,
    riskScore: 92,
    selected: true,
  },
  {
    id: "rhx",
    symbol: "$RHX",
    name: "Robinhood Exchange",
    address: "0x892a00000000000000000000000000000000103f",
    basePrice: 0.62,
    volume24h: 694120,
    liquidity: 412090,
    riskScore: 88,
    selected: true,
  },
  {
    id: "lens",
    symbol: "$LENS",
    name: "Lens Oracle",
    address: "0x3310000000000000000000000000000000008821",
    basePrice: 2.8,
    volume24h: 982000,
    liquidity: 590400,
    riskScore: 95,
    selected: true,
  },
  {
    id: "robin",
    symbol: "$ROBIN",
    name: "Robin Token",
    address: "0x44900000000000000000000000000000000071c5",
    basePrice: 0.04,
    volume24h: 245000,
    liquidity: 180000,
    riskScore: 84,
    selected: false,
  },
];

export function WatchlistSimulatorPlayground() {
  const [items, setItems] = useState<WatchlistMockItem[]>(INITIAL_WATCH_ITEMS);
  const [marketShiftPct, setMarketShiftPct] = useState<number>(14);

  function toggleItem(id: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it)),
    );
  }

  const selectedItems = items.filter((it) => it.selected);
  const totalVol = selectedItems.reduce((s, it) => s + it.volume24h, 0);
  const totalLiq = selectedItems.reduce((s, it) => s + it.liquidity, 0);

  return (
    <section
      className="py-20 px-4 sm:px-6 border-t border-white/[0.06] relative w-full"
      id="watchlist-playground"
    >
      <div className="w-full max-w-4xl mx-auto text-center">
        {/* Eyebrow & Title */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-mono mb-3 text-[#c7ff5b] border border-white/10">
          <FiEye className="text-[14px]" />
          <span className="tracking-widest uppercase font-bold text-[10px]">
            LOCAL-FIRST PORTFOLIO RADAR
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
          Zero-Tracking Watchlist.
        </h2>
        <p className="text-sm text-on-surface-variant max-w-xl mx-auto mb-10 leading-relaxed">
          Monitor your portfolio movements and liquidity depth with 100%
          browser-persisted memory. No wallet connects, zero KYC cookies.
        </p>

        {/* Centralized Interactive Simulator */}
        <div className="glass-card rounded-2xl p-5 sm:p-7 border border-white/10 text-left shadow-2xl relative font-mono">
          {/* Top Token Switcher & PnL Slider */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase text-outline">
                Click to Track:
              </span>
              {items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => toggleItem(it.id)}
                  className={`px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    it.selected
                      ? "bg-[#c7ff5b]/20 text-[#c7ff5b] border border-[#c7ff5b]/40 font-bold"
                      : "bg-white/5 text-on-surface-variant hover:text-white border border-white/5"
                  }`}
                >
                  {it.selected ? (
                    <RiStarFill className="text-xs" />
                  ) : (
                    <RiStarLine className="text-xs" />
                  )}
                  <span>{it.symbol}</span>
                </button>
              ))}
            </div>

            {/* Simulated Market Shift Slider */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="text-[11px] text-outline uppercase">
                Simulated 24H Shift:
              </span>
              <input
                type="range"
                min={-20}
                max={50}
                value={marketShiftPct}
                onChange={(e) => setMarketShiftPct(Number(e.target.value))}
                className="w-20 accent-[#c7ff5b] cursor-pointer"
              />
              <span
                className={`text-xs font-bold min-w-[36px] ${
                  marketShiftPct >= 0 ? "text-[#43c98b]" : "text-[#ff6b6b]"
                }`}
              >
                {marketShiftPct > 0 ? "+" : ""}
                {marketShiftPct}%
              </span>
            </div>
          </div>

          {/* Portfolio KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-outline uppercase block">
                Monitored
              </span>
              <span className="text-base font-bold text-white mt-1 block">
                {selectedItems.length} Assets
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-outline uppercase block">
                Portfolio Vol
              </span>
              <span className="text-base font-bold text-[#c7ff5b] mt-1 block">
                {compactNumber(totalVol, true)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-outline uppercase block">
                Pool Liquidity
              </span>
              <span className="text-base font-bold text-white mt-1 block">
                {compactNumber(totalLiq, true)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-outline uppercase block">
                Privacy Mode
              </span>
              <span className="text-base font-bold text-[#43c98b] mt-1 block flex items-center gap-1">
                <FiLock className="text-xs" /> Sandbox
              </span>
            </div>
          </div>

          {/* Dynamic Monitored Cards List */}
          <div className="space-y-2.5 mb-5">
            {selectedItems.map((it) => {
              const currentPrice = it.basePrice * (1 + marketShiftPct / 100);
              const gainPct = marketShiftPct;

              return (
                <div
                  key={it.id}
                  className="p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <TokenAvatar
                      address={it.address}
                      symbol={it.symbol}
                      size={34}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">
                          {it.symbol}
                        </span>
                        <span className="text-[10px] text-outline">
                          {it.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-outline">
                        Added @ ${it.basePrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      ${currentPrice.toFixed(3)}
                    </div>
                    <div
                      className={`text-[11px] font-bold ${
                        gainPct >= 0 ? "text-[#43c98b]" : "text-[#ff6b6b]"
                      }`}
                    >
                      {gainPct > 0 ? "+" : ""}
                      {gainPct.toFixed(1)}% since added
                    </div>
                  </div>

                  <button
                    onClick={() => toggleItem(it.id)}
                    className="p-1.5 rounded-lg text-outline hover:text-[#ff6b6b] hover:bg-white/5 transition-colors cursor-pointer"
                    title="Remove from simulator"
                  >
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom Callout & Link */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-on-surface-variant">
            <span className="flex items-center gap-1.5 text-outline">
              <FiCheckCircle className="text-[#c7ff5b]" />
              <span>
                Zero-cookie sandbox: state stored strictly in your browser.
              </span>
            </span>
            <Link
              href="/watchlist"
              className="text-[#c7ff5b] hover:underline font-bold flex items-center gap-1"
            >
              <span>Launch Live Watchlist</span>
              <FiArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
