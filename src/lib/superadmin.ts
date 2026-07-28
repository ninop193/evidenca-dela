import "server-only";

// Emaili, ki smejo videti interni nadzor (/nadzor). SAMO lastnik produkta.
// Za dodajanje: dopiši email (male črke) in deploy.
const SUPERADMIN_EMAILS = new Set<string>([
  "nino.pavalec01@gmail.com",
]);

export function isSuperadmin(email?: string | null): boolean {
  return !!email && SUPERADMIN_EMAILS.has(email.trim().toLowerCase());
}
