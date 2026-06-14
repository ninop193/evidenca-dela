import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileSpreadsheet,
  Wallet,
  ShieldCheck,
  Smartphone,
  Square,
} from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Wordmark } from "@/components/ui";

const delay = (s: number) => ({ animationDelay: `${s}s` });

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-800">
      <Aurora />

      {/* NAV */}
      <header className="sticky top-0 z-30 px-4 pt-4">
        <div className="glass iris-edge sheen mx-auto flex max-w-5xl items-center justify-between rounded-full px-5 py-2.5">
          <Wordmark />
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/kalkulator" className="hidden rounded-full px-3 py-1.5 font-medium text-slate-600 transition hover:bg-white/60 hover:text-slate-900 sm:block">
              Kalkulator
            </Link>
            <Link href="/login" className="rounded-full px-3 py-1.5 font-medium text-slate-600 transition hover:bg-white/60 hover:text-slate-900">
              Prijava
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-brand-600 px-4 py-1.5 font-semibold text-white shadow-[0_6px_20px_-6px_rgba(29,78,216,0.7)] transition hover:bg-brand-500"
            >
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
          <h1 className="reveal mt-6 text-[2.7rem] font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl" style={delay(0.08)}>
            Evidenca ur,
            <br />
            <span className="text-holo">brez panike.</span>
          </h1>
          <p className="reveal mt-6 max-w-md text-lg leading-relaxed text-slate-600" style={delay(0.16)}>
            Zaposleni žigosajo prihod in odhod z enim tapom. Ti vidiš vse ure in v sekundi
            izvoziš evidenco za inšpekcijo. Fiksna cena, brez onboardinga.
          </p>
          <div className="reveal mt-9 flex flex-col gap-3 sm:flex-row" style={delay(0.24)}>
            <Link
              href="/register"
              className="glow-pulse group inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-500"
            >
              Začni brezplačno
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/kalkulator"
              className="glass iris-edge sheen inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-slate-800 transition hover:bg-white/70"
            >
              Kalkulator plače
            </Link>
          </div>
          <div className="reveal mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500" style={delay(0.32)}>
            <Trust>Fiksna cena na podjetje</Trust>
            <Trust>Postavljeno v 5 minutah</Trust>
            <Trust>Podatki v EU</Trust>
          </div>
        </div>

        <div className="reveal relative mx-auto" style={delay(0.2)}>
          <PhoneMock />
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 sm:grid-cols-3">
          <Feature icon={<Smartphone className="h-5 w-5" />} title="Žigosanje z enim tapom" text="Velik gumb na telefonu — prihod, odhod, odmor. Brez izobraževanja, brez navodil." d={0} />
          <Feature icon={<FileSpreadsheet className="h-5 w-5" />} title="Pripravljeno za inšpekcijo" text="Vsa zakonska polja po ZEPDSV. Mesečno evidenco izvoziš v PDF ali Excel z enim klikom." d={0.1} />
          <Feature icon={<Wallet className="h-5 w-5" />} title="Fiksna cena" text="En znesek na podjetje — ne na zaposlenega. S.p. z dvema ali pet ljudi plača enako." d={0.2} />
        </div>
      </section>

      {/* HOW */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Od registracije do prvega žiga v 5 minutah
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <Step n={1} title="Registriraj podjetje" text="Ustvari račun in poimenuj podjetje. Brez klicev in pogodb." />
          <Step n={2} title="Dodaj zaposlene" text="Vpiši ime in email. Zaposleni dobi dostop na telefon." />
          <Step n={3} title="Začnite žigosati" text="Zaposleni tapne 'Prihod', ti spremljaš ure v živo." />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="glass-strong iris-edge sheen relative overflow-hidden rounded-[2rem] px-8 py-14 text-center">
          <div className="absolute -top-24 left-1/2 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-brand-400/40 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Zaščiti se pred globo. Še danes.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-slate-600">
              Inšpektorat je lani zabeležil 1.145 kršitev evidenc. Uredi svojo v nekaj minutah.
            </p>
            <Link
              href="/register"
              className="glow-pulse mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-brand-500"
            >
              Začni brezplačno
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-slate-500 sm:flex-row">
        <Wordmark className="text-sm" />
        <div className="flex items-center gap-5">
          <Link href="/kalkulator" className="hover:text-slate-900">Kalkulator plače</Link>
          <Link href="/login" className="hover:text-slate-900">Prijava</Link>
        </div>
        <p className="text-slate-400">© {new Date().getFullYear()} Evidenca dela</p>
      </footer>
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

function Feature({ icon, title, text, d }: { icon: React.ReactNode; title: string; text: string; d: number }) {
  return (
    <div
      className="reveal glass iris-edge sheen rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/70"
      style={delay(d)}
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_8px_22px_-6px_rgba(29,78,216,0.6)]">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="glass iris-edge sheen rounded-2xl p-6 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white shadow-[0_8px_24px_-6px_rgba(29,78,216,0.6)]">
        {n}
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
              <Square className="mx-auto h-8 w-8 fill-white" />
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
