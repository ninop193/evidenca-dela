import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../(auth)/actions";
import ClockWidget from "./ClockWidget";

const TZ = "Europe/Ljubljana";
const todayLjubljana = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());

export default async function ZigosanjePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", profile.id)
    .single();

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
    <main className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs text-slate-500">Pozdravljen</p>
            <h1 className="text-base font-bold text-slate-900">
              {profile.full_name ?? "Zaposleni"}
            </h1>
          </div>
          <form action={signOut}>
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Odjava
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-10">
        {!employee ? (
          <p className="mt-10 text-center text-sm text-slate-500">
            Tvoj račun še ni povezan z evidenco zaposlenih. Obrni se na delodajalca.
          </p>
        ) : (
          <ClockWidget
            isOpen={isOpen}
            openSince={openSince}
            todayEntries={todayEntries}
          />
        )}
      </div>
    </main>
  );
}
