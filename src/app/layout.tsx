import { AppFooter } from "@/components/layout/AppFooter";
import { CompareTray } from "@/components/layout/CompareTray";
import { Navbar } from "@/components/layout/Navbar";
import { AppStateProvider } from "@/components/providers/AppState";
import { ToastViewport } from "@/components/shared/ToastViewport";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://hoodlens.io",
  ),
  title: {
    default:
      "HoodLens — Institutional On-Chain Intelligence for Robinhood Chain",
    template: "%s | HoodLens",
  },
  description:
    "Institutional clarity for Robinhood Chain. Real-time smart contract telemetry, deterministic risk deductions, multi-token comparative benchmarking, and privacy-first local watchlists.",
  applicationName: "HoodLens",
  authors: [{ name: "HoodLens Core Team", url: "https://hoodlens.io" }],
  generator: "Next.js",
  keywords: [
    "Robinhood Chain",
    "Robinhood Crypto",
    "Robinhood L2",
    "on-chain intelligence",
    "DEX screener",
    "token analytics",
    "smart contract audit",
    "risk scoring",
    "liquidity tracker",
    "mempool stream",
    "crypto terminal",
    "EVM analytics",
    "zero-speculation",
  ],
  creator: "HoodLens",
  publisher: "HoodLens",
  category: "finance",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HoodLens — Institutional On-Chain Intelligence for Robinhood Chain",
    description:
      "Institutional clarity for Robinhood Chain. Real-time contract telemetry, deterministic risk scoring, multi-token benchmark matrix, and privacy-first watchlists.",
    url: "https://hoodlens.io",
    siteName: "HoodLens",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "HoodLens — Institutional On-Chain Intelligence for Robinhood Chain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HoodLens — Institutional On-Chain Intelligence for Robinhood Chain",
    description:
      "Real-time contract telemetry, zero-speculation risk scoring, multi-token benchmark matrix, and privacy-first watchlists for Robinhood Chain.",
    creator: "@hoodlens",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080a08" },
    { media: "(prefers-color-scheme: light)", color: "#080a08" },
  ],
  colorScheme: "dark",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col selection:bg-[#c7ff5b] selection:text-[#080a08] relative overflow-x-hidden">
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
          <Suspense fallback={null}>
            <AppFooter />
          </Suspense>
        </AppStateProvider>
      </body>
    </html>
  );
}
