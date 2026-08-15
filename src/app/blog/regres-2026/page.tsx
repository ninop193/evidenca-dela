import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Footer } from "@/components/Footer";
import { Wordmark, buttonClasses } from "@/components/ui";
import { YandexMetrika } from "@/components/YandexMetrika";
import { SITE, orgJsonLd, websiteJsonLd } from "@/lib/seo";
import { dateSl } from "@/lib/blog";

const SLUG = "regres-2026";
const PUBLISHED = "2026-08-15";
const URL = `${SITE.url}/blog/${SLUG}`;
const DESC =
  "Regres za letni dopust 2026: koliko znaša, do kdaj ga mora delodajalec izplačati, za koga velja, kako se obdavči in kako se izračuna sorazmerni del.";

export const metadata: Metadata = {
  title: { absolute: "Regres 2026: koliko, kdaj in za koga (z izračunom)" },
  description: DESC,
  keywords: [
    "regres 2026",
    "regres za letni dopust",
    "koliko regresa 2026",
    "kdaj izplačilo regresa",
    "obdavčitev regresa",
    "sorazmerni regres",
  ],
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: {
    title: "Regres 2026: koliko, kdaj in za koga",
    description: DESC,
    type: "article",
    locale: "sl_SI",
    url: `/blog/${SLUG}`,
    siteName: "Delovit",
    publishedTime: PUBLISHED,
  },
  twitter: {
    card: "summary_large_image",
    title: "Regres 2026: koliko, kdaj in za koga",
    description: DESC,
  },
};

const FAQ = [
  {
    q: "Koliko znaša regres 2026?",
    a: "Najmanj toliko kot minimalna plača (bruto). Zgornje meje ni — delodajalec (ali kolektivna pogodba) lahko določi več. Točen znesek minimalne plače za 2026 preverite pri MDDSZ oziroma v uradnem listu.",
  },
  {
    q: "Do kdaj mora delodajalec izplačati regres?",
    a: "Najkasneje do 1. julija tekočega leta. Izjemoma, če ima delodajalec likvidnostne težave in tako dopušča kolektivna pogodba na ravni dejavnosti, se rok lahko podaljša najdlje do 1. novembra.",
  },
  {
    q: "Ali se regres všteva v plačo in ali je obdavčen?",
    a: "Regres ni del plače, je ločeno letno izplačilo. Do višine povprečne mesečne plače v Sloveniji je oproščen prispevkov in dohodnine; del regresa nad tem zneskom se obdavči. Uradno povprečno plačo objavlja SURS.",
  },
  {
    q: "Ali dobi regres delavec, ki je zaposlen le del leta?",
    a: "Da, a sorazmerno. Za vsak mesec zaposlitve v koledarskem letu pripada 1/12 regresa. Kdor je zaposlen pol leta, dobi polovico; pri krajšem delovnem času je regres sorazmeren delovnemu času.",
  },
  {
    q: "Ali dobi regres študent ali dijak?",
    a: "Ne. Regres za letni dopust pripada delavcem v delovnem razmerju, ki imajo pravico do letnega dopusta. Študentsko in dijaško delo prek napotnice ni delovno razmerje, zato ta pravica ne velja.",
  },
  {
    q: "Kaj če delodajalec regresa ne izplača?",
    a: "To je kršitev delovnopravne zakonodaje. Delavec lahko izplačilo terja, nadzor pa izvaja Inšpektorat RS za delo (IRSD). Neizplačan regres je pogosta točka inšpekcijskega pregleda.",
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
        headline: "Regres 2026: koliko, kdaj in za koga (z izračunom)",
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
          { "@type": "ListItem", position: 3, name: "Regres 2026", item: URL },
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
          <span>· 6 min branja</span>
        </div>

        <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.6rem]">
          Regres 2026:{" "}
          <span className="text-holo">koliko, kdaj in za koga</span>
        </h1>

        <div className="prose-delovit mt-8 space-y-5 text-[17px] leading-relaxed text-slate-700">
          <p>
            Regres za letni dopust je zakonska pravica vsakega delavca, ki je upravičen do letnega
            dopusta — ne bonus po presoji delodajalca. Spodaj je vse, kar morate vedeti za leto 2026:
            koliko regres znaša, do kdaj ga mora delodajalec izplačati, za koga velja, kako se
            obdavči in kako izračunate sorazmerni del, če delavec ni bil zaposlen celo leto.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Koliko znaša regres 2026?
          </h2>
          <p>
            Zakon določa <strong>spodnjo mejo</strong>, ne zgornje: regres mora znašati{" "}
            <strong>najmanj toliko kot minimalna plača</strong> (bruto). Delodajalec lahko izplača
            več — pogosto to določa kolektivna pogodba dejavnosti ali interni akt. Zgornje meje
            zakon ne postavlja, jo pa posredno postavlja obdavčitev (več o tem spodaj).
          </p>
          <p className="rounded-2xl bg-white/60 px-4 py-3 text-[15px] text-slate-500 ring-1 ring-white/70">
            Točen znesek minimalne plače za 2026 se vsako leto na novo določi. Preverite ga pri
            MDDSZ oziroma v uradnem listu — v tem članku namenoma ne navajamo konkretne številke, da
            ne bi zavedla.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Do kdaj mora biti regres izplačan
          </h2>
          <p>
            Praviloma <strong>do 1. julija</strong> tekočega leta. Izjema velja le, če ima
            delodajalec likvidnostne težave in to dopušča kolektivna pogodba na ravni dejavnosti —
            takrat se rok lahko podaljša <strong>najdlje do 1. novembra</strong>. Kdor tega roka ne
            spoštuje, krši zakon; neizplačan ali prepozno izplačan regres je pogosta točka
            inšpekcijskega pregleda.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Za koga velja (in za koga ne)
          </h2>
          <ul className="ml-5 list-disc space-y-2 marker:text-brand-500">
            <li>
              <strong>Vsi delavci v delovnem razmerju</strong> s pravico do letnega dopusta — za
              nedoločen in določen čas, polni in krajši delovni čas.
            </li>
            <li>
              <strong>Novo zaposleni in tisti, ki odidejo med letom:</strong> pripada jim
              sorazmerni del (glej izračun spodaj).
            </li>
            <li>
              <strong>Ne velja za študente in dijake</strong> na napotnici — to ni delovno razmerje,
              zato pravica do regresa za letni dopust ne nastane.
            </li>
          </ul>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Kako se obdavči regres
          </h2>
          <p>
            Regres ni del plače, ampak ločeno letno izplačilo. Do višine <strong>povprečne mesečne
            plače v Sloveniji</strong> je oproščen prispevkov in dohodnine; kar je izplačano{" "}
            <em>nad</em> tem zneskom, se obdavči kot drugi dohodki iz zaposlitve. Zato je regres do
            zneska povprečne plače za delavca »neto« ugoden, delodajalcu pa do te meje ne poveča
            prispevkov. Uradno povprečno plačo objavlja SURS — za natančno mejo obdavčitve v 2026
            uporabite veljavni podatek.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Izračun sorazmernega regresa
          </h2>
          <p>
            Če delavec ni bil zaposlen celo koledarsko leto ali dela s krajšim delovnim časom, se
            regres izračuna sorazmerno:
          </p>
          <ul className="ml-5 list-disc space-y-2 marker:text-brand-500">
            <li>
              <strong>Po mesecih zaposlitve:</strong> za vsak dopolnjen mesec zaposlitve v letu
              pripada <strong>1/12</strong> regresa. Primer: kdor se zaposli 1. julija, je do konca
              leta zaposlen 6 mesecev → <strong>6/12 = polovica</strong> polnega regresa.
            </li>
            <li>
              <strong>Po delovnem času:</strong> pri krajšem delovnem času je regres sorazmeren
              obsegu ur. Primer: 20 ur na teden pri polnem 40-urnem tednu → <strong>50 %</strong>{" "}
              polnega regresa.
            </li>
          </ul>
          <p>
            Ključni pogoj za pravilen izračun je urejena evidenca: datum nastopa in prenehanja dela,
            dogovorjeni tedenski delovni čas in izraba letnega dopusta. Prav ti podatki so podlaga za
            sorazmerni regres — in prav te vodi{" "}
            <Link
              href="/evidenca-delovnega-casa"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              aplikacija za evidenco delovnega časa
            </Link>
            , vključno s pregledom dopusta za vsakega zaposlenega.
          </p>
          <p>
            Regres je vezan na letni dopust, praznike in odsotnosti pa vpisujete v isto evidenco.
            Kako pravilno beležiti dela proste dni, si oglejte v članku{" "}
            <Link
              href="/blog/prazniki-dela-prosti-dnevi-2026"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              prazniki in dela prosti dnevi 2026
            </Link>
            , celoten okvir obveznosti pa v{" "}
            <Link
              href="/blog/evidenca-delovnega-casa-vodnik"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              vodniku po evidenci delovnega časa
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
            Regres je pravica, ne nagrada: vsaj v višini minimalne plače, praviloma do 1. julija,
            sorazmerno za tiste, ki niso zaposleni celo leto. Za pravilen izračun potrebujete
            urejeno evidenco dela in dopusta — to pa je natanko tisto, kar Delovit vodi namesto vas.
          </p>
        </div>

        {/* PRIMARNI CTA */}
        <div className="mt-10 rounded-3xl bg-brand-600 px-7 py-9 text-center text-white">
          <p className="text-xl font-bold">Evidenca dela in dopusta na enem mestu</p>
          <p className="mx-auto mt-2 max-w-md text-brand-50/90">
            Delovit vodi ure, dopust in odsotnosti — podlago za pravilen regres in obračun.
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
          Informativno, ne pravni nasvet. Zneski minimalne in povprečne plače se za 2026 preverijo
          pri MDDSZ oziroma SURS.
        </p>
      </article>

      <Footer />
    </main>
  );
}
