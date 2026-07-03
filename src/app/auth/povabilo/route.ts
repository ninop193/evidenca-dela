import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Povabilo zaposlenega: klik v mailu → preveri enkratni žeton, vzpostavi sejo
// in usmeri na nastavitev gesla. Ob pretekli/uporabljeni povezavi stran
// /nastavi-geslo sama pokaže ustrezno sporočilo (brez seje).
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const tokenHash = searchParams.get("token_hash");

  if (tokenHash) {
    const supabase = await createClient();
    await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
  }

  return NextResponse.redirect(`${origin}/nastavi-geslo`);
}
