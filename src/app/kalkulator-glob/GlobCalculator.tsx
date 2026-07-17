"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, Users, GraduationCap, ShieldCheck } from "lucide-react";

// Razpona globe — IDENTIČNA blog postu o globah po ZEPDSV.
//  s.p.: 300–8.000 €  ·  pravna oseba: 3.000–20.000 €
const RANGES = {
  sp: { min: 300, max: 8000, label: "Samostojni podjetnik (s.p.)" },
  pravna: { min: 3000, max: 20000, label: "Pravna oseba (d.o.o. …)" },
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
    (window as unknown as { ym?: (id: number, a: string, g: string) => void }).ym?.(
      109970527,
      "reachGoal",
      goal,
    );
  } catch {}
};

// Gladek count-up ob spremembi ciljne številke.
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

  // Resnost (0..1) — kvalitativni kazalec proti maksimumu (brez vmesnih € zneskov).
  // Skladno z "escalation logiko" iz posta: več kršitev / več delavcev / študenti brez
  // evidence → bliže maksimumu.
  const total = Math.max(0, zaposleni) + Math.max(0, studenti);
  let severity = 0;
  if (hasViolation) {
    severity = 0.34 + (active.length - 1) * 0.15; // 1 kršitev ≈ 0.34, vsaka naslednja +0.15
    severity += Math.min(0.25, total / 40); // do +0.25 pri več delavcih
    if (checked.studenti && studenti > 0) severity += 0.1; // prezrti študenti
    severity = Math.min(0.98, Math.max(0.2, severity));
  }

  const heroTarget = hasViolation ? range.max : 0;
  const hero = useCountUp(heroTarget);
  const minLikely = useCountUp(hasViolation ? range.min : 0);

  // Analytics: prvi izračun (prva obkljukana kršitev).
  const fired = useRef(false);
  useEffect(() => {
    if (hasViolation && !fired.current) {
      fired.current = true;
      ym("glob_izracun");
    }
  }, [hasViolation]);

  const numField = (
    label: string,
    val: number,
    set: (n: number) => void,
    icon: React.ReactNode,
  ) => (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
        {icon}
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={Number.isNaN(val) ? "" : val}
        onChange={(e) => set(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
        className="w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] font-semibold text-slate-900 ring-1 ring-white/80 outline-none transition focus:ring-2 focus:ring-brand-500"
      />
    </label>
  );

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* VNOS */}
      <div className="glass-strong iris-edge rounded-2xl p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3">
          {numField("Redno zaposleni", zaposleni, setZaposleni, <Users className="h-4 w-4 text-slate-400" />)}
          {numField("Študenti (napotnica)", studenti, setStudenti, <GraduationCap className="h-4 w-4 text-slate-400" />)}
        </div>

        <div className="mt-5">
          <span className="mb-2 block text-sm font-medium text-slate-700">Tip zavezanca</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(Object.keys(RANGES) as Tip[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setTip(k)}
                className={
                  "rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold ring-1 transition " +
                  (tip === k
                    ? "bg-brand-600 text-white ring-brand-600"
                    : "bg-white/70 text-slate-700 ring-white/80 hover:bg-white")
                }
              >
                {RANGES[k].label}
                <span className={"mt-0.5 block text-xs font-medium " + (tip === k ? "text-brand-50/90" : "text-slate-400")}>
                  {eur(RANGES[k].min)} – {eur(RANGES[k].max)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <span className="mb-2 block text-sm font-medium text-slate-700">Katere kršitve veljajo?</span>
          <div className="space-y-2">
            {VIOLATIONS.map((v) => (
              <label
                key={v.id}
                className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-white/60 px-3.5 py-2.5 text-sm text-slate-700 ring-1 ring-white/70 transition hover:bg-white/80"
              >
                <input
                  type="checkbox"
                  checked={checked[v.id]}
                  onChange={(e) => setChecked((c) => ({ ...c, [v.id]: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span>{v.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* REZULTAT */}
      <div className="flex flex-col gap-4">
        <div
          className={
            "rounded-2xl p-5 text-center ring-1 sm:p-6 " +
            (hasViolation ? "bg-red-50/80 ring-red-100" : "bg-white/60 ring-white/70")
          }
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Najvišja možna globa za delodajalca
          </p>
          <p
            className={
              "mt-1 text-[2.6rem] font-extrabold leading-none tracking-tight tabular-nums sm:text-5xl " +
              (hasViolation ? "text-red-600" : "text-slate-400")
            }
          >
            {eur(hero)}
          </p>
          {hasViolation ? (
            <p className="mt-2 text-sm text-slate-600">
              Razpon globe: <strong className="text-slate-900">{eur(minLikely)} – {eur(range.max)}</strong>
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Obkljukaj vsaj eno kršitev za oceno tveganja.</p>
          )}

          {/* Kazalec resnosti */}
          {hasViolation && (
            <div className="mt-4">
              <div className="flex justify-between text-[11px] font-medium text-slate-400">
                <span>minimum</span>
                <span>maksimum</span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-200/70">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 transition-all duration-500"
                  style={{ width: `${Math.round(severity * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                Ocena resnosti: bližje maksimumu ob več kršitvah, več delavcih in prezrtih študentih.
              </p>
            </div>
          )}
        </div>

        {/* Razčlenitev po kršitvah + dejavniki resnosti */}
        {hasViolation && (
          <div className="glass iris-edge rounded-2xl p-5">
            <p className="text-sm font-semibold text-slate-900">Kaj te izpostavlja globi</p>
            <ul className="mt-2 space-y-1.5">
              {active.map((v) => (
                <li key={v.id} className="flex items-start gap-2 text-sm text-slate-600">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  {v.label}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Factor>{active.length} {active.length === 1 ? "kršitev" : active.length < 5 ? "kršitve" : "kršitev"}</Factor>
              <Factor>{total} {total === 1 ? "delavec" : "delavcev"} v evidenci</Factor>
              {checked.studenti && studenti > 0 && <Factor>študenti brez evidence</Factor>}
            </div>
          </div>
        )}

        <p className="px-1 text-xs leading-relaxed text-slate-400">
          Informativni izračun po ZEPDSV, ni pravni nasvet. Dejansko globo odmeri inšpektorat
          glede na okoliščine.
        </p>
      </div>

      {/* CTA čez celo širino */}
      <div className="md:col-span-2">
        <div className="mt-1 rounded-3xl bg-brand-600 px-6 py-7 text-center text-white sm:px-8">
          <ShieldCheck className="mx-auto h-8 w-8" />
          <p className="mt-3 text-lg font-bold sm:text-xl">
            Delovit vodi evidenco za zaposlene in študente v enem orodju
          </p>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-brand-50/90">
            Žigosanje s telefonom, izvoz za inšpekcijo v PDF ali Excel. Brezplačen preizkus, brez
            kreditne kartice.
          </p>
          <Link
            href="/register"
            onClick={() => ym("glob_cta")}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Začni brezplačno
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-sm">
            <Link
              href="/blog/globe-zepdsv-evidenca-delovnega-casa"
              className="font-medium text-brand-50 underline underline-offset-2 hover:text-white"
            >
              Preberi, kako inšpektorat odmerja globe →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Factor({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
      {children}
    </span>
  );
}
