"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isFreeAccessEmail, grantFreeAccess } from "@/lib/comp";

// Po ustvarjenju podjetja (Google onboarding): če je email vnaprej pooblaščen
// za brezplačen dostop, mu ga vklopi. Sicer ne stori nič.
export async function claimFreeAccessIfEligible(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isFreeAccessEmail(user.email)) return;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.company_id) await grantFreeAccess(profile.company_id);
}
