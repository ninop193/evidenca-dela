import type { Metadata } from "next";
import Link from "next/link";
import Calculator from "./Calculator";
import { PLACA_CONFIG } from "@/lib/placa";
import { Aurora } from "@/components/Aurora";
import { Reveal } from "@/components/Reveal";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Wordmark, buttonClasses } from "@/components/ui";
import { SITE, orgJsonLd, websiteJsonLd } from "@/lib/seo";
import { YandexMetrika } from "@/components/YandexMetrika";

export const metadata: Metadata = {
  title: { absolute: `Bruto-neto kalkulator plače ${PLACA_CONFIG.leto} | Delovit` },
  description:
    "Brezplačen bruto-neto kalkulator plače za Slovenijo. Izračunaj neto plačo iz bruto zneska, prispevki, dohodnina in strošek delodajalca. Hitro in preprosto.",
  keywords: [
    "bruto neto kalkulator",
    "izračun neto plače",
    "bruto v neto",
    "kalkulator plače",
    "neto plača Slovenija",
    "strošek delodajalca",
  ],
  alternates: {
    canonical: "/kalkulator",
  },
  openGraph: {
    title: `Bruto-neto kalkulator plače ${PLACA_CONFIG.leto}`,
    description:
      "Izračunaj neto plačo iz bruto zneska, prispevki, dohodnina in strošek delodajalca.",
    type: "website",
    locale: "sl_SI",
    url: "/kalkulator",
    siteName: "Delovit",
  },
};

const faq = [
  {
    q: "Kako izračunam neto plačo iz bruto?",
    a: "Od bruto plače se odštejejo prispevki zaposlenega (22,10 %) in akontacija dohodnine (po lestvici, ob upoštevanju splošne olajšave). Razlika je neto plača, znesek izplačila.",
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
    a: "Delodajalec na bruto plačo dodatno plača 16,10 % prispevkov. Skupni strošek delodajalca je torej bruto plača + 16,10 %, kalkulator ti ta znesek izračuna samodejno.",
  },
  {
    q: "Kako se obračuna dohodnina?",
    a: "Akontacija dohodnine se obračuna po progresivni dohodninski lestvici od osnove (bruto minus prispevki minus splošna olajšava). Višja kot je plača, višja je stopnja na presežek.",
  },
  {
    q: "Ali kalkulator upošteva olajšave za otroke?",
    a: "Osnovni izračun upošteva splošno olajšavo. Olajšave za vzdrževane družinske člane (otroke) trenutno niso vključene, za uradni izračun se posvetuj z računovodjo ali preveri pri FURS.",
  },
  {
    q: "Kaj je bruto bruto (skupni strošek delodajalca)?",
    a: "Bruto bruto je bruto plača plus prispevki delodajalca (16,10 %). To je resnični strošek zaposlitve za delodajalca — koliko ga zaposleni dejansko stane, ne le znesek na plačilni listi.",
  },
  {
    q: "Koliko znaša minimalna plača?",
    a: "Minimalno plačo država vsako leto na novo določi, zato točen bruto znesek preveri v uradnem viru (MDDSZ). Neto minimalne plače ti izračuna ta kalkulator — vpiši veljavno bruto minimalno plačo in dobiš neto izplačilo.",
  },
  {
    q: "Koliko dobi študent na roke?",
    a: "Ta kalkulator velja za redno zaposlitev. Študentsko delo prek napotnice se obračuna drugače (dajatve na strani servisa/delodajalca, ne enaki prispevki kot pri zaposlitvi), zato za urne postavke študentov velja ločen izračun.",
  },
  {
    q: "Ali se regres všteva v plačo?",
    a: "Regres je ločeno letno izplačilo in ni del mesečne bruto plače. Do zneska, ki ga določa zakon, ni obremenjen s prispevki in dohodnino; presežek nad tem se obdavči. Za tekoče leto preveri veljavne meje pri FURS.",
  },
];

export default function KalkulatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      orgJsonLd,
      websiteJsonLd,
      {
        "@type": "WebApplication",
        name: "Bruto-neto kalkulator plače",
        url: `${SITE.url}/kalkulator`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        inLanguage: "sl",
        publisher: { "@id": `${SITE.url}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Domov", item: SITE.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Bruto-neto kalkulator",
            item: `${SITE.url}/kalkulator`,
          },
        ],
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
      <YandexMetrika />
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

        {/* Interni link na produktno stran (prelije avtoriteto kalkulatorja) + konverzija */}
        <Reveal className="mt-8">
          <div className="glass iris-edge rounded-2xl p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Vodiš evidenco ur ročno?</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Delovit poskrbi za obračun ur, dopust in izvoz za inšpekcijo. Poglej, kako{" "}
                <Link
                  href="/evidenca-delovnega-casa"
                  className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800"
                >
                  aplikacija za evidenco delovnega časa
                </Link>{" "}
                deluje v praksi.
              </p>
            </div>
            <Link
              href="/register"
              className={buttonClasses("primary") + " mt-4 shrink-0 sm:mt-0"}
            >
              Začni brezplačno
            </Link>
          </div>
        </Reveal>

        {/* SEO besedilo + FAQ */}
        <section className="mt-14 space-y-10">
          <Reveal>
            <div className="glass iris-edge sheen rounded-2xl p-6 sm:p-8">
              <div className="space-y-8 text-sm leading-relaxed text-slate-600">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Kaj je bruto in kaj neto plača?
                  </h2>
                  <p className="mt-2">
                    Bruto plača je znesek, zapisan v pogodbi o zaposlitvi, in je izhodišče za vse
                    obračune. Iz nje se odštejejo prispevki za socialno varnost in akontacija
                    dohodnine — kar ostane, je <strong className="text-slate-800">neto plača</strong>,
                    torej znesek, ki ga zaposleni dejansko prejme na račun. Delodajalca zaposlitev
                    ne stane le bruto plače: na vrhu plača še svoj del prispevkov. Zato ločimo tri
                    zneske — neto (kar dobi delavec), bruto (osnova za obračun) in{" "}
                    <strong className="text-slate-800">bruto bruto</strong> (skupni strošek
                    delodajalca). Kalkulator ti vse tri pokaže hkrati, ko vpišeš bruto plačo.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">Kako se izračuna neto plača?</h2>
                  <p className="mt-2">Izračun poteka v štirih korakih:</p>
                  <ol className="mt-2 ml-5 list-decimal space-y-1.5 marker:font-semibold marker:text-brand-600">
                    <li>Od bruto plače se odštejejo prispevki zaposlenega (skupaj 22,10 %).</li>
                    <li>
                      Od preostanka se odšteje mesečni del splošne olajšave — tako dobimo osnovo za
                      dohodnino.
                    </li>
                    <li>Na to osnovo se po progresivni dohodninski lestvici obračuna akontacija dohodnine.</li>
                    <li>Bruto − prispevki − dohodnina = neto plača.</li>
                  </ol>
                  <p className="mt-2">
                    Kalkulator zgoraj naredi točno te korake: vpišeš bruto in takoj vidiš razčlembo
                    prispevkov, dohodnine, neto izplačila in skupnega stroška delodajalca.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Prispevki iz plače in prispevki delodajalca
                  </h2>
                  <p className="mt-2">
                    Prispevke za socialno varnost plačata oba — zaposleni in delodajalec — le da se
                    zaposlenčevi odtegnejo od bruto plače, delodajalčevi pa so dodaten strošek nad
                    njo:
                  </p>
                  <ul className="mt-2 ml-5 list-disc space-y-1.5">
                    <li>
                      <strong className="text-slate-800">Zaposleni (22,10 % bruto):</strong>{" "}
                      pokojninsko in invalidsko 15,50 %, zdravstveno 6,36 %, zavarovanje za
                      brezposelnost 0,14 % in starševsko varstvo 0,10 %.
                    </li>
                    <li>
                      <strong className="text-slate-800">Delodajalec (16,10 % dodatno):</strong>{" "}
                      pokojninsko 8,85 %, zdravstveno 6,56 %, poškodbe pri delu 0,53 %, zaposlovanje
                      0,06 % in starševsko varstvo 0,10 %.
                    </li>
                  </ul>
                  <p className="mt-2">
                    Iz teh prispevkov se financirajo pokojnina, zdravstveno zavarovanje in
                    nadomestila — zato so obvezni pri vsaki redni zaposlitvi.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">Dohodnina in olajšave</h2>
                  <p className="mt-2">
                    Akontacija dohodnine se obračuna po <strong className="text-slate-800">progresivni
                    lestvici</strong>: višja kot je osnova, višja je stopnja na presežni del. Stopnje
                    segajo od 16 % v najnižjem razredu do 50 % v najvišjem (16 %, 26 %, 33 %, 39 % in
                    50 %), pragovi med razredi pa se vsako leto uskladijo. Preden se dohodnina
                    obračuna, se od osnove odšteje <strong className="text-slate-800">splošna
                    olajšava</strong>, do katere je upravičen vsak zaposleni — ta zniža davčno osnovo
                    in s tem davek. Kdor vzdržuje otroke, je upravičen do dodatnih olajšav, ki davek
                    še dodatno znižajo; te v osnovnem izračunu niso vštete, zato je pri več otrocih za
                    natančen znesek smiselno preveriti pri računovodji ali FURS.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Neto izplačilo in bruto bruto (skupni strošek delodajalca)
                  </h2>
                  <p className="mt-2">
                    Za delavca je pomemben neto znesek — kar prejme na račun. Za delodajalca pa je
                    pomemben <strong className="text-slate-800">bruto bruto</strong>: bruto plača
                    plus 16,10 % prispevkov delodajalca. To je resnični strošek zaposlitve. Razlika
                    med neto (kar dobi delavec) in bruto bruto (kar plača delodajalec) pokaže, kolikšen
                    del skupnega stroška dela gre v davke in prispevke — koristno pri načrtovanju
                    stroškov in pogajanjih o plači.
                  </p>
                </div>

                <p className="rounded-2xl bg-white/60 px-4 py-3 text-xs text-slate-500 ring-1 ring-white/70">
                  Informativni izračun. Prispevne stopnje, splošna olajšava in dohodninska lestvica se
                  lahko spremenijo; za uraden izračun za leto {PLACA_CONFIG.leto} preveri pri FURS ali
                  računovodji.
                </p>
              </div>
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

      <Footer />
    </main>
  );
}
