import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Delovit, evidenca delovnega časa za mikro podjetja";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Logo kot data URI (prebran z diska, da ne potrebuje omrežja).
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
            "linear-gradient(135deg, #eef3ff 0%, #fdf0fb 45%, #effbf6 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Glava: logo + ime + značka */}
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
            Skladno z ZEPDSV
          </div>
        </div>

        {/* Glavno sporočilo */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              color: "#0f172a",
            }}
          >
            Evidenca delovnega časa,
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              color: "#1d4ed8",
            }}
          >
            brez panike.
          </div>
          <div style={{ marginTop: 28, fontSize: 32, color: "#475569", fontWeight: 500 }}>
            Žigosanje z mobitelom · Izvoz za inšpekcijo · Fiksna cena na podjetje
          </div>
        </div>

        {/* Noga */}
        <div style={{ display: "flex", fontSize: 28, color: "#64748b", fontWeight: 600 }}>
          www.delovit.si
        </div>
      </div>
    ),
    size,
  );
}
