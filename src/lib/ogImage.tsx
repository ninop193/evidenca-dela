import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

function logoDataUri() {
  try {
    const buf = readFileSync(join(process.cwd(), "public/logo-mark.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return "";
  }
}

// Skupna predloga za OG slike nišnih strani (1200×630).
export function buildNicheOg(opts: { badge: string; line1: string; line2: string; sub: string; url: string }) {
  const logo = logoDataUri();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #eef3ff 0%, #fdf0fb 45%, #effbf6 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} width={64} height={64} alt="" />
            ) : null}
            <span style={{ fontSize: 40, fontWeight: 800, color: "#0f172a" }}>Delovit</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(29,78,216,0.2)",
              color: "#1d4ed8",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {opts.badge}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 70, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#0f172a" }}>
            {opts.line1}
          </div>
          <div style={{ fontSize: 70, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#1d4ed8" }}>
            {opts.line2}
          </div>
          <div style={{ marginTop: 26, fontSize: 31, color: "#475569", fontWeight: 500 }}>{opts.sub}</div>
        </div>

        <div style={{ display: "flex", fontSize: 28, color: "#64748b", fontWeight: 600 }}>{opts.url}</div>
      </div>
    ),
    OG_SIZE,
  );
}
