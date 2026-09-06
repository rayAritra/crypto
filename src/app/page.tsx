import { ActionStage } from "@/components/landing/ActionStage";
import { CompareArenaPlayground } from "@/components/landing/CompareArenaPlayground";
import { DiscoverPlayground } from "@/components/landing/DiscoverPlayground";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { WatchlistSimulatorPlayground } from "@/components/landing/WatchlistSimulatorPlayground";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HoodLens — Institutional On-Chain Intelligence for Robinhood Chain",
  description:
    "Institutional clarity for Robinhood Chain. Real-time smart contract telemetry, deterministic risk forensics, multi-token benchmark matrix, and zero-tracking watchlists.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HoodLens — Institutional On-Chain Intelligence for Robinhood Chain",
    description:
      "Institutional clarity for Robinhood Chain. Real-time contract telemetry, zero-speculation risk scoring, multi-token benchmark matrix, and privacy-first watchlists.",
    url: "/",
    siteName: "HoodLens",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HoodLens — Institutional On-Chain Intelligence for Robinhood Chain",
    description:
      "Institutional clarity for Robinhood Chain. Real-time contract telemetry, deterministic risk forensics, and multi-token benchmarks.",
  },
};

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#080a08] text-on-surface font-sans selection:bg-[#c7ff5b] selection:text-[#080a08] overflow-x-hidden">
      {/* 0. DEDICATED TRANSPARENT LANDING APP BAR WITH JUST LOGO */}
      <LandingHeader />

      <main className="relative z-10 w-full flex flex-col items-center">
        {/* 1. HERO SECTION: EXPANSIVE EDGE-TO-EDGE GLOWING TRENDLINE & L2 TICKER */}
        <LandingHero />

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
