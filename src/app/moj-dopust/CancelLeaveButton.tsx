"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cancelLeaveRequest } from "./actions";

// Zaposleni prekliče svojo še-čakajočo prošnjo za dopust.
export function CancelLeaveButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (loading) return;
    setLoading(true);
    await cancelLeaveRequest(id);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-white/80 transition hover:bg-white hover:text-rose-600 disabled:opacity-50"
    >
      {loading && <Loader2 className="h-3 w-3 animate-spin" />}
      Prekliči
    </button>
  );
}
