import { PLAN } from "@/lib/billing";

// Per-podjetje dvig omejitve zaposlenih (dogovor s posamezno stranko).
// Ključ = company_id, vrednost = največ zaposlenih (Infinity = neomejeno).
// Za dodajanje nove stranke: dopiši vrstico s company_id + deploy.
export const EMPLOYEE_LIMIT_OVERRIDE: Record<string, number> = {
  "2620004c-e2e8-45d0-bde5-aedaabe551ff": Infinity, // Bowling center Strike — neomejeno
};

// Veljavna omejitev zaposlenih za podjetje (override, sicer privzeti paket).
export function employeeLimitFor(companyId: string): number {
  return EMPLOYEE_LIMIT_OVERRIDE[companyId] ?? PLAN.maxEmployees;
}
