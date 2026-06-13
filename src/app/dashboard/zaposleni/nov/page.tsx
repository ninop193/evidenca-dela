"use client";

import { useState } from "react";
import Link from "next/link";
import { createEmployee } from "../../actions";

export default function NewEmployeePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ email: string; password: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const email = String(form.get("email") ?? "").trim().toLowerCase();

    const res = await createEmployee({
      fullName: String(form.get("fullName") ?? ""),
      email,
      password,
      jobTitle: String(form.get("jobTitle") ?? ""),
      emso: String(form.get("emso") ?? ""),
      taxId: String(form.get("taxId") ?? ""),
      weeklyHours: String(form.get("weeklyHours") ?? ""),
      employmentStartDate: String(form.get("employmentStartDate") ?? ""),
      isManagement: form.get("isManagement") === "on",
    });

    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    setDone({ email, password });
    setLoading(false);
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <div className="text-2xl">✅</div>
          <h1 className="mt-2 text-xl font-bold text-slate-900">Zaposleni dodan</h1>
          <p className="mt-2 text-sm text-slate-600">
            Posreduj te podatke zaposlenemu za prijavo na telefonu:
          </p>
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-left text-sm">
            <p>
              <span className="text-slate-500">Email:</span>{" "}
              <strong className="text-slate-900">{done.email}</strong>
            </p>
            <p className="mt-1">
              <span className="text-slate-500">Geslo:</span>{" "}
              <strong className="text-slate-900">{done.password}</strong>
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/dashboard/zaposleni"
              className="rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Nazaj na seznam
            </Link>
            <button
              onClick={() => setDone(null)}
              className="rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Dodaj še enega
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/dashboard/zaposleni" className="text-sm text-slate-500 hover:text-slate-900">
          ← Nazaj na seznam
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Dodaj zaposlenega</h1>
        <p className="mt-1 text-sm text-slate-600">
          Email in geslo bo zaposleni uporabil za prijavo na telefonu.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Ime in priimek *" name="fullName" required placeholder="Marko Horvat" />
          <Field label="Email za prijavo *" name="email" type="email" required placeholder="marko@podjetje.si" />
          <Field label="Geslo za prijavo *" name="password" type="text" required placeholder="vsaj 8 znakov" />

          <div className="border-t border-slate-200 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Podatki za evidenco (13. člen)
            </p>
            <div className="space-y-4">
              <Field label="Delovno mesto" name="jobTitle" placeholder="Mizar" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="EMŠO" name="emso" placeholder="1234567500000" />
                <Field label="Davčna številka" name="taxId" placeholder="12345678" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tedenske ure" name="weeklyHours" type="number" placeholder="40" />
                <Field label="Datum nastopa dela" name="employmentStartDate" type="date" />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="isManagement" className="h-4 w-4 rounded border-slate-300" />
                Poslovodna oseba (evidenca izrabe se ne vodi)
              </label>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 py-3 text-base font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Dodajam…" : "Dodaj zaposlenega"}
          </button>
        </form>
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
