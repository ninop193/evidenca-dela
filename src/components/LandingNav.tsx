"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/ui";

const LINKS = [
  { href: "/#cena", label: "Cena" },
  { href: "/kalkulator", label: "Kalkulator" },
  { href: "/blog", label: "Blog" },
];

const linkClass =
  "rounded-full px-3 py-1.5 font-medium text-slate-600 transition hover:bg-white/60 hover:text-slate-900";

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 px-4 pt-4">
      <div className="glass-strong iris-edge mx-auto flex max-w-5xl items-center justify-between rounded-full px-5 py-2.5">
        <Link href="/">
          <Wordmark className="relative z-10" />
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-1 text-sm sm:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
          <Link href="/login" className={linkClass}>
            Prijava
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_6px_20px_-6px_rgba(29,78,216,0.7)] transition hover:bg-brand-500"
          >
            Začni
          </Link>
        </nav>

        {/* Mobile: CTA + hamburger */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/register"
            className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_6px_20px_-6px_rgba(29,78,216,0.7)] transition hover:bg-brand-500"
          >
            Začni
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/60 text-slate-600 ring-1 ring-white/70"
            aria-label={open ? "Zapri meni" : "Odpri meni"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile spustni meni */}
      {open && (
        <nav className="glass-strong iris-edge mx-auto mt-2 max-w-5xl rounded-2xl p-2 sm:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-white/60"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-white/60"
          >
            Prijava
          </Link>
        </nav>
      )}
    </header>
  );
}
