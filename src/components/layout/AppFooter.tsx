"use client";

import { usePathname } from "next/navigation";

export function AppFooter() {
  const path = usePathname();

  // On the landing pages, the landing page renders its own dedicated dark AuthKit footer
  if (path === "/" || path === "/v0") {
    return null;
  }

  return (
    <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest docked full-width bottom border-t border-outline-variant dark:border-outline-variant flat no shadows mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-[1360px] mx-auto site-container py-space-md text-body-sm font-body-sm">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-3 mb-2 md:mb-0">
          <span className="text-headline-sm font-headline-sm font-semibold text-primary dark:text-primary">
            HoodLens
          </span>
          <span className="hidden sm:inline text-outline">•</span>
          <span className="text-on-surface-variant text-center sm:text-left text-body-sm">
            HoodLens © 2025. Institutional On-Chain Intelligence for Robinhood
            Chain. Not financial advice.
          </span>
        </div>
        <div className="flex items-center space-x-4 text-data-mono-sm font-data-mono-sm">
          <div className="flex items-center space-x-1 text-tertiary-fixed">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-pulse"></span>
            <span>Blockscout RPC Sync: Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
