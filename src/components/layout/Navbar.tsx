"use client";

import { useAppState } from "@/components/providers/AppState";
import { Button } from "@/components/shared/Button";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowRight, FiMenu, FiSearch, FiX } from "react-icons/fi";
import { CommandPalette } from "./CommandPalette";

const links = [
  { href: "/terminal", label: "Terminal" },
  { href: "/discover", label: "Discover" },
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
    const handleOpenSearch = () => setPalette(true);

    window.addEventListener("keydown", key);
    window.addEventListener("hoodlens:open-search", handleOpenSearch);
  }, []);

  const compareHref =
    state.ready && state.compare.length >= 2
      ? `/compare?tokens=${state.compare.map((x) => x.address).join(",")}`
      : "/compare";

  // Homepage has its own dedicated transparent LandingHeader
  if (path === "/") {
    return <CommandPalette open={palette} onClose={() => setPalette(false)} />;
  }

  return (
    <>
      <header className="bg-surface dark:bg-surface docked full-width top-0 sticky z-50 border-b border-outline-variant dark:border-outline-variant flat no shadows">
        <div className="flex justify-between items-center w-full max-w-[1580px] mx-auto px-margin-screen site-container h-[48px]">
          {/* Brand & Network */}
          <Logo showBadge={true} />

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
