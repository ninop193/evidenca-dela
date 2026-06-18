import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Footer } from "@/components/Footer";
import { Wordmark } from "@/components/ui";
import { LEGAL_UPDATED } from "@/lib/legal";
import { YandexMetrika } from "@/components/YandexMetrika";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen text-slate-800">
      <Aurora />
      <YandexMetrika />

      <header className="sticky top-0 z-20 px-3 pt-3">
        <div className="glass iris-edge mx-auto flex max-w-3xl items-center justify-between rounded-full px-4 py-2.5">
          <Link href="/">
            <Wordmark />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white/60 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Domov
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="glass-strong iris-edge rounded-3xl p-7 sm:p-10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">Zadnja posodobitev: {LEGAL_UPDATED}</p>
          <div className="legal mt-8 space-y-6 text-[15px] leading-relaxed text-slate-700">
            {children}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

// Pomožni gradniki za doslednost pravnih strani.
export function LSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
