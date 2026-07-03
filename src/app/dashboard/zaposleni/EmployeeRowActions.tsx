"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, UserX, UserCheck, Trash2, Loader2, X, Pencil, Mail } from "lucide-react";
import { setEmployeeActive, deleteEmployee, resendEmployeeInvite } from "../actions";

export function EmployeeRowActions({
  employeeId,
  fullName,
  active,
}: {
  employeeId: string;
  fullName: string;
  active: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteOk, setInviteOk] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggleActive() {
    setLoading(true);
    setError(null);
    const res = await setEmployeeActive(employeeId, !active);
    setLoading(false);
    if (res.error) setError(res.error);
    else {
      setOpen(false);
      router.refresh();
    }
  }

  async function doResendInvite() {
    setLoading(true);
    setError(null);
    setInviteOk(false);
    const res = await resendEmployeeInvite(employeeId);
    setLoading(false);
    if (res.error) setError(res.error);
    else setInviteOk(true);
  }

  async function doDelete() {
    setLoading(true);
    setError(null);
    const res = await deleteEmployee(employeeId);
    setLoading(false);
    if (res.error) setError(res.error);
    else {
      setConfirmDelete(false);
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => { setOpen((v) => !v); setError(null); setInviteOk(false); }}
        className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-white/70 hover:text-slate-900"
        aria-label="Možnosti"
      >
        <MoreVertical className="h-4.5 w-4.5" />
      </button>

      {open && (
        <div className="glass-strong iris-edge absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-2xl p-1.5 text-sm shadow-lg">
          <Link
            href={`/dashboard/zaposleni/${employeeId}`}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-medium text-slate-700 transition hover:bg-white/70"
          >
            <Pencil className="h-4 w-4 text-slate-500" />
            Uredi
          </Link>
          <button
            onClick={doResendInvite}
            disabled={loading}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-medium text-slate-700 transition hover:bg-white/70 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4 text-brand-600" />}
            {inviteOk ? "Povabilo poslano ✓" : "Pošlji povabilo znova"}
          </button>
          <button
            onClick={toggleActive}
            disabled={loading}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-medium text-slate-700 transition hover:bg-white/70 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : active ? <UserX className="h-4 w-4 text-amber-600" /> : <UserCheck className="h-4 w-4 text-emerald-600" />}
            {active ? "Deaktiviraj" : "Ponovno aktiviraj"}
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={loading}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Izbriši dokončno
          </button>
          {error && (
            <p className="mt-1 rounded-xl bg-red-50 px-3 py-2 text-xs leading-snug text-red-700">{error}</p>
          )}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={() => !loading && setConfirmDelete(false)}>
          <div className="glass-strong iris-edge w-full max-w-sm rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <button onClick={() => !loading && setConfirmDelete(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">Izbriši zaposlenega?</h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Dokončno odstraniš <strong>{fullName}</strong> in njegov dostop. Tega ni mogoče razveljaviti.
              Če ima zabeleženo evidenco ur, brisanje ne bo dovoljeno (raje deaktiviraj).
            </p>
            {error && (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={loading}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/70 disabled:opacity-50"
              >
                Prekliči
              </button>
              <button
                onClick={doDelete}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Izbriši
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
