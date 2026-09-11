import Image from "next/image";

export default function Loading() {
  return (
    <main className="w-full max-w-[1360px] mx-auto site-container py-space-md min-h-[calc(100vh-48px-64px)] flex flex-col gap-6">
      {/* Hero Telemetry Streaming Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 h-44 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center p-2">
            <Image
              src="/logo/hoodlens-mark-cyan.png"
              alt="HoodLens"
              width={24}
              height={24}
              className="w-full h-full object-contain animate-pulse"
              priority
            />
          </div>
          <div>
            <div className="h-4 w-32 bg-surface-container-high rounded animate-pulse mb-1.5" />
            <div className="h-3 w-48 bg-surface-container rounded animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-data-mono-sm text-outline">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-ping" />
          <span>
            Synchronizing smart contract bytecode and liquidity pools...
          </span>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl h-20 animate-pulse"
          />
        ))}
      </div>

      {/* Chart + Health Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl h-80 animate-pulse" />
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl h-80 animate-pulse" />
      </div>
    </main>
  );
}
