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
    let last = 0;
    const refresh = () => {
      if (document.visibilityState !== "visible" || Date.now() - last < 2000) return;
      last = Date.now();
      router.refresh();
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh); // vrnitev iz predpomnilnika brskalnika (Safari)
    const t = setInterval(refresh, intervalMs);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      clearInterval(t);
    };
  }, [router, intervalMs]);
  return null;
}
