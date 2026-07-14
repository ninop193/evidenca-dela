import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Smartphone,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  BellRing,
  Users,
  Check,
  Scale,
} from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Reveal } from "@/components/Reveal";
import { Faq, type FaqItem } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Wordmark, buttonClasses } from "@/components/ui";
import { YandexMetrika } from "@/components/YandexMetrika";
import { SITE, orgJsonLd, websiteJsonLd } from "@/lib/seo";
import { PLAN } from "@/lib/billing";

// Namenska prodajna stran za komercialne fraze ("aplikacija/program za
// evidenco delovnega časa"). Domača stran ostane brand vstopna točka;
// komercialni anchorji iz blog postov kažejo sem.
export const metadata: Metadata = {
  title: { absolute: "Aplikacija in program za evidenco delovnega časa – Delovit" },
  description:
    "Enostavna aplikacija za evidenco delovnega časa po ZEPDSV. Žigosanje s telefonom, izvoz PDF/Excel za inšpekcijo, opomniki. 19 €/mes za celo podjetje. 14 dni brezplačno, brez kartice.",
  keywords: [
    "aplikacija za evidenco delovnega časa",
    "program za evidenco delovnega časa",
    "evidenca delovnega časa aplikacija",
    "evidenca delovnega časa program",
    "orodje za evidenco delovnega časa",
  ],
  alternates: { canonical: "/evidenca-delovnega-casa" },
  openGraph: {
    title: "Aplikacija in program za evidenco delovnega časa – Delovit",
    description:
      "Žigosanje s telefonom, izvoz PDF/Excel za inšpekcijo, opomniki. 19 €/mes za celo podjetje.",
    type: "website",
    locale: "sl_SI",
    url: "/evidenca-delovnega-casa",
    siteName: "Delovit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aplikacija in program za evidenco delovnega časa – Delovit",
    description:
      "Žigosanje s telefonom, izvoz PDF/Excel za inšpekcijo, opomniki. 19 €/mes za celo podjetje.",
  },
};

const FAQ: FaqItem[] = [
  {
    q: "Koliko stane program za evidenco delovnega časa?",
    a: `Delovit stane ${PLAN.monthlyNet} € + DDV na mesec za celotno podjetje (do 10 oseb) — cena je fiksna, ne na uporabnika. Letni paket je ${PLAN.yearlyNet} € + DDV (2 meseca gratis). Preizkus traja 14 dni, brezplačno in brez kartice.`,
  },
  {
    q: "Ali moram aplikacijo namestiti iz App Stora ali Play Stora?",
    a: "Ne. Delovit deluje v brskalniku na vsakem telefonu in računalniku. Zaposleni si jo lahko doda na domači zaslon telefona in izgleda kot prava aplikacija — brez nameščanja in brez posodabljanja.",
  },
  {
    q: "Je evidenca skladna z ZEPDSV?",
    a: "Da. Evidenca vsebuje vsa polja, ki jih zahteva 18. člen ZEPDSV (prihod, odhod, odmor, nadure, nočno/nedeljsko/praznično delo, odsotnosti z vrsto nadomestila), mesečni izpis pa izvozite v PDF ali Excel z enim klikom.",
  },
  {
    q: "Ali deluje tudi za študente, dijake in s.p. z zaposlenimi?",
    a: "Da. Po 2. členu ZEPDSV se evidenca vodi za vsakogar, ki je vključen v delovni proces — tudi za dijake in študente na napotnici. Delovit loči redno zaposlene in študente ter pri mladoletnih upošteva strožje dnevne meje.",
  },
  {
    q: "Kako poteka registracija delovnega časa v Delovitu?",
    a: "Zaposleni odpre Delovit na telefonu in z enim tapom žigosa prihod, ob koncu dela pa odhod, z možnostjo zabeležke odmora. Registracija delovnega časa je s tem opravljena sproti, brez terminala, kartic ali dodatne opreme, evidenca pa se izpolnjuje sama.",
  },
  {
    q: "Kaj se zgodi, če zaposleni pozabi žigosati odhod?",
    a: "Aplikacija ga na to sama opomni po e-pošti, delodajalec pa dobi obvestilo in vnos, označen za pregled — ure nikoli ne izginejo in se nikoli ne popravijo na skrivaj.",
  },
  {
    q: "Kako hitro lahko začnemo?",
    a: "V manj kot 5 minutah. Registrirate podjetje, dodate zaposlene (vsak dobi povabilo po e-pošti), oni pa žigosajo prihod in odhod kar s telefonom. Brez uvajanja in brez navodil.",
  },
];

export default function EvidencaLandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      orgJsonLd,
      websiteJsonLd,
      {
        "@type": "SoftwareApplication",
        name: "Delovit",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "Aplikacija za evidenco delovnega časa po ZEPDSV za mikro podjetja in s.p. Žigosanje s telefonom, izvoz PDF/Excel, opomniki.",
        url: `${SITE.url}/evidenca-delovnega-casa`,
        offers: {
          "@type": "Offer",
          price: String(PLAN.monthlyNet),
          priceCurrency: "EUR",
          description: `${PLAN.monthlyNet} € + DDV mesečno za celotno podjetje (do 10 oseb). 14 dni brezplačnega preizkusa brez kartice.`,
        },
        publisher: { "@id": `${SITE.url}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Domov", item: SITE.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Aplikacija za evidenco delovnega časa",
            item: `${SITE.url}/evidenca-delovnega-casa`,
          },
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

      {/* HERO */}
      <section className="mx-auto max-w-3xl px-5 pt-14 pb-10 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50/80 px-3.5 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200/70">
            <ShieldCheck className="h-3.5 w-3.5" />
            Skladno z ZEPDSV · novela ZEPDSV-B
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 text-[2.3rem] font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
            Aplikacija za evidenco delovnega časa.
            <br />
            <span className="text-holo">Enostavna kot en gumb.</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Delovit je program za evidenco delovnega časa, narejen za mikro podjetja in s.p.
            Zaposleni žigosajo s telefonom, vi pa mesečno evidenco za inšpekcijo izvozite z enim
            klikom.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="glow-pulse group inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-500"
            >
              Začni brezplačno
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#funkcije"
              className="glass iris-edge inline-flex items-center justify-center rounded-full px-6 py-3.5 text-base font-semibold text-slate-800 transition hover:bg-white/70"
            >
              Kaj vse zna
            </Link>
          </div>
          <p className="mt-3 text-sm font-medium text-brand-700">
            14 dni brezplačno · brez kartice · brez vezave
          </p>
        </Reveal>
      </section>

      {/* FUNKCIJE */}
      <section id="funkcije" className="mx-auto max-w-5xl px-5 py-14">
        <Reveal>
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Vse, kar mora znati program za evidenco delovnega časa
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-slate-600">
            Brez funkcij, ki jih mikro podjetje ne rabi. Z vsem, kar zahteva zakon.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <Smartphone className="h-5 w-5" />,
              title: "Žigosanje z enim tapom",
              text: "Velik gumb na telefonu za prihod in odhod, z zabeležko odmora. Brez nameščanja iz trgovine.",
            },
            {
              icon: <Clock className="h-5 w-5" />,
              title: "Zaposleni vidi svoje ure",
              text: "Vsak zaposleni ima svoj pregled ur, nadur in odsotnosti — mesečno obveščanje po ZEPDSV-B je s tem pokrito.",
            },
            {
              icon: <BellRing className="h-5 w-5" />,
              title: "Opomniki, preden inšpektor",
              text: "Pozabljen odhod? Aplikacija opomni zaposlenega, obvesti vas in vnos označi za pregled. Nič se ne izgubi.",
            },
            {
              icon: <FileSpreadsheet className="h-5 w-5" />,
              title: "Izvoz PDF in Excel",
              text: "Mesečna evidenca z vsemi zakonskimi polji in podpisnim blokom, pripravljena za inšpekcijo ali računovodjo.",
            },
            {
              icon: <Users className="h-5 w-5" />,
              title: "Zaposleni in študenti",
              text: "Redno zaposleni, dijaki in študenti na napotnici — z ločeno oznako in strožjimi mejami za mladoletne.",
            },
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              title: "Podatki varno v EU",
              text: "Vsako podjetje vidi izključno svoje podatke. Hramba v EU, skladno z GDPR.",
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 70} className="h-full">
              <div className="glass iris-edge flex h-full flex-col rounded-3xl p-7">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                  {f.icon}
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ZAKON */}
      <section className="mx-auto max-w-3xl px-5 py-8">
        <Reveal>
          <div className="glass-strong iris-edge rounded-3xl p-7 sm:p-9">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Scale className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Zgrajen okoli ZEPDSV, ne obratno
                </h2>
                <ul className="mt-3 space-y-2 text-slate-600">
                  <li>
                    <strong className="text-slate-800">2. člen:</strong> evidenca se vodi za
                    vsakogar v delovnem procesu — tudi za študente na napotnici.
                  </li>
                  <li>
                    <strong className="text-slate-800">18. člen:</strong> vsa obvezna polja
                    (prihod, odhod, odmor, nadure, posebni pogoji dela, odsotnosti) so vgrajena.
                  </li>
                  <li>
                    <strong className="text-slate-800">19. člen:</strong> evidenca se hrani varno
                    in je delavcu dostopna — vsak zaposleni ima vpogled v svoje ure.
                  </li>
                </ul>
                <p className="mt-4 rounded-2xl bg-white/60 px-4 py-3 text-sm text-slate-500 ring-1 ring-white/70">
                  Brez evidence tvegate globo <strong className="text-slate-700">300–8.000 €</strong>{" "}
                  (za delodajalca do 10 zaposlenih). IRSD je leta 2024 zabeležil 1.145 kršitev.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CENA */}
      <section className="mx-auto max-w-3xl px-5 py-8">
        <Reveal>
          <div className="glass-strong iris-edge rounded-3xl p-8 text-center sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Ena cena za celo podjetje
            </p>
            <p className="mt-3 text-5xl font-extrabold tracking-tight text-slate-900">
              {PLAN.monthlyNet} €
              <span className="text-lg font-semibold text-slate-500"> + DDV / mesec</span>
            </p>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Fiksno, ne na uporabnika. Dva zaposlena ali deset — plačate enako. Letno{" "}
              {PLAN.yearlyNet} € + DDV (2 meseca gratis).
            </p>
            <ul className="mx-auto mt-6 grid max-w-md gap-2 text-left text-sm text-slate-700 sm:grid-cols-2">
              {[
                "Do 10 oseb na podjetje",
                "Žigosanje s telefonom",
                "Vsa zakonska polja ZEPDSV",
                "Izvoz PDF in Excel",
                "Opomniki ob pozabljenem odhodu",
                "Prekličete kadarkoli",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100">
                    <Check className="h-3 w-3 text-brand-600" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="glow-pulse mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-brand-500"
            >
              Preizkusi 14 dni brezplačno
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-sm text-slate-500">Brez kartice. Brez vezave.</p>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="vprasanja" className="mx-auto max-w-3xl px-5 py-14">
        <Reveal>
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Pogosta vprašanja
          </h2>
        </Reveal>
        <Reveal delay={80} className="mt-8 block">
          <Faq items={FAQ} />
        </Reveal>
        <p className="mt-6 text-center text-xs text-slate-400">
          Informativno, ne pravni nasvet. Viri: 2., 18. in 19. člen ZEPDSV ter novela ZEPDSV-B
          (velja od 23. 4. 2025).
        </p>
      </section>

      <Footer />
    </main>
  );
}
