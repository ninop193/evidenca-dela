import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, companyAdmin } from "@/lib/email/send";
import {
  shiftLimitEmployeeEmail,
  shiftLimitEmployerEmail,
} from "@/lib/email/templates";
import {
  workerCategory,
  reminderHoursFor,
  autostopHoursFor,
  autoCapNote,
} from "@/lib/workLimits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TZ = "Europe/Ljubljana";
const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, hour: "2-digit", minute: "2-digit" })
    .format(new Date(iso));

// Faza 1.5: pravočasna eskalacija ob predolgi odprti izmeni. Kliče Supabase
// pg_cron vsakih 15 minut. Trije sloji (vsak največ enkrat na vnos):
//   1. elapsed >= zakonska meja (8h/10h)   → opomnik ZAPOSLENEMU (email)
//   2. elapsed >= meja + 30 min            → 2. opomnik zaposlenemu + obvestilo DELODAJALCU
//   3. elapsed >= auto-stop (10h/12h)      → vnos se zapre ob meji + označi "za pregled"
//      (brez dodatnega maila: delodajalec je bil obveščen v sloju 2; ure se ne odrežejo tiho)
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Nedovoljeno." }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const now = Date.now();

  const { data: open, error } = await admin
    .from("time_entries")
    .select("id, company_id, employee_id, date, clock_in, limit_alert_sent_at, escalation_sent_at")
    .is("clock_out", null)
    .not("clock_in", "is", null);

  if (error) {
    console.error("shift-alerts poizvedba napaka:", error);
    return NextResponse.json({ error: "Poizvedba spodletela." }, { status: 500 });
  }

  const entries = open ?? [];
  if (!entries.length) return NextResponse.json({ checked: 0 });

  // Podatki zaposlenih (kategorija za meje + email prek users).
  const empIds = [...new Set(entries.map((e) => e.employee_id))];
  const { data: emps } = await admin
    .from("employees")
    .select("id, full_name, worker_type, birth_date, user_id")
    .in("id", empIds);
  const empById = new Map((emps ?? []).map((e) => [e.id, e]));

  const userIds = (emps ?? []).map((e) => e.user_id).filter(Boolean) as string[];
  const { data: users } = userIds.length
    ? await admin.from("users").select("id, email").in("id", userIds)
    : { data: [] as { id: string; email: string | null }[] };
  const emailByUser = new Map((users ?? []).map((u) => [u.id, u.email]));

  let l1 = 0, l2 = 0, l3 = 0;

  for (const e of entries) {
    const emp = empById.get(e.employee_id);
    const cat = workerCategory(emp?.worker_type, emp?.birth_date);
    const remH = reminderHoursFor(cat);
    const capH = autostopHoursFor(cat);
    const elapsedH = (now - new Date(e.clock_in as string).getTime()) / 3_600_000;
    if (elapsedH < remH) continue;

    const clockIn = fmtTime(e.clock_in as string);
    const empEmail = emp?.user_id ? emailByUser.get(emp.user_id) ?? null : null;

    // Sloj 3: presežena auto-stop meja → zapri ob meji + označi za pregled.
    if (elapsedH >= capH) {
      const capOut = new Date(new Date(e.clock_in as string).getTime() + capH * 3_600_000);
      const { error: upErr } = await admin
        .from("time_entries")
        .update({
          clock_out: capOut.toISOString(),
          hours_count: capH,
          total_worked_hours: capH,
          needs_review: true,
          notes: autoCapNote(),
        })
        .eq("id", e.id);
      if (!upErr) l3++;
      continue;
    }

    // Sloj 2: meja + 30 min → 2. opomnik zaposlenemu + obvestilo delodajalcu.
    if (elapsedH >= remH + 0.5 && e.limit_alert_sent_at && !e.escalation_sent_at) {
      if (empEmail) {
        await sendEmail(
          empEmail,
          shiftLimitEmployeeEmail({
            fullName: emp?.full_name,
            clockIn,
            hours: elapsedH,
            second: true,
          }),
        );
      }
      const boss = await companyAdmin(e.company_id);
      if (boss) {
        await sendEmail(
          boss.email,
          shiftLimitEmployerEmail({
            fullName: boss.fullName,
            employeeName: emp?.full_name ?? "Zaposleni",
            clockIn,
            hours: elapsedH,
          }),
        );
      }
      await admin
        .from("time_entries")
        .update({ escalation_sent_at: new Date().toISOString() })
        .eq("id", e.id);
      l2++;
      continue;
    }

    // Sloj 1: zakonska meja → opomnik zaposlenemu.
    if (!e.limit_alert_sent_at) {
      if (empEmail) {
        await sendEmail(
          empEmail,
          shiftLimitEmployeeEmail({ fullName: emp?.full_name, clockIn, hours: elapsedH }),
        );
      }
      // Žig nastavimo tudi brez emaila (zaposleni brez računa), da sloj 2 lahko sledi.
      await admin
        .from("time_entries")
        .update({ limit_alert_sent_at: new Date().toISOString() })
        .eq("id", e.id);
      l1++;
    }
  }

  return NextResponse.json({ checked: entries.length, reminded: l1, escalated: l2, closed: l3 });
}
