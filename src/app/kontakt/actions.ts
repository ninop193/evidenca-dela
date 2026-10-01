"use server";

import { sendEmail } from "@/lib/email/send";
import { contactEmail } from "@/lib/email/templates";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const INBOX = "info@delovit.si";

export type ContactResult = { ok: boolean; error?: string };

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function sendContact(formData: FormData): Promise<ContactResult> {
  // Honeypot: če je skrito polje izpolnjeno, je verjetno bot — tiho "uspe".
  if ((formData.get("website") as string)?.trim()) return { ok: true };

  const name = ((formData.get("name") as string) || "").trim();
  const email = ((formData.get("email") as string) || "").trim();
  const company = ((formData.get("company") as string) || "").trim();
  const message = ((formData.get("message") as string) || "").trim();

  if (!name || !email || !message) {
    return { ok: false, error: "Prosimo izpolni ime, e-pošto in sporočilo." };
  }
  if (!isEmail(email)) {
    return { ok: false, error: "Vnesi veljaven e-poštni naslov." };
  }
  if (message.length > 5000) {
    return { ok: false, error: "Sporočilo je predolgo (največ 5000 znakov)." };
  }

  // Omejitev: največ 5 sporočil na uro z istega IP in 100 na dan skupaj.
  const ip = await clientIp();
  if (
    !(await rateLimit(`contact:ip:${ip}`, 5, 3_600)) ||
    !(await rateLimit("contact:all", 100, 86_400))
  ) {
    return { ok: false, error: "Preveč sporočil v kratkem času. Poskusi kasneje ali piši na info@delovit.si." };
  }

  const sent = await sendEmail(
    INBOX,
    contactEmail({ name, email, company: company || null, message }),
    { replyTo: email },
  );

  if (!sent) {
    return { ok: false, error: "Pošiljanje trenutno ni uspelo. Poskusi znova ali piši na info@delovit.si." };
  }
  return { ok: true };
}
