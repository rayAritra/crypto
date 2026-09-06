import { DiscoveryTabs } from "@/components/home/DiscoveryTabs";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { TokenSearch } from "@/components/home/TokenSearch";
import { TrendingCards } from "@/components/home/TrendingCards";
import { getEnv } from "@/config/env";
import { discovery } from "@/lib/db/queries";
import { compactNumber } from "@/lib/utils/format";
import type { RankedToken } from "@/types/token";
import Link from "next/link";

export const revalidate = 60;

export default async function Home() {
  let newTokens: RankedToken[] = [];
  let trending: RankedToken[] = [];
  let volume: RankedToken[] = [];

  try {
    const explorer = getEnv().ROBINHOOD_EXPLORER_URL;
    [trending, newTokens, volume] = await Promise.all([
      discovery("trending", explorer),
      discovery("new", explorer),
      discovery("volume", explorer),
    ]);
  } catch {}

  const all = [...trending, ...newTokens, ...volume];
  const unique = [...new Map(all.map((x) => [x.token.address, x])).values()];

  const totalVolumeNumber = unique.reduce(
    (n, x) => n + (x.metrics?.volume24hUsd ?? 0),
    0,
  );
  const activeCountNumber = unique.filter(
    (x) => (x.metrics?.buys24h ?? 0) + (x.metrics?.sells24h ?? 0) > 20,
  ).length;

  const tokensTrackedCount = unique.length;
  const totalVolumeFormatted =
    tokensTrackedCount > 0 ? compactNumber(totalVolumeNumber, true) : "$0";
  const newTodayCount = `+${newTokens.length}`;
  const activeTokensCount = activeCountNumber;

  const topMoving = trending.slice(0, 3);

  return (
    <main className="flex-grow w-full max-w-[1580px] mx-auto px-margin-screen site-container pt-space-lg pb-space-3xl subtle-radial">
      {/* HERO & DESK SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-terminal mb-space-lg">
        {/* Left Hero Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-surface-container-high border border-outline-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-ping"></span>
              <span className="text-label-caps font-label-caps text-on-surface-variant">
                ROBINHOOD CHAIN INTELLIGENCE
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-headline-xl font-headline-xl text-primary tracking-tight">
              See the market.{" "}
              <span className="text-primary-fixed">Read the signal.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-body-lg font-body-lg text-on-surface-variant max-w-xl">
              Live contract intelligence for people who want the full
              picture—price, liquidity, activity, ownership, and transparent
              risk.
            </p>
          </div>

          {/* Contract Search Console */}
          <TokenSearch />
        </div>

        {/* Right Desk Widget: What's Moving (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/60">
                <h3 className="text-headline-sm font-headline-sm text-primary">
                  What&apos;s Moving
                </h3>
                <span className="text-label-caps font-label-caps text-outline">
                  24H ACTIVE
                </span>
              </div>

              {topMoving.length > 0 ? (
                <div className="divide-y divide-outline-variant/30 mt-1">
                  {topMoving.map((item, index) => {
                    const change = item.metrics?.priceChange24h;
                    const isNegative = change != null && change < 0;
                    const priceStr =
                      item.metrics?.priceUsd != null
                        ? item.metrics.priceUsd < 0.01
                          ? `$${item.metrics.priceUsd.toFixed(4)}`
                          : compactNumber(item.metrics.priceUsd, true)
                        : "$0.00";

                    return (
                      <Link
                        key={item.token.address}
                        href={`/token/${item.token.address}`}
                        className="py-2.5 flex items-center justify-between hover:bg-surface-container-high/30 px-1.5 rounded transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-data-mono-sm font-data-mono-sm text-outline">
                            0{index + 1}
                          </span>
                          <div>
                            <div className="font-medium text-primary group-hover:text-primary-fixed transition-colors font-data-mono-md">
                              {item.token.symbol}
                            </div>
                            <div className="text-body-sm text-on-surface-variant text-[11px] truncate max-w-[150px]">
                              {item.token.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-data-mono-md font-data-mono-md text-primary">
                            {priceStr}
                          </div>
                          <div
                            className={`text-data-mono-sm font-data-mono-sm font-semibold ${
                              isNegative ? "text-error" : "text-tertiary-fixed"
                            }`}
                          >
                            {change == null
                              ? "—"
                              : `${change > 0 ? "+" : ""}${change.toFixed(1)}%`}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-on-surface-variant">
                  <p className="text-body-sm font-medium text-primary">
                    No active signals yet
                  </p>
                  <p className="text-body-sm text-outline mt-1 text-[11px]">
                    24h active tokens will be displayed here as on-chain
                    transactions are indexed.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-between text-data-mono-sm font-data-mono-sm text-on-surface-variant mt-2">
              <span>{tokensTrackedCount} Assets</span>
              <span>Vol {totalVolumeFormatted}</span>
            </div>
          </div>
        </div>
      </section>

      {/* PULSE METRICS BAR (4-column stat strip) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-gutter-terminal mb-space-lg">
        <div className="bg-surface-container-low border border-outline-variant/40 rounded-lg p-space-md">
          <div className="text-label-caps font-label-caps text-on-surface-variant">
            TOKENS TRACKED
          </div>
          <div className="text-data-mono-lg font-data-mono-lg text-primary font-bold mt-1">
            {tokensTrackedCount}
          </div>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/40 rounded-lg p-space-md">
          <div className="text-label-caps font-label-caps text-on-surface-variant">
            24H VOLUME
          </div>
          <div className="text-data-mono-lg font-data-mono-lg text-primary font-bold mt-1">
            {totalVolumeFormatted}
          </div>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/40 rounded-lg p-space-md">
          <div className="text-label-caps font-label-caps text-on-surface-variant">
            NEW TODAY
          </div>
          <div className="text-data-mono-lg font-data-mono-lg text-primary-fixed font-bold mt-1">
            {newTodayCount}
          </div>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/40 rounded-lg p-space-md">
          <div className="text-label-caps font-label-caps text-on-surface-variant">
            ACTIVE TOKENS (&gt;20 TX)
          </div>
          <div className="text-data-mono-lg font-data-mono-lg text-primary font-bold mt-1">
            {activeTokensCount}
          </div>
        </div>
      </section>

      {/* TRENDING NOW SECTION */}
      <TrendingCards tokens={trending} totalCount={tokensTrackedCount} />

      {/* EXPLORE TRACKED TOKENS (Interactive Dense Data Table) */}
      <DiscoveryTabs
        trending={trending}
        newTokens={newTokens}
        volume={volume}
      />

      {/* RECENTLY VIEWED STRIP */}
      <RecentlyViewed />
    </main>
  );
}
