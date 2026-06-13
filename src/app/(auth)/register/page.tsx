"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerCompany } from "../actions";
import { createClient } from "@/lib/supabase/client";

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

    // Takojšnja prijava po uspešni registraciji
    const supabase = createClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });
    if (signInErr) {
      // Račun je ustvarjen, le samodejna prijava ni uspela
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900">Registracija podjetja</h1>
        <p className="mt-1 text-sm text-slate-600">
          Ustvari račun in začni z evidenco v nekaj minutah.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Ime podjetja" name="companyName" required placeholder="npr. Mizarstvo Novak s.p." />
          <Field label="Tvoje ime in priimek" name="fullName" required placeholder="Janez Novak" />
          <Field label="Davčna številka podjetja (neobvezno)" name="taxId" placeholder="SI12345678" />
          <Field label="Email" name="email" type="email" required placeholder="ti@podjetje.si" />
          <Field label="Geslo" name="password" type="password" required placeholder="vsaj 8 znakov" />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Ustvarjam račun…" : "Ustvari račun"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Že imaš račun?{" "}
          <Link href="/login" className="font-semibold text-slate-900 underline">
            Prijava
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-base text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
      />
    </label>
  );
}
