import { AppFooter } from "@/components/layout/AppFooter";
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
  themeColor: "#080a08",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col selection:bg-[#c7ff5b] selection:text-[#080a08]">
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
