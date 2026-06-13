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
const fmtDow = (d: string) =>
  new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, weekday: "short" }).format(
    new Date(d + "T00:00:00"),
  );
const fmtTime = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(
        new Date(iso),
      )
    : "—";
const h = (n: number | null | undefined) => {
  const v = Number(n) || 0;
  return v === 0 ? "·" : v.toFixed(2);
};
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
  const generated = new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, dateStyle: "long" }).format(
    new Date(),
  );

  const cols = ["Datum", "Dan", "Prihod", "Odhod", "Redne", "Nad.", "Noč.", "Ned.", "Prazn.", "Izm.", "Neen.", "Zav.+"];

  return (
    <main className="report-root min-h-screen bg-slate-100 text-slate-900">
      <style>{`
        @page { size: A4; margin: 14mm 14mm 16mm 14mm; }
        .report-root, .report-sheet { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print {
          .no-print { display: none !important; }
          .report-root { background: #fff !important; }
          .report-sheet { box-shadow: none !important; margin: 0 !important; width: auto !important; }
        }
      `}</style>

      {/* Orodna vrstica — se ne natisne */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <Link href={`/dashboard/pregled?month=${month}`} className="text-sm text-slate-500 hover:text-slate-900">
          ← Nazaj
        </Link>
        <span className="hidden text-xs text-slate-500 sm:block">
          Klikni gumb → v oknu za tiskanje izberi <strong>„Shrani kot PDF"</strong>.
        </span>
        <PrintButton />
      </div>

      <div className="mx-auto max-w-[820px] px-4 py-8 print:p-0">
        {report.employees.length === 0 && (
          <p className="text-slate-500">Ni zaposlenih za izvoz.</p>
        )}

        {report.employees.map((emp, idx) => (
          <article
            key={emp.id}
            className={
              "report-sheet mb-8 rounded-xl bg-white p-10 shadow-sm ring-1 ring-slate-200 print:mb-0 print:rounded-none print:p-0 print:ring-0 " +
              (idx < report.employees.length - 1 ? "break-after-page" : "")
            }
          >
            {/* GLAVA — pisemska glava podjetja */}
            <header className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Evidenca dela
                </div>
                <h1 className="text-xl font-bold leading-tight text-slate-900">
                  {report.company.name}
                </h1>
                {report.company.tax_id && (
                  <p className="text-xs text-slate-500">Davčna št.: {report.company.tax_id}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Evidenca o izrabi
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  delovnega časa
                </p>
                <p className="mt-1 text-base font-bold capitalize text-slate-900">
                  {monthLabel(month)}
                </p>
                <p className="text-[10px] text-slate-400">18. člen ZEPDSV</p>
              </div>
            </header>

            {/* PODATKI ZAPOSLENEGA */}
            <section className="mt-5 grid grid-cols-4 gap-x-4 gap-y-2 rounded-lg bg-slate-50 px-4 py-3 text-xs ring-1 ring-slate-100">
              <Info label="Zaposleni" value={emp.full_name} wide />
              <Info label="Delovno mesto" value={emp.job_title ?? "—"} />
              <Info label="Tedenski delovni čas" value={emp.weekly_hours != null ? `${emp.weekly_hours} h` : "—"} />
              <Info label="EMŠO" value={emp.emso ?? "—"} />
              <Info label="Davčna številka" value={emp.tax_id ?? "—"} />
              {emp.employment_start_date && (
                <Info label="Nastop dela" value={fmtDate(emp.employment_start_date)} />
              )}
            </section>

            {emp.is_management && (
              <p className="mt-2 text-[11px] italic text-slate-500">
                Poslovodna oseba — skladno z ZEPDSV se evidenca izrabe delovnega časa ne vodi.
              </p>
            )}

            {/* TABELA UR */}
            <table className="mt-5 w-full border-collapse text-[9.5px]">
              <thead>
                <tr className="bg-slate-900 text-white">
                  {cols.map((c, i) => (
                    <th
                      key={c}
                      className={"px-1.5 py-1.5 font-semibold " + (i < 4 ? "text-left" : "text-right")}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {emp.entries.length === 0 ? (
                  <tr>
                    <td colSpan={cols.length} className="px-2 py-3 text-center text-slate-400">
                      Ni vnosov v tem obdobju.
                    </td>
                  </tr>
                ) : (
                  emp.entries.map((e, i) => (
                    <tr key={e.id} className={i % 2 === 1 ? "bg-slate-50" : ""}>
                      <Td>{fmtDate(e.date)}</Td>
                      <Td className="capitalize text-slate-500">{fmtDow(e.date)}</Td>
                      <Td>{fmtTime(e.clock_in)}</Td>
                      <Td>{fmtTime(e.clock_out)}</Td>
                      <Td num strong>{h(e.total_worked_hours)}</Td>
                      <Td num>{h(e.overtime_hours)}</Td>
                      <Td num>{h(e.night_hours)}</Td>
                      <Td num>{h(e.sunday_hours)}</Td>
                      <Td num>{h(e.holiday_hours)}</Td>
                      <Td num>{h(e.shift_split_hours)}</Td>
                      <Td num>{h(e.unevenly_distributed_hours)}</Td>
                      <Td num>{h(e.pension_benefit_hours)}</Td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 font-bold">
                  <td className="px-1.5 py-1.5 text-left uppercase tracking-wide" colSpan={4}>
                    Skupaj
                  </td>
                  <Td num strong>{h(emp.totals.total_worked_hours)}</Td>
                  <Td num strong>{h(emp.totals.overtime_hours)}</Td>
                  <Td num strong>{h(emp.totals.night_hours)}</Td>
                  <Td num strong>{h(emp.totals.sunday_hours)}</Td>
                  <Td num strong>{h(emp.totals.holiday_hours)}</Td>
                  <Td num strong>{h(emp.totals.shift_split_hours)}</Td>
                  <Td num strong>{h(emp.totals.unevenly_distributed_hours)}</Td>
                  <Td num strong>{h(emp.totals.pension_benefit_hours)}</Td>
                </tr>
              </tfoot>
            </table>
            <p className="mt-1 text-[8px] text-slate-400">
              Legenda: Nad.=nadure · Noč.=nočne · Ned.=nedeljske · Prazn.=praznične · Izm.=izmensko/deljeno · Neen.=neenakomerno razporejeno · Zav.+=zavarovalna doba s povečanjem · „·" = 0
            </p>

            {/* ODSOTNOSTI */}
            <section className="mt-5">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-700">
                Odsotnosti (neopravljene ure)
              </h2>
              {emp.absences.length === 0 ? (
                <p className="mt-1 text-[10px] text-slate-400">Ni odsotnosti v tem obdobju.</p>
              ) : (
                <table className="mt-1.5 w-full border-collapse text-[9.5px]">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-500">
                      <th className="px-1.5 py-1 text-left font-semibold">Od</th>
                      <th className="px-1.5 py-1 text-left font-semibold">Do</th>
                      <th className="px-1.5 py-1 text-right font-semibold">Ure</th>
                      <th className="px-1.5 py-1 text-left font-semibold">Vrsta</th>
                      <th className="px-1.5 py-1 text-left font-semibold">Kategorija nadomestila</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emp.absences.map((a, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="px-1.5 py-1">{fmtDate(a.date_from)}</td>
                        <td className="px-1.5 py-1">{fmtDate(a.date_to)}</td>
                        <td className="px-1.5 py-1 text-right font-medium">{h(a.unworked_hours)}</td>
                        <td className="px-1.5 py-1">{TYPE_LABELS[a.compensation_type] ?? a.compensation_type}</td>
                        <td className="px-1.5 py-1">{CATEGORY_LABELS[a.compensation_category] ?? a.compensation_category}</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="px-1.5 py-1 text-right" colSpan={2}>
                        Skupaj
                      </td>
                      <td className="px-1.5 py-1 text-right">{h(emp.totals.unworked_hours)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tbody>
                </table>
              )}
            </section>

            {/* PODPISNI BLOK */}
            <footer className="mt-10 flex items-end justify-between">
              <div className="text-[10px] text-slate-500">
                <p>Kraj in datum: ____________________</p>
                <p className="mt-4 text-slate-400">
                  Dokument ustvarjen elektronsko dne {generated}.
                </p>
              </div>
              <div className="text-center text-[10px] text-slate-600">
                <div className="mb-1 h-8 w-52 border-b border-slate-400" />
                Podpis odgovorne osebe
              </div>
            </footer>
          </article>
        ))}
      </div>
    </main>
  );
}

function Info({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <p className="text-[9px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Td({
  children,
  num,
  strong,
  className = "",
}: {
  children: React.ReactNode;
  num?: boolean;
  strong?: boolean;
  className?: string;
}) {
  return (
    <td
      className={
        "px-1.5 py-1 " +
        (num ? "text-right tabular-nums " : "") +
        (strong ? "font-semibold text-slate-900 " : "text-slate-700 ") +
        className
      }
    >
      {children}
    </td>
  );
}
