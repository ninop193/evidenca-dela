import { createBrowserClient } from "@supabase/ssr";

// Supabase odjemalec za uporabo v brskalniku (client komponente).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
