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

  return (
    <div className="flex w-full flex-col items-center">
      {isOpen && (
        <p className="mb-6 text-center text-sm text-slate-600">
          Na delu od <strong className="text-slate-900">{fmtTime(openSince)}</strong>
        </p>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className={
          "flex h-56 w-56 flex-col items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-60 " +
          (isOpen ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700")
        }
      >
        <span className="text-4xl">{isOpen ? "⏹" : "▶"}</span>
        <span className="mt-2">
          {loading ? "…" : isOpen ? "Odhod" : "Prihod"}
        </span>
      </button>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-10 w-full">
        <h2 className="mb-2 text-sm font-semibold text-slate-500">Danes</h2>
        {todayEntries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-400">
            Še ni vnosov za danes.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {todayEntries.map((e) => (
              <li key={e.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-700">
                  {fmtTime(e.clock_in)} – {fmtTime(e.clock_out)}
                </span>
                <span className="font-medium text-slate-900">
                  {e.clock_out == null
                    ? "v teku"
                    : `${(e.total_worked_hours ?? 0).toFixed(2)} h`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
