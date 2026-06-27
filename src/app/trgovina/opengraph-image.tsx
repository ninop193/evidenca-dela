import { buildNicheOg, OG_SIZE } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Evidenca delovnega časa za trgovine";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return buildNicheOg({
    badge: "Za trgovine",
    line1: "Vodite trgovino?",
    line2: "Evidenco ur morate voditi.",
    sub: "Za prodajalce in blagajnike. Žigosanje z mobitelom.",
    url: "www.delovit.si/trgovina",
  });
}
