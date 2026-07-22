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

  // Partnerski program: če obiskovalec pride prek povezave s ?ref=KODA
  // (npr. delovit.si/?ref=NOVAK), kodo shranimo v piškotek za 90 dni. Checkout
  // jo kasneje uporabi za popust in pripis partnerju. httpOnly (bere jo strežnik).
  const ref = request.nextUrl.searchParams.get("ref");
  if (ref && /^[A-Za-z0-9_-]{1,40}$/.test(ref)) {
    supabaseResponse.cookies.set("delovit_ref", ref, {
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });
  }

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
