import "server-only";
import { createHash } from "node:crypto";
import { after } from "next/server";
import { cookies, headers } from "next/headers";

// Meta Conversions API — isti konverzijski dogodek kot MetaPixelEvent, poslan še s strežnika
// (ga ne ustavijo blokatorji oglasov). Meta ga z browser dogodkom združi prek event_id.
// Pošlje se SAMO, če je obiskovalec v pasici dal privolitev (piškotek delovit_consent).
// Brez NEXT_PUBLIC_META_PIXEL_ID ali META_CAPI_TOKEN se ne pošlje nič.
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const TOKEN = process.env.META_CAPI_TOKEN ?? "";
// Neobvezno: koda iz Events Manager → Test events, za preverjanje brez štetja dogodkov.
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE ?? "";
const API_VERSION = "v23.0";

// SHA-256 v obliki, ki jo pričakuje Meta (male črke, brez presledkov).
export function metaHash(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

// Zgoščeni podatki za ujemanje (advanced matching) — enaki za pixel in Conversions API.
export function metaUserData(profile: { id: string; email: string | null }) {
  return {
    ...(profile.email ? { em: metaHash(profile.email) } : {}),
    external_id: metaHash(profile.id),
  };
}

export async function sendMetaEvent({
  event,
  eventId,
  path,
  userData,
  customData,
}: {
  event: string;
  eventId: string;
  path: string;
  userData: { em?: string; external_id: string };
  customData?: Record<string, string | number>;
}) {
  if (!PIXEL_ID || !TOKEN) return;
  const jar = await cookies();
  if (jar.get("delovit_consent")?.value !== "granted") return;

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ua = h.get("user-agent");
  const fbp = jar.get("_fbp")?.value;
  const fbc = jar.get("_fbc")?.value;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.delovit.si";

  const body = {
    data: [
      {
        event_name: event,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: `https://${host}${path}`,
        user_data: {
          em: userData.em ? [userData.em] : undefined,
          external_id: [userData.external_id],
          client_ip_address: ip,
          client_user_agent: ua ?? undefined,
          fbp,
          fbc,
        },
        custom_data: customData,
      },
    ],
    ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
  };

  // Po odgovoru, da ne upočasni strani. Napaka se le zapiše — stran mora delovati naprej.
  after(async () => {
    try {
      const res = await fetch(
        `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(TOKEN)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) console.error("Meta CAPI", event, res.status, await res.text());
    } catch (err) {
      console.error("Meta CAPI", event, err);
    }
  });
}
