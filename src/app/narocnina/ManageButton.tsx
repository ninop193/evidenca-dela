"use client";

import { useState } from "react";
import { createPortal } from "./actions";

export function ManageButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setError(null);
    setLoading(true);
    const res = await createPortal();
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.url) window.location.href = res.url;
  }

  return (
    <div>
      <button
        onClick={open}
        disabled={loading}
        className="rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
      >
        {loading ? "Odpiram…" : "Upravljaj naročnino"}
      </button>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
