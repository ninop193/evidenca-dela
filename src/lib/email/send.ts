import "server-only";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import type { RenderedEmail } from "./templates";

const FROM = process.env.RESEND_FROM || "Delovit <info@delovit.si>";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// Pošlji en mail. Nikoli ne vrže — napako le zabeleži (mail ne sme podreti webhooka/akcije).
export async function sendEmail(
  to: string,
  email: RenderedEmail,
  opts?: { replyTo?: string },
): Promise<boolean> {
  const resend = client();
  if (!resend) {
    console.warn("RESEND_API_KEY manjka — mail ni poslan:", email.subject);
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: email.subject,
      html: email.html,
      ...(opts?.replyTo ? { replyTo: opts.replyTo } : {}),
    });
    if (error) {
      console.error("Resend napaka:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Pošiljanje maila spodletelo:", e);
    return false;
  }
}

// Vrne email + ime admina podjetja (za naslavljanje transakcijskih mailov).
export async function companyAdmin(
  companyId: string,
): Promise<{ email: string; fullName: string | null } | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("users")
    .select("email, full_name")
    .eq("company_id", companyId)
    .eq("role", "admin")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data?.email) return null;
  return { email: data.email, fullName: data.full_name ?? null };
}

// Pošlji mail adminu podjetja (po company_id ali po stripe_customer_id).
export async function sendToCompany(
  ref: { companyId?: string | null; stripeCustomerId?: string | null },
  build: (admin: { fullName: string | null }) => RenderedEmail,
): Promise<boolean> {
  const admin = createAdminClient();
  let companyId = ref.companyId ?? null;

  if (!companyId && ref.stripeCustomerId) {
    const { data } = await admin
      .from("companies")
      .select("id")
      .eq("stripe_customer_id", ref.stripeCustomerId)
      .maybeSingle();
    companyId = data?.id ?? null;
  }
  if (!companyId) return false;

  const person = await companyAdmin(companyId);
  if (!person) return false;

  return sendEmail(person.email, build({ fullName: person.fullName }));
}
