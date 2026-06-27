import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Footer } from "@/components/Footer";
import { Wordmark, buttonClasses } from "@/components/ui";
import { YandexMetrika } from "@/components/YandexMetrika";
import { BLOG_POSTS, dateSl } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog: evidenca delovnega časa in ZEPDSV",
  description:
    "Praktični vodiči o evidenci delovnega časa, ZEPDSV in obveznostih delodajalca. Brez pravnega žargona, za mikro podjetja in s.p.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog Delovit: evidenca delovnega časa in ZEPDSV",
    description: "Praktični vodiči o evidenci delovnega časa za mikro podjetja in s.p.",
    type: "website",
    locale: "sl_SI",
    url: "/blog",
    siteName: "Delovit",
  },
};

export default function BlogIndex() {
  return (
    <main className="relative min-h-screen text-slate-800">
      <Aurora />
      <YandexMetrika />

      <header className="sticky top-0 z-30 px-4 pt-4">
        <div className="glass-strong iris-edge mx-auto flex max-w-5xl items-center justify-between rounded-full px-5 py-2.5">
          <Link href="/">
            <Wordmark className="relative z-10" />
          </Link>
          <Link href="/register" className={buttonClasses("primary", "sm")}>
            Začni brezplačno
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-5 pt-14 pb-6 text-center">
        <h1 className="text-[2.2rem] font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Blog
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Praktični vodiči o evidenci delovnega časa, ZEPDSV in obveznostih delodajalca. Brez
          pravnega žargona.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-16">
        <ul className="space-y-5">
          {BLOG_POSTS.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="glass-strong iris-edge group block rounded-3xl p-7 transition hover:bg-white/70"
              >
                <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                  <time dateTime={p.date}>{dateSl(p.date)}</time>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {p.readMins} min branja
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-bold text-slate-900 group-hover:text-brand-700">
                  {p.title}
                </h2>
                <p className="mt-2 text-slate-600">{p.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                  Preberi članek
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Footer />
    </main>
  );
}
