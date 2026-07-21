import type { Metadata } from "next";
import Link from "next/link";
import {
  Percent,
  Repeat,
  Users,
  TrendingUp,
  FileText,
  UserPlus,
  ShieldCheck,
  HandCoins,
} from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Reveal } from "@/components/Reveal";
import { Faq, type FaqItem } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Wordmark } from "@/components/ui";
import { YandexMetrika } from "@/components/YandexMetrika";
import { SITE, orgJsonLd, websiteJsonLd } from "@/lib/seo";
import { PartnerMailButton } from "./PartnerMailButton";

export const metadata: Metadata = {
  title: { absolute: "Partnerski program Delovit: 50 % provizije za partnerje" },
  description:
    "Pripeljite stranke v Delovit in prejmite 50 % naročnine za vsako pridobljeno podjetje, vsak mesec. Odprto za računovodje, svetovalce, freelancerje in vse s stiki ali veščino prodaje.",
  keywords: [
    "partnerski program",
    "provizija priporočilo",
    "affiliate evidenca delovnega časa",
    "partnerstvo Delovit",
    "zaslužek priporočilo SaaS",
  ],
  alternates: { canonical: "/partnerji" },
  openGraph: {
    title: "Partnerski program Delovit: 50 % provizije",
    description:
      "Pripeljite stranke v Delovit in prejmite 50 % naročnine, vsak mesec. Odprto za vse.",
    type: "website",
    locale: "sl_SI",
    url: "/partnerji",
    siteName: "Delovit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Partnerski program Delovit: 50 % provizije",
    description: "Pripeljite stranke v Delovit in prejmite 50 % naročnine, vsak mesec.",
  },
};

const FAQ: FaqItem[] = [
  {
    q: "Kdo lahko postane partner?",
    a: "Kdorkoli lahko pripelje plačujoče stranke. Računovodje, poslovni svetovalci, freelancerji, marketinške agencije ali posamezniki, ki so dobri v prodaji in cold outreachu. Ni pogojev in ni potrebnih izkušenj z našim orodjem.",
  },
  {
    q: "Koliko in kako pogosto prejmem provizijo?",
    a: "50 % naročnine za vsako pridobljeno podjetje, ponavljajoče se, dokler stranka ostane. Način in ritem izplačila (mesečno ali kvartalno) se dogovorimo ob vpisu v program.",
  },
  {
    q: "Kaj moram narediti jaz?",
    a: "Samo pripeljete oziroma priporočite Delovit podjetjem, ki potrebujejo evidenco delovnega časa. Registracijo in žigosanje uredi stranka sama v nekaj minutah, vi nimate dela z uvajanjem ali podporo.",
  },
  {
    q: "Kako se stranka pripiše meni?",
    a: "Dobite svojo kodo. Ko se podjetje odloči za plačljiv paket, ob naročilu vnese vašo kodo in je s tem pripisano vam. Tako je jasno, katere stranke so vaše in za katere vam pripada provizija.",
  },
  {
    q: "Za katera podjetja je Delovit primeren?",
    a: "Za mikro podjetja in s.p. z zaposlenimi ali študenti (do 10 oseb). Gostinstvo, trgovine, saloni, obrt, storitve. Vsi ti morajo po ZEPDSV voditi dnevno evidenco delovnega časa, kar je vaš odpiralec pri prodaji.",
  },
  {
    q: "Ali me kaj zavezuje?",
    a: "Ne. Sodelovanje je brez obveznosti in brez stroškov. Priporočate takrat, ko se vam zdi smiselno. Provizijo prejmete le za stranke, ki dejansko postanejo plačniki.",
  },
];

export default function PartnerjiPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      orgJsonLd,
      websiteJsonLd,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Domov", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Partnerski program", item: `${SITE.url}/partnerji` },
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
          <PartnerMailButton size="sm">Postani partner</PartnerMailButton>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-3xl px-5 pt-14 pb-10 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50/80 px-3.5 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200/70">
            <HandCoins className="h-3.5 w-3.5" />
            Partnerski program · odprto za vse
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 text-[2.4rem] font-extrabold leading-[1.06] tracking-tight text-slate-900 sm:text-[3.2rem]">
            Pripeljite stranke v Delovit in{" "}
            <span className="text-holo">zaslužite 50 % provizije.</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Vsako mikro podjetje mora po ZEPDSV voditi evidenco delovnega časa. Vi pripeljete
            stranke, mi jih obdržimo, vi pa za vsako pridobljeno podjetje prejmete{" "}
            <strong className="text-slate-900">polovico naročnine, vsak mesec.</strong>
          </p>
        </Reveal>
        <Reveal delay={220}>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
            Računovodja, svetovalec, freelancer ali mojster cold outreacha. Program je odprt za
            vsakogar, ki zna pripeljati stranke.
          </p>
        </Reveal>
        <Reveal delay={280}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3">
            <PartnerMailButton>Postanite partner</PartnerMailButton>
            <p className="text-sm font-medium text-brand-700">
              Brez obveznosti · odgovorimo v enem delovnem dnevu
            </p>
          </div>
        </Reveal>
      </section>

      {/* ZAKAJ SE SPLAČA */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <Reveal>
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Zakaj se partnerstvo splača
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {[
            {
              icon: <Percent className="h-5 w-5" />,
              title: "50 % provizije",
              text: "Polovica naročnine za vsako pridobljeno podjetje. Ena najbolj radodarnih shem na trgu.",
            },
            {
              icon: <Repeat className="h-5 w-5" />,
              title: "Ponavljajoč prihodek",
              text: "Ni enkraten bonus. Provizijo prejemate vsak mesec, dokler stranka ostane naročnik.",
            },
            {
              icon: <Users className="h-5 w-5" />,
              title: "Odprto za vse",
              text: "Računovodje, svetovalci, freelancerji ali agencije. Pomembno je le, da pripeljete podjetja, ki postanejo naročniki.",
            },
            {
              icon: <TrendingUp className="h-5 w-5" />,
              title: "Vroč trg",
              text: "Vsako podjetje z zaposlenimi je potencialna stranka, zakon pa jih sili k ukrepanju.",
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 80} className="h-full">
              <div className="glass iris-edge flex h-full items-start gap-4 rounded-3xl p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                  {f.icon}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* KAKO DELUJE */}
      <section className="mx-auto max-w-4xl px-5 py-12">
        <Reveal>
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Kako deluje
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-slate-600">
            Trije koraki. Brez papirologije za vas, brez uvajanja za stranke.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: <UserPlus className="h-5 w-5" />,
              step: "1",
              title: "Pripeljete",
              text: "Podjetjem, ki potrebujejo evidenco delovnega časa, poveste za Delovit in jim daste svojo kodo.",
            },
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              step: "2",
              title: "Stranka izbere paket",
              text: "Ko se podjetje odloči za plačljiv paket, ob naročilu vnese vašo kodo in je pripisano vam.",
            },
            {
              icon: <FileText className="h-5 w-5" />,
              step: "3",
              title: "Prejmete 50 %",
              text: "Vsak mesec vam pripada polovica njegove naročnine, dokler ostane naročnik. Način izplačila se dogovorimo ob vpisu.",
            },
          ].map((s, i) => (
            <Reveal key={s.step} delay={i * 90} className="h-full">
              <div className="glass iris-edge flex h-full flex-col rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-sm font-extrabold text-white">
                    {s.step}
                  </span>
                  <span className="text-brand-600">{s.icon}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ZAKAJ ZDAJ */}
      <section className="mx-auto max-w-3xl px-5 py-10">
        <Reveal>
          <div className="glass-strong iris-edge rounded-3xl p-7 sm:p-9">
            <h2 className="text-xl font-bold text-slate-900">Povpraševanje je že tu</h2>
            <p className="mt-2 text-slate-600">
              Od leta 2023 mora vsak delodajalec voditi dnevno evidenco delovnega časa po ZEPDSV,
              tudi za dijake in študente na napotnici. Inšpektorat (IRSD) nadzore poostruje, globe za
              mikro podjetja pa segajo do 8.000 €, za pravne osebe do 20.000 €. To pomeni ogromno
              podjetij, ki rešitev potrebujejo takoj. Vi jih pripeljete, mi poskrbimo za produkt in
              podporo, vi pa zaslužite ob vsaki naročnini.
            </p>
            <p className="mt-4 rounded-2xl bg-white/60 px-4 py-3 text-sm text-slate-500 ring-1 ring-white/70">
              Delovit je narejen za mikro podjetja: fiksna cena na podjetje, žigosanje s telefonom,
              izvoz evidence v PDF in Excel za inšpekcijo. Lahek za prodajo, ker rešuje pravo bolečino.
            </p>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-5 py-10">
        <Reveal>
          <div className="overflow-hidden rounded-3xl bg-brand-600 px-7 py-10 text-center text-white sm:px-10">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Postanite partner Delovit
            </h2>
            <p className="mx-auto mt-2 max-w-md text-brand-50/90">
              Pošljite nam sporočilo in dogovorimo se za sodelovanje. Brez obveznosti, odgovorimo v
              enem delovnem dnevu.
            </p>
            <div className="mt-7 flex flex-col items-center gap-3">
              <PartnerMailButton variant="light">Pošljite sporočilo</PartnerMailButton>
              <p className="text-sm text-brand-50/90">ali pišite na info@delovit.si</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-12">
        <Reveal>
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Pogosta vprašanja
          </h2>
        </Reveal>
        <Reveal delay={80} className="mt-8 block">
          <Faq items={FAQ} defaultOpen={null} />
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
