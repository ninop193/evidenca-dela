import type { Metadata } from "next";
import Link from "next/link";
import { Aurora } from "@/components/Aurora";
import { Reveal } from "@/components/Reveal";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Wordmark, buttonClasses } from "@/components/ui";
import { SITE, orgJsonLd, websiteJsonLd } from "@/lib/seo";
import { YandexMetrika } from "@/components/YandexMetrika";
import GlobCalculator from "./GlobCalculator";

// Cilja "kalkulator" intent (razpon tveganja), ne kanibalizira blog posta o
// globah (ki cilja "globe zepdsv / kazni zepdsv").
export const metadata: Metadata = {
  title: { absolute: "Kalkulator glob ZEPDSV: koliko tvegate brez evidence | Delovit" },
  description:
    "Brezplačen kalkulator glob po ZEPDSV. V 20 sekundah izračunaj razpon globe za nevodenje evidence delovnega časa za s.p. ali pravno osebo. Brez registracije.",
  keywords: [
    "kalkulator glob zepdsv",
    "globe zepdsv kalkulator",
    "evidenca delovnega časa globa kalkulator",
    "izračun globe zepdsv",
    "kalkulator kazni zepdsv",
  ],
  alternates: { canonical: "/kalkulator-glob" },
  openGraph: {
    title: "Kalkulator glob ZEPDSV: koliko tvegate brez evidence",
    description:
      "V 20 sekundah izračunaj razpon globe za nevodenje evidence delovnega časa. Brezplačno, brez registracije.",
    type: "website",
    locale: "sl_SI",
    url: "/kalkulator-glob",
    siteName: "Delovit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kalkulator glob ZEPDSV",
    description: "Izračunaj razpon globe za nevodenje evidence delovnega časa po ZEPDSV.",
  },
};

const faq = [
  {
    q: "Kako natančen je ta kalkulator glob?",
    a: "Kalkulator prikaže zakonski razpon globe po ZEPDSV glede na tip zavezanca (s.p. ali pravna oseba). Dejansko višino globe znotraj razpona odmeri inšpektorat glede na okoliščine: resnost in ponavljanje kršitev, število prizadetih delavcev in sodelovanje pri nadzoru.",
  },
  {
    q: "Kakšna je globa za odgovorno osebo?",
    a: "ZEPDSV poleg globe za delodajalca (pravno osebo ali s.p.) predvideva tudi ločeno globo za odgovorno osebo delodajalca. Njeno višino odmeri inšpektorat glede na okoliščine posameznega primera, zato je v tem informativnem izračunu ne navajamo v znesku.",
  },
  {
    q: "Ali globa velja tudi za študente in dijake na napotnici?",
    a: "Da. Delodajalec mora voditi evidenco delovnega časa tudi za dijake in študente na napotnici. Opustitev je enako kršitev kot pri redno zaposlenih in je med najpogostejšimi razlogi za globo.",
  },
  {
    q: "Kako se izognem globi?",
    a: "S sprotnim vodenjem popolne evidence za vse (redne zaposlene in študente) ter hrambo za predpisano dobo. Digitalno orodje, kot je Delovit, evidenco vodi samodejno in jo v sekundi izvozi za inšpekcijo.",
  },
];

export default function KalkulatorGlobPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      orgJsonLd,
      websiteJsonLd,
      {
        "@type": "WebApplication",
        name: "Kalkulator glob ZEPDSV",
        url: `${SITE.url}/kalkulator-glob`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        inLanguage: "sl",
        publisher: { "@id": `${SITE.url}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Domov", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Kalkulator glob ZEPDSV", item: `${SITE.url}/kalkulator-glob` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <main className="relative min-h-screen text-slate-800">
      <Aurora />
      <YandexMetrika />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="sticky top-0 z-20 px-3 pt-3">
        <div className="glass iris-edge mx-auto flex max-w-3xl items-center justify-between rounded-full px-4 py-2.5">
          <Link href="/">
            <Wordmark />
          </Link>
          <Link href="/register" className={buttonClasses("primary", "sm")}>
            Začni brezplačno
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Kalkulator glob po ZEPDSV
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Nimaš urejene evidence delovnega časa? Vpiši ekipo in kršitve ter takoj vidiš razpon
          globe, ki ti grozi po ZEPDSV. Brezplačno, brez registracije.
        </p>

        <Reveal className="mt-8 block">
          <GlobCalculator />
        </Reveal>

        {/* SEO besedilo + interni linki */}
        <section className="mt-14 space-y-10">
          <Reveal>
            <div className="glass iris-edge sheen rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-900">Kako inšpektorat odmeri globo</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Inšpektorat RS za delo (IRSD) izreka globe po ZEPDSV v razponu, ki je odvisen od
                tipa zavezanca. Za samostojnega podjetnika (s.p.) znaša od 300 do 8.000 €, za pravno
                osebo od 3.000 do 20.000 €. Znotraj razpona inšpektor upošteva resnost in
                ponavljanje kršitev: pri hujših ali ponovljenih kršitvah ne posega po minimumu.
                Podrobno razlago najdeš v postu{" "}
                <Link
                  href="/blog/globe-zepdsv-evidenca-delovnega-casa"
                  className="font-semibold text-brand-700 hover:text-brand-800"
                >
                  kazni ZEPDSV in kako se izogniti globi
                </Link>
                , celoten pravni okvir pa v{" "}
                <Link
                  href="/blog/evidenca-delovnega-casa-vodnik"
                  className="font-semibold text-brand-700 hover:text-brand-800"
                >
                  vodniku po evidenci delovnega časa
                </Link>
                .
              </p>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <h2 className="text-xl font-bold text-slate-900">Pogosta vprašanja</h2>
            </Reveal>
            <Reveal delay={80} className="mt-4 block">
              <Faq items={faq} defaultOpen={null} />
            </Reveal>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
