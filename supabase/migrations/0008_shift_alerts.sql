-- =============================================================================
-- 0008: Časovna žiga za opomnike ob predolgi odprti izmeni (Faza 1.5)
-- =============================================================================
-- limit_alert_sent_at:  1. opomnik zaposlenemu ob zakonski dnevni meji (8h/10h).
-- escalation_sent_at:   2. opomnik (+30 min) zaposlenemu + obvestilo delodajalcu.
-- Žiga zagotavljata, da vsak sloj pošljemo največ enkrat na vnos (cron teče
-- vsakih 15 minut prek pg_cron → /api/cron/shift-alerts).

alter table public.time_entries
  add column if not exists limit_alert_sent_at timestamptz,
  add column if not exists escalation_sent_at timestamptz;
