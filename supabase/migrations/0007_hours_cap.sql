-- =============================================================================
-- 0007: Datum rojstva (mladoletne meje) + oznaka "za pregled" na vnosih
-- =============================================================================
-- birth_date: omogoča ločevanje mladoletnih dijakov (<18) → dnevna meja 8 ur
--   (146. in 193. člen ZDR-1). Meja se samodejno ugasne, ko delavec dopolni 18 let.
-- needs_review: vnos, ki ga je sistem samodejno omejil (pozabljen odhod) → mora ga
--   pregledati/potrditi delodajalec ali delavec. NIKOLI se ura ne odreže tiho.

alter table public.employees
  add column if not exists birth_date date;

alter table public.time_entries
  add column if not exists needs_review boolean not null default false;

-- Hiter dostop do vnosov za pregled (badge v pregledu ur).
create index if not exists time_entries_needs_review_idx
  on public.time_entries (company_id) where needs_review;
