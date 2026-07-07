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
    const res = action === "out" ? await clockOut() : await clockIn();
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

      {/* Apple-style liquid glass gumb */}
      <button
        onClick={handleClick}
        disabled={loading}
        aria-label={isOpen ? "Žigosaj odhod" : "Žigosaj prihod"}
        className="group relative grid h-64 w-64 place-items-center rounded-full outline-none transition-transform duration-200 active:scale-[0.96] disabled:cursor-wait"
      >
        {/* žareče ozadje */}
        <span
          className={
            "absolute inset-0 rounded-full blur-2xl transition-colors duration-500 " +
            (isOpen ? "bg-rose-400/50" : "bg-brand-500/50")
          }
        />
        {/* frosted stekleni obroč */}
        <span className="glass-strong iris-edge absolute inset-0 rounded-full" />
        {/* obarvano jedro z gloss odsevom */}
        <span
          className={
            "absolute inset-5 rounded-full shadow-[inset_0_2px_10px_rgba(255,255,255,0.5),inset_0_-12px_30px_rgba(0,0,0,0.18)] transition-colors duration-500 " +
            (isOpen
              ? "bg-gradient-to-br from-rose-400 to-rose-600"
              : "bg-gradient-to-br from-brand-400 to-brand-700")
          }
        />
        {/* specular sij na vrhu */}
        <span className="absolute inset-5 rounded-full bg-gradient-to-t from-transparent via-transparent to-white/45" />
        <span className="absolute inset-5 rounded-full ring-1 ring-white/40" />

        {/* vsebina — napis je fiksno na sredini; ikona lebdi nad njim, števec pod njim */}
        <span className="absolute inset-0 grid place-items-center text-white">
          {/* ikona nad sredino */}
          <span className="pointer-events-none absolute left-1/2 top-[27%] -translate-x-1/2 -translate-y-1/2">
            {loading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : isOpen ? (
              <Square className="h-6 w-6 fill-white" strokeWidth={0} />
            ) : (
              <Play className="ml-0.5 h-7 w-7 fill-white" strokeWidth={0} />
            )}
          </span>

          {/* napis — geometrijsko središče */}
          <span className="text-[2rem] font-bold leading-none tracking-tight">
            {isOpen ? "Odhod" : "Prihod"}
          </span>

          {/* živ števec pod sredino */}
          {isOpen && (
            <span className="pointer-events-none absolute left-1/2 top-[73%] -translate-x-1/2 -translate-y-1/2 font-mono text-base tabular-nums text-white/90">
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
