import { renderEmail, infoBox, p, EMAIL_BASE } from "./render";
import { PLAN, eur } from "@/lib/billing";

export type RenderedEmail = { subject: string; html: string };

const firstName = (full?: string | null) =>
  (full?.trim().split(/\s+/)[0] || "").slice(0, 40);

const hi = (name?: string | null) => {
  const n = firstName(name);
  return n ? `Pozdravljeni, ${n} 👋` : "Pozdravljeni 👋";
};

// 1) Dobrodošlica ob potrjeni registraciji (start 14-dnevnega preizkusa).
export function welcomeEmail(opts: {
  fullName?: string | null;
  companyName?: string | null;
  trialDaysLeft?: number;
}): RenderedEmail {
  const days = opts.trialDaysLeft ?? 14;
  return {
    subject: "Dobrodošli v Delovit 🎉",
    html: renderEmail({
      preview: `Vaš ${days}-dnevni brezplačni preizkus se je začel.`,
      heading: "Dobrodošli v Delovit 🎉",
      intro: `${hi(opts.fullName)} Vaš račun je pripravljen${
        opts.companyName ? ` za <strong>${opts.companyName}</strong>` : ""
      }. Od zdaj imate <strong>${days} dni popolnoma brezplačnega preizkusa</strong>, brez kartice in brez obveznosti.`,
      bodyHtml:
        p("Kar lahko storite takoj:") +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
           <tr><td style="padding:5px 0;font-size:15px;color:#475569;">✅ &nbsp;Dodate zaposlene</td></tr>
           <tr><td style="padding:5px 0;font-size:15px;color:#475569;">⏱️ &nbsp;Začnete beležiti delovni čas (žigosanje)</td></tr>
           <tr><td style="padding:5px 0;font-size:15px;color:#475569;">📊 &nbsp;Izvozite mesečno evidenco za računovodjo</td></tr>
         </table>`,
      button: { label: "Odprite nadzorno ploščo", href: `${EMAIL_BASE}/dashboard` },
      footnote:
        "Delovit je usklajen z novelo ZEPDSV-B, ki velja od 23. 4. 2025. Če potrebujete pomoč pri prvih korakih, smo le en email stran.",
    }),
  };
}

// 2) Preizkus se izteka (npr. 2 dni prej).
export function trialEndingEmail(opts: {
  fullName?: string | null;
  daysLeft: number;
}): RenderedEmail {
  const d = opts.daysLeft;
  const dni = d === 1 ? "1 dan" : `${d} dni`;
  return {
    subject: `Vaš preizkus Delovit poteče čez ${dni}`,
    html: renderEmail({
      preview: `Po izteku se evidenca zaklene, vsi podatki ostanejo shranjeni.`,
      heading: `Preizkus poteče čez ${dni}`,
      intro: `${hi(opts.fullName)} Vaš brezplačni preizkus se izteče čez <strong>${dni}</strong>. Da bosta žigosanje in evidenca delovala naprej brez prekinitve, izberite paket.`,
      bodyHtml:
        infoBox([
          ["Paket", PLAN.name],
          ["Mesečno", `${eur(PLAN.monthlyNet)} + DDV`],
          ["Letno", `${eur(PLAN.yearlyNet)} + DDV (2 meseca gratis)`],
        ]) +
        p(
          "Po izteku se vstop v aplikacijo zaklene, vendar <strong>vsi vaši podatki ostanejo varno shranjeni</strong> in so spet na voljo takoj po aktivaciji.",
        ),
      button: { label: "Izberite paket", href: `${EMAIL_BASE}/narocnina` },
      footnote: "Naročnino lahko kadarkoli prekličete v nekaj klikih.",
    }),
  };
}

// 3) Plačilo uspešno (aktivacija / podaljšanje naročnine).
export function paymentSuccessEmail(opts: {
  fullName?: string | null;
  amount?: string | null; // npr. "23,18 €" (z DDV) — če na voljo iz računa
  interval?: "month" | "year" | string | null;
  nextDate?: string | null; // npr. "13. 7. 2026"
}): RenderedEmail {
  const period =
    opts.interval === "year" ? "letno" : opts.interval === "month" ? "mesečno" : null;
  const rows: Array<[string, string]> = [["Paket", PLAN.name]];
  if (period) rows.push(["Obračun", period]);
  if (opts.amount) rows.push(["Znesek", opts.amount]);
  if (opts.nextDate) rows.push(["Naslednje plačilo", opts.nextDate]);

  return {
    subject: "Plačilo prejeto, naročnina je aktivna ✅",
    html: renderEmail({
      preview: "Hvala! Vaša naročnina Delovit je aktivna.",
      heading: "Plačilo je uspelo ✅",
      intro: `${hi(opts.fullName)} Hvala za zaupanje. Vaša naročnina je <strong>aktivna</strong> in evidenca deluje brez omejitev.`,
      bodyHtml:
        infoBox(rows) +
        p("Račun za plačilo prejmete ločeno. Naročnino lahko kadarkoli upravljate v aplikaciji."),
      button: { label: "Upravljaj naročnino", href: `${EMAIL_BASE}/narocnina` },
    }),
  };
}

// ── Supabase Auth predlogi (za prilepiti v Supabase Dashboard) ──────────────
// Uporabljajo Supabase spremenljivko {{ .ConfirmationURL }} (akcijska povezava).

const ACTION_URL = "{{ .ConfirmationURL }}";

export function authConfirmEmail(): RenderedEmail {
  return {
    subject: "Potrdite svoj email za Delovit",
    html: renderEmail({
      preview: "Še zadnji korak za aktivacijo računa Delovit.",
      heading: "Potrdite svoj email",
      intro:
        "Še zadnji korak. Kliknite spodaj in potrdite svoj e-poštni naslov, da aktivirate račun Delovit in zaženete 14-dnevni brezplačni preizkus.",
      bodyHtml: p(
        "Če gumb ne deluje, kopirajte to povezavo v brskalnik:<br><span style=\"color:#1d4ed8;word-break:break-all;\">" +
          ACTION_URL +
          "</span>",
      ),
      button: { label: "Potrdi email", href: ACTION_URL },
      footnote: "Če računa niste ustvarili vi, ta email mirno prezrite.",
    }),
  };
}

export function authResetEmail(): RenderedEmail {
  return {
    subject: "Ponastavitev gesla za Delovit",
    html: renderEmail({
      preview: "Nastavite novo geslo za svoj Delovit račun.",
      heading: "Ponastavite geslo",
      intro:
        "Prejeli smo zahtevo za ponastavitev gesla za vaš račun Delovit. Kliknite spodaj in nastavite novo geslo.",
      bodyHtml: p(
        "Če gumb ne deluje, kopirajte to povezavo v brskalnik:<br><span style=\"color:#1d4ed8;word-break:break-all;\">" +
          ACTION_URL +
          "</span>",
      ),
      button: { label: "Ponastavi geslo", href: ACTION_URL },
      footnote:
        "Če ponastavitve niste zahtevali vi, ta email prezrite. Vaše geslo ostane nespremenjeno.",
    }),
  };
}

// Zaposleni dodan: pozdravni email s podatki za prijavo.
export function employeeWelcomeEmail(opts: {
  fullName?: string | null;
  email: string;
  password: string;
  companyName?: string | null;
}): RenderedEmail {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const n = firstName(opts.fullName);
  return {
    subject: "Vaš dostop do Delovit 👋",
    html: renderEmail({
      preview: "Podatki za prijavo in žigosanje delovnega časa.",
      heading: "Dobrodošli v Delovit 👋",
      intro: `${n ? `Pozdravljeni, ${n}.` : "Pozdravljeni."} ${
        opts.companyName ? `<strong>${esc(opts.companyName)}</strong> vas je` : "Vaš delodajalec vas je"
      } dodal v Delovit za beleženje delovnega časa. Spodaj so vaši podatki za prijavo.`,
      bodyHtml:
        infoBox([
          ["E-pošta", esc(opts.email)],
          ["Geslo", esc(opts.password)],
        ]) +
        p(
          "Prijavite se na telefonu in žigosajte prihod ter odhod z enim tapom. Aplikacijo si lahko dodate na domači zaslon telefona.",
        ),
      button: { label: "Prijava", href: `${EMAIL_BASE}/login` },
      footnote:
        "Priporočamo, da po prvi prijavi geslo spremenite (ikona ključka v aplikaciji). Če prijave niste pričakovali, ta email prezrite.",
    }),
  };
}

// Kontaktni obrazec → sporočilo v info@delovit.si.
export function contactEmail(opts: {
  name: string;
  email: string;
  company?: string | null;
  message: string;
}): RenderedEmail {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return {
    subject: `Novo povpraševanje: ${opts.name}`,
    html: renderEmail({
      preview: `Sporočilo s kontaktnega obrazca od ${opts.name}.`,
      heading: "Novo povpraševanje 📨",
      intro: "Prek kontaktnega obrazca na delovit.si je prispelo novo sporočilo.",
      bodyHtml:
        infoBox(
          [
            ["Ime", esc(opts.name)],
            ["E-pošta", esc(opts.email)],
            ...(opts.company ? [["Podjetje", esc(opts.company)] as [string, string]] : []),
          ],
        ) +
        p(`<strong>Sporočilo:</strong><br>${esc(opts.message).replace(/\n/g, "<br>")}`),
      footnote: "Odgovoriš lahko neposredno na ta mail (Reply) — gre na pošiljateljev naslov.",
    }),
  };
}

// 4) Plačilo ni uspelo / kartica zavrnjena.
export function paymentFailedEmail(opts: {
  fullName?: string | null;
}): RenderedEmail {
  return {
    subject: "Plačilo ni uspelo, preverite kartico",
    html: renderEmail({
      preview: "Posodobite plačilno sredstvo, da preprečite zaklep evidence.",
      heading: "Plačilo ni uspelo",
      intro: `${hi(opts.fullName)} Pri zadnjem obračunu vaše naročnine je bilo plačilo <strong>zavrnjeno</strong> (npr. potekla ali nezadostna sredstva na kartici).`,
      bodyHtml:
        p("Da evidenca deluje naprej brez prekinitve, prosimo čim prej posodobite plačilno sredstvo. Če plačilo ne uspe, se dostop do aplikacije začasno zaklene."),
      button: { label: "Posodobi plačilo", href: `${EMAIL_BASE}/narocnina` },
      footnote: "Vaši podatki ostanejo shranjeni tudi v primeru zaklepa.",
    }),
  };
}

// 5) Opozorilo delodajalcu: vnos(i) so ostali odprti (pozabljen odhod) → za pregled.
export function openEntriesAlertEmail(opts: {
  fullName?: string | null;
  items: { name: string; date: string; capHours: number }[];
}): RenderedEmail {
  const n = opts.items.length;
  const beseda = n === 1 ? "vnos" : n < 5 ? "vnosi" : "vnosov";
  const rows = opts.items
    .map(
      (it) =>
        `<tr><td style="padding:5px 0;font-size:15px;color:#475569;">• &nbsp;<strong>${it.name}</strong> — ${it.date} (predlagano ${it.capHours} h)</td></tr>`,
    )
    .join("");
  return {
    subject:
      n === 1
        ? "1 vnos delovnega časa čaka na pregled"
        : `${n} vnosov delovnega časa čaka na pregled`,
    html: renderEmail({
      preview: "Pozabljen odhod — predlagali smo čas in vnos označili za pregled.",
      heading: "Vnosi za pregled",
      intro: `${hi(opts.fullName)} Pri spodnjih ${beseda} zaposleni verjetno niso žigosali odhoda. Vnose smo <strong>označili za pregled</strong> in predlagali čas odhoda ob dnevni meji — ura ni bila tiho odrezana.`,
      bodyHtml:
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">${rows}</table>` +
        p("Odprite pregled ur, preverite dejanski čas odhoda in po potrebi popravite. Ko vnos shranite, oznaka izgine."),
      button: { label: "Odpri pregled ur", href: `${EMAIL_BASE}/dashboard/ure` },
      footnote:
        "Pravilna evidenca izrabe delovnega časa je zahteva 18. člena ZEPDSV. Delovit vas opozori, preden to opazi inšpektor.",
    }),
  };
}
