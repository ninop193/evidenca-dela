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
}: {
  isOpen: boolean;
  openSince: string | null;
  todayEntries: Entry[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Živi števec časa, ko je zaposleni na delu.
  useEffect(() => {
    if (!isOpen) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [isOpen]);

  async function handleClick() {
    if (loading) return;
    setError(null);
    setLoading(true);
    // Taktilni odziv na mobilnih napravah (Apple-style press feedback).
    try {
      navigator.vibrate?.(18);
    } catch {}
    const res = isOpen ? await clockOut() : await clockIn();
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  const totalToday = todayEntries.reduce((a, e) => a + (Number(e.total_worked_hours) || 0), 0);

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
              {elapsedStr(openSince, now)}
            </span>
          )}
        </span>
      </button>

      {error && (
        <p className="glass mt-6 rounded-xl px-3.5 py-2 text-sm font-medium text-rose-600">
          {error}
        </p>
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
