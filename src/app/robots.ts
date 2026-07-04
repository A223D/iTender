import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/waitlist", "/discover-campaigns"],
        disallow: [
          "/admin",
          "/api",
          "/auth",
          "/campaigns",
          "/creators",
          "/dashboard",
          "/login",
          "/matches",
          "/onboarding",
          "/settings",
          "/signup",
        ],
      },
    ],
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
    host: SITE_URL,
  };
}
