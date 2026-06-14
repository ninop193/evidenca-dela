import type { Metadata } from "next";
import Link from "next/link";
import Calculator from "./Calculator";
import { PLACA_CONFIG } from "@/lib/placa";
import { Aurora } from "@/components/Aurora";
import { Reveal } from "@/components/Reveal";
import { Faq } from "@/components/Faq";
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
    q: "Kakšna je razlika med bruto in neto plačo?",
    a: "Bruto plača je dogovorjeni znesek pred odbitki. Neto plača je tisto, kar zaposleni dejansko prejme na račun, potem ko se odštejejo prispevki in dohodnina.",
  },
  {
    q: "Koliko znašajo prispevki zaposlenega?",
    a: "Prispevki za socialno varnost, ki bremenijo zaposlenega, skupaj znašajo 22,10 % bruto plače (pokojninsko, zdravstveno, zaposlovanje in starševsko varstvo).",
  },
  {
    q: "Koliko stane zaposleni delodajalca?",
    a: "Delodajalec na bruto plačo dodatno plača 16,10 % prispevkov. Skupni strošek delodajalca je torej bruto plača + 16,10 % — kalkulator ti ta znesek izračuna samodejno.",
  },
  {
    q: "Kako se obračuna dohodnina?",
    a: "Akontacija dohodnine se obračuna po progresivni dohodninski lestvici od osnove (bruto minus prispevki minus splošna olajšava). Višja kot je plača, višja je stopnja na presežek.",
  },
  {
    q: "Ali kalkulator upošteva olajšave za otroke?",
    a: "Osnovni izračun upošteva splošno olajšavo. Olajšave za vzdrževane družinske člane (otroke) trenutno niso vključene — za uradni izračun se posvetuj z računovodjo ali preveri pri FURS.",
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

        <Reveal className="mt-8">
          <Calculator />
        </Reveal>

        {/* SEO besedilo + FAQ */}
        <section className="mt-14 space-y-10">
          <Reveal>
            <div className="glass iris-edge sheen rounded-2xl p-6">
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
          </Reveal>

          <div>
            <Reveal>
              <h2 className="text-xl font-bold text-slate-900">Pogosta vprašanja</h2>
            </Reveal>
            <Reveal delay={80} className="mt-4">
              <Faq items={faq} defaultOpen={null} />
            </Reveal>
          </div>
        </section>
      </div>

      <footer className="py-8 text-center text-sm text-slate-500">
        Evidenca dela — preprosta evidenca delovnega časa za mikro podjetja.
      </footer>
    </main>
  );
}
