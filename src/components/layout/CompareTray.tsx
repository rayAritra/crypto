"use client";

import { useAppState } from "@/components/providers/AppState";
import { Button } from "@/components/shared/Button";
import { FiArrowRight, FiX } from "react-icons/fi";

export function CompareTray() {
  const s = useAppState();

  if (!s.ready || !s.compare.length) return null;

  const compareUrl =
    s.compare.length >= 2
      ? `/compare?tokens=${s.compare.map((x) => x.address).join(",")}`
      : "/compare";

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <aside className="bg-surface-container-highest/90 backdrop-blur-md border border-outline-variant/60 rounded-full px-3.5 py-1.5 shadow-2xl flex items-center space-x-3 text-body-sm">
        <div className="flex items-center space-x-1.5 max-w-[50vw] overflow-x-auto custom-scrollbar py-0.5">
          {s.compare.map((item) => (
            <div
              key={item.address}
              className="flex items-center space-x-1 bg-surface-container border border-outline-variant/60 rounded-full px-2 py-0.5 text-data-mono-sm whitespace-nowrap"
            >
              <span className="font-medium text-primary">{item.symbol}</span>
              <button
                type="button"
                onClick={() => s.removeCompare(item.address)}
                className="flex items-center justify-center hover:text-primary transition-colors text-outline cursor-pointer"
                title={`Remove ${item.symbol}`}
                aria-label={`Remove ${item.symbol}`}
              >
                <FiX className="text-[12px]" />
              </button>
            </div>
          ))}
        </div>

        <Button
          variant="primary"
          size="xs"
          href={compareUrl}
          icon={<FiArrowRight className="text-[12px]" />}
          iconPosition="right"
          className="rounded-full !px-3 !py-1"
        >
          {s.compare.length < 2 ? "Select 1 more" : "Compare"}
        </Button>
      </aside>
    </div>
  );
}
