"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { createCheckout } from "./actions";
import { PLAN, eur } from "@/lib/billing";

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
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Mesečno */}
        <div className="glass iris-edge sheen rounded-2xl p-6">
          <p className="text-sm font-semibold text-slate-500">Mesečno</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">
            {eur(PLAN.monthlyNet)}
            <span className="text-base font-medium text-slate-500"> + DDV / mesec</span>
          </p>
          <button
            onClick={() => choose("month")}
            disabled={loading !== null}
            className="mt-5 w-full rounded-full bg-white/70 py-3 text-base font-semibold text-slate-800 ring-1 ring-white/80 transition hover:bg-white disabled:opacity-50"
          >
            {loading === "month" ? "…" : "Izberi mesečno"}
          </button>
        </div>

        {/* Letno */}
        <div className="glass-strong iris-edge sheen relative rounded-2xl p-6 ring-2 ring-brand-500/40">
          <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-semibold text-white shadow-soft">
            2 meseca gratis
          </span>
          <p className="text-sm font-semibold text-slate-500">Letno</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">
            {eur(PLAN.yearlyNet)}
            <span className="text-base font-medium text-slate-500"> + DDV / leto</span>
          </p>
          <button
            onClick={() => choose("year")}
            disabled={loading !== null}
            className="glow-pulse mt-5 w-full rounded-full bg-brand-600 py-3 text-base font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
          >
            {loading === "year" ? "…" : "Izberi letno"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-center text-sm text-brand-800 ring-1 ring-brand-100">
          {error}
        </p>
      )}

      <ul className="mt-6 space-y-2 text-sm text-slate-600">
        {["Do 10 zaposlenih", "Žigosanje, pregledi in odsotnosti", "Izvoz PDF in Excel za inšpekcijo", "Brez vezave, odpoveš kadarkoli"].map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-100">
              <Check className="h-3 w-3 text-brand-600" />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-slate-400">
        Cene so brez DDV. DDV (22 %) se obračuna ob plačilu. Plačilo poteka prek Stripe.
      </p>
    </div>
  );
}
