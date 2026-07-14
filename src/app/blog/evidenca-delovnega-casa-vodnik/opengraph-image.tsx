import { buildNicheOg, OG_SIZE } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Evidenca delovnega časa: kaj zahteva zakon in kako jo voditi";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return buildNicheOg({
    badge: "Vodnik · ZEPDSV",
    line1: "Evidenca delovnega časa:",
    line2: "celoten vodnik.",
    sub: "Kdo jo mora voditi, kaj mora vsebovati in kakšne so sankcije. Vse na enem mestu.",
    url: "www.delovit.si/blog",
  });
}
