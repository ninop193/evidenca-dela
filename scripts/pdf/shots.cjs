// Zajem svežih posnetkov aplikacije za PDF vodiče.
// Pred vsakim posnetkom injicira "čist videz": neprosojne bele kartice z mehko
// senco, brez mavričnega iris-edge roba in umirjeno ozadje — ker se v headless
// zajemu backdrop-filter/sence ne izrišejo enako kot v živem brskalniku.
const { createClient } = require("/Users/ninopavalec/Documents/evidenca-dela/node_modules/@supabase/supabase-js");
const { chromium } = require("/Users/ninopavalec/Documents/evidenca-dela/node_modules/playwright-core");
const fs = require("fs");
const OUT = "/Users/ninopavalec/Documents/evidenca-dela/scripts/pdf/shots";
const env = {};
for (const l of fs.readFileSync("/Users/ninopavalec/Documents/evidenca-dela/.env.local", "utf8").split("\n")) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
const ADM = "pdf-adm@delovit-test.example.com", EMP = "pdf-marko@delovit-test.example.com", PW = "AuditGeslo123!";
const iso = (d, h, mi) => new Date(Date.UTC(...d.split("-").map(Number).map((v, i) => i === 1 ? v - 1 : v), h - 2, mi)).toISOString();
const EXE = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const CLEAN = `
  .glass, .glass-strong {
    background:#ffffff !important;
    -webkit-backdrop-filter:none !important; backdrop-filter:none !important;
    border:1px solid rgba(226,232,240,.9) !important;
    box-shadow:0 16px 40px -24px rgba(15,23,42,.22) !important;
  }
  .iris-edge::before { display:none !important; }
  .holo-orb { opacity:.22 !important; animation:none !important; }
  .holo-sheen, .grain { display:none !important; }
`;
async function clean(page) { await page.addStyleTag({ content: CLEAN }); await page.waitForTimeout(250); }
const hydrate = p => p.waitForFunction(() => { const f = document.querySelector("form"); return !f || (Object.keys(f).find(k => k.startsWith("__reactProps")) && true); }, { timeout: 12000 }).catch(() => {});

(async () => {
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  async function cleanup() { const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 }); for (const u of list.users.filter(u => [ADM, EMP].includes(u.email))) { const { data: r } = await admin.from("users").select("company_id").eq("id", u.id).maybeSingle(); if (r?.company_id) { for (const t of ["time_entries", "absences", "employees", "users"]) await admin.from(t).delete().eq("company_id", r.company_id); await admin.from("companies").delete().eq("id", r.company_id); } await admin.auth.admin.deleteUser(u.id).catch(() => {}); } }
  await cleanup();
  const { data: comp } = await admin.from("companies").insert({ name: "Gostilna Pri Lipi", tax_id: "SI12345678", subscription_status: "active" }).select("id").single();
  const { data: au } = await admin.auth.admin.createUser({ email: ADM, password: PW, email_confirm: true });
  await admin.from("users").insert({ id: au.user.id, company_id: comp.id, role: "admin", email: ADM, full_name: "Janez Kovač" });
  const { data: eu } = await admin.auth.admin.createUser({ email: EMP, password: PW, email_confirm: true });
  await admin.from("users").insert({ id: eu.user.id, company_id: comp.id, role: "employee", email: EMP, full_name: "Marko Horvat" });
  const { data: marko } = await admin.from("employees").insert({ company_id: comp.id, user_id: eu.user.id, full_name: "Marko Horvat", job_title: "Natakar", weekly_hours: 40 }).select("id").single();
  const { data: ana } = await admin.from("employees").insert({ company_id: comp.id, full_name: "Ana Kovač", job_title: "Kuhinja", worker_type: "student" }).select("id").single();
  const E = (e, d, ih, im, oh, om, t, x = {}) => ({ company_id: comp.id, employee_id: e, date: d, clock_in: iso(d, ih, im), clock_out: oh == null ? null : iso(d, oh, om), total_worked_hours: t, hours_count: t, overtime_hours: 0, break_minutes: 0, needs_review: false, ...x });
  await admin.from("time_entries").insert([
    E(marko.id, "2026-07-13", 8, 0, 16, 30, 8.5, { overtime_hours: 0.5, break_minutes: 30 }),
    E(marko.id, "2026-07-14", 8, 2, 16, 4, 8.03, { break_minutes: 30 }),
    E(marko.id, "2026-07-15", 7, 58, 16, 0, 8.03),
    E(ana.id, "2026-07-13", 10, 0, 18, 0, 8, { break_minutes: 30 }),
    E(ana.id, "2026-07-14", 16, 0, 20, 0, 4),
  ]);

  const b = await chromium.launch({ executablePath: EXE, headless: true });

  // ---- MOBILNO ----
  const mkMob = () => b.newContext({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const m = await mkMob(); const mp = await m.newPage();
  const { data: link } = await admin.auth.admin.generateLink({ type: "recovery", email: EMP });
  await mp.goto(`http://localhost:3000/auth/povabilo?token_hash=${encodeURIComponent(link.properties.hashed_token)}`, { waitUntil: "networkidle" });
  await mp.waitForTimeout(1000); await clean(mp); await mp.screenshot({ path: `${OUT}/emp-setpw.png` });

  const m2 = await mkMob(); const lp = await m2.newPage();
  await lp.goto("http://localhost:3000/login", { waitUntil: "networkidle" }); await lp.waitForTimeout(500);
  await lp.evaluate(() => { const e = document.querySelector('input[name=email]'); if (e) e.value = 'marko@gostilna.si'; });
  await clean(lp); await lp.screenshot({ path: `${OUT}/emp-login.png` });
  await lp.fill('input[name=email]', EMP); await lp.fill('input[name=password]', PW); await hydrate(lp);
  await lp.click('button[type=submit]'); await lp.waitForURL("**/zigosanje", { timeout: 20000 }); await lp.waitForTimeout(700);
  await clean(lp); await lp.screenshot({ path: `${OUT}/emp-prihod.png` });
  await lp.click('button[aria-label="Žigosaj prihod"]'); await lp.waitForSelector('button[aria-label="Žigosaj odhod"]', { timeout: 10000 });
  await lp.click('button[aria-label="Žigosaj odhod"]'); await lp.waitForSelector("text=Odmor danes", { timeout: 5000 }); await lp.waitForTimeout(300);
  await clean(lp); await lp.screenshot({ path: `${OUT}/emp-odhod.png` });
  await lp.click("text=Prekliči").catch(() => {});
  await lp.goto("http://localhost:3000/moje-ure", { waitUntil: "networkidle" }); await lp.waitForTimeout(800);
  await clean(lp); await lp.screenshot({ path: `${OUT}/emp-mojeure.png` });

  // ---- DESKTOP ----
  const d = await b.newContext({ viewport: { width: 1300, height: 840 }, deviceScaleFactor: 2 }); const dp = await d.newPage();
  await dp.goto("http://localhost:3000/login", { waitUntil: "networkidle" }); await hydrate(dp);
  await dp.fill('input[name=email]', ADM); await dp.fill('input[name=password]', PW); await dp.click('button[type=submit]');
  await dp.waitForURL("**/dashboard**", { timeout: 20000 }); await dp.waitForTimeout(900);
  await clean(dp); await dp.screenshot({ path: `${OUT}/adm-dashboard.png` });
  const shot = async (url, name, wait = 800) => { await dp.goto("http://localhost:3000" + url, { waitUntil: "networkidle" }); await dp.waitForTimeout(wait); await clean(dp); await dp.screenshot({ path: `${OUT}/${name}.png` }); };
  await shot("/dashboard/zaposleni", "adm-zaposleni");
  await shot("/dashboard/zaposleni/nov", "adm-dodaj", 1000);
  await shot("/dashboard/ure", "adm-ure");
  await shot("/dashboard/ure/nov", "adm-rocni", 1000);
  await shot("/dashboard/pregled?month=2026-07", "adm-pregled", 1000);
  await shot("/narocnina", "adm-narocnina");
  await dp.goto("http://localhost:3000/izpis/evidenca?month=2026-07&employee=" + marko.id, { waitUntil: "networkidle" }); await dp.waitForTimeout(1200);
  await clean(dp); await dp.screenshot({ path: `${OUT}/adm-izpis.png`, clip: { x: 0, y: 0, width: 1300, height: 840 } });

  await b.close(); await cleanup();
  console.log("SHOTS DONE");
})().catch(e => { console.error(e); process.exit(1); });
