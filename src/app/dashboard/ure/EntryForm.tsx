"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createManualEntry, updateEntry, deleteEntry, type EntryInput } from "./actions";
import { SloDateInput } from "@/components/SloDateInput";

export type EntryInitial = Partial<EntryInput> & { employeeId?: string; date?: string };

export default function EntryForm({
  mode,
  entryId,
  employees,
  initial,
}: {
  mode: "create" | "edit";
  entryId?: string;
  employees: { id: string; full_name: string }[];
  initial?: EntryInitial;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const input: EntryInput = {
      employeeId: String(f.get("employeeId") ?? ""),
      date: String(f.get("date") ?? ""),
      clockInTime: String(f.get("clockInTime") ?? ""),
      clockOutTime: String(f.get("clockOutTime") ?? ""),
      breakMinutes: String(f.get("breakMinutes") ?? ""),
      totalWorkedHours: String(f.get("totalWorkedHours") ?? ""),
      workTimeType: String(f.get("workTimeType") ?? "polni"),
      overtimeHours: String(f.get("overtimeHours") ?? ""),
      nightHours: String(f.get("nightHours") ?? ""),
      sundayHours: String(f.get("sundayHours") ?? ""),
      holidayHours: String(f.get("holidayHours") ?? ""),
      shiftSplitHours: String(f.get("shiftSplitHours") ?? ""),
      unevenlyDistributedHours: String(f.get("unevenlyDistributedHours") ?? ""),
      pensionBenefitHours: String(f.get("pensionBenefitHours") ?? ""),
      pensionBenefitStatus: String(f.get("pensionBenefitStatus") ?? ""),
      runningTotalHours: String(f.get("runningTotalHours") ?? ""),
      referencePeriod: String(f.get("referencePeriod") ?? ""),
      notes: String(f.get("notes") ?? ""),
    };

    const res =
      mode === "edit" && entryId
        ? await updateEntry(entryId, input)
        : await createManualEntry(input);

    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    router.push("/dashboard/ure");
    router.refresh();
  }

  async function handleDelete() {
    if (!entryId) return;
    if (!confirm("Res želiš izbrisati ta vnos?")) return;
    setDeleting(true);
    const res = await deleteEntry(entryId);
    if (res.error) {
      setError(res.error);
      setDeleting(false);
      return;
    }
    router.push("/dashboard/ure");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Zaposleni *</span>
        <select
          name="employeeId"
          required
          defaultValue={initial?.employeeId ?? ""}
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

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Datum *</span>
        <SloDateInput name="date" required defaultValue={initial?.date} />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Prihod (ura)" name="clockInTime" type="time" defaultValue={initial?.clockInTime} />
        <Field label="Odhod (ura)" name="clockOutTime" type="time" defaultValue={initial?.clockOutTime} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Opravljene ure"
          name="totalWorkedHours"
          type="number"
          step="0.25"
          defaultValue={initial?.totalWorkedHours}
          placeholder="8"
        />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Vrsta del. časa</span>
          <select
            name="workTimeType"
            defaultValue={initial?.workTimeType ?? "polni"}
            className="w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900 ring-1 ring-white/80 outline-none transition focus:ring-2 focus:ring-brand-500"
          >
            <option value="polni">Polni</option>
            <option value="krajsi">Krajši</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Nadure"
          name="overtimeHours"
          type="number"
          step="0.25"
          defaultValue={initial?.overtimeHours}
          placeholder="0"
        />
        <Field
          label="Odmor (min)"
          name="breakMinutes"
          type="number"
          step="5"
          defaultValue={initial?.breakMinutes}
          placeholder="30"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="text-sm font-medium text-slate-600 underline"
      >
        {showAdvanced ? "Skrij" : "Pokaži"} dodatne zakonske ure (18. člen)
      </button>

      {showAdvanced && (
        <div className="space-y-4 rounded-2xl bg-white/50 ring-1 ring-white/70 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nočne ure" name="nightHours" type="number" step="0.25" defaultValue={initial?.nightHours} placeholder="0" />
            <Field label="Nedeljske ure" name="sundayHours" type="number" step="0.25" defaultValue={initial?.sundayHours} placeholder="0" />
            <Field label="Praznične ure" name="holidayHours" type="number" step="0.25" defaultValue={initial?.holidayHours} placeholder="0" />
            <Field label="Izmensko / deljeno" name="shiftSplitHours" type="number" step="0.25" defaultValue={initial?.shiftSplitHours} placeholder="0" />
            <Field label="Neenakomerno prerazp." name="unevenlyDistributedHours" type="number" step="0.25" defaultValue={initial?.unevenlyDistributedHours} placeholder="0" />
            <Field label="Zavarov. doba +" name="pensionBenefitHours" type="number" step="0.25" defaultValue={initial?.pensionBenefitHours} placeholder="0" />
          </div>
          <Field label="Oznaka statusa (zavarov. doba)" name="pensionBenefitStatus" defaultValue={initial?.pensionBenefitStatus} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tekoči seštevek ur" name="runningTotalHours" type="number" step="0.25" defaultValue={initial?.runningTotalHours} />
            <Field label="Referenčno obdobje" name="referencePeriod" defaultValue={initial?.referencePeriod} placeholder="mesec" />
          </div>
        </div>
      )}

      <Field label="Opomba" name="notes" defaultValue={initial?.notes} placeholder="neobvezno" />

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-full bg-brand-600 py-3 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(29,78,216,0.6)] transition hover:bg-brand-500 disabled:opacity-50"
        >
          {loading ? "Shranjujem…" : mode === "edit" ? "Shrani spremembe" : "Shrani vnos"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl border border-red-300 px-4 py-3 text-base font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "…" : "Izbriši"}
          </button>
        )}
      </div>

      <Link
        href="/dashboard/ure"
        className="block text-center text-sm text-slate-500 hover:text-slate-900"
      >
        Prekliči
      </Link>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900 ring-1 ring-white/80 outline-none transition focus:ring-2 focus:ring-brand-500"
      />
    </label>
  );
}
