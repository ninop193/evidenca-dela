-- =============================================================================
-- 0013: Opomnik "dodajte prvega zaposlenega" (pošlje se samo enkrat na podjetje)
-- =============================================================================

alter table public.companies
  add column if not exists activation_nudge_sent_at timestamptz;
