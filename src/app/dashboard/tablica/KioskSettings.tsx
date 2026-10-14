"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound, Loader2, RefreshCw, TabletSmartphone, UserRound, X } from "lucide-react";
import { Button, Card, cn } from "@/components/ui";
import {
  createPairCode,
  disableKiosk,
  disconnectDevice,
  enableKiosk,
  regeneratePin,
  connectAsKiosk,
} from "./actions";
import { SITE } from "@/lib/seo";

const KIOSK_HOST = new URL(SITE.url).host.replace(/^www\./, "");

type Employee = { id: string; name: string; pin: string | null };
type Device = { id: string; createdAt: string; lastUsedAt: string | null };

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("sl-SI", { timeZone: "Europe/Ljubljana", day: "numeric", month: "numeric", year: "numeric" }).format(
    new Date(iso),
  );
const fmtDateTime = (iso: string) =>
  new Intl.DateTimeFormat("sl-SI", {
    timeZone: "Europe/Ljubljana",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export function KioskSettings({
  enabled,
  employees,
  devices,
}: {
  enabled: boolean;
  employees: Employee[];
  devices: Device[];
}) {
  if (!enabled) return <TurnOn />;
  return (
    <div className="mt-6 space-y-5">
      <Devices devices={devices} />
      <Pins employees={employees} />
      <TurnOff />
    </div>
  );
}

// --- Izklopljeno: kratka razlaga + en gumb -------------------------------------------

function TurnOn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function turnOn() {
    setLoading(true);
    setError(null);
    const res = await enableKiosk();
    if (res.error) {
      setLoading(false);
      setError(res.error);
      return;
    }
    router.refresh();
  }

  const steps = [
    { icon: TabletSmartphone, text: "Tablico na delovnem mestu povežeš s kodo — enkrat." },
    { icon: UserRound, text: "Zaposleni na tablici pritisne svoje ime." },
    { icon: KeyRound, text: "Vpiše svojo 4-mestno kodo in pritisne Prihod ali Odhod." },
  ];

  return (
    <Card className="mt-6 p-6 sm:p-8">
      <ol className="space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              <s.icon className="h-5 w-5" />
            </span>
            <span className="text-[15px] text-slate-700">{s.text}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-slate-500">
        Kode za vse zaposlene ustvarimo samodejno. Zaposleni za tablico ne potrebujejo emaila ali gesla.
      </p>
      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <Button size="lg" className="mt-6" onClick={turnOn} disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Vklopi skupno tablico
      </Button>
    </Card>
  );
}

// --- Povezane tablice -------------------------------------------------------------

function Devices({ devices }: { devices: Device[] }) {
  const router = useRouter();
  const [pairing, setPairing] = useState(devices.length === 0);
  const [justPaired, setJustPaired] = useState(false);

  // Med povezovanjem preverjaj, ali se je nova tablica že povezala → zapri navodila.
  const [countAtOpen, setCountAtOpen] = useState(devices.length);
  useEffect(() => {
    if (!pairing) return;
    const t = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(t);
  }, [pairing, router]);
  if (pairing && devices.length > countAtOpen) {
    setCountAtOpen(devices.length);
    setPairing(false);
    setJustPaired(true);
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Tablice</h2>
        {!pairing && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setCountAtOpen(devices.length);
              setJustPaired(false);
              setPairing(true);
            }}
          >
            <TabletSmartphone className="h-4 w-4" /> Poveži tablico
          </Button>
        )}
      </div>

      {justPaired && (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50/90 px-3 py-2.5 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
          <CheckCircle2 className="h-4 w-4" /> Tablica je povezana. Zaposleni lahko začnejo žigosati.
        </p>
      )}

      {devices.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-100">
          {devices.map((d, i) => (
            <DeviceRow key={d.id} device={d} index={i + 1} />
          ))}
        </ul>
      )}

      {pairing && (
        <PairPanel
          canCancel={devices.length > 0}
          onCancel={() => setPairing(false)}
        />
      )}
    </Card>
  );
}

function DeviceRow({ device, index }: { device: Device; index: number }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function disconnect() {
    setLoading(true);
    await disconnectDevice(device.id);
    router.refresh();
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/70 text-slate-600 ring-1 ring-slate-200/70">
          <TabletSmartphone className="h-5 w-5" />
        </span>
        <div>
          <p className="font-medium text-slate-900">Tablica {index}</p>
          <p className="text-sm text-slate-500">
            Povezana {fmtDate(device.createdAt)}
            {device.lastUsedAt && ` · zadnje žigosanje ${fmtDateTime(device.lastUsedAt)}`}
          </p>
        </div>
      </div>
      {confirm ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Odklopim?</span>
          <Button variant="ghost" size="sm" onClick={() => setConfirm(false)} disabled={loading}>
            Ne
          </Button>
          <Button variant="danger" size="sm" onClick={disconnect} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Odklopi
          </Button>
        </div>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setConfirm(true)}>
          Odklopi
        </Button>
      )}
    </li>
  );
}

function PairPanel({ canCancel, onCancel }: { canCancel: boolean; onCancel: () => void }) {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState(true);
  const [usingThis, setUsingThis] = useState(false);

  const showCode = (res: Awaited<ReturnType<typeof createPairCode>>) => {
    setLoadingCode(false);
    if (res.error || !res.code) setError(res.error ?? "Kode ni bilo mogoče ustvariti.");
    else setCode(res.code);
  };

  function newCode() {
    setLoadingCode(true);
    setError(null);
    void createPairCode().then(showCode);
  }

  // Koda se ustvari takoj, ko se navodila odprejo (brez dodatnega klika).
  useEffect(() => {
    let alive = true;
    void createPairCode().then((res) => alive && showCode(res));
    return () => {
      alive = false;
    };
  }, []);

  async function useThis() {
    setUsingThis(true);
    setError(null);
    const res = await connectAsKiosk();
    if (res.error) {
      setUsingThis(false);
      setError(res.error);
      return;
    }
    window.location.assign("/tablica");
  }

  return (
    <div className="relative mt-4 rounded-2xl bg-white/60 p-5 ring-1 ring-white/80 sm:p-6">
      {canCancel && (
        <button
          onClick={onCancel}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-white hover:text-slate-700"
          aria-label="Zapri"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <p className="text-sm font-semibold text-slate-900">Poveži tablico</p>
      <ol className="mt-3 space-y-3 text-[15px] text-slate-700">
        <li>
          <span className="text-slate-400">1.</span> Na tablici odpri{" "}
          <strong className="rounded-md bg-white px-1.5 py-0.5 font-mono text-slate-900 ring-1 ring-slate-200">
            {KIOSK_HOST}/tablica
          </strong>
        </li>
        <li className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span>
            <span className="text-slate-400">2.</span> Vpiši kodo
          </span>
          <span className="font-mono text-3xl font-bold tracking-[0.2em] text-slate-900" aria-live="polite">
            {code ? `${code.slice(0, 3)} ${code.slice(3)}` : loadingCode ? "··· ···" : "—"}
          </span>
          <button
            onClick={newCode}
            disabled={loadingCode}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loadingCode && "animate-spin")} /> nova koda
          </button>
        </li>
      </ol>
      <p className="mt-2 text-xs text-slate-400">Koda velja 10 minut in jo lahko uporabiš enkrat.</p>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-200/70 pt-4">
        <span className="text-sm text-slate-600">Si zdaj na tablici?</span>
        <Button variant="secondary" size="sm" onClick={useThis} disabled={usingThis}>
          {usingThis && <Loader2 className="h-4 w-4 animate-spin" />}
          Uporabi to napravo
        </Button>
        <span className="text-xs text-slate-400">Na tej napravi te bomo odjavili.</span>
      </div>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}

// --- Kode zaposlenih ---------------------------------------------------------------

function Pins({ employees }: { employees: Employee[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-slate-900">Kode zaposlenih</h2>
      <p className="mt-1 text-sm text-slate-500">Vsakemu zaposlenemu povej njegovo kodo. Kode vidiš samo ti.</p>
      {employees.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Še nimaš aktivnih zaposlenih.</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {employees.map((e) => (
            <PinRow key={e.id} employee={e} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function PinRow({ employee }: { employee: Employee }) {
  const [pin, setPin] = useState(employee.pin);
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function regenerate() {
    setLoading(true);
    setError(null);
    const res = await regeneratePin(employee.id);
    setLoading(false);
    setConfirm(false);
    if (res.error || !res.pin) setError(res.error ?? "Napaka.");
    else setPin(res.pin);
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <span className="font-medium text-slate-900">{employee.name}</span>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xl font-bold tracking-[0.25em] text-slate-900">{pin ?? "—"}</span>
        {confirm ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirm(false)} disabled={loading}>
              Prekliči
            </Button>
            <Button variant="secondary" size="sm" onClick={regenerate} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Zamenjaj kodo
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirm(true)} title="Npr. če je kodo izvedel sodelavec">
            Nova koda
          </Button>
        )}
      </div>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </li>
  );
}

// --- Izklop ------------------------------------------------------------------------

function TurnOff() {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function turnOff() {
    setLoading(true);
    await disableKiosk();
    router.refresh();
  }

  return (
    <div className="px-1 text-sm">
      {confirm ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-600">Izklopim? Vse tablice se odklopijo, žigosanje s telefonom ostane.</span>
          <Button variant="ghost" size="sm" onClick={() => setConfirm(false)} disabled={loading}>
            Prekliči
          </Button>
          <Button variant="danger" size="sm" onClick={turnOff} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Izklopi
          </Button>
        </div>
      ) : (
        <button onClick={() => setConfirm(true)} className="text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline">
          Izklopi skupno tablico
        </button>
      )}
    </div>
  );
}
