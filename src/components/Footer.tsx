import Link from "next/link";
import { Wordmark } from "@/components/ui";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 px-4 pb-8">
      <div className="glass iris-edge mx-auto max-w-6xl rounded-3xl px-6 py-10 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Wordmark />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
              Preprosto orodje za evidenco delovnega časa za manjše delodajalce in
              samostojne podjetnike z zaposlenimi. Zaposleni žigosajo ure s telefonom, ti pa
              imaš vedno urejeno evidenco za inšpekcijo.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Orodja</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/kalkulator" className="hover:text-brand-700">Bruto-neto kalkulator</Link></li>
              <li><Link href="/register" className="hover:text-brand-700">Registracija podjetja</Link></li>
              <li><Link href="/login" className="hover:text-brand-700">Prijava</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Spoznaj</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/#cena" className="hover:text-brand-700">Cena</Link></li>
              <li><Link href="/#kako" className="hover:text-brand-700">Kako deluje</Link></li>
              <li><Link href="/#vprasanja" className="hover:text-brand-700">Pogosta vprašanja</Link></li>
              <li><Link href="/#zakon" className="hover:text-brand-700">Kaj zahteva zakon</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Pravno</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/pravno/pogoji" className="hover:text-brand-700">Pogoji uporabe</Link></li>
              <li><Link href="/pravno/zasebnost" className="hover:text-brand-700">Politika zasebnosti</Link></li>
              <li><Link href="/pravno/vracila" className="hover:text-brand-700">Vračila in odpoved</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-white/50 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {year} Delovit. Storitev zagotavlja NextEra d.o.o.</p>
          <p>Skladno z ZEPDSV in novelo ZEPDSV-B. Podatki shranjeni v EU.</p>
        </div>
      </div>
    </footer>
  );
}
