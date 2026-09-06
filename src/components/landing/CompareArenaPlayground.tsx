"use client";

import { TokenAvatar } from "@/components/shared/TokenAvatar";
import { compactNumber } from "@/lib/utils/format";
import Link from "next/link";
import { useState } from "react";
import {
    FiArrowRight,
    FiDroplet,
    FiPieChart,
    FiShield,
    FiTrendingUp
} from "react-icons/fi";
import { RiArrowLeftRightLine } from "react-icons/ri";

type ArenaToken = {
  address: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  fdv: number;
  liquidity: number;
  volume24h: number;
  top10Concentration: number;
  riskScore: number;
  mintRenounced: boolean;
};

const ARENA_TOKENS: Record<string, ArenaToken> = {
  HOOD: {
    address: "0x71c5000000000000000000000000000000004490",
    symbol: "$HOOD",
    name: "Hood Protocol",
    price: 1.424,
    change24h: 14.28,
    fdv: 142400000,
    liquidity: 840420,
    volume24h: 1128450,
    top10Concentration: 18.4,
    riskScore: 92,
    mintRenounced: true,
  },
  RHX: {
    address: "0x892a00000000000000000000000000000000103f",
    symbol: "$RHX",
    name: "Robinhood Exchange",
    price: 0.682,
    change24h: 8.12,
    fdv: 68200000,
    liquidity: 412090,
    volume24h: 694120,
    top10Concentration: 22.8,
    riskScore: 88,
    mintRenounced: true,
  },
  LENS: {
    address: "0x3310000000000000000000000000000000008821",
    symbol: "$LENS",
    name: "Lens Oracle",
    price: 3.14,
    change24h: 22.5,
    fdv: 94200000,
    liquidity: 590400,
    volume24h: 982000,
    top10Concentration: 14.1,
    riskScore: 95,
    mintRenounced: true,
  },
};

export function CompareArenaPlayground() {
  const [tokenAKey, setTokenAKey] = useState<string>("HOOD");
  const [tokenBKey, setTokenBKey] = useState<string>("RHX");
  const [activeDimension, setActiveDimension] = useState<
    "liquidity" | "valuation" | "holders" | "risk"
  >("liquidity");

  const a = ARENA_TOKENS[tokenAKey];
  const b = ARENA_TOKENS[tokenBKey];

  const compareUrl = `/compare?tokens=${a.address},${b.address}`;

  // Liquidity comparison percentages
  const maxLiq = Math.max(a.liquidity, b.liquidity);
  const aLiqPct = (a.liquidity / maxLiq) * 100;
  const bLiqPct = (b.liquidity / maxLiq) * 100;

  // Volume comparison percentages
  const maxVol = Math.max(a.volume24h, b.volume24h);
  const aVolPct = (a.volume24h / maxVol) * 100;
  const bVolPct = (b.volume24h / maxVol) * 100;

  return (
    <section
      className="py-20 px-4 sm:px-6 border-t border-white/[0.06] relative w-full"
      id="compare-playground"
    >
      <div className="w-full max-w-4xl mx-auto text-center">
        {/* Eyebrow & Title */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-mono mb-3 text-[#c7ff5b] border border-white/10">
          <RiArrowLeftRightLine className="text-[14px]" />
          <span className="tracking-widest uppercase font-bold text-[10px]">
            HEAD-TO-HEAD BENCHMARK ARENA
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
          Side-by-Side Token Comparison.
        </h2>
        <p className="text-sm text-on-surface-variant max-w-xl mx-auto mb-10 leading-relaxed">
          Select any two assets to see live metric differentials, liquidity
          ratios, and security score battles.
        </p>

        {/* Centralized Comparison Card */}
        <div className="glass-card rounded-2xl p-5 sm:p-7 border border-white/10 text-left shadow-2xl relative font-mono">
          {/* Challenger Selector Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 mb-5 border-b border-white/[0.08]">
            {/* Token A Selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] uppercase text-outline">
                Token A:
              </span>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                {Object.keys(ARENA_TOKENS).map((k) => (
                  <button
                    key={k}
                    onClick={() => setTokenAKey(k)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                      tokenAKey === k
                        ? "bg-[#c7ff5b] text-[#080a08] font-bold"
                        : "text-on-surface-variant hover:text-white"
                    }`}
                  >
                    ${k}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-[#c7ff5b] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10">
              VS
            </span>

            {/* Token B Selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-[10px] uppercase text-outline">
                Token B:
              </span>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                {Object.keys(ARENA_TOKENS).map((k) => (
                  <button
                    key={k}
                    onClick={() => setTokenBKey(k)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                      tokenBKey === k
                        ? "bg-white text-[#080a08] font-bold"
                        : "text-on-surface-variant hover:text-white"
                    }`}
                  >
                    ${k}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dimension Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-3 mb-5">
            {[
              {
                id: "liquidity",
                label: "Liquidity & Volume Depth",
                icon: <FiDroplet />,
              },
              {
                id: "valuation",
                label: "Valuation & FDV",
                icon: <FiTrendingUp />,
              },
              {
                id: "holders",
                label: "Holder Dispersion",
                icon: <FiPieChart />,
              },
              {
                id: "risk",
                label: "Risk & Bytecode Audit",
                icon: <FiShield />,
              },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() =>
                  setActiveDimension(d.id as typeof activeDimension)
                }
                className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  activeDimension === d.id
                    ? "bg-white/15 text-white border border-[#c7ff5b]/50 shadow-[0_0_12px_rgba(199,255,91,0.2)] font-bold"
                    : "bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white border border-white/5"
                }`}
              >
                <span className="text-[#c7ff5b]">{d.icon}</span>
                <span>{d.label}</span>
              </button>
            ))}
          </div>

          {/* Interactive Battle Metrics Canvas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 sm:p-5 rounded-xl bg-black/40 border border-white/5 mb-5">
            {/* Token A Metrics Box */}
            <div className="p-4 rounded-xl bg-[#0d120d] border border-[#c7ff5b]/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <TokenAvatar
                      address={a.address}
                      symbol={a.symbol}
                      size={36}
                    />
                    <div>
                      <span className="font-bold text-white text-base">
                        {a.symbol}
                      </span>
                      <span className="text-[10px] text-outline block">
                        {a.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#c7ff5b]">
                    ${a.price.toFixed(3)}
                  </span>
                </div>

                {/* Dimension Details */}
                <div className="space-y-3 pt-2 text-xs">
                  {activeDimension === "liquidity" && (
                    <>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-outline">DEX Liquidity</span>
                          <span className="text-white font-bold">
                            {compactNumber(a.liquidity, true)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-[#c7ff5b] rounded-full transition-all duration-500"
                            style={{ width: `${aLiqPct}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-outline">24H Volume</span>
                          <span className="text-white font-bold">
                            {compactNumber(a.volume24h, true)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-[#c7ff5b] rounded-full transition-all duration-500"
                            style={{ width: `${aVolPct}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeDimension === "valuation" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-outline">24H Change</span>
                        <span className="text-[#43c98b] font-bold">
                          +{a.change24h}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-outline">
                          Fully Diluted (FDV)
                        </span>
                        <span className="text-white font-bold">
                          {compactNumber(a.fdv, true)}
                        </span>
                      </div>
                    </>
                  )}

                  {activeDimension === "holders" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-outline">Top 10 Share</span>
                        <span className="text-[#c7ff5b] font-bold">
                          {a.top10Concentration}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-outline">Whaleproof Status</span>
                        <span className="text-[#43c98b] font-bold">
                          Safe Distribution
                        </span>
                      </div>
                    </>
                  )}

                  {activeDimension === "risk" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-outline">Audit Score</span>
                        <span className="text-[#c7ff5b] font-bold">
                          {a.riskScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-outline">Mint Authority</span>
                        <span className="text-[#c7ff5b] font-bold">
                          Renounced
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Token B Metrics Box */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <TokenAvatar
                      address={b.address}
                      symbol={b.symbol}
                      size={36}
                    />
                    <div>
                      <span className="font-bold text-white text-base">
                        {b.symbol}
                      </span>
                      <span className="text-[10px] text-outline block">
                        {b.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white">
                    ${b.price.toFixed(3)}
                  </span>
                </div>

                {/* Dimension Details */}
                <div className="space-y-3 pt-2 text-xs">
                  {activeDimension === "liquidity" && (
                    <>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-outline">DEX Liquidity</span>
                          <span className="text-white font-bold">
                            {compactNumber(b.liquidity, true)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-white/40 rounded-full transition-all duration-500"
                            style={{ width: `${bLiqPct}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-outline">24H Volume</span>
                          <span className="text-white font-bold">
                            {compactNumber(b.volume24h, true)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-white/40 rounded-full transition-all duration-500"
                            style={{ width: `${bVolPct}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeDimension === "valuation" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-outline">24H Change</span>
                        <span className="text-[#43c98b] font-bold">
                          +{b.change24h}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-outline">
                          Fully Diluted (FDV)
                        </span>
                        <span className="text-white font-bold">
                          {compactNumber(b.fdv, true)}
                        </span>
                      </div>
                    </>
                  )}

                  {activeDimension === "holders" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-outline">Top 10 Share</span>
                        <span className="text-white font-bold">
                          {b.top10Concentration}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-outline">Whaleproof Status</span>
                        <span className="text-[#43c98b] font-bold">
                          Standard
                        </span>
                      </div>
                    </>
                  )}

                  {activeDimension === "risk" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-outline">Audit Score</span>
                        <span className="text-[#43c98b] font-bold">
                          {b.riskScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-outline">Mint Authority</span>
                        <span className="text-[#c7ff5b] font-bold">
                          Renounced
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Link to Full Compare Matrix */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>Side-by-side mathematically neutral delta engine.</span>
            <Link
              href={compareUrl}
              className="text-[#c7ff5b] hover:underline font-bold flex items-center gap-1"
            >
              <span>Launch Full Compare Matrix (4 assets)</span>
              <FiArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
