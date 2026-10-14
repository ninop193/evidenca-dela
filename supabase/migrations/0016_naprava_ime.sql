-- =============================================================================
-- 0016: Ime skupne naprave (npr. »Telefon v lokalu«)
-- =============================================================================
-- Delodajalec lahko vsako povezano napravo poimenuje, da jih loči med sabo.
-- Samo doda neobvezen stolpec; obstoječa koda ga ne bere, zato na delovanje
-- aplikacije nima vpliva. Tabela ostane dostopna samo strežniku (RLS brez politik).
-- =============================================================================

alter table public.kiosk_devices
  add column if not exists name text
  check (name is null or char_length(name) between 1 and 40);
