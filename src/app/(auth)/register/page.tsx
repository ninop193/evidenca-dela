"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerCompany } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Field, Input, Wordmark } from "@/components/ui";

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
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/">
            <Wordmark />
          </Link>
        </div>
        <Card className="p-7">
          <h1 className="text-xl font-bold text-slate-900">Registracija podjetja</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ustvari račun in začni z evidenco v nekaj minutah.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Ime podjetja">
              <Input name="companyName" required placeholder="npr. Mizarstvo Novak s.p." />
            </Field>
            <Field label="Tvoje ime in priimek">
              <Input name="fullName" required placeholder="Janez Novak" />
            </Field>
            <Field label="Davčna številka podjetja" hint="Neobvezno">
              <Input name="taxId" placeholder="SI12345678" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email">
                <Input name="email" type="email" required placeholder="ti@podjetje.si" />
              </Field>
              <Field label="Geslo" hint="Vsaj 8 znakov">
                <Input name="password" type="password" required placeholder="••••••••" />
              </Field>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? "Ustvarjam račun…" : "Ustvari račun"}
            </Button>
          </form>
        </Card>

        <p className="mt-5 text-center text-sm text-slate-600">
          Že imaš račun?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Prijava
          </Link>
        </p>
      </div>
    </main>
  );
}
