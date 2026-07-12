import type { MetadataRoute } from "next";

const routes = ["", "/privacy", "/test-guide"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://paperpicture.net${route}`,
    lastModified: new Date("2026-07-12"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.5,
  }));
}
