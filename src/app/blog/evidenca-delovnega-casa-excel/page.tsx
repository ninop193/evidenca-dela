import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, ArrowLeft } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Footer } from "@/components/Footer";
import { Wordmark, buttonClasses } from "@/components/ui";
import { YandexMetrika } from "@/components/YandexMetrika";
import { SITE, orgJsonLd, websiteJsonLd } from "@/lib/seo";
import { dateSl } from "@/lib/blog";

const SLUG = "evidenca-delovnega-casa-excel";
const PUBLISHED = "2026-06-27";
const URL = `${SITE.url}/blog/${SLUG}`;

export const metadata: Metadata = {
  title: { absolute: "Evidenca delovnega časa Excel: vzorec + pasti (ZEPDSV)" },
  description:
    "Brezplačen Excel vzorec za evidenco delovnega časa po ZEPDSV. Kdaj zadošča in kdaj tvegate globo. Prenesi takoj, brez registracije.",
  keywords: [
    "evidenca delovnega časa excel",
    "evidenca delovnega časa vzorec",
    "evidenca delovnega časa tabela",
    "evidenca delovnega časa obrazec",
    "evidenca delovnega časa po novem",
  ],
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: {
    title: "Evidenca delovnega časa v Excelu: zakaj pogosto ni dovolj",
    description:
      "Brezplačen Excel vzorec po ZEPDSV. Kdaj zadošča in kdaj tvegate globo. Prenesi takoj, brez registracije.",
    type: "article",
    locale: "sl_SI",
    url: `/blog/${SLUG}`,
    siteName: "Delovit",
    publishedTime: PUBLISHED,
  },
};

const FAQ = [
  {
    q: "Ali lahko vodim evidenco delovnega časa v Excelu?",
    a: "Da, Excel je zakonsko dovoljena oblika. Zakon ne predpisuje oblike, le vsebino (18. člen ZEPDSV). Pogoj je, da so vnosi sprotni, popolni in hranjeni v skladu z 23. členom ZEPDSV.",
  },
  {
    q: "Kdo mora voditi evidenco delovnega časa za dijaka na napotnici?",
    a: "Delodajalec, ne študentski servis. Servis ureja napotnico in obračun, evidenco delovnega časa pa vodi in hrani delodajalec (18. člen ZEPDSV).",
  },
  {
    q: "Kakšne so globe za neurejeno evidenco delovnega časa?",
    a: "Inšpektorat za delo izreka globe od 300 do 8.000 € za delodajalca posameznika in od 3.000 do 20.000 € za pravno osebo.",
  },
  {
    q: "Kaj mora evidenca delovnega časa vsebovati?",
    a: "Minimalno: datum, ura prihoda, ura odhoda, odmori in skupno število opravljenih ur. Zahteva 18. člen ZEPDSV.",
  },
  {
    q: "Kako dolgo moram hraniti evidenco delovnega časa?",
    a: "Evidenco delovnega časa hranite v skladu z 23. členom ZEPDSV. Priporočljivo je najmanj 5 let.",
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
        headline: "Evidenca delovnega časa v Excelu: zakaj pogosto ni dovolj (+ brezplačen vzorec)",
        description:
          "Brezplačen Excel vzorec za evidenco delovnega časa po ZEPDSV. Kdaj zadošča in kdaj tvegate globo.",
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
          { "@type": "ListItem", position: 3, name: "Evidenca delovnega časa v Excelu", item: URL },
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
          Evidenca delovnega časa v Excelu: zakaj pogosto ni dovolj{" "}
          <span className="text-holo">(+ brezplačen vzorec)</span>
        </h1>

        <div className="prose-delovit mt-8 space-y-5 text-[17px] leading-relaxed text-slate-700">
          <p>
            Poletje pomeni sezonske zaposlitve, dijake na napotnicah in vprašanje, ki ga vsak mikro
            delodajalec postavi vsaj enkrat: „Kje pa sploh vodim evidenco za tega delavca?"
          </p>
          <p>
            Excel je logična prva izbira. Imate ga, znate ga, nič ne stane. In za eno ali dve osebi
            res deluje, a le, če ga uporabljate prav. Zakon ima namreč posebnost, ki marsikaterega
            delodajalca preseneti šele, ko potrka inšpektor.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Kaj zakon zahteva - evidenca delovnega časa po novem
          </h2>
          <p>Po 18. členu ZEPDSV mora delodajalec za vsakega delavca dnevno beležiti:</p>
          <ul className="ml-5 list-disc space-y-1.5 marker:text-brand-500">
            <li>uro prihoda na delo,</li>
            <li>uro odhoda z dela,</li>
            <li>odmor med delovnim časom,</li>
            <li>skupno število opravljenih ur.</li>
          </ul>
          <p>
            Ključna beseda je <strong>delodajalec</strong>. Ne študentski servis, ne računovodstvo,
            vi. Ta obveznost velja enako za dijaka na napotnici kot za redno zaposlenega. 2. člen
            zakona evidenco delovnega časa uvršča med temeljne evidence s področja dela, po zadnji
            noveli ZEPDSV pa so zahteve postale natančnejše, nadzor pa strožji.
          </p>
          <p>
            <strong>Najpogostejša zmota:</strong> „Mislil sem, da to dela servis." Servis ureja
            napotnico in obračun, evidenco delovnega časa pa zakon nalaga vam, delodajalcu.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Zakaj evidenca delovnega časa v Excelu pogosto ne prestane inšpekcije
          </h2>
          <p>
            Excel ni napačna izbira sam po sebi. Napačna je raba, ki jo vidimo pri večini malih
            podjetij in s.p.-jev.
          </p>

          <h3 className="!mt-8 text-xl font-bold text-slate-900">Vnosi za nazaj</h3>
          <p>
            Zakon zahteva <strong>sprotno</strong> beleženje, ne rekonstrukcijo ob koncu tedna ali
            meseca. Inšpektor bo pogledal, kdaj ste datoteko nazadnje urejali. Če se datumi v
            celicah in datum zadnje spremembe ne ujemata, je to rdeča zastavica.
          </p>

          <h3 className="!mt-8 text-xl font-bold text-slate-900">Spremenljivi zapisi brez sledi</h3>
          <p>
            Excel ne beleži, kdo je kaj spremenil in kdaj. Evidenca delovnega časa mora biti
            zanesljiva in sledljiva. V navadni Excel tabeli tega ne morete zagotoviti, ne da bi
            aktivirali posebno zaščito celic ali vodili verzije ročno, kar večina ne počne.
          </p>

          <h3 className="!mt-8 text-xl font-bold text-slate-900">Ročne napake in vrzeli</h3>
          <p>
            Pozabljeni vnos, napačna formula, narobe vpisan datum, pri majhnem podjetju se to zgodi.
            Inšpektorat za delo ne kaznuje posamezne napake, temveč sistemsko nezanesljivost.
            Evidenca z vrzelmi ali nedoslednimi vnosi ne vzdrži pregleda, tudi če so ure dejansko
            bile opravljene.
          </p>
          <p>
            To ne pomeni, da Excel nikoli ne zadošča. Pomeni, da morate biti dosledno natančni vsak
            dan, za vsakega zaposlenega posebej.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Brezplačen vzorec - evidenca delovnega časa Excel tabela
          </h2>
          <p>
            Spodaj najdete brezplačen .xlsx vzorec za evidenco delovnega časa. Vsebuje vse, kar
            zahteva 18. člen ZEPDSV:
          </p>

          <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200/70">
            <table className="w-full border-collapse text-left text-[15px]">
              <thead className="bg-white/60 text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Stolpec</th>
                  <th className="px-4 py-2.5 font-semibold">Opis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ["Datum", "dan in datum"],
                  ["Prihod", "ura in minuta"],
                  ["Odhod", "ura in minuta"],
                  ["Odmor (min)", "skupaj minut odmora"],
                  ["Skupaj ur", "avtomatski izračun"],
                  ["Opomba", "izredne okoliščine, bolniška ipd."],
                ].map(([s, o]) => (
                  <tr key={s} className="bg-white/40">
                    <td className="px-4 py-2.5 font-medium text-slate-900">{s}</td>
                    <td className="px-4 py-2.5 text-slate-600">{o}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* LEAD MAGNET */}
          <div className="!mt-8 flex flex-col items-center gap-3 rounded-3xl bg-emerald-50/70 px-6 py-8 text-center ring-1 ring-emerald-100">
            <a
              href="/vzorec-evidenca-delovnega-casa.xlsx"
              download
              className="glow-pulse inline-flex items-center justify-center gap-2.5 rounded-full bg-emerald-600 px-7 py-4 text-base font-bold text-white shadow-[0_14px_30px_-10px_rgba(5,150,105,0.7)] transition hover:bg-emerald-500"
            >
              <Download className="h-5 w-5" />
              Prenesi brezplačen Excel vzorec (.xlsx)
            </a>
            <p className="text-sm text-slate-500">
              Brez registracije. Ali bi raje, da se ure beležijo samodejno?{" "}
              <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-800">
                Preizkusi Delovit brezplačno →
              </Link>
            </p>
          </div>

          <p>
            <strong>Kdaj vzorec zadostuje:</strong> imate 1-2 zaposlena, ste sami odgovorni za
            dnevne vnose in ob koncu meseca datoteko shranite v nespremenljivi obliki (npr. izvozite
            v PDF). V tem primeru je evidenca delovnega časa obrazec v Excelu povsem zakonita
            rešitev.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Kdaj Excel ni dovolj - in kaj storiti namesto tega
          </h2>
          <p>
            Za podjetja z več zaposlenimi, sezonskimi dijaki in izmenami Excel postane tvegan:
          </p>
          <ul className="ml-5 list-disc space-y-2 marker:text-brand-500">
            <li>
              <strong>Več kot 2 zaposlena</strong> – vrzeli se pomnožijo, dosledno beleženje postane
              zamudno.
            </li>
            <li>
              <strong>Izmene in sezonski delavci</strong> – sledenje postane zapleteno, napake
              verjetnejše.
            </li>
            <li>
              <strong>Hramba</strong> – 23. člen ZEPDSV določa obveznost hrambe evidenc. Excel
              datoteke se izgubijo, prepišejo, pokvarijo.
            </li>
            <li>
              <strong>Globe</strong> od 300 do 8.000 € za delodajalca posameznika, ki evidenc nima
              urejenih, in od 3.000 do 20.000 € za pravno osebo.
            </li>
          </ul>
          <p>
            Rešitev, ki jo vse pogosteje izberejo mikro delodajalci: orodje, ki beleži čas
            samodejno, hrani podatke varno in jih v sekundi izvozi v PDF ali Excel za inšpekcijo.
          </p>
          <p>
            <Link href="/" className="font-semibold text-brand-700 hover:text-brand-800">
              Delovit
            </Link>{" "}
            je bil zasnovan točno za ta scenarij: mikro podjetje, s.p., gostinec, ki poleti
            zaposluje{" "}
            <Link href="/studenti" className="font-semibold text-brand-700 hover:text-brand-800">
              dijaka ali dva
            </Link>{" "}
            in ne želi skrbeti za inšpekcijo.
          </p>

          <div className="!mt-8 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/blog-delovit-zigosanje.png"
              alt="Samodejno beleženje delovnega časa v aplikaciji Delovit, sprotni vpis prihoda in odhoda"
              width={280}
              loading="lazy"
              className="rounded-3xl ring-1 ring-slate-200/70 shadow-[0_20px_50px_-24px_rgba(29,78,216,0.45)]"
            />
          </div>

          {/* SEKUNDARNI CTA */}
          <div className="!mt-8 text-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-brand-500"
            >
              Preizkusi Delovit brezplačno - 14 dni, brez kartice
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Pogosto zastavljena vprašanja
          </h2>
          <div className="space-y-5">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="text-lg font-bold text-slate-900">{f.q}</h3>
                <p className="mt-1.5">{f.a}</p>
              </div>
            ))}
          </div>

          <p className="!mt-10">
            Excel vzorec je dober začetek. Ko pa pride poletna sezona, napotnice in izmene, je
            dosledno ročno beleženje tisto, ki ga podjetja najpogosteje zamudijo.
          </p>
          <p>
            Delovit poskrbi, da evidenca nastaja sproti in samodejno, in da ste vedno pripravljeni
            na inšpekcijo.
          </p>
        </div>

        {/* PRIMARNI CTA */}
        <div className="mt-10 rounded-3xl bg-brand-600 px-7 py-9 text-center text-white">
          <p className="text-xl font-bold">Začnite brez papirjev in skrbi</p>
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
          Informativno, ne pravni nasvet. Viri: 2., 18. in 23. člen ZEPDSV.
        </p>
      </article>

      <Footer />
    </main>
  );
}
