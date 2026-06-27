import { buildNicheOg, OG_SIZE } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Evidenca delovnega časa za frizerske in lepotne salone";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return buildNicheOg({
    badge: "Za salone",
    line1: "Vodite salon?",
    line2: "Evidenco ur morate voditi.",
    sub: "Za frizerje, kozmetičarke in vajence. Žigosanje z mobitelom.",
    url: "www.delovit.si/frizerski-salon",
  });
}
