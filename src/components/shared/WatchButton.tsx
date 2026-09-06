"use client";

import { useAppState } from "@/components/providers/AppState";
import type { RankedToken, Token } from "@/types/token";
import { RiStarFill, RiStarLine } from "react-icons/ri";
import { notify } from "./ToastViewport";

export function WatchButton({
  item,
  compact = false,
}: {
  item: RankedToken | { token: Token; metrics: RankedToken["metrics"] };
  compact?: boolean;
}) {
  const state = useAppState();
  const active = state.isWatched(item.token.address);

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 transition-all duration-150 rounded-lg cursor-pointer ${
        compact
          ? `p-1.5 ${
              active
                ? "text-primary-fixed hover:text-surface-tint"
                : "text-outline hover:text-on-surface"
            }`
          : `px-3 py-1.5 text-body-sm font-medium border ${
              active
                ? "bg-primary-fixed/10 border-primary-fixed/40 text-primary-fixed hover:bg-primary-fixed/20"
                : "bg-surface-container-high border-outline-variant/60 text-on-surface hover:bg-surface-container-highest hover:border-outline"
            }`
      }`}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        state.toggleWatch(item);
        notify(active ? "Removed from watchlist" : "Added to watchlist");
      }}
      title={active ? "Remove from watchlist" : "Add to watchlist"}
      aria-label={active ? "Remove from watchlist" : "Add to watchlist"}
    >
      {active ? (
        <RiStarFill className="text-[16px] text-primary-fixed" />
      ) : (
        <RiStarLine className="text-[16px]" />
      )}
      {!compact && <span>{active ? "Watching" : "Watch"}</span>}
    </button>
  );
}
