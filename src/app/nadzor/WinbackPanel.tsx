"use client";

import { useState, useTransition } from "react";
import { Send, CalendarPlus, MailCheck } from "lucide-react";
import { Card } from "@/components/ui";
import { sendWinbackToCompany, extendTrial, type ActionResult } from "./actions";

export type WinbackCandidate = {
  id: string;
  name: string;
  email: string;
  expiredLabel: string;
  hasEntries: boolean;
};

const EXTEND_DAYS = 14;

// Podjetja s poteklim preizkusom: podaljšanje preizkusa in (če so aplikacijo
// dejansko uporabljala) ročno pošiljanje win-back maila. Obe dejanji imata
// dvostopenjsko potrditev, da se ne sprožita po pomoti.
export function WinbackPanel({ candidates }: { candidates: WinbackCandidate[] }) {
  if (candidates.length === 0) return null;
  return (
    <Card className="mt-6 p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <MailCheck className="h-4 w-4" /> Potekel preizkus
      </p>
      <ul className="mt-3 divide-y divide-slate-100">
        {candidates.map((c) => (
          <CandidateRow key={c.id} candidate={c} />
        ))}
      </ul>
    </Card>
  );
}

type Pending = "winback" | "extend";

function CandidateRow({ candidate }: { candidate: WinbackCandidate }) {
  const [pending, start] = useTransition();
  const [armed, setArmed] = useState<Pending | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);

  const run = (what: Pending) =>
    start(async () => {
      const r =
        what === "winback"
          ? await sendWinbackToCompany(candidate.id)
          : await extendTrial(candidate.id, EXTEND_DAYS);
      setResult(r);
      setArmed(null);
    });

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">{candidate.name}</p>
        <p className="truncate text-xs text-slate-500">
          {candidate.email} · preizkus potekel {candidate.expiredLabel}
          {candidate.hasEntries ? "" : " · brez vnosov"}
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
            onClick={() => run(armed)}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            <Send className="h-3.5 w-3.5" />
            {pending
              ? "Izvajam…"
              : armed === "winback"
                ? "Da, pošlji stranki"
                : `Da, podaljšaj za ${EXTEND_DAYS} dni`}
          </button>
          <button
            disabled={pending}
            onClick={() => setArmed(null)}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Prekliči
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setArmed("extend")}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-white/80 transition hover:bg-white"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Podaljšaj {EXTEND_DAYS} dni
          </button>
          {candidate.hasEntries && (
            <button
              onClick={() => setArmed("winback")}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-white/80 transition hover:bg-white"
            >
              <Send className="h-3.5 w-3.5" />
              Pošlji win-back
            </button>
          )}
        </div>
      )}
    </li>
  );
}
