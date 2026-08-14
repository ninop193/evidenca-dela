import type { Metadata } from "next";

// /register je "use client" stran, zato metapodatke postavimo v layout (strežnik).
// SEO higiena: registracijska stran ne sme biti indeksirana (ni vsebina, podvaja
// homepage) — canonical nase + noindex,follow (linki še vedno prenašajo signal).
export const metadata: Metadata = {
  title: { absolute: "Registracija – Delovit: aplikacija za evidenco delovnega časa" },
  description:
    "Ustvari račun v Delovit in začni voditi evidenco delovnega časa v 2 minutah. 14 dni brezplačno, brez kartice. Žigosanje z mobitelom, izvoz PDF/Excel za inšpekcijo.",
  alternates: { canonical: "/register" },
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
