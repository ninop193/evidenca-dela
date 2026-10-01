"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isFreeAccessEmail, grantFreeAccess } from "@/lib/comp";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";
import { rateLimit } from "@/lib/rateLimit";

// Po ustvarjenju podjetja (Google onboarding): če je email vnaprej pooblaščen
// za brezplačen dostop, mu ga vklopi, nato pošlje dobrodošlico (kot pri
// registraciji z emailom v /auth/confirm).
export async function finishGoogleOnboarding(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("company_id, full_name, companies(name)")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.company_id) return;

  if (isFreeAccessEmail(user.email)) await grantFreeAccess(profile.company_id);

  // Dobrodošlica (sendEmail nikoli ne vrže — ne sme podreti toka).
  // Največ ena na uporabnika (akcijo je mogoče poklicati večkrat).
  if (user.email && (await rateLimit(`welcome:${user.id}`, 1, 365 * 86_400))) {
    const company = profile.companies as { name?: string } | { name?: string }[] | null;
    const companyName = Array.isArray(company) ? company[0]?.name : company?.name;
    await sendEmail(
      user.email,
      welcomeEmail({ fullName: profile.full_name, companyName, trialDaysLeft: 14 }),
    );
  }
}
