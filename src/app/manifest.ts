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
    ],
  };
}
