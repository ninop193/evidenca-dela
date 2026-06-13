import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getMonthlyReport } from "@/lib/report";
import { TYPE_LABELS, CATEGORY_LABELS } from "@/app/dashboard/odsotnosti/labels";
import PrintButton from "./PrintButton";

const TZ = "Europe/Ljubljana";
const currentMonth = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date()).slice(0, 7);
const fmtDate = (d: string) =>
  new Intl.DateTimeFormat("sl-SI", { timeZone: TZ }).format(new Date(d + "T00:00:00"));
const fmtTime = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(
        new Date(iso),
      )
    : "—";
const h = (n: number | null | undefined) => (Number(n) || 0).toFixed(2);
function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("sl-SI", { month: "long", year: "numeric" }).format(
    new Date(y, m - 1, 1),
  );
}

export default async function PrintPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/zigosanje");

  const sp = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(sp.month ?? "") ? sp.month! : currentMonth();

  const supabase = await createClient();
  const report = await getMonthlyReport(supabase, profile.company_id, month);

  return (
    <main className="bg-white text-slate-900">
      {/* Orodna vrstica — se ne natisne */}
      <div className="no-print sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 print:hidden">
        <Link href={`/dashboard/pregled?month=${month}`} className="text-sm text-slate-500 hover:text-slate-900">
          ← Nazaj na pregled
        </Link>
        <span className="text-sm text-slate-500">
          Za PDF: klikni gumb → v oknu izberi „Shrani kot PDF".
        </span>
        <PrintButton />
      </div>

      <div className="mx-auto max-w-[800px] px-6 py-6 print:px-0 print:py-0">
        {report.employees.length === 0 && (
          <p className="text-slate-500">Ni zaposlenih za izvoz.</p>
        )}

        {report.employees.map((emp, idx) => (
          <section
            key={emp.id}
            className={idx < report.employees.length - 1 ? "break-after-page" : ""}
          >
            <header className="mb-3">
              <h1 className="text-base font-bold uppercase">
                Evidenca o izrabi delovnega časa
              </h1>
              <p className="text-xs text-slate-500">18. člen ZEPDSV</p>
              <p className="mt-2 text-sm">
                <strong>{report.company.name}</strong>
                {report.company.tax_id ? `, davčna št.: ${report.company.tax_id}` : ""}
              </p>
              <p className="text-sm">Obdobje: {monthLabel(month)}</p>
            </header>

            <div className="mb-3 rounded border border-slate-300 p-2 text-xs">
              <p>
                <strong>Zaposleni:</strong> {emp.full_name}
              </p>
              <p>
                EMŠO: {emp.emso ?? "—"} &nbsp;·&nbsp; Davčna: {emp.tax_id ?? "—"} &nbsp;·&nbsp;
                Delovno mesto: {emp.job_title ?? "—"} &nbsp;·&nbsp; Tedenski delovni čas:{" "}
                {emp.weekly_hours ?? "—"} h
              </p>
              {emp.is_management && (
                <p className="mt-1 italic text-slate-500">
                  Poslovodna oseba — evidenca izrabe delovnega časa se ne vodi.
                </p>
              )}
            </div>

            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-slate-100">
                  {["Datum", "Prihod", "Odhod", "Redne", "Nad.", "Noč.", "Ned.", "Prazn.", "Izm.", "Neen.", "Zav.+"].map(
                    (c) => (
                      <th key={c} className="border border-slate-300 px-1 py-1 text-left">
                        {c}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {emp.entries.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="border border-slate-300 px-1 py-2 text-center text-slate-400">
                      Ni vnosov v tem obdobju.
                    </td>
                  </tr>
                ) : (
                  emp.entries.map((e) => (
                    <tr key={e.id}>
                      <td className="border border-slate-300 px-1 py-0.5">{fmtDate(e.date)}</td>
                      <td className="border border-slate-300 px-1 py-0.5">{fmtTime(e.clock_in)}</td>
                      <td className="border border-slate-300 px-1 py-0.5">{fmtTime(e.clock_out)}</td>
                      <td className="border border-slate-300 px-1 py-0.5 text-right">{h(e.total_worked_hours)}</td>
                      <td className="border border-slate-300 px-1 py-0.5 text-right">{h(e.overtime_hours)}</td>
                      <td className="border border-slate-300 px-1 py-0.5 text-right">{h(e.night_hours)}</td>
                      <td className="border border-slate-300 px-1 py-0.5 text-right">{h(e.sunday_hours)}</td>
                      <td className="border border-slate-300 px-1 py-0.5 text-right">{h(e.holiday_hours)}</td>
                      <td className="border border-slate-300 px-1 py-0.5 text-right">{h(e.shift_split_hours)}</td>
                      <td className="border border-slate-300 px-1 py-0.5 text-right">{h(e.unevenly_distributed_hours)}</td>
                      <td className="border border-slate-300 px-1 py-0.5 text-right">{h(e.pension_benefit_hours)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold">
                  <td className="border border-slate-300 px-1 py-1" colSpan={3}>
                    SKUPAJ
                  </td>
                  <td className="border border-slate-300 px-1 py-1 text-right">{h(emp.totals.total_worked_hours)}</td>
                  <td className="border border-slate-300 px-1 py-1 text-right">{h(emp.totals.overtime_hours)}</td>
                  <td className="border border-slate-300 px-1 py-1 text-right">{h(emp.totals.night_hours)}</td>
                  <td className="border border-slate-300 px-1 py-1 text-right">{h(emp.totals.sunday_hours)}</td>
                  <td className="border border-slate-300 px-1 py-1 text-right">{h(emp.totals.holiday_hours)}</td>
                  <td className="border border-slate-300 px-1 py-1 text-right">{h(emp.totals.shift_split_hours)}</td>
                  <td className="border border-slate-300 px-1 py-1 text-right">{h(emp.totals.unevenly_distributed_hours)}</td>
                  <td className="border border-slate-300 px-1 py-1 text-right">{h(emp.totals.pension_benefit_hours)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-3">
              <h2 className="text-xs font-bold">Odsotnosti (neopravljene ure)</h2>
              {emp.absences.length === 0 ? (
                <p className="text-[10px] text-slate-400">Ni odsotnosti v tem obdobju.</p>
              ) : (
                <table className="mt-1 w-full border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 px-1 py-1 text-left">Od</th>
                      <th className="border border-slate-300 px-1 py-1 text-left">Do</th>
                      <th className="border border-slate-300 px-1 py-1 text-right">Ure</th>
                      <th className="border border-slate-300 px-1 py-1 text-left">Vrsta</th>
                      <th className="border border-slate-300 px-1 py-1 text-left">Nadomestilo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emp.absences.map((a, i) => (
                      <tr key={i}>
                        <td className="border border-slate-300 px-1 py-0.5">{fmtDate(a.date_from)}</td>
                        <td className="border border-slate-300 px-1 py-0.5">{fmtDate(a.date_to)}</td>
                        <td className="border border-slate-300 px-1 py-0.5 text-right">{h(a.unworked_hours)}</td>
                        <td className="border border-slate-300 px-1 py-0.5">
                          {TYPE_LABELS[a.compensation_type] ?? a.compensation_type}
                        </td>
                        <td className="border border-slate-300 px-1 py-0.5">
                          {CATEGORY_LABELS[a.compensation_category] ?? a.compensation_category}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-6 flex items-end justify-between text-[10px] text-slate-600">
              <span>
                Ustvarjeno:{" "}
                {new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, dateStyle: "long" }).format(new Date())}
              </span>
              <span>Podpis odgovorne osebe: ______________________</span>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
