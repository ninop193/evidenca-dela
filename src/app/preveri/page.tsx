"use client";

import { useEffect, useState } from "react";

// Začasna diagnostična stran za težavo "odjavi me ob zaprtju zavihka".
// Javna (ni v protectedPrefixes) — vedno se naloži in pošteno pove stanje piškotka.
// Odstrani, ko je težava rešena.

type Info = {
  hasCookie: boolean;
  cookieBytes: number;
  chunks: number;
  standalone: boolean;
  storage: boolean;
  ua: string;
  cookieEnabled: boolean;
};

export default function PreveriPage() {
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    const all = document.cookie.split("; ").filter(Boolean);
    const auth = all.filter((c) => c.includes("auth-token"));
    const bytes = auth.reduce((n, c) => n + c.length, 0);
    let storage = false;
    try {
      localStorage.setItem("__t", "1");
      localStorage.removeItem("__t");
      storage = true;
    } catch {}
    const standalone =
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;

    setInfo({
      hasCookie: auth.length > 0,
      cookieBytes: bytes,
      chunks: auth.length,
      standalone,
      storage,
      ua: navigator.userAgent,
      cookieEnabled: navigator.cookieEnabled,
    });
  }, []);

  if (!info) return null;

  const ok = info.hasCookie;
  const device = /iPhone|iPad|iPod/i.test(info.ua)
    ? "iPhone/iPad"
    : /Android/i.test(info.ua)
      ? "Android"
      : /Macintosh/i.test(info.ua)
        ? "Mac"
        : /Windows/i.test(info.ua)
          ? "Windows"
          : "drugo";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "-apple-system, system-ui, sans-serif",
        padding: 24,
        background: "#f1f5f9",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 20px 60px -20px rgba(15,23,42,.35)",
        }}
      >
        <div style={{ fontSize: 56, textAlign: "center" }}>{ok ? "✅" : "❌"}</div>
        <h1 style={{ textAlign: "center", fontSize: 22, fontWeight: 800, margin: "8px 0 4px" }}>
          {ok ? "Prijava JE shranjena" : "Prijave NI"}
        </h1>
        <p style={{ textAlign: "center", color: "#64748b", fontSize: 14, margin: 0 }}>
          {ok
            ? "Piškotek prijave obstaja na tej napravi."
            : "Na tej napravi ni shranjenega piškotka prijave."}
        </p>

        <div
          style={{
            marginTop: 20,
            borderRadius: 14,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            padding: 16,
            fontSize: 13,
            color: "#334155",
            lineHeight: 1.7,
          }}
        >
          <Row k="Piškotek prijave" v={info.hasCookie ? `da (${info.cookieBytes} znakov, ${info.chunks} del.)` : "NE"} />
          <Row k="Piškotki dovoljeni" v={info.cookieEnabled ? "da" : "NE (blokirani!)"} />
          <Row k="Shramba (localStorage)" v={info.storage ? "da" : "NE"} />
          <Row k="Na domačem zaslonu (PWA)" v={info.standalone ? "DA (ikona)" : "ne (brskalnik)"} />
          <Row k="Naprava" v={device} />
        </div>

        <p style={{ marginTop: 18, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
          <strong>Kako testirati:</strong> prijavi se v Delovit, nato odpri to stran (piše naj{" "}
          <strong>✅</strong>). Zapri zavihek, znova odpri to stran. Če zdaj piše <strong>❌</strong>,
          se piškotek ob zaprtju izgubi. Naredi posnetek obeh in mi pošlji.
        </p>
      </div>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "#94a3b8" }}>{k}</span>
      <span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );
}
