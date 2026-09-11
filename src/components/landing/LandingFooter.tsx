import { Logo } from "@/components/shared/Logo";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-10 px-4 sm:px-6 text-xs font-mono text-on-surface-variant relative z-10 bg-[#080a08]/90 backdrop-blur-md w-full">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 text-center sm:text-left">
          <Logo variant="white" size="xs" showBadge={false} />
          <span className="hidden sm:inline text-outline">•</span>
          <span>Institutional On-Chain Intelligence for Robinhood Chain.</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <span className="flex items-center gap-1.5 text-[#c7ff5b]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c7ff5b] animate-pulse"></span>{" "}
            Blockscout Sync Active
          </span>
          <Link href="/terminal" className="hover:text-white transition-colors">
            Terminal
          </Link>
          <Link href="/discover" className="hover:text-white transition-colors">
            Discover
          </Link>
          <Link href="/compare" className="hover:text-white transition-colors">
            Compare
          </Link>
          <Link
            href="/watchlist"
            className="hover:text-white transition-colors"
          >
            Watchlist
          </Link>
        </div>
      </div>
    </footer>
  );
}
