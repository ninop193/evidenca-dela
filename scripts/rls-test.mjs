// Varnostni test izolacije podatkov (RLS) na ŽIVI bazi.
//
// Ustvari 2 testni podjetji (A in B) z zaposlenimi, vnosi ur, odsotnostmi in
// prošnjami za dopust, nato poskusi vse "napade":
//   - admin podjetja B poskuša brati/pisati podatke podjetja A,
//   - zaposleni poskuša videti tuje ure, si sam popraviti ure, odobriti dopust,
//     se povišati v admina ali "plačati" naročnino,
//   - neprijavljen obiskovalec z javnim ključem poskuša brati karkoli.
// Na koncu preveri, da se v bazi ni spremenila niti ena vrstica, in vse testne
// podatke pobriše (tudi če test vmes pade).
//
// Zagon: node scripts/rls-test.mjs   (bere ključe iz .env.local)
// Ne pošilja mailov: računi se ustvarijo in prijavijo brez gesla in brez povabil.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).split(/\s+#/)[0].trim().replace(/^["']|["']$/g, "")];
    }),
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const svc = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, opts);
const anonClient = () => createClient(SUPABASE_URL, ANON_KEY, opts);

const stamp = Date.now().toString(36);
const mail = (who) => `rls-test-${who}-${stamp}@example.com`;
const created = { authIds: [], companyIds: [] };
const TABLES = ["users", "employees", "time_entries", "absences", "leave_requests", "subscriptions"];

function must(res, label) {
  if (res.error) throw new Error(`${label}: ${res.error.message}`);
  return res.data;
}

// --- priprava -----------------------------------------------------------------

async function newAuthUser(who) {
  const data = must(await svc.auth.admin.createUser({ email: mail(who), email_confirm: true }), `createUser ${who}`);
  created.authIds.push(data.user.id);
  return data.user.id;
}

// Prijava brez gesla: enkratna povezava, ki je ne pošljemo, ampak jo takoj porabimo.
async function signIn(who) {
  const link = must(await svc.auth.admin.generateLink({ type: "magiclink", email: mail(who) }), `link ${who}`);
  const c = anonClient();
  must(await c.auth.verifyOtp({ type: "magiclink", token_hash: link.properties.hashed_token }), `login ${who}`);
  return c;
}

async function newCompany(who) {
  const uid = await newAuthUser(who);
  const c = await signIn(who);
  const companyId = must(
    await c.rpc("create_company_and_admin", { p_company_name: `RLS test ${who} ${stamp}`, p_full_name: `Test ${who}` }),
    `registracija ${who}`,
  );
  created.companyIds.push(companyId);
  return { uid, c, companyId };
}

// Enako kot aplikacija (dashboard/actions.ts): strežnik ustvari profil + zapis zaposlenega.
async function newEmployee(who, companyId) {
  const uid = await newAuthUser(who);
  must(
    await svc.from("users").insert({ id: uid, company_id: companyId, role: "employee", email: mail(who), full_name: `Test ${who}` }),
    `users ${who}`,
  );
  const emp = must(
    await svc.from("employees").insert({ company_id: companyId, user_id: uid, full_name: `Test ${who}` }).select("id").single(),
    `employees ${who}`,
  );
  return { uid, c: await signIn(who), empId: emp.id };
}

async function seed(companyId, empId) {
  const te = must(
    await svc.from("time_entries").insert({
      company_id: companyId, employee_id: empId, date: "2026-10-01",
      clock_in: "2026-10-01T06:00:00Z", clock_out: "2026-10-01T14:00:00Z",
    }).select("id").single(),
    "time_entries",
  ).id;
  const ab = must(
    await svc.from("absences").insert({
      company_id: companyId, employee_id: empId, date_from: "2026-10-05", date_to: "2026-10-05",
      unworked_hours: 8, compensation_category: "nadomestilo_iz_sredstev_delodajalca", compensation_type: "letni_dopust",
    }).select("id").single(),
    "absences",
  ).id;
  const lr = must(
    await svc.from("leave_requests").insert({
      company_id: companyId, employee_id: empId, date_from: "2026-11-02", date_to: "2026-11-02", days: 1,
    }).select("id").single(),
    "leave_requests",
  ).id;
  return { te, ab, lr };
}

async function snapshot() {
  const out = {
    companies: must(await svc.from("companies").select("*").in("id", created.companyIds).order("id"), "snap companies"),
  };
  for (const t of TABLES) {
    out[t] = must(await svc.from(t).select("*").in("company_id", created.companyIds).order("id"), `snap ${t}`);
  }
  return JSON.stringify(out);
}

// --- preverjanja --------------------------------------------------------------

const results = [];
function record(name, ok, detail) {
  results.push({ name, ok });
  console.log(`${ok ? "✅" : "❌"} ${name}${!ok && detail ? `  ← ${detail}` : ""}`);
}
// Branje: ne sme vrniti nobene vrstice (napaka = tudi zavrnjeno).
async function expectNoRows(name, q) {
  const { data, error } = await q;
  if (error) return record(name, true);
  record(name, (data ?? []).length === 0, `vidi ${data.length} vrstic`);
}
// Kontrola, da test sploh dela: lastne podatke uporabnik MORA videti.
async function expectRows(name, q) {
  const { data, error } = await q;
  record(name, !error && (data ?? []).length > 0, error?.message ?? "ne vidi ničesar");
}
// Pisanje: mora vrniti napako ali spremeniti 0 vrstic.
async function expectBlocked(name, q) {
  const { data, error } = await q;
  if (error) return record(name, true);
  const n = Array.isArray(data) ? data.length : data ? 1 : 0;
  record(name, n === 0, `uspelo, spremenjenih vrstic: ${n}`);
}
async function expectError(name, q) {
  const { error } = await q;
  record(name, !!error, "klic je uspel");
}

// --- test ---------------------------------------------------------------------

async function run() {
  console.log(`Pripravljam testni podjetji (oznaka ${stamp}) …\n`);
  const A = await newCompany("admin-a");
  const B = await newCompany("admin-b");
  const empA = await newEmployee("emp-a", A.companyId);
  const empA2 = await newEmployee("emp-a2", A.companyId);
  const empB = await newEmployee("emp-b", B.companyId);
  const dA = await seed(A.companyId, empA.empId);
  const dA2 = await seed(A.companyId, empA2.empId);
  await seed(B.companyId, empB.empId);
  must(await svc.from("subscriptions").insert({ company_id: A.companyId, status: "active", stripe_customer_id: `cus_rlstest_${stamp}` }), "subscriptions");

  const before = await snapshot();

  console.log("— Kontrola: vsak vidi svoje —");
  await expectRows("Admin A vidi ure svojega zaposlenega", A.c.from("time_entries").select("id").eq("id", dA.te));
  await expectRows("Zaposleni A vidi svoje ure", empA.c.from("time_entries").select("id").eq("id", dA.te));
  await expectRows("Zaposleni A vidi svojo prošnjo za dopust", empA.c.from("leave_requests").select("id").eq("id", dA.lr));

  console.log("\n— Admin podjetja B poskuša do podatkov podjetja A —");
  await expectNoRows("B ne vidi podjetja A", B.c.from("companies").select("*").eq("id", A.companyId));
  for (const t of TABLES) {
    await expectNoRows(`B ne vidi ${t} podjetja A`, B.c.from(t).select("*").eq("company_id", A.companyId));
    await expectNoRows(`B pri ${t} vidi samo svoje podjetje`, B.c.from(t).select("id").neq("company_id", B.companyId));
  }
  await expectBlocked("B ne more vpisati ur v podjetje A",
    B.c.from("time_entries").insert({ company_id: A.companyId, employee_id: empA.empId, date: "2026-10-02" }).select());
  await expectBlocked("B ne more vpisati ur tujemu zaposlenemu pod svojim podjetjem",
    B.c.from("time_entries").insert({ company_id: B.companyId, employee_id: empA.empId, date: "2026-10-02" }).select());
  await expectBlocked("B ne more spremeniti ur podjetja A",
    B.c.from("time_entries").update({ notes: "vdor" }).eq("id", dA.te).select());
  await expectBlocked("B ne more prestaviti ur podjetja A k sebi",
    B.c.from("time_entries").update({ company_id: B.companyId }).eq("id", dA.te).select());
  await expectBlocked("B ne more brisati ur podjetja A", B.c.from("time_entries").delete().eq("id", dA.te).select());
  await expectBlocked("B ne more vpisati odsotnosti v podjetje A",
    B.c.from("absences").insert({
      company_id: A.companyId, employee_id: empA.empId, date_from: "2026-10-06", date_to: "2026-10-06",
      unworked_hours: 8, compensation_category: "brez_nadomestila", compensation_type: "drugo",
    }).select());
  await expectBlocked("B ne more spremeniti odsotnosti podjetja A", B.c.from("absences").update({ notes: "vdor" }).eq("id", dA.ab).select());
  await expectBlocked("B ne more brisati odsotnosti podjetja A", B.c.from("absences").delete().eq("id", dA.ab).select());
  await expectBlocked("B ne more odobriti dopusta v podjetju A",
    B.c.from("leave_requests").update({ status: "approved" }).eq("id", dA.lr).select());
  await expectBlocked("B ne more brisati prošnje v podjetju A", B.c.from("leave_requests").delete().eq("id", dA.lr).select());
  await expectBlocked("B ne more dodati zaposlenega v podjetje A",
    B.c.from("employees").insert({ company_id: A.companyId, full_name: "Vsiljivec" }).select());
  await expectBlocked("B ne more urejati zaposlenega podjetja A",
    B.c.from("employees").update({ full_name: "Vdor" }).eq("id", empA.empId).select());
  await expectBlocked("B ne more prestaviti zaposlenega A k sebi",
    B.c.from("employees").update({ company_id: B.companyId }).eq("id", empA.empId).select());
  await expectBlocked("B ne more brisati zaposlenega podjetja A", B.c.from("employees").delete().eq("id", empA.empId).select());
  await expectBlocked("B ne more spremeniti računa admina A", B.c.from("users").update({ role: "employee" }).eq("id", A.uid).select());
  await expectBlocked("B se ne more prestaviti v podjetje A", B.c.from("users").update({ company_id: A.companyId }).eq("id", B.uid).select());
  await expectBlocked("B ne more spremeniti podjetja A", B.c.from("companies").update({ name: "Vdor" }).eq("id", A.companyId).select());
  await expectBlocked("B si ne more sam vklopiti plačane naročnine",
    B.c.from("companies").update({ subscription_status: "active", trial_ends_at: "2099-01-01" }).eq("id", B.companyId).select());
  await expectBlocked("B si ne more vpisati naročnine", B.c.from("subscriptions").insert({ company_id: B.companyId, status: "active" }).select());
  await expectError("B ne more registrirati še enega podjetja s istim računom",
    B.c.rpc("create_company_and_admin", { p_company_name: "Drugo", p_full_name: "x" }));

  console.log("\n— Zaposleni podjetja A —");
  await expectNoRows("Zaposleni ne vidi ur sodelavca", empA.c.from("time_entries").select("id").neq("employee_id", empA.empId));
  await expectNoRows("Zaposleni ne vidi odsotnosti sodelavca", empA.c.from("absences").select("id").neq("employee_id", empA.empId));
  await expectNoRows("Zaposleni ne vidi prošenj sodelavca", empA.c.from("leave_requests").select("id").neq("employee_id", empA.empId));
  await expectNoRows("Zaposleni ne vidi podatkov sodelavcev (EMŠO …)", empA.c.from("employees").select("*").neq("id", empA.empId));
  await expectNoRows("Zaposleni ne vidi drugih računov", empA.c.from("users").select("*").neq("id", empA.uid));
  await expectNoRows("Zaposleni ne vidi naročnine", empA.c.from("subscriptions").select("*"));
  await expectNoRows("Zaposleni ne vidi podjetja B", empA.c.from("companies").select("id").neq("id", A.companyId));
  await expectBlocked("Zaposleni si ne more sam (mimo aplikacije) vpisati ur",
    empA.c.from("time_entries").insert({ company_id: A.companyId, employee_id: empA.empId, date: "2026-10-03" }).select());
  await expectBlocked("Zaposleni si ne more sam popraviti ur",
    empA.c.from("time_entries").update({ clock_out: "2026-10-01T20:00:00Z", overtime_hours: 6 }).eq("id", dA.te).select());
  await expectBlocked("Zaposleni ne more spremeniti ur sodelavca", empA.c.from("time_entries").update({ notes: "x" }).eq("id", dA2.te).select());
  await expectBlocked("Zaposleni ne more brisati svojih ur", empA.c.from("time_entries").delete().eq("id", dA.te).select());
  await expectBlocked("Zaposleni si ne more dati vloge admin", empA.c.from("users").update({ role: "admin" }).eq("id", empA.uid).select());
  await expectBlocked("Zaposleni se ne more prestaviti v drugo podjetje",
    empA.c.from("users").update({ company_id: B.companyId }).eq("id", empA.uid).select());
  await expectBlocked("Zaposleni ne more urejati svojega zapisa v evidenci",
    empA.c.from("employees").update({ full_name: "Drugo ime", is_management: true }).eq("id", empA.empId).select());
  await expectBlocked("Zaposleni ne more dodati zaposlenega",
    empA.c.from("employees").insert({ company_id: A.companyId, full_name: "Klon" }).select());
  await expectBlocked("Zaposleni si ne more sam odobriti dopusta",
    empA.c.from("leave_requests").update({ status: "approved" }).eq("id", dA.lr).select());
  await expectBlocked("Zaposleni ne more oddati prošnje mimo aplikacije",
    empA.c.from("leave_requests").insert({ company_id: A.companyId, employee_id: empA.empId, date_from: "2026-12-01", date_to: "2026-12-01", days: 1 }).select());
  await expectBlocked("Zaposleni si ne more vpisati odsotnosti",
    empA.c.from("absences").insert({
      company_id: A.companyId, employee_id: empA.empId, date_from: "2026-10-07", date_to: "2026-10-07",
      unworked_hours: 8, compensation_category: "nadomestilo_iz_sredstev_delodajalca", compensation_type: "letni_dopust",
    }).select());
  await expectBlocked("Zaposleni ne more spremeniti podjetja",
    empA.c.from("companies").update({ subscription_status: "active" }).eq("id", A.companyId).select());
  await expectError("Zaposleni ne more postati admin novega podjetja s svojim računom",
    empA.c.rpc("create_company_and_admin", { p_company_name: "Moje", p_full_name: "x" }));

  console.log("\n— Neprijavljen obiskovalec z javnim ključem —");
  const anon = anonClient();
  for (const t of ["companies", ...TABLES, "leads", "rate_events"]) {
    await expectNoRows(`Ne vidi tabele ${t}`, anon.from(t).select("*").limit(1));
  }
  await expectBlocked("Ne more vpisati ur", anon.from("time_entries").insert({ company_id: A.companyId, employee_id: empA.empId, date: "2026-10-04" }).select());
  await expectError("Ne more registrirati podjetja brez prijave", anon.rpc("create_company_and_admin", { p_company_name: "x", p_full_name: "x" }));

  // Na koncu, ker uspešen napad pokvari prijavo žrtve (en račun = več zapisov).
  console.log("\n— Povezovanje tujih računov z zaposlenimi —");
  await expectBlocked("B ne more svojemu zaposlenemu pripeti računa admina A",
    B.c.from("employees").update({ user_id: A.uid }).eq("id", empB.empId).select());
  await expectBlocked("B ne more dodati zaposlenega z računom zaposlenega A",
    B.c.from("employees").insert({ company_id: B.companyId, user_id: empA.uid, full_name: "Ugrabljen" }).select());
  await expectBlocked("Admin A ne more zamenjati računov med svojimi zaposlenimi",
    A.c.from("employees").update({ user_id: empA2.uid }).eq("id", empA.empId).select());

  const after = await snapshot();
  console.log();
  record("V bazi se ni spremenila niti ena vrstica", before === after, "podatki so se spremenili");
}

async function cleanup() {
  if (created.companyIds.length) {
    const { error } = await svc.from("companies").delete().in("id", created.companyIds);
    if (error) console.log(`⚠️  Brisanje testnih podjetij: ${error.message}`);
  }
  for (const id of created.authIds) {
    const { error } = await svc.auth.admin.deleteUser(id);
    if (error) console.log(`⚠️  Brisanje testnega računa ${id}: ${error.message}`);
  }
  const { count } = await svc.from("companies").select("id", { count: "exact", head: true }).in("id", created.companyIds.length ? created.companyIds : ["00000000-0000-0000-0000-000000000000"]);
  console.log(`\nPospravljeno: testni računi izbrisani, ostalih testnih podjetij: ${count ?? "?"}`);
}

let crashed = false;
try {
  await run();
} catch (e) {
  crashed = true;
  console.log(`\n💥 Test se je ustavil: ${e.message}`);
} finally {
  await cleanup();
}

const failed = results.filter((r) => !r.ok);
console.log(`\nRezultat: ${results.length - failed.length}/${results.length} preverjanj v redu${failed.length ? `, ${failed.length} NI v redu` : ""}.`);
process.exit(crashed || failed.length ? 1 : 0);
