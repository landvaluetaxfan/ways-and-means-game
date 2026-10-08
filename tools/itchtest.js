/* =============================================================
   ITCH TEST. Builds the itch.io package, unpacks it somewhere outside the
   repository and plays the page that is in it.

     node tools/itchtest.js

   What a player downloads is a zip of one page. This checks that page and
   not the repository: the zip holds only index.html; the page boots from
   file:// and from a static server; the opening plays; a save is written and
   read back; the console is clean; the page makes no network call and
   carries none; the world's untagged story is not in it; and Act I plays
   from the menu to the curtain.

   Every assertion was broken once to watch it fail (LESSONS.md, "Before
   trusting a check, break its subject").
   ============================================================= */
const fs = require("fs"), os = require("os"), path = require("path"), http = require("http"), cp = require("child_process");
const root = path.join(__dirname, "..");
let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = require("jsdom")); }
catch (e) { console.log("SKIP: jsdom not installed  (npm install jsdom)"); process.exit(0); }
const zip = require("./minizip.js"), L = require("./loadcontent.js");

let bad = 0;
const ok = (name, pass, why) => { console.log((pass ? "  ok   " : "  FAIL ") + name + (pass || !why ? "" : "  -- " + why)); if (!pass) bad++; };

/* ---- 1. the package ---- */
cp.execFileSync(process.execPath, [path.join(__dirname, "package-itch.js")], { cwd: root, stdio: "ignore" });
const zipPath = path.join(root, "dist", "ways-and-means-itch.zip");
const entries = zip.read(fs.readFileSync(zipPath));
ok("the zip holds index.html and nothing else", entries.length === 1 && entries[0].name === "index.html",
   entries.map(e => e.name).join(", "));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wm-itch-"));
const file = path.join(dir, "index.html");
fs.writeFileSync(file, entries[0].data);
const html = entries[0].data.toString("utf8");
ok("the unpacked page is outside the repository", path.relative(root, file).startsWith(".."));
ok("the page is no larger than 9 MB", html.length < 9 * 1048576, (html.length / 1048576).toFixed(1) + " MB");
ok("the page loads no external file", !/<script[^>]+\ssrc=|<link[^>]+rel=["']stylesheet|<img[^>]+src=["']https?:/.test(html.replace(/`[^`]*`/g, "")));
ok("the page carries the playtest frame, with the commit and the date", /window\.PLAYTEST = \{"campaign":"flash_i","build":"[0-9a-f]{4,}, \d{4}-\d\d-\d\d"/.test(html));
ok("the frame has no early end: the act's curtain ends the run", !/"endsAt"/.test(html.match(/window\.PLAYTEST = [^\n]*/)[0]));

/* ---- 2. no network, anywhere in the page (the editor is not in it) ---- */
const NET = ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "EventSource", "importScripts"];
const code = html.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const found = NET.filter(n => code.split(n).length > 1);
ok("the page carries no network call", !found.length, found.join(", "));

/* ---- 3. the world's untagged story is not in it ---- */
/* The untagged entries are read from the loaded content, not cut out by the build's own tool, so a broken strip cannot hide its own leak. */
const world = (() => { const ctx = {}; require("vm").runInNewContext(L.source() + "\n;__R = [EVENTS, BILLS, INSTRUMENTS, INITIATIVES, MATTERS, SETTLEMENTS, ACHIEVEMENTS, BUSINESS, MINUTES];", ctx);
  const out = [], walk = v => typeof v === "string" ? out.push(v) : v && typeof v === "object" ? Object.keys(v).forEach(k => walk(v[k])) : 0;
  ctx.__R.forEach(a => a.filter(x => x.campaign == null || [].concat(x.campaign).every(c => c === "world")).forEach(walk)); return out; })();
const lits = src => { const o = [], re = /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g; let m;
  while ((m = re.exec(src))) { const t = m[1] != null ? m[1] : m[2] != null ? m[2] : m[3]; if (t.length >= 40 && t.split(/\s+/).length >= 6) o.push(t); } return o; };
const retired = [];
L.contentFiles().filter(f => /\/(archive|parked)\//.test(f)).forEach(f => retired.push(...lits(fs.readFileSync(path.join(L.root, f), "utf8"))));
world.forEach(t => t.split("\n").forEach(line => { const h = line.trim().split(/["\\]/)[0].slice(0, 70); if (h.length >= 40 && h.split(/\s+/).length >= 6) retired.push(h); }));
/* A phrase may also live in a file the page does carry: a reference entry or Act I's own prose that reuses a line. That is
   reuse, listed below for the author, and not a leak. A leak is a phrase in the page that no carried file but a story file holds. */
const carried = L.files.filter(f => !/^content\/[^/]+\.js$/.test(f) || !/\b(EVENTS|BILLS|INSTRUMENTS|INITIATIVES|MATTERS|SETTLEMENTS|ACHIEVEMENTS|BUSINESS|MINUTES|RESOLUTIONS)\s*=\s*\[/.test(fs.readFileSync(path.join(L.root, f), "utf8")))
  .map(f => fs.readFileSync(path.join(L.root, f), "utf8")).join("\n");
const inPage = [...new Set(retired)].filter(t => html.includes(t));
const leaked = inPage.filter(t => !carried.includes(t));
ok("no retired phrase is in the page that a carried file does not also hold", !leaked.length, leaked.slice(0, 3).join(" | "));
const reused = inPage.filter(t => !leaked.includes(t));
console.log(`  note ${retired.length} retired phrases checked; ${reused.length} appear in the page because a carried file uses the same words`);

/* ---- 4. boots, plays, saves ---- */
function open(how) {
  const errs = [], vc = new VirtualConsole();
  vc.on("jsdomError", e => errs.push("page error: " + e.message));
  vc.on("error", (...a) => errs.push("console.error: " + a.join(" ")));
  vc.on("warn", (...a) => errs.push("console.warn: " + a.join(" ")));
  const opts = { runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc, beforeParse(win) {
    win.HTMLAnchorElement.prototype.click = function () {};
    win.HTMLCanvasElement.prototype.getContext = () => null;
    let s = 0x2080;
    win.Math.random = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  } };
  return (how.url ? JSDOM.fromURL(how.url, opts) : JSDOM.fromFile(file, opts)).then(dom => ({ dom, errs }));
}
const tick = (w, ms) => new Promise(r => w.setTimeout(r, ms || 0));

async function boot(label, how) {
  const { dom, errs } = await open(how), w = dom.window, q = x => w.document.querySelector(x);
  await tick(w, 20);
  ok(label + ": the menu is up", !!q('[data-go="new"]'));
  ok(label + ": the menu carries the narrow-screen line", !!q(".menu-narrow") && /desktop window/.test(q(".menu-narrow").textContent));
  ok(label + ": the menu shows the build", /Build [0-9a-f]{4,}, \d{4}-/.test((q("[data-slice-build]") || {}).textContent || ""));
  w.eval("Dialog.prompt = function(m,o,cb){ cb('Itch test'); }; Dialog.confirm = function(m,o,cb){ cb(true); };");
  w.eval("Shell.setOpt('motion', false)");
  q('[data-go="new"]').click();
  ok(label + ": one government to choose, and no Sandbox", w.document.querySelectorAll("[data-admin]").length === 1 && !q('[data-go="sandbox"]'));
  q("[data-admin]").click(); q('[data-new="1"]').click();
  ok(label + ": the opening plays", !!q("#sitting-body") && w.eval("UI.state().sitting") === 1 && /\S/.test(q("#sitting-body").textContent));
  return { dom, w, q, errs };
}

(async () => {
  /* file:// : an opaque origin, where localStorage throws; the game must say so and carry on */
  const f = await boot("file://", { file: true });
  let throws = false; try { f.w.localStorage.getItem("x"); } catch (e) { throws = true; }
  f.w.eval("Shell.boot(CONTENT)");
  ok("file://: where storage throws, the menu says slots will not save", !throws || !!f.q(".menu-warn"), "storage throws: " + throws);
  const untagged = f.w.eval(`[EVENTS, BILLS, INSTRUMENTS, INITIATIVES, MATTERS, SETTLEMENTS, ACHIEVEMENTS, BUSINESS, MINUTES]
    .reduce((n, a) => n + a.filter(x => x.campaign == null || [].concat(x.campaign).every(c => c === "world")).length, 0)`);
  ok("file://: the page holds no story entry that is not tagged for a campaign", untagged === 0, untagged + " untagged");
  ok("file://: the console is clean", f.errs.length === 0, f.errs.slice(0, 2).join(" | "));
  f.dom.window.close();

  /* a static server : the way itch.io serves it */
  const srv = http.createServer((req, res) => { res.setHeader("content-type", "text/html; charset=utf-8"); res.end(fs.readFileSync(file)); });
  await new Promise(r => srv.listen(0, "127.0.0.1", r));
  const url = "http://127.0.0.1:" + srv.address().port + "/index.html";
  const s = await boot("served", { url }), w = s.w, q = s.q;
  w.eval("Shell.autosave()");
  const keys = Object.keys(w.localStorage).filter(k => /^wm\.slot\./.test(k));
  const saved = keys.length ? JSON.parse(w.localStorage.getItem(keys[0])) : null;
  ok("served: a save is written and reads back", !!saved && saved.name === "Itch test" && typeof saved.state === "string" && JSON.parse(saved.state).admin === "flash_i", keys.join(","));
  w.eval("Shell.boot(CONTENT)");
  ok("served: the menu offers to continue it", !!q("[data-cont]"));

  /* the lever ladder, as the page draws it: at the start the estimates' clauses and the grant are shut and say so */
  w.eval("UI.openTab('cham')");
  ok("served: the Chamber lists no measure before the order paper has been put in front of the player",
     !w.document.querySelector("#cham-bills tr[data-bill]") && /No measure is before the House yet/.test(w.document.querySelector("#cham-bills").textContent));
  ok("served: and the count of a measure is not shown yet", w.eval("Engine.revealed(UI.state(), UI.content(), 'forecast')") === false);
  w.eval("UI.state().seen.a1_order_paper = 1; UI.redraw()");
  const arow = w.document.querySelector('#cham-bills tr[data-bill="appropriation"]');
  if (arow) arow.click();
  ok("served: the Chamber's grant is open once the order paper has been read", !!arow && !!arow.querySelector(".slotbtn") && !arow.querySelector(".slotbtn").disabled);
  ok("served: every clause level is dimmed, with the line that says what opens it",
     w.document.querySelectorAll(".cl-opt").length > 0 && w.document.querySelectorAll(".cl-opt:not(.locked)").length === 0 &&
     w.document.querySelectorAll(".cl-lock").length > 0);
  w.eval("UI.openTab('sit')");

  /* an earned answer lists last, with its mark and the reason it is open */
  for (let i = 0; i < 8 && !w.document.querySelector("#sitting-body .ch-head"); i++) { const g = w.document.querySelector("#sitting-body [data-sp-go]"); if (!g) break; g.click(); }
  w.eval(`(function () { var e = Engine.nextEvent(UI.state(), UI.content()); e.choices.push({ label: "An earned answer.", because: "of a kept promise", when: { minSitting: 1 }, note: "n", effects: [], result: "r" }); UI.redraw(); })()`);
  const rows = [...w.document.querySelectorAll("#sitting-body .ch")], lastRow = rows[rows.length - 1];
  ok("served: an earned answer lists last, marked, with the reason it is open",
     !!lastRow && !!lastRow.querySelector(".earned") && /Open because of a kept promise/.test(lastRow.textContent));
  w.eval("Engine.nextEvent(UI.state(), UI.content()).choices.pop(); UI.redraw()");

  /* ---- saves across builds: an older shape migrates, a newer one is refused plainly ---- */
  const cur = JSON.parse(w.localStorage.getItem(keys[0]));
  const older = JSON.parse(cur.state); older.version = w.eval("Engine.STATE_VERSION") - 1; delete older.intervalCourse; delete older.interval;
  w.localStorage.setItem("wm.slot.3", JSON.stringify(Object.assign({}, cur, { name: "Older build", state: JSON.stringify(older) })));
  w.eval("Shell.boot(CONTENT)");
  q('[data-go="load"]').click();
  const row = [...w.document.querySelectorAll(".slot")].find(r => /Older build/.test(r.textContent));
  ok("a save from the previous state shape is listed", !!row);
  if (row) { const b = row.querySelector("[data-load], [data-act='load'], button"); b.click(); }
  const migrated = w.eval("UI.state()");
  ok("and it migrates and plays on", migrated && migrated.version === w.eval("Engine.STATE_VERSION") && migrated.intervalCourse === null, migrated && String(migrated.version));
  const newer = JSON.parse(cur.state); newer.version = w.eval("Engine.STATE_VERSION") + 5;
  let refused = false;
  try { const r = w.eval(`Engine.load(${JSON.stringify(JSON.stringify(newer))}, CONTENT.forCampaign(CONTENT.administrations.find(a => a.id === "flash_i")))`); refused = !r || r.version <= w.eval("Engine.STATE_VERSION"); }
  catch (e) { refused = /newer|version/i.test(e.message); }
  ok("a save from a newer build is refused rather than half-read", refused);

  /* ---- 5. Act I from the menu to the curtain ---- */
  w.eval("Shell.boot(CONTENT)");
  q('[data-go="new"]').click(); q("[data-admin]").click(); q('[data-new="1"]').click();
  let curtain = false, steps = 0;
  for (let guard = 0; guard < 400 && !curtain; guard++) {
    const body = q("#sitting-body");
    if (!body) break;
    const go = body.querySelector("[data-sp-go]") || body.querySelector("#btn-pass");
    const heads = [...body.querySelectorAll(".ch-head")];
    const adv = q("#btn-advance");
    if (/This is the end of the act/.test(w.document.body.textContent)) { curtain = true; break; }
    if (go) { go.click(); steps++; continue; }
    if (heads.length) { heads[0].click(); const c = body.querySelector(".btn.commit"); if (c) c.click(); steps++; continue; }
    if (adv) {
      w.eval(`(function(){ var st = UI.state(), C = UI.content(), b = st.bills.appropriation;
        if (st.sitting >= 5 && b && !b.dead && b.stage !== "assented" && b.stage !== "awaiting_assent") {
          if (b.stage === Engine.DIVIDES_AT) { try { Engine.divide(st, C, "appropriation"); } catch (e) {} }
          else Engine.grantSlot(st, C, "appropriation"); } })()`);
      adv.click(); steps++; continue;
    }
    break;
  }
  ok("Act I plays from the menu to the curtain through the packaged page", curtain, "stopped at sitting " + w.eval("UI.state().sitting") + " after " + steps + " steps");
  ok("the curtain page is dated the day the House rose, in words", /Treasury and Reserve Bank, 8 May 2080/.test(w.document.body.textContent));
  ok("the curtain page thanks the player and points to the report", /Thank you for playing/.test(w.document.body.textContent) && /Copy playtest report/.test(w.document.body.textContent));
  ok("served: the console is clean after the whole act", s.errs.length === 0, s.errs.slice(0, 2).join(" | "));
  w.close(); srv.close();

  fs.rmSync(dir, { recursive: true, force: true });
  console.log(bad ? `\nFAILED: ${bad} assertion(s)` : "\nthe itch.io package is healthy");
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log("  FAIL the itch test crashed: " + (e.stack || e.message)); process.exit(1); });
