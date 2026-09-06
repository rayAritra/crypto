import Link from "next/link";
import { RiRadarLine } from "react-icons/ri";

interface LogoProps {
  className?: string;
  showBadge?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({
  className = "",
  showBadge = false,
  size = "md",
}: LogoProps) {
  const isLg = size === "lg";

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Link className="flex items-center space-x-2.5 group" href="/">
        <div
          className={`${
            isLg ? "w-8 h-8 sm:w-9 sm:h-9 rounded-lg" : "w-6 h-6 rounded"
          } bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary-fixed group-hover:border-primary-fixed transition-colors shadow-sm`}
        >
          <RiRadarLine
            className={isLg ? "text-[20px] sm:text-[22px]" : "text-[15px]"}
          />
        </div>
        <span
          className={`${
            isLg
              ? "text-xl sm:text-2xl font-bold tracking-tight"
              : "text-headline-sm font-semibold tracking-tight"
          } text-primary dark:text-primary`}
        >
          HoodLens
        </span>
      </Link>
      {showBadge && (
        <div className="hidden sm:flex items-center h-5 px-2 bg-surface-container-low border border-outline-variant rounded-full text-data-mono-sm font-data-mono-sm text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-pulse mr-1.5"></span>
          <span>Robinhood Chain</span>
          <span className="text-outline mx-1">/</span>
          <span className="text-secondary-fixed">88899</span>
        </div>
      )}
    </div>
  );
}
