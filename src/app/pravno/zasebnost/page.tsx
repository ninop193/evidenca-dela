import type { Metadata } from "next";
import { LegalPage, LSection } from "@/components/LegalPage";
import { COMPANY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Politika zasebnosti | Evidenca dela",
  description: "Politika zasebnosti in obdelava osebnih podatkov pri storitvi Evidenca dela (NextEra d.o.o.).",
};

export default function ZasebnostPage() {
  return (
    <LegalPage title="Politika zasebnosti">
      <p>
        Ta politika pojasnjuje, kako pri storitvi <strong>{COMPANY.product}</strong> obdelujemo
        osebne podatke v skladu s Splošno uredbo o varstvu podatkov (GDPR) in slovensko zakonodajo.
      </p>

      <LSection title="1. Upravljavec">
        <p>
          Upravljavec osebnih podatkov uporabniškega računa in plačil je:
        </p>
        <p>
          <strong>{COMPANY.name}</strong>
          <br />
          {COMPANY.address}
          <br />
          Matična številka: {COMPANY.maticna} · Davčna številka: {COMPANY.davcna}
          <br />
          E-naslov: {COMPANY.email}
        </p>
      </LSection>

      <LSection title="2. Podatki zaposlenih (vloga obdelovalca)">
        <p>
          Za podatke, ki jih delodajalec vnaša o svojih zaposlenih (ime, EMŠO, davčna številka,
          delovne ure, odsotnosti), je <strong>upravljavec delodajalec</strong> (podjetje-stranka),
          ponudnik {COMPANY.short} pa nastopa kot <strong>obdelovalec</strong>. Te podatke
          obdelujemo izključno po navodilih delodajalca, za namen delovanja storitve.
        </p>
        <p>
          Za to obdelavo ponudnik s stranko sklene pogodbo o obdelavi osebnih podatkov, kadar je to
          zahtevano.
        </p>
      </LSection>

      <LSection title="3. Kateri podatki se obdelujejo">
        <p>
          Podatki o računu: ime in priimek, e-naslov, naziv in davčna številka podjetja. Podatki o
          plačilu: obdela jih ponudnik Stripe (ponudnik storitve ne hrani podatkov o karticah).
          Podatki o uporabi: tehnični dnevniki za delovanje in varnost.
        </p>
      </LSection>

      <LSection title="4. Nameni in pravna podlaga">
        <p>
          Podatke obdelujemo za izvajanje pogodbe (zagotavljanje storitve in obračun), za
          izpolnjevanje zakonskih obveznosti ter na podlagi zakonitega interesa za varnost in
          izboljšanje storitve.
        </p>
      </LSection>

      <LSection title="5. Obdelovalci in lokacija podatkov">
        <p>Pri zagotavljanju storitve sodelujejo naslednji obdelovalci:</p>
        <p>
          <strong>Supabase</strong> (baza podatkov in prijava, EU, Frankfurt),{" "}
          <strong>Vercel</strong> (gostovanje aplikacije) in <strong>Stripe</strong> (obdelava
          plačil). Podatki uporabniških evidenc so shranjeni v Evropski uniji.
        </p>
      </LSection>

      <LSection title="6. Hramba podatkov">
        <p>
          Podatke hranimo, dokler traja uporabniški račun, ter v rokih, ki jih določa zakonodaja
          (npr. davčni in računovodski predpisi). Po prenehanju in izteku zakonskih rokov podatke
          izbrišemo ali anonimiziramo.
        </p>
      </LSection>

      <LSection title="7. Pravice posameznika">
        <p>
          Posameznik ima pravico do dostopa, popravka, izbrisa, omejitve obdelave, prenosljivosti
          podatkov in ugovora. Za podatke zaposlenih te pravice uveljavlja pri svojem delodajalcu
          (upravljavcu). Pritožbo je mogoče vložiti pri Informacijskem pooblaščencu RS.
        </p>
      </LSection>

      <LSection title="8. Piškotki">
        <p>
          Uporabljamo le nujne piškotke, potrebne za prijavo in delovanje storitve. Ne uporabljamo
          oglaševalskih ali sledilnih piškotkov.
        </p>
      </LSection>

      <LSection title="9. Kontakt">
        <p>
          Za vprašanja glede zasebnosti smo dosegljivi na: {COMPANY.email}.
        </p>
      </LSection>
    </LegalPage>
  );
}
