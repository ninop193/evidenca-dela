import { buildNicheOg, OG_SIZE } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Regres 2026: koliko, kdaj in za koga";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return buildNicheOg({
    badge: "Blog · 2026",
    line1: "Regres 2026:",
    line2: "koliko, kdaj, za koga.",
    sub: "Višina, rok izplačila, obdavčitev in izračun sorazmernega dela.",
    url: "www.delovit.si/blog",
  });
}
