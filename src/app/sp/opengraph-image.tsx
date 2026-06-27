import { buildNicheOg, OG_SIZE } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Evidenca delovnega časa za s.p. z zaposlenimi";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return buildNicheOg({
    badge: "Za s.p. z zaposlenimi",
    line1: "S.p. z zaposlenimi?",
    line2: "Evidenco ur morate voditi.",
    sub: "Že za enega zaposlenega obvezno. Žigosanje z mobitelom.",
    url: "www.delovit.si/sp",
  });
}
