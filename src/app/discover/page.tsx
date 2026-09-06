import { DiscoverClient } from "@/components/discover/DiscoverClient";
import { getEnv } from "@/config/env";
import { discovery } from "@/lib/db/queries";
import type { RankedToken } from "@/types/token";
import type { Metadata } from "next";
import { Suspense } from "react";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Discover — Signal Vectors & Token Discovery",
  description:
    "Notable activity, liquidity shifts, and contract telemetry across Robinhood Chain tokens.",
  alternates: {
    canonical: "/discover",
  },
  openGraph: {
    title: "Discover — Signal Vectors & Token Discovery | HoodLens",
    description:
      "Notable activity, liquidity shifts, and contract telemetry across Robinhood Chain tokens.",
    url: "/discover",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover — Signal Vectors & Token Discovery | HoodLens",
    description:
      "Notable activity, liquidity shifts, and contract telemetry across Robinhood Chain tokens.",
  },
};

export default async function DiscoverPage() {
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
    <Suspense
      fallback={
        <div className="flex-1 w-full max-w-[1580px] mx-auto px-margin-screen site-container p-8 text-center text-outline">
          Loading live discovery signals...
        </div>
      }
    >
      <DiscoverClient
        trending={trending}
        newTokens={newTokens}
        volume={volume}
      />
    </Suspense>
  );
}
