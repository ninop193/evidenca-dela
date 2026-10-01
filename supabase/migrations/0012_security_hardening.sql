-- =============================================================================
-- 0012: Varnostna utrditev (pregled 1. 10. 2026)
-- =============================================================================
-- POGOJ: najprej mora biti na produkciji deployana koda iz istega commita
-- (zapisi zaposlenih, prošnje za dopust in stripe_customer_id gredo prek strežnika).
--
-- 1) companies: uporabniki podjetja ne smejo več neposredno pisati v vrstico
--    podjetja (prej si je lahko admin sam nastavil subscription_status='active',
--    podaljšal preizkus ali vpisal tuj stripe_customer_id). Piše samo strežnik.
-- 2) time_entries / leave_requests: zaposleni ne piše neposredno (prej je lahko
--    mimo aplikacije prepisal svoje ure ali si sam odobril dopust). Piše strežnik,
--    ki preveri pravila (7 dni nazaj, oznaka "za pregled", status prošnje).
-- 3) Admin sme vnose/odsotnosti/prošnje vezati samo na zaposlene SVOJEGA podjetja.
-- 4) rate_events: tabela za omejevanje pošiljanja mailov (samo service role).
-- 5) leads: tabela iz 0002, ki na produkciji manjka (idempotentno).
-- =============================================================================

-- 1) companies ---------------------------------------------------------------
drop policy if exists "companies_update" on public.companies;

-- 3) pomožna funkcija ---------------------------------------------------------
create or replace function public.employee_in_my_company(p_employee_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.employees
    where id = p_employee_id and company_id = public.current_company_id()
  )
$$;

-- 2+3) time_entries: piše samo admin (za svoje zaposlene) ----------------------
drop policy if exists "time_entries_insert" on public.time_entries;
create policy "time_entries_insert" on public.time_entries
  for insert to authenticated
  with check (
    company_id = public.current_company_id()
    and public.current_user_role() = 'admin'
    and public.employee_in_my_company(employee_id)
  );

drop policy if exists "time_entries_update" on public.time_entries;
create policy "time_entries_update" on public.time_entries
  for update to authenticated
  using (company_id = public.current_company_id() and public.current_user_role() = 'admin')
  with check (
    company_id = public.current_company_id()
    and public.current_user_role() = 'admin'
    and public.employee_in_my_company(employee_id)
  );

-- 3) absences ------------------------------------------------------------------
drop policy if exists "absences_admin_insert" on public.absences;
create policy "absences_admin_insert" on public.absences
  for insert to authenticated
  with check (
    company_id = public.current_company_id()
    and public.current_user_role() = 'admin'
    and public.employee_in_my_company(employee_id)
  );

drop policy if exists "absences_admin_update" on public.absences;
create policy "absences_admin_update" on public.absences
  for update to authenticated
  using (company_id = public.current_company_id() and public.current_user_role() = 'admin')
  with check (
    company_id = public.current_company_id()
    and public.current_user_role() = 'admin'
    and public.employee_in_my_company(employee_id)
  );

-- 2+3) leave_requests: piše samo admin (zaposleni prek strežnika) ---------------
drop policy if exists "leave_requests_insert" on public.leave_requests;
create policy "leave_requests_insert" on public.leave_requests
  for insert to authenticated
  with check (
    company_id = public.current_company_id()
    and public.current_user_role() = 'admin'
    and public.employee_in_my_company(employee_id)
  );

drop policy if exists "leave_requests_update" on public.leave_requests;
create policy "leave_requests_update" on public.leave_requests
  for update to authenticated
  using (company_id = public.current_company_id() and public.current_user_role() = 'admin')
  with check (
    company_id = public.current_company_id()
    and public.current_user_role() = 'admin'
    and public.employee_in_my_company(employee_id)
  );

-- 4) rate_events ---------------------------------------------------------------
create table if not exists public.rate_events (
  id         bigserial primary key,
  key        text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_rate_events_key_time on public.rate_events(key, created_at);
alter table public.rate_events enable row level security;  -- brez politik → samo service role
revoke all on public.rate_events from anon, authenticated;
grant all on public.rate_events to service_role;
grant usage, select on sequence public.rate_events_id_seq to service_role;

-- 5) leads (manjka na produkciji) -----------------------------------------------
create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  source     text,
  created_at timestamptz not null default now()
);
create index if not exists idx_leads_created on public.leads(created_at);
alter table public.leads enable row level security;
revoke all on public.leads from anon, authenticated;
grant all on public.leads to service_role;
