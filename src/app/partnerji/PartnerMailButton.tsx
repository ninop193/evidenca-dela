"use client";

import { Mail, ArrowRight } from "lucide-react";

const MAILTO =
  "mailto:info@delovit.si" +
  "?subject=" +
  encodeURIComponent("Zanima me partnerski program Delovit") +
  "&body=" +
  encodeURIComponent(
    "Pozdravljeni,\n\nzanima me partnerski program Delovit za računovodje (50 % provizija).\n\nIme / računovodstvo:\nTelefon:\nŠtevilo strank, ki bi jim priporočil/a:\n\nLep pozdrav,",
  );

export function PartnerMailButton({
  variant = "primary",
  children,
}: {
  variant?: "primary" | "light";
  children: React.ReactNode;
}) {
  const track = () => {
    try {
      (window as unknown as { ym?: (id: number, a: string, g: string) => void }).ym?.(
        109970527,
        "reachGoal",
        "partner_kontakt",
      );
    } catch {}
  };

  const base =
    "group inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-base font-semibold transition";
  const cls =
    variant === "light"
      ? base + " bg-white text-brand-700 hover:bg-brand-50"
      : base + " glow-pulse bg-brand-600 text-white hover:bg-brand-500";

  return (
    <a href={MAILTO} onClick={track} className={cls}>
      <Mail className="h-4 w-4" />
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}
