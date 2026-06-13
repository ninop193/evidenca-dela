"use client";

import { useEffect } from "react";

// Registrira minimalni service worker (samo za "namestljivost" aplikacije — BREZ offline načina).
export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // tiho — registracija ni kritična
      });
    }
  }, []);
  return null;
}
