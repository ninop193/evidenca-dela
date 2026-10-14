import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NewEmployeeForm } from "./NewEmployeeForm";

export default async function NewEmployeePage() {
  const [supabase, profile] = await Promise.all([createClient(), getProfile()]);
  // Z vklopljeno skupno napravo je email neobvezen (zaposleni žigosa s PIN kodo).
  const { data: company } = profile
    ? await supabase.from("companies").select("kiosk_enabled").eq("id", profile.company_id).maybeSingle()
    : { data: null };
  return <NewEmployeeForm kioskEnabled={!!company?.kiosk_enabled} />;
}
