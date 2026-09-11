"use client";

import { resolveTokenIconUrl } from "@/lib/market/token-icons";
import { useState } from "react";

const PALETTES = [
  {
    bg: "linear-gradient(135deg, #142a17, #063e18)",
    text: "#c7ff5b",
    border: "rgba(199,255,91,0.28)",
  },
  {
    bg: "linear-gradient(135deg, #092635, #0a3d54)",
    text: "#38bdf8",
    border: "rgba(56,189,248,0.28)",
  },
  {
    bg: "linear-gradient(135deg, #360f1c, #59152b)",
    text: "#fb7185",
    border: "rgba(251,113,133,0.28)",
  },
  {
    bg: "linear-gradient(135deg, #0c2727, #134e4e)",
    text: "#2dd4bf",
    border: "rgba(45,212,191,0.28)",
  },
  {
    bg: "linear-gradient(135deg, #101a38, #1a2c63)",
    text: "#818cf8",
    border: "rgba(129,140,248,0.28)",
  },
  {
    bg: "linear-gradient(135deg, #1e241e, #2b332b)",
    text: "#a3e635",
    border: "rgba(163,230,53,0.28)",
  },
];

function getPalette(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

function normalizeTicker(ticker: string): string {
  const map: Record<string, string> = {
    weth: "eth",
    wbtc: "btc",
    wsol: "sol",
    wavax: "avax",
    wbnb: "bnb",
    rh: "hood",
    robinhood: "hood",
  };
  return map[ticker] || ticker;
}

function renderBuiltinIcon(ticker: string) {
  switch (ticker) {
    case "hood":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#0b110b" />
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="#c7ff5b"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          <path
            d="M16 7.5C11.3 7.5 7.5 11.3 7.5 16C7.5 20.7 16 25.5 16 25.5C16 25.5 24.5 20.7 24.5 16C24.5 11.3 20.7 7.5 16 7.5Z"
            fill="#c7ff5b"
            fillOpacity="0.15"
            stroke="#c7ff5b"
            strokeWidth="1.8"
          />
          <circle cx="16" cy="15.5" r="3.2" fill="#c7ff5b" />
        </svg>
      );
    case "rhx":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#0d140e" />
          <path
            d="M9 13H22L18 9"
            stroke="#c7ff5b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23 19H10L14 23"
            stroke="#43c98b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "lens":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#081018" />
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="#38bdf8"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          <circle cx="16" cy="16" r="8" stroke="#38bdf8" strokeWidth="1.8" />
          <circle cx="16" cy="16" r="3.5" fill="#38bdf8" />
          <path
            d="M16 5V8M16 24V27M5 16H8M24 16H27"
            stroke="#c7ff5b"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "robin":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#180e0e" />
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="#ff5252"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          <path
            d="M11 22C11 22 13 14 19 10C19 10 21 16 15 20L11 22Z"
            fill="#ff5252"
          />
          <path
            d="M14 18C14 18 16 13 21 9C21 9 22 14 18 17L14 18Z"
            fill="#c7ff5b"
          />
        </svg>
      );
    case "eth":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#1c1e24" />
          <path
            d="M16 5.5L15.8 6.1V20.2L16 20.4L22.5 16.5L16 5.5Z"
            fill="#8A92B2"
          />
          <path d="M16 5.5L9.5 16.5L16 20.4V13.5V5.5Z" fill="#62688F" />
          <path
            d="M16 21.6L15.9 21.7V26.2L16 26.5L22.5 17.7L16 21.6Z"
            fill="#8A92B2"
          />
          <path d="M16 26.5V21.6L9.5 17.7L16 26.5Z" fill="#62688F" />
          <path d="M16 20.4L22.5 16.5L16 13.5V20.4Z" fill="#454A75" />
          <path d="M9.5 16.5L16 20.4V13.5L9.5 16.5Z" fill="#52577E" />
        </svg>
      );
    case "btc":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#F7931A" />
          <path
            d="M21.5 13.7C21.8 11.9 20.6 10.9 18.8 10.3L19.3 8.3L18.1 8L17.6 10C17.3 9.9 17 9.8 16.6 9.7L17.1 7.7L15.9 7.4L15.4 9.4C15.1 9.3 14.8 9.3 14.6 9.2L14.6 9.2L13 8.8L12.7 10.1C12.7 10.1 13.6 10.3 13.5 10.3C14 10.4 14.1 10.7 14 11.1L12.9 15.5C13 15.5 12.8 15.5 12.7 15.4C12.6 15.4 12 15.3 12 15.3L11.3 16.8L12.9 17.2C13.2 17.3 13.5 17.4 13.8 17.5L13.3 19.6L14.5 19.9L15 17.8C15.3 17.9 15.6 18 15.9 18.1L15.4 20.1L16.6 20.4L17.1 18.3C19.2 18.7 20.8 18.5 21.6 16.6C22.2 15.1 22.1 14.2 21.5 13.7ZM18.7 16.2C18.3 17.8 15.6 16.9 14.7 16.7L15.3 14.3C16.2 14.5 19.1 14.7 18.7 16.2ZM19.1 12.5C18.8 13.9 16.5 13.2 15.8 13L16.3 10.8C17 11 19.5 11.2 19.1 12.5Z"
            fill="white"
          />
        </svg>
      );
    case "usdt":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#26A17B" />
          <path
            d="M17.4 16.3V14.4C20.6 14.2 23 13.4 23 12.4C23 11.3 20.2 10.4 16.5 10.4C12.8 10.4 10 11.3 10 12.4C10 13.4 12.4 14.2 15.6 14.4V16.3C11.5 16.5 8.5 17.6 8.5 18.9C8.5 20.2 11.8 21.3 16.5 21.3C21.2 21.3 24.5 20.2 24.5 18.9C24.5 17.6 21.5 16.5 17.4 16.3ZM16.5 13.6C13.8 13.6 11.8 13 11.8 12.4C11.8 11.8 13.8 11.2 16.5 11.2C19.2 11.2 21.2 11.8 21.2 12.4C21.2 13 19.2 13.6 16.5 13.6Z"
            fill="white"
          />
          <rect x="15" y="14" width="2" height="11" fill="white" />
          <rect x="11" y="8" width="10" height="2.5" rx="0.5" fill="white" />
        </svg>
      );
    case "usdc":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#2775CA" />
          <circle
            cx="16"
            cy="16"
            r="10"
            stroke="white"
            strokeWidth="1.6"
            strokeDasharray="3 2"
          />
          <path
            d="M16.8 12.2C15.2 12 14.2 12.6 14.2 13.6C14.2 14.6 15 15.1 16.5 15.5C18.5 16.1 19.8 16.8 19.8 18.5C19.8 20.2 18.3 21.3 16.6 21.4V22.5H15.2V21.4C13.8 21.2 12.6 20.4 12.3 19.5L13.8 18.7C14.1 19.4 14.9 19.9 16.1 20C17.4 20.1 18.2 19.6 18.2 18.7C18.2 17.8 17.4 17.3 15.9 16.8C13.9 16.2 12.7 15.4 12.7 13.8C12.7 12.3 14 11.2 15.5 11.1V10H16.8V11.1C18 11.3 18.9 11.9 19.3 12.6L17.8 13.4C17.5 12.9 16.9 12.3 15.8 12.2H16.8Z"
            fill="white"
          />
        </svg>
      );
    case "sol":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#050505" />
          <path d="M9 20.8L12.3 17.5H23L19.7 20.8H9Z" fill="#00FFA3" />
          <path d="M9 14.5L12.3 11.2H23L19.7 14.5H9Z" fill="#DC1FFF" />
          <path d="M19.7 8.2L23 11.5H12.3L9 8.2H19.7Z" fill="#00FFA3" />
        </svg>
      );
    case "dai":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#F5AC37" />
          <path
            d="M10 9H16.2C19.8 9 22.5 11.8 22.5 16C22.5 20.2 19.8 23 16.2 23H10V9ZM12.5 11.2V14.8H18.8V16H12.5V17.2H18.8V18.4H12.5V20.8H16C18.6 20.8 20.3 18.8 20.3 16C20.3 13.2 18.6 11.2 16 11.2H12.5Z"
            fill="white"
          />
        </svg>
      );
    case "bnb":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#F3BA2F" />
          <path
            d="M16 8L18.8 10.8L13.5 16.1L10.7 13.3L16 8ZM21.3 13.3L24.1 16.1L16 24.2L13.2 21.4L18.5 16.1L16 13.6L13.5 16.1L11.8 14.4L16 10.2L20.2 14.4L21.3 13.3ZM8 16.1L10.8 18.9L16 13.6L18.5 16.1L15.7 18.9L16 19.2L20.2 15L16 10.8L11.8 15L8 16.1Z"
            fill="#14151A"
          />
        </svg>
      );
    case "arb":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#28A0F0" />
          <path d="M16 6L24.5 21H19.8L16 14.3L12.2 21H7.5L16 6Z" fill="white" />
        </svg>
      );
    case "op":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#FF0420" />
          <circle
            cx="12.5"
            cy="16"
            r="4.5"
            stroke="white"
            strokeWidth="2.2"
            fill="none"
          />
          <path
            d="M19 11.5H22C24 11.5 25.5 12.8 25.5 14.8C25.5 16.8 24 18.1 22 18.1H20.8V20.5H19V11.5ZM20.8 16.3H21.8C22.8 16.3 23.6 15.7 23.6 14.8C23.6 13.9 22.8 13.3 21.8 13.3H20.8V16.3Z"
            fill="white"
          />
        </svg>
      );
    case "link":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#375BD2" />
          <path
            d="M16 8L22.9 12V20L16 24L9.1 20V12L16 8ZM16 10.6L11.3 13.3V18.7L16 21.4L20.7 18.7V13.3L16 10.6Z"
            fill="white"
          />
        </svg>
      );
    case "uni":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#FF007A" />
          <circle
            cx="16"
            cy="16"
            r="6.5"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="16" cy="16" r="2.8" fill="white" />
        </svg>
      );
    case "pepe":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="16" fill="#439A46" />
          <ellipse cx="12" cy="13" rx="3.5" ry="4" fill="white" />
          <circle cx="12" cy="13" r="2" fill="#111" />
          <ellipse cx="20" cy="13" rx="3.5" ry="4" fill="white" />
          <circle cx="20" cy="13" r="2" fill="#111" />
          <path
            d="M10 21C12 23.5 20 23.5 22 21"
            stroke="#B83A3A"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

export function TokenAvatar({
  address = "",
  symbol = "",
  iconUrl,
  size = 32,
  className = "",
}: {
  address?: string;
  symbol?: string;
  iconUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const cleanSymbol = symbol.replace(/^\$/, "").trim();
  const rawTicker = cleanSymbol.toLowerCase().replace(/[^a-z0-9]/g, "");
  const ticker = normalizeTicker(rawTicker);

  const [imgFailed, setImgFailed] = useState<boolean>(false);
  const [lastPropKey, setLastPropKey] = useState<string>(
    `${address}-${symbol}-${iconUrl ?? ""}`,
  );

  const currentPropKey = `${address}-${symbol}-${iconUrl ?? ""}`;
  if (currentPropKey !== lastPropKey) {
    setLastPropKey(currentPropKey);
    setImgFailed(false);
  }

  // Check if we have a native vector icon
  const builtinIcon = ticker ? renderBuiltinIcon(ticker) : null;

  // Reliable image resolution:
  // 1. Explicit iconUrl prop if provided
  // 2. Fallback to authoritative resolver if no builtin vector icon exists
  const targetImageUrl = !imgFailed
    ? iconUrl || (!builtinIcon ? resolveTokenIconUrl(symbol, address) : null)
    : null;

  const showBuiltin = !targetImageUrl && builtinIcon;

  const palette = getPalette(cleanSymbol || address || "token");
  const initials = (
    cleanSymbol.slice(0, 2) ||
    address.replace(/^0x/, "").slice(0, 2) ||
    "?"
  ).toUpperCase();
  const fontSize = Math.max(8, Math.round(size * 0.4));

  return (
    <span
      className={`token-avatar relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden select-none border border-white/10 ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        background: showBuiltin || targetImageUrl ? "transparent" : palette.bg,
        borderColor:
          showBuiltin || targetImageUrl
            ? "rgba(255,255,255,0.12)"
            : palette.border,
      }}
      title={cleanSymbol || address}
    >
      {showBuiltin ? (
        <span className="w-full h-full flex items-center justify-center pointer-events-none">
          {builtinIcon}
        </span>
      ) : targetImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={targetImageUrl}
          alt={cleanSymbol || "token"}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-full pointer-events-none"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span
          className="font-mono font-bold tracking-tight select-none uppercase pointer-events-none"
          style={{
            fontSize,
            lineHeight: 1,
            color: palette.text,
          }}
        >
          {initials}
        </span>
      )}
    </span>
  );
}
