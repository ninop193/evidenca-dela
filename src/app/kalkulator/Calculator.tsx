"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { izracunajPlaco, eur, PLACA_CONFIG } from "@/lib/placa";
import { captureLead } from "./actions";

export default function Calculator() {
  const [bruto, setBruto] = useState("1500");
  const r = useMemo(() => izracunajPlaco(Number(bruto.replace(",", "."))), [bruto]);

  return (
    <div className="space-y-6">
      {/* Vnos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Bruto plača (mesečno)
          </span>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              value={bruto}
              onChange={(e) => setBruto(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-2xl font-bold text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-slate-400">
              €
            </span>
          </div>
        </label>

        {/* Glavni rezultat */}
        <div className="mt-5 rounded-xl bg-emerald-50 p-5 text-center ring-1 ring-emerald-100">
          <p className="text-sm font-medium text-emerald-700">Neto plača (izplačilo)</p>
          <p className="mt-1 text-4xl font-bold text-emerald-700">{eur(r.neto)}</p>
        </div>
      </div>

      {/* Razčlenitev */}
      <div className="grid grid-cols-2 gap-3">
        <Cell label="Prispevki zaposlenega (22,10 %)" value={`− ${eur(r.prispevkiDelojemalca)}`} />
        <Cell label="Dohodnina (akontacija)" value={`− ${eur(r.dohodnina)}`} />
        <Cell label="Prispevki delodajalca (16,10 %)" value={`+ ${eur(r.prispevkiDelodajalca)}`} />
        <Cell label="Skupni strošek delodajalca" value={eur(r.strosekDelodajalca)} strong />
      </div>

      <p className="text-xs text-slate-400">
        Informativni izračun za leto {PLACA_CONFIG.leto}. Upošteva splošno olajšavo; ne
        upošteva olajšav za vzdrževane družinske člane in morebitnih posebnosti. Za uradni
        izračun preveri aktualne stopnje pri FURS ali svojem računovodji.
      </p>

      <EmailCapture />

      {/* CTA na SaaS */}
      <div className="rounded-2xl bg-slate-900 p-6 text-center">
        <h2 className="text-lg font-bold text-white">
          Vodiš evidenco delovnega časa ročno?
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Naša aplikacija beleži ure in odsotnosti skladno z ZEPDSV — zaposleni žigosajo z
          enim gumbom, ti izvoziš evidenco za inšpekcijo.
        </p>
        <Link
          href="/register"
          className="mt-4 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-500"
        >
          Začni brezplačno
        </Link>
      </div>
    </div>
  );
}

function Cell({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={"mt-1 text-lg " + (strong ? "font-bold text-slate-900" : "font-semibold text-slate-700")}>
        {value}
      </p>
    </div>
  );
}

function EmailCapture() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setState("loading");
    const res = await captureLead(email);
    if (res.error) {
      setError(res.error);
      setState("idle");
      return;
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center text-sm text-emerald-800">
        ✅ Hvala! Poslali ti bomo dostop do brezplačnega meseca preizkusa.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-900">
        Dobi brezplačen mesec preizkusa evidence ur
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Pusti email in pošljemo ti dostop — brez obveznosti.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ti@podjetje.si"
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-base text-slate-900 outline-none focus:border-emerald-600"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-base font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {state === "loading" ? "Pošiljam…" : "Pošlji"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
