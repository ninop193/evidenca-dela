// Generator PDF vodičev/prezentacije za Delovit (HTML → PDF prek Playwright).
// Zajete posnetke bere iz scripts/pdf/shots/, logo iz scripts/pdf/logo.png.
// Zaženi: node scripts/pdf/gen.mjs   (rabi omrežje za pisave)
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/ninopavalec/Documents/evidenca-dela/node_modules/playwright-core");
const DIR = dirname(fileURLToPath(import.meta.url));
const EXE = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
html,body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#0f172a;}
.page{position:relative;width:210mm;height:297mm;overflow:hidden;page-break-after:always;
  background:linear-gradient(135deg,#eef2ff 0%,#fdf2f8 45%,#ecfdf5 100%);
  display:flex;flex-direction:column;padding:16mm 18mm;}
.page:last-child{page-break-after:auto;}
.hdr{display:flex;justify-content:space-between;align-items:center;}
.hdr .lbl{font-size:9px;font-weight:700;letter-spacing:.22em;color:#94a3b8;text-transform:uppercase;}
.hdr .brand{display:flex;align-items:center;gap:7px;}
.hdr .brand img{width:22px;height:22px;}
.hdr .brand span{font-size:15px;font-weight:800;letter-spacing:-.02em;color:#0f172a;}
.ftr{margin-top:auto;text-align:center;font-size:10px;color:#94a3b8;letter-spacing:.02em;}
.body{flex:1;display:flex;flex-direction:column;}
/* naslovnica */
.cover{justify-content:center;}
.cover img.logo{width:96px;height:96px;margin-bottom:26px;}
.chip{display:inline-flex;align-items:center;gap:7px;background:#fff;border-radius:999px;padding:7px 15px;
  font-size:12px;font-weight:700;color:#1d4ed8;box-shadow:0 4px 14px -6px rgba(29,78,216,.25);width:fit-content;}
.chip .dot{width:7px;height:7px;border-radius:999px;background:#2563eb;}
.cover h1{font-size:52px;line-height:1.04;font-weight:800;letter-spacing:-.03em;margin:22px 0 18px;}
.cover h1 .g{color:#2563eb;}
.cover p{font-size:17px;line-height:1.6;color:#475569;max-width:70%;}
/* koračne strani */
.step .num{display:flex;align-items:center;gap:12px;margin-bottom:10px;}
.step .num b{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:#2563eb;color:#fff;font-size:15px;font-weight:800;}
.step .num span{font-size:12px;font-weight:700;letter-spacing:.18em;color:#2563eb;text-transform:uppercase;}
.step h2{font-size:30px;font-weight:800;letter-spacing:-.02em;line-height:1.12;}
.step .sub{font-size:15px;line-height:1.6;color:#475569;margin-top:10px;max-width:92%;}
.shot{margin:22px auto 0;border-radius:18px;overflow:hidden;box-shadow:0 24px 60px -26px rgba(15,23,42,.4);
  background:#fff;display:flex;}
.shot.phone{width:210px;border:1px solid #e7ebf3;}
.shot.wide{width:100%;border:1px solid #e7ebf3;}
.shot img{width:100%;display:block;}
.namig{margin-top:20px;border-left:4px solid #2563eb;background:rgba(37,99,235,.06);border-radius:0 12px 12px 0;
  padding:13px 16px;font-size:13.5px;line-height:1.6;color:#334155;}
.namig b{color:#1d4ed8;}
/* dvojni "kako deluje" */
.two{display:flex;gap:18px;margin-top:22px;align-items:flex-start;}
.two .col{flex:1;}
.two .cap{font-size:13px;color:#475569;margin-top:12px;line-height:1.5;}
/* statistika */
.stats{display:flex;gap:16px;margin-top:26px;}
.stat{flex:1;background:#fff;border:1px solid #eef1f8;border-radius:16px;padding:22px 20px;}
.stat .big{font-size:40px;font-weight:800;color:#2563eb;letter-spacing:-.02em;line-height:1;}
.stat .cap{font-size:13px;color:#475569;margin-top:10px;line-height:1.45;}
.warn{margin-top:22px;background:#fffbeb;border:1px solid #fde68a;border-left:5px solid #f59e0b;border-radius:12px;
  padding:14px 18px;font-size:13.5px;color:#78350f;line-height:1.6;}
/* mreža funkcij */
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:26px;}
.feat{background:#fff;border:1px solid #eef1f8;border-radius:16px;padding:20px;}
.feat .ic{width:40px;height:40px;border-radius:11px;background:#eff6ff;display:grid;place-items:center;font-size:20px;}
.feat h3{font-size:16px;font-weight:800;margin-top:14px;}
.feat p{font-size:13px;color:#475569;margin-top:6px;line-height:1.5;}
/* checklist */
.checks{margin-top:20px;display:flex;flex-direction:column;gap:10px;}
.check{background:#fff;border:1px solid #eef1f8;border-radius:12px;padding:13px 16px;font-size:14px;font-weight:600;
  display:flex;align-items:center;gap:10px;}
.check .d{width:8px;height:8px;border-radius:999px;background:#2563eb;}
/* zaključna */
.end{justify-content:center;text-align:center;align-items:center;}
.end img.logo{width:88px;height:88px;margin-bottom:22px;}
.end h1{font-size:44px;font-weight:800;letter-spacing:-.03em;line-height:1.05;}
.end p{font-size:16px;color:#475569;margin-top:14px;line-height:1.6;max-width:70%;}
.end .mail{margin-top:16px;font-size:15px;color:#475569;}
.end .mail b{color:#1d4ed8;}
`;

import { copyFileSync } from "node:fs";
copyFileSync(join(DIR, "..", "..", "public", "delovit-logo-transparent.png"), join(DIR, "logo.png"));
const logo = "logo.png";
const shot = (f, kind = "phone") => `<div class="shot ${kind}"><img src="shots/${f}"></div>`;

function page(label, inner, cls = "") {
  return `<div class="page ${cls}">
    <div class="hdr"><div class="lbl">${label}</div>
      <div class="brand"><img src="${logo}"><span>Delovit</span></div></div>
    <div class="body">${inner}</div>
    <div class="ftr">www.delovit.si</div></div>`;
}
function cover(label, chip, h1, sub) {
  return page(label, `<div class="body cover" style="flex:1;display:flex;flex-direction:column;justify-content:center;">
    <img class="logo" src="${logo}">
    <div class="chip"><span class="dot"></span>${chip}</div>
    <h1>${h1}</h1><p>${sub}</p></div>`, "");
}
function step(label, n, kicker, h2, sub, media, namig) {
  return page(label, `<div class="step">
    <div class="num"><b>${n}</b><span>${kicker}</span></div>
    <h2>${h2}</h2><div class="sub">${sub}</div>
    ${media || ""}
    ${namig ? `<div class="namig"><b>Namig</b> &nbsp;${namig}</div>` : ""}
  </div>`);
}
function end(label, h1, p, mail) {
  return page(label, `<div class="body end" style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;">
    <img class="logo" src="${logo}"><h1>${h1}</h1><p>${p}</p>${mail ? `<p class="mail">${mail}</p>` : ""}</div>`);
}
const doc = (pages) => `<!doctype html><html lang="sl"><head><meta charset="utf-8"><style>${CSS}</style></head><body>${pages.join("")}</body></html>`;

/* ============ 1) VODIČ ZA ZAPOSLENEGA ============ */
const L1 = "VODIČ ZA ZAPOSLENEGA";
const employee = doc([
  cover(L1, "Vodič za zaposlenega", `Žigosanje z<br><span class="g">enim gumbom.</span>`,
    "Delodajalec te je povabil v Delovit. V tem vodiču je vse: kako sprejmeš povabilo in nastaviš geslo, žigosanje prihoda in odhoda ter dodajanje aplikacije na domači zaslon telefona."),
  step(L1, 1, "Povabilo", "Sprejmi povabilo in nastavi geslo",
    "V e-pošti dobiš povabilo od Delovit. Klikni gumb v sporočilu in nastavi svoje geslo. Geslo poznaš samo ti, delodajalec ga ne vidi.",
    shot("emp-setpw.png"), "Če povabila ni med prejeto pošto, poglej še v mapo z vsiljeno pošto (spam)."),
  step(L1, 2, "Prijava", "Prijavi se v Delovit",
    "Odpri delovit.si v brskalniku na telefonu, vnesi svoj email in geslo, ki si ga nastavil, ter klikni Prijava.",
    shot("emp-login.png"), "Ostaneš prijavljen. Ob naslednjem obisku te aplikacija sama spusti naprej."),
  step(L1, 3, "Žigosaj prihod", "Pritisni Prihod, ko prideš na delo",
    "Ko prideš na delo, pritisni velik moder gumb Prihod. To je vse, čas prihoda je zabeležen.",
    shot("emp-prihod.png"), "Med delom zgoraj piše „Na delu od …“ in teče števec."),
  step(L1, 4, "Žigosaj odhod", "Pritisni Odhod, ko končaš",
    "Ko končaš z delom, pritisni rdeč gumb Odhod in potrdi. Če si imel odmor (malico), ga lahko pri tem zabeležiš, a ni obvezno.",
    shot("emp-odhod.png"), "Če pozabiš žigosati odhod, ni panike. Aplikacija te opomni, delodajalec pa lahko ure popravi za nazaj."),
  step(L1, 5, "Moje ure", "Poglej svoje ure kadarkoli",
    "Pod gumbom je razdelek Moje ure: koliko si oddelal danes, ta teden in ta mesec, ter seznam po dnevih z odmori in nadurami.",
    shot("emp-mojeure.png"), "Tako imaš vedno pregled nad svojimi urami, brez spraševanja delodajalca."),
  step(L1, 6, "Dodaj na domači zaslon", "Naj deluje kot prava aplikacija",
    "Da ti ni treba vsakič odpirati brskalnika, si Delovit dodaj na domači zaslon telefona in deluje kot prava aplikacija.",
    `<div style="margin-top:22px;display:flex;flex-direction:column;gap:14px;">
      <div style="background:#fff;border:1px solid #eef1f8;border-radius:14px;padding:16px 18px;">
        <div style="font-weight:800;font-size:15px;">📱 iPhone (Safari)</div>
        <div style="font-size:13.5px;color:#475569;margin-top:5px;line-height:1.5;">Pritisni gumb Deli (kvadratek s puščico navzgor) → Dodaj na začetni zaslon.</div></div>
      <div style="background:#fff;border:1px solid #eef1f8;border-radius:14px;padding:16px 18px;">
        <div style="font-weight:800;font-size:15px;">🤖 Android (Chrome)</div>
        <div style="font-size:13.5px;color:#475569;margin-top:5px;line-height:1.5;">Meni s tremi pikami zgoraj desno → Dodaj na začetni zaslon.</div></div>
     </div>`,
    "Na zaslonu se pojavi ikona Delovit. Odslej žigosaš z enim tapom."),
  end(L1, "Vse najboljše<br>pri delu!", "Tvoje ure so odslej urejene z enim tapom."),
]);

/* ============ 2) VODIČ ZA DELODAJALCA ============ */
const L2 = "VODIČ ZA DELODAJALCA";
const employer = doc([
  cover(L2, "Vodič za delodajalca", `Kako voditi<br><span class="g">evidenco v Delovit.</span>`,
    "Korak za korakom: dodajanje zaposlenih (prek povabila), pregled ur, ročni popravki in izvoz evidence za inšpekcijo. Vse na računalniku, v nekaj minutah."),
  step(L2, 1, "Nadzorna plošča", "Tvoja izhodiščna točka",
    "Ko se prijaviš, te pričaka nadzorna plošča: število zaposlenih, ure tega meseca in stanje računa. S štirimi bližnjicami hitro skočiš na najpogostejša opravila.",
    shot("adm-dashboard.png", "wide"), "Do vseh razdelkov prideš tudi prek menija na vrhu: Domov, Zaposleni, Ure, Mesečni pregled, Odsotnosti."),
  step(L2, 2, "Dodaj zaposlenega", "Odpri razdelek Zaposleni",
    "Odpri Zaposleni in zgoraj desno klikni Dodaj zaposlenega. V seznamu sproti vidiš vse zaposlene, njihova delovna mesta in status.",
    shot("adm-zaposleni.png", "wide"), "Pri vsaki osebi je meni s tremi pikicami: uredi, deaktiviraj (evidenca ostane) ali pošlji povabilo znova."),
  step(L2, 3, "Vnesi podatke zaposlenega", "Samo ime in email, geslo si nastavi sam",
    "Vpiši ime in priimek ter email. Zaposleni na ta email dobi povabilo in si <b>sam nastavi geslo</b>, ti ga ne vnašaš. Ostala polja (delovno mesto, EMŠO, davčna, tedenske ure) so neobvezna.",
    shot("adm-dodaj.png", "wide"), "Dokler se zaposleni prvič ne prijavi, ima oznako „čaka na prijavo“. Če povabilo ne pride, klikni „Pošlji povabilo znova“."),
  step(L2, 4, "Pregled ur", "Spremljaj žige zaposlenih",
    "V razdelku Ure vidiš vse žige, urejene po datumu. Vnos popraviš s klikom na „Uredi“. Če je kdo pozabil žigosati, zgoraj desno klikni Ročni vnos.",
    shot("adm-ure.png", "wide"), "Če aplikacija zapre pozabljen odhod, dobi vnos oranžno oznako „za pregled“, da ga preveriš in vpišeš dejanski čas."),
  step(L2, 5, "Ročni vnos ur", "Vnesi ure za nazaj",
    "Klikni Ročni vnos, izberi zaposlenega, datum ter uro prihoda in odhoda (po želji odmor in nadure). Vnos shraniš z gumbom Shrani vnos.",
    shot("adm-rocni.png", "wide"), "Tako evidenca ostane urejena tudi ob pozabljenih žigih."),
  step(L2, 6, "Mesečni pregled", "Seštevki ur po zaposlenih",
    "V Mesečnem pregledu so seštevki ur po zaposlenih za izbrani mesec. Z gumbom Potrdi mesec opraviš mesečni zaključek, z gumboma Excel in PDF pa evidenco izvoziš.",
    shot("adm-pregled.png", "wide"), "Mesec menjaš s puščicama levo in desno nad pregledom."),
  step(L2, 7, "Izvoz za inšpekcijo", "Dokument, pripravljen za inšpektorja",
    "Z gumbom PDF dobiš urejen dokument za vsakega zaposlenega: vsa zakonska polja po ZEPDSV, datume, ure, odmor in mesto za podpis delavca in odgovorne osebe. Excel da isto v preglednici.",
    shot("adm-izpis.png", "wide"), "PDF je pripravljen tako, da ga ob inšpekciji le natisneš ali pokažeš na zaslonu."),
  step(L2, 8, "Naročnina", "Upravljaj svoj paket",
    "V razdelku Naročnina izbereš mesečno ali letno plačilo, posodobiš kartico ali kadarkoli odpoveš. Prvih 14 dni je brezplačnih, brez kartice.",
    shot("adm-narocnina.png", "wide"), "Več kot 10 zaposlenih? Na strani Naročnina pošlješ povpraševanje za večji paket."),
  end(L2, "Pripravljeno.", "Tvoja evidenca je odslej urejena in pripravljena za inšpekcijo.", "Vprašanja? Pišite nam na <b>info@delovit.si</b>"),
]);

/* ============ 3) PRODAJNA PREZENTACIJA ============ */
const L3 = "ZA GOSTINSKE LOKALE";
const deck = doc([
  page(L3, `<div class="step" style="display:flex;flex-direction:column;justify-content:center;flex:1;">
      <img class="logo" src="${logo}" style="width:84px;height:84px;margin-bottom:22px;">
      <div class="chip"><span class="dot"></span>Za gostinske lokale</div>
      <h1 style="font-size:50px;line-height:1.05;font-weight:800;letter-spacing:-.03em;margin:20px 0 16px;">Evidenca delovnega<br>časa, <span style="color:#2563eb;">brez panike.</span></h1>
      <p style="font-size:17px;line-height:1.6;color:#475569;max-width:78%;">Vaši natakarji in kuharji žigosajo prihod in odhod z mobitelom. Vi imate vedno urejeno evidenco, pripravljeno za inšpekcijo.</p>
      <div style="display:flex;gap:12px;margin-top:24px;">
        <div class="chip"><span class="dot"></span>Skladno z ZEPDSV</div>
        <div class="chip"><span class="dot"></span>Postavljeno v 5 minutah</div></div></div>`),
  page(L3, `<div class="step"><div class="num"><span>Zakaj zdaj</span></div>
      <h2>Od 2023 morate voditi evidenco delovnega časa za vsakega zaposlenega.</h2>
      <div class="sub">Zakon ZEPDSV (z novelo ZEPDSV-B, april 2025) zahteva dnevno evidenco ur. Inšpektorat za delo (IRSD) jo lahko preveri nenajavljeno. Brez ustrezne evidence sledi globa.</div>
      <div class="stats">
        <div class="stat"><div class="big">1.145</div><div class="cap">kršitev evidenc, ki jih je IRSD zabeležil v 2024</div></div>
        <div class="stat"><div class="big">do 8.000 €</div><div class="cap">globe za mikro podjetja</div></div>
        <div class="stat"><div class="big">Tudi<br>študenti</div><div class="cap">obveznost velja tudi za delo prek napotnice</div></div></div>
      <div class="warn">⚠️ &nbsp;Papir in Excel se izgubita in ju je ob inšpekciji težko dokazati; sezonska in študentska delovna sila to še oteži.</div></div>`),
  page(L3, `<div class="step"><div class="num"><span>Rešitev</span></div>
      <h2>Delovit: evidenca, ki jo uredite v petih minutah.</h2>
      <div class="sub">Brez namestitev, brez izobraževanja, brez vezave. Narejeno za male lokale, ne za korporacije.</div>
      <div class="grid">
        <div class="feat"><div class="ic">📱</div><h3>Žigosanje z mobitelom</h3><p>En velik gumb za prihod in odhod, brez aplikacije iz trgovine.</p></div>
        <div class="feat"><div class="ic">🏷️</div><h3>Fiksna cena na podjetje</h3><p>En znesek za celo ekipo, ne na osebo.</p></div>
        <div class="feat"><div class="ic">🔔</div><h3>Opozori, preden inšpektor</h3><p>Če kdo pozabi žigosati odhod, aplikacija opomni delavca in obvesti vas.</p></div>
        <div class="feat"><div class="ic">👤</div><h3>Zaposleni vidi svoje ure</h3><p>Vsak ima svoj pregled ur, teden in mesec, brez spraševanja.</p></div>
        <div class="feat"><div class="ic">⏱️</div><h3>Postavljeno v 5 minutah</h3><p>Ustvarite podjetje, dodate ekipo in začnete, brez onboardinga.</p></div>
        <div class="feat"><div class="ic">📄</div><h3>Izvoz za inšpekcijo</h3><p>Mesečna evidenca v PDF ali Excel z vsemi polji po ZEPDSV.</p></div>
      </div></div>`),
  page(L3, `<div class="step"><div class="num"><span>Kako deluje</span></div>
      <h2>Tako izgleda v praksi.</h2>
      <div class="two">
        <div class="col">${shot("emp-prihod.png")}<div class="cap"><b>Zaposleni:</b> en tap za prihod in odhod.</div></div>
        <div class="col">${shot("adm-pregled.png","wide")}<div class="cap"><b>Vi:</b> vse ure na enem mestu, s seštevki in mesečno potrditvijo.</div></div>
      </div></div>`),
  page(L3, `<div class="step"><div class="num"><span>Pripravljeno za inšpekcijo</span></div>
      <h2>Evidenca, ki ji inšpektor ne more očitati.</h2>
      <div class="sub">Z enim klikom dobite urejen dokument z vsemi polji po ZEPDSV, datumi, urami, odmori in mestom za podpis.</div>
      ${shot("adm-izpis.png","wide")}
      <div class="checks" style="margin-top:18px;">
        <div class="check"><span class="d"></span>Vsa zakonska polja ZEPDSV</div>
        <div class="check"><span class="d"></span>Izvoz v PDF in Excel</div>
        <div class="check"><span class="d"></span>Podatki shranjeni v EU, skladno z GDPR</div></div></div>`),
  end(L3, "Preizkusite<br><span style='color:#2563eb;'>brezplačno.</span>", "Ustvarite račun, dodajte ekipo in v petih minutah žigosajte prvi prihod. Brez vezave, prekličete kadarkoli. 14 dni brezplačno, brez kartice.", "delovit.si &nbsp;·&nbsp; <b>info@delovit.si</b>"),
]);

/* ============ RENDER ============ */
const docs = [
  ["Delovit-vodic-zaposleni", employee],
  ["Delovit-vodic-delodajalec", employer],
  ["Delovit-prezentacija", deck],
];
const b = await chromium.launch({ executablePath: EXE, headless: true });
for (const [name, html] of docs) {
  const htmlPath = join(DIR, `_${name}.html`);
  writeFileSync(htmlPath, html);
  const page = await b.newPage();
  await page.goto("file://" + htmlPath, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.pdf({ path: join(DIR, "out", `${name}.pdf`), format: "A4", printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 } });
  await page.close();
  console.log("PDF →", name);
}
await b.close();
console.log("DONE");
