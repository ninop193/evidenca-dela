import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Footer } from "@/components/Footer";
import { Wordmark, buttonClasses } from "@/components/ui";
import { YandexMetrika } from "@/components/YandexMetrika";
import { SITE, orgJsonLd, websiteJsonLd } from "@/lib/seo";
import { dateSl } from "@/lib/blog";

const SLUG = "evidenca-o-izrabi-delovnega-casa";
const PUBLISHED = "2026-07-09";
const URL = `${SITE.url}/blog/${SLUG}`;
const DESC =
  "Evidenca o izrabi delovnega časa ni isto kot evidenca zaposlenih delavcev. Kaj mora vsebovati po 18. členu ZEPDSV in kdo jo mora voditi.";

export const metadata: Metadata = {
  title: { absolute: "Kaj je evidenca o izrabi delovnega časa (18. člen ZEPDSV)" },
  description: DESC,
  keywords: [
    "evidenca o izrabi delovnega časa",
    "izraba delovnega časa",
    "18. člen ZEPDSV",
    "evidenca o zaposlenih delavcih",
    "dnevna evidenca delovnega časa",
  ],
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: {
    title: "Kaj je evidenca o izrabi delovnega časa (18. člen ZEPDSV)",
    description: DESC,
    type: "article",
    locale: "sl_SI",
    url: `/blog/${SLUG}`,
    siteName: "Delovit",
    publishedTime: PUBLISHED,
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaj je evidenca o izrabi delovnega časa (18. člen ZEPDSV)",
    description: DESC,
  },
};

const FAQ = [
  {
    q: "Ali je evidenca o izrabi delovnega časa isto kot evidenca o zaposlenih delavcih?",
    a: "Ne. Evidenca o zaposlenih delavcih (13. člen ZEPDSV) je enkraten administrativni vpis ob zaposlitvi (EMŠO, davčna, pogodba). Evidenca o izrabi delovnega časa (18. člen) je dnevni zapis prihoda, odhoda, opravljenih ur in nadomestil.",
  },
  {
    q: "Kdo mora voditi evidenco o izrabi delovnega časa za dijake in študente na napotnici?",
    a: "Delodajalec, pri katerem dijak ali študent dejansko opravlja delo, ne študentski servis. Obveznost izhaja iz definicije delavca v 2. členu ZEPDSV in pojasnila MDDSZ.",
  },
  {
    q: "Ali mora biti evidenca o izrabi delovnega časa digitalna?",
    a: "Zakon ne predpisuje formata, ročna preglednica je dovoljena. Zahteva pa vse postavke iz 18. člena in dosledno ločevanje posebnih pogojev dela, kar je v ročni obliki lahko zamudno.",
  },
  {
    q: "Koliko časa je treba hraniti evidenco o izrabi delovnega časa?",
    a: "Gre za listino trajne vrednosti, kar pomeni dolgoročno hrambo, ne le za tekoče leto.",
  },
  {
    q: "Kaj se zgodi, če evidenca o izrabi delovnega časa ni popolna?",
    a: "Inšpekcija dela lahko izreče globo. Razpone za s.p. in pravne osebe najdete v pregledu kazni po ZEPDSV.",
  },
];

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      orgJsonLd,
      websiteJsonLd,
      {
        "@type": "Article",
        headline:
          "Kaj je evidenca o izrabi delovnega časa (in zakaj se ime ne ujema z evidenco zaposlenih)",
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
          { "@type": "ListItem", position: 3, name: "Evidenca o izrabi delovnega časa", item: URL },
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
        Preizkusite Delovit brezplačno, 14 dni brez kartice
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
          <span>· 5 min branja</span>
        </div>

        <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.6rem]">
          Kaj je evidenca o izrabi delovnega časa{" "}
          <span className="text-holo">(in zakaj se ime ne ujema z evidenco zaposlenih)</span>
        </h1>

        <div className="prose-delovit mt-8 space-y-5 text-[17px] leading-relaxed text-slate-700">
          <p>
            Ime zveni birokratsko, a pomen je precej ožji, kot si večina delodajalcev predstavlja.
            Evidenca o izrabi delovnega časa ni papir o tem, koga zaposlujete. Je dnevni zapis o
            tem, kaj je vaš delavec dejansko počel z urami, ki jih je oddelal. Če ste mikro
            delodajalec, s.p. ali gostinec in ta izraz prvič berete v uradnem dopisu ali na
            inšpekcijskem obrazcu, je smiselno razumeti natanko, od kod prihaja in kaj mora
            vsebovati, preden ga poskusite izpolniti na pamet.
          </p>
          <p>
            Izraz izhaja neposredno iz Zakona o evidencah na področju dela in socialne varnosti
            (ZEPDSV), ki po zadnji noveli določa dve ločeni vrsti evidenc: eno o zaposlenih
            delavcih in eno o izrabi delovnega časa. Zamenjujeta se pogosto, ker zvenita podobno,
            obveznosti pa so precej različne.
          </p>
          <p>
            Če iščeš širši okvir, preden se poglobiš v to terminološko razliko, si oglej{" "}
            <Link
              href="/blog/evidenca-delovnega-casa-vodnik"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              evidenca delovnega časa: kaj zahteva zakon in kako jo voditi
            </Link>
            .
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Zakaj se evidenca imenuje ravno tako in od kod izhaja
          </h2>
          <p>
            18. člen ZEPDSV določa, da mora delodajalec voditi dnevno evidenco o izrabi delovnega
            časa za vsakega delavca posebej. Izraz „izraba" tu ni naključen: zakon ne zahteva samo
            podatka, da je delavec prišel na delo, ampak natančen zapis, kako je bil njegov delovni
            čas dejansko porabljen, koliko ur rednega dela, koliko nadur, koliko ur v posebnih
            pogojih dela.
          </p>
          <p>
            Gre torej za operativno, dnevno evidenco, ne za administrativni karton zaposlenega. To
            razliko si velja zapomniti, ker prav ta zmeda povzroči največ napak pri mikro
            delodajalcih, ki šele začenjajo urejati evidence.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Kaj mora evidenca o izrabi delovnega časa vsebovati
          </h2>
          <p>
            18. člen ZEPDSV našteva obvezne postavke, ki jih lahko za lažje razumevanje združimo v
            štiri sklope:
          </p>
          <p>
            <strong>Identifikacija in čas.</strong> Ime in priimek delavca, datum ter čas prihoda
            in odhoda z dela.
          </p>
          <p>
            <strong>Opravljene ure.</strong> Skupno število opravljenih ur pri polnem oziroma
            krajšem delovnem času, nadure ter neenakomerno prerazporejen delovni čas.
          </p>
          <p>
            <strong>Posebni pogoji dela, evidentirani ločeno.</strong> Nočno delo, nedeljsko delo,
            izmensko delo in delo na dan praznika se ne smejo mešati z rednimi urami, zakon zahteva
            ločen zapis za vsako kategorijo.
          </p>
          <p>
            <strong>Nadomestila in seštevki.</strong> Neopravljene ure z nadomestilom plače, ločeno
            glede na to, ali breme nosi delodajalec, drugi (na primer ZZZS) ali gre za neopravljene
            ure brez nadomestila, ter tekoči seštevek ur za tedensko, mesečno in letno referenčno
            obdobje.
          </p>
          <p>
            To je skrajšan pregled polj. Za celotno tabelo z vsemi postavkami in brezplačen
            predlogo za prenos (Word in PDF) si oglejte{" "}
            <Link
              href="/blog/evidenca-delovnega-casa-obrazec"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              obrazec za evidenco delovnega časa
            </Link>
            .
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Razlika med evidenco o izrabi delovnega časa in evidenco o zaposlenih delavcih
          </h2>
          <p>
            Tu se zgodi največ napak. Evidenca o zaposlenih delavcih (13. člen ZEPDSV) je enkratni
            administrativni vpis ob nastopu zaposlitve: EMŠO, davčna številka, vrsta pogodbe o
            zaposlitvi, delovno mesto. Ti podatki niso del dnevne evidence o izrabi delovnega časa
            in jih ni treba beležiti vsak dan.
          </p>
          <p>
            Evidenca o izrabi delovnega časa pa je nasprotno: dnevna, ponavljajoča se, vezana
            izključno na dejansko opravljeno delo. Delodajalec, ki v dnevno evidenco vpisuje EMŠO
            ali številko pogodbe namesto ur prihoda in odhoda, ima napačno tabelo, ne glede na to,
            kako natančno jo vodi.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Kdo mora voditi evidenco o izrabi delovnega časa
          </h2>
          <p>
            Zavezanec je delodajalec sam, torej podjetje ali s.p., pri katerem delavec dejansko
            opravlja delo. Ne študentski servis, ne zunanje računovodstvo. To izhaja iz 18. člena
            ZEPDSV, ki nalogo vpisovanja veže na delodajalca, in iz definicije delodajalca v 2.
            členu.
          </p>
          <p>
            To velja tudi za dijake in študente, ki delajo prek napotnice. Zakon napotnice sicer ne
            omenja poimensko, obveznost pa izhaja iz širše definicije delavca v 2. členu ZEPDSV
            (oseba, ki na kateri koli pravni podlagi opravlja delo in je vključena v delovni proces
            delodajalca) ter iz pojasnila Ministrstva za delo, ki to obveznost za dijake in
            študente izrecno potrjuje. Za delodajalca to v praksi pomeni, da napotnica ne
            razbremeni vodenja dnevne evidence, obveznost ostane enaka kot pri rednem delavcu.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Hramba evidence
          </h2>
          <p>
            Evidenca o izrabi delovnega časa se hrani kot listina trajne vrednosti, ne glede na to,
            ali je vodena ročno, v preglednici ali v digitalnem orodju. Inšpekcija dela lahko
            zahteva vpogled tudi za pretekla obdobja, zato improvizirana rešitev, ki je ni mogoče
            hitro najti ali izvoziti, dolgoročno ni dobra izbira.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Kje se ročno vodenje zlomi
          </h2>
          <p>
            Polja iz 18. člena je mogoče prepisati v Excel v desetih minutah, to smo pokazali v{" "}
            <Link
              href="/blog/evidenca-delovnega-casa-excel"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              postu o vodenju evidence v Excelu
            </Link>
            . Problem ni prvi zapis, ampak vzdrževanje skozi mesece.
          </p>
          <p>
            Najtežji del pri tem konkretnem izrazu je ločeno beleženje nadomestil. Zakon zahteva,
            da neopravljene ure z nadomestilom niso samo zabeležene, ampak razdeljene po tem, kdo
            nosi breme: delodajalec, ZZZS ali brez nadomestila. V ročni preglednici to pomeni
            dodatne stolpce, ki jih je treba ročno posodabljati za vsakega delavca in vsak mesec
            posebej, ob tem pa še sproti seštevati ure za tedensko, mesečno in letno referenčno
            obdobje. Ena pozabljena vrstica ali napačno razporejena ura pomeni neusklajen seštevek,
            ki ga na koncu meseca nihče več ne opazi, dokler ga ne opazi inšpektor. Za razpon glob,
            ki grozijo pri neusklajeni ali manjkajoči evidenci, si oglejte{" "}
            <Link
              href="/blog/globe-zepdsv-evidenca-delovnega-casa"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              pregled kazni po ZEPDSV
            </Link>
            .
          </p>
          <p>
            Digitalna evidenca o izrabi delovnega časa, ki polja izpolnjuje sama, ločeno po
            nočnem, nedeljskem, izmenskem in prazničnem delu, s samodejnim seštevkom po tednu in
            mesecu, to ločevanje naredi ob vsakem vnosu, ne enkrat na mesec pri zapiranju
            preglednice. To je razlika med tabelo, ki jo popravljate, in tabelo, ki je vedno
            usklajena. Če želite videti, kako je to videti v praksi, si oglejte{" "}
            <Link
              href="/evidenca-delovnega-casa"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              evidenco o izrabi delovnega časa
            </Link>{" "}
            v Delovitu.
          </p>
          <TrialButton />
          <p className="text-center text-sm text-slate-500">
            V manj kot desetih minutah nastavite evidenco za vso ekipo.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Pogosta vprašanja
          </h2>
          <div className="space-y-5">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="text-lg font-bold text-slate-900">{f.q}</h3>
                <p className="mt-1.5">
                  {f.q.startsWith("Kaj se zgodi") ? (
                    <>
                      Inšpekcija dela lahko izreče globo. Razpone za s.p. in pravne osebe najdete v{" "}
                      <Link
                        href="/blog/globe-zepdsv-evidenca-delovnega-casa"
                        className="font-semibold text-brand-700 hover:text-brand-800"
                      >
                        pregledu kazni po ZEPDSV
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

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">Zaključek</h2>
          <p>
            Evidenca o izrabi delovnega časa je ožji, dnevni del vaših obveznosti po ZEPDSV, ločen
            od podatkov o zaposlitvi in vezan izključno na to, kako je delavec dejansko porabil
            svoje ure. Ko so polja jasna, je vprašanje samo še, kako jih vzdrževati brez ročnega
            popravljanja vsak mesec.
          </p>
          <p>
            Preizkusite Delovit brezplačno, 14 dni brez kartice in preverite, ali digitalna
            evidenca res prihrani toliko časa, kot obljublja.
          </p>
        </div>

        {/* PRIMARNI CTA */}
        <div className="mt-10 rounded-3xl bg-brand-600 px-7 py-9 text-center text-white">
          <p className="text-xl font-bold">Evidenca, ki se izpolnjuje sama</p>
          <p className="mx-auto mt-2 max-w-md text-brand-50/90">
            Ustvarite račun, dodajte ekipo in v 5 minutah žigosajte prvi prihod.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Začni brezplačno, 14 dni brez kartice
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Informativno, ne pravni nasvet. Viri: 2., 13. in 18. člen ZEPDSV ter pojasnila MDDSZ ob
          noveli ZEPDSV-B.
        </p>
      </article>

      <Footer />
    </main>
  );
}
