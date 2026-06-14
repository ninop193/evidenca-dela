"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Aurora } from "@/components/Aurora";
import { Wordmark } from "@/components/ui";

const fieldCls =
  "w-full rounded-xl bg-white/5 px-3.5 py-2.5 text-[15px] text-white ring-1 ring-white/10 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-brand-400";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    const supabase = createClient();
    const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr || !data.user) {
      setError("Napačen email ali geslo.");
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase.from("users").select("role").eq("id", data.user.id).single();
    router.push(profile?.role === "admin" ? "/dashboard" : "/zigosanje");
    router.refresh();
  }

  return (
    <main className="relative grid min-h-screen place-items-center px-4 py-10 text-slate-100">
      <Aurora />
      <div className="reveal w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Link href="/"><Wordmark dark /></Link>
        </div>
        <div className="glass glass-edge rounded-3xl p-7">
          <h1 className="text-xl font-bold text-white">Prijava</h1>
          <p className="mt-1 text-sm text-slate-400">Dobrodošel nazaj.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">Email</span>
              <input name="email" type="email" required placeholder="ti@podjetje.si" className={fieldCls} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-300">Geslo</span>
              <input name="password" type="password" required placeholder="••••••••" className={fieldCls} />
            </label>

            {error && (
              <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300 ring-1 ring-red-500/20">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-base font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
            >
              {loading ? "Prijavljam…" : "Prijava"}
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-400">
          Nimaš računa?{" "}
          <Link href="/register" className="font-semibold text-brand-300 hover:text-brand-200">
            Registriraj podjetje
          </Link>
        </p>
      </div>
    </main>
  );
}
