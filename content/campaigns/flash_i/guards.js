/* =============================================================
   FLASH I: THE CAMPAIGN'S GUARDS.

     npm run guards        every campaign's (tools/guards.js)
     node content/campaigns/flash_i/guards.js     this one's

   What Flash I's STORY promises, as opposed to what the engine does:
   the chain's dates, the Act that can be carried, the five tiers, the
   pivots and the tier fall, the facility, and the canon run that lands
   the debt trap and goes to the count. test.js asserts the engine on
   the world's content alone and never reads a line of this folder.

   THESE ARE THE AUTHOR'S TO REWRITE WITH THE STORY. A guard that fails
   after a rewrite is saying the story changed. Change the guard to say
   what the story now promises, or delete it if the promise is gone;
   the engine's tests will not move either way. Each block runs on its
   own (tools/testkit.js `guard`), so a block that names an event the
   rewrite removed fails once, with the reason, and the rest still run.

   Lifted from test.js on 23 Sep 2026, assertion for assertion; the
   engine halves of the reserved time, the named creditors, the crisis
   channel and an event's own effects stayed there on probes.
   ============================================================= */
"use strict";
const T = require("../../../tools/testkit.js");
const ALL = T.all();
const CONTENT = T.view("flash_i");
const Engine = require("../../../js/engine.js");
const PROLOGUE1 = T.prologue1(CONTENT);
const RUN_BOUND = T.runBound(CONTENT);
const guard = T.guard;

console.log("FLASH I: THE CAMPAIGN'S GUARDS");
console.log("=".repeat(58));

guard("THE FREEZE PAYS THE INDEMNITY (a gate that was dead, 21 Sep)", ok => {
  /* The freeze records itself, which is what re-opens the payout branches. */
  const ev = id => CONTENT.events.find(e => e.id === id);
  const fz = ev("f1_accounts_freeze");
  const sets = [].concat(fz.effects || []).some(e => e.flag === "f1_frozen");
  ok("the accounts freezing sets the flag the indemnity pays on", sets);
  const ind = ev("indemnity_settles");
  const payout = (ind.choices || []).filter(c =>
    c.when && (c.when.flags || []).indexOf("f1_frozen") >= 0);
  ok("so both payout branches of the indemnity are reachable",
     payout.length === 2, payout.length + " branches want f1_frozen");
  const froze = Engine.newGame(CONTENT);
  froze.flags.f1_frozen = true; froze.flags.indemnity_suppliers = true;
  ok("and one of them opens when the accounts have frozen",
     Engine.matches(froze, payout[0].when) &&
     !Engine.matches(Engine.newGame(CONTENT), payout[0].when));
});

guard("THE CRISIS BRINGS ITS OWN TIME (design/32 §E.5)", ok => {
  /* RESERVED ORDER-PAPER TIME (design/32 §E.5). The dilemma's five slots
     went into the general pool, where every bill listed earlier in content
     spent them first, and stayed there for good: the Annexation Bill reached
     its division in no playtest strategy, and every later session had eleven
     slots and not six. */
  {
    const dil = CONTENT.eventById.f1_dilemma;
    const annex = dil.choices.find(c => [].concat(c.effects || []).some(f => f.flag === "f1_annexing"));
    const r = Engine.newGame(CONTENT);
    const total0 = r.slots.total;
    Engine.apply(r, CONTENT, annex.effects);
    ok("the crisis brings its own time, reserved for the Act",
       Engine.reservedFor(r, "annexation") === 5 && r.slots.total === total0,
       Engine.reservedFor(r, "annexation") + " reserved, " + r.slots.total + " general");
    r.slots.used = r.slots.total;
    const other = CONTENT.bills.find(b => b.id !== "annexation" && !r.bills[b.id].dead &&
                                        r.bills[b.id].stage !== "drafting" &&
                                        r.bills[b.id].stage !== Engine.DIVIDES_AT);
    ok("and no other bill can spend it", !Engine.grantSlot(r, CONTENT, other.id).ok, other.id);
    let guard = 0;
    while (r.bills.annexation.stage !== Engine.DIVIDES_AT && guard++ < 12) {
      const g = Engine.grantSlot(r, CONTENT, "annexation");
      if (!g.ok) Engine.advance(r, CONTENT);
    }
    while (!Engine.canDivide(r, CONTENT, "annexation").ok && guard++ < 16) Engine.advance(r, CONTENT);
    const d = Engine.divide(r, CONTENT, "annexation");
    ok("so the Act reaches its division on its own time alone",
       !!d.result && r.slots.used === r.slots.total && Engine.reservedFor(r, "annexation") === 0,
       d.result ? "divided, reserve " + Engine.reservedFor(r, "annexation") : (d.reason || "no division"));

    const x = Engine.newGame(CONTENT);
    Engine.apply(x, CONTENT, annex.effects);
    const rise = x.risesAt + 1;
    while (x.sitting <= rise) Engine.advance(x, CONTENT);
    ok("and reserved time goes with the sitting period it was granted for",
       Engine.reservedFor(x, "annexation") === 0 && x.slots.total === total0,
       Engine.reservedFor(x, "annexation") + " reserved, " + x.slots.total + " general");
  }
});

guard("THE EMERGENCY FACILITY IS REPAYABLE (the author, 23 Sep)", ok => {
  const loan = CONTENT.eventById.f1_loan;
  const take = loan && loan.choices.find(c => (c.effects || []).some(e => e.undertake));
  ok("the loan undertakes a repayment", !!take);
  if (!take) { process.exitCode = 1; return; }

  const a = Engine.newGame(CONTENT);
  a.scalars.solvency = 25000;
  Engine.apply(a, CONTENT, take.effects);
  const u = a.undertakings.find(x => x.id === "f1_debt");
  ok("and says how it is kept", !!(u && u.discharge), JSON.stringify(u && u.discharge));
  const ini = Engine.initiatives(a, CONTENT).find(i => i.id === "repay_facility");
  ok("repaying it is something the government can do", !!(ini && ini.ok), ini && ini.reason);
  ok("and it takes no order-paper time", ini && ini.cost === 0, ini && ini.cost);
  const used = a.slots.used, solv = a.scalars.solvency;
  const r = Engine.take(a, CONTENT, "repay_facility", 0);
  ok("paying it keeps the promise", r.ok && u.state === "kept", r.reason || u.state);
  ok("out of the reserve, and not out of House time",
     a.scalars.solvency === solv - 19800 && a.slots.used === used,
     solv + " -> " + a.scalars.solvency + ", slots " + used + " -> " + a.slots.used);
  ok("and the Alliance answers", a.queue.some(q => q.eventId === "f1_facility_closed"));

  const b = Engine.newGame(CONTENT);
  b.scalars.solvency = 0;                       /* the loan itself brings 18,000 */
  Engine.apply(b, CONTENT, take.effects);
  ok("a government that cannot pay in cash is not offered the cash",
     Engine.take(JSON.parse(JSON.stringify(b)), CONTENT, "repay_facility", 0).ok === false);
  const c2 = JSON.parse(JSON.stringify(b));
  const rl = Engine.take(c2, CONTENT, "repay_facility", 1);
  ok("but can settle against the leases",
     rl.ok && c2.undertakings.find(x => x.id === "f1_debt").state === "kept" &&
     !!c2.flags.cordell_leases_ceded, rl.reason);
  let guard = 0;
  while (!b.dissolved && guard++ < 200) Engine.advance(b, CONTENT);
  const ub = b.undertakings.find(x => x.id === "f1_debt");
  ok("unpaid when the House rises, it breaks", ub.state === "broken", ub.state);
  ok("and the Alliance calls it", b.queue.some(q => q.eventId === "f1_debt_called") ||
     (b.seen.f1_debt_called || 0) > 0);
  const called = CONTENT.eventById.f1_debt_called;
  b.scalars.solvency = 5000;
  const shut = called && !Engine.matches(b, called.choices[0].when || {});
  b.scalars.solvency = 30000;
  ok("a reserve too small to pay cannot pay it, and one large enough can",
     shut && Engine.matches(b, called.choices[0].when || {}));
});

guard("THE ANNEXATION ACT CAN BE CARRIED", ok => {

  /* THE ASSERTION BEHIND THE GATE CHANGE. The canon endings used to gate on
     `f1_annexing` \u2014 a flag the Prime Minister sets by DECIDING \u2014 which
     annexed 184,000 people with no reading, no division and no Act, in a
     game whose thesis is that things happen by parliamentary act. Moving the
     gate to `almanac_annexed` was two words and was reverted once, because
     the Act could not then be carried and an ending nobody can reach is
     worse than one that is merely unearned.

     This is the condition that let it move, so it is the thing to watch: if
     balance ever drifts back, the Act stops passing and this fails LOUDLY,
     rather than the endings quietly becoming unreachable. */
  const st = Engine.newGame(CONTENT);
  Engine.apply(st, CONTENT, [{ flag: "station_issue" }, { flag: "annexed_almanac_works" },
                             { flag: "f1_annexing" }]);
  const bill = (CONTENT.bills || []).find(b => /annex/i.test(b.id));
  ok("there is an Annexation Bill", !!bill, bill ? bill.id : "none");
  if (bill) {
    ok("and passing it is what sets the flag the endings read",
       (bill.onPass || []).some(e => e.flag === "almanac_annexed"));
    let dividedAt = null;
    for (let i = 0; i < 40 && st.bills[bill.id].stage !== "assented"; i++) {
      if (st.bills[bill.id].stage === Engine.DIVIDES_AT) {
        const r = Engine.divide(st, CONTENT, bill.id);
        if (r && r.ok !== false && dividedAt == null) dividedAt = st.sitting;
      }
      if (st.slots.used < st.slots.total) Engine.grantSlot(st, CONTENT, bill.id);
      Engine.advance(st, CONTENT);
    }
    ok("a government that spends its order paper on it carries it",
       st.bills[bill.id].stage === "assented",
       st.bills[bill.id].stage + (dividedAt ? ", divided at sitting " + dividedAt : ""));
    ok("and the Act sets the flag the settlements gate on",
       st.flags.almanac_annexed === true);
    ok("and the government is still standing afterwards",
       !Engine.checkEnd(st, CONTENT).over,
       "friction " + st.scalars.friction + ", legitimacy " + st.scalars.legitimacy +
       ", solvency " + st.scalars.solvency);

    /* and the endings gate on the Act, not the intention */
    const onAct = (CONTENT.settlements || []).filter(s0 =>
      ((s0.when || {}).flags || []).indexOf("almanac_annexed") >= 0);
    const onWish = (CONTENT.settlements || []).filter(s0 =>
      ((s0.when || {}).flags || []).indexOf("f1_annexing") >= 0);
    ok("the annexation endings gate on the Act", onAct.length >= 3, onAct.length + " tiers");
    ok("and none of them gates on the intention any more", onWish.length === 0,
       onWish.map(s0 => s0.id).join(", ") || "none");
  }
});

guard("THE ALLIANCE'S FACILITY IS ON THE ACCOUNT (named creditors)", ok => {
  const fl = Engine.newGame(CONTENT);
  fl.scalars.solvency = 25000;
  const loan = CONTENT.eventById.f1_loan.choices[0];
  Engine.apply(fl, CONTENT, loan.effects);
  ok("the emergency facility is on the account, principal and rate",
     Engine.debtOf(fl, "alliance") === 19800, Engine.debtOf(fl, "alliance") + " owed");
  const u = (fl.undertakings || []).find(x => x.id === "f1_debt");
  ok("and its promise is open", u && u.state === "open");
  Engine.EFFECTS.move(fl, CONTENT, { "debt.alliance": -19800 });
  Engine.settle(fl, CONTENT);
  ok("and kept when the Alliance is owed nothing, however it was paid",
     u && u.state === "kept", u && u.state);
});

guard("THE FIVE TIERS (design/35)", ok => {
  const fresh = () => {
    const s = Engine.newGame(CONTENT);
    s.sitting = (CONTENT.setup.settlementFloorSittings || 0) + 1;
    return s;
  };
  const f1 = (CONTENT.settlements || []).filter(x => x.campaign === "flash_i");
  ok("Flash I carries its five tiers", f1.length === 5, f1.map(x => x.id).join(", "));
  /* THE TWO FAMILIES DO NOT RACE (design/32 §E.1). They were ranked
     together and only the winner recorded, so an intermediate answer landing
     on the same sitting as a crisis tier took the canon ending off the board;
     and four of Flash I's five tiers were routed to the intermediate channel,
     so their achievements could never be earned. */
  ok("every Flash I tier is on the crisis channel",
     f1.every(x => x.crisis),
     CONTENT.settlements.map(x => x.id + (x.crisis ? "*" : "")).join(" "));
  const both = fresh(); both.flags.tribunal_established = true;
  both.flags.almanac_annexed = true;
  Object.assign(both.scalars, { legitimacy: 80, solvency: 75000, friction: 30 });
  Engine.checkSettlement(both, CONTENT);
  ok("an intermediate answer and a crisis tier landing together are both recorded",
     both.settledAs === "graduated_personhood" && both.resolvedAs === "f1_triumph",
     JSON.stringify({ settledAs: both.settledAs, resolvedAs: both.resolvedAs }));
  Object.assign(both.scalars, { legitimacy: 70, solvency: 30000, friction: 70 });
  Engine.checkSettlement(both, CONTENT);
  ok("and the crisis result is fixed once it has landed",
     both.resolvedAs === "f1_triumph", both.resolvedAs);
  ok("while the named form of `settled` names one answer, not any",
     Engine.matches(both, { settled: "graduated_personhood" }) &&
     !Engine.matches(both, { settled: "restriction" }));

  /* FLASH I: every tier is reachable from the opening state. The meters are
     moved by the campaign's events once they are wired, and each tier is
     gated on the crisis flag it follows from (a government that never engaged
     the crisis cannot settle it), so the gates are driven directly here too.
     The canon pyrrhic tier must not end the run. */
  const tier = (set, flags) => {
    const s = fresh(); Object.assign(s.scalars, set);
    (flags || []).forEach(f => s.flags[f] = true);
    return s;
  };
  const t1 = tier({ legitimacy: 80, solvency: 75000, friction: 30 }, ["almanac_annexed"]);
  ok("critical triumph", (Engine.checkSettlement(t1, CONTENT) || {}).id === "f1_triumph");
  const t2 = tier({ legitimacy: 60, solvency: 65000, friction: 30 }, ["almanac_annexed"]);
  ok("maritime charter", (Engine.checkSettlement(t2, CONTENT) || {}).id === "f1_maritime");
  const t3 = tier({ legitimacy: 70, solvency: 30000, friction: 70 }, ["almanac_annexed"]);
  ok("sovereign debt trap", (Engine.checkSettlement(t3, CONTENT) || {}).id === "f1_pyrrhic");
  const t4 = tier({ legitimacy: 50, solvency: 50000, friction: 50 }, ["f1_referendum_carried"]);
  ok("joint mandate", (Engine.checkSettlement(t4, CONTENT) || {}).id === "f1_joint");
  const t5 = tier({ legitimacy: 30, solvency: 50000, friction: 80 }, ["f1_surveyed"]);
  ok("corporate re-entry", (Engine.checkSettlement(t5, CONTENT) || {}).id === "f1_capitulation");
  const pEnd = Engine.checkEnd(t3, CONTENT);
  ok("and the canon pyrrhic tier does not end the run",
     pEnd.over === false && t3.resolvedAs === "f1_pyrrhic" && !t3.settledAs,
     JSON.stringify({ over: pEnd.over, resolvedAs: t3.resolvedAs }));
});

guard("THE CANON RUN: THE DEBT TRAP, THEN THE COUNT (bible §1.8)", ok => {
  /* THE CANON ENDING IS REACHABLE BY PLAY (balance pass). The campaign's one
     published ending is the sovereign debt trap: annex the platform, take
     the friction, run the reserve down, and hold the country. A scripted
     policy driven through the WIRED events lands the tier before the rise,
     and the run then goes to the election — which is what `terminal:false`
     is for. The other tiers hang on the same meters with gentler lines. */
  {
    const st = Engine.newGame(CONTENT);
    const govern = s => {
      /* IT HOLDS THE COUNTRY FIRST, before any bill is given time. The canon
         ending is the debt trap, and the thermal drain it causes reaches
         zero inside three sessions, so the ladder below is not optional. It
         ran after the bills until reserved order-paper time stopped the
         crisis time leaking into every later session: with six slots and
         not eleven, bills granted first left none to approve a rung, and the
         run cascaded at sitting 48. See holdTheCountry below. */
      const keep = holdTheCountry(s);
      /* A GOVERNMENT CARRIES ITS OWN ACT FIRST. This granted order-paper
         time to every bill in the order content happens to list them, and
         the Annexation Bill is last \u2014 so the six slots were spent before
         the policy ever reached the measure the whole campaign is about,
         and the canon ending could not land once the gate moved from the
         intention to the Act. A government that has decided to annex and
         then does not put the Bill down is not playing well; it is not
         playing at all. */
      const order = CONTENT.bills.slice().sort((a, b) => {
        const mine = x => (s.flags.f1_annexing && /annex/i.test(x.id)) ? 0 : 1;
        return mine(a) - mine(b);
      });
      order.forEach(b => {
        if (s.bills[b.id] && !s.bills[b.id].dead &&
            Engine.reservedFor(s, b.id) + s.slots.total - s.slots.used > keep)
          Engine.grantSlot(s, CONTENT, b.id);
      });
      CONTENT.bills.forEach(b => {
        if (!s.bills[b.id] || s.bills[b.id].dead) return;
        if (Engine.canDivide(s, CONTENT, b.id).ok &&
            (Engine.reported(s, CONTENT, b.id) || {}).carries) Engine.divide(s, CONTENT, b.id);
      });
      if (!s.instruments["si_2080_44"].made && Engine.canMake(s, CONTENT, "si_2080_44").ok)
        Engine.makeInstrument(s, CONTENT, "si_2080_44");
      /* AND ONCE THE RESULT IS IN, IT ASKS EARTH FOR TERMS. The debt trap
         leaves friction where the quarrel drains the margin every sitting,
         and a cascade during the campaign is a loss (the author, 23 Sep). */
      if (s.resolvedAs && !s.dissolved) {
        const ask = Engine.initiatives(s, CONTENT).find(i => i.id === "seek_terms");
        if (ask && ask.ok) Engine.take(s, CONTENT, "seek_terms", 0);
      }
    };
    const holdTheCountry = s => {
      /* IT HOLDS THE COUNTRY, which the comment above always said and
         the policy never did. With one session of twenty-four the debt trap
         landed and the House rose before the thermal drain it causes could
         reach zero; three sessions give it the time, and a government that
         watched the margin fall to nothing for twenty-five sittings is not
         the one the canon ending describes. So it fills the Treasury (a
         vacant post makes no order) and climbs the emergency ladder when the
         margin is low: approving any order that is laid and waiting first,
         then laying the next rung. The ladder is found in content by what
         it does, not by name. */
      if (!s.cabinet.treasury.holder && Engine.vacancies(s, CONTENT).length)
        Engine.fillPost(s, CONTENT, "treasury", 0);
      const cools = CONTENT.instruments.filter(si => [].concat(si.effects || [])
        .some(f => f.move && f.move.thermal_margin > 0)).map(si => si.id);
      const awaiting = () => cools.filter(id => s.instruments[id].awaitingApproval);
      if (s.scalars.thermal_margin <= 10) {
        const waiting = awaiting().find(id => Engine.canApprove(s, CONTENT, id).ok);
        if (waiting) Engine.approveInstrument(s, CONTENT, waiting);
        else {
          const next = cools.find(id => !s.instruments[id].made &&
            Engine.canMake(s, CONTENT, id).ok);
          if (next) Engine.makeInstrument(s, CONTENT, next);
        }
      }
      /* AND IT KEEPS TIME IN HAND for an order waiting on the House. Six
         slots a session carry a programme or hold the country, not both
         (§7.7); a government with an emergency order laid does not spend
         the time it would take to approve it on the order paper. */
      /* and it keeps a slot in hand whenever the margin is low, not only
         once an order is waiting: an order laid with no time left to
         approve it was laid for nothing, which is how the fourth rung sat
         unapproved from the freeze to the dissolution. */
      return awaiting().length || s.scalars.thermal_margin <= 15 ? 1 : 0;
    };
    /* A PICK MAY READ THE STATE. The canon government holds out against
       Earth until the result is in -- conciliating before it would take the
       friction the debt trap needs -- and settles with Earth after, which is
       what stops the quarrel's drain on the margin before the House rises.
       Since 23 Sep a cascade during the campaign is a loss, so a government
       that goes to the country with the drain still running does not reach
       the count. */
    const pick = { f1_stranded: 0, f1_referendum: 0, f1_dilemma: 0, f1_water: 0,
      f1_loan: 1, f1_accounts_freeze: 0, fa_two_fronts: s => s.resolvedAs ? 1 : 0,
      fa_window_closes: 0, fa_anchor_terms: 0, fa_conciliate: s => s.resolvedAs ? 0 : 1,
      /* THE CANON CAMPAIGN (the author, 25 Sep: "adjust the canon numbers as
         you see fit"). Since the count listens (design/38), the campaign
         decides the canon's seats, and a first-option campaign returned the
         debt-trap government at standing 70 with 184, one short of a
         landslide, which is not "a middle ground between perfect and
         failure". The canon government campaigns as a government with
         austerity coming: on the promise, not the record; in the debate it
         says what went wrong; it lets the dossier run; and it keeps the
         money in the last week, because the reserve is the next
         government's. That returns it with a working majority just over the
         line: 163 of 280 at standing 56, the PSD on 102. */
      ch3_the_campaign: 1, ch3_the_airwaves: 3, ch3_the_dossier: 2, ch3_the_ground: 3 };
    let tier = null, end = null, tierAt = null;
    /* The run has to outlast the parliament and its campaign, and the bound
       is content's: a flat 45 silently became 44 of play when the prologue
       grew by one, and a flat anything is wrong the day the length moves. */
    for (let s = 0; s < RUN_BOUND + PROLOGUE1; s++) {
      const e = Engine.nextEvent(st, CONTENT);
      if (e) {
        const n = (e.choices || []).length || 1;
        const p0 = typeof pick[e.id] === "function" ? pick[e.id](st) : pick[e.id];
        const want = p0 == null ? 0 : Math.min(p0, n - 1);
        let done = false;
        for (let i = want; i < n; i++) if (Engine.choose(st, CONTENT, e, i) !== null) { done = true; break; }
        if (!done) for (let i = 0; i < n; i++) if (Engine.choose(st, CONTENT, e, i) !== null) { done = true; break; }
      }
      govern(st);
      Engine.advance(st, CONTENT);
      const en = Engine.checkEnd(st, CONTENT);
      if (en.settlement && !tier) { tier = en.settlement; tierAt = st.sitting; }
      if (en.over) { end = en; break; }
    }
    ok("the canon ending is reachable by play (the debt trap)",
       !!tier && tier.id === "f1_pyrrhic", tier ? tier.id : "no tier landed");
    ok("and it does not end the run: the campaign goes to the election",
       !!end && end.kind === "election",
       end ? end.kind + " " + (end.reason || "") + " at sitting " + st.sitting +
             ", supply " + (st.bills.appropriation || {}).stage +
             /* the canon's two figures, printed so a change to the run can be
                read against them: the thermal margin at the count is the
                tightest number in the game (CLAUDE.md), and the seats are
                the government the next campaign opens on */
             "; thermal margin " + st.scalars.thermal_margin +
             ", PSD " + Engine.partyTotal(st, "cu") + " seats" +
             (st.dissolved && st.dissolved.after ? ", the government's side " + st.dissolved.sideNow +
               " of 280 at standing " + st.scalars.public_standing +
               " (" + ((Engine.epilogue(st, CONTENT) || {}).id || "no epilogue") + ")" : "") : "no end");
    /* AND IT LANDS WITH ROOM, which is the assertion that was missing. The
       ending used to arrive on the last sitting it possibly could, so it
       read as passing while resting on nothing: one more prologue beat and
       it stopped landing at all, with "no tier landed" as the only clue.
       Five sittings of slack is the difference between an ending the chain
       produces and one it produces by coincidence. */
    /* THE RUN'S SHAPE (bible §1.7, design/32). The result's aftermath plays
       while the House sits, and then the run goes to the country: until 22
       Sep a run that resolved its crisis entered a fourth chapter that ended
       at the dissolution, so it never had a campaign, and a run that
       dissolved first never saw the aftermath. None of the seven playtest
       strategies reached both. */
    ok("and the canon run plays the result's aftermath, then the campaign and the count",
       !!(st.seen.ch4_settled && st.seen.ch4_after && st.seen.ch3_dissolution &&
          st.seen.ch3_the_count),
       ["ch4_settled", "ch4_after", "ch4_the_answer", "ch3_dissolution", "ch3_the_count"]
         .map(id => id + (st.seen[id] ? "" : " (not seen)")).join(", "));
    ok("and the canon ending lands with sittings to spare",
       tierAt != null && end && end.sitting != null
         ? end.sitting - tierAt >= 5 : tierAt != null,
       tierAt == null ? "never landed"
         : "settled at " + tierAt + (end && end.sitting ? ", run ended " + end.sitting : ""));
  }
});

/* THE STANDBY FACILITY'S EXPROPRIATION CLAUSE (24 Sep). Annexing the Works
   with its bonds unpaid is an event of default on Earth's facility; the
   agent's notice says so, disputing it closes the facility and charges
   default interest, and paying the bond (here or through Earth's terms)
   cures it. The terms are the world's; the trigger and the cure are ours. */
guard("THE STANDBY FACILITY'S EXPROPRIATION CLAUSE", ok => {
  const ev = id => CONTENT.events.find(e => e.id === id);
  const notice = ev("f1_standby_notice"), terms = ev("fa_conciliate");
  const g = Engine.newGame(CONTENT);
  ok("the notice waits for the Act", !Engine.matches(g, notice.when));
  g.flags.almanac_annexed = true;
  ok("and is due once the Works is annexed with its bonds unpaid", Engine.matches(g, notice.when));
  Engine.borrow(g, CONTENT, CONTENT.setup.lenders.earth.utilisation, "earth");
  const r0 = Engine.debtRate(g, CONTENT, "earth");
  Engine.choose(g, CONTENT, notice, 0);
  ok("disputing it closes the facility", Engine.lenderCap(g, CONTENT, "earth").cap === 0,
     Engine.lenderCap(g, CONTENT, "earth").why);
  ok("and charges default interest on what is drawn", Engine.debtRate(g, CONTENT, "earth") > r0,
     r0 + " -> " + Engine.debtRate(g, CONTENT, "earth"));
  Engine.choose(g, CONTENT, terms, 0);
  ok("paying the bond through Earth's terms cures it",
     Engine.lenderCap(g, CONTENT, "earth").cap > 0 && Engine.debtRate(g, CONTENT, "earth") === r0 &&
     !Engine.matches(g, notice.when));
  const w = Engine.newGame(CONTENT);
  w.flags.almanac_annexed = true;
  const r1 = Engine.debtRate(w, CONTENT, "earth");
  Engine.choose(w, CONTENT, notice, 1);
  ok("a waiver keeps the facility open at a higher margin",
     Engine.lenderCap(w, CONTENT, "earth").cap > 0 && Engine.debtRate(w, CONTENT, "earth") > r1,
     r1 + " -> " + Engine.debtRate(w, CONTENT, "earth"));
});

guard("THE MARKETS THE CRISIS WROTE (design/28 §3)", ok => {
  const doors = (evId, flags, want, price) => {
    const s = Engine.newGame(CONTENT);
    Object.assign(s.flags, flags || {});
    const ids = Object.keys(s.stations);
    if (want != null) {
      const big = ids.reduce((a, b) => s.stations[a].suspended >= s.stations[b].suspended ? a : b);
      const now = ids.reduce((n, k) => n + s.stations[k].suspended, 0);
      s.stations[big].suspended = Math.max(0, s.stations[big].suspended + (want - now));
    }
    if (price) s.prices[price.key] = price.value;
    return Engine.openChoices(s, CONTENT, CONTENT.eventById[evId]).map(x => x.index);
  };
  const only = (doors, i) => doors.length === 1 && doors[0] === i;
  const two = ["take_indemnity", "assume_substrate_debt"];
  ok("Flash I offers the two markets the crisis wrote",
     two.every(id => (CONTENT.initiatives || []).some(i => i.id === id)),
     two.join(", "));

  /* UNDERWRITING: the cover pays only if the risk its term named happened. */
  ok("an indemnity pays when the risk fired",
     only(doors("indemnity_settles", { indemnity_lifesupport: true, f1_frozen: true }), 1),
     doors("indemnity_settles", { indemnity_lifesupport: true, f1_frozen: true }).join("/"));
  ok("and the premium is spent when it did not",
     only(doors("indemnity_settles", { indemnity_lifesupport: true }), 2),
     doors("indemnity_settles", { indemnity_lifesupport: true }).join("/"));

  /* SUBSTRATE DEBT: the debt was secured on people, so the settle reads how
     many are suspended. Integer counts, so the split at 72000 has no gap. */
  ok("an assumed debt that held is paid by the platform",
     only(doors("substrate_debt_settles", { debt_assumed: true }, 71000), 0),
     doors("substrate_debt_settles", { debt_assumed: true }, 71000).join("/"));
  ok("and one that did not hold is a hole",
     only(doors("substrate_debt_settles", { debt_assumed: true }, 73000), 1),
     doors("substrate_debt_settles", { debt_assumed: true }, 73000).join("/"));
  ok("a write-off is repriced when the substrate rises",
     only(doors("substrate_debt_settles", { debt_written_off: true }, null, { key: "substrate", value: 120 }), 2),
     doors("substrate_debt_settles", { debt_written_off: true }, null, { key: "substrate", value: 120 }).join("/"));
  ok("and it holds when the substrate is steady",
     only(doors("substrate_debt_settles", { debt_written_off: true }, null, { key: "substrate", value: 100 }), 3),
     doors("substrate_debt_settles", { debt_written_off: true }, null, { key: "substrate", value: 100 }).join("/"));
  ok("the suspension split leaves no value without a door",
     [71000, 72000, 72001, 73000].every(v => {
       const a = doors("substrate_debt_settles", { debt_assumed: true }, v);
       return a.length === 1;
     }), "71000/72000/72001/73000");

  /* AND THE POSITION IS ON THE BOOKS. Taking one queues its answer, so the
     settle arrives from the queue and not from the weighted pool. */
  const ind = Engine.newGame(CONTENT);
  ind.chapter = 2; ind.flags.f1_accounts_freeze = true;
  const took = Engine.take(ind, CONTENT, "take_indemnity", 1);
  ok("taking a position queues its settle",
     took.ok && ind.queue.some(q => q.eventId === "indemnity_settles"),
     took.ok ? "queued" : took.reason);
});

guard("THE CHAIN RUNS ON A CLOCK (dated for three sessions, 22 Sep)", ok => {
  /* AND THE CHAIN IT WAS BUILT FOR ACTUALLY HAS GAPS. The Flash I steps used
     to be flag-gated at weights 84-90, so each arrived the sitting after the
     one before it and the session's central argument was over in three days.
     This asserts the schedule rather than the mechanism: if someone re-gates
     the chain on flags, the gaps collapse and this goes red. */
  const chain = Engine.newGame(CONTENT);
  const when = {};
  const riseAt = {};
  for (let i = 0; i < 40; i++) {
    const e = Engine.nextEvent(chain, CONTENT);
    if (e) {
      if (when[e.id] == null && /^f1_/.test(e.id)) {
        when[e.id] = chain.sitting; riseAt[e.id] = chain.risesAt;
      }
      Engine.choose(chain, CONTENT, e, 0);
    }
    Engine.advance(chain, CONTENT);
  }
  const a = when.f1_stranded, b = when.f1_referendum, c = when.f1_dilemma;
  /* Its date is a FLOOR, not a promise of the exact day: chapter two's own
     prologue holds sitting 8, and a prologue outranks a date. So the test is
     that it cannot come early and cannot drift far — which is what a date in
     a parliament is worth.

     THE DRIFT IS A FUNCTION OF THE PROLOGUE, so it is derived rather than
     written down. The tolerance was [8,10] against a seven-beat opening;
     adding the President's commission as a new first beat pushed the crisis
     to 11 and failed a test that was measuring the tutorial's length, not
     the crisis's date. Counted from content, the next beat added or removed
     moves the band with it. */
  const strandAt = CONTENT.eventById.f1_stranded.at;
  ok("the crisis opens on its date, not when the pool reaches it",
     a >= strandAt && a <= Math.max(strandAt, PROLOGUE1 + 3) + 1,
     "f1_stranded at " + a + " (dated " + strandAt + ", prologue is " + PROLOGUE1 + " beats)");
  ok("the survey takes sittings to report",
     b != null && b - a >= 2, "stranded " + a + " -> referendum " + b);
  ok("and the law officer's opinion takes sittings to come back",
     c != null && c - b >= 2, "referendum " + b + " -> dilemma " + c);
  /* AND THE ACT HAS A SESSION TO BE CARRIED IN. Every bill not carried falls
     when the House rises, and the dilemma is what sets the Annexation Bill
     down. Dated for one session of twenty-four it landed at 15, one sitting
     before the first rise of three; this is the margin that re-dating the
     chain for three sessions bought, and a longer opening must not spend it. */
  ok("and the dilemma leaves the Act most of a session to be carried",
     c != null && riseAt.f1_dilemma - c >= 8,
     "dilemma at " + c + ", the House rises at " + riseAt.f1_dilemma);
});

guard("THE ANNEXATION LINE STAYS GOVERNABLE (trends decay)", ok => {
  /* The whole point: the House stays governable on the annexation line. */
  const g = Engine.newGame(CONTENT);
  const pick = { f1_stranded: 0, f1_referendum: 0, f1_dilemma: 0, f1_loan: 1 };
  let peak = 0;
  for (let i = 0; i < 40; i++) {
    const e = Engine.nextEvent(g, CONTENT);
    if (e) {
      const n = e.choices.length;
      const w = pick[e.id] == null ? 0 : Math.min(pick[e.id], n - 1);
      let done = false;
      for (let k = w; k < n; k++) if (Engine.choose(g, CONTENT, e, k) !== null) { done = true; break; }
      if (!done) for (let k = 0; k < n; k++) if (Engine.choose(g, CONTENT, e, k) !== null) break;
    }
    Engine.advance(g, CONTENT);
    if (g.scalars.friction > peak) peak = g.scalars.friction;
    const en = Engine.checkEnd(g, CONTENT);
    if (en.over) break;
  }
  ok("the annexation line no longer drives friction to the ceiling",
     peak < 90, "peak " + peak);
});

guard("THE TIER FALL AND THE PIVOTS (design/35)", ok => {
  /* AN EVENT'S OWN EFFECTS APPLY, with the answer. Nothing applied them,
     so the accounts freeze never recorded itself and every floor below
     would have been dead too. */
  const fz = Engine.newGame(CONTENT);
  Engine.choose(fz, CONTENT, CONTENT.eventById.f1_accounts_freeze, 0);
  ok("an event's own effects apply when it is answered", !!fz.flags.f1_frozen);
  const melt = CONTENT.eventById.f1_meltdown;
  const brink = () => {
    const g = Engine.newGame(CONTENT);
    g.chapter = 2; g.flags.f1_frozen = true;
    Object.assign(g.scalars, { friction: 80, thermal_margin: 15, solvency: 15000, legitimacy: 25 });
    return g;
  };
  /* "Failing a trajectory check doesn't jump straight to the worst case." */
  const a = brink();
  ok("the meltdown does not come straight from the numbers", !Engine.matches(a, melt.when));
  a.flags.f1_first_floor = true;
  ok("nor from the first floor alone", !Engine.matches(a, melt.when));
  a.flags.f1_second_floor = true;
  ok("it comes once both floors have given", Engine.matches(a, melt.when));
  a.flags.f1_emergency = true;
  ok("and not while the emergency order stands", !Engine.matches(a, melt.when));

  /* one floor a sitting: the pool fires one event, and each floor needs
     the one before */
  /* the numbers are held down every sitting, so what is measured is the
     fall itself and not whatever a choice happened to repair */
  const b = brink(), when = {};
  const pin = g => Object.assign(g.scalars, { friction: 80, thermal_margin: 15, solvency: 15000, legitimacy: 25 });
  for (let i = 0; i < 12 && !when.f1_meltdown; i++) {
    pin(b);
    const e = Engine.nextEvent(b, CONTENT);
    if (e) { if (when[e.id] == null) when[e.id] = b.sitting; Engine.choose(b, CONTENT, e, 0); }
    Engine.advance(b, CONTENT);
  }
  ok("the floors give one a sitting, in order, before the meltdown",
     when.f1_brink_1 != null && when.f1_brink_2 > when.f1_brink_1 &&
     (when.f1_meltdown == null || when.f1_meltdown > when.f1_brink_2),
     JSON.stringify(when));

  /* THE PIVOTS: one per tier, open on that tier and on nothing else. */
  const open = (g, id) => (Engine.initiatives(g, CONTENT).find(i => i.id === id) || {}).ok;
  const fresh = Engine.newGame(CONTENT);
  const P = { declare_emergency: null, sell_the_leases: "f1_pyrrhic",
              lease_the_zone: "f1_joint", sacrifice_the_minister: "f1_capitulation" };
  ok("no pivot is open at the opening", Object.keys(P).every(id => !open(fresh, id)));
  Object.keys(P).filter(id => P[id]).forEach(id => {
    const g = Engine.newGame(CONTENT); g.resolvedAs = P[id];
    const other = Object.keys(P).filter(x => P[x] && x !== id);
    ok(id + " opens on " + P[id] + " and only there",
       open(g, id) && other.every(x => !open(g, x)));
  });
  const pl = Engine.newGame(CONTENT); pl.resolvedAs = "f1_pyrrhic"; pl.flags.cordell_leases_pledged = true;
  ok("leases pledged against the facility cannot be sold", !open(pl, "sell_the_leases"));

  const c = brink(); c.flags.f1_first_floor = c.flags.f1_second_floor = true;
  ok("the emergency order opens on the second floor", open(c, "declare_emergency"));
  const r = Engine.take(c, CONTENT, "declare_emergency", 0);
  ok("and taking it holds the government up at the cost of its legitimacy",
     r.ok && c.scalars.legitimacy === 0 && !Engine.matches(c, melt.when) &&
     c.queue.some(q => q.eventId === "f1_emergency_lapses"), r.reason || "legitimacy " + c.scalars.legitimacy);

  const d = Engine.newGame(CONTENT); d.resolvedAs = "f1_capitulation";
  const post = () => { const p = d.cabinet.external_relations; return p && typeof p === "object" ? p.holder : p; };
  const holder = post();
  Engine.take(d, CONTENT, "sacrifice_the_minister", 1);
  ok("the capitulation's pivot costs the minister the post",
     !!holder && !post(), holder + " -> " + post());
});

guard("FLASH I IS A CAMPAIGN (design/36 §3)", ok => {
  /* Flash I plays everything that is its own or the world's, and nothing
     of any other campaign's. */
  const mine = x => x.campaign == null || [].concat(x.campaign).indexOf("flash_i") >= 0;
  ok("Flash I's view holds every entry that is its own or the world's",
     ALL.events.filter(mine).every(e => CONTENT.eventById[e.id]) &&
     ALL.bills.filter(mine).every(b => CONTENT.billById[b.id]) &&
     CONTENT.events.every(mine),
     CONTENT.events.length + " of " + ALL.events.length + " events");
  ok("and its own setup is merged over the world's, one level deep",
     !!CONTENT.setup.lenders.alliance && !!CONTENT.setup.lenders.earth &&
     !ALL.setup.lenders.alliance, Object.keys(CONTENT.setup.lenders).join(", "));
  const S = ALL.forCampaign("sandbox");
  ok("the sandbox plays Flash I, its setup on top",
     S.campaign === "flash_i" && !!S.billById.annexation && !!S.setup.lenders.alliance &&
     S.setup.startDate === CONTENT.setup.startDate && S.setup.scalars.solvency === 999999,
     S.campaign + " from " + S.admin);
  const old = Engine.newGame(CONTENT);
  old.version = 29; delete old.campaign;
  const up = Engine.load(Engine.save(old), CONTENT);
  ok("a save from before campaigns, loaded as Flash I, is Flash I",
     up.campaign === "flash_i" && up.version === Engine.STATE_VERSION, up.campaign);
});

guard("MUTUAL VULNERABILITY: THE RELAYS (design/35)", ok => {
  const open = (g, id) => (Engine.initiatives(g, CONTENT).find(i => i.id === id) || {}).ok;
  const fresh = Engine.newGame(CONTENT);
  ok("the relays cannot be held when there is no quarrel", !open(fresh, "hold_the_relays"));
  const q = () => { const g = Engine.newGame(CONTENT); g.scalars.friction = 70; return g; };
  const a = q();
  ok("they can in one", open(a, "hold_the_relays"));
  const t0 = a.economy.trade;
  const r = Engine.take(a, CONTENT, "hold_the_relays", 1);
  ok("holding the relays and the crews costs the Commonwealth its trade",
     r.ok && a.economy.trade < t0 && !!a.flags.relays_held && !!a.flags.crews_held,
     r.reason || t0 + " -> " + a.economy.trade);
  ok("and Earth's answer is on its way", a.queue.some(x => x.eventId === "f1_earth_answers"));
  ok("while the relays are held the government can switch them back on", open(a, "restore_the_relays"));

  /* WHO GIVES WAY: exactly one door in every state, decided by the stores. */
  const ev = CONTENT.eventById.f1_earth_answers;
  const doors = (flags, consumables) => {
    const g = Engine.newGame(CONTENT);
    Object.assign(g.flags, flags); g.scalars.consumables = consumables;
    return Engine.openChoices(g, CONTENT, ev).map(x => x.index);
  };
  const one = (d, i) => d.length === 1 && d[0] === i;
  ok("with stores to spare Earth gives way, further if the crews were held",
     one(doors({ relays_held: true, crews_held: true }, 60), 0) &&
     one(doors({ relays_held: true }, 60), 1), JSON.stringify([doors({ relays_held: true, crews_held: true }, 60), doors({ relays_held: true }, 60)]));
  ok("with stores running short Earth waits",
     one(doors({ relays_held: true, crews_held: true }, 40), 2) && one(doors({ relays_held: true }, 49), 2) &&
     one(doors({ relays_held: true }, 50), 1));
  const g = q(); Engine.take(g, CONTENT, "hold_the_relays", 0);
  g.scalars.consumables = 70;
  const f0 = g.scalars.friction;
  Engine.choose(g, CONTENT, ev, 1);
  ok("and when Earth gives way the quarrel eases and the relays come back on",
     g.scalars.friction < f0 && !g.flags.relays_held, f0 + " -> " + g.scalars.friction);
});

console.log("");
console.log(T.failed() ? T.failed() + " FLASH I GUARD FAILURES" : "Flash I keeps its promises");
