import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase odjemalec za uporabo na strežniku (server komponente, server actions, route handlerji).
// V Next.js 16 je cookies() asinhron, zato je funkcija async.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll je klican iz server komponente; piškotke osvežuje proxy.ts.
          }
        },
      },
    },
  );
}
