import type { Metadata } from "next";
import { NicheLanding, type NicheConfig } from "@/components/NicheLanding";

export const metadata: Metadata = {
  title: "Evidenca delovnega časa za trgovine (ZEPDSV)",
  description:
    "Imate trgovino? Za prodajalce, blagajnike in pomožno osebje morate voditi evidenco delovnega časa po ZEPDSV. Delovit: žigosanje z mobitelom, izvoz za inšpekcijo. 14 dni brezplačno.",
  keywords: [
    "evidenca delovnega časa trgovina",
    "evidenca ur prodajalec",
    "evidenca delovnega časa blagajnik",
    "ZEPDSV trgovina",
    "evidenca delovnega časa špecerija",
    "evidenca delovnega časa trgovina z živili",
  ],
  alternates: { canonical: "/trgovina" },
  openGraph: {
    title: "Evidenca delovnega časa za trgovine",
    description: "Za prodajalce in blagajnike. Žigosanje z mobitelom, izvoz za inšpekcijo.",
    type: "website",
    locale: "sl_SI",
    url: "/trgovina",
    siteName: "Delovit",
  },
};

const config: NicheConfig = {
  slug: "trgovina",
  breadcrumb: "Evidenca za trgovine",
  badge: "Za trgovine",
  h1a: "Vodite trgovino?",
  h1b: "Evidenco ur morate voditi.",
  heroP: (
    <>
      Za prodajalce, blagajnike in pomožno osebje mora <strong>delodajalec</strong> voditi evidenco
      delovnega časa po ZEPDSV. Delovit to uredi v 5 minutah.
    </>
  ),
  roleWord: "Prodajalec",
  keyTitle: "Izmene, vikendi in skrajšani delovni čas? Evidenca je obvezna",
  keyBody:
    "V trgovini se dela v izmenah, ob vikendih in praznikih, pogosto s krajšim delovnim časom in dijaki ob špicah. Evidenco delovnega časa po ZEPDSV morate voditi za vsakega zaposlenega, ne glede na obseg dela.",
  faqIntro: {
    q: "Moram voditi evidenco za delavce s krajšim delovnim časom in dijake?",
    a: "Da. Po ZEPDSV evidenco vodite za vsakega, ki pri vas opravlja delo, vključno z delom s krajšim delovnim časom, dijaki in študenti na napotnici. Obveznost nosi delodajalec.",
  },
};

export default function Page() {
  return <NicheLanding config={config} />;
}
