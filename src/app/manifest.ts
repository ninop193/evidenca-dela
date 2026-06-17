import type { MetadataRoute } from "next";

// Opis aplikacije za "Dodaj na domači zaslon" (PWA).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Delovit",
    short_name: "Delovit",
    description:
      "Delovit, evidenca delovnega časa za mikro podjetja. Žigosanje prihoda in odhoda z enim gumbom.",
    start_url: "/zigosanje",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#1d4ed8",
    lang: "sl",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png?v=2", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png?v=2", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png?v=2", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
