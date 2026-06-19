import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Evidenca delovnega časa za študente na napotnici";
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
              border: "1px solid rgba(217,119,6,0.25)",
              color: "#b45309",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            ZEPDSV-B
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#0f172a" }}>
            Vzeli ste poletnega študenta?
          </div>
          <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#1d4ed8" }}>
            Evidenco morate voditi vi.
          </div>
          <div style={{ marginTop: 26, fontSize: 31, color: "#475569", fontWeight: 500 }}>
            Tudi za napotnico jo vodi delodajalec, ne študentski servis.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 28, color: "#64748b", fontWeight: 600 }}>
          www.delovit.si/studenti
        </div>
      </div>
    ),
    size,
  );
}
