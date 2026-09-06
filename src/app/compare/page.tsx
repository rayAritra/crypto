import { CompareClient } from "@/components/compare/CompareClient";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Compare — Multi-Token Benchmark Matrix",
  description:
    "Side-by-side multi-asset comparison of market depth, liquidity health, holder concentration, and risk parameters on Robinhood Chain.",
  alternates: {
    canonical: "/compare",
  },
  openGraph: {
    title: "Compare — Multi-Token Benchmark Matrix | HoodLens",
    description:
      "Side-by-side multi-asset comparison of market depth, liquidity health, holder concentration, and risk parameters on Robinhood Chain.",
    url: "/compare",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare — Multi-Token Benchmark Matrix | HoodLens",
    description:
      "Side-by-side multi-asset comparison of market depth, liquidity health, holder concentration, and risk parameters on Robinhood Chain.",
  },
};

export default function Page() {
  return (
    <main className="w-full max-w-[1580px] mx-auto px-margin-screen site-container pt-8 sm:pt-10 pb-12 min-h-[calc(100vh-48px-64px)] flex-1 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-primary tracking-tight">
            Compare Tokens
          </h1>
          <p className="text-body-sm sm:text-body-md text-on-surface-variant max-w-2xl">
            Side-by-side benchmark comparing market depth, liquidity health,
            holder concentration, and transparent risk scores across 2 to 4
            tokens.
          </p>
        </div>

        <div className="flex items-center gap-space-lg text-data-mono-sm font-data-mono-sm text-on-surface-variant py-1">
          <div className="flex items-center gap-1.5">
            <span className="text-outline">Capacity:</span>
            <span className="text-primary font-medium">Up to 4 Tokens</span>
          </div>
          <span className="text-outline">/</span>
          <div className="flex items-center gap-1.5">
            <span className="text-outline">Network:</span>
            <span className="text-primary-fixed font-medium">
              Robinhood Chain
            </span>
          </div>
        </div>
      </div>

      <Suspense fallback={<CompareSkeleton />}>
        <CompareClient />
      </Suspense>
    </main>
  );
}

function CompareSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 space-y-4 animate-pulse">
      <div className="h-14 bg-surface-container-high/40 rounded-lg w-full" />
      <div className="h-64 bg-surface-container-high/20 rounded-lg w-full" />
    </div>
  );
}
