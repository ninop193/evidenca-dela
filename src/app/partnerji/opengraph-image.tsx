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
    sub: "Priporočite Delovit in prejmite 50 % provizije prvo leto vsake stranke, nato 25 % trajno.",
    url: "www.delovit.si/partnerji",
  });
}
