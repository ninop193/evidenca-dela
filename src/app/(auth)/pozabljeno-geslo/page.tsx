"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Aurora } from "@/components/Aurora";
import { Wordmark } from "@/components/ui";

const fieldCls =
  "w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900 ring-1 ring-white/80 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-brand-500";

export default function PozabljenoGesloPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim().toLowerCase();

    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setLoading(false);
    if (err) {
      setError("Napaka pri pošiljanju. Poskusi znova.");
      return;
    }
    setSent(true);
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 text-slate-800">
      <Aurora />
      <div className="reveal w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Link href="/"><Wordmark /></Link>
        </div>
        <div className="glass iris-edge sheen rounded-3xl p-7">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <MailCheck className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-xl font-bold text-slate-900">Preveri svoj email</h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Če račun obstaja, smo poslali povezavo za ponastavitev gesla. Klikni jo in nastavi
                novo geslo.
              </p>
              <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700">
                Nazaj na prijavo
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-slate-900">Pozabljeno geslo</h1>
              <p className="mt-1 text-sm text-slate-500">
                Vpiši svoj email in poslali ti bomo povezavo za ponastavitev.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
                  <input name="email" type="email" required placeholder="ti@podjetje.si" className={fieldCls} />
                </label>
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-brand-600 py-3 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(29,78,216,0.6)] transition hover:bg-brand-500 disabled:opacity-50"
                >
                  {loading ? "Pošiljam…" : "Pošlji povezavo"}
                </button>
              </form>
            </>
          )}
        </div>
        {!sent && (
          <p className="mt-5 text-center text-sm text-slate-500">
            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Nazaj na prijavo
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
