"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Square, Loader2 } from "lucide-react";
import { clockIn, clockOut } from "./actions";

type Entry = {
  id: string;
  clock_in: string | null;
  clock_out: string | null;
  total_worked_hours: number | null;
};

const fmtTime = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("sl-SI", {
        timeZone: "Europe/Ljubljana",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso))
    : "—";

function elapsedStr(fromIso: string | null, now: number) {
  if (!fromIso) return "0:00:00";
  const ms = Math.max(0, now - new Date(fromIso).getTime());
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function ClockWidget({
  isOpen,
  openSince,
  todayEntries,
  reminderHours,
  serverNow,
}: {
  isOpen: boolean;
  openSince: string | null;
  todayEntries: Entry[];
  reminderHours: number;
  serverNow: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOut, setConfirmOut] = useState(false);
  const [breakMin, setBreakMin] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  // Sidro na STREŽNIŠKI čas: če ima telefon napačno nastavljeno uro, bi
  // Date.now() pokvaril živi števec (npr. takoj pokazal 1:00:00). Odmik
  // izračunamo enkrat ob nalaganju in ga prištevamo ob vsakem ticku.
  const [clockOffset] = useState(() => serverNow - Date.now());
  const correctedNow = now + clockOffset;

  // Živi števec časa, ko je zaposleni na delu.
  useEffect(() => {
    if (!isOpen) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [isOpen]);

  async function submit(action: "in" | "out") {
    if (loading) return;
    setError(null);
    setLoading(true);
    // Taktilni odziv na mobilnih napravah (Apple-style press feedback).
    try {
      navigator.vibrate?.(18);
    } catch {}
    const res = action === "out" ? await clockOut(breakMin) : await clockIn();
    setLoading(false);
    setConfirmOut(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  function handleClick() {
    if (loading) return;
    if (isOpen) {
      // Odhod je "dokončen" (popravke ureja delodajalec) → najprej potrditev.
      setError(null);
      setBreakMin(0);
      setConfirmOut(true);
      return;
    }
    void submit("in");
  }

  const totalToday = todayEntries.reduce((a, e) => a + (Number(e.total_worked_hours) || 0), 0);

  // Opomnik: če je odprta izmena presegla zakonsko dnevno mejo, spomni na odhod.
  const overLimit =
    isOpen &&
    openSince != null &&
    correctedNow - new Date(openSince).getTime() >= reminderHours * 3_600_000;

  return (
    <div className="flex w-full flex-col items-center">
      {/* Status */}
      <div className="mb-8 text-center">
        {isOpen ? (
          <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Na delu od {fmtTime(openSince)}
          </span>
        ) : (
          <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            Trenutno nisi na delu
          </span>
        )}
      </div>

      {/* Premium liquid-glass "dial" gumb */}
      <button
        onClick={handleClick}
        disabled={loading}
        aria-label={isOpen ? "Žigosaj odhod" : "Žigosaj prihod"}
        className="group relative grid h-64 w-64 place-items-center rounded-full outline-none transition-transform duration-200 active:scale-[0.955] disabled:cursor-wait"
      >
        {/* dihajoč barvni sij za gumbom (kompozitorska animacija — poceni) */}
        <span
          className={
            "clock-breathe absolute -inset-4 rounded-full blur-2xl transition-colors duration-500 " +
            (isOpen ? "bg-rose-400/45" : "bg-brand-500/45")
          }
        />

        {/* počasi vrteč iridescenten obroč (premium podpis) */}
        <span
          aria-hidden
          className="clock-ring absolute -inset-[2px] rounded-full opacity-80"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 10%, rgba(124,174,255,0.95) 32%, rgba(116,247,192,0.7) 50%, rgba(185,139,255,0.95) 66%, rgba(255,143,214,0.6) 80%, transparent 94%)",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
          }}
        />

        {/* frosted stekleni bezel z zunanjim dvigom (drop shadow v barvi stanja) */}
        <span
          className={
            "glass-strong absolute inset-0 rounded-full transition-shadow duration-500 " +
            (isOpen
              ? "shadow-[0_22px_55px_-16px_rgba(244,63,94,0.55)]"
              : "shadow-[0_22px_55px_-16px_rgba(47,99,255,0.55)]")
          }
        />

        {/* obarvana kupola — bogat radialni preliv z osvetljeno »ročko« zgoraj levo */}
        <span
          aria-hidden
          className="absolute inset-3 rounded-full transition-colors duration-500"
          style={{
            background: isOpen
              ? "radial-gradient(120% 120% at 32% 24%, #ffa9c6 0%, #fb5c8b 34%, #e11d5f 70%, #b8134f 100%)"
              : "radial-gradient(120% 120% at 32% 24%, #78a2ff 0%, #2f63ff 36%, #1d4ed8 72%, #1a3fae 100%)",
            boxShadow:
              "inset 0 3px 12px rgba(255,255,255,0.5), inset 0 -18px 38px rgba(10,20,60,0.28)",
          }}
        />
        {/* svetla specular pika (odsev vira svetlobe) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-3 rounded-full"
          style={{
            background:
              "radial-gradient(56% 42% at 33% 23%, rgba(255,255,255,0.75), rgba(255,255,255,0) 62%)",
          }}
        />
        {/* mehak gloss čez zgornjo polovico + notranji hairline rob */}
        <span className="pointer-events-none absolute inset-3 rounded-full bg-gradient-to-t from-transparent via-transparent to-white/35" />
        <span className="pointer-events-none absolute inset-3 rounded-full ring-1 ring-inset ring-white/45" />

        {/* vsebina — napis je fiksno na sredini; ikona lebdi nad njim, števec pod njim */}
        <span className="absolute inset-0 grid place-items-center text-white [text-shadow:0_1px_10px_rgba(10,20,60,0.28)]">
          {/* ikona nad sredino */}
          <span className="pointer-events-none absolute left-1/2 top-[26%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_2px_6px_rgba(10,20,60,0.35)]">
            {loading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : isOpen ? (
              <Square className="h-6 w-6 fill-white" strokeWidth={0} />
            ) : (
              <Play className="ml-0.5 h-7 w-7 fill-white" strokeWidth={0} />
            )}
          </span>

          {/* napis — geometrijsko središče */}
          <span className="text-[2.1rem] font-bold leading-none tracking-tight">
            {isOpen ? "Odhod" : "Prihod"}
          </span>

          {/* živ števec pod sredino — v prefinjeni frosted kapsuli */}
          {isOpen && (
            <span className="pointer-events-none absolute left-1/2 top-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 px-3 py-1 font-mono text-[15px] tabular-nums text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm [text-shadow:none]">
              {elapsedStr(openSince, correctedNow)}
            </span>
          )}
        </span>
      </button>

      {/* Potrditev odhoda — odhod je dokončen (popravke ureja delodajalec) */}
      {confirmOut && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
          onClick={() => !loading && setConfirmOut(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/70"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-50">
              <Square className="h-5 w-5 fill-rose-600 text-rose-600" strokeWidth={0} />
            </div>
            <h3 className="mt-4 text-center text-lg font-bold text-slate-900">Žigosaš odhod?</h3>
            <p className="mt-1.5 text-center text-sm leading-relaxed text-slate-600">
              Na delu si od {fmtTime(openSince)} ({elapsedStr(openSince, correctedNow)}).
              Odhoda kasneje ne moreš popraviti sam; popravke lahko uredi delodajalec.
            </p>

            {/* Neobvezna zabeležka odmora (se všteva v delovni čas, ur ne odšteva) */}
            <p className="mt-5 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
              Odmor danes (neobvezno)
            </p>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {[
                [0, "Brez"],
                [15, "15 min"],
                [30, "30 min"],
                [45, "45 min"],
              ].map(([min, label]) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setBreakMin(min as number)}
                  className={
                    "rounded-full py-2 text-[13px] font-semibold transition " +
                    (breakMin === min
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200")
                  }
                >
                  {label as string}
                </button>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmOut(false)}
                disabled={loading}
                className="rounded-full bg-slate-100 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200 disabled:opacity-50"
              >
                Prekliči
              </button>
              <button
                onClick={() => void submit("out")}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Potrdi odhod
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="glass mt-6 rounded-xl px-3.5 py-2 text-sm font-medium text-rose-600">
          {error}
        </p>
      )}

      {overLimit && !error && (
        <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-amber-50/90 px-3.5 py-2.5 text-sm text-amber-800 ring-1 ring-amber-200">
          <span aria-hidden className="mt-0.5">⏰</span>
          <span>
            Presegli ste {reminderHours} ur dela. Ste še na delu? Ne pozabite žigosati odhoda.
          </span>
        </div>
      )}

      {/* Danes */}
      <div className="mt-12 w-full">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-slate-500">Danes</h2>
          {totalToday > 0 && (
            <span className="text-sm font-bold text-slate-900">{totalToday.toFixed(2)} h</span>
          )}
        </div>
        {todayEntries.length === 0 ? (
          <div className="glass rounded-2xl p-5 text-center text-sm text-slate-400">
            Še ni vnosov za danes.
          </div>
        ) : (
          <ul className="glass-strong iris-edge divide-y divide-white/40 overflow-hidden rounded-2xl">
            {todayEntries.map((e) => (
              <li key={e.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-700">
                  {fmtTime(e.clock_in)} – {fmtTime(e.clock_out)}
                </span>
                <span className="font-semibold text-slate-900">
                  {e.clock_out == null ? (
                    <span className="inline-flex items-center gap-1.5 text-brand-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
                      v teku
                    </span>
                  ) : (
                    `${(e.total_worked_hours ?? 0).toFixed(2)} h`
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
