// =============================================================================
// Dnevne meje delovnega časa — opomniki in samodejna zapora (auto-stop).
// =============================================================================
// Pragovi so tu na enem mestu (ne razpršeni po kodi) in jih je mogoče spremeniti.
// Pravna podlaga (potrjeno z raziskavo, sklicuj se na člene, ne na "8h po zakonu"):
//   - Redno zaposleni: delovni dan največ 10 ur (144/3 ZDR-1).
//   - Polnoletni študent/dijak: enako 10 ur (211/7 → 144/3).
//   - Mladoletni (<18): največ 8 ur, brez nadur (146/2), brez nočnega dela (193).
//
// Dva PRAGA — namenoma ločena:
//   REMINDER = zakonska meja → OPOMNIK delavcu (samo obvestilo, nič se ne zapre).
//   AUTOSTOP = višji prag → sistem PREDLAGA odhod pri pozabljenem žigosanju.
//              Vnos se OZNAČI za pregled in je popravljiv. Ura se NIKOLI ne odreže tiho.
// AUTOSTOP je nad zakonsko mejo, da poštena dolga izmena (npr. neenakomerna
// razporeditev do 13 ur, 155/2) ni skrita — presežek se pokaže, ne odreže.

export type WorkerCategory = "minor" | "student" | "employee";

export const REMINDER_HOURS: Record<WorkerCategory, number> = {
  minor: 8,
  student: 10,
  employee: 10,
};

export const AUTOSTOP_HOURS: Record<WorkerCategory, number> = {
  minor: 10,
  student: 12,
  employee: 12,
};

// Absolutni strop za nastavitev auto-stopa (ne dovolimo višje).
export const ABSOLUTE_CEILING_HOURS = 13;

// Starost (v letih) ob danem trenutku iz datuma rojstva (YYYY-MM-DD). null = neznano.
export function ageOn(birthDate: string | null | undefined, at: Date): number | null {
  if (!birthDate) return null;
  const b = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(b.getTime())) return null;
  let age = at.getUTCFullYear() - b.getUTCFullYear();
  const m = at.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && at.getUTCDate() < b.getUTCDate())) age--;
  return age;
}

// Kategorija delavca za meje: mladoletnost (<18) prevlada nad vrsto dela.
export function workerCategory(
  workerType: string | null | undefined,
  birthDate: string | null | undefined,
  at: Date = new Date(),
): WorkerCategory {
  const age = ageOn(birthDate, at);
  if (age !== null && age < 18) return "minor";
  return workerType === "student" ? "student" : "employee";
}

export function reminderHoursFor(cat: WorkerCategory): number {
  return REMINDER_HOURS[cat];
}

export function autostopHoursFor(cat: WorkerCategory): number {
  return AUTOSTOP_HOURS[cat];
}

// Ali odprt vnos (brez odhoda) še šteje za izmeno v teku. Odločata čas od prihoda
// in prag samodejne zapore — NE datum vnosa: izmena čez polnoč (npr. 22:00–06:00)
// je ob 3h zjutraj še vedno v teku. Starejši odprt vnos je pozabljen odhod.
export function isShiftRunning(clockInIso: string | null, capHours: number, now: number = Date.now()): boolean {
  if (!clockInIso) return false;
  return now - new Date(clockInIso).getTime() < capHours * 3_600_000;
}

// Najdaljši prag samodejne zapore (za poizvedbe, kjer kategorija delavca ni znana).
export const MAX_AUTOSTOP_HOURS = Math.max(...Object.values(AUTOSTOP_HOURS));

// Odprti vnosi s prihodom po tem trenutku so lahko še izmena v teku ("na delu").
export function runningShiftCutoffIso(now: number = Date.now()): string {
  return new Date(now - MAX_AUTOSTOP_HOURS * 3_600_000).toISOString();
}

// Opomba, ki se zapiše ob samodejni omejitvi (za pregled).
export function autoCapNote(): string {
  return "Odhod ni bil zabeležen, zato je vnos označen za pregled. Vpišite dejanski čas odhoda.";
}
