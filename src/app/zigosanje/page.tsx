import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/billing";
import { Aurora } from "@/components/Aurora";
import { Wordmark } from "@/components/ui";
import { ChangePassword } from "@/components/ChangePassword";
import { signOut } from "../(auth)/actions";
import { workerCategory, reminderHoursFor } from "@/lib/workLimits";
import ClockWidget from "./ClockWidget";

const TZ = "Europe/Ljubljana";
const todayLjubljana = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());

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

  if (employee) {
    const { data: entries } = await supabase
      .from("time_entries")
      .select("id, clock_in, clock_out, total_worked_hours")
      .eq("employee_id", employee.id)
      .eq("date", todayLjubljana())
      .order("clock_in", { ascending: true });
    todayEntries = entries ?? [];
    const open = todayEntries.find((e) => e.clock_out == null);
    isOpen = !!open;
    openSince = open?.clock_in ?? null;
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
          <ClockWidget
            isOpen={isOpen}
            openSince={openSince}
            todayEntries={todayEntries}
            reminderHours={reminderHours}
          />
        )}
      </div>
    </main>
  );
}
