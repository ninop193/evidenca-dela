"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Zadnji dan v mesecu (YYYY-MM) kot YYYY-MM-DD.
function monthBounds(month: string): { first: string; last: string } | null {
  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { first: `${month}-01`, last: `${month}-${String(lastDay).padStart(2, "0")}` };
}

type Result = { error?: string };

async function setConfirmed(
  employeeId: string,
  month: string,
  value: boolean,
): Promise<Result> {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return { error: "Samo delodajalec lahko potrjuje ure." };
  }
  const bounds = monthBounds(month);
  if (!employeeId || !bounds) return { error: "Neveljavni podatki." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("time_entries")
    .update({ confirmed: value })
    .eq("employee_id", employeeId)
    .gte("date", bounds.first)
    .lte("date", bounds.last);
  if (error) return { error: "Napaka pri posodabljanju potrditve." };
  revalidatePath("/dashboard/pregled");
  return {};
}

// Potrdi (zakleni) mesec za zaposlenega.
export async function confirmMonth(employeeId: string, month: string) {
  return setConfirmed(employeeId, month, true);
}

// Prekliči potrditev meseca.
export async function unconfirmMonth(employeeId: string, month: string) {
  return setConfirmed(employeeId, month, false);
}
