"use server";

import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN } from "@/lib/billing";

export type CreateEmployeeInput = {
  fullName: string;
  email: string;
  password: string;
  jobTitle?: string;
  emso?: string;
  taxId?: string;
  weeklyHours?: string;
  employmentStartDate?: string;
  isManagement?: boolean;
};

export type CreateEmployeeResult = { error?: string; email?: string };

// Admin doda zaposlenega: ustvari mu prijavo + zapis v evidenco o zaposlenih (13. člen).
export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<CreateEmployeeResult> {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return { error: "Samo delodajalec lahko dodaja zaposlene." };
  }

  const email = input.email?.trim().toLowerCase();
  const fullName = input.fullName?.trim();
  if (!fullName || !email || !input.password) {
    return { error: "Ime, email in geslo so obvezni." };
  }
  if (input.password.length < 8) {
    return { error: "Geslo mora imeti vsaj 8 znakov." };
  }

  const admin = createAdminClient();

  // Omejitev paketa: do 10 zaposlenih.
  const { count } = await admin
    .from("employees")
    .select("id", { count: "exact", head: true })
    .eq("company_id", profile.company_id);
  if ((count ?? 0) >= PLAN.maxEmployees) {
    return {
      error: `Paket Delovit dopušča do ${PLAN.maxEmployees} zaposlenih. Za več pošlji povpraševanje na info@delovit.si.`,
    };
  }

  // 1) Ustvari prijavo zaposlenega (takoj potrjeno)
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
  });
  if (createErr || !created.user) {
    if (createErr?.message?.toLowerCase().includes("already")) {
      return { error: "Ta email je že v uporabi." };
    }
    return { error: createErr?.message ?? "Dodajanje ni uspelo." };
  }
  const userId = created.user.id;

  // 2) Profil uporabnika (vloga: employee, isto podjetje)
  const { error: userErr } = await admin.from("users").insert({
    id: userId,
    company_id: profile.company_id,
    role: "employee",
    email,
    full_name: fullName,
  });
  if (userErr) {
    await admin.auth.admin.deleteUser(userId);
    return { error: "Napaka pri ustvarjanju računa zaposlenega." };
  }

  // 3) Zapis v evidenco o zaposlenih (13. člen)
  const { error: empErr } = await admin.from("employees").insert({
    company_id: profile.company_id,
    user_id: userId,
    full_name: fullName,
    job_title: input.jobTitle?.trim() || null,
    emso: input.emso?.trim() || null,
    tax_id: input.taxId?.trim() || null,
    weekly_hours: input.weeklyHours ? Number(input.weeklyHours) : null,
    employment_start_date: input.employmentStartDate || null,
    is_management: !!input.isManagement,
  });
  if (empErr) {
    await admin.from("users").delete().eq("id", userId);
    await admin.auth.admin.deleteUser(userId);
    return { error: "Napaka pri zapisu v evidenco zaposlenih." };
  }

  return { email };
}
