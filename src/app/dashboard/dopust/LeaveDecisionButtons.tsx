"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { approveLeaveRequest, rejectLeaveRequest } from "./actions";

// Delodajalec: potrdi (en klik) ali zavrni (z neobvezno opombo) prošnjo za dopust.
export function LeaveDecisionButtons({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    if (loading) return;
    setError(null);
    setLoading("approve");
    const res = await approveLeaveRequest(id);
    setLoading(null);
    if (res.error) return setError(res.error);
    router.refresh();
  }

  async function reject() {
    if (loading) return;
    setError(null);
    setLoading("reject");
    const res = await rejectLeaveRequest(id, note);
    setLoading(null);
    if (res.error) return setError(res.error);
    setRejecting(false);
    router.refresh();
  }

  if (rejecting) {
    return (
      <div className="flex flex-col items-stretch gap-2 sm:min-w-[240px]">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          autoFocus
          placeholder="Razlog (neobvezno)"
          className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setRejecting(false)}
            disabled={loading != null}
            className="flex-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200 disabled:opacity-50"
          >
            Nazaj
          </button>
          <button
            onClick={reject}
            disabled={loading != null}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
          >
            {loading === "reject" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            Zavrni
          </button>
        </div>
        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setRejecting(true)}
        disabled={loading != null}
        className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50"
      >
        <X className="h-3.5 w-3.5" /> Zavrni
      </button>
      <button
        onClick={approve}
        disabled={loading != null}
        className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.6)] transition hover:bg-emerald-500 disabled:opacity-60"
      >
        {loading === "approve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        Potrdi
      </button>
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
