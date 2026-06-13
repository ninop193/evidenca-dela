"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Odjava — počisti sejo in vrne na prijavo.
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type RegisterResult = { error?: string };

// Registrira novo podjetje + admina v enem koraku.
// Teče na strežniku s service-role ključem (obide RLS) — uporabnik je takoj potrjen,
// brez čakanja na potrditveni email (naša prednost: "brez onboardinga").
export async function registerCompany(formData: {
  email: string;
  password: string;
  companyName: string;
  fullName: string;
  taxId?: string;
}): Promise<RegisterResult> {
  const email = formData.email?.trim().toLowerCase();
  const { password, companyName, fullName, taxId } = formData;

  // Osnovna validacija
  if (!email || !password || !companyName || !fullName) {
    return { error: "Izpolni vsa obvezna polja." };
  }
  if (password.length < 8) {
    return { error: "Geslo mora imeti vsaj 8 znakov." };
  }

  const admin = createAdminClient();

  // 1) Ustvari potrjenega uporabnika
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !created.user) {
    if (createErr?.message?.toLowerCase().includes("already")) {
      return { error: "Ta email je že registriran. Poskusi se prijaviti." };
    }
    return { error: createErr?.message ?? "Registracija ni uspela." };
  }

  const userId = created.user.id;

  // 2) Ustvari podjetje
  const { data: company, error: companyErr } = await admin
    .from("companies")
    .insert({ name: companyName.trim(), tax_id: taxId?.trim() || null })
    .select("id")
    .single();
  if (companyErr || !company) {
    // Pospravi za sabo, da ne ostane "viseč" uporabnik
    await admin.auth.admin.deleteUser(userId);
    return { error: "Napaka pri ustvarjanju podjetja. Poskusi znova." };
  }

  // 3) Poveži uporabnika kot admina podjetja
  const { error: userErr } = await admin.from("users").insert({
    id: userId,
    company_id: company.id,
    role: "admin",
    email,
    full_name: fullName.trim(),
  });
  if (userErr) {
    await admin.from("companies").delete().eq("id", company.id);
    await admin.auth.admin.deleteUser(userId);
    return { error: "Napaka pri ustvarjanju računa. Poskusi znova." };
  }

  return {};
}
