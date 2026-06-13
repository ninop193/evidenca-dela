-- =============================================================================
-- Leads — zajem emailov s kalkulatorja (Nina marketing, ni vezano na podjetja).
-- =============================================================================

create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  source     text,            -- npr. 'kalkulator'
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_created on public.leads(created_at);

-- RLS vklopljen brez politik za authenticated/anon → dostop ima samo service_role
-- (vstavljanje gre prek strežniškega dejanja s service-role ključem).
alter table public.leads enable row level security;

grant all on public.leads to service_role;
