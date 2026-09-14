-- =============================================================================
-- 0011: Win-back mail po izteku preizkusa (pošlje se samo enkrat na podjetje)
-- =============================================================================

alter table public.companies
  add column if not exists winback_email_sent_at timestamptz;
