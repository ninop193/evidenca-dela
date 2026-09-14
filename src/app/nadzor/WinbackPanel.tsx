"use client";

import { useState, useTransition } from "react";
import { Send, MailCheck } from "lucide-react";
import { Card } from "@/components/ui";
import { sendWinbackToCompany, type ActionResult } from "./actions";

export type WinbackCandidate = {
  id: string;
  name: string;
  email: string;
  expiredLabel: string;
};

// Ročno pošiljanje win-back maila posameznemu podjetju, ki mu je preizkus
// potekel in je Delovit dejansko uporabljalo. Dvostopenjska potrditev, da
// se mail ne pošlje po pomoti.
export function WinbackPanel({ candidates }: { candidates: WinbackCandidate[] }) {
  if (candidates.length === 0) return null;
  return (
    <Card className="mt-6 p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <MailCheck className="h-4 w-4" /> Win-back: potekel preizkus, z vnosi ur
      </p>
      <ul className="mt-3 divide-y divide-slate-100">
        {candidates.map((c) => (
          <CandidateRow key={c.id} candidate={c} />
        ))}
      </ul>
    </Card>
  );
}

function CandidateRow({ candidate }: { candidate: WinbackCandidate }) {
  const [pending, start] = useTransition();
  const [armed, setArmed] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  const send = () =>
    start(async () => {
      const r = await sendWinbackToCompany(candidate.id);
      setResult(r);
      setArmed(false);
    });

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">{candidate.name}</p>
        <p className="truncate text-xs text-slate-500">
          {candidate.email} · preizkus potekel {candidate.expiredLabel}
        </p>
      </div>

      {result ? (
        <p className={"text-xs " + (result.ok ? "text-emerald-600" : "text-red-600")}>
          {result.message}
        </p>
      ) : armed ? (
        <div className="flex items-center gap-2">
          <button
            disabled={pending}
            onClick={send}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            <Send className="h-3.5 w-3.5" />
            {pending ? "Pošiljam…" : "Da, pošlji stranki"}
          </button>
          <button
            disabled={pending}
            onClick={() => setArmed(false)}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Prekliči
          </button>
        </div>
      ) : (
        <button
          onClick={() => setArmed(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-white/80 transition hover:bg-white"
        >
          <Send className="h-3.5 w-3.5" />
          Pošlji win-back
        </button>
      )}
    </li>
  );
}
