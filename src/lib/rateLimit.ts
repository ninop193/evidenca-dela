import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

// Preprosta omejitev pogostosti (zaščita pred boti / zlorabo pošiljanja mailov).
// Dogodke beleži v tabelo rate_events (migracija 0012, dostop samo service role).
// Vrne true, če je dejanje dovoljeno (in ga hkrati zabeleži), false, če je meja dosežena.
// Če tabela (še) ne obstaja ali baza vrne napako, dejanje DOVOLI — da napaka v
// omejevalniku nikoli ne podre registracije ali dodajanja zaposlenih.
export async function rateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count, error } = await admin
    .from("rate_events")
    .select("id", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", since);
  if (error) {
    console.error("rateLimit: branje spodletelo:", error.message);
    return true;
  }
  if ((count ?? 0) >= max) return false;
  const { error: insErr } = await admin.from("rate_events").insert({ key });
  if (insErr) console.error("rateLimit: zapis spodletel:", insErr.message);
  return true;
}

// Ločeno štetje NEUSPELIH poskusov (npr. napačna PIN koda): rateBlocked samo
// preveri, ali je meja dosežena (nič ne zapiše), rateRecord zabeleži neuspeh.
// Uspešni poskusi se tako ne štejejo in pravega uporabnika ne zaklenejo.
// Ob napaki baze (kot zgoraj) dejanje DOVOLI.
export async function rateBlocked(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count, error } = await admin
    .from("rate_events")
    .select("id", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", since);
  if (error) {
    console.error("rateBlocked: branje spodletelo:", error.message);
    return false;
  }
  return (count ?? 0) >= max;
}

export async function rateRecord(key: string): Promise<void> {
  const { error } = await createAdminClient().from("rate_events").insert({ key });
  if (error) console.error("rateRecord: zapis spodletel:", error.message);
}

// IP obiskovalca (Vercel ga nastavi v x-real-ip / x-forwarded-for).
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
