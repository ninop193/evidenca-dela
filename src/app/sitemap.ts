import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.delovit.si";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/kalkulator`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/kontakt`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/pravno/pogoji`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/pravno/zasebnost`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/pravno/vracila`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
