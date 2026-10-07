// Vir obiska (UTM iz oglasa) — zapomni si ga ob prvem obisku v seji in ga ob
// registraciji shrani k računu (user_metadata.attribution). Tako vemo, kateri oglas
// je pripeljal registracijo, ne glede na piškotke za Meta Pixel.
// sessionStorage: ostane v tem zavihku (tudi čez Google prijavo), izgine ob zaprtju.
const KEY = "delovit_src";
const PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
] as const;

export type Attribution = Partial<Record<(typeof PARAMS)[number], string>> & {
  landing?: string;
  at?: string;
};

// Kliče se ob vsakem nalaganju strani; shrani le prvi obisk z UTM v seji.
export function captureAttribution() {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const sp = new URLSearchParams(window.location.search);
    const found: Attribution = {};
    for (const p of PARAMS) {
      const v = sp.get(p)?.trim();
      if (v) found[p] = v.slice(0, 200);
    }
    if (Object.keys(found).length === 0) return;
    found.landing = window.location.pathname.slice(0, 200);
    found.at = new Date().toISOString();
    sessionStorage.setItem(KEY, JSON.stringify(found));
  } catch {
    // sessionStorage ni na voljo — vir pač ne bo zabeležen.
  }
}

export function readAttribution(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}
