"use server";

import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccess } from "@/lib/billing";
import { ABSOLUTE_CEILING_HOURS, autostopHoursFor, isShiftRunning, workerCategory } from "@/lib/workLimits";
import { combineLjubljana, combineShiftEnd, shiftDays } from "@/lib/tzdate";
import { clockInEmployee, clockOutEmployee } from "@/lib/clock";

const TZ = "Europe/Ljubljana";

// Današnji datum (YYYY-MM-DD) po slovenskem času.
function todayLjubljana(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

// Ali je dani trenutek nedelja po slovenskem času.
function isSunday(d: Date): boolean {
  return (
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(d) ===
    "Sun"
  );
}

type ActionResult = { error?: string; stale?: boolean; capped?: boolean };

// Poišče zapis zaposlenega + preveri dostop (preizkus/naročnina) podjetja.
// Identiteto preverimo z uporabnikovo sejo (RLS); zapisi pa gredo prek strežniškega
// odjemalca (supabase), ker zaposleni v bazo neposredno NE sme pisati — sicer bi
// lahko mimo aplikacije prepisal svoje ure. Vsak zapis zato VEDNO filtriramo po
// employee_id in confirmed = false.
async function getEmployee() {
  const userDb = await createClient();
  const profile = await getProfile();
  if (!profile) return { supabase: createAdminClient(), profile: null, employee: null, hasAccess: false };
  const [{ data: employee }, { data: company }] = await Promise.all([
    userDb.from("employees").select("id, company_id, active, worker_type, birth_date").eq("user_id", profile.id).single(),
    userDb.from("companies").select("subscription_status, trial_ends_at, current_period_end").eq("id", profile.company_id).single(),
  ]);
  const hasAccess = getAccess(company ?? {}).hasAccess;
  return { supabase: createAdminClient(), profile, employee, hasAccess };
}

// PRIHOD — odpre nov vnos delovnega časa za danes.
export async function clockIn(): Promise<ActionResult> {
  const { supabase, employee, hasAccess } = await getEmployee();
  if (!hasAccess) return { error: "Naročnina podjetja je potekla." };
  if (!employee) return { error: "Ni najdenega zaposlenega." };
  if (!employee.active) return { error: "Vaš račun je deaktiviran. Obrnite se na delodajalca." };

  const { error, stale } = await clockInEmployee(supabase, employee);
  return error ? { error, stale } : {};
}

// ODHOD — zaključi odprt vnos in izračuna opravljene ure (glej lib/clock.ts).
export async function clockOut(breakMinutes?: number): Promise<ActionResult> {
  const { supabase, employee, hasAccess } = await getEmployee();
  if (!hasAccess) return { error: "Naročnina podjetja je potekla." };
  if (!employee) return { error: "Ni najdenega zaposlenega." };
  if (!employee.active) return { error: "Vaš račun je deaktiviran. Obrnite se na delodajalca." };

  const { error, stale, capped } = await clockOutEmployee(supabase, employee, breakMinutes);
  return error ? { error, stale } : { capped };
}

// =============================================================================
// Ročni vnos zaposlenega (pozabljeno žigosanje) — "predlagaj, delodajalec potrdi".
// Vsak ročni poseg zaposlenega se OBVEZNO označi "za pregled" (needs_review),
// da delodajalec obdrži nadzor nad evidenco. Dovoljeno največ 7 dni nazaj.
// =============================================================================

const SELF_ENTRY_DAYS = 7;

export type SelfEntryInput = {
  date: string; // YYYY-MM-DD
  clockInTime?: string; // HH:MM
  clockOutTime?: string; // HH:MM
  breakMinutes?: number;
  note?: string;
};

// Opomba, ki delodajalcu pove, da je vnos ročno dodal/popravil zaposleni.
function selfNote(note?: string): string {
  const base = "Ročni vnos zaposlenega (pozabljeno žigosanje).";
  const extra = note?.trim();
  return extra ? `${base} Opomba: ${extra}` : base;
}

// Datum mora biti danes ali največ 7 dni nazaj (starejše popravke ureja delodajalec).
function dateInSelfWindow(dateStr: string, today: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  return dateStr <= today && dateStr >= shiftDays(today, -(SELF_ENTRY_DAYS - 1));
}

const clampBreak = (v?: number) =>
  Number.isFinite(v) ? Math.min(480, Math.max(0, Math.round(v as number))) : 0;

// Zaposleni doda manjkajoč vnos za pretekli dan (ali za danes, če je pozabil žigosati).
export async function selfCreateEntry(input: SelfEntryInput): Promise<ActionResult> {
  const { supabase, employee, hasAccess } = await getEmployee();
  if (!hasAccess) return { error: "Naročnina podjetja je potekla." };
  if (!employee) return { error: "Ni najdenega zaposlenega." };
  if (!employee.active) return { error: "Vaš račun je deaktiviran. Obrnite se na delodajalca." };

  const today = todayLjubljana();
  if (!dateInSelfWindow(input.date, today)) {
    return { error: `Sam lahko vneseš največ ${SELF_ENTRY_DAYS} dni nazaj. Za starejše se obrni na delodajalca.` };
  }

  const clockIn = combineLjubljana(input.date, input.clockInTime);
  // Odhod pred prihodom = naslednji dan (izmena čez polnoč, npr. 22:00–06:00).
  const clockOut = combineShiftEnd(input.date, clockIn, input.clockOutTime);
  if (!clockIn || !clockOut) return { error: "Vpiši uro prihoda in odhoda." };

  const start = new Date(clockIn);
  const end = new Date(clockOut);
  if (end.getTime() <= start.getTime()) {
    return { error: "Odhod mora biti kasneje od prihoda." };
  }
  if (end.getTime() > Date.now()) {
    return { error: "Odhod ne more biti v prihodnosti. Ko končaš, žigosaj odhod." };
  }
  const hours = Math.round(((end.getTime() - start.getTime()) / 3_600_000) * 100) / 100;
  if (hours > ABSOLUTE_CEILING_HOURS) {
    return { error: `Vnos je daljši od ${ABSOLUTE_CEILING_HOURS} ur. Tako dolg dan vnese delodajalec.` };
  }

  // Prekrivanje z obstoječimi vnosi (dvojni vnos = neveljavna evidenca). Gledamo
  // tudi sosednja dneva, ker izmena čez polnoč sega v naslednji dan.
  const { data: nearby } = await supabase
    .from("time_entries")
    .select("id, date, clock_in, clock_out")
    .eq("employee_id", employee.id)
    .gte("date", shiftDays(input.date, -1))
    .lte("date", shiftDays(input.date, 1));
  for (const e of nearby ?? []) {
    if (e.clock_out == null && e.date === input.date) {
      return { error: "Za ta dan imaš odprt vnos. Žigosaj odhod ali popravi obstoječi vnos." };
    }
    if (!e.clock_in) continue;
    const eIn = new Date(e.clock_in as string).getTime();
    const eOut = e.clock_out ? new Date(e.clock_out as string).getTime() : Date.now();
    if (start.getTime() < eOut && end.getTime() > eIn) {
      return { error: "Vnos se prekriva z že zabeleženim vnosom za ta dan." };
    }
  }

  const { error } = await supabase.from("time_entries").insert({
    company_id: employee.company_id,
    employee_id: employee.id,
    date: input.date,
    clock_in: clockIn,
    clock_out: clockOut,
    hours_count: hours,
    total_worked_hours: hours,
    sunday_hours: isSunday(start) ? hours : 0,
    break_minutes: clampBreak(input.breakMinutes),
    needs_review: true,
    notes: selfNote(input.note),
  });
  if (error) return { error: "Napaka pri shranjevanju vnosa." };
  return {};
}

// Zaposleni popravi svoj pomanjkljiv vnos: odprt vnos (pozabljen odhod) ali
// samodejno zaprt vnos "za pregled". Potrjenih (zaključenih) vnosov ne more.
export async function selfFixEntry(
  entryId: string,
  input: Omit<SelfEntryInput, "date">,
): Promise<ActionResult> {
  const { supabase, employee, hasAccess } = await getEmployee();
  if (!hasAccess) return { error: "Naročnina podjetja je potekla." };
  if (!employee) return { error: "Ni najdenega zaposlenega." };
  if (!employee.active) return { error: "Vaš račun je deaktiviran. Obrnite se na delodajalca." };

  const { data: entry } = await supabase
    .from("time_entries")
    .select("id, date, clock_in, clock_out, needs_review, confirmed, break_minutes")
    .eq("id", entryId)
    .eq("employee_id", employee.id)
    .maybeSingle();
  if (!entry) return { error: "Vnos ni najden." };

  const today = todayLjubljana();
  if (entry.confirmed) return { error: "Vnos je že potrjen. Popravke uredi delodajalec." };
  if (entry.clock_out != null && !entry.needs_review) {
    return { error: "Ta vnos je zaključen. Popravke uredi delodajalec." };
  }
  if (!dateInSelfWindow(entry.date as string, today)) {
    return { error: `Sam lahko popraviš največ ${SELF_ENTRY_DAYS} dni nazaj. Za starejše se obrni na delodajalca.` };
  }

  const clockIn = input.clockInTime
    ? combineLjubljana(entry.date as string, input.clockInTime)
    : (entry.clock_in as string | null);
  const clockOut = input.clockOutTime
    ? combineShiftEnd(entry.date as string, clockIn, input.clockOutTime)
    : (entry.clock_out as string | null);
  if (!clockIn) return { error: "Vpiši uro prihoda." };

  // Odhod lahko ostane prazen samo pri izmeni, ki je še v teku (tudi čez polnoč).
  const stillOpen = clockOut == null;
  const capH = autostopHoursFor(workerCategory(employee.worker_type, employee.birth_date));
  if (stillOpen && !isShiftRunning(clockIn, capH)) {
    return { error: "Vpiši uro odhoda." };
  }
  if (clockOut && new Date(clockOut).getTime() > Date.now()) {
    return { error: "Odhod ne more biti v prihodnosti. Ko končaš, žigosaj odhod." };
  }

  let hours: number | null = null;
  const start = new Date(clockIn);
  if (!stillOpen) {
    const end = new Date(clockOut as string);
    if (end.getTime() <= start.getTime()) {
      return { error: "Odhod mora biti kasneje od prihoda." };
    }
    hours = Math.round(((end.getTime() - start.getTime()) / 3_600_000) * 100) / 100;
    if (hours > ABSOLUTE_CEILING_HOURS) {
      return { error: `Vnos je daljši od ${ABSOLUTE_CEILING_HOURS} ur. Tako dolg dan vnese delodajalec.` };
    }
  }

  const { error } = await supabase
    .from("time_entries")
    .update({
      clock_in: clockIn,
      clock_out: clockOut,
      hours_count: hours,
      total_worked_hours: hours,
      sunday_hours: !stillOpen && isSunday(start) ? hours : 0,
      break_minutes:
        input.breakMinutes != null ? clampBreak(input.breakMinutes) : (entry.break_minutes ?? 0),
      needs_review: true,
      notes: selfNote(input.note),
    })
    .eq("id", entry.id)
    .eq("employee_id", employee.id)
    .eq("confirmed", false);
  if (error) return { error: "Napaka pri shranjevanju popravka." };
  return {};
}
