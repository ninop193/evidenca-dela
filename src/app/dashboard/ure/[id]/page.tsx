import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import EntryForm from "../EntryForm";

// ISO → "HH:MM" po slovenskem času (za prednastavitev v obrazcu).
const toTime = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Ljubljana",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(iso))
    : "";

const numStr = (n: number | null | undefined) =>
  n != null && n !== 0 ? String(n) : "";

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/zigosanje");

  const supabase = await createClient();
  const [{ data: entry }, { data: employees }] = await Promise.all([
    supabase.from("time_entries").select("*").eq("id", id).single(),
    supabase.from("employees").select("id, full_name").eq("active", true).order("full_name"),
  ]);

  if (!entry) notFound();

  return (
    <main className="flex min-h-screen justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/dashboard/ure" className="text-sm text-slate-500 hover:text-slate-900">
          ← Nazaj na pregled
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Uredi vnos</h1>

        <div className="mt-6">
          <EntryForm
            mode="edit"
            entryId={entry.id}
            employees={employees ?? []}
            initial={{
              employeeId: entry.employee_id,
              date: entry.date,
              clockInTime: toTime(entry.clock_in),
              clockOutTime: toTime(entry.clock_out),
              totalWorkedHours: numStr(entry.total_worked_hours),
              workTimeType: entry.work_time_type ?? "polni",
              overtimeHours: numStr(entry.overtime_hours),
              nightHours: numStr(entry.night_hours),
              sundayHours: numStr(entry.sunday_hours),
              holidayHours: numStr(entry.holiday_hours),
              shiftSplitHours: numStr(entry.shift_split_hours),
              unevenlyDistributedHours: numStr(entry.unevenly_distributed_hours),
              pensionBenefitHours: numStr(entry.pension_benefit_hours),
              pensionBenefitStatus: entry.pension_benefit_status ?? "",
              runningTotalHours: numStr(entry.running_total_hours),
              referencePeriod: entry.reference_period ?? "",
              notes: entry.notes ?? "",
            }}
          />
        </div>
      </div>
    </main>
  );
}
