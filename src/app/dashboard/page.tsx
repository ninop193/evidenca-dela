import Link from "next/link";
import { UserPlus, Clock, BarChart3, Palmtree } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";

const TZ = "Europe/Ljubljana";
const monthBounds = () => {
  const now = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
  const [y, m] = now.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const mm = String(m).padStart(2, "0");
  return { first: `${y}-${mm}-01`, last: `${y}-${mm}-${String(lastDay).padStart(2, "0")}` };
};

export default async function DashboardPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const b = monthBounds();

  const [{ count: employeeCount }, { data: entries }] = await Promise.all([
    supabase.from("employees").select("id", { count: "exact", head: true }),
    supabase.from("time_entries").select("total_worked_hours").gte("date", b.first).lte("date", b.last),
  ]);
  const monthHours = (entries ?? []).reduce((a, e) => a + (Number(e.total_worked_hours) || 0), 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Pozdravljen, {profile?.full_name?.split(" ")[0] ?? "delodajalec"} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">Hiter pregled tvojega podjetja.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Zaposleni" value={String(employeeCount ?? 0)} hint="aktivni in neaktivni" />
        <Stat label="Ure ta mesec" value={`${monthHours.toFixed(1)} h`} hint="vseh zaposlenih skupaj" />
        <Stat label="Status" value="Aktivno" hint="evidenca se vodi" tone="brand" />
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Hitra dejanja
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Action href="/dashboard/zaposleni/nov" icon={<UserPlus className="h-5 w-5" />} title="Dodaj zaposlenega" text="Nov delavec in dostop" />
        <Action href="/dashboard/ure/nov" icon={<Clock className="h-5 w-5" />} title="Ročni vnos ur" text="Vnesi ure za nazaj" />
        <Action href="/dashboard/pregled" icon={<BarChart3 className="h-5 w-5" />} title="Mesečni pregled" text="Seštevki in potrditev" />
        <Action href="/dashboard/odsotnosti/nov" icon={<Palmtree className="h-5 w-5" />} title="Vnesi odsotnost" text="Dopust, bolniška" />
      </div>
    </main>
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
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
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
