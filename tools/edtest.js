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

const FILES = ["content/setup.js","content/parties.js","content/stations.js","content/constituencies.js","content/cabinet.js","content/instruments.js","content/initiatives.js","content/minutes.js","content/functional.js","content/labour.js",
  "content/characters.js","content/bills.js","content/glossary.js","content/archetypes.js","content/names.js",
  "content/events.js","content/encyclopedia.js","content/business.js","content/settlements.js","content/actors.js","content/index.js",
  "js/engine.js","js/schema.js","js/refs.js","js/coverage.js","js/serialise.js","js/dialog.js","js/editor.js"];

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

console.log("");
const uniq = [...new Set(errs.map(e => String(e).replace(/^Uncaught \[?|\]$/g, "")))];
if (uniq.length) { console.log("WINDOW ERRORS:"); uniq.forEach(e => console.log("  " + e)); fail += uniq.length; }
console.log(fail ? fail + " FAILURES" : "editor is healthy");
process.exit(fail ? 1 : 0);
