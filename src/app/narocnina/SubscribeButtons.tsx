"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { createCheckout } from "./actions";
import { PLAN, eur } from "@/lib/billing";

const FEATURES = [
  "Do 10 zaposlenih",
  "Žigosanje, pregledi in odsotnosti",
  "Izvoz PDF in Excel za inšpekcijo",
  "Brez vezave, odpoveš kadarkoli",
];

export function SubscribeButtons() {
  const [loading, setLoading] = useState<"month" | "year" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(interval: "month" | "year") {
    setError(null);
    setLoading(interval);
    const res = await createCheckout(interval);
    setLoading(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.url) window.location.href = res.url;
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Mesečno */}
        <div className="glass iris-edge flex flex-col rounded-3xl p-7">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Mesečno</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-4xl font-extrabold text-slate-900">{eur(PLAN.monthlyNet)}</span>
            <span className="mb-1 text-sm font-medium text-slate-500">+ DDV / mesec</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Plačilo vsak mesec.</p>
          <button
            onClick={() => choose("month")}
            disabled={loading !== null}
            className="mt-6 w-full rounded-full bg-white/70 py-3 text-base font-semibold text-slate-800 ring-1 ring-white/80 transition hover:bg-white disabled:opacity-50"
          >
            {loading === "month" ? "…" : "Izberi mesečno"}
          </button>
        </div>

        {/* Letno (poudarjeno) */}
        <div className="glass-strong iris-edge flex flex-col rounded-3xl p-7 ring-2 ring-brand-500/40">
          <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white shadow-soft">
            ★ 2 meseca gratis
          </span>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Letno</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-4xl font-extrabold text-slate-900">{eur(PLAN.yearlyNet)}</span>
            <span className="mb-1 text-sm font-medium text-slate-500">+ DDV / leto</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Prihraniš {eur(PLAN.monthlyNet * 12 - PLAN.yearlyNet)} na leto.
          </p>
          <button
            onClick={() => choose("year")}
            disabled={loading !== null}
            className="glow-pulse mt-6 w-full rounded-full bg-brand-600 py-3 text-base font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
          >
            {loading === "year" ? "…" : "Izberi letno"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-2xl bg-brand-50 px-4 py-3 text-center text-sm text-brand-800 ring-1 ring-brand-100">
          {error}
        </p>
      )}

      <div className="glass iris-edge mt-6 rounded-2xl p-5">
        <ul className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100">
                <Check className="h-3 w-3 text-brand-600" />
              </span>
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-slate-400">
          Cene so brez DDV. DDV (22 %) se obračuna ob plačilu. Plačilo poteka varno prek Stripe.
        </p>
      </div>
    </div>
  );
}
