"use client";

import { compactNumber } from "@/lib/utils/format";
import type { PricePoint } from "@/types/token";
import { useId, useMemo, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const ranges = {
  "1H": 1,
  "6H": 6,
  "24H": 24,
  "7D": 168,
} as const;

export function PriceChart({ points }: { points: PricePoint[] }) {
  const [range, setRange] = useState<keyof typeof ranges>("24H");
  const gradientId = useId().replace(/:/g, "");
  const data = useMemo(() => points.slice(-ranges[range]), [points, range]);

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/50">
        <div>
          <p className="text-label-caps text-outline uppercase font-semibold">
            MARKET DEPTH // TIME SERIES
          </p>
          <h2 className="text-lg font-headline font-bold text-on-surface">
            Price History
          </h2>
        </div>

        <div
          className="inline-flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-outline-variant/60"
          role="tablist"
          aria-label="Chart range"
        >
          {Object.keys(ranges).map((item) => {
            const active = range === item;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setRange(item as keyof typeof ranges)}
                className={`px-3 py-1 rounded-lg text-data-mono-sm font-semibold transition-all duration-150 cursor-pointer ${
                  active
                    ? "bg-[#bdf451] text-[#0d0f0c] font-bold shadow-sm"
                    : "text-outline hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </header>

      {data.length ? (
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bdf451" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#bdf451" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) =>
                  new Date(timestamp).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour:
                      range === "1H" || range === "6H" ? "numeric" : undefined,
                  })
                }
                minTickGap={40}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#8d937d",
                  fontSize: 11,
                  fontFamily: "JetBrains Mono",
                }}
              />
              <YAxis
                domain={["auto", "auto"]}
                tickFormatter={(value) => compactNumber(value, true)}
                width={70}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#8d937d",
                  fontSize: 11,
                  fontFamily: "JetBrains Mono",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(18, 20, 18, 0.95)",
                  borderColor: "#434936",
                  borderRadius: "12px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                  backdropFilter: "blur(8px)",
                  padding: "10px 14px",
                  color: "#e2e3de",
                  fontFamily: "JetBrains Mono",
                }}
                labelFormatter={(value) =>
                  new Date(Number(value)).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                }
                formatter={(value) => [
                  compactNumber(Number(value), true),
                  "Price",
                ]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#bdf451"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                activeDot={{
                  r: 4.5,
                  fill: "#bdf451",
                  stroke: "#121412",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-surface-container/20 rounded-xl border border-dashed border-outline-variant/40">
          <p className="text-body-md font-semibold text-on-surface">
            Historical Data Still Indexing
          </p>
          <p className="text-body-sm text-outline mt-1 max-w-sm">
            Continuous price points are being recorded from DEX pool events.
            Live market metrics remain available.
          </p>
        </div>
      )}
    </section>
  );
}
