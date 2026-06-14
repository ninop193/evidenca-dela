import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Aurora } from "@/components/Aurora";
import AppNav from "./AppNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/zigosanje");

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", profile.company_id)
    .single();

  return (
    <div className="relative min-h-screen text-slate-800">
      <Aurora />
      <AppNav companyName={company?.name ?? "Podjetje"} />
      {children}
    </div>
  );
}
