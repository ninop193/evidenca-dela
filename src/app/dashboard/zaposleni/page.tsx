import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function EmployeesPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/zigosanje");

  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name, job_title, emso, tax_id, is_management, active")
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
              ← Nazaj
            </Link>
            <h1 className="text-lg font-bold text-slate-900">Zaposleni</h1>
          </div>
          <Link
            href="/dashboard/zaposleni/nov"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Dodaj zaposlenega
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {!employees || employees.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            Še nimaš dodanih zaposlenih.
            <br />
            Klikni <strong>„+ Dodaj zaposlenega“</strong> zgoraj.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Ime in priimek</th>
                  <th className="px-4 py-3 font-medium">Delovno mesto</th>
                  <th className="px-4 py-3 font-medium">EMŠO</th>
                  <th className="px-4 py-3 font-medium">Davčna</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {e.full_name}
                      {e.is_management && (
                        <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                          poslovodna
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{e.job_title ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{e.emso ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{e.tax_id ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          e.active
                            ? "rounded bg-green-100 px-2 py-0.5 text-xs text-green-700"
                            : "rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
                        }
                      >
                        {e.active ? "Aktiven" : "Neaktiven"}
                      </span>
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
