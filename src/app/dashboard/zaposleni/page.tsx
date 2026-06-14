import Link from "next/link";
import { Users, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, buttonClasses } from "@/components/ui";

export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name, job_title, emso, tax_id, is_management, active")
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Zaposleni</h1>
          <p className="mt-1 text-sm text-slate-500">Upravljaj delavce in njihove podatke.</p>
        </div>
        <Link href="/dashboard/zaposleni/nov" className={buttonClasses("primary")}>
          <UserPlus className="h-4 w-4" /> Dodaj zaposlenega
        </Link>
      </div>

      <div className="mt-6">
        {!employees || employees.length === 0 ? (
          <Card className="grid place-items-center px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <Users className="h-6 w-6" />
            </div>
            <p className="mt-4 font-medium text-slate-900">Še nimaš dodanih zaposlenih</p>
            <p className="mt-1 text-sm text-slate-500">Dodaj prvega in mu omogoči žigosanje.</p>
            <Link href="/dashboard/zaposleni/nov" className={buttonClasses("primary") + " mt-5"}>
              <UserPlus className="h-4 w-4" /> Dodaj zaposlenega
            </Link>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-white/45 text-slate-500">
                  <tr>
                    <Th>Ime in priimek</Th>
                    <Th>Delovno mesto</Th>
                    <Th>EMŠO</Th>
                    <Th>Davčna</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.map((e) => (
                    <tr key={e.id} className="transition hover:bg-white/45">
                      <td className="px-4 py-3.5 font-medium text-slate-900">
                        {e.full_name}
                        {e.is_management && (
                          <Badge tone="amber" className="ml-2">
                            poslovodna
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{e.job_title ?? "—"}</td>
                      <td className="px-4 py-3.5 text-slate-600">{e.emso ?? "—"}</td>
                      <td className="px-4 py-3.5 text-slate-600">{e.tax_id ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        <Badge tone={e.active ? "green" : "slate"}>
                          {e.active ? "Aktiven" : "Neaktiven"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">{children}</th>;
}
