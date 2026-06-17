import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, companyAdmin } from "@/lib/email/send";
import { trialEndingEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Dnevni opomnik: podjetja v preizkusu, ki jim poteče v naslednjih ~2 dneh
// in opomnika še niso prejela. Sproži Vercel Cron (glej vercel.json).
export async function GET(req: NextRequest) {
  // Zaščita: Vercel Cron pošlje "Authorization: Bearer <CRON_SECRET>".
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Nedovoljeno." }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const now = Date.now();
  const horizon = new Date(now + 2 * 86_400_000).toISOString(); // čez 2 dni
  const nowIso = new Date(now).toISOString();

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
      Math.ceil((new Date(c.trial_ends_at!).getTime() - now) / 86_400_000),
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

  return NextResponse.json({ checked: companies?.length ?? 0, sent });
}
