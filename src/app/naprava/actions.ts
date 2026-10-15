"use server";

import { getAccess } from "@/lib/billing";
import { clientIp, rateBlocked, rateRecord, rateRetryAfter } from "@/lib/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { clockInEmployee, clockOutEmployee } from "@/lib/clock";
import { autostopHoursFor, isShiftRunning, workerCategory } from "@/lib/workLimits";
import {
  connectThisDevice,
  fmtTimeLj,
  getKioskDevice,
  setKioskCookie,
  sha256,
  type KioskContext,
} from "@/lib/kiosk";

// Dejanja skupne naprave. Naprava ni prijavljen uporabnik: vsako dejanje najprej
// preveri piškotek naprave (getKioskDevice), nato PIN kode izbranega zaposlenega.

const NOT_CONNECTED = "Naprava ni več povezana. Delodajalec jo lahko poveže znova.";
// Zaklep po preveč napačnih kodah: povej, koliko časa je treba počakati.
const lockedMsg = (seconds: number) =>
  `Preveč napačnih poskusov. Poskusi znova čez ${Math.max(1, Math.ceil(seconds / 60))}\u00a0min.`;

// Napačne PIN kode: največ 5 na zaposlenega in 20 na napravo v 15 minutah.
const PIN_MAX_PER_EMPLOYEE = 5;
const PIN_MAX_PER_DEVICE = 20;
const PIN_WINDOW_S = 15 * 60;

// --- Povezava naprave s kodo ------------------------------------------------------

export async function pairWithCode(rawCode: string): Promise<{ error?: string }> {
  const code = rawCode.replace(/\D/g, "");
  if (code.length !== 6) return { error: "Koda za povezavo ima 6 številk." };

  const ipKey = `kiosk-pair:${await clientIp()}`;
  if ((await rateBlocked(ipKey, 5, 15 * 60)) || (await rateBlocked("kiosk-pair:all", 200, 3600))) {
    return { error: "Preveč poskusov. Poskusi znova čez nekaj minut." };
  }

  const db = createAdminClient();
  const { data: row } = await db
    .from("kiosk_pair_codes")
    .select("company_id, expires_at")
    .eq("code_hash", sha256(code))
    .maybeSingle();
  if (!row || new Date(row.expires_at).getTime() < Date.now()) {
    await Promise.all([rateRecord(ipKey), rateRecord("kiosk-pair:all")]);
    return { error: "Koda za povezavo ni pravilna ali je potekla. V Delovitu ustvari novo." };
  }

  const { data: company } = await db
    .from("companies")
    .select("kiosk_enabled")
    .eq("id", row.company_id)
    .maybeSingle();
  if (!company?.kiosk_enabled) return { error: "Skupna naprava v podjetju ni vklopljena." };

  // Koda je enkratna.
  await db.from("kiosk_pair_codes").delete().eq("company_id", row.company_id);
  if (!(await connectThisDevice(db, row.company_id))) {
    return { error: "Povezava ni uspela. Poskusi znova." };
  }
  // Na skupni napravi ne sme ostati nihče prijavljen (npr. delodajalec, ki je
  // kodo vpisal v svojem brskalniku) — sicer bi zaposleni odprli nadzorno ploščo.
  // scope "local": odjavi SAMO ta brskalnik (privzeto bi odjavil delodajalca povsod).
  await (await createClient()).auth.signOut({ scope: "local" });
  return {};
}

// --- PIN + žigosanje --------------------------------------------------------------

type Verified =
  | { error: string; wrongPin?: boolean; disconnected?: boolean }
  | {
      ctx: KioskContext;
      employee: { id: string; company_id: string; full_name: string; worker_type: string | null; birth_date: string | null };
    };

// Preveri napravo, naročnino in PIN izbranega zaposlenega.
async function verify(employeeId: string, pin: string): Promise<Verified> {
  const ctx = await getKioskDevice();
  if (!ctx) return { error: NOT_CONNECTED, disconnected: true };
  if (!getAccess(ctx.company).hasAccess) {
    return { error: "Žigosanje trenutno ni na voljo. Obrnite se na delodajalca." };
  }

  const empKey = `kiosk-pin:${employeeId}`;
  const devKey = `kiosk-pin-dev:${ctx.deviceId}`;
  const lockedFor = async () =>
    Math.max(
      await rateRetryAfter(empKey, PIN_MAX_PER_EMPLOYEE, PIN_WINDOW_S),
      await rateRetryAfter(devKey, PIN_MAX_PER_DEVICE, PIN_WINDOW_S),
    );
  const wait = await lockedFor();
  if (wait > 0) return { error: lockedMsg(wait) };

  const [{ data: employee }, { data: pinRow }] = await Promise.all([
    ctx.db
      .from("employees")
      .select("id, company_id, full_name, worker_type, birth_date, active")
      .eq("id", employeeId)
      .eq("company_id", ctx.company.id)
      .maybeSingle(),
    ctx.db
      .from("kiosk_pins")
      .select("pin")
      .eq("employee_id", employeeId)
      .eq("company_id", ctx.company.id)
      .maybeSingle(),
  ]);
  if (!employee || !employee.active) return { error: "Zaposleni ni najden." };
  if (!pinRow || !/^\d{4}$/.test(pin) || pinRow.pin !== pin) {
    await Promise.all([rateRecord(empKey), rateRecord(devKey)]);
    // Ta poskus je bil zadnji dovoljeni → takoj povej, koliko je treba počakati.
    const waitNow = await lockedFor();
    if (waitNow > 0) return { error: lockedMsg(waitNow), wrongPin: true };
    return { error: "Napačna osebna koda. Poskusi znova.", wrongPin: true };
  }
  return { ctx, employee };
}

export type KioskStatus = { error?: string; wrongPin?: boolean; disconnected?: boolean; name?: string; openSince?: string | null };

// Po pravilni kodi: ali je zaposleni danes že na delu (→ pokažemo Prihod ali Odhod).
export async function checkPin(employeeId: string, pin: string): Promise<KioskStatus> {
  const v = await verify(employeeId, pin);
  if ("error" in v) return v;
  // Izmena v teku = odprt vnos, mlajši od dnevne meje (tudi čez polnoč).
  const { data: open } = await v.ctx.db
    .from("time_entries")
    .select("clock_in")
    .eq("employee_id", v.employee.id)
    .is("clock_out", null)
    .order("clock_in", { ascending: false });
  const capH = autostopHoursFor(workerCategory(v.employee.worker_type, v.employee.birth_date));
  const running = (open ?? []).find((e) => isShiftRunning(e.clock_in, capH));
  return { name: v.employee.full_name, openSince: running?.clock_in ?? null };
}

export type KioskClockResult = { error?: string; stale?: boolean; wrongPin?: boolean; disconnected?: boolean; time?: string; hours?: number; capped?: boolean };

export async function kioskClock(
  employeeId: string,
  pin: string,
  action: "in" | "out",
  breakMinutes?: number,
): Promise<KioskClockResult> {
  const v = await verify(employeeId, pin);
  if ("error" in v) return v;
  const { ctx, employee } = v;

  const res =
    action === "in"
      ? await clockInEmployee(ctx.db, employee, "naprava")
      : await clockOutEmployee(ctx.db, employee, breakMinutes);
  if (res.error) return { error: res.error, stale: res.stale };

  // Naprava je v uporabi: zabeleži in podaljšaj piškotek (sicer bi po ~letu potekel).
  await ctx.db.from("kiosk_devices").update({ last_used_at: new Date().toISOString() }).eq("id", ctx.deviceId);
  await setKioskCookie(ctx.token);

  return { time: res.at ? fmtTimeLj(res.at) : undefined, hours: res.hours, capped: res.capped };
}
