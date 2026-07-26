"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { daysToHours, hoursToDays, fmtDays } from "@/lib/leave";
import { sendEmail } from "@/lib/email/send";
import { leaveDecisionEmployeeEmail } from "@/lib/email/templates";

export type DecisionResult = { error?: string; ok?: boolean };

// Naloži prošnjo + zaposlenega, preveri da je klicatelj admin istega podjetja.
async function loadPending(requestId: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return { error: "Samo delodajalec lahko odloča o dopustu." as string };
  }
  const supabase = await createClient();
  const { data: req } = await supabase
    .from("leave_requests")
    .select(
      "id, company_id, employee_id, date_from, date_to, days, status, employees(full_name, user_id, weekly_hours, annual_leave_days)",
    )
    .eq("id", requestId)
    .maybeSingle();
  if (!req || req.company_id !== profile.company_id) {
    return { error: "Prošnja ni najdena." as string };
  }
  if (req.status !== "pending") {
    return { error: "O tej prošnji je že odločeno." as string };
  }
  return { profile, supabase, req } as const;
}

// Email zaposlenemu o odločitvi (ne sme podreti akcije, če spodleti).
async function notifyEmployee(
  supabase: Awaited<ReturnType<typeof createClient>>,
  opts: {
    userId: string | null;
    fullName: string | null;
    approved: boolean;
    dateFrom: string;
    dateTo: string;
    days: number;
    decisionNote?: string | null;
    remainingDays?: number | null;
  },
) {
  if (!opts.userId) return;
  const { data: u } = await supabase.from("users").select("email").eq("id", opts.userId).maybeSingle();
  if (!u?.email) return;
  await sendEmail(
    u.email,
    leaveDecisionEmployeeEmail({
      fullName: opts.fullName,
      approved: opts.approved,
      dateFrom: opts.dateFrom,
      dateTo: opts.dateTo,
      days: fmtDays(opts.days),
      decisionNote: opts.decisionNote ?? null,
      remainingDays: opts.remainingDays != null ? fmtDays(Math.max(0, opts.remainingDays)) : null,
    }),
  );
}

// Delodajalec POTRDI prošnjo → ustvari zapis odsotnosti (letni dopust) in obvesti zaposlenega.
export async function approveLeaveRequest(
  requestId: string,
  decisionNote?: string,
): Promise<DecisionResult> {
  const res = await loadPending(requestId);
  if ("error" in res) return { error: res.error };
  const { profile, supabase, req } = res;
  const emp = (req as unknown as {
    employees: { full_name: string; user_id: string | null; weekly_hours: number | null; annual_leave_days: number | null } | null;
  }).employees;

  const hours = daysToHours(Number(req.days), emp?.weekly_hours ?? null);

  // 1) Zakonski zapis odsotnosti (od tod se šteje "porabljeno").
  const { data: absence, error: absErr } = await supabase
    .from("absences")
    .insert({
      company_id: req.company_id,
      employee_id: req.employee_id,
      date_from: req.date_from,
      date_to: req.date_to,
      unworked_hours: hours,
      compensation_category: "nadomestilo_iz_sredstev_delodajalca",
      compensation_type: "letni_dopust",
      notes: "Potrjen dopust (napoved zaposlenega).",
    })
    .select("id")
    .single();
  if (absErr) return { error: "Napaka pri beleženju dopusta." };

  // 2) Prošnja → potrjeno.
  const { error: updErr } = await supabase
    .from("leave_requests")
    .update({
      status: "approved",
      decided_by: profile.id,
      decided_at: new Date().toISOString(),
      decision_note: decisionNote?.trim() || null,
      absence_id: absence.id,
    })
    .eq("id", req.id);
  if (updErr) return { error: "Napaka pri potrditvi." };

  // Preostali dopust po potrditvi (če je kvota nastavljena).
  let remaining: number | null = null;
  if (emp?.annual_leave_days != null) {
    const year = req.date_from.slice(0, 4);
    const { data: absRows } = await supabase
      .from("absences")
      .select("unworked_hours")
      .eq("employee_id", req.employee_id)
      .eq("compensation_type", "letni_dopust")
      .gte("date_from", `${year}-01-01`)
      .lte("date_from", `${year}-12-31`);
    const usedDays = (absRows ?? []).reduce(
      (a, r) => a + hoursToDays(Number(r.unworked_hours) || 0, emp.weekly_hours),
      0,
    );
    remaining = Number(emp.annual_leave_days) - usedDays;
  }

  await notifyEmployee(supabase, {
    userId: emp?.user_id ?? null,
    fullName: emp?.full_name ?? null,
    approved: true,
    dateFrom: req.date_from,
    dateTo: req.date_to,
    days: Number(req.days),
    decisionNote,
    remainingDays: remaining,
  });

  revalidatePath("/dashboard/dopust");
  revalidatePath("/dashboard");
  return { ok: true };
}

// Delodajalec ZAVRNE prošnjo → obvesti zaposlenega (zapisa odsotnosti ni).
export async function rejectLeaveRequest(
  requestId: string,
  decisionNote?: string,
): Promise<DecisionResult> {
  const res = await loadPending(requestId);
  if ("error" in res) return { error: res.error };
  const { profile, supabase, req } = res;
  const emp = (req as unknown as {
    employees: { full_name: string; user_id: string | null } | null;
  }).employees;

  const { error } = await supabase
    .from("leave_requests")
    .update({
      status: "rejected",
      decided_by: profile.id,
      decided_at: new Date().toISOString(),
      decision_note: decisionNote?.trim() || null,
    })
    .eq("id", req.id);
  if (error) return { error: "Napaka pri zavrnitvi." };

  await notifyEmployee(supabase, {
    userId: emp?.user_id ?? null,
    fullName: emp?.full_name ?? null,
    approved: false,
    dateFrom: req.date_from,
    dateTo: req.date_to,
    days: Number(req.days),
    decisionNote,
  });

  revalidatePath("/dashboard/dopust");
  revalidatePath("/dashboard");
  return { ok: true };
}
