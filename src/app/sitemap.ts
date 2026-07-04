import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

const publicRoutes = ["/", "/waitlist", "/discover-campaigns"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map((route) => ({
    url: new URL(route, SITE_URL).toString(),
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
