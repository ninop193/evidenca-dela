// Datumski pomočniki za slovensko časovno cono (Europe/Ljubljana).
// Vsi delajo z datumskimi nizi (YYYY-MM-DD), da se izognemo TZ pastem.

const TZ = "Europe/Ljubljana";

// Današnji datum (YYYY-MM-DD) po slovenskem času.
export function todayLjubljana(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

// Ponedeljek tedna, v katerem je dani datum (YYYY-MM-DD).
export function weekStart(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7; // pon=0 … ned=6
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}

// Zadnji dan meseca (YYYY-MM → YYYY-MM-DD).
export function monthEnd(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${month}-${String(last).padStart(2, "0")}`;
}

// Sosednji mesec (YYYY-MM ± 1).
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

// "julij 2026" iz YYYY-MM.
export function monthLabel(month: string): string {
  return new Intl.DateTimeFormat("sl-SI", {
    timeZone: TZ,
    month: "long",
    year: "numeric",
  }).format(new Date(`${month}-01T12:00:00Z`));
}

// "pon., 7. 7." iz YYYY-MM-DD.
export function dayLabel(dateStr: string): string {
  return new Intl.DateTimeFormat("sl-SI", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "numeric",
  }).format(new Date(`${dateStr}T12:00:00Z`));
}

// "07:32" iz ISO časovnega žiga.
export function timeLabel(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("sl-SI", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
