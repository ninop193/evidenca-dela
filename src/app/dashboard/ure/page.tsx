import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, buttonClasses } from "@/components/ui";

const fmtDate = (d: string) =>
  new Intl.DateTimeFormat("sl-SI", { timeZone: "Europe/Ljubljana" }).format(new Date(d + "T00:00:00"));
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
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pregled ur</h1>
          <p className="mt-1 text-sm text-slate-500">Zadnji vnosi delovnega časa.</p>
        </div>
        <Link href="/dashboard/ure/nov" className={buttonClasses("primary")}>
          ＋ Ročni vnos
        </Link>
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <Card className="grid place-items-center px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-2xl text-brand-600">
              ⏱
            </div>
            <p className="mt-4 font-medium text-slate-900">Še ni zabeleženih ur</p>
            <p className="mt-1 text-sm text-slate-500">
              Ko zaposleni žigosajo ali vneseš ročno, se vnosi prikažejo tukaj.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/60 text-slate-500">
                  <tr>
                    <Th>Datum</Th>
                    <Th>Zaposleni</Th>
                    <Th>Prihod</Th>
                    <Th>Odhod</Th>
                    <Th right>Ure</Th>
                    <Th right>Nadure</Th>
                    <Th>Status</Th>
                    <Th right> </Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map((r) => (
                    <tr key={r.id} className="transition hover:bg-slate-50/60">
                      <td className="px-4 py-3.5 text-slate-900">{fmtDate(r.date)}</td>
                      <td className="px-4 py-3.5 text-slate-700">{r.employees?.full_name ?? "—"}</td>
                      <td className="px-4 py-3.5 text-slate-600">{fmtTime(r.clock_in)}</td>
                      <td className="px-4 py-3.5 text-slate-600">{fmtTime(r.clock_out)}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-slate-900 tabular-nums">
                        {r.clock_out == null ? (
                          <Badge tone="brand">v teku</Badge>
                        ) : (
                          (r.total_worked_hours ?? 0).toFixed(2)
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-600 tabular-nums">
                        {(r.overtime_hours ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={r.confirmed ? "green" : "slate"}>
                          {r.confirmed ? "potrjeno" : "v obdelavi"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/dashboard/ure/${r.id}`}
                          className="text-sm font-medium text-brand-600 hover:text-brand-700"
                        >
                          Uredi
                        </Link>
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

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={"px-4 py-3 text-xs font-semibold uppercase tracking-wide " + (right ? "text-right" : "")}>
      {children}
    </th>
  );
}
