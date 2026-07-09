import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Footer } from "@/components/Footer";
import { Wordmark, buttonClasses } from "@/components/ui";
import { YandexMetrika } from "@/components/YandexMetrika";
import { SITE, orgJsonLd, websiteJsonLd } from "@/lib/seo";
import { dateSl } from "@/lib/blog";

const SLUG = "prazniki-dela-prosti-dnevi-2026";
const PUBLISHED = "2026-07-02";
const URL = `${SITE.url}/blog/${SLUG}`;
const DESC =
  "Koledar dela prostih dni 2026 (15 praznikov, 8 na vikend), podaljšani vikendi za dopust in kako praznik pravilno vpišete v evidenco delovnega časa po ZEPDSV.";

export const metadata: Metadata = {
  title: { absolute: "Prazniki in dela prosti dnevi 2026: koledar in evidenca" },
  description: DESC,
  keywords: [
    "prazniki 2026",
    "dela prosti dnevi 2026",
    "koledar praznikov 2026",
    "podaljšani vikendi 2026",
    "praznik evidenca delovnega časa",
  ],
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: {
    title: "Prazniki in dela prosti dnevi 2026: koledar in evidentiranje",
    description: DESC,
    type: "article",
    locale: "sl_SI",
    url: `/blog/${SLUG}`,
    siteName: "Delovit",
    publishedTime: PUBLISHED,
  },
  twitter: {
    card: "summary_large_image",
    title: "Prazniki in dela prosti dnevi 2026: koledar in evidentiranje",
    description: DESC,
  },
};

const FAQ = [
  {
    q: "Koliko dela prostih dni ima leto 2026?",
    a: "15, od tega jih 8 pade na soboto ali nedeljo.",
  },
  {
    q: "Ali dobim nadomestni prosti dan, če praznik pade na soboto?",
    a: "Ne. Slovenska zakonodaja nadomestnih prostih dni ne pozna.",
  },
  {
    q: "Ali je delo na praznik plačano več?",
    a: "Da, delavcu pripada dodatek po kolektivni pogodbi. Pogoj je, da so opravljene ure razvidne iz evidence.",
  },
  {
    q: "Ali se praznik v evidenci vpiše kot dopust?",
    a: "Ne. Praznik je dela prost dan z nadomestilom plače, dopust je ločena kategorija.",
  },
];

const CALENDAR: [string, string, string][] = [
  ["1. 1.", "četrtek", "novo leto"],
  ["2. 1.", "petek", "novo leto"],
  ["8. 2.", "nedelja", "Prešernov dan"],
  ["5. 4.", "nedelja", "velikonočna nedelja"],
  ["6. 4.", "ponedeljek", "velikonočni ponedeljek"],
  ["27. 4.", "ponedeljek", "dan upora proti okupatorju"],
  ["1. 5.", "petek", "praznik dela"],
  ["2. 5.", "sobota", "praznik dela"],
  ["24. 5.", "nedelja", "binkoštna nedelja"],
  ["25. 6.", "četrtek", "dan državnosti"],
  ["15. 8.", "sobota", "Marijino vnebovzetje"],
  ["31. 10.", "sobota", "dan reformacije"],
  ["1. 11.", "nedelja", "dan spomina na mrtve"],
  ["25. 12.", "petek", "božič"],
  ["26. 12.", "sobota", "dan samostojnosti in enotnosti"],
];

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      orgJsonLd,
      websiteJsonLd,
      {
        "@type": "Article",
        headline: "Prazniki in dela prosti dnevi 2026: koledar in evidentiranje",
        description: DESC,
        datePublished: PUBLISHED,
        dateModified: PUBLISHED,
        inLanguage: "sl",
        mainEntityOfPage: URL,
        author: { "@type": "Organization", name: "Delovit" },
        publisher: { "@id": `${SITE.url}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Domov", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
          { "@type": "ListItem", position: 3, name: "Prazniki 2026", item: URL },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  const TrialButton = () => (
    <div className="!mt-8 text-center">
      <Link
        href="/register"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-brand-500"
      >
        Preizkusite Delovit brezplačno - 14 dni, brez kartice
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );

  return (
    <main className="relative min-h-screen text-slate-800">
      <Aurora />
      <YandexMetrika />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* NAV */}
      <header className="sticky top-0 z-30 px-4 pt-4">
        <div className="glass-strong iris-edge mx-auto flex max-w-5xl items-center justify-between rounded-full px-5 py-2.5">
          <Link href="/">
            <Wordmark className="relative z-10" />
          </Link>
          <Link href="/register" className={buttonClasses("primary", "sm")}>
            Začni brezplačno
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-2xl px-5 pt-10 pb-16">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Vsi članki
        </Link>

        <div className="mt-5 flex items-center gap-3 text-xs font-medium text-slate-400">
          <time dateTime={PUBLISHED}>{dateSl(PUBLISHED)}</time>
          <span>· 4 min branja</span>
        </div>

        <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.6rem]">
          Prazniki in dela prosti dnevi 2026:{" "}
          <span className="text-holo">koledar in evidentiranje</span>
        </h1>

        <div className="prose-delovit mt-8 space-y-5 text-[17px] leading-relaxed text-slate-700">
          <p>
            Leto 2026 ima 15 dela prostih dni, ampak kar 8 jih pade na soboto ali nedeljo. Kdor
            dela od ponedeljka do petka, dobi torej samo 7 „pravih" prostih dni. Spodaj je celoten
            koledar, mostovi, kjer se dopust najbolj splača, in kako praznik pravilno vpišete v
            evidenco delovnega časa.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Koledar dela prostih dni 2026
          </h2>
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <div className="min-w-[420px] overflow-hidden rounded-2xl ring-1 ring-slate-200/70">
              <table className="w-full border-collapse text-left text-[15px]">
                <thead className="bg-white/60 text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Datum</th>
                    <th className="px-4 py-2.5 font-semibold">Dan</th>
                    <th className="px-4 py-2.5 font-semibold">Praznik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CALENDAR.map(([datum, dan, praznik]) => (
                    <tr key={datum + praznik} className="bg-white/40">
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-900">{datum}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">{dan}</td>
                      <td className="px-4 py-2.5 text-slate-600">{praznik}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p>
            Državni prazniki, ki niso dela prosti: 8. 6. (dan Primoža Trubarja), 17. 8. (združitev
            prekmurskih Slovencev), 15. 9. (vrnitev Primorske), 23. 9. (dan slovenskega športa), 25.
            10. (dan suverenosti), 23. 11. (dan Rudolfa Maistra).
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Podaljšani vikendi 2026: kje se dopust najbolj splača
          </h2>
          <ul className="ml-5 list-disc space-y-2 marker:text-brand-500">
            <li>
              <strong>Novo leto:</strong> četrtek in petek prineseta 4 dni prosto brez dopusta (1.
              do 4. 1.)
            </li>
            <li>
              <strong>Prvomajski most:</strong> 3 dnevi dopusta (28. do 30. 4.) pomenijo 9 dni
              prosto (25. 4. do 3. 5.)
            </li>
            <li>
              <strong>Dan državnosti:</strong> 1 dan dopusta (petek, 26. 6.) prinese 4 dni prosto
            </li>
            <li>
              <strong>Božič in novo leto:</strong> 4 dnevi dopusta (28. do 31. 12.) pomenijo 10 dni
              prosto, od 25. 12. 2026 do 3. 1. 2027
            </li>
          </ul>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Kako se praznik evidentira
          </h2>
          <p>
            Tu se koledar sreča z ZEPDSV, ker mora biti evidenca delovnega časa pravilna tudi na
            praznik:
          </p>
          <ul className="ml-5 list-disc space-y-2 marker:text-brand-500">
            <li>
              <strong>Praznik na delovni dan</strong> se vpiše kot dela prost dan z nadomestilom
              plače, ne kot dopust. Najpogostejša napaka: praznik, vpisan kot dopust, pokvari saldo
              dopusta za cel kolektiv.
            </li>
            <li>
              <strong>Delo na praznik</strong> mora biti iz evidence razvidno do ure natančno, ker
              je podlaga za obračun dodatka po kolektivni pogodbi.
            </li>
            <li>
              <strong>Praznik na vikend</strong> ne prinese nadomestnega prostega dne. V evidenci za
              delavce pon-pet ni posebnosti.
            </li>
            <li>
              <strong>Dijaki in študenti:</strong> evidenca velja tudi zanje, tudi za delo na
              praznik. Gostinstvo in trgovina, kjer študenti na praznike najpogosteje delajo, sta
              med bolj nadzorovanimi panogami.
            </li>
          </ul>
          <p>
            Kako praznik pravilno vpisati v obrazec, si oglejte v{" "}
            <Link
              href="/blog/evidenca-delovnega-casa-obrazec"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              obrazcu za evidenco delovnega časa
            </Link>
            .
          </p>
          <p>
            V Excelu ali na papirju to pomeni ročno označevanje 15 datumov in ločeno računanje ur za
            dodatke.{" "}
            <Link
              href="/evidenca-delovnega-casa"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              Digitalna evidenca delovnega časa
            </Link>{" "}
            praznike označi samodejno, delo na praznik pa je v izvozu ločeno vidno.
          </p>
          <p>Preizkusite Delovit brezplačno. Koledar praznikov 2026 je že vgrajen.</p>
          <TrialButton />

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Pogosta vprašanja
          </h2>
          <div className="space-y-5">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="text-lg font-bold text-slate-900">{f.q}</h3>
                <p className="mt-1.5">{f.a}</p>
              </div>
            ))}
          </div>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">Zaključek</h2>
          <p>
            Koledar si shranite, evidenco pa prepustite sistemu, ki praznike pozna sam. Preizkusite
            Delovit brezplačno.
          </p>
        </div>

        {/* PRIMARNI CTA */}
        <div className="mt-10 rounded-3xl bg-brand-600 px-7 py-9 text-center text-white">
          <p className="text-xl font-bold">Koledar praznikov je že vgrajen</p>
          <p className="mx-auto mt-2 max-w-md text-brand-50/90">
            Ustvarite račun, dodajte ekipo in v 5 minutah žigosajte prvi prihod.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Začni brezplačno - 14 dni, brez kartice
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Informativno, ne pravni nasvet. Koledar dela prostih dni po veljavnem zakonu o praznikih.
        </p>
      </article>

      <Footer />
    </main>
  );
}
