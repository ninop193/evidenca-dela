-- =============================================================================
-- Evidenca delovnega časa — začetna shema baze
-- Skladno z ZEPDSV (13. in 18. člen), konsolidirano po noveli ZEPDSV-B
-- (velja od 23. 4. 2025). Potrjeno s strani Nina proti besedilu zakona.
--
-- Dve ločeni evidenci:
--   * employees       = evidenca o zaposlenih (13. člen)
--   * time_entries +  = evidenca o izrabi delovnega časa (18. člen)
--     absences
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) TABELE
-- -----------------------------------------------------------------------------

-- Podjetja (tenant — vsaka stranka je svoje podjetje)
create table if not exists public.companies (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  tax_id              text,                              -- davčna številka podjetja
  subscription_status text not null default 'trialing',  -- 'active' | 'trialing' | 'inactive'
  created_at          timestamptz not null default now()
);

-- Prijavljeni uporabniki aplikacije (povezani s Supabase Auth)
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  company_id  uuid not null references public.companies(id) on delete cascade,
  role        text not null default 'employee' check (role in ('admin','employee')),
  email       text,
  full_name   text,
  created_at  timestamptz not null default now()
);

-- Evidenca o zaposlenih — 13. člen ZEPDSV
create table if not exists public.employees (
  id                     uuid primary key default gen_random_uuid(),
  company_id             uuid not null references public.companies(id) on delete cascade,
  user_id                uuid references public.users(id) on delete set null, -- null dokler se ne prijavi
  full_name              text not null,                 -- ime in priimek
  emso                   text,                          -- EMŠO (13. člen — obvezno)
  tax_id                 text,                          -- davčna številka (13. člen — obvezno)
  job_title              text,                          -- naziv delovnega mesta
  weekly_hours           numeric,                       -- tedenski (polni/dogovorjeni) delovni čas
  contract_signed_date   date,                          -- datum sklenitve pogodbe o zaposlitvi
  employment_start_date  date,                          -- datum nastopa dela
  employment_end_date    date,                          -- datum prenehanja pogodbe (null = aktiven)
  is_management          boolean not null default false,-- poslovodna oseba → evidenca izrabe se NE vodi
  active                 boolean not null default true, -- soft-flag (trajna hramba: ne brišemo)
  created_at             timestamptz not null default now()
);

-- Evidenca o izrabi delovnega časa — 18. člen ZEPDSV (dnevno na delavca)
create table if not exists public.time_entries (
  id                          uuid primary key default gen_random_uuid(),
  company_id                  uuid not null references public.companies(id) on delete cascade, -- za RLS
  employee_id                 uuid not null references public.employees(id) on delete cascade,
  date                        date not null,                      -- datum
  clock_in                    timestamptz,                        -- čas prihoda na delo (tč.8)
  clock_out                   timestamptz,                        -- čas odhoda z dela (tč.8)
  hours_count                 numeric,                            -- število ur (tč.1)
  total_worked_hours          numeric,                            -- skupno opravljene ure (tč.2)
  work_time_type              text not null default 'polni'
                                 check (work_time_type in ('polni','krajsi')), -- vrsta del. časa (tč.2)
  overtime_hours              numeric not null default 0,         -- ure nadurnega dela (tč.3)
  -- tč. 9 (posebni pogoji iz razporeditve — lahko vodeno mesečno):
  night_hours                 numeric not null default 0,         -- nočne ure
  sunday_hours                numeric not null default 0,         -- nedeljske ure
  holiday_hours               numeric not null default 0,         -- praznične / dela proste ure
  shift_split_hours           numeric not null default 0,         -- izmensko / deljeno (po potrebi)
  -- tč. 10:
  unevenly_distributed_hours  numeric not null default 0,         -- neenakomerno prerazporejen del. čas
  -- tč. 7 (običajno 0/NULL, a polje mora obstajati):
  pension_benefit_hours       numeric default 0,                  -- ure: zavarovalna doba s povečanjem
  pension_benefit_status      text,                               -- oznaka vrste statusa
  -- tč. 11 (tekoči seštevek — lahko vodeno mesečno):
  running_total_hours         numeric,                            -- tekoči seštevek ur (teden/mesec/leto)
  reference_period            text,                               -- referenčno obdobje
  notes                       text,
  confirmed                   boolean not null default false,     -- mesečni zaključek (potrdil delodajalec)
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- Odsotnosti — neopravljene ure (18. člen, tč. 4/5/6) — vodene v URAH
create table if not exists public.absences (
  id                     uuid primary key default gen_random_uuid(),
  company_id             uuid not null references public.companies(id) on delete cascade, -- za RLS
  employee_id            uuid not null references public.employees(id) on delete cascade,
  date_from              date not null,                  -- obdobje od
  date_to                date not null,                  -- obdobje do
  unworked_hours         numeric not null,               -- neopravljene ure (skupaj za obdobje)
  -- kategorija nadomestila — OBVEZNO (18. člen, tč. 4/5/6):
  compensation_category  text not null check (compensation_category in (
                            'nadomestilo_iz_sredstev_delodajalca', -- tč.4
                            'nadomestilo_v_breme_drugih',          -- tč.5
                            'brez_nadomestila'                     -- tč.6
                          )),
  -- oznaka vrste nadomestila (konkretni razlog v breme katerega vira):
  compensation_type      text not null check (compensation_type in (
                            'letni_dopust',
                            'bolniska_do_30',     -- bolniška ≤30 dni (breme delodajalca)
                            'bolniska_zzzs',      -- bolniška v breme ZZZS
                            'starsevsko',         -- starševski dopust / nega
                            'izredni_dopust',
                            'drugo'
                          )),
  reason                 text,                           -- opcijsko prosto besedilo
  notes                  text,
  created_at             timestamptz not null default now()
);

-- Stripe naročnine (Faza 3)
create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  company_id             uuid not null references public.companies(id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  status                 text,            -- 'active' | 'trialing' | 'past_due' | 'canceled'
  current_period_end     timestamptz,
  price_eur              numeric,         -- shranjeno za historiko
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Indeksi za hitrost poizvedb
create index if not exists idx_users_company        on public.users(company_id);
create index if not exists idx_employees_company    on public.employees(company_id);
create index if not exists idx_employees_user       on public.employees(user_id);
create index if not exists idx_time_entries_company on public.time_entries(company_id);
create index if not exists idx_time_entries_emp     on public.time_entries(employee_id);
create index if not exists idx_time_entries_date    on public.time_entries(employee_id, date);
create index if not exists idx_absences_company     on public.absences(company_id);
create index if not exists idx_absences_emp         on public.absences(employee_id);
create index if not exists idx_subscriptions_company on public.subscriptions(company_id);

-- -----------------------------------------------------------------------------
-- 2) POMOŽNE FUNKCIJE (SECURITY DEFINER — obidejo RLS, da preprečimo rekurzijo)
--    Vrnejo podatke o trenutno prijavljenem uporabniku.
-- -----------------------------------------------------------------------------

create or replace function public.current_company_id()
returns uuid language sql stable security definer set search_path = public as $$
  select company_id from public.users where id = auth.uid()
$$;

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.current_employee_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.employees where user_id = auth.uid()
$$;

-- Registracija podjetja + admina v eni transakciji (kliče prijavljen uporabnik takoj po sign-up).
create or replace function public.create_company_and_admin(
  p_company_name text,
  p_full_name    text,
  p_tax_id       text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_company_id uuid;
  v_uid        uuid := auth.uid();
  v_email      text;
begin
  if v_uid is null then
    raise exception 'Ni prijavljenega uporabnika';
  end if;
  if exists (select 1 from public.users where id = v_uid) then
    raise exception 'Uporabnik je že registriran';
  end if;

  select email into v_email from auth.users where id = v_uid;

  insert into public.companies (name, tax_id)
  values (p_company_name, p_tax_id)
  returning id into v_company_id;

  insert into public.users (id, company_id, role, email, full_name)
  values (v_uid, v_company_id, 'admin', v_email, p_full_name);

  return v_company_id;
end;
$$;

-- Trigger za samodejno osveževanje updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_time_entries_updated on public.time_entries;
create trigger trg_time_entries_updated before update on public.time_entries
  for each row execute function public.set_updated_at();

drop trigger if exists trg_subscriptions_updated on public.subscriptions;
create trigger trg_subscriptions_updated before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3) ROW LEVEL SECURITY (varnostni ključ — izolacija med podjetji + vloge)
-- -----------------------------------------------------------------------------

-- companies
alter table public.companies enable row level security;

create policy "companies_select" on public.companies
  for select to authenticated
  using (id = public.current_company_id());

create policy "companies_update" on public.companies
  for update to authenticated
  using (id = public.current_company_id() and public.current_user_role() = 'admin')
  with check (id = public.current_company_id() and public.current_user_role() = 'admin');

-- users (vstavljanje gre prek SECURITY DEFINER funkcij / service role)
alter table public.users enable row level security;

create policy "users_select" on public.users
  for select to authenticated
  using (
    id = auth.uid()
    or (company_id = public.current_company_id() and public.current_user_role() = 'admin')
  );

-- employees
alter table public.employees enable row level security;

create policy "employees_select" on public.employees
  for select to authenticated
  using (
    company_id = public.current_company_id()
    and (public.current_user_role() = 'admin' or user_id = auth.uid())
  );

create policy "employees_admin_insert" on public.employees
  for insert to authenticated
  with check (company_id = public.current_company_id() and public.current_user_role() = 'admin');

create policy "employees_admin_update" on public.employees
  for update to authenticated
  using (company_id = public.current_company_id() and public.current_user_role() = 'admin')
  with check (company_id = public.current_company_id() and public.current_user_role() = 'admin');

create policy "employees_admin_delete" on public.employees
  for delete to authenticated
  using (company_id = public.current_company_id() and public.current_user_role() = 'admin');

-- time_entries
alter table public.time_entries enable row level security;

create policy "time_entries_select" on public.time_entries
  for select to authenticated
  using (
    company_id = public.current_company_id()
    and (public.current_user_role() = 'admin' or employee_id = public.current_employee_id())
  );

create policy "time_entries_insert" on public.time_entries
  for insert to authenticated
  with check (
    company_id = public.current_company_id()
    and (public.current_user_role() = 'admin' or employee_id = public.current_employee_id())
  );

create policy "time_entries_update" on public.time_entries
  for update to authenticated
  using (
    company_id = public.current_company_id()
    and (
      public.current_user_role() = 'admin'
      or (employee_id = public.current_employee_id() and confirmed = false)
    )
  )
  with check (
    company_id = public.current_company_id()
    and (
      public.current_user_role() = 'admin'
      or (employee_id = public.current_employee_id() and confirmed = false)
    )
  );

create policy "time_entries_delete" on public.time_entries
  for delete to authenticated
  using (company_id = public.current_company_id() and public.current_user_role() = 'admin');

-- absences (zaposleni vidi svoje; piše samo admin)
alter table public.absences enable row level security;

create policy "absences_select" on public.absences
  for select to authenticated
  using (
    company_id = public.current_company_id()
    and (public.current_user_role() = 'admin' or employee_id = public.current_employee_id())
  );

create policy "absences_admin_insert" on public.absences
  for insert to authenticated
  with check (company_id = public.current_company_id() and public.current_user_role() = 'admin');

create policy "absences_admin_update" on public.absences
  for update to authenticated
  using (company_id = public.current_company_id() and public.current_user_role() = 'admin')
  with check (company_id = public.current_company_id() and public.current_user_role() = 'admin');

create policy "absences_admin_delete" on public.absences
  for delete to authenticated
  using (company_id = public.current_company_id() and public.current_user_role() = 'admin');

-- subscriptions (bere samo admin; piše Stripe webhook prek service role)
alter table public.subscriptions enable row level security;

create policy "subscriptions_select_admin" on public.subscriptions
  for select to authenticated
  using (company_id = public.current_company_id() and public.current_user_role() = 'admin');

-- -----------------------------------------------------------------------------
-- 4) PRAVICE (RLS ostaja glavni filter; service_role obide RLS za webhooke)
-- -----------------------------------------------------------------------------
grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant execute on all functions in schema public to authenticated, service_role;
