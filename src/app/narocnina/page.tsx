import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAccess, PLAN, eur } from "@/lib/billing";
import { Aurora } from "@/components/Aurora";
import { Wordmark } from "@/components/ui";
import { signOut } from "../(auth)/actions";
import { SubscribeButtons } from "./SubscribeButtons";
import { ManageButton } from "./ManageButton";

const fmtDate = (d: string) =>
  new Intl.DateTimeFormat("sl-SI", { timeZone: "Europe/Ljubljana", dateStyle: "long" }).format(
    new Date(d),
  );

export default async function NarocninaPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/zigosanje");

  const sp = await searchParams;
  const welcome = sp.welcome === "1";

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("subscription_status, trial_ends_at, current_period_end, billing_interval, cancel_at_period_end")
    .eq("id", profile.company_id)
    .single();
  const access = getAccess(company ?? {});
  const isSubscriber = access.state === "active" || access.state === "past_due";

  const heading =
    access.state === "active"
      ? "Naročnina je aktivna"
      : access.state === "past_due"
        ? "Plačilo ni uspelo"
        : access.state === "trialing"
          ? welcome
            ? "Dobrodošel v Delovit 🎉"
            : `Še ${access.trialDaysLeft} dni brezplačnega preizkusa`
          : access.state === "trial_expired"
            ? "Tvoj brezplačni preizkus je potekel"
            : "Aktiviraj naročnino";

  const sub =
    access.state === "active"
      ? "Hvala! Tvoja naročnina je aktivna. Tukaj jo lahko upravljaš ali odpoveš."
      : access.state === "past_due"
        ? "Zadnje plačilo ni uspelo. Posodobi plačilno sredstvo, da ohraniš dostop."
        : access.state === "trialing"
          ? welcome
            ? `Tvoj 14-dnevni brezplačni preizkus je aktiven. Nadaljuj brezplačno ali se naroči že zdaj, kakor ti ustreza.`
            : "Med preizkusom imaš poln dostop. Naroči se že zdaj in nadaljuj brez prekinitve."
          : "Za nadaljevanje izberi paket. Tvoji podatki so shranjeni in spet dostopni takoj po plačilu.";

  return (
    <main className="relative min-h-screen text-slate-800">
      <Aurora />

      <header className="sticky top-0 z-20 px-3 pt-3">
        <div className="glass iris-edge mx-auto flex max-w-3xl items-center justify-between rounded-full px-4 py-2.5">
          <Wordmark />
          <div className="flex items-center gap-2">
            {access.hasAccess && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white/60 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" /> Nazaj
              </Link>
            )}
            <form action={signOut}>
              <button className="rounded-full bg-white/60 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-white/70 hover:bg-white/80">
                Odjava
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{heading}</h1>
          <p className="mx-auto mt-3 max-w-lg text-slate-600">{sub}</p>
        </div>

        {isSubscriber ? (
          <div className="mx-auto mt-10 max-w-md">
            <div className="glass-strong iris-edge rounded-3xl p-7 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                {access.state === "active" ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                )}
              </div>
              <p className="mt-4 text-lg font-bold text-slate-900">{PLAN.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                {company?.billing_interval === "year" ? "Letno plačilo" : "Mesečno plačilo"}
                {company?.current_period_end &&
                  ` · ${company.cancel_at_period_end ? "se konča" : "obnova"} ${fmtDate(company.current_period_end)}`}
              </p>
              <div className="mt-6 flex justify-center">
                <ManageButton />
              </div>
              <p className="mt-3 text-xs text-slate-400">
                V portalu lahko posodobiš kartico, preneseš račune ali odpoveš naročnino.
              </p>
            </div>
          </div>
        ) : (
          <>
            {access.state === "trialing" && (
              <div className="mx-auto mt-9 max-w-md">
                <Link
                  href="/dashboard"
                  className="glass-strong iris-edge sheen group flex items-center justify-between gap-3 rounded-2xl px-5 py-4 transition hover:bg-white/70"
                >
                  <span>
                    <span className="block font-semibold text-slate-900">Nadaljuj brezplačno</span>
                    <span className="block text-sm text-slate-500">
                      Poln dostop {access.trialDaysLeft} dni, brez kartice
                    </span>
                  </span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition group-hover:bg-brand-500">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
                <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                  <span className="h-px flex-1 bg-slate-300/60" />
                  ali se naroči zdaj
                  <span className="h-px flex-1 bg-slate-300/60" />
                </div>
              </div>
            )}

            <div className={access.state === "trialing" ? "" : "mt-10"}>
              <SubscribeButtons />
            </div>
            <div className="mt-8 text-center text-sm text-slate-500">
              Imaš več kot 10 zaposlenih?{" "}
              <Link
                href="/kontakt?tema=vec-zaposlenih"
                className="font-semibold text-brand-700 hover:text-brand-800"
              >
                Pošlji povpraševanje
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
