import "server-only";
import { createClient } from "@supabase/supabase-js";

// Admin odjemalec s service-role ključem — OBIDE RLS.
// Uporablja se IZKLJUČNO na strežniku (server actions, route handlerji, webhooki).
// "server-only" zgoraj poskrbi, da build pade, če bi to kdo pomotoma uvozil v brskalnik.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
