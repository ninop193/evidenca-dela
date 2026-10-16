"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Drži prikazano stanje usklajeno z bazo, ko se spremeni drugje (npr. prihod,
// žigosan na skupni napravi, medtem ko je bila aplikacija na telefonu v ozadju).
// Osveži ob vrnitvi na zaslon (telefon aplikacije v ozadju ne naloži znova) in
// periodično, dokler je stran vidna. Skrita stran ne osvežuje (baterija, promet).
export function LiveRefresh({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    // Ob vrnitvi se sproži več dogodkov hkrati (focus + visibilitychange) → ena osvežitev.
    // NE ob samem odprtju strani (podatki so sveži): brskalnik takrat sproži focus/pageshow,
    // dodatna osvežitev pa bi stran naložila dvakrat, v Safariju pa ob takojšnjem odhodu
    // na drugo stran celo skočila nazaj.
    let last = Date.now();
    const refresh = () => {
      if (document.visibilityState !== "visible" || Date.now() - last < 5000) return;
      last = Date.now();
      router.refresh();
    };
    // Vrnitev iz predpomnilnika brskalnika (Safari) — ne ob navadnem nalaganju strani.
    const onPageShow = (e: PageTransitionEvent) => e.persisted && refresh();
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", onPageShow);
    const t = setInterval(refresh, intervalMs);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", onPageShow);
      clearInterval(t);
    };
  }, [router, intervalMs]);
  return null;
}
