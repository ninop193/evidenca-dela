"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

// Zaposlenemu pokaže njegovo kodo za skupno napravo (le če jo podjetje uporablja).
// Privzeto skrita: stran za žigosanje je pogosto odprta pred sodelavci.
export function DevicePinCard({ pin }: { pin: string }) {
  const [shown, setShown] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setShown((v) => !v)}
      aria-label={shown ? "Skrij osebno kodo" : "Pokaži osebno kodo"}
      className="glass-strong iris-edge mt-3 flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left transition active:scale-[0.99]"
    >
      <span className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
          <KeyRound className="h-4 w-4" />
        </span>
        <span>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Osebna koda
          </span>
          <span className="mt-0.5 block font-mono text-lg font-bold tracking-[0.3em] text-slate-900">
            {shown ? pin : "••••"}
          </span>
          <span className="block text-xs text-slate-500">Za žigosanje na skupni napravi</span>
        </span>
      </span>
      <span className="flex items-center gap-1 text-sm font-semibold text-brand-600">
        {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {shown ? "Skrij" : "Pokaži"}
      </span>
    </button>
  );
}
