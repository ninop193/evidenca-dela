import { buildNicheOg, OG_SIZE } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Prazniki in dela prosti dnevi 2026";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return buildNicheOg({
    badge: "Blog · 2026",
    line1: "Prazniki 2026:",
    line2: "koledar in evidenca.",
    sub: "15 dela prostih dni, podaljšani vikendi in kako jih vpisati.",
    url: "www.delovit.si/blog",
  });
}
