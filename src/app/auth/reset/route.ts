import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Povratna pot za ponastavitev gesla: vzpostavi sejo in pelje na stran za novo geslo.
// token_hash deluje v kateremkoli brskalniku; code samo v tistem, kjer je bila oddana zahteva.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const supabase = await createClient();
  if (tokenHash) {
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
  } else if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}/ponastavi-geslo`);
}
