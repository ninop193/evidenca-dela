import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { signOut } from "../(auth)/actions";

export default async function ZigosanjePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <h1 className="text-base font-bold text-slate-900">Moje ure</h1>
          <form action={signOut}>
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Odjava
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-10 text-center">
        <p className="text-slate-700">
          Pozdravljen, <strong>{profile.full_name ?? "zaposleni"}</strong>.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Gumb za žigosanje prihoda/odhoda dodajamo v naslednjem koraku.
        </p>
      </div>
    </main>
  );
}
