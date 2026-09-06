"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiSearch, FiShield, FiTerminal } from "react-icons/fi";

const TIMEFRAMES = [
  { id: "1M", label: "1M", price: "$1.424", delta: "+1.2%", vol: "$42.8K" },
  { id: "15M", label: "15M", price: "$1.418", delta: "+3.8%", vol: "$184K" },
  { id: "1H", label: "1H", price: "$1.424", delta: "+14.28%", vol: "$1.12M" },
  { id: "1D", label: "1D", price: "$1.390", delta: "+9.4%", vol: "$4.8M" },
  { id: "ALL", label: "ALL", price: "$1.424", delta: "+284.6%", vol: "$14.2M" },
] as const;

export function LandingHero() {
  const [activeTimeframe, setActiveTimeframe] = useState<string>("1H");
  const [blockHeight, setBlockHeight] = useState<number>(4912042);
  const [crosshair, setCrosshair] = useState<{
    visible: boolean;
    x: number;
    y: number;
    svgX: number;
    svgY: number;
    price: string;
    vol: string;
    block: number;
  }>({
    visible: false,
    x: 720,
    y: 45,
    svgX: 720,
    svgY: 45,
    price: "$1.424",
    vol: "$14.2K",
    block: 4912042,
  });

  const svgRef = useRef<SVGSVGElement>(null);

  // Live block ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  function triggerSearch() {
    window.dispatchEvent(new CustomEvent("hoodlens:open-search"));
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = Math.max(
      0,
      Math.min(800, ((e.clientX - rect.left) / rect.width) * 800),
    );
    const prog = relativeX / 800;

    // Approximate the SVG curve Y coordinate for the crosshair dot
    // M 0,190 Q 60,175 120,182 T 240,140 T 360,145 T 480,90 T 600,105 T 720,45 L 800,28
    const simulatedY =
      190 -
      prog * 162 +
      Math.sin(prog * Math.PI * 3.5) * 16 -
      Math.cos(prog * Math.PI * 2) * 8;

    const currentTf =
      TIMEFRAMES.find((t) => t.id === activeTimeframe) || TIMEFRAMES[2];
    const simulatedPrice = (
      1.18 +
      prog * 0.28 +
      Math.sin(prog * 12) * 0.03
    ).toFixed(3);
    const simulatedVol = (0.2 + prog * 1.2).toFixed(1);
    const simulatedBlock = Math.round(blockHeight - (1 - prog) * 420);

    setCrosshair({
      visible: true,
      x: e.clientX - rect.left,
      y: (simulatedY / 220) * rect.height,
      svgX: relativeX,
      svgY: Math.max(15, Math.min(205, simulatedY)),
      price: `$${simulatedPrice}`,
      vol: `$${simulatedVol}K`,
      block: simulatedBlock,
    });
  }

  function handleMouseLeave() {
    setCrosshair((prev) => ({
      ...prev,
      visible: false,
      svgX: 720,
      svgY: 45,
      price: "$1.424",
      vol: "$14.2K",
      block: blockHeight,
    }));
  }

  const selectedTfData =
    TIMEFRAMES.find((t) => t.id === activeTimeframe) || TIMEFRAMES[2];

  return (
    <section className="relative w-full pt-28 sm:pt-32 md:pt-36 pb-20 md:pb-28 px-margin-screen overflow-hidden">
      {/* Background Architectural Grid & Spotlight */}
      <div className="absolute inset-0 bg-micro-grid pointer-events-none opacity-40 z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] hero-spotlight pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* Hero Headline */}
        <h1 className="text-headline-2xl md:text-[72px] md:leading-[62px] font-headline-xl font-bold tracking-tight text-primary max-w-4xl mb-6">
          The clarity standard for <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-on-surface to-primary-fixed">
            on-chain intelligence.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mb-9 leading-relaxed">
          Institutional-grade contract telemetry, unmanipulated DEX liquidity,
          deterministic 100-point risk verification, and real-time wallet
          forensics. Built natively for Robinhood Chain.
        </p>

        {/* CTA Cluster */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-16">
          <Link
            href="/terminal"
            className="px-6 py-3 rounded-xl bg-primary-container hover:bg-secondary-fixed text-on-primary-fixed font-headline-sm text-headline-sm font-bold flex items-center gap-2 transition-all glow-lime active:scale-[0.98] shadow-lg cursor-pointer"
          >
            <FiTerminal className="text-[18px]" />
            <span>Launch HoodLens Terminal</span>
          </Link>

          <button
            type="button"
            onClick={triggerSearch}
            className="px-5 py-3 rounded-xl glass-panel text-on-surface hover:text-primary hover:border-outline transition-all flex items-center gap-2.5 font-headline-sm text-headline-sm cursor-pointer"
          >
            <FiSearch className="text-sm text-primary-fixed" />
            <span>Explore Live Signals</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant text-data-mono-sm font-data-mono-sm text-primary-fixed">
              ⌘K
            </span>
          </button>
        </div>

        {/* 2.1 FLOATING EXPANDED LIVE CHART SHOWCASE CARD (AuthKit Inspired Glass Stack) */}
        <div className="w-full max-w-4xl relative group">
          {/* Subtle ambient under-glow */}
          <div className="absolute -inset-1 bg-gradient-to-b from-primary-fixed/20 via-transparent to-transparent rounded-[20px] blur-xl opacity-40 group-hover:opacity-75 transition duration-700" />

          {/* The Floating Instrument Frame */}
          <div className="relative glass-panel rounded-2xl overflow-hidden border border-outline-variant/60 shadow-2xl text-left">
            {/* Terminal Title Bar */}
            <div className="h-11 px-4 bg-surface-container-lowest/80 border-b border-outline-variant/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f07178]/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e5c07b]/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-fixed/80" />
                </div>
                <div className="h-3.5 w-px bg-outline-variant/60" />
                <Link
                  href="/token/0x71c5000000000000000000000000000000004490"
                  className="flex items-center gap-2 text-data-mono-sm font-data-mono-sm hover:opacity-90 transition-opacity"
                >
                  <span className="text-primary font-bold tracking-wide">
                    $HOOD / USDC
                  </span>
                  <span className="text-on-surface-variant font-normal hidden sm:inline">
                    Robinhood Chain L2 DEX
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#43c98b]/15 text-[#43c98b] text-[10px] font-semibold border border-[#43c98b]/30">
                    +284.6% ATH
                  </span>
                </Link>
              </div>

              {/* Timeframe Tabs */}
              <div className="flex items-center gap-1 bg-surface-container-low px-1.5 py-1 rounded-md border border-outline-variant/50 text-[11px] font-data-mono-sm">
                {TIMEFRAMES.map((tf) => {
                  const isActive = activeTimeframe === tf.id;
                  return (
                    <button
                      key={tf.id}
                      type="button"
                      onClick={() => setActiveTimeframe(tf.id)}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        isActive
                          ? "bg-surface-container text-primary-fixed font-semibold"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {tf.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Chart Display Area */}
            <div className="p-4 sm:p-6 relative bg-gradient-to-b from-[#0e110e]/90 to-[#080a08]/95">
              {/* Crosshair Indicator Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="text-left">
                  <div className="text-[11px] font-label-caps text-on-surface-variant tracking-wider uppercase">
                    CURRENT INDEX PRICE
                  </div>
                  <div className="text-headline-lg font-data-mono-lg font-bold text-primary flex items-baseline gap-2">
                    {crosshair.visible ? crosshair.price : selectedTfData.price}
                    <span className="text-data-mono-sm text-[#43c98b] font-medium">
                      {selectedTfData.delta} 24h
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-left">
                  <div className="px-3 py-1 rounded-lg bg-surface-container-low border border-outline-variant/40">
                    <span className="block text-[10px] font-label-caps text-on-surface-variant">
                      DEPTH LIQUIDITY
                    </span>
                    <span className="text-data-mono-sm font-data-mono-sm font-medium text-on-surface">
                      $840,420 USDC
                    </span>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-surface-container-low border border-outline-variant/40">
                    <span className="block text-[10px] font-label-caps text-on-surface-variant">
                      BYTECODE AUDIT
                    </span>
                    <span className="text-data-mono-sm font-data-mono-sm font-semibold text-primary-fixed">
                      100 / 100 Clean
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Chart Canvas / SVG Area */}
              <div className="relative w-full h-[220px] sm:h-[260px] flex flex-col justify-end">
                {/* SVG Area Curve Chart with Gradient Glow */}
                <svg
                  ref={svgRef}
                  className="w-full h-full overflow-visible cursor-crosshair"
                  preserveAspectRatio="none"
                  viewBox="0 0 800 220"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <defs>
                    <linearGradient
                      id="chartGlow"
                      x1="0%"
                      x2="0%"
                      y1="0%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor="#bdf451"
                        stopOpacity="0.32"
                      />
                      <stop
                        offset="60%"
                        stopColor="#bdf451"
                        stopOpacity="0.05"
                      />
                      <stop
                        offset="100%"
                        stopColor="#bdf451"
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                    <linearGradient
                      id="lineStroke"
                      x1="0%"
                      x2="100%"
                      y1="0%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#43c98b" />
                      <stop offset="65%" stopColor="#bdf451" />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Price Gridlines */}
                  <line
                    stroke="rgba(255,255,255,0.04)"
                    strokeDasharray="3,3"
                    x1="0"
                    x2="800"
                    y1="40"
                    y2="40"
                  />
                  <line
                    stroke="rgba(255,255,255,0.04)"
                    strokeDasharray="3,3"
                    x1="0"
                    x2="800"
                    y1="100"
                    y2="100"
                  />
                  <line
                    stroke="rgba(255,255,255,0.04)"
                    strokeDasharray="3,3"
                    x1="0"
                    x2="800"
                    y1="160"
                    y2="160"
                  />

                  {/* Area Fill */}
                  <path
                    d="M 0,190 Q 60,175 120,182 T 240,140 T 360,145 T 480,90 T 600,105 T 720,45 L 800,28 L 800,220 L 0,220 Z"
                    fill="url(#chartGlow)"
                  />

                  {/* Curve Stroke */}
                  <path
                    d="M 0,190 Q 60,175 120,182 T 240,140 T 360,145 T 480,90 T 600,105 T 720,45 L 800,28"
                    fill="none"
                    stroke="url(#lineStroke)"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  />

                  {/* Vertical Crosshair Line */}
                  <line
                    stroke="rgba(189,244,81,0.35)"
                    strokeDasharray="2,2"
                    x1={crosshair.svgX}
                    x2={crosshair.svgX}
                    y1="0"
                    y2="220"
                  />

                  {/* Active Focus Point Marker */}
                  <circle
                    className="pulse-dot"
                    cx={crosshair.svgX}
                    cy={crosshair.svgY}
                    fill="#bdf451"
                    r="4.5"
                    stroke="#080a08"
                    strokeWidth="2"
                  />
                </svg>

                {/* Tooltip Overlay */}
                <div
                  className="absolute px-3 py-1.5 rounded-lg bg-surface-container-high/95 border border-primary-fixed/40 backdrop-blur-md shadow-xl text-left pointer-events-none transition-all duration-75 z-20"
                  style={{
                    left: `${Math.max(16, Math.min(84, (crosshair.svgX / 800) * 100))}%`,
                    top: "16px",
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="text-[10px] font-label-caps text-on-surface-variant flex items-center gap-1.5">
                    <span>BLOCK #{crosshair.block.toLocaleString()}</span>
                  </div>
                  <div className="text-data-mono-sm font-data-mono-sm text-primary font-bold">
                    {crosshair.price} · Vol{" "}
                    {crosshair.visible ? crosshair.vol : selectedTfData.vol}
                  </div>
                </div>

                {/* Bottom Volume Histogram Sticks */}
                <div className="w-full flex items-end justify-between h-8 pt-2 gap-1 opacity-60">
                  <div className="w-full bg-primary-fixed/20 h-2 rounded-t-sm" />
                  <div className="w-full bg-primary-fixed/30 h-4 rounded-t-sm" />
                  <div className="w-full bg-primary-fixed/20 h-3 rounded-t-sm" />
                  <div className="w-full bg-primary-fixed/40 h-5 rounded-t-sm" />
                  <div className="w-full bg-primary-fixed/25 h-3 rounded-t-sm" />
                  <div className="w-full bg-primary-fixed/50 h-7 rounded-t-sm" />
                  <div className="w-full bg-primary-fixed/30 h-4 rounded-t-sm" />
                  <div className="w-full bg-primary-fixed/70 h-8 rounded-t-sm" />
                  <div className="w-full bg-primary-fixed/80 h-9 rounded-t-sm" />
                  <div className="w-full bg-primary-fixed/90 h-6 rounded-t-sm" />
                </div>
              </div>

              {/* Telemetry Metrics Ribbon Footer */}
              <div className="mt-4 pt-3 border-t border-outline-variant/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
                <div className="px-2 py-1">
                  <span className="block text-[10px] font-label-caps text-outline uppercase tracking-wider">
                    MARKET CAP
                  </span>
                  <span className="text-data-mono-md font-data-mono-md text-on-surface font-semibold">
                    $14,240,000
                  </span>
                </div>
                <div className="px-2 py-1">
                  <span className="block text-[10px] font-label-caps text-outline uppercase tracking-wider">
                    24H VOLUME
                  </span>
                  <span className="text-data-mono-md font-data-mono-md text-on-surface font-semibold">
                    $1,128,450
                  </span>
                </div>
                <div className="px-2 py-1">
                  <span className="block text-[10px] font-label-caps text-outline uppercase tracking-wider">
                    TRACKED POOLS
                  </span>
                  <span className="text-data-mono-md font-data-mono-md text-on-surface font-semibold">
                    2 Verified
                  </span>
                </div>
                <div className="px-2 py-1">
                  <span className="block text-[10px] font-label-caps text-outline uppercase tracking-wider">
                    RISK RATING
                  </span>
                  <span className="text-data-mono-md font-data-mono-md text-primary-fixed font-semibold flex items-center gap-1">
                    <FiShield className="text-[13px]" /> 85/100 (Safe)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pin-Scroll Experience Indicator */}
          <div className="mt-5 flex items-center justify-center gap-2 text-on-surface-variant text-body-sm font-data-mono-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-ping" />
            <span className="tracking-wide text-[11px] text-outline">
              [ Scroll to explore live token trajectory &amp; uncover deep
              contract telemetry ]
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
