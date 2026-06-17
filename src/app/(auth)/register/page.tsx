"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Aurora } from "@/components/Aurora";
import { Wordmark } from "@/components/ui";
import { GoogleButton } from "@/components/GoogleButton";

const fieldCls =
  "w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900 ring-1 ring-white/80 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-brand-500";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const companyName = String(form.get("companyName") ?? "").trim();
    const fullName = String(form.get("fullName") ?? "").trim();
    const taxId = String(form.get("taxId") ?? "").trim();

    if (password.length < 8) {
      setError("Geslo mora imeti vsaj 8 znakov.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { company_name: companyName, full_name: fullName, tax_id: taxId || null },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    setLoading(false);

    if (err) {
      setError(
        err.message.toLowerCase().includes("already")
          ? "Ta email je že registriran. Poskusi se prijaviti."
          : "Registracija ni uspela. Poskusi znova.",
      );
      return;
    }
    // Email obstaja in je že potrjen → Supabase vrne uporabnika brez identitet.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("Ta email je že registriran. Poskusi se prijaviti.");
      return;
    }
    setSentTo(email);
  }

  async function resend() {
    if (!sentTo) return;
    const supabase = createClient();
    await supabase.auth.resend({
      type: "signup",
      email: sentTo,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setResent(true);
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 text-slate-800">
      <Aurora />
      <div className="reveal w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/"><Wordmark /></Link>
        </div>

        {sentTo ? (
          <div className="glass iris-edge sheen rounded-3xl p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <MailCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">Potrdi svoj email</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Poslali smo potrditveno povezavo na{" "}
              <strong className="text-slate-900">{sentTo}</strong>. Odpri email in klikni povezavo
              za nadaljevanje.
            </p>
            <div className="mt-6 rounded-xl bg-white/50 p-3 text-xs text-slate-500 ring-1 ring-white/70">
              Ne najdeš emaila? Preveri mapo z neželeno pošto (spam).
            </div>
            <button
              onClick={resend}
              disabled={resent}
              className="mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50"
            >
              {resent ? "Email ponovno poslan ✓" : "Pošlji ponovno"}
            </button>
          </div>
        ) : (
          <div className="glass iris-edge sheen rounded-3xl p-7">
            <h1 className="text-xl font-bold text-slate-900">Registracija podjetja</h1>
            <p className="mt-1 text-sm text-slate-500">Ustvari račun in začni z evidenco v nekaj minutah.</p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
              ✦ 14 dni brezplačno, brez kartice
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <L label="Ime podjetja">
                <input name="companyName" required placeholder="npr. Mizarstvo Novak s.p." className={fieldCls} />
              </L>
              <L label="Tvoje ime in priimek">
                <input name="fullName" required placeholder="Janez Novak" className={fieldCls} />
              </L>
              <L label="Davčna številka podjetja" hint="Neobvezno">
                <input name="taxId" placeholder="SI12345678" className={fieldCls} />
              </L>
              <div className="grid gap-4 sm:grid-cols-2">
                <L label="Email">
                  <input name="email" type="email" required placeholder="ti@podjetje.si" className={fieldCls} />
                </L>
                <L label="Geslo" hint="Vsaj 8 znakov">
                  <input name="password" type="password" required placeholder="••••••••" className={fieldCls} />
                </L>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-3 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(29,78,216,0.6)] transition hover:bg-brand-500 disabled:opacity-50"
              >
                {loading ? "Ustvarjam račun…" : "Ustvari račun"}
                {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200/70" />
              ali
              <span className="h-px flex-1 bg-slate-200/70" />
            </div>
            <GoogleButton label="Registracija z Googlom" />
          </div>
        )}

        {!sentTo && (
          <p className="mt-5 text-center text-sm text-slate-500">
            Že imaš račun?{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Prijava
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

function L({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {hint && <span className="ml-1 text-xs text-slate-400">· {hint}</span>}
      </span>
      {children}
    </label>
  );
}
