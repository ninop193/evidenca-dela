"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { sendTestWinback } from "./actions";

// Gumb za varen test win-back maila: pošlje ga samo na lasten (superadmin) naslov.
export function TestWinbackButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await sendTestWinback();
            setMsg({ ok: r.ok, text: r.message });
          })
        }
        className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-white/80 transition hover:bg-white disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {pending ? "Pošiljam…" : "Testni win-back mail"}
      </button>
      {msg && (
        <p className={"text-xs " + (msg.ok ? "text-emerald-600" : "text-red-600")}>{msg.text}</p>
      )}
    </div>
  );
}
