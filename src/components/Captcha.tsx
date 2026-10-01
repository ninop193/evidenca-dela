"use client";

import Script from "next/script";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

// Cloudflare Turnstile — neviden preizkus "ali si človek" (zaščita pred boti).
// Žeton gre v Supabase Auth (captchaToken), ki ga preveri s tajnim ključem.
// Brez NEXT_PUBLIC_TURNSTILE_SITE_KEY se ne prikaže nič in obrazci delajo kot prej.
export const CAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
export const CAPTCHA_MISSING = "Počakaj trenutek, da se zaključi preverjanje, da nisi robot.";

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

export type CaptchaHandle = { reset: () => void };

// Vsak žeton velja samo enkrat → po vsakem klicu Supabase pokliči reset().
export const Captcha = forwardRef<CaptchaHandle, { onToken: (token: string | null) => void }>(
  function Captcha({ onToken }, ref) {
    const el = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const onTokenRef = useRef(onToken);
    useEffect(() => {
      onTokenRef.current = onToken;
    }, [onToken]);

    const render = useCallback(() => {
      if (!CAPTCHA_SITE_KEY || !window.turnstile || !el.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(el.current, {
        sitekey: CAPTCHA_SITE_KEY,
        language: "sl",
        callback: (t: string) => onTokenRef.current(t),
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": () => onTokenRef.current(null),
      });
    }, []);

    useEffect(() => {
      render();
      return () => {
        if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      };
    }, [render]);

    useImperativeHandle(ref, () => ({
      reset() {
        if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
        onTokenRef.current(null);
      },
    }));

    if (!CAPTCHA_SITE_KEY) return null;
    return (
      <>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={render}
        />
        <div ref={el} className="flex min-h-[65px] justify-center" />
      </>
    );
  },
);
