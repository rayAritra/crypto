"use client";
/* Remote token artwork uses its native CDN URL and falls back on load failure. */
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

export function TokenAvatar({ address, symbol, size = 40 }: { address: string; symbol: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const ticker = symbol.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const fallback = symbol.trim().slice(0, 2).toUpperCase() || address.slice(2, 4).toUpperCase();
  return <span className={`token-avatar ${failed || !ticker ? "token-avatar-fallback" : ""}`} style={{ width: size, height: size }}>
    {!failed && ticker ? <img src={`https://assets.coincap.io/assets/icons/${ticker}@2x.png`} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)}/> : <span>{fallback}</span>}
  </span>;
}
