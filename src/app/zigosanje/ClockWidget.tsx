"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

  async function handleClick() {
    setError(null);
    setLoading(true);
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
      <div className="mb-7 text-center">
        {isOpen ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 ring-1 ring-brand-100">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
            Na delu od {fmtTime(openSince)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            Trenutno nisi na delu
          </span>
        )}
      </div>

      <button
        onClick={handleClick}
        disabled={loading}
        className={
          "relative grid h-60 w-60 place-items-center rounded-full text-white shadow-lift transition-transform active:scale-95 disabled:opacity-70 " +
          (isOpen ? "bg-rose-500 hover:bg-rose-600" : "bg-brand-600 hover:bg-brand-700")
        }
      >
        <span className="absolute inset-3 rounded-full ring-2 ring-white/25" />
        <span className="text-center">
          <span className="block text-5xl">{isOpen ? "⏹" : "▶"}</span>
          <span className="mt-2 block text-xl font-bold">
            {loading ? "…" : isOpen ? "Odhod" : "Prihod"}
          </span>
        </span>
      </button>

      {error && (
        <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
          {error}
        </p>
      )}

      <div className="mt-10 w-full">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500">Danes</h2>
          {totalToday > 0 && (
            <span className="text-sm font-semibold text-slate-900">{totalToday.toFixed(2)} h</span>
          )}
        </div>
        {todayEntries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-400">
            Še ni vnosov za danes.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-card">
            {todayEntries.map((e) => (
              <li key={e.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-700">
                  {fmtTime(e.clock_in)} – {fmtTime(e.clock_out)}
                </span>
                <span className="font-semibold text-slate-900">
                  {e.clock_out == null ? (
                    <span className="text-brand-600">v teku</span>
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
