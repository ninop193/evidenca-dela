"use server";

import { headers } from "next/headers";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRICES, AUTOMATIC_TAX } from "@/lib/stripe";

async function getOrigin() {
  const h = await headers();
  const host = h.get("host") ?? "delovit.si";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Ustvari Stripe Checkout sejo za izbrani interval in vrne URL za preusmeritev.
export async function createCheckout(
  interval: "month" | "year",
): Promise<{ url?: string; error?: string }> {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return { error: "Samo delodajalec lahko ureja naročnino." };
  }
  const price = STRIPE_PRICES[interval];
  if (!price) return { error: "Cenik trenutno ni na voljo." };

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("id, name, stripe_customer_id")
    .eq("id", profile.company_id)
    .single();
  if (!company) return { error: "Podjetje ni najdeno." };

  try {
    // Stranko v Stripe ustvarimo enkrat in shranimo.
    let customerId = company.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email ?? undefined,
        name: company.name,
        metadata: { app: "delovit", company_id: company.id },
      });
      customerId = customer.id;
      await supabase.from("companies").update({ stripe_customer_id: customerId }).eq("id", company.id);
    }

    const origin = await getOrigin();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/dashboard?narocnina=ok`,
      cancel_url: `${origin}/narocnina`,
      client_reference_id: company.id,
      allow_promotion_codes: true,
      billing_address_collection: AUTOMATIC_TAX ? "required" : "auto",
      automatic_tax: { enabled: AUTOMATIC_TAX },
      tax_id_collection: { enabled: AUTOMATIC_TAX },
      ...(AUTOMATIC_TAX ? { customer_update: { address: "auto" as const, name: "auto" as const } } : {}),
      subscription_data: { metadata: { app: "delovit", company_id: company.id } },
      metadata: { app: "delovit", company_id: company.id },
    });
    return { url: session.url ?? undefined };
  } catch (e) {
    console.error("Stripe checkout napaka:", e);
    return { error: "Napaka pri pripravi plačila. Poskusi znova." };
  }
}

// Odpre Stripe portal za upravljanje naročnine (kartica, odpoved, računi).
export async function createPortal(): Promise<{ url?: string; error?: string }> {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return { error: "Nedovoljeno." };
  }
  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("stripe_customer_id")
    .eq("id", profile.company_id)
    .single();
  if (!company?.stripe_customer_id) {
    return { error: "Naročnina še ni aktivna." };
  }
  try {
    const origin = await getOrigin();
    const portal = await stripe.billingPortal.sessions.create({
      customer: company.stripe_customer_id,
      return_url: `${origin}/narocnina`,
    });
    return { url: portal.url };
  } catch (e) {
    console.error("Stripe portal napaka:", e);
    return { error: "Napaka pri odpiranju portala." };
  }
}
