import { NextRequest, NextResponse } from "next/server";
import {
  welcomeEmail,
  trialEndingEmail,
  paymentSuccessEmail,
  paymentFailedEmail,
  authConfirmEmail,
  authResetEmail,
  employeeWelcomeEmail,
} from "@/lib/email/templates";

export const dynamic = "force-dynamic";

// Predogled transakcijskih mailov — SAMO izven produkcije.
// /api/dev/email?t=welcome|trial|paid|failed
export async function GET(req: NextRequest) {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "Ni na voljo." }, { status: 404 });
  }
  const t = req.nextUrl.searchParams.get("t") ?? "welcome";
  const sample = { fullName: "Nino Pavalec", companyName: "Primer d.o.o." };

  const map = {
    welcome: welcomeEmail({ ...sample, trialDaysLeft: 14 }),
    trial: trialEndingEmail({ fullName: sample.fullName, daysLeft: 2 }),
    paid: paymentSuccessEmail({
      fullName: sample.fullName,
      amount: "23,18 €",
      interval: "month",
      nextDate: "13. julij 2026",
    }),
    failed: paymentFailedEmail({ fullName: sample.fullName }),
    "confirm-signup": authConfirmEmail(),
    "reset-password": authResetEmail(),
    "employee-welcome": employeeWelcomeEmail({
      fullName: "Marko Horvat",
      email: "marko@gostilna.si",
      password: "geslo12345",
      companyName: "Gostilna Pri Lipi",
    }),
  } as const;

  const email = map[t as keyof typeof map] ?? map.welcome;
  return new NextResponse(email.html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
