import { buildNicheOg, OG_SIZE } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Kalkulator glob ZEPDSV";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return buildNicheOg({
    badge: "Brezplačno · ZEPDSV",
    line1: "Kalkulator glob",
    line2: "po ZEPDSV.",
    sub: "V 20 sekundah izračunaj razpon globe za nevodenje evidence delovnega časa.",
    url: "www.delovit.si/kalkulator-glob",
  });
}
