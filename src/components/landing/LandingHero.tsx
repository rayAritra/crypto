"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiBarChart2, FiSearch, FiTerminal, FiZap } from "react-icons/fi";
import { RiRadarLine } from "react-icons/ri";

const RECENT_TRANSACTIONS = [
  { pair: "$HOOD", type: "BUY", amount: "$18.4K", time: "2s ago" },
  { pair: "$RHX", type: "LP ADD", amount: "$64.5K", time: "5s ago" },
  { pair: "$LENS", type: "SWAP", amount: "$9.2K", time: "11s ago" },
  { pair: "$ROBIN", type: "BUY", amount: "$4.1K", time: "16s ago" },
  { pair: "$HOOD", type: "SWAP", amount: "$32.8K", time: "21s ago" },
];

export function LandingHero() {
  const [blockHeight, setBlockHeight] = useState(4912042);
  const [progress, setProgress] = useState(0);
  const [ballPos, setBallPos] = useState({ x: 0, y: 220, angle: -5 });
  const [pathLength, setPathLength] = useState(1500);

  const heroRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const isUnlockedRef = useRef(false);

  const [hoverData, setHoverData] = useState<{
    visible: boolean;
    x: number;
    y: number;
    price: string;
    block: number;
    vol: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    price: "$1.424",
    block: 4912042,
    vol: "$1.12M",
  });

  // Live block counter ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  // Measure initial SVG path length & initial point at (0, 220)
  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setPathLength(len);
      const pt = pathRef.current.getPointAtLength(0);
      setBallPos({ x: pt.x, y: pt.y, angle: -5 });
    }
  }, []);

  // Update ball position along the curve whenever progress changes
  const updateBallPosition = useCallback((prog: number) => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    setPathLength(len);
    const point = pathRef.current.getPointAtLength(prog * len);
    const nextPoint = pathRef.current.getPointAtLength(
      Math.min(len, prog * len + 4),
    );
    const angle =
      Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) *
      (180 / Math.PI);

    setBallPos({ x: point.x, y: point.y, angle });
  }, []);

  // Smooth Scroll Interceptor: Drives the ball across the graph on scroll
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      // If we are at the top of the page and the ball has not completed its ride
      if (window.scrollY <= 4 && !isUnlockedRef.current) {
        if (e.deltaY > 0) {
          // Scrolling down advances the ball
          e.preventDefault();
          targetProgressRef.current = Math.min(
            1,
            targetProgressRef.current + e.deltaY * 0.0016,
          );
          if (targetProgressRef.current >= 0.995) {
            targetProgressRef.current = 1;
            isUnlockedRef.current = true;
          }
        } else if (e.deltaY < 0 && targetProgressRef.current > 0) {
          // Scrolling up at the top reverses the ball
          e.preventDefault();
          targetProgressRef.current = Math.max(
            0,
            targetProgressRef.current + e.deltaY * 0.0016,
          );
          if (targetProgressRef.current < 0.99) {
            isUnlockedRef.current = false;
          }
        }
      } else if (window.scrollY <= 2 && e.deltaY < 0 && isUnlockedRef.current) {
        // Scrolling up at the very top re-engages the curve reverse
        e.preventDefault();
        isUnlockedRef.current = false;
        targetProgressRef.current = Math.max(
          0,
          targetProgressRef.current + e.deltaY * 0.0016,
        );
      }
    };

    // Mobile touch handling
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (window.scrollY <= 4 && !isUnlockedRef.current) {
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        if (deltaY > 0) {
          e.preventDefault();
          targetProgressRef.current = Math.min(
            1,
            targetProgressRef.current + deltaY * 0.005,
          );
          touchStartY = touchY;
          if (targetProgressRef.current >= 0.995) {
            targetProgressRef.current = 1;
            isUnlockedRef.current = true;
          }
        }
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    // Smooth RAF loop for silky 60fps/120fps physics lerping
    let animId: number;
    const loop = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.0005) {
        currentProgressRef.current += diff * 0.16;
        setProgress(currentProgressRef.current);
        updateBallPosition(currentProgressRef.current);
      } else if (currentProgressRef.current !== targetProgressRef.current) {
        currentProgressRef.current = targetProgressRef.current;
        setProgress(currentProgressRef.current);
        updateBallPosition(currentProgressRef.current);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      cancelAnimationFrame(animId);
    };
  }, [updateBallPosition]);

  // Window scroll listener: syncs state when user scrolls past
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        isUnlockedRef.current = true;
        targetProgressRef.current = 1;
        currentProgressRef.current = 1;
        setProgress(1);
        updateBallPosition(1);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [updateBallPosition]);

  function triggerSearch() {
    window.dispatchEvent(new CustomEvent("hoodlens:open-search"));
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * 1440;

    const prog = Math.max(0, Math.min(1, relativeX / 1440));
    const simulatedPrice = (
      0.24 +
      prog * 1.18 +
      Math.sin(prog * 12) * 0.08
    ).toFixed(3);
    const simulatedVol = (0.1 + prog * 1.3).toFixed(2);
    const simulatedBlock = Math.round(blockHeight - (1 - prog) * 800);

    setHoverData({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      price: `$${simulatedPrice}`,
      block: simulatedBlock,
      vol: `$${simulatedVol}M`,
    });
  }

  function handleMouseLeave() {
    setHoverData((prev) => ({ ...prev, visible: false }));
  }

  // Calculate circular element visibility (only visible strictly between 2.5% and 97.5%)
  let orbOpacity = 0;
  if (progress >= 0.025 && progress <= 0.975) {
    if (progress < 0.055) {
      orbOpacity = (progress - 0.025) / 0.03;
    } else if (progress > 0.945) {
      orbOpacity = (0.975 - progress) / 0.03;
    } else {
      orbOpacity = 1;
    }
  }

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen min-h-[640px] flex flex-col justify-between pt-40 sm:pt-48 pb-0 px-0 overflow-hidden selection:bg-[#c7ff5b] selection:text-[#080a08]"
    >
      {/* Background Cosmic Atmosphere Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[520px] spotlight-top pointer-events-none z-0"></div>

      {/* TOP HERO CONTENT CLUSTER: Centralized ~60% Width */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-3xl leading-[1.08] mb-3">
          Institutional clarity for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#c7ff5b] to-[#c7ff5b]">
            Robinhood Chain.
          </span>
        </h1>

        {/* Interactive In-Hero Quick Search Bar */}
        <div className="w-full max-w-lg mb-3">
          <div
            onClick={() => triggerSearch()}
            className="w-full glass-card p-2 sm:p-2.5 rounded-2xl border border-white/15 hover:border-[#c7ff5b]/50 shadow-2xl flex items-center gap-3 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#c7ff5b] group-hover:scale-105 transition-transform shrink-0">
              <FiSearch className="text-sm" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-xs sm:text-sm font-mono text-white/90 truncate">
                Search Robinhood Chain tokens or 0x contract...
              </div>
              <div className="text-[10px] font-mono text-outline truncate">
                $HOOD, $RHX, $LENS, or paste verified L2 bytecode address
              </div>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 text-xs font-mono text-white/80 shrink-0">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Primary Action Button Cluster */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <Link
            href="/terminal"
            className="px-5 py-2 rounded-full bg-[#c7ff5b] hover:bg-[#d8ff85] text-[#080a08] font-mono text-xs sm:text-sm uppercase font-bold tracking-wider flex items-center gap-2 transition-all lime-glow active:scale-95 cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(199,255,91,0.4)]"
          >
            <span>Launch Terminal</span>
            <FiTerminal className="text-sm" />
          </Link>

          <Link
            href="/discover"
            className="px-4 py-2 rounded-full glass-pill hover:bg-white/[0.08] text-white font-mono text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 border border-white/10 hover:border-white/20 active:scale-95"
          >
            <RiRadarLine className="text-sm text-[#c7ff5b]" />
            <span>Discover Desk</span>
          </Link>

          <Link
            href="/compare"
            className="px-4 py-2 rounded-full glass-pill hover:bg-white/[0.08] text-white font-mono text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 border border-white/10 hover:border-white/20 active:scale-95"
          >
            <FiBarChart2 className="text-sm text-[#c7ff5b]" />
            <span>Compare</span>
          </Link>
        </div>
      </div>

      {/* EXPANSIVE EDGE-TO-EDGE GLOWING TRENDLINE CANVAS & CURVE-RIDING ORB */}
      <div className="w-full relative my-auto py-0 px-0">
        {/* Ambient back-glow for graph */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-36 bg-gradient-to-r from-transparent via-[#c7ff5b]/15 to-transparent blur-3xl pointer-events-none"></div>

        {/* Full-bleed SVG curve going 100% edge-to-edge */}
        <div className="w-full h-44 sm:h-56 md:h-64 relative overflow-visible">
          <svg
            ref={svgRef}
            className="w-full h-full overflow-visible cursor-crosshair block"
            preserveAspectRatio="none"
            viewBox="0 0 1440 260"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <radialGradient id="orbCoreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#c7ff5b" />
                <stop offset="100%" stopColor="#43c98b" />
              </radialGradient>
              <filter
                id="ballGlowFilter"
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
              >
                <feGaussianBlur stdDeviation="4" result="blur1" />
                <feGaussianBlur stdDeviation="8" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient
                id="heroTrendGlow"
                x1="0%"
                x2="0%"
                y1="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#c7ff5b" stopOpacity="0.25"></stop>
                <stop
                  offset="60%"
                  stopColor="#c7ff5b"
                  stopOpacity="0.06"
                ></stop>
                <stop offset="100%" stopColor="#c7ff5b" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="heroActiveStroke"
                x1="0%"
                x2="100%"
                y1="0%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#43c98b" stopOpacity="0.6"></stop>
                <stop offset="35%" stopColor="#43c98b"></stop>
                <stop offset="70%" stopColor="#c7ff5b"></stop>
                <stop offset="100%" stopColor="#ffffff"></stop>
              </linearGradient>
            </defs>

            {/* Background Grid Lines */}
            <line
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="4,4"
              x1="0"
              x2="1440"
              y1="50"
              y2="50"
            />
            <line
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="4,4"
              x1="0"
              x2="1440"
              y1="130"
              y2="130"
            />
            <line
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="4,4"
              x1="0"
              x2="1440"
              y1="210"
              y2="210"
            />

            {/* Shaded Area Under Curve */}
            <path
              d="M 0,220 C 180,210 240,160 380,180 C 520,200 600,110 740,120 C 880,130 960,70 1100,50 C 1220,30 1340,35 1440,20 L 1440,260 L 0,260 Z"
              fill="url(#heroTrendGlow)"
            />

            {/* Inactive Base Path (Dashed Guide) */}
            <path
              d="M 0,220 C 180,210 240,160 380,180 C 520,200 600,110 740,120 C 880,130 960,70 1100,50 C 1220,30 1340,35 1440,20"
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeDasharray="6,6"
              strokeLinecap="round"
              strokeWidth="2"
            />

            {/* Active Illuminated Path (Lights up behind the rolling ball) */}
            <path
              ref={pathRef}
              className="trendline-path"
              d="M 0,220 C 180,210 240,160 380,180 C 520,200 600,110 740,120 C 880,130 960,70 1100,50 C 1220,30 1340,35 1440,20"
              fill="none"
              stroke="url(#heroActiveStroke)"
              strokeLinecap="round"
              strokeWidth="3.5"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength * (1 - progress)}
              style={{
                filter: "drop-shadow(0 0 10px rgba(199, 255, 91, 0.7))",
              }}
            />

            {/* Static Landmark Nodes */}
            <circle
              className="cursor-pointer transition-transform hover:scale-125"
              cx="740"
              cy="120"
              fill="#c7ff5b"
              r="4.5"
              stroke="#080a08"
              strokeWidth="2"
            />

            <circle
              className="cursor-pointer"
              cx="1440"
              cy="20"
              fill="#ffffff"
              r="6"
              stroke="#c7ff5b"
              strokeWidth="3"
            />
            <circle
              className="radar-pulse pointer-events-none"
              cx="1440"
              cy="20"
              fill="none"
              r="16"
              stroke="#c7ff5b"
              strokeOpacity="0.6"
            />

            {/* ROLLING CYBER ORB RIDING THE GRAPH CURVE FROM EDGE TO EDGE */}
            <g
              transform={`translate(${ballPos.x}, ${ballPos.y})`}
              opacity={orbOpacity}
              style={{
                transition: "opacity 0.15s ease",
                pointerEvents: "none",
              }}
            >
              {/* Outer Atmospheric Pulse Glow */}
              <circle
                r="22"
                fill="none"
                stroke="#c7ff5b"
                strokeWidth="1.5"
                strokeOpacity={0.4 + Math.sin(progress * 20) * 0.2}
              />

              {/* Outer Ion Shield Ring */}
              <circle
                r="13"
                fill="rgba(199, 255, 91, 0.15)"
                stroke="#c7ff5b"
                strokeWidth="1.5"
                strokeDasharray="4,3"
                transform={`rotate(${progress * 1080})`}
              />

              {/* Radiant Core */}
              <circle
                r="7.5"
                fill="url(#orbCoreGlow)"
                stroke="#c7ff5b"
                strokeWidth="2"
                filter="url(#ballGlowFilter)"
              />

              {/* White-Hot Center */}
              <circle r="3.5" fill="#ffffff" />

              {/* Directional Jet Trail */}
              <line
                x1={-Math.cos((ballPos.angle * Math.PI) / 180) * 16}
                y1={-Math.sin((ballPos.angle * Math.PI) / 180) * 16}
                x2="0"
                y2="0"
                stroke="#c7ff5b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeOpacity="0.8"
              />

              {/* Floating Real-Time Micro HUD attached to the Orb */}
              <g transform="translate(0, -28)">
                <rect
                  x="-62"
                  y="-18"
                  width="124"
                  height="22"
                  rx="11"
                  fill="#080a08"
                  fillOpacity="0.94"
                  stroke="#c7ff5b"
                  strokeWidth="1"
                  filter="drop-shadow(0 4px 14px rgba(0,0,0,0.85))"
                />
                <text
                  x="0"
                  y="-4"
                  textAnchor="middle"
                  fill="#c7ff5b"
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="monospace"
                  letterSpacing="0.05em"
                >
                  $
                  {(
                    0.24 +
                    progress * 1.68 +
                    Math.sin(progress * 10) * 0.05
                  ).toFixed(3)}{" "}
                  · {(180 + progress * 720).toFixed(0)} TPS
                </text>
              </g>
            </g>
          </svg>

          {/* Dynamic Interactive Scrub Tooltip */}
          {hoverData.visible && (
            <div
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-full mb-3 glass-pill px-3.5 py-2.5 rounded-xl border border-[#c7ff5b]/50 shadow-2xl backdrop-blur-md z-30 transition-all duration-75"
              style={{ left: hoverData.x, top: hoverData.y }}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <span>Block #{hoverData.block}</span>
                <span className="text-[#c7ff5b] font-semibold">
                  Live Telemetry
                </span>
              </div>
              <div className="text-sm font-mono font-bold text-white flex items-center gap-2.5">
                <span>{hoverData.price}</span>
                <span className="text-[11px] font-mono text-[#43c98b]">
                  24h Vol {hoverData.vol}
                </span>
              </div>
            </div>
          )}

          {/* Floating Pill Beacon 1 */}
          <Link
            href="/token/0x892a00000000000000000000000000000000103f"
            className="absolute left-[15%] sm:left-[24%] top-[55%] -translate-y-1/2 glass-pill px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-lg backdrop-blur-md hover:border-[#43c98b]/50 transition-all hover:scale-105 cursor-pointer hidden sm:flex z-20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#43c98b]"></span>
            <span className="text-xs font-mono font-medium text-white">
              $RHX · Pool $412K
            </span>
            <span className="text-[10px] font-mono text-[#43c98b] font-bold">
              +14.2%
            </span>
          </Link>

          {/* Floating Pill Beacon 2 */}
          <Link
            href="/token/0x71c5000000000000000000000000000000004490"
            className="absolute left-[60%] sm:left-[72%] top-[10%] -translate-y-1/2 glass-pill px-4 py-2 rounded-xl border border-[#c7ff5b]/40 flex items-center gap-3 shadow-2xl backdrop-blur-md hover:border-[#c7ff5b] transition-all hover:scale-105 cursor-pointer z-20"
          >
            <div className="w-2 h-2 rounded-full bg-[#c7ff5b] animate-ping"></div>
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <span>$HOOD INDEX</span>
                <span className="text-[#c7ff5b] font-semibold">
                  ATH +284.6%
                </span>
              </div>
              <div className="text-sm font-mono font-bold text-white flex items-baseline gap-2">
                $1.424{" "}
                <span className="text-[10px] font-normal text-on-surface-variant font-mono">
                  Block #4,912,042
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* BOTTOM DOCKED CLUSTER: Live Mempool Ticker docked flush at screen edge */}
      <div className="w-full border-t border-white/[0.08] bg-[#080a08]/90 backdrop-blur-md relative z-20 mt-auto">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 font-mono text-xs text-on-surface-variant">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c7ff5b] animate-pulse"></span>
            <span className="text-[10px] text-white font-bold uppercase tracking-wider">
              L2 MEMPOOL
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto custom-scrollbar whitespace-nowrap py-0.5">
            {RECENT_TRANSACTIONS.map((tx, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 text-[10px] sm:text-[11px]"
              >
                <span className="text-white font-semibold">{tx.pair}</span>
                <span
                  className={`px-1 py-0.2 rounded text-[8.5px] sm:text-[9px] font-bold ${
                    tx.type === "BUY"
                      ? "bg-[#43c98b]/20 text-[#43c98b]"
                      : tx.type === "LP ADD"
                        ? "bg-[#c7ff5b]/20 text-[#c7ff5b]"
                        : "bg-white/10 text-white"
                  }`}
                >
                  {tx.type}
                </span>
                <span className="text-white font-medium">{tx.amount}</span>
              </div>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-1 text-[10px] sm:text-[11px] text-outline shrink-0">
            <FiZap className="text-[#c7ff5b]" />
            <span>42ms</span>
          </div>
        </div>
      </div>
    </section>
  );
}
