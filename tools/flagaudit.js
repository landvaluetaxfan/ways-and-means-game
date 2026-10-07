#!/usr/bin/env node
/* =============================================================
   FLAG AUDIT. The scene contract's third rule (briefs/act-one.md): a flag that nothing reads is a fault.
   Lint already fails a gate that reads a flag nothing sets; this is the other direction, for the live
   campaign. Every flag Flash I's content sets (`{flag:"x"}` or `{flag:{x:true}}`) must be read somewhere:
   in a `when`, `needs` or condition anywhere in the content, or by name in the engine or the interface.

     node tools/flagaudit.js
     node tools/flagaudit.js --list    every flag, its writers and its readers

   A READ is any mention of the name that is not the write that sets it, found as text across the content
   files the page loads and js/. A flag the engine itself writes (`flags.x =`) is not audited here.
   ============================================================= */
"use strict";
const fs = require("fs"), path = require("path");
const L = require("./loadcontent.js");
const root = L.root;
const LIVE = L.files.filter(f => /^content\/campaigns\/flash_i\//.test(f));
const WORLD_READERS = L.files.filter(f => !/^content\/campaigns\/parked\//.test(f));
const JS = fs.readdirSync(path.join(root, "js")).filter(f => /\.js$/.test(f)).map(f => "js/" + f);
const read = f => fs.readFileSync(path.join(root, f), "utf8");

const writes = {};   /* name -> [file] */
LIVE.forEach(f => {
  const src = read(f);
  for (const m of src.matchAll(/\bflag\s*:\s*"([A-Za-z_]\w*)"/g)) (writes[m[1]] = writes[m[1]] || []).push(f);
  for (const m of src.matchAll(/\bflag\s*:\s*\{([^}]*)\}/g))
    for (const k of m[1].matchAll(/([A-Za-z_]\w*)\s*:\s*(?:true|false)/g)) (writes[k[1]] = writes[k[1]] || []).push(f);
});

/* every text a read can live in, with the write sites blanked so a flag does not read itself */
const texts = WORLD_READERS.concat(JS).map(f => {
  let s = read(f);
  s = s.replace(/\bflag\s*:\s*"[A-Za-z_]\w*"/g, "flag:\"\"")
       .replace(/\bflag\s*:\s*\{[^}]*\}/g, m => m.replace(/([A-Za-z_]\w*)(\s*:\s*(?:true|false))/g, "_$2"));
  return { f, s };
});

/* FLAGS WRITTEN NOW FOR A READER NOT YET BUILT: name them here with the reader. An entry that IS read fails the audit,
   so this list empties itself. (The clauses' locks read `seen`, not flags, and the list is empty.) */
const HELD = {};

const report = {};
Object.keys(writes).forEach(name => {
  const re = new RegExp("(?<![A-Za-z0-9_])" + name + "(?![A-Za-z0-9_])");
  const readers = texts.filter(t => re.test(t.s)).map(t => t.f);
  report[name] = { writers: [...new Set(writes[name])], readers };
});
if (process.argv.includes("--list"))
  Object.keys(report).sort().forEach(n => console.log(n.padEnd(34), "writes " + report[n].writers.length, " read in", report[n].readers.length ? report[n].readers.join(", ") : "NOTHING"));
const unread = Object.keys(report).filter(n => !report[n].readers.length && !HELD[n]).sort();
const stale = Object.keys(HELD).filter(n => report[n] && report[n].readers.length);
Object.keys(HELD).filter(n => report[n] && !report[n].readers.length).forEach(n => console.log("  held  " + n + " for " + HELD[n]));
stale.forEach(n => console.log("  FAIL  " + n + " is read now; take it off the held list"));
console.log(`FLAG AUDIT  ${Object.keys(report).length} flags set by Flash I`);
unread.forEach(n => console.log("  FAIL  " + n + " is set in " + report[n].writers.join(", ") + " and read nowhere"));
if (unread.length || stale.length) { console.log(`\nFAILED: ${unread.length} flag(s) nothing reads, ${stale.length} stale on the held list`); process.exit(1); }
console.log("\nevery flag the act sets is read somewhere");
