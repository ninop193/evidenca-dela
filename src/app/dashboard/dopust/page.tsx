import { Sun, BellRing, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card } from "@/components/ui";
import { hoursToDays, fmtDays } from "@/lib/leave";
import { todayLjubljana } from "@/lib/tzdate";
import { LeaveDecisionButtons } from "./LeaveDecisionButtons";

const fmtRange = (from: string, to: string) => {
  const f = new Intl.DateTimeFormat("sl-SI", { day: "numeric", month: "numeric", year: "numeric" });
  const a = f.format(new Date(`${from}T12:00:00Z`));
  const b = f.format(new Date(`${to}T12:00:00Z`));
  return from === to ? a : `${a} – ${b}`;
};

type Pending = {
  id: string;
  employee_id: string;
  date_from: string;
  date_to: string;
  days: number;
  employee_note: string | null;
  employees: { full_name: string } | null;
};

type Emp = {
  id: string;
  full_name: string;
  weekly_hours: number | null;
  annual_leave_days: number | null;
};

export default async function DopustPage() {
  const supabase = await createClient();
  const year = todayLjubljana().slice(0, 4);

  const [{ data: pendingData }, { data: empData }, { data: absData }] = await Promise.all([
    supabase
      .from("leave_requests")
      .select("id, employee_id, date_from, date_to, days, employee_note, employees(full_name)")
      .eq("status", "pending")
      .order("date_from", { ascending: true }),
    supabase
      .from("employees")
      .select("id, full_name, weekly_hours, annual_leave_days")
      .eq("worker_type", "zaposlen")
      .eq("active", true)
      .order("full_name", { ascending: true }),
    supabase
      .from("absences")
      .select("employee_id, unworked_hours")
      .eq("compensation_type", "letni_dopust")
      .gte("date_from", `${year}-01-01`)
      .lte("date_from", `${year}-12-31`),
  ]);

  const pending = (pendingData ?? []) as unknown as Pending[];
  const employees = (empData ?? []) as Emp[];

  // Porabljeni dnevi po zaposlenem (iz zakonske evidence odsotnosti).
  const empById = new Map(employees.map((e) => [e.id, e]));
  const usedByEmp = new Map<string, number>();
  for (const a of absData ?? []) {
    const e = empById.get(a.employee_id as string);
    if (!e) continue;
    const d = hoursToDays(Number(a.unworked_hours) || 0, e.weekly_hours);
    usedByEmp.set(e.id, (usedByEmp.get(e.id) ?? 0) + d);
  }
  // Dnevi v obravnavi po zaposlenem (iz čakajočih prošenj tega leta).
  const pendingByEmp = new Map<string, number>();
  for (const p of pending) {
    if (p.date_from.slice(0, 4) !== year) continue;
    pendingByEmp.set(p.employee_id, (pendingByEmp.get(p.employee_id) ?? 0) + (Number(p.days) || 0));
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-600">
          <Sun className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dopust</h1>
          <p className="text-sm text-slate-500">Prošnje za dopust in stanje po zaposlenih ({year}).</p>
        </div>
      </div>

      {/* Prošnje, ki čakajo na odločitev */}
      {pending.length > 0 ? (
        <section className="mt-6 overflow-hidden rounded-2xl bg-amber-50/80 ring-1 ring-amber-200/80">
          <div className="flex items-center gap-2.5 px-5 pb-3 pt-4">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500 text-white">
              <BellRing className="h-4 w-4" />
            </span>
            <h2 className="font-bold text-amber-900">
              Prošnje za dopust: {pending.length}{" "}
              {pending.length === 1 ? "čaka" : "čakajo"} na tvojo odločitev
            </h2>
          </div>
          <ul className="divide-y divide-amber-200/60 border-t border-amber-200/60 bg-white/60">
            {pending.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {p.employees?.full_name ?? "—"}
                    <span className="ml-2 font-normal text-slate-500">
                      {fmtRange(p.date_from, p.date_to)}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {fmtDays(Number(p.days))} {Number(p.days) === 1 ? "delovni dan" : "delovnih dni"}
                    {p.employee_note && <span className="text-slate-400"> · {p.employee_note}</span>}
                  </p>
                </div>
                <LeaveDecisionButtons id={p.id} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="mt-6 flex items-center gap-2.5 rounded-2xl bg-emerald-50/70 px-5 py-3.5 ring-1 ring-emerald-200/70">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-900">
            Nobena prošnja za dopust ne čaka na odločitev.
          </p>
        </div>
      )}

      {/* Stanje dopusta po zaposlenih (samo redno zaposleni) */}
      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Stanje po zaposlenih
      </h2>
      <div className="mt-3">
        {employees.length === 0 ? (
          <Card className="px-6 py-10 text-center text-sm text-slate-500">
            Ni redno zaposlenih. Dopust velja samo zanje (ne za študente/dijake).
          </Card>
        ) : (
          <Card className="overflow-hidden">
            {/* Desktop tabela */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-white/45 text-slate-500">
                  <tr>
                    <Th>Zaposleni</Th>
                    <Th right>Kvota</Th>
                    <Th right>Porabljeno</Th>
                    <Th right>V obravnavi</Th>
                    <Th right>Ostane</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.map((e) => {
                    const used = usedByEmp.get(e.id) ?? 0;
                    const pend = pendingByEmp.get(e.id) ?? 0;
                    const quota = e.annual_leave_days == null ? null : Number(e.annual_leave_days);
                    const remaining = quota == null ? null : quota - used;
                    return (
                      <tr key={e.id} className="transition hover:bg-white/45">
                        <td className="px-4 py-3.5 font-medium text-slate-900">{e.full_name}</td>
                        <td className="px-4 py-3.5 text-right tabular-nums text-slate-600">
                          {quota == null ? "—" : fmtDays(quota)}
                        </td>
                        <td className="px-4 py-3.5 text-right tabular-nums text-slate-600">{fmtDays(used)}</td>
                        <td className="px-4 py-3.5 text-right tabular-nums text-amber-600">
                          {pend > 0 ? fmtDays(pend) : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {remaining == null ? (
                            <span className="text-slate-400">nastavi kvoto</span>
                          ) : (
                            <span
                              className={
                                "font-semibold tabular-nums " +
                                (remaining <= 0 ? "text-rose-600" : "text-slate-900")
                              }
                            >
                              {fmtDays(Math.max(0, remaining))}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobilne kartice */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {employees.map((e) => {
                const used = usedByEmp.get(e.id) ?? 0;
                const pend = pendingByEmp.get(e.id) ?? 0;
                const quota = e.annual_leave_days == null ? null : Number(e.annual_leave_days);
                const remaining = quota == null ? null : quota - used;
                return (
                  <li key={e.id} className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-semibold text-slate-900">{e.full_name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Kvota {quota == null ? "—" : fmtDays(quota)} · porabljeno {fmtDays(used)}
                        {pend > 0 && ` · v obravnavi ${fmtDays(pend)}`}
                      </p>
                    </div>
                    {remaining == null ? (
                      <Badge tone="slate">nastavi kvoto</Badge>
                    ) : (
                      <span
                        className={
                          "text-sm font-bold tabular-nums " +
                          (remaining <= 0 ? "text-rose-600" : "text-slate-900")
                        }
                      >
                        {fmtDays(Math.max(0, remaining))} dni
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>
    </main>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={"px-4 py-3 text-xs font-semibold uppercase tracking-wide " + (right ? "text-right" : "")}>
      {children}
    </th>
  );
}
