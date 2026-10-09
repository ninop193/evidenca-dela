-- =============================================================================
-- 0014: Povezavo zaposleni ↔ prijavni račun nastavlja samo strežnik
-- =============================================================================
-- Prej je lahko admin iz brskalnika (mimo aplikacije) svojemu zaposlenemu
-- pripel TUJ račun (npr. zaposlenega drugega podjetja). Do tujih podatkov s tem
-- ni prišel, žrtvi pa je pokvaril prijavo (en račun = več zapisov zaposlenega).
-- Aplikacija to povezavo vedno nastavi prek strežnika (dashboard/actions.ts),
-- zato jo uporabnikom neposredno prepovemo.
-- Preizkus: node scripts/rls-test.mjs
-- =============================================================================

-- 1) Uporabnik (brskalnik) ne sme nastaviti ali spremeniti employees.user_id.
--    Strežnik (service role), SQL Editor in samodejno brisanje računov delajo naprej.
create or replace function public.guard_employee_user_link()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') and (
    (tg_op = 'INSERT' and new.user_id is not null)
    or (tg_op = 'UPDATE' and new.user_id is distinct from old.user_id)
  ) then
    raise exception 'Povezavo zaposlenega s prijavnim računom lahko nastavi samo strežnik.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_employees_user_link on public.employees;
create trigger trg_employees_user_link before insert or update on public.employees
  for each row execute function public.guard_employee_user_link();

-- 2) En prijavni račun = največ en zapis zaposlenega (tudi če bi strežnik kdaj zgrešil).
create unique index if not exists idx_employees_user_unique
  on public.employees(user_id) where user_id is not null;
