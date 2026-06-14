"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { izracunajPlaco, eur, PLACA_CONFIG } from "@/lib/placa";
import { captureLead } from "./actions";
import { Button, Card, Input, buttonClasses } from "@/components/ui";

export default function Calculator() {
  const [bruto, setBruto] = useState("1500");
  const r = useMemo(() => izracunajPlaco(Number(bruto.replace(",", "."))), [bruto]);

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-7">
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
              className="w-full rounded-xl bg-white px-4 py-3.5 pr-12 text-3xl font-bold text-slate-900 ring-1 ring-slate-200 shadow-soft outline-none focus:ring-2 focus:ring-brand-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-slate-300">
              €
            </span>
          </div>
        </label>

        <div className="mt-5 overflow-hidden rounded-2xl bg-brand-600 p-6 text-center shadow-lift">
          <p className="text-sm font-medium text-brand-100">Neto plača (izplačilo)</p>
          <p className="mt-1 text-4xl font-bold text-white sm:text-5xl">{eur(r.neto)}</p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Cell label="Prispevki zaposlenega" sub="22,10 %" value={`− ${eur(r.prispevkiDelojemalca)}`} />
        <Cell label="Dohodnina" sub="akontacija" value={`− ${eur(r.dohodnina)}`} />
        <Cell label="Prispevki delodajalca" sub="16,10 %" value={`+ ${eur(r.prispevkiDelodajalca)}`} />
        <Cell label="Strošek delodajalca" sub="skupaj" value={eur(r.strosekDelodajalca)} strong />
      </div>

      <p className="text-xs leading-relaxed text-slate-400">
        Informativni izračun za leto {PLACA_CONFIG.leto}. Upošteva splošno olajšavo; ne upošteva
        olajšav za vzdrževane družinske člane in morebitnih posebnosti. Za uradni izračun preveri
        aktualne stopnje pri FURS ali svojem računovodji.
      </p>

      <EmailCapture />

      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-7 text-center shadow-lift">
        <div className="bg-grid absolute inset-0 opacity-[0.15]" />
        <div className="relative">
          <h2 className="text-lg font-bold text-white">Vodiš evidenco ur ročno?</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-300">
            Naša aplikacija beleži ure in odsotnosti skladno z ZEPDSV — zaposleni žigosajo z enim
            tapom, ti izvoziš evidenco za inšpekcijo.
          </p>
          <Link href="/register" className={buttonClasses("primary", "lg") + " mt-5"}>
            Začni brezplačno →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Cell({
  label,
  sub,
  value,
  strong,
}: {
  label: string;
  sub: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="glass-strong iris-edge rounded-2xl p-4">
      <p className="text-xs text-slate-500">
        {label} <span className="text-slate-400">· {sub}</span>
      </p>
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
      <div className="rounded-2xl bg-brand-50 p-5 text-center text-sm text-brand-800 ring-1 ring-brand-100">
        ✅ Hvala! Poslali ti bomo dostop do brezplačnega meseca preizkusa.
      </div>
    );
  }

  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-slate-900">
        Dobi brezplačen mesec preizkusa evidence ur
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Pusti email in pošljemo ti dostop — brez obveznosti.
      </p>
      <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ti@podjetje.si"
          className="flex-1"
        />
        <Button type="submit" disabled={state === "loading"}>
          {state === "loading" ? "Pošiljam…" : "Pošlji"}
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  );
}
