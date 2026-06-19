import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Wordmark, buttonClasses, cn } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center px-4 py-10 text-slate-800">
      <Aurora />

      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-block">
          <Wordmark />
        </Link>

        <div className="glass-strong iris-edge mt-8 rounded-3xl p-8 sm:p-10">
          <p className="text-holo text-6xl font-extrabold tracking-tight sm:text-7xl">404</p>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Te strani ni mogoče najti</h1>
          <p className="mx-auto mt-2 max-w-sm text-slate-600">
            Povezava je morda napačna ali pa je bila stran premaknjena. Brez skrbi, nazaj te
            pripeljemo v enem kliku.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/" className={buttonClasses("primary", "md")}>
              <Home className="h-4 w-4" />
              Na domačo stran
            </Link>
            <Link href="/login" className={cn(buttonClasses("secondary", "md"))}>
              <ArrowLeft className="h-4 w-4" />
              Prijava
            </Link>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-500">
          Potrebuješ pomoč?{" "}
          <Link href="/kontakt" className="font-medium text-brand-700 hover:text-brand-800">
            Piši nam
          </Link>
        </p>
      </div>
    </main>
  );
}
