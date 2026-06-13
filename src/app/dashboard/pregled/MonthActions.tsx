"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmMonth, unconfirmMonth } from "./actions";

export default function MonthActions({
  employeeId,
  month,
  confirmed,
  hasEntries,
}: {
  employeeId: string;
  month: string;
  confirmed: boolean;
  hasEntries: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    if (confirmed) {
      await unconfirmMonth(employeeId, month);
    } else {
      await confirmMonth(employeeId, month);
    }
    setLoading(false);
    router.refresh();
  }

  if (!hasEntries) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={
        "rounded-lg px-3 py-1.5 text-sm font-semibold disabled:opacity-50 " +
        (confirmed
          ? "border border-slate-300 text-slate-600 hover:bg-slate-100"
          : "bg-green-600 text-white hover:bg-green-700")
      }
    >
      {loading ? "…" : confirmed ? "Prekliči potrditev" : "Potrdi mesec"}
    </button>
  );
}
