import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hoodlens.io";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/cron/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
