// Register blog člankov — vir za kazalo (/blog) in sitemap.
export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO, datum objave
  excerpt: string;
  readMins: number;
  badge?: string; // npr. "Vodnik" — vizualno loči pillar od ozkih postov
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "evidenca-delovnega-casa-vodnik",
    title: "Evidenca delovnega časa: kaj zahteva zakon in kako jo voditi",
    description:
      "Kaj je evidenca delovnega časa po ZEPDSV, kdo jo mora voditi, kaj mora vsebovati po 18. členu in kakšne so sankcije, če ni v redu. Vodnik na enem mestu.",
    date: "2026-07-13",
    excerpt:
      "Celoten okvir na enem mestu: pravna podlaga, kdo mora voditi evidenco, obvezna polja, sankcije in razlika med ročnim in digitalnim vodenjem.",
    readMins: 6,
    badge: "Vodnik",
  },
  {
    slug: "evidenca-o-izrabi-delovnega-casa",
    title: "Kaj je evidenca o izrabi delovnega časa (in zakaj se ime ne ujema z evidenco zaposlenih)",
    description:
      "Evidenca o izrabi delovnega časa ni isto kot evidenca zaposlenih delavcev. Kaj mora vsebovati po 18. členu ZEPDSV in kdo jo mora voditi.",
    date: "2026-07-09",
    excerpt:
      "Izraz iz 18. člena ZEPDSV pomeni dnevni zapis o dejansko porabljenih urah, ne administrativni karton zaposlenega. Kaj mora vsebovati in kdo jo vodi.",
    readMins: 5,
  },
  {
    slug: "evidenca-delovnega-casa-obrazec",
    title: "Evidenca delovnega časa: obrazec in vzorec za brezplačen prenos",
    description:
      "Brezplačen Word/PDF obrazec za evidenco delovnega časa in tabela obveznih polj po ZEPDSV. Prenesite takoj, brez prijave.",
    date: "2026-07-03",
    excerpt:
      "Pripravljen obrazec za neposreden prenos (Word in PDF), brez prijave, in tabela obveznih sestavin po 18. členu ZEPDSV.",
    readMins: 4,
  },
  {
    slug: "prazniki-dela-prosti-dnevi-2026",
    title: "Prazniki in dela prosti dnevi 2026: koledar in evidentiranje",
    description:
      "Koledar dela prostih dni 2026 (15 praznikov, 8 na vikend), podaljšani vikendi za dopust in kako praznik pravilno vpišete v evidenco delovnega časa po ZEPDSV.",
    date: "2026-07-02",
    excerpt:
      "Leto 2026 ima 15 dela prostih dni, a 8 jih pade na vikend. Celoten koledar, kje se dopust najbolj splača in kako praznik pravilno vpišete v evidenco.",
    readMins: 4,
  },
  {
    slug: "globe-zepdsv-evidenca-delovnega-casa",
    title: "Kazni ZEPDSV: kdo mora voditi evidenco in kako se izogniti globi",
    description:
      "IRSD je v 2024 izrekel več kot 1.000 kršitev evidenc. Globe za s.p. do 8.000 €, za d.o.o. do 20.000 €. Lestvica, escalation logika, rešitev.",
    date: "2026-06-28",
    excerpt:
      "Poleti IRSD poostri nadzor. Kolikšne so globe, zakaj naraščajo, kako poteka inšpekcija in kako se globi izognete v štirih korakih.",
    readMins: 5,
  },
  {
    slug: "evidenca-delovnega-casa-excel",
    title: "Evidenca delovnega časa v Excelu: zakaj pogosto ni dovolj",
    description:
      "Brezplačen Excel vzorec za evidenco delovnega časa po ZEPDSV. Kdaj zadošča in kdaj tvegate globo.",
    date: "2026-06-27",
    excerpt:
      "Excel je logična prva izbira za evidenco ur. A le, če ga uporabljate prav. Kdaj zadošča, kdaj tvegate globo, in brezplačen vzorec za prenos.",
    readMins: 5,
  },
];

export const dateSl = (iso: string) =>
  new Intl.DateTimeFormat("sl-SI", { dateStyle: "long" }).format(new Date(iso));
