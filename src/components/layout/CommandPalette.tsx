"use client";

import { useAppState } from "@/components/providers/AppState";
import { shortenAddress } from "@/lib/utils/format";
import type { RankedToken } from "@/types/token";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    FiArrowRight,
    FiClock,
    FiSearch,
    FiTrendingUp,
    FiZap,
} from "react-icons/fi";
import { RiArrowLeftRightLine, RiStarLine } from "react-icons/ri";
import { getAddress, isAddress } from "viem";

type Result = {
  label: string;
  detail: string;
  href: string;
  icon: React.ReactNode;
};

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose(): void;
}) {
  const [q, setQ] = useState("");
  const [remote, setRemote] = useState<RankedToken[]>([]);
  const [active, setActive] = useState(0);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const state = useAppState();

  useEffect(() => {
    if (open) {
      setActive(0);
      setTimeout(() => input.current?.focus(), 20);
    } else {
      setQ("");
    }
  }, [open]);

  useEffect(() => {
    if (q.trim().length < 2 || isAddress(q.trim())) {
      setRemote([]);
      return;
    }
    const c = new AbortController();
    const timer = setTimeout(
      () =>
        fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: c.signal })
          .then((r) => r.json())
          .then((x) => setRemote(x.data ?? []))
          .catch(() => {}),
      220,
    );
    return () => {
      clearTimeout(timer);
      c.abort();
    };
  }, [q]);

  const results = useMemo<Result[]>(() => {
    const address = isAddress(q.trim()) ? getAddress(q.trim()) : null;
    if (address) {
      return [
        {
          label: `Open ${shortenAddress(address)}`,
          detail: "Valid contract address",
          href: `/token/${address}`,
          icon: <FiArrowRight className="text-primary-fixed text-base" />,
        },
      ];
    }
    if (q.trim()) {
      return remote.map((x) => ({
        label: `${x.token.symbol} · ${x.token.name}`,
        detail: shortenAddress(x.token.address),
        href: `/token/${x.token.address}`,
        icon: <FiSearch className="text-outline text-base" />,
      }));
    }
    return [
      ...state.recent.slice(0, 4).map((x) => ({
        label: x.symbol,
        detail: `Recently viewed · ${x.name}`,
        href: `/token/${x.address}`,
        icon: <FiClock className="text-secondary-fixed text-base" />,
      })),
      {
        label: "View Trending",
        detail: "Tokens gaining tracked activity",
        href: "/discover?view=trending",
        icon: <FiTrendingUp className="text-primary-fixed text-base" />,
      },
      {
        label: "View New Tokens",
        detail: "Recently indexed by HoodLens",
        href: "/discover?view=new",
        icon: <FiZap className="text-tertiary-fixed text-base" />,
      },
      {
        label: "Open Watchlist",
        detail: "Your locally saved tokens",
        href: "/watchlist",
        icon: <RiStarLine className="text-secondary text-base" />,
      },
      {
        label: "Compare Tokens",
        detail: "Compare 2–4 tokens",
        href: "/compare",
        icon: <RiArrowLeftRightLine className="text-outline text-base" />,
      },
    ];
  }, [q, remote, state.recent]);

  function go(href: string) {
    router.push(href);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-background/80 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Search HoodLens"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((x) => Math.min(x + 1, results.length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((x) => Math.max(x - 1, 0));
          }
          if (e.key === "Enter" && results[active]) {
            go(results[active].href);
          }
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-outline-variant bg-surface-container/50">
          <FiSearch className="text-outline text-lg shrink-0" />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            placeholder="Search tokens, symbols, or 0x contract addresses…"
            aria-label="Search tokens and commands"
            className="w-full bg-transparent border-none text-on-surface placeholder:text-outline/70 focus:outline-none text-body-md font-sans"
          />
          <kbd className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant text-[11px] font-mono text-outline">
            ESC
          </kbd>
        </div>

        <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
          {results.length ? (
            results.map((r, i) => (
              <button
                key={r.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  i === active
                    ? "bg-surface-container-high text-on-surface border border-outline-variant/80"
                    : "hover:bg-surface-container/60 text-on-surface-variant border border-transparent"
                }`}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r.href)}
              >
                <div className="w-8 h-8 rounded-lg bg-surface-container-lowest border border-outline-variant/60 flex items-center justify-center shrink-0">
                  {r.icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-body-md font-medium text-on-surface truncate">
                    {r.label}
                  </span>
                  <span className="text-data-mono-sm text-outline truncate">
                    {r.detail}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-outline text-body-md">
              <p className="font-medium text-on-surface">
                No indexed token found
              </p>
              <p className="text-body-sm text-outline mt-1">
                Try pasting a full 42-character contract address.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-outline-variant/60 bg-surface-container-lowest text-data-mono-sm text-outline">
          <div className="flex items-center gap-3">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
          </div>
          <span>Robinhood Chain L2</span>
        </div>
      </div>
    </div>
  );
}
