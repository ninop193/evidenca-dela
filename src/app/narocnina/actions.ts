"use server";

import { headers, cookies } from "next/headers";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRICES, AUTOMATIC_TAX, YEARLY_REF_COUPON } from "@/lib/stripe";

type CheckoutParams = NonNullable<Parameters<typeof stripe.checkout.sessions.create>[0]>;

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

    // Partnerska koda iz piškotka (nastavi jo proxy ob ?ref=KODA).
    const ck = await cookies();
    const rawRef = ck.get("delovit_ref")?.value;
    const ref = rawRef && /^[A-Za-z0-9_-]{1,40}$/.test(rawRef) ? rawRef : null;

    // Odloči popust glede na paket:
    //  - LETNI + skupni letni kupon nastavljen → 10 % prek skupnega kupona,
    //  - MESEČNI → partnerjeva promo koda (20 %), če obstaja v Stripu,
    //  - sicer brez samodejnega popusta (dovoli ročni vnos kode).
    let discounts: CheckoutParams["discounts"] | null = null;
    if (ref) {
      if (interval === "year" && YEARLY_REF_COUPON) {
        discounts = [{ coupon: YEARLY_REF_COUPON }];
      } else if (interval === "month") {
        try {
          const pcs = await stripe.promotionCodes.list({ code: ref, active: true, limit: 1 });
          if (pcs.data[0]) discounts = [{ promotion_code: pcs.data[0].id }];
        } catch (e) {
          console.error("Iskanje promo kode spodletelo:", e);
        }
      }
    }

    // partner_code v metadata = pripis partnerju (tudi če kupona še ni ali gre za letni).
    const meta: Record<string, string> = { app: "delovit", company_id: company.id };
    if (ref) meta.partner_code = ref;

    const origin = await getOrigin();
    const base: CheckoutParams = {
      mode: "subscription",
      customer: customerId,
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/dashboard?narocnina=ok`,
      cancel_url: `${origin}/narocnina`,
      client_reference_id: company.id,
      billing_address_collection: AUTOMATIC_TAX ? "required" : "auto",
      automatic_tax: { enabled: AUTOMATIC_TAX },
      tax_id_collection: { enabled: AUTOMATIC_TAX },
      ...(AUTOMATIC_TAX ? { customer_update: { address: "auto" as const, name: "auto" as const } } : {}),
      subscription_data: { metadata: meta },
      metadata: meta,
    };
    // discounts in allow_promotion_codes ne smeta biti nastavljena hkrati.
    const params: CheckoutParams = discounts
      ? { ...base, discounts }
      : { ...base, allow_promotion_codes: true };

    let session;
    try {
      session = await stripe.checkout.sessions.create(params);
    } catch (e) {
      // Popust ni bil sprejemljiv (npr. koda ni za prvo transakcijo) →
      // ponovi brez popusta, a ohrani pripis partnerju.
      if (discounts) {
        console.error("Checkout z discounts spodletel, poskus brez popusta:", e);
        session = await stripe.checkout.sessions.create({ ...base, allow_promotion_codes: true });
      } else {
        throw e;
      }
    }
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
