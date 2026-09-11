import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HoodLens — Institutional On-Chain Intelligence",
    short_name: "HoodLens",
    description:
      "Institutional clarity and live contract intelligence for Robinhood Chain.",
    start_url: "/",
    display: "standalone",
    background_color: "#080a08",
    theme_color: "#c7ff5b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/logo/hoodlens-mark-cyan.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
