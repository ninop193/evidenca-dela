import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import LoginForm from "./LoginForm";

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
