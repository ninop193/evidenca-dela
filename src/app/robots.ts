import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/zigosanje", "/dobrodosli", "/auth"],
    },
    sitemap: "https://www.delovit.si/sitemap.xml",
  };
}
