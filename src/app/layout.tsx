import { CompareTray } from "@/components/layout/CompareTray";
import { Navbar } from "@/components/layout/Navbar";
import { AppStateProvider } from "@/components/providers/AppState";
import { ToastViewport } from "@/components/shared/ToastViewport";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default:
      "HoodLens — Institutional On-Chain Intelligence for Robinhood Chain",
    template: "%s | HoodLens",
  },
  description:
    "Live contract intelligence for people who want the full picture—price, liquidity, activity, ownership, and transparent risk on Robinhood Chain.",
  openGraph: {
    title: "HoodLens — Institutional On-Chain Intelligence",
    description:
      "Robinhood Chain institutional token intelligence and analytics",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#121412",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col selection:bg-[#bdf451] selection:text-[#0d0f0c] terminal-grid">
        <AppStateProvider>
          <Suspense
            fallback={
              <div className="h-[48px] bg-surface border-b border-outline-variant" />
            }
          >
            <Navbar />
          </Suspense>
          {children}
          <CompareTray />
          <ToastViewport />
          <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest docked full-width bottom border-t border-outline-variant dark:border-outline-variant flat no shadows mt-auto">
            <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-[1580px] mx-auto px-margin-screen site-container py-space-md text-body-sm font-body-sm">
              <div className="flex flex-col sm:flex-row items-center sm:space-x-3 mb-2 md:mb-0">
                <span className="text-headline-sm font-headline-sm font-semibold text-primary dark:text-primary">
                  HoodLens
                </span>
                <span className="hidden sm:inline text-outline">•</span>
                <span className="text-on-surface-variant text-center sm:text-left text-body-sm">
                  HoodLens © 2025. Institutional On-Chain Intelligence for
                  Robinhood Chain. Not financial advice.
                </span>
              </div>
              <div className="flex items-center space-x-4 text-data-mono-sm font-data-mono-sm">
                <div className="flex items-center space-x-1 text-tertiary-fixed">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-pulse"></span>
                  <span>Blockscout RPC Sync: Active</span>
                </div>
                <a
                  className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary-fixed dark:hover:text-primary-fixed transition-colors duration-150"
                  href="/discover"
                >
                  Documentation
                </a>
                <a
                  className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary-fixed dark:hover:text-primary-fixed transition-colors duration-150"
                  href="/api/health"
                  target="_blank"
                  rel="noreferrer"
                >
                  API Telemetry
                </a>
                <a
                  className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary-fixed dark:hover:text-primary-fixed transition-colors duration-150"
                  href="/discover"
                >
                  Terms of Protocol
                </a>
              </div>
            </div>
          </footer>
        </AppStateProvider>
      </body>
    </html>
  );
}
