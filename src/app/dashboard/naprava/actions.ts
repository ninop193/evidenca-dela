"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assignPin, connectThisDevice, ensurePins, sha256, PAIR_CODE_MINUTES } from "@/lib/kiosk";

type Result = { error?: string; ok?: boolean };

// Vse spremembe nastavitev naprave sme narediti samo delodajalec svojega podjetja.
async function adminContext() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") return null;
  return { profile, db: createAdminClient() };
}

const NOT_ADMIN = { error: "Samo delodajalec lahko ureja skupno napravo." };

// Vklop: podjetju vklopi možnost in vsem aktivnim zaposlenim dodeli PIN kode.
export async function enableKiosk(): Promise<Result> {
  const ctx = await adminContext();
  if (!ctx) return NOT_ADMIN;
  const { error } = await ctx.db.from("companies").update({ kiosk_enabled: true }).eq("id", ctx.profile.company_id);
  if (error) return { error: "Vklop ni uspel. Poskusi znova." };
  await ensurePins(ctx.db, ctx.profile.company_id);
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

// Izklop: odklopi vse naprave (PIN kode ostanejo za morebitni ponovni vklop).
export async function disableKiosk(): Promise<Result> {
  const ctx = await adminContext();
  if (!ctx) return NOT_ADMIN;
  const companyId = ctx.profile.company_id;
  const now = new Date().toISOString();
  const [{ error }] = await Promise.all([
    ctx.db.from("companies").update({ kiosk_enabled: false }).eq("id", companyId),
    ctx.db.from("kiosk_devices").update({ revoked_at: now }).eq("company_id", companyId).is("revoked_at", null),
    ctx.db.from("kiosk_pair_codes").delete().eq("company_id", companyId),
  ]);
  if (error) return { error: "Izklop ni uspel. Poskusi znova." };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

// Enkratna 6-mestna koda za povezavo naprave (velja 10 minut, nadomesti prejšnjo).
export async function createPairCode(): Promise<Result & { code?: string }> {
  const ctx = await adminContext();
  if (!ctx) return NOT_ADMIN;
  const companyId = ctx.profile.company_id;
  const expires = new Date(Date.now() + PAIR_CODE_MINUTES * 60_000).toISOString();
  for (let i = 0; i < 5; i++) {
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const { error } = await ctx.db
      .from("kiosk_pair_codes")
      .upsert({ company_id: companyId, code_hash: sha256(code), expires_at: expires });
    if (!error) return { code };
    if (error.code !== "23505") break;
  }
  return { error: "Kode za povezavo ni bilo mogoče ustvariti. Poskusi znova." };
}

// "Uporabi to napravo": poveže napravo, na kateri je delodajalec, in ga
// na njej odjavi — zaposleni na napravi tako ne pridejo do nadzorne plošče.
export async function connectAsKiosk(): Promise<Result> {
  const ctx = await adminContext();
  if (!ctx) return NOT_ADMIN;
  const { data: company } = await ctx.db
    .from("companies")
    .select("kiosk_enabled")
    .eq("id", ctx.profile.company_id)
    .maybeSingle();
  if (!company?.kiosk_enabled) return { error: "Skupna naprava ni vklopljena." };
  if (!(await connectThisDevice(ctx.db, ctx.profile.company_id))) {
    return { error: "Povezava ni uspela. Poskusi znova." };
  }
  // scope "local": odjavi SAMO ta brskalnik (privzeto bi odjavil delodajalca povsod).
  await (await createClient()).auth.signOut({ scope: "local" });
  return { ok: true };
}

export async function disconnectDevice(deviceId: string): Promise<Result> {
  const ctx = await adminContext();
  if (!ctx) return NOT_ADMIN;
  const { error } = await ctx.db
    .from("kiosk_devices")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", deviceId)
    .eq("company_id", ctx.profile.company_id);
  if (error) return { error: "Odklop ni uspel." };
  revalidatePath("/dashboard/naprava");
  return { ok: true };
}

// Ime naprave (npr. "Telefon v lokalu"); prazno ime → privzeto "Naprava N".
export async function renameDevice(deviceId: string, rawName: string): Promise<Result> {
  const ctx = await adminContext();
  if (!ctx) return NOT_ADMIN;
  const name = rawName.trim().replace(/\s+/g, " ").slice(0, 40) || null;
  const { error } = await ctx.db
    .from("kiosk_devices")
    .update({ name })
    .eq("id", deviceId)
    .eq("company_id", ctx.profile.company_id)
    .is("revoked_at", null);
  if (error) return { error: "Imena ni bilo mogoče shraniti." };
  revalidatePath("/dashboard/naprava");
  return { ok: true };
}

// Nova PIN koda za zaposlenega (npr. če jo je izvedel sodelavec).
export async function regeneratePin(employeeId: string): Promise<Result & { pin?: string }> {
  const ctx = await adminContext();
  if (!ctx) return NOT_ADMIN;
  const { data: emp } = await ctx.db
    .from("employees")
    .select("id")
    .eq("id", employeeId)
    .eq("company_id", ctx.profile.company_id)
    .maybeSingle();
  if (!emp) return { error: "Zaposleni ni najden." };
  const pin = await assignPin(ctx.db, ctx.profile.company_id, emp.id);
  if (!pin) return { error: "Nove osebne kode ni bilo mogoče ustvariti." };
  revalidatePath("/dashboard/naprava");
  return { ok: true, pin };
}
