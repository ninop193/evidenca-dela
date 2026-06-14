import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Po Google prijavi: zamenja kodo za sejo in usmeri uporabnika.
// Nov uporabnik (brez podjetja) → /dobrodosli; obstoječi → glede na vlogo.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    // Nov uporabnik prek Googla — še nima podjetja.
    return NextResponse.redirect(`${origin}/dobrodosli`);
  }
  return NextResponse.redirect(
    `${origin}/${profile.role === "admin" ? "dashboard" : "zigosanje"}`,
  );
}
