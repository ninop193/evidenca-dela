import { buildNicheOg, OG_SIZE } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Evidenca delovnega časa za gostinske lokale";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return buildNicheOg({
    badge: "Za gostinske lokale",
    line1: "Vodite gostinski lokal?",
    line2: "Evidenco ur morate voditi.",
    sub: "Za natakarje, kuharje in sezonce. Žigosanje z mobitelom.",
    url: "www.delovit.si/gostinstvo",
  });
}
