/* =============================================================
   THE PROSE FILE.

     npm run prose            write prose.txt from the content files
     npm run prose:in         read prose.txt back into the content files
     npm run prose:check      every address still resolves, and a round trip
                              changes nothing (part of `npm run check`)

   WHAT IT IS FOR. The author writes the prose and Claude writes the
   mechanism, and until now those two things lived in the same JavaScript
   object literal — so editing a sentence meant opening a content file,
   finding it among the effects and the conditions, and not breaking a comma.
   This lifts EVERY player-facing sentence in the game into one plain text
   file, in a stable order, each under an address that says where it came
   from, and puts it back afterwards.

   IT IS NOT A SERIALISER. The importer does surgical replacement in the
   SOURCE text: it knows the old string exactly, finds that one literal in
   the file, and swaps it. Re-serialising the content object would produce
   valid JavaScript and destroy every comment in it, and the comments in
   content/*.js are half of what this repo knows. A replacement that is not
   unambiguous is refused and reported rather than guessed at.

   THE FORMAT. A block is a line beginning `@ ` followed by an address, then
   everything up to the next marker. Blank lines inside a block are part of
   the prose, because a blank line is a paragraph break everywhere else here.

       @ events/f1_dilemma/body
       He has been waiting by the lift since seven.

       It is the only question he will get.

   A line beginning `# ` inside a block is a NOTE and is stripped on the way
   back in. That is the channel for saying what a passage has to DO without
   putting it in the game: Claude describes the mechanism, the author writes
   the sentence over it.

   A line is only treated as a marker if it starts `@ ` AND the rest is an
   address the content actually has. Prose that happens to begin with an at
   sign is therefore safe, and the round-trip check proves it per run rather
   than trusting the argument.
   ============================================================= */

const fs = require("fs"), vm = require("vm"), path = require("path");
const root = path.join(__dirname, "..");

/* Which file each collection is authored in, so a write-back knows where to
   look. A collection with no file here is exported read-only. */
const HOME = {
  setup: "content/setup.js", parties: "content/parties.js",
  currents: "content/parties.js", partyOrg: "content/parties.js",
  administrations: "content/setup.js", initiatives: "content/initiatives.js",
  stations: "content/stations.js", constituencies: "content/constituencies.js",
  cabinet: "content/cabinet.js", instruments: "content/instruments.js",
  minutes: "content/minutes.js", characters: "content/characters.js",
  bills: "content/bills.js", events: "content/events.js",
  glossary: "content/glossary.js", encyclopedia: "content/encyclopedia.js",
  functional: "content/functional.js", business: "content/business.js",
  settlements: "content/settlements.js", actors: "content/actors.js",
  achievements: "content/achievements.js", sandbox: "content/events.js",
  scarcities: "content/setup.js", notice: "content/artifacts.js",
  world: "content/world.js", tips: "js/tips.js",
  forums: "content/forums.js", resolutions: "content/forums.js"
};

/* THE WHITELIST, and it is a whitelist on purpose. Walking for "any long
   string" swept up ids, party short names, file names and effect keys, and
   an author editing those silently breaks the game. These are the fields
   that are READ BY A PLAYER. */
const PROSE = new Set([
  "body", "title", "label", "text", "note", "result", "summary", "closing",
  "contested", "description", "tendency", "gloss", "grievance", "effect_note",
  "wire", "note_franchise", "head", "source", "said", "hint", "lede",
  "epigraph", "caption", "blurb", "why", "asks", "answer", "question",
  "whenText"
]);

/* Keys whose value is a name or an id and never prose, even where the key
   itself is on the list above (a party's `label` is "PSD"). */
const NEVER = new Set(["id", "ref", "kind", "art", "mood", "speaker", "party",
  "holder", "leader", "station", "seat", "band", "form", "tier", "franchise"]);

/* Loading them is tools/loadcontent.js, shared with tools/register.js:
   the content files are script-scope `const`s collected by index.js, so
   they must be concatenated and run in one context, never required. */
const { loadContent, files: PAGE_FILES } = require("./loadcontent.js");

/* A CAMPAIGN'S ENTRIES ARE KEPT IN ITS FOLDER, content/campaigns/<id>/, so
   HOME names only the world's file of each kind. The places to look for a
   passage are, in order: the file of its kind in the folder of the campaign
   its entry is tagged for; the world's file; and then every campaign file,
   because an administration is declared in its folder and is not tagged.
   The first of them that holds the passage is its file. Trying the
   campaign's own file first is what keeps a common label ("Continue") from
   resolving to the world's file when it belongs to a campaign's event. */
const CAMPAIGN_FILES = PAGE_FILES.filter(f => /^content\/campaigns\//.test(f));
function candidates(C, addr) {
  const parts = addr.split("/"), coll = parts[0];
  const arts = coll === "encyclopedia" && parts[1] === "articles";
  const list = arts ? ((C.encyclopedia || {}).articles || []) : C[coll];
  const id = arts ? parts[2] : parts[1];
  const x = Array.isArray(list) ? list.find(e => e && e.id === id) : null;
  const kind = arts ? "articles" : coll;
  const own = (x ? [].concat(x.campaign || []) : [])
    .map(c => "content/campaigns/" + c + "/" + kind + ".js")
    .filter(f => CAMPAIGN_FILES.indexOf(f) >= 0);
  return [...new Set(own.concat(HOME[coll] ? [HOME[coll]] : [], CAMPAIGN_FILES))];
}
function fileOf(C, addr, text, srcOf) {
  const c = candidates(C, addr);
  for (const f of c) {
    const src = srcOf(f);
    if (src != null && findRuns(src, literals(src), text).length) return f;
  }
  return HOME[addr.split("/")[0]];
}

/* THE WALK LIVES IN js/prosemap.js, because prose.html needs exactly the
   same one: an address that resolves in the tool and not in the editor
   would be the worst kind of bug here, silently dropping an author's work
   on the way back in. The module knows nothing about files or the DOM. */
const Map_ = require(path.join(root, "js", "prosemap.js"));
const collect = Map_.collect;
const heading = (C, a) => Map_.heading(C, a);

/* ---------- out ---------- */
function writeFile(C, target) {
  const rows = collect(C);
  fs.writeFileSync(target, Map_.format(C, rows), "utf8");
  return rows.length;
}

/* ---------- in ---------- */
function parseFile(text, knownSet) {
  const known = {};
  knownSet.forEach(k => { known[k] = 1; });
  return Map_.parse(text, known);
}

/* JavaScript source spellings of one string, so the replacer can find it
   however it was written. */
function spellings(s) {
  const esc = (q) => s
    .replace(/\\/g, "\\\\")
    .replace(new RegExp(q, "g"), "\\" + q)
    .replace(/\n/g, "\\n");
  return [
    "`" + s.replace(/\\/g, "\\\\").replace(/`/g, "\\`") + "`",
    '"' + esc('"') + '"',
    "'" + esc("'") + "'"
  ];
}

/* ---------- finding a passage in the source ----------
   ELEVEN PER CENT OF THE PROSE IS NOT A STRING. It is a run of adjacent
   literals joined by +, which is how a long sentence is wrapped to eighty
   columns in a JavaScript file:

       note:"The session ran out and the country voted, and your party " +
            "came back. This is the ending for a government that neither " +
            "closed the question nor lost it."

   The runtime value is one string and the source contains none of it, so a
   naive search finds nothing and reports 213 passages as unappliable. The
   scanner below reads the file's string LITERALS, then looks for a run of
   them — separated by nothing but whitespace and a single + — whose joined
   value is the passage.

   Replacing such a run with one template literal also NORMALISES it, so a
   passage that has been through the tool once is a single literal
   afterwards and every later edit is simpler than the first. */
function literals(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    /* skip comments, or a quote inside one ends up a literal */
    if (c === "/" && src[i + 1] === "/") { const n = src.indexOf("\n", i); i = n < 0 ? src.length : n; continue; }
    if (c === "/" && src[i + 1] === "*") { const n = src.indexOf("*/", i); i = n < 0 ? src.length : n + 2; continue; }
    if (c !== '"' && c !== "'" && c !== "`") { i++; continue; }
    const q = c;
    let j = i + 1, val = "";
    while (j < src.length) {
      const d = src[j];
      if (d === "\\") {
        const e = src[j + 1];
        val += e === "n" ? "\n" : e === "t" ? "\t" : e === "r" ? "\r" :
               e === "u" ? String.fromCharCode(parseInt(src.substr(j + 2, 4), 16)) : e;
        j += (e === "u") ? 6 : 2;
        continue;
      }
      if (d === q) break;
      val += d; j++;
    }
    if (j >= src.length) { i++; continue; }
    out.push({ start: i, end: j + 1, value: val, quote: q });
    i = j + 1;
  }
  return out;
}

/* A gap between two literals that leaves them one string: whitespace, one
   plus, and any number of comments. */
function stripComments(g) {
  return String(g).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
}
function joinable(gap) { return /^\s*\+\s*$/.test(stripComments(gap)); }
function hasComment(g) { return stripComments(g) !== g; }

/* Every run of literals whose join equals `want`, as {start,end}. */
function findRuns(src, lits, want) {
  const hits = [];
  for (let i = 0; i < lits.length; i++) {
    let joined = "";
    for (let k = i; k < lits.length; k++) {
      joined += lits[k].value;
      if (joined.length > want.length) break;
      if (joined === want) {
        hits.push({ start: lits[i].start, end: lits[k].end,
                    commented: hasComment(src.slice(lits[i].start, lits[k].end)) });
        break;
      }
      /* THE GAP MAY CARRY A COMMENT, and one of them does. A run can be
         interrupted by an authored note:

             "...the point of declining it.\n\n" +
             /* WHAT IT COSTS ... *""/
             "The cost is paid in moving. " +

         That is still one string at runtime, so locating it has to see
         through the comment. REPLACING it must not: writing the run back as
         a single literal would delete the note, and the notes in content
         are half of what this repo knows. applyOne refuses a run with a
         comment in it and says so; the author edits that one by hand. */
      if (k + 1 >= lits.length) break;
      const gap = src.slice(lits[k].end, lits[k + 1].start);
      if (!joinable(gap)) break;
    }
  }
  return hits;
}

function applyOne(srcByFile, file, oldText, newText) {
  const src = srcByFile[file];
  if (src == null) return { ok: false, why: "no such file: " + file };
  const hits = findRuns(src, literals(src), oldText);
  if (hits.length === 0) return { ok: false, why: "not found in source" };
  if (hits.length > 1) return { ok: false, why: "appears " + hits.length + " times; ambiguous" };
  if (hits[0].commented)
    return { ok: false, why: "an authored comment sits inside it; edit this one by hand " +
                             "rather than let the tool delete the note" };
  /* One template literal, whatever it was before: it survives newlines and
     needs no wrapping, which is what makes the next edit easy. */
  const rep = "`" + newText.replace(/\\/g, "\\\\")
                            .replace(/`/g, "\\`")
                            .replace(/\$\{/g, "\\${") + "`";
  srcByFile[file] = src.slice(0, hits[0].start) + rep + src.slice(hits[0].end);
  return { ok: true };
}

function readBack(C, target, dry) {
  const rows = collect(C);
  const byAddr = {};
  rows.forEach(r => { byAddr[r.addr] = r.text; });
  const known = new Set(Object.keys(byAddr));
  const parsed = parseFile(fs.readFileSync(target, "utf8"), known);

  const srcByFile = {};
  Object.keys(HOME).map(k => HOME[k]).concat(CAMPAIGN_FILES).forEach(f => {
    if (srcByFile[f] == null && fs.existsSync(path.join(root, f)))
      srcByFile[f] = fs.readFileSync(path.join(root, f), "utf8");
  });

  const changed = [], failed = [], missing = [];
  parsed.forEach(p => {
    if (byAddr[p.addr] == null) { missing.push(p.addr); return; }
    if (byAddr[p.addr] === p.text) return;
    const file = fileOf(C, p.addr, byAddr[p.addr], f => srcByFile[f]);
    const r = applyOne(srcByFile, file, byAddr[p.addr], p.text);
    if (r.ok) changed.push(p.addr);
    else failed.push(p.addr + " — " + r.why);
  });

  const absent = Object.keys(byAddr).filter(a => !parsed.some(p => p.addr === a));
  if (!dry) Object.keys(srcByFile).forEach(f =>
    fs.writeFileSync(path.join(root, f), srcByFile[f], "utf8"));
  return { changed, failed, missing, absent, parsed: parsed.length };
}

/* ---------- the command ---------- */
const argv = process.argv.slice(2);
const target = path.join(root, "prose.txt");
const C = loadContent();

if (argv.includes("--in")) {
  if (!fs.existsSync(target)) {
    console.log("No prose.txt. Run `npm run prose` first."); process.exit(1);
  }
  const r = readBack(C, target, false);
  console.log("PROSE IN");
  console.log("=".repeat(58));
  console.log("  read       " + r.parsed + " passages");
  console.log("  changed    " + r.changed.length);
  if (r.changed.length) r.changed.slice(0, 12).forEach(a => console.log("      " + a));
  if (r.changed.length > 12) console.log("      ... and " + (r.changed.length - 12) + " more");
  if (r.missing.length) {
    console.log("\n  addresses the game does not have (" + r.missing.length + "):");
    r.missing.slice(0, 10).forEach(a => console.log("      " + a));
  }
  if (r.failed.length) {
    console.log("\n  COULD NOT BE APPLIED (" + r.failed.length + ") — edit these by hand:");
    r.failed.forEach(a => console.log("      " + a));
    process.exitCode = 1;
  }
  console.log("");
  process.exit();
}

if (argv.includes("--check")) {
  /* THE ROUND TRIP, AND IT IS THE ONLY EVIDENCE THAT MATTERS. Write the
     file, read it back without editing it, and require that nothing at all
     changed: every address resolves, every passage parses back to exactly
     the bytes it went out as, and no marker was invented by prose that
     happened to begin with an at sign. */
  const tmp = path.join(root, ".prose-check.txt");
  const n = writeFile(C, tmp);
  const rows = collect(C);
  const byAddr = {};
  rows.forEach(r => { byAddr[r.addr] = r.text; });
  const parsed = parseFile(fs.readFileSync(tmp, "utf8"), new Set(Object.keys(byAddr)));
  fs.unlinkSync(tmp);

  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  console.log("PROSE ROUND TRIP");
  console.log("=".repeat(58));
  ok("the game has prose to export", n > 200, n + " passages");
  /* THE TOOLTIPS ARE THE ONE COLLECTION THAT IS NOT IN content/, so they are
     the one that can silently disappear from the file — a refactor that
     stops exporting TIPS, or a top-level DOM access that makes the stub
     load throw, and the tool goes on reporting a healthy round trip over
     two thousand passages while a hundred of them are gone. */
  const tipRows = rows.filter(r => r.addr.indexOf("tips/") === 0);
  ok("and the tooltips are in it", tipRows.length > 50, tipRows.length + " tips");
  ok("and every passage comes back", parsed.length === n,
     parsed.length + " of " + n);
  const diff = parsed.filter(p => byAddr[p.addr] !== p.text);
  ok("each one identical to the byte it went out as", diff.length === 0,
     diff.length ? diff.slice(0, 3).map(d => d.addr).join(", ") : "all " + n);
  const unknown = parsed.filter(p => byAddr[p.addr] == null);
  ok("and no address was invented by the parser", unknown.length === 0,
     unknown.slice(0, 3).map(u => u.addr).join(", ") || "none");
  ok("every passage knows which file it lives in",
     rows.every(r => HOME[r.addr.split("/")[0]]),
     rows.filter(r => !HOME[r.addr.split("/")[0]])
         .map(r => r.addr.split("/")[0]).filter((v, i, a) => a.indexOf(v) === i)
         .join(", ") || "all mapped");

  /* AND THE FILE IT NAMES IS THE FILE IT IS IN. The map is by hand and a
     wrong entry is silent: the write-back would look for the passage in the
     wrong source, fail to find it, and report it as unappliable rather than
     corrupting anything \u2014 but the author would be told to fix by hand
     something the tool could have done. `notice` was mapped to setup.js and
     lives in artifacts.js. */
  const wrongHome = [], inFolder = [];
  const cache = {}, litCache = {};
  const srcOf = f => {
    if (cache[f] == null)
      cache[f] = fs.existsSync(path.join(root, f)) ? fs.readFileSync(path.join(root, f), "utf8") : "";
    return cache[f];
  };
  rows.forEach(r => {
    const f = fileOf(C, r.addr, r.text, srcOf);
    if (!f) return;
    if (litCache[f] == null) litCache[f] = literals(srcOf(f));
    if (findRuns(srcOf(f), litCache[f], r.text).length === 0)
      wrongHome.push(r.addr);
    else if (CAMPAIGN_FILES.indexOf(f) >= 0) inFolder.push(r.addr);
  });
  ok("and that file is the one the passage is actually written in",
     wrongHome.length === 0,
     wrongHome.length ? wrongHome.length + " elsewhere, e.g. " +
       wrongHome.slice(0, 3).join(", ") : "all " + rows.length);
  /* A campaign's folder is where its prose is written, so the round trip
     has to be seen going through one or it proves nothing about them. */
  ok("and a campaign's prose is found in its folder",
     !CAMPAIGN_FILES.length || inFolder.length > 0,
     inFolder.length + " passages in " + CAMPAIGN_FILES.length + " campaign files");

  /* THE FULL ROUND TRIP, through the write-back. Export, import without
     editing a character, and require every source file to be byte-identical
     afterwards. This is the only thing that proves the importer cannot
     quietly mangle a content file, which is the one failure that would cost
     real work. */
  const before = {};
  Object.keys(HOME).map(k => HOME[k]).concat(CAMPAIGN_FILES).forEach(f => {
    if (before[f] == null && fs.existsSync(path.join(root, f)))
      before[f] = fs.readFileSync(path.join(root, f), "utf8");
  });
  const tmp2 = path.join(root, ".prose-roundtrip.txt");
  writeFile(C, tmp2);
  const applied = readBack(C, tmp2, false);
  fs.unlinkSync(tmp2);
  const mangled = Object.keys(before)
    .filter(f => fs.readFileSync(path.join(root, f), "utf8") !== before[f]);
  if (mangled.length) mangled.forEach(f =>
    fs.writeFileSync(path.join(root, f), before[f], "utf8"));   /* put it back */
  ok("importing an unedited file changes nothing",
     applied.changed.length === 0 && mangled.length === 0,
     applied.changed.length + " passages, " + mangled.length + " files touched" +
     (mangled.length ? " (" + mangled.join(", ") + ", restored)" : ""));
  ok("and the importer found every address it was given",
     applied.missing.length === 0, applied.missing.slice(0, 3).join(", ") || "none");
  console.log("");
  if (bad) { console.log(bad + " PROSE ROUND-TRIP FAILURES"); process.exit(1); }
  console.log("the prose file round-trips");
  process.exit();
}

const n = writeFile(C, target);
console.log("PROSE OUT");
console.log("=".repeat(58));
console.log("  " + n + " passages written to prose.txt");
console.log("  edit it, then `npm run prose:in`");
console.log("");
