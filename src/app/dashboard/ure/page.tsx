import Link from "next/link";
import { Clock, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, buttonClasses, cn } from "@/components/ui";
import { ApproveButton } from "./ApproveButton";

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
  needs_review: boolean | null;
  employees: { full_name: string } | null;
};

type Filter = "vsi" | "pregled" | "vteku";

export default async function HoursPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter: Filter =
    sp.filter === "pregled" ? "pregled" : sp.filter === "vteku" ? "vteku" : "vsi";

  const supabase = await createClient();

  let query = supabase
    .from("time_entries")
    .select(
      "id, date, clock_in, clock_out, total_worked_hours, overtime_hours, confirmed, needs_review, employees(full_name)",
    )
    .order("date", { ascending: false })
    .order("clock_in", { ascending: false })
    .limit(200);
  if (filter === "pregled") query = query.eq("needs_review", true);
  if (filter === "vteku") query = query.is("clock_out", null);

  const [{ data }, { count: pendingCount }, { count: openCount }] = await Promise.all([
    query,
    supabase
      .from("time_entries")
      .select("id", { count: "exact", head: true })
      .eq("needs_review", true),
    supabase
      .from("time_entries")
      .select("id", { count: "exact", head: true })
      .is("clock_out", null),
  ]);
  const rows = (data ?? []) as unknown as Row[];

  const chips: { key: Filter; label: string; count?: number }[] = [
    { key: "vsi", label: "Vsi vnosi" },
    { key: "pregled", label: "Za pregled", count: pendingCount ?? 0 },
    { key: "vteku", label: "V teku", count: openCount ?? 0 },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pregled ur</h1>
          <p className="mt-1 text-sm text-slate-500">Zadnji vnosi delovnega časa.</p>
        </div>
        <Link href="/dashboard/ure/nov" className={buttonClasses("primary")}>
          <Plus className="h-4 w-4" /> Ročni vnos
        </Link>
      </div>

      {/* Filtri: Vsi / Za pregled (čaka na potrditev) / V teku */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {chips.map((c) => (
          <Link
            key={c.key}
            href={c.key === "vsi" ? "/dashboard/ure" : `/dashboard/ure?filter=${c.key}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
              filter === c.key
                ? "bg-brand-600 text-white shadow-[0_6px_16px_-6px_rgba(29,78,216,0.7)]"
                : "glass text-slate-600 hover:text-slate-900",
            )}
          >
            {c.label}
            {c.count != null && c.count > 0 && (
              <span
                className={cn(
                  "grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] font-bold leading-none",
                  c.key === "pregled"
                    ? "bg-amber-500 text-white"
                    : filter === c.key
                      ? "bg-white/25 text-white"
                      : "bg-slate-200 text-slate-600",
                )}
              >
                {c.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-4">
        {rows.length === 0 ? (
          <Card className="grid place-items-center px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <Clock className="h-6 w-6" />
            </div>
            <p className="mt-4 font-medium text-slate-900">
              {filter === "pregled"
                ? "Noben vnos ne čaka na pregled"
                : filter === "vteku"
                  ? "Trenutno ni odprtih izmen"
                  : "Še ni zabeleženih ur"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {filter === "vsi"
                ? "Ko zaposleni žigosajo ali vneseš ročno, se vnosi prikažejo tukaj."
                : "Vse je urejeno."}
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            {/* Desktop: tabela */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-white/45 text-slate-500">
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
                    <tr
                      key={r.id}
                      className={cn(
                        "transition hover:bg-white/45",
                        r.needs_review && "bg-amber-50/60 hover:bg-amber-50/90",
                      )}
                    >
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
                        {r.needs_review ? (
                          <Badge tone="amber">za pregled</Badge>
                        ) : (
                          <Badge tone={r.confirmed ? "green" : "slate"}>
                            {r.confirmed ? "potrjeno" : "v obdelavi"}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="inline-flex items-center gap-3">
                          <Link
                            href={`/dashboard/ure/${r.id}`}
                            className="text-sm font-medium text-brand-600 hover:text-brand-700"
                          >
                            Uredi
                          </Link>
                          {r.needs_review && <ApproveButton id={r.id} />}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobilno: kartice */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {rows.map((r) => (
                <li key={r.id} className={cn("p-4", r.needs_review && "bg-amber-50/60")}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{fmtDate(r.date)}</p>
                      <p className="text-sm text-slate-500">{r.employees?.full_name ?? "—"}</p>
                    </div>
                    <Link
                      href={`/dashboard/ure/${r.id}`}
                      className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      Uredi
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                    <span className="text-slate-600">
                      {fmtTime(r.clock_in)} – {fmtTime(r.clock_out)}
                    </span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {r.clock_out == null ? "" : `${(r.total_worked_hours ?? 0).toFixed(2)} h`}
                    </span>
                    {(r.overtime_hours ?? 0) > 0 && (
                      <span className="text-slate-500 tabular-nums">
                        nad. {(r.overtime_hours ?? 0).toFixed(2)}
                      </span>
                    )}
                    {r.clock_out == null ? (
                      <Badge tone="brand">v teku</Badge>
                    ) : r.needs_review ? (
                      <Badge tone="amber">za pregled</Badge>
                    ) : (
                      <Badge tone={r.confirmed ? "green" : "slate"}>
                        {r.confirmed ? "potrjeno" : "v obdelavi"}
                      </Badge>
                    )}
                    {r.needs_review && (
                      <span className="ml-auto">
                        <ApproveButton id={r.id} />
                      </span>
                    )}
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
