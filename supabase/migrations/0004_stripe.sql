-- =============================================================================
-- 0004: Stripe naročninska polja na podjetju
-- =============================================================================

alter table public.companies
  add column if not exists stripe_customer_id     text,
  add column if not exists stripe_subscription_id text,
  add column if not exists current_period_end     timestamptz,
  add column if not exists cancel_at_period_end    boolean not null default false;

create index if not exists idx_companies_stripe_customer on public.companies(stripe_customer_id);
create index if not exists idx_companies_stripe_sub on public.companies(stripe_subscription_id);
