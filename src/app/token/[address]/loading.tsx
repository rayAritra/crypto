export default function Loading() {
  return (
    <main className="w-full max-w-[1360px] mx-auto site-container py-space-md min-h-[calc(100vh-48px-64px)] flex flex-col gap-6 animate-pulse">
      {/* Hero Skeleton */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 h-44 flex flex-col justify-between" />

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl h-20"
          />
        ))}
      </div>

      {/* Chart + Health Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl h-80" />
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl h-80" />
      </div>
    </main>
  );
}
