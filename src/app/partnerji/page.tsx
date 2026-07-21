import type { Metadata } from "next";
import Link from "next/link";
import {
  Percent,
  Repeat,
  HandCoins,
  Sparkles,
  FileText,
  UserPlus,
  ShieldCheck,
  Calculator,
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
  title: { absolute: "Partnerski program za računovodje – 50 % provizije | Delovit" },
  description:
    "Priporočite Delovit svojim strankam in prejmite 50 % naročnine za vsako pridobljeno podjetje, vsak mesec. Partnerski program za računovodje. Brez dodatnega dela.",
  keywords: [
    "partnerski program",
    "provizija računovodje",
    "affiliate evidenca delovnega časa",
    "partnerstvo Delovit",
    "priporočilni program računovodstvo",
  ],
  alternates: { canonical: "/partnerji" },
  openGraph: {
    title: "Partnerski program za računovodje – 50 % provizije",
    description:
      "Priporočite Delovit strankam in prejmite 50 % naročnine, vsak mesec. Brez dodatnega dela.",
    type: "website",
    locale: "sl_SI",
    url: "/partnerji",
    siteName: "Delovit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Partnerski program za računovodje – 50 % provizije",
    description: "Priporočite Delovit strankam in prejmite 50 % naročnine, vsak mesec.",
  },
};

const FAQ: FaqItem[] = [
  {
    q: "Koliko in kako pogosto prejmem provizijo?",
    a: "50 % naročnine za vsako pridobljeno podjetje, ponavljajoče se, dokler stranka ostane. Obračun poteka po dogovoru (mesečno ali kvartalno) proti računu, ki nam ga izstavite, kar se lepo prilega vašemu knjigovodstvu.",
  },
  {
    q: "Kaj moram narediti jaz?",
    a: "Samo priporočite Delovit strankam, ki potrebujejo evidenco delovnega časa. Registracijo in žigosanje uredi stranka sama v nekaj minutah, vi nimate dodatnega dela z uvajanjem.",
  },
  {
    q: "Kako se stranka pripiše meni?",
    a: "Dobite svojo kodo, ki jo stranka uporabi ob registraciji oziroma plačilu (in pri tem dobi ugodnost). Tako je jasno, katere stranke so vaše in za katere vam pripada provizija.",
  },
  {
    q: "Za katera podjetja je Delovit primeren?",
    a: "Za mikro podjetja in s.p. z zaposlenimi ali študenti (do 10 oseb) — gostinstvo, trgovine, salone, obrt. Vsi ti morajo po ZEPDSV voditi dnevno evidenco delovnega časa.",
  },
  {
    q: "Ali me kaj zavezuje?",
    a: "Ne. Sodelovanje je brez obveznosti in brez stroškov. Priporočate takrat, ko se vam zdi smiselno; provizijo prejmete le za stranke, ki dejansko postanejo plačniki.",
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
          <PartnerMailButton>Postanite partner</PartnerMailButton>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-3xl px-5 pt-14 pb-10 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50/80 px-3.5 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200/70">
            <HandCoins className="h-3.5 w-3.5" />
            Partnerski program · za računovodje
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 text-[2.4rem] font-extrabold leading-[1.06] tracking-tight text-slate-900 sm:text-[3.2rem]">
            Priporočite Delovit svojim strankam in{" "}
            <span className="text-holo">zaslužite 50 % provizije.</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Vaše stranke morajo voditi evidenco delovnega časa po ZEPDSV. Vi jim priporočite
            orodje, ki to uredi v petih minutah — in za vsako pridobljeno podjetje prejmete{" "}
            <strong className="text-slate-900">polovico naročnine, vsak mesec.</strong>
          </p>
        </Reveal>
        <Reveal delay={240}>
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
              title: "Ponavljajoč prihod",
              text: "Ne enkraten bonus. Provizijo prejemate vsak mesec, dokler stranka ostane naročnik.",
            },
            {
              icon: <Sparkles className="h-5 w-5" />,
              title: "Nič dodatnega dela",
              text: "Vi le priporočite. Stranka se registrira sama, žigosa s telefonom, vi izstavite račun.",
            },
            {
              icon: <Calculator className="h-5 w-5" />,
              title: "Naravno se prilega",
              text: "Evidenca delovnega časa je tik ob obračunu plač, ki ga za stranke že delate.",
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
            Tri koraki. Brez papirologije za vas, brez uvajanja za stranke.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: <UserPlus className="h-5 w-5" />,
              step: "1",
              title: "Priporočite",
              text: "Strankam, ki potrebujejo evidenco delovnega časa, poveste za Delovit in jim daste svojo kodo.",
            },
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              step: "2",
              title: "Stranka začne",
              text: "Registrira se z vašo kodo (in dobi ugodnost), doda ekipo in začne žigosati v petih minutah.",
            },
            {
              icon: <FileText className="h-5 w-5" />,
              step: "3",
              title: "Prejmete 50 %",
              text: "Vsak mesec vam pripada polovica naročnine. Izstavite nam račun in nakažemo — čisto in preprosto.",
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
            <h2 className="text-xl font-bold text-slate-900">Vaše stranke to potrebujejo zdaj</h2>
            <p className="mt-2 text-slate-600">
              Od leta 2023 mora vsak delodajalec voditi dnevno evidenco delovnega časa po ZEPDSV —
              tudi za dijake in študente na napotnici. Inšpektorat (IRSD) nadzore poostruje, globe
              za mikro podjetja pa segajo do 8.000 €, za pravne osebe do 20.000 €. Vi ste prva oseba,
              ki ji stranka zaupa pri takih obveznostih — z Delovitom ji ponudite rešitev in ob tem
              zaslužite.
            </p>
            <p className="mt-4 rounded-2xl bg-white/60 px-4 py-3 text-sm text-slate-500 ring-1 ring-white/70">
              Delovit je narejen za mikro podjetja: fiksna cena na podjetje, žigosanje s telefonom,
              izvoz evidence v PDF in Excel za inšpekcijo.
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
            <div className="mt-7 flex justify-center">
              <PartnerMailButton variant="light">Pišite nam na info@delovit.si</PartnerMailButton>
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
