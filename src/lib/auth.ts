import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "employee";

export type Profile = {
  id: string;
  company_id: string;
  role: Role;
  email: string | null;
  full_name: string | null;
};

// Vrne profil trenutno prijavljenega uporabnika (ali null, če ni prijavljen).
// Bere se na strežniku; RLS dovoli branje lastne vrstice.
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("id, company_id, role, email, full_name")
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
}
