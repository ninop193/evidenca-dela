import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import AbsenceForm from "../AbsenceForm";

export default async function NewAbsencePage() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name")
    .eq("active", true)
    .order("full_name");

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <Link href="/dashboard/odsotnosti" className="text-sm text-slate-500 hover:text-slate-900">
        ← Nazaj na odsotnosti
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Nova odsotnost</h1>
      <p className="mt-1 text-sm text-slate-500">Dopust, bolniška ali druga odsotnost.</p>

      <Card className="mt-6 p-6">
        <AbsenceForm employees={employees ?? []} />
      </Card>
    </main>
  );
}
