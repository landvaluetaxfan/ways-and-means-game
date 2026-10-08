#!/usr/bin/env node
/* =============================================================
   ARCHIVE WORLD. Move the world's world-only story out of the live content
   files into content/archive/world/, byte for byte, with a manifest.

   design/84, design/85 task 3. A story entry is world-only when it is
   untagged, or tagged only for "world" (content/index.js, STORY): the world
   view is what the engine tests used to play on, and the fixtures own that
   view now. An entry tagged for a real campaign (including
   campaign:["world","flash_i"]) is SHARED and stays where it is, in its
   original relative order. Reference collections are not story and never
   move.

     node tools/archiveworld.js --dry     report the candidates, change nothing
     node tools/archiveworld.js --write   archive the candidates and remove them
     node tools/archiveworld.js --verify  check the archive against the manifest

   The move preserves each entry's source text including the comments that
   lead it, so the archive is history, not a rewrite. The archive files are
   not listed in index.html or editor.html and are never loaded.
   ============================================================= */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const park = require("./park.js");

/* The ten story arrays that live at the top level of a content file. */
const KINDS = [
  { file: "content/events.js",       list: "EVENTS",       kind: "events" },
  { file: "content/bills.js",        list: "BILLS",        kind: "bills" },
  { file: "content/instruments.js",  list: "INSTRUMENTS",  kind: "instruments" },
  { file: "content/initiatives.js",  list: "INITIATIVES",  kind: "initiatives" },
  { file: "content/matters.js",      list: "MATTERS",      kind: "matters" },
  { file: "content/settlements.js",  list: "SETTLEMENTS",  kind: "settlements" },
  { file: "content/achievements.js", list: "ACHIEVEMENTS", kind: "achievements" },
  { file: "content/business.js",     list: "BUSINESS",     kind: "business" },
  { file: "content/minutes.js",      list: "MINUTES",      kind: "minutes" },
  { file: "content/forums.js",       list: "RESOLUTIONS",  kind: "resolutions" }
];
const ARCHIVE_DIR = "content/archive/world";
const sha = s => crypto.createHash("sha256").update(s, "utf8").digest("hex");
const archiveName = kind => "WORLD_ARCHIVE_" + kind.toUpperCase();

/* The campaign tags of an object element, as strings, or null if untagged.
   An unsupported tag expression is an explicit error, never a guess. */
function tagsOf(el) {
  if (el.properties.some(x=>x.type !== "Property" || x.computed && x.key.type !== "Literal"))
    throw new Error("archiveworld: unsupported campaign tag source");
  const tags = el.properties.filter(x => x.type === "Property" && park.keyName(x) === "campaign");
  if (tags.length > 1) throw new Error("archiveworld: duplicate campaign tags");
  const p = tags[0];
  if (!p) return null;
  const v = p.value;
  if (v.type === "Literal" && typeof v.value === "string") return [v.value];
  if (v.type === "ArrayExpression") return v.elements.map(e => {
    if (!e || e.type !== "Literal" || typeof e.value !== "string")
      throw new Error("archiveworld: unsupported campaign tag element");
    return e.value;
  });
  throw new Error("archiveworld: unsupported campaign tag expression");
}
/* Shared = tagged for a campaign other than the world, so it must stay. */
const isShared = el => { const t = tagsOf(el); return !!t && t.some(x => x !== "world"); };

/* Every object entry of every story array under `root`, in file/array order.
   A non-object element (a spread, a call) is returned with shared:true so it
   is never moved, and reported by --dry. */
function inventory(root) {
  const records = [];
  KINDS.forEach(({ file, list, kind }) => {
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) return;
    const src = fs.readFileSync(abs, "utf8");
    const arr = park.findArray(park.parse(src), { file, list });
    park.chunks(src, arr).forEach((c, ordinal) => {
      const base = { file, list, kind, ordinal, start: c.start, end: c.end, raw: src.slice(c.start, c.end) };
      if (c.el.type !== "ObjectExpression") records.push(Object.assign(base, { id: null, shared: true, nonObject: true }));
      else records.push(Object.assign(base, { id: park.idOf(c.el), shared: isShared(c.el) }));
    });
  });
  return records;
}

function dry(root) {
  const records = inventory(root);
  let total = 0, cand = 0;
  KINDS.forEach(({ kind }) => {
    const rs = records.filter(r => r.kind === kind);
    if (!rs.length) return;
    const c = rs.filter(r => !r.shared);
    total += rs.length; cand += c.length;
    console.log("  " + kind + ": " + rs.length + " entries, " + c.length + " world-only, " +
      rs.filter(r => r.shared).length + " shared");
    c.forEach(r => console.log("      " + (r.id || "(no id)")));
  });
  records.filter(r => r.nonObject).forEach(r =>
    console.log("  " + r.file + ": left a non-object element in place"));
  console.log("  " + cand + " of " + total + " entries are world-only and would be archived");
}

function write(root) {
  const records = inventory(root);
  const cands = records.filter(r => !r.shared);
  const dir = path.join(root, ARCHIVE_DIR);
  if (!cands.length) {
    if (fs.existsSync(path.join(dir,"manifest.js"))) verify(root);
    return 0;
  }
  if (fs.existsSync(dir) && fs.readdirSync(dir).length)
    throw new Error("archiveworld: existing archive; refusing to overwrite it");
  const seen = new Set();
  cands.forEach(r => { const key = r.kind + ":" + r.id; if (r.id && seen.has(key)) throw new Error("archiveworld: duplicate " + key); seen.add(key); });

  const manifest = [];
  const byKind = {};
  cands.forEach(r => { (byKind[r.kind] = byKind[r.kind] || []).push(r); });

  /* Prepare source edits, but keep every source byte until archive outputs
     have been written and read back successfully. A partial archive is safe
     to inspect and recover; a cut source without its archive is not. */
  const byFile = {};
  cands.forEach(r => { (byFile[r.file] = byFile[r.file] || []).push(r); });
  const edits = {};
  Object.keys(byFile).forEach(file => {
    const abs = path.join(root, file);
    let src = fs.readFileSync(abs, "utf8");
    byFile[file].slice().sort((a, b) => b.start - a.start).forEach(r => {
      src = src.slice(0, r.start) + src.slice(r.end);
    });
    edits[file] = src;
  });

  fs.mkdirSync(path.join(root, ARCHIVE_DIR), { recursive: true });
  Object.keys(byKind).forEach(kind => {
    const rs = byKind[kind];
    const head = "/* =============================================================\n" +
      "   WORLD ARCHIVE - " + kind.toUpperCase() + ". The world's world-only " + kind + ", moved out\n" +
      "   of the live content byte for byte by tools/archiveworld.js (design/84).\n" +
      "   Preserved history: not loaded by any page, not authored data. Do not edit.\n" +
      "   ============================================================= */\n";
    /* The raw chunks are concatenated with nothing added, so re-reading the
       archive with the same chunker returns exactly these bytes. */
    const body = rs.map(r => r.raw).join("");
    const text = head + "const " + archiveName(kind) + " = [" + body + "];\n" +
      'if (typeof module !== "undefined") module.exports = ' + archiveName(kind) + ";\n";
    fs.writeFileSync(path.join(dir, kind + ".js"), text, {flag:"wx"});
    const readback = archivedChunks(root,kind);
    if (readback.length !== rs.length || readback.some((raw,i)=>raw!==rs[i].raw))
      throw new Error("archiveworld: archive readback differs from source: "+kind);
    rs.forEach(r => manifest.push({ file: r.file, kind: r.kind, id: r.id, ordinal: r.ordinal, sha256: sha(r.raw) }));
    console.log("  " + ARCHIVE_DIR + "/" + kind + ".js: " + rs.length + " entries");
  });

  const mhead = "/* Provenance for content/archive/world/. One record per archived entry,\n" +
    "   in the order it was removed: its source file, kind, id, position in the\n" +
    "   original array, and the sha256 of its exact source text. tools/archiveworld.js\n" +
    "   --verify checks the archive against this. Do not edit. */\n";
  const mtext = mhead + "const WORLD_ARCHIVE_MANIFEST = " + JSON.stringify(manifest, null, 2) + ";\n" +
    'if (typeof module !== "undefined") module.exports = WORLD_ARCHIVE_MANIFEST;\n';
  fs.writeFileSync(path.join(dir, "manifest.js"), mtext, {flag:"wx"});
  if (fs.readFileSync(path.join(dir,"manifest.js"),"utf8") !== mtext)
    throw new Error("archiveworld: manifest readback differs");
  console.log("  " + ARCHIVE_DIR + "/manifest.js: " + manifest.length + " records");
  Object.entries(edits).forEach(([file,src])=>fs.writeFileSync(path.join(root,file),src));
  return manifest.length;
}

/* Read one archive array's raw chunks, exactly as written. */
function archivedChunks(root, kind) {
  const file = path.join(root, ARCHIVE_DIR, kind + ".js");
  if (!fs.existsSync(file)) return [];
  const src = fs.readFileSync(file, "utf8");
  const arr = park.findArray(park.parse(src), { file, list: archiveName(kind) });
  return park.chunks(src, arr).map(c => src.slice(c.start, c.end));
}

function verify(root) {
  const mfile = path.join(root, ARCHIVE_DIR, "manifest.js");
  if (!fs.existsSync(mfile)) throw new Error("archiveworld: no archive manifest");
  const ctx = {};
  require("node:vm").runInNewContext(fs.readFileSync(mfile,"utf8")+"\n;globalThis.rows=WORLD_ARCHIVE_MANIFEST",ctx);
  const manifest = ctx.rows, problems = [];
  const byKind = {};
  manifest.forEach(m => { (byKind[m.kind] = byKind[m.kind] || []).push(m); });
  Object.keys(byKind).forEach(kind => {
    const chunks = archivedChunks(root, kind);
    const ms = byKind[kind];
    if (chunks.length !== ms.length) problems.push(kind+": archive entry count changed");
    ms.forEach((m, i) => {
      if (chunks[i] == null) return;
      if (sha(chunks[i]) !== m.sha256) problems.push(kind+"/"+m.id+" archived bytes changed");
    });
  });
  const left = inventory(root).filter(r => !r.shared);
  if (left.length) problems.push(left.length+" world-only entries still in the source");
  if (problems.length) throw new Error("archiveworld: "+problems.join("; "));
  console.log("  archive matches the manifest and no world-only entry is left in the source");
  return true;
}

if (require.main === module) {
  const args = process.argv.slice(2), root = path.join(__dirname,"..");
  try {
    if (args.includes("--dry")) dry(root);
    else if (args.includes("--write")) write(root);
    else if (args.includes("--verify")) verify(root);
    else console.log("usage: node tools/archiveworld.js --dry | --write | --verify");
  } catch(e) { console.error(e.message); process.exitCode=1; }
}

module.exports = { inventory, write, verify, archivedChunks, tagsOf, isShared, KINDS, ARCHIVE_DIR, archiveName };
