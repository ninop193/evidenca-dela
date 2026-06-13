import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 text-center">
      <div className="max-w-xl">
        <span className="inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
          Skladno z ZEPDSV
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Evidenca delovnega časa za mikro podjetja
        </h1>
        <p className="mt-4 text-base text-slate-600">
          Zaposleni žigosa prihod in odhod z enim gumbom. Ti vidiš vse ure in
          izvoziš evidenco za inšpekcijo. Fiksna cena, brez onboardinga.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="rounded-xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
          >
            Registriraj podjetje
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Prijava
          </Link>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Brezplačno orodje:{" "}
          <Link href="/kalkulator" className="font-semibold text-emerald-700 underline">
            Bruto-neto kalkulator plače
          </Link>
        </p>
      </div>
    </main>
  );
}
