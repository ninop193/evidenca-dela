import Link from "next/link";
import { buttonClasses, Badge, Wordmark } from "@/components/ui";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Wordmark />
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="/kalkulator" className={buttonClasses("ghost", "sm")}>
              Kalkulator plače
            </Link>
            <Link href="/login" className={buttonClasses("ghost", "sm")}>
              Prijava
            </Link>
            <Link href="/register" className={buttonClasses("primary", "sm")}>
              Začni brezplačno
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <Badge tone="brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Skladno z ZEPDSV
            </Badge>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Evidenca delovnega časa,{" "}
              <span className="text-brand-600">poenostavljena.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-600">
              Zaposleni žigosajo prihod in odhod z enim tapom. Ti vidiš vse ure in v sekundi
              izvoziš evidenco za inšpekcijo. Fiksna cena, brez onboardinga.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className={buttonClasses("primary", "lg")}>
                Začni brezplačno →
              </Link>
              <Link href="/kalkulator" className={buttonClasses("secondary", "lg")}>
                Preizkusi kalkulator plače
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <Trust>Fiksna cena na podjetje</Trust>
              <Trust>Postavljeno v 5 minutah</Trust>
              <Trust>Podatki v EU</Trust>
            </div>
          </div>

          {/* Izdelčni vizual — telefon z gumbom */}
          <div className="relative mx-auto">
            <div className="absolute -inset-6 rounded-[3rem] bg-brand-500/10 blur-2xl" />
            <PhoneMock />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 sm:grid-cols-3">
          <Feature
            title="Žigosanje z enim tapom"
            text="Velik gumb na telefonu — prihod, odhod, odmor. Brez izobraževanja, brez navodil."
            icon="⏱"
          />
          <Feature
            title="Pripravljeno za inšpekcijo"
            text="Vsa zakonska polja po ZEPDSV. Mesečno evidenco izvoziš v PDF ali Excel z enim klikom."
            icon="📄"
          />
          <Feature
            title="Fiksna cena"
            text="En znesek na podjetje — ne na zaposlenega. S.p. z dvema ali pet ljudi plača enako."
            icon="€"
          />
        </div>
      </section>

      {/* HOW */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
            Od registracije do prvega žiga v 5 minutah
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <Step n={1} title="Registriraj podjetje" text="Ustvari račun in poimenuj podjetje. Brez klicev in pogodb." />
            <Step n={2} title="Dodaj zaposlene" text="Vpiši ime in email. Zaposleni dobi dostop na telefon." />
            <Step n={3} title="Začnite žigosati" text="Zaposleni tapne 'Prihod', ti spremljaš ure v živo." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-14 text-center shadow-lift">
          <div className="bg-grid absolute inset-0 opacity-[0.15]" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Zaščiti se pred globo. Še danes.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-slate-300">
              Inšpektorat je lani zabeležil 1.145 kršitev evidenc. Uredi svojo v nekaj minutah.
            </p>
            <Link href="/register" className={buttonClasses("primary", "lg") + " mt-8"}>
              Začni brezplačno →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row">
          <Wordmark className="text-sm" />
          <div className="flex items-center gap-5 text-sm text-slate-500">
            <Link href="/kalkulator" className="hover:text-slate-900">
              Kalkulator plače
            </Link>
            <Link href="/login" className="hover:text-slate-900">
              Prijava
            </Link>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Evidenca dela</p>
        </div>
      </footer>
    </div>
  );
}

function Trust({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg className="h-4 w-4 text-brand-600" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.4 0z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </span>
  );
}

function Feature({ title, text, icon }: { title: string; text: string; icon: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200/80 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl text-brand-600">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-soft">
        {n}
      </div>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{text}</p>
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="relative w-[260px] rounded-[2.5rem] border-[10px] border-slate-900 bg-white shadow-2xl">
      <div className="absolute left-1/2 top-0 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-900" />
      <div className="flex flex-col items-center px-6 pb-10 pt-12">
        <div className="flex w-full items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Pozdravljen</span>
          <span className="text-xs text-slate-400">Marko</span>
        </div>
        <p className="mt-10 text-xs text-slate-500">Na delu od 08:00</p>
        <div className="relative mt-3 grid h-44 w-44 place-items-center rounded-full bg-brand-600 text-white shadow-lift">
          <div className="absolute inset-2 rounded-full ring-2 ring-white/30" />
          <div className="text-center">
            <div className="text-3xl">⏹</div>
            <div className="mt-1 text-lg font-bold">Odhod</div>
          </div>
        </div>
        <div className="mt-8 w-full rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">08:00 – 12:30</span>
            <span className="font-semibold text-slate-900">4,50 h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
