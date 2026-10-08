import Link from "next/link";
import {
  UserPlus,
  Clock,
  BarChart3,
  Palmtree,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Sun,
} from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { MetaPixelEvent } from "@/components/MetaPixel";
import { metaUserData, sendMetaEvent } from "@/lib/metaCapi";
import { PLAN } from "@/lib/billing";
import { todayLjubljana, monthEnd, dayLabel, timeLabel } from "@/lib/tzdate";
import { ApproveButton } from "./ure/ApproveButton";

type PendingRow = {
  id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  total_worked_hours: number | null;
  notes: string | null;
  employees: { full_name: string } | null;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ narocnina?: string; paket?: string; cs?: string; welcome?: string }>;
}) {
  const sp = await searchParams;
  // ?welcome=1 = podjetje je pravkar ustvarjeno (email ali Google) → registracija.
  const welcome = sp.welcome === "1";
  // Vrnitev iz Stripe Checkouta (success_url) → Meta Pixel "Subscribe", enkrat na sejo.
  const checkoutId = sp.narocnina === "ok" && sp.cs && /^cs_\w+$/.test(sp.cs) ? sp.cs : null;
  const profile = await getProfile();
  const metaUser = profile ? metaUserData(profile) : undefined;
  const subscribeValue = {
    value: sp.paket === "year" ? PLAN.yearlyNet : PLAN.monthlyNet,
    currency: PLAN.currency,
  };
  if (checkoutId && metaUser) {
    await sendMetaEvent({
      event: "Subscribe",
      eventId: checkoutId,
      path: "/dashboard?narocnina=ok",
      userData: metaUser,
      customData: subscribeValue,
    });
  }
  if (welcome && metaUser && profile) {
    await sendMetaEvent({
      event: "CompleteRegistration",
      eventId: `reg_${profile.company_id}`,
      path: "/dashboard?welcome=1",
      userData: metaUser,
    });
  }
  const supabase = await createClient();
  const today = todayLjubljana();
  const month = today.slice(0, 7);

  const [
    { count: employeeCount },
    { data: entries },
    { data: pendingData, count: pendingCount },
    { data: onDuty },
    { count: leavePendingCount },
  ] = await Promise.all([
    supabase.from("employees").select("id", { count: "exact", head: true }),
    supabase
      .from("time_entries")
      .select("total_worked_hours")
      .gte("date", `${month}-01`)
      .lte("date", monthEnd(month)),
    // Vnosi, ki čakajo na delodajalčevo potrditev (ročni vnosi zaposlenih,
    // samodejno zaprti vnosi) — glavna stvar, ki jo mora delodajalec videti.
    supabase
      .from("time_entries")
      .select(
        "id, date, clock_in, clock_out, total_worked_hours, notes, employees(full_name)",
        { count: "exact" },
      )
      .eq("needs_review", true)
      .order("date", { ascending: false })
      .limit(5),
    // Kdo je trenutno na delu (odprta izmena danes).
    supabase
      .from("time_entries")
      .select("id, clock_in, employees(full_name)")
      .is("clock_out", null)
      .eq("date", today)
      .order("clock_in", { ascending: true }),
    // Prošnje za dopust, ki čakajo na odločitev.
    supabase
      .from("leave_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const leavePending = leavePendingCount ?? 0;
  const monthHours = (entries ?? []).reduce((a, e) => a + (Number(e.total_worked_hours) || 0), 0);
  const pending = (pendingData ?? []) as unknown as PendingRow[];
  const pendingTotal = pendingCount ?? pending.length;
  const noEmployees = (employeeCount ?? 0) === 0;
  const onDutyRows = (onDuty ?? []) as unknown as { id: string; clock_in: string | null; employees: { full_name: string } | null }[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {checkoutId && (
        <MetaPixelEvent
          event="Subscribe"
          eventId={checkoutId}
          params={subscribeValue}
          userData={metaUser}
        />
      )}
      {welcome && profile && (
        <MetaPixelEvent
          event="CompleteRegistration"
          eventId={`reg_${profile.company_id}`}
          userData={metaUser}
        />
      )}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {welcome
            ? "Dobrodošel v Delovit 🎉"
            : `Pozdravljen, ${profile?.full_name?.split(" ")[0] ?? "delodajalec"} 👋`}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {noEmployees ? "Račun je pripravljen. Še en korak in evidenca teče." : "Hiter pregled tvojega podjetja."}
        </p>
      </div>

      {/* ── Kaj čaka nate ─────────────────────────────────────────────── */}
      {noEmployees ? (
        <FirstEmployeeCard />
      ) : pendingTotal > 0 ? (
        <section className="mt-6 overflow-hidden rounded-2xl bg-amber-50/80 ring-1 ring-amber-200/80 backdrop-blur">
          <div className="flex items-start gap-3 px-5 pb-3 pt-4">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-[0_8px_20px_-6px_rgba(245,158,11,0.7)]">
              <BellRing className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="font-bold text-amber-900">
                Čaka na tvojo potrditev: {pendingTotal}{" "}
                {pendingTotal === 1 ? "vnos" : pendingTotal === 2 ? "vnosa" : "vnosov"}
              </h2>
              <p className="mt-0.5 text-sm text-amber-800/80">
                Ure, ki so jih zaposleni vnesli ročno ali jih je sistem samodejno zaprl. Preveri
                jih — če so pravilne, klikni Potrdi; sicer Popravi.
              </p>
            </div>
          </div>
          <ul className="divide-y divide-amber-200/60 border-t border-amber-200/60 bg-white/60">
            {pending.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {p.employees?.full_name ?? "—"}
                    <span className="ml-2 font-normal text-slate-500">{dayLabel(p.date)}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {timeLabel(p.clock_in)} do {timeLabel(p.clock_out)}
                    {p.clock_out != null && (
                      <span className="ml-2 font-semibold tabular-nums text-slate-900">
                        {(Number(p.total_worked_hours) || 0).toFixed(2)} h
                      </span>
                    )}
                  </p>
                  {p.notes && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{p.notes}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/dashboard/ure/${p.id}`}
                    className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                  >
                    Popravi
                  </Link>
                  <ApproveButton id={p.id} />
                </div>
              </li>
            ))}
          </ul>
          {pendingTotal > pending.length && (
            <Link
              href="/dashboard/ure?filter=pregled"
              className="flex items-center justify-center gap-1 border-t border-amber-200/60 bg-amber-100/50 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              Prikaži vse ({pendingTotal}) <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </section>
      ) : (
        <div className="mt-6 flex items-center gap-2.5 rounded-2xl bg-emerald-50/70 px-5 py-3.5 ring-1 ring-emerald-200/70">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-900">
            Vse urejeno — noben vnos ne čaka na tvojo potrditev.
          </p>
        </div>
      )}

      {/* Prošnje za dopust čakajo na odločitev */}
      {leavePending > 0 && (
        <Link
          href="/dashboard/dopust"
          className="mt-4 flex items-center gap-3 rounded-2xl bg-amber-50/80 px-5 py-3.5 ring-1 ring-amber-200/80 transition hover:bg-amber-100/70"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500 text-white">
            <Sun className="h-4.5 w-4.5" />
          </span>
          <span className="flex-1 text-sm font-semibold text-amber-900">
            {leavePending} {leavePending === 1 ? "prošnja za dopust čaka" : "prošenj za dopust čaka"} na tvojo odločitev
          </span>
          <ChevronRight className="h-4 w-4 text-amber-700" />
        </Link>
      )}

      {/* ── Številke ──────────────────────────────────────────────────── */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Zaposleni" value={String(employeeCount ?? 0)} hint="aktivni in neaktivni" />
        <Stat
          label="Na delu zdaj"
          value={String(onDutyRows.length)}
          hint={
            onDutyRows.length === 0
              ? "trenutno ni nikogar"
              : onDutyRows
                  .slice(0, 3)
                  .map((r) => `${r.employees?.full_name?.split(" ")[0] ?? "?"} od ${timeLabel(r.clock_in)}`)
                  .join(" · ") + (onDutyRows.length > 3 ? " …" : "")
          }
          tone="brand"
        />
        <Stat label="Ure ta mesec" value={`${monthHours.toFixed(1)} h`} hint="vseh zaposlenih skupaj" />
      </div>

      {/* ── Hitra dejanja ─────────────────────────────────────────────── */}
      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Hitra dejanja
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Action href="/dashboard/zaposleni/nov" icon={<UserPlus className="h-5 w-5" />} title="Dodaj zaposlenega" text="Nov delavec in dostop" />
        <Action href="/dashboard/ure/nov" icon={<Clock className="h-5 w-5" />} title="Ročni vnos ur" text="Vnesi ure za nazaj" />
        <Action href="/dashboard/pregled" icon={<BarChart3 className="h-5 w-5" />} title="Mesečni pregled" text="Seštevki, potrditev, izvoz" />
        <Action href="/dashboard/odsotnosti/nov" icon={<Palmtree className="h-5 w-5" />} title="Vnesi odsotnost" text="Dopust, bolniška" />
      </div>
    </main>
  );
}

// Novo podjetje brez zaposlenih: brez njih evidenca ostane prazna, zato je to
// edini korak, ki ga pokažemo na vrhu (namesto "vse urejeno").
function FirstEmployeeCard() {
  const steps = [
    ["Vpišeš ime in email", "Traja manj kot minuto."],
    ["Zaposleni dobi povabilo", "Po emailu si sam nastavi geslo."],
    ["Žigosa s telefonom", "Prihod in odhod z enim klikom, ti vidiš ure tukaj."],
  ];
  return (
    <section className="glass-strong iris-edge mt-6 rounded-3xl p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Prvi korak</p>
      <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
        Dodaj prvega zaposlenega
      </h2>
      <p className="mt-1.5 max-w-xl text-sm text-slate-600">
        Dokler nimaš zaposlenih, evidenca ostane prazna. Vpišeš ime in email, ostalo uredi Delovit.
      </p>
      <ol className="mt-5 grid gap-3 sm:grid-cols-3">
        {steps.map(([title, text], i) => (
          <li key={title} className="flex gap-3 rounded-2xl bg-white/60 p-4 ring-1 ring-white/80">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
              {i + 1}
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-900">{title}</span>
              <span className="mt-0.5 block text-sm text-slate-500">{text}</span>
            </span>
          </li>
        ))}
      </ol>
      <Link
        href="/dashboard/zaposleni/nov"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(29,78,216,0.6)] transition hover:bg-brand-500 sm:inline-flex sm:w-auto"
      >
        <UserPlus className="h-5 w-5" /> Dodaj zaposlenega
      </Link>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "brand";
}) {
  return (
    <Card className="sheen p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={"mt-1 text-3xl font-bold " + (tone === "brand" ? "text-brand-600" : "text-slate-900")}>
        {value}
      </p>
      <p className="mt-1 truncate text-xs text-slate-400">{hint}</p>
    </Card>
  );
}

function Action({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link
      href={href}
      className="glass-strong iris-edge sheen group rounded-2xl p-5 transition duration-300 hover:-translate-y-1"
    >
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_8px_22px_-6px_rgba(29,78,216,0.6)]">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-brand-700">{title}</h3>
      <p className="mt-0.5 text-sm text-slate-500">{text}</p>
    </Link>
  );
}
