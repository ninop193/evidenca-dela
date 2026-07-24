"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { combineLjubljana } from "@/lib/tzdate";

const num = (v?: string): number | null =>
  v != null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : null;

export type EntryInput = {
  employeeId: string;
  date: string;
  clockInTime?: string; // HH:MM
  clockOutTime?: string; // HH:MM
  breakMinutes?: string; // odmor v minutah (18. člen — izraba odmora)
  totalWorkedHours?: string;
  workTimeType?: string; // 'polni' | 'krajsi'
  overtimeHours?: string;
  nightHours?: string;
  sundayHours?: string;
  holidayHours?: string;
  shiftSplitHours?: string;
  unevenlyDistributedHours?: string;
  pensionBenefitHours?: string;
  pensionBenefitStatus?: string;
  runningTotalHours?: string;
  referencePeriod?: string;
  notes?: string;
};

export type EntryResult = { error?: string };

function buildPayload(input: EntryInput, companyId: string) {
  const total = num(input.totalWorkedHours);
  return {
    company_id: companyId,
    employee_id: input.employeeId,
    date: input.date,
    clock_in: combineLjubljana(input.date, input.clockInTime),
    clock_out: combineLjubljana(input.date, input.clockOutTime),
    break_minutes: Math.min(480, Math.max(0, Math.round(num(input.breakMinutes) ?? 0))),
    hours_count: total,
    total_worked_hours: total,
    work_time_type: input.workTimeType === "krajsi" ? "krajsi" : "polni",
    overtime_hours: num(input.overtimeHours) ?? 0,
    night_hours: num(input.nightHours) ?? 0,
    sunday_hours: num(input.sundayHours) ?? 0,
    holiday_hours: num(input.holidayHours) ?? 0,
    shift_split_hours: num(input.shiftSplitHours) ?? 0,
    unevenly_distributed_hours: num(input.unevenlyDistributedHours) ?? 0,
    pension_benefit_hours: num(input.pensionBenefitHours) ?? 0,
    pension_benefit_status: input.pensionBenefitStatus?.trim() || null,
    running_total_hours: num(input.runningTotalHours),
    reference_period: input.referencePeriod?.trim() || null,
    notes: input.notes?.trim() || null,
    // Ko delodajalec ročno shrani vnos, je pregledan → počisti oznako "za pregled".
    needs_review: false,
  };
}

async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") return null;
  return profile;
}

// Ročni vnos novega zapisa delovnega časa (retroaktivno).
export async function createManualEntry(input: EntryInput): Promise<EntryResult> {
  const profile = await requireAdmin();
  if (!profile) return { error: "Samo delodajalec lahko vnaša ure." };
  if (!input.employeeId || !input.date) {
    return { error: "Zaposleni in datum sta obvezna." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("time_entries")
    .insert(buildPayload(input, profile.company_id));
  if (error) return { error: "Napaka pri shranjevanju vnosa." };
  revalidatePath("/dashboard/ure");
  return {};
}

// Urejanje obstoječega vnosa.
export async function updateEntry(id: string, input: EntryInput): Promise<EntryResult> {
  const profile = await requireAdmin();
  if (!profile) return { error: "Samo delodajalec lahko ureja ure." };
  if (!input.employeeId || !input.date) {
    return { error: "Zaposleni in datum sta obvezna." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("time_entries")
    .update(buildPayload(input, profile.company_id))
    .eq("id", id);
  if (error) return { error: "Napaka pri shranjevanju sprememb." };
  revalidatePath("/dashboard/ure");
  return {};
}

// Izbris vnosa.
export async function deleteEntry(id: string): Promise<EntryResult> {
  const profile = await requireAdmin();
  if (!profile) return { error: "Samo delodajalec lahko briše vnose." };
  const supabase = await createClient();
  const { error } = await supabase.from("time_entries").delete().eq("id", id);
  if (error) return { error: "Napaka pri brisanju vnosa." };
  revalidatePath("/dashboard/ure");
  return {};
}
