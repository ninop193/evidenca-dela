import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Osveži Supabase sejo ob vsaki zahtevi in (po potrebi) preusmeri neprijavljene uporabnike.
// Kliče se iz proxy.ts (v Next.js 16 je "proxy" novo ime za "middleware").
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // POMEMBNO: ne dodajaj logike med createServerClient in getUser() —
  // sicer lahko pride do naključnih odjav uporabnikov.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Zaščitimo SAMO dejansko zaščitene dele aplikacije. Vse ostalo (javne strani,
  // SEO/crawler poti in neznane poti, ki pokažejo 404) je dostopno brez prijave.
  // Vsaka od teh strani ima tudi lasten auth check (obramba v globino).
  const protectedPrefixes = ["/dashboard", "/zigosanje", "/moje-ure", "/narocnina", "/dobrodosli", "/izpis"];
  const path = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((p) => path === p || path.startsWith(p + "/"));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
