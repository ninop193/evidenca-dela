import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sun, Info } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Aurora } from "@/components/Aurora";
import { Wordmark, Badge } from "@/components/ui";
import { hoursToDays, fmtDays, LEAVE_STATUS_LABEL } from "@/lib/leave";
import { todayLjubljana } from "@/lib/tzdate";
import { LeaveRequestDialog } from "./LeaveRequestDialog";
import { CancelLeaveButton } from "./CancelLeaveButton";

const fmtRange = (from: string, to: string) => {
  const f = new Intl.DateTimeFormat("sl-SI", { day: "numeric", month: "numeric", year: "numeric" });
  const a = f.format(new Date(`${from}T12:00:00Z`));
  const b = f.format(new Date(`${to}T12:00:00Z`));
  return from === to ? a : `${a} – ${b}`;
};

const STATUS_TONE: Record<string, "amber" | "green" | "red" | "slate"> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
  cancelled: "slate",
};

type Req = {
  id: string;
  date_from: string;
  date_to: string;
  days: number;
  status: string;
  employee_note: string | null;
  decision_note: string | null;
};

// Moj dopust — osebni pregled stanja + napoved dopusta (samo redno zaposleni).
export default async function MojDopustPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: employee } = await supabase
    .from("employees")
    .select("id, worker_type, weekly_hours, annual_leave_days")
    .eq("user_id", profile.id)
    .maybeSingle();
  if (!employee) redirect("/dashboard");

  const isEmployee = employee.worker_type === "zaposlen";
  const year = todayLjubljana().slice(0, 4);

  // Stanje in seznam prošenj naložimo le za redno zaposlene.
  let usedDays = 0;
  let pendingDays = 0;
  let requests: Req[] = [];
  if (isEmployee) {
    const [{ data: absRows }, { data: reqRows }] = await Promise.all([
      supabase
        .from("absences")
        .select("unworked_hours")
        .eq("employee_id", employee.id)
        .eq("compensation_type", "letni_dopust")
        .gte("date_from", `${year}-01-01`)
        .lte("date_from", `${year}-12-31`),
      supabase
        .from("leave_requests")
        .select("id, date_from, date_to, days, status, employee_note, decision_note")
        .eq("employee_id", employee.id)
        .gte("date_from", `${year}-01-01`)
        .lte("date_from", `${year}-12-31`)
        .order("date_from", { ascending: false }),
    ]);
    usedDays = (absRows ?? []).reduce(
      (a, r) => a + hoursToDays(Number(r.unworked_hours) || 0, employee.weekly_hours),
      0,
    );
    requests = (reqRows ?? []) as Req[];
    pendingDays = requests
      .filter((r) => r.status === "pending")
      .reduce((a, r) => a + (Number(r.days) || 0), 0);
  }

  const entitlement = employee.annual_leave_days == null ? null : Number(employee.annual_leave_days);
  const remaining = entitlement == null ? null : entitlement - usedDays;
  const usedPct = entitlement && entitlement > 0 ? Math.min(100, (usedDays / entitlement) * 100) : 0;

  return (
    <main className="relative min-h-screen text-slate-800">
      <Aurora />

      <header className="sticky top-0 z-20 px-3 pt-3">
        <div className="glass iris-edge mx-auto flex max-w-md items-center justify-between rounded-full px-4 py-2.5">
          <Wordmark className="text-sm" />
          <Link
            href="/zigosanje"
            className="rounded-full bg-white/60 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-white/70 hover:bg-white/80"
          >
            Žigosanje
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-6">
        <Link
          href="/moje-ure"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Nazaj
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Moj dopust</h1>

        {!isEmployee ? (
          <div className="glass iris-edge mt-5 flex items-start gap-2.5 rounded-2xl p-5">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <p className="text-sm text-slate-600">
              Napoved dopusta je na voljo samo redno zaposlenim. Če misliš, da je to napaka, se
              obrni na delodajalca.
            </p>
          </div>
        ) : (
          <>
            {/* Stanje dopusta */}
            <div className="glass-strong iris-edge mt-5 rounded-3xl p-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <Sun className="h-4 w-4 text-amber-500" /> Dopust {year}
              </div>

              {entitlement == null ? (
                <>
                  <p className="mt-3 text-3xl font-bold tabular-nums text-slate-900">
                    {fmtDays(usedDays)}{" "}
                    <span className="text-base font-semibold text-slate-400">dni porabljeno</span>
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Delodajalec še ni določil tvoje letne kvote dopusta.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-4xl font-bold tabular-nums text-slate-900">
                    {fmtDays(Math.max(0, remaining ?? 0))}
                    <span className="ml-1.5 text-base font-semibold text-slate-400">
                      od {fmtDays(entitlement)} dni ostane
                    </span>
                  </p>
                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                      style={{ width: `${usedPct}%` }}
                    />
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Porabljeno: <strong className="text-slate-700">{fmtDays(usedDays)}</strong></span>
                    {pendingDays > 0 && (
                      <span>V obravnavi: <strong className="text-amber-600">{fmtDays(pendingDays)}</strong></span>
                    )}
                  </div>
                </>
              )}

              <div className="mt-5">
                <LeaveRequestDialog remaining={remaining == null ? null : remaining - pendingDays} />
              </div>
            </div>

            {/* Moje prošnje */}
            <h2 className="mb-2 mt-7 px-1 text-sm font-semibold text-slate-500">Moje prošnje ({year})</h2>
            {requests.length === 0 ? (
              <div className="glass rounded-2xl p-6 text-center text-sm text-slate-400">
                Letos še nisi napovedal dopusta.
              </div>
            ) : (
              <ul className="glass-strong iris-edge divide-y divide-white/40 overflow-hidden rounded-2xl">
                {requests.map((r) => (
                  <li key={r.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {fmtRange(r.date_from, r.date_to)}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {fmtDays(Number(r.days))} {Number(r.days) === 1 ? "dan" : "dni"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {r.status === "pending" && <CancelLeaveButton id={r.id} />}
                        <Badge tone={STATUS_TONE[r.status] ?? "slate"}>
                          {LEAVE_STATUS_LABEL[r.status] ?? r.status}
                        </Badge>
                      </div>
                    </div>
                    {(r.employee_note || r.decision_note) && (
                      <p className="mt-1 text-xs text-slate-400">
                        {r.decision_note
                          ? `Delodajalec: ${r.decision_note}`
                          : r.employee_note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-6 px-1 text-xs leading-snug text-slate-400">
              Napoved gre delodajalcu v potrditev. Ob odločitvi te obvestimo po e-pošti; potrjen
              dopust se samodejno zabeleži v evidenco.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
