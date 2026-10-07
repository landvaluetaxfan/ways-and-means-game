#!/usr/bin/env node
/* =============================================================
   PARK. Move entries out of a content file into the "parked" campaign.

     node tools/park.js <plan.json> [--dry]

   WHY. design/80: the playable game is Act I, and everything written for
   later acts is retired from it. Deleting would lose it (AGENTS.md: cut
   events are archived, never deleted) and would break every test that
   names a story bill or event. So a retired entry is MOVED, byte for byte,
   with the comments that lead it, into content/campaigns/parked/<kind>.js,
   a `campaign("parked", {...})` call. The tag keeps it out of Flash I's
   view (CONTENT.forCampaign), the all-campaigns content still holds it, and
   the itch.io build leaves the folder out (its script tags are `data-dev`).
   The world's view, which test.js plays on, does NOT include a parked entry:
   a test that names one needs it left in place, untagged, as a fixture.

   A PLAN is JSON: a list of
     { "file": "content/events.js", "kind": "events", "list": "EVENTS",
       "keep": ["id", ...] }                  a top-level `const EVENTS = [...]`
     { "file": "content/campaigns/flash_i/events.js", "kind": "events",
       "call": "campaign", "keep": [] }       a campaign("id", { events: [...] })
   Everything in the array that is not in `keep` is parked. An element that is
   not an object literal (a spread, a call) is left where it is and reported.

   IT PROVES THE MOVE with tools/park.js --verify <original-root>: every
   collection of the raw content is compared with the original's, entry by
   entry, ignoring only the `campaign` tag, which must read "parked" on the
   entries that moved.

   The parser is acorn. It is a development tool, not a dependency of the
   game: it is found beside a global eslint if the project does not have it.
   ============================================================= */
"use strict";
const fs = require("fs"), path = require("path");
function load(name) {
  for (const p of [name, "/opt/node22/lib/node_modules/eslint/node_modules/" + name]) {
    try { return require(p); } catch (e) { /* next */ }
  }
  throw new Error("park: cannot find " + name);
}
const root = path.join(__dirname, "..");

function parse(src) {
  const acorn = load("acorn");
  return acorn.parse(src, { ecmaVersion: "latest", sourceType: "script", ranges: true, locations: false });
}
const keyName = p => p.key && (p.key.type === "Identifier" ? p.key.name : p.key.value);
const idOf = el => {
  const p = el.properties.find(x => x.type === "Property" && keyName(x) === "id");
  return p && p.value.type === "Literal" ? p.value.value : null;
};

function findArray(ast, spec) {
  for (const n of ast.body) {
    if (spec.list && n.type === "VariableDeclaration") {
      const d = n.declarations.find(x => x.id.name === spec.list && x.init && x.init.type === "ArrayExpression");
      if (d) return d.init;
    }
    if (spec.call && n.type === "ExpressionStatement" && n.expression.type === "CallExpression" &&
        n.expression.callee.name === spec.call && n.expression.arguments[1] &&
        n.expression.arguments[1].type === "ObjectExpression") {
      const p = n.expression.arguments[1].properties.find(x => keyName(x) === spec.kind);
      if (p && p.value.type === "ArrayExpression") return p.value;
    }
  }
  throw new Error("park: no " + (spec.list || spec.call + "(..." + spec.kind + ")") + " in " + spec.file);
}

/* the text of one element with the comments that lead it, and where it sits */
function chunks(src, arr) {
  const out = []; let prev = arr.start + 1;
  arr.elements.forEach(el => {
    let end = el.end; const m = /^\s*,/.exec(src.slice(end)); if (m) end += m[0].length;
    out.push({ el, start: prev, end });
    prev = end;
  });
  return out;
}

function stripCampaign(text, base, el) {
  const p = el.properties.find(x => x.type === "Property" && keyName(x) === "campaign");
  if (!p) return text;
  let a = p.start - base, b = p.end - base;
  const tail = /^\s*,?[ \t]*/.exec(text.slice(b)); b += tail ? tail[0].length : 0;
  return text.slice(0, a) + text.slice(b);
}

function run(plan, dry) {
  const byKind = {};                              /* kind -> [text, ...] in plan order */
  const report = [];
  plan.forEach(spec => {
    const file = path.join(root, spec.file), src = fs.readFileSync(file, "utf8");
    const ast = parse(src), arr = findArray(ast, spec), keep = new Set(spec.keep || []);
    const cs = chunks(src, arr), cut = [];
    cs.forEach(c => {
      if (c.el.type !== "ObjectExpression") { report.push(spec.file + ": left a " + c.el.type + " in place"); return; }
      const id = idOf(c.el);
      if (id && keep.has(id)) return;
      const raw = src.slice(c.start, c.end);
      let text = stripCampaign(raw, c.start, c.el);
      if (!/,\s*$/.test(text)) text = text.replace(/\s*$/, ",") ;
      (byKind[spec.kind] = byKind[spec.kind] || []).push(text);
      cut.push(c);
    });
    let next = src;
    cut.slice().reverse().forEach(c => { next = next.slice(0, c.start) + next.slice(c.end); });
    report.push(spec.file + ": " + cut.length + " of " + cs.length + " " + spec.kind + " parked");
    if (!dry) fs.writeFileSync(file, next);
  });
  const dir = path.join(root, "content", "campaigns", "parked");
  Object.keys(byKind).forEach(kind => {
    const file = path.join(dir, kind + ".js");
    const body = byKind[kind].map(t => t.replace(/^\n+/, "\n")).join("");
    const head = "/* =============================================================\n" +
      "   PARKED " + kind.toUpperCase() + ". Written for later acts, or before design/80 retired\n" +
      "   the old opening. Moved here byte for byte by tools/park.js, so nothing is\n" +
      "   lost and nothing is shown: the tag `parked` keeps every entry out of Flash I's\n" +
      "   view and out of the world's, and the itch.io build does not load this folder.\n" +
      "   An entry leaves this file when its act is built and it is rewritten, or when\n" +
      "   the test that names it has a fixture of its own. Do not edit the prose here.\n" +
      "   ============================================================= */\n";
    const text = head + 'campaign("parked", { ' + kind + ": [\n" + body + "\n] });\n";
    report.push("content/campaigns/parked/" + kind + ".js: " + byKind[kind].length + " entries");
    if (!dry) { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(file, text); }
  });
  console.log(report.join("\n"));
}

/* ---- the proof ---- */
function verify(origRoot) {
  const lc = r => require(path.join(r, "tools", "loadcontent.js"));
  const grab = r => {
    const code = "const __r=require(" + JSON.stringify(path.join(r, "tools", "loadcontent.js")) + ");" +
      "const C=__r.loadContent();" +
      "const out={};Object.keys(C).forEach(k=>{let v=C[k];if(k==='encyclopedia')v=(v||{}).articles;if(Array.isArray(v))out[k]=v;});" +
      "process.stdout.write(JSON.stringify(out));";
    return JSON.parse(require("child_process").execFileSync(process.execPath, ["-e", code],
      { cwd: r, maxBuffer: 1 << 28 }).toString());
  };
  const A = grab(origRoot), B = grab(root); let bad = 0, moved = 0;
  Object.keys(A).forEach(k => {
    const key = (e, i) => e && e.id != null ? String(e.id) : "#" + i;
    const strip = e => { if (!e || typeof e !== "object") return e; const o = Object.assign({}, e); delete o.campaign; return o; };
    const ma = new Map(A[k].map((e, i) => [key(e, i), e])), mb = new Map((B[k] || []).map((e, i) => [key(e, i), e]));
    if (ma.size !== mb.size) { console.log("  FAIL " + k + ": " + ma.size + " entries became " + mb.size); bad++; return; }
    ma.forEach((e, id) => {
      const f = mb.get(id);
      if (!f) { console.log("  FAIL " + k + "/" + id + " is gone"); bad++; return; }
      if (JSON.stringify(strip(e)) !== JSON.stringify(strip(f))) { console.log("  FAIL " + k + "/" + id + " changed"); bad++; return; }
      if (f.campaign === "parked" && e.campaign !== "parked") moved++;
    });
  });
  console.log(bad ? "  " + bad + " problems" : "  every entry of every collection is unchanged, " + moved + " now tagged parked");
  process.exit(bad ? 1 : 0);
}

const args = process.argv.slice(2);
if (args[0] === "--verify") verify(path.resolve(args[1]));
else if (args[0]) run(JSON.parse(fs.readFileSync(args[0], "utf8")), args.includes("--dry"));
else console.log("usage: node tools/park.js <plan.json> [--dry] | --verify <original-root>");
