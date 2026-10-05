#!/usr/bin/env node
/* THE STORY WALK, AS TEXT (briefs/story-walk.md). The author and Claude read the
   whole story together, a fifth of an act at a time, before walking it decision
   by decision in the browser.

     node tools/walk.js                  the contents: acts, fifths, and what is in each
     node tools/walk.js 2 3              one fifth in full (act 2, fifth 3)
     node tools/walk.js pool             the events no act owns (any time they are eligible)
     node tools/walk.js --campaign <id>  another campaign (Flash I by default)

   An act is what the campaign's theatre frame calls a chapter. An event belongs to
   the chapter it names; one that names none belongs to Act I if it is a prologue or
   timed to an early sitting, or follows an event that does (a queued outcome); the
   rest are the pool. Inside an act the order is the order of first eligibility, with
   an outcome straight after what queues it. This is the order a reader can follow,
   not a route: a player meets a subset, one decision a sitting.

   Every block says where it lives (the event id) so an edit can be located, and
   whether it follows the author's own plan (design/35) or was generated from it. The
   second mark is a heuristic and is for the author to correct in review. */
"use strict";
const vm = require("vm"), path = require("path");
const root = path.join(__dirname, "..");
vm.runInThisContext(require("./loadcontent.js").source() + "\n;globalThis.__C = CONTENT;");
const argv = process.argv.slice(2);
const ci = argv.indexOf("--campaign");
const campaign = ci >= 0 ? argv.splice(ci, 2)[1] : "flash_i";
const C = globalThis.__C.forCampaign(campaign);
const Engine = require(path.join(root, "js", "engine.js"));
const st = Engine.newGame(C, 1);
const events = C.events || [];

/* who queues what, anywhere an effect can */
const queuer = {};
const scan = (o, from) => {
  if (!o || typeof o !== "object") return;
  if (Array.isArray(o)) { o.forEach(x => scan(x, from)); return; }
  if (o.queue) [].concat(o.queue).forEach(q => { if (q && q.event && !queuer[q.event]) queuer[q.event] = from; });
  Object.keys(o).forEach(k => scan(o[k], from));
};
events.forEach(e => scan(e, e.id));
(C.initiatives || []).forEach(i => { scan(i, "init:" + i.id); if (i.event && !queuer[i.event]) queuer[i.event] = "init:" + i.id; });

const when = e => e.when || {};
const early = e => e.prologue || (e.at != null && e.at <= 13) || (when(e).minSitting != null && when(e).minSitting <= 13);
const actOf = {};
events.forEach(e => { if (e.chapter != null) actOf[e.id] = e.chapter; else if (early(e)) actOf[e.id] = 1; });
for (let pass = 0; pass < 6; pass++) events.forEach(e => {
  if (actOf[e.id] == null && queuer[e.id] && actOf[queuer[e.id]] != null) actOf[e.id] = actOf[queuer[e.id]];
});
const key = e => e.prologue ? -1 : e.at != null ? e.at : when(e).minSitting != null ? when(e).minSitting : 50;
const keyOf = {};
events.forEach(e => { keyOf[e.id] = key(e); });
events.forEach(e => { if (queuer[e.id] && keyOf[queuer[e.id]] != null && e.queuedOnly) keyOf[e.id] = keyOf[queuer[e.id]] + 0.5; });
const index = {}; events.forEach((e, i) => { index[e.id] = i; });
const order = list => list.slice().sort((a, b) => keyOf[a.id] - keyOf[b.id] || index[a.id] - index[b.id]);

const acts = [1, 2, 3].map(n => ({ n, events: order(events.filter(e => actOf[e.id] === n)) }));
const pool = order(events.filter(e => actOf[e.id] == null));
const fifths = list => { const out = [], size = Math.ceil(list.length / 5) || 1;
  for (let i = 0; i < 5; i++) out.push(list.slice(i * size, (i + 1) * size)); return out; };

const kind = e => e.setpiece ? "page" : e.queuedOnly ? "outcome" : (e.perSitting != null || e.chance != null) ? "random"
  : (e.choices || []).length ? "decision" : "page";
const PLAN = /works|almanac|bellamy|\bair\b|air_|referendum|annex|mandate|charter|stranded|platform|federal|f1_|vantage/i;
const mark = e => PLAN.test(e.id + " " + (e.title || "")) ? "the author's plan (design/35)" : "generated";
const playFrame = ((C.administrations || [])[0] || {}).play || {};
const actName = n => ((playFrame.acts || []).find(a => a.chapter === n) || {}).title || "";

function words(cond) {
  const k = Object.keys(cond || {});
  return k.length ? k.map(x => x + " " + JSON.stringify(cond[x])).join("; ") : "any time";
}
function eff(c) {
  let d = []; try { d = Engine.describe(st, C, c.effects || []); } catch (e) { d = ["(effects not described)"]; }
  d = d.map(x => typeof x === "string" ? x : (x && x.text) || JSON.stringify(x));
  return d.length ? d.join("; ") : "nothing that moves a number";
}

function contents() {
  console.log("THE STORY WALK: " + campaign + ". " + events.length + " events; a fifth of an act at a time.\n");
  acts.forEach(a => {
    console.log("ACT " + a.n + (actName(a.n) ? " — " + actName(a.n) : "") + "  (" + a.events.length + " events)");
    fifths(a.events).forEach((f, i) => {
      console.log("  " + a.n + "." + (i + 1) + "  " + f.length + " events: " + f.map(e => e.title || e.id).join(" · ").slice(0, 400));
    });
  });
  console.log("\nPOOL  (" + pool.length + " events no act owns; read after the acts)");
  console.log("  " + pool.map(e => e.title || e.id).join(" · ").slice(0, 600));
}

function show(list, head) {
  console.log("=".repeat(78) + "\n" + head + "  (" + list.length + " events)\n" + "=".repeat(78));
  list.forEach((e, n) => {
    console.log("\n### " + (n + 1) + ". " + (e.title || e.id));
    console.log("[" + e.id + " · " + kind(e) + (e.speaker ? " · speaker: " + e.speaker : "") +
      (queuer[e.id] ? " · queued by " + queuer[e.id] : "") + "]  provenance: " + mark(e));
    console.log("eligible: " + (e.at != null ? "sitting " + e.at : e.prologue ? "the prologue" : words(when(e))) +
      (e.weight != null ? " · weight " + e.weight : "") + (e.once ? " · once" : ""));
    String(e.body || "").split(/\n\s*\n/).forEach((p, i) => console.log("\n  [" + (i + 1) + "] " + p.replace(/\s*\n\s*/g, " ")));
    (e.choices || []).forEach((c, i) => {
      console.log("\n  CHOICE " + (i + 1) + (c.posture ? " (" + c.posture + ")" : "") + ": " + c.label);
      if (c.note) console.log("    note:   " + c.note.replace(/\s*\n\s*/g, " "));
      console.log("    does:   " + eff(c));
      if (c.result) console.log("    result: " + c.result.replace(/\s*\n\s*/g, " "));
    });
  });
}

const [a, b] = argv;
if (!a) contents();
else if (a === "pool") show(pool, "THE POOL");
else {
  const act = acts.find(x => x.n === Number(a)), f = Number(b);
  if (!act || !(f >= 1 && f <= 5)) { console.error("usage: node tools/walk.js <act 1-3> <fifth 1-5>"); process.exit(1); }
  show(fifths(act.events)[f - 1], "ACT " + act.n + (actName(act.n) ? " — " + actName(act.n) : "") + ", FIFTH " + f);
}
