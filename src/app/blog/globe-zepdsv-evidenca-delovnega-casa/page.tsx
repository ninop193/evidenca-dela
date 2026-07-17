import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Footer } from "@/components/Footer";
import { Wordmark, buttonClasses } from "@/components/ui";
import { YandexMetrika } from "@/components/YandexMetrika";
import { SITE, orgJsonLd, websiteJsonLd } from "@/lib/seo";
import { dateSl } from "@/lib/blog";

const SLUG = "globe-zepdsv-evidenca-delovnega-casa";
const PUBLISHED = "2026-06-28";
const URL = `${SITE.url}/blog/${SLUG}`;

export const metadata: Metadata = {
  title: { absolute: "Globe ZEPDSV: evidenca delovnega časa in kako se izogniti" },
  description:
    "IRSD je v 2024 izrekel več kot 1.000 kršitev evidenc. Globe za s.p. do 8.000 €, za d.o.o. do 20.000 €. Lestvica, escalation logika, rešitev.",
  keywords: [
    "globe zepdsv",
    "kazni zepdsv",
    "evidenca delovnega časa globa",
    "inšpektorat za delo evidenca",
    "globa za nevodenje evidence",
  ],
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: {
    title: "Kazni ZEPDSV: kako se izogniti globi za evidenco delovnega časa",
    description:
      "Lestvica glob, zakaj naraščajo, kako poteka inšpekcija in kako se globi izognete.",
    type: "article",
    locale: "sl_SI",
    url: `/blog/${SLUG}`,
    siteName: "Delovit",
    publishedTime: PUBLISHED,
  },
};

const FAQ = [
  {
    q: "Kdo izreka globe po ZEPDSV?",
    a: "Inšpektorat RS za delo (IRSD) v okviru inšpekcijskega nadzora.",
  },
  {
    q: "Ali lahko dobim globo brez predhodnega opozorila?",
    a: "Da. IRSD ni zavezan k predhodnemu opozarjanju; ob nenapovedanem nadzoru je globa lahko izrečena takoj.",
  },
  {
    q: "Kdo vodi evidenco za dijaka ali študenta?",
    a: "Delodajalec, ne študentski servis ali računovodstvo. Velja za vsakega, ki opravlja delo.",
  },
  {
    q: "Ali velja ZEPDSV tudi za krajše ali sezonsko delo?",
    a: "Da. ZEPDSV ne pozna izjeme glede trajanja ali sezonske narave dela.",
  },
  {
    q: "Kolikšna je najnižja in najvišja globa?",
    a: "Za s.p. od 300 do 8.000 €, za pravno osebo od 3.000 do 20.000 €.",
  },
];

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      orgJsonLd,
      websiteJsonLd,
      {
        "@type": "Article",
        headline: "Kazni ZEPDSV: kdo mora voditi evidenco delovnega časa in kako se izogniti globi",
        description:
          "Lestvica glob po ZEPDSV, zakaj naraščajo, kako poteka inšpekcija in kako se globi izognete.",
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
          { "@type": "ListItem", position: 3, name: "Kazni ZEPDSV", item: URL },
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
          <span>· 5 min branja</span>
        </div>

        <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.6rem]">
          Kazni ZEPDSV: kdo mora voditi evidenco delovnega časa{" "}
          <span className="text-holo">in kako se izogniti globi</span>
        </h1>

        <div className="prose-delovit mt-8 space-y-5 text-[17px] leading-relaxed text-slate-700">
          <p>
            Poletna sezona pomeni povečano aktivnost za Inšpektorat RS za delo. IRSD v poletnih
            mesecih sistematično povečuje število nadzorov, statistika pa govori sama zase: skupne
            globe so v prvih devetih mesecih leta 2025 dosegle okoli 3 milijone €, v letu 2024 pa je
            bilo zabeleženih več kot 1.000 kršitev na področju evidenc delovnega časa.
          </p>

          <p>
            Preden preveriš višino glob, je vredno razumeti, kaj{" "}
            <Link
              href="/blog/evidenca-o-izrabi-delovnega-casa"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              evidenca o izrabi delovnega časa
            </Link>{" "}
            sploh mora vsebovati po 18. členu ZEPDSV.
          </p>
          <p>
            Za širši pregled, kaj evidenca delovnega časa sploh mora vsebovati in kdo jo mora
            voditi, si oglej{" "}
            <Link
              href="/blog/evidenca-delovnega-casa-vodnik"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              celoten vodnik po ZEPDSV
            </Link>
            .
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Lestvica glob po ZEPDSV
          </h2>
          <p>Najprej poglejte, koliko dejansko tvegate:</p>
          <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200/70">
            <table className="w-full border-collapse text-left text-[15px]">
              <thead className="bg-white/60 text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Zavezanec</th>
                  <th className="px-4 py-2.5 font-semibold">Razpon globe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-white/40">
                  <td className="px-4 py-2.5 font-medium text-slate-900">Pravna oseba</td>
                  <td className="px-4 py-2.5 text-slate-600">3.000 € do 20.000 €</td>
                </tr>
                <tr className="bg-white/40">
                  <td className="px-4 py-2.5 font-medium text-slate-900">Samostojni podjetnik (s.p.)</td>
                  <td className="px-4 py-2.5 text-slate-600">300 € do 8.000 €</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Escalation logika:</strong> pri ponavljajočih ali hujših kršitvah inšpektorji ne
            posegajo po minimumu. Delodajalec, ki je bil že sankcioniran in evidence ni uredil, ob
            naslednjem nadzoru prejme globo bliže maksimumu.
          </p>
          <p>
            Koliko dejansko tvegaš glede na svojo ekipo in kršitve, preveri v{" "}
            <Link
              href="/kalkulator-glob"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              kalkulatorju glob po ZEPDSV
            </Link>
            .
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Zakaj globe naraščajo?
          </h2>
          <p>IRSD izvaja nenapovedane nadzore in kršitve so takoj vidne:</p>
          <ul className="ml-5 list-disc space-y-2 marker:text-brand-500">
            <li>
              <strong>Digitalizacija nadzora</strong> omogoča hitrejše odkrivanje neskladij med
              prijavljenimi urami in dejanskim stanjem.
            </li>
            <li>
              <strong>Povratniki se kaznujejo strožje</strong> – že opozorjen delodajalec brez
              urejene evidence dobi globo bliže maksimumu.
            </li>
            <li>
              <strong>Sezonski delavci so pogosto prezrti</strong> – s.p.-ji ne vodijo evidence za
              dijake in študente, kar sodi med najpogostejše kršitve.
            </li>
          </ul>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Kako poteka inšpekcijski pregled?
          </h2>
          <p>
            Inšpektor pride brez najave in takoj zahteva dostop do evidence za tekoče in preteklo
            obdobje. Dostop mora biti takojšen. Če evidence ni ali je nepopolna, je to samo po sebi
            razlog za globo.
          </p>
          <TrialButton />

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Najpogostejši razlogi za globo
          </h2>
          <ul className="ml-5 list-disc space-y-2 marker:text-brand-500">
            <li>
              <strong>Zanemarjeno vodenje</strong> – evidence se sploh ne vodi.
            </li>
            <li>
              <strong>Retroaktivno izpolnjevanje</strong> – vnosi se napišejo nazaj ob sumu
              inšpekcije; inšpektorji to prepoznajo.
            </li>
            <li>
              <strong>Nepopolni vnosi</strong> – manjkajo ure začetka, konca ali odmori.
            </li>
            <li>
              <strong>Ni hrambe</strong> – ZEPDSV zahteva hrambo evidence.
            </li>
            <li>
              <strong>Dijaki in študenti</strong> – napačno sklepanje, da zanje obveznost ne velja.
              Velja.
            </li>
          </ul>
          <p>
            Katera polja obrazec sploh mora vsebovati, da se izognete nepopolnim vnosom, najdete v{" "}
            <Link
              href="/blog/evidenca-delovnega-casa-obrazec"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              obrazcu za evidenco delovnega časa
            </Link>{" "}
            za brezplačen prenos.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Kako se izognete globi
          </h2>
          <p>Štiri točke pokrijejo večino tveganj:</p>
          <ol className="ml-5 list-decimal space-y-2 marker:font-semibold marker:text-brand-600">
            <li>Beležite sproti, ne retroaktivno.</li>
            <li>Pokrijte vse delavce, vključno z dijaki in študenti.</li>
            <li>Hranite evidence za zakonsko določeno obdobje.</li>
            <li>Zagotovite sledljivost – sistem beleži, kdaj je bil vnos narejen.</li>
          </ol>
          <p>
            Zakaj Excel pogosto ne zadošča za vse te zahteve, je razloženo v članku{" "}
            <Link
              href="/blog/evidenca-delovnega-casa-excel"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              Evidenca delovnega časa v Excelu: kdaj zadošča in kdaj ne
            </Link>
            .
          </p>
          <p>
            <Link href="/" className="font-semibold text-brand-700 hover:text-brand-800">
              Delovit
            </Link>{" "}
            je zasnovan točno za te zahteve: evidenca je vedno ažurna, vsak vnos dobi žig časa,
            pokrita je celotna ekipa. Poglejte, kako deluje{" "}
            <Link
              href="/evidenca-delovnega-casa"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              program za evidenco delovnega časa
            </Link>
            .
          </p>
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
            Evidenca ni papirologija, je zaščita pred globo. Ko inšpektor potrka, ni časa za
            urejanje. Preizkusite Delovit brezplačno in imejte red ves čas.
          </p>
        </div>

        {/* PRIMARNI CTA */}
        <div className="mt-10 rounded-3xl bg-brand-600 px-7 py-9 text-center text-white">
          <p className="text-xl font-bold">Imejte evidenco pripravljeno za vsak obisk</p>
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
          Informativno, ne pravni nasvet. Razponi glob po ZEPDSV; statistika IRSD je okvirna.
        </p>
      </article>

      <Footer />
    </main>
  );
}
