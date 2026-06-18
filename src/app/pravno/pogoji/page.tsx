import type { Metadata } from "next";
import { LegalPage, LSection } from "@/components/LegalPage";
import { COMPANY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Pogoji uporabe",
  description: "Pogoji uporabe storitve Delovit, ki jo zagotavlja NextEra d.o.o.",
  alternates: { canonical: "/pravno/pogoji" },
};

export default function PogojiPage() {
  return (
    <LegalPage title="Pogoji uporabe">
      <p>
        Ti pogoji urejajo uporabo spletne aplikacije <strong>{COMPANY.product}</strong> (v
        nadaljevanju: storitev). Z registracijo in uporabo storitve se uporabnik strinja s temi
        pogoji.
      </p>

      <LSection title="1. Ponudnik storitve">
        <p>Storitev zagotavlja:</p>
        <p>
          <strong>{COMPANY.name}</strong>
          <br />
          {COMPANY.address}
          <br />
          Matična številka: {COMPANY.maticna}
          <br />
          Davčna številka: {COMPANY.davcna} (zavezanec za DDV)
          <br />
          Vpis v register: {COMPANY.register}
          <br />
          E-naslov: {COMPANY.email}
        </p>
      </LSection>

      <LSection title="2. Opis storitve">
        <p>
          Storitev je spletna aplikacija za vodenje evidence delovnega časa, skladno z določili
          Zakona o evidencah na področju dela in socialne varnosti (ZEPDSV). Omogoča beleženje
          prihoda in odhoda zaposlenih, vodenje odsotnosti ter izvoz evidence.
        </p>
        <p>
          Ponudnik si prizadeva za pravilnost in skladnost funkcionalnosti, vendar je za pravilnost
          vnesenih podatkov in izpolnjevanje zakonskih obveznosti odgovoren uporabnik (delodajalec).
        </p>
      </LSection>

      <LSection title="3. Registracija in uporabniški račun">
        <p>
          Za uporabo storitve je potrebna registracija. Uporabnik je odgovoren za točnost vnesenih
          podatkov ter za varovanje dostopnih gesel. Za vse aktivnosti na svojem računu odgovarja
          uporabnik.
        </p>
      </LSection>

      <LSection title="4. Naročnina in plačila">
        <p>
          Storitev se ponuja kot mesečna naročnina po veljavnem ceniku. Plačila se obdelujejo prek
          ponudnika plačil <strong>Stripe</strong>. Naročnina se samodejno podaljšuje za naslednje
          obdobje, dokler je uporabnik ne odpove.
        </p>
        <p>
          Cene so navedene na spletni strani. Ponudnik si pridržuje pravico do spremembe cen, o
          čemer uporabnika obvesti vnaprej.
        </p>
      </LSection>

      <LSection title="5. Odpoved naročnine">
        <p>
          Uporabnik lahko naročnino odpove kadarkoli, brez odpovednega roka in brez vezave. Dostop
          do storitve traja do konca že plačanega obdobja. Podrobnosti so v dokumentu{" "}
          <a href="/pravno/vracila" className="text-brand-700 underline">Vračila in odpoved naročnine</a>.
        </p>
      </LSection>

      <LSection title="6. Obveznosti uporabnika">
        <p>
          Uporabnik se zavezuje, da bo storitev uporabljal zakonito in v skladu z namenom. Vnesene
          podatke mora voditi resnično in ažurno. Prepovedana je vsaka zloraba ali poskus
          nepooblaščenega dostopa do podatkov drugih uporabnikov.
        </p>
      </LSection>

      <LSection title="7. Razpoložljivost in omejitev odgovornosti">
        <p>
          Ponudnik si prizadeva za neprekinjeno delovanje storitve, vendar ne jamči za stoodstotno
          razpoložljivost. Storitev se zagotavlja po načelu „kakršna je". Ponudnik ne odgovarja za
          posredno škodo, izgubo podatkov ali izgubljeni dobiček, razen v primeru naklepa ali hude
          malomarnosti.
        </p>
      </LSection>

      <LSection title="8. Varstvo podatkov">
        <p>
          Obdelava osebnih podatkov je opisana v{" "}
          <a href="/pravno/zasebnost" className="text-brand-700 underline">Politiki zasebnosti</a>.
        </p>
      </LSection>

      <LSection title="9. Spremembe pogojev">
        <p>
          Ponudnik lahko te pogoje občasno posodobi. O pomembnejših spremembah uporabnika obvesti.
          Nadaljnja uporaba storitve po spremembi pomeni strinjanje z novimi pogoji.
        </p>
      </LSection>

      <LSection title="10. Pravo in pristojnost">
        <p>
          Za te pogoje velja pravo Republike Slovenije. Za morebitne spore je pristojno sodišče v
          kraju sedeža ponudnika ({COMPANY.court}).
        </p>
      </LSection>

      <LSection title="11. Kontakt">
        <p>Za vprašanja smo dosegljivi na: {COMPANY.email}.</p>
      </LSection>
    </LegalPage>
  );
}
