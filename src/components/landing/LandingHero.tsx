"use client";

import { TokenAvatar } from "@/components/shared/TokenAvatar";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { FiArrowRight, FiSearch } from "react-icons/fi";

// Major crypto tokens & ecosystem assets
const CRYPTO_TOKENS = [
  "BTC",
  "ETH",
  "USDT",
  "USDC",
  "HOOD",
  "RHX",
  "SOL",
  "LENS",
  "ARB",
  "OP",
  "LINK",
  "UNI",
  "AVAX",
  "SUI",
  "DAI",
  "BASE",
  "BNB",
  "AAVE",
  "PEPE",
  "MKR",
];

// On-chain & DeFi primitives
const CRYPTO_TERMS = [
  "0x",
  "EVM",
  "GAS",
  "DEX",
  "TPS",
  "L2",
  "RPC",
  "GWEI",
  "MEMPOOL",
  "STAKE",
  "SWAP",
  "DEFI",
  "TVL",
  "TXN",
  "BLOCK",
  "LP",
  "YIELD",
  "NODE",
];

// Micro glyph accents
const CRYPTO_GLYPHS = [
  "0",
  "1",
  "+",
  "·",
  ":",
  "|",
  "x",
  "7",
  "[",
  "]",
  "{",
  "}",
  "//",
  "<>",
  "#",
  "$",
];

interface SpherePoint {
  x: number;
  y: number;
  z: number;
  char: string;
  type: "glyph" | "dot";
  bullseye: boolean;
  seed: number;
}

export function LandingHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Trigger search command palette
  function triggerSearch() {
    window.dispatchEvent(new CustomEvent("hoodlens:open-search"));
  }

  // 3D Rotating Glyph Sphere Engine (Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animId: number;

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = Math.round(rect.width * dpr);
      height = canvas.height = Math.round(rect.height * dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Points structured across concentric latitude rings & longitudinal meridians
    const points: SpherePoint[] = [];
    const numRings = 32;
    const pointsPerRing = 52;

    for (let r = 0; r < numRings; r++) {
      const phi = (Math.PI * (r + 0.5)) / numRings;
      const y = Math.cos(phi);
      const ringRadius = Math.sin(phi);

      for (let p = 0; p < pointsPerRing; p++) {
        const theta = (2 * Math.PI * p) / pointsPerRing;
        const x = ringRadius * Math.cos(theta);
        const z = ringRadius * Math.sin(theta);

        const rand = Math.random();
        let char = "";
        let type: "glyph" | "dot" = "glyph";

        const isBullseyeArea = r >= 5 && r <= 12 && p >= 8 && p <= 18;

        if (isBullseyeArea) {
          // Prominent hero crypto tokens in focal zone
          const focalTokens = [
            "BTC",
            "ETH",
            "USDT",
            "HOOD",
            "RHX",
            "USDC",
            "L2",
            "EVM",
            "GAS",
            "TPS",
          ];
          char = focalTokens[Math.floor(Math.random() * focalTokens.length)];
          type = "glyph";
        } else if (rand > 0.82) {
          type = "dot";
        } else if (rand < 0.34) {
          char =
            CRYPTO_TOKENS[Math.floor(Math.random() * CRYPTO_TOKENS.length)];
        } else if (rand < 0.64) {
          char = CRYPTO_TERMS[Math.floor(Math.random() * CRYPTO_TERMS.length)];
        } else {
          char =
            CRYPTO_GLYPHS[Math.floor(Math.random() * CRYPTO_GLYPHS.length)];
        }

        points.push({
          x,
          y,
          z,
          char,
          type,
          bullseye: isBullseyeArea,
          seed: Math.random(),
        });
      }
    }

    let angleY = 0.4;
    const angleX = 0.22;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    const rotSpeed = 0.0032;

    const onMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      targetMouseX = mx * 0.3;
      targetMouseY = my * 0.2;
    };

    window.addEventListener("mousemove", onMouseMove);

    const render = () => {
      if (!ctx || width === 0 || height === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const centerX = width / 2;

      // Shifted slightly downwards to align behind hero content and search console
      const centerY = height * 0.52;

      currentMouseX += (targetMouseX - currentMouseX) * 0.04;
      currentMouseY += (targetMouseY - currentMouseY) * 0.04;

      angleY += rotSpeed;
      const finalAngleY = angleY + currentMouseX;
      const finalAngleX = angleX + currentMouseY;

      const cosY = Math.cos(finalAngleY);
      const sinY = Math.sin(finalAngleY);
      const cosX = Math.cos(finalAngleX);
      const sinX = Math.sin(finalAngleX);

      // Sizing: slightly enlarged bounds for more immersive prominence
      const maxAllowedRadiusByHeight = height * 0.43;
      const maxAllowedRadiusByWidth = width * 0.49;
      const baseRadius = Math.min(
        maxAllowedRadiusByWidth,
        maxAllowedRadiusByHeight,
      );

      const fov = 540 * dpr;
      const projected: Array<{
        px: number;
        py: number;
        depth: number;
        z: number;
        char: string;
        type: "glyph" | "dot";
        bullseye: boolean;
        seed: number;
      }> = [];

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const px0 = pt.x * baseRadius;
        const py0 = pt.y * baseRadius;
        const pz0 = pt.z * baseRadius;

        const x1 = px0 * cosY + pz0 * sinY;
        const z1 = -px0 * sinY + pz0 * cosY;
        const y2 = py0 * cosX - z1 * sinX;
        const z2 = py0 * sinX + z1 * cosX;

        const depth = fov / (fov + z2 * 0.75 + 160 * dpr);

        if (depth > 0) {
          projected.push({
            px: centerX + x1 * depth,
            py: centerY + y2 * depth,
            depth,
            z: z2,
            char: pt.char,
            type: pt.type,
            bullseye: pt.bullseye,
            seed: pt.seed,
          });
        }
      }

      projected.sort((a, b) => a.z - b.z);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const alpha = Math.max(0.06, Math.min(0.96, (p.depth - 0.42) * 1.6));

        const isWhite = p.seed > 0.88 && p.depth > 0.88;
        const isLime = p.bullseye || (p.seed > 0.4 && p.depth > 0.65);
        const isEmerald = p.seed > 0.16;

        let fillStyle = `rgba(162, 215, 54, ${alpha * 0.55})`;
        if (isWhite) {
          fillStyle = `rgba(255, 255, 255, ${alpha * 0.98})`;
        } else if (isLime) {
          fillStyle = `rgba(199, 255, 91, ${alpha * 0.92})`;
        } else if (isEmerald) {
          fillStyle = `rgba(67, 201, 139, ${alpha * 0.85})`;
        }

        ctx.fillStyle = fillStyle;

        if (p.type === "dot") {
          ctx.beginPath();
          const r = Math.max(0.8, p.depth * 1.6 * dpr);
          ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const fontSize = Math.max(6.5 * dpr, Math.floor(10 * p.depth * dpr));
          ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
          ctx.fillText(p.char, p.px, p.py);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section className="relative w-full min-h-[740px] sm:min-h-[800px] md:min-h-[860px] flex flex-col items-center justify-center pt-14 sm:pt-16 md:pt-20 pb-12 sm:pb-16 md:pb-20 px-3 sm:px-margin-screen overflow-hidden selection:bg-[#c7ff5b] selection:text-[#080a08]">
      {/* Background Micro-Grid */}
      <div className="absolute inset-0 bg-micro-grid pointer-events-none opacity-40 z-0" />

      {/* Interactive 3D Canvas Background Sphere (~80% screen height, vertically centered with bottom clearance) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full max-w-[1600px] max-h-[1000px] opacity-90"
        />
        {/* Soft radial vignette overlay blending sphere edges into background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 52%, transparent 30%, rgba(8, 10, 8, 0.45) 65%, #080a08 95%)",
          }}
        />
      </div>

      {/* HERO TEXT & INTRO CLUSTER (Vertically centered with top and bottom breathing room) */}
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10 my-auto py-4">
        {/* Eyebrow Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/80 border border-outline-variant/80 backdrop-blur-md mb-4 shadow-sm">
          <Image
            src="/logo/hoodlens-mark-cyan.png"
            alt="HoodLens Radar"
            width={16}
            height={16}
            className="w-4 h-4 object-contain animate-pulse select-none"
          />
          <span className="text-[11px] font-data-mono-sm font-semibold tracking-wider text-primary-fixed uppercase">
            Robinhood Chain Telemetry
          </span>
        </div>

        {/* Hero Headline - Styled with HTML Impact Typography & Brand Green Accent */}
        <h1 className="text-[28px] min-[380px]:text-[28px] sm:text-[34px] md:text-[42px] lg:text-[60px] leading-[0.95] font-headline-xl font-extrabold tracking-[-0.04em] text-white uppercase max-w-5xl mb-4 select-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] px-2 sm:px-0">
          THE CLARITY STANDARD FOR <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-primary-fixed font-black">
            ON-CHAIN INTELLIGENCE
            <span className="inline-block w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-primary-fixed ml-1 sm:ml-1.5 align-baseline" />
          </span>
        </h1>

        {/* Hero Subtitle - Styled with HTML Body Typography */}
        <p className="text-sm sm:text-body-md md:text-body-lg font-body-lg text-on-surface-variant/90 max-w-2xl sm:max-w-3xl mb-7 sm:mb-8 font-normal leading-relaxed px-2 sm:px-0">
          Institutional-grade contract telemetry, unmanipulated DEX liquidity,
          deterministic 100-point risk verification, and real-time wallet
          forensics. Built natively for Robinhood Chain.
        </p>

        {/* Quick Search Bar in the middle of hero - Rounded Glass Panel */}
        <div className="w-full max-w-lg mb-7 sm:mb-8 px-2 sm:px-0">
          <div
            onClick={triggerSearch}
            className="w-full bg-[#0e110e]/85 backdrop-blur-xl p-2.5 sm:p-3 rounded-2xl border border-outline-variant/70 hover:border-primary-fixed/50 shadow-[0_16px_40px_rgba(0,0,0,0.7)] flex items-center gap-3 transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="w-8 h-8 rounded-xl bg-primary-fixed/10 border border-primary-fixed/20 flex items-center justify-center text-primary-fixed group-hover:scale-105 transition-transform shrink-0">
              <FiSearch className="text-sm" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-xs sm:text-sm font-data-mono-sm font-medium text-white/90 truncate">
                Search Robinhood Chain tokens or 0x contract...
              </div>
              <div className="text-[10px] font-data-mono-sm text-outline truncate flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-white/80">
                  <TokenAvatar
                    symbol="HOOD"
                    address="0x71c5000000000000000000000000000000004490"
                    size={13}
                  />
                  <span>$HOOD</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-white/80">
                  <TokenAvatar
                    symbol="RHX"
                    address="0x892a00000000000000000000000000000000103f"
                    size={13}
                  />
                  <span>$RHX</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-white/80">
                  <TokenAvatar
                    symbol="LENS"
                    address="0x3310000000000000000000000000000000008821"
                    size={13}
                  />
                  <span>$LENS</span>
                </span>
                <span className="hidden min-[420px]:inline text-outline">
                  • paste L2 contract
                </span>
              </div>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-container-high border border-outline-variant text-xs font-data-mono-sm font-bold text-primary-fixed shrink-0">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Action Button Cluster - Styled with HTML Composite & Ghost buttons with rounded-xl */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-xs sm:max-w-none px-2 sm:px-0">
          {/* Composite Brand Green Anchor + White Action Button with rounded-xl */}
          <Link
            href="/terminal"
            className="w-full sm:w-auto inline-flex items-stretch rounded-xl overflow-hidden shadow-2xl transition-transform active:scale-[0.98] group cursor-pointer border border-primary-fixed/30 hover:border-primary-fixed glow-lime"
          >
            <div className="bg-primary-fixed group-hover:bg-[#d8ff85] text-[#080a08] px-3.5 py-3.5 flex items-center justify-center transition-colors shrink-0">
              <Image
                src="/logo/hoodlens-mark-black.png"
                alt="HoodLens"
                width={18}
                height={18}
                className="w-4.5 h-4.5 object-contain select-none"
              />
            </div>
            <div className="bg-white group-hover:bg-[#f2f2f2] text-black font-data-mono-sm font-bold text-[12px] sm:text-[13px] tracking-wider uppercase px-5 py-3.5 flex items-center justify-center gap-2 flex-1 transition-colors whitespace-nowrap">
              <span>LAUNCH COMPUTE TERMINAL</span>
              <FiArrowRight className="text-[14px] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Secondary Ghost Action Button with rounded-xl */}
          <button
            type="button"
            onClick={triggerSearch}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#0e110e]/80 hover:bg-[#141814] text-on-surface hover:text-white border border-outline-variant hover:border-primary-fixed/40 transition-all font-data-mono-sm text-[12px] sm:text-[13px] tracking-wider uppercase flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] shadow-lg"
          >
            <span>EXPLORE SIGNALS</span>
            <span className="px-1.5 py-0.5 rounded-md bg-surface-container text-[10px] text-primary-fixed border border-outline-variant font-bold">
              ⌘K
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
