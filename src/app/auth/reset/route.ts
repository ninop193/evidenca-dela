import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Povratna pot za ponastavitev gesla: zamenja kodo za sejo in pelje na stran za novo geslo.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}/ponastavi-geslo`);
}
