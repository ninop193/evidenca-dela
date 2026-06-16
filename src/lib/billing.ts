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
  current_period_end?: string | null;
};

export type AccessState = "active" | "trialing" | "trial_expired" | "past_due" | "inactive";

export type Access = {
  hasAccess: boolean;
  state: AccessState;
  trialDaysLeft: number | null;
};

const GRACE_DAYS = 3;

// Ali ima podjetje dostop do storitve in v kakšnem stanju je.
export function getAccess(c: CompanyBilling): Access {
  const status = c.subscription_status ?? "trialing";

  if (status === "active") {
    return { hasAccess: true, state: "active", trialDaysLeft: null };
  }

  // Neplačilo: 3-dnevni grace period po koncu obdobja.
  if (status === "past_due") {
    if (c.current_period_end) {
      const graceEnd = new Date(c.current_period_end).getTime() + GRACE_DAYS * 86_400_000;
      if (Date.now() < graceEnd) {
        return { hasAccess: true, state: "past_due", trialDaysLeft: null };
      }
    }
    return { hasAccess: false, state: "past_due", trialDaysLeft: null };
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

  return { hasAccess: false, state: "inactive", trialDaysLeft: null };
}
