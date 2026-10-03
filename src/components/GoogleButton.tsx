"use client";

import { useState, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";

// Brskalniki znotraj aplikacij (Facebook, Instagram, Messenger, TikTok …) in Android WebView.
// Google v njih zavrne prijavo ("403: disallowed_useragent"), zato tam gumba ne ponudimo.
const IN_APP_UA = /FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger|MicroMessenger|Line\/|TikTok|musical_ly|BytedanceWebview|Snapchat|Pinterest|LinkedInApp|; wv\)/i;
const noop = () => () => {};
const useInAppBrowser = () =>
  useSyncExternalStore(noop, () => IN_APP_UA.test(navigator.userAgent), () => false);
const isAndroid = () => /Android/i.test(navigator.userAgent);

// Gumb "Nadaljuj z Googlom" — sproži Google OAuth prek Supabase.
export function GoogleButton({ label = "Nadaljuj z Googlom" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inApp = useInAppBrowser();

  if (inApp) return <InAppNotice />;

  async function handleClick() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) {
      setError("Prijava z Googlom trenutno ni na voljo.");
      setLoading(false);
    }
    // ob uspehu se brskalnik preusmeri na Google
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2.5 rounded-full bg-white/80 px-5 py-3 text-base font-semibold text-slate-700 ring-1 ring-white/90 shadow-[0_8px_22px_-10px_rgba(80,90,170,0.35)] transition hover:bg-white disabled:opacity-60"
      >
        <GoogleLogo />
        {loading ? "Preusmerjam…" : label}
      </button>
      {error && <p className="mt-2 text-center text-sm text-rose-600">{error}</p>}
    </div>
  );
}

// Namesto Google gumba: navodilo + na Androidu povezava, ki stran odpre v Chromu.
function InAppNotice() {
  const { host, pathname, search } = window.location;
  const chromeUrl = `intent://${host}${pathname}${search}#Intent;scheme=https;package=com.android.chrome;end`;
  return (
    <div className="rounded-2xl bg-white/60 px-4 py-3 text-center text-sm leading-relaxed text-slate-600 ring-1 ring-white/80">
      <p>
        <GoogleLogo className="mr-1.5 inline h-4 w-4 align-[-3px]" />
        Prijava z Googlom v tem brskalniku ne deluje. Uporabi <strong className="text-slate-800">email in geslo</strong>{" "}
        zgoraj{isAndroid() ? " ali odpri stran v Chromu." : " ali odpri stran v Safariju (meni ⋯ → Odpri v brskalniku)."}
      </p>
      {isAndroid() && (
        <a
          href={chromeUrl}
          className="mt-2.5 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          Odpri v Chromu
        </a>
      )}
    </div>
  );
}

function GoogleLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
