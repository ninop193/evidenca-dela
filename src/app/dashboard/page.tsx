import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../(auth)/actions";

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/zigosanje");

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", profile.company_id)
    .single();
  const { count: employeeCount } = await supabase
    .from("employees")
    .select("id", { count: "exact", head: true });

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Nadzorna plošča
            </p>
            <h1 className="text-lg font-bold text-slate-900">
              {company?.name ?? "Podjetje"}
            </h1>
          </div>
          <form action={signOut}>
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Odjava
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-slate-700">
          Pozdravljen, <strong>{profile.full_name}</strong>.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card label="Zaposleni" value={String(employeeCount ?? 0)} />
          <Card label="Vloga" value="Delodajalec" />
          <Card label="Status" value="Aktivno" />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard/zaposleni"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Upravljaj zaposlene
          </Link>
        </div>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
