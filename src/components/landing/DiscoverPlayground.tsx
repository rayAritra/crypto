"use client";

import { useAppState } from "@/components/providers/AppState";
import { TokenAvatar } from "@/components/shared/TokenAvatar";
import { compactNumber, shortenAddress } from "@/lib/utils/format";
import Link from "next/link";
import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import {
    RiArrowRightUpLine,
    RiExchangeLine,
    RiRadarLine,
    RiStarFill,
    RiStarLine,
} from "react-icons/ri";

type SignalToken = {
  address: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  liquidity: number;
  riskScore: number;
  category: "trending" | "new" | "volume" | "safe";
};

const SIGNAL_TOKENS: SignalToken[] = [
  {
    address: "0x71c5000000000000000000000000000000004490",
    symbol: "$HOOD",
    name: "Hood Protocol",
    price: 1.424,
    change24h: 14.28,
    volume24h: 1128450,
    liquidity: 840420,
    riskScore: 92,
    category: "trending",
  },
  {
    address: "0x892a00000000000000000000000000000000103f",
    symbol: "$RHX",
    name: "Robinhood Exchange",
    price: 0.682,
    change24h: 8.12,
    volume24h: 694120,
    liquidity: 412090,
    riskScore: 88,
    category: "volume",
  },
  {
    address: "0x3310000000000000000000000000000000008821",
    symbol: "$LENS",
    name: "Lens Oracle",
    price: 3.14,
    change24h: 22.5,
    volume24h: 982000,
    liquidity: 590400,
    riskScore: 95,
    category: "safe",
  },
  {
    address: "0x44900000000000000000000000000000000071c5",
    symbol: "$ROBIN",
    name: "Robin Token",
    price: 0.045,
    change24h: -2.8,
    volume24h: 245000,
    liquidity: 180000,
    riskScore: 84,
    category: "new",
  },
];

export function DiscoverPlayground() {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "trending" | "new" | "volume" | "safe"
  >("all");
  const [minLiqK, setMinLiqK] = useState<number>(0);
  const appState = useAppState();

  const filtered = SIGNAL_TOKENS.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory)
      return false;
    if (minLiqK > 0 && item.liquidity < minLiqK * 1000) return false;
    return true;
  });

  return (
    <section
      className="py-20 px-4 sm:px-6 relative w-full"
      id="discovery-playground"
    >
      <div className="w-full max-w-4xl mx-auto text-center">
        {/* Eyebrow & Title */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-mono mb-3 text-[#c7ff5b] border border-white/10">
          <RiRadarLine className="text-[14px]" />
          <span className="tracking-widest uppercase font-bold text-[10px]">
            INTERACTIVE DISCOVERY RADAR
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
          Live On-Chain Discovery Matrix.
        </h2>
        <p className="text-sm text-on-surface-variant max-w-xl mx-auto mb-10 leading-relaxed">
          Filter through real-time Robinhood Chain smart contract telemetry with
          tactile switches and dynamic signal matching.
        </p>

        {/* Centralized Interactive Playground Container */}
        <div className="glass-card rounded-2xl p-5 sm:p-7 border border-white/10 text-left shadow-2xl relative font-mono">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-white/[0.08]">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "All Signals" },
                { id: "trending", label: "Trending" },
                { id: "new", label: "New Launches" },
                { id: "volume", label: "High Volume" },
                { id: "safe", label: "Safe (90+)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setSelectedCategory(tab.id as typeof selectedCategory)
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer shrink-0 ${
                    selectedCategory === tab.id
                      ? "bg-[#c7ff5b] text-[#080a08] font-bold shadow-[0_0_12px_rgba(199,255,91,0.3)]"
                      : "bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white border border-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Min Liquidity Interactive Range Slider */}
            <div className="flex items-center gap-2.5 text-xs text-on-surface-variant self-end sm:self-auto shrink-0 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-[11px] text-outline uppercase">
                Min Liq:
              </span>
              <input
                type="range"
                min={0}
                max={500}
                step={50}
                value={minLiqK}
                onChange={(e) => setMinLiqK(Number(e.target.value))}
                className="w-20 sm:w-24 accent-[#c7ff5b] cursor-pointer"
              />
              <span className="text-[#c7ff5b] font-bold text-xs min-w-[42px]">
                {minLiqK === 0 ? "Any" : `>$${minLiqK}K`}
              </span>
            </div>
          </div>

          {/* Interactive Dynamic Token Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {filtered.map((item) => {
              const isWatched = appState.isWatched(item.address);
              const isQueued = appState.compare.some(
                (x) => x.address.toLowerCase() === item.address.toLowerCase(),
              );

              return (
                <div
                  key={item.address}
                  className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-[#c7ff5b]/40 transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    {/* Card Top: Avatar, Identity, Score */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <TokenAvatar
                          address={item.address}
                          symbol={item.symbol}
                          size={38}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-base group-hover:text-[#c7ff5b] transition-colors">
                              {item.symbol}
                            </span>
                            <span className="text-[10px] text-outline">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-outline block">
                            {shortenAddress(item.address)}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.riskScore >= 90
                            ? "bg-[#c7ff5b]/15 text-[#c7ff5b] border-[#c7ff5b]/30"
                            : "bg-[#43c98b]/15 text-[#43c98b] border-[#43c98b]/30"
                        }`}
                      >
                        {item.riskScore}/100
                      </span>
                    </div>

                    {/* Price & Metrics */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-white/[0.02] border border-white/5 text-center text-xs">
                      <div>
                        <span className="text-[9px] text-outline uppercase block">
                          Price
                        </span>
                        <span className="font-bold text-white">
                          ${item.price.toFixed(3)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-outline uppercase block">
                          24H Delta
                        </span>
                        <span
                          className={`font-bold ${
                            item.change24h >= 0
                              ? "text-[#43c98b]"
                              : "text-[#ff6b6b]"
                          }`}
                        >
                          {item.change24h > 0 ? "+" : ""}
                          {item.change24h.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-outline uppercase block">
                          Liquidity
                        </span>
                        <span className="font-semibold text-white/90">
                          {compactNumber(item.liquidity, true)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {/* Watch Toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          appState.toggleWatch({
                            token: {
                              address: item.address,
                              name: item.name,
                              symbol: item.symbol,
                              decimals: 18,
                              totalSupply: "0",
                              chainId: 88899,
                              firstSeenAt: new Date().toISOString(),
                              explorerUrl: "",
                            },
                            metrics: {
                              priceUsd: item.price,
                              priceChange24h: item.change24h,
                              volume24hUsd: item.volume24h,
                              liquidityUsd: item.liquidity,
                              marketCapUsd: null,
                              fdvUsd: null,
                              buys24h: null,
                              sells24h: null,
                              pairAddress: null,
                              dex: null,
                              source: "Robinhood RPC",
                              capturedAt: new Date().toISOString(),
                            },
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                          isWatched
                            ? "bg-[#c7ff5b]/20 text-[#c7ff5b] border-[#c7ff5b]/40 font-bold"
                            : "bg-white/5 text-on-surface-variant hover:text-white border-white/10"
                        }`}
                      >
                        {isWatched ? (
                          <>
                            <RiStarFill className="text-[#c7ff5b] text-xs" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <RiStarLine className="text-xs" />
                            <span>Watch</span>
                          </>
                        )}
                      </button>

                      {/* Compare Toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          appState.toggleCompare({
                            token: {
                              address: item.address,
                              name: item.name,
                              symbol: item.symbol,
                              decimals: 18,
                              totalSupply: "0",
                              chainId: 88899,
                              firstSeenAt: new Date().toISOString(),
                              explorerUrl: "",
                            },
                            metrics: {
                              priceUsd: item.price,
                              priceChange24h: item.change24h,
                              volume24hUsd: item.volume24h,
                              liquidityUsd: item.liquidity,
                              marketCapUsd: null,
                              fdvUsd: null,
                              buys24h: null,
                              sells24h: null,
                              pairAddress: null,
                              dex: null,
                              source: "Robinhood RPC",
                              capturedAt: new Date().toISOString(),
                            },
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                          isQueued
                            ? "bg-[#c7ff5b]/20 text-[#c7ff5b] border-[#c7ff5b]/40 font-bold"
                            : "bg-white/5 text-on-surface-variant hover:text-white border-white/10"
                        }`}
                      >
                        <RiExchangeLine className="text-xs" />
                        <span>{isQueued ? "Queued" : "Compare"}</span>
                      </button>
                    </div>

                    <Link
                      href={`/token/${item.address}`}
                      className="text-[#c7ff5b] hover:underline flex items-center gap-1 text-[11px] font-bold"
                    >
                      <span>Inspect</span>
                      <RiArrowRightUpLine className="text-xs" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Telemetry Status Bar */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-on-surface-variant">
            <span className="flex items-center gap-1.5 text-outline">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c7ff5b]"></span>
              <span>
                Matching {filtered.length} pools on Robinhood Chain L2
              </span>
            </span>
            <Link
              href="/discover"
              className="text-[#c7ff5b] hover:underline font-bold flex items-center gap-1"
            >
              <span>Explore All Verified Contracts (11 vectors)</span>
              <FiArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
