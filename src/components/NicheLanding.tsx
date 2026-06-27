import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  Building2,
  Smartphone,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Reveal } from "@/components/Reveal";
import { Faq, type FaqItem } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Wordmark, buttonClasses } from "@/components/ui";
import { YandexMetrika } from "@/components/YandexMetrika";
import { SITE, orgJsonLd, websiteJsonLd } from "@/lib/seo";

export type NicheConfig = {
  slug: string; // npr. "gostinstvo"
  breadcrumb: string; // "Evidenca za gostinske lokale"
  badge: string; // "Za gostinske lokale"
  h1a: string; // prva vrstica naslova
  h1b: string; // druga vrstica (holografska)
  heroP: React.ReactNode; // hero odstavek
  roleWord: string; // npr. "Natakar" — za kartico "Žigosa s telefonom"
  keyTitle: string;
  keyBody: string;
  faqIntro: FaqItem; // nišno specifično prvo vprašanje
};

// Standardna (pravno preverjena) vprašanja — enaka povsod.
function buildFaq(c: NicheConfig): FaqItem[] {
  return [
    c.faqIntro,
    {
      q: "Kaj moram beležiti?",
      a: "Po 18. členu ZEPDSV za vsakega delavca dnevno: uro prihoda in odhoda ter število opravljenih ur. Za vse zaposlene enako.",
    },
    {
      q: "Velja to tudi za skrajšani delovni čas in različne oblike dela?",
      a: "Da. Obveznost izhaja iz definicije delavca v 2. členu ZEPDSV, ki zajame vsakogar, ki pri vas opravlja delo in je vključen v delovni proces, ne glede na obseg ali obliko dela.",
    },
    {
      q: "Kakšna je globa, če evidence ne vodim?",
      a: "Za manjše delodajalce (do 10 zaposlenih) znaša globa za nevodenje evidenc od 300 do 8.000 € (23. člen ZEPDSV). Za večje je razpon višji.",
    },
    {
      q: "Kako hitro lahko začnem z Delovit?",
      a: "V manj kot 5 minutah. Ustvariš podjetje, dodaš zaposlene, ti pa prihod in odhod žigosajo kar s telefonom. Mesečno evidenco izvoziš v PDF ali Excel za inšpekcijo.",
    },
  ];
}

export function NicheLanding({ config }: { config: NicheConfig }) {
  const FAQ = buildFaq(config);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      orgJsonLd,
      websiteJsonLd,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Domov", item: SITE.url },
          { "@type": "ListItem", position: 2, name: config.breadcrumb, item: `${SITE.url}/${config.slug}` },
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
            {config.badge} · ZEPDSV
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 text-[2.3rem] font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
            {config.h1a}
            <br />
            <span className="text-holo">{config.h1b}</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">{config.heroP}</p>
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
              href="#kako"
              className="glass iris-edge inline-flex items-center justify-center rounded-full px-6 py-3.5 text-base font-semibold text-slate-800 transition hover:bg-white/70"
            >
              Kako deluje
            </Link>
          </div>
          <p className="mt-3 text-sm font-medium text-brand-700">
            14 dni brezplačno · brez kartice · prekličeš kadarkoli
          </p>
        </Reveal>
      </section>

      {/* KLJUČNO DEJSTVO */}
      <section className="mx-auto max-w-3xl px-5 py-8">
        <Reveal>
          <div className="glass-strong iris-edge rounded-3xl p-7 sm:p-9">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{config.keyTitle}</h2>
                <p className="mt-2 text-slate-600">{config.keyBody}</p>
                <p className="mt-4 rounded-2xl bg-white/60 px-4 py-3 text-sm text-slate-500 ring-1 ring-white/70">
                  Obveznost izhaja iz <strong className="text-slate-700">2. člena ZEPDSV</strong> (definicija
                  delavca) in velja od novele <strong className="text-slate-700">ZEPDSV-B</strong> (23. 4. 2025) za
                  vse zaposlene.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* GLOBA */}
      <section className="mx-auto max-w-3xl px-5 py-6">
        <Reveal>
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-red-50/70 px-7 py-8 text-center ring-1 ring-red-100 sm:flex-row sm:text-left">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-red-600 ring-1 ring-red-100">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <div>
              <p className="text-lg font-bold text-slate-900">Brez evidence: globa 300–8.000 €</p>
              <p className="mt-1 text-sm text-slate-600">
                Za manjše delodajalce (do 10 zaposlenih), po 23. členu ZEPDSV. Inšpektorat (IRSD)
                je leta 2024 zabeležil 1.145 kršitev evidenc.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* KAKO DELUJE */}
      <section id="kako" className="mx-auto max-w-5xl px-5 py-14">
        <Reveal>
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Urejeno v 5 minutah
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-slate-600">
            Brez izobraževanja in brez papirjev. Tako enostavno, da deluje že prvi dan.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: <Smartphone className="h-5 w-5" />,
              title: `${config.roleWord} žigosa s telefonom`,
              text: "En velik gumb za prihod in odhod. Brez aplikacije iz trgovine, brez navodil.",
            },
            {
              icon: <Clock className="h-5 w-5" />,
              title: "Ti vidiš vse ure",
              text: "Dnevni in mesečni pregled ur za vso ekipo na enem mestu.",
            },
            {
              icon: <FileSpreadsheet className="h-5 w-5" />,
              title: "Izvoz za inšpekcijo",
              text: "Evidenco z vsemi zakonskimi polji izvoziš v PDF ali Excel z enim klikom.",
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 90} className="h-full">
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

      {/* CENA */}
      <section className="mx-auto max-w-3xl px-5 py-8">
        <Reveal>
          <div className="glass-strong iris-edge rounded-3xl p-8 text-center sm:p-10">
            <ShieldCheck className="mx-auto h-8 w-8 text-brand-600" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              Fiksna cena za celo ekipo
            </h2>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              En znesek na podjetje, ne na osebo. Naj imaš dva ali pet zaposlenih, plačaš enako.
              Brez vezave.
            </p>
            <ul className="mx-auto mt-6 grid max-w-md gap-2 text-left text-sm text-slate-700 sm:grid-cols-2">
              {["Do 10 oseb na podjetje", "Žigosanje s telefonom", "Vsa zakonska polja ZEPDSV", "Izvoz PDF in Excel"].map((f) => (
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
              Začni brezplačno
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-sm text-slate-500">14 dni brezplačno. Brez kartice.</p>
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
          Informativno, ne pravni nasvet. Viri: 2., 18. in 23. člen ZEPDSV ter novela ZEPDSV-B
          (velja od 23. 4. 2025).
        </p>
      </section>

      <Footer />
    </main>
  );
}
