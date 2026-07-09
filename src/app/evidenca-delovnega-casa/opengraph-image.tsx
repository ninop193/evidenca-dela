import { buildNicheOg, OG_SIZE } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Aplikacija in program za evidenco delovnega časa – Delovit";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return buildNicheOg({
    badge: "Aplikacija · ZEPDSV",
    line1: "Aplikacija za evidenco",
    line2: "delovnega časa.",
    sub: "Žigosanje s telefonom, izvoz PDF/Excel, opomniki. 19 € na mesec za celo podjetje.",
    url: "www.delovit.si/evidenca-delovnega-casa",
  });
}
