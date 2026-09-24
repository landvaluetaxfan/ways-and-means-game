/* npm run register — the prose register scanner.
 *
 * Reports player-facing passages carrying one of the seven mechanical habits
 * in PROSE_REGISTER.md. It REPORTS and never rewrites: a rewrite is a
 * decision, and the decision is the author's.
 *
 * Deliberately not in `npm run check`. A style check that fails a build turns
 * into a style check somebody disables. This one is run when prose is being
 * worked on, and its exit code is 0 whatever it finds.
 *
 * It walks the same addresses as `npm run prose` (js/prosemap.js), so an
 * address printed here pastes straight into prose.html's filter box.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

/* ---- the registers ----------------------------------------------------- */
/* PER REGISTER, NOT ONE RULEBOOK (PROSE_REGISTER.md, revised 24 Sep). A
   country note, a tooltip and a character's line are three kinds of
   writing: a contrast is a fault in the first two and a voice in the third.
   The register is read off the address, so a new surface is one line here. */
function registerOf(addr) {
  const coll = addr.split("/")[0];
  if (coll === "characters" && /\/note$/.test(addr)) return null;   /* the author's design notes */
  /* a choice's label is a line the Prime Minister says in the scene, so an
     event is Voice throughout; the menu's notice board is an in-world notice */
  if (coll === "events" || coll === "minutes" || coll === "business" || coll === "notice") return "voice";
  if (coll === "administrations") return /\/intro\//.test(addr) ? "voice" : "reference";
  if (coll === "setup") return /\/outlook\//.test(addr) ? "voice" : "reference";
  if (coll === "settlements") return /\/closing$/.test(addr) ? "voice" : "reference";
  if (["tips", "initiatives", "achievements", "sandbox"].indexOf(coll) >= 0) return "interface";
  return "reference";
}

/* ---- the habits -------------------------------------------------------- */
/* Each: an id, a name, a matcher, and its SEVERITY IN EACH REGISTER:
   "fault" (fix it), "note" (read it and decide), or absent (fine there). */
const EVERY = { reference: "fault", interface: "fault", voice: "note" };
const HABITS = [
  /* THE TAIL, AND ONLY WHERE IT IS EMPTY. A tail that ends on a NEW fact is
     doing work ("which is the first elected office she has ever held"). The
     habit is the tail that ends on an abstraction the sentence already
     implied. Reported only when it introduces no number, no proper noun and
     fewer than four content words of its own; that split measured 30
     genuine against 27 correct on 21 Sep. */
  { id: "tail", sev: EVERY, name: "explanatory tail",
    why: "ends on an abstraction the sentence already implied; end on the fact",
    test: t => {
      const RE = /,\s*(?:which|and that|and this)\s+is\s+(?:the|what|why)\b[^.]*\.|,\s*and\s+it\s+has\s+said\s+so\b[^.]*\.|\bthat\s+is\s+the\s+point\b[^.]*\./gi;
      const ABSTRACT = new Set(("point difficulty trade business cost thing part half " +
        "whole argument way kind coin reward arithmetic power form position answer " +
        "question record truth case matter rest same only").split(" "));
      const STOP = new Set(("which that this what the for and is are not rather than " +
        "with from only all its it").split(" "));
      let m;
      while ((m = RE.exec(t))) {
        const tail = m[0];
        if (/\d/.test(tail)) continue;
        if (/\b[A-Z][a-z]{2,}/.test(tail)) continue;
        const words = (tail.toLowerCase().match(/[a-z']+/g) || [])
          .filter(w => w.length > 3 && !ABSTRACT.has(w) && !STOP.has(w));
        if (words.length < 4) return true;
      }
      return false;
    } },

  /* CONTRAST FRAMING, THE CLASS (the author, 24 Sep: "AI-sounding with the
     contrast and the X vs Y"). It was one narrow pattern (the corrective
     pair) plus a defence of "rather than"; the author's reading is that the
     whole family is the tell. Speech in Voice may keep it. */
  { id: "contrast", sev: EVERY, name: "contrast framing",
    why: "defines a thing against another; state the fact that is true, positively",
    re: new RegExp([
      "\\bnot\\s+(?:a|an|the|only|just)?\\s*[\\w'-]+(?:\\s+[\\w'-]+){0,4}\\s*,?\\s+but\\s+",   /* not X but Y */
      "\\brather\\s+than\\b",
      ",\\s+not\\s+(?!least\\b|yet\\b|even\\b|until\\b|always\\b|quite\\b|all\\b|every\\b|once\\b|so\\b|much\\b|to mention\\b)(?:a|an|the|its|their|his|her|by|in|for|to|on|with)?\\s*[\\w'-]+[^,.;]{0,30}[.;,]",
      "\\b(?:is|are|was|were)\\s+not\\s+[^.]{1,45}\\.\\s+(?:It|This|That|They|He|She)\\s+(?:is|are|was|were)\\b",
      "\\binstead\\s+of\\b",
      "\\bunlike\\b",
      "\\bwhereas\\b",
      "\\bversus\\b|\\bvs\\.?\\s"
    ].join("|"), "gi") },

  /* A RANKING AGAINST A SET THE READER CANNOT SEE. "The least committed of
     the four" makes the reader find out what the four think. */
  { id: "rank", sev: { reference: "fault", interface: "fault" }, name: "ranking against a set",
    why: "say what this one holds, not where it stands among the others",
    re: /\bthe\s+(?:least|most|strongest|weakest|keenest|firmest)\b[^.]{0,45}\b(?:of\s+the\s+(?:two|three|four|five|six|seven|eight|nine|ten|others?|rest|\w+s)|in\s+the\s+party)\b/gi },

  /* THE AXES' SHORTHAND IN PROSE. The five axes are the engine's; their
     pole names are not policy. PROSE_REGISTER.md has the plain words. */
  { id: "jargon", sev: { reference: "fault", interface: "fault" }, name: "axis shorthand",
    why: "write the policy (limits on trade with Earth), not the axis pole",
    re: /\b(?:closed|open)\s+trade\b(?!\s+with)|\bwidening\s+personhood\b|\bcaution\s+on\s+personhood\b|\bfor\s+a\s+federal\s+Commonwealth\b|\bthe\s+station\s+against\s+the\s+federation\b/gi },

  /* THE POLE WORDS THEMSELVES. The constituency `tendency` format uses them
     as an election desk's labels ("left-leaning but restrictionist"), and
     CONTENT_GUIDE.md prescribes it, so they are read rather than fixed: a
     label a player has never been told is still a word they cannot read. */
  { id: "label", sev: { reference: "note", interface: "note" }, name: "axis label",
    why: "a pole word as a political label: defined somewhere the player can find it?",
    re: /\b(?:closurist|integrationist|expansionist|restrictionist)s?\b/gi },

  { id: "dash", sev: EVERY, name: "em-dash sandwich",
    why: "one pair is punctuation; two in a passage is a mannerism",
    test: t => (t.match(/—/g) || []).length >= 4 },

  { id: "vague", sev: EVERY, name: "vague quantity",
    why: "a reference work gives the decade, the term or the figure",
    re: /\b(?:in a (?:decade|century) when|for generations|long since|ever since|over the years|in recent years|since time|countless|myriad)\b/gi },

  { id: "signoff", sev: EVERY, name: "editorial sign-off",
    why: "the sentence ends on an opinion of the fact; end on the fact",
    re: /\b(?:which nobody can \w+|and nobody \w+ (?:it|them)|being paid badly for|that is the whole \w+|and that is (?:that|all))\s*\.?/gi },

  /* THE APHORISM, which a regex can only point at: a general truth closing
     a specific passage. Read, not fixed. */
  { id: "aphorism", sev: { reference: "note", interface: "note", voice: "note" }, name: "aphorism",
    why: "a general truth in place of a specific fact",
    re: /\bis only as \w+ as\b|\bis the whole of\b|\bis what \w+ (?:is|are) for\b|\bthe (?:only|one) \w+ (?:it|they) has that\b/gi },

  /* "THE ONLY" AS A HOOK. Allowed as a checkable fact with the set named
     ("the one inland anchor in the dozen"); read each. */
  { id: "only", sev: { reference: "note" }, name: "'the only' as a hook",
    why: "a checkable fact with the set named, or a hook? state it flatly or drop it",
    re: /\bthe only\b|\bthe one \w+ (?:in|that|who|which)\b/gi },

  { id: "tri", sev: { reference: "note", voice: "note" }, name: "tricolon",
    why: "three parallel items: a real list, or a rhythm outshouting the facts?",
    re: /\b(?:a|an|the)\s+\w+(?:\s+\w+)?,\s+(?:a|an|the)\s+\w+(?:\s+\w+)?,\s+and\s+(?:a|an|the)\s+\w+/gi },

  /* A TOOLTIP IS READ MID-ACTION: one answer, short. */
  { id: "long", sev: { interface: "note" }, name: "long for a tooltip",
    why: "over sixty words, or a sentence over thirty: split it or cut it",
    test: t => t.split(/\s+/).length > 60 ||
               t.split(/(?<=[.!?])\s+/).some(x => x.split(/\s+/).length > 30) }

  /* THE RESTATED-IDEA RULE WAS REMOVED, and the removal is the finding: all
     twelve of its hits were correct prose. A reference work names a thing
     and then uses the name. A rule whose every hit is a false positive is
     worse than no rule. */
];

/* ---- gather ------------------------------------------------------------ */
const Prosemap = require("../js/prosemap.js");
const { loadContent } = require("./loadcontent.js");

const C = loadContent();
const rows = Prosemap.collect(C);

/* ---- scan -------------------------------------------------------------- */
const argv = process.argv.slice(2);
const withNotes = argv.indexOf("--notes") >= 0;
const hits = [];
const perReg = { reference: 0, interface: 0, voice: 0 };
for (const r of rows) {
  const t = String(r.text || "");
  const reg = registerOf(r.addr);
  if (!reg) continue;
  perReg[reg]++;
  if (t.length < 40) continue;                 /* labels and stubs */
  const found = [];
  for (const h of HABITS) {
    const sev = h.sev[reg];
    if (!sev || (sev === "note" && !withNotes)) continue;
    let hit;
    if (h.test) hit = h.test(t);
    else { h.re.lastIndex = 0; hit = h.re.test(t); }
    if (hit) found.push(Object.assign({ level: sev }, h));
  }
  if (found.length) hits.push({ addr: r.addr, reg: reg, text: t, habits: found });
}

/* ---- report ------------------------------------------------------------ */
const only = argv.filter(a => !a.startsWith("-"));
const show = only.length ? hits.filter(h =>
  only.some(o => h.addr.startsWith(o) || h.reg === o || h.habits.some(x => x.id === o))) : hits;

const faults = h => h.habits.filter(x => x.level === "fault").length;
show.sort((a, b) => ["reference", "interface", "voice"].indexOf(a.reg) - ["reference", "interface", "voice"].indexOf(b.reg) ||
                    faults(b) - faults(a) || a.addr.localeCompare(b.addr));

console.log("");
console.log("  the register \u2014 " + rows.length + " player-facing passages read" +
            (withNotes ? "" : " (faults only; --notes for the rest)"));
for (const reg of ["reference", "interface", "voice"]) {
  const inReg = hits.filter(h => h.reg === reg);
  console.log("");
  console.log("  " + reg.toUpperCase() + "  " + perReg[reg] + " passages, " + inReg.length + " with a hit");
  for (const h of HABITS) {
    const sev = h.sev[reg];
    if (!sev || (sev === "note" && !withNotes)) continue;
    const n = inReg.filter(x => x.habits.some(y => y.id === h.id)).length;
    console.log("  " + String(n).padStart(5) + "  " + (sev === "fault" ? "fault" : "note ") + "  " +
                h.name.padEnd(24) + (n ? h.why : ""));
  }
}
console.log("");
console.log("  " + hits.length + " passages carry at least one" +
            (only.length ? ", " + show.length + " shown" : ""));
console.log("");

const WRAP = 74;
function wrap(t, pad) {
  const out = []; let line = "";
  for (const w of t.split(/\s+/)) {
    if ((line + " " + w).trim().length > WRAP) { out.push(line); line = w; }
    else line = (line ? line + " " : "") + w;
  }
  if (line) out.push(line);
  return out.map(l => pad + l).join("\n");
}

if (only.length) for (const h of show) {
  console.log("  " + h.addr + "   [" + h.reg + "]");
  console.log("        " + h.habits.map(x => x.name + (x.level === "note" ? " (note)" : "")).join(" \u00b7 "));
  console.log(wrap(h.text, "        "));
  console.log("");
}
else console.log("  name a register, a habit or an address prefix to list the passages.\n");
