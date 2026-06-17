"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Odjava — počisti sejo in vrne na prijavo.
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
