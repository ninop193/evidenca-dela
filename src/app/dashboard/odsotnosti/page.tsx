import Link from "next/link";
import { Palmtree, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, buttonClasses } from "@/components/ui";
import { TYPE_LABELS, CATEGORY_LABELS } from "./labels";
import DeleteAbsenceButton from "./DeleteAbsenceButton";

const fmtDate = (d: string) =>
  new Intl.DateTimeFormat("sl-SI", { timeZone: "Europe/Ljubljana" }).format(new Date(d + "T00:00:00"));

type Row = {
  id: string;
  date_from: string;
  date_to: string;
  unworked_hours: number;
  compensation_type: string;
  compensation_category: string;
  employees: { full_name: string } | null;
};

export default async function AbsencesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("absences")
    .select(
      "id, date_from, date_to, unworked_hours, compensation_type, compensation_category, employees(full_name)",
    )
    .order("date_from", { ascending: false });
  const rows = (data ?? []) as unknown as Row[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Odsotnosti</h1>
          <p className="mt-1 text-sm text-slate-500">Dopust, bolniška in druge odsotnosti.</p>
        </div>
        <Link href="/dashboard/odsotnosti/nov" className={buttonClasses("primary")}>
          <Plus className="h-4 w-4" /> Nova odsotnost
        </Link>
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <Card className="grid place-items-center px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <Palmtree className="h-6 w-6" />
            </div>
            <p className="mt-4 font-medium text-slate-900">Še ni vnesenih odsotnosti</p>
            <p className="mt-1 text-sm text-slate-500">Dodaj dopust ali bolniško za zaposlenega.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            {/* Desktop: tabela */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-white/45 text-slate-500">
                  <tr>
                    <Th>Zaposleni</Th>
                    <Th>Obdobje</Th>
                    <Th right>Ure</Th>
                    <Th>Vrsta</Th>
                    <Th>Nadomestilo</Th>
                    <Th right> </Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map((r) => (
                    <tr key={r.id} className="transition hover:bg-white/45">
                      <td className="px-4 py-3.5 font-medium text-slate-900">{r.employees?.full_name ?? "—"}</td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {fmtDate(r.date_from)} – {fmtDate(r.date_to)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-slate-900 tabular-nums">
                        {r.unworked_hours.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {TYPE_LABELS[r.compensation_type] ?? r.compensation_type}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {CATEGORY_LABELS[r.compensation_category] ?? r.compensation_category}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <DeleteAbsenceButton id={r.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobilno: kartice */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {rows.map((r) => (
                <li key={r.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{r.employees?.full_name ?? "—"}</p>
                      <p className="text-sm text-slate-500">
                        {fmtDate(r.date_from)} – {fmtDate(r.date_to)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {r.unworked_hours.toFixed(2)} h
                      </span>
                      <DeleteAbsenceButton id={r.id} />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone="brand">{TYPE_LABELS[r.compensation_type] ?? r.compensation_type}</Badge>
                    <Badge tone="slate">{CATEGORY_LABELS[r.compensation_category] ?? r.compensation_category}</Badge>
                  </div>
                </li>
              ))}
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
