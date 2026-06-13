# Build brief: Evidenca delovnega časa SaaS

**Ti si Claude Code. Ta dokument je tvoje navodilo za celoten projekt.**
Beri ga ob vsakem novem pogovoru. Vsaka odločitev mora biti skladna s tem briefom.

---

## 1. Kaj gradimo in zakaj

Gradimo **SaaS aplikacijo za evidenco delovnega časa** za slovenska mikro podjetja (1-5 zaposlenih) in s.p. z zaposlenimi.

### Zakaj obstaja trg

Od leta 2023 velja zakon **ZEPDSV** (Zakon o evidencah na področju dela in socialne varnosti), nadgrajen z novelo **ZEPDSV-B** (april 2025). Vsak delodajalec mora voditi evidenco delovnega časa za vsakega zaposlenega. **IRSD (Inšpektorat RS za delo) je v letu 2024 zabeležil 1.145 kršitev** evidenc. Globe za mikro podjetja znašajo **€300-€8.000**.

Strah pred inšpekcijo je primarni nakupni motiv. Stranka ne kupuje aplikacije - kupuje zaščito pred globo.

### Naše pozicioniranje (to je naša edina diferenciacija - ne smeš je nikoli pozabiti)

- **Flat-rate cena** - en fiksni znesek na podjetje na mesec, ne per-user. S.p. z 2 zaposlenima in podjetje s 5 zaposlenima plačata enako. Nihče od konkurentov tega eksplicitno ne ponuja.
- **Mobile-first** - zaposleni žigosa prihod/odhod z mobitelom, kot da pritisne gumb.
- **Brez onboardinga** - registracija in prvi clock-in v manj kot 5 minutah, brez klicev, brez navodil.
- **Testni cenovni točki: €7/mes ali €15/mes** (Nino bo testiral z landing page A/B). Cena mora biti spremenljiva v env spremenljivki ali config datoteki - ne hardcodirana.

### Zakaj konkurenti ne zasedajo te pozicije

| Konkurent | Cena | Problem |
|-----------|------|---------|
| All Hours / Spica | ~€3,50/user/mes | Enterprise, kompleksen onboarding, drag za 2 zaposlena |
| EasyHours | €5,20/user/mes | Per-user, drago za vsako dodano osebo |
| KADRIS | €1,70/user/mes | Cilja 20-150 zaposlenih, over-kill za mikro |
| MojeUre.si | Brez javnih cen | Feature-heavy, mid-market, prek računovodij |

**Pozicija, ki jo zapolnjujemo:** "Za s.p. z 2 zaposlenima plačaš €7 flat, takoj, brez onboardinga."

---

## 2. Tech stack - kaj je kaj (razloženo po domače)

### Pregled arhitekture

```
[Ninov telefon / računalnik]
        ↓
[Next.js aplikacija na Vercel] ← koda tukaj
        ↓
[Supabase] ← baza podatkov + prijava
        ↓
[Stripe] ← plačila in naročnine
```

### Vsak del po domače

**Next.js (App Router)** - To je "aplikacija sama". Vse kar vidiš na zaslonu (gumbi, obrazci, pregledi ur) je Next.js. Teče na Vercelu. Nino ne rabi vedeti kako deluje - ti gradiš, on vidi rezultat.

**Supabase** - To je "skladišče" za vse podatke. Tukaj so shranjeni vsi zaposleni, vse ure, vsa podjetja. Ima tudi vgrajen sistem za prijavo (email + geslo). Nino bo na supabase.com ustvaril brezplačen projekt in ti dal "connection string" - to je vse kar rabiš od njega.

**Row Level Security (RLS)** - To je "varnostni ključ" v Supabaseu. Zagotavlja, da podjetje A nikoli ne vidi podatkov podjetja B, čeprav so v isti bazi. **To mora biti vklopljeno od prvega dne.** Brez tega je aplikacija neuporabna za produkcijo.

**Stripe** - To je "blagajna". Skrbi za mesečne naročnine, kreditne kartice, odpovedi. Ko stranka plača, Stripe pošlje webhook (sporočilo) naši aplikaciji in ta odklene funkcije. Nino bo na stripe.com ustvaril račun in ti dal API ključe.

**Vercel** - To je "gostovanje". Sem naložimo kodo in aplikacija je dostopna na internetu. Brezplačen plan za začetek. Nino bo na vercel.com povezal GitHub repozitorij.

**PWA (Progressive Web App)** - To je "lažna aplikacija". Z dodajanjem manifest.json in ikon v projekt dobijo zaposleni možnost, da si aplikacijo "dodajo na domači zaslon" telefona - in izgleda kot prava aplikacija. Ni App Store, ni Play Store. Samo brskalnik, ki se pretvarja da je app.

### Tech stack odločitve (ne spreminjaj brez razloga)

- **Ne** React Native, **ne** Expo, **ne** Flutter - PWA je dovolj za clock-in.
- **Ne** Prisma ORM - Supabase client direktno, lažje za vzdrževanje.
- **Ne** custom auth - Supabase Auth je dovolj in je GDPR-prijazen.
- **TypeScript** - obvezno, ne JavaScript. Preveč runtime napak brez tipov.
- **Tailwind CSS** - za styling, mobile-first breakpoints.

---

## 3. Uporabniške vloge

### Vloga 1: Delodajalec / Admin

Registrira podjetje, dodaja in upravlja zaposlene, pregleduje/ureja ure, dela mesečni zaključek, exporta evidenco za inšpekcijo, upravlja naročnino prek Stripe.

**Kontekst:** Pretežno **desktop** - gleda preglede, dela popravke, exporta PDF/Excel.

**Dostop:** Vidi vse zaposlene svojega podjetja. Ne vidi ničesar od drugega podjetja.

### Vloga 2: Zaposleni

Žigosa prihod, odhod, odmor (malico), nadure. Vidi samo svoje lastne ure.

**Kontekst:** Pretežno **mobilni** - PWA na telefonu, en gumb za clock-in/out.

**Dostop:** Vidi samo svoje lastne vnose. Ne vidi niti drugih zaposlenih v istem podjetju (razen lastnega pregleda).

---

## 4. Ključne funkcije

### MVP (Faza 1 + 2)

- [ ] Registracija podjetja (delodajalec se registrira, poimenuje podjetje)
- [ ] Dodajanje zaposlenih (email invite ali direktno dodajanje)
- [ ] Clock-in / Clock-out za zaposlenega (en gumb, mobile-first)
- [ ] Ročni vnos ur (delodajalec vnese retroaktivno)
- [ ] Vnos odmora (malica)
- [ ] Vnos nadur
- [ ] Dnevni in mesečni pregled za delodajalca
- [ ] Urejanje vnosov (delodajalec popravi napačen vnos)
- [ ] Zakonsko predpisana polja po ZEPDSV-B (**Glej sekcijo 5 - Compliance**)
- [ ] Multi-tenant izolacija z RLS

### Produkcija (Faza 3 + 4)

- [ ] Export za inšpekcijo: **PDF** + **Excel** v pravilnem formatu
- [ ] Potrjevanje ur s strani delodajalca (mesečni zaključek)
- [ ] Stripe billing: flat-rate mesečna naročnina, webhook za aktivacijo/deaktivacijo
- [ ] Zaklep funkcij za neplačnike (grace period 3 dni po preteku)
- [ ] PWA manifest + ikone (dodaj na domači zaslon)
- [ ] **Bruto-neto kalkulator** (javna, brezplačna stran - SEO magnet, ločen `/kalkulator` route)

### Funkcije, ki jih NE gradimo (za zdaj)

- ❌ Native app (App Store / Play Store)
- ❌ GPS sledenje lokacije
- ❌ Offline mode
- ❌ Izmensko planiranje / urniki
- ❌ Integracij s payroll sistemi
- ❌ Messaging / obvestila med zaposlenimi
- ❌ Medicinski pregledi, potrdila
- ❌ Per-user pricing logika

---

## 5. Compliance - to loči igračko od produkta

> ⚠️ **To je najpomembnejša sekcija. Brez tega je aplikacija pravno neuporabna.**

### Zakaj je compliance kritičen

Stranke bodo to aplikacijo pokazale IRSD inšpektorju. Če evidenca ne vsebuje zakonsko predpisanih polj, je kazen enaka kot da evidence sploh nimajo. **En data breach ali pravno nepravilna evidenca uniči produkt in povzroči direktno škodo strankam.**

### NAVODILO ZA CLAUDE CODE - OBVEZNO

**NIKOLI ne implementiraj zakonsko predpisanih polj brez potrditve.**

Preden finaliziraš podatkovno shemo (tabele `time_entries` in `absences`), Ninu **izrecno povej:**

> "Preden zgradim bazo, potrebujem potrditev: spodnji seznam polj je moj osnutek. Prosim potrdi ga z dejanskim besedilom ZEPDSV-B ali s svojim računovodjo, preden nadaljujemo. Napačna shema pomeni, da evidenca ne bo pravno veljavna."

### Draft checklist obveznih polj (POTRDI Z ZAKONOM / RAČUNOVODJO)

Spodnji seznam je izhodišče - **ni pravno preverjeno:**

**Osnovna evidenca (time_entries):**
- [ ] Datum
- [ ] Ura prihoda na delo
- [ ] Ura odhoda z dela
- [ ] Skupno število opravljenih ur (redne ure)
- [ ] Število ur nadurnega dela
- [ ] Število ur nočnega dela
- [ ] Število ur dela ob nedeljah
- [ ] Število ur dela ob državnih/verskih praznikih

**Odsotnosti (absences):**
- [ ] Vrsta odsotnosti (dopust, bolniška odsotnost, drugo)
- [ ] Razlog odsotnosti
- [ ] Obdobje odsotnosti (datum od - do)
- [ ] Plačane / neplačane ure odsotnosti

**Identifikacijski podatki:**
- [ ] Ime in priimek zaposlenega
- [ ] EMŠO ali davčna številka (preveriti - morda ni obvezno v evidenci, samo v pogodbi)
- [ ] Naziv delovnega mesta

> ⚠️ **Ta seznam je osnutek. Preden gradimo bazo, Nino potrdi z ZEPDSV-B ali računovodjo.**

### GDPR + varnost

- Hranimo osebne podatke zaposlenih (ime, ure, odsotnosti). To so osebni podatki po GDPR.
- **RLS mora biti aktiven od prvega commita.** Brez RLS je aplikacija GDPR neskladna.
- Supabase hrani podatke v EU regiji (Frankfurt) - to je ustrezno za slovensko pravo.
- Nino bo potreboval preprosto **Politiko zasebnosti** in **Obvestilo za obdelavo podatkov** - to ni del kode, ampak pravni dokument.

### Zanesljivost

- Downtime = stranka ne more izpolniti zakonske obveze.
- Supabase ima vgrajene dnevne backupe (free plan: 7 dni, Pro: 30 dni).
- Vercel ima 99.99% uptime SLA na Pro planu (free je dovolj za start, a ga opozori).

---

## 6. Podatkovni model - skica za nadgradnjo

> To je izhodišče. Preden ustvariš tabele v Supabaseu, se prepričaj, da polja ustrezajo potrjenim ZEPDSV-B zahtevam (Sekcija 5).

### Tabele

```sql
-- Podjetja (tenant)
companies (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  tax_id text,                    -- davčna številka podjetja
  created_at timestamptz,
  subscription_status text        -- 'active' | 'trialing' | 'inactive'
)

-- Uporabniki (prijavljeni v aplikacijo)
users (
  id uuid PRIMARY KEY,            -- Supabase Auth UID
  company_id uuid REFERENCES companies(id),
  role text NOT NULL,             -- 'admin' | 'employee'
  email text,
  full_name text,
  created_at timestamptz
)

-- Zaposleni (profil zaposlenega)
employees (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies(id),
  user_id uuid REFERENCES users(id),  -- null dokler se ne registrira
  full_name text NOT NULL,
  job_title text,
  tax_id text,                    -- PREVERITI: ali ZEPDSV-B zahteva EMŠO/davčno v evidenci
  active boolean DEFAULT true,
  created_at timestamptz
)

-- Vnosi delovnega časa
time_entries (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies(id),  -- za RLS
  employee_id uuid REFERENCES employees(id),
  date date NOT NULL,
  clock_in timestamptz,
  clock_out timestamptz,
  break_minutes int DEFAULT 0,    -- odmor v minutah
  regular_hours numeric,          -- izračunano
  overtime_hours numeric DEFAULT 0,
  night_hours numeric DEFAULT 0,
  sunday_hours numeric DEFAULT 0,
  holiday_hours numeric DEFAULT 0,
  notes text,
  confirmed boolean DEFAULT false, -- ali je delodajalec potrdil
  created_at timestamptz,
  updated_at timestamptz
)

-- Odsotnosti
absences (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies(id),  -- za RLS
  employee_id uuid REFERENCES employees(id),
  type text NOT NULL,             -- 'vacation' | 'sick_leave' | 'other'
  reason text,
  date_from date NOT NULL,
  date_to date NOT NULL,
  hours_per_day numeric,
  paid boolean DEFAULT true,
  notes text,
  created_at timestamptz
)

-- Stripe naročnine
subscriptions (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,                    -- 'active' | 'trialing' | 'past_due' | 'canceled'
  current_period_end timestamptz,
  price_eur numeric,              -- shranjeno za historiko
  created_at timestamptz,
  updated_at timestamptz
)
```

### RLS politike (obvezne - implementiraj za vsako tabelo)

Osnovno pravilo za vsako tabelo, ki vsebuje `company_id`:

```sql
-- Primer za time_entries (ponovi za vsako tabelo)
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_isolation" ON time_entries
  USING (
    company_id = (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );
```

Zaposleni vidijo samo svoje vnose:

```sql
CREATE POLICY "employee_own_entries" ON time_entries
  FOR SELECT USING (
    employee_id = (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
    OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );
```

---

## 7. Build faze in timeline

### Realen timeline za vibe coding z Claude Code

- **MVP (Faza 1 + 2):** 2-4 tedne
- **Production-ready (Faza 3 + 4):** skupaj 6-8 tednov od začetka

---

### Sprint 1 / Teden 1 - Kaj zgraditi najprej

To je vrstni red za prvi teden. Ne začni z billingom, ne začni s PWA. Začni tukaj:

1. **Inicializiraj Next.js projekt** (App Router, TypeScript, Tailwind CSS)
2. **Poveži Supabase** - Nino ustvari projekt na supabase.com, ti dobiš `SUPABASE_URL` in `SUPABASE_ANON_KEY`
3. **Ustvari tabele** v Supabaseu (companies, users) - **najprej potrdi ZEPDSV-B polja**
4. **Implementiraj auth** - Supabase Auth, email + geslo, registracija podjetja
5. **Vlogi (admin / employee)** - shrani v `users.role`, zaščiti route-e
6. **Dodajanje zaposlenega** - admin doda zaposlenega (ime, email)
7. **Clock-in / Clock-out UI** - en gumb na mobilni strani, shrani `time_entries`
8. **RLS** - aktiviraj za vse tabele, testiraj izolacijo
9. **Deploy na Vercel** - Nino poveže GitHub, aplikacija je živa na internetu

**Cilj Sprint 1:** Zaposleni se lahko prijavi in žigosa prihod/odhod. Delodajalec vidi vnose. Nino vidi živečo aplikacijo.

---

### Faza 1 - MVP core (teden 1-2)

- [ ] Next.js setup + Supabase + auth
- [ ] Registracija podjetja + vlogi
- [ ] Dodajanje zaposlenih
- [ ] Clock-in / Clock-out (mobile UI)
- [ ] Ročni vnos ur
- [ ] Odmor (malica) + nadure
- [ ] RLS za vse tabele
- [ ] Vercel deploy (čim prej - Nino mora videti živo verzijo)

### Faza 2 - Pregled in compliance (teden 2-3)

- [ ] Dnevni in mesečni pregled za admina
- [ ] Urejanje vnosov (popravki)
- [ ] Potrjevanje ur (mesečni zaključek)
- [ ] Vsa zakonska polja po ZEPDSV-B (potrjena s strani Nina)
- [ ] Vnos odsotnosti (dopust, bolniška)

### Faza 3 - Billing + PWA + Export (teden 3-5)

- [ ] Stripe naročnina (flat-rate, mesečna)
- [ ] Stripe webhook → aktivacija/deaktivacija dostopa
- [ ] Zaklep funkcij za neplačnike (grace period 3 dni)
- [ ] Export PDF (evidenca za inšpekcijo)
- [ ] Export Excel (.xlsx)
- [ ] PWA manifest + ikone (dodaj na domači zaslon)
- [ ] Pricing spremenljivka v `.env` (€7 ali €15 - A/B test)

### Faza 4 - SEO kalkulator (teden 6-8)

- [ ] Javna stran `/kalkulator` (bruto-neto kalkulator za plače)
- [ ] Brezplačna, brez prijave
- [ ] Email capture ("Dobite brezplačen izračun + mesec preizkusa")
- [ ] SEO optimizacija: meta title, description, structured data
- [ ] CTA na landing page (upsell na SaaS)

> **Zakaj kalkulator:** Bruto-neto kalkulator ima ~30.000 iskanj/mes v Sloveniji in nizek KD. Javna stran privabi brezplačen organski promet → email capture → upsell na plačljivi produkt.

---

## 8. Working agreement - kako delava skupaj

> **To so pravila za naš pogovor. Drži se jih.**

### Razlagaj po domače

Nino ne razume tehničnih konceptov (RLS, multi-tenant, webhook, App Router, OAuth...). **Preden implementiraš karkoli tehničnega, razloži v eni povedi zakaj to delamo** in kaj se zgodi če tega ne naredimo. Primeri:

- ❌ "Implementiral bom RLS politike na Supabaseu."
- ✅ "Zdaj bom nastavil varnostni ključ (RLS), ki zagotovi, da podjetje A nikoli ne vidi podatkov podjetja B. Brez tega bi vsi videli podatke vseh - to bi nas uništilo."

### Mobile-first, vedno

- Clock-in UI gradi za 375px zaslon (iPhone SE). Gumbi veliki, tekst berljiv.
- Admin pregled gradi za desktop (1280px+).
- Testiraj responsive med gradnjo, ne na koncu.

### Deployaj zgodaj

- Po Sprint 1 deploy na Vercel, da Nino vidi živo verzijo.
- Vsaka faza konča z deployom - ne čakaj na "perfektno" verzijo.

### Korak za korakom

- Ko rabiš od Nina zunanji korak (ustvari Supabase projekt, dodaj Stripe ključ, poveži domeno), ga vodi **klik za klikom**:
  - ✅ "Pojdi na supabase.com → klikni 'New Project' → vnesi ime 'evidenca-dela' → izberi regijo 'Frankfurt (EU Central)' → klikni 'Create project'."
- Ne predpostavljaj, da ve kaj klikniti.

### Fazni povzetki

- Po vsaki fazi napiši kratko: "Kaj smo zgradili" + "Kaj sledi".
- Primer: "Faza 1 zaključena: zaposleni se lahko prijavijo in žigosajo prihod/odhod, admin vidi vnose, vse je živo na Vercel. Sledi Faza 2: pregled ur in compliance polja."

### Nikoli ne ugibaj pravnih polj

- Kadar pride do zakonskih polj (ZEPDSV-B), **vedno označi kot "POTRDI Z ZAKONOM/RAČUNOVODJO"** in ne postavi v produkcijo brez Ninove potrditve.

### Git higiena (razloženo po domače)

- Vsak večji korak = en commit z jasnim sporočilom ("Add employee clock-in UI").
- Ne commitaj `.env` datotek - tam so API ključi (Supabase, Stripe), ki so tajni.
- Priporoči `.gitignore` z `.env.local` od prvega dne.

### Varnost (osnove, brez tehničnega žargona)

- API ključi gredo v `.env.local` - nikoli v kodo.
- RLS je od prvega dne - ne "dodamo kasneje".
- Supabase Auth je dovolj - ne gradimo lastnega login sistema.

---

## 9. Česa ne delamo

| Tema | Zakaj ne |
|------|----------|
| Native app (App Store / Play) | PWA je dovolj; App Store = meseci čakanja, €99/leto Apple Developer |
| Per-user pricing logika | Naša diferenciacija je flat-rate - ne kompromisov |
| GPS sledenje | Overkill za 1-5 ljudi, GDPR kompleksnost |
| Offline mode | Napredna PWA funkcija - leto 2, samo če stranke zahtevajo |
| Izmensko planiranje | To je MojeUre.si - mi smo minimalna evidenca |
| Sporočila med zaposlenimi | WhatsApp že obstaja |
| Integracije (payroll, HR sistemi) | Post-product-market-fit |
| Over-engineering baze | Enostavna shema, ki dela - ne "enterprise-ready" kompleksnost |
| Ugibanje ZEPDSV-B polj | Pravno tveganje - vedno potrdi |

---

## 10. Spremenljivke okolja (.env.local)

Ob inicializaciji projekta ustvari `.env.local` z naslednjimi ključi. Nina poprositi za vrednosti, ko bo ustvaril Supabase/Stripe račune:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=          # Nino dobi na supabase.com → Project Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Nino dobi na supabase.com → Project Settings → API
SUPABASE_SERVICE_ROLE_KEY=         # ZA BACKENDONLY - nikoli ne v NEXT_PUBLIC_

# Stripe
STRIPE_SECRET_KEY=                 # Nino dobi na dashboard.stripe.com → Developers → API keys
STRIPE_WEBHOOK_SECRET=             # Po nastavitvi webhook endpoint-a
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Cena (A/B test - nastavi 7 ali 15)
NEXT_PUBLIC_PRICE_EUR=7            # Spremenljivo - ne hardcodiraj v kodo

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Zamenjaj z domeno ob deployu
```

---

## 11. Definition of Done - MVP

MVP je zaključen ko:

- [ ] Delodajalec se registrira, ustvari podjetje, doda zaposlenega ✅
- [ ] Zaposleni se prijavi, vidi clock-in gumb, žigosa prihod in odhod ✅
- [ ] Delodajalec vidi vnose zaposlenega (dnevni/mesečni pregled) ✅
- [ ] Delodajalec lahko ručno popravi napačen vnos ✅
- [ ] Podatki so izolirani - podjetje A ne vidi podatkov podjetja B (RLS testirano) ✅
- [ ] Aplikacija je živa na Vercel (custom domena ali vercel.app subdomena) ✅
- [ ] Vsa zakonska polja so bila potrjena z ZEPDSV-B ali računovodjo ✅
- [ ] `.env.local` vsebuje vse ključe, nobeden ni hardcodiran v kodi ✅
- [ ] Nino lahko pokaže aplikacijo prijatelju/potencialni stranki ✅

**Kar MVP še ne vsebuje (a je v Fazi 3):** Stripe billing, PDF/Excel export, PWA, kalkulator.

---

## Quickstart za Claude Code

Ko dobiš ta brief, naredi naslednje takoj:

1. Potrdi z Ninom: "Razumel sem brief. Začnemo s Sprint 1. Najprej moraš ustvariti Supabase projekt - te vodim korak za korakom. Preden zgradim bazo, ti dam osnutek ZEPDSV-B polj za potrditev. Ali si pripravljen?"
2. Nato naredi Sprint 1 iz Sekcije 7 - **v tem vrstnem redu, brez preskakanja**.
3. Ko pride do polj za evidenco časa - **ustavi se in zahtevaj potrditev** (Sekcija 5).
