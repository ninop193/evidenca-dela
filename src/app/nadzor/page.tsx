import { redirect, notFound } from "next/navigation";
import { Building2, Users, Sparkles, RefreshCw } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSuperadmin } from "@/lib/superadmin";
import { Aurora } from "@/components/Aurora";
import { Wordmark, Card } from "@/components/ui";
import { signOut } from "../(auth)/actions";
import { todayLjubljana, shiftDays } from "@/lib/tzdate";
import { ExportCsvButton, type CsvRow } from "./ExportCsvButton";
import { NadzorTable, type Row, type EmpRow } from "./NadzorTable";

export const metadata = { robots: { index: false, follow: false }, title: "Nadzor" };
export const dynamic = "force-dynamic";

const TZ = "Europe/Ljubljana";
const fmtDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, day: "numeric", month: "numeric", year: "numeric" }).format(new Date(iso))
    : "—";
const fmtTime = () =>
  new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date());

// "danes" / "včeraj" / "pred N dnevi" iz časovnega žiga.
function relLabel(iso: string): string {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
  const today = todayLjubljana();
  if (day === today) return "danes";
  if (day === shiftDays(today, -1)) return "včeraj";
  const diff = Math.round((Date.parse(today + "T12:00:00Z") - Date.parse(day + "T12:00:00Z")) / 86400000);
  return diff > 1 && diff < 60 ? `pred ${diff} dnevi` : "";
}
function daysLeft(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((Date.parse(iso) - Date.now()) / 86400000);
}
// Barvni ton glede na starost aktivnosti: zeleno ≤7 dni, sivo ≤30, sicer medlo.
function toneOf(iso: string | null): "green" | "slate" | "muted" {
  if (!iso) return "muted";
  const d = Math.floor((Date.now() - Date.parse(iso)) / 86400000);
  return d <= 7 ? "green" : d <= 30 ? "slate" : "muted";
}

const STATUS: Record<string, { label: string; tone: "amber" | "green" | "red" | "slate" }> = {
  trialing: { label: "V preizkusu", tone: "amber" },
  active: { label: "Aktivno", tone: "green" },
  past_due: { label: "Zapadlo", tone: "red" },
  canceled: { label: "Odpovedano", tone: "slate" },
  inactive: { label: "Neaktivno", tone: "slate" },
};

type CompanyRow = {
  id: string;
  name: string;
  tax_id: string | null;
  subscription_status: string;
  created_at: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  users: { id: string; full_name: string | null; email: string | null; role: string }[] | null;
  time_entries: { created_at: string }[] | null;
};
type EmployeeRec = {
  id: string;
  company_id: string;
  full_name: string | null;
  worker_type: string | null;
  user_id: string | null;
  active: boolean | null;
  created_at: string;
};

export default async function NadzorPage() {
  // 1) Prijava obvezna
  const profile = await getProfile();
  if (!profile) redirect("/login");
  // 2) Avtoritativni email iz seje + preverba superadmina; sicer 404 (skrijemo obstoj)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email ?? profile.email;
  if (!isSuperadmin(email)) notFound();

  // 3) Podatki (service role — obide RLS, samo strežnik)
  const admin = createAdminClient();
  const [{ data: coData }, { data: empData }, { data: teAll }] = await Promise.all([
    admin
      .from("companies")
      .select(
        "id, name, tax_id, subscription_status, created_at, trial_ends_at, current_period_end, stripe_customer_id, users(id, full_name, email, role), time_entries(created_at)",
      )
      .order("created_at", { ascending: false })
      .order("created_at", { referencedTable: "time_entries", ascending: false })
      .limit(1, { referencedTable: "time_entries" }),
    admin
      .from("employees")
      .select("id, company_id, full_name, worker_type, user_id, active, created_at")
      .order("full_name", { ascending: true }),
    // Vsi vnosi ur (2 stolpca) — za zadnje žigosanje na zaposlenega. Urejeno padajoče,
    // prvi po zaposlenem = najnovejši. (Za večji obseg kasneje RPC z max(created_at).)
    admin.from("time_entries").select("employee_id, created_at").order("created_at", { ascending: false }),
  ]);
  const companies = (coData ?? []) as unknown as CompanyRow[];
  const employees = (empData ?? []) as EmployeeRec[];

  // Zadnja prijava po uporabniku (auth.users.last_sign_in_at) — velja za admine IN zaposlene.
  const lastLogin = new Map<string, string | null>();
  for (let page = 1; ; page++) {
    const { data: au, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) break;
    for (const u of au.users) lastLogin.set(u.id, u.last_sign_in_at ?? null);
    if (au.users.length < 200) break;
  }
  // Zadnje žigosanje po zaposlenem.
  const lastClock = new Map<string, string>();
  for (const t of teAll ?? []) {
    const eid = (t as { employee_id: string | null }).employee_id;
    if (eid && !lastClock.has(eid)) lastClock.set(eid, (t as { created_at: string }).created_at);
  }

  // Zaposleni po podjetju (z izračunanim prikazom prijave/žigosanja/statusa).
  const empByCompany = new Map<string, EmpRow[]>();
  for (const e of employees) {
    const login = e.user_id ? lastLogin.get(e.user_id) ?? null : null;
    const clock = lastClock.get(e.id) ?? null;
    const statusEmp = !e.active
      ? { label: "Deaktiviran", tone: "slate" as const }
      : login || clock
        ? { label: "Aktiven", tone: "green" as const }
        : { label: "Čaka na prijavo", tone: "amber" as const };
    const row: EmpRow = {
      name: e.full_name ?? "—",
      workerLabel: e.worker_type === "student" ? "Študent" : "Zaposlen",
      statusLabel: statusEmp.label,
      statusTone: statusEmp.tone,
      loginLabel: login ? relLabel(login) || fmtDate(login) : "nikoli",
      loginTone: toneOf(login),
      clockLabel: clock ? relLabel(clock) || fmtDate(clock) : "—",
      clockTone: toneOf(clock),
    };
    const arr = empByCompany.get(e.company_id) ?? [];
    arr.push(row);
    empByCompany.set(e.company_id, arr);
  }

  const rows: Row[] = companies.map((c) => {
    const adm = (c.users ?? []).find((u) => u.role === "admin") ?? (c.users ?? [])[0] ?? null;
    const emps = empByCompany.get(c.id) ?? [];
    const st = STATUS[c.subscription_status] ?? { label: c.subscription_status, tone: "slate" as const };
    let statusSub = "";
    if (c.subscription_status === "trialing") {
      const d = daysLeft(c.trial_ends_at);
      statusSub = d != null ? (d >= 0 ? `še ${d} dni` : "poteklo") : "";
    } else if (c.subscription_status === "active") {
      statusSub = c.stripe_customer_id ? "plačnik" : "brezplačen dostop";
    }
    const until = c.subscription_status === "trialing" ? c.trial_ends_at : c.current_period_end;

    // Zadnja aktivnost podjetja = najkasnejše od (zadnja prijava admina, zadnji vnos ur).
    const lastEntry = c.time_entries?.[0]?.created_at ?? null;
    const adminLogin = adm ? lastLogin.get(adm.id) ?? null : null;
    const hasEntries = (c.time_entries ?? []).length > 0;
    const activityIso = [lastEntry, adminLogin].filter(Boolean).sort().slice(-1)[0] ?? null;
    const activityLabel = activityIso ? relLabel(activityIso) || fmtDate(activityIso) : "—";

    return {
      id: c.id,
      name: c.name,
      taxId: c.tax_id ?? "",
      adminName: adm?.full_name ?? "—",
      adminEmail: adm?.email ?? "—",
      empCount: emps.length,
      statusLabel: st.label,
      statusTone: st.tone,
      statusSub,
      untilLabel: fmtDate(until),
      createdLabel: fmtDate(c.created_at),
      rel: relLabel(c.created_at),
      isToday: relLabel(c.created_at) === "danes",
      activityLabel,
      activityTone: toneOf(activityIso),
      hasEntries,
      employees: emps,
    };
  });

  const total = rows.length;
  const statusById = new Map(companies.map((c) => [c.id, c.subscription_status]));
  const trialing = rows.filter((r) => statusById.get(r.id) === "trialing").length;
  const active = rows.filter((r) => statusById.get(r.id) === "active").length;
  const todayCount = rows.filter((r) => r.isToday).length;

  const csvRows: CsvRow[] = rows.map((r) => ({
    company: r.name,
    taxId: r.taxId,
    admin: r.adminName,
    email: r.adminEmail,
    employees: r.empCount,
    status: r.statusLabel + (r.statusSub ? ` (${r.statusSub})` : ""),
    until: r.untilLabel,
    registered: r.createdLabel,
    activity: r.activityLabel + (r.hasEntries ? "" : " (brez vnosov)"),
  }));

  return (
    <main className="relative min-h-screen text-slate-800">
      <Aurora />

      <header className="sticky top-0 z-20 px-3 pt-3">
        <div className="glass iris-edge mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <Wordmark className="text-sm" />
            <span className="hidden rounded-full bg-slate-900/5 px-2.5 py-0.5 text-xs font-semibold text-slate-500 sm:inline">
              Nadzor
            </span>
          </div>
          <form action={signOut}>
            <button className="rounded-full bg-white/60 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-white/70 hover:bg-white/80">
              Odjava
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Registracije</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <RefreshCw className="h-3.5 w-3.5" /> V živo · osveženo {fmtTime()} (osveži z F5) · klikni podjetje za zaposlene
            </p>
          </div>
          <ExportCsvButton rows={csvRows} />
        </div>

        {/* Povzetek */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={<Building2 className="h-4 w-4" />} label="Vseh podjetij" value={total} />
          <Stat icon={<Sparkles className="h-4 w-4" />} label="V preizkusu" value={trialing} tone="amber" />
          <Stat icon={<Users className="h-4 w-4" />} label="Aktivni" value={active} tone="green" />
          <Stat icon={<Sparkles className="h-4 w-4" />} label="Danes" value={todayCount} tone="brand" />
        </div>

        {/* Tabela */}
        <div className="mt-6">
          {rows.length === 0 ? (
            <Card className="px-6 py-16 text-center text-sm text-slate-500">Še ni registracij.</Card>
          ) : (
            <Card className="overflow-hidden">
              <NadzorTable rows={rows} />
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "amber" | "green" | "brand";
}) {
  const color =
    tone === "amber" ? "text-amber-600" : tone === "green" ? "text-emerald-600" : tone === "brand" ? "text-brand-600" : "text-slate-900";
  return (
    <Card className="sheen p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {icon} {label}
      </p>
      <p className={"mt-1 text-2xl font-bold tabular-nums " + color}>{value}</p>
    </Card>
  );
}
