"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

// Meta Pixel (Facebook/Instagram oglasi) — naloži se SAMO po privolitvi v pasici.
// Kot Yandex.Metrika je le na javnih straneh (+ /register); v prijavljeni
// aplikaciji se sproži samo posamezen konverzijski dogodek (MetaPixelEvent).
// autoConfig je izklopljen, da pixel ne bere obrazcev in klikov sam od sebe.
// Brez NEXT_PUBLIC_META_PIXEL_ID se ne prikaže nič (niti pasica).
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

const CONSENT_COOKIE = "delovit_consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // 6 mesecev

type Consent = "granted" | "denied" | null;
type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

// --- Privolitev (piškotek, deljen med vsemi komponentami na strani) ---

const listeners = new Set<() => void>();

function readConsent(): Consent {
  const m = document.cookie.match(/(?:^|;\s*)delovit_consent=(granted|denied)/);
  return m ? (m[1] as Consent) : null;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function setConsent(value: Consent) {
  document.cookie = value
    ? `${CONSENT_COOKIE}=${value}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax`
    : `${CONSENT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
  if (value !== "granted") revokePixel();
  listeners.forEach((cb) => cb());
}

// "unknown" na strežniku in pred hidracijo → pasica se ne pokaže prezgodaj.
function useConsent(): Consent | "unknown" {
  return useSyncExternalStore(subscribe, readConsent, () => "unknown");
}

// --- Pixel ---

function loadPixel() {
  if (window.fbq) {
    window.fbq("consent", "grant");
    return;
  }
  // Uradna Meta osnovna koda, prepisana v TS.
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;

  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);

  fbq("set", "autoConfig", false, PIXEL_ID);
  fbq("init", PIXEL_ID);
}

function revokePixel() {
  window.fbq?.("consent", "revoke");
  // Pobriši Metin piškotek (_fbp) na tej domeni in na korenski domeni.
  const root = location.hostname.split(".").slice(-2).join(".");
  for (const domain of ["", `; Domain=.${root}`]) {
    document.cookie = `_fbp=; Max-Age=0; Path=/${domain}`;
  }
}

// --- Komponente ---

// Na javnih straneh: pasica za privolitev + PageView po privolitvi.
export function MetaPixel() {
  const consent = useConsent();

  useEffect(() => {
    if (!PIXEL_ID || consent !== "granted") return;
    loadPixel();
    window.fbq?.("track", "PageView");
  }, [consent]);

  if (!PIXEL_ID || consent !== null) return null;

  // Večja, osrednja pasica spodaj (opazna, a ne blokira strani). Gumba sta
  // enako velika — GDPR zahteva, da je zavrnitev enako lahka kot sprejem.
  return (
    <div
      role="dialog"
      aria-labelledby="cookie-title"
      className="reveal fixed inset-x-3 bottom-3 z-50 sm:inset-x-0 sm:bottom-6 sm:mx-auto sm:max-w-xl"
    >
      <div className="glass-strong iris-edge rounded-3xl !bg-white/90 p-5 text-slate-700 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-holo-violet text-white shadow-md">
            <Cookie className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 id="cookie-title" className="text-base font-bold text-slate-900 sm:text-lg">
              Nam dovolite piškotke?
            </h2>
            <p className="mt-1 text-sm leading-relaxed sm:text-[15px]">
              Z oglaševalskimi piškotki (Meta) vidimo, kateri oglasi vas pripeljejo do nas, zato
              lahko Delovit ostane cenovno ugoden. Nujni piškotki za delovanje strani so vedno
              vklopljeni.{" "}
              <Link href="/pravno/zasebnost" className="font-semibold text-brand-700 hover:text-brand-800">
                Več o piškotkih
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => setConsent("denied")}
            className="rounded-full bg-white/80 py-3 text-[15px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-white"
          >
            Zavrni
          </button>
          <button
            onClick={() => setConsent("granted")}
            className="rounded-full bg-brand-600 py-3 text-[15px] font-semibold text-white shadow-[var(--shadow-lift)] transition hover:bg-brand-500"
          >
            Sprejmi
          </button>
        </div>
      </div>
    </div>
  );
}

// Konverzijski dogodek (npr. registracija, naročnina) — sproži se enkrat na eventId,
// samo če je obiskovalec prej dal privolitev.
const fired = new Set<string>();

export function MetaPixelEvent({
  event,
  eventId,
  params,
}: {
  event: string;
  eventId: string;
  params?: Record<string, string | number>;
}) {
  const consent = useConsent();

  useEffect(() => {
    if (!PIXEL_ID || consent !== "granted") return;
    const key = `delovit_px_${event}_${eventId}`;
    if (fired.has(key)) return;
    fired.add(key);
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      // localStorage ni na voljo — zanesemo se na `fired`.
    }
    loadPixel();
    window.fbq?.("track", event, params ?? {}, { eventID: eventId });
  }, [consent, event, eventId, params]);

  return null;
}

// Povezava v nogi: ponovno odpre pasico (preklic ali sprememba privolitve).
export function CookieSettingsButton({ className }: { className?: string }) {
  if (!PIXEL_ID) return null;
  return (
    <button onClick={() => setConsent(null)} className={className}>
      Nastavitve piškotkov
    </button>
  );
}
