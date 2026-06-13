import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TYPE_LABELS, CATEGORY_LABELS } from "./labels";
import DeleteAbsenceButton from "./DeleteAbsenceButton";

const fmtDate = (d: string) =>
  new Intl.DateTimeFormat("sl-SI", { timeZone: "Europe/Ljubljana" }).format(
    new Date(d + "T00:00:00"),
  );

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
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/zigosanje");

  const supabase = await createClient();
  const { data } = await supabase
    .from("absences")
    .select(
      "id, date_from, date_to, unworked_hours, compensation_type, compensation_category, employees(full_name)",
    )
    .order("date_from", { ascending: false });
  const rows = (data ?? []) as unknown as Row[];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
              ← Nazaj
            </Link>
            <h1 className="text-lg font-bold text-slate-900">Odsotnosti</h1>
          </div>
          <Link
            href="/dashboard/odsotnosti/nov"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Nova odsotnost
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            Še ni vnesenih odsotnosti.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Zaposleni</th>
                  <th className="px-4 py-3 font-medium">Obdobje</th>
                  <th className="px-4 py-3 font-medium text-right">Ure</th>
                  <th className="px-4 py-3 font-medium">Vrsta</th>
                  <th className="px-4 py-3 font-medium">Nadomestilo</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {r.employees?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {fmtDate(r.date_from)} – {fmtDate(r.date_to)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {r.unworked_hours.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {TYPE_LABELS[r.compensation_type] ?? r.compensation_type}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {CATEGORY_LABELS[r.compensation_category] ?? r.compensation_category}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteAbsenceButton id={r.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
