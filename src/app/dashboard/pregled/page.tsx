import Link from "next/link";
import { Download, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, buttonClasses } from "@/components/ui";
import MonthActions from "./MonthActions";

const TZ = "Europe/Ljubljana";

const currentMonth = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" })
    .format(new Date())
    .slice(0, 7);

function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("sl-SI", { month: "long", year: "numeric" }).format(new Date(y, m - 1, 1));
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
  iso ? new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "—";

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
const sum = (arr: Entry[], key: keyof Entry) => arr.reduce((acc, e) => acc + (Number(e[key]) || 0), 0);

export default async function MonthlyOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const profile = await getProfile();
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

  void profile;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mesečni pregled</h1>
          <p className="mt-1 text-sm text-slate-500">Seštevki, potrjevanje in izvoz evidence.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/dashboard/pregled/excel?month=${month}`} className={buttonClasses("secondary", "sm")}>
            <Download className="h-4 w-4" /> Excel
          </a>
          <Link href={`/dashboard/pregled/print?month=${month}`} className={buttonClasses("primary", "sm")}>
            <Printer className="h-4 w-4" /> PDF
          </Link>
        </div>
      </div>

      {/* Mesečna navigacija */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <Link href={`/dashboard/pregled?month=${shiftMonth(month, -1)}`} className={buttonClasses("secondary", "sm") + " !px-3"}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <span className="min-w-44 text-center text-base font-semibold capitalize text-slate-900">
          {monthLabel(month)}
        </span>
        <Link href={`/dashboard/pregled?month=${shiftMonth(month, 1)}`} className={buttonClasses("secondary", "sm") + " !px-3"}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {!employees || employees.length === 0 ? (
        <Card className="mt-6 px-6 py-16 text-center text-slate-500">Najprej dodaj zaposlene.</Card>
      ) : (
        <div className="mt-6 space-y-5">
          {employees.map((emp) => {
            const list = byEmployee.get(emp.id) ?? [];
            const allConfirmed = list.length > 0 && list.every((e) => e.confirmed);
            return (
              <Card key={emp.id} className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                  <h2 className="font-semibold text-slate-900">{emp.full_name}</h2>
                  <MonthActions employeeId={emp.id} month={month} confirmed={allConfirmed} hasEntries={list.length > 0} />
                </div>

                {list.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-slate-400">Ni vnosov za ta mesec.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-slate-500">
                        <tr className="border-b border-slate-100">
                          <Th>Dan</Th>
                          <Th>Prihod</Th>
                          <Th>Odhod</Th>
                          <Th right>Ure</Th>
                          <Th right>Nad.</Th>
                          <Th right>Noč.</Th>
                          <Th right>Ned.</Th>
                          <Th right>Prazn.</Th>
                          <Th right> </Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {list.map((e) => (
                          <tr key={e.id} className="hover:bg-white/45">
                            <td className="px-4 py-2.5 capitalize text-slate-700">{fmtDate(e.date)}</td>
                            <td className="px-4 py-2.5 text-slate-600">{fmtTime(e.clock_in)}</td>
                            <td className="px-4 py-2.5 text-slate-600">{fmtTime(e.clock_out)}</td>
                            <Num strong>{(e.total_worked_hours ?? 0).toFixed(2)}</Num>
                            <Num>{(e.overtime_hours ?? 0).toFixed(2)}</Num>
                            <Num>{(e.night_hours ?? 0).toFixed(2)}</Num>
                            <Num>{(e.sunday_hours ?? 0).toFixed(2)}</Num>
                            <Num>{(e.holiday_hours ?? 0).toFixed(2)}</Num>
                            <td className="px-4 py-2.5 text-right">
                              <Link
                                href={`/dashboard/ure/${e.id}`}
                                className="text-xs font-medium text-brand-600 hover:text-brand-700"
                              >
                                uredi
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-slate-200 bg-white/45 font-semibold text-slate-900">
                          <td className="px-4 py-2.5" colSpan={3}>
                            Skupaj
                          </td>
                          <Num strong>{sum(list, "total_worked_hours").toFixed(2)}</Num>
                          <Num strong>{sum(list, "overtime_hours").toFixed(2)}</Num>
                          <Num strong>{sum(list, "night_hours").toFixed(2)}</Num>
                          <Num strong>{sum(list, "sunday_hours").toFixed(2)}</Num>
                          <Num strong>{sum(list, "holiday_hours").toFixed(2)}</Num>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={"px-4 py-2 text-xs font-semibold uppercase tracking-wide " + (right ? "text-right" : "")}>
      {children}
    </th>
  );
}
function Num({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <td className={"px-4 py-2.5 text-right tabular-nums " + (strong ? "font-semibold text-slate-900" : "text-slate-600")}>
      {children}
    </td>
  );
}
