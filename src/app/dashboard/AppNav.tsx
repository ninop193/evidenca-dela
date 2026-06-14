"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "../(auth)/actions";
import { Wordmark, cn } from "@/components/ui";

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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
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
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                  isActive(it.href, it.exact)
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {it.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden max-w-[160px] truncate text-sm font-medium text-slate-500 sm:block">
            {companyName}
          </span>
          <form action={signOut}>
            <button className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100">
              Odjava
            </button>
          </form>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-600 ring-1 ring-slate-200 md:hidden"
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
        <nav className="border-t border-slate-100 px-4 py-2 md:hidden">
          {ITEMS.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium",
                isActive(it.href, it.exact)
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-700 hover:bg-slate-100",
              )}
            >
              {it.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
