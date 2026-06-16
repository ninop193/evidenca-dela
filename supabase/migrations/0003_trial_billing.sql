-- =============================================================================
-- 0003: 14-dnevni brezplačni preizkus (brez kartice) + billing polja
-- =============================================================================

alter table public.companies
  add column if not exists trial_ends_at timestamptz,
  add column if not exists plan text,                 -- npr. 'do10'
  add column if not exists billing_interval text;     -- 'month' | 'year' | null

-- Obstoječim podjetjem (brez trial_ends_at) dodeli 14-dnevni preizkus od zdaj,
-- da ne ostanejo zaklenjeni.
update public.companies
  set trial_ends_at = now() + interval '14 days'
  where trial_ends_at is null;

-- Registracija (Google onboarding) naj nastavi 14-dnevni preizkus.
create or replace function public.create_company_and_admin(
  p_company_name text,
  p_full_name    text,
  p_tax_id       text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_company_id uuid;
  v_uid        uuid := auth.uid();
  v_email      text;
begin
  if v_uid is null then
    raise exception 'Ni prijavljenega uporabnika';
  end if;
  if exists (select 1 from public.users where id = v_uid) then
    raise exception 'Uporabnik je že registriran';
  end if;

  select email into v_email from auth.users where id = v_uid;

  insert into public.companies (name, tax_id, subscription_status, trial_ends_at)
  values (p_company_name, p_tax_id, 'trialing', now() + interval '14 days')
  returning id into v_company_id;

  insert into public.users (id, company_id, role, email, full_name)
  values (v_uid, v_company_id, 'admin', v_email, p_full_name);

  return v_company_id;
end;
$$;
