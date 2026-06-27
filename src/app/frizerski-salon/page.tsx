import type { Metadata } from "next";
import { NicheLanding, type NicheConfig } from "@/components/NicheLanding";

export const metadata: Metadata = {
  title: "Evidenca delovnega časa za frizerske in lepotne salone (ZEPDSV)",
  description:
    "Vodite frizerski ali lepotni salon? Za frizerje, kozmetičarke in vajence morate voditi evidenco delovnega časa po ZEPDSV. Delovit: žigosanje z mobitelom, izvoz za inšpekcijo. 14 dni brezplačno.",
  keywords: [
    "evidenca delovnega časa frizerski salon",
    "evidenca ur frizer",
    "evidenca delovnega časa kozmetični salon",
    "ZEPDSV salon",
    "evidenca delovnega časa kozmetičarka",
    "evidenca delovnega časa lepotni salon",
  ],
  alternates: { canonical: "/frizerski-salon" },
  openGraph: {
    title: "Evidenca delovnega časa za frizerske in lepotne salone",
    description: "Za frizerje, kozmetičarke in vajence. Žigosanje z mobitelom, izvoz za inšpekcijo.",
    type: "website",
    locale: "sl_SI",
    url: "/frizerski-salon",
    siteName: "Delovit",
  },
};

const config: NicheConfig = {
  slug: "frizerski-salon",
  breadcrumb: "Evidenca za salone",
  badge: "Za frizerske in lepotne salone",
  h1a: "Vodite salon?",
  h1b: "Evidenco ur morate voditi.",
  heroP: (
    <>
      Za frizerje, kozmetičarke in vajence mora <strong>delodajalec</strong> voditi evidenco
      delovnega časa po ZEPDSV. Delovit to uredi v 5 minutah.
    </>
  ),
  roleWord: "Frizer",
  keyTitle: "Najem stola, vajenci in skrajšani čas? Evidenca je obvezna",
  keyBody:
    "V salonih je delo pogosto fleksibilno, z vajenci, krajšim delovnim časom in delom ob sobotah. Za vsakega zaposlenega, ki dela pri vas, morate po ZEPDSV voditi evidenco delovnega časa.",
  faqIntro: {
    q: "Moram voditi evidenco za vajence in zaposlene s krajšim delovnim časom?",
    a: "Da. Po ZEPDSV evidenco vodite za vsakogar, ki pri vas opravlja delo in je vključen v delovni proces, vključno z vajenci in zaposlenimi s krajšim delovnim časom. Obveznost nosi delodajalec.",
  },
};

export default function Page() {
  return <NicheLanding config={config} />;
}
