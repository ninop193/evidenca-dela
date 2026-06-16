import type { Metadata } from "next";
import { LegalPage, LSection } from "@/components/LegalPage";
import { COMPANY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Vračila in odpoved naročnine | Delovit",
  description: "Politika odpovedi naročnine in vračil za storitev Delovit (NextEra d.o.o.).",
};

export default function VracilaPage() {
  return (
    <LegalPage title="Vračila in odpoved naročnine">
      <p>
        Ta dokument pojasnjuje, kako poteka odpoved naročnine in kakšna je politika vračil za
        storitev <strong>{COMPANY.product}</strong>, ki jo zagotavlja {COMPANY.short}.
      </p>

      <LSection title="1. Odpoved naročnine">
        <p>
          Naročnino lahko odpoveš <strong>kadarkoli</strong>, brez odpovednega roka in brez vezave.
          Po odpovedi dostop do storitve traja do konca že plačanega obračunskega obdobja, nato se
          naročnina ne podaljša in se ne zaračuna naprej.
        </p>
      </LSection>

      <LSection title="2. Postopek odpovedi">
        <p>
          Naročnino odpoveš v nastavitvah naročnine znotraj aplikacije ali tako, da nam pišeš na{" "}
          {COMPANY.email}. Odpoved potrdimo po e-pošti.
        </p>
      </LSection>

      <LSection title="3. Vračila">
        <p>
          Ker gre za digitalno storitev za poslovne uporabnike (delodajalce), se že plačano tekoče
          obračunsko obdobje praviloma ne vrača sorazmerno. Z odpovedjo se ustavi nadaljnje
          zaračunavanje. V primeru tehnične napake na naši strani, zaradi katere storitev ni bila
          uporabna, vračilo obravnavamo individualno in pošteno.
        </p>
      </LSection>

      <LSection title="4. Neplačilo">
        <p>
          Če naročnina ni poravnana, se dostop do plačljivih funkcij omeji po izteku krajšega
          obdobja mirovanja. Podatki ostanejo shranjeni in so znova dostopni po poravnavi.
        </p>
      </LSection>

      <LSection title="5. Kontakt">
        <p>
          Za vprašanja glede plačil, odpovedi ali vračil smo dosegljivi na: {COMPANY.email}.
        </p>
      </LSection>
    </LegalPage>
  );
}
