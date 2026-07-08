-- =============================================================================
-- 0009: Odmor med delovnim časom (18. člen ZEPDSV — izraba odmora)
-- =============================================================================
-- Odmor se po ZDR-1 (154. člen) VŠTEVA v delovni čas, zato ur ne odšteva;
-- je zgolj zabeležka za evidenco. Privzeto 0 (obstoječi vnosi nedotaknjeni).

alter table public.time_entries
  add column if not exists break_minutes int not null default 0
  check (break_minutes >= 0 and break_minutes <= 480);
