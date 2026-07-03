import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, FileText, FileDown } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Footer } from "@/components/Footer";
import { Wordmark, buttonClasses } from "@/components/ui";
import { YandexMetrika } from "@/components/YandexMetrika";
import { SITE, orgJsonLd, websiteJsonLd } from "@/lib/seo";
import { dateSl } from "@/lib/blog";

const SLUG = "evidenca-delovnega-casa-obrazec";
const PUBLISHED = "2026-07-03";
const URL = `${SITE.url}/blog/${SLUG}`;
const DESC =
  "Brezplačen obrazec za evidenco delovnega časa (Word in PDF), brez prijave. Preverite, katera polja zahteva ZEPDSV, preden ga uporabite.";

export const metadata: Metadata = {
  title: { absolute: "Evidenca delovnega časa: obrazec za prenos" },
  description: DESC,
  keywords: [
    "evidenca delovnega časa obrazec",
    "evidenca delovnega časa tabela",
    "evidenca delovnega časa vzorec",
    "obrazec evidenca delovnega časa word",
    "obrazec evidenca delovnega časa pdf",
  ],
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: {
    title: "Evidenca delovnega časa: obrazec in vzorec za brezplačen prenos",
    description: DESC,
    type: "article",
    locale: "sl_SI",
    url: `/blog/${SLUG}`,
    siteName: "Delovit",
    publishedTime: PUBLISHED,
  },
  twitter: {
    card: "summary_large_image",
    title: "Evidenca delovnega časa: obrazec in vzorec za brezplačen prenos",
    description: DESC,
  },
};

const FAQ = [
  {
    q: "Ali moram uporabljati točno ta obrazec, ali lahko naredim svojega?",
    a: "Obliko obrazca zakon ne predpisuje, predpisuje le, katere podatke mora vsebovati. Naš obrazec lahko torej prilagodite, dokler ohranite vsa obvezna polja iz tabele zgoraj.",
  },
  {
    q: "Kako dolgo moram hraniti izpolnjene obrazce?",
    a: "Evidenca šteje za listino trajne vrednosti, kar pomeni dolgoročno hrambo, ne le za tekoče leto. Ob prenehanju dejavnosti dokumentacijo prevzame pravni naslednik oziroma pristojni arhiv.",
  },
  {
    q: "Ali evidenco potrebujem tudi, če imam samo enega zaposlenega ali sem s.p. z delavci?",
    a: "Da. Zakon ne postavlja spodnje meje po številu zaposlenih, izjema velja le za poslovodne osebe, ki jim evidence ni treba voditi.",
  },
  {
    q: "Kam vpišem uro prihoda, če delavec dela na terenu ali od doma?",
    a: "Čas prihoda in odhoda vpišete enako kot pri delu na sedežu, evidenco pa lahko hranite tudi na kraju, kjer delavec dejansko opravlja delo, ne nujno na sedežu podjetja.",
  },
  {
    q: "Ali moram evidenco voditi tudi za dijake in študente, ki delajo prek napotnice?",
    a: "Kratek odgovor je, da gre za posebno ureditev, ki je vredna lastnega prispevka. Če vas zanima, kako se ZEPDSV nanaša na študentsko delo, si oglejte seznam vseh objav.",
  },
];

const POLJA: [string, string][] = [
  ["Ime in priimek delavca", "Identifikacija za posamezen vnos"],
  ["Datum", "Vsak delovni dan posebej"],
  ["Čas prihoda in odhoda", "Ura začetka in konca dela"],
  ["Skupno opravljene ure", "Redne ure, z oznako, ali gre za polni ali krajši delovni čas"],
  ["Nadurno delo", "Ure opravljene nad rednim delovnim časom"],
  ["Posebni pogoji dela", "Nočno, nedeljsko, izmensko in praznično delo ločeno"],
  [
    "Neenakomerno ali začasno prerazporejen delovni čas",
    "Kadar razpored ur odstopa od običajnega tedenskega vzorca",
  ],
  [
    "Neopravljene ure z nadomestilom",
    "Ločeno za nadomestilo v breme delodajalca, v breme drugih (na primer ZZZS) in brez nadomestila, z oznako vrste",
  ],
  ["Tekoči seštevek ur", "Seštevek za teden, mesec ali leto z navedbo referenčnega obdobja"],
];

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      orgJsonLd,
      websiteJsonLd,
      {
        "@type": "Article",
        headline: "Evidenca delovnega časa: obrazec in vzorec za brezplačen prenos",
        description: DESC,
        datePublished: PUBLISHED,
        dateModified: PUBLISHED,
        inLanguage: "sl",
        mainEntityOfPage: URL,
        author: { "@type": "Organization", name: "Delovit" },
        publisher: { "@id": `${SITE.url}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Domov", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
          { "@type": "ListItem", position: 3, name: "Obrazec za evidenco", item: URL },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  const TrialButton = () => (
    <div className="!mt-8 text-center">
      <Link
        href="/register"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-brand-500"
      >
        Preizkusite Delovit brezplačno - 14 dni, brez kartice
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );

  return (
    <main className="relative min-h-screen text-slate-800">
      <Aurora />
      <YandexMetrika />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* NAV */}
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

      <article className="mx-auto max-w-2xl px-5 pt-10 pb-16">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Vsi članki
        </Link>

        <div className="mt-5 flex items-center gap-3 text-xs font-medium text-slate-400">
          <time dateTime={PUBLISHED}>{dateSl(PUBLISHED)}</time>
          <span>· 4 min branja</span>
        </div>

        <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.6rem]">
          Evidenca delovnega časa: obrazec in vzorec{" "}
          <span className="text-holo">za brezplačen prenos</span>
        </h1>

        <div className="prose-delovit mt-8 space-y-5 text-[17px] leading-relaxed text-slate-700">
          <p>
            Potrebujete obrazec za evidenco delovnega časa še danes in ne veste, katera polja mora
            vsebovati, da bo veljaven pred inšpekcijo. To se dogaja večini delodajalcev prvič takrat,
            ko na vrata potrka nadzornik ali ko novo zaposlite prvega delavca in ugotovite, da
            beležka v zvezku ne bo dovolj.
          </p>
          <p>
            Spodaj najdete pripravljen obrazec za neposreden prenos, brez prijave ali e-poštnega
            naslova, in tabelo obveznih sestavin po zakonu, da preverite, ali obrazec, ki ga že
            uporabljate, sploh ustreza zahtevam.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Katera polja mora vsebovati evidenca delovnega časa
          </h2>
          <p>
            Evidenca o izrabi delovnega časa je urejena v 18. členu Zakona o evidencah na področju
            dela in socialne varnosti (ZEPDSV). Spodnja tabela povzema obvezne sestavine iz
            veljavnega besedila zakona v razumljivi obliki.
          </p>

          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <div className="min-w-[440px] overflow-hidden rounded-2xl ring-1 ring-slate-200/70">
              <table className="w-full border-collapse text-left text-[15px]">
                <thead className="bg-white/60 text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Podatek</th>
                    <th className="px-4 py-2.5 font-semibold">Kaj vpisati</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {POLJA.map(([podatek, opis]) => (
                    <tr key={podatek} className="bg-white/40">
                      <td className="px-4 py-2.5 font-medium text-slate-900">{podatek}</td>
                      <td className="px-4 py-2.5 text-slate-600">{opis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p>
            Zakon ločeno ureja tudi evidenco o zaposlenih delavcih (EMŠO, davčna številka, pogodba o
            zaposlitvi), kar ni del obrazca za dnevno evidenco izrabe delovnega časa. Ta dva seznama
            podatkov se v praksi pogosto pomešata, kar potem obrazec po nepotrebnem podaljša.
          </p>
          <p>
            Pred objavo oziroma uporabo obrazca vam priporočamo, da polja preverite še sami v
            čistopisu 18. člena ZEPDSV na{" "}
            <a
              href="https://www.pisrs.si/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              pisrs.si
            </a>
            , saj se zakonodaja s časom dopolnjuje in vaš primer lahko vključuje posebnosti, ki jih
            splošen obrazec ne zajame.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Brezplačen prenos: obrazec v Wordu in PDF
          </h2>
          <p>Obrazec je na voljo v dveh formatih, brez prijave in brez e-poštnega naslova:</p>

          {/* PRENOS */}
          <div className="!mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href="/prenosi/evidenca-delovnega-casa-obrazec.docx"
              download
              className="flex items-center gap-3 rounded-2xl bg-white/70 px-5 py-4 ring-1 ring-slate-200/80 transition hover:ring-brand-300 hover:bg-white"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <FileText className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block font-semibold text-slate-900">Prenesi obrazec (Word, .docx)</span>
                <span className="block text-sm text-slate-500">za urejanje in prilagoditev vaši dejavnosti</span>
              </span>
            </a>
            <a
              href="/prenosi/evidenca-delovnega-casa-obrazec.pdf"
              download
              className="flex items-center gap-3 rounded-2xl bg-white/70 px-5 py-4 ring-1 ring-slate-200/80 transition hover:ring-brand-300 hover:bg-white"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <FileDown className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block font-semibold text-slate-900">Prenesi obrazec (PDF)</span>
                <span className="block text-sm text-slate-500">za tiskanje in ročno izpolnjevanje</span>
              </span>
            </a>
          </div>

          <p>
            <a
              href="https://www.gov.si/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              Gov.si
            </a>{" "}
            sicer ponuja svojo excel predlogo, mi pa smo dodali izpolnljiv Word obrazec s kratkimi
            navodili ob vsakem polju, tako da veste, kaj točno vpisati, ne le kam.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Kako obrazec pravilno izpolnjevati
          </h2>
          <p>Sam obrazec je le polovica zgodbe. Da evidenca drži pred inšpekcijo, mora biti:</p>
          <ul className="ml-5 list-disc space-y-2 marker:text-brand-500">
            <li>
              <strong>Sprotna:</strong> vnosi za nazaj so ena najpogostejših napak in jih inšpekcija
              hitro opazi.
            </li>
            <li>
              <strong>Popolna:</strong> vsako polje iz tabele zgoraj mora biti izpolnjeno za vsak
              delovni dan.
            </li>
            <li>
              <strong>Shranjena na pravem mestu:</strong> na sedežu podjetja ali na kraju, kjer
              delavec dejansko opravlja delo, in dovolj dolgo, saj gre za listino trajne vrednosti.
            </li>
          </ul>
          <p>
            Kaj vas ob nepopolni ali manjkajoči evidenci dejansko čaka, smo natančno razložili v
            ločenem prispevku o{" "}
            <Link
              href="/blog/globe-zepdsv-evidenca-delovnega-casa"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              kaznih ZEPDSV
            </Link>
            .
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Kje se papirnat obrazec zlomi
          </h2>
          <p>
            Obrazec rešuje prvi problem, torej katera polja sploh potrebujete. Ne reši pa drugega, ki
            pride takoj zatem: ročno izpolnjevanje se z rastjo ekipe podre samo od sebe. Vnosi za
            nazaj se naberejo, odsotnosti se pozabi ločiti po vrsti nadomestila, tekoči seštevek ur
            pa nihče ne računa sproti, dokler ni prepozno.
          </p>
          <TrialButton />
          <p>
            Če že vodite evidenco v preglednici, je{" "}
            <Link
              href="/blog/evidenca-delovnega-casa-excel"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              vodenje v Excel preglednici
            </Link>{" "}
            dober vmesni korak, dokler ekipa ostaja majhna. Ko pa obrazcev, popravkov in izjem
            postane preveč za en sam list, potrebujete{" "}
            <Link href="/" className="font-semibold text-brand-700 hover:text-brand-800">
              digitalno evidenco delovnega časa, ki se izpolnjuje sama
            </Link>
            , namesto da jo vsak mesec znova sestavljate ročno.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Pogosta vprašanja
          </h2>
          <div className="space-y-5">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="text-lg font-bold text-slate-900">{f.q}</h3>
                <p className="mt-1.5">
                  {f.q.startsWith("Ali moram evidenco voditi tudi za dijake") ? (
                    <>
                      Kratek odgovor je, da gre za posebno ureditev, ki je vredna lastnega prispevka.
                      Če vas zanima, kako se ZEPDSV nanaša na študentsko delo, si oglejte{" "}
                      <Link
                        href="/blog"
                        className="font-semibold text-brand-700 hover:text-brand-800"
                      >
                        seznam vseh objav
                      </Link>
                      .
                    </>
                  ) : (
                    f.a
                  )}
                </p>
              </div>
            ))}
          </div>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Namesto ročnega popravljanja
          </h2>
          <p>
            Obrazec spodaj rešite v petih minutah. Vprašanje, ki ostane, je, kako dolgo boste še
            ročno preverjali, ali je nekdo pozabil vpisati nadure ali odsotnost. Delovit ta del
            prevzame namesto vas, evidenca se vodi sproti, seštevki se računajo sami, izpis za delavca
            pa je pripravljen brez dodatnega dela na vaši strani.
          </p>
        </div>

        {/* PRIMARNI CTA */}
        <div className="mt-10 rounded-3xl bg-brand-600 px-7 py-9 text-center text-white">
          <p className="text-xl font-bold">Začnite brezplačen 14-dnevni preizkus Delovit</p>
          <p className="mx-auto mt-2 max-w-md text-brand-50/90">
            Brez kartice in brez zaveze. Ustvarite račun, dodajte ekipo in v 5 minutah žigosajte prvi
            prihod.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Začni brezplačno - 14 dni, brez kartice
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Informativno, ne pravni nasvet. Obvezne sestavine po 18. členu ZEPDSV; pred uporabo
          preverite čistopis na pisrs.si.
        </p>
      </article>

      <Footer />
    </main>
  );
}
