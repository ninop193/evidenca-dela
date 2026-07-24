"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { approveEntry } from "./actions";

// "Potrdi" z enim klikom: počisti oznako "za pregled" (ure so pravilne).
export function ApproveButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function onClick() {
    if (loading) return;
    setError(false);
    setLoading(true);
    const res = await approveEntry(id);
    setLoading(false);
    if (res.error) {
      setError(true);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition disabled:opacity-60 " +
        (error
          ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
          : "bg-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.6)] hover:bg-emerald-500")
      }
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      {error ? "Poskusi znova" : "Potrdi"}
    </button>
  );
}
