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
