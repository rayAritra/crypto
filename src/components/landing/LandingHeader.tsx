"use client";

import { Logo } from "@/components/shared/Logo";

export function LandingHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full bg-transparent">
      <div className="flex items-center w-full max-w-[1580px] mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-5 h-auto">
        <Logo size="lg" />
      </div>
    </header>
  );
}
