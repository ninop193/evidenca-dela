import type { MetadataRoute } from "next";

// Lasten opis aplikacije za skupno napravo: ikona na začetnem zaslonu tablice
// odpre /naprava (ne /zigosanje). Na iPhonu/iPadu ima aplikacija z ikone ločen
// spomin od Safarija, zato mora naprava ob prvem odprtju z ikone pokazati vnos
// kode za povezavo — kar /naprava stori.
export function GET() {
  const manifest: MetadataRoute.Manifest = {
    name: "Delovit – skupna naprava",
    short_name: "Žigosanje",
    start_url: "/naprava",
    scope: "/naprava",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#1d4ed8",
    lang: "sl",
    icons: [
      { src: "/icon-192.png?v=2", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png?v=2", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png?v=2", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return Response.json(manifest, { headers: { "Content-Type": "application/manifest+json" } });
}
