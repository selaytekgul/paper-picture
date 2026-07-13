import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/test-guide"],
      disallow: ["/api/", "/auth/", "/admin/", "/feedback", "/profile", "/sign-in"],
    },
    sitemap: "https://paperpicture.net/sitemap.xml",
  };
}
