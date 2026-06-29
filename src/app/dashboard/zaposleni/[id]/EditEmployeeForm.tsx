"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateEmployee } from "../../actions";
import { Button, Card, Field, Input } from "@/components/ui";

type Employee = {
  id: string;
  full_name: string;
  job_title: string | null;
  emso: string | null;
  tax_id: string | null;
  weekly_hours: number | null;
  employment_start_date: string | null;
  is_management: boolean | null;
  email?: string | null;
};

export function EditEmployeeForm({ employee }: { employee: Employee }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await updateEmployee({
      id: employee.id,
      fullName: String(form.get("fullName") ?? ""),
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
    router.push("/dashboard/zaposleni");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <Link href="/dashboard/zaposleni" className="text-sm text-slate-500 hover:text-slate-900">
        ← Nazaj na seznam
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Uredi zaposlenega</h1>
      <p className="mt-1 text-sm text-slate-500">
        Popravi podatke v evidenci. Email in geslo za prijavo se tu ne spreminjata.
      </p>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Ime in priimek *">
            <Input name="fullName" required defaultValue={employee.full_name} />
          </Field>

          {employee.email && (
            <Field label="Email za prijavo" hint="Tega tukaj ni mogoče spremeniti">
              <Input value={employee.email} disabled readOnly className="opacity-70" />
            </Field>
          )}

          <div className="border-t border-slate-100 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Podatki za evidenco (13. člen)
            </p>
            <div className="space-y-4">
              <Field label="Delovno mesto">
                <Input name="jobTitle" defaultValue={employee.job_title ?? ""} placeholder="Mizar" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="EMŠO">
                  <Input name="emso" defaultValue={employee.emso ?? ""} placeholder="1234567500000" />
                </Field>
                <Field label="Davčna številka">
                  <Input name="taxId" defaultValue={employee.tax_id ?? ""} placeholder="12345678" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tedenske ure">
                  <Input
                    name="weeklyHours"
                    type="number"
                    defaultValue={employee.weekly_hours ?? ""}
                    placeholder="40"
                  />
                </Field>
                <Field label="Datum nastopa dela">
                  <Input
                    name="employmentStartDate"
                    type="date"
                    defaultValue={employee.employment_start_date ?? ""}
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="isManagement"
                  defaultChecked={!!employee.is_management}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                Poslovodna oseba (evidenca izrabe se ne vodi)
              </label>
              <p className="text-xs text-slate-400">
                Obkljukaj samo za vodstvene osebe (npr. direktor, prokurist). Za navadne
                zaposlene pusti prazno.
              </p>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{error}</p>
          )}

          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? "Shranjujem…" : "Shrani spremembe"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
