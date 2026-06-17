// Branded HTML ovojnica za transakcijske maile (Delovit).
// Email odjemalci (Gmail, Outlook, Apple Mail) ne podpirajo backdrop-blur,
// flex-a ali zunanjega CSS-a — zato je vse na tabelah z inline stili.

// Kanonična baza (www) za slike in povezave v mailih.
export const EMAIL_BASE = "https://www.delovit.si";

const COLORS = {
  bg: "#eef1f8",
  card: "#ffffff",
  ink: "#0f172a",
  body: "#475569",
  muted: "#94a3b8",
  brand: "#1d4ed8",
  brand2: "#2f63ff",
  line: "#e7ebf3",
};

export type EmailButton = { label: string; href: string };

type LayoutOpts = {
  preview?: string; // skriti predogled v inboxu
  heading: string;
  intro?: string;
  bodyHtml: string; // že oblikovana vsebina (odstavki ipd.)
  button?: EmailButton;
  footnote?: string;
};

// Posamezen odstavek za telo maila.
export function p(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${COLORS.body};">${text}</p>`;
}

// Poudarjen "info box" (npr. povzetek naročnine / datum poteka).
export function infoBox(rows: Array<[string, string]>) {
  const cells = rows
    .map(
      ([k, v]) =>
        `<tr>
           <td style="padding:6px 0;font-size:14px;color:${COLORS.muted};">${k}</td>
           <td style="padding:6px 0;font-size:14px;color:${COLORS.ink};font-weight:600;text-align:right;">${v}</td>
         </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
            style="margin:4px 0 20px;background:#f6f8fc;border:1px solid ${COLORS.line};border-radius:14px;padding:8px 18px;">
            ${cells}
          </table>`;
}

export function renderEmail(o: LayoutOpts): string {
  const button = o.button
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
         <tr><td style="border-radius:999px;background:${COLORS.brand};">
           <a href="${o.button.href}"
              style="display:inline-block;padding:13px 30px;font-size:15px;font-weight:700;
                     color:#ffffff;text-decoration:none;border-radius:999px;
                     background:linear-gradient(135deg,${COLORS.brand2},${COLORS.brand});">
             ${o.button.label}
           </a>
         </td></tr>
       </table>`
    : "";

  const intro = o.intro
    ? `<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${COLORS.body};">${o.intro}</p>`
    : "";

  const footnote = o.footnote
    ? `<p style="margin:18px 0 0;font-size:13px;line-height:1.55;color:${COLORS.muted};">${o.footnote}</p>`
    : "";

  return `<!doctype html>
<html lang="sl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${o.heading}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};
             -webkit-font-smoothing:antialiased;
             font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${o.preview ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${o.preview}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Logo / glava -->
        <tr><td style="padding:4px 4px 22px;">
          <a href="${EMAIL_BASE}" style="text-decoration:none;display:inline-block;">
            <img src="${EMAIL_BASE}/email-logo.png" width="40" height="40" alt="Delovit"
                 style="vertical-align:middle;border-radius:10px;display:inline-block;">
            <span style="vertical-align:middle;margin-left:10px;font-size:20px;font-weight:800;
                         letter-spacing:-0.02em;color:${COLORS.ink};">Delovit</span>
          </a>
        </td></tr>

        <!-- Kartica -->
        <tr><td style="background:${COLORS.card};border:1px solid ${COLORS.line};border-radius:20px;
                       padding:36px 34px;box-shadow:0 10px 40px -18px rgba(29,78,216,0.25);">
          <div style="height:4px;width:46px;border-radius:999px;margin:0 0 22px;
                      background:linear-gradient(90deg,${COLORS.brand2},#7aa2ff);"></div>
          <h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;font-weight:800;
                     letter-spacing:-0.02em;color:${COLORS.ink};">${o.heading}</h1>
          ${intro}
          ${o.bodyHtml}
          ${button}
          ${footnote}
        </td></tr>

        <!-- Noga -->
        <tr><td style="padding:26px 6px 8px;">
          <p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:${COLORS.muted};">
            Storitev Delovit zagotavlja <strong style="color:${COLORS.body};">NextEra d.o.o.</strong>,
            Bantanova ulica 2, 2000 Maribor.
          </p>
          <p style="margin:0;font-size:12px;line-height:1.6;color:${COLORS.muted};">
            Vprašanja? Pišite nam na
            <a href="mailto:info@delovit.si" style="color:${COLORS.brand};text-decoration:none;">info@delovit.si</a>.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
