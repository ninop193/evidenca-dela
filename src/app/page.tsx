import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileSpreadsheet,
  Wallet,
  ShieldCheck,
  Smartphone,
  Square,
  Clock,
  PenLine,
  Lock,
} from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Reveal } from "@/components/Reveal";
import { Faq, type FaqItem } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Pricing } from "@/components/Pricing";
import { Wordmark } from "@/components/ui";
import { SITE, orgJsonLd, websiteJsonLd } from "@/lib/seo";
import { YandexMetrika } from "@/components/YandexMetrika";

const delay = (s: number) => ({ animationDelay: `${s}s` });

const FAQ: FaqItem[] = [
  {
    q: "Je evidenca zakonsko ustrezna (ZEPDSV)?",
    a: "Da. Vsebuje vsa polja po 13. in 18. členu ZEPDSV (konsolidirano z novelo ZEPDSV-B): čas prihoda in odhoda, redne ure, nadure, nočne, nedeljske in praznične ure ter odsotnosti z vrsto nadomestila. Pripravljeno za inšpekcijo IRSD.",
  },
  {
    q: "Kako hitro lahko začnem?",
    a: "Registracija in prvi žig v manj kot 5 minutah. Brez klicev in pogodb. Ustvariš podjetje, dodaš zaposlene in začneš.",
  },
  {
    q: "Koliko stane?",
    a: "Fiksna mesečna cena na podjetje, ne na zaposlenega. Naj imaš dva ali pet zaposlenih, plačaš enako. Brez skritih stroškov in brez vezave.",
  },
  {
    q: "Ali zaposleni potrebujejo posebno aplikacijo iz trgovine?",
    a: "Ne. Aplikacijo si v dveh tapih dodajo na domači zaslon telefona in žigosajo z enim gumbom. Brez App Store ali Google Play.",
  },
  {
    q: "Kaj če zaposleni pozabi žigosati?",
    a: "Delodajalec lahko kadarkoli ročno vnese ali popravi ure za nazaj. Pozabljen odhod sistem samodejno označi za pregled, da evidenca ostane urejena.",
  },
  {
    q: "Kje so shranjeni podatki?",
    a: "V EU (Frankfurt), skladno z GDPR. Vsako podjetje vidi izključno svoje podatke. Med podjetji velja stroga izolacija od prve sekunde.",
  },
  {
    q: "Ali lahko izvozim evidenco za inšpekcijo?",
    a: "Da. Mesečno evidenco izvoziš v PDF ali Excel z enim klikom. Dokument je urejen, z vsemi zakonskimi polji in mestom za podpis.",
  },
];

export default function Home() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      orgJsonLd,
      websiteJsonLd,
      {
        "@type": "SoftwareApplication",
        name: "Delovit",
        url: SITE.url,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, iOS, Android",
        description: SITE.description,
        inLanguage: "sl",
        offers: {
          "@type": "Offer",
          price: String(SITE.monthlyNet),
          priceCurrency: "EUR",
          description: "Fiksna mesečna cena na podjetje, 14 dni brezplačno.",
        },
        publisher: { "@id": `${SITE.url}/#organization` },
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
    <div className="relative min-h-screen overflow-x-hidden text-slate-800">
      <Aurora />
      <YandexMetrika />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* NAV */}
      <header className="sticky top-0 z-30 px-4 pt-4">
        <div className="glass-strong iris-edge mx-auto flex max-w-5xl items-center justify-between rounded-full px-5 py-2.5">
          <Wordmark className="relative z-10" />
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/#cena" className="hidden rounded-full px-3 py-1.5 font-medium text-slate-600 transition hover:bg-white/60 hover:text-slate-900 sm:block">
              Cena
            </Link>
            <Link href="/kalkulator" className="hidden rounded-full px-3 py-1.5 font-medium text-slate-600 transition hover:bg-white/60 hover:text-slate-900 sm:block">
              Kalkulator
            </Link>
            <Link href="/login" className="rounded-full px-3 py-1.5 font-medium text-slate-600 transition hover:bg-white/60 hover:text-slate-900">
              Prijava
            </Link>
            <Link href="/register" className="rounded-full bg-brand-600 px-4 py-1.5 font-semibold text-white shadow-[0_6px_20px_-6px_rgba(29,78,216,0.7)] transition hover:bg-brand-500">
              Začni
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 sm:py-24 lg:grid-cols-2">
        <div>
          <div className="reveal glass iris-edge inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-700" style={delay(0)}>
            <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
            Skladno z ZEPDSV
          </div>
          <h1 className="reveal mt-6 text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-[3.4rem]" style={delay(0.08)}>
            Evidenca delovnega
            <br />
            časa, <span className="text-holo">brez panike.</span>
          </h1>
          <p className="reveal mt-6 max-w-md text-lg leading-relaxed text-slate-600" style={delay(0.16)}>
            Zaposleni žigosajo prihod in odhod z enim tapom. Ti vidiš vse ure in v sekundi
            izvoziš evidenco za inšpekcijo. Fiksna cena na podjetje, brez vezave.
          </p>
          <div className="reveal mt-9 flex flex-col gap-3 sm:flex-row" style={delay(0.24)}>
            <Link href="/register" className="glow-pulse group inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-500">
              Začni brezplačno
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/kalkulator" className="glass iris-edge sheen inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-slate-800 transition hover:bg-white/70">
              Kalkulator plače
            </Link>
          </div>
          <p className="reveal mt-3 text-sm font-medium text-brand-700" style={delay(0.28)}>
            14 dni brezplačno · brez kartice · prekličeš kadarkoli
          </p>
          <div className="reveal mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500" style={delay(0.32)}>
            <Trust>Fiksna cena na podjetje</Trust>
            <Trust>Postavljeno v 5 minutah</Trust>
            <Trust>Podatki v EU</Trust>
          </div>
        </div>

        <div className="reveal relative mx-auto" style={delay(0.2)}>
          <PhoneMock />
        </div>
      </section>

      {/* STATISTIKE, nujnost */}
      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { big: "1.145", small: "kršitev evidenc, ki jih je IRSD zabeležil v letu 2024" },
            { big: "€300–8.000", small: "globe za mikro podjetja brez ustrezne evidence" },
            { big: "< 5 min", small: "od registracije do prvega žiga prihoda" },
          ].map((s, i) => (
            <Reveal key={s.big} delay={i * 90}>
              <div className="glass iris-edge sheen rounded-2xl px-6 py-7 text-center">
                <p className="text-3xl font-extrabold tracking-tight text-brand-600 sm:text-4xl">{s.big}</p>
                <p className="mt-2 text-sm leading-snug text-slate-600">{s.small}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { icon: <Smartphone className="h-5 w-5" />, title: "Žigosanje z enim tapom", text: "Velik gumb na telefonu za prihod, odhod in odmor. Brez izobraževanja in brez navodil." },
            { icon: <FileSpreadsheet className="h-5 w-5" />, title: "Pripravljeno za inšpekcijo", text: "Vsa zakonska polja po ZEPDSV. Mesečno evidenco izvoziš v PDF ali Excel z enim klikom." },
            { icon: <Wallet className="h-5 w-5" />, title: "Fiksna cena", text: "En znesek na podjetje, ne na zaposlenega. S.p. z dvema ali pet ljudi plača enako." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <Feature icon={f.icon} title={f.title} text={f.text} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="kako" className="mx-auto max-w-5xl px-5 py-16">
        <Reveal>
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Od registracije do prvega žiga v 5 minutah
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { n: 1, title: "Registriraj podjetje", text: "Ustvari račun in poimenuj podjetje. Brez klicev in pogodb.", icon: <PenLine className="h-5 w-5" /> },
            { n: 2, title: "Dodaj zaposlene", text: "Vpiši ime in email. Zaposleni dobi dostop na telefon.", icon: <Smartphone className="h-5 w-5" /> },
            { n: 3, title: "Začnite žigosati", text: "Zaposleni tapne 'Prihod', ti spremljaš ure v živo.", icon: <Clock className="h-5 w-5" /> },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <Step n={s.n} title={s.title} text={s.text} icon={s.icon} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* CENA */}
      <Pricing />

      {/* VSEBINA — za koga / zakon */}
      <section id="zakon" className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal>
            <article className="glass iris-edge sheen h-full rounded-3xl p-7">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Za koga je evidenca dela
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Narejena je za manjše delodajalce, ki morajo voditi evidenco delovnega časa, pa
                nimajo časa za zapletene kadrovske programe. Uporabljajo jo samostojni podjetniki
                z zaposlenimi, družinska podjetja in mikro podjetja do pet zaposlenih.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Med strankami so gostinski lokali in kavarne, frizerski in kozmetični saloni,
                mizarstva, gradbena podjetja, avtoservisi, trgovine in storitvena podjetja.
                Povsod, kjer ljudje prihajajo in odhajajo z dela, aplikacija nadomesti ročno
                vodenje na papirju ali v Excelu.
              </p>
            </article>
          </Reveal>

          <Reveal delay={100}>
            <article className="glass iris-edge sheen h-full rounded-3xl p-7">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Kaj zahteva zakon (ZEPDSV)
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Od leta 2023 mora vsak delodajalec voditi dnevno evidenco delovnega časa za
                vsakega zaposlenega. Novela ZEPDSV-B, ki velja od aprila 2025, te zahteve dodatno
                zaostruje.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Za vsak delovni dan je treba zabeležiti čas prihoda in odhoda, število opravljenih
                ur, nadure ter ure nočnega, nedeljskega in prazničnega dela. Voditi je treba tudi
                odsotnosti z vrsto nadomestila, na primer dopust ali bolniško. Če evidenca ob
                obisku inšpektorja ni urejena, sledi globa, ki za mikro podjetja znaša od 300 do
                8.000 evrov.
              </p>
            </article>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="vprasanja" className="mx-auto max-w-3xl px-5 py-16">
        <Reveal>
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Pogosta vprašanja
          </h2>
          <p className="mt-2 text-center text-slate-500">Vse, kar moraš vedeti pred začetkom.</p>
        </Reveal>
        <Reveal delay={80} className="mt-8">
          <Faq items={FAQ} />
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <Reveal>
          <div className="glass-strong iris-edge sheen relative overflow-hidden rounded-[2rem] px-8 py-14 text-center">
            <div className="absolute -top-24 left-1/2 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-brand-400/40 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Zaščiti se pred globo. Še danes.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-slate-600">
                Uredi svojo evidenco v nekaj minutah, preden potrka inšpektor.
              </p>
              <Link href="/register" className="glow-pulse mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-brand-500">
                Začni brezplačno
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}

function Trust({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-100">
        <Check className="h-3 w-3 text-brand-600" />
      </span>
      {children}
    </span>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="glass iris-edge sheen h-full rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/70">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_8px_22px_-6px_rgba(29,78,216,0.6)]">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

function Step({ n, title, text, icon }: { n: number; title: string; text: string; icon: React.ReactNode }) {
  return (
    <div className="glass iris-edge sheen h-full rounded-2xl p-6 text-center">
      <div className="relative mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_8px_24px_-6px_rgba(29,78,216,0.6)]">
        {icon}
        <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-bold text-brand-600 ring-1 ring-brand-100">
          {n}
        </span>
      </div>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{text}</p>
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="float-y relative w-[272px]">
      <div className="absolute -inset-10 rounded-[3rem] bg-gradient-to-br from-holo-rose/50 via-holo-sky/40 to-holo-violet/50 blur-3xl" />
      <div className="glass-strong iris-edge sheen relative rounded-[2.7rem] p-3">
        <div className="rounded-[2.1rem] bg-white/40 p-6 ring-1 ring-white/60">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Pozdravljen</span>
            <span>Marko</span>
          </div>
          <p className="mt-9 text-center text-xs text-slate-500">Na delu od 08:00</p>
          <div className="glow-pulse relative mx-auto mt-3 grid h-44 w-44 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <div className="absolute inset-2 rounded-full ring-2 ring-white/40" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/25" />
            <div className="relative text-center">
              <Square className="mx-auto h-8 w-8 fill-white" strokeWidth={0} />
              <div className="mt-1.5 text-lg font-bold">Odhod</div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between rounded-2xl bg-white/60 px-3 py-2.5 text-xs ring-1 ring-white/70">
            <span className="text-slate-600">08:00 – 12:30</span>
            <span className="font-semibold text-slate-900">4,50 h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
