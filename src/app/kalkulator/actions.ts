"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type LeadResult = { error?: string; ok?: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shrani email s kalkulatorja (za preizkus / marketing). Teče na strežniku.
export async function captureLead(email: string): Promise<LeadResult> {
  const clean = email?.trim().toLowerCase();
  if (!clean || !EMAIL_RE.test(clean)) {
    return { error: "Vnesi veljaven email." };
  }
  const admin = createAdminClient();
  const { error } = await admin.from("leads").insert({ email: clean, source: "kalkulator" });
  if (error) {
    return { error: "Napaka pri shranjevanju. Poskusi znova." };
  }
  return { ok: true };
}
