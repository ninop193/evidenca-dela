import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

// V Next.js 16 je "proxy" novo ime za "middleware" (ista funkcionalnost).
// Teče pred vsako zahtevo in osveži/preveri prijavo uporabnika.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Teci na vseh poteh razen statičnih datotek in slik.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
