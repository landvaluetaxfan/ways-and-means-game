#!/usr/bin/env node
/* =============================================================
   ACT BALANCE. Play Act I to its curtain under a handful of answer strategies and report how each
   one ends, so that the dilemma of the Act (brief act-one.md, exit gate 6) is measured and not
   argued.

     node tools/actbalance.js            80 seeds
     SEEDS=240 node tools/actbalance.js
     STILL=1 node tools/actbalance.js    the Chamber does nothing: every run should lose supply at the rise

   The strategies answer every decision the same way: the first choice, the last, the one that makes
   a promise, the one that does not, the bold one. Each is played twice, once leaving the estimates'
   clauses alone and once KEEPING its promises: setting the promised clause level in the Chamber and,
   where the Treasury's ceiling refuses it, trading down a clause nobody was promised until it fits.
   From the fifth sitting the Chamber grants the estimates a slot a sitting and divides.

   WHAT IT HAS TAUGHT (7 Oct 2026). Act I has no random event, so every seed plays the same game and
   80 seeds are one run 80 times: the variation is the player's answers. No strategy loses: all reach
   the curtain, because nothing in the Act ends a run except leaving the estimates unmoved. What the
   answers change is the price: promising everything and keeping what fits costs public standing
   (about 32 against 49 for refusing everything) and buys the New Progressive Party's loyalty (37 to
   53 against 30), with two of six promises broken because the ceiling cannot hold them all.
   ============================================================= */
"use strict";
const T = require("./testkit.js");
const Engine = require("../js/engine.js");
const C = T.view("flash_i");
const SEEDS = +process.env.SEEDS || 80;
const hasU = ch => [].concat(ch.effects || []).some(f => f && f.undertake);
const STRATS = {
  first:    ev => 0,
  last:     ev => Math.max(0, (ev.choices || []).length - 1),
  promiser: ev => { const i = (ev.choices || []).findIndex(hasU); return i >= 0 ? i : 0; },
  refuser:  ev => { const i = (ev.choices || []).findIndex(c => !hasU(c)); return i >= 0 ? i : 0; },
  /* the furthest-going answer there is: bold, else measured, else the first (a posture is optional, so a decision may lack bold) */
  bold:     ev => { const cs = ev.choices || []; for (const p of ["bold", "measured"]) { const i = cs.findIndex(c => c.posture === p && !c.when); if (i >= 0) return i; } return 0; },
};
const CUTS = [["insurance", "cut"], ["thermal", "tight"], ["floor", "cut"], ["works", "none"], ["transit", "none"]];

function keepPromises(st) {
  const open = (st.undertakings || []).filter(u => u.state === "open" && u.discharge && u.discharge.clause);
  const promised = new Set(open.map(u => u.discharge.clause.clause));
  open.forEach(u => {
    const d = u.discharge.clause, bill = d.bill || "appropriation";
    let r = Engine.setClause(st, C, bill, d.clause, d.level);
    const cuts = CUTS.filter(c => !promised.has(c[0]));
    for (let i = 0; i < cuts.length && !r.ok; i++) {
      Engine.setClause(st, C, bill, cuts[i][0], cuts[i][1]);
      r = Engine.setClause(st, C, bill, d.clause, d.level);
    }
  });
}

function run(seed, name, keep) {
  const st = Engine.newGame(C, seed), pick = STRATS[name];
  let end = null;
  for (let guard = 0; guard < 40 && !end; guard++) {
    Engine.playSitting(st, C, ev => pick(ev));
    if (keep) keepPromises(st);
    const b = st.bills.appropriation;
    if (!process.env.STILL && st.sitting >= 5 && b && !b.dead && b.stage !== "assented") {
      try { if (b.stage === Engine.DIVIDES_AT) Engine.divide(st, C, "appropriation"); else Engine.grantSlot(st, C, "appropriation"); } catch (e) { /* not yet */ }
    }
    Engine.advance(st, C);
    const e = Engine.checkEnd(st, C);
    if (e.over) end = e;
  }
  const u = st.undertakings || [], sc = st.scalars || {};
  return { end: end ? end.kind + (end.reason ? ":" + end.reason : "") : "none",
    kept: u.filter(x => x.state === "kept").length, broken: u.filter(x => x.state === "broken").length,
    npp: Engine.loyaltyOf(st, "psa"), standing: sc.public_standing || 0,
    reserve: st.solvency != null ? st.solvency : sc.solvency || 0,
    assented: st.bills.appropriation.stage === "assented" };
}

Object.keys(STRATS).forEach(name => [false, true].forEach(keep => {
  const ends = {}, sum = { kept: 0, broken: 0, npp: 0, standing: 0, reserve: 0, assented: 0 };
  for (let s = 1; s <= SEEDS; s++) {
    const r = run(s, name, keep);
    ends[r.end] = (ends[r.end] || 0) + 1;
    Object.keys(sum).forEach(k => { sum[k] += +r[k]; });
  }
  const m = k => (sum[k] / SEEDS).toFixed(k === "kept" || k === "broken" ? 1 : 0);
  console.log((name + (keep ? "+keep" : "")).padEnd(14), JSON.stringify(ends), "kept", m("kept"), "broken", m("broken"),
    "NPP", m("npp"), "standing", m("standing"), "reserve", m("reserve"), "assented", sum.assented + "/" + SEEDS);
}));
