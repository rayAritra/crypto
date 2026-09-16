import { ActionStage } from "@/components/landing/ActionStage";
import { DiscoverPlayground } from "@/components/landing/DiscoverPlayground";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { WatchlistSimulatorPlayground } from "@/components/landing/WatchlistSimulatorPlayground";
import { getEnv } from "@/config/env";
import { discovery } from "@/lib/db/queries";
import type { RankedToken } from "@/types/token";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "HoodLens — Institutional On-Chain Intelligence for Robinhood Chain",
  description:
    "Institutional clarity for Robinhood Chain. Real-time smart contract telemetry, deterministic risk forensics, and zero-tracking watchlists.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HoodLens — Institutional On-Chain Intelligence for Robinhood Chain",
    description:
      "Institutional clarity for Robinhood Chain. Real-time contract telemetry, zero-speculation risk scoring, and privacy-first watchlists.",
    url: "/",
    siteName: "HoodLens",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "HoodLens — Institutional On-Chain Intelligence for Robinhood Chain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HoodLens — Institutional On-Chain Intelligence for Robinhood Chain",
    description:
      "Institutional clarity for Robinhood Chain. Real-time contract telemetry and deterministic risk forensics.",
    images: ["/opengraph-image.png"],
  },
};

export default async function Home() {
  let trending: RankedToken[] = [];
  let newTokens: RankedToken[] = [];
  let volume: RankedToken[] = [];

  try {
    const explorer = getEnv().ROBINHOOD_EXPLORER_URL;
    [trending, newTokens, volume] = await Promise.all([
      discovery("trending", explorer),
      discovery("new", explorer),
      discovery("volume", explorer),
    ]);
  } catch {}

  return (
    <div className="relative min-h-screen bg-[#080a08] text-on-surface font-sans selection:bg-[#c7ff5b] selection:text-[#080a08] overflow-x-hidden">
      {/* 0. DEDICATED TRANSPARENT LANDING APP BAR WITH JUST LOGO */}
      <LandingHeader />

      <main className="relative z-10 w-full flex flex-col items-center">
        {/* 1. HERO SECTION: EXPANSIVE EDGE-TO-EDGE GLOWING TRENDLINE & L2 TICKER */}
        <LandingHero />

        {/* 2. PLAYGROUND 1: LIVE DISCOVERY RADAR (Interactive filter & liquidity slider) */}
        <DiscoverPlayground
          trending={trending}
          newTokens={newTokens}
          volume={volume}
        />

        {/* 3. LOCAL WATCHLIST PREVIEW */}
        <WatchlistSimulatorPlayground />

        {/* 4. ACTION STAGE */}
        <ActionStage />
      </main>

      {/* 8. MINIMAL INSTITUTIONAL FOOTER */}
      <LandingFooter />
    </div>
  );
}
