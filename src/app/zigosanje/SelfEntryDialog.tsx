"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Loader2, Pencil } from "lucide-react";
import { selfCreateEntry, selfFixEntry } from "./actions";
import { todayLjubljana, shiftDays, dayLabel } from "@/lib/tzdate";

const TZ = "Europe/Ljubljana";

// ISO časovni žig → "HH:MM" po slovenskem času (format za <input type="time">).
const isoToHM = (iso: string | null): string =>
  iso
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: TZ,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(new Date(iso))
    : "";

// Vnos, ki ga zaposleni lahko popravi (odprt ali označen "za pregled").
export type FixTarget = {
  id: string;
  date: string; // YYYY-MM-DD
  clockInIso: string | null;
  clockOutIso: string | null;
  breakMinutes: number;
};

const BREAK_CHOICES: [number, string][] = [
  [0, "Brez"],
  [15, "15 min"],
  [30, "30 min"],
  [45, "45 min"],
];

const inputCls =
  "w-full rounded-xl border-0 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500";

// Ročni vnos / popravek žigosanja s strani zaposlenega. Vnos se vedno označi
// "za pregled" in ga delodajalec potrdi — zaposleni predlaga, ne odloča.
export function SelfEntry({
  mode,
  fix,
  variant = "link",
  label,
}: {
  mode: "create" | "fix";
  fix?: FixTarget;
  variant?: "link" | "chip";
  label: string;
}) {
  const router = useRouter();
  const today = todayLjubljana();
  // Nov vnos: zadnjih 7 dni (privzeto včeraj — najpogostejši primer pozabe).
  const dayOptions = Array.from({ length: 7 }, (_, i) => shiftDays(today, -i));

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(mode === "create" ? shiftDays(today, -1) : (fix?.date ?? today));
  const [inTime, setInTime] = useState(fix ? isoToHM(fix.clockInIso) : "");
  const [outTime, setOutTime] = useState(fix ? isoToHM(fix.clockOutIso) : "");
  const [breakMin, setBreakMin] = useState(fix?.breakMinutes ?? 0);
  const [note, setNote] = useState("");

  // Pri današnjem odprtem vnosu sme odhod ostati prazen (izmena še teče).
  const outOptional = mode === "fix" && fix?.date === today && fix.clockOutIso == null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    if (!inTime || (!outTime && !outOptional)) {
      setError("Vpiši uro prihoda in odhoda.");
      return;
    }
    setLoading(true);
    const res =
      mode === "create"
        ? await selfCreateEntry({
            date,
            clockInTime: inTime,
            clockOutTime: outTime,
            breakMinutes: breakMin,
            note,
          })
        : await selfFixEntry(fix!.id, {
            clockInTime: inTime,
            clockOutTime: outTime || undefined,
            breakMinutes: breakMin,
            note,
          });
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "chip"
            ? "inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-white/80 transition hover:bg-white hover:text-slate-900"
            : "inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900"
        }
      >
        {variant === "chip" ? (
          <Pencil className="h-3 w-3" />
        ) : (
          <CalendarClock className="h-4 w-4" />
        )}
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
          onClick={() => !loading && setOpen(false)}
        >
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/70"
          >
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50">
              <CalendarClock className="h-5 w-5 text-brand-600" />
            </div>
            <h3 className="mt-4 text-center text-lg font-bold text-slate-900">
              {mode === "create" ? "Pozabljen vnos" : "Popravi vnos"}
            </h3>
            <p className="mt-1.5 text-center text-sm leading-relaxed text-slate-600">
              Vnos bo označen{" "}
              <span className="font-semibold text-amber-700">»za pregled«</span> in ga potrdi
              delodajalec.
            </p>

            {/* Dan */}
            <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Dan
            </label>
            {mode === "create" ? (
              <select value={date} onChange={(e) => setDate(e.target.value)} className={`mt-1.5 ${inputCls}`}>
                {dayOptions.map((d) => (
                  <option key={d} value={d}>
                    {d === today ? `danes (${dayLabel(d)})` : dayLabel(d)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-1.5 rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                {date === today ? `danes (${dayLabel(date)})` : dayLabel(date)}
              </p>
            )}

            {/* Prihod / odhod */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Prihod
                </label>
                <input
                  type="time"
                  value={inTime}
                  onChange={(e) => setInTime(e.target.value)}
                  required
                  className={`mt-1.5 ${inputCls}`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Odhod
                </label>
                <input
                  type="time"
                  value={outTime}
                  onChange={(e) => setOutTime(e.target.value)}
                  required={!outOptional}
                  className={`mt-1.5 ${inputCls}`}
                />
              </div>
            </div>
            {outOptional && (
              <p className="mt-1.5 text-xs text-slate-400">
                Če si še na delu, pusti odhod prazen — popravi se samo prihod.
              </p>
            )}

            {/* Odmor */}
            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Odmor (neobvezno)
            </label>
            <div className="mt-1.5 grid grid-cols-4 gap-1.5">
              {BREAK_CHOICES.map(([min, lbl]) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setBreakMin(min)}
                  className={
                    "rounded-full py-2 text-[13px] font-semibold transition " +
                    (breakMin === min
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200")
                  }
                >
                  {lbl}
                </button>
              ))}
            </div>

            {/* Opomba delodajalcu */}
            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Opomba delodajalcu (neobvezno)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              placeholder="npr. pozabil sem žigosati odhod"
              className={`mt-1.5 ${inputCls}`}
            />

            {error && (
              <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-100">
                {error}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-full bg-slate-100 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200 disabled:opacity-50"
              >
                Prekliči
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Shrani
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
