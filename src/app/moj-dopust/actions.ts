"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { workingDaysBetween } from "@/lib/holidays";
import { hoursToDays, fmtDays } from "@/lib/leave";
import { todayLjubljana } from "@/lib/tzdate";

export type LeaveResult = { error?: string; days?: number };

// Naloži zapis zaposlenega prijavljenega uporabnika (za dopust rabimo redno zaposlene).
async function getSelf() {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) return { supabase, employee: null };
  const { data: employee } = await supabase
    .from("employees")
    .select("id, company_id, worker_type, weekly_hours, annual_leave_days, active")
    .eq("user_id", profile.id)
    .maybeSingle();
  return { supabase, employee };
}

// Zaposleni napove dopust. Vnos je "prošnja" (pending) — delodajalec potrdi/zavrne.
export async function submitLeaveRequest(input: {
  dateFrom: string;
  dateTo: string;
  note?: string;
}): Promise<LeaveResult> {
  const { supabase, employee } = await getSelf();
  if (!employee) return { error: "Vaš račun ni povezan z evidenco zaposlenih." };
  if (!employee.active) return { error: "Vaš račun je deaktiviran. Obrnite se na delodajalca." };
  if (employee.worker_type !== "zaposlen") {
    return { error: "Napoved dopusta je na voljo samo redno zaposlenim." };
  }

  const { dateFrom, dateTo } = input;
  const today = todayLjubljana();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFrom) || !/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
    return { error: "Izberite obdobje dopusta." };
  }
  if (dateTo < dateFrom) return { error: "Datum 'do' ne sme biti pred 'od'." };
  if (dateFrom < today) return { error: "Dopust lahko napoveste za naprej, ne za nazaj." };

  const days = workingDaysBetween(dateFrom, dateTo);
  if (days <= 0) {
    return { error: "V izbranem obdobju ni delovnih dni (sami vikendi/prazniki)." };
  }

  // Prekrivanje z obstoječo prošnjo (v obravnavi ali potrjeno) za istega zaposlenega.
  const { data: existing } = await supabase
    .from("leave_requests")
    .select("date_from, date_to")
    .eq("employee_id", employee.id)
    .in("status", ["pending", "approved"]);
  for (const e of existing ?? []) {
    if (dateFrom <= (e.date_to as string) && dateTo >= (e.date_from as string)) {
      return { error: "Za to obdobje ste dopust že napovedali." };
    }
  }

  // Preveri razpoložljivi dopust, če je kvota nastavljena.
  const entitlement = employee.annual_leave_days == null ? null : Number(employee.annual_leave_days);
  if (entitlement != null) {
    const year = today.slice(0, 4);
    const [{ data: absRows }, { data: pendRows }] = await Promise.all([
      supabase
        .from("absences")
        .select("unworked_hours")
        .eq("employee_id", employee.id)
        .eq("compensation_type", "letni_dopust")
        .gte("date_from", `${year}-01-01`)
        .lte("date_from", `${year}-12-31`),
      supabase
        .from("leave_requests")
        .select("days")
        .eq("employee_id", employee.id)
        .eq("status", "pending")
        .gte("date_from", `${year}-01-01`)
        .lte("date_from", `${year}-12-31`),
    ]);
    const usedDays = (absRows ?? []).reduce(
      (a, r) => a + hoursToDays(Number(r.unworked_hours) || 0, employee.weekly_hours),
      0,
    );
    const pendingDays = (pendRows ?? []).reduce((a, r) => a + (Number(r.days) || 0), 0);
    const remaining = entitlement - usedDays - pendingDays;
    if (days > remaining + 1e-6) {
      return {
        error: `Nimate dovolj razpoložljivega dopusta. Na voljo je še ${fmtDays(Math.max(0, remaining))} dni.`,
      };
    }
  }

  const { error } = await supabase.from("leave_requests").insert({
    company_id: employee.company_id,
    employee_id: employee.id,
    date_from: dateFrom,
    date_to: dateTo,
    days,
    status: "pending",
    employee_note: input.note?.trim() || null,
  });
  if (error) return { error: "Napaka pri oddaji prošnje. Poskusite znova." };
  revalidatePath("/moj-dopust");
  return { days };
}

// Zaposleni prekliče svojo še-čakajočo prošnjo.
export async function cancelLeaveRequest(id: string): Promise<LeaveResult> {
  const { supabase, employee } = await getSelf();
  if (!employee) return { error: "Vaš račun ni povezan z evidenco zaposlenih." };
  const { error } = await supabase
    .from("leave_requests")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("employee_id", employee.id)
    .eq("status", "pending");
  if (error) return { error: "Preklic ni uspel." };
  revalidatePath("/moj-dopust");
  return {};
}
