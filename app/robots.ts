import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/test-guide"],
      disallow: ["/api/", "/feedback", "/profile"],
    },
    sitemap: "https://paperpicture.net/sitemap.xml",
  };
}
