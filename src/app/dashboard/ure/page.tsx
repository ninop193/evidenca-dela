import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const fmtDate = (d: string) =>
  new Intl.DateTimeFormat("sl-SI", { timeZone: "Europe/Ljubljana" }).format(
    new Date(d + "T00:00:00"),
  );
const fmtTime = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("sl-SI", {
        timeZone: "Europe/Ljubljana",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso))
    : "—";

type Row = {
  id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  total_worked_hours: number | null;
  overtime_hours: number | null;
  confirmed: boolean;
  employees: { full_name: string } | null;
};

export default async function HoursPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/zigosanje");

  const supabase = await createClient();
  const { data } = await supabase
    .from("time_entries")
    .select(
      "id, date, clock_in, clock_out, total_worked_hours, overtime_hours, confirmed, employees(full_name)",
    )
    .order("date", { ascending: false })
    .order("clock_in", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as unknown as Row[];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
              ← Nazaj
            </Link>
            <h1 className="text-lg font-bold text-slate-900">Pregled ur</h1>
          </div>
          <Link
            href="/dashboard/ure/nov"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Ročni vnos
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            Še ni zabeleženih ur. Ko zaposleni žigosajo, se vnosi prikažejo tukaj.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Datum</th>
                  <th className="px-4 py-3 font-medium">Zaposleni</th>
                  <th className="px-4 py-3 font-medium">Prihod</th>
                  <th className="px-4 py-3 font-medium">Odhod</th>
                  <th className="px-4 py-3 font-medium">Ure</th>
                  <th className="px-4 py-3 font-medium">Nadure</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-slate-900">{fmtDate(r.date)}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.employees?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{fmtTime(r.clock_in)}</td>
                    <td className="px-4 py-3 text-slate-600">{fmtTime(r.clock_out)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {r.clock_out == null
                        ? "v teku"
                        : `${(r.total_worked_hours ?? 0).toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {(r.overtime_hours ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {r.confirmed ? (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          potrjeno
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          v obdelavi
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/ure/${r.id}`}
                        className="text-sm font-medium text-slate-600 underline hover:text-slate-900"
                      >
                        Uredi
                      </Link>
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
