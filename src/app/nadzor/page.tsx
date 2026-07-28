import { redirect, notFound } from "next/navigation";
import { Building2, Users, Sparkles, RefreshCw } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSuperadmin } from "@/lib/superadmin";
import { Aurora } from "@/components/Aurora";
import { Wordmark, Badge, Card } from "@/components/ui";
import { signOut } from "../(auth)/actions";
import { todayLjubljana, shiftDays } from "@/lib/tzdate";
import { ExportCsvButton, type CsvRow } from "./ExportCsvButton";

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
  employees: { count: number }[] | null;
  time_entries: { created_at: string }[] | null;
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
  const { data } = await admin
    .from("companies")
    .select(
      "id, name, tax_id, subscription_status, created_at, trial_ends_at, current_period_end, stripe_customer_id, users(id, full_name, email, role), employees(count), time_entries(created_at)",
    )
    .order("created_at", { ascending: false })
    .order("created_at", { referencedTable: "time_entries", ascending: false })
    .limit(1, { referencedTable: "time_entries" });
  const companies = (data ?? []) as unknown as CompanyRow[];

  // Zadnja prijava adminov (auth.users.last_sign_in_at) — en zajem, mapiran po id.
  const lastLogin = new Map<string, string | null>();
  for (let page = 1; ; page++) {
    const { data: au, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) break;
    for (const u of au.users) lastLogin.set(u.id, u.last_sign_in_at ?? null);
    if (au.users.length < 200) break;
  }

  const rows = companies.map((c) => {
    const adm = (c.users ?? []).find((u) => u.role === "admin") ?? (c.users ?? [])[0] ?? null;
    const empCount = c.employees?.[0]?.count ?? 0;
    const st = STATUS[c.subscription_status] ?? { label: c.subscription_status, tone: "slate" as const };
    // Podnapis statusa: dnevi preizkusa / plačnik / brezplačen dostop
    let statusSub = "";
    if (c.subscription_status === "trialing") {
      const d = daysLeft(c.trial_ends_at);
      statusSub = d != null ? (d >= 0 ? `še ${d} dni` : "poteklo") : "";
    } else if (c.subscription_status === "active") {
      statusSub = c.stripe_customer_id ? "plačnik" : "brezplačen dostop";
    }
    const until =
      c.subscription_status === "trialing" ? c.trial_ends_at : c.current_period_end;

    // Zadnja aktivnost = najkasnejše od (zadnja prijava admina, zadnji vnos ur).
    const lastEntry = c.time_entries?.[0]?.created_at ?? null;
    const adminLogin = adm ? lastLogin.get(adm.id) ?? null : null;
    const hasEntries = (c.time_entries ?? []).length > 0;
    const activityIso =
      [lastEntry, adminLogin].filter(Boolean).sort().slice(-1)[0] ?? null; // ISO nizi so leksikografsko urejeni
    const activityDays = activityIso
      ? Math.floor((Date.now() - Date.parse(activityIso)) / 86400000)
      : null;
    const activityLabel = activityIso ? relLabel(activityIso) || fmtDate(activityIso) : "—";
    const activityTone: "green" | "slate" | "muted" =
      activityDays == null ? "muted" : activityDays <= 7 ? "green" : activityDays <= 30 ? "slate" : "muted";

    return {
      id: c.id,
      name: c.name,
      taxId: c.tax_id ?? "",
      adminName: adm?.full_name ?? "—",
      adminEmail: adm?.email ?? "—",
      empCount,
      statusLabel: st.label,
      statusTone: st.tone,
      statusSub,
      until,
      created: c.created_at,
      rel: relLabel(c.created_at),
      isToday: relLabel(c.created_at) === "danes",
      activityLabel,
      activityTone,
      hasEntries,
    };
  });

  const total = rows.length;
  const trialing = rows.filter((r) => companies.find((c) => c.id === r.id)?.subscription_status === "trialing").length;
  const active = rows.filter((r) => companies.find((c) => c.id === r.id)?.subscription_status === "active").length;
  const todayCount = rows.filter((r) => r.isToday).length;

  const csvRows: CsvRow[] = rows.map((r) => ({
    company: r.name,
    taxId: r.taxId,
    admin: r.adminName,
    email: r.adminEmail,
    employees: r.empCount,
    status: r.statusLabel + (r.statusSub ? ` (${r.statusSub})` : ""),
    until: fmtDate(r.until),
    registered: fmtDate(r.created),
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
              <RefreshCw className="h-3.5 w-3.5" /> V živo · osveženo {fmtTime()} (osveži z F5)
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
              {/* Desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-white/45 text-slate-500">
                    <tr>
                      <Th>Podjetje</Th>
                      <Th>Admin</Th>
                      <Th right>Zaposleni</Th>
                      <Th>Status</Th>
                      <Th>Naročnina do</Th>
                      <Th>Registrirano</Th>
                      <Th>Zadnja aktivnost</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rows.map((r) => (
                      <tr key={r.id} className={"transition hover:bg-white/45 " + (r.isToday ? "bg-brand-50/40" : "")}>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-slate-900">{r.name}</p>
                          {r.taxId && <p className="text-xs text-slate-400">Davčna {r.taxId}</p>}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-slate-700">{r.adminName}</p>
                          <p className="text-xs text-slate-400">{r.adminEmail}</p>
                        </td>
                        <td className="px-4 py-3.5 text-right tabular-nums text-slate-700">{r.empCount}</td>
                        <td className="px-4 py-3.5">
                          <Badge tone={r.statusTone}>{r.statusLabel}</Badge>
                          {r.statusSub && <p className="mt-0.5 text-xs text-slate-400">{r.statusSub}</p>}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{fmtDate(r.until)}</td>
                        <td className="px-4 py-3.5">
                          <span className="text-slate-700">{fmtDate(r.created)}</span>
                          {r.rel && <span className="ml-1.5 text-xs text-slate-400">· {r.rel}</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={
                              "font-medium " +
                              (r.activityTone === "green"
                                ? "text-emerald-600"
                                : r.activityTone === "slate"
                                  ? "text-slate-600"
                                  : "text-slate-400")
                            }
                          >
                            {r.activityLabel}
                          </span>
                          {!r.hasEntries && (
                            <p className="mt-0.5 text-xs font-medium text-amber-600">brez vnosov</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobilno / ozko */}
              <ul className="divide-y divide-slate-100 lg:hidden">
                {rows.map((r) => (
                  <li key={r.id} className={"p-4 " + (r.isToday ? "bg-brand-50/40" : "")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{r.name}</p>
                        <p className="truncate text-sm text-slate-500">{r.adminName} · {r.adminEmail}</p>
                      </div>
                      <Badge tone={r.statusTone}>{r.statusLabel}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
                      {r.taxId && <span>Davčna {r.taxId}</span>}
                      <span>{r.empCount} zaposlenih</span>
                      {r.statusSub && <span>{r.statusSub}</span>}
                      <span>Registriran {fmtDate(r.created)}{r.rel ? ` · ${r.rel}` : ""}</span>
                      <span
                        className={
                          r.activityTone === "green"
                            ? "font-semibold text-emerald-600"
                            : !r.hasEntries
                              ? "font-semibold text-amber-600"
                              : "text-slate-500"
                        }
                      >
                        Aktivnost: {r.activityLabel}{!r.hasEntries ? " · brez vnosov" : ""}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
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

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={"px-4 py-3 text-xs font-semibold uppercase tracking-wide " + (right ? "text-right" : "")}>
      {children}
    </th>
  );
}
