import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, Clock, ShieldCheck } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Footer } from "@/components/Footer";
import { Wordmark } from "@/components/ui";
import { YandexMetrika } from "@/components/YandexMetrika";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Stopi v stik z ekipo Delovit. Vprašanja o evidenci delovnega časa, naročnini ali povpraševanje za več kot 10 zaposlenih.",
  alternates: { canonical: "/kontakt" },
};

const PREFILL: Record<string, string> = {
  "vec-zaposlenih":
    "Pozdravljeni, zanima me Delovit za več kot 10 zaposlenih. Prosim za ponudbo.",
};

export default async function KontaktPage({
  searchParams,
}: {
  searchParams: Promise<{ tema?: string }>;
}) {
  const sp = await searchParams;
  const defaultMessage = (sp.tema && PREFILL[sp.tema]) || "";

  return (
    <main className="relative min-h-screen text-slate-800">
      <Aurora />
      <YandexMetrika />

      <header className="sticky top-0 z-20 px-3 pt-3">
        <div className="glass iris-edge mx-auto flex max-w-4xl items-center justify-between rounded-full px-4 py-2.5">
          <Link href="/">
            <Wordmark />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white/60 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Domov
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Stopi v stik
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-slate-600">
            Imaš vprašanje o evidenci, naročnini ali več kot 10 zaposlenih? Piši nam in
            odgovorimo v najkrajšem možnem času.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          {/* Obrazec */}
          <div className="lg:col-span-3">
            <div className="glass-strong iris-edge rounded-3xl p-6 sm:p-8">
              <ContactForm defaultMessage={defaultMessage} />
            </div>
          </div>

          {/* Stranske informacije */}
          <div className="lg:col-span-2">
            <div className="glass iris-edge flex h-full flex-col gap-5 rounded-3xl p-6 sm:p-8">
              <Info icon={<Mail className="h-5 w-5" />} title="E-pošta">
                <a href="mailto:info@delovit.si" className="text-brand-700 hover:text-brand-800">
                  info@delovit.si
                </a>
              </Info>
              <Info icon={<Clock className="h-5 w-5" />} title="Odzivni čas">
                Običajno odgovorimo v enem delovnem dnevu.
              </Info>
              <Info icon={<ShieldCheck className="h-5 w-5" />} title="Tvoji podatki">
                Sporočilo uporabimo izključno za odgovor na tvoje povpraševanje.
              </Info>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function Info({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-sm text-slate-600">{children}</p>
      </div>
    </div>
  );
}
