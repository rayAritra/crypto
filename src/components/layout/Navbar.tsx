"use client";

import { useAppState } from "@/components/providers/AppState";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowRight, FiMenu, FiSearch, FiX } from "react-icons/fi";
import { RiRadarLine } from "react-icons/ri";
import { CommandPalette } from "./CommandPalette";

const links = [
  { href: "/discover", label: "Discover" },
  { href: "/discover?view=trending", label: "Trending" },
  { href: "/discover?view=new", label: "New Tokens" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/compare", label: "Compare" },
];

export function Navbar() {
  const [palette, setPalette] = useState(false);
  const [menu, setMenu] = useState(false);
  const path = usePathname();
  const params = useSearchParams();
  const state = useAppState();
  const view = params.get("view");

  function isCurrent(href: string) {
    const [targetPath, query] = href.split("?");
    if (path !== targetPath) return false;
    if (targetPath !== "/discover") return true;
    const targetView = new URLSearchParams(query ?? "").get("view");
    return targetView
      ? view === targetView
      : view !== "trending" && view !== "new";
  }

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  const compareHref =
    state.ready && state.compare.length >= 2
      ? `/compare?tokens=${state.compare.map((x) => x.address).join(",")}`
      : "/compare";

  return (
    <>
      <header className="bg-surface dark:bg-surface docked full-width top-0 sticky z-50 border-b border-outline-variant dark:border-outline-variant flat no shadows">
        <div className="flex justify-between items-center w-full max-w-[1580px] mx-auto px-margin-screen site-container h-[48px]">
          {/* Brand & Network */}
          <div className="flex items-center space-x-3">
            <Link className="flex items-center space-x-2 group" href="/">
              <div className="w-6 h-6 rounded bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary-fixed group-hover:border-primary-fixed transition-colors">
                <RiRadarLine className="text-[15px]" />
              </div>
              <span className="text-headline-sm font-headline-sm font-semibold text-primary dark:text-primary tracking-tight">
                HoodLens
              </span>
            </Link>
            <div className="hidden sm:flex items-center h-5 px-2 bg-surface-container-low border border-outline-variant rounded-full text-data-mono-sm font-data-mono-sm text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-pulse mr-1.5"></span>
              <span>Robinhood Chain</span>
              <span className="text-outline mx-1">/</span>
              <span className="text-secondary-fixed">88899</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            {links.map((item) => {
              const active = isCurrent(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    active
                      ? "text-primary-fixed dark:text-primary-fixed border-b border-primary-fixed font-medium"
                      : "text-on-surface-variant dark:text-on-surface-variant hover:text-on-surface"
                  } pb-1 transition-colors text-body-sm font-body-sm`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Trailing Action Cluster */}
          <div className="flex items-center space-x-2">
            {/* Quick Search Pill */}
            <button
              onClick={() => setPalette(true)}
              className="hidden lg:flex items-center space-x-2 bg-surface-container-low border border-outline-variant px-2.5 py-1 rounded text-body-sm text-on-surface-variant hover:border-outline transition-colors active:scale-[0.98] cursor-pointer"
            >
              <FiSearch className="text-[13px]" />
              <span>Search</span>
              <kbd className="text-data-mono-sm font-data-mono-sm px-1 rounded bg-surface-container-high text-outline">
                ⌘K
              </kbd>
            </button>

            <Button
              variant="primary"
              size="sm"
              href={compareHref}
              icon={<FiArrowRight className="text-[13px]" />}
              iconPosition="right"
            >
              {state.ready && state.compare.length >= 2
                ? `Compare ${state.compare.length} Tokens`
                : "Compare 2 Tokens"}
            </Button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenu(!menu)}
              className="md:hidden flex items-center justify-center p-1.5 rounded text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container-high transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {menu ? (
                <FiX className="text-[18px]" />
              ) : (
                <FiMenu className="text-[18px]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menu && (
          <div className="md:hidden bg-surface-container-low border-b border-outline-variant px-4 py-3 flex flex-col space-y-2">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenu(false)}
                className={`${
                  isCurrent(item.href)
                    ? "text-primary-fixed font-semibold"
                    : "text-on-surface-variant"
                } py-1.5 text-body-md transition-colors`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMenu(false);
                setPalette(true);
              }}
              className="flex items-center space-x-2 bg-surface-container border border-outline-variant px-3 py-2 rounded text-body-sm text-on-surface-variant mt-2 text-left"
            >
              <FiSearch className="text-[14px]" />
              <span>Search token (⌘K)</span>
            </button>
          </div>
        )}
      </header>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </>
  );
}
