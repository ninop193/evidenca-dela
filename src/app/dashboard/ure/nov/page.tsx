import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import EntryForm from "../EntryForm";

const todayLjubljana = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Ljubljana" }).format(new Date());

export default async function NewEntryPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name")
    .eq("active", true)
    .order("full_name");

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <Link href="/dashboard/ure" className="text-sm text-slate-500 hover:text-slate-900">
        ← Nazaj na pregled
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Ročni vnos ur</h1>
      <p className="mt-1 text-sm text-slate-500">Vnesi ali popravi ure za nazaj.</p>

      <Card className="mt-6 p-6">
        <EntryForm
          mode="create"
          employees={employees ?? []}
          initial={{ date: todayLjubljana(), workTimeType: "polni" }}
        />
      </Card>
    </main>
  );
}
