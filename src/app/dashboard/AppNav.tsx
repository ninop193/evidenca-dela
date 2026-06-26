"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CreditCard } from "lucide-react";
import { signOut } from "../(auth)/actions";
import { Wordmark, cn } from "@/components/ui";
import { ChangePassword } from "@/components/ChangePassword";

const ITEMS = [
  { href: "/dashboard", label: "Domov", exact: true },
  { href: "/dashboard/zaposleni", label: "Zaposleni" },
  { href: "/dashboard/ure", label: "Ure" },
  { href: "/dashboard/pregled", label: "Mesečni pregled" },
  { href: "/dashboard/odsotnosti", label: "Odsotnosti" },
];

export default function AppNav({ companyName }: { companyName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/") || pathname === href;

  return (
    <header className="sticky top-0 z-30 px-3 pt-3">
      <div className="glass iris-edge mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {ITEMS.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition",
                  isActive(it.href, it.exact)
                    ? "bg-brand-600 text-white shadow-[0_6px_16px_-6px_rgba(29,78,216,0.7)]"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-900",
                )}
              >
                {it.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/narocnina"
            className={cn(
              "hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition sm:inline-flex",
              isActive("/narocnina")
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-white/60 hover:text-slate-900",
            )}
          >
            <CreditCard className="h-4 w-4" /> Naročnina
          </Link>
          <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-500 lg:block">
            {companyName}
          </span>
          <ChangePassword variant="icon" />
          <form action={signOut}>
            <button className="rounded-full bg-white/60 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-white/70 transition hover:bg-white/80">
              Odjava
            </button>
          </form>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full bg-white/60 p-2 text-slate-600 ring-1 ring-white/70 md:hidden"
            aria-label="Meni"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobilni meni */}
      {open && (
        <nav className="glass iris-edge mx-auto mt-2 max-w-6xl rounded-2xl p-2 md:hidden">
          {ITEMS.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-xl px-3 py-2 text-sm font-medium",
                isActive(it.href, it.exact)
                  ? "bg-brand-600 text-white"
                  : "text-slate-700 hover:bg-white/60",
              )}
            >
              {it.label}
            </Link>
          ))}
          <div className="my-1 h-px bg-slate-300/50" />
          <Link
            href="/narocnina"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
              isActive("/narocnina")
                ? "bg-brand-600 text-white"
                : "text-slate-700 hover:bg-white/60",
            )}
          >
            <CreditCard className="h-4 w-4" /> Naročnina
          </Link>
          <ChangePassword variant="text" />
        </nav>
      )}
    </header>
  );
}
