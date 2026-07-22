import "server-only";
import Stripe from "stripe";

// Stripe odjemalec (samo strežnik). Uporablja secret key iz okolja.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  // Pustimo privzeto verzijo API-ja iz nameščene knjižnice.
  typescript: true,
});

export const STRIPE_PRICES: Record<"month" | "year", string> = {
  month: process.env.STRIPE_PRICE_MONTHLY ?? "",
  year: process.env.STRIPE_PRICE_YEARLY ?? "",
};

// Vklop samodejnega DDV (Stripe Tax). Če Tax še ni nastavljen, lahko začasno
// nastaviš STRIPE_AUTOMATIC_TAX=false v okolju.
export const AUTOMATIC_TAX = (process.env.STRIPE_AUTOMATIC_TAX ?? "true") !== "false";

// Partnerski program: pri LETNEM paketu se popust (npr. 10 %) uporabi prek tega
// skupnega kupona namesto partnerjeve promo kode (ta je na 20 % kuponu za mesečni
// paket). ID kupona (co_...) nastaviš v okolju; če je prazen, letni paket ne dobi
// samodejnega partnerskega popusta.
export const YEARLY_REF_COUPON = process.env.STRIPE_YEARLY_REF_COUPON ?? "";
