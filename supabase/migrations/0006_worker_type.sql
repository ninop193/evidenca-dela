-- =============================================================================
-- 0006: Vrsta dela zaposlenega (zaposlen / študent)
-- =============================================================================
-- Omogoča ločevanje rednih zaposlenih od dijakov/študentov (napotnica).
-- Privzeto 'zaposlen' (obstoječi zapisi se ne spremenijo vsebinsko).

alter table public.employees
  add column if not exists worker_type text not null default 'zaposlen'
  check (worker_type in ('zaposlen', 'student'));
