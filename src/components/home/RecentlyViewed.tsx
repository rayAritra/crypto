"use client";

import { useAppState } from "@/components/providers/AppState";
import { compactNumber } from "@/lib/utils/format";
import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";

export function RecentlyViewed() {
  const s = useAppState();
  const router = useRouter();

  if (!s.ready || s.recent.length === 0) return null;

  return (
    <section className="mb-space-lg">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-label-caps font-label-caps text-on-surface-variant">
          RECENTLY ANALYZED CONTRACTS
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {s.recent.map((item) => {
          const isPositive = (item.change24h ?? 0) >= 0;
          const priceDisplay =
            item.priceUsd != null ? compactNumber(item.priceUsd, true) : null;

          return (
            <div
              key={item.address}
              onClick={() => router.push(`/token/${item.address}`)}
              className="flex items-center space-x-2 bg-surface-container-low border border-outline-variant px-2.5 py-1 rounded text-body-sm hover:border-outline cursor-pointer transition-colors group"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isPositive ? "bg-tertiary-fixed" : "bg-error"
                }`}
              ></span>
              <span className="font-medium text-primary group-hover:text-primary-fixed transition-colors">
                {item.symbol}
              </span>
              {priceDisplay && (
                <span className="text-data-mono-sm font-data-mono-sm text-outline">
                  {priceDisplay}
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  s.removeRecent(item.address);
                }}
                className="flex items-center text-outline hover:text-primary transition-colors cursor-pointer"
                title={`Remove ${item.symbol}`}
                aria-label={`Remove ${item.symbol}`}
              >
                <FiX className="text-[12px]" />
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => s.clearRecent()}
          className="text-data-mono-sm font-data-mono-sm text-outline hover:text-primary-fixed ml-2 transition-colors cursor-pointer"
        >
          Clear History
        </button>
      </div>
    </section>
  );
}
