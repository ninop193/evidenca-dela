import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
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
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <Aurora />

      {/* NAV */}
      <header className="sticky top-0 z-30 px-4 pt-4">
        <div className="glass glass-edge mx-auto flex max-w-5xl items-center justify-between rounded-2xl px-4 py-2.5">
          <Wordmark dark />
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/kalkulator" className="hidden rounded-lg px-3 py-1.5 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white sm:block">
              Kalkulator
            </Link>
            <Link href="/login" className="rounded-lg px-3 py-1.5 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">
              Prijava
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-white px-4 py-1.5 font-semibold text-slate-900 shadow-[0_4px_20px_-4px_rgba(255,255,255,0.4)] transition hover:bg-slate-100"
            >
              Začni
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 sm:py-24 lg:grid-cols-2">
        <div>
          <div className="reveal glass glass-edge inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-slate-200" style={delay(0)}>
            <ShieldCheck className="h-3.5 w-3.5 text-brand-300" />
            Skladno z ZEPDSV
          </div>
          <h1 className="reveal mt-6 text-[2.7rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl" style={delay(0.08)}>
            Evidenca ur,
            <br />
            <span className="text-iris">brez panike.</span>
          </h1>
          <p className="reveal mt-6 max-w-md text-lg leading-relaxed text-slate-300" style={delay(0.16)}>
            Zaposleni žigosajo prihod in odhod z enim tapom. Ti vidiš vse ure in v sekundi
            izvoziš evidenco za inšpekcijo. Fiksna cena, brez onboardinga.
          </p>
          <div className="reveal mt-9 flex flex-col gap-3 sm:flex-row" style={delay(0.24)}>
            <Link
              href="/register"
              className="glow-pulse group inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-500"
            >
              Začni brezplačno
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/kalkulator"
              className="glass glass-edge inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Kalkulator plače
            </Link>
          </div>
          <div className="reveal mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400" style={delay(0.32)}>
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
          <Feature
            icon={<Smartphone className="h-5 w-5" />}
            title="Žigosanje z enim tapom"
            text="Velik gumb na telefonu — prihod, odhod, odmor. Brez izobraževanja, brez navodil."
            d={0}
          />
          <Feature
            icon={<FileSpreadsheet className="h-5 w-5" />}
            title="Pripravljeno za inšpekcijo"
            text="Vsa zakonska polja po ZEPDSV. Mesečno evidenco izvoziš v PDF ali Excel z enim klikom."
            d={0.1}
          />
          <Feature
            icon={<Wallet className="h-5 w-5" />}
            title="Fiksna cena"
            text="En znesek na podjetje — ne na zaposlenega. S.p. z dvema ali pet ljudi plača enako."
            d={0.2}
          />
        </div>
      </section>

      {/* HOW */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
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
        <div className="glass-strong glass-edge relative overflow-hidden rounded-3xl px-8 py-14 text-center">
          <div className="absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Zaščiti se pred globo. Še danes.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-slate-300">
              Inšpektorat je lani zabeležil 1.145 kršitev evidenc. Uredi svojo v nekaj minutah.
            </p>
            <Link
              href="/register"
              className="glow-pulse mt-8 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-brand-500"
            >
              Začni brezplačno
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-slate-400 sm:flex-row">
        <Wordmark dark className="text-sm" />
        <div className="flex items-center gap-5">
          <Link href="/kalkulator" className="hover:text-white">Kalkulator plače</Link>
          <Link href="/login" className="hover:text-white">Prijava</Link>
        </div>
        <p className="text-slate-500">© {new Date().getFullYear()} Evidenca dela</p>
      </footer>
    </div>
  );
}

function Trust({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-500/20">
        <Check className="h-3 w-3 text-brand-300" />
      </span>
      {children}
    </span>
  );
}

function Feature({ icon, title, text, d }: { icon: React.ReactNode; title: string; text: string; d: number }) {
  return (
    <div
      className="reveal glass glass-edge rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.08]"
      style={delay(d)}
    >
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/20 text-brand-300 ring-1 ring-white/10">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{text}</p>
    </div>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-bold text-white shadow-[0_8px_24px_-6px_rgba(47,99,255,0.6)]">
        {n}
      </div>
      <h3 className="mt-4 font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="relative w-[270px]">
      <div className="absolute -inset-8 rounded-[3rem] bg-brand-500/20 blur-3xl" />
      <div className="glass-strong glass-edge relative rounded-[2.6rem] p-3">
        <div className="rounded-[2rem] bg-slate-950/60 p-6 ring-1 ring-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pozdravljen</span>
            <span>Marko</span>
          </div>
          <p className="mt-9 text-center text-xs text-slate-400">Na delu od 08:00</p>
          <div className="glow-pulse relative mx-auto mt-3 grid h-44 w-44 place-items-center rounded-full bg-brand-600 text-white">
            <div className="absolute inset-2 rounded-full ring-2 ring-white/25" />
            <div className="text-center">
              <Square className="mx-auto h-8 w-8 fill-white" />
              <div className="mt-1.5 text-lg font-bold">Odhod</div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 text-xs ring-1 ring-white/10">
            <span className="text-slate-300">08:00 – 12:30</span>
            <span className="font-semibold text-white">4,50 h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
