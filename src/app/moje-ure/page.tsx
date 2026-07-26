import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarDays, Sun } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Aurora } from "@/components/Aurora";
import { Wordmark, Badge } from "@/components/ui";
import {
  todayLjubljana,
  weekStart,
  monthEnd,
  shiftMonth,
  shiftDays,
  monthLabel,
  dayLabel,
  timeLabel,
} from "@/lib/tzdate";
import { SelfEntry } from "@/app/zigosanje/SelfEntryDialog";

// Prikaz vrste odsotnosti po domače.
const ABSENCE_LABELS: Record<string, string> = {
  letni_dopust: "Dopust",
  bolniska_do_30: "Bolniška",
  bolniska_zzzs: "Bolniška (ZZZS)",
  starsevsko: "Starševski dopust",
  izredni_dopust: "Izredni dopust",
  drugo: "Druga odsotnost",
};

const fmtH = (n: number) => n.toFixed(2);
const fmtRange = (from: string, to: string) => {
  const f = new Intl.DateTimeFormat("sl-SI", { day: "numeric", month: "numeric" });
  const a = f.format(new Date(`${from}T12:00:00Z`));
  const b = f.format(new Date(`${to}T12:00:00Z`));
  return from === to ? a : `${a} do ${b}`;
};

type Entry = {
  id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  break_minutes: number | null;
  total_worked_hours: number | null;
  overtime_hours: number | null;
  night_hours: number | null;
  sunday_hours: number | null;
  holiday_hours: number | null;
  needs_review: boolean | null;
  confirmed: boolean | null;
};

// Moje ure — osebni pregled za zaposlenega (vidi samo svoje vnose; RLS).
export default async function MojeUrePage({
  searchParams,
}: {
  searchParams: Promise<{ mesec?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: employee } = await supabase
    .from("employees")
    .select("id, worker_type")
    .eq("user_id", profile.id)
    .maybeSingle();
  // Brez zapisa zaposlenega (npr. čisti admin) ta stran nima vsebine.
  if (!employee) redirect("/dashboard");
  const showLeave = employee.worker_type === "zaposlen";

  const today = todayLjubljana();
  const currentMonth = today.slice(0, 7);
  const sp = await searchParams;
  const mesec = /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.mesec ?? "") ? sp.mesec! : currentMonth;
  const isCurrentMonth = mesec === currentMonth;

  const mStart = `${mesec}-01`;
  const mEnd = monthEnd(mesec);
  const wStart = weekStart(today);

  const [{ data: monthEntries }, { data: weekRows }, { data: absences }] = await Promise.all([
    supabase
      .from("time_entries")
      .select(
        "id, date, clock_in, clock_out, break_minutes, total_worked_hours, overtime_hours, night_hours, sunday_hours, holiday_hours, needs_review, confirmed",
      )
      .eq("employee_id", employee.id)
      .gte("date", mStart)
      .lte("date", mEnd)
      .order("date", { ascending: false })
      .order("clock_in", { ascending: false }),
    supabase
      .from("time_entries")
      .select("date, total_worked_hours, clock_out")
      .eq("employee_id", employee.id)
      .gte("date", wStart)
      .lte("date", today),
    supabase
      .from("absences")
      .select("id, date_from, date_to, unworked_hours, compensation_type")
      .eq("employee_id", employee.id)
      .lte("date_from", mEnd)
      .gte("date_to", mStart)
      .order("date_from", { ascending: false }),
  ]);

  const entries = (monthEntries ?? []) as Entry[];

  // Vnosi, ki jih zaposleni sme popraviti sam: nepotrjeni, pomanjkljivi
  // (odprti ali označeni "za pregled") in največ 7 dni nazaj. Ostalo delodajalec.
  const selfFixFrom = shiftDays(today, -6);
  const canSelfFix = (e: Entry) =>
    !e.confirmed && (e.clock_out == null || !!e.needs_review) && e.date >= selfFixFrom;

  // Seštevki za kartice (Danes / Ta teden / Ta mesec — vedno tekoči, ne izbrani mesec).
  const weekTotal = (weekRows ?? []).reduce((a, e) => a + (Number(e.total_worked_hours) || 0), 0);
  const todayTotal = (weekRows ?? [])
    .filter((e) => e.date === today)
    .reduce((a, e) => a + (Number(e.total_worked_hours) || 0), 0);
  // Izmena v teku danes → na kartici "Danes" pokažemo utrip namesto zavajajoče ničle.
  const openToday = (weekRows ?? []).some((e) => e.date === today && e.clock_out == null);
  const { data: curMonthRows } = isCurrentMonth
    ? { data: monthEntries }
    : await supabase
        .from("time_entries")
        .select("total_worked_hours")
        .eq("employee_id", employee.id)
        .gte("date", `${currentMonth}-01`)
        .lte("date", today);
  const curMonthTotal = (curMonthRows ?? []).reduce(
    (a, e) => a + (Number(e.total_worked_hours) || 0),
    0,
  );

  // Mesečni povzetek izbranega meseca.
  const sum = (k: keyof Entry) => entries.reduce((a, e) => a + (Number(e[k]) || 0), 0);
  const mTotal = sum("total_worked_hours");
  const mOvertime = sum("overtime_hours");
  const mNight = sum("night_hours");
  const mSunday = sum("sunday_hours");
  const mHoliday = sum("holiday_hours");
  const mAbsence = (absences ?? []).reduce((a, e) => a + (Number(e.unworked_hours) || 0), 0);

  const prev = shiftMonth(mesec, -1);
  const next = shiftMonth(mesec, 1);

  return (
    <main className="relative min-h-screen text-slate-800">
      <Aurora />

      {/* Glava — enaka kot na žigosanju */}
      <header className="sticky top-0 z-20 px-3 pt-3">
        <div className="glass iris-edge mx-auto flex max-w-md items-center justify-between rounded-full px-4 py-2.5">
          <Wordmark className="text-sm" />
          <Link
            href="/zigosanje"
            className="rounded-full bg-white/60 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-white/70 hover:bg-white/80"
          >
            Žigosanje
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-6">
        <Link
          href="/zigosanje"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Nazaj
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Moje ure</h1>

        {/* Kartice: Danes / Ta teden / Ta mesec (vedno tekoče stanje) */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(
            [
              ["Danes", todayTotal, openToday],
              ["Ta teden", weekTotal, false],
              ["Ta mesec", curMonthTotal, false],
            ] as [string, number, boolean][]
          ).map(([label, val, running]) => (
            <div key={label} className="glass iris-edge rounded-2xl px-3 py-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
              </p>
              {running ? (
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                  </span>
                  v teku
                </p>
              ) : (
                <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                  {fmtH(val)}
                  <span className="ml-0.5 text-xs font-semibold text-slate-400">h</span>
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Vstop v pregled dopusta (samo redno zaposleni) */}
        {showLeave && (
          <Link
            href="/moj-dopust"
            className="glass-strong iris-edge mt-3 flex items-center justify-between rounded-2xl px-5 py-4 transition active:scale-[0.99]"
          >
            <span className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-600">
                <Sun className="h-4.5 w-4.5" />
              </span>
              <span className="text-sm font-semibold text-slate-900">Moj dopust</span>
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-brand-600">
              Odpri <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
        )}

        {/* Preklop meseca */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            href={`/moje-ure?mesec=${prev}`}
            aria-label="Prejšnji mesec"
            className="glass grid h-9 w-9 place-items-center rounded-full text-slate-600 transition hover:text-slate-900"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </Link>
          <p className="text-base font-semibold capitalize text-slate-900">{monthLabel(mesec)}</p>
          {isCurrentMonth ? (
            <span className="h-9 w-9" aria-hidden />
          ) : (
            <Link
              href={`/moje-ure?mesec=${next}`}
              aria-label="Naslednji mesec"
              className="glass grid h-9 w-9 place-items-center rounded-full text-slate-600 transition hover:text-slate-900"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </Link>
          )}
        </div>

        {/* Pozabljeno žigosanje — zaposleni doda vnos, delodajalec ga potrdi */}
        <div className="mt-3 flex justify-end">
          <SelfEntry mode="create" variant="chip" label="Dodaj pozabljen vnos" />
        </div>

        {/* Dnevni vnosi */}
        <div className="mt-2">
          {entries.length === 0 ? (
            <div className="glass rounded-2xl p-6 text-center text-sm text-slate-400">
              V tem mesecu ni vnosov.
            </div>
          ) : (
            <ul className="glass-strong iris-edge divide-y divide-white/40 overflow-hidden rounded-2xl">
              {entries.map((e) => (
                <li key={e.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{dayLabel(e.date)}</p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {timeLabel(e.clock_in)} do {timeLabel(e.clock_out)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {canSelfFix(e) && (
                        <SelfEntry
                          mode="fix"
                          variant="chip"
                          label="Popravi"
                          fix={{
                            id: e.id,
                            date: e.date,
                            clockInIso: e.clock_in,
                            clockOutIso: e.clock_out,
                            breakMinutes: Number(e.break_minutes) || 0,
                          }}
                        />
                      )}
                      {e.needs_review && <Badge tone="amber">za pregled</Badge>}
                      {e.clock_out == null ? (
                        <Badge tone="brand">v teku</Badge>
                      ) : (
                        <span className="text-sm font-bold tabular-nums text-slate-900">
                          {fmtH(Number(e.total_worked_hours) || 0)} h
                        </span>
                      )}
                    </div>
                  </div>
                  {((Number(e.overtime_hours) || 0) > 0 || (Number(e.break_minutes) || 0) > 0) && (
                    <p className="mt-1 text-xs text-slate-400">
                      {[
                        (Number(e.break_minutes) || 0) > 0 ? `odmor ${e.break_minutes} min` : null,
                        (Number(e.overtime_hours) || 0) > 0
                          ? `od tega nadure: ${fmtH(Number(e.overtime_hours))} h`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Odsotnosti v mesecu */}
        {(absences ?? []).length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 px-1 text-sm font-semibold text-slate-500">Odsotnosti</h2>
            <ul className="glass-strong iris-edge divide-y divide-white/40 overflow-hidden rounded-2xl">
              {(absences ?? []).map((a) => (
                <li key={a.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {ABSENCE_LABELS[a.compensation_type] ?? "Odsotnost"}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {fmtRange(a.date_from, a.date_to)}
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-slate-900">
                    {fmtH(Number(a.unworked_hours) || 0)} h
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mesečni povzetek */}
        {(entries.length > 0 || mAbsence > 0) && (
          <div className="mt-6">
            <h2 className="mb-2 px-1 text-sm font-semibold text-slate-500">
              Povzetek: {monthLabel(mesec)}
            </h2>
            <div className="glass-strong iris-edge rounded-2xl px-4 py-2">
              {(
                [
                  ["Opravljene ure", mTotal, true],
                  ["Nadure", mOvertime, mOvertime > 0],
                  ["Nočne ure", mNight, mNight > 0],
                  ["Nedeljske ure", mSunday, mSunday > 0],
                  ["Praznične ure", mHoliday, mHoliday > 0],
                  ["Ure odsotnosti", mAbsence, mAbsence > 0],
                ] as [string, number, boolean][]
              )
                .filter(([, , show]) => show)
                .map(([label, val]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-b border-white/40 py-2.5 last:border-0"
                  >
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className="text-sm font-bold tabular-nums text-slate-900">
                      {fmtH(val)} h
                    </span>
                  </div>
                ))}
            </div>
            <p className="mt-3 flex items-start gap-1.5 px-1 text-xs leading-snug text-slate-400">
              <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Pozabljeno žigosanje lahko do 7 dni nazaj vneseš ali popraviš sam — vnos se
              označi »za pregled« in ga potrdi delodajalec. Ostale popravke uredi delodajalec.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
