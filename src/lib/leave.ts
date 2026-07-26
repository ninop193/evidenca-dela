// Pomožne funkcije za dopust (letni dopust). Ljudem kažemo DNEVE, zakonski
// zapis (absences) pa ostaja v URAH — tu je pretvorba med njima.

// Dolžina enega dneva dopusta v urah: iz tedenskih ur (÷5), sicer poln čas 8h.
export function dayLengthHours(weeklyHours: number | null | undefined): number {
  const w = Number(weeklyHours);
  if (Number.isFinite(w) && w > 0) return Math.round((w / 5) * 100) / 100;
  return 8;
}

// Ure ↔ dnevi.
export function hoursToDays(hours: number, weeklyHours: number | null | undefined): number {
  const dl = dayLengthHours(weeklyHours);
  return dl > 0 ? hours / dl : 0;
}
export function daysToHours(days: number, weeklyHours: number | null | undefined): number {
  return Math.round(days * dayLengthHours(weeklyHours) * 100) / 100;
}

// Prikaz dni po slovensko: cela števila brez decimalk, pol dni z vejico (npr. "2,5").
export function fmtDays(n: number): string {
  const r = Math.round(n * 100) / 100;
  return (Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")).replace(
    ".",
    ",",
  );
}

// Meje tekočega (ali danega) leta za poizvedbe.
export function yearBounds(year: number): { start: string; end: string } {
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

// Slovenske oznake statusa prošnje.
export const LEAVE_STATUS_LABEL: Record<string, string> = {
  pending: "V obravnavi",
  approved: "Potrjeno",
  rejected: "Zavrnjeno",
  cancelled: "Preklicano",
};
