-- =============================================================================
-- 0010 — Dopust (letni dopust): kvota + prošnje zaposlenih
-- =============================================================================
-- Velja SAMO za redno zaposlene (employees.worker_type = 'zaposlen').
-- Za študente/dijake dopust ne pride v poštev — UI ga skrije, server zavrne.
--
-- Zakonska evidenca odsotnosti (tabela absences) ostane NEDOTAKNJENA: prošnje
-- so ločen delovni sloj. Ko delodajalec prošnjo POTRDI, se ustvari zapis v
-- absences (letni dopust, v urah) — od tam se šteje "porabljeno".
-- =============================================================================

-- Letna kvota dopusta v dnevih (nastavi delodajalec pri zaposlenem).
alter table public.employees
  add column if not exists annual_leave_days numeric;

-- Prošnje za dopust (delovni tok napovej → potrdi/zavrni).
create table if not exists public.leave_requests (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references public.companies(id) on delete cascade,
  employee_id    uuid not null references public.employees(id) on delete cascade,
  date_from      date not null,
  date_to        date not null,
  days           numeric not null,                 -- delovni dnevi (brez vikendov/praznikov)
  status         text not null default 'pending'
                   check (status in ('pending','approved','rejected','cancelled')),
  employee_note  text,                             -- opomba zaposlenega ob oddaji
  decision_note  text,                             -- opomba delodajalca ob odločitvi
  decided_by     uuid references public.users(id) on delete set null,
  decided_at     timestamptz,
  absence_id     uuid references public.absences(id) on delete set null, -- zapis ob potrditvi
  created_at     timestamptz not null default now()
);

create index if not exists idx_leave_requests_company on public.leave_requests(company_id);
create index if not exists idx_leave_requests_emp     on public.leave_requests(employee_id);
create index if not exists idx_leave_requests_status  on public.leave_requests(company_id, status);

-- RLS: zaposleni vidi/ustvari SVOJE; admin vidi in ureja vse v podjetju.
alter table public.leave_requests enable row level security;

create policy "leave_requests_select" on public.leave_requests
  for select to authenticated
  using (
    company_id = public.current_company_id()
    and (public.current_user_role() = 'admin' or employee_id = public.current_employee_id())
  );

-- Vstavi: zaposleni SVOJO prošnjo (pending), admin katerokoli.
create policy "leave_requests_insert" on public.leave_requests
  for insert to authenticated
  with check (
    company_id = public.current_company_id()
    and (public.current_user_role() = 'admin' or employee_id = public.current_employee_id())
  );

-- Posodobi: admin (potrdi/zavrni); zaposleni sme le svojo še-čakajočo (preklic).
create policy "leave_requests_update" on public.leave_requests
  for update to authenticated
  using (
    company_id = public.current_company_id()
    and (
      public.current_user_role() = 'admin'
      or (employee_id = public.current_employee_id() and status = 'pending')
    )
  )
  with check (
    company_id = public.current_company_id()
    and (public.current_user_role() = 'admin' or employee_id = public.current_employee_id())
  );

create policy "leave_requests_delete" on public.leave_requests
  for delete to authenticated
  using (company_id = public.current_company_id() and public.current_user_role() = 'admin');
