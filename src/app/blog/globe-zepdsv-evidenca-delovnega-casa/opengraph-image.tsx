import { buildNicheOg, OG_SIZE } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Globe ZEPDSV in kako se izogniti";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return buildNicheOg({
    badge: "Blog · ZEPDSV",
    line1: "Globe ZEPDSV:",
    line2: "kako se izogniti.",
    sub: "Lestvica glob, inšpekcija in kako evidenco urediti.",
    url: "www.delovit.si/blog",
  });
}
