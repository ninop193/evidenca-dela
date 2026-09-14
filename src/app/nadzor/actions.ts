"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSuperadmin } from "@/lib/superadmin";
import { sendEmail, companyAdmin } from "@/lib/email/send";
import { trialWinbackEmail } from "@/lib/email/templates";

export type ActionResult = { ok: boolean; message: string };

// Preveri, da je klicatelj prijavljen superadmin. Vrne njegov email.
async function requireSuperadmin(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? null;
  return isSuperadmin(email) ? email : null;
}

// Pošlje TESTNI win-back mail — vedno in samo na email prijavljenega
// superadmina. Nikoli ne more končati pri stranki.
export async function sendTestWinback(): Promise<ActionResult> {
  const email = await requireSuperadmin();
  if (!email) return { ok: false, message: "Nedovoljeno." };

  const ok = await sendEmail(
    email,
    trialWinbackEmail({
      fullName: "Nino Pavalec",
      companyName: "Primer d.o.o. (TEST)",
      entries: 87,
      employees: 3,
      expiredDaysAgo: 4,
    }),
  );

  return ok
    ? { ok: true, message: `Testni mail poslan na ${email}.` }
    : { ok: false, message: "Pošiljanje ni uspelo (preveri RESEND_API_KEY in log)." };
}

// Ročno pošlje win-back mail ENEMU izbranemu podjetju (superadmin klikne v /nadzor).
// Vsa preverjanja se izvedejo na strežniku, ne zaupamo temu, kar pošlje brskalnik.
export async function sendWinbackToCompany(companyId: string): Promise<ActionResult> {
  if (!(await requireSuperadmin())) return { ok: false, message: "Nedovoljeno." };

  const admin = createAdminClient();

  // Stolpec winback_email_sent_at obstaja šele po migraciji 0011 — če ga še ni,
  // pošiljanje vseeno deluje, le zabeležiti ga ne moremo (in to jasno povemo).
  type CompanyRow = {
    id: string;
    name: string;
    subscription_status: string;
    trial_ends_at: string | null;
    winback_email_sent_at?: string | null;
  };

  let hasFlagColumn = true;
  let company: CompanyRow | null = null;

  const withFlag = await admin
    .from("companies")
    .select("id, name, subscription_status, trial_ends_at, winback_email_sent_at")
    .eq("id", companyId)
    .maybeSingle();

  if (withFlag.error) {
    hasFlagColumn = false;
    const plain = await admin
      .from("companies")
      .select("id, name, subscription_status, trial_ends_at")
      .eq("id", companyId)
      .maybeSingle();
    if (plain.error) return { ok: false, message: "Podjetja ni bilo mogoče prebrati." };
    company = plain.data as CompanyRow | null;
  } else {
    company = withFlag.data as CompanyRow | null;
  }

  if (!company) return { ok: false, message: "Podjetje ne obstaja." };

  if (hasFlagColumn && company.winback_email_sent_at) {
    return { ok: false, message: "Win-back mail je bil temu podjetju že poslan." };
  }
  if (company.subscription_status !== "trialing") {
    return { ok: false, message: "Podjetje ni v preizkusu (naročnina je aktivna ali odpovedana)." };
  }
  if (!company.trial_ends_at || Date.parse(company.trial_ends_at) > Date.now()) {
    return { ok: false, message: "Preizkus še ni potekel." };
  }

  const person = await companyAdmin(company.id);
  if (!person) return { ok: false, message: "Podjetje nima admina z emailom." };

  const [{ count: entries }, { count: employees }] = await Promise.all([
    admin.from("time_entries").select("id", { count: "exact", head: true }).eq("company_id", company.id),
    admin
      .from("employees")
      .select("id", { count: "exact", head: true })
      .eq("company_id", company.id)
      .eq("active", true),
  ]);

  if (!entries || entries < 1) {
    return { ok: false, message: "Podjetje v preizkusu ni zabeležilo nobenih ur — maila ne pošiljamo." };
  }

  const expiredDaysAgo = Math.max(
    1,
    Math.floor((Date.now() - Date.parse(company.trial_ends_at)) / 86_400_000),
  );

  const ok = await sendEmail(
    person.email,
    trialWinbackEmail({
      fullName: person.fullName,
      companyName: company.name,
      entries,
      employees: employees ?? 0,
      expiredDaysAgo,
    }),
  );
  if (!ok) return { ok: false, message: "Pošiljanje ni uspelo (preveri Resend log)." };

  if (!hasFlagColumn) {
    return {
      ok: true,
      message: `Poslano na ${person.email}, VENDAR ni zabeleženo (manjka migracija 0011 — poženi SQL, sicer lahko cron mail ponovi).`,
    };
  }

  const { error: markErr } = await admin
    .from("companies")
    .update({ winback_email_sent_at: new Date().toISOString() })
    .eq("id", company.id);

  revalidatePath("/nadzor");

  return markErr
    ? { ok: true, message: `Poslano na ${person.email}, a označba ni uspela — preveri, da se ne ponovi.` }
    : { ok: true, message: `Poslano na ${person.email}.` };
}

// Podaljša brezplačni preizkus izbranemu podjetju (superadmin klikne v /nadzor).
// Status ostane 'trialing', samo datum poteka se prestavi naprej. Opomnik pred
// iztekom se ponastavi, da ga stranka pred novim rokom spet dobi.
export async function extendTrial(companyId: string, days: number): Promise<ActionResult> {
  if (!(await requireSuperadmin())) return { ok: false, message: "Nedovoljeno." };
  if (!Number.isInteger(days) || days < 1 || days > 90) {
    return { ok: false, message: "Neveljavno število dni." };
  }

  const admin = createAdminClient();
  const { data: company, error } = await admin
    .from("companies")
    .select("id, name, subscription_status, trial_ends_at")
    .eq("id", companyId)
    .maybeSingle();

  if (error) return { ok: false, message: "Podjetja ni bilo mogoče prebrati." };
  if (!company) return { ok: false, message: "Podjetje ne obstaja." };

  // Plačnikov in odpovedanih naročnin se ne dotikamo — preizkus velja le za 'trialing'.
  if (company.subscription_status !== "trialing") {
    return {
      ok: false,
      message: `Podjetje ni v preizkusu (status: ${company.subscription_status}). Preizkusa ne podaljšujem.`,
    };
  }

  const newEnd = new Date(Date.now() + days * 86_400_000);
  const { error: updErr } = await admin
    .from("companies")
    .update({
      trial_ends_at: newEnd.toISOString(),
      trial_reminder_sent_at: null, // da opomnik pred novim iztekom spet steče
    })
    .eq("id", company.id);

  if (updErr) return { ok: false, message: "Podaljšanje ni uspelo." };

  revalidatePath("/nadzor");

  const label = new Intl.DateTimeFormat("sl-SI", {
    timeZone: "Europe/Ljubljana",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(newEnd);

  return { ok: true, message: `Preizkus podaljšan do ${label}.` };
}
