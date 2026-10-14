import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";
import {
  workerCategory,
  autostopHoursFor,
  autoCapNote,
} from "@/lib/workLimits";
import { todayLjubljana } from "@/lib/tzdate";

// Skupna logika žigosanja (telefon zaposlenega + skupna naprava).
// NI "use server" datoteka: funkcij brskalnik ne more klicati neposredno —
// klicatelj mora prej sam preveriti, KDO žigosa (prijava ali PIN na napravi).

const TZ = "Europe/Ljubljana";

// Ali je dani trenutek nedelja po slovenskem času.
function isSunday(d: Date): boolean {
  return (
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(d) ===
    "Sun"
  );
}

type Db = ReturnType<typeof createAdminClient>;

export type ClockEmployee = {
  id: string;
  company_id: string;
  worker_type: string | null;
  birth_date: string | null;
};

// stale: prikazano stanje je bilo zastarelo (žig je bil medtem narejen drugje,
// npr. na skupni napravi) → klicatelj osveži prikaz.
export type ClockResult = { error?: string; stale?: boolean; capped?: boolean; at?: string; hours?: number };

// PRIHOD — odpre nov vnos delovnega časa za danes.
export async function clockInEmployee(
  supabase: Db,
  employee: ClockEmployee,
  source: string | null = null,
): Promise<ClockResult> {
  const today = todayLjubljana();

  // Poišči vse odprte vnose (brez odhoda).
  const { data: openEntries } = await supabase
    .from("time_entries")
    .select("id, date, clock_in")
    .eq("employee_id", employee.id)
    .is("clock_out", null);

  // Že odprt vnos za DANES → prepreči dvojni prihod.
  if ((openEntries ?? []).some((e) => e.date === today)) {
    return { error: "Prihod je že zabeležen.", stale: true };
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
        .eq("id", s.id)
        .eq("employee_id", employee.id)
        .eq("confirmed", false);
    }
  }

  const at = new Date().toISOString();
  const { error } = await supabase.from("time_entries").insert({
    company_id: employee.company_id,
    employee_id: employee.id,
    date: today,
    clock_in: at,
    ...(source ? { source } : {}),
  });
  if (error) return { error: "Napaka pri beleženju prihoda." };
  return { at };
}

// ODHOD — zaključi odprt vnos in izračuna opravljene ure.
// breakMinutes: neobvezna zabeležka odmora (18. člen ZEPDSV). Odmor se po
// ZDR-1 všteva v delovni čas, zato UR NE odšteva — je samo evidenčni podatek.
export async function clockOutEmployee(
  supabase: Db,
  employee: ClockEmployee,
  breakMinutes?: number,
): Promise<ClockResult> {
  const { data: open } = await supabase
    .from("time_entries")
    .select("id, clock_in")
    .eq("employee_id", employee.id)
    .is("clock_out", null)
    .order("clock_in", { ascending: false })
    .limit(1)
    .single();
  if (!open) return { error: "Ni odprtega prihoda.", stale: true };

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
    .eq("id", open.id)
    .eq("employee_id", employee.id)
    .eq("confirmed", false);
  if (error) return { error: "Napaka pri beleženju odhoda." };
  return { capped: overCap, at: clockOutAt.toISOString(), hours };
}
