/* =============================================================
   AN EVENT PAGE MUST EXPLAIN (design/51; the author, 27 Sep: "The player
   doesn't know what Cordell is ... the target is an in-universe news
   source, think New York Times reporting on this").

   The register is a newspaper's. A report is read by somebody who does not
   know the story, so it says what happened first, in plain words, and it
   introduces every name the first time it uses one. Each page stands alone,
   as each article does: a reader may meet it before any other.

   Checked here, and failed by lint:

     headline   `setpiece.title` says what happened, in 14 words or fewer
     lede       the body's first paragraph is 12 to 45 words
     sentences  none over 40 words, and the body's average 24 or fewer
                (a document's legal text is exempt: that is how clauses read)
     names      a company, institution, paper, market or setting term in
                INTRODUCE must be explained in the sentence it first appears
                in or the one after it, by one of its words, as a report glosses
                a name in an apposition or the next sentence; a character must
                be given a role in
                the sentence that first names them, the page's speaker too,
                because a report introduces everybody in its own words
     register   no "you" in the report's own words (quotations and the
                voices are what people said): a report is written in the
                third person; and no interface words ("tab")

   What a check cannot do is tell whether the explanation is good. It can
   refuse the page that never gives one, which is the fault that keeps
   coming back. A name that fails here and is genuinely common knowledge
   (Earth, Kenya) is not in INTRODUCE; add one that needs introducing the
   day content first names it.
   ============================================================= */
"use strict";

/* a place is a capitalised word after "in", "between" or "over", and a
   month or a weekday is not one: "imposed in March" names no war */
const MONTHS_DAYS = "January|February|March|April|May|June|July|August|September|October|" +
  "November|December|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday";

/* name (a regular expression's source) -> the words that introduce it */
const INTRODUCE = [
  ["Cordell", /mining|extraction|Gabon/i],
  ["(?:Bellamy )?Almanac Works|the Works", /refiner|foundry|platform|station|orbit/i],
  ["Alphabet-JPMorgan Omni", /\bbank/i],
  ["Underwriters", /insur|syndicat|mutual|lend/i],
  ["Guild Bench", /Alliance of Business and Government|functional|profession/i],
  ["Alliance of Business and Government", /\bpart(y|ies)\b|\bbench|\bmembers\b|\bleader/i],
  ["The Spindle|the Spindle", /newspaper|paper of record/i],
  ["Ring Network", /broadcast/i],
  ["(?:the )?Tribunal", /\bcourt\b|judge/i],
  ["Standby Facility", /\bbanks?\b|\bloan|\bcredit\b|\bline\b/i],
  ["General Assembly", /United Nations/i],
  ["International Court of Justice", /United Nations|world court|court of/i],
  ["Homestead", /station|habitat/i],
  ["the Bourse", /market|exchange|dealer|trad/i],
  ["engineering authority", /(body|agency|engineers|without|minister|may)/i],
  ["Allocation Act", /\blaw\b|\bact\b.*(allows|permits|lets|gives)|statute/i],
  ["shed order", /\blist\b|order in which|who stops|priority/i],
  ["tier four", /lowest|first to|bottom/i],
  ["suspension|suspended", /paus|not running|stopp|held|switched off|halt/i],
  ["substrate", /hardware|computer|machine/i],
  ["thermal margin", /radiat|heat|spare/i],
  ["quota forward", /sold|sale|promise|deliver/i],
  ["volume lease|the lease", /let|rent|lease[ds]? (?:to|for)/i],
  ["indemnity", /insur|premium|payout|cover/i],
  ["repatriation programme|repatriation plan", /bring|home|return|return|down/i],
  ["joint mandate", /United Nations|jointly|administ/i],
  ["Cordell (?:mining )?leases|the leases", /right|ore|mine|mining/i],
  ["the ring", /station|band/i],
  ["[Tt]ethers?", /elevator/i],
  ["[Tt]he reserve", /cash|money|funds|dollars/i],
  ["Home Rule", /\bpart(y|ies)\b/i],
  ["Trades Left", /current|wing|faction|unions?/i],
  ["Liberal Party|the Liberals", /opposition|consortium|shipping/i],
  ["(?<!Law and )the Charter", /constitution/i],
  /* NOT A NAME BUT A VAGUENESS (the author on the Bellamy page: "Conflict?
     What conflict? A real news article wouldn't just vaguely bring up a
     conflict"). Sanctions say who imposed them; a war says where. */
  ["[Ss]anctions", /European Union|United Nations|Brussels|Security Council|imposed by|[A-Z][a-z]+'s\s/,
   "sanctions", "saying whose they are"],
  ["conflict|war", new RegExp("\\b(?:in|between|over) (?:the )?(?!(?:" + MONTHS_DAYS + ")\\b)[A-Z][a-z]+|[A-Z][a-z]+ (?:war|conflict)"),
   "a conflict", "saying where it is and between whom"]
];

const STOP = new Set(["the", "and", "for", "of", "to", "mp", "rt.", "hon.", "jr.", "minister", "shadow"]);

/* the page's text in the order a reader meets it: the body, then the
   sections, an epigraph first. A document is marked so the sentence rules
   can leave its clauses alone. */
function pageParts(ev) {
  const sp = ev && typeof ev.setpiece === "object" && ev.setpiece ? ev.setpiece : {};
  const secs = sp.sections || [];
  const out = [];
  const add = (text, kind) => { if (text && String(text).trim()) out.push({ text: String(text), kind }); };
  secs.filter(s => s.kind === "epigraph").forEach(s => add(s.body, "epigraph"));
  String((ev && ev.body) || "").split(/\n\s*\n/).map(p => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean).forEach((p, i) => add(p, i === 0 ? "lede" : "body"));
  secs.filter(s => s.kind !== "epigraph").forEach(s => {
    if (s.head) add(s.head, "head");
    if (s.kind === "voices") [].concat(s.body || []).forEach(v => {
      if (typeof v === "string") add(v, "voice");
      else { add(v.said, "voice"); add(v.who, "who"); }
    });
    else add(s.body, s.kind === "document" ? "document" : "body");
    if (s.source) add(s.source, "who");
  });
  return out;
}

const sentences = t => String(t).replace(/([.!?])["'”]?\s+(?=["'“]?[A-Z0-9])/g, "$1\u0001")
  .split("\u0001").map(s => s.trim()).filter(Boolean);
const words = s => (String(s).match(/[A-Za-z0-9À-ɏ'’-]+/g) || []).length;
const unquoted = s => String(s).replace(/"[^"]*"/g, " ").replace(/“[^”]*”/g, " ");

function surname(c) {
  const n = String(c.name || "").replace(/\b(Rt\.|Hon\.|MP|Jr\.|President)\b/g, " ").trim().split(/\s+/);
  const last = n[n.length - 1] || "";
  return n.length > 2 && /^(van|von|de|da)$/i.test(n[n.length - 2]) ? n[n.length - 2] + " " + last : last;
}
function roleWords(c) {
  return String(c.role || "").toLowerCase().split(/[^a-z-]+/).filter(w => w.length > 3 && !STOP.has(w))
    .concat(/prime minister/i.test(c.role || "") ? ["prime minister"] : []);
}

/* the faults of one event page, each a sentence saying what to fix */
function checkPage(ev, characters) {
  const faults = [];
  const sp = ev && typeof ev.setpiece === "object" && ev.setpiece ? ev.setpiece : {};
  if (!sp.title) faults.push("no headline: give setpiece.title, saying what happened");
  else if (words(sp.title) > 14) faults.push("headline is " + words(sp.title) + " words; 14 at most");

  const parts = pageParts(ev);
  const lede = parts.find(p => p.kind === "lede");
  if (!lede) faults.push("no body: a page's story is its body");
  else {
    const n = words(lede.text);
    if (n < 12 || n > 45) faults.push("the lede is " + n + " words; 12 to 45, saying what happened");
  }
  const prose = parts.filter(p => p.kind === "lede" || p.kind === "body" || p.kind === "voice");
  const all = [].concat(...prose.map(p => sentences(p.text)));
  all.forEach(s => { if (words(s) > 40) faults.push("a sentence of " + words(s) + " words: \"" + s.slice(0, 60) + "...\""); });
  const told = [].concat(...parts.filter(p => p.kind === "lede" || p.kind === "body").map(p => sentences(p.text)));
  if (told.length) {
    const mean = told.reduce((a, s) => a + words(s), 0) / told.length;
    if (mean > 24) faults.push("sentences average " + mean.toFixed(1) + " words; 24 at most");
  }
  prose.filter(p => p.kind !== "voice").concat(parts.filter(p => p.kind === "head")).forEach(p => {
    if (/\byou(r|rs|rself)?\b/i.test(unquoted(p.text)))
      faults.push("\"you\" outside a quotation: a report is in the third person");
    if (/\btabs?\b/i.test(p.text)) faults.push("an interface word (\"tab\") in the prose");
  });

  /* names: the first sentence that uses one must say what it is */
  const flow = [].concat(...parts.filter(p => p.kind !== "document").map(p =>
    (p.kind === "who" ? [p.text] : sentences(p.text))));
  INTRODUCE.forEach(([name, gloss, label, why]) => {
    const re = new RegExp("\\b(?:" + name + ")\\b");
    const at = flow.findIndex(s => re.test(s));
    if (at < 0) return;
    const first = flow[at], next = flow[at + 1] || "";
    if (!gloss.test(first.replace(re, " ")) && !gloss.test(next.replace(re, " ")))
      faults.push("names " + (label || name.split("|")[0].replace(/\(\?:[^)]*\)\??/g, "").trim()) +
                  " without " + (why || "saying what it is") + ", where it first appears: \"" + first.slice(0, 70) + "\"");
  });
  (characters || []).forEach(c => {
    if (!c || /prime minister/i.test(c.role || "")) return;
    const sn = surname(c);
    if (!sn || sn.length < 3) return;
    const re = new RegExp("\\b" + sn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b");
    const first = flow.find(s => re.test(s));
    if (!first) return;
    const low = first.toLowerCase();
    if (!roleWords(c).some(w => low.indexOf(w) >= 0))
      faults.push("names " + sn + " without their role, where first named: \"" + first.slice(0, 70) + "\"");
  });
  return faults;
}

/* A DECISION IS HELD TO THE SAME RULES, less the ones that belong to a
   news report (design/51, the author: "all of these gripes should be taken
   into consideration" on every prose pass). It has no headline or lede, it
   addresses the player as Prime Minister, so "you" is its register, and a
   glossary term is footnoted where it first appears and taught in order
   by lint's own check, so it need not be glossed again in every scene.
   What stays: every name and person introduced, no sentence over forty
   words, sanctions with an owner and a war with a place. */
function checkDecision(ev, characters, glossary) {
  const gl = new Set((glossary || []).map(g => String(g.term || g).toLowerCase()));
  const isTerm = n => gl.has(n.toLowerCase()) || gl.has(n.toLowerCase().replace(/^the /, ""));
  return checkPage(ev, characters).filter(f => {
    if (/^no headline|^headline is|the lede is|"you" outside|^sentences average/.test(f)) return false;
    const m = f.match(/^names (.+?) without/);
    return !(m && isTerm(m[1]));
  });
}

const api = { checkPage, checkDecision, pageParts, INTRODUCE };
if (typeof module !== "undefined") module.exports = api;
