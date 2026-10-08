import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, companyAdmin } from "@/lib/email/send";
import {
  trialEndingEmail,
  trialWinbackEmail,
  firstEmployeeNudgeEmail,
  ACTIVATION_NUDGE_FROM_NAME,
} from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY = 86_400_000;

// Win-back: pošljemo šele, ko je od izteka minil vsaj 1 dan (da se ne prekriva
// z opomnikom "poteče čez 2 dni") in največ 60 dni (starejših ne nadlegujemo).
const WINBACK_MIN_DAYS = 1;
const WINBACK_MAX_DAYS = 60;

// Opomnik "dodajte prvega zaposlenega": najprej naslednje jutro po registraciji
// (vsaj 12 h), največ 7 dni po njej (starejših ne nadlegujemo).
const NUDGE_MIN_HOURS = 12;
const NUDGE_MAX_DAYS = 7;

// Dnevni cron (Vercel, glej vercel.json). Tri naloge:
//  1) Opomnik PRED iztekom preizkusa (~2 dni prej).
//  2) Opomnik podjetjem, ki po registraciji niso dodala nobenega zaposlenega. Samo enkrat.
//  3) Win-back PO izteku: podjetja, ki so Delovit v preizkusu dejansko
//     uporabljala (imajo vnose ur), a paketa niso kupila. Samo enkrat.
export async function GET(req: NextRequest) {
  // Zaščita: Vercel Cron pošlje "Authorization: Bearer <CRON_SECRET>".
  // Brez nastavljenega CRON_SECRET endpoint ostane ZAKLENJEN (ne odprt).
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Nedovoljeno." }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  // ── 1) Preizkus se izteka ────────────────────────────────────────────────
  const horizon = new Date(now + 2 * DAY).toISOString(); // čez 2 dni

  const { data: companies, error } = await admin
    .from("companies")
    .select("id, trial_ends_at")
    .eq("subscription_status", "trialing")
    .is("trial_reminder_sent_at", null)
    .gt("trial_ends_at", nowIso)
    .lte("trial_ends_at", horizon);

  if (error) {
    console.error("Cron poizvedba napaka:", error);
    return NextResponse.json({ error: "Poizvedba spodletela." }, { status: 500 });
  }

  let sent = 0;
  for (const c of companies ?? []) {
    const person = await companyAdmin(c.id);
    if (!person) continue;

    const daysLeft = Math.max(
      1,
      Math.ceil((new Date(c.trial_ends_at!).getTime() - now) / DAY),
    );
    const ok = await sendEmail(
      person.email,
      trialEndingEmail({ fullName: person.fullName, daysLeft }),
    );
    if (ok) {
      await admin
        .from("companies")
        .update({ trial_reminder_sent_at: new Date().toISOString() })
        .eq("id", c.id);
      sent++;
    }
  }

  // ── 2) Še brez zaposlenih ────────────────────────────────────────────────
  const nudge = await sendActivationNudges(admin, now);

  // ── 3) Win-back po izteku preizkusa ──────────────────────────────────────
  // VARNOSTNO STIKALO: dokler WINBACK_ENABLED ni "1", se strankam ne pošlje nič.
  // (Testni gumb na /nadzor deluje ne glede na to nastavitev.)
  if (process.env.WINBACK_ENABLED !== "1") {
    return NextResponse.json({
      checked: companies?.length ?? 0,
      sent,
      nudge,
      winbackDisabled: true,
    });
  }

  const winbackFrom = new Date(now - WINBACK_MAX_DAYS * DAY).toISOString();
  const winbackTo = new Date(now - WINBACK_MIN_DAYS * DAY).toISOString();

  const { data: expired, error: expErr } = await admin
    .from("companies")
    .select("id, name, trial_ends_at")
    .eq("subscription_status", "trialing") // še nikoli ni kupil paketa
    .is("winback_email_sent_at", null)
    .gte("trial_ends_at", winbackFrom)
    .lte("trial_ends_at", winbackTo);

  if (expErr) {
    console.error("Cron win-back poizvedba napaka:", expErr);
    return NextResponse.json(
      { checked: companies?.length ?? 0, sent, nudge, winbackError: true },
      { status: 200 },
    );
  }

  let winbackSent = 0;
  let winbackSkipped = 0;
  for (const c of expired ?? []) {
    const person = await companyAdmin(c.id);
    if (!person) continue;

    // Samo tistim, ki so Delovit dejansko uporabljali (vsaj en vnos ur).
    const [{ count: entries }, { count: employees }] = await Promise.all([
      admin
        .from("time_entries")
        .select("id", { count: "exact", head: true })
        .eq("company_id", c.id),
      admin
        .from("employees")
        .select("id", { count: "exact", head: true })
        .eq("company_id", c.id)
        .eq("active", true),
    ]);

    if (!entries || entries < 1) {
      winbackSkipped++;
      continue;
    }

    const expiredDaysAgo = Math.max(
      1,
      Math.floor((now - new Date(c.trial_ends_at!).getTime()) / DAY),
    );
    const ok = await sendEmail(
      person.email,
      trialWinbackEmail({
        fullName: person.fullName,
        companyName: c.name,
        entries,
        employees: employees ?? 0,
        expiredDaysAgo,
      }),
    );
    if (ok) {
      await admin
        .from("companies")
        .update({ winback_email_sent_at: new Date().toISOString() })
        .eq("id", c.id);
      winbackSent++;
    }
  }

  return NextResponse.json({
    checked: companies?.length ?? 0,
    sent,
    nudge,
    winbackChecked: expired?.length ?? 0,
    winbackSent,
    winbackSkipped,
  });
}

// Podjetja v preizkusu, registrirana pred 12 h do 7 dni, ki še nimajo nobenega
// zaposlenega → en oseben opomnik adminu. Napaka tu ne sme podreti ostalih nalog.
async function sendActivationNudges(
  admin: ReturnType<typeof createAdminClient>,
  now: number,
) {
  // VARNOSTNO STIKALO: dokler ACTIVATION_NUDGE_ENABLED ni "1", se strankam ne pošlje nič.
  // (Testni gumb na /nadzor deluje ne glede na to nastavitev.)
  if (process.env.ACTIVATION_NUDGE_ENABLED !== "1") return { disabled: true };

  const { data: fresh, error } = await admin
    .from("companies")
    .select("id, name")
    .eq("subscription_status", "trialing")
    .is("activation_nudge_sent_at", null)
    .gte("created_at", new Date(now - NUDGE_MAX_DAYS * DAY).toISOString())
    .lte("created_at", new Date(now - NUDGE_MIN_HOURS * 3_600_000).toISOString());

  if (error) {
    console.error("Cron opomnik (brez zaposlenih) poizvedba napaka:", error);
    return { error: true };
  }

  let sent = 0;
  for (const c of fresh ?? []) {
    const { count } = await admin
      .from("employees")
      .select("id", { count: "exact", head: true })
      .eq("company_id", c.id);
    if ((count ?? 0) > 0) continue;

    const person = await companyAdmin(c.id);
    if (!person) continue;

    const ok = await sendEmail(
      person.email,
      firstEmployeeNudgeEmail({ fullName: person.fullName, companyName: c.name }),
      { fromName: ACTIVATION_NUDGE_FROM_NAME },
    );
    if (ok) {
      await admin
        .from("companies")
        .update({ activation_nudge_sent_at: new Date().toISOString() })
        .eq("id", c.id);
      sent++;
    }
  }
  return { checked: fresh?.length ?? 0, sent };
}
