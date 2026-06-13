"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const CATEGORIES = [
  "nadomestilo_iz_sredstev_delodajalca",
  "nadomestilo_v_breme_drugih",
  "brez_nadomestila",
];
const TYPES = [
  "letni_dopust",
  "bolniska_do_30",
  "bolniska_zzzs",
  "starsevsko",
  "izredni_dopust",
  "drugo",
];

export type AbsenceInput = {
  employeeId: string;
  dateFrom: string;
  dateTo: string;
  unworkedHours: string;
  compensationCategory: string;
  compensationType: string;
  reason?: string;
  notes?: string;
};

export type AbsenceResult = { error?: string };

export async function createAbsence(input: AbsenceInput): Promise<AbsenceResult> {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return { error: "Samo delodajalec lahko vnaša odsotnosti." };
  }
  const hours = Number(input.unworkedHours);
  if (!input.employeeId || !input.dateFrom || !input.dateTo) {
    return { error: "Zaposleni in obdobje (od–do) so obvezni." };
  }
  if (input.dateTo < input.dateFrom) {
    return { error: "Datum 'do' ne sme biti pred 'od'." };
  }
  if (Number.isNaN(hours) || hours <= 0) {
    return { error: "Vnesi število neopravljenih ur (večje od 0)." };
  }
  if (!CATEGORIES.includes(input.compensationCategory)) {
    return { error: "Izberi kategorijo nadomestila." };
  }
  if (!TYPES.includes(input.compensationType)) {
    return { error: "Izberi vrsto odsotnosti." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("absences").insert({
    company_id: profile.company_id,
    employee_id: input.employeeId,
    date_from: input.dateFrom,
    date_to: input.dateTo,
    unworked_hours: hours,
    compensation_category: input.compensationCategory,
    compensation_type: input.compensationType,
    reason: input.reason?.trim() || null,
    notes: input.notes?.trim() || null,
  });
  if (error) return { error: "Napaka pri shranjevanju odsotnosti." };
  revalidatePath("/dashboard/odsotnosti");
  return {};
}

export async function deleteAbsence(id: string): Promise<AbsenceResult> {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return { error: "Samo delodajalec lahko briše odsotnosti." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("absences").delete().eq("id", id);
  if (error) return { error: "Napaka pri brisanju." };
  revalidatePath("/dashboard/odsotnosti");
  return {};
}
