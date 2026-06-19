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

  // Zaščitene poti: kdor ni prijavljen, gre na /login.
  // Javne poti (login, registracija, kalkulator, domača stran) so dovoljene vsem.
  const publicPaths = [
    "/login", "/register", "/kalkulator", "/kontakt", "/auth", "/pravno", "/api",
    "/pozabljeno-geslo", "/ponastavi-geslo",
    // SEO / crawler poti — morajo biti dostopne brez prijave.
    "/sitemap", "/opengraph-image", "/twitter-image", "/robots",
  ];
  const isPublic =
    request.nextUrl.pathname === "/" ||
    publicPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
