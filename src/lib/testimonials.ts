// Mnenja strank na domači strani. Novo mnenje samo dopiši v seznam —
// postavitev se prilagodi številu (1 = izpostavljen citat, 2 = dva stolpca, 3+ = mreža).
export type Testimonial = {
  name: string;
  company: string;
  quote: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Danijela",
    company: "Futuristica d.o.o.",
    quote:
      "Zelo preprosto za uporabo, študenti so se navadili v enem dnevu. Na koncu meseca mi ni treba več nič računati.",
  },
  {
    name: "Cynthia",
    company: "Igralnica Koko d.o.o.",
    quote:
      "Uporaba nam je precej poenostavila organizacijo in prihranila kar nekaj časa. Priporočamo vsem, ki iščejo preprost in učinkovit način beleženja delovnega časa. 😊",
  },
];
