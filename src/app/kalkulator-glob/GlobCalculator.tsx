"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, Scale, Minus, Plus } from "lucide-react";

// Razpona globe — IDENTIČNA blog postu o globah po ZEPDSV.
//  s.p.: 300–8.000 €  ·  pravna oseba: 3.000–20.000 €
const RANGES = {
  sp: { min: 300, max: 8000, label: "Samostojni podjetnik", note: "s.p." },
  pravna: { min: 3000, max: 20000, label: "Pravna oseba", note: "d.o.o. …" },
} as const;
type Tip = keyof typeof RANGES;

const VIOLATIONS = [
  { id: "nevodenje", label: "Ne vodim evidence delovnega časa" },
  { id: "nepopolna", label: "Evidenca je nepopolna (manjkajo odmori / nadure)" },
  { id: "nehramba", label: "Evidence ne hranim predpisano dobo" },
  { id: "studenti", label: "Za študente na napotnici ne vodim evidence" },
] as const;
type ViolId = (typeof VIOLATIONS)[number]["id"];

const eur = (n: number) => new Intl.NumberFormat("sl-SI").format(Math.round(n)) + " €";
const ym = (goal: string) => {
  try {
    (window as unknown as { ym?: (id: number, a: string, g: string) => void }).ym?.(109970527, "reachGoal", goal);
  } catch {}
};

function useCountUp(target: number, ms = 550) {
  const [val, setVal] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(from + (target - from) * e));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return val;
}

function Stepper({
  label,
  value,
  set,
}: {
  label: string;
  value: number;
  set: (n: number) => void;
}) {
  const dec = () => set(Math.max(0, value - 1));
  const inc = () => set(Math.min(999, value + 1));
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center overflow-hidden rounded-xl bg-white/70 ring-1 ring-white/80 focus-within:ring-2 focus-within:ring-brand-500">
        <button
          type="button"
          onClick={dec}
          aria-label={`Zmanjšaj ${label}`}
          className="grid h-11 w-10 shrink-0 place-items-center text-slate-500 transition hover:bg-white hover:text-slate-900"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={Number.isNaN(value) ? "" : value}
          onChange={(e) => set(Math.max(0, Math.min(999, Math.floor(Number(e.target.value) || 0))))}
          className="w-full min-w-0 border-x border-white/70 bg-transparent py-2.5 text-center text-[17px] font-bold tabular-nums text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={inc}
          aria-label={`Povečaj ${label}`}
          className="grid h-11 w-10 shrink-0 place-items-center text-slate-500 transition hover:bg-white hover:text-slate-900"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function GlobCalculator() {
  const [zaposleni, setZaposleni] = useState(5);
  const [studenti, setStudenti] = useState(2);
  const [tip, setTip] = useState<Tip>("pravna");
  const [checked, setChecked] = useState<Record<ViolId, boolean>>({
    nevodenje: true,
    nepopolna: false,
    nehramba: false,
    studenti: false,
  });

  const range = RANGES[tip];
  const active = VIOLATIONS.filter((v) => checked[v.id]);
  const hasViolation = active.length > 0;

  const total = Math.max(0, zaposleni) + Math.max(0, studenti);
  let severity = 0;
  if (hasViolation) {
    severity = 0.34 + (active.length - 1) * 0.15;
    severity += Math.min(0.25, total / 40);
    if (checked.studenti && studenti > 0) severity += 0.1;
    severity = Math.min(0.98, Math.max(0.2, severity));
  }

  const hero = useCountUp(hasViolation ? range.max : 0);
  const minLikely = useCountUp(hasViolation ? range.min : 0);

  const fired = useRef(false);
  useEffect(() => {
    if (hasViolation && !fired.current) {
      fired.current = true;
      ym("glob_izracun");
    }
  }, [hasViolation]);

  const plural = (n: number, one: string, few: string, many: string) =>
    n === 1 ? one : n === 2 || (n > 20 && n % 10 === 2) ? few : n < 5 || (n > 20 && n % 10 < 5 && n % 10 > 0) ? few : many;

  return (
    <div className="space-y-5">
      <div className="grid items-stretch gap-5 md:grid-cols-2">
        {/* ── VNOS ── */}
        <div className="glass-strong iris-edge flex flex-col gap-5 rounded-3xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Tvoji podatki</h2>

          <div className="grid grid-cols-2 gap-3">
            <Stepper label="Redno zaposleni" value={zaposleni} set={setZaposleni} />
            <Stepper label="Študenti (napotnica)" value={studenti} set={setStudenti} />
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">Tip zavezanca</span>
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(RANGES) as Tip[]).map((k) => {
                const on = tip === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setTip(k)}
                    className={
                      "rounded-2xl px-4 py-3 text-left ring-1 transition " +
                      (on ? "bg-brand-600 text-white ring-brand-600" : "bg-white/70 text-slate-700 ring-white/80 hover:bg-white")
                    }
                  >
                    <span className="block text-sm font-bold leading-tight">{RANGES[k].label}</span>
                    <span className={"block text-xs " + (on ? "text-brand-50/80" : "text-slate-400")}>{RANGES[k].note}</span>
                    <span className={"mt-1.5 block text-xs font-semibold " + (on ? "text-white" : "text-slate-500")}>
                      {eur(RANGES[k].min)} – {eur(RANGES[k].max)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto">
            <span className="mb-2 block text-sm font-medium text-slate-700">Katere kršitve veljajo?</span>
            <div className="space-y-2">
              {VIOLATIONS.map((v) => {
                const on = checked[v.id];
                return (
                  <label
                    key={v.id}
                    className={
                      "flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm ring-1 transition " +
                      (on ? "bg-brand-50/80 text-slate-800 ring-brand-200" : "bg-white/60 text-slate-600 ring-white/70 hover:bg-white/80")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={(e) => setChecked((c) => ({ ...c, [v.id]: e.target.checked }))}
                      className="h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="leading-snug">{v.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── REZULTAT ── */}
        <div
          className={
            "flex flex-col rounded-3xl p-6 ring-1 transition-colors " +
            (hasViolation ? "bg-red-50/70 ring-red-100" : "glass-strong iris-edge")
          }
        >
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Tvoje tveganje</h2>

          {hasViolation ? (
            <>
              <div className="mt-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Najvišja možna globa za delodajalca
                </p>
                <p className="mt-1 text-[3rem] font-extrabold leading-none tracking-tight tabular-nums text-red-600 sm:text-[3.4rem]">
                  {eur(hero)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Zakonski razpon: <strong className="text-slate-900">{eur(minLikely)} – {eur(range.max)}</strong>
                </p>
              </div>

              {/* Kazalec resnosti */}
              <div className="mt-5">
                <div className="mb-1 flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <span>minimum</span>
                  <span>maksimum</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/70 ring-1 ring-slate-200/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 transition-all duration-500 ease-out"
                    style={{ width: `${Math.round(severity * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Bližje maksimumu ob več kršitvah, več delavcih in prezrtih študentih (escalation logika inšpektorata).
                </p>
              </div>

              <div className="my-5 h-px bg-slate-200/70" />

              {/* Razčlenitev */}
              <p className="text-sm font-semibold text-slate-900">Kaj te izpostavlja globi</p>
              <ul className="mt-2 space-y-1.5">
                {active.map((v) => (
                  <li key={v.id} className="flex items-start gap-2 text-sm text-slate-600">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <span className="leading-snug">{v.label}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip>{active.length} {plural(active.length, "kršitev", "kršitvi", "kršitev")}</Chip>
                <Chip>{total} {plural(total, "delavec", "delavca", "delavcev")} v evidenci</Chip>
                {checked.studenti && studenti > 0 && <Chip>študenti brez evidence</Chip>}
              </div>

              <p className="mt-auto pt-5 text-xs leading-relaxed text-slate-400">
                Informativni izračun po ZEPDSV, ni pravni nasvet. Dejansko globo odmeri inšpektorat glede na okoliščine.
              </p>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/70 text-slate-400 ring-1 ring-white/80">
                <Scale className="h-7 w-7" />
              </span>
              <p className="mt-4 font-semibold text-slate-700">Obkljukaj vsaj eno kršitev</p>
              <p className="mt-1 max-w-[16rem] text-sm text-slate-500">
                Izberi, kaj pri tebi ne drži, in takoj vidiš razpon globe, ki ti grozi.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="overflow-hidden rounded-3xl bg-brand-600 px-6 py-8 text-center text-white sm:px-10">
        <p className="mx-auto max-w-xl text-lg font-bold sm:text-xl">
          Delovit vodi evidenco za zaposlene in študente v enem orodju
        </p>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-brand-50/90">
          Žigosanje s telefonom, izvoz za inšpekcijo v PDF ali Excel. Brezplačen preizkus, brez kreditne kartice.
        </p>
        <Link
          href="/register"
          onClick={() => ym("glob_cta")}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          Začni brezplačno
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-4 text-sm">
          <Link
            href="/blog/globe-zepdsv-evidenca-delovnega-casa"
            className="font-medium text-brand-50 underline underline-offset-2 hover:text-white"
          >
            Preberi, kako inšpektorat odmerja globe →
          </Link>
        </p>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
      {children}
    </span>
  );
}
