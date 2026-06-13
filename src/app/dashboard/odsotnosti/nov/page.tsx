import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AbsenceForm from "../AbsenceForm";

export default async function NewAbsencePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/zigosanje");

  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name")
    .eq("active", true)
    .order("full_name");

  return (
    <main className="flex min-h-screen justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/dashboard/odsotnosti" className="text-sm text-slate-500 hover:text-slate-900">
          ← Nazaj na odsotnosti
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Nova odsotnost</h1>
        <p className="mt-1 text-sm text-slate-600">Dopust, bolniška ali druga odsotnost.</p>

        <div className="mt-6">
          <AbsenceForm employees={employees ?? []} />
        </div>
      </div>
    </main>
  );
}
