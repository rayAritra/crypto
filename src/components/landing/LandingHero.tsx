"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiSearch, FiShield, FiTerminal } from "react-icons/fi";

const TIMEFRAMES = [
  {
    id: "1M",
    label: "1M",
    value: "48.2 TPS",
    delta: "+1.2%",
    blockTime: "0.80s",
    gas: "0.001 Gwei",
  },
  {
    id: "15M",
    label: "15M",
    value: "52.6 TPS",
    delta: "+3.8%",
    blockTime: "0.78s",
    gas: "0.001 Gwei",
  },
  {
    id: "1H",
    label: "1H",
    value: "58.4 TPS",
    delta: "+14.28%",
    blockTime: "0.75s",
    gas: "0.002 Gwei",
  },
  {
    id: "1D",
    label: "1D",
    value: "46.1 TPS",
    delta: "+9.4%",
    blockTime: "0.82s",
    gas: "0.001 Gwei",
  },
  {
    id: "ALL",
    label: "ALL",
    value: "58.4 TPS",
    delta: "+284.6%",
    blockTime: "0.75s",
    gas: "0.001 Gwei",
  },
] as const;

export function LandingHero() {
  const [activeTimeframe, setActiveTimeframe] = useState<string>("1H");
  const [blockHeight, setBlockHeight] = useState<number>(4912042);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // 3D Card Holographic Tilt State
  const [tilt, setTilt] = useState<{
    rotateX: number;
    rotateY: number;
    glareX: number;
    glareY: number;
    glareOpacity: number;
  }>({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
  });

  const [crosshair, setCrosshair] = useState<{
    visible: boolean;
    x: number;
    y: number;
    svgX: number;
    svgY: number;
    tps: string;
    gas: string;
    block: number;
  }>({
    visible: false,
    x: 800,
    y: 32,
    svgX: 800,
    svgY: 32,
    tps: "58.4 TPS",
    gas: "0.001 Gwei",
    block: 4912042,
  });

  const cardContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Live block ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  // Continuous ambient drift (2x faster while idle) + calm proportional scroll angle
  useEffect(() => {
    let animId: number;
    let idleAngle = 0;

    const loop = () => {
      // 2x faster idle drift speed (~0.70 deg/frame = ~42 deg/sec)
      idleAngle += 0.7;
      // Calm, strictly proportional scroll angle (0.12 deg per pixel of scroll)
      const scrollOffset =
        (typeof window !== "undefined" ? window.scrollY : 0) * 0.12;

      setRotationAngle(idleAngle + scrollOffset);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  function triggerSearch() {
    window.dispatchEvent(new CustomEvent("hoodlens:open-search"));
  }

  // 3D Tilt handler on the chart card container
  function handleCardMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardContainerRef.current) return;
    const rect = cardContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({
      rotateX,
      rotateY,
      glareX,
      glareY,
      glareOpacity: 0.2,
    });
  }

  function handleCardMouseLeave() {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      glareOpacity: 0,
    });
  }

  // SVG Chart Crosshair Scrubbing (Deterministic Network Telemetry)
  function handleChartMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = Math.max(
      0,
      Math.min(800, ((e.clientX - rect.left) / rect.width) * 800),
    );
    const prog = relativeX / 800;

    // Smooth ascending trajectory matching: M 0,185 C 160,180 260,145 400,135 C 540,125 640,65 800,32
    const simulatedY = 185 - prog * 153 + Math.sin(prog * Math.PI) * -12;

    const simulatedTps = (
      42.0 +
      prog * 16.4 +
      Math.sin(prog * 12) * 1.2
    ).toFixed(1);
    const simulatedGas = (0.001 + (1 - prog) * 0.0005).toFixed(4);
    const simulatedBlock = Math.round(blockHeight - (1 - prog) * 420);

    setCrosshair({
      visible: true,
      x: e.clientX - rect.left,
      y: (simulatedY / 220) * rect.height,
      svgX: relativeX,
      svgY: Math.max(15, Math.min(205, simulatedY)),
      tps: `${simulatedTps} TPS`,
      gas: `${simulatedGas} Gwei`,
      block: simulatedBlock,
    });
  }

  function handleChartMouseLeave() {
    setCrosshair((prev) => ({
      ...prev,
      visible: false,
      svgX: 800,
      svgY: 32,
      tps: "58.4 TPS",
      gas: "0.001 Gwei",
      block: blockHeight,
    }));
  }

  const selectedTfData =
    TIMEFRAMES.find((t) => t.id === activeTimeframe) || TIMEFRAMES[2];

  return (
    <section className="relative w-full pt-20 sm:pt-24 pb-8 sm:pb-12 px-margin-screen overflow-visible selection:bg-[#c7ff5b] selection:text-[#080a08]">
      {/* Background Micro-Grid & Top Ambient Spotlight */}
      <div className="absolute inset-0 bg-micro-grid pointer-events-none opacity-40 z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[560px] hero-spotlight pointer-events-none z-0" />

      {/* 1. HERO TEXT & INTRO CLUSTER (Static Layout) */}
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant text-on-surface-variant mb-5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary-fixed pulse-dot" />
          <span className="text-label-caps font-label-caps tracking-widest uppercase text-primary-fixed">
            INTRODUCING HOODLENS
          </span>
          <span className="text-outline">/</span>
          <span className="text-body-sm font-body-sm text-on-surface">
            Robinhood Chain Intelligence
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-headline-xl sm:text-4xl md:text-[56px] md:leading-[62px] font-headline-xl font-bold tracking-tight text-primary max-w-4xl mb-5">
          The clarity standard for <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-on-surface to-primary-fixed">
            on-chain intelligence.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mb-7 leading-relaxed">
          Institutional-grade contract telemetry, unmanipulated DEX liquidity,
          deterministic 100-point risk verification, and real-time wallet
          forensics. Built natively for Robinhood Chain.
        </p>

        {/* CTA Button Cluster */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-10 sm:mb-12">
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
      </div>

      {/* 2. STATIC FLOATING LIVE CHART CARD WITH UNIFORM ROTATING GREEN BACKLIGHT (Layered at z-20) */}
      <div
        ref={cardContainerRef}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        className="w-full max-w-4xl mx-auto relative z-20 group perspective-[1200px]"
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
          transition: "transform 0.12s ease-out",
        }}
      >
        {/* ROTATING 360-DEGREE GREEN BACKLIGHT (Borderless, ultra-diffused, uniform on all sides with visible scroll dynamics) */}
        <div
          className="absolute -inset-20 sm:-inset-28 pointer-events-none z-0 flex items-center justify-center overflow-visible will-change-transform"
          style={{
            transform: `rotate(${rotationAngle}deg)`,
          }}
        >
          {/* Base 360° Core Ambient Halo — Continuous uniform illumination on ALL sides */}
          <div
            className="absolute inset-2 sm:inset-4 rounded-full pointer-events-none opacity-80"
            style={{
              background:
                "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(199, 255, 91, 0.38) 0%, rgba(67, 201, 139, 0.22) 45%, transparent 75%)",
              filter: "blur(80px)",
            }}
          />

          {/* 4 Harmonious Geometrical Cardinal Beacons (Top, Right, Bottom, Left at exact 90° intervals) */}
          {/* Top Beacon - Lime */}
          <div
            className="absolute -top-12 left-1/2 -translate-x-1/2 w-[360px] h-[360px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(199, 255, 91, 0.52) 0%, rgba(67, 201, 139, 0.22) 40%, transparent 75%)",
              filter: "blur(85px)",
            }}
          />

          {/* Right Beacon - Emerald */}
          <div
            className="absolute top-1/2 -right-12 -translate-y-1/2 w-[360px] h-[360px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(67, 201, 139, 0.48) 0%, rgba(199, 255, 91, 0.22) 40%, transparent 75%)",
              filter: "blur(85px)",
            }}
          />

          {/* Bottom Beacon - Lime */}
          <div
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[360px] h-[360px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(199, 255, 91, 0.52) 0%, rgba(67, 201, 139, 0.22) 40%, transparent 75%)",
              filter: "blur(85px)",
            }}
          />

          {/* Left Beacon - Emerald */}
          <div
            className="absolute top-1/2 -left-12 -translate-y-1/2 w-[360px] h-[360px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(67, 201, 139, 0.48) 0%, rgba(199, 255, 91, 0.22) 40%, transparent 75%)",
              filter: "blur(85px)",
            }}
          />

          {/* 4 Diagonal Harmonious Nodes for Dense, Symmetrical 360° Flow */}
          <div
            className="absolute top-0 right-6 w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(199, 255, 91, 0.42) 0%, transparent 75%)",
              filter: "blur(80px)",
            }}
          />
          <div
            className="absolute bottom-0 right-6 w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(67, 201, 139, 0.40) 0%, transparent 75%)",
              filter: "blur(80px)",
            }}
          />
          <div
            className="absolute bottom-0 left-6 w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(199, 255, 91, 0.42) 0%, transparent 75%)",
              filter: "blur(80px)",
            }}
          />
          <div
            className="absolute top-0 left-6 w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(67, 201, 139, 0.40) 0%, transparent 75%)",
              filter: "blur(80px)",
            }}
          />
        </div>

        {/* Top Laser Horizon Rim Glow on Card Edge */}
        <div className="absolute -top-[1px] left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#c7ff5b] to-transparent shadow-[0_0_20px_#c7ff5b,0_0_40px_#43c98b] z-30 pointer-events-none" />

        {/* Dynamic Specular Holographic Glare Layer */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 380px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.14) 0%, rgba(199, 255, 91, 0.08) 40%, transparent 80%)`,
            opacity: tilt.glareOpacity,
          }}
        />

        {/* Symmetrical Uniform Ambient Under-Glow Halo (Ultra-soft, zero border) */}
        <div
          className="absolute -inset-6 rounded-3xl pointer-events-none opacity-60 group-hover:opacity-85 transition duration-700"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(199, 255, 91, 0.25) 0%, rgba(67, 201, 139, 0.18) 50%, transparent 80%)",
            filter: "blur(60px)",
          }}
        />

        {/* The Floating Instrument Frame */}
        <div className="relative glass-panel rounded-2xl overflow-hidden border border-outline-variant/70 text-left bg-[#0c0f0c]/95 backdrop-blur-2xl z-20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.95),0_0_25px_rgba(199,255,91,0.1)]">
          {/* Terminal Title Bar */}
          <div className="h-11 px-4 bg-surface-container-lowest/90 border-b border-outline-variant/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f07178]/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#e5c07b]/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-primary-fixed/90" />
              </div>
              <div className="h-3.5 w-px bg-outline-variant/60" />
              <div className="flex items-center gap-2 text-data-mono-sm font-data-mono-sm">
                <span className="text-primary font-bold tracking-wide">
                  ROBINHOOD CHAIN L2
                </span>
                <span className="text-on-surface-variant font-normal hidden sm:inline">
                  Network Telemetry & Throughput
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#43c98b]/15 text-[#43c98b] text-[10px] font-semibold border border-[#43c98b]/30">
                  MAINNET LIVE
                </span>
              </div>
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
          <div className="p-4 sm:p-6 relative bg-gradient-to-b from-[#0e110e]/95 to-[#080a08]/98">
            {/* Crosshair Indicator Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="text-left">
                <div className="text-[11px] font-label-caps text-on-surface-variant tracking-wider uppercase">
                  NETWORK THROUGHPUT (TPS)
                </div>
                <div className="text-headline-lg font-data-mono-lg font-bold text-primary flex items-baseline gap-2">
                  {crosshair.visible ? crosshair.tps : selectedTfData.value}
                  <span className="text-data-mono-sm text-[#43c98b] font-medium">
                    {selectedTfData.delta} peak
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-left">
                <div className="px-3 py-1 rounded-lg bg-surface-container-low border border-outline-variant/40">
                  <span className="block text-[10px] font-label-caps text-on-surface-variant">
                    AVG BLOCK TIME
                  </span>
                  <span className="text-data-mono-sm font-data-mono-sm font-medium text-on-surface">
                    {selectedTfData.blockTime}
                  </span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-surface-container-low border border-outline-variant/40">
                  <span className="block text-[10px] font-label-caps text-on-surface-variant">
                    CONSENSUS HEALTH
                  </span>
                  <span className="text-data-mono-sm font-data-mono-sm font-semibold text-primary-fixed">
                    100% Active Validators
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Chart Canvas / SVG Area */}
            <div className="relative w-full h-[220px] sm:h-[260px] flex flex-col justify-end">
              {/* Clean Symmetrical Area Curve Chart */}
              <svg
                ref={svgRef}
                className="w-full h-full overflow-visible cursor-crosshair"
                preserveAspectRatio="none"
                viewBox="0 0 800 220"
                onMouseMove={handleChartMouseMove}
                onMouseLeave={handleChartMouseLeave}
              >
                <defs>
                  <linearGradient
                    id="heroChartGlow"
                    x1="0%"
                    x2="0%"
                    y1="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#c7ff5b" stopOpacity="0.30" />
                    <stop offset="60%" stopColor="#c7ff5b" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#c7ff5b" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient
                    id="heroLineStroke"
                    x1="0%"
                    x2="100%"
                    y1="0%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#43c98b" />
                    <stop offset="50%" stopColor="#c7ff5b" />
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

                {/* Smooth Clean Ascending Area Fill */}
                <path
                  d="M 0,185 C 160,180 260,145 400,135 C 540,125 640,65 800,32 L 800,220 L 0,220 Z"
                  fill="url(#heroChartGlow)"
                />

                {/* Smooth Clean Curve Stroke */}
                <path
                  d="M 0,185 C 160,180 260,145 400,135 C 540,125 640,65 800,32"
                  fill="none"
                  stroke="url(#heroLineStroke)"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />

                {/* Vertical Crosshair Line */}
                <line
                  stroke="rgba(199,255,91,0.35)"
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
                  fill="#c7ff5b"
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
                  {crosshair.tps} ·{" "}
                  {crosshair.visible ? crosshair.gas : selectedTfData.gas}
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
                  TOTAL BLOCKS
                </span>
                <span className="text-data-mono-md font-data-mono-md text-on-surface font-semibold">
                  {blockHeight.toLocaleString()}
                </span>
              </div>
              <div className="px-2 py-1">
                <span className="block text-[10px] font-label-caps text-outline uppercase tracking-wider">
                  24H TRANSACTIONS
                </span>
                <span className="text-data-mono-md font-data-mono-md text-on-surface font-semibold">
                  1,842,910 Txns
                </span>
              </div>
              <div className="px-2 py-1">
                <span className="block text-[10px] font-label-caps text-outline uppercase tracking-wider">
                  AVG GAS COST
                </span>
                <span className="text-data-mono-md font-data-mono-md text-on-surface font-semibold">
                  &lt; 0.001 Gwei
                </span>
              </div>
              <div className="px-2 py-1">
                <span className="block text-[10px] font-label-caps text-outline uppercase tracking-wider">
                  SECURITY SCORE
                </span>
                <span className="text-data-mono-md font-data-mono-md text-primary-fixed font-semibold flex items-center gap-1">
                  <FiShield className="text-[13px]" /> 100/100 (Optimal)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
