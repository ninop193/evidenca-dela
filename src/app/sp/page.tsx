import type { Metadata } from "next";
import { NicheLanding, type NicheConfig } from "@/components/NicheLanding";

export const metadata: Metadata = {
  title: "Evidenca delovnega časa za s.p. z zaposlenimi (ZEPDSV)",
  description:
    "Ste s.p. in imate zaposlene? Že za enega zaposlenega morate voditi evidenco delovnega časa po ZEPDSV. Delovit: žigosanje z mobitelom, izvoz za inšpekcijo. Fiksna cena, 14 dni brezplačno.",
  keywords: [
    "evidenca delovnega časa s.p.",
    "evidenca delovnega časa samostojni podjetnik",
    "evidenca ur sp zaposleni",
    "ZEPDSV s.p.",
    "evidenca delovnega časa za zaposlene sp",
    "evidenca delovnega časa mikro podjetje",
  ],
  alternates: { canonical: "/sp" },
  openGraph: {
    title: "Evidenca delovnega časa za s.p. z zaposlenimi",
    description: "Že za enega zaposlenega obvezno. Žigosanje z mobitelom, izvoz za inšpekcijo.",
    type: "website",
    locale: "sl_SI",
    url: "/sp",
    siteName: "Delovit",
  },
};

const config: NicheConfig = {
  slug: "sp",
  breadcrumb: "Evidenca za s.p. z zaposlenimi",
  badge: "Za s.p. z zaposlenimi",
  h1a: "S.p. z zaposlenimi?",
  h1b: "Evidenco ur morate voditi.",
  heroP: (
    <>
      Takoj ko ima s.p. vsaj <strong>enega zaposlenega</strong>, mora voditi evidenco delovnega
      časa po ZEPDSV. Delovit to uredi v 5 minutah.
    </>
  ),
  roleWord: "Zaposleni",
  keyTitle: "Že za prvega zaposlenega velja obveznost",
  keyBody:
    "Marsikateri s.p. misli, da evidenca velja le za večja podjetja. V resnici jo morate voditi že za prvega zaposlenega. Globe so enake kot za druge delodajalce, posebej boleče pa za majhne.",
  faqIntro: {
    q: "Sem s.p. z enim zaposlenim, moram res voditi evidenco?",
    a: "Da. ZEPDSV ne pozna spodnje meje: evidenco delovnega časa morate voditi že za prvega zaposlenega. Velja za vse delodajalce, tudi samostojne podjetnike (s.p.).",
  },
};

export default function Page() {
  return <NicheLanding config={config} />;
}
