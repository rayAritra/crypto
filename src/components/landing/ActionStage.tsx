"use client";

import Link from "next/link";
import { FiArrowRight, FiBarChart2, FiTerminal } from "react-icons/fi";
import { RiRadarLine } from "react-icons/ri";

export function ActionStage() {
  return (
    <section className="py-20 px-4 sm:px-6 border-t border-white/[0.06] relative w-full">
      <div className="w-full max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
          Start exploring today.
        </h2>
        <p className="text-sm text-on-surface-variant mb-10 max-w-xl mx-auto leading-relaxed">
          Connect natively to Robinhood Chain&apos;s highest fidelity on-chain
          intelligence pipeline.
        </p>

        {/* 3 Centralized Launchpad Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-10 font-mono">
          {/* Card 1: Launch Hosted Terminal */}
          <Link
            href="/terminal"
            className="glass-card glass-card-hover rounded-2xl p-6 border border-white/10 flex flex-col justify-between corner-bracket cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#c7ff5b]/15 text-[#c7ff5b] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#c7ff5b]/25 transition-all shadow-[0_0_15px_rgba(199,255,91,0.2)]">
              <FiTerminal className="text-xl" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-[#c7ff5b] transition-colors flex items-center justify-between">
                <span>Terminal</span>
                <FiArrowRight className="text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Live terminal with search console, active moving desks, and
                pulse stats.
              </p>
            </div>
          </Link>

          {/* Card 2: Discover Contracts */}
          <Link
            href="/discover"
            className="glass-card glass-card-hover rounded-2xl p-6 border border-white/10 flex flex-col justify-between corner-bracket cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-white/20 transition-all">
              <RiRadarLine className="text-xl group-hover:text-[#c7ff5b] transition-colors" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-[#c7ff5b] transition-colors flex items-center justify-between">
                <span>Discover</span>
                <FiArrowRight className="text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                11 real-time mathematical vectors across DEX liquidity, volume,
                and new EVM tokens.
              </p>
            </div>
          </Link>

          {/* Card 3: Benchmark Matrix */}
          <Link
            href="/compare"
            className="glass-card glass-card-hover rounded-2xl p-6 border border-white/10 flex flex-col justify-between corner-bracket cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-white/20 transition-all">
              <FiBarChart2 className="text-xl group-hover:text-[#c7ff5b] transition-colors" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-[#c7ff5b] transition-colors flex items-center justify-between">
                <span>Compare</span>
                <FiArrowRight className="text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Side-by-side benchmark studio across valuation, pool depth, and
                security score.
              </p>
            </div>
          </Link>
        </div>

        {/* Micro-Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-white/10 text-xs font-mono text-on-surface-variant hover:text-white transition-colors cursor-default">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c7ff5b] animate-pulse"></span>
          <span>Robinhood Chain L2 · Open Institutional Telemetry</span>
        </div>
      </div>
    </section>
  );
}
