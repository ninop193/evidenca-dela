// Centralna SEO konfiguracija — en vir resnice za meta podatke.
import { PLAN } from "@/lib/billing";

export const SITE = {
  name: "Delovit",
  url: "https://www.delovit.si",
  // Privzeti (domača stran) naslov in opis — ciljajo glavne iskane besede.
  title: "Delovit | Evidenca delovnega časa za mikro podjetja (ZEPDSV)",
  description:
    "Preprosta evidenca delovnega časa za mikro podjetja in s.p. Skladno z ZEPDSV, žigosanje z mobitelom, izvoz za inšpekcijo v PDF in Excel. Fiksna cena na podjetje, brez vezave.",
  locale: "sl_SI",
  lang: "sl",
  keywords: [
    "evidenca delovnega časa",
    "evidenca delovnega časa ZEPDSV",
    "evidenca ur",
    "evidenca delovnega časa zakon",
    "registracija delovnega časa",
    "ura prihoda odhoda",
    "evidenca dela",
    "delovni čas aplikacija",
    "evidenca delovnega časa s.p.",
    "ZEPDSV-B",
  ],
  twitter: "@delovit",
  monthlyNet: PLAN.monthlyNet,
};

// Organizacija + spletna stran (skupno strukturirano ozadje za vse strani).
export const orgJsonLd = {
  "@type": "Organization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/icon-512.png`,
  email: "info@delovit.si",
  areaServed: "SI",
  parentOrganization: {
    "@type": "Organization",
    name: "NextEra d.o.o.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bantanova ulica 2",
      postalCode: "2000",
      addressLocality: "Maribor",
      addressCountry: "SI",
    },
  },
};

export const websiteJsonLd = {
  "@type": "WebSite",
  "@id": `${SITE.url}/#website`,
  url: SITE.url,
  name: SITE.name,
  inLanguage: SITE.lang,
  publisher: { "@id": `${SITE.url}/#organization` },
};
