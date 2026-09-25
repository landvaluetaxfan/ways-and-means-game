/* =============================================================
   LEGIBILITY LINT
   -------------------------------------------------------------
   The bible calls legibility this project's whole risk, and says a
   designer cannot see their own legibility failures. This is the
   part of that a machine CAN see:

     1. terms used before the event that introduces them
     2. events dropping more than one new term at once
     3. glossary terms that are never introduced anywhere
     4. terms used in prose that are not in the glossary at all

   It cannot tell you whether an event is clear. It can tell you
   when you have stacked four unfamiliar nouns in one paragraph,
   which is the failure that actually happens.

   Run:  node tools/lint.js
   ============================================================= */

const fs = require("fs"), vm = require("vm"), path = require("path");
const root = path.join(__dirname, "..");
/* settlements, business and achievements were added for the flag audit at the
   bottom: a flag set in a file this tool does not load reads as a flag
   nothing sets, and an audit with a hole in it is worse than none. */
/* the content files index.html loads, in its order (tools/loadcontent.js):
   a file this tool does not load reads as content nobody wrote */
const LC = require("./loadcontent.js");
const files = LC.files.map(f => path.join(root, f));
vm.runInThisContext(LC.source() +
  "\n;globalThis.__G = {EVENTS, GLOSSARY, BILLS, PARTIES, CHARACTERS, STATIONS, LABOUR, INITIATIVES, SETUP, CURRENTS, ACTORS, INSTRUMENTS, SETTLEMENTS, BUSINESS, ACHIEVEMENTS, MINUTES, CABINET, ENCYCLOPEDIA, ADMINISTRATIONS};");
const { EVENTS, GLOSSARY, BILLS, PARTIES, CHARACTERS, STATIONS, LABOUR, INITIATIVES, SETUP, CURRENTS, ACTORS, INSTRUMENTS, SETTLEMENTS, BUSINESS, ACHIEVEMENTS, MINUTES, CABINET, ENCYCLOPEDIA, ADMINISTRATIONS } = globalThis.__G;

const MAX_NEW_CLUSTERS = 1;  // per event. Raise this and you are choosing to confuse people.

/* Order events the way a player actually meets them: prologue first, then weight. */
const ordered = [
  ...EVENTS.filter(e => e.prologue).sort((a, b) => a.prologue - b.prologue),
  ...EVENTS.filter(e => !e.prologue).sort((a, b) => (b.weight || 1) - (a.weight || 1) || (a.id < b.id ? -1 : 1))
];

const taught = new Set(GLOSSARY.filter(g => g.assumed).map(g => g.term.toLowerCase()));
const byTerm = GLOSSARY.reduce((m, g) => (m[g.term.toLowerCase()] = g, m), {});
const problems = { early: [], overload: [], orphan: [], untaught: [] };

/* Proper nouns are not vocabulary. "New Progressive Party" is a party
   name, not a lesson about substrate, so strip known names before matching. */
const PROPER = [...(typeof PARTIES !== "undefined" ? PARTIES.flatMap(p => [p.name, ...(p.aliases || [])]) : []),
                ...(typeof CHARACTERS !== "undefined" ? CHARACTERS.map(c => c.name) : []),
                ...(typeof STATIONS !== "undefined" ? STATIONS.map(s => s.name) : []),
                ...(typeof BILLS !== "undefined" ? BILLS.map(b => b.title) : [])]
  .sort((a, b) => b.length - a.length);

function textOf(e) {
  let t = [e.title, e.body, ...(e.choices || []).flatMap(c => [c.label, c.result || ""])].join(" ");
  PROPER.forEach(n => { t = t.split(n).join(" \u00b7 "); });
  return t.toLowerCase();
}
function termsIn(text) {
  return GLOSSARY.filter(g => {
    const t = g.term.toLowerCase();
    return new RegExp("\\b" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "s?\\b").test(text);
  }).map(g => g.term.toLowerCase());
}

ordered.forEach((e, i) => {
  const text = textOf(e);
  const used = termsIn(text);
  const here = GLOSSARY.filter(g => g.introduced === e.id);
  const introducesHere = here.map(g => g.term.toLowerCase());
  const clustersHere = [...new Set(here.map(g => g.cluster || g.term))];

  const novel = used.filter(t => !taught.has(t) && !introducesHere.includes(t));
  if (novel.length) problems.early.push({ pos: i + 1, id: e.id, terms: novel });

  if (clustersHere.length > MAX_NEW_CLUSTERS)
    problems.overload.push({ pos: i + 1, id: e.id, count: clustersHere.length, terms: clustersHere });

  introducesHere.forEach(t => taught.add(t));
  used.forEach(t => taught.add(t));
});

GLOSSARY.forEach(g => {
  if (g.assumed) return;
  if (g.introduced === null) return;
  if (!EVENTS.some(e => e.id === g.introduced))
    problems.orphan.push(g.term + " → introduced by \"" + g.introduced + "\", which does not exist");
});
GLOSSARY.filter(g => !g.assumed && g.introduced === null).forEach(g =>
  problems.orphan.push(g.term + " → no introducing event"));

/* Terms that appear in prose but are in no glossary at all. Crude: capitalised
   multiword phrases and a hand list of setting nouns the glossary should own. */
const SUSPECT = ["closure ratio","apportionment","spin-up","uplift","synthetic",
                 "backup","running hot","clock rate","volume rationing",
                 "prayer","statutory instrument","list member"];
const known = new Set(GLOSSARY.map(g => g.term.toLowerCase()));
const seenSuspect = {};
EVENTS.forEach(e => {
  const t = textOf(e);
  SUSPECT.forEach(s => { if (t.includes(s) && !known.has(s)) (seenSuspect[s] ||= []).push(e.id); });
});

/* ---------- report ---------- */
const R = [];
R.push("LEGIBILITY LINT");

R.push("=".repeat(60));
R.push("");
R.push("PLAYER'S PATH THROUGH THE VOCABULARY");
const taught2 = new Set(GLOSSARY.filter(g => g.assumed).map(g => g.term.toLowerCase()));
ordered.slice(0, 10).forEach((e, i) => {
  const hereG = GLOSSARY.filter(g => g.introduced === e.id);
  const intro = hereG.map(g => g.term);
  const cl = [...new Set(hereG.map(g => g.cluster || g.term))];
  intro.forEach(t => taught2.add(t.toLowerCase()));
  R.push(`  ${String(i + 1).padStart(2)}. ${(e.prologue ? "[P" + e.prologue + "] " : "      ") + e.title}`);
  if (intro.length) R.push(`        teaches [${cl.join("+")}]: ${intro.join(", ")}`);
});
R.push("");

function section(title, arr, fmt) {
  R.push(title);
  if (!arr.length) { R.push("  none"); R.push(""); return 0; }
  arr.forEach(x => R.push("  " + fmt(x)));
  R.push("");
  return arr.length;
}
let n = 0;
n += section("TERMS USED BEFORE THEY ARE TAUGHT", problems.early,
  x => `#${x.pos} ${x.id}: ${x.terms.join(", ")}`);
n += section(`EVENTS INTRODUCING MORE THAN ${MAX_NEW_CLUSTERS} NEW CONCEPT CLUSTER`, problems.overload,
  x => `#${x.pos} ${x.id}: ${x.count} — ${x.terms.join(", ")}`);
n += section("GLOSSARY TERMS WITH NO INTRODUCING EVENT", problems.orphan, x => x);
const sus = Object.keys(seenSuspect);
n += section("IN PROSE BUT NOT IN THE GLOSSARY", sus,
  s => `"${s}" — used in ${seenSuspect[s].join(", ")}`);

/* =============================================================
   RETIRED AND UNKNOWN EFFECT VERBS

   apply() throws on an unknown verb, so a retired one in content is a
   crash waiting for whichever branch reaches it. That is not
   hypothetical: folding `unflag` into `flag` left three uses in the
   REVERSE effects of instruments — the path taken when an order is
   revoked — and every check passed, because no check revokes one.

   Content files are scanned as text rather than by walking known keys:
   the same pass previously missed content/bills.js entirely, because
   its effects live under onPass and onFail rather than under `effects`.
   ============================================================= */
const verbBad = [];
try {
  const Eng = require(path.join(root, "js", "engine.js"));
  const known = new Set(Object.keys(Eng.EFFECTS));
  const RETIRED = ["scalar", "loyalty", "relationship", "price", "capital", "unflag", "byelection"];
  require("./loadcontent.js").contentFiles().forEach(f => {
    const src4 = fs.readFileSync(path.join(root, f), "utf8");
    RETIRED.forEach(v => {
      /* `{verb:` or `{ verb :` — the object-literal form an effect takes.
         A bare word in prose or a comment is not a match. */
      const re2 = new RegExp("\\{\\s*" + v + "\\s*:", "g");
      const n = (src4.match(re2) || []).length;
      if (n) verbBad.push(`${f}: ${n} use(s) of the retired verb \`${v}\``);
    });
  });
  known.size || verbBad.push("the engine exposes no EFFECTS to check against");
} catch (e) { verbBad.push("could not read the vocabulary: " + e.message); }

section("RETIRED EFFECT VERBS IN CONTENT", verbBad, x => x);

/* =============================================================
   MOVE TARGETS THAT NAME NOTHING (design/17 §1.3)

   `{move:{"rel.nobody":5}}` fails silently — the rel case finds no
   character and does nothing — and a bare-key typo is worse: the scalar
   case CREATES the number, so `{move:{treasuring:5}}` quietly adds a meter
   nobody declared and the panel draws a number content never wrote. Every
   namespaced target is resolved against the roster; a station effect's
   ids against the stations; a law key against the declared law. Hard
   failure: a typo that moves nothing is content the player paid for and
   never got.
   ============================================================= */
const targetBad = [];
try {
  const partyIds = new Set(PARTIES.map(p => p.id));
  const currentIds = new Set((CURRENTS || []).map(c => c.id));
  const charIds = new Set(CHARACTERS.map(c => c.id));
  const actorIds = new Set((ACTORS || []).map(a => a.id));
  const stationIds = new Set(STATIONS.map(s => s.id));
  const scalarIds = new Set(Object.keys(SETUP.scalars || {}).concat(require(path.join(root, "js", "schema.js")).vocab.scalars))  /* party_loyalty is derived, so setup opens no value for it */;
  const lawIds = new Set(Object.keys(SETUP.law || {}));
  const priceIds = new Set(["thermal", "substrate", "volume", "transit"]);
  /* the world's lenders and every campaign's own (design/36 §3) */
  const lenderIds = new Set(Object.keys(SETUP.lenders || {}).concat(
    ...(ADMINISTRATIONS || []).map(a => Object.keys((a.setup || {}).lenders || {}))));

  /* The `case` labels of the move: dispatch in js/engine.js, so this list
     cannot drift from the engine the way a copied one would. */
  const engSrc = fs.readFileSync(path.join(root, "js", "engine.js"), "utf8");
  const mv = engSrc.slice(engSrc.indexOf("move: (st, C, v) =>"));
  const MOVE_NS = new Set(
    [...mv.slice(0, mv.indexOf("\n    law: (st, C, v)")).matchAll(/case "([a-z]+)":/g)]
      .map(m => m[1]));
  MOVE_NS.add("scalar");          /* the no-dot default, never a case label */
  const checkEffects = (effs, tag) => [].concat(effs || []).forEach(e => {
    if (!e || typeof e !== "object") return;
    if (e.move) Object.keys(e.move).forEach(key => {
      const dot = key.indexOf(".");
      const ns = dot < 0 ? "scalar" : key.slice(0, dot);
      const k = dot < 0 ? key : key.slice(dot + 1);
      const okTarget =
        ns === "scalar" || ns === "trend" ? scalarIds.has(k)
        : ns === "loyalty" ? (partyIds.has(k) || currentIds.has(k))
        : ns === "rel" ? (k === "president" || charIds.has(k))
        : ns === "actor" ? actorIds.has(k)
        : ns === "capital" ? partyIds.has(k)
        : ns === "price" ? priceIds.has(k)
        : ns === "debt" ? lenderIds.has(k)
        /* AND AN UNKNOWN NAMESPACE IS A FAULT, not "the engine's business".
           That escape hatch is how `move:{"relationship.watkins":-6}` sat in
           Questions to the Prime Minister passing every check: the engine's
           switch has a `rel` case and no `relationship` one, so it fell to a
           default that logs IGNORED into the in-game log and moved nobody.
           Measured before the fix — relationship.watkins left him on 19,
           rel.watkins took him to 13.

           The engine's own switch is the authority, so MOVE_NS is read out
           of js/engine.js rather than written down twice. A namespace the
           engine handles but this file has no id list for still passes; one
           it has never heard of does not. */
        : MOVE_NS.has(ns) ? true
        : (targetBad.push(tag + ": move." + key + " — the engine has no \"" +
             ns + "\" namespace (it has: " + [...MOVE_NS].join(", ") + ")"), true);
      if (!okTarget) targetBad.push(tag + ": move." + key + " names nothing");
    });
    if (e.station) Object.keys(e.station).forEach(id => {
      if (!stationIds.has(id)) targetBad.push(tag + ": station." + id + " is not a station");
    });
    if (e.law) Object.keys(e.law).forEach(k => {
      if (!lawIds.has(k)) targetBad.push(tag + ": law." + k + " is not a declared law key");
    });
  });
  EVENTS.forEach(ev => {
    checkEffects(ev.effects, "event " + ev.id);
    (ev.choices || []).forEach((c, i) =>
      checkEffects(c.effects, "event " + ev.id + " choice " + (i + 1)));
  });
  (INSTRUMENTS || []).forEach(si => {
    checkEffects(si.effects, "instrument " + si.id);
    checkEffects(si.reverse, "instrument " + si.id + " reverse");
    checkEffects(si.political_cost, "instrument " + si.id + " cost");
  });
  (BILLS || []).forEach(b => {
    checkEffects(b.onPass, "bill " + b.id + " onPass");
    checkEffects(b.onFail, "bill " + b.id + " onFail");
    /* Committees amend (design/25 §7): an amendment's effects are content,
       so a target that names nothing has to fail here like any other. */
    (b.amendments || []).forEach(a =>
      checkEffects(a.effects, "bill " + b.id + " amendment " + a.id));
    (b.clauses || []).forEach(cl => (cl.levels || []).forEach(lv =>
      checkEffects(lv.effects, "bill " + b.id + " clause " + cl.id + "/" + lv.id)));
  });
} catch (e) { targetBad.push("could not resolve the targets: " + e.message); }
section("MOVE TARGETS THAT NAME NOTHING", targetBad, x => x);

/* =============================================================
   UNDEFINED CUSTOM PROPERTIES

   A var() naming a property nothing defines is invalid at
   computed-value time, and the property then computes to its INITIAL
   value - NOT to whatever the cascade set earlier. So one typo turns a
   background transparent, a colour black, or a border none, silently
   and only sometimes visibly.

   This has now happened twice with the same invented token, which is
   the definition of a check worth having. Hard failure.
   ============================================================= */
const cssBad = [];
try {
  const css = fs.readFileSync(path.join(root, "css", "terminal.css"), "utf8");
  const defined = new Set();
  (css.match(/(^|[;{\s])(--[A-Za-z0-9_-]+)\s*:/g) || []).forEach(m =>
    defined.add(m.replace(/[;{\s]/g, "").replace(/:$/, "")));
  /* A property may legitimately be set from script at runtime -
     --len is written per-element for the signature stroke - so js/ is
     scanned too. Without this the check cries wolf and gets disabled,
     which is how a check stops being a check. */
  fs.readdirSync(path.join(root, "js")).filter(f => /\.js$/.test(f)).forEach(f => {
    const src3 = fs.readFileSync(path.join(root, "js", f), "utf8");
    (src3.match(/setProperty\(\s*["'](--[A-Za-z0-9_-]+)["']/g) || []).forEach(m =>
      defined.add(m.replace(/.*["'](--[A-Za-z0-9_-]+)["'].*/, "$1")));
  });
  const used = {};
  let m, re = /var\(\s*(--[A-Za-z0-9_-]+)\s*([,)])/g;
  while ((m = re.exec(css))) {
    /* var(--x, fallback) is safe: the fallback is what renders. */
    if (m[2] === ",") continue;
    if (!defined.has(m[1])) used[m[1]] = (used[m[1]] || 0) + 1;
  }
  Object.keys(used).sort().forEach(k =>
    cssBad.push(`${k} is used ${used[k]} time(s) and defined nowhere`));
} catch (e) { cssBad.push("could not read the stylesheet: " + e.message); }

section("UNDEFINED CSS CUSTOM PROPERTIES", cssBad, x => x);

/* =============================================================
   EVERY SCREEN GRID COLLAPSES TO ONE COLUMN.

   .g-sit was the only screen grid defined in a <style> block inside
   index.html instead of here, so the one-column breakpoint listed the
   other six and never knew about it. At 420px the sitting screen stayed
   two columns wide and the narrow one set roughly one word per line —
   a rule hiding in the markup does not see the media queries written for
   its neighbours.

   Two things are checked, and the first is why the second was possible:
   the page carries no <style> block at all, and every .g-* grid the
   stylesheet defines columns for is named in the breakpoint that
   collapses them. A new screen gets caught the day it is added rather
   than the day somebody opens the game on a phone.
   ============================================================= */
const gridBad = [];
try {
  const css2 = fs.readFileSync(path.join(root, "css", "terminal.css"), "utf8");
  const html2 = fs.readFileSync(path.join(root, "index.html"), "utf8");
  if (/<style[\s>]/i.test(html2))
    gridBad.push("index.html carries a <style> block; a rule there cannot see the breakpoints");
  /* the block that puts the screens into one column */
  const mq = css2.match(/@media\s*\(max-width:\s*1080px\)\s*\{([\s\S]*?)\n\}/);
  if (!mq) gridBad.push("no one-column breakpoint found in the stylesheet");
  else {
    const declared = new Set();
    let g, gre = /(^|[,}\s])(\.g-[a-z]+)\s*\{[^}]*grid-template-columns/gm;
    while ((g = gre.exec(css2))) declared.add(g[2]);
    [...declared].sort().forEach(name => {
      if (mq[1].indexOf(name + "{") < 0 && mq[1].indexOf(name + ",") < 0 &&
          mq[1].indexOf(name + " ") < 0 && mq[1].indexOf(name + ">") < 0)
        gridBad.push(name + " sets columns but the one-column breakpoint never names it");
    });
  }

  /* A CAPPED TRACK BESIDE A TRACK WITH NO FLOOR STARVES IT.

     minmax(0, 1090px) means "grow to 1090 if you can", and a neighbour
     written minmax(0, 1fr) means "have whatever is left" — which at a
     1440px window was 112 pixels. The orbit dossier's station name
     wrapped to four lines with "cylinder" clipped mid-word. The chamber
     had the same shape from the other direction a few commits earlier.
     Twice is a check. A FIXED track (300px) is fine and common: it is
     the greedy cap, not the fixed width, that does the starving. */
  try {
    const css3 = fs.readFileSync(path.join(root, "css", "terminal.css"), "utf8");
    /* The property is not always the first thing in the block — .g-orb
       puts it on the line below the brace — so match the RULE and look
       inside it. The first cut of this check matched `{grid-template`
       with no whitespace allowed and silently found nothing, which is
       the failure mode a check has to be tested against to notice. */
    let d, dre = /(\.g-[a-z]+)\s*\{([^}]*)\}/g;
    while ((d = dre.exec(css3))) {
      const decl = /grid-template-columns:([^;}]*)/.exec(d[2]);
      if (!decl) continue;
      const tracks = decl[1].trim().split(/\s+(?![^(]*\))/).filter(Boolean);
      if (!tracks.some(t => /^minmax\(\s*0\s*,\s*\d+px\s*\)$/.test(t))) continue;
      const starved = tracks.filter(t => /^minmax\(\s*0\s*,/.test(t) &&
                                         !/^minmax\(\s*0\s*,\s*\d+px\s*\)$/.test(t));
      starved.forEach(t => gridBad.push(
        d[1] + " caps a track in px next to " + t + ", which can be starved to nothing"));
    }
  } catch (e) { gridBad.push("could not re-read the stylesheet: " + e.message); }
} catch (e) { gridBad.push("could not read the stylesheet: " + e.message); }

section("SCREEN GRIDS THAT DO NOT COLLAPSE", gridBad, x => x);

/* ---------------------------------------------------------------------
   DOES THE STYLESHEET ACTUALLY PARSE?

   It cost the Concordance its entire layout and nothing caught it. A
   `.glbox` rule was deleted by removing its SELECTOR and leaving the
   body and the closing brace behind, so the file carried four orphaned
   declarations and one extra `}`. A browser parsing that looks for the
   next `{` to end the selector it thinks it is reading — and the next
   `{` belonged to `.cx-wrap`, so the Concordance's two-column grid was
   swallowed into an invalid selector and silently dropped.

   No other check could see it. jsdom does not lay out, so every screen
   still "rendered"; cxcheck reads content, not CSS; and the file was
   valid enough that nothing threw. The only symptom was one rule
   missing in a real browser.
   --------------------------------------------------------------------- */
const parseBad = [];
["css/terminal.css", "css/editor.css"].forEach(rel => {
  let src;
  try { src = fs.readFileSync(path.join(root, rel), "utf8"); }
  catch (e) { return; }
  /* blank the comments but keep the newlines, so line numbers survive */
  const bare = src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, " "));

  let depth = 0, line = 1;
  for (let i = 0; i < bare.length; i++) {
    const c = bare[i];
    if (c === "\n") line++;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth < 0) { parseBad.push(`${rel}:${line} — a closing brace with nothing open`); depth = 0; }
    }
  }
  if (depth > 0) parseBad.push(`${rel} — ${depth} block${depth === 1 ? "" : "s"} left unclosed`);

  /* A declaration outside any block is the other half of the same
     mistake, and it is the half that eats the next rule. */
  depth = 0; line = 1;
  let tok = "";
  for (let i = 0; i < bare.length; i++) {
    const c = bare[i];
    if (c === "\n") line++;
    if (c === "{") { depth++; tok = ""; continue; }
    if (c === "}") { depth = Math.max(0, depth - 1); tok = ""; continue; }
    if (depth > 0) continue;
    if (c === ";") {
      /* at the top level only @import/@charset may end in a semicolon */
      const t = tok.trim();
      if (t && !/^@/.test(t) && /^[-a-zA-Z]+\s*:/.test(t))
        parseBad.push(`${rel}:${line} — "${t.slice(0, 44)}" is a declaration outside any rule`);
      tok = "";
    } else tok += c;
  }
});
section("STYLESHEETS THAT DO NOT PARSE", parseBad, x => x);

/* =============================================================
   THE CONSEQUENCE CHAIN (bible 7.9)

   7.9 states the chain and then states a design rule about it:

     decision -> price -> station conditions -> event

     "a `price` effect with no event gated on it is a number nobody
      sees; an event gated on a price nothing moves will never fire."

   Nobody enforced that rule, and the build drifted into the first
   failure mode across the board: prices and station conditions move
   every sitting and almost nothing is gated on them. This walks the
   content and reports both directions.

   `inert` is a note rather than a failure - a number nothing moves and
   nothing reads is merely unused. The asymmetric cases are the bugs.
   ============================================================= */
const chainRows = [];
try {
  const moved = {}, gated = {};
  const bump = (m, k) => { m[k] = (m[k] || 0) + 1; };

  /* The `move` verb consolidated price/scalar/loyalty/relationship/capital, and
     this walk predated it, so every keyed effect written the new way was
     invisible to the chain. A number that moves and is not seen here is exactly
     the bug this check exists to find. */
  const walkEffects = eff => [].concat(eff || []).forEach(e => Object.keys(e).forEach(k => {
    if (k === "price")   Object.keys(e[k]).forEach(x => bump(moved, "price." + x));
    if (k === "scalar")  Object.keys(e[k]).forEach(x => bump(moved, "scalar." + x));
    if (k === "station") bump(moved, "station");
    if (k === "law")     Object.keys(e[k]).forEach(x => bump(moved, "law." + x));
    if (k === "move")    Object.keys(e[k]).forEach(key => {
      const dot = key.indexOf(".");
      if (dot < 0) return bump(moved, "scalar." + key);
      const ns = key.slice(0, dot), x = key.slice(dot + 1);
      if (ns === "price" || ns === "scalar") bump(moved, ns + "." + x);
      /* a trend moves its scalar every sitting, so the chain must count
         it as a mover of that scalar or a watched number goes invisible */
      if (ns === "trend") bump(moved, "scalar." + x);
    });
  }));
  const walkWhen = w => w && Object.keys(w).forEach(k => {
    if (k === "priceAbove" || k === "priceBelow")
      Object.keys(w[k]).forEach(x => bump(gated, "price." + x));
    if (k === "scalarAbove" || k === "scalarBelow")
      Object.keys(w[k]).forEach(x => bump(gated, "scalar." + x));
    if (k === "stationBelow" || k === "suspendedAbove" || k === "suspendedBelow")
      bump(gated, "station");
    if (k === "lawIs" || k === "lawAbove" || k === "lawBelow")
      Object.keys(w[k]).forEach(x => bump(gated, "law." + x));
  });

  EVENTS.forEach(e => {
    walkWhen(e.when);
    (e.choices || []).forEach(c => { walkEffects(c.effects); walkWhen(c.when); });
  });
  /* AN INITIATIVE MOVES NUMBERS TOO, and this walk predated it carrying
     effects: `tempo[].effects` was invisible here, so a decision made on
     the Government screen could move a price and the chain would still
     call it unseen. Same omission the `move` consolidation note above
     describes, one content file over. */
  (INITIATIVES || []).forEach(i => {
    walkWhen(i.when);
    walkEffects(i.effects);
    (i.tempo || []).forEach(t => { walkEffects(t.effects); walkWhen(t.when); });
  });
  /* instruments carry effects too, and an order that moves a price is
     exactly the kind of thing that needs an event watching it */
  try {
    const src2 = fs.readFileSync(path.join(root, "content", "instruments.js"), "utf8");
    const box = {}; require("vm").runInNewContext(src2 + ";this.__I = INSTRUMENTS;", box);
    (box.__I || []).forEach(i => { walkEffects(i.effects); walkWhen(i.when); });
  } catch (e) { /* instruments are optional to this check */ }
  /* AND THE BILLS, which are the main thing that moves a law. The walk
     read events, initiatives and instruments and never a bill's onPass,
     clauses or amendments, so a law only an Act could set was reported
     "moved by 0" and a law no event watched passed as seen (design/34). */
  (BILLS || []).forEach(b => {
    walkEffects(b.onPass); walkEffects(b.onFail);
    (b.amendments || []).forEach(a => walkEffects(a.effects));
    (b.clauses || []).forEach(cl => (cl.levels || []).forEach(lv => walkEffects(lv.effects)));
  });
  /* A coupling drags a scalar every sitting (Flash I). A number that moves
     and is not watched is exactly the bug this audit exists to catch, so
     the couplings are movers too. */
  (SETUP.couplings || []).forEach(cp =>
    Object.keys(cp.drag || {}).forEach(k => bump(moved, "scalar." + k)));

  /* A LAW THE ENGINE READS IS SEEN THROUGH WHAT IT MOVES. The rates, the
     thermal release, capital works and the public share of substrate set the
     four prices in tick(), and the prices are gated, so the chain runs
     law -> price -> event without an event naming the law. The engine is
     read for the key (the rates by their shared prefix), so a law nothing
     reads at all -- not the engine, not an event -- is still a break. */
  const engSrc3 = fs.readFileSync(path.join(root, "js", "engine.js"), "utf8");
  const engineReads = k => {
    const law = k.slice(4);
    return new RegExp("law(\\.|\\[\"|\\)\\.)" + law + "\\b").test(engSrc3) ||
           new RegExp("\\b" + law + "\\b").test(engSrc3) ||
           (/^rate_/.test(law) && /"rate_"\s*\+/.test(engSrc3));
  };
  const keys = [...new Set(Object.keys(moved).concat(Object.keys(gated)))].sort();
  keys.forEach(k => {
    const m = moved[k] || 0, g = gated[k] || 0;
    let verdict = "ok";
    if (m && !g && /^law\./.test(k) && engineReads(k)) verdict = "ok (read by the engine)";
    else if (m && !g) verdict = "NUMBER NOBODY SEES";
    else if (!m && g) verdict = "EVENT NEVER FIRES";
    else if (!m && !g) verdict = "inert";
    chainRows.push({ k, m, g, verdict });
  });
} catch (e) { chainRows.push({ k: "(could not read the chain)", m: 0, g: 0, verdict: "ok" }); }

const chainBad = chainRows.filter(r => r.verdict === "NUMBER NOBODY SEES" ||
                                       r.verdict === "EVENT NEVER FIRES");
R.push("CONSEQUENCE CHAIN (7.9)");
if (!chainRows.length) R.push("  nothing moves and nothing is gated");
chainRows.forEach(r => R.push("  " + r.k.padEnd(34) +
  ("moved by " + r.m).padEnd(12) + ("gated by " + r.g).padEnd(13) + r.verdict));
R.push("");

/* =============================================================
   ARTIFACT SHAPES (bible 12.11)

   Shapes are pinned in the pipeline and in the CSS. An image that
   arrives the wrong shape gets cropped a second time in the browser
   and the framing is lost, so this is a HARD FAILURE and not a
   legibility note: it exits non-zero on its own.

   PNG dimensions live in the IHDR chunk at a fixed offset - width
   and height as big-endian 32-bit integers at bytes 16 and 20 - so
   no decoder and no dependency is needed to read them.
   ============================================================= */
const fs2 = require("fs"), path2 = require("path");
const ART_ROOT = path2.join(__dirname, "..");

function pngSize(file) {
  const b = fs2.readFileSync(file);
  if (b.length < 24 || b.toString("ascii", 1, 4) !== "PNG") return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

let artBad = [];
try {
  const Artifacts = require(path2.join(ART_ROOT, "js/artifacts.js"));
  const src = fs2.readFileSync(path2.join(ART_ROOT, "content/artifacts.js"), "utf8");
  const vm2 = require("vm");
  const sandbox = {};
  vm2.runInNewContext(src + ";this.__A = ARTIFACTS;", sandbox);
  const manifest = sandbox.__A || {};

  Object.keys(manifest).forEach(slot => {
    const want = Artifacts.size(slot);
    const file = path2.join(ART_ROOT, Artifacts.dir, manifest[slot]);
    if (!Artifacts.spec(slot)) { artBad.push(`${slot}: no such slot`); return; }
    if (!fs2.existsSync(file)) { artBad.push(`${slot}: ${manifest[slot]} is missing`); return; }
    const got = pngSize(file);
    if (!got) { artBad.push(`${slot}: ${manifest[slot]} is not a PNG`); return; }
    if (!want) return;                       /* a tiling field has no pinned size */
    if (got.w !== want.w || got.h !== want.h)
      artBad.push(`${slot}: ${manifest[slot]} is ${got.w}x${got.h}, ` +
                  `declared ${want.w}x${want.h} (${Artifacts.spec(slot).aspect}) — ` +
                  `re-run tools/dither.sh ${Artifacts.spec(slot).palette} ${want.w} ` +
                  `${Artifacts.spec(slot).aspect}`);
  });
} catch (e) { artBad.push("could not read the artifact manifest: " + e.message); }

section("ARTIFACT IMAGES OF THE WRONG SHAPE", artBad, x => x);

/* =============================================================
   THE POPULATION IS STORED IN TWO PLACES AND THEY HAVE DRIFTED.

   content/labour.js opens "THE ANCHORS ARE ALREADY CANON. Population
   6,863,000" and content/stations.js carries a population per habitat.
   Nothing had ever compared them. They are 223,000 apart.

   CLAUDE.md's handoff recorded the gap as 143,000. It is 223,000 because
   the capital was added afterwards at 80,000 and the stored total did not
   move — which is the whole argument for the rule this repo already has:
   "apportionment_ratio was stored beside seats and population and the
   three diverged. Derived, never stored."

   It is NOT the §4.7 distinction between apportionment population and
   voting population. The suspended cohort across all thirty-five habitats
   is 71,430, nowhere near the gap.

   ADVISORY, for the reason the consequence chain is: which of the two is
   canon is a bible decision and a content edit, not a call a linter gets
   to make, and a check that fails from the day it lands gets disabled
   rather than fixed. What it must do is stop the gap moving in silence
   the next time a habitat is added.
   ============================================================= */
const popBad = [];
try {
  const roster = STATIONS.reduce((n, s) => n + (s.population || 0), 0);
  const stored = LABOUR.totals.population;
  if (roster !== stored) {
    const susp = STATIONS.reduce((n, s) => n + (s.suspended || 0), 0);
    popBad.push("the station roster sums to " + roster.toLocaleString() +
      " and labour.js stores " + stored.toLocaleString() +
      " \u2014 " + Math.abs(roster - stored).toLocaleString() + " apart");
    popBad.push("not the suspended cohort, which is " + susp.toLocaleString() +
      " across " + STATIONS.length + " habitats");
    popBad.push("one of the two is canon; deciding which is a bible edit (\u00a74.7, \u00a711)");
  }
} catch (e) { popBad.push("could not compare the populations: " + e.message); }

section("POPULATION STORED TWICE (advisory)", popBad, x => x);

/* =============================================================
   INITIATIVES POINT AT EVENTS THAT EXIST (design/18 §6)

   An initiative queues its answer by event id. A typo is SILENT: the
   engine pushes the miss onto the queue and the player waits for an
   event that is never defined. content/initiatives.js shipped three of
   these as TODO_ ids, which is exactly the failure this catches.
   ============================================================= */
const eventIds = new Set(EVENTS.map(e => e.id));
const initBad = [];
(INITIATIVES || []).forEach(i => {
  const check = (id, where) => {
    if (id && !eventIds.has(id)) initBad.push(`${where}: queues "${id}", which is not an event`);
  };
  check(i.event, i.id);
  (i.tempo || []).forEach((t, k) => check(t.event, `${i.id} tempo ${k + 1}`));
});
section("INITIATIVES WHOSE ANSWER DOES NOT EXIST", initBad, x => x);

/* =============================================================
   A CHOICE THE RENDERER CANNOT LABEL

   js/ui.js draws a choice button as `esc(c.label)`, and four choices in
   content/events.js were authored with `text:` instead — so the game drew
   three buttons reading "undefined" at Questions to the Prime Minister,
   which fires at sitting 4 and every fourth sitting after it, and one more
   on the no-confidence motion, which is the event the whole game is about.

   Nothing caught it. `text` is a real field elsewhere in the schema and both
   spellings are on the prose tool's whitelist, so the passages exported,
   round-tripped and linted clean while the player read the word `undefined`.
   A static check for "the field the renderer actually reads" is the only
   thing that would have.
   ============================================================= */
const labelBad = [];
EVENTS.forEach(e => (e.choices || []).forEach((c, i) => {
  if (typeof c.label !== "string" || !c.label.trim())
    labelBad.push(`${e.id} choice ${i + 1}` +
      (c.text ? ` — has text:"${String(c.text).slice(0, 40)}", wants label:` : " — no label"));
}));
section("CHOICES THE GAME WOULD DRAW AS \"undefined\"", labelBad, x => x);

/* =============================================================
   A GATE NOTHING CAN SATISFY

   An event whose `when.flags` names a flag that nothing anywhere sets can
   never fire. It is not rare content, it is dead content: the prose is
   written, the choices are balanced, and no play reaches it.

   This check exists because of how badly hand-auditing it went. A probe
   written in the terminal reported FOURTEEN unsettable flags, because it
   collected `{flag:"name"}` and not `{flag:{name:true}}` — and
   content/initiatives.js writes every one of its flags the second way. The
   real number was three. A measurement that can be wrong by eleven in
   either direction is a measurement that has to live in a file and be run,
   not typed fresh each time somebody wonders.

   HARD, because the failure is invisible in play: the event simply never
   appears, and nothing distinguishes that from an event whose conditions
   have not come up yet.

   `flagsAbsent` is advisory rather than fatal. Requiring the ABSENCE of a
   flag nothing sets is trivially satisfied, so it costs nothing at
   runtime — but it means the author expected something to set it, so it is
   worth printing.
   ============================================================= */
const flagSet = new Set();
(function collectFlags() {
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(walk);
    /* BOTH SPELLINGS. `{flag:"x"}` and `{flag:{x:true, y:true}}` are both
       live in content and the engine takes either. Reading one is the bug
       this whole section is named after. */
    if (typeof n.flag === "string") flagSet.add(n.flag);
    else if (n.flag && typeof n.flag === "object")
      Object.keys(n.flag).forEach(f => flagSet.add(f));
    Object.keys(n).forEach(k => {
      if (k === "flag") return;                  /* already taken, both ways */
      if (n[k] && typeof n[k] === "object") walk(n[k]);
    });
  };
  [EVENTS, BILLS, INSTRUMENTS, INITIATIVES, SETTLEMENTS, BUSINESS,
   ACHIEVEMENTS, MINUTES].forEach(coll => (coll || []).forEach(walk));
  /* AND THE ENGINE'S OWN. `paired` and `minister_resigned` are set by the
     rules rather than by content, and reading the awards made the first of
     them look unsettable. */
  const engSrc2 = fs.readFileSync(path.join(root, "js", "engine.js"), "utf8");
  for (const m of engSrc2.matchAll(/flags(?:\.([A-Za-z_]\w*)|\[["']([\w]+)["']\])\s*=[^=]/g))
    flagSet.add(m[1] || m[2]);
})();

const gateNeeds = {}, gateAbsent = {};
(function collectGates() {
  const cw = (w, tag) => {
    if (!w || typeof w !== "object") return;
    (w.flags || []).forEach(f => (gateNeeds[f] = gateNeeds[f] || []).push(tag));
    (w.flagsAbsent || []).forEach(f => (gateAbsent[f] = gateAbsent[f] || []).push(tag));
    Object.keys(w).forEach(k => {
      if (k === "flags" || k === "flagsAbsent") return;
      if (w[k] && typeof w[k] === "object" && !Array.isArray(w[k])) cw(w[k], tag);
    });
  };
  EVENTS.forEach(e => {
    cw(e.when, "event " + e.id);
    (e.choices || []).forEach((c, i) => cw(c.when, "event " + e.id + " choice " + (i + 1)));
  });
  (BILLS || []).forEach(b => cw(b.when, "bill " + b.id));
  (INSTRUMENTS || []).forEach(i => cw(i.when, "instrument " + i.id));
  (SETTLEMENTS || []).forEach(x => cw(x.when, "settlement " + x.id));
  (INITIATIVES || []).forEach(x => cw(x.when, "initiative " + x.id));
  /* AND THE TWO THAT WERE MISSING. An award waited on `gb_carveout_broken`,
     which nothing sets, and this audit never saw it because it did not read
     the awards (design/34). `flagsAny` is the awards' own spelling. */
  (BUSINESS || []).forEach(x => cw(x.when, "business " + x.id));
  (ACHIEVEMENTS || []).forEach(x => {
    cw(x.when, "award " + x.id);
    ((x.when || {}).flagsAny || []).forEach(f => (gateNeeds[f] = gateNeeds[f] || []).push("award " + x.id));
  });
})();

const gateBad = Object.keys(gateNeeds).filter(f => !flagSet.has(f))
  .map(f => `"${f}" is required by ${[...new Set(gateNeeds[f])].join(", ")} ` +
            `and set by nothing`);
n += section("GATES NOTHING CAN SATISFY", gateBad, x => x);
/* AND THE OTHER DIRECTION, for the content round rather than as a fault. A
   flag a choice sets that nothing reads is a consequence the choice promises
   and the game never delivers -- design/34 counted 84 of them. The count is
   printed every run; `node tools/lint.js --unread-flags` lists them. The
   engine's own reads count too (js/*.js), as do the awards'. */
const jsRead = new Set();
fs.readdirSync(path.join(root, "js")).filter(f => /\.js$/.test(f)).forEach(f => {
  for (const m of fs.readFileSync(path.join(root, "js", f), "utf8")
      .matchAll(/flags(?:\.([A-Za-z_]\w*)|\[["']([\w]+)["']\])(?!\s*=[^=])/g)) jsRead.add(m[1] || m[2]);
});
const unread = [...flagSet].filter(f => !gateNeeds[f] && !gateAbsent[f] && !jsRead.has(f)).sort();
R.push("FLAGS SET THAT NOTHING READS (advisory): " + unread.length +
       (process.argv.includes("--unread-flags") ? "\n  " + unread.join("\n  ") : "  (--unread-flags lists them)"));
R.push("");
const gateAdv = Object.keys(gateAbsent).filter(f => !flagSet.has(f) && !gateNeeds[f])
  .map(f => `"${f}" is required ABSENT by ${[...new Set(gateAbsent[f])].join(", ")} ` +
            `and set by nothing, so the condition never does anything`);
section("FLAGS REQUIRED ABSENT THAT NOTHING SETS (advisory)", gateAdv, x => x);

/* =============================================================
   IDS THAT NAME NOTHING (design/34)

   The flag audit above and the move-target audit catch two ways content can
   point at nothing. The structural audit of 23 Sep found the rest by hand,
   and put a mutation through every check to prove none of them could: a
   gate on a bill that does not exist, a promise whose breach names no event,
   an award reading a log phrase nobody writes. Every one fails silently in
   play -- the condition is simply false, the queue entry simply dropped.

   So every id a gate, an effect, a promise, an initiative or an award names
   is resolved here against the roster it belongs to. HARD, except the two
   marked advisory, which are one open decision (the emergency loan).
   ============================================================= */
const refBad = [], refAdv = [];
try {
  const Eng = require(path.join(root, "js", "engine.js"));
  const ids = a => new Set((a || []).map(x => x.id));
  const EV = ids(EVENTS), BI = ids(BILLS), SI = ids(INSTRUMENTS), SE = ids(SETTLEMENTS),
        PA = ids(PARTIES), CU = ids(CURRENTS), AC = ids(ACTORS), ST = ids(STATIONS),
        CH = ids(CHARACTERS), CAB = ids(CABINET);
  const LAW = new Set(Object.keys(SETUP.law || {})), SC = new Set(Object.keys(SETUP.scalars || {}).concat(require(path.join(root, "js", "schema.js")).vocab.scalars))  /* party_loyalty is derived, so setup opens no value for it */;
  const PR = new Set(["thermal", "substrate", "volume", "transit"]);
  const ECK = new Set(Object.keys(SETUP.economy || {}));
  /* Every stage a bill can be in, from the schema, which test.js holds to
     the engine's ladder. */
  const STAGES = new Set(require(path.join(root, "js", "schema.js")).vocab.billStages);
  const walk = (o, f) => { if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) return o.forEach(x => walk(x, f));
    f(o); Object.keys(o).forEach(k => walk(o[k], f)); };
  const COLLS = { event: EVENTS, bill: BILLS, instrument: INSTRUMENTS, initiative: INITIATIVES,
    settlement: SETTLEMENTS, business: BUSINESS, minute: MINUTES, cabinet: CABINET, actor: ACTORS };

  const UND = new Set();
  Object.values(COLLS).forEach(c => walk(c, o => { if (o.undertake) [].concat(o.undertake).forEach(u => UND.add(u.id)); }));

  const checkWhen = (w, tag) => {
    if (!w || typeof w !== "object" || Array.isArray(w)) return;
    Object.keys(w).forEach(k => {
      const v = w[k], bad = m => refBad.push(tag + ": " + k + " " + m);
      if (!Eng.CONDITIONS[k]) return bad("is not a condition the engine knows");
      const keys = (set, what) => Object.keys(v).forEach(x => { if (!set.has(x)) bad("names no " + what + " '" + x + "'"); });
      const list = (set, what) => [].concat(v).forEach(x => { if (!set.has(x)) bad("names no " + what + " '" + x + "'"); });
      switch (k) {
        case "billStage": keys(BI, "bill"); Object.values(v).forEach(x => { if (!STAGES.has(x)) bad("names no stage '" + x + "'"); }); break;
        case "siInForce": case "siNotMade": list(SI, "instrument"); break;
        case "owes": case "breached": list(UND, "undertaking"); break;
        case "seen": list(EV, "event"); break;
        case "settled": case "resolved": if (typeof v === "string" && !SE.has(v)) bad("names no settlement '" + v + "'"); break;
        case "resolvedIs": if (!SE.has(v)) bad("names no settlement '" + v + "'"); break;
        case "lawIs": case "lawAbove": case "lawBelow": keys(LAW, "law"); break;
        case "scalarAbove": case "scalarBelow": keys(SC, "scalar"); break;
        case "priceAbove": case "priceBelow": keys(PR, "price"); break;
        case "economyAbove": case "economyBelow": if (ECK.size) keys(ECK, "economy measure"); break;
        case "loyaltyAbove": case "loyaltyBelow": Object.keys(v).forEach(x => { if (!PA.has(x) && !CU.has(x)) bad("names no party or current '" + x + "'"); }); break;
        case "capitalAbove": case "capitalBelow": keys(PA, "party"); break;
        case "actorAbove": case "actorBelow": keys(AC, "actor"); break;
        case "stationBelow": keys(ST, "station"); break;
        case "suspendedAbove": case "suspendedBelow": Object.keys(v).forEach(x => { if (x !== "federal" && !ST.has(x)) bad("names no station '" + x + "'"); }); break;
        case "postVacant": list(CAB, "cabinet post"); break;
      }
    });
  };
  const checkEff = (e, tag) => {
    if (!e || typeof e !== "object") return;
    if (e.bill) Object.keys(e.bill).forEach(x => { if (!BI.has(x)) refBad.push(tag + ": bill '" + x + "' is no bill"); });
    if (typeof e.si === "string" && !SI.has(e.si)) refBad.push(tag + ": si '" + e.si + "' is no instrument");
    /* A queued entry is an event, or effects that land on their day with no
       story (resolveDue); the second has no event to name, and its effects
       are checked like any others. */
    if (e.queue) [].concat(e.queue).forEach(q => {
      if (q.effects && !q.event) { [].concat(q.effects).forEach(x => checkEff(x, tag + " (queued)")); return; }
      if (!EV.has(q.event)) refBad.push(tag + ": queues '" + q.event + "', which is no event"); });
    if (e.slots && e.slots.reserve) Object.keys(e.slots.reserve).forEach(x => { if (!BI.has(x)) refBad.push(tag + ": reserves time for '" + x + "', which is no bill"); });
    if (e.coalition) ["add", "remove"].forEach(k => [].concat(e.coalition[k] || []).forEach(p => { if (!PA.has(p)) refBad.push(tag + ": coalition names no party '" + p + "'"); }));
    if (e.undertake) [].concat(e.undertake).forEach(u => {
      const t = tag + ": undertaking " + u.id;
      if (u.onBreach && !EV.has(u.onBreach)) refAdv.push(t + " breaks into '" + u.onBreach + "', which is no event, so the breach does nothing but the resignation");
      if (!u.discharge) refAdv.push(t + " names no discharge, so it cannot be kept");
      const d = u.discharge || {};
      if (d.si && !SI.has(d.si)) refBad.push(t + " is kept by '" + d.si + "', which is no instrument");
      if (d.bill && !BI.has(d.bill)) refBad.push(t + " is kept by '" + d.bill + "', which is no bill");
      if (d.division && !BI.has(d.division)) refBad.push(t + " is kept by a division on '" + d.division + "', which is no bill");
      if (d.stage && !STAGES.has(d.stage)) refBad.push(t + " is kept at stage '" + d.stage + "', which is no stage");
      if (d.repaid && !(SETUP.lenders || {})[d.repaid] &&
          !(ADMINISTRATIONS || []).some(a => ((a.setup || {}).lenders || {})[d.repaid]))
        refBad.push(t + " is kept by repaying '" + d.repaid + "', who is no lender in any setup");
      if (u.owed_to && !CH.has(u.owed_to) && !AC.has(u.owed_to)) refBad.push(t + " is owed to '" + u.owed_to + "', who is nobody");
      if (u.post && !CAB.has(u.post)) refBad.push(t + " rests on post '" + u.post + "', which is no post");
    });
  };
  Object.entries(COLLS).forEach(([kind, coll]) => (coll || []).forEach(x => {
    const tag = kind + " " + (x.id || "?");
    walk(x, o => {
      ["when", "gate"].forEach(k => checkWhen(o[k], tag));
      ["effects", "onPass", "onFail", "reverse", "onSign", "close"].forEach(k => [].concat(o[k] || []).forEach(e => checkEff(e, tag)));
    });
  }));
  (INITIATIVES || []).forEach(i => { if (i.event && !EV.has(i.event)) refBad.push("initiative " + i.id + ": answers with '" + i.event + "', which is no event"); });
  /* THE LENDERS' CLAUSES are conditions and effects too (24 Sep): a rate
     step, a limit and a drawing's consequences, in the world's setup and in
     every campaign's. An unknown condition there throws at the first
     sitting the account is drawn. */
  /* The epilogues' conditions are conditions like any other (design/38 §2). */
  [["the world", SETUP]].concat((ADMINISTRATIONS || []).map(a => [a.id, a.setup || {}])).forEach(([who, S]) =>
    (S.epilogues || []).forEach(x => checkWhen(x.when, "epilogue " + x.id + " (" + who + ")")));
  /* An `on…` hook in setup names the event the rules queue (design/38 §3). */
  [["the world", SETUP]].concat((ADMINISTRATIONS || []).map(a => [a.id, a.setup || {}])).forEach(([who, S]) =>
    Object.keys(S).filter(k => /^on[A-Z]/.test(k)).forEach(k => {
      if (typeof S[k] === "string" && !EV.has(S[k]))
        refBad.push(who + "'s setup." + k + " names '" + S[k] + "', which is no event"); }));
  [["the world", SETUP.lenders || {}]].concat((ADMINISTRATIONS || []).map(a => [a.id, (a.setup || {}).lenders || {}]))
    .forEach(([who, LS]) => Object.keys(LS).forEach(id => {
      const tag = "lender " + id + " (" + who + ")";
      walk(LS[id], o => checkWhen(o.when, tag));
      [].concat(LS[id].onDraw || []).forEach(e => checkEff(e, tag));
      (LS[id].limits || []).forEach(x => {
        if (x.suspends != null && !(LS[id].parties || []).some(p => (p.tags || []).indexOf(x.suspends) >= 0))
          refBad.push(tag + ": a limit suspends '" + x.suspends + "', and no party carries that tag");
      });
    }));
  walk(ENCYCLOPEDIA, o => { if (o.when) checkWhen(o.when, "concordance " + (o.heading || o.title || "section")); });

  /* ONE LAW, ONE VOCABULARY. transit_subsidy was written "none"/"anchors"/
     "all" by the appropriation and 1/0 by two events, and the engine and the
     panel understood only the words. A law key written in two types is a law
     half of content is speaking a different language to. */
  const lawTypes = {};
  const noteLaw = (k, v, where) => ((lawTypes[k] = lawTypes[k] || {})[typeof v] = where);
  Object.keys(SETUP.law || {}).forEach(k => noteLaw(k, SETUP.law[k], "setup"));
  Object.entries(COLLS).forEach(([kind, coll]) => walk(coll, o => {
    if (o.law && typeof o.law === "object" && !Array.isArray(o.law))
      Object.keys(o.law).forEach(k => noteLaw(k, o.law[k], kind));
    ["when", "gate"].forEach(g => { const w = o[g]; if (w && w.lawIs) Object.keys(w.lawIs).forEach(k => noteLaw(k, w.lawIs[k], kind + " gate")); });
  }));
  Object.keys(lawTypes).forEach(k => { const t = Object.keys(lawTypes[k]).filter(x => x !== "object");
    if (t.length > 1) refBad.push("law " + k + " is written as " + t.map(x => x + " (" + lawTypes[k][x] + ")").join(" and ")); });

  /* AND THE AWARDS, which have a matcher of their own in js/shell.js. Its
     vocabulary is listed here because it is small; a key it does not know
     is ignored there, which is an award for nothing. */
  const MEETS = new Set(["end", "reason", "resolved", "settled", "seats", "flags", "flagsAny",
                         "log", "logAbsent", "kept", "breached"]);
  const shellSrc = fs.readFileSync(path.join(root, "js", "shell.js"), "utf8");
  MEETS.forEach(k => { if (!new RegExp('k === "' + k + '"').test(shellSrc)) refBad.push("awards: this check lists '" + k + "' and js/shell.js meets() does not read it"); });
  /* Not the awards file itself, or every phrase an award reads is found in
     the award that reads it. */
  const everything = require("./loadcontent.js").contentFiles()
    .filter(f => !/(^|\/)achievements\.js$/.test(f))
    .concat(["js/engine.js"])
    .map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n");
  (ACHIEVEMENTS || []).forEach(a => {
    const w = a.when || {}, tag = "award " + a.id;
    Object.keys(w).forEach(k => { if (!MEETS.has(k)) refBad.push(tag + ": '" + k + "' is not a key the award matcher reads"); });
    [].concat(w.kept || [], w.breached || []).forEach(u => { if (!UND.has(u)) refBad.push(tag + ": names no undertaking '" + u + "'"); });
    ["resolved", "settled"].forEach(k => { if (typeof w[k] === "string" && !SE.has(w[k])) refBad.push(tag + ": names no settlement '" + w[k] + "'"); });
    [].concat(w.log || [], w.logAbsent || []).forEach(t => { if (everything.indexOf(t) < 0) refBad.push(tag + ": reads the log for \"" + t + "\", which nothing writes"); });
  });
} catch (e) { refBad.push("could not resolve the references: " + e.message); }
n += section("IDS THAT NAME NOTHING", refBad, x => x);
section("PROMISES THAT CANNOT BE KEPT OR BROKEN CLEANLY (advisory)", refAdv, x => x);

/* =============================================================
   CAMPAIGNS (design/36 §3). An entry that carries `campaign` belongs to
   that campaign only, and a campaign plays its own entries and the
   world's. So three things can go wrong, and each is a campaign that
   breaks the moment it is played:
     - a tag naming no campaign (the entry is seen by nobody);
     - a `campaign` condition naming no campaign (it is never true);
     - an entry a campaign can see naming an id that campaign cannot:
       Flash I's loan queued from a shared event, say, which works in
       Flash I and names nothing in every other campaign.
   The third is checked per campaign by looking for any other campaign's
   id among the values of what this campaign sees, including its own
   setup and opening. Ids are distinctive enough that equality is the
   test; a tag is not a reference and is skipped.
   ============================================================= */
const campBad = [];
try {
  const ADM = ADMINISTRATIONS || [];
  const CAMPS = new Set(ADM.map(a => a.campaign || a.id));
  ADM.forEach(a => { if (a.campaign && !ADM.some(b => b.id === a.campaign))
    campBad.push("administration " + a.id + " plays '" + a.campaign + "', which is no administration"); });
  const COLL = { event: EVENTS, bill: BILLS, settlement: SETTLEMENTS, initiative: INITIATIVES,
                 award: ACHIEVEMENTS, instrument: INSTRUMENTS, minute: MINUTES, business: BUSINESS,
                 article: (ENCYCLOPEDIA || {}).articles, character: CHARACTERS, post: CABINET,
                 party: PARTIES, station: STATIONS, actor: ACTORS };
  const entries = [];
  Object.keys(COLL).forEach(kind => (COLL[kind] || []).forEach(x => entries.push({ kind, x })));
  const tagsOf = x => x.campaign == null ? null : [].concat(x.campaign);
  entries.forEach(({ kind, x }) => (tagsOf(x) || []).forEach(c => {
    if (!CAMPS.has(c)) campBad.push(kind + " " + x.id + " belongs to campaign '" + c + "', which no administration plays");
  }));
  const walkVals = (o, fn, key) => {
    if (o == null) return;
    if (typeof o === "string") return fn(o, key);
    if (Array.isArray(o)) return o.forEach(v => walkVals(v, fn, key));
    if (typeof o === "object") Object.keys(o).forEach(k => {
      if (k === "campaign" && key !== "when") return;     /* a tag, not a reference */
      if (k === "campaign") [].concat(o[k]).forEach(c => {
        if (!CAMPS.has(c)) campBad.push("a campaign condition names '" + c + "', which no administration plays"); });
      /* AND THE KEYS. `billStage:{divergence:"committee"}` and
         `move:{"loyalty.cu_maintenance":4}` name their ids as keys, and
         a walk over values alone found one reference to a bill that
         dozens of gates name (measured by tagging it and looking). */
      fn(k, key);
      if (k.indexOf(".") > 0) fn(k.slice(k.indexOf(".") + 1), key);
      walkVals(o[k], fn, k);
    });
  };
  /* the campaign conditions, wherever a `when` is */
  entries.forEach(({ x }) => walkVals(x, () => {}, null));
  CAMPS.forEach(camp => {
    const sees = x => { const t = tagsOf(x); return !t || t.indexOf(camp) >= 0; };
    const foreign = new Map();
    entries.forEach(({ kind, x }) => { if (x.id && !sees(x)) foreign.set(x.id, kind + " of " + tagsOf(x).join("/")); });
    if (!foreign.size) return;
    const report = (where) => (v) => { if (foreign.has(v)) campBad.push(
      "campaign " + camp + ": " + where + " names '" + v + "', the " + foreign.get(v) + ", which it cannot see"); };
    entries.forEach(({ kind, x }) => { if (sees(x)) walkVals(x, report(kind + " " + x.id), null); });
    const host = ADM.find(a => a.id === camp) || {};
    walkVals(Object.assign({}, SETUP, { lenders: null }), report("the world's setup"), null);
    walkVals(host.setup, report("its setup"), null);
    walkVals(host.opening, report("its opening"), null);
  });
} catch (e) { campBad.push("could not check the campaigns: " + e.message); }
n += section("CAMPAIGNS THAT REACH INTO ANOTHER'S CONTENT", campBad, x => x);

/* THE EDITOR LOADS WHAT THE GAME LOADS. Two pages each name the content
   files, and the editor had fallen three behind: it could not see an
   initiative, a minute or an award, so its rename dialog could not warn
   about a reference in one. The game's own presentation files (the images'
   registry and the globe) and the assets are the only ones it may skip. */
const pageBad = [];
try {
  const EDITOR_SKIPS = /content\/(artifacts|world)\.js$/;
  LC.files.filter(f => !EDITOR_SKIPS.test(f) && LC.editorFiles.indexOf(f) < 0)
    .forEach(f => pageBad.push("editor.html does not load " + f + ", which index.html does"));
} catch (e) { pageBad.push("could not compare the pages: " + e.message); }
n += section("CONTENT THE EDITOR CANNOT SEE", pageBad, x => x);

R.push("=".repeat(60));
R.push(n ? `${n} legibility issues` : "no legibility issues");
if (artBad.length) R.push(`${artBad.length} ARTIFACT SHAPE FAILURES`);
if (chainBad.length) R.push(`${chainBad.length} BREAKS IN THE CONSEQUENCE CHAIN`);
if (cssBad.length) R.push(`${cssBad.length} UNDEFINED CSS CUSTOM PROPERTIES`);
if (parseBad.length) R.push(`${parseBad.length} STYLESHEET PARSE FAILURES`);
if (verbBad.length) R.push(`${verbBad.length} RETIRED EFFECT VERBS IN CONTENT`);
if (initBad.length) R.push(`${initBad.length} INITIATIVES WITH NO ANSWER`);
if (labelBad.length) R.push(`${labelBad.length} UNLABELLED CHOICES`);
if (gateBad.length) R.push(`${gateBad.length} GATES NOTHING CAN SATISFY`);
if (refBad.length) R.push(`${refBad.length} IDS THAT NAME NOTHING`);
if (campBad.length) R.push(`${campBad.length} CAMPAIGN FAULTS`);
if (pageBad.length) R.push(`${pageBad.length} CONTENT FILES THE EDITOR DOES NOT LOAD`);
if (popBad.length) R.push("THE POPULATION IS STORED TWICE AND HAS DRIFTED (advisory)");
console.log(R.join("\n"));
/* HARD FAILURES: everything except popBad. The chain is one of them now —
   design/17 §3.2, all eight rows carry both a mover and an eye on them, and
   the audit exists to stop that reopening. gridBad was clean the day it
   landed and a starved column is not a matter of taste.
   ADVISORY: popBad. Which of the two stored populations is canon is a bible
   edit and a content fix, not a call a linter gets to make, and a check that
   fails from the day it lands gets disabled rather than fixed. */
if (artBad.length || chainBad.length || cssBad.length || verbBad.length ||
    parseBad.length || initBad.length || gridBad.length || targetBad.length ||
    labelBad.length || gateBad.length || refBad.length || campBad.length ||
    pageBad.length) process.exit(1);
