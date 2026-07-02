// Register blog člankov — vir za kazalo (/blog) in sitemap.
export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO, datum objave
  excerpt: string;
  readMins: number;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "prazniki-dela-prosti-dnevi-2026",
    title: "Prazniki in dela prosti dnevi 2026: koledar in evidentiranje",
    description:
      "Koledar dela prostih dni 2026 (15 praznikov, 8 na vikend), dolgi vikendi za dopust in kako praznik pravilno vpišete v evidenco delovnega časa po ZEPDSV.",
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
