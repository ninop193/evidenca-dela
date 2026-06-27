import { buildNicheOg, OG_SIZE } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Evidenca delovnega časa v Excelu: vzorec in pasti";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return buildNicheOg({
    badge: "Blog · ZEPDSV",
    line1: "Evidenca v Excelu:",
    line2: "kdaj ni dovolj.",
    sub: "Brezplačen vzorec + kdaj tvegate globo.",
    url: "www.delovit.si/blog",
  });
}
