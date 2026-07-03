"use client";

import { useState } from "react";
import Link from "next/link";
import { createEmployee } from "../../actions";
import { Button, Card, Field, Input, buttonClasses, selectClasses } from "@/components/ui";
import { SloDateInput } from "@/components/SloDateInput";

export default function NewEmployeePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ email: string; inviteSent: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();

    const res = await createEmployee({
      fullName: String(form.get("fullName") ?? ""),
      email,
      jobTitle: String(form.get("jobTitle") ?? ""),
      emso: String(form.get("emso") ?? ""),
      taxId: String(form.get("taxId") ?? ""),
      weeklyHours: String(form.get("weeklyHours") ?? ""),
      employmentStartDate: String(form.get("employmentStartDate") ?? ""),
      birthDate: String(form.get("birthDate") ?? ""),
      isManagement: form.get("isManagement") === "on",
      workerType: String(form.get("workerType") ?? "zaposlen"),
    });

    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    setDone({ email, inviteSent: !!res.inviteSent });
    setLoading(false);
  }

  if (done) {
    return (
      <main className="mx-auto max-w-md px-4 py-10">
        <Card className="p-7 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-2xl">✅</div>
          <h1 className="mt-3 text-xl font-bold text-slate-900">Zaposleni dodan</h1>
          {done.inviteSent ? (
            <p className="mt-1.5 text-sm text-slate-500">
              Povabilo je poslano na <strong className="text-slate-900">{done.email}</strong>.
              Zaposleni si prek povezave v mailu sam nastavi geslo in se prijavi na telefonu.
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-amber-700">
              Zaposleni je dodan, a povabila na <strong>{done.email}</strong> ni bilo mogoče
              poslati. Na seznamu zaposlenih izberi »Pošlji povabilo znova«.
            </p>
          )}
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
      <p className="mt-1 text-sm text-slate-500">
        Na ta email bo zaposleni prejel povabilo, prek katerega si sam nastavi geslo.
      </p>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Ime in priimek *">
            <Input name="fullName" required placeholder="Marko Horvat" />
          </Field>
          <Field label="Email za prijavo *" hint="Sem pošljemo povabilo za nastavitev gesla">
            <Input name="email" type="email" required placeholder="marko@podjetje.si" />
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
              <Field
                label="Datum rojstva"
                hint="Za mladoletne dijake (<18): dnevna meja 8 ur (146. in 193. člen ZDR-1). Pusti prazno za polnoletne."
              >
                <SloDateInput name="birthDate" />
              </Field>
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
