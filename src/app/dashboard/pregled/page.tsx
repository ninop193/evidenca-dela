import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import MonthActions from "./MonthActions";

const TZ = "Europe/Ljubljana";

const currentMonth = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" })
    .format(new Date())
    .slice(0, 7);

function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("sl-SI", { month: "long", year: "numeric" }).format(
    new Date(y, m - 1, 1),
  );
}

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthBounds(month: string) {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return { first: `${month}-01`, last: `${month}-${String(lastDay).padStart(2, "0")}` };
}

const fmtDate = (d: string) =>
  new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, weekday: "short", day: "numeric", month: "numeric" }).format(
    new Date(d + "T00:00:00"),
  );
const fmtTime = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(
        new Date(iso),
      )
    : "—";

type Entry = {
  id: string;
  employee_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  total_worked_hours: number | null;
  overtime_hours: number | null;
  night_hours: number | null;
  sunday_hours: number | null;
  holiday_hours: number | null;
  confirmed: boolean;
};

const sum = (arr: Entry[], key: keyof Entry) =>
  arr.reduce((acc, e) => acc + (Number(e[key]) || 0), 0);

export default async function MonthlyOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/zigosanje");

  const sp = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(sp.month ?? "") ? sp.month! : currentMonth();
  const bounds = monthBounds(month);

  const supabase = await createClient();
  const [{ data: employees }, { data: entriesRaw }] = await Promise.all([
    supabase.from("employees").select("id, full_name").order("full_name"),
    supabase
      .from("time_entries")
      .select(
        "id, employee_id, date, clock_in, clock_out, total_worked_hours, overtime_hours, night_hours, sunday_hours, holiday_hours, confirmed",
      )
      .gte("date", bounds.first)
      .lte("date", bounds.last)
      .order("date", { ascending: true }),
  ]);

  const entries = (entriesRaw ?? []) as Entry[];
  const byEmployee = new Map<string, Entry[]>();
  for (const e of entries) {
    if (!byEmployee.has(e.employee_id)) byEmployee.set(e.employee_id, []);
    byEmployee.get(e.employee_id)!.push(e);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
            ← Nazaj
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Mesečni pregled</h1>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Mesečna navigacija */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <Link
            href={`/dashboard/pregled?month=${shiftMonth(month, -1)}`}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            ← Prejšnji
          </Link>
          <span className="min-w-44 text-center text-base font-semibold capitalize text-slate-900">
            {monthLabel(month)}
          </span>
          <Link
            href={`/dashboard/pregled?month=${shiftMonth(month, 1)}`}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            Naslednji →
          </Link>
        </div>

        {!employees || employees.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            Najprej dodaj zaposlene.
          </p>
        ) : (
          <div className="space-y-6">
            {employees.map((emp) => {
              const list = byEmployee.get(emp.id) ?? [];
              const allConfirmed = list.length > 0 && list.every((e) => e.confirmed);
              return (
                <section key={emp.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <h2 className="font-semibold text-slate-900">{emp.full_name}</h2>
                    <MonthActions
                      employeeId={emp.id}
                      month={month}
                      confirmed={allConfirmed}
                      hasEntries={list.length > 0}
                    />
                  </div>

                  {list.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-slate-400">
                      Ni vnosov za ta mesec.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-slate-500">
                          <tr className="border-b border-slate-100">
                            <th className="px-4 py-2 font-medium">Dan</th>
                            <th className="px-4 py-2 font-medium">Prihod</th>
                            <th className="px-4 py-2 font-medium">Odhod</th>
                            <th className="px-4 py-2 font-medium text-right">Ure</th>
                            <th className="px-4 py-2 font-medium text-right">Nad.</th>
                            <th className="px-4 py-2 font-medium text-right">Noč.</th>
                            <th className="px-4 py-2 font-medium text-right">Ned.</th>
                            <th className="px-4 py-2 font-medium text-right">Prazn.</th>
                            <th className="px-4 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {list.map((e) => (
                            <tr key={e.id}>
                              <td className="px-4 py-2 text-slate-700">{fmtDate(e.date)}</td>
                              <td className="px-4 py-2 text-slate-600">{fmtTime(e.clock_in)}</td>
                              <td className="px-4 py-2 text-slate-600">{fmtTime(e.clock_out)}</td>
                              <td className="px-4 py-2 text-right font-medium text-slate-900">
                                {(e.total_worked_hours ?? 0).toFixed(2)}
                              </td>
                              <td className="px-4 py-2 text-right text-slate-600">{(e.overtime_hours ?? 0).toFixed(2)}</td>
                              <td className="px-4 py-2 text-right text-slate-600">{(e.night_hours ?? 0).toFixed(2)}</td>
                              <td className="px-4 py-2 text-right text-slate-600">{(e.sunday_hours ?? 0).toFixed(2)}</td>
                              <td className="px-4 py-2 text-right text-slate-600">{(e.holiday_hours ?? 0).toFixed(2)}</td>
                              <td className="px-4 py-2 text-right">
                                <Link
                                  href={`/dashboard/ure/${e.id}`}
                                  className="text-xs font-medium text-slate-500 underline hover:text-slate-900"
                                >
                                  uredi
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
                            <td className="px-4 py-2" colSpan={3}>
                              Skupaj
                            </td>
                            <td className="px-4 py-2 text-right">{sum(list, "total_worked_hours").toFixed(2)}</td>
                            <td className="px-4 py-2 text-right">{sum(list, "overtime_hours").toFixed(2)}</td>
                            <td className="px-4 py-2 text-right">{sum(list, "night_hours").toFixed(2)}</td>
                            <td className="px-4 py-2 text-right">{sum(list, "sunday_hours").toFixed(2)}</td>
                            <td className="px-4 py-2 text-right">{sum(list, "holiday_hours").toFixed(2)}</td>
                            <td className="px-4 py-2"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
