"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Aurora } from "@/components/Aurora";
import { Wordmark } from "@/components/ui";

const fieldCls =
  "w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900 ring-1 ring-white/80 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-brand-500";

// Prva nastavitev gesla za povabljenega zaposlenega (povezava iz maila).
export default function NastaviGesloPage() {
  const [ready, setReady] = useState<"checking" | "ok" | "invalid">("checking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preveri, ali je povabilo vzpostavilo sejo (uporabnik je prišel prek povezave).
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setReady(user ? "ok" : "invalid");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const pw1 = String(form.get("password") ?? "");
    const pw2 = String(form.get("password2") ?? "");
    if (pw1.length < 8) {
      setError("Geslo mora imeti vsaj 8 znakov.");
      return;
    }
    if (pw1 !== pw2) {
      setError("Gesli se ne ujemata.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password: pw1 });
    setLoading(false);
    if (err) {
      setError("Napaka pri shranjevanju gesla. Poskusi znova.");
      return;
    }
    // Trda navigacija; strežniški role-guard zaposlene preusmeri na /zigosanje.
    window.location.assign("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 text-slate-800">
      <Aurora />
      <div className="reveal w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Link href="/"><Wordmark /></Link>
        </div>
        <div className="glass iris-edge sheen rounded-3xl p-7">
          {ready === "invalid" ? (
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-900">Povezava ni veljavna</h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Povabilo je poteklo ali je bilo že uporabljeno. Prosite delodajalca, da vam
                pošlje novo povabilo.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Na prijavo
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-slate-900">Dobrodošli v Delovit 👋</h1>
              <p className="mt-1 text-sm text-slate-500">
                Nastavite si geslo, s katerim se boste prijavljali v aplikacijo.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Geslo</span>
                  <input name="password" type="password" required placeholder="vsaj 8 znakov" className={fieldCls} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Ponovi geslo</span>
                  <input name="password2" type="password" required placeholder="••••••••" className={fieldCls} />
                </label>
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || ready !== "ok"}
                  className="w-full rounded-full bg-brand-600 py-3 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(29,78,216,0.6)] transition hover:bg-brand-500 disabled:opacity-50"
                >
                  {loading ? "Shranjujem…" : "Shrani geslo in začni"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
