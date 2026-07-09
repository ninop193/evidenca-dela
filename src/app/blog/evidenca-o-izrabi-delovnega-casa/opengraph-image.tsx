import { buildNicheOg, OG_SIZE } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Kaj je evidenca o izrabi delovnega časa (18. člen ZEPDSV)";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return buildNicheOg({
    badge: "Blog · 18. člen ZEPDSV",
    line1: "Evidenca o izrabi",
    line2: "delovnega časa.",
    sub: "Kaj pomeni izraz, kaj mora vsebovati in v čem se razlikuje od evidence zaposlenih.",
    url: "www.delovit.si/blog",
  });
}
