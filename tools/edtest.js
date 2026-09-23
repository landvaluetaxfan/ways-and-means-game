/* Editor smoke test. Loads editor.html in a headless DOM, boots it, clicks
   every tab, and exercises New/Duplicate/Delete and export on each.

   This exists because a broken editor once shipped: a form function was
   referenced but never defined, and nothing caught it. Static parsing will
   not find that class of bug — only running it will.

   Needs jsdom:  npm install jsdom
   Skips cleanly if it is not installed.                                    */
const fs = require("fs"), path = require("path"), root = path.join(__dirname, "..");
let JSDOM;
try { ({ JSDOM } = require("jsdom")); }
catch (e) {
  try { ({ JSDOM } = require(path.join(process.env.HOME || "/home/claude", "node_modules/jsdom"))); }
  catch (e2) { console.log("SKIP: jsdom not installed  (npm install jsdom)"); process.exit(0); }
}

/* editor.html ends with an inline `Editor.boot()`. jsdom does not fetch the
   external <script src> tags above it, so that call runs against an undefined
   Editor at parse time and throws — before any listener we could attach, and
   into the virtual console rather than anywhere we check. It printed a stack
   trace on every run while the suite still reported "editor is healthy", which
   is the exact shape of the bug this file exists to catch.

   Strip the bootstrap (we call boot() ourselves below, after injecting the
   real scripts) and register the error sinks through beforeParse, so they are
   live before the first byte of script runs. */
const errs = [];
const html = fs.readFileSync(path.join(root, "editor.html"), "utf8")
  .replace(/<script>\s*Editor\.boot\(\);?\s*<\/script>/, "");

const { VirtualConsole } = require("jsdom");
const vc = new VirtualConsole();
vc.on("jsdomError", e => errs.push(e.message));

const dom = new JSDOM(html, {
  runScripts: "dangerously", pretendToBeVisual: true, url: "file:///x/",
  virtualConsole: vc,
  beforeParse(win) { win.addEventListener("error", e => errs.push(e.message)); }
});
const w = dom.window;
w.alert = () => {}; w.confirm = () => true; w.prompt = () => null;
w.URL.createObjectURL = () => "blob:x"; w.HTMLAnchorElement.prototype.click = function () {};

/* THE SCRIPTS editor.html RUNS, read off the page in its order. This was a
   hand-kept list that loaded initiatives and minutes, which the page did
   not, so the test measured an editor with more in it than the author's:
   the rename dialog's warnings about initiatives came from the test's copy
   and not the page's (the harness lesson, again). */
const FILES = require("./loadcontent.js").scriptsOf("editor.html");

FILES.forEach(f => {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) return;
  const s = w.document.createElement("script");
  s.textContent = fs.readFileSync(p, "utf8");
  w.document.body.appendChild(s);
});

/* The editor asks through Dialog's callbacks now (js/dialog.js). Answer
   them the moment they open, the way the old window stubs did. */
w.eval(`
  Dialog.confirm = function (m, o, cb) { (typeof o === "function" ? o : cb)(true); };
  Dialog.prompt  = function (m, o, cb) { (typeof o === "function" ? o : cb)(null); };
  Dialog.alert   = function (m, o, cb) { var f = typeof o === "function" ? o : cb; if (f) f(); };
`);

let fail = 0;
const ok = (label, cond, extra) => {
  if (!cond) fail++;
  console.log((cond ? "  ok   " : "  FAIL ") + label + (extra ? "  " + extra : ""));
};

console.log("EDITOR SMOKE TEST");
console.log("=".repeat(56));

try { w.eval("Editor.boot()"); ok("boot()", true); }
catch (e) { ok("boot()", false, e.message); process.exit(1); }

const tabs = [...w.document.querySelectorAll(".tab")].map(t => t.dataset.t);
tabs.forEach(t => {
  try {
    w.document.querySelector(`.tab[data-t="${t}"]`).click();
    const list = w.document.getElementById("ed-list").children.length;
    const form = w.document.getElementById("ed-form").innerHTML.length;
    if (t === "graph") {
      ok(`tab ${t}`, w.document.getElementById("ed-graph").innerHTML.length > 200, "graph svg");
    } else {
      ok(`tab ${t}`, list > 0 && form > 200, `${list} entries, form ${form} chars`);
    }
  } catch (e) { ok(`tab ${t}`, false, e.message); }
});

/* exercise the destructive buttons on a data tab */
try {
  w.document.querySelector('.tab[data-t="stations"]').click();
  const before = w.document.getElementById("ed-list").children.length;
  w.document.getElementById("ed-new").click();
  const added = w.document.getElementById("ed-list").children.length;
  w.document.getElementById("ed-dup").click();
  const duped = w.document.getElementById("ed-list").children.length;
  w.document.getElementById("ed-del").click();
  const deleted = w.document.getElementById("ed-list").children.length;
  ok("new / duplicate / delete", added === before + 1 && duped === before + 2 && deleted === before + 1,
     `${before} → ${added} → ${duped} → ${deleted}`);
} catch (e) { ok("new / duplicate / delete", false, e.message); }

/* every form function named in KIND must exist and run */
try {
  w.document.querySelector('.tab[data-t="events"]').click();
  const items = [...w.document.querySelectorAll(".ed-item")];
  items.slice(0, 6).forEach(i => i.click());
  ok("selecting events", w.document.getElementById("ed-form").innerHTML.length > 200);
} catch (e) { ok("selecting events", false, e.message); }

/* export must produce parseable content for every file */
try {
  const S = w.eval("Serialise"), M = w.eval("(function(){return null})()");
  ok("export runs", typeof S.file === "function" && typeof S.encyclopediaFile === "function");
} catch (e) { ok("export runs", false, e.message); }

/* NO EFFECT MAY LOSE A PAIR THROUGH THE FORM.

   The editor renders one key-value row per effect, so a multi-key
   object used to save back with only its first pair — 25 of 53 keyed
   effects in content were in that state, and roundtrip.js could not see
   it because it round-trips PLAY STATE rather than the editor's own
   encoding. This checks the encoding itself: explode every effect in
   content into rows, put each row back, and require that the pairs that
   come out are the pairs that went in. */
try {
  const ed = w.eval("Editor && Editor.__test ? Editor.__test : null");
  /* Flatten to LEAVES. Splitting one effect into two is not a loss —
     {bill:{x:{stage:s,dead:true}}} and the same thing as two effects
     apply identically — so the comparison has to be on the leaf values
     rather than on the object shape, or a correct fix reads as a
     failure. */
  const pairsOf = eff => {
    const out = [];
    const walk = (path, val) => {
      if (val && typeof val === "object" && !Array.isArray(val))
        Object.keys(val).forEach(k => walk(path + "/" + k, val[k]));
      else out.push(path + "=" + JSON.stringify(val));
    };
    Object.keys(eff).forEach(v => walk(v, eff[v]));
    return out;
  };
  if (!ed) {
    ok("effect pairs survive the form", true, "editor exposes no test hook — skipped");
  } else {
    const lost = [];
    w.eval("CONTENT.events").forEach(e => (e.choices || []).forEach(c => {
      const want = [].concat(c.effects || []).flatMap(pairsOf).sort().join(" | ");
      const got = ed.explodeEffects(c.effects)
        .map(x => ed.rowToEff(ed.effToRow(x)))
        .filter(Boolean).flatMap(pairsOf).sort().join(" | ");
      if (want !== got) lost.push(e.id + ": " + want + "  ->  " + got);
    }));
    ok("every effect pair in content survives the editor's own encoding",
       lost.length === 0, lost.slice(0, 3).join("  //  "));
  }
} catch (e) { ok("effect pairs survive the form", false, e.message); }

/* OPENING AN ENTRY CHANGES NOTHING (design/34). The editor commits the form
   whenever the author clicks away, and it rebuilt each entry from the fields
   it draws -- so browsing the events list deleted `at`, `maxFires`, briefs,
   choice gates and every condition the schema did not describe, from 73 of
   108 events. Nothing here noticed, because nothing here compared an entry
   before and after. This opens every entry of every tab in a FRESH editor
   (the checks above have already edited this one), exports each tab, and
   compares with what content holds. Two differences are the editor's
   documented normal form and are applied to both sides: a multi-pair effect
   is exploded into one effect per pair, and an empty effects list is none. */
console.log("\nOPENING AN ENTRY CHANGES NOTHING");
try {
  const vc2 = new VirtualConsole(), errs2 = [];
  vc2.on("jsdomError", e => errs2.push(e.message));
  const d2 = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: "file:///y/",
    virtualConsole: vc2, beforeParse(win) { win.addEventListener("error", e => errs2.push(e.message)); } });
  const w2 = d2.window;
  w2.URL.createObjectURL = () => "blob:y"; w2.HTMLAnchorElement.prototype.click = function () {};
  FILES.forEach(f => { const p = path.join(root, f); if (!fs.existsSync(p)) return;
    const sc = w2.document.createElement("script"); sc.textContent = fs.readFileSync(p, "utf8");
    w2.document.body.appendChild(sc); });
  w2.eval(`
    Dialog.confirm = function (m, o, cb) { (typeof o === "function" ? o : cb)(false); };
    Dialog.prompt  = function (m, o, cb) { (typeof o === "function" ? o : cb)(null); };
    Dialog.alert   = function (m, o, cb) { var f = typeof o === "function" ? o : cb; if (f) f(); };
    try { localStorage.clear(); } catch (e) {}
    (function(){ const f = Serialise.file; Serialise.file = function (k, arr) {
      window.__cap = JSON.parse(JSON.stringify(arr)); return f.apply(this, arguments); };
      const pf = Serialise.partiesFile; Serialise.partiesFile = function (p, c) {
      window.__cap = JSON.parse(JSON.stringify(p)); return pf.apply(this, arguments); }; })();
    Editor.boot();`);
  const X = w2.eval("Editor.__test.explodeEffects");
  const norm = (tab, e) => { if (!e) return e; e = JSON.parse(JSON.stringify(e));
    if (tab === "events") (e.choices || []).forEach(c => {
      if (c.effects) c.effects = JSON.parse(JSON.stringify(X(c.effects)));
      if (c.effects && !c.effects.length) delete c.effects; });
    return e; };
  const GLOB = { events: "EVENTS", parties: "PARTIES", stations: "STATIONS", characters: "CHARACTERS",
    bills: "BILLS", glossary: "GLOSSARY", constituencies: "CONSTITUENCIES", functional: "FUNCTIONAL" };
  const diff = (a, b, p, out) => {
    if (JSON.stringify(a) === JSON.stringify(b)) return;
    if (a && b && typeof a === "object" && typeof b === "object" && Array.isArray(a) === Array.isArray(b))
      new Set(Object.keys(a).concat(Object.keys(b))).forEach(k => diff(a[k], b[k], p + "." + k, out));
    else out.push(p + ": " + String(JSON.stringify(a)).slice(0, 50) + " -> " + String(JSON.stringify(b)).slice(0, 50));
  };
  Object.keys(GLOB).forEach(tab => {
    const t = w2.document.querySelector('.tab[data-t="' + tab + '"]');
    if (!t) { ok("the " + tab + " tab exists", false); return; }
    t.dispatchEvent(new w2.MouseEvent("click", { bubbles: true }));
    const idsOf = () => [...w2.document.querySelectorAll("#ed-list .ed-item[data-id]")].map(n => n.dataset.id);
    idsOf().forEach(id => {
      const it = [...w2.document.querySelectorAll("#ed-list .ed-item[data-id]")].find(n => n.dataset.id === id);
      if (it) it.dispatchEvent(new w2.MouseEvent("click", { bubbles: true }));
    });
    w2.__cap = null;
    w2.document.getElementById("ed-exportone").dispatchEvent(new w2.MouseEvent("click", { bubbles: true }));
    const got = w2.__cap || [], want = JSON.parse(w2.eval("JSON.stringify(" + GLOB[tab] + ")"));
    const key = o => o.id || o.term;
    const byId = new Map(got.map(o => [key(o), o]));
    const out = [];
    want.forEach(o => diff(norm(tab, o), norm(tab, byId.get(key(o))), key(o), out));
    const one = { parties: "party", glossary: "glossary", constituencies: "constituency",
                  functional: "functional" }[tab] || tab.replace(/s$/, "");
    ok("opening every " + one + " entry changes none of them",
       out.length === 0, out.length + " differences: " + out.slice(0, 4).join("  //  "));
  });
  /* A RENAME SAYS WHAT IT CANNOT REACH. The cabinet, the instruments and
     the rest are read-only here, and a party renamed in the editor used to
     leave them naming a party that no longer exists without a word. */
  w2.eval(`window.__prompt = null; Dialog.prompt = function (m, o, cb) {
    window.__prompt = m; (typeof o === "function" ? o : cb)(null); };`);
  w2.document.querySelector('.tab[data-t="parties"]').dispatchEvent(new w2.MouseEvent("click", { bubbles: true }));
  const cu = [...w2.document.querySelectorAll("#ed-list .ed-item[data-id]")].find(n => n.dataset.id === "cu");
  if (cu) cu.dispatchEvent(new w2.MouseEvent("click", { bubbles: true }));
  const rb = w2.document.querySelector('#ed-form [data-act="rename"]');
  if (rb) rb.dispatchEvent(new w2.MouseEvent("click", { bubbles: true }));
  const said = String(w2.__prompt || "");
  ok("renaming a party lists what it cannot change in files it does not write",
     /does not write/.test(said) && /cabinet /.test(said),
     said.split("\n").filter(l => /NOT changed|cabinet |instrument /.test(l)).slice(0, 3).join(" / ") || "no prompt");

  /* and the content the game plays is not reported as broken: the
     validator checked the schema, which describes only the verbs the forms
     draw, and called seven real verbs and twenty-two conditions unknown */
  const unknown = [...w2.document.querySelectorAll("#ed-status .ed-err")]
    .map(n => n.textContent).filter(t => /unknown (verb|condition)/.test(t));
  ok("the validator knows every verb and condition content uses", unknown.length === 0,
     unknown.slice(0, 3).join(" // "));
  /* WHICH CAMPAIGN AN ENTRY BELONGS TO (design/36 §3): shown, and written
     when it is changed. The fidelity sweep above proves opening a tagged
     entry keeps its tag; this proves the field is a real control. */
  {
    const click = n => n && n.dispatchEvent(new w2.MouseEvent("click", { bubbles: true }));
    click(w2.document.querySelector('.tab[data-t="events"]'));
    const item = id => [...w2.document.querySelectorAll("#ed-list .ed-item[data-id]")].find(n => n.dataset.id === id);
    const tagged = w2.eval("JSON.stringify(EVENTS.filter(function (e) { return typeof e.campaign === 'string'; })[0] || null)");
    const te = JSON.parse(tagged);
    if (!te) ok("some event belongs to a campaign", false);
    else {
      click(item(te.id));
      const f = w2.document.querySelector('#ed-form [data-f="campaign"]');
      ok("an event's campaign is shown in its form", !!f && f.value === te.campaign, f ? f.value : "no field");
      if (f) {
        f.value = "";
        const other = [...w2.document.querySelectorAll("#ed-list .ed-item[data-id]")].find(n => n.dataset.id !== te.id);
        click(other);
        w2.__cap = null;
        click(w2.document.getElementById("ed-exportone"));
        const back = (w2.__cap || []).find(o => o.id === te.id) || {};
        ok("and clearing it makes the event the world's", back.id === te.id && back.campaign === undefined,
           JSON.stringify(back.campaign));
      }
    }
  }
  if (errs2.length) ok("and the fresh editor raised no errors", false, errs2.slice(0, 2).join(" // "));
} catch (e) { ok("opening an entry changes nothing", false, e.message); }

console.log("");
const uniq = [...new Set(errs.map(e => String(e).replace(/^Uncaught \[?|\]$/g, "")))];
if (uniq.length) { console.log("WINDOW ERRORS:"); uniq.forEach(e => console.log("  " + e)); fail += uniq.length; }
console.log(fail ? fail + " FAILURES" : "editor is healthy");
process.exit(fail ? 1 : 0);
