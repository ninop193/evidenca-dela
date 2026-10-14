import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensurePins } from "@/lib/kiosk";
import { KioskSettings } from "./KioskSettings";

// Nastavitve skupne tablice (neobvezna možnost; privzeto izklopljena).
export default async function TablicaSettingsPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") redirect("/login");

  // PIN kode in tablice so v tabelah, ki jih bere samo strežnik — zato admin odjemalec,
  // VEDNO filtriran po podjetju prijavljenega delodajalca.
  const db = createAdminClient();
  const companyId = profile.company_id;
  const { data: company } = await db.from("companies").select("kiosk_enabled").eq("id", companyId).single();
  const enabled = !!company?.kiosk_enabled;

  let employees: { id: string; name: string; pin: string | null }[] = [];
  let devices: { id: string; createdAt: string; lastUsedAt: string | null }[] = [];
  if (enabled) {
    const pins = await ensurePins(db, companyId);
    const [{ data: emps }, { data: devs }] = await Promise.all([
      db
        .from("employees")
        .select("id, full_name")
        .eq("company_id", companyId)
        .eq("active", true)
        .order("full_name", { ascending: true }),
      db
        .from("kiosk_devices")
        .select("id, created_at, last_used_at")
        .eq("company_id", companyId)
        .is("revoked_at", null)
        .order("created_at", { ascending: true }),
    ]);
    employees = (emps ?? []).map((e) => ({ id: e.id, name: e.full_name, pin: pins.get(e.id) ?? null }));
    devices = (devs ?? []).map((d) => ({ id: d.id, createdAt: d.created_at, lastUsedAt: d.last_used_at }));
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/dashboard/zaposleni" className="text-sm text-slate-500 hover:text-slate-900">
        ← Zaposleni
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Skupna tablica</h1>
      <p className="mt-1 text-sm text-slate-500">
        Zaposleni žigosajo na eni napravi na delovnem mestu: pritisnejo svoje ime in vpišejo osebno kodo.
        Žigosanje s telefonom deluje naprej kot doslej.
      </p>
      <KioskSettings enabled={enabled} employees={employees} devices={devices} />
    </main>
  );
}
