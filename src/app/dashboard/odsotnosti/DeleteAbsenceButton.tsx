"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAbsence } from "./actions";

export default function DeleteAbsenceButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Res želiš izbrisati to odsotnost?")) return;
    setLoading(true);
    await deleteAbsence(id);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-medium text-red-600 underline hover:text-red-700 disabled:opacity-50"
    >
      {loading ? "…" : "Izbriši"}
    </button>
  );
}
