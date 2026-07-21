"use client";

import { Mail, ArrowRight } from "lucide-react";

const MAILTO =
  "mailto:info@delovit.si" +
  "?subject=" +
  encodeURIComponent("Zanima me partnerski program Delovit") +
  "&body=" +
  encodeURIComponent(
    "Pozdravljeni,\n\nzanima me partnerski program Delovit (50 % provizija).\n\nIme:\nČime se ukvarjam (računovodstvo, svetovanje, prodaja, drugo):\nTelefon:\nKako bi pripeljal/a stranke:\n\nLep pozdrav,",
  );

export function PartnerMailButton({
  variant = "primary",
  size = "lg",
  children,
}: {
  variant?: "primary" | "light";
  size?: "lg" | "sm";
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
    "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition";
  const sz = size === "sm" ? " px-4 py-2 text-sm" : " px-7 py-3.5 text-base";
  const tone =
    variant === "light"
      ? " bg-white text-brand-700 hover:bg-brand-50"
      : (size === "lg" ? " glow-pulse" : "") + " bg-brand-600 text-white hover:bg-brand-500";

  return (
    <a href={MAILTO} onClick={track} className={base + sz + tone}>
      <Mail className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {children}
      {size === "lg" && (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      )}
    </a>
  );
}
