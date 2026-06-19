import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Emaili, ki ob registraciji dobijo BREZPLAČEN (neomejen) dostop — promo / prijatelji.
// Doda se ime v malih črkah. Dostop velja takoj ob ustvarjenju podjetja.
const FREE_ACCESS_EMAILS = new Set<string>([
  "jolandate@gmail.com",
]);

export function isFreeAccessEmail(email?: string | null): boolean {
  return !!email && FREE_ACCESS_EMAILS.has(email.trim().toLowerCase());
}

// Podjetju nastavi brezplačen dostop (aktiven, brez Stripe naročnine).
export async function grantFreeAccess(companyId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("companies")
    .update({ subscription_status: "active", plan: "do10" })
    .eq("id", companyId);
}
