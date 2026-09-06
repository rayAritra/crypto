import { compactNumber } from "@/lib/utils/format";
import type { RankedToken } from "@/types/token";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export function TrendingCards({
  tokens,
  totalCount = 0,
}: {
  tokens: RankedToken[];
  totalCount?: number;
}) {
  const displayTokens = tokens.slice(0, 3);

  return (
    <section className="mb-space-lg">
      <div className="flex items-center justify-between mb-space-sm">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>
          <h2 className="text-headline-sm font-headline-sm text-primary">
            Trending Tokens
          </h2>
        </div>
        <Link
          className="text-data-mono-sm font-data-mono-sm text-primary-fixed hover:underline flex items-center"
          href="/discover?view=trending"
        >
          View all {totalCount > 0 ? totalCount : ""}
          <FiArrowRight className="text-[12px] ml-1" />
        </Link>
      </div>

      {displayTokens.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-8 text-center text-on-surface-variant">
          <p className="text-headline-sm font-semibold text-primary">
            No trending tokens indexed yet
          </p>
          <p className="text-body-sm text-outline mt-1.5 max-w-lg mx-auto">
            Live contract rankings update dynamically based on 24h trading
            activity, liquidity depth, and on-chain momentum.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-terminal">
          {displayTokens.map((item, index) => {
            const change = item.metrics?.priceChange24h;
            const isNegative = change != null && change < 0;
            const score = item.risk?.score ?? 80;
            const riskLevel =
              score >= 80 ? "Low" : score >= 60 ? "Moderate" : "High";
            const riskColor =
              score >= 80
                ? "text-tertiary-fixed"
                : score >= 60
                  ? "text-secondary-fixed"
                  : "text-error";

            return (
              <Link
                key={item.token.address}
                href={`/token/${item.token.address}`}
                className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-space-md hover:border-primary-fixed/40 transition-all duration-150 block group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-headline-sm font-headline-sm text-primary group-hover:text-primary-fixed transition-colors font-semibold">
                        {item.token.symbol}
                      </h3>
                      <span className="text-data-mono-sm font-data-mono-sm text-outline">
                        {`0${index + 1}`}
                      </span>
                    </div>
                    <div className="text-body-sm text-on-surface-variant mt-0.5 truncate max-w-[160px]">
                      {item.token.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-data-mono-lg font-data-mono-lg text-primary font-semibold">
                      {item.metrics?.priceUsd != null
                        ? compactNumber(item.metrics.priceUsd, true)
                        : "$0.00"}
                    </div>
                    <div
                      className={`text-data-mono-sm font-data-mono-sm font-semibold ${
                        isNegative ? "text-error" : "text-tertiary-fixed"
                      }`}
                    >
                      {change == null
                        ? "—"
                        : `${change > 0 ? "+" : ""}${change.toFixed(2)}%`}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-space-md pt-space-sm border-t border-outline-variant/40 text-data-mono-sm font-data-mono-sm">
                  <div>
                    <span className="text-outline">24h Vol</span>
                    <span className="text-primary ml-1">
                      {compactNumber(item.metrics?.volume24hUsd ?? 0, true)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-outline">Liquidity</span>
                    <span className="text-primary ml-1">
                      {compactNumber(item.metrics?.liquidityUsd ?? 0, true)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-data-mono-sm font-data-mono-sm">
                  <span className="text-outline text-[11px]">Risk Score</span>
                  <span className={`${riskColor} font-semibold`}>
                    {score} · {riskLevel}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
