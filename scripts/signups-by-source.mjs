// Registracije (ustvarjena podjetja) po viru oglasa — samo branje.
// Uporaba: node --env-file=.env.local scripts/signups-by-source.mjs 2026-10-08 2026-10-14
import { createClient } from "@supabase/supabase-js";

const [fromArg, toArg] = process.argv.slice(2);
const from = new Date(`${fromArg ?? "2026-01-01"}T00:00:00+02:00`);
const to = new Date(`${toArg ?? "2100-01-01"}T23:59:59+02:00`);

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const users = [];
for (let page = 1; ; page++) {
  const { data, error } = await s.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw error;
  users.push(...data.users);
  if (data.users.length < 1000) break;
}
const { data: admins, error } = await s.from("users").select("id").eq("role", "admin");
if (error) throw error;
const adminIds = new Set(admins.map((a) => a.id));

const counts = {};
for (const u of users) {
  const t = new Date(u.created_at);
  if (!adminIds.has(u.id) || t < from || t > to) continue;
  const a = u.user_metadata?.attribution ?? {};
  const key = `${a.utm_source ?? "(brez vira)"} | ${a.utm_content ?? "-"}`;
  counts[key] = (counts[key] ?? 0) + 1;
}
console.table(
  Object.entries(counts)
    .sort((x, y) => y[1] - x[1])
    .map(([k, n]) => {
      const [utm_source, utm_content] = k.split(" | ");
      return { utm_source, utm_content, registracije: n };
    }),
);
