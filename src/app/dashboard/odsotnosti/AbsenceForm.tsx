"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAbsence } from "./actions";
import { TYPE_LABELS, CATEGORY_LABELS } from "./labels";

// Predlagana kategorija glede na vrsto odsotnosti (admin lahko spremeni).
const DEFAULT_CATEGORY: Record<string, string> = {
  letni_dopust: "nadomestilo_iz_sredstev_delodajalca",
  bolniska_do_30: "nadomestilo_iz_sredstev_delodajalca",
  bolniska_zzzs: "nadomestilo_v_breme_drugih",
  starsevsko: "nadomestilo_v_breme_drugih",
  izredni_dopust: "nadomestilo_iz_sredstev_delodajalca",
  drugo: "brez_nadomestila",
};

export default function AbsenceForm({
  employees,
}: {
  employees: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("nadomestilo_iz_sredstev_delodajalca");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const res = await createAbsence({
      employeeId: String(f.get("employeeId") ?? ""),
      dateFrom: String(f.get("dateFrom") ?? ""),
      dateTo: String(f.get("dateTo") ?? ""),
      unworkedHours: String(f.get("unworkedHours") ?? ""),
      compensationType: String(f.get("compensationType") ?? ""),
      compensationCategory: String(f.get("compensationCategory") ?? ""),
      reason: String(f.get("reason") ?? ""),
      notes: String(f.get("notes") ?? ""),
    });
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    router.push("/dashboard/odsotnosti");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Zaposleni *</span>
        <select
          name="employeeId"
          required
          defaultValue=""
          className="w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900 ring-1 ring-white/80 outline-none transition focus:ring-2 focus:ring-brand-500"
        >
          <option value="" disabled>
            Izberi zaposlenega
          </option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.full_name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Od *</span>
          <input name="dateFrom" type="date" required className="w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900 ring-1 ring-white/80 outline-none transition focus:ring-2 focus:ring-brand-500" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Do *</span>
          <input name="dateTo" type="date" required className="w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900 ring-1 ring-white/80 outline-none transition focus:ring-2 focus:ring-brand-500" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Neopravljene ure (skupaj) *
        </span>
        <input
          name="unworkedHours"
          type="number"
          step="0.25"
          required
          placeholder="npr. 8 za en dan, 40 za teden"
          className="w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900 ring-1 ring-white/80 outline-none transition focus:ring-2 focus:ring-brand-500"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Vrsta odsotnosti *</span>
        <select
          name="compensationType"
          required
          defaultValue="letni_dopust"
          onChange={(e) => setCategory(DEFAULT_CATEGORY[e.target.value] ?? category)}
          className="w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900 ring-1 ring-white/80 outline-none transition focus:ring-2 focus:ring-brand-500"
        >
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Kategorija nadomestila *</span>
        <select
          name="compensationCategory"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900 ring-1 ring-white/80 outline-none transition focus:ring-2 focus:ring-brand-500"
        >
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Opomba (neobvezno)</span>
        <input name="reason" className="w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900 ring-1 ring-white/80 outline-none transition focus:ring-2 focus:ring-brand-500" />
      </label>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand-600 py-3 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(29,78,216,0.6)] transition hover:bg-brand-500 disabled:opacity-50"
      >
        {loading ? "Shranjujem…" : "Shrani odsotnost"}
      </button>
      <Link href="/dashboard/odsotnosti" className="block text-center text-sm text-slate-500 hover:text-slate-900">
        Prekliči
      </Link>
    </form>
  );
}
