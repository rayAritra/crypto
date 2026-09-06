import React from "react";

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "main" | "section" | "header" | "footer";
}

/**
 * Common layout container enforcing the site-wide fixed width (max-w-[1580px])
 * and standardized margin padding (px-margin-screen), matching the Home page and Navbar.
 */
export function Container({
  children,
  className = "",
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={`w-full max-w-[1580px] mx-auto px-margin-screen site-container ${className}`}
    >
      {children}
    </Component>
  );
}
