"use client";

import { useAppState } from "@/components/providers/AppState";
import { Button } from "@/components/shared/Button";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiArrowRight, FiMenu, FiSearch, FiX } from "react-icons/fi";

const navLinks = [
  { href: "/terminal", label: "Terminal" },
  { href: "/discover", label: "Discover" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/compare", label: "Compare" },
];

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const path = usePathname();
  const state = useAppState();

  const compareHref =
    state.ready && state.compare.length >= 2
      ? `/compare?tokens=${state.compare.map((x) => x.address).join(",")}`
      : "/compare";

  function triggerSearch() {
    window.dispatchEvent(new CustomEvent("hoodlens:open-search"));
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full bg-transparent">
      <div className="w-full max-w-[1360px] mx-auto site-container pt-4 sm:pt-5">
        <div className="flex items-center justify-between h-12 px-3 sm:px-4 rounded-2xl glass-panel border border-white/10 backdrop-blur-md shadow-lg">
          {/* Brand Logo Anchor on Left */}
          <div className="flex items-center gap-3">
            <Logo size="md" showBadge={true} />
          </div>

          {/* Navigation Links in the Middle */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((item) => {
              const isActive = path === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-body-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary-fixed border-b border-primary-fixed pb-0.5"
                      : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Trailing Action Cluster on Right */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Pill */}
            <button
              type="button"
              onClick={triggerSearch}
              className="hidden lg:flex items-center gap-2 bg-surface-container-low border border-outline-variant px-2.5 py-1 rounded-lg text-body-sm text-on-surface-variant hover:border-outline hover:text-white transition-colors active:scale-[0.98] cursor-pointer"
            >
              <FiSearch className="text-[13px]" />
              <span>Search</span>
              <kbd className="text-data-mono-sm font-data-mono-sm px-1 rounded bg-surface-container-high text-outline">
                ⌘K
              </kbd>
            </button>

            {/* Compare Button */}
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

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center p-1.5 rounded-lg text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container-high transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {menuOpen ? (
                <FiX className="text-[18px]" />
              ) : (
                <FiMenu className="text-[18px]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {menuOpen && (
          <div className="md:hidden mt-2 p-3 rounded-xl bg-surface-container-low/95 border border-outline-variant/60 backdrop-blur-xl shadow-2xl flex flex-col gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`py-1.5 px-2 rounded-lg text-body-md transition-colors ${
                  path === item.href
                    ? "text-primary-fixed bg-surface-container font-semibold"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                triggerSearch();
              }}
              className="flex items-center gap-2 bg-surface-container border border-outline-variant px-3 py-2 rounded-lg text-body-sm text-on-surface-variant mt-1 text-left hover:text-white transition-colors"
            >
              <FiSearch className="text-[14px]" />
              <span>Search token (⌘K)</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
