import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  return (
    <div className="px-3 pt-3">
      <Link
        href="/narocnina"
        className="glass iris-edge sheen group mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full px-4 py-2 text-sm"
      >
        <span className="flex items-center gap-2 font-medium text-slate-700">
          <Sparkles className="h-4 w-4 text-brand-600" />
          Še <strong className="text-slate-900">{daysLeft}</strong>{" "}
          {daysLeft === 1 ? "dan" : daysLeft === 2 ? "dni" : "dni"} brezplačnega preizkusa
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-brand-700 group-hover:text-brand-800">
          Naroči se
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  );
}
