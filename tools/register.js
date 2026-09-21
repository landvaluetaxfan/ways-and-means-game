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

/* ---- the habits -------------------------------------------------------- */
/* Each: name, a matcher over the passage, and the note printed with a hit.
   `why` is one line; the doc carries the argument. */
const HABITS = [
  { id: "tail", name: "explanatory tail",
    why: "a fact labelled important was not stated strongly enough",
    re: /,\s*(which|and that|and this)\s+is\s+(the|what|why)\b[^.]*\.|,\s*and\s+it\s+has\s+said\s+so\b|\bthat\s+is\s+the\s+point\b/gi },

  { id: "pair", name: "corrective pair",
    why: "argues with a reader who has not spoken; assert the second half",
    /* The strawman form: a SHORT negated complement, then the same subject
       re-asserted. "The office is not elected. It is held by whoever can
       command a majority" is the informative version and is left alone — the
       tell is when the thing being denied is a word nobody offered. */
    re: /\bis\s+not\s+(?:a|an|the)?\s*\w+(?:\s+\w+)?\.\s+(?:It|This|That|They)\s+(?:is|are)\b/g },

  { id: "tri", name: "tricolon",
    why: "three parallel items is a rhythm; the rhythm outshouts the facts",
    re: /\b(?:a|an|the)\s+\w+(?:\s+\w+)?,\s+(?:a|an|the)\s+\w+(?:\s+\w+)?,\s+and\s+(?:a|an|the)\s+\w+/gi },

  { id: "dash", name: "em-dash sandwich",
    why: "one pair is punctuation; two in a passage is a mannerism",
    test: t => (t.match(/—/g) || []).length >= 4 },

  { id: "vague", name: "vague quantity",
    why: "a reference work gives the decade, the term or the figure",
    re: /\b(?:for (?:a|two|several) (?:century|centuries|generations?|decades?)|in a (?:decade|century) when|for generations|long since|ever since|over the years|in recent years|countless|myriad)\b/gi },

  { id: "signoff", name: "editorial sign-off",
    why: "the sentence ends on an opinion of the fact; end on the fact",
    re: /\b(?:rather than a \w+|which nobody can \w+|and nobody \w+ (?:it|them)|being paid badly for|that is the whole \w+|and that is (?:that|all))\s*\.?/gi },

  { id: "echo", name: "restated idea",
    why: "said once, then said again better; keep the better one",
    test: t => {
      /* two clauses in one passage sharing three+ content words in order */
      const cl = t.split(/[.;]\s+/).map(s =>
        s.toLowerCase().match(/[a-z']{5,}/g) || []).filter(w => w.length >= 4);
      for (let i = 0; i < cl.length; i++)
        for (let j = i + 1; j < cl.length; j++) {
          const shared = cl[i].filter(w => cl[j].includes(w));
          if (shared.length >= 3) return true;
        }
      return false;
    } }
];

/* ---- gather ------------------------------------------------------------ */
const Prosemap = require("../js/prosemap.js");
const { loadContent } = require("./loadcontent.js");

const C = loadContent();
const rows = Prosemap.collect(C);

/* ---- scan -------------------------------------------------------------- */
const hits = [];
for (const r of rows) {
  const t = String(r.text || "");
  if (t.length < 40) continue;                 /* labels and stubs */
  const found = [];
  for (const h of HABITS) {
    if (h.test) { if (h.test(t)) found.push(h); continue; }
    h.re.lastIndex = 0;
    const m = t.match(h.re);
    if (m) found.push(h);
  }
  if (found.length) hits.push({ addr: r.addr, text: t, habits: found });
}

/* ---- report ------------------------------------------------------------ */
const only = process.argv.slice(2).filter(a => !a.startsWith("-"));
const show = only.length ? hits.filter(h =>
  only.some(o => h.addr.startsWith(o) || h.habits.some(x => x.id === o))) : hits;

show.sort((a, b) => b.habits.length - a.habits.length ||
                    a.addr.localeCompare(b.addr));

const byHabit = {};
for (const h of hits) for (const x of h.habits)
  byHabit[x.id] = (byHabit[x.id] || 0) + 1;

console.log("");
console.log("  the register — " + rows.length + " player-facing passages read");
console.log("");
for (const h of HABITS) {
  const n = byHabit[h.id] || 0;
  console.log("  " + String(n).padStart(4) + "  " + h.name.padEnd(20) +
              (n ? h.why : ""));
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

for (const h of show) {
  console.log("  " + h.addr);
  console.log("        " + h.habits.map(x => x.name).join(" · "));
  console.log(wrap(h.text, "        "));
  console.log("");
}

if (!show.length) console.log("  nothing to report.\n");
