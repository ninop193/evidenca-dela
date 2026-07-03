import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, companyAdmin } from "@/lib/email/send";
import { openEntriesAlertEmail } from "@/lib/email/templates";
import { workerCategory, autostopHoursFor, autoCapNote } from "@/lib/workLimits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TZ = "Europe/Ljubljana";
const todayLjubljana = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
const fmtDate = (d: string) =>
  new Intl.DateTimeFormat("sl-SI", { timeZone: TZ }).format(new Date(d + "T00:00:00"));
const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("sl-SI", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

// Dnevni cron: vnosi, ki so ostali ODPRTI iz prejšnjih dni (pozabljen odhod,
// delavec se ni več vrnil). Predlagamo odhod ob dnevni meji (auto-stop),
// vnos OZNAČIMO za pregled (ura se ne odreže tiho) in obvestimo delodajalca.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Nedovoljeno." }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const today = todayLjubljana();

  // Odprti vnosi (brez odhoda) iz prejšnjih dni.
  const { data: open, error } = await admin
    .from("time_entries")
    .select("id, company_id, employee_id, date, clock_in")
    .is("clock_out", null)
    .lt("date", today);

  if (error) {
    console.error("Cron open-entries poizvedba napaka:", error);
    return NextResponse.json({ error: "Poizvedba spodletela." }, { status: 500 });
  }

  const entries = open ?? [];
  if (entries.length === 0) {
    return NextResponse.json({ closed: 0, companies: 0 });
  }

  // Podatki zaposlenih (za kategorijo/mejo in ime v mailu).
  const empIds = [...new Set(entries.map((e) => e.employee_id))];
  const { data: emps } = await admin
    .from("employees")
    .select("id, full_name, worker_type, birth_date")
    .in("id", empIds);
  const empById = new Map((emps ?? []).map((e) => [e.id, e]));

  // Zapri vsak vnos ob meji + zberi po podjetju za obvestilo.
  const perCompany = new Map<string, { name: string; date: string; clockIn: string }[]>();
  let closed = 0;

  const nowMs = Date.now();
  for (const e of entries) {
    if (!e.clock_in) continue;
    const emp = empById.get(e.employee_id);
    const capH = autostopHoursFor(
      workerCategory(emp?.worker_type, emp?.birth_date),
    );
    const start = new Date(e.clock_in as string);

    // Nočna izmena (npr. začetek ob 20:00) ob 4:00 še NI pozabljen odhod.
    // Zapri šele, ko je dejansko pretekla dnevna meja (sicer bi vpisali
    // odhod v prihodnosti in označili še trajajočo izmeno).
    if (nowMs - start.getTime() < capH * 3_600_000) continue;

    const capOut = new Date(start.getTime() + capH * 3_600_000);

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
    if (upErr) continue;
    closed++;

    const list = perCompany.get(e.company_id) ?? [];
    list.push({
      name: emp?.full_name ?? "Zaposleni",
      date: fmtDate(e.date),
      clockIn: fmtTime(e.clock_in as string),
    });
    perCompany.set(e.company_id, list);
  }

  // Obvesti delodajalce (en povzetek na podjetje).
  let notified = 0;
  for (const [companyId, items] of perCompany) {
    const person = await companyAdmin(companyId);
    if (!person) continue;
    const ok = await sendEmail(
      person.email,
      openEntriesAlertEmail({ fullName: person.fullName, items }),
    );
    if (ok) notified++;
  }

  return NextResponse.json({ closed, companies: perCompany.size, notified });
}
