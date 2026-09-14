"use server";

import { createClient } from "@/lib/supabase/server";
import { isSuperadmin } from "@/lib/superadmin";
import { sendEmail } from "@/lib/email/send";
import { trialWinbackEmail } from "@/lib/email/templates";

// Pošlje TESTNI win-back mail — vedno in samo na email prijavljenega
// superadmina. Nikoli ne more končati pri stranki.
export async function sendTestWinback(): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? null;

  if (!isSuperadmin(email)) {
    return { ok: false, message: "Nedovoljeno." };
  }

  const ok = await sendEmail(
    email!,
    trialWinbackEmail({
      fullName: "Nino Pavalec",
      companyName: "Primer d.o.o. (TEST)",
      entries: 87,
      employees: 3,
      expiredDaysAgo: 4,
    }),
  );

  return ok
    ? { ok: true, message: `Testni mail poslan na ${email}.` }
    : { ok: false, message: "Pošiljanje ni uspelo (preveri RESEND_API_KEY in log)." };
}
