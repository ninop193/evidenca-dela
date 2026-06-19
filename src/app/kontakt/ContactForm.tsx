"use client";

import { useState } from "react";
import { CheckCircle2, Send, Loader2 } from "lucide-react";
import { Field, Input, inputClasses, buttonClasses, cn } from "@/components/ui";
import { sendContact } from "./actions";

export function ContactForm({ defaultMessage = "" }: { defaultMessage?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function action(formData: FormData) {
    setError(null);
    setLoading(true);
    const res = await sendContact(formData);
    setLoading(false);
    if (res.ok) setSent(true);
    else setError(res.error || "Nekaj je šlo narobe.");
  }

  if (sent) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Sporočilo poslano 🎉</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
          Hvala! Odgovorili ti bomo v najkrajšem možnem času na e-pošto, ki si jo navedel.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {/* Honeypot proti spamu (skrito uporabnikom) */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ime in priimek">
          <Input name="name" required placeholder="Janez Novak" autoComplete="name" />
        </Field>
        <Field label="E-pošta">
          <Input name="email" type="email" required placeholder="janez@podjetje.si" autoComplete="email" />
        </Field>
      </div>

      <Field label="Podjetje" hint="Neobvezno">
        <Input name="company" placeholder="Podjetje d.o.o." autoComplete="organization" />
      </Field>

      <Field label="Sporočilo">
        <textarea
          name="message"
          required
          rows={5}
          defaultValue={defaultMessage}
          placeholder="Kako ti lahko pomagamo?"
          className={cn(inputClasses, "resize-y")}
        />
      </Field>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className={cn(buttonClasses("primary", "lg"), "w-full")}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Pošiljam…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Pošlji sporočilo
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        Lahko nam pišeš tudi neposredno na{" "}
        <a href="mailto:info@delovit.si" className="font-medium text-brand-700 hover:text-brand-800">
          info@delovit.si
        </a>
        .
      </p>
    </form>
  );
}
