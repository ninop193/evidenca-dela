"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Aurora } from "@/components/Aurora";
import { Wordmark } from "@/components/ui";

const fieldCls =
  "w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-slate-900 ring-1 ring-white/80 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-brand-500";

export default function DobrodosliPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultName, setDefaultName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      // Če uporabnik že ima podjetje, ga pošlji naprej.
      const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
      if (profile) {
        router.replace(profile.role === "admin" ? "/dashboard" : "/zigosanje");
        return;
      }
      const meta = user.user_metadata ?? {};
      setDefaultName(meta.full_name || meta.name || "");
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const companyName = String(form.get("companyName") ?? "").trim();
    const fullName = String(form.get("fullName") ?? "").trim();
    const taxId = String(form.get("taxId") ?? "").trim();
    if (!companyName || !fullName) {
      setError("Izpolni ime podjetja in svoje ime.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: rpcErr } = await supabase.rpc("create_company_and_admin", {
      p_company_name: companyName,
      p_full_name: fullName,
      p_tax_id: taxId || null,
    });
    if (rpcErr) {
      setError("Napaka pri ustvarjanju podjetja. Poskusi znova.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative grid min-h-screen place-items-center px-4 py-10 text-slate-800">
      <Aurora />
      <div className="reveal w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Wordmark />
        </div>
        <div className="glass iris-edge sheen rounded-3xl p-7">
          <h1 className="text-xl font-bold text-slate-900">Še zadnji korak 🎉</h1>
          <p className="mt-1 text-sm text-slate-500">
            Poimenuj svoje podjetje in začni z evidenco.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Ime podjetja</span>
              <input name="companyName" required placeholder="npr. Mizarstvo Novak s.p." className={fieldCls} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Tvoje ime in priimek</span>
              <input name="fullName" required defaultValue={defaultName} key={defaultName} placeholder="Janez Novak" className={fieldCls} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Davčna številka podjetja <span className="text-xs text-slate-400">· neobvezno</span>
              </span>
              <input name="taxId" placeholder="SI12345678" className={fieldCls} />
            </label>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-3 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(29,78,216,0.6)] transition hover:bg-brand-500 disabled:opacity-50"
            >
              {loading ? "Ustvarjam…" : "Ustvari podjetje"}
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
