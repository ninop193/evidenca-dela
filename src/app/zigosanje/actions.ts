"use server";

import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/billing";
import {
  workerCategory,
  autostopHoursFor,
  autoCapNote,
  ABSOLUTE_CEILING_HOURS,
} from "@/lib/workLimits";
import { combineLjubljana, shiftDays } from "@/lib/tzdate";

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

type ActionResult = { error?: string; capped?: boolean };

// Poišče zapis zaposlenega + preveri dostop (preizkus/naročnina) podjetja.
async function getEmployee() {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) return { supabase, profile: null, employee: null, hasAccess: false };
  const [{ data: employee }, { data: company }] = await Promise.all([
    supabase.from("employees").select("id, company_id, active, worker_type, birth_date").eq("user_id", profile.id).single(),
    supabase.from("companies").select("subscription_status, trial_ends_at, current_period_end").eq("id", profile.company_id).single(),
  ]);
  const hasAccess = getAccess(company ?? {}).hasAccess;
  return { supabase, profile, employee, hasAccess };
}

// PRIHOD — odpre nov vnos delovnega časa za danes.
export async function clockIn(): Promise<ActionResult> {
  const { supabase, employee, hasAccess } = await getEmployee();
  if (!hasAccess) return { error: "Naročnina podjetja je potekla." };
  if (!employee) return { error: "Ni najdenega zaposlenega." };
  if (!employee.active) return { error: "Vaš račun je deaktiviran. Obrnite se na delodajalca." };

  const today = todayLjubljana();

  // Poišči vse odprte vnose (brez odhoda).
  const { data: openEntries } = await supabase
    .from("time_entries")
    .select("id, date, clock_in")
    .eq("employee_id", employee.id)
    .is("clock_out", null);

  // Že odprt vnos za DANES → prepreči dvojni prihod.
  if ((openEntries ?? []).some((e) => e.date === today)) {
    return { error: "Prihod je že zabeležen." };
  }

  // Pozabljen odhod iz prejšnjega dne → predlagaj odhod ob dnevni meji (auto-stop)
  // in OZNAČI za pregled. Ure se ne odrežejo tiho; delodajalec/delavec popravi.
  const stale = (openEntries ?? []).filter((e) => e.date !== today);
  if (stale.length) {
    const capH = autostopHoursFor(workerCategory(employee.worker_type, employee.birth_date));
    for (const s of stale) {
      const start = new Date(s.clock_in as string);
      const capOut = new Date(start.getTime() + capH * 3_600_000);
      await supabase
        .from("time_entries")
        .update({
          clock_out: capOut.toISOString(),
          hours_count: capH,
          total_worked_hours: capH,
          needs_review: true,
          notes: autoCapNote(),
        })
        .eq("id", s.id);
    }
  }

  const { error } = await supabase.from("time_entries").insert({
    company_id: employee.company_id,
    employee_id: employee.id,
    date: today,
    clock_in: new Date().toISOString(),
  });
  if (error) return { error: "Napaka pri beleženju prihoda." };
  return {};
}

// ODHOD — zaključi odprt vnos in izračuna opravljene ure.
// breakMinutes: neobvezna zabeležka odmora (18. člen ZEPDSV). Odmor se po
// ZDR-1 všteva v delovni čas, zato UR NE odšteva — je samo evidenčni podatek.
export async function clockOut(breakMinutes?: number): Promise<ActionResult> {
  const { supabase, employee, hasAccess } = await getEmployee();
  if (!hasAccess) return { error: "Naročnina podjetja je potekla." };
  if (!employee) return { error: "Ni najdenega zaposlenega." };
  if (!employee.active) return { error: "Vaš račun je deaktiviran. Obrnite se na delodajalca." };

  const { data: open } = await supabase
    .from("time_entries")
    .select("id, clock_in")
    .eq("employee_id", employee.id)
    .is("clock_out", null)
    .order("clock_in", { ascending: false })
    .limit(1)
    .single();
  if (!open) return { error: "Ni odprtega prihoda." };

  const now = new Date();
  const start = new Date(open.clock_in as string);

  // Če razpon presega dnevno mejo (auto-stop), gre skoraj zagotovo za pozabljen
  // odhod (npr. klik naslednje jutro). Predlagamo odhod ob meji in OZNAČIMO za
  // pregled — ura se ne odreže tiho, delodajalec/delavec vpiše dejanski čas.
  const capH = autostopHoursFor(workerCategory(employee.worker_type, employee.birth_date));
  const rawMs = Math.max(0, now.getTime() - start.getTime());
  const overCap = rawMs > capH * 3_600_000;
  const clockOutAt = overCap ? new Date(start.getTime() + capH * 3_600_000) : now;
  const hours = overCap
    ? capH
    : Math.round((rawMs / 3_600_000) * 100) / 100;

  const brk = Number.isFinite(breakMinutes)
    ? Math.min(480, Math.max(0, Math.round(breakMinutes as number)))
    : 0;

  const { error } = await supabase
    .from("time_entries")
    .update({
      clock_out: clockOutAt.toISOString(),
      hours_count: hours,
      total_worked_hours: hours,
      sunday_hours: isSunday(start) ? hours : 0,
      break_minutes: brk,
      ...(overCap ? { needs_review: true, notes: autoCapNote() } : {}),
    })
    .eq("id", open.id);
  if (error) return { error: "Napaka pri beleženju odhoda." };
  return { capped: overCap };
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
  const clockOut = combineLjubljana(input.date, input.clockOutTime);
  if (!clockIn || !clockOut) return { error: "Vpiši uro prihoda in odhoda." };

  const start = new Date(clockIn);
  const end = new Date(clockOut);
  if (end.getTime() <= start.getTime()) {
    return { error: "Odhod mora biti kasneje od prihoda." };
  }
  const hours = Math.round(((end.getTime() - start.getTime()) / 3_600_000) * 100) / 100;
  if (hours > ABSOLUTE_CEILING_HOURS) {
    return { error: `Vnos je daljši od ${ABSOLUTE_CEILING_HOURS} ur. Tako dolg dan vnese delodajalec.` };
  }

  // Prekrivanje z obstoječimi vnosi istega dne (dvojni vnos = neveljavna evidenca).
  const { data: sameDay } = await supabase
    .from("time_entries")
    .select("id, clock_in, clock_out")
    .eq("employee_id", employee.id)
    .eq("date", input.date);
  for (const e of sameDay ?? []) {
    if (e.clock_out == null) {
      return { error: "Za ta dan imaš odprt vnos. Žigosaj odhod ali popravi obstoječi vnos." };
    }
    const eIn = new Date(e.clock_in as string).getTime();
    const eOut = new Date(e.clock_out as string).getTime();
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
    ? combineLjubljana(entry.date as string, input.clockOutTime)
    : (entry.clock_out as string | null);
  if (!clockIn) return { error: "Vpiši uro prihoda." };

  // Odhod lahko ostane prazen samo pri še odprtem današnjem vnosu (izmena v teku).
  const stillOpen = clockOut == null;
  if (stillOpen && entry.date !== today) {
    return { error: "Vpiši uro odhoda." };
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
    .eq("id", entry.id);
  if (error) return { error: "Napaka pri shranjevanju popravka." };
  return {};
}
