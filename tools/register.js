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
  /* THE TAIL, AND ONLY WHERE IT IS EMPTY. The first version flagged every
     ", which is the ..." and reported 57 passages; reading them, 27 were not
     the habit at all. A tail that ends on a NEW fact is doing work —
     "which is the first elected office she has ever held", "which is why one
     party holds all seven" — and cutting those would have flattened the
     prose to satisfy a regex. The habit is the tail that ends on an
     ABSTRACTION the sentence already implied: the point, the difficulty,
     the trade, what a ledger is for.

     So a tail is reported only when it introduces no number, no proper noun
     and fewer than four content words of its own. That split measured 30
     against 27, and the 30 were all genuine. */
  { id: "tail", kind: "fault", name: "explanatory tail",
    why: "a tail that ends on an abstraction the sentence already implied",
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
        if (/\d/.test(tail)) continue;                       /* a number is a fact */
        if (/\b[A-Z][a-z]{2,}/.test(tail)) continue;          /* so is a proper noun */
        const words = (tail.toLowerCase().match(/[a-z']+/g) || [])
          .filter(w => w.length > 3 && !ABSTRACT.has(w) && !STOP.has(w));
        if (words.length < 4) return true;                    /* nothing new said */
      }
      return false;
    } },

  { id: "pair", kind: "judgement", name: "corrective pair",
    why: "argues with a reader who has not spoken; assert the second half",
    /* The strawman form: a SHORT negated complement, then the same subject
       re-asserted. "The office is not elected. It is held by whoever can
       command a majority" is the informative version and is left alone — the
       tell is when the thing being denied is a word nobody offered. */
    re: /\bis\s+not\s+(?:a|an|the)?\s*\w+(?:\s+\w+)?\.\s+(?:It|This|That|They)\s+(?:is|are)\b/g },

  { id: "tri", kind: "judgement", name: "tricolon",
    /* Judgement, not a fault: a bill that requires a register, a hearing and
       a decision requires three things, and continuity_registration/contested
       is a list rather than a cadence. A regex cannot tell an enumeration
       from a flourish. */
    why: "three parallel items: a real list, or a rhythm outshouting the facts?",
    re: /\b(?:a|an|the)\s+\w+(?:\s+\w+)?,\s+(?:a|an|the)\s+\w+(?:\s+\w+)?,\s+and\s+(?:a|an|the)\s+\w+/gi },

  { id: "dash", kind: "fault", name: "em-dash sandwich",
    why: "one pair is punctuation; two in a passage is a mannerism",
    test: t => (t.match(/—/g) || []).length >= 4 },

  { id: "vague", kind: "fault", name: "vague quantity",
    why: "a reference work gives the decade, the term or the figure",
    /* "for a decade" and "for two centuries" left this pattern: a decade is
       a quantity, and a reference work may legitimately give one. The tells
       are the phrases that name no period at all. */
    re: /\b(?:in a (?:decade|century) when|for generations|long since|ever since|over the years|in recent years|since time|countless|myriad)\b/gi },

  { id: "signoff", kind: "judgement", name: "editorial sign-off",
    why: "the sentence ends on an opinion of the fact; end on the fact",
    /* "rather than" came out of this pattern. It flagged four constituency
       notes whose contrasts are exactly right — a technical question rather
       than a political one, a landlord's vote rather than a tenant's — and a
       construction that useful cannot be a fault. What is left is the tail
       that ends on the author's verdict and nothing else. */
    re: /\b(?:which nobody can \w+|and nobody \w+ (?:it|them)|being paid badly for|that is the whole \w+|and that is (?:that|all))\s*\.?/gi },

  /* THE RESTATED-IDEA RULE WAS REMOVED, and the removal is the finding.
     It looked for two clauses in a passage sharing three or more content
     words, and every one of the twelve it reported was correct prose:
     encyclopedia/articles/commonwealth explains that development spending
     raises a station's closure ratio and that a higher closure ratio raises
     its capacity to leave, which repeats the term because that is the causal
     chain; bills/thermal2 does the same. A reference work names a thing and
     then uses the name.

     A rule whose every hit is a false positive is worse than no rule: it is
     the line that teaches a reader to skim the report. If the habit needs
     catching, it needs a signal that is not lexical repetition. */
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
/* FAULTS FIRST, THEN THE ONES THAT NEED READING. The three judgement
   habits are real patterns that a regex cannot separate from their good
   uses: "The office is not elected. It is held by whoever can command a
   majority" is how an encyclopedia says it, and "It is not dishonest. It
   is a bet that the bill comes due to somebody else" is the habit, and
   nothing in the text distinguishes them. Reporting both as faults is how
   a style checker gets argued with once and ignored afterwards. */
for (const kind of ["fault", "judgement"]) {
  const hs = HABITS.filter(h => (h.kind || "fault") === kind);
  if (!hs.length) continue;
  console.log(kind === "fault" ? "  mechanical \u2014 fix these"
                               : "\n  judgement \u2014 read these and decide");
  for (const h of hs) {
    const n = byHabit[h.id] || 0;
    console.log("  " + String(n).padStart(4) + "  " + h.name.padEnd(20) +
                (n ? h.why : ""));
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

for (const h of show) {
  console.log("  " + h.addr);
  console.log("        " + h.habits.map(x => x.name).join(" · "));
  console.log(wrap(h.text, "        "));
  console.log("");
}

if (!show.length) console.log("  nothing to report.\n");
