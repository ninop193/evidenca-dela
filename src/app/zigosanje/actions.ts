"use server";

import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/billing";

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

type ActionResult = { error?: string };

// Poišče zapis zaposlenega + preveri dostop (preizkus/naročnina) podjetja.
async function getEmployee() {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) return { supabase, profile: null, employee: null, hasAccess: false };
  const [{ data: employee }, { data: company }] = await Promise.all([
    supabase.from("employees").select("id, company_id, active").eq("user_id", profile.id).single(),
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

  // Pozabljen odhod iz prejšnjega dne → samodejno zaključi in označi za pregled.
  const stale = (openEntries ?? []).filter((e) => e.date !== today);
  for (const s of stale) {
    await supabase
      .from("time_entries")
      .update({
        clock_out: s.clock_in,
        hours_count: 0,
        total_worked_hours: 0,
        notes: "Samodejno zaprto – manjka odhod. Prosimo, popravite ure.",
      })
      .eq("id", s.id);
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
  const hours = Math.max(
    0,
    Math.round(((now.getTime() - start.getTime()) / 3_600_000) * 100) / 100,
  );

  const { error } = await supabase
    .from("time_entries")
    .update({
      clock_out: now.toISOString(),
      hours_count: hours,
      total_worked_hours: hours,
      sunday_hours: isSunday(start) ? hours : 0,
    })
    .eq("id", open.id);
  if (error) return { error: "Napaka pri beleženju odhoda." };
  return {};
}
