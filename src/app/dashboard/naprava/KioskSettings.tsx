"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, Info, KeyRound, Loader2, Pencil, Plus, RefreshCw, Smartphone, TabletSmartphone, UserRound, X } from "lucide-react";
import { Button, Card, Input, cn } from "@/components/ui";
import {
  createPairCode,
  disableKiosk,
  disconnectDevice,
  enableKiosk,
  regeneratePin,
  renameDevice,
  connectAsKiosk,
} from "./actions";
import { SITE } from "@/lib/seo";

const KIOSK_HOST = new URL(SITE.url).host.replace(/^www\./, "");

type Employee = { id: string; name: string; pin: string | null };
type Device = { id: string; name: string | null; createdAt: string; lastUsedAt: string | null };

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
    { icon: TabletSmartphone, text: "Tablico ali telefon na delovnem mestu enkrat povežeš s kodo." },
    { icon: UserRound, text: "Zaposleni na napravi pritisne svoje ime." },
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
        Kode za vse zaposlene ustvarimo samodejno. Žigosanje s telefonom deluje naprej, zaposleni lahko uporabljajo oboje.
      </p>
      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <Button size="lg" className="mt-6" onClick={turnOn} disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Vklopi skupno napravo
      </Button>
    </Card>
  );
}

// --- Povezane naprave -------------------------------------------------------------

function Devices({ devices }: { devices: Device[] }) {
  const router = useRouter();
  const [pairing, setPairing] = useState(devices.length === 0);
  const [infoOpen, setInfoOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Oblaček zapre klik drugam ali tipka Escape.
  useEffect(() => {
    if (!infoOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setInfoOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setInfoOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [infoOpen]);
  // Pravkar povezana naprava → takoj ponudi, da jo poimenuje.
  const [justPairedId, setJustPairedId] = useState<string | null>(null);

  // Med povezovanjem preverjaj, ali se je nova naprava že povezala → zapri navodila.
  const [countAtOpen, setCountAtOpen] = useState(devices.length);
  useEffect(() => {
    if (!pairing) return;
    const t = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(t);
  }, [pairing, router]);
  if (pairing && devices.length > countAtOpen) {
    setCountAtOpen(devices.length);
    setPairing(false);
    setJustPairedId(devices[devices.length - 1].id);
  }

  return (
    // Odprt oblaček mora ležati NAD naslednjo kartico (vsaka steklena kartica je svoja plast).
    <Card className={cn("p-5 sm:p-6", infoOpen && "z-20")}>
      <div ref={headerRef} className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Naprave za žigosanje</h2>
          <p className="mt-0.5 text-sm text-slate-500">Telefon ali tablica, ki ostane na delovnem mestu.</p>
        </div>
        <div className="flex items-center gap-1.5">
          {!pairing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setCountAtOpen(devices.length);
                setJustPairedId(null);
                setPairing(true);
              }}
            >
              <Plus className="h-4 w-4" /> Dodaj napravo
            </Button>
          )}
          <button
            type="button"
            onClick={() => setInfoOpen((v) => !v)}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full ring-1 transition",
              infoOpen
                ? "bg-brand-50 text-brand-700 ring-brand-200"
                : "bg-white/70 text-slate-500 ring-slate-200/80 hover:bg-white hover:text-brand-700",
            )}
            aria-expanded={infoOpen}
            aria-label="Kako povežem napravo?"
            title="Kako povežem napravo?"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
        {infoOpen && <PairInfo onClose={() => setInfoOpen(false)} />}
      </div>

      {devices.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-100">
          {devices.map((d, i) => (
            <DeviceRow key={d.id} device={d} index={i + 1} justPaired={d.id === justPairedId} />
          ))}
        </ul>
      )}

      {pairing && <PairPanel canCancel={devices.length > 0} onCancel={() => setPairing(false)} />}
    </Card>
  );
}

// Razlaga ob "i": steklen oblaček pod gumbom (desno poravnan). Pove, kaj pomeni
// dodati napravo — in da svojega telefona ne povezuješ.
function PairInfo({ onClose }: { onClose: () => void }) {
  const num = "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white";
  return (
    <div
      role="dialog"
      aria-label="Kaj pomeni »Dodaj napravo«?"
      className="absolute right-0 top-full z-30 mt-3 w-full origin-top-right animate-[popIn_160ms_ease-out] sm:w-[23rem]"
    >
      {/* sij za oblačkom */}
      <div
        aria-hidden
        className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-fuchsia-300/45 via-sky-300/40 to-emerald-300/40 blur-2xl"
      />
      <div className="relative rounded-2xl bg-white/90 p-5 text-sm text-slate-700 shadow-[0_24px_60px_-20px_rgba(30,41,99,0.45)] ring-1 ring-white backdrop-blur-xl">
        {/* puščica proti gumbu "i" (na telefonu je gumb drugje → brez puščice) */}
        <span
          aria-hidden
          className="absolute -top-1.5 right-3 hidden h-3 w-3 rotate-45 border-l border-t border-white bg-white/90 sm:block"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Zapri"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="pr-8 font-semibold text-slate-900">Kaj pomeni »Dodaj napravo«?</p>
        <p className="mt-1.5 leading-relaxed">
          Telefon ali tablico, na kateri bodo žigosali vsi zaposleni (npr. na pultu ali pri vhodu), povežeš samo enkrat:
        </p>
        <ol className="mt-3 space-y-2.5">
          <li className="flex gap-2.5">
            <span className={num}>1</span>
            <span className="pt-0.5">Tukaj klikneš »Dodaj napravo« in dobiš 6-mestno kodo.</span>
          </li>
          <li className="flex gap-2.5">
            <span className={num}>2</span>
            <span className="pt-0.5">
              Na tisti napravi odpreš <strong className="font-mono text-slate-900">{KIOSK_HOST}/naprava</strong> in
              vpišeš kodo.
            </span>
          </li>
        </ol>
        <p className="mt-4 flex gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-slate-600 ring-1 ring-slate-100">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>Svojega telefona ti ni treba povezovati. Ti in zaposleni se na svojih telefonih prijavljate kot doslej.</span>
        </p>
      </div>
    </div>
  );
}

function DeviceRow({ device, index, justPaired }: { device: Device; index: number; justPaired: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "rename" | "disconnect">(justPaired ? "rename" : "view");
  const [name, setName] = useState(device.name ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = device.name || `Naprava ${index}`;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await renameDevice(device.id, name);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setMode("view");
    router.refresh();
  }

  async function disconnect() {
    setLoading(true);
    const res = await disconnectDevice(device.id);
    if (res.error) {
      setLoading(false);
      setError(res.error);
      return;
    }
    router.refresh();
  }

  if (mode === "rename") {
    return (
      <li className="py-3">
        <form onSubmit={save} className="rounded-2xl bg-white/70 p-4 ring-1 ring-slate-200/70">
          {justPaired && (
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Naprava je povezana. Zaposleni lahko začnejo žigosati.
            </p>
          )}
          <label htmlFor={`ime-${device.id}`} className="text-sm font-medium text-slate-700">
            {justPaired ? "Kako ji rečeš? (neobvezno)" : "Ime naprave"}
          </label>
          <Input
            id={`ime-${device.id}`}
            className="mt-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setMode("view")}
            placeholder="npr. Telefon v lokalu"
            maxLength={40}
            autoFocus
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setMode("view")} disabled={loading}>
              {justPaired ? "Preskoči" : "Prekliči"}
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Shrani
            </Button>
          </div>
        </form>
      </li>
    );
  }

  if (mode === "disconnect") {
    return (
      <li className="py-3">
        <div className="rounded-2xl bg-red-50/70 p-4 ring-1 ring-red-100">
          <p className="font-semibold text-slate-900">Odklopim »{label}«?</p>
          <p className="mt-1 text-sm text-slate-600">
            Na njej zaposleni ne bodo več mogli žigosati. Že zabeleženi žigi ostanejo. Napravo lahko kadarkoli povežeš
            znova.
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setMode("view")} disabled={loading}>
              Prekliči
            </Button>
            <Button variant="danger" size="sm" onClick={disconnect} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Odklopi napravo
            </Button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 py-3">
      <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/70 text-slate-600 ring-1 ring-slate-200/70 sm:grid">
        <TabletSmartphone className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 font-medium text-slate-900">
          <span className="break-words">{label}</span>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode("rename");
            }}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-900"
            aria-label={`Preimenuj ${label}`}
            title="Preimenuj"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </p>
        <p className="text-sm text-slate-500">
          {device.lastUsedAt ? `Zadnji žig ${fmtDateTime(device.lastUsedAt)}` : "Še brez žigov"}
          <span className="hidden sm:inline"> · povezana {fmtDate(device.createdAt)}</span>
        </p>
      </div>
      <div className="shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="px-3"
          onClick={() => {
            setError(null);
            setMode("disconnect");
          }}
        >
          Odklopi
        </Button>
      </div>
    </li>
  );
}

function PairPanel({ canCancel, onCancel }: { canCancel: boolean; onCancel: () => void }) {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState(true);
  const [confirmThis, setConfirmThis] = useState(false);
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
    window.location.assign("/naprava");
  }

  const step = "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white";

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
      <p className="pr-8 font-semibold text-slate-900">Dodaj napravo</p>
      <p className="mt-1 pr-8 text-sm text-slate-600">
        Vzemi telefon ali tablico, na kateri bodo žigosali zaposleni, in na njej naredi to:
      </p>

      <ol className="mt-4 space-y-4 text-[15px] text-slate-700">
        <li className="flex gap-3">
          <span className={step}>1</span>
          <div className="pt-0.5">
            V brskalniku odpri{" "}
            <strong className="whitespace-nowrap rounded-md bg-white px-1.5 py-0.5 font-mono text-slate-900 ring-1 ring-slate-200">
              {KIOSK_HOST}/naprava
            </strong>
          </div>
        </li>
        <li className="flex gap-3">
          <span className={step}>2</span>
          <div className="pt-0.5">
            <p>Vpiši to kodo:</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
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
            </div>
            <p className="mt-1 text-xs text-slate-400">Koda velja 10 minut in jo lahko uporabiš enkrat.</p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className={step}>3</span>
          <p className="flex items-center gap-2 pt-0.5 text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
            Ko se naprava poveže, se ta stran sama posodobi.
          </p>
        </li>
      </ol>

      <details className="group mt-5 rounded-xl bg-white/60 px-4 py-3 text-sm ring-1 ring-slate-200/70">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium text-slate-700">
          Nasveti za tablico ali telefon na pultu
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
        </summary>
        <ul className="mt-2.5 space-y-2 text-slate-600">
          <li>
            <strong className="text-slate-800">Ikona na začetnem zaslonu:</strong> najprej dodaj ikono (v Safariju
            Deli → Dodaj na začetni zaslon), jo odpri in šele tam vpiši kodo. Na iPhonu in iPadu ikona ne pozna
            povezave iz brskalnika.
          </li>
          <li>
            <strong className="text-slate-800">Brez zasebnega okna:</strong> ko se zasebno okno zapre, se naprava
            odklopi.
          </li>
          <li>
            <strong className="text-slate-800">Zaklep zaslona:</strong> ugasnjen zaslon napravo ne odklopi. Če pa
            ima tablica geslo, v nastavitvah podaljšaj čas do zaklepa, da je zaposlenim ni treba vsakič odklepati.
          </li>
        </ul>
      </details>

      <div className="mt-5 border-t border-slate-200/70 pt-4">
        {confirmThis ? (
          <div className="rounded-2xl bg-amber-50/80 p-4 ring-1 ring-amber-200/70">
            <p className="font-semibold text-slate-900">Ta naprava bo postala skupna naprava za žigosanje.</p>
            <p className="mt-1 text-sm text-slate-600">
              Zaradi varnosti te bomo na njej odjavili, da zaposleni ne pridejo do tvoje nadzorne plošče. Svoj račun
              še naprej odpiraš na svojem telefonu ali računalniku.
            </p>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmThis(false)} disabled={usingThis}>
                Prekliči
              </Button>
              <Button size="sm" onClick={useThis} disabled={usingThis}>
                {usingThis && <Loader2 className="h-4 w-4 animate-spin" />}
                Da, uporabi to napravo
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            To stran že gledaš na napravi, ki bo ostala na delovnem mestu?{" "}
            <button
              type="button"
              onClick={() => setConfirmThis(true)}
              className="font-semibold text-brand-700 underline-offset-4 hover:underline"
            >
              Uporabi to napravo
            </button>
          </p>
        )}
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
      <p className="mt-1 text-sm text-slate-500">Vsak zaposleni vidi svojo kodo v aplikaciji, ko se prijavi. Lahko mu jo poveš tudi ti.</p>
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
    if (res.error || !res.pin) {
      setError(res.error ?? "Napaka.");
      return;
    }
    setConfirm(false);
    setPin(res.pin);
  }

  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 break-words font-medium text-slate-900">{employee.name}</span>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-lg font-bold tracking-[0.2em] text-slate-900 sm:text-xl sm:tracking-[0.25em]">{pin ?? "—"}</span>
          {!confirm && (
            <Button
              variant="ghost"
              size="sm"
              className="px-3"
              onClick={() => {
                setError(null);
                setConfirm(true);
              }}
            >
              Nova koda
            </Button>
          )}
        </div>
      </div>
      {confirm && (
        <div className="mt-3 rounded-2xl bg-white/70 p-4 ring-1 ring-slate-200/70">
          <p className="text-sm text-slate-700">
            Zaposleni dobi novo kodo, stara takoj preneha delovati. Novo kodo vidi v aplikaciji. Uporabno, če je kodo
            izvedel sodelavec.
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setConfirm(false)} disabled={loading}>
              Prekliči
            </Button>
            <Button variant="secondary" size="sm" onClick={regenerate} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Zamenjaj kodo
            </Button>
          </div>
        </div>
      )}
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
        <div className="rounded-2xl bg-red-50/70 p-4 ring-1 ring-red-100">
          <p className="font-semibold text-slate-900">Izklopim skupno napravo?</p>
          <p className="mt-1 text-slate-600">
            Vse naprave se odklopijo. Žigosanje s telefonom in vsi že zabeleženi žigi ostanejo. Kode zaposlenih
            shranimo, če jo kdaj vklopiš znova.
          </p>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setConfirm(false)} disabled={loading}>
              Prekliči
            </Button>
            <Button variant="danger" size="sm" onClick={turnOff} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Izklopi
            </Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setConfirm(true)} className="text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline">
          Izklopi skupno napravo
        </button>
      )}
    </div>
  );
}
