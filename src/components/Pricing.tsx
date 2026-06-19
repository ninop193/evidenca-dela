import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { PLAN, eur } from "@/lib/billing";

const FEATURES = [
  "Do 10 zaposlenih",
  "Žigosanje prihoda in odhoda z enim tapom",
  "Dnevni in mesečni pregled ur",
  "Vnos odsotnosti (dopust, bolniška)",
  "Izvoz PDF in Excel za inšpekcijo",
  "Podatki v EU, skladno z GDPR",
];

export function Pricing() {
  return (
    <section id="cena" className="mx-auto max-w-4xl px-5 py-16">
      <Reveal>
        <div className="text-center">
          <span className="glass iris-edge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-brand-700">
            <Sparkles className="h-4 w-4 text-brand-600" />
            14 dni brezplačno, brez kartice
          </span>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Preprosta cena, brez presenečenj
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-slate-600">
            En paket za do 10 zaposlenih. Fiksna cena na podjetje, ne na osebo.
          </p>
        </div>
      </Reveal>

      <Reveal delay={80} className="mt-10">
        <div className="glass-strong iris-edge grid gap-8 rounded-3xl p-8 sm:grid-cols-2 sm:items-center sm:p-10">
          {/* Leva stran: vrednost */}
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Delovit <span className="font-medium text-slate-400">· do 10 oseb</span>
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100">
                    <Check className="h-3 w-3 text-brand-600" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Desna stran: cena + CTA */}
          <div className="glass iris-edge rounded-2xl p-6 text-center">
            <div className="flex items-end justify-center gap-1">
              <span className="text-4xl font-extrabold text-slate-900">{eur(PLAN.monthlyNet)}</span>
              <span className="mb-1 text-sm font-medium text-slate-500">+ DDV / mesec</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
              ali {eur(PLAN.yearlyNet)} + DDV / leto
              <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] text-white">2 meseca gratis</span>
            </div>

            <Link
              href="/register"
              className="glow-pulse mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-500"
            >
              Začni brezplačno
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-xs text-slate-500">
              14 dni brezplačno. Brez kartice. Prekličeš kadarkoli.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <p className="mt-6 text-center text-sm text-slate-500">
          Imaš več kot 10 zaposlenih?{" "}
          <a
            href="mailto:info@delovit.si?subject=Povprasevanje%20Delovit%20(vec%20kot%2010%20zaposlenih)"
            className="font-semibold text-brand-700 hover:text-brand-800"
          >
            Pošlji povpraševanje
          </a>
        </p>
      </Reveal>
    </section>
  );
}
