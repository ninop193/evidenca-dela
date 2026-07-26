// Slovenski dela prosti dnevi (državni prazniki in dela prosti dnevi) +
// štetje delovnih dni. Uporablja se za predlog števila dni dopusta.
//
// Fiksni datumi se ponavljajo vsako leto; velikonočni ponedeljek se premika
// (edini premični praznik, ki pade na delovni dan) — izračunamo iz velike noči.
// Binkošti so vedno v nedeljo, zato za štetje delovnih dni niso pomembni.

// Velika noč (nedelja) po Meeusovem/Butcherjevem algoritmu → "YYYY-MM-DD".
function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=marec, 4=april
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Vrne množico dela prostih dni (YYYY-MM-DD) za dano leto.
function holidaysForYear(year: number): Set<string> {
  const fixed = [
    "01-01", // novo leto
    "01-02", // novo leto
    "02-08", // Prešernov dan
    "04-27", // dan upora proti okupatorju
    "05-01", // praznik dela
    "05-02", // praznik dela
    "06-25", // dan državnosti
    "08-15", // Marijino vnebovzetje
    "10-31", // dan reformacije
    "11-01", // dan spomina na mrtve
    "12-25", // božič
    "12-26", // dan samostojnosti in enotnosti
  ];
  const set = new Set(fixed.map((md) => `${year}-${md}`));
  // Velikonočni ponedeljek (velika noč + 1 dan).
  const easter = new Date(`${easterSunday(year)}T00:00:00Z`);
  const monday = new Date(easter.getTime() + 86400000);
  set.add(monday.toISOString().slice(0, 10));
  return set;
}

const cache = new Map<number, Set<string>>();
function holidaySet(year: number): Set<string> {
  let s = cache.get(year);
  if (!s) {
    s = holidaysForYear(year);
    cache.set(year, s);
  }
  return s;
}

// Ali je dani datum (YYYY-MM-DD) slovenski dela prost dan (državni praznik).
export function isSloHoliday(dateStr: string): boolean {
  const year = Number(dateStr.slice(0, 4));
  return holidaySet(year).has(dateStr);
}

// Ali je dani datum delovni dan (ni vikend in ni praznik).
export function isWorkingDay(dateStr: string): boolean {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const dow = d.getUTCDay(); // 0=ned, 6=sob
  if (dow === 0 || dow === 6) return false;
  return !isSloHoliday(dateStr);
}

// Število delovnih dni v obdobju [from, to] (vključno), brez vikendov in praznikov.
export function workingDaysBetween(fromStr: string, toStr: string): number {
  if (!fromStr || !toStr || toStr < fromStr) return 0;
  let count = 0;
  const d = new Date(`${fromStr}T12:00:00Z`);
  const end = new Date(`${toStr}T12:00:00Z`);
  while (d.getTime() <= end.getTime()) {
    const iso = d.toISOString().slice(0, 10);
    if (isWorkingDay(iso)) count++;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return count;
}
