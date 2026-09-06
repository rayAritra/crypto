"use client";

import type { RankedToken, Token } from "@/types/token";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

export type SavedToken = Pick<Token, "address" | "name" | "symbol"> & {
  addedAt: string;
  addedPrice: number | null;
};
export type RecentToken = Pick<Token, "address" | "name" | "symbol"> & {
  lastViewedAt: string;
  priceUsd?: number | null;
  change24h?: number | null;
};

type AppStateValue = {
  ready: boolean;
  watchlist: SavedToken[];
  recent: RecentToken[];
  compare: SavedToken[];
  isWatched(address: string): boolean;
  toggleWatch(
    token: RankedToken | { token: Token; metrics: RankedToken["metrics"] },
  ): void;
  addRecent(token: Token, metrics?: RankedToken["metrics"]): void;
  removeRecent(address: string): void;
  clearRecent(): void;
  toggleCompare(
    token: RankedToken | { token: Token; metrics: RankedToken["metrics"] },
  ): void;
  removeCompare(address: string): void;
  clearCompare(): void;
};

const AppState = createContext<AppStateValue | null>(null);
const WATCH = "hoodlens.watchlist.v1",
  RECENT = "hoodlens.recent.v1",
  COMPARE = "hoodlens.compare.v1";

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [watchlist, setWatchlist] = useState<SavedToken[]>([]);
  const [recent, setRecent] = useState<RecentToken[]>([]);
  const [compare, setCompare] = useState<SavedToken[]>([]);

  useEffect(() => {
    setWatchlist(read(WATCH));
    setRecent(read(RECENT));
    setCompare(read(COMPARE));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(WATCH, JSON.stringify(watchlist));
  }, [ready, watchlist]);

  useEffect(() => {
    if (ready) localStorage.setItem(RECENT, JSON.stringify(recent));
  }, [ready, recent]);

  useEffect(() => {
    if (ready) localStorage.setItem(COMPARE, JSON.stringify(compare));
  }, [ready, compare]);

  const toggleWatch = useCallback(
    (item: RankedToken | { token: Token; metrics: RankedToken["metrics"] }) =>
      setWatchlist((current) =>
        current.some(
          (x) => x.address.toLowerCase() === item.token.address.toLowerCase(),
        )
          ? current.filter(
              (x) =>
                x.address.toLowerCase() !== item.token.address.toLowerCase(),
            )
          : [
              ...current,
              {
                address: item.token.address,
                name: item.token.name,
                symbol: item.token.symbol,
                addedAt: new Date().toISOString(),
                addedPrice: item.metrics?.priceUsd ?? null,
              },
            ],
      ),
    [],
  );

  const addRecent = useCallback(
    (token: Token, metrics?: RankedToken["metrics"]) => {
      setRecent((current) =>
        [
          {
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            lastViewedAt: new Date().toISOString(),
            priceUsd: metrics?.priceUsd ?? null,
            change24h: metrics?.priceChange24h ?? null,
          },
          ...current.filter(
            (x) => x.address.toLowerCase() !== token.address.toLowerCase(),
          ),
        ].slice(0, 10),
      );
    },
    [],
  );

  const removeRecent = useCallback((address: string) => {
    setRecent((current) =>
      current.filter((x) => x.address.toLowerCase() !== address.toLowerCase()),
    );
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
  }, []);

  const toggleCompare = useCallback(
    (item: RankedToken | { token: Token; metrics: RankedToken["metrics"] }) =>
      setCompare((current) =>
        current.some(
          (x) => x.address.toLowerCase() === item.token.address.toLowerCase(),
        )
          ? current.filter(
              (x) =>
                x.address.toLowerCase() !== item.token.address.toLowerCase(),
            )
          : current.length >= 4
            ? current
            : [
                ...current,
                {
                  address: item.token.address,
                  name: item.token.name,
                  symbol: item.token.symbol,
                  addedAt: new Date().toISOString(),
                  addedPrice: item.metrics?.priceUsd ?? null,
                },
              ],
      ),
    [],
  );

  const removeCompare = useCallback((address: string) => {
    setCompare((x) => x.filter((item) => item.address !== address));
  }, []);

  const clearCompare = useCallback(() => {
    setCompare([]);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      watchlist,
      recent,
      compare,
      isWatched: (address: string) =>
        watchlist.some(
          (x) => x.address.toLowerCase() === address.toLowerCase(),
        ),
      toggleWatch,
      addRecent,
      removeRecent,
      clearRecent,
      toggleCompare,
      removeCompare,
      clearCompare,
    }),
    [
      ready,
      watchlist,
      recent,
      compare,
      toggleWatch,
      addRecent,
      removeRecent,
      clearRecent,
      toggleCompare,
      removeCompare,
      clearCompare,
    ],
  );

  return <AppState.Provider value={value}>{children}</AppState.Provider>;
}

export function useAppState() {
  const value = useContext(AppState);
  if (!value) throw new Error("AppStateProvider missing");
  return value;
}
