import Image from "next/image";
import Link from "next/link";

export interface LogoProps {
  className?: string;
  showBadge?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "cyan" | "white" | "black";
  format?: "icon-text" | "horizontal" | "mark";
  href?: string;
}

export function Logo({
  className = "",
  showBadge = false,
  size = "md",
  variant = "cyan",
  format = "icon-text",
  href = "/",
}: LogoProps) {
  const isLg = size === "lg";
  const isSm = size === "sm";
  const isXs = size === "xs";

  const markSrc = `/logo/hoodlens-mark-${variant}.png`;
  const horizSrc = `/logo/hoodlens-horizontal-${variant}.png`;

  const markDimensions = isLg
    ? { box: "w-8 h-8 sm:w-9 sm:h-9 rounded-lg", img: 36 }
    : isSm
      ? { box: "w-5 h-5 rounded", img: 20 }
      : isXs
        ? { box: "w-4 h-4 rounded-sm", img: 16 }
        : { box: "w-6 h-6 rounded", img: 24 };

  const horizDimensions = isLg
    ? { w: 154, h: 29 }
    : isSm
      ? { w: 100, h: 19 }
      : isXs
        ? { w: 80, h: 15 }
        : { w: 122, h: 23 };

  const textColor =
    variant === "black"
      ? "text-black"
      : variant === "white"
        ? "text-white"
        : "text-primary dark:text-primary";

  const textStyle = isLg
    ? "text-xl sm:text-2xl font-bold tracking-tight"
    : isSm
      ? "text-body-sm font-semibold tracking-tight"
      : isXs
        ? "text-xs font-semibold tracking-tight"
        : "text-headline-sm font-semibold tracking-tight";

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Link className="flex items-center space-x-2.5 group" href={href}>
        {format === "horizontal" ? (
          <Image
            src={horizSrc}
            alt="HoodLens"
            width={horizDimensions.w}
            height={horizDimensions.h}
            className="h-auto object-contain select-none"
            priority
          />
        ) : format === "mark" ? (
          <div
            className={`${markDimensions.box} bg-surface-container-high border border-outline-variant flex items-center justify-center group-hover:border-primary-fixed transition-colors shadow-sm overflow-hidden p-0.5`}
          >
            <Image
              src={markSrc}
              alt="HoodLens Mark"
              width={markDimensions.img}
              height={markDimensions.img}
              className="w-full h-full object-contain select-none"
              priority
            />
          </div>
        ) : (
          <>
            <div
              className={`${markDimensions.box} bg-surface-container-high border border-outline-variant flex items-center justify-center group-hover:border-primary-fixed transition-colors shadow-sm overflow-hidden p-0.5`}
            >
              <Image
                src={markSrc}
                alt="HoodLens Mark"
                width={markDimensions.img}
                height={markDimensions.img}
                className="w-full h-full object-contain select-none"
                priority
              />
            </div>
            <span className={`${textStyle} ${textColor}`}>HoodLens</span>
          </>
        )}
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
