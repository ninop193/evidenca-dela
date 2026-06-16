// Paket in logika dostopa (preizkus / naročnina).

export const PLAN = {
  name: "Delovit do 10 oseb",
  maxEmployees: 10,
  monthlyNet: 19,
  yearlyNet: 190,
  currency: "EUR",
  vatRate: 0.22,
};

export const eur = (n: number) =>
  new Intl.NumberFormat("sl-SI", { style: "currency", currency: "EUR" }).format(n || 0);

export type CompanyBilling = {
  subscription_status?: string | null;
  trial_ends_at?: string | null;
};

export type AccessState = "active" | "trialing" | "trial_expired" | "inactive";

export type Access = {
  hasAccess: boolean;
  state: AccessState;
  trialDaysLeft: number | null;
};

// Ali ima podjetje dostop do storitve in v kakšnem stanju je.
export function getAccess(c: CompanyBilling): Access {
  const status = c.subscription_status ?? "trialing";

  if (status === "active") {
    return { hasAccess: true, state: "active", trialDaysLeft: null };
  }

  if (status === "trialing") {
    if (c.trial_ends_at) {
      const end = new Date(c.trial_ends_at).getTime();
      const now = Date.now();
      if (now < end) {
        const trialDaysLeft = Math.max(1, Math.ceil((end - now) / 86_400_000));
        return { hasAccess: true, state: "trialing", trialDaysLeft };
      }
    }
    return { hasAccess: false, state: "trial_expired", trialDaysLeft: 0 };
  }

  // 'past_due' grace period uredimo v Fazi B (Stripe). Za zdaj brez dostopa.
  return { hasAccess: false, state: "inactive", trialDaysLeft: null };
}
