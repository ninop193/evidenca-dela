import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/billing";
import { Aurora } from "@/components/Aurora";
import { Wordmark } from "@/components/ui";
import { ChangePassword } from "@/components/ChangePassword";
import { signOut } from "../(auth)/actions";
import { workerCategory, reminderHoursFor } from "@/lib/workLimits";
import { todayLjubljana, weekStart } from "@/lib/tzdate";
import ClockWidget from "./ClockWidget";

export default async function ZigosanjePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("subscription_status, trial_ends_at, current_period_end")
    .eq("id", profile.company_id)
    .single();
  const access = getAccess(company ?? {});

  const { data: employee } = await supabase
    .from("employees")
    .select("id, worker_type, birth_date")
    .eq("user_id", profile.id)
    .single();

  // Zakonska dnevna meja za opomnik ("Ne pozabi žigosati odhoda").
  const reminderHours = employee
    ? reminderHoursFor(workerCategory(employee.worker_type, employee.birth_date))
    : 10;

  let isOpen = false;
  let openSince: string | null = null;
  let todayEntries: {
    id: string;
    clock_in: string | null;
    clock_out: string | null;
    total_worked_hours: number | null;
  }[] = [];
  let weekTotal = 0;
  let monthTotal = 0;

  if (employee) {
    const today = todayLjubljana();
    const [{ data: entries }, { data: monthRows }] = await Promise.all([
      supabase
        .from("time_entries")
        .select("id, clock_in, clock_out, total_worked_hours")
        .eq("employee_id", employee.id)
        .eq("date", today)
        .order("clock_in", { ascending: true }),
      // Tekoči mesec + morebitni rep tedna iz prejšnjega meseca (en zajem za oba seštevka).
      supabase
        .from("time_entries")
        .select("date, total_worked_hours")
        .eq("employee_id", employee.id)
        .gte("date", [`${today.slice(0, 7)}-01`, weekStart(today)].sort()[0])
        .lte("date", today),
    ]);
    todayEntries = entries ?? [];
    const open = todayEntries.find((e) => e.clock_out == null);
    isOpen = !!open;
    openSince = open?.clock_in ?? null;

    const wStart = weekStart(today);
    const mStart = `${today.slice(0, 7)}-01`;
    for (const r of monthRows ?? []) {
      const h = Number(r.total_worked_hours) || 0;
      if (r.date >= mStart) monthTotal += h;
      if (r.date >= wStart) weekTotal += h;
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col text-slate-800">
      <Aurora />
      <header className="sticky top-0 z-20 px-3 pt-3">
        <div className="glass iris-edge mx-auto flex max-w-md items-center justify-between rounded-full px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <Wordmark className="text-sm" />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-slate-500 xs:block">
              {profile.full_name?.split(" ")[0] ?? "Zaposleni"}
            </span>
            <ChangePassword variant="icon" />
            <form action={signOut}>
              <button className="rounded-full bg-white/60 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-white/70 hover:bg-white/80">
                Odjava
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-10">
        {!access.hasAccess ? (
          <div className="glass iris-edge mt-10 rounded-2xl p-6 text-center">
            <p className="font-semibold text-slate-900">Žigosanje trenutno ni na voljo</p>
            <p className="mt-1.5 text-sm text-slate-600">
              Naročnina podjetja je potekla. Obrni se na delodajalca, da uredi naročnino.
            </p>
          </div>
        ) : !employee ? (
          <p className="mt-10 text-center text-sm text-slate-500">
            Tvoj račun še ni povezan z evidenco zaposlenih. Obrni se na delodajalca.
          </p>
        ) : (
          <>
            <ClockWidget
              isOpen={isOpen}
              openSince={openSince}
              todayEntries={todayEntries}
              reminderHours={reminderHours}
            />

            {/* Moje ure — seštevki na dotik + vhod v osebni pregled */}
            <Link
              href="/moje-ure"
              className="glass-strong iris-edge mt-4 flex w-full items-center justify-between rounded-2xl px-5 py-4 transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Ta teden
                  </p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">
                    {weekTotal.toFixed(2)}
                    <span className="ml-0.5 text-xs font-semibold text-slate-400">h</span>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Ta mesec
                  </p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">
                    {monthTotal.toFixed(2)}
                    <span className="ml-0.5 text-xs font-semibold text-slate-400">h</span>
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-brand-600">
                Moje ure
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
