-- =============================================================================
-- 0005: Zastavica, da se opomnik pred iztekom preizkusa pošlje samo enkrat
-- =============================================================================

alter table public.companies
  add column if not exists trial_reminder_sent_at timestamptz;
