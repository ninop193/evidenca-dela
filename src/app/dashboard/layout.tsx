import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/billing";
import { Aurora } from "@/components/Aurora";
import { TrialBanner } from "@/components/TrialBanner";
import AppNav from "./AppNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/zigosanje");

  const supabase = await createClient();
  const [{ data: company }, { count: pendingCount }] = await Promise.all([
    supabase
      .from("companies")
      .select("name, subscription_status, trial_ends_at, current_period_end")
      .eq("id", profile.company_id)
      .single(),
    // Vnosi "za pregled" → oranžna značka v meniju (vidna z vsake strani).
    supabase
      .from("time_entries")
      .select("id", { count: "exact", head: true })
      .eq("needs_review", true),
  ]);

  const access = getAccess(company ?? {});
  if (!access.hasAccess) redirect("/narocnina");

  return (
    <div className="relative min-h-screen text-slate-800">
      <Aurora />
      <AppNav companyName={company?.name ?? "Podjetje"} pendingCount={pendingCount ?? 0} />
      {access.state === "trialing" && access.trialDaysLeft != null && (
        <TrialBanner daysLeft={access.trialDaysLeft} />
      )}
      {children}
    </div>
  );
}
