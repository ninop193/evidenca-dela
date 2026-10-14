"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Delete, Loader2, Play, Square, TabletSmartphone } from "lucide-react";
import { Wordmark, cn } from "@/components/ui";
import { checkPin, kioskClock, pairWithCode } from "./actions";

type Employee = { id: string; name: string };

type Screen =
  | { kind: "home" }
  | { kind: "pin"; emp: Employee }
  | { kind: "action"; emp: Employee; openSince: string | null; pin: string }
  | { kind: "done"; action: "in" | "out"; name: string; time?: string; hours?: number; capped?: boolean };

const IDLE_MS = 30_000; // brez dotika → nazaj na seznam imen
const DONE_MS = 5_000; // potrdilo je vidno 5 sekund
const REFRESH_MS = 5 * 60_000; // seznam imen se osveži (novi zaposleni)

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("sl-SI", { timeZone: "Europe/Ljubljana", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );

const fmtHours = (h: number) => `${h.toLocaleString("sl-SI", { maximumFractionDigits: 2 })} h`;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const buzz = () => {
  try {
    navigator.vibrate?.(15);
  } catch {}
};

// --- Glava z uro ------------------------------------------------------------------

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function KioskHeader({ companyName }: { companyName?: string }) {
  const now = useNow();
  return (
    <header className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-7">
      <div>
        <Wordmark />
        {companyName && <p className="mt-1 text-sm font-medium text-slate-500">{companyName}</p>}
      </div>
      <div className="text-right" suppressHydrationWarning>
        <p className="font-mono text-3xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
          {now
            ? new Intl.DateTimeFormat("sl-SI", { timeZone: "Europe/Ljubljana", hour: "2-digit", minute: "2-digit" }).format(now)
            : " "}
        </p>
        <p className="text-sm text-slate-500 first-letter:uppercase">
          {now
            ? new Intl.DateTimeFormat("sl-SI", {
                timeZone: "Europe/Ljubljana",
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(now)
            : " "}
        </p>
      </div>
    </header>
  );
}

function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white shadow-[0_8px_20px_-8px_rgba(29,78,216,0.7)]",
        size === "lg" ? "h-14 w-14 text-lg sm:h-20 sm:w-20 sm:text-2xl" : "h-14 w-14 text-lg",
      )}
    >
      {initials(name)}
    </span>
  );
}

// --- Glavni zaslon tablice ----------------------------------------------------------

export function KioskScreen({ companyName, employees }: { companyName: string; employees: Employee[] }) {
  const router = useRouter();
  // Pravilna koda živi samo v stanju zaslona "action" (v pomnilniku, do žiga ali vrnitve).
  const [screen, setScreen] = useState<Screen>({ kind: "home" });
  const goHome = useCallback(() => setScreen({ kind: "home" }), []);

  // Neaktivnost: kdor odide sredi postopka, ne pusti odprtega zaslona s svojim imenom.
  const [lastTouch, setLastTouch] = useState(0);
  useEffect(() => {
    if (screen.kind === "home") return;
    const t = setTimeout(goHome, screen.kind === "done" ? DONE_MS : IDLE_MS);
    return () => clearTimeout(t);
  }, [screen, lastTouch, goHome]);

  // Na začetnem zaslonu občasno osveži seznam (delodajalec je dodal zaposlenega).
  useEffect(() => {
    if (screen.kind !== "home") return;
    const t = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(t);
  }, [screen.kind, router]);

  return (
    <div className="flex min-h-screen flex-col" onPointerDown={() => setLastTouch(Date.now())}>
      <KioskHeader companyName={companyName} />
      <main className="flex flex-1 flex-col px-5 pb-6 pt-3 sm:px-8 sm:pb-8 sm:pt-6">
        {screen.kind === "home" && (
          <NamePicker employees={employees} onPick={(emp) => setScreen({ kind: "pin", emp })} />
        )}
        {screen.kind === "pin" && (
          <PinPad
            emp={screen.emp}
            onBack={goHome}
            onOk={(pin, openSince) => setScreen({ kind: "action", emp: screen.emp, openSince, pin })}
          />
        )}
        {screen.kind === "action" && (
          <ClockAction
            emp={screen.emp}
            openSince={screen.openSince}
            pin={screen.pin}
            onBack={goHome}
            onDone={(r) => setScreen({ kind: "done", name: screen.emp.name, ...r })}
          />
        )}
        {screen.kind === "done" && <Done screen={screen} onClose={goHome} />}
      </main>
    </div>
  );
}

function NamePicker({ employees, onPick }: { employees: Employee[]; onPick: (e: Employee) => void }) {
  if (employees.length === 0) {
    return (
      <div className="m-auto max-w-sm text-center">
        <p className="text-lg font-semibold text-slate-900">Ni aktivnih zaposlenih</p>
        <p className="mt-1 text-slate-500">Delodajalec jih doda v Delovitu pod »Zaposleni«.</p>
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Kdo žigosa?</h1>
      <p className="mt-2 text-center text-lg text-slate-500">Pritisni svoje ime</p>
      <ul className="mt-8 flex flex-wrap justify-center gap-3">
        {employees.map((e) => (
          <li key={e.id} className="w-full min-[480px]:w-[calc(50%-0.375rem)] md:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.5625rem)]">
            <button
              onClick={() => {
                buzz();
                onPick(e);
              }}
              className="glass-strong iris-edge flex w-full items-center gap-4 rounded-3xl p-4 text-left transition active:scale-[0.97] sm:p-5"
            >
              <Avatar name={e.name} />
              <span className="text-lg font-semibold leading-tight text-slate-900">{e.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-base font-medium text-slate-600 transition hover:bg-white/60"
    >
      <ArrowLeft className="h-5 w-5" /> Nazaj
    </button>
  );
}

// --- PIN ---------------------------------------------------------------------------

function PinPad({
  emp,
  onBack,
  onOk,
}: {
  emp: Employee;
  onBack: () => void;
  onOk: (pin: string, openSince: string | null) => void;
}) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);

  async function submit(code: string) {
    setLoading(true);
    const res = await checkPin(emp.id, code);
    setLoading(false);
    if (res.disconnected) return router.refresh();
    if (res.error) {
      setPin("");
      setError(res.error);
      if (res.wrongPin) setShake((n) => n + 1);
      return;
    }
    onOk(code, res.openSince ?? null);
  }

  function press(d: string) {
    if (loading || pin.length >= 4) return;
    buzz();
    setError(null);
    const next = pin + d;
    setPin(next);
    if (next.length === 4) void submit(next);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col">
      <div>
        <BackButton onClick={onBack} />
      </div>
      <div className="mt-2 flex flex-col items-center text-center">
        <Avatar name={emp.name} size="lg" />
        <p className="mt-2 text-2xl font-bold text-slate-900 sm:mt-3">{emp.name}</p>
        <p className="mt-1 text-slate-500">Vpiši svojo kodo</p>
      </div>

      <div key={shake} className={cn("mt-4 flex justify-center gap-4 sm:mt-6", shake > 0 && "kiosk-shake")}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-4 w-4 rounded-full ring-2 transition",
              i < pin.length ? "bg-brand-600 ring-brand-600" : "bg-white/60 ring-slate-300",
              loading && "animate-pulse",
            )}
          />
        ))}
      </div>
      <p className={cn("mt-3 min-h-10 text-center text-sm font-medium", error ? "text-rose-600" : "text-transparent")}>
        {error ?? "."}
      </p>

      <div className="mt-2 grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <KeyButton key={d} onClick={() => press(d)} disabled={loading}>
            {d}
          </KeyButton>
        ))}
        <span />
        <KeyButton onClick={() => press("0")} disabled={loading}>
          0
        </KeyButton>
        <KeyButton
          onClick={() => {
            setError(null);
            setPin((p) => p.slice(0, -1));
          }}
          disabled={loading || pin.length === 0}
          aria-label="Izbriši"
          subtle
        >
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Delete className="h-6 w-6" />}
        </KeyButton>
      </div>
    </div>
  );
}

function KeyButton({
  subtle,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { subtle?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "grid h-14 place-items-center rounded-2xl text-3xl sm:h-[4.5rem] font-semibold text-slate-900 transition active:scale-[0.94] disabled:opacity-40",
        subtle ? "text-slate-500" : "glass-strong iris-edge",
        className,
      )}
      {...props}
    />
  );
}

// --- Prihod / odhod ---------------------------------------------------------------

function ClockAction({
  emp,
  openSince,
  pin,
  onBack,
  onDone,
}: {
  emp: Employee;
  openSince: string | null;
  pin: string;
  onBack: () => void;
  onDone: (r: { action: "in" | "out"; time?: string; hours?: number; capped?: boolean }) => void;
}) {
  const router = useRouter();
  const isOut = openSince != null;
  const [breakMin, setBreakMin] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (loading) return;
    buzz();
    setLoading(true);
    setError(null);
    const action = isOut ? "out" : "in";
    const res = await kioskClock(emp.id, pin, action, isOut ? breakMin : undefined);
    setLoading(false);
    if (res.disconnected) return router.refresh();
    if (res.error) {
      setError(res.error);
      return;
    }
    onDone({ action, time: res.time, hours: res.hours, capped: res.capped });
  }

  const firstName = emp.name.split(/\s+/)[0];

  return (
    <div className="mx-auto flex w-full max-w-md flex-col">
      <div>
        <BackButton onClick={onBack} />
      </div>
      <div className="mt-2 text-center">
        <p className="text-2xl font-bold text-slate-900">Živjo, {firstName}</p>
        <p className="mt-1 text-lg text-slate-500">
          {isOut ? `Na delu si od ${fmtTime(openSince)}` : "Trenutno nisi na delu"}
        </p>
      </div>

      {/* Neobvezna zabeležka odmora — enako kot pri žigosanju s telefonom */}
      {isOut && (
        <div className="mt-6">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
            Odmor danes (neobvezno)
          </p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[
              [0, "Brez"],
              [15, "15 min"],
              [30, "30 min"],
              [45, "45 min"],
            ].map(([min, label]) => (
              <button
                key={min}
                type="button"
                onClick={() => setBreakMin(min as number)}
                className={cn(
                  "h-12 rounded-full text-sm font-semibold transition",
                  breakMin === min ? "bg-brand-600 text-white" : "glass text-slate-700",
                )}
              >
                {label as string}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        aria-label={isOut ? "Žigosaj odhod" : "Žigosaj prihod"}
        className="relative mx-auto mt-8 grid h-60 w-60 place-items-center rounded-full outline-none transition-transform duration-300 active:scale-[0.955] disabled:cursor-wait"
      >
        <span
          className={cn(
            "clock-breathe absolute -inset-3 rounded-full blur-2xl",
            isOut ? "bg-rose-400/25" : "bg-brand-500/25",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full",
            isOut ? "shadow-[0_20px_50px_-18px_rgba(244,63,94,0.6)]" : "shadow-[0_20px_50px_-18px_rgba(47,99,255,0.6)]",
          )}
          style={{
            background: isOut
              ? "radial-gradient(120% 120% at 32% 24%, #ffa9c6 0%, #fb5c8b 34%, #e11d5f 70%, #b8134f 100%)"
              : "radial-gradient(120% 120% at 32% 24%, #78a2ff 0%, #2f63ff 36%, #1d4ed8 72%, #1a3fae 100%)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/40"
          style={{
            background: "radial-gradient(56% 42% at 33% 23%, rgba(255,255,255,0.6), rgba(255,255,255,0) 62%)",
            boxShadow: "inset 0 3px 12px rgba(255,255,255,0.5), inset 0 -18px 38px rgba(10,20,60,0.28)",
          }}
        />
        <span className="relative flex flex-col items-center gap-3 text-white [text-shadow:0_1px_10px_rgba(10,20,60,0.28)]">
          {loading ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : isOut ? (
            <Square className="h-6 w-6 fill-white" strokeWidth={0} />
          ) : (
            <Play className="ml-1 h-7 w-7 fill-white" strokeWidth={0} />
          )}
          <span className="text-[2.2rem] font-bold leading-none tracking-tight">{isOut ? "Odhod" : "Prihod"}</span>
        </span>
      </button>

      {error && (
        <p className="glass mx-auto mt-6 rounded-xl px-4 py-2.5 text-center text-sm font-medium text-rose-600">{error}</p>
      )}
    </div>
  );
}

// --- Potrdilo ----------------------------------------------------------------------

function Done({ screen, onClose }: { screen: Extract<Screen, { kind: "done" }>; onClose: () => void }) {
  const isIn = screen.action === "in";
  return (
    <button onClick={onClose} className="m-auto flex w-full max-w-md flex-col items-center text-center">
      <span
        className={cn(
          "grid h-24 w-24 place-items-center rounded-full text-white shadow-[0_16px_40px_-14px_rgba(16,185,129,0.8)]",
          "bg-gradient-to-br from-emerald-400 to-emerald-600",
        )}
      >
        <Check className="h-12 w-12" strokeWidth={3} />
      </span>
      <p className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
        {isIn ? "Prihod zabeležen" : "Odhod zabeležen"}
      </p>
      {screen.time && <p className="mt-2 font-mono text-5xl font-bold tabular-nums text-slate-900">{screen.time}</p>}
      <p className="mt-3 text-lg text-slate-500">
        {screen.name}
        {!isIn && screen.hours != null && ` · opravljeno ${fmtHours(screen.hours)}`}
      </p>
      {screen.capped && (
        <p className="mt-5 rounded-2xl bg-amber-50/90 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
          Prihod je bil pred zelo dolgo, zato je odhod zabeležen ob zakonski dnevni meji. Delodajalec bo vnos preveril
          in popravil.
        </p>
      )}
      <p className="mt-6 text-lg font-medium text-slate-700">{isIn ? "Lep delovni dan!" : "Hvala in lep dan!"}</p>
      <span className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-slate-200/70">
        <span className="kiosk-countdown block h-full rounded-full bg-emerald-500" />
      </span>
    </button>
  );
}

// --- Nepovezana naprava ------------------------------------------------------------

export function PairScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const res = await pairWithCode(code);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <KioskHeader />
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="glass-strong iris-edge w-full max-w-md rounded-3xl p-7 text-center sm:p-9">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <TabletSmartphone className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Poveži tablico</h1>
          <p className="mt-2 text-slate-600">
            Na računalniku v Delovitu odpri <strong>Zaposleni → Skupna tablica</strong> in klikni{" "}
            <strong>Poveži tablico</strong>. Tukaj vpiši kodo, ki se prikaže.
          </p>
          <form onSubmit={submit} className="mt-6">
            <input
              value={code}
              onChange={(e) => {
                setError(null);
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              placeholder="000000"
              aria-label="Koda za povezavo"
              className="w-full rounded-2xl bg-white/80 px-4 py-4 text-center font-mono text-4xl font-bold tracking-[0.35em] text-slate-900 outline-none ring-1 ring-white/80 placeholder:text-slate-300 focus:ring-2 focus:ring-brand-500"
            />
            {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-600 text-lg font-semibold text-white shadow-[0_8px_22px_-8px_rgba(29,78,216,0.7)] transition hover:bg-brand-500 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              Poveži
            </button>
          </form>
          <Link href="/login" className="mt-6 inline-block text-sm text-slate-500 hover:text-slate-900">
            Prijava v Delovit
          </Link>
        </div>
      </main>
    </div>
  );
}

export function KioskMessage({ companyName, text }: { companyName: string; text: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <KioskHeader companyName={companyName} />
      <main className="flex flex-1 items-center justify-center px-5">
        <p className="glass-strong iris-edge max-w-md rounded-3xl p-8 text-center text-lg font-medium text-slate-700">
          {text}
        </p>
      </main>
    </div>
  );
}
