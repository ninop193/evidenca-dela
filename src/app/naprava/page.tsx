import type { Metadata } from "next";
import { Aurora } from "@/components/Aurora";
import { getAccess } from "@/lib/billing";
import { cookies } from "next/headers";
import { ensurePins, getKioskDevice, KIOSK_COOKIE } from "@/lib/kiosk";
import { KioskScreen, PairScreen, KioskMessage } from "./KioskScreen";

export const metadata: Metadata = {
  title: "Skupna naprava",
  robots: { index: false, follow: false },
  manifest: "/naprava/manifest.webmanifest",
};

// Skupna naprava na delovnem mestu. Nepovezan brskalnik vidi samo vnos kode za
// povezavo; povezana pa seznam imen zaposlenih (brez ur in drugih podatkov).
export default async function NapravaPage() {
  const ctx = await getKioskDevice();

  return (
    <div className="relative min-h-screen text-slate-800">
      <Aurora />
      {!ctx ? (
        <PairScreen wasConnected={(await cookies()).has(KIOSK_COOKIE)} />
      ) : !getAccess(ctx.company).hasAccess ? (
        <KioskMessage
          companyName={ctx.company.name}
          text="Žigosanje trenutno ni na voljo. Obrnite se na delodajalca."
        />
      ) : (
        <KioskScreen companyName={ctx.company.name} employees={await activeEmployees(ctx)} />
      )}
    </div>
  );
}

async function activeEmployees(ctx: NonNullable<Awaited<ReturnType<typeof getKioskDevice>>>) {
  // Novo dodani zaposleni dobijo kodo tudi, če je delodajalec še ni pogledal.
  await ensurePins(ctx.db, ctx.company.id);
  const { data } = await ctx.db
    .from("employees")
    .select("id, full_name")
    .eq("company_id", ctx.company.id)
    .eq("active", true)
    .order("full_name", { ascending: true });
  return (data ?? []).map((e) => ({ id: e.id as string, name: e.full_name as string }));
}
