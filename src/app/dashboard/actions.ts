"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN } from "@/lib/billing";

export type ActionResult = { error?: string; ok?: boolean };

// Preveri, da je klicatelj admin in da zaposleni pripada njegovemu podjetju.
async function ownedEmployee(employeeId: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return { error: "Samo delodajalec lahko upravlja zaposlene." as string };
  }
  const admin = createAdminClient();
  const { data: emp } = await admin
    .from("employees")
    .select("id, company_id, user_id")
    .eq("id", employeeId)
    .maybeSingle();
  if (!emp || emp.company_id !== profile.company_id) {
    return { error: "Zaposleni ni najden." as string };
  }
  return { admin, emp };
}

// Deaktiviraj / ponovno aktiviraj zaposlenega (ohrani evidenco ur).
export async function setEmployeeActive(
  employeeId: string,
  active: boolean,
): Promise<ActionResult> {
  const res = await ownedEmployee(employeeId);
  if ("error" in res) return { error: res.error };
  const { error } = await res.admin
    .from("employees")
    .update({ active })
    .eq("id", employeeId);
  if (error) return { error: "Sprememba ni uspela." };
  revalidatePath("/dashboard/zaposleni");
  return { ok: true };
}

// Dokončno izbriši zaposlenega — DOVOLJENO le, če nima zabeleženih ur ali odsotnosti
// (zakon zahteva hrambo evidence; sicer naj se uporabi deaktivacija).
export async function deleteEmployee(employeeId: string): Promise<ActionResult> {
  const res = await ownedEmployee(employeeId);
  if ("error" in res) return { error: res.error };
  const { admin, emp } = res;

  const [{ count: entries }, { count: absences }] = await Promise.all([
    admin.from("time_entries").select("id", { count: "exact", head: true }).eq("employee_id", employeeId),
    admin.from("absences").select("id", { count: "exact", head: true }).eq("employee_id", employeeId),
  ]);
  if ((entries ?? 0) > 0 || (absences ?? 0) > 0) {
    return {
      error:
        "Ta zaposleni ima zabeleženo evidenco, ki jo morate po zakonu hraniti. Namesto brisanja ga deaktivirajte.",
    };
  }

  // Izbriši zapis zaposlenega, nato še njegovo prijavo (auth → kaskadno pobriše users).
  const { error: delErr } = await admin.from("employees").delete().eq("id", employeeId);
  if (delErr) return { error: "Brisanje ni uspelo." };
  if (emp.user_id) await admin.auth.admin.deleteUser(emp.user_id).catch(() => {});

  revalidatePath("/dashboard/zaposleni");
  return { ok: true };
}

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

export type UpdateEmployeeInput = {
  id: string;
  fullName: string;
  jobTitle?: string;
  emso?: string;
  taxId?: string;
  weeklyHours?: string;
  employmentStartDate?: string;
  isManagement?: boolean;
};

// Uredi podatke obstoječega zaposlenega (vključno z oznako "poslovodna oseba").
// Ne spreminja emaila/gesla (prijavni podatki).
export async function updateEmployee(input: UpdateEmployeeInput): Promise<ActionResult> {
  const res = await ownedEmployee(input.id);
  if ("error" in res) return { error: res.error };
  const { admin, emp } = res;

  const fullName = input.fullName?.trim();
  if (!fullName) return { error: "Ime in priimek sta obvezna." };

  const { error } = await admin
    .from("employees")
    .update({
      full_name: fullName,
      job_title: input.jobTitle?.trim() || null,
      emso: input.emso?.trim() || null,
      tax_id: input.taxId?.trim() || null,
      weekly_hours: input.weeklyHours ? Number(input.weeklyHours) : null,
      employment_start_date: input.employmentStartDate || null,
      is_management: !!input.isManagement,
    })
    .eq("id", input.id);
  if (error) return { error: "Shranjevanje ni uspelo." };

  // Uskladi ime tudi v prijavnem profilu (za dosleden prikaz).
  if (emp.user_id) await admin.from("users").update({ full_name: fullName }).eq("id", emp.user_id);

  revalidatePath("/dashboard/zaposleni");
  return { ok: true };
}
