"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CalendarPlus, Loader2, Sun } from "lucide-react";
import { SloDateInput } from "@/components/SloDateInput";
import { workingDaysBetween } from "@/lib/holidays";
import { fmtDays } from "@/lib/leave";
import { submitLeaveRequest } from "./actions";

// Zaposleni napove dopust: izbere obdobje, vidi predlagano št. delovnih dni
// (izločeni vikendi in prazniki), po želji doda opombo delodajalcu.
export function LeaveRequestDialog({ remaining }: { remaining: number | null }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // Portal je na voljo šele po montaži (odjemalec) — prepreči SSR/hydration težave.
  useEffect(() => setMounted(true), []);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");

  const days = from && to ? workingDaysBetween(from, to) : 0;
  const tooMany = remaining != null && days > remaining + 1e-6;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    if (!from || !to) {
      setError("Izberi obdobje dopusta.");
      return;
    }
    setLoading(true);
    const res = await submitLeaveRequest({ dateFrom: from, dateTo: to, note });
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setOpen(false);
    setFrom("");
    setTo("");
    setNote("");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(29,78,216,0.6)] transition hover:bg-brand-500"
      >
        <CalendarPlus className="h-4 w-4" />
        Napovej dopust
      </button>

      {open && mounted && createPortal(
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
              <Sun className="h-5 w-5 text-brand-600" />
            </div>
            <h3 className="mt-4 text-center text-lg font-bold text-slate-900">Napovej dopust</h3>
            <p className="mt-1.5 text-center text-sm leading-relaxed text-slate-600">
              Prošnja gre delodajalcu v potrditev. Obvestili te bomo po e-pošti.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Od
                </label>
                <SloDateInput name="from" onChange={setFrom} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Do
                </label>
                <SloDateInput name="to" onChange={setTo} required />
              </div>
            </div>

            {/* Živ prikaz predlaganih delovnih dni */}
            {days > 0 && (
              <div
                className={
                  "mt-3 rounded-xl px-3.5 py-2.5 text-sm font-medium " +
                  (tooMany
                    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                    : "bg-brand-50 text-brand-700 ring-1 ring-brand-100")
                }
              >
                {fmtDays(days)} {days === 1 ? "delovni dan" : "delovnih dni"}
                <span className="font-normal text-slate-500"> (brez vikendov in praznikov)</span>
                {tooMany && remaining != null && (
                  <div className="mt-0.5 font-normal">
                    Na voljo je še {fmtDays(Math.max(0, remaining))} dni.
                  </div>
                )}
              </div>
            )}

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Opomba (neobvezno)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              placeholder="npr. družinski dopust"
              className="mt-1.5 w-full rounded-xl border-0 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                disabled={loading || tooMany}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Oddaj prošnjo
              </button>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </>
  );
}
