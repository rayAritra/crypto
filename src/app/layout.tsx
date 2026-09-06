import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AppStateProvider } from "@/components/providers/AppState";
import { CompareTray } from "@/components/layout/CompareTray";
import { ToastViewport } from "@/components/shared/ToastViewport";

export const metadata: Metadata = {
  title: { default: "HoodLens — Robinhood Chain Intelligence", template: "%s | HoodLens" },
  description: "Discover tokens, analyze activity, and understand transparent risk indicators on Robinhood Chain.",
  openGraph: { title: "HoodLens", description: "Robinhood Chain token intelligence", type: "website" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f4f4f0" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><AppStateProvider>
    <Suspense><Navbar/></Suspense>
    {children}<CompareTray/><ToastViewport/>
    <footer className="shell footer"><div><strong>HoodLens</strong><p>Independent intelligence across HoodLens-tracked tokens.</p></div><p>Risk indicators are informational and do not guarantee that a token, contract, or project is safe. Not investment advice.</p></footer>
  </AppStateProvider></body></html>;
}
