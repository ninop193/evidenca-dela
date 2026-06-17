import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Po potrditvi emaila (klik v potrditveni povezavi): vzpostavi sejo,
// ustvari podjetje iz podatkov ob registraciji in usmeri naprej.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");

  const supabase = await createClient();
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=confirm`);
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=confirm`);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    return NextResponse.redirect(
      `${origin}/${profile.role === "admin" ? "dashboard" : "zigosanje"}`,
    );
  }

  // Še ni podjetja → ustvari iz podatkov, ki jih je vpisal ob registraciji.
  const meta = (user.user_metadata ?? {}) as {
    company_name?: string;
    full_name?: string;
    tax_id?: string | null;
  };
  if (meta.company_name) {
    const { error } = await supabase.rpc("create_company_and_admin", {
      p_company_name: meta.company_name,
      p_full_name: meta.full_name || meta.company_name,
      p_tax_id: meta.tax_id || null,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}/narocnina?welcome=1`);
    }
  }

  // Brez podatkov o podjetju (npr. Google) → dokončaj registracijo.
  return NextResponse.redirect(`${origin}/dobrodosli`);
}
