#!/usr/bin/env node
/* =============================================================
   FIDGET. A player who touches everything. Plays Act I to its end, and before every sitting's decision uses
   the levers the interface would offer, in a random legal order: clauses, amendments, the whip, lobbying,
   order-paper time, divisions, orders and their approval, initiatives, the signatures on the paper.

     node tools/fidget.js             240 seeds
     SEEDS=40 node tools/fidget.js
     SEED=17 VERBOSE=1 node tools/fidget.js     one run, every lever it pulled

   (briefs/act-one.md, exit gate 5b.) A run is clean when it reaches the curtain or ends with a recorded
   reason, and when none of these happens: a lever throws; the log gains an `IGNORED:` line (an effect the
   engine could not apply); a sitting does not advance; the state does not survive a save and a load with
   the same ending. The answers to decisions are random too, so what it finds is what a person who clicks
   everything and answers anything can reach. It uses the engine's own `can*` checks, as the interface does,
   and never calls `appoint` or any lever the interface does not offer.
   ============================================================= */
"use strict";
const T = require("./testkit.js");
const Engine = require("../js/engine.js");
const C = T.view("flash_i");
const SEEDS = +process.env.SEEDS || 240, ONE = +process.env.SEED || 0, VERBOSE = !!process.env.VERBOSE;

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/* every lever the interface would offer now, as { name, run } */
function levers(st, R) {
  const out = [], pick = a => a[Math.floor(R() * a.length)];
  Object.keys(st.bills || {}).forEach(id => {
    const bs = st.bills[id], b = C.billById[id];
    if (!b || bs.dead || bs.stage === "assented") return;
    Engine.clausesOf(C, id).forEach(cl => {
      const lv = pick(cl.levels || []);
      if (lv) out.push({ name: `clause ${id}.${cl.id}=${lv.id}`, run: () => Engine.setClause(st, C, id, cl.id, lv.id) });
    });
    Engine.amendmentList(st, C, id).forEach(a => out.push({ name: `amend ${id}.${a.id}`, run: () => Engine.amendBill(st, C, id, a.id) }));
    [].concat(st.coalition, st.confidenceSupply, [st.playerParty]).forEach(pid => ["popular", "functional"].forEach(tier => {
      const w = Engine.whippable(st, C, id, pid, tier);
      if (w.max > 0) out.push({ name: `whip ${id} ${pid} ${tier}`, run: () => Engine.setWhip(st, C, id, pid, tier, Math.floor(R() * (w.max + 1))) });
    }));
    (C.actors || []).forEach(a => {
      const l = Engine.lobbyable(st, C, id, a.id);
      if (l.max > 0) out.push({ name: `lobby ${id} ${a.id}`, run: () => Engine.setLobby(st, C, id, a.id, Math.floor(R() * (l.max + 1))) });
    });
    out.push({ name: `grant ${id}`, run: () => Engine.grantSlot(st, C, id) });
    if (bs.stage === Engine.DIVIDES_AT) out.push({ name: `divide ${id}`, run: () => Engine.divide(st, C, id) });
  });
  (C.instruments || []).forEach(si => {
    if (Engine.canMake(st, C, si.id).ok) out.push({ name: `make ${si.id}`, run: () => Engine.makeInstrument(st, C, si.id) });
    if (Engine.canApprove(st, C, si.id).ok) out.push({ name: `approve ${si.id}`, run: () => Engine.approveInstrument(st, C, si.id) });
  });
  Engine.initiatives(st, C).forEach(i => { if (i.ok) out.push({ name: `take ${i.id}`, run: () => Engine.take(st, C, i.id, Math.floor(R() * Math.max(1, i.tempo.length))) }); });
  Engine.signableMembers(st, C).forEach(m => out.push({ name: `sign ${m.id}`, run: () => Engine.collectSignature(st, C, m.id) }));
  return out;
}

function run(seed) {
  const R = rng(seed * 7919 + 13), st = Engine.newGame(C, seed), found = [], pulled = [];
  const note = (kind, text) => found.push(kind + ": " + text);
  let end = null, lastSitting = 0, stuck = 0, logged = (st.log || []).length;
  for (let guard = 0; guard < 60 && !end; guard++) {
    const todo = levers(st, R).filter(() => R() < 0.5).sort(() => R() - 0.5);
    for (const l of todo) {
      try { l.run(); pulled.push(l.name); }
      catch (e) { note("THROW", l.name + " -> " + e.message); }
    }
    /* a person who fiddles still has the estimates to carry before the rise: most sittings from the fifth they give the bill
       time or put it to the House, as actbalance does */
    const ap = st.bills.appropriation;
    if (st.sitting >= 5 && ap && !ap.dead && ap.stage !== "assented" && R() < 0.85) {
      try { if (ap.stage === Engine.DIVIDES_AT) { Engine.divide(st, C, "appropriation"); pulled.push("divide appropriation"); }
            else { Engine.grantSlot(st, C, "appropriation"); pulled.push("grant appropriation"); } }
      catch (e) { note("THROW", "estimates at " + st.sitting + " -> " + e.message); }
    }
    try { Engine.playSitting(st, C, ev => Math.floor(R() * Math.max(1, (ev.choices || []).length))); }
    catch (e) { note("THROW", "playSitting at " + st.sitting + " -> " + e.message); break; }
    try { Engine.advance(st, C); } catch (e) { note("THROW", "advance at " + st.sitting + " -> " + e.message); break; }
    const e = Engine.checkEnd(st, C);
    if (e.over) end = e;
    (st.log || []).slice(logged).forEach(x => { if (/IGNORED:/.test(JSON.stringify(x))) note("IGNORED", String(x.text || JSON.stringify(x)).slice(0, 160)); });
    logged = (st.log || []).length;
    const key = st.sitting + ":" + (st.period || 1);
    stuck = key === lastSitting ? stuck + 1 : 0; lastSitting = key;
    if (stuck >= 3) { note("STUCK", "no progress at sitting " + key); break; }
  }
  if (!end && !found.length) note("NOEND", "no ending after 60 turns, at sitting " + st.sitting);
  try {
    const back = Engine.load(Engine.save(st), C), be = Engine.checkEnd(back, C);
    if ((end && end.kind) !== (be.over ? be.kind : undefined) && end) note("SAVE", "the ending changed across a save and a load: " + end.kind + " -> " + be.kind);
    if (JSON.stringify(Engine.save(back)) !== JSON.stringify(Engine.save(Engine.load(Engine.save(back), C)))) note("SAVE", "a second round trip changed the state");
  } catch (e) { note("THROW", "save and load -> " + e.message); }
  return { seed, end: end ? end.kind + (end.reason ? ":" + end.reason : "") : "none", found, pulled };
}

const ends = {}, kinds = {}, samples = {}; let clean = 0, levers_ = 0;
const seeds = ONE ? [ONE] : Array.from({ length: SEEDS }, (_, i) => i + 1);
seeds.forEach(s => {
  const r = run(s);
  ends[r.end] = (ends[r.end] || 0) + 1; levers_ += r.pulled.length;
  if (!r.found.length) clean++;
  r.found.forEach(f => { const k = f.split(":")[0]; kinds[k] = (kinds[k] || 0) + 1; (samples[f.slice(0, 120)] = samples[f.slice(0, 120)] || []).push(s); });
  if (VERBOSE) console.log(`seed ${s}: ${r.end}\n  ` + r.pulled.join("\n  ") + (r.found.length ? "\n  FOUND " + r.found.join("\n  FOUND ") : ""));
});
console.log(`FIDGET  ${seeds.length} seeds, ${levers_} levers pulled`);
console.log("  endings ", JSON.stringify(ends));
console.log("  clean   ", clean + "/" + seeds.length);
Object.keys(kinds).forEach(k => console.log("  " + k.padEnd(8), kinds[k]));
Object.keys(samples).slice(0, 12).forEach(t => console.log("    " + t + "  (seeds " + samples[t].slice(0, 5).join(",") + (samples[t].length > 5 ? "…" : "") + ")"));
const bad = seeds.length - clean;
const okEnds = Object.keys(ends).every(k => /^act:|^loss:|^election|^settlement|^confidence|^supply/.test(k) || k === "none" ? k !== "none" : true);
if (bad) { console.log(`\nFAILED: ${bad} of ${seeds.length} runs found a fault`); process.exit(1); }
console.log("\nevery run reached the curtain or a recorded ending, and nothing broke");
