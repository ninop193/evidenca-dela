import { SupabaseClient } from "@supabase/supabase-js";

export type ReportEntry = {
  id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  total_worked_hours: number | null;
  overtime_hours: number | null;
  night_hours: number | null;
  sunday_hours: number | null;
  holiday_hours: number | null;
  shift_split_hours: number | null;
  unevenly_distributed_hours: number | null;
  pension_benefit_hours: number | null;
  pension_benefit_status: string | null;
  confirmed: boolean;
  notes: string | null;
};

export type ReportAbsence = {
  date_from: string;
  date_to: string;
  unworked_hours: number;
  compensation_type: string;
  compensation_category: string;
};

export type ReportEmployee = {
  id: string;
  full_name: string;
  emso: string | null;
  tax_id: string | null;
  job_title: string | null;
  weekly_hours: number | null;
  employment_start_date: string | null;
  employment_end_date: string | null;
  is_management: boolean;
  worker_type: string | null;
  entries: ReportEntry[];
  absences: ReportAbsence[];
  totals: Record<string, number>;
};

export type MonthlyReport = {
  company: { name: string; tax_id: string | null };
  month: string;
  employees: ReportEmployee[];
};

const SUM_FIELDS = [
  "total_worked_hours",
  "overtime_hours",
  "night_hours",
  "sunday_hours",
  "holiday_hours",
  "shift_split_hours",
  "unevenly_distributed_hours",
  "pension_benefit_hours",
] as const;

export function monthBounds(month: string) {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return { first: `${month}-01`, last: `${month}-${String(lastDay).padStart(2, "0")}` };
}

export async function getMonthlyReport(
  supabase: SupabaseClient,
  companyId: string,
  month: string,
): Promise<MonthlyReport> {
  const { first, last } = monthBounds(month);

  const [{ data: company }, { data: employees }, { data: entries }, { data: absences }] =
    await Promise.all([
      supabase.from("companies").select("name, tax_id").eq("id", companyId).single(),
      supabase
        .from("employees")
        .select(
          "id, full_name, emso, tax_id, job_title, weekly_hours, employment_start_date, employment_end_date, is_management, worker_type",
        )
        .order("full_name"),
      supabase
        .from("time_entries")
        .select(
          "id, employee_id, date, clock_in, clock_out, total_worked_hours, overtime_hours, night_hours, sunday_hours, holiday_hours, shift_split_hours, unevenly_distributed_hours, pension_benefit_hours, pension_benefit_status, confirmed, notes",
        )
        .gte("date", first)
        .lte("date", last)
        .order("date", { ascending: true }),
      supabase
        .from("absences")
        .select(
          "employee_id, date_from, date_to, unworked_hours, compensation_type, compensation_category",
        )
        .lte("date_from", last)
        .gte("date_to", first),
    ]);

  const entriesByEmp = new Map<string, ReportEntry[]>();
  for (const e of entries ?? []) {
    const arr = entriesByEmp.get(e.employee_id) ?? [];
    arr.push(e as ReportEntry);
    entriesByEmp.set(e.employee_id, arr);
  }
  const absByEmp = new Map<string, ReportAbsence[]>();
  for (const a of absences ?? []) {
    const arr = absByEmp.get(a.employee_id) ?? [];
    arr.push(a as ReportAbsence);
    absByEmp.set(a.employee_id, arr);
  }

  const result: ReportEmployee[] = (employees ?? []).map((emp) => {
    const list = entriesByEmp.get(emp.id) ?? [];
    const totals: Record<string, number> = {};
    for (const f of SUM_FIELDS) {
      totals[f] = list.reduce((acc, e) => acc + (Number(e[f]) || 0), 0);
    }
    const absList = absByEmp.get(emp.id) ?? [];
    totals.unworked_hours = absList.reduce((acc, a) => acc + (Number(a.unworked_hours) || 0), 0);
    return { ...emp, entries: list, absences: absList, totals } as ReportEmployee;
  });

  return {
    company: company ?? { name: "Podjetje", tax_id: null },
    month,
    employees: result,
  };
}
