import type { Metadata } from "next";
import { NicheLanding, type NicheConfig } from "@/components/NicheLanding";

export const metadata: Metadata = {
  title: "Evidenca delovnega časa za gostinske lokale (ZEPDSV)",
  description:
    "Restavracija, bar ali kavarna? Za natakarje, kuharje in sezonsko osebje morate voditi evidenco delovnega časa po ZEPDSV. Delovit: žigosanje z mobitelom, izvoz za inšpekcijo. 14 dni brezplačno.",
  keywords: [
    "evidenca delovnega časa gostinstvo",
    "evidenca delovnega časa restavracija",
    "evidenca ur natakar",
    "evidenca delovnega časa bar kavarna",
    "ZEPDSV gostinstvo",
    "evidenca delovnega časa gostinski lokal",
  ],
  alternates: { canonical: "/gostinstvo" },
  openGraph: {
    title: "Evidenca delovnega časa za gostinske lokale",
    description: "Za natakarje, kuharje in sezonce. Žigosanje z mobitelom, izvoz za inšpekcijo.",
    type: "website",
    locale: "sl_SI",
    url: "/gostinstvo",
    siteName: "Delovit",
  },
};

const config: NicheConfig = {
  slug: "gostinstvo",
  breadcrumb: "Evidenca za gostinske lokale",
  badge: "Za gostinske lokale",
  h1a: "Vodite gostinski lokal?",
  h1b: "Evidenco ur morate voditi.",
  heroP: (
    <>
      Za natakarje, kuharje in sezonsko osebje mora <strong>delodajalec</strong> voditi evidenco
      delovnega časa po ZEPDSV. Delovit to uredi v 5 minutah.
    </>
  ),
  roleWord: "Natakar",
  keyTitle: "Sezonci in študentje? Evidenca je vseeno obvezna",
  keyBody:
    "V gostinstvu so urniki neenakomerni, osebje se menja, dela se ob nedeljah in praznikih. Prav zato je evidenca ur pogosto kaos, po ZEPDSV pa jo morate voditi za vsakega, ki dela pri vas, tudi za sezonce in študente.",
  faqIntro: {
    q: "Moram voditi evidenco za sezonsko in študentsko osebje v lokalu?",
    a: "Da. Po ZEPDSV evidenco vodite za vsakega, ki pri vas opravlja delo, ne glede na obliko (redna zaposlitev, sezonsko delo, študentska napotnica). Obveznost nosi delodajalec, kjer oseba dejansko dela, ne študentski servis.",
  },
};

export default function Page() {
  return <NicheLanding config={config} />;
}
