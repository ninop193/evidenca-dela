"use client";

import { useState } from "react";
import { ChevronRight, Users2 } from "lucide-react";
import { Badge } from "@/components/ui";

type Tone = "green" | "amber" | "slate" | "muted";

export type EmpRow = {
  name: string;
  workerLabel: string;
  statusLabel: string;
  statusTone: "green" | "amber" | "slate";
  loginLabel: string;
  loginTone: Tone;
  clockLabel: string;
  clockTone: Tone;
};

export type Row = {
  id: string;
  name: string;
  taxId: string;
  adminName: string;
  adminEmail: string;
  empCount: number;
  statusLabel: string;
  statusTone: "green" | "amber" | "slate" | "red";
  statusSub: string;
  untilLabel: string;
  createdLabel: string;
  rel: string;
  isToday: boolean;
  activityLabel: string;
  activityTone: Tone;
  hasEntries: boolean;
  employees: EmpRow[];
};

const toneCls = (t: Tone) =>
  t === "green"
    ? "text-emerald-600"
    : t === "amber"
      ? "text-amber-600"
      : t === "slate"
        ? "text-slate-600"
        : "text-slate-400";

export function NadzorTable({ rows }: { rows: Row[] }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-white/45 text-slate-500">
            <tr>
              <Th>Podjetje</Th>
              <Th>Admin</Th>
              <Th right>Zaposleni</Th>
              <Th>Status</Th>
              <Th>Naročnina do</Th>
              <Th>Registrirano</Th>
              <Th>Zadnja aktivnost</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((r) => {
              const canExpand = r.employees.length > 0;
              const isOpen = open.has(r.id);
              return (
                <FragmentRow key={r.id}>
                  <tr
                    onClick={() => canExpand && toggle(r.id)}
                    className={
                      "transition " +
                      (canExpand ? "cursor-pointer " : "") +
                      (isOpen ? "bg-white/60 " : r.isToday ? "bg-brand-50/40 " : "") +
                      "hover:bg-white/55"
                    }
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          className={
                            "h-4 w-4 shrink-0 transition-transform " +
                            (canExpand ? "text-slate-400 " : "text-transparent ") +
                            (isOpen ? "rotate-90" : "")
                          }
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{r.name}</p>
                          {r.taxId && <p className="text-xs text-slate-400">Davčna {r.taxId}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-700">{r.adminName}</p>
                      <p className="text-xs text-slate-400">{r.adminEmail}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-slate-700">{r.empCount}</td>
                    <td className="px-4 py-3.5">
                      <Badge tone={r.statusTone}>{r.statusLabel}</Badge>
                      {r.statusSub && <p className="mt-0.5 text-xs text-slate-400">{r.statusSub}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{r.untilLabel}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-700">{r.createdLabel}</span>
                      {r.rel && <span className="ml-1.5 text-xs text-slate-400">· {r.rel}</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={"font-medium " + toneCls(r.activityTone)}>{r.activityLabel}</span>
                      {!r.hasEntries && (
                        <p className="mt-0.5 text-xs font-medium text-amber-600">brez vnosov</p>
                      )}
                    </td>
                  </tr>

                  {isOpen && (
                    <tr className="bg-slate-50/60">
                      <td colSpan={7} className="px-4 pb-4 pt-1">
                        <EmployeeBlock employees={r.employees} />
                      </td>
                    </tr>
                  )}
                </FragmentRow>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobilno / ozko */}
      <ul className="divide-y divide-slate-100 lg:hidden">
        {rows.map((r) => {
          const canExpand = r.employees.length > 0;
          const isOpen = open.has(r.id);
          return (
            <li key={r.id} className={isOpen ? "bg-white/60" : r.isToday ? "bg-brand-50/40" : ""}>
              <button
                type="button"
                onClick={() => canExpand && toggle(r.id)}
                className="flex w-full items-start justify-between gap-3 p-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                    {canExpand && (
                      <ChevronRight
                        className={"h-4 w-4 shrink-0 text-slate-400 transition-transform " + (isOpen ? "rotate-90" : "")}
                      />
                    )}
                    {r.name}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-slate-500">{r.adminName} · {r.adminEmail}</p>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
                    <span>{r.empCount} zaposlenih</span>
                    {r.statusSub && <span>{r.statusSub}</span>}
                    <span>Reg. {r.createdLabel}{r.rel ? ` · ${r.rel}` : ""}</span>
                    <span className={"font-semibold " + (!r.hasEntries ? "text-amber-600" : toneCls(r.activityTone))}>
                      Aktivnost: {r.activityLabel}{!r.hasEntries ? " · brez vnosov" : ""}
                    </span>
                  </div>
                </div>
                <Badge tone={r.statusTone}>{r.statusLabel}</Badge>
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <EmployeeBlock employees={r.employees} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

// Seznam zaposlenih znotraj razširjene vrstice (prijava + žigosanje na zaposlenega).
function EmployeeBlock({ employees }: { employees: EmpRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/70 ring-1 ring-slate-200/70">
      <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Users2 className="h-3.5 w-3.5" /> Zaposleni ({employees.length})
      </div>
      <ul className="divide-y divide-slate-100">
        {employees.map((e, i) => (
          <li key={i} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-sm">
            <div className="min-w-[9rem] flex-1">
              <span className="font-medium text-slate-800">{e.name}</span>
              <span className="ml-2 text-xs text-slate-400">{e.workerLabel}</span>
            </div>
            <Badge tone={e.statusTone}>{e.statusLabel}</Badge>
            <span className="text-xs text-slate-500">
              Prijava: <span className={"font-medium " + toneCls(e.loginTone)}>{e.loginLabel}</span>
            </span>
            <span className="text-xs text-slate-500">
              Žigosanje: <span className={"font-medium " + toneCls(e.clockTone)}>{e.clockLabel}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={"px-4 py-3 text-xs font-semibold uppercase tracking-wide " + (right ? "text-right" : "")}>
      {children}
    </th>
  );
}
