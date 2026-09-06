import { WatchlistClient } from "@/components/watchlist/WatchlistClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watchlist — Private Local-First Portfolio Telemetry",
  description:
    "Monitor tokens saved locally in your browser. Real-time telemetry, risk tracking, and zero-tracking privacy on Robinhood Chain.",
  alternates: {
    canonical: "/watchlist",
  },
  openGraph: {
    title: "Watchlist — Private Local-First Portfolio Telemetry | HoodLens",
    description:
      "Monitor tokens saved locally in your browser. Real-time telemetry, risk tracking, and zero-tracking privacy on Robinhood Chain.",
    url: "/watchlist",
  },
  twitter: {
    card: "summary_large_image",
    title: "Watchlist — Private Local-First Portfolio Telemetry | HoodLens",
    description:
      "Monitor tokens saved locally in your browser. Real-time telemetry, risk tracking, and zero-tracking privacy on Robinhood Chain.",
  },
};

export default function Page() {
  return (
    <main className="w-full max-w-[1580px] mx-auto px-margin-screen site-container pt-8 sm:pt-10 pb-12 min-h-[calc(100vh-48px-64px)] flex-1 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-primary tracking-tight">
            Watchlist
          </h1>
          <p className="text-body-sm sm:text-body-md text-on-surface-variant max-w-2xl">
            Locally saved tokens and market telemetry on Robinhood Chain. Zero
            remote profiling or external account tracking.
          </p>
        </div>

        <div className="flex items-center gap-space-lg text-data-mono-sm font-data-mono-sm text-on-surface-variant py-1">
          <div className="flex items-center gap-1.5">
            <span className="text-outline">Storage:</span>
            <span className="text-primary font-medium">Local Browser</span>
          </div>
          <span className="text-outline">/</span>
          <div className="flex items-center gap-1.5">
            <span className="text-outline">Telemetry:</span>
            <span className="text-primary-fixed font-medium">Live Indexer</span>
          </div>
        </div>
      </div>

      <WatchlistClient />
    </main>
  );
}
