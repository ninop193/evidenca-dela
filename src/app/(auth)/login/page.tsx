import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import LoginForm from "./LoginForm";

// Prijavna stran ni SEO vsebina — ne sme biti indeksirana (canonical nase +
// noindex,follow; linki še vedno prenašajo signal na ciljne strani).
export const metadata: Metadata = {
  title: { absolute: "Prijava – Delovit" },
  description: "Prijava v Delovit — aplikacija za evidenco delovnega časa.",
  alternates: { canonical: "/login" },
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

// Če je uporabnik že prijavljen (veljavna seja), ga ne pustimo na obrazcu za
// prijavo — takoj ga pošljemo v aplikacijo. Brez tega je vračajoči se uporabnik
// (ki pride prek domače strani / zaznamka) videl obrazec, čeprav je prijavljen,
// in je moral znova klikniti "Prijava". Preusmeritev je strežniška (brez utripa).
export default async function LoginPage() {
  const profile = await getProfile();
  if (profile?.role === "admin") redirect("/dashboard");
  if (profile?.role === "employee") redirect("/zigosanje");
  // Neprijavljen ali (redko) prijavljen brez profila → pokaži obrazec.
  return <LoginForm />;
}
