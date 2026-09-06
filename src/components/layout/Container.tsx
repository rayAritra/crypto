import React from "react";

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "main" | "section" | "header" | "footer";
}

/**
 * Common layout container enforcing the site-wide fixed width (max-w-[1360px])
 * and standardized margin padding (site-container), matching the Home page and Navbar.
 */
export function Container({
  children,
  className = "",
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={`w-full max-w-[1360px] mx-auto site-container ${className}`}
    >
      {children}
    </Component>
  );
}
