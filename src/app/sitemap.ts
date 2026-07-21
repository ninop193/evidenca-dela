import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.delovit.si";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/evidenca-delovnega-casa`, lastModified: now, changeFrequency: "monthly", priority: 0.95 },
    { url: `${base}/kalkulator`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/kalkulator-glob`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/studenti`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/gostinstvo`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/trgovina`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/frizerski-salon`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/sp`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/blog/evidenca-delovnega-casa-excel`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/globe-zepdsv-evidenca-delovnega-casa`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/prazniki-dela-prosti-dnevi-2026`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/evidenca-delovnega-casa-obrazec`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/evidenca-o-izrabi-delovnega-casa`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/evidenca-delovnega-casa-vodnik`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/partnerji`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/kontakt`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/pravno/pogoji`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/pravno/zasebnost`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/pravno/vracila`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
