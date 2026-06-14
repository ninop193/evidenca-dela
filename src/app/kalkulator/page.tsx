import type { Metadata } from "next";
import Link from "next/link";
import Calculator from "./Calculator";
import { PLACA_CONFIG } from "@/lib/placa";
import { Aurora } from "@/components/Aurora";
import { Wordmark, buttonClasses } from "@/components/ui";

export const metadata: Metadata = {
  title: `Bruto-neto kalkulator plače ${PLACA_CONFIG.leto} | Izračun neto plače`,
  description:
    "Brezplačen bruto-neto kalkulator plače za Slovenijo. Izračunaj neto plačo iz bruto zneska — prispevki, dohodnina in strošek delodajalca. Hitro in preprosto.",
  keywords: [
    "bruto neto kalkulator",
    "izračun neto plače",
    "bruto v neto",
    "kalkulator plače",
    "neto plača Slovenija",
    "strošek delodajalca",
  ],
  openGraph: {
    title: `Bruto-neto kalkulator plače ${PLACA_CONFIG.leto}`,
    description:
      "Izračunaj neto plačo iz bruto zneska — prispevki, dohodnina in strošek delodajalca.",
    type: "website",
    locale: "sl_SI",
  },
};

const faq = [
  {
    q: "Kako izračunam neto plačo iz bruto?",
    a: "Od bruto plače se odštejejo prispevki zaposlenega (22,10 %) in akontacija dohodnine (po lestvici, ob upoštevanju splošne olajšave). Razlika je neto plača — znesek izplačila.",
  },
  {
    q: "Koliko znašajo prispevki delodajalca?",
    a: "Delodajalec na bruto plačo dodatno plača 16,10 % prispevkov. Skupni strošek delodajalca je torej bruto plača + 16,10 %.",
  },
  {
    q: "Ali kalkulator upošteva olajšave za otroke?",
    a: "Osnovni izračun upošteva splošno olajšavo. Olajšave za vzdrževane družinske člane (otroke) trenutno niso vključene — za uradni izračun se posvetuj z računovodjo.",
  },
];

export default function KalkulatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Bruto-neto kalkulator plače",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        inLanguage: "sl",
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <main className="relative min-h-screen text-slate-800">
      <Aurora />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-20 px-3 pt-3">
        <div className="glass iris-edge mx-auto flex max-w-2xl items-center justify-between rounded-full px-4 py-2.5">
          <Link href="/">
            <Wordmark />
          </Link>
          <Link href="/register" className={buttonClasses("primary", "sm")}>
            Začni brezplačno
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Bruto-neto kalkulator plače {PLACA_CONFIG.leto}
        </h1>
        <p className="mt-2 text-slate-600">
          Vpiši bruto plačo in takoj vidiš neto izplačilo, prispevke, dohodnino in skupni
          strošek delodajalca. Brezplačno, brez registracije.
        </p>

        <div className="mt-8">
          <Calculator />
        </div>

        {/* SEO besedilo + FAQ */}
        <section className="mt-12 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Kako deluje izračun plače?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              V Sloveniji se neto plača izračuna tako, da se od bruto plače najprej odštejejo
              prispevki za socialno varnost, ki bremenijo zaposlenega (skupaj 22,10 %). Nato se
              izračuna osnova za dohodnino, od katere se odšteje splošna olajšava, in se po
              dohodninski lestvici obračuna akontacija dohodnine. Kar ostane, je neto plača.
              Delodajalec poleg tega plača še 16,10 % prispevkov, kar predstavlja njegov skupni
              strošek dela.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Pogosta vprašanja</h2>
            <dl className="mt-3 space-y-4">
              {faq.map((f) => (
                <div key={f.q}>
                  <dt className="font-semibold text-slate-900">{f.q}</dt>
                  <dd className="mt-1 text-sm text-slate-600">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>

      <footer className="py-8 text-center text-sm text-slate-500">
        Evidenca dela — preprosta evidenca delovnega časa za mikro podjetja.
      </footer>
    </main>
  );
}
