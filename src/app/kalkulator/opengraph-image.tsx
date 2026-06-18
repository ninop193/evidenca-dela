import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PLACA_CONFIG } from "@/lib/placa";

export const runtime = "nodejs";
export const alt = "Bruto-neto kalkulator plače";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function logoDataUri() {
  try {
    const buf = readFileSync(join(process.cwd(), "public/logo-mark.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return "";
  }
}

export default function OgImage() {
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
          background:
            "linear-gradient(135deg, #eff6ff 0%, #f0fbf6 55%, #fef2fb 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} width={64} height={64} alt="" />
          ) : null}
          <span style={{ fontSize: 40, fontWeight: 800, color: "#0f172a" }}>Delovit</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(16,185,129,0.25)",
              color: "#059669",
              fontSize: 24,
              fontWeight: 700,
              alignSelf: "flex-start",
              marginBottom: 24,
            }}
          >
            Brezplačno · brez prijave
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              color: "#0f172a",
            }}
          >
            Bruto-neto kalkulator
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              color: "#1d4ed8",
            }}
          >
            {`plače ${PLACA_CONFIG.leto}`}
          </div>
          <div style={{ marginTop: 26, fontSize: 32, color: "#475569", fontWeight: 500 }}>
            Izračun neto plače, prispevkov in stroška delodajalca
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 28, color: "#64748b", fontWeight: 600 }}>
          www.delovit.si/kalkulator
        </div>
      </div>
    ),
    size,
  );
}
