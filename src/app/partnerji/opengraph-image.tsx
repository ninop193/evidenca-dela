import { buildNicheOg, OG_SIZE } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Partnerski program Delovit: 50 % provizije";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return buildNicheOg({
    badge: "Odprto za vse",
    line1: "Partnerski program:",
    line2: "50 % provizije.",
    sub: "Pripeljite stranke v Delovit in prejmite polovico naročnine, vsak mesec.",
    url: "www.delovit.si/partnerji",
  });
}
