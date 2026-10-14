-- =============================================================================
-- 0015: Žigosanje na skupni tablici (neobvezna možnost, privzeto IZKLOPLJENA)
-- =============================================================================
-- Podjetje lahko vklopi skupno napravo (tablico) na delovnem mestu: zaposleni
-- izbere svoje ime, vpiše 4-mestno PIN kodo in žigosa prihod/odhod — brez
-- lastnega uporabniškega računa.
--
-- Nove tabele (kiosk_*) so dostopne SAMO strežniku (service role): RLS je vklopljen
-- in nima nobene politike, zato jih brskalnik (admin ali zaposleni) ne more brati
-- ne pisati. PIN kode sodelavcev tako nikoli ne pridejo do zaposlenih.
-- Preizkus: node scripts/rls-test.mjs
-- =============================================================================

-- 1) Stikalo na podjetju (piše ga samo strežnik — companies_update ne obstaja več, 0012).
alter table public.companies
  add column if not exists kiosk_enabled boolean not null default false;

-- 2) Vir vnosa: 'tablica' = žigosano na skupni tablici (null = telefon/ročni vnos).
alter table public.time_entries
  add column if not exists source text;

-- 3) Povezane tablice. Piškotek na napravi hrani naključen žeton, baza samo njegov hash.
create table if not exists public.kiosk_devices (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  token_hash    text not null unique,
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz,
  revoked_at    timestamptz
);
create index if not exists idx_kiosk_devices_company on public.kiosk_devices(company_id);

-- 4) PIN kode zaposlenih (delodajalec jih vidi v aplikaciji, da jih lahko pove zaposlenim).
create table if not exists public.kiosk_pins (
  employee_id  uuid primary key references public.employees(id) on delete cascade,
  company_id   uuid not null references public.companies(id) on delete cascade,
  pin          text not null check (pin ~ '^[0-9]{4}$'),
  created_at   timestamptz not null default now(),
  unique (company_id, pin)
);

-- 5) Enkratne kode za povezavo nove tablice (veljajo 10 minut).
create table if not exists public.kiosk_pair_codes (
  company_id  uuid primary key references public.companies(id) on delete cascade,
  code_hash   text not null unique,
  expires_at  timestamptz not null
);

alter table public.kiosk_devices    enable row level security;
alter table public.kiosk_pins       enable row level security;
alter table public.kiosk_pair_codes enable row level security;
