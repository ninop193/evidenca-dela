import { buildNicheOg, OG_SIZE } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Evidenca delovnega časa: obrazec za brezplačen prenos";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return buildNicheOg({
    badge: "Blog · obrazec",
    line1: "Obrazec za evidenco",
    line2: "delovnega časa.",
    sub: "Brezplačen prenos v Wordu in PDF, brez prijave. Vsa obvezna polja po ZEPDSV.",
    url: "www.delovit.si/blog",
  });
}
