import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Normaliziraj Stripe status naročnine v naš model dostopa.
function mapStatus(s: Stripe.Subscription.Status): string {
  if (s === "active" || s === "trialing") return "active";
  if (s === "past_due") return "past_due";
  return "canceled"; // canceled, unpaid, incomplete, incomplete_expired, paused
}

function periodEnd(sub: Stripe.Subscription): string | null {
  const ts =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    sub.items?.data?.[0]?.current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

async function syncSubscription(sub: Stripe.Subscription) {
  const admin = createAdminClient();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const companyId = (sub.metadata?.company_id as string | undefined) ?? null;
  const update = {
    subscription_status: mapStatus(sub.status),
    stripe_subscription_id: sub.id,
    stripe_customer_id: customerId,
    current_period_end: periodEnd(sub),
    cancel_at_period_end: sub.cancel_at_period_end ?? false,
    billing_interval: sub.items?.data?.[0]?.price?.recurring?.interval ?? null,
    plan: "do10",
  };
  const q = admin.from("companies").update(update);
  if (companyId) await q.eq("id", companyId);
  else await q.eq("stripe_customer_id", customerId);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Manjka podpis." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    console.error("Webhook podpis neveljaven:", e);
    return NextResponse.json({ error: "Neveljaven podpis." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          // Zagotovi company_id v metapodatkih (iz checkouta).
          if (!sub.metadata?.company_id && session.metadata?.company_id) {
            sub.metadata = { ...sub.metadata, company_id: session.metadata.company_id };
          }
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("Webhook obdelava napaka:", e);
    return NextResponse.json({ error: "Napaka pri obdelavi." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
