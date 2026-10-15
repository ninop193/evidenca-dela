"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Check, ChevronRight, HelpCircle, Play, TabletSmartphone, X } from "lucide-react";
import { buttonClasses, cn } from "@/components/ui";

// Ploščica "Skupna naprava" med hitrimi dejanji + gumb "?", ki odpre razlago.
// Cela ploščica je povezava na nastavitve; "?" leži nad njo (z-10) in odpre okno.
export function SharedDeviceTile({ className }: { className: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(className, "relative")}>
      <Link
        href="/dashboard/naprava"
        className="absolute inset-0 rounded-2xl"
        aria-label="Skupna naprava: nastavitve"
      />
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_8px_22px_-6px_rgba(29,78,216,0.6)]">
        <TabletSmartphone className="h-5 w-5" />
      </div>
      <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-brand-700">Skupna naprava</h3>
      <p className="mt-0.5 text-sm text-slate-500">Vsi žigosajo na eni napravi</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/70 text-slate-500 ring-1 ring-slate-200/80 transition hover:bg-white hover:text-brand-700"
        aria-label="Kaj je skupna naprava?"
        title="Kaj je skupna naprava?"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
      {open && createPortal(<SharedDeviceInfo onClose={() => setOpen(false)} />, document.body)}
    </div>
  );
}

function SharedDeviceInfo({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Namen okna: delodajalec v nekaj sekundah ve, ali to rabi ali ne.
  const fits = [
    "zaposleni med delom nimajo telefona pri sebi (lokal, salon, trgovina, delavnica),",
    "kdo nima pametnega telefona ali aplikacije noče imeti na svojem.",
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shared-device-title"
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/70 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
            aria-label="Zapri"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 id="shared-device-title" className="pr-8 text-xl font-bold tracking-tight text-slate-900">
            Kaj je skupna naprava?
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Ena tablica ali telefon na delovnem mestu, na katerem žigosajo vsi: zaposleni pritisne svoje ime in vpiše
            osebno kodo (4 številke).
          </p>

          <Preview />

          <div className="mt-6 rounded-2xl bg-emerald-50/70 p-4 ring-1 ring-emerald-100">
            <p className="text-sm font-semibold text-emerald-900">Pride prav, če:</p>
            <ul className="mt-2 space-y-1.5">
              {fits.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-emerald-900/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
            <p className="text-sm font-semibold text-slate-900">Ne potrebuješ je, če vsak žigosa na svojem telefonu.</p>
            <p className="mt-1 text-sm text-slate-600">To deluje že zdaj, nastaviti ti ni treba ničesar.</p>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Neobvezna je in privzeto izklopljena. Če jo vklopiš, žigosanje s telefonom deluje naprej, napravo pa lahko
            kadarkoli odklopiš.
          </p>

          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button onClick={onClose} className={buttonClasses("ghost")}>
              Zapri
            </button>
            <Link href="/dashboard/naprava" className={buttonClasses("primary")}>
              Nastavi skupno napravo <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini predogled treh korakov na skupni napravi: ime → koda → potrdilo.
function Preview() {
  return (
    <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3" aria-hidden>
      <Screen step="1" label="Ime">
        <p className="text-[9px] font-bold text-slate-900">Kdo žigosa?</p>
        {["AN", "MH"].map((i, n) => (
          <span
            key={i}
            className={cn(
              "flex w-full items-center gap-1 rounded-md bg-white px-1 py-1 ring-1 ring-slate-200/70",
              n === 0 && "ring-2 ring-brand-500",
            )}
          >
            <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-brand-600 text-[6px] font-bold text-white">
              {i}
            </span>
            <span className="h-1 flex-1 rounded-full bg-slate-200" />
          </span>
        ))}
      </Screen>
      <Screen step="2" label="Osebna koda">
        <span className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cn("h-1.5 w-1.5 rounded-full", i < 3 ? "bg-brand-600" : "bg-slate-300")} />
          ))}
        </span>
        <span className="grid grid-cols-3 gap-0.5">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="h-2.5 w-3.5 rounded-sm bg-white ring-1 ring-slate-200/80" />
          ))}
        </span>
      </Screen>
      <Screen step="3" label="Prihod">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_6px_14px_-6px_rgba(29,78,216,0.8)]">
          <Play className="ml-0.5 h-3.5 w-3.5 fill-white" strokeWidth={0} />
        </span>
        <span className="flex items-center gap-0.5 text-[8px] font-semibold text-emerald-700">
          <Check className="h-2.5 w-2.5" strokeWidth={3} /> 7:58
        </span>
      </Screen>
    </div>
  );
}

function Screen({ step, label, children }: { step: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-[#eef0ff] via-[#fdeaf7] to-[#eafff6] p-2 ring-[3px] ring-slate-800/85">
        {children}
      </div>
      <p className="mt-2 text-xs font-medium text-slate-500">
        <span className="text-slate-400">{step}.</span> {label}
      </p>
    </div>
  );
}
