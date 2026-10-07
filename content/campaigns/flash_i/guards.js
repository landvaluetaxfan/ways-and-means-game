/* =============================================================
   FLASH I: THE CAMPAIGN'S GUARDS. Act I.

     npm run guards        every campaign's (tools/guards.js)
     node content/campaigns/flash_i/guards.js     this one's

   design/80 (7 Oct 2026): the playable game is Act I, sittings 1 to 16,
   closing on the rise. The guards of the old campaign, which asserted the
   platform crisis, its five tiers and the canon run to the count at sitting
   56, are in content/archive/flash_i_guards_canon.js and are not run: that
   story is parked. What is here is what Act I promises, and it grows with
   each sitting the build adds (briefs/act-one.md). test.js asserts the
   engine on the world's content alone and never reads a line of this folder.

   A guard that fails after a rewrite is saying the story changed. Change
   the guard to say what the story now promises, or delete it if the
   promise is gone.
   ============================================================= */
"use strict";
const T = require("../../../tools/testkit.js");
const CONTENT = T.view("flash_i");
const Engine = require("../../../js/engine.js");
const guard = T.guard;

console.log("FLASH I: ACT I'S GUARDS");
console.log("=".repeat(58));

/* The sittings the build has so far, and what each meets. A sitting the build has
   not written meets nothing, and the rise is still there to be reached. */
const MEETS = [["a1_commission"], ["a1_first_question"], ["a1_treasury"],
               ["a1_estimates", "a1_order_paper"], ["a1_treaty", "a1_spare_slot"],
               ["a1_cooling", "a1_ember_ridge"], ["a1_floor", "a1_floor_ask"],
               ["a1_cover", "a1_cover_ask"], ["a1_works", "a1_works_ask"], ["a1_transit", "a1_transit_ask"],
               ["a1_count"]];

guard("THE TREASURY EVENT AGREES WITH THE TREASURY'S CANDIDATES", ok => {
  /* a1_treasury writes each candidate's effects out again, because the
     `cabinet` effect appoints and applies nothing else (design/76). Two
     copies of one fact drift, so this holds them equal. */
  const ev = CONTENT.eventById.a1_treasury;
  const post = CONTENT.cabinet.find(p => p.id === "treasury");
  ok("the event offers every candidate, then a wait",
     !!ev && ev.choices.length === post.candidates.length + 1);
  post.candidates.forEach((c, i) => {
    const fx = (ev.choices[i] || {}).effects || [];
    const appoints = fx.find(f => f.cabinet);
    ok("choice " + (i + 1) + " appoints " + c.holder,
       !!appoints && appoints.cabinet.treasury.holder === c.holder &&
       appoints.cabinet.treasury.party === c.party);
    ok("and carries that candidate's effects exactly",
       JSON.stringify(fx.filter(f => !f.cabinet)) === JSON.stringify(c.effects));
  });
  const st = Engine.newGame(CONTENT);
  Engine.choose(st, CONTENT, ev, 2);
  ok("choosing the third fills the Treasury", st.cabinet.treasury.holder === post.candidates[2].holder);
});

guard("THE OPENING PLAYS IN ORDER, ONE SCENE A SITTING", ok => {
  const st = Engine.newGame(CONTENT);
  MEETS.forEach((want, i) => {
    const met = Engine.playSitting(st, CONTENT, () => 0).map(m => m.event.id);
    ok("sitting " + (i + 1) + " meets " + want.join(" then "),
       JSON.stringify(met) === JSON.stringify(want), met.join(", "));
    Engine.advance(st, CONTENT);
  });
  const met = Engine.playSitting(st, CONTENT, () => 0).map(m => m.event.id);
  ok("and the sitting after the last one written meets nothing", met.length === 0, met.join(", "));
});

guard("THE WORLD SHOWS ONLY WHAT ACT I HAS WRITTEN (design/80)", ok => {
  /* The structural rule: a campaign sees story only if it is tagged for it.
     Before it, an untagged bill written for a later act sat on the order paper
     before the story had brought it in (the author, 7 Oct 2026). This holds the
     list to what Act I has written, and it grows by hand with each slice. */
  ok("the events are Act I's and no others",
     CONTENT.events.length > 0 && CONTENT.events.every(e => /^a1_/.test(e.id)),
     CONTENT.events.map(e => e.id).join(", "));
  ok("the order paper holds the Appropriation Bill and the Anchorage treaty and nothing else",
     JSON.stringify(CONTENT.bills.map(b => b.id).sort()) === JSON.stringify(["anchor_kepler", "appropriation"]),
     CONTENT.bills.map(b => b.id).join(", "));
  ok("the orders are the first two rungs of the conservation ladder and no others",
     JSON.stringify(CONTENT.instruments.map(i => i.id).sort()) === JSON.stringify(["rung1_conservation", "rung2_clockrate"]),
     CONTENT.instruments.map(i => i.id).join(", "));
  ok("no initiative, matter or tier is in the view yet",
     CONTENT.initiatives.length === 0 && CONTENT.matters.length === 0 && CONTENT.settlements.length === 0,
     [CONTENT.initiatives.length, CONTENT.matters.length, CONTENT.settlements.length].join("/"));
});

guard("THE TWO BILLS OPEN WHERE ACT I NEEDS THEM (the introduction ledger, brief E2 not yet built)", ok => {
  /* Hiding a bill until the scene that introduces it needs the introduced record (E2). Until then both are on
     the order paper from the first sitting, and what the guard holds is where each starts: the estimates at
     first reading, the treaty at committee, which is where the sitting-5 page and the spare slot say it is. */
  const st = Engine.newGame(CONTENT);
  ok("the estimates open at first reading", st.bills.appropriation.stage === "first_reading", st.bills.appropriation.stage);
  ok("and the treaty at committee, not awaiting assent as the world has it", st.bills.anchor_kepler.stage === "committee",
     st.bills.anchor_kepler.stage);
  ok("the first order is locked until Ember Ridge", st.flags.a1_orders_locked === true);
});

guard("THE SPARE SLOT IS ONE: THE ESTIMATES TAKE FIVE, THE TREATY CANNOT FINISH ON THE SIXTH", ok => {
  /* Played through the Chamber's own verbs, so the arithmetic the page states is the
     arithmetic the engine runs: four stage grants and the division for the estimates,
     one more grant for the treaty, and the sixth slot is the last. */
  const play = choice => {
    const st = Engine.newGame(CONTENT);
    for (let i = 0; i < 5; i++) {
      Engine.playSitting(st, CONTENT, ev => ev.id === "a1_spare_slot" ? choice : 0);
      if (i < 4) Engine.advance(st, CONTENT);
    }
    return st;
  };
  const kept = play(0), held = play(1);
  ok("promising the slot makes one open undertaking, owed to Ivarsen",
     kept.undertakings.filter(u => u.id === "a1_treaty_slot" && u.state === "open" && u.owed_to === "ivarsen").length === 1);
  ok("holding it makes none", held.undertakings.filter(u => u.id === "a1_treaty_slot").length === 0);
  ok("six slots at sitting 5, none spent", kept.slots.total === 6 && kept.slots.used === 0, kept.slots.used + "/" + kept.slots.total);
  const g = Engine.grantSlot(kept, CONTENT, "anchor_kepler");
  ok("a slot on the treaty moves it from committee to report and puts the New Progressive Party in credit",
     g.ok && kept.bills.anchor_kepler.stage === "report" && g.owner === "psa" && g.gained > 0, JSON.stringify(g));
  Engine.advance(kept, CONTENT);
  ok("and the promise is kept", kept.undertakings.find(u => u.id === "a1_treaty_slot").state === "kept",
     kept.undertakings.find(u => u.id === "a1_treaty_slot").state);
  /* the House takes two measures in a day (setup.grantsPerSitting), so the grants are spread */
  for (let i = 0; i < 4; i++) {
    if (i === 1 || i === 3) { Engine.advance(kept, CONTENT); Engine.playSitting(kept, CONTENT, () => 0); }
    ok("the estimates take grant " + (i + 1) + " of 4", Engine.grantSlot(kept, CONTENT, "appropriation").ok);
  }
  ok("with the sixth slot to divide on", kept.slots.total - kept.slots.used === 1, kept.slots.used + "/" + kept.slots.total);
  const more = Engine.grantSlot(kept, CONTENT, "anchor_kepler");
  ok("a second grant on the treaty would take the division's slot, and the treaty would still be a stage short",
     more.ok && kept.slots.total - kept.slots.used === 0 && kept.bills.anchor_kepler.stage === "third_reading");
});

/* Play the opening to the end of sitting N, answering a1_spare_slot and a1_ember_ridge as told. */
function play(upTo, answers) {
  const st = Engine.newGame(CONTENT);
  for (let i = 1; i <= upTo; i++) {
    Engine.playSitting(st, CONTENT, ev => (answers || {})[ev.id] != null ? answers[ev.id] : 0);
    if (i < upTo) Engine.advance(st, CONTENT);
  }
  return st;
}

guard("THE FIRST ORDER OPENS WHEN EMBER RIDGE EXPLAINS IT, AND NOT BEFORE", ok => {
  const early = play(5), met = play(6, { a1_ember_ridge: 1 });
  ok("the order is locked at the opening and through sitting 5", !Engine.canMake(early, CONTENT, "rung1_conservation").ok,
     JSON.stringify(Engine.canMake(early, CONTENT, "rung1_conservation")));
  ok("and open after the scene, whichever way it was answered",
     [0, 1, 2].every(a => Engine.canMake(play(6, { a1_ember_ridge: a }), CONTENT, "rung1_conservation").ok));
  ok("Girard holds the post the order is made from", !!CONTENT.cabinetById.substrate_thermal.holder);
  ok("asking Girard makes one promise to make the order, owed to her",
     met.undertakings.filter(u => u.id === "a1_appeal" && u.state === "open" && u.owed_to === "girard").length === 1);
  const margin = met.scalars.thermal_margin, made = Engine.makeInstrument(met, CONTENT, "rung1_conservation");
  Engine.advance(met, CONTENT);
  ok("making the order raises the thermal margin", made.ok !== false && met.scalars.thermal_margin > margin,
     margin + " -> " + met.scalars.thermal_margin);
  ok("and keeps the promise", met.undertakings.find(u => u.id === "a1_appeal").state === "kept");
  ok("the second rung waits for the first", !Engine.canMake(early, CONTENT, "rung2_clockrate").ok && Engine.canMake(met, CONTENT, "rung2_clockrate").ok);
});

guard("LEAVING EMBER RIDGE ALONE SWITCHES OFF THE LOWEST BAND THREE SITTINGS LATER", ok => {
  const st = play(6, { a1_ember_ridge: 2 }), seen = [], ids = [];
  const margin = st.scalars.thermal_margin;
  for (let i = 0; i < 4; i++) {
    Engine.advance(st, CONTENT);
    Engine.playSitting(st, CONTENT, () => 0).forEach(m => ids.push(st.sitting + ":" + m.event.id));
  }
  ok("the outcome page arrives and takes no decision", ids.some(x => /a1_ember_lowest_band/.test(x)), ids.join(" "));
  ok("and it lands three sittings after the answer", ids.some(x => x === "9:a1_ember_lowest_band"), ids.join(" "));
  ok("Ember Ridge's suspended count rises by the people on its lowest band",
     st.stations.vantage.suspended - CONTENT.stationById.vantage.suspended === 4200,
     CONTENT.stationById.vantage.suspended + " -> " + st.stations.vantage.suspended);
  /* one of two variants of the same answer is open, and the one that quotes the President's note
     is the one a government that told him the stations came first sees */
  const ev = CONTENT.eventById.a1_ember_ridge, leave = a => ev.choices.filter(ch => ch.act === "Leave it" &&
    Engine.choiceOpen(play(5, { a1_commission: a }), CONTENT, ch));
  const stations = CONTENT.eventById.a1_commission.choices.findIndex(ch => (ch.effects || []).some(f => f.flag === "commission_stations"));
  ok("a government that told the President the stations came first sees its own words quoted back",
     leave(stations).length === 1 && /first morning/.test(leave(stations)[0].note), JSON.stringify(leave(stations).map(c => c.note.slice(0, 40))));
  ok("and any other sees the plain answer", leave(0).length === 1 && !/first morning/.test(leave(0)[0].note) && stations !== 0);
});

guard("A PROMISE THE PLAYER DOES NOT KEEP COSTS WHAT THE SCENE SAID", ok => {
  /* The treaty slot is promised for eight sittings and the appeal for three. A promise with no breach
     would be a sentence the player could ignore, so each one is broken here and its page is read. */
  const run = (answers, n, between) => { const st = play(5, answers), ids = [];
    for (let i = 0; i < n; i++) { Engine.advance(st, CONTENT); if (between && i === 0) between(st);
      Engine.playSitting(st, CONTENT, () => 0).forEach(m => ids.push(st.sitting + ":" + m.event.id)); }
    return { st, ids }; };
  const t = run({ a1_spare_slot: 0 }, 9);
  const u = t.st.undertakings.find(x => x.id === "a1_treaty_slot");
  ok("a treaty slot not given is broken at the eighth sitting after the promise", u && u.state === "broken", u && u.state);
  ok("and the page that says so arrives", t.ids.some(x => /a1_treaty_unkept/.test(x)), t.ids.join(" "));
  const k = run({ a1_spare_slot: 0 }, 9, st => Engine.grantSlot(st, CONTENT, "anchor_kepler"));
  ok("a slot given in time keeps the promise and the page does not arrive",
     k.st.undertakings.find(x => x.id === "a1_treaty_slot").state === "kept" && !k.ids.some(x => /a1_treaty_unkept/.test(x)),
     k.ids.join(" "));
  const a = play(6, { a1_ember_ridge: 1 }), ids = [];
  for (let i = 0; i < 5; i++) { Engine.advance(a, CONTENT); Engine.playSitting(a, CONTENT, () => 0).forEach(m => ids.push(a.sitting + ":" + m.event.id)); }
  ok("an appeal never made is the authority acting: the lowest band page arrives", ids.some(x => /a1_ember_lowest_band/.test(x)), ids.join(" "));
});

guard("THE FOUR CLAUSE SCENES: A PAGE AND A PROMISE EACH, AND THE BUDGET IS THE PUZZLE", ok => {
  /* sittings 7 to 10. The pages quote clause levels and nothing else; the promises are kept by setting the
     level they name, by sitting 14; and the money for any one lifted level has to come from another clause. */
  const scenes = [["floor", "a1_floor", "a1_floor_ask", 7], ["insurance", "a1_cover", "a1_cover_ask", 8],
                  ["works", "a1_works", "a1_works_ask", 9], ["transit", "a1_transit", "a1_transit_ask", 10]];
  const bill = CONTENT.billById.appropriation;
  scenes.forEach(([clause, pageId, askId, sitting]) => {
    const cl = bill.clauses.find(c => c.id === clause), costs = cl.levels.map(l => l.cost / 1000);
    const allowed = new Set(costs);
    costs.forEach(a => costs.forEach(b => { if (a > b) allowed.add(a - b); }));
    const pg = CONTENT.eventById[pageId], ask = CONTENT.eventById[askId];
    const text = [pg.setpiece.title, pg.body, ask.body].concat(ask.choices.map(c => c.label + " " + c.note)).join(" ");
    const figs = [...new Set((text.match(/CW\$(\d+)(?:bn)?/g) || []).map(x => +x.replace(/\D/g, "")))];
    ok(clause + ": every figure the scene quotes is a level of the clause or the difference between two", figs.every(f => allowed.has(f)),
       figs.join(", ") + " of " + [...allowed].join(", "));
    const promises = ask.choices.map(c => (c.effects || []).map(f => f.undertake).filter(Boolean)[0]).filter(Boolean);
    ok(clause + ": the promises name levels of this clause, fall due by sitting 14, and have a page for their breach",
       promises.length > 0 && promises.every(u => u.discharge.clause.clause === clause &&
         cl.levels.some(l => l.id === u.discharge.clause.level) && sitting + u.by <= 14 && !!CONTENT.eventById[u.onBreach]),
       promises.map(u => u.id + " by " + (sitting + u.by)).join(", "));
  });
  ok("at the draft, lifting the floor is refused, as the Chamber's panel refuses it, because the reserve cannot pay",
     Engine.setClause(Engine.newGame(CONTENT), CONTENT, "appropriation", "floor", "lift").ok === false);
  ok("and it is paid for by cutting another clause, here the thermal quota held tight",
     (() => { const t = Engine.newGame(CONTENT); return Engine.setClause(t, CONTENT, "appropriation", "thermal", "tight").ok &&
       Engine.setClause(t, CONTENT, "appropriation", "floor", "lift").ok; })());
  /* a promise to widen the cover and one to lift the floor cannot both be kept from the draft's other levels */
  const both = Engine.newGame(CONTENT);
  Engine.setClause(both, CONTENT, "appropriation", "thermal", "tight");
  Engine.setClause(both, CONTENT, "appropriation", "floor", "lift");
  ok("the floor lifted and the cover widened do not fit one reserve", Engine.setClause(both, CONTENT, "appropriation", "insurance", "wide").ok === false);
});

guard("THE PAGES' FIGURES ARE THE CLAUSES' OWN", ok => {
  /* The cooling page quotes the thermal clause's three levels and the Treasury's draft; a figure typed
     into prose is a second copy of a fact, so this holds the copy to the bill. */
  const cl = CONTENT.billById.appropriation.clauses.find(c => c.id === "thermal");
  const level = id => cl.levels.find(l => l.id === id).cost / 1000;
  const text = CONTENT.eventById.a1_cooling.body + " " + CONTENT.eventById.a1_cooling.setpiece.title;
  const figs = [...new Set((text.match(/CW\$(\d+)(?:bn)?/g) || []).map(x => +x.replace(/\D/g, "")))].sort((a, b) => a - b);
  ok("the page names the clause's three levels and nothing else", JSON.stringify(figs) === JSON.stringify([0, 14, 34]) &&
     level("tight") === 0 && level("steady") === 14 && level("open") === 34, figs.join(", "));
});

guard("THE COUNT COMMITS THE WHIPS THROUGH THE CHAMBER'S OWN DOOR, AND THE PLAN IS PAID AT THE DIVISION", ok => {
  /* sitting 11. The estimates are at first reading here, since nobody has given them time, and are not
     carried, so the scene fires. Its answers are held, press the party, ask the partner. */
  const at = ans => play(11, { a1_count: ans });
  const hold = at(0), press = at(1), ask = at(2);
  ok("holding commits nobody", !Object.keys(hold.whips.appropriation || {}).length);
  ok("pressing commits the player's own benches", ((press.whips.appropriation || {}).cu || {}).popular > 0,
     JSON.stringify(press.whips.appropriation));
  ok("asking the partner commits its members and not the player's", ((ask.whips.appropriation || {}).psa || {}).popular > 0 &&
     !((ask.whips.appropriation || {}).cu));
  /* paid at the division: the player's party in loyalty, the partner in credit, overdrawn credit in goodwill */
  const price = Engine.whipCost(press, CONTENT, "appropriation"), priceP = Engine.whipCost(ask, CONTENT, "appropriation");
  ok("the player's own benches cost loyalty and no credit", price.loyalty > 0 && !Object.keys(price.capital).length);
  ok("the partner's cost credit and no loyalty", priceP.capital.psa > 0 && priceP.loyalty === 0);
  const credit = play(11, { a1_spare_slot: 0, a1_count: 2 });
  Engine.grantSlot(credit, CONTENT, "anchor_kepler");
  ok("a government that gave the treaty its slot holds more credit with the party than one that did not",
     credit.capital.psa > ask.capital.psa, credit.capital.psa + " and " + ask.capital.psa);
});

guard("A CARRIED ESTIMATES IS REPORTED, AND NOT BEFORE", ok => {
  const early = play(11, {});
  const met = Engine.playSitting(play(11, {}), CONTENT, () => 0).map(m => m.event.id);
  ok("the page does not arrive while the estimates are uncarried", !met.includes("a1_carried"), met.join(","));
  const st = Engine.newGame(CONTENT), ids = [];
  for (let i = 1; i <= 16 && !ids.includes("a1_underwriters"); i++) {
    Engine.playSitting(st, CONTENT, () => 0).forEach(m => ids.push(m.event.id));
    const b = st.bills.appropriation;
    if (st.sitting >= 5 && b.stage !== "drafting" && !b.dead && b.stage !== "assented") {
      if (b.stage === Engine.DIVIDES_AT) { try { Engine.divide(st, CONTENT, "appropriation"); } catch (e) { /* not yet */ } }
      else Engine.grantSlot(st, CONTENT, "appropriation");
    }
    Engine.advance(st, CONTENT);
  }
  ok("and it arrives once the Act is assented, taking no decision", ids.includes("a1_carried") && st.bills.appropriation.stage === "assented",
     ids.filter(x => /carried/.test(x)).join(",") + " " + st.bills.appropriation.stage);
  ok("the Underwriters' reading follows it, at sitting 15 or the first sitting after", ids.indexOf("a1_underwriters") > ids.indexOf("a1_carried") && st.sitting >= 15,
     "sitting " + st.sitting + ": " + ids.join(","));
  const slow = Engine.newGame(CONTENT), seen = [];
  for (let i = 1; i <= 16; i++) { Engine.playSitting(slow, CONTENT, () => 0).forEach(m => seen.push(m.event.id)); Engine.advance(slow, CONTENT); }
  ok("and a government that carried nothing is not read", !seen.includes("a1_underwriters") && !seen.includes("a1_carried"));
});

guard("QUESTION TIME ASKS ABOUT WHAT HAPPENED, ONE QUESTION, AT SITTING 14", ok => {
  /* three exclusive questions. The government that left Ember Ridge alone is asked about it; one that broke a
     promise is asked about the promise; a government that did neither is asked about the reserve. */
  const run = (answers, makeOrder) => { const st = Engine.newGame(CONTENT), ids = [];
    const pick = ev => (answers || {})[ev.id] != null ? answers[ev.id] : 0;
    for (let i = 1; i <= 15; i++) {
      Engine.playSitting(st, CONTENT, pick).forEach(m => { if (i > 10) ids.push(st.sitting + ":" + m.event.id); });
      if (i === 6 && makeOrder) Engine.makeInstrument(st, CONTENT, "rung1_conservation");
      if (i < 15) Engine.advance(st, CONTENT);
    }
    return ids; };
  const asked = ids => ids.filter(x => /a1_qt_/.test(x));
  /* the clean path: nothing promised, the appeal made, nothing left alone */
  const clean = { a1_spare_slot: 1, a1_ember_ridge: 1, a1_floor_ask: 1, a1_cover_ask: 1, a1_works_ask: 2, a1_transit_ask: 2 };
  const make = true;
  const c = asked(run(clean, make));
  ok("a government that made no promise it broke and left nothing alone is asked about the reserve", c.length === 1 && c[0] === "14:a1_qt_reserve", c.join(","));
  const e = asked(run(Object.assign({}, clean, { a1_ember_ridge: 2 })));
  ok("one that left Ember Ridge alone is asked about it", e.length === 1 && e[0] === "14:a1_qt_ember", e.join(","));
  const p = asked(run(Object.assign({}, clean, { a1_spare_slot: 0 }), make));
  ok("one that promised the treaty a slot and gave none is asked about the promise", p.length === 1 && p[0] === "14:a1_qt_promise", p.join(","));
  const stay = CONTENT.eventById.a1_qt_reserve.choices.filter(ch => ch.cost && ch.cost.slot).length;
  ok("staying for the afternoon is the answer that costs a slot, in each of the three",
     ["a1_qt_ember", "a1_qt_promise", "a1_qt_reserve"].every(id => CONTENT.eventById[id].choices.filter(ch => ch.cost && ch.cost.slot).length === 1) && stay === 1);
});

guard("THE CURTAIN IS THE ALMANAC WORKS ABANDONED, READ BY THE LAST PAGE AND NEVER PLAYED", ok => {
  const adm = (T.all().administrations || []).find(a => a.id === "flash_i"), ae = ((adm || {}).setup || {}).actEnd || {};
  const ev = CONTENT.eventById[ae.event];
  ok("the campaign names its curtain, and it is an event the view holds", !!ev && ev.queuedOnly === true && ae.event === "a1_works_abandoned");
  const seen = [], st = Engine.newGame(CONTENT);
  for (let i = 1; i <= 16; i++) { Engine.playSitting(st, CONTENT, () => 0).forEach(m => seen.push(m.event.id)); Engine.advance(st, CONTENT); }
  ok("and it never fires in play, because nothing queues it", !seen.includes("a1_works_abandoned"));
  const aw = ((T.all().world || {}).foreign || []).find(f => f.id === "almanac_works") || {};
  ok("its figures are the world's: the platform's people, and the tether it stands on",
     !!aw.population && ev.body.indexOf(aw.population.toLocaleString("en-GB")) >= 0 && ev.body.indexOf("Tether 2") >= 0 &&
     /Tether 2/.test(aw.site || ""), String(aw.population));
});

guard("THE RISE IS THE DEADLINE: SUPPLY NOT MOVED IS SUPPLY LOST (design/76)", ok => {
  const st = Engine.newGame(CONTENT);
  let over = null, at = null;
  for (let i = 0; i < 20 && !over; i++) {
    const s0 = st.sitting;
    Engine.playSitting(st, CONTENT, () => 0);
    Engine.advance(st, CONTENT);
    const end = Engine.checkEnd(st, CONTENT);
    if (end.over) { over = end; at = s0; }
  }
  ok("a government that never moves the estimates loses supply", !!over && over.kind === "loss" && over.reason === "supply",
     JSON.stringify(over));
  ok("at the rise, the sixteenth sitting, and not before", at === 16, "sitting " + at);
});

guard("THE ACT CAN BE WON: THE APPROPRIATION CARRIES AND THE GOVERNMENT REACHES THE CURTAIN", ok => {
  /* One slot a sitting from the fifth, then the division on the day the House
     sets. The supply bill's functional objection delays it three sittings
     (design/76), and all of that has to fit inside the period. */
  const st = Engine.newGame(CONTENT);
  let over = null;
  for (let i = 0; i < 20 && !over; i++) {
    Engine.playSitting(st, CONTENT, () => 0);
    const b = st.bills.appropriation;
    if (st.sitting >= 5 && b && !b.dead && b.stage !== "assented") {
      if (b.stage === Engine.DIVIDES_AT) { try { Engine.divide(st, CONTENT, "appropriation"); } catch (e) { /* not yet */ } }
      else Engine.grantSlot(st, CONTENT, "appropriation");
    }
    Engine.advance(st, CONTENT);
    const end = Engine.checkEnd(st, CONTENT);
    if (end.over) over = end;
  }
  ok("the Appropriation is assented", st.bills.appropriation.stage === "assented", st.bills.appropriation.stage);
  ok("and the run ends at the rise on the curtain, which is not a loss and not an election",
     !!over && over.kind === "act" && over.reason === "curtain", JSON.stringify(over));
  ok("at the sitting the next period opens on, the seventeenth", st.sitting === 17 && st.period === 2, st.sitting + "/" + st.period);
});

guard("FLASH I IS A CAMPAIGN (design/36 §3)", ok => {
  const adm = (T.all().administrations || []).find(a => a.id === "flash_i");
  ok("it is an administration the menu offers", !!adm);
  ok("and its view is its own: every story entry in it is tagged for it or for the world too",
     ["events", "bills", "instruments", "initiatives", "matters", "settlements", "achievements", "resolutions"]
       .every(k => (CONTENT[k] || []).every(x => x.campaign != null && [].concat(x.campaign).indexOf("flash_i") >= 0)));
});
