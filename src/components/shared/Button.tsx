"use client";

import Link from "next/link";
import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children?: React.ReactNode;
  className?: string;
}

export type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: undefined;
  };

export type ButtonAsLink = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    href: string;
    target?: string;
    rel?: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export const buttonStyles = ({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string => {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer select-none whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "btn-primary bg-[#bdf451] hover:bg-[#a2d736] !text-[#0d0f0c] hover:!text-[#0d0f0c] font-bold shadow-sm border border-[#bdf451]",
    secondary:
      "bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/70 text-on-surface hover:text-primary hover:border-outline",
    outline:
      "bg-transparent hover:bg-[#bdf451]/10 border border-[#bdf451]/50 hover:border-[#bdf451] text-[#bdf451] font-semibold",
    ghost:
      "bg-transparent hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-transparent",
    danger:
      "bg-error-container/30 hover:bg-error-container/50 border border-error/40 text-error font-semibold",
  };

  const sizes: Record<ButtonSize, string> = {
    xs: "px-2 py-0.5 text-xs rounded-md",
    sm: "px-2.5 py-1 text-xs rounded-lg",
    md: "px-3.5 py-1.5 text-body-sm rounded-lg",
    lg: "px-5 py-2.5 text-body-md rounded-xl font-bold",
  };

  return `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim();
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  children,
  className = "",
  style,
  ...rest
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const computedClass = buttonStyles({ variant, size, className });

  const primaryStyle: React.CSSProperties = isPrimary
    ? {
        backgroundColor: "#bdf451",
        color: "#0d0f0c",
        borderColor: "#bdf451",
        ...style,
      }
    : { ...style };

  const content = (
    <>
      {icon && iconPosition === "left" && (
        <span
          className={`shrink-0 flex items-center ${isPrimary ? "!text-[#0d0f0c]" : ""}`}
          style={isPrimary ? { color: "#0d0f0c" } : undefined}
        >
          {icon}
        </span>
      )}
      {children && (
        <span
          className={isPrimary ? "!text-[#0d0f0c] font-bold" : ""}
          style={isPrimary ? { color: "#0d0f0c" } : undefined}
        >
          {children}
        </span>
      )}
      {icon && iconPosition === "right" && (
        <span
          className={`shrink-0 flex items-center ${isPrimary ? "!text-[#0d0f0c]" : ""}`}
          style={isPrimary ? { color: "#0d0f0c" } : undefined}
        >
          {icon}
        </span>
      )}
    </>
  );

  if ("href" in rest && typeof rest.href === "string") {
    const { href, target, rel, ...linkProps } = rest as ButtonAsLink;
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={computedClass}
        style={primaryStyle}
        {...linkProps}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={(rest as ButtonAsButton).type || "button"}
      className={computedClass}
      style={primaryStyle}
      {...(rest as ButtonAsButton)}
    >
      {content}
    </button>
  );
}
