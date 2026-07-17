import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Footer } from "@/components/Footer";
import { Wordmark, buttonClasses } from "@/components/ui";
import { YandexMetrika } from "@/components/YandexMetrika";
import { SITE, orgJsonLd, websiteJsonLd } from "@/lib/seo";
import { dateSl } from "@/lib/blog";

const SLUG = "evidenca-delovnega-casa-vodnik";
const PUBLISHED = "2026-07-13";
const URL = `${SITE.url}/blog/${SLUG}`;
const DESC =
  "Kaj je evidenca delovnega časa po ZEPDSV, kdo jo mora voditi, kaj mora vsebovati po 18. členu in kakšne so sankcije, če ni v redu. Vodnik na enem mestu.";

export const metadata: Metadata = {
  title: { absolute: "Evidenca delovnega časa: kaj zahteva zakon in kako jo voditi" },
  description: DESC,
  keywords: [
    "evidenca delovnega časa",
    "evidenca delovnega časa ZEPDSV",
    "evidenca delovnega časa zakon",
    "vodenje evidence delovnega časa",
    "18. člen ZEPDSV",
  ],
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: {
    title: "Evidenca delovnega časa: kaj zahteva zakon in kako jo voditi",
    description: DESC,
    type: "article",
    locale: "sl_SI",
    url: `/blog/${SLUG}`,
    siteName: "Delovit",
    publishedTime: PUBLISHED,
  },
  twitter: {
    card: "summary_large_image",
    title: "Evidenca delovnega časa: kaj zahteva zakon in kako jo voditi",
    description: DESC,
  },
};

const FAQ = [
  {
    q: "Kaj je evidenca delovnega časa?",
    a: "Zakonska obveznost delodajalca, da za vsakega delavca dnevno beleži prihod, odhod, opravljene ure in posebne pogoje dela, na podlagi 18. člena ZEPDSV. Vodi se dnevno, ne enkrat ob zaposlitvi.",
  },
  {
    q: "Kdo mora voditi evidenco delovnega časa?",
    a: "Delodajalec, pri katerem delavec dejansko opravlja delo, torej podjetje ali s.p., ne študentski servis. Enako velja za dijake in študente na napotnici, ne glede na to, kako kratko je delovno razmerje.",
  },
  {
    q: "Ali je evidenca delovnega časa isto kot evidenca o izrabi delovnega časa?",
    a: "Da, gre za isto dnevno evidenco po 18. členu, izraz izraba se nanaša na to, kako je bil delovni čas dejansko porabljen. Ločena je od evidence o zaposlenih delavcih (13. člen), ki je enkraten administrativni vpis.",
  },
  {
    q: "Ali mora biti evidenca delovnega časa digitalna?",
    a: "Ne, zakon ne predpisuje formata. Ročna preglednica ali Excel zadostujeta, dokler vsebujeta vsa obvezna polja in dosledno ločevanje posebnih pogojev dela, ki jih zakon zahteva.",
  },
  {
    q: "Kaj se zgodi, če evidenca delovnega časa ni popolna?",
    a: "Inšpekcija dela lahko izreče globo, razpon je odvisen od statusa delodajalca.",
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
        headline: "Evidenca delovnega časa: kaj zahteva zakon in kako jo voditi",
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
          { "@type": "ListItem", position: 3, name: "Evidenca delovnega časa: vodnik", item: URL },
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
          <span>· 6 min branja</span>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-700 ring-1 ring-brand-100">
            Vodnik
          </span>
        </div>

        <h1 className="mt-3 text-[2.1rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.6rem]">
          Evidenca delovnega časa:{" "}
          <span className="text-holo">kaj zahteva zakon in kako jo voditi</span>
        </h1>

        <div className="prose-delovit mt-8 space-y-5 text-[17px] leading-relaxed text-slate-700">
          <p>
            Evidenca delovnega časa je ena tistih obveznosti, ki jo delodajalci odkrijejo šele
            takrat, ko jo že potrebujejo, ob inšpekcijskem obisku, ob sporu z delavcem glede nadur
            ali ob prvi zaposlitvi študenta na napotnici. Če iščete odgovor na vprašanje, kaj ta
            evidenca sploh je, kdo jo mora voditi in kaj mora vsebovati, je ta pregled namenjen
            prav vam. Ne bomo se poglabljali v vsak detajl do konca, za to imamo ločene, bolj
            poglobljene članke, na katere sproti linkamo, tukaj dobite celoten okvir na enem mestu,
            od pravne podlage do praktične izvedbe.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Kaj je evidenca delovnega časa in od kod izhaja obveznost
          </h2>
          <p>
            Evidenca delovnega časa je zakonska obveznost delodajalca, da za vsakega delavca
            dnevno beleži, kdaj je prišel na delo, kdaj je odšel, koliko ur je dejansko opravil in
            v kakšnih pogojih. Podlaga je Zakon o evidencah na področju dela in socialne varnosti
            (ZEPDSV), natančneje njegov 18. člen, ki po noveli ZEPDSV-B določa natančen seznam
            obveznih podatkov.
          </p>
          <p>
            Pomembno je razumeti, da gre za dnevno, operativno evidenco, ne za enkraten
            administrativni vpis. Zakon loči to evidenco od evidence o zaposlenih delavcih (13.
            člen ZEPDSV), ki se izpolni ob nastopu zaposlitve in vsebuje povsem druge podatke:
            EMŠO, davčno številko, vrsto pogodbe o zaposlitvi, delovno mesto. Ta dva pojma se v
            praksi pogosto mešata, delodajalci vpisujejo administrativne podatke tja, kamor sodijo
            dnevni podatki o urah, zato smo razliki namenili samostojen članek:{" "}
            <Link
              href="/blog/evidenca-o-izrabi-delovnega-casa"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              evidenca o izrabi delovnega časa
            </Link>{" "}
            razloži natanko, kje poteka meja med njima in zakaj se izraz „izraba" sploh uporablja.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Kdo mora voditi evidenco delovnega časa
          </h2>
          <p>
            Zavezanec je delodajalec, torej podjetje ali s.p., pri katerem delavec dejansko
            opravlja delo, ne študentski servis in ne zunanje računovodstvo. To izhaja iz
            definicije delavca v 2. členu ZEPDSV, ki zajema vsakogar, ki na kateri koli pravni
            podlagi opravlja delo in je vključen v delovni proces delodajalca.
          </p>
          <p>
            To velja tudi za dijake in študente, ki delajo prek napotnice. Zakon napotnice sicer ne
            omenja poimensko, obveznost pa jasno izhaja iz širše definicije delavca in iz pojasnila
            Ministrstva za delo, ki jo za dijake in študente izrecno potrjuje. Za gostinca ali
            mikro delodajalca to pomeni, da napotnica ne razbremeni vodenja evidence, obveznost
            ostane enaka kot pri redno zaposlenem delavcu, tudi če gre za eno samo popoldansko
            izmeno ali za enkratno poletno delo.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Kaj mora evidenca delovnega časa vsebovati
          </h2>
          <p>
            18. člen ZEPDSV našteva vrsto obveznih postavk, ki jih je za lažje razumevanje smiselno
            razdeliti na sklope. Prvi sklop je identifikacija in čas: ime in priimek delavca, datum
            ter natančen čas prihoda in odhoda z dela. Drugi sklop so opravljene ure: skupno
            število opravljenih ur pri polnem oziroma krajšem delovnem času, nadure ter
            neenakomerno prerazporejen delovni čas. Tretji sklop so posebni pogoji dela, ki jih
            zakon zahteva ločeno, ne skupaj z rednimi urami: nočno delo, nedeljsko delo, izmensko
            delo in delo na dan praznika. Četrti sklop so nadomestila in seštevki: neopravljene ure
            z nadomestilom plače, ločeno glede na to, ali breme nosi delodajalec, drugi (na primer
            ZZZS) ali gre za neopravljene ure brez nadomestila, ter tekoči seštevek ur za tedensko,
            mesečno in letno referenčno obdobje.
          </p>
          <p>
            To je precej daljši seznam, kot ga večina delodajalcev pričakuje ob prvem branju
            zakona, in prav dolžina seznama je razlog, da improvizirane rešitve na dolgi rok
            pogosto odpovejo. Za natančno tabelo vseh obveznih polj in brezplačno predlogo za
            prenos v formatu Word in PDF si oglejte{" "}
            <Link
              href="/blog/evidenca-delovnega-casa-obrazec"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              obrazec za evidenco delovnega časa
            </Link>
            .
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Sankcije, če evidenca ni v redu
          </h2>
          <p>
            Inšpekcija dela (IRSD) lahko kadar koli zahteva vpogled v evidenco, tudi za pretekla
            obdobja, saj gre za listino trajne vrednosti, ne glede na to, ali je vodena ročno, v
            preglednici ali digitalno. Če evidenca manjka, je nepopolna ali neusklajena, sledi
            globa, razpon je odvisen od tega, ali gre za s.p. ali pravno osebo. Natančne zneske smo
            zbrali v{" "}
            <Link
              href="/blog/globe-zepdsv-evidenca-delovnega-casa"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              pregledu kazni po ZEPDSV
            </Link>
            , ker se spreminjajo z novelami in jih ni smiselno ponavljati na vsakem mestu, kjer se
            evidenca omenja. Za hitro oceno svojega tveganja lahko uporabiš tudi{" "}
            <Link
              href="/kalkulator-glob"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              kalkulator glob po ZEPDSV
            </Link>
            .
          </p>
          <p>
            Vredno je poudariti, da inšpekcija ne kaznuje samo odsotnosti evidence. Enako
            problematična je evidenca, ki sicer obstaja, a je neusklajena, na primer kadar seštevki
            ur ne ustrezajo dejanskim vnosom ali kadar so posebni pogoji dela, nočno, izmensko,
            praznično, pomešani z rednimi urami namesto ločeno zabeleženi, kot zahteva zakon.
            Inšpektor v tem primeru ne preveri samo, ali evidenca obstaja, ampak ali dejansko
            izkazuje resnično opravljeno delo, kar pomeni, da lepo oblikovana, a vsebinsko napačna
            preglednica ne šteje kot ustrezna evidenca.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Praznično in izmensko delo v evidenci
          </h2>
          <p>
            Eden od pogostih virov napak je evidentiranje dela na dan praznika ali dela prostega
            dneva. Zakon zahteva, da se to delo beleži ločeno od rednih ur, ne kot dodatna opomba
            ob koncu meseca, ampak kot samostojna kategorija s svojim seštevkom. To postane še
            posebej pomembno v gostinstvu in trgovini, kjer se izmene pogosto prekrivajo s
            prazniki in kjer isti delavec v enem tednu lahko dela redno izmeno, nočno izmeno in
            praznik.{" "}
            <Link
              href="/blog/prazniki-dela-prosti-dnevi-2026"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              Članek o praznikih in dela prostih dnevih
            </Link>{" "}
            podrobneje razloži, kako pravilno evidentirati delo na dan praznika in dela proste
            dneve, brez da bi mešali kategorije, ki jih zakon zahteva ločeno.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Ročno vodenje ali digitalna evidenca
          </h2>
          <p>
            Zakon ne predpisuje formata evidence, ročna preglednica ali Excel sta povsem dovoljena,
            dokler vsebujeta vsa obvezna polja iz 18. člena. Prvi zapis je hiter, v{" "}
            <Link
              href="/blog/evidenca-delovnega-casa-excel"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              postu o vodenju evidence v Excelu
            </Link>{" "}
            smo pokazali, da tabelo z osnovnimi stolpci postavite v desetih minutah.
          </p>
          <p>
            Težava se pokaže pri vzdrževanju skozi mesece, ne pri prvem zapisu. Ločeno beleženje
            nadomestil po nosilcu bremena, ločevanje nočnega, nedeljskega, izmenskega in
            prazničnega dela, ter sprotno usklajevanje tedenskih, mesečnih in letnih seštevkov, vse
            to je treba ročno posodabljati za vsakega delavca posebej, vsak mesec znova. Ena
            pozabljena vrstica ali napačno razporejena ura pomeni neusklajen seštevek, ki ga
            pogosto opazi šele inšpektor, ne delodajalec sam. Digitalna evidenca to ločevanje
            naredi ob vsakem vnosu, ne enkrat na mesec pri zapiranju preglednice, kar pomeni, da je
            razlika med tabelo, ki jo popravljate, in tabelo, ki je vedno usklajena. Če želite
            videti, kako je to videti v praksi, si oglejte{" "}
            <Link
              href="/evidenca-delovnega-casa"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              evidenco delovnega časa
            </Link>{" "}
            v Delovitu, kjer polja iz 18. člena izpolnjuje sistem sam, ob vsakem prijavljenem
            prihodu in odhodu.
          </p>
          <TrialButton />
          <p className="text-center text-sm text-slate-500">
            V manj kot desetih minutah nastavite evidenco za vso ekipo, brez vezave in brez
            podatkov o kartici.
          </p>

          <h2 className="!mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Pogosta vprašanja
          </h2>
          <div className="space-y-5">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="text-lg font-bold text-slate-900">{f.q}</h3>
                <p className="mt-1.5">
                  {f.q.startsWith("Ali je evidenca delovnega časa isto") ? (
                    <>
                      Da, gre za isto dnevno evidenco po 18. členu, izraz „izraba" se nanaša na to,
                      kako je bil delovni čas dejansko porabljen. Ločena je od evidence o
                      zaposlenih delavcih (13. člen), ki je enkraten administrativni vpis. Podrobno
                      razliko razloži{" "}
                      <Link
                        href="/blog/evidenca-o-izrabi-delovnega-casa"
                        className="font-semibold text-brand-700 hover:text-brand-800"
                      >
                        ta članek
                      </Link>
                      .
                    </>
                  ) : f.q.startsWith("Kaj se zgodi") ? (
                    <>
                      Inšpekcija dela lahko izreče globo, razpon je odvisen od statusa delodajalca.
                      Natančne zneske najdete v{" "}
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
            Evidenca delovnega časa združuje vrsto ločenih obveznosti: kdo jo vodi, kaj vsebuje,
            kako se razlikuje od sorodnih pojmov in kaj sledi, če ni v redu. Vsak od teh delov smo
            razdelali podrobneje v samostojnih člankih, ta pregled vam pove, kje kaj poiskati in
            kako se vse skupaj sestavi v celoto, ki jo lahko dejansko vodite mesec za mesecem, brez
            da bi na koncu leta ugotovili, da vam manjka polovica podatkov.
          </p>
          <p>
            Preizkusite Delovit brezplačno, 14 dni brez kartice in preverite, ali digitalna
            evidenca res prihrani toliko časa, kot obljublja.
          </p>
        </div>

        {/* PRIMARNI CTA */}
        <div className="mt-10 rounded-3xl bg-brand-600 px-7 py-9 text-center text-white">
          <p className="text-xl font-bold">Evidenca, ki je vedno usklajena</p>
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
          Informativno, ne pravni nasvet. Viri: 2., 13. in 18. člen ZEPDSV ter novela ZEPDSV-B.
        </p>
      </article>

      <Footer />
    </main>
  );
}
