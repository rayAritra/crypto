"use client";

import { useAppState } from "@/components/providers/AppState";
import type { RankedToken, Token } from "@/types/token";
import { RiArrowLeftRightLine } from "react-icons/ri";
import { notify } from "./ToastViewport";

export function CompareButton({
  item,
  compact = false,
}: {
  item: RankedToken | { token: Token; metrics: RankedToken["metrics"] };
  compact?: boolean;
}) {
  const state = useAppState();
  const active = state.compare.some(
    (token) => token.address.toLowerCase() === item.token.address.toLowerCase(),
  );
  const atLimit = !active && state.compare.length >= 4;

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 transition-all duration-150 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
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
      disabled={atLimit}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (atLimit) {
          notify("Comparison limit reached (max 4)", "info");
          return;
        }
        state.toggleCompare(item);
        notify(active ? "Removed from comparison" : "Added to comparison");
      }}
      title={
        atLimit
          ? "Maximum four tokens"
          : active
            ? "Remove from comparison"
            : "Add to comparison"
      }
      aria-label={
        atLimit
          ? "Maximum four tokens"
          : active
            ? "Remove from comparison"
            : "Add to comparison"
      }
    >
      <RiArrowLeftRightLine className="text-[16px]" />
      {!compact && <span>{active ? "Queued" : "Compare"}</span>}
    </button>
  );
}
