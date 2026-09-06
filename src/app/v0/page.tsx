import { ActionStage } from "@/components/landing/ActionStage";
import { CompareArenaPlayground } from "@/components/landing/CompareArenaPlayground";
import { DiscoverPlayground } from "@/components/landing/DiscoverPlayground";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHeroV0 } from "@/components/landing/LandingHeroV0";
import { WatchlistSimulatorPlayground } from "@/components/landing/WatchlistSimulatorPlayground";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HoodLens (v0 Dev Archive) — Institutional On-Chain Intelligence",
  description:
    "Dev archive v0 of HoodLens with full-screen scroll-driven trajectory curve animation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HomeV0() {
  return (
    <div className="relative min-h-screen bg-[#080a08] text-on-surface font-sans selection:bg-[#c7ff5b] selection:text-[#080a08] overflow-x-hidden">
      {/* 0. DEDICATED TRANSPARENT LANDING APP BAR WITH JUST LOGO */}
      <LandingHeader />

      <main className="relative z-10 w-full flex flex-col items-center">
        {/* 1. HERO SECTION: EXPANSIVE EDGE-TO-EDGE GLOWING TRENDLINE & L2 TICKER (V0) */}
        <LandingHeroV0 />

        {/* 2. PLAYGROUND 1: LIVE DISCOVERY RADAR (Interactive filter & liquidity slider) */}
        <DiscoverPlayground />

        {/* 3. PLAYGROUND 2: HEAD-TO-HEAD COMPARE ARENA (Interactive token battle bars) */}
        <CompareArenaPlayground />

        {/* 4. PLAYGROUND 3: ZERO-TRACKING WATCHLIST SIMULATOR (Interactive portfolio & PnL slider) */}
        <WatchlistSimulatorPlayground />

        {/* 7. ACTION STAGE: 3-CARD LAUNCHPAD */}
        <ActionStage />
      </main>

      {/* 8. MINIMAL INSTITUTIONAL FOOTER */}
      <LandingFooter />
    </div>
  );
}
