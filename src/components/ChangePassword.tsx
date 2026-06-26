"use client";

import { useState } from "react";
import { KeyRound, X, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/components/ui";

// Sprememba gesla za prijavljenega uporabnika (zaposleni ali admin).
// Trigger je lahko ikona (kompaktno, za mobilno glavo) ali besedilo (za meni).
export function ChangePassword({
  variant = "icon",
  className,
}: {
  variant?: "icon" | "text";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [show, setShow] = useState(false);

  function reset() {
    setError(null);
    setDone(false);
    setShow(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const pw1 = String(form.get("password") ?? "");
    const pw2 = String(form.get("password2") ?? "");
    if (pw1.length < 8) {
      setError("Geslo mora imeti vsaj 8 znakov.");
      return;
    }
    if (pw1 !== pw2) {
      setError("Gesli se ne ujemata.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password: pw1 });
    setLoading(false);
    if (err) {
      setError(
        err.message?.toLowerCase().includes("different")
          ? "Novo geslo mora biti drugačno od starega."
          : "Napaka pri shranjevanju. Poskusi znova.",
      );
      return;
    }
    setDone(true);
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => { reset(); setOpen(true); }}
          aria-label="Spremeni geslo"
          className={cn(
            "grid h-9 w-9 place-items-center rounded-full bg-white/60 text-slate-600 ring-1 ring-white/70 transition hover:bg-white/80 hover:text-slate-900",
            className,
          )}
        >
          <KeyRound className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => { reset(); setOpen(true); }}
          className={cn(
            "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-white/60",
            className,
          )}
        >
          <KeyRound className="h-4 w-4" /> Spremeni geslo
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            className="glass-strong iris-edge w-full max-w-sm rounded-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                {done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <KeyRound className="h-5 w-5" />}
              </div>
              <button
                onClick={() => !loading && setOpen(false)}
                className="text-slate-400 transition hover:text-slate-700"
                aria-label="Zapri"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {done ? (
              <div className="mt-4">
                <h3 className="text-lg font-bold text-slate-900">Geslo spremenjeno</h3>
                <p className="mt-1.5 text-sm text-slate-600">
                  Tvoje novo geslo je shranjeno. Ob naslednji prijavi uporabi novega.
                </p>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
                  >
                    V redu
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-4">
                <h3 className="text-lg font-bold text-slate-900">Spremeni geslo</h3>
                <p className="mt-1.5 text-sm text-slate-600">Vnesi novo geslo (vsaj 8 znakov).</p>

                <label className="mt-4 block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">Novo geslo</span>
                  <div className="relative">
                    <input
                      name="password"
                      type={show ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-white/70 px-3.5 py-2.5 pr-10 text-[15px] text-slate-900 ring-1 ring-white/80 outline-none transition focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={show ? "Skrij geslo" : "Pokaži geslo"}
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <label className="mt-3 block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">Ponovi novo geslo</span>
                  <input
                    name="password2"
                    type={show ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900 ring-1 ring-white/80 outline-none transition focus:ring-2 focus:ring-brand-500"
                  />
                </label>

                {error && (
                  <p className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                    className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/70 disabled:opacity-50"
                  >
                    Prekliči
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Shrani
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
