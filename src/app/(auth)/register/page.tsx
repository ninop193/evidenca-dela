"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { registerCompany } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { Aurora } from "@/components/Aurora";
import { Wordmark } from "@/components/ui";

const fieldCls =
  "w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900 ring-1 ring-white/80 shadow-[inset_0_1px_2px_rgba(120,130,200,0.08)] placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-brand-500";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      companyName: String(form.get("companyName") ?? ""),
      fullName: String(form.get("fullName") ?? ""),
      taxId: String(form.get("taxId") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    const res = await registerCompany(payload);
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });
    if (signInErr) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative grid min-h-screen place-items-center px-4 py-10 text-slate-800">
      <Aurora />
      <div className="reveal w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/"><Wordmark /></Link>
        </div>
        <div className="glass iris-edge sheen rounded-3xl p-7">
          <h1 className="text-xl font-bold text-slate-900">Registracija podjetja</h1>
          <p className="mt-1 text-sm text-slate-500">Ustvari račun in začni z evidenco v nekaj minutah.</p>

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
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Že imaš račun?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Prijava
          </Link>
        </p>
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
