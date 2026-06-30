"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_22px_-8px_rgba(29,78,216,0.7)] transition hover:bg-brand-500"
    >
      <Printer className="h-4 w-4" /> Natisni / Shrani kot PDF
    </button>
  );
}
