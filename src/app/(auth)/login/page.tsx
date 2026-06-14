"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Field, Input, Wordmark } from "@/components/ui";

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

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    router.push(profile?.role === "admin" ? "/dashboard" : "/zigosanje");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Link href="/">
            <Wordmark />
          </Link>
        </div>
        <Card className="p-7">
          <h1 className="text-xl font-bold text-slate-900">Prijava</h1>
          <p className="mt-1 text-sm text-slate-500">Dobrodošel nazaj.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Email">
              <Input name="email" type="email" required placeholder="ti@podjetje.si" />
            </Field>
            <Field label="Geslo">
              <Input name="password" type="password" required placeholder="••••••••" />
            </Field>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? "Prijavljam…" : "Prijava"}
            </Button>
          </form>
        </Card>

        <p className="mt-5 text-center text-sm text-slate-600">
          Nimaš računa?{" "}
          <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Registriraj podjetje
          </Link>
        </p>
      </div>
    </main>
  );
}
