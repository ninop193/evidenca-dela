import "server-only";
import { createHash, randomBytes, randomInt } from "node:crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

// Žigosanje na skupni napravi (neobvezna možnost podjetja, privzeto izklopljena).
// Naprava NI prijavljen uporabnik: piškotek hrani naključen žeton naprave, baza
// (kiosk_devices) samo njegov hash. Žeton dovoli le izbiro imena + PIN + žig.

export const KIOSK_COOKIE = "delovit_naprava";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400; // brskalniki dovolijo največ ~400 dni
export const PAIR_CODE_MINUTES = 10;

type Db = ReturnType<typeof createAdminClient>;

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

// Prepovemo očitne kode (1111, 1234, 4321 …), ki bi jih sodelavec hitro uganil.
function weakPin(pin: string): boolean {
  const d = pin.split("").map(Number);
  const same = d.every((x) => x === d[0]);
  const up = d.every((x, i) => i === 0 || x === d[i - 1] + 1);
  const down = d.every((x, i) => i === 0 || x === d[i - 1] - 1);
  return same || up || down;
}

function randomPin(): string {
  for (;;) {
    const pin = String(randomInt(0, 10_000)).padStart(4, "0");
    if (!weakPin(pin)) return pin;
  }
}

// Novo (unikatno v podjetju) PIN kodo zapiše zaposlenemu; obstoječo zamenja.
export async function assignPin(db: Db, companyId: string, employeeId: string): Promise<string | null> {
  for (let i = 0; i < 20; i++) {
    const pin = randomPin();
    const { error } = await db
      .from("kiosk_pins")
      .upsert({ employee_id: employeeId, company_id: companyId, pin, created_at: new Date().toISOString() });
    if (!error) return pin;
    if (error.code !== "23505") {
      console.error("kiosk: zapis PIN kode spodletel:", error.message);
      return null;
    }
    // 23505 = koda je v podjetju že zasedena → poskusi drugo.
  }
  return null;
}

// Vsem aktivnim zaposlenim brez kode jo dodeli. Vrne employee_id → PIN.
export async function ensurePins(db: Db, companyId: string): Promise<Map<string, string>> {
  const [{ data: emps }, { data: pins }] = await Promise.all([
    db.from("employees").select("id").eq("company_id", companyId).eq("active", true),
    db.from("kiosk_pins").select("employee_id, pin").eq("company_id", companyId),
  ]);
  const map = new Map((pins ?? []).map((p) => [p.employee_id as string, p.pin as string]));
  for (const e of emps ?? []) {
    if (map.has(e.id)) continue;
    const pin = await assignPin(db, companyId, e.id);
    if (pin) map.set(e.id, pin);
  }
  return map;
}

// Poveže TO napravo kot skupno napravo podjetja (nastavi piškotek).
// Klicati samo iz server action (piškotek se lahko nastavi le tam).
export async function connectThisDevice(db: Db, companyId: string): Promise<boolean> {
  const token = randomBytes(32).toString("base64url");
  const { error } = await db.from("kiosk_devices").insert({ company_id: companyId, token_hash: sha256(token) });
  if (error) {
    console.error("kiosk: povezava naprave spodletela:", error.message);
    return false;
  }
  await setKioskCookie(token);
  return true;
}

export async function setKioskCookie(token: string) {
  (await cookies()).set(KIOSK_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export type KioskContext = {
  db: Db;
  deviceId: string;
  token: string;
  company: {
    id: string;
    name: string;
    subscription_status: string | null;
    trial_ends_at: string | null;
    current_period_end: string | null;
  };
};

// Skupna naprava, ki ji pripada ta brskalnik (ali null: ni povezana, odklopljena ali je
// podjetje žigosanje na napravi izklopilo).
export async function getKioskDevice(): Promise<KioskContext | null> {
  const token = (await cookies()).get(KIOSK_COOKIE)?.value;
  if (!token) return null;
  const db = createAdminClient();
  const { data: device } = await db
    .from("kiosk_devices")
    .select("id, company_id, revoked_at")
    .eq("token_hash", sha256(token))
    .maybeSingle();
  if (!device || device.revoked_at) return null;
  const { data: company } = await db
    .from("companies")
    .select("id, name, kiosk_enabled, subscription_status, trial_ends_at, current_period_end")
    .eq("id", device.company_id)
    .maybeSingle();
  if (!company?.kiosk_enabled) return null;
  return { db, deviceId: device.id, token, company };
}

// Ura + datum po slovenskem času (za potrdilo na napravi).
export const fmtTimeLj = (iso: string) =>
  new Intl.DateTimeFormat("sl-SI", { timeZone: "Europe/Ljubljana", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );
