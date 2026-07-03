import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditEmployeeForm } from "./EditEmployeeForm";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS poskrbi, da admin vidi le zaposlene svojega podjetja.
  const { data: emp } = await supabase
    .from("employees")
    .select("id, full_name, job_title, emso, tax_id, weekly_hours, employment_start_date, birth_date, is_management, worker_type, user_id")
    .eq("id", id)
    .maybeSingle();

  if (!emp) redirect("/dashboard/zaposleni");

  // Email za prikaz (samo za branje).
  let email: string | null = null;
  if (emp.user_id) {
    const { data: u } = await supabase.from("users").select("email").eq("id", emp.user_id).maybeSingle();
    email = u?.email ?? null;
  }

  return <EditEmployeeForm employee={{ ...emp, email }} />;
}
