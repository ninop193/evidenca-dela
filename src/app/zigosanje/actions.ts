"use server";

import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/billing";
import { workerCategory, autostopHoursFor, autoCapNote } from "@/lib/workLimits";

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
          notes: autoCapNote(capH),
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
export async function clockOut(): Promise<ActionResult> {
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

  const { error } = await supabase
    .from("time_entries")
    .update({
      clock_out: clockOutAt.toISOString(),
      hours_count: hours,
      total_worked_hours: hours,
      sunday_hours: isSunday(start) ? hours : 0,
      ...(overCap ? { needs_review: true, notes: autoCapNote(capH) } : {}),
    })
    .eq("id", open.id);
  if (error) return { error: "Napaka pri beleženju odhoda." };
  return { capped: overCap };
}
