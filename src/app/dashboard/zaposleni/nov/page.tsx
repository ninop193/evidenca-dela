"use client";

import { useState } from "react";
import Link from "next/link";
import { createEmployee } from "../../actions";
import { Button, Card, Field, Input, buttonClasses, selectClasses } from "@/components/ui";
import { SloDateInput } from "@/components/SloDateInput";

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
      workerType: String(form.get("workerType") ?? "zaposlen"),
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
      <main className="mx-auto max-w-md px-4 py-10">
        <Card className="p-7 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-2xl">✅</div>
          <h1 className="mt-3 text-xl font-bold text-slate-900">Zaposleni dodan</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Posreduj te podatke zaposlenemu za prijavo na telefonu:
          </p>
          <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-left text-sm ring-1 ring-slate-100">
            <p>
              <span className="text-slate-500">Email:</span>{" "}
              <strong className="text-slate-900">{done.email}</strong>
            </p>
            <p>
              <span className="text-slate-500">Geslo:</span>{" "}
              <strong className="text-slate-900">{done.password}</strong>
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/dashboard/zaposleni" className={buttonClasses("primary", "lg")}>
              Nazaj na seznam
            </Link>
            <Button variant="secondary" size="lg" onClick={() => setDone(null)}>
              Dodaj še enega
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <Link href="/dashboard/zaposleni" className="text-sm text-slate-500 hover:text-slate-900">
        ← Nazaj na seznam
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Dodaj zaposlenega</h1>
      <p className="mt-1 text-sm text-slate-500">Email in geslo bo zaposleni uporabil za prijavo na telefonu.</p>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Ime in priimek *">
            <Input name="fullName" required placeholder="Marko Horvat" />
          </Field>
          <Field label="Email za prijavo *">
            <Input name="email" type="email" required placeholder="marko@podjetje.si" />
          </Field>
          <Field label="Geslo za prijavo *" hint="Vsaj 8 znakov">
            <Input name="password" type="text" required placeholder="npr. geslo123" />
          </Field>

          <div className="border-t border-slate-100 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Podatki za evidenco (13. člen)
            </p>
            <div className="space-y-4">
              <Field label="Vrsta dela">
                <select name="workerType" defaultValue="zaposlen" className={selectClasses}>
                  <option value="zaposlen">Zaposleni</option>
                  <option value="student">Študent / dijak (napotnica)</option>
                </select>
              </Field>
              <Field label="Delovno mesto">
                <Input name="jobTitle" placeholder="Mizar" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="EMŠO">
                  <Input name="emso" placeholder="1234567500000" />
                </Field>
                <Field label="Davčna številka">
                  <Input name="taxId" placeholder="12345678" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tedenske ure">
                  <Input name="weeklyHours" type="number" placeholder="40" />
                </Field>
                <Field label="Datum nastopa dela">
                  <SloDateInput name="employmentStartDate" />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="isManagement" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                Poslovodna oseba (evidenca izrabe se ne vodi)
              </label>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{error}</p>
          )}

          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? "Dodajam…" : "Dodaj zaposlenega"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
