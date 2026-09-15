/* Headless check: does the division calculator reproduce the bible's numbers? */
const fs = require("fs"), vm = require("vm");
const files = ["content/setup.js","content/parties.js","content/stations.js","content/constituencies.js","content/cabinet.js","content/instruments.js","content/initiatives.js","content/minutes.js",
               "content/functional.js","content/labour.js",
               "content/characters.js","content/bills.js","content/events.js","content/glossary.js","content/encyclopedia.js","content/business.js","content/settlements.js","content/index.js"];
const src = files.map(f => fs.readFileSync(f,"utf8")).join("\n") + "\n;globalThis.__C = CONTENT;";
vm.runInThisContext(src);
const CONTENT = globalThis.__C;
const Engine = require("./js/engine.js");

const st = Engine.newGame(CONTENT);
console.log("chamber", Engine.chamberTotal(st), "| popular", Engine.popularTotal(st),
            "| functional", Engine.functionalTotal(st));
console.log("majority", Engine.majority(st), "| confidence", Engine.confidence(st));

const d = Engine.division(st, CONTENT, "divergence");
console.log("\nDIVERGENCE THRESHOLD BILL");
console.log("  popular   ", d.popular.aye + "/" + d.popular.total,
            "need " + d.popular.need, d.popular.carries ? "CARRIES" : "FAILS");
console.log("  functional", d.functional.aye + "/" + d.functional.total,
            "need " + d.functional.need, d.functional.carries ? "CARRIES" : "FAILS");
console.log("  result    ", d.carries ? "PASSES" : "DEFEATED");

let fails = 0;
const expect = (label, got, want) => {
  const ok = got === want; if (!ok) fails++;
  console.log((ok ? "  ok  " : "  FAIL") + " " + label + " = " + got + (ok ? "" : " (want " + want + ")"));
};
console.log("\nAGAINST THE BIBLE:");
expect("chamber", Engine.chamberTotal(st), 280);
expect("majority", Engine.majority(st), 141);
expect("confidence", Engine.confidence(st), 141);
expect("popular total", d.popular.total, 240);
expect("functional total", d.functional.total, 40);
expect("popular aye", d.popular.aye, 128);
expect("functional aye", d.functional.aye, 12);
expect("popular need", d.popular.need, 121);
expect("functional need", d.functional.need, 21);

console.log("\nFIRST FIVE SITTINGS (deterministic):");
let s = Engine.newGame(CONTENT);
for (let i=0;i<5;i++){
  const e = Engine.nextEvent(s, CONTENT);
  if(!e){ console.log("  sitting "+s.sitting+": (no eligible event)"); Engine.advance(s); continue; }
  console.log("  sitting "+s.sitting+": "+e.title+"  ["+e.choices.length+" choices]");
  Engine.choose(s, CONTENT, e, 0);
  Engine.advance(s);
}
console.log("\nloss check:", JSON.stringify(Engine.checkLoss(s, CONTENT)));
console.log(fails ? "\n"+fails+" FAILURES" : "\nall assertions pass");

/* Smoke test: play 40 sittings choosing every branch in rotation, look for crashes. */
console.log("\nSMOKE TEST (40 sittings, rotating choices):");
let z = Engine.newGame(CONTENT), fired = 0, k = 0, ended = null;
for (let i = 0; i < 40; i++) {
  const loss = Engine.checkLoss(z, CONTENT);
  if (loss.lost) { ended = "sitting " + z.sitting + ": " + loss.reason; break; }
  const e = Engine.nextEvent(z, CONTENT);
  if (e) { Engine.choose(z, CONTENT, e, (k++) % e.choices.length); fired++; }
  Engine.advance(z);
}
console.log("  events fired:", fired, "| wire items:", z.wire.length, "| queued:", z.queue.length);
console.log("  ended:", ended || "survived 40 sittings");
console.log("  final scalars:", JSON.stringify(z.scalars));
const rt = Engine.load(Engine.save(z));
console.log("  save/load round-trip:", rt.sitting === z.sitting && rt.log.length === z.log.length ? "ok" : "MISMATCH");

/* The district tier must equal the sum of constituency magnitudes, and each
   station must equal the sum of its own. Nothing checked this before and the
   two had drifted by 84 seats. */
console.log("\nTIER RECONCILIATION:");
(function(){
  const K = CONTENT.constituencies || [];
  /* A non-voting seat (the capital territory) returns a member but is not
     part of the district tier: it is excluded from every count here. */
  const voting = K.filter(k => !k.nonVoting);
  const consSeats = voting.reduce((n,c)=>n+c.magnitude,0);
  const partyDist = CONTENT.parties.reduce((n,p)=>n+p.seats.district,0);
  const stnSeats  = CONTENT.stations.reduce((n,s)=>n+s.seats,0);
  let bad = 0;
  const ok = (l,a,b)=>{ const g=a===b; if(!g)bad++;
    console.log((g?"  ok  ":"  FAIL")+" "+l+" = "+a+(g?"":" (want "+b+")")); };
  /* 140 single-member voting seats, plus the capital's non-voting delegate.
     Every district returns one member by first past the post; the
     multi-member constituencies they were subdivided from survive as each
     seat's `parent`. */
  ok("constituencies", K.length, 141);
  ok("voting constituencies", voting.length, 140);
  ok("every district is single-member",
     K.filter(k => k.magnitude !== 1).length, 0);
  ok("voting constituency seats", consSeats, 140);
  ok("party district seats", partyDist, 140);
  ok("station seats", stnSeats, 141);
  CONTENT.stations.forEach(s=>{
    const m = K.filter(k=>k.station===s.id).reduce((n,k)=>n+k.magnitude,0);
    if (m !== s.seats) { bad++; console.log("  FAIL "+s.id+": "+s.seats+" seats vs "+m+" from constituencies"); }
  });
  if (!bad) console.log("  ok   every station reconciles with its constituencies");
  const ap = Engine.apportionment(CONTENT);
  const vals = Object.values(ap);
  console.log("  apportionment ratios derived: " + vals.length +
    ", range " + Math.min(...vals).toFixed(2) + "–" + Math.max(...vals).toFixed(2));
  if (bad) { console.log("\n"+bad+" TIER FAILURES"); process.exitCode = 1; }
})();

/* Acceptance tests from sweep-brief.md Part F. */
console.log("\nINSTRUMENTS AND CABINET (sweep brief, Part F):");
(function(){
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  let s = Engine.newGame(CONTENT);
  const d0 = Engine.division(s, CONTENT, "divergence");
  ok("HC 4/117 fails the functional test on opening state",
     !d0.functional.carries, d0.functional.aye + "/" + d0.functional.need);

  Engine.makeInstrument(s, CONTENT, "si_2287_44");
  Engine.makeInstrument(s, CONTENT, "si_2287_47");
  const d1 = Engine.division(s, CONTENT, "divergence");
  ok("board-packing moves functional seats", d1.functional.aye > d0.functional.aye,
     d0.functional.aye + " -> " + d1.functional.aye);
  ok("packing costs the Guild Bench permanently", s.parties.gb.loyalty === 0);
  ok("packing hands Halloran signatures", s.signatures >= 5, String(s.signatures));

  let v = Engine.newGame(CONTENT);
  Engine.vacate(v, CONTENT, "attestation_registry");
  ok("an SI made by a vacant post is rejected", !Engine.canMake(v, CONTENT, "si_2287_44").ok);

  let p = Engine.newGame(CONTENT);
  Engine.makeInstrument(p, CONTENT, "si_2287_44");
  const beforeFn = Engine.division(p, CONTENT, "divergence").functional.aye;
  p.parties.cl.loyalty = 100; p.parties.hul.loyalty = 100;
  p.parties.gb.loyalty = 100; p.parties.fh.loyalty = 100;
  p.coalition = ["cu"]; p.confidenceSupply = [];
  const pr = Engine.prayAgainst(p, CONTENT, "si_2287_44");
  const afterFn = Engine.division(p, CONTENT, "divergence").functional.aye;
  ok("a prayed-against SI is revoked and its effects reversed",
     pr.carried && afterFn < beforeFn, beforeFn + " -> " + afterFn);

  let w = Engine.newGame(CONTENT);
  Engine.makeInstrument(w, CONTENT, "si_2287_44");
  w.sitting = 40;
  ok("praying after the window closes is refused",
     !Engine.prayAgainst(w, CONTENT, "si_2287_44").ok);

  let g = Engine.newGame(CONTENT);
  g.bills.divergence.stage = Engine.DIVIDES_AT;
  ok("a slot cannot advance a bill awaiting a division",
     !Engine.grantSlot(g, CONTENT, "divergence").ok);

  /* THE DISTRICT ROLL. Every district seat lives in st.roll and every
     district total is derived from it. Two numbers for one fact is the
     apportionment_ratio mistake; these assertions are what stop it. */
  {
    const r = Engine.newGame(CONTENT);

    /* content side: held must sum to magnitude, and to each party's total */
    let magBad = [];
    CONTENT.constituencies.forEach(k => {
      const sum = Object.values(k.held || {}).reduce((a, b) => a + b, 0);
      if (sum !== k.magnitude) magBad.push(`${k.id} ${sum}/${k.magnitude}`);
    });
    ok("every constituency is fully returned", magBad.length === 0, magBad.join(", "));

    /* At-large means exactly one thing: the station returns a single
       constituency, so the seat is the whole station. */
    const perStation = {};
    CONTENT.constituencies.forEach(k => perStation[k.station] = (perStation[k.station] || 0) + 1);
    const alBad = CONTENT.constituencies
      .filter(k => !!k.at_large !== (perStation[k.station] === 1))
      .map(k => k.id);
    ok("at-large marks exactly the single-constituency stations",
       alBad.length === 0, alBad.join(", "));

    let partyBad = [];
    CONTENT.parties.forEach(p => {
      const rolled = Engine.partyDistrict(r, p.id);
      if (rolled !== p.seats.district) partyBad.push(`${p.id} ${rolled}/${p.seats.district}`);
    });
    ok("the roll reproduces every authored district total",
       partyBad.length === 0, partyBad.join(", "));
    ok("the roll reconciles both ways", Engine.tierCheck(r, CONTENT).ok);

    /* The functional roll, on the same terms: content's per-constituency held
       must reproduce each party's authored functional total, and a move must
       land in the roll rather than on the stored count. */
    let fnBad = [];
    CONTENT.parties.forEach(p => {
      const rolled = Object.keys(r.functional || {}).reduce(
        (n, fid) => n + ((r.functional[fid].held || {})[p.id] || 0), 0);
      if (rolled !== p.seats.functional) fnBad.push(`${p.id} ${rolled}/${p.seats.functional}`);
    });
    ok("the functional roll reproduces every authored functional total",
       fnBad.length === 0, fnBad.join(", "));
    {
      const s = Engine.newGame(CONTENT);
      const before = s.parties.cu.seats.functional;
      Engine.makeInstrument(s, CONTENT, "si_2287_44");
      ok("a functional seat moves inside the roll, and the derived total follows",
         s.parties.cu.seats.functional === before + 2 &&
         s.functional.fc_lifesupport.held.cu === 2 &&
         s.functional.fc_lifesupport.held.gb === 3,
         JSON.stringify(s.functional.fc_lifesupport.held));
    }

    /* a vacancy costs the government a vote and is not quietly absorbed */
    const conf0 = Engine.confidence(r);
    Engine.vacateSeat(r, CONTENT, "tier_four", "cu", "test");
    ok("a vacancy costs a vote", Engine.confidence(r) === conf0 - 1,
       conf0 + " -> " + Engine.confidence(r));
    ok("a vacancy still counts toward the tier", Engine.tierCheck(r, CONTENT).ok,
       JSON.stringify(Engine.tierCheck(r, CONTENT)));
    ok("derived and cached district agree after a vacancy",
       Engine.partyDistrict(r, "cu") === r.parties.cu.seats.district);

    const be = Engine.byElection(r, CONTENT, "tier_four");
    ok("a by-election fills the vacancy", be.ok && Engine.vacantSeats(r) === 0);
    ok("the chamber is whole again", Engine.tierCheck(r, CONTENT).ok);

    /* crossing the floor moves a seat without changing the chamber size */
    const before = Engine.partyDistrict(r, "cu");
    Engine.crossFloor(r, CONTENT, "the_cans", "cu", "hul", 1);
    ok("crossing the floor moves one seat",
       Engine.partyDistrict(r, "cu") === before - 1 && Engine.tierCheck(r, CONTENT).ok);
    ok("a refused crossing changes nothing",
       !Engine.crossFloor(r, CONTENT, "the_bourse", "cu", "hul", 1).ok &&
       Engine.tierCheck(r, CONTENT).ok);

    /* a district seats effect must be refused, not silently undone */
    const d0 = Engine.partyDistrict(r, "cu");
    Engine.apply(r, CONTENT, [{ seats: { cu: { district: 5 } } }]);
    /* a member and their seat must agree, in both directions. The seat has to
       exist on the roll and the roll has to show their party holding it — a
       renamed constituency otherwise leaves a member sitting for nowhere. */
    let seatBad = [];
    CONTENT.characters.filter(c => c.seat).forEach(c => {
      const k = CONTENT.constituencies.find(x => x.name === c.seat);
      if (!k) seatBad.push(`${c.name}: no seat "${c.seat}"`);
      else if (!k.held[c.party]) seatBad.push(`${c.name} (${c.party}) sits for ${c.seat}, held by ${Object.keys(k.held)[0]}`);
    });
    /* Every district electorate is its station's share of the adult roll, so
       the 140 must sum back to it exactly. They were uniform at ~28,040 once,
       which made every apportionment ratio ~1.04 and quietly deleted the
       malapportionment that bible 4.7 and 4.10 are about. */
    const districtRoll = CONTENT.constituencies.filter(k => !k.nonVoting)
                           .reduce((n, k) => n + k.electorate, 0);
    ok("district electorates sum to the adult roll", districtRoll === 4149803,
       districtRoll + " vs 4149803");

    const ratios = Object.values(Engine.apportionment(CONTENT));
    const spread = Math.max(...ratios) / Math.min(...ratios);
    ok("apportionment is not flat", spread > 2,
       "ratio " + Math.min(...ratios) + " to " + Math.max(...ratios));

    ok("every member sits for a seat their party holds",
       seatBad.length === 0, seatBad.join("; "));

    ok("a seats effect cannot write district seats",
       Engine.partyDistrict(r, "cu") === d0 &&
       r.parties.cu.seats.district === d0);
  }

  /* THE GENERAL ELECTION. Deterministic (1.5), parallel not compensatory
     (4.1), and the list threshold has both of 4.8's carve-outs. */
  {
    const a = Engine.load(Engine.save(Engine.newGame(CONTENT)), CONTENT);
    const b = Engine.load(Engine.save(Engine.newGame(CONTENT)), CONTENT);
    const r1 = Engine.generalElection(a, CONTENT);
    Engine.generalElection(b, CONTENT);
    ok("the same state elects the same chamber twice",
       JSON.stringify(a.roll) === JSON.stringify(b.roll) &&
       JSON.stringify(a.parties) === JSON.stringify(b.parties));

    ok("the chamber is still 280", Engine.chamberTotal(a) === 280,
       String(Engine.chamberTotal(a)));
    ok("the election reconciles the tiers", Engine.tierCheck(a, CONTENT).ok,
       JSON.stringify(Engine.tierCheck(a, CONTENT)));
    ok("the district tier is still the authored size",
       Engine.partyDistrict(a, "cu") + CONTENT.parties.filter(p => p.id !== "cu")
         .reduce((n, p) => n + Engine.partyDistrict(a, p.id), 0) === a.law.tier_ratio_district);
    const listTot = Object.values(a.parties).reduce((n, p) => n + p.seats.list, 0);
    ok("the list tier is still the authored size", listTot === a.law.tier_ratio_list,
       listTot + "/" + a.law.tier_ratio_list);

    /* 4.3: a pure-list party must survive. Deriving the list vote from
       district strength once wiped the PSA, which is the opposite of canon. */
    ok("a pure-list party survives the election", a.parties.psa.seats.list > 10,
       "PSA list " + a.parties.psa.seats.list);
    /* 4.8: the single-category carve-out saves a party under the threshold */
    ok("the carve-out saves a sub-threshold party",
       a.parties.upl.seats.list > 0 && r1.barred.indexOf("upl") < 0,
       "UPL " + a.parties.upl.seats.list + ", barred: " + (r1.barred.join(",") || "none"));
    ok("a party with no carve-out and no district seat is barred",
       r1.barred.indexOf("geo") >= 0, r1.barred.join(",") || "none");
  }

  /* ORDER-PAPER TIME. Slots are the scarce good that generates capital
     (bible 7.7), so granting one must always move a bill. A stage the engine
     did not recognise fell through every branch and burned the slot in
     silence — content had a bill parked at "lords", which is neither in
     STAGE_ORDER nor a stage the engine recognises. */
  {
    let burned = [], sl = Engine.newGame(CONTENT);
    CONTENT.bills.forEach(b => {
      const before = sl.bills[b.id].stage, used = sl.slots.used;
      const r = Engine.grantSlot(sl, CONTENT, b.id);
      if (r.ok && sl.bills[b.id].stage === before && sl.slots.used > used)
        burned.push(`${b.id} (${before})`);
    });
    ok("a granted slot always advances a bill", burned.length === 0,
       burned.length ? "slot burned on " + burned.join(", ") : "");

    let u = Engine.newGame(CONTENT);
    u.bills[CONTENT.bills[0].id].stage = "not_a_real_stage";
    const before = u.slots.used;
    const r = Engine.grantSlot(u, CONTENT, CONTENT.bills[0].id);
    ok("an unknown stage is refused, not charged",
       !r.ok && u.slots.used === before, r.reason || "");

    /* every stage content ships must be one the engine can advance */
    const known = Engine.STAGE_ORDER.concat(["blocked"]);
    const strays = CONTENT.bills.filter(b => !known.includes(b.stage))
                                .map(b => `${b.id}:"${b.stage}"`);
    ok("every authored stage is in STAGE_ORDER", strays.length === 0, strays.join(", "));
  }

  ok("cabinet is data",
     Object.keys(Engine.newGame(CONTENT).cabinet).length === CONTENT.cabinet.length,
     CONTENT.cabinet.length + " posts");
  /* Content keeps moving after a save is written. A station added to the
     roster left older saves with a hole in st.stations, and the orbital
     chart read .band off undefined and drew nothing — a blank tab, with no
     error a player could see. load() now reconciles, so check both
     directions: what content adds appears, what content drops goes. */
  {
    const fresh = Engine.newGame(CONTENT);
    const last = CONTENT.stations[CONTENT.stations.length - 1];
    const firstSeat = CONTENT.constituencies[0];
    delete fresh.stations[last.id];
    delete fresh.roll[firstSeat.id];
    fresh.stations.ghost = { id:"ghost", name:"Gone", band:"low", seats:2,
      population:1, closure:0.5, suspended:0, attested:0.5 };
    fresh.roll.ghost_seat = { held:{ cu:1 }, vacant:0 };
    const back = Engine.load(Engine.save(fresh), CONTENT);
    ok("a save missing a station regains it", !!back.stations[last.id]);
    ok("a save missing a seat regains it", !!back.roll[firstSeat.id]);
    ok("a station content has dropped is dropped", !back.stations.ghost);
    ok("a seat content has dropped is dropped", !back.roll.ghost_seat);
    ok("the reconciled roll still reconciles", Engine.tierCheck(back, CONTENT).ok,
       JSON.stringify(Engine.tierCheck(back, CONTENT)));
  }

  /* The same hole one layer up: a party added to content left older saves
     without st.parties[id], and the chamber, the orbit chart and the
     Concordance all iterate C.parties and read the save — so they threw and
     drew blank panels. load() must backfill it, and say so. */
  {
    const fresh = Engine.newGame(CONTENT);
    const lastParty = CONTENT.parties[CONTENT.parties.length - 1];
    delete fresh.parties[lastParty.id];
    const back = Engine.load(Engine.save(fresh), CONTENT);
    ok("a save missing a party regains it", !!back.parties[lastParty.id]);
    ok("the party is reported as added",
       ((Engine.lastReconcile() || {}).partiesAdded || []).indexOf(lastParty.id) >= 0);
    ok("every content party is present after load",
       CONTENT.parties.every(p => back.parties[p.id]));
  }

  /* And one layer down again: instruments, bills and characters added to
     content left older saves without the key, and the order paper and the
     instruments panel read st.instruments[id] unguarded — so the render threw
     and the panels went blank. This is exactly what a save written before the
     escalation ladder hit, and why it "needed a new save". */
  {
    const fresh = Engine.newGame(CONTENT);
    const lastSi = CONTENT.instruments[CONTENT.instruments.length - 1];
    const lastBill = CONTENT.bills[CONTENT.bills.length - 1];
    const lastCh = CONTENT.characters[CONTENT.characters.length - 1];
    delete fresh.instruments[lastSi.id];
    delete fresh.bills[lastBill.id];
    delete fresh.characters[lastCh.id];
    const back = Engine.load(Engine.save(fresh), CONTENT);
    ok("a save missing an instrument regains it", !!back.instruments[lastSi.id]);
    ok("a save missing a bill regains it", !!back.bills[lastBill.id]);
    ok("a save missing a character regains it", !!back.characters[lastCh.id]);
    const n = Engine.lastReconcile() || {};
    ok("and all three are reported as added",
       (n.instrumentsAdded || []).indexOf(lastSi.id) >= 0 &&
       (n.billsAdded || []).indexOf(lastBill.id) >= 0 &&
       (n.charactersAdded || []).indexOf(lastCh.id) >= 0);
  }

  /* The cabinet lives in the save, so a recast in content leaves an old holder
     id behind and the panel prints the raw id. load() must repair it, and a
     ministry content has added must appear. */
  {
    const fresh = Engine.newGame(CONTENT);
    const post = CONTENT.cabinet[1];
    fresh.cabinet[post.id] = { id: post.id, holder: "nobody_at_all", party: post.party };
    delete fresh.cabinet[CONTENT.cabinet[2].id];
    const back = Engine.load(Engine.save(fresh), CONTENT);
    ok("a stale cabinet holder is repaired", back.cabinet[post.id].holder === post.holder);
    ok("the repair is reported",
       ((Engine.lastReconcile() || {}).cabinetRepaired || []).indexOf(post.id) >= 0);
    ok("a save missing a ministry regains it", !!back.cabinet[CONTENT.cabinet[2].id]);
  }

  /* Content owns a station's identity; the save owns what play has moved.
     A renamed or resized station must show its current name and return its
     current seats, or the map and the chamber arithmetic disagree — but a
     closure figure the player has spent four sittings moving is theirs. */
  {
    const drifted = Engine.newGame(CONTENT);
    const s = CONTENT.stations[0];
    drifted.stations[s.id].name = "Stale Name";
    drifted.stations[s.id].seats = s.seats + 9;
    drifted.stations[s.id].closure = 0.123;
    const back = Engine.load(Engine.save(drifted), CONTENT);
    ok("content wins on a station's name", back.stations[s.id].name === s.name,
       back.stations[s.id].name);
    ok("content wins on a station's seats", back.stations[s.id].seats === s.seats,
       back.stations[s.id].seats + " vs " + s.seats);
    ok("the save wins on simulated figures", back.stations[s.id].closure === 0.123,
       String(back.stations[s.id].closure));
  }

  /* Reconciling must not leave a fingerprint on the state, or a save stops
     round-tripping to an identical one and tools/roundtrip.js is lying. */
  {
    const a = Engine.load(Engine.save(Engine.newGame(CONTENT)), CONTENT);
    ok("reconciling leaves no trace on the state",
       Engine.save(a) === Engine.save(Engine.load(Engine.save(a), CONTENT)));
  }

  ok("state version is current", Engine.newGame(CONTENT).version === Engine.STATE_VERSION,
     "v" + Engine.STATE_VERSION);

  /* SAVE MIGRATION (bible 15.3.2, sweep brief Part H).
     Every version bump adds fields; a save written before that bump must come
     back with all of them. This regressed once: the guards were written in
     descending order, so a v1 save hit `< 4` first, was stamped 4, and skipped
     the blocks that add prices, capital, slots and whips. It loaded, then threw
     on the first division. Walk every old version forward, not just the newest. */
  const FIELDS_BY_VERSION = {
    2: ["capital", "slots", "whips"],
    3: ["prices", "priceHistory"],
    4: ["cabinet", "instruments", "signatures"]
  };
  const ALL_ADDED = Object.values(FIELDS_BY_VERSION).flat();

  for (let from = 1; from < Engine.STATE_VERSION; from++) {
    const old = JSON.parse(Engine.save(Engine.newGame(CONTENT)));
    old.version = from;
    /* strip everything introduced after `from`, as a real save of that age would lack */
    Object.keys(FIELDS_BY_VERSION).forEach(v => {
      if (Number(v) > from) FIELDS_BY_VERSION[v].forEach(f => delete old[f]);
    });

    const m = Engine.load(JSON.stringify(old));
    const missing = ALL_ADDED.filter(f => m[f] === undefined);
    ok(`v${from} save migrates to v${Engine.STATE_VERSION}`,
       m.version === Engine.STATE_VERSION && missing.length === 0,
       missing.length ? "missing " + missing.join(", ") : "all fields present");

    /* and it must actually be playable, not merely well-shaped */
    let played = true, why = "";
    try {
      Engine.division(m, CONTENT, "divergence");
      Engine.whipCost(m, CONTENT, "divergence");
    } catch (e) { played = false; why = e.message; }
    ok(`v${from} migrated save is playable`, played, why);
  }

  /* LABOUR RECONCILIATION.
     content/labour.js says the licensed counts in functional.js "are the hard
     constraint" and derives everything from population, adult roll and the
     franchise split. Nothing loaded the file, so nothing enforced that. These
     three sums are the whole claim; if a content pass edits an electorate,
     this is what notices. */
  if (typeof LABOUR !== "undefined" && typeof FUNCTIONAL !== "undefined") {
    const T = LABOUR.totals;
    const licensed = FUNCTIONAL.filter(f => f.franchise !== "residual")
                               .reduce((n, f) => n + (f.electorate || 0), 0);
    const residual = FUNCTIONAL.filter(f => f.franchise === "residual")
                               .reduce((n, f) => n + (f.electorate || 0), 0);
    ok("functional electorates sum to the franchise total",
       licensed === T.functionalFranchise, licensed + " vs " + T.functionalFranchise);
    ok("residual constituency matches the labour table",
       residual === T.residual, residual + " vs " + T.residual);
    ok("franchise + residual = adult roll",
       licensed + residual === T.adultRoll, (licensed + residual) + " vs " + T.adultRoll);
    /* ELECTOR ROLLS. Each functional constituency names who is actually on
       its roll; those counts must sum to the electorate the bible fixes, or
       the two numbers are a divergence waiting to happen. The residual is
       exempt: it is the complement of the other ten and nobody registers. */
    const rollBad = [], noGate = [];
    FUNCTIONAL.forEach(f => {
      if (f.complement) return;
      if (!f.electors) { rollBad.push(f.id + " has no roll"); return; }
      const sum = f.electors.reduce((n, e) => n + e.count, 0);
      if (sum !== f.electorate) rollBad.push(`${f.id} ${sum}/${f.electorate}`);
      if (!f.gatekeeper || !f.gatekeeper.board) noGate.push(f.id);
    });
    ok("every elector roll sums to its electorate", rollBad.length === 0, rollBad.join(", "));
    ok("every roll has a gatekeeper", noGate.length === 0, noGate.join(", "));

    /* A person who sits for a functional constituency must name a real one. */
    const badFn = (CONTENT.characters || [])
      .filter(c => c.functional && !(CONTENT.functionalById || {})[c.functional])
      .map(c => c.id + " → " + c.functional);
    ok("every functional seat a person sits for exists", badFn.length === 0, badFn.join(", "));

    /* Every functional seat has a named member, party for party, against the
       authored held. Districts name everyone; this is the functional roster. */
    const memBad = [];
    FUNCTIONAL.forEach(f => {
      const ms = f.members || [];
      if (ms.length !== f.seats) { memBad.push(`${f.id} ${ms.length}/${f.seats}`); return; }
      const by = {};
      ms.forEach(m => by[m.party] = (by[m.party] || 0) + 1);
      Object.keys(f.held).forEach(pid => {
        if ((by[pid] || 0) !== f.held[pid]) memBad.push(`${f.id} ${pid} ${by[pid] || 0}/${f.held[pid]}`);
      });
    });
    ok("every functional seat has a named member, party for party",
       memBad.length === 0, memBad.join(", "));

    /* Every seat carries a unique reference, like LS-1 for Life Support. */
    const refs = [];
    FUNCTIONAL.forEach(f => (f.members || []).forEach(m => refs.push(m.ref)));
    const dupRef = refs.filter((r, i) => refs.indexOf(r) !== i);
    ok("every functional seat has a unique reference",
       dupRef.length === 0 && refs.every(Boolean), dupRef.join(", "));

    const gov = FUNCTIONAL.filter(f => f.gatekeeper &&
                  f.gatekeeper.appointed_by === "government");
    ok("the government appoints most of the boards", gov.length >= 5,
       gov.length + " of " + FUNCTIONAL.length + " reachable by regulation");

    /* the residual really is the complement, not a roll of its own */
    const enrolled = FUNCTIONAL.filter(f => !f.complement)
                       .reduce((n, f) => n + f.electorate, 0);
    const resid = FUNCTIONAL.filter(f => f.complement)
                    .reduce((n, f) => n + f.electorate, 0);
    ok("enrolled plus residual is the adult roll",
       enrolled + resid === LABOUR.totals.adultRoll,
       `${enrolled} + ${resid} = ${enrolled + resid}`);

    /* every party declares how it contests seats */
    const noKind = CONTENT.parties.filter(p => !p.kind).map(p => p.id);
    ok("every party declares a kind", noKind.length === 0, noKind.join(", "));
    ok("the functional tier is not purely partisan",
       CONTENT.parties.some(p => p.kind === "professional"),
       CONTENT.parties.filter(p => p.kind === "professional").map(p => p.id).join(", "));

    ok("adult roll is a plausible share of population",
       T.adultRoll < T.population && T.adultRoll / T.population > 0.5,
       (100 * T.adultRoll / T.population).toFixed(1) + "% of " + T.population);
  } else {
    ok("labour table is loaded", false, "LABOUR or FUNCTIONAL missing from the harness");
  }

  if (bad) { console.log("\n" + bad + " ACCEPTANCE FAILURES"); process.exitCode = 1; }
})();

/* ---------------------------------------------------------------------
   THE CURRENTS VOTE.

   A party with factions is not one bloc at one rate. These assertions
   exist because the currents carried an `axes` object for the whole life
   of the project and NOTHING READ IT — the four factions inside the
   governing party were a loyalty dial and a paragraph in the
   Concordance, and a division treated all eighty-two members as one
   voice. The bible's 128 is unaffected and asserted above, because that
   forecast is stated in content rather than derived.
   --------------------------------------------------------------------- */
console.log("\nCURRENTS IN A DIVISION:");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  const st = Engine.newGame(CONTENT);
  const row = (bill, pid) =>
    Engine.division(st, CONTENT, bill).rows.find(r => r.party === pid);

  /* thermal2 gives the governing party a bare "for", so the count is
     derived and the factions are visible. */
  const cu = row("thermal2", "cu");
  ok("a party with currents reports its factions", !!cu.benches,
     cu.benches ? cu.benches.length + " currents" : "none");

  const flat = Math.round(cu.popularSeats * (0.75 + 0.25 * (st.parties.cu.loyalty / 100)));
  ok("and does not vote at its party-wide rate", cu.popularAye !== flat,
     cu.popularAye + " aye, not " + flat);

  /* THE CASE THE WHOLE CHANGE EXISTS FOR. The Party of Socialists and
     Democrats has NO position on closure; two of its currents do. The
     deck cooperativists are the MORE loyal of this pair and the LESS
     willing, which is only possible if the current's own axes are read.
     If this ever fails because loyalty alone decides turnout, the
     factions have gone back to being decoration. */
  const deck = cu.benches.find(b => b.id === "cu_deck");
  const main = cu.benches.find(b => b.id === "cu_maintenance");
  const rate = b => b.popularAye / b.popularSeats;
  ok("a current is more loyal than another",
     st.currents.cu_deck.loyalty > st.currents.cu_maintenance.loyalty,
     "deck " + st.currents.cu_deck.loyalty + " vs maintenance " + st.currents.cu_maintenance.loyalty);
  ok("and still turns out less, because it disagrees with the bill",
     rate(deck) < rate(main),
     (100 * rate(deck)).toFixed(0) + "% vs " + (100 * rate(main)).toFixed(0) + "%");

  /* A breakdown whose rows do not add up to the row above reads as a bug
     in the arithmetic even when the arithmetic is right. */
  const sum = (bs, k) => bs.reduce((n, b) => n + (b[k] || 0), 0);
  ok("faction seats sum to the party's seats",
     sum(cu.benches, "popularSeats") === cu.popularSeats &&
     sum(cu.benches, "functionalSeats") === cu.functionalSeats,
     sum(cu.benches, "popularSeats") + "/" + cu.popularSeats + " popular");
  ok("faction ayes sum to the party's ayes",
     sum(cu.benches, "popularAye") === cu.popularAye &&
     sum(cu.benches, "functionalAye") === cu.functionalAye,
     sum(cu.benches, "popularAye") + "/" + cu.popularAye + " popular");
  ok("and no current delivers more members than it has",
     cu.benches.every(b => b.popularAye <= b.popularSeats &&
                           b.functionalAye <= b.functionalSeats));

  /* An explicit {for:n} is a forecast the whips handed the Prime
     Minister. Splitting it across factions afterwards would be the
     interface inventing a reason the content did not give. */
  ok("a stated forecast is not attributed to the factions",
     row("divergence", "cu").benches === null,
     "HC 4/117 states cu popular {for:68}");

  /* Eleven of the twelve parties have no currents, and none of their
     numbers may move. */
  const others = Engine.division(st, CONTENT, "thermal2").rows
    .filter(r => r.party !== "cu" && r.popularSeats);
  ok("a party with no currents reports none",
     others.every(r => r.benches === null), others.length + " parties");

  /* Content states a faction's size; the roll states the party's, and an
     election moves the roll without touching the content. A current is
     therefore a SHARE, resized against whatever its party currently
     holds — the mistake apportionment_ratio taught us once already. */
  const e = Engine.newGame(CONTENT);
  e.parties.cu.seats.district = 20;              /* a bad night */
  const shrunk = Engine.division(e, CONTENT, "thermal2").rows.find(r => r.party === "cu");
  ok("a party that loses seats still has factions that add up",
     shrunk.benches.reduce((n, b) => n + b.popularSeats, 0) === shrunk.popularSeats,
     shrunk.popularSeats + " popular seats across " + shrunk.benches.length + " currents");
  ok("and the factions shrank with it",
     shrunk.benches.every(b => b.popularSeats <= cu.benches
       .find(x => x.id === b.id).popularSeats));

  if (bad) { console.log("\n" + bad + " CURRENT FAILURES"); process.exitCode = 1; }
})();

/* ---------------------------------------------------------------------
   A9 — SUSPENSION MUST NEVER BE THE EFFICIENT ANSWER.

   The ladder (design/03 §4) is nine rungs from a voluntary appeal to
   involuntary suspension, each cheaper politically and dearer fiscally
   than the one below. The rule is stated as an assertion rather than a
   hope: the political cost of relief rises down the ladder faster than
   the relief does, so the last rung is the worst bargain in the game.
   --------------------------------------------------------------------- */
console.log("\nTHE ESCALATION LADDER:");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  const rungs = (CONTENT.instruments || []).filter(i => /^rung\d/.test(i.id))
    .sort((a, b) => a.id.localeCompare(b.id));
  const num = e => Object.keys(e.move || {}).reduce((n, k) => n + Math.abs(e.move[k]), 0);
  const cost = i => [].concat(i.political_cost || []).reduce((n, e) => n + num(e), 0);
  const relief = i => [].concat(i.effects || []).reduce((n, e) =>
    n + ((e.move || {})["thermal_margin"] || 0), 0);
  const ratio = i => relief(i) > 0 ? cost(i) / relief(i) : Infinity;

  ok("the ladder has nine rungs", rungs.length === 9, rungs.map(r => r.id).join(", "));
  ok("each rung is gated on the one above it",
     rungs.every((r, i) => i === 0
       ? !r.when
       : !!(r.when && r.when.flags && r.when.flags[0] === "rung" + i + "_tried")),
     rungs.map(r => (r.when && r.when.flags ? r.when.flags[0] : "ungated")).join(" "));
  ok("A9: the political cost rises down the ladder",
     rungs.every((r, i) => i === 0 || cost(r) > cost(rungs[i - 1])),
     rungs.map(r => cost(r)).join(" < "));
  ok("A9: and the last rung is the worst bargain on it",
     rungs.every(r => ratio(r) <= ratio(rungs[8])),
     rungs.map(r => relief(r) + "m/" + cost(r) + "c").join(", "));

  if (bad) { console.log("\n" + bad + " LADDER FAILURES"); process.exitCode = 1; }
})();

console.log("\nTHE FORECAST IS AN OPINION (design/08 §7):");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  const a = Engine.newGame(CONTENT), b = Engine.newGame(CONTENT);
  const fa = Engine.reported(a, CONTENT, "divergence");
  ok("a fresh save reports a forecast", !!fa && !!fa.popular && !!fa.prov, fa.prov);
  ok("the same state reports the same number twice",
     Engine.reported(a, CONTENT, "divergence").popular.aye === fa.popular.aye);
  ok("and the seed makes it reproducible",
     Engine.reported(b, CONTENT, "divergence").popular.aye === fa.popular.aye);
  ok("the reported number is not the exact one",
     fa.popular.aye !== fa.true.popular.aye ||
     fa.functional.aye !== fa.true.functional.aye,
     "reported " + fa.popular.aye + "/" + fa.functional.aye +
     "  exact " + fa.true.popular.aye + "/" + fa.true.functional.aye);
  const seed2 = Engine.newGame(CONTENT); seed2.seed = 424242;
  ok("a different seed moves the error",
     Engine.reported(seed2, CONTENT, "divergence").popular.aye !== fa.popular.aye);

  if (bad) { console.log("\n" + bad + " FORECAST FAILURES"); process.exitCode = 1; }
})();

console.log("\nTHE LEADERSHIP BALLOT (design/08 §2):");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  const a = Engine.newGame(CONTENT);
  const b0 = Engine.ballot(a, CONTENT);
  ok("a fresh caucus would carry a ballot", b0.carries && b0.for >= b0.need,
     b0.for + " for, " + b0.against + " against, " + b0.need + " needed");

  const b = Engine.newGame(CONTENT);
  Object.keys(b.currents).forEach(k => { b.currents[k].loyalty = 0; });
  b.parties[b.playerParty].loyalty = 0;
  const lost = Engine.ballot(b, CONTENT);
  ok("a caucus with no loyalty loses it", !lost.carries,
     lost.for + " for of " + lost.need);

  const c = Engine.newGame(CONTENT);
  c.signatures = CONTENT.setup.thresholds.ballot;
  Engine.tick(c, CONTENT);
  ok("the threshold holds a ballot", !!c.ballot);
  ok("and it is reported in the log",
     c.log.some(l => /Leadership ballot/.test(l.text)));
  const before = c.ballot;
  Engine.tick(c, CONTENT);
  ok("and only once", c.ballot === before);

  if (bad) { console.log("\n" + bad + " BALLOT FAILURES"); process.exitCode = 1; }
})();

console.log("\nA MINISTER ANSWERS FOR A BROKEN PROMISE (design/08 §3):");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  const a = Engine.newGame(CONTENT);
  const post = Object.keys(a.cabinet).find(k => a.cabinet[k].holder);
  ok("a fresh cabinet has a holder to lose", !!post, post);
  const holder = a.cabinet[post].holder;

  Engine.apply(a, CONTENT, [{undertake:{ id:"t_resign", text:"test promise",
    post:post, by:0, discharge:{ flag:"never_set" }}}]);
  const u = a.undertakings.find(x => x.id === "t_resign");
  ok("an undertaking remembers its post", !!(u && u.post === post));

  Engine.advance(a, CONTENT);
  ok("breaking it vacates the post", !a.cabinet[post].holder,
     holder + " -> " + (a.cabinet[post].holder || "vacant"));
  ok("and records the resignation", !!a.lastResignation && a.lastResignation.post === post);
  ok("and flags it for content", !!a.flags["minister_resigned"]);
  ok("and it is in the log", a.log.some(l => /resigns/.test(l.text)));

  if (bad) { console.log("\n" + bad + " RESIGNATION FAILURES"); process.exitCode = 1; }
})();

console.log("\nA DIVISION IS HOUSE TIME (design/18 §3):");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  const a = Engine.newGame(CONTENT);
  let guard = 0;
  while (a.bills.divergence.stage !== "third_reading" && guard++ < 8)
    Engine.grantSlot(a, CONTENT, "divergence");
  while (a.sitting < (a.bills.divergence.dividesOn || 0)) Engine.advance(a, CONTENT);
  const usedBySlots = a.slots.used;
  const out = Engine.divide(a, CONTENT, "divergence");
  ok("the division resolves", !!out.result);
  ok("and it spent a slot of House time", a.slots.used === usedBySlots + 1,
     usedBySlots + " -> " + a.slots.used);

  /* THE CLOCK RUNS OUT. With no order-paper time the House is done, and the
     refusal is visible rather than silent. */
  const b = Engine.newGame(CONTENT);
  b.slots.used = b.slots.total;
  const chk = Engine.canDivide(b, CONTENT, "divergence");
  ok("no time left refuses a division", !chk.ok && !!chk.noTime, chk.reason);
  ok("and a refused division charges nothing",
     Engine.divide(b, CONTENT, "divergence").ok === false && b.slots.used === b.slots.total);

  if (bad) { console.log("\n" + bad + " DIVISION-COST FAILURES"); process.exitCode = 1; }
})();

console.log("\nTHE QUIET SITTING HAS A PAGE (design/17 §2.2):");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  const a = Engine.newGame(CONTENT);
  /* business() filters the pool with matches(), which THROWS on an unknown
     condition, so this call alone proves every gate in content/business.js
     resolves. */
  const first = Engine.business(a, CONTENT, 3);
  ok("a quiet sitting prints an order paper", first.length === 3, first.length + " lines");
  ok("every line is text", first.every(b => b && typeof b.text === "string" && b.text.length > 10));
  ok("and no line is a control",
     first.every(b => b.tab === undefined && b.effects === undefined &&
                      b.result === undefined && b.choices === undefined));
  ok("the page is stable on a re-read",
     Engine.business(a, CONTENT, 3).map(b => b.id).join(",") ===
     first.map(b => b.id).join(","));

  Engine.advance(a, CONTENT);
  const next = Engine.business(a, CONTENT, 3);
  ok("a new sitting prints a new page",
     next.map(b => b.id).join(",") !== first.map(b => b.id).join(","));
  ok("and no line appears twice on one page",
     new Set(next.map(b => b.id)).size === next.length);

  ok("the pool is deeper than a session of pages",
     (CONTENT.business || []).length >= 30, (CONTENT.business || []).length + " entries");

  if (bad) { console.log("\n" + bad + " ORDER-PAPER FAILURES"); process.exitCode = 1; }
})();

console.log("\nAN INITIATIVE'S ANSWER IS AN EVENT (design/18 §4):");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  const ids = new Set(CONTENT.events.map(e => e.id));
  const inits = CONTENT.initiatives || [];
  ok("there are initiatives", inits.length > 0, inits.length + "");
  ok("and each queues an event that exists",
     inits.every(i => ids.has(i.event)),
     inits.filter(i => !ids.has(i.event)).map(i => i.id).join(",") || "");

  /* Taking one spends the clock and puts the answer on the queue. */
  const a = Engine.newGame(CONTENT);
  const i0 = inits[0];
  const before = a.slots.used;
  const r = Engine.take(a, CONTENT, i0.id, 0);
  ok("taking an initiative succeeds", !!r.ok, r.reason || "");
  ok("and it spends order-paper time", a.slots.used > before,
     before + " -> " + a.slots.used);
  ok("and it queues the answer",
     (a.queue || []).some(q => q.eventId === i0.event), JSON.stringify(a.queue || []));

  if (bad) { console.log("\n" + bad + " INITIATIVE FAILURES"); process.exitCode = 1; }
})();

console.log("\nTHE HOUSE VOTES, AND THE BILL REMEMBERS IT (design/08 §7):");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  const a = Engine.newGame(CONTENT);
  let guard = 0;
  while (a.bills.divergence.stage !== "third_reading" && guard++ < 8)
    Engine.grantSlot(a, CONTENT, "divergence");
  while (a.sitting < (a.bills.divergence.dividesOn || 0)) Engine.advance(a, CONTENT);

  const truth = Engine.division(a, CONTENT, "divergence");
  ok("nothing is recorded before the House votes", !a.bills.divergence.lastDivision);
  Engine.divide(a, CONTENT, "divergence");
  const lr = a.bills.divergence.lastDivision;
  ok("the bill records the division once it runs", !!lr);
  ok("and the record is the arithmetic that ran",
     !!lr && lr.popular.aye === truth.popular.aye && lr.carries === truth.carries,
     lr ? lr.popular.aye + " against " + truth.popular.aye : "");
  ok("and it is a trimmed copy, not the bill itself",
     !!lr && lr.bill === undefined && Array.isArray(lr.rows));
  ok("and it keeps the sitting it happened", !!lr && lr.at === a.sitting);

  if (bad) { console.log("\n" + bad + " DIVISION-RECORD FAILURES"); process.exitCode = 1; }
})();

/* ---------------------------------------------------------------------
   THE BED IS IN TUNE.

   Eight bars of hand-typed MIDI. A mistyped number is a wrong note that
   every static check passes and nobody hears until the loop happens to
   reach that bar.
   --------------------------------------------------------------------- */
console.log("\nTHE ADAPTIVE BED:");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  let F;
  try { F = require("./js/music.js").__form; }
  catch (e) { ok("the music module loads", false, e.message); return; }

  const NAME = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const pc = m => ((m % 12) + 12) % 12;
  const named = ms => ms.map(m => NAME[pc(m)]).join(" ");
  /* D natural minor: D E F G A Bb C */
  const KEY = [2, 4, 5, 7, 9, 10, 0];

  ok("the bed is the sixteen-bar form it was written as",
     F.BARS === F.PROG.length && F.PROG.length === 16,
     F.BARS + " bars = " + (F.BARS * F.BEATS * 60 / F.BPM).toFixed(0) +
     "s at " + F.BPM + " BPM");

  /* Every sustained note is hand-typed MIDI, and a mistyped one is a
     wrong note nobody hears until the loop reaches that bar. */
  const stray = [];
  F.PROG.forEach((b, i) => {
    const at = "bar " + (i + 1) + " ";
    const tones = b.ch.map(pc);
    const fits = m => tones.indexOf(pc(m)) >= 0 || KEY.indexOf(pc(m)) >= 0;
    b.ch.forEach(m => { if (!fits(m)) stray.push(at + "voicing " + NAME[pc(m)]); });
    b.bass.forEach(m => { if (!fits(m)) stray.push(at + "bass " + NAME[pc(m)]); });
    if (!fits(b.reed)) stray.push(at + "reed " + NAME[pc(b.reed)]);
    (b.h || []).forEach(([m]) => { if (!fits(m)) stray.push(at + "lead " + NAME[pc(m)]); });
  });
  ok("every note is a chord tone or in the key", stray.length === 0,
     stray.join("; ") || F.PROG.length + " bars checked");

  /* A lead note off the eighth grid never fires at all: the sequencer
     matches beat * 2 against an integer step, so it would be silently
     absent rather than audibly wrong. */
  const offgrid = [];
  F.PROG.forEach((b, i) => (b.h || []).forEach(([m, beat, d]) => {
    if (Math.abs(beat * 2 - Math.round(beat * 2)) > 1e-9)
      offgrid.push("bar " + (i + 1) + " at beat " + beat);
    if (beat + d > F.BEATS + 0.001) offgrid.push("bar " + (i + 1) + " past the barline");
  }));
  ok("every lead note lands on the grid and inside its bar",
     offgrid.length === 0, offgrid.join("; ") || "checked");

  ok("every note is in a range a human could play",
     F.PROG.every(b => b.ch.every(m => m >= 36 && m <= 84) &&
                       b.bass.every(m => m >= 28 && m <= 55) &&
                       b.reed >= 48 && b.reed <= 84));

  ok("the hook is short enough to remember",
     F.MOTIF.length >= 2 && F.MOTIF.length <= 5, named(F.MOTIF));
  ok("and is in the key", F.MOTIF.every(m => KEY.indexOf(pc(m)) >= 0));

  /* TEN MOODS. Each has to be a different musical idea, or the score is
     saying the same thing about different events. */
  ok("there is a distinct response for ten different things",
     F.MOODS.length === 10, F.MOODS.join(", "));

  if (bad) { console.log("\n" + bad + " BED FAILURES"); process.exitCode = 1; }
})();

/* ---------------------------------------------------------------------
   AND IT PLAYS.

   jsdom has no Web Audio, so build() returns false in every harness and
   the sequencer, the six voices and the ten moods are executed by no
   other check in the project. This drives the whole loop through a
   recording stub and fires every mood from an off-beat position,
   because a player does not click on the beat.

   It is not listening — it cannot be — but it catches what is not about
   taste: a voice that throws, a pattern addressing a step that does not
   exist, and an exponential ramp to zero, which is silent in a stub and
   a thrown DOMException in a browser.
   --------------------------------------------------------------------- */
console.log("\nAND IT PLAYS:");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  const M = require("./js/music.js"), F = M.__form;
  const made = {}, ramps = [];
  const bump = k => made[k] = (made[k] || 0) + 1;

  /* `anchored` counts events actually placed on THIS param's timeline.
     A ramp reads its start value from the previous event, so a ramp with
     none is the silent-bed bug. cancelAndHold is not counted: it holds
     an existing event and cannot invent one. */
  function param(name) {
    const p = {
      value: 0, anchored: 0,
      setValueAtTime: (v, t) => { p.anchored++; ramps.push([name, "set", v, t, 1]); return p; },
      setTargetAtTime: (v, t) => { p.anchored++; ramps.push([name, "tgt", v, t, 1]); return p; },
      linearRampToValueAtTime: (v, t) => { ramps.push([name, "lin", v, t, p.anchored]); p.value = v; return p; },
      exponentialRampToValueAtTime: (v, t) => { ramps.push([name, "exp", v, t, p.anchored]); return p; },
      cancelScheduledValues: () => p,
      cancelAndHoldAtTime: () => p
    };
    return p;
  }
  const node = extra => Object.assign({ connect: () => {}, disconnect: () => {} }, extra);
  const ctx = {
    currentTime: 0, sampleRate: 8000, state: "running", resume: () => {},
    createOscillator: () => { bump("osc"); return node(
      { type: "sine", frequency: param("osc.f"), detune: param("osc.detune"),
        start: () => {}, stop: () => {} }); },
    createGain: () => { bump("gain"); return node({ gain: param("gain") }); },
    createBiquadFilter: () => { bump("filter"); return node(
      { type: "lowpass", frequency: param("filter.f"), Q: param("Q") }); },
    createDelay: () => node({ delayTime: param("delay") }),
    createBufferSource: () => { bump("noise"); return node(
      { buffer: null, loop: false, start: () => {}, stop: () => {} }); },
    createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) })
  };
  globalThis.Sound = { context: () => ctx, musicOut: () => node({ gain: param("bus") }),
                       onReady: fn => fn() };

  const realSet = globalThis.setTimeout, realClear = globalThis.clearTimeout;
  let pending = null, threw = null, mix = null, fired = 0;
  globalThis.setTimeout = fn => { pending = fn; return 0; };
  globalThis.clearTimeout = () => { pending = null; };
  const tick = () => { if (!pending) return false; const fn = pending; pending = null;
                       ctx.currentTime += 0.04; fn(); return true; };
  const SECS = n => { const to = ctx.currentTime + n; while (ctx.currentTime < to && tick()); };
  const BAR = F.BEATS * 60 / F.BPM;

  try {
    M.init();
    ok("the graph builds and the transport starts", M.available() === true);

    const LOOP = F.BARS * BAR;
    SECS(LOOP + 1);
    ok("a whole pass of the loop plays", ctx.currentTime >= LOOP,
       ctx.currentTime.toFixed(0) + "s of a " + LOOP.toFixed(0) + "s loop");

    /* EVERY MOOD, each fired from a different offset inside the bar. */
    F.MOODS.forEach((m, i) => { SECS(BAR * 0.31 + i * 0.09); M[m](); fired++; SECS(BAR); });
    ok("every mood was fired", fired === F.MOODS.length, fired + " moods");

    SECS(BAR * 8);
    mix = M.state();
    M.stop();
  } catch (e) { threw = e; }
  globalThis.setTimeout = realSet; globalThis.clearTimeout = realClear;

  ok("and none of them threw", !threw,
     threw ? threw.message + " | " + String(threw.stack).split("\n")[1].trim() : "");
  ok("every voice was reached", (made.osc || 0) > 300 && (made.noise || 0) > 100,
     (made.osc || 0) + " oscillators, " + (made.noise || 0) + " noise bursts");

  /* AN EXPONENTIAL RAMP TO ZERO throws a DOMException in a browser and
     does nothing in a stub, so it is invisible everywhere except on the
     player's machine. */
  const zeroed = ramps.filter(r => r[1] === "exp" && !(r[2] > 0));
  ok("no exponential ramp reaches zero", zeroed.length === 0,
     zeroed.length ? zeroed.length + " ramps to " + zeroed[0][2] + " on " + zeroed[0][0]
                   : ramps.length + " automation points");
  ok("and none is scheduled before the clock",
     ramps.filter(r => r[3] < -0.001).length === 0);

  /* THE SILENT BED. A linear ramp takes its start value from the
     previous event on the param's timeline, and an assigned .value is
     not an event. Where that resolves the wrong way the whole bed sits
     at zero while every oscillator runs on time — audible nowhere,
     visible in no check, and reported as "no music on mobile". */
  const unanchored = ramps.filter(r => (r[1] === "lin" || r[1] === "exp") && !r[4]);
  ok("no ramp starts from an empty automation timeline", unanchored.length === 0,
     unanchored.length ? unanchored.length + " unanchored, first on " + unanchored[0][0]
       : ramps.filter(r => r[1] === "lin" || r[1] === "exp").length + " ramps anchored");

  /* Ten moods fired back to back must leave the bed PLAYING. Every path
     out of a mood that takes a layer down has to put it back, and with
     ten of them the chance of one forgetting is the whole risk here. */
  ok("the bed is still up after every mood has fired", !!mix &&
     Object.keys(mix.levels).filter(k => mix.levels[k] > 0).length >= 4,
     mix ? Object.keys(mix.levels).filter(k => mix.levels[k] > 0)
             .map(k => k + " " + mix.levels[k]).join(", ") : "no state");

  delete globalThis.Sound;
  if (bad) { console.log("\n" + bad + " PLAYBACK FAILURES"); process.exitCode = 1; }
})();
/* ---------------------------------------------------------------------
   THE FIRST TAP IS NOT GUARANTEED TO WORK.

   A phone reported no sound at all. The unlock latched `unlocked` and
   removed its listener with { once: true } BEFORE it knew whether the
   context had started, and resume() is asynchronous and refusable — on
   iOS a pointerdown that becomes a scroll is not user activation. When
   that happened the flag was set, the listener was gone, and the game
   was silent for the whole session with no way back.

   These assertions are the difference between "a context exists" and
   "the hardware is running", which is the entire bug.
   --------------------------------------------------------------------- */
(async function () {
  console.log("\nUNLOCKING ON A PHONE:");
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  /* A context that starts suspended and only resumes when we say so —
     which is what every mobile browser actually gives you. */
  let allow = false, resumes = 0;
  function FakeContext() {
    this.state = "suspended";
    this.sampleRate = 8000;
    this.currentTime = 0;
    this.destination = {};
    this.resume = () => {
      resumes++;
      if (!allow) return Promise.reject(new Error("not allowed to start"));
      this.state = "running";
      return Promise.resolve();
    };
    const node = () => ({ connect() {}, gain: { value: 0,
      setValueAtTime() {}, linearRampToValueAtTime() {},
      exponentialRampToValueAtTime() {}, cancelScheduledValues() {} } });
    this.createGain = node;
    this.createBiquadFilter = () => Object.assign(node(),
      { type: "", frequency: { value: 0 }, Q: { value: 0 } });
    this.createOscillator = () => Object.assign(node(),
      { type: "", frequency: { value: 0, setValueAtTime() {},
        exponentialRampToValueAtTime() {} }, start() {}, stop() {} });
    this.createBufferSource = () => Object.assign(node(),
      { buffer: null, loop: false, start() {}, stop() {} });
    this.createBuffer = (c, n) => ({ getChannelData: () => new Float32Array(n) });
    this.createDelay = () => Object.assign(node(), { delayTime: { value: 0 } });
  }

  const taps = {};
  const sandbox = {
    console: console,
    window: {
      AudioContext: FakeContext,
      addEventListener: (ev, fn, opts) => { (taps[ev] = taps[ev] || []).push({ fn, opts }); }
    }
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync("js/audio.js", "utf8") + "\n;this.__S = Sound;", sandbox);
  const S = sandbox.__S;

  let ready = 0;
  S.onReady(() => ready++);
  S.init();

  /* A listener removed after one failed attempt is a session with no
     sound in it, so the events must stay bound. */
  const evs = Object.keys(taps);
  ok("it listens for the gestures a phone actually sends",
     evs.indexOf("touchend") >= 0 && evs.indexOf("pointerdown") >= 0 &&
     evs.indexOf("click") >= 0, evs.join(", "));
  ok("and does not unbind after one try",
     evs.every(e => taps[e].every(l => !(l.opts && l.opts.once))));

  const tap = async ev => {
    (taps[ev] || []).forEach(l => l.fn());
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  };

  /* THE REFUSED GESTURE. This is the case that used to be fatal. */
  await tap("pointerdown");
  ok("a refused gesture leaves the hardware stopped", S.running() === false);
  ok("and does not start the music on a context that is not going", ready === 0);
  ok("but it did try", resumes === 1, resumes + " resume attempt");

  /* THE NEXT TAP. The listener is still there, so the player gets sound
     the moment the browser is willing to give it to them. */
  allow = true;
  await tap("touchend");
  ok("the next gesture recovers", S.running() === true);
  ok("and everything waiting on the graph starts", ready === 1);

  /* Backgrounding a page suspends its context on iOS. Coming back to a
     dead terminal used to be final for the same reason. */
  const before = resumes;
  S.__unlock();
  ok("a tap on a running context costs nothing", resumes === before);

  /* iOS suspends a backgrounded page's context behind the player's back. */
  S.context().state = "suspended";
  ok("backgrounding stops it", S.running() === false);
  await tap("click");
  ok("and a tap brings it back", S.running() === true);
  ok("without starting the music a second time", ready === 1);

  if (bad) { console.log("\n" + bad + " UNLOCK FAILURES"); process.exitCode = 1; }
})();


/* ---------------------------------------------------------------------
   THE CLOCK RUNS.

   st.date was written once at newGame from setup.startDate and never
   touched again — thirty sittings later the topbar still read the
   opening day. Nothing caught it because nothing had ever asked what
   the date was for.
   --------------------------------------------------------------------- */
console.log("\nTHE CALENDAR:");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  const st = Engine.newGame(CONTENT);
  const opened = st.date;
  for (let i = 0; i < 10; i++) Engine.advance(st, CONTENT);
  ok("the date advances with the sittings", st.date !== opened,
     opened + " -> " + st.date + " at sitting " + st.sitting);

  /* A sitting is a day the House sits, so the map from one to the other
     has to be a pure function or a deadline drifts against the square it
     was drawn on. */
  ok("a sitting always falls on a day the House sits",
     Engine.sittingOfDate(CONTENT, st.date) === st.sitting,
     st.date + " is sitting " + Engine.sittingOfDate(CONTENT, st.date));
  ok("and the mapping is stable however often it is asked",
     Engine.dateOfSitting(CONTENT, 17) === Engine.dateOfSitting(CONTENT, 17) &&
     Engine.dateOfSitting(CONTENT, 17) === Engine.dateOfSitting(CONTENT, 17));
  ok("later sittings are later days",
     Engine.dateOfSitting(CONTENT, 1) < Engine.dateOfSitting(CONTENT, 24),
     Engine.dateOfSitting(CONTENT, 1) + " ... " + Engine.dateOfSitting(CONTENT, 24));

  const DAYS = CONTENT.setup.sittingDays;
  ok("the House does not sit every day", Array.isArray(DAYS) && DAYS.length < 7,
     DAYS.length + " days in seven");

  /* THE CALENDAR AND THE DOCKET MUST READ THE SAME SOURCE. A deadline on
     one and not the other is how a player learns to trust neither. */
  const cal = Engine.calendar(st, CONTENT, 0);
  ok("the calendar draws a real month", cal.days.length >= 28 && cal.days.length <= 31,
     cal.label + ", " + cal.days.length + " days");
  ok("and knows which of them the House sits on",
     cal.days.some(d => d.sits) && cal.days.some(d => !d.sits),
     cal.days.filter(d => d.sits).length + " sitting days");
  ok("exactly one day is today",
     cal.days.filter(d => d.today).length === 1);
  ok("and the days before it are past",
     cal.days.filter(d => d.today)[0].sitting === st.sitting);

  const dl = Engine.deadlines(st, CONTENT);
  ok("the session end is a deadline like any other",
     dl.some(d => d.kind === "rises" && d.sitting === st.sessionEnds),
     dl.map(d => d.kind).join(", ") || "(none)");
  ok("every deadline lands on a square the calendar drew",
     dl.every(d => Engine.sittingOfDate(CONTENT, d.date) === d.sitting));
  ok("and carries how far away it is, in sittings",
     dl.every(d => d.away === d.sitting - st.sitting));

  /* An undertaking with a due date has to appear, or the calendar is
     decoration rather than the instrument. */
  const u = Engine.newGame(CONTENT);
  Engine.apply(u, CONTENT, [{ undertake: { id: "cal_probe", text: "A test promise", by: 4 } }]);
  const owed = Engine.deadlines(u, CONTENT).filter(d => d.kind === "owed");
  ok("a promise with a date is on the calendar", owed.length === 1,
     owed.length ? owed[0].text + " on " + owed[0].date : "not shown");

  /* `by: null` means "before the House rises", so it must land on the
     last sitting of the session rather than nowhere. */
  const v = Engine.newGame(CONTENT);
  Engine.apply(v, CONTENT, [{ undertake: { id: "cal_open", text: "Before we rise", by: null } }]);
  const open = Engine.deadlines(v, CONTENT).filter(d => d.kind === "owed");
  ok("and one owed before the House rises lands on the last sitting",
     open.length === 1 && open[0].sitting === v.sessionEnds,
     open.length ? "sitting " + open[0].sitting + " of " + v.sessionEnds : "not shown");

  /* A PRAYER WINDOW IS A DEADLINE — an order stands unless the House prays
     against it before the window closes, and that date lived in the state
     and nowhere the player could see it. */
  const w = Engine.newGame(CONTENT);
  Engine.makeInstrument(w, CONTENT, CONTENT.instruments[0].id);
  const pr = Engine.deadlines(w, CONTENT).filter(d => d.kind === "prayer");
  ok("a prayer window is on the calendar", pr.length === 1,
     pr.length ? pr[0].text + " by " + pr[0].date : "not shown");

  /* SOMETHING SET IN MOTION IS COMING BACK, and content decides whether the
     player can see it coming. An ambush must stay an ambush. */
  const q = Engine.newGame(CONTENT);
  const anyEvent = CONTENT.events[0];
  Engine.apply(q, CONTENT, [{ queue: { event: anyEvent.id, after: 5 } }]);
  const seen = Engine.deadlines(q, CONTENT).filter(d => d.kind === "expected");
  ok("a queued event with no label stays a surprise",
     !anyEvent.foreseen ? seen.length === 0 : true,
     anyEvent.foreseen ? "(this event is foreseeable, so it shows)" : "nothing announced");

  /* Marks on one day must all survive, or the calendar under-reports. */
  const m = Engine.newGame(CONTENT);
  const day = m.sitting + 3;
  Engine.apply(m, CONTENT, [{ undertake: { id: "a", text: "First promise", by: 3 } },
                            { undertake: { id: "b", text: "Second promise", by: 3 } }]);
  const both = Engine.deadlines(m, CONTENT).filter(d => d.sitting === day);
  ok("two things due the same day are two entries, not one",
     both.length === 2, both.map(x => x.text).join(" + "));

  if (bad) { console.log("\n" + bad + " CALENDAR FAILURES"); process.exitCode = 1; }
})();


/* ---------------------------------------------------------------------
   THE ORDER OF THE DAY.

   The distinction this whole feature turns on: it reports what is ASKED
   of the player, not what is AVAILABLE to them. Six bills can advance on
   day one and on day forty, so a tab marked for that is marked forever,
   and a mark that never clears teaches a player to stop reading it.
   --------------------------------------------------------------------- */
console.log("\nTHE ORDER OF THE DAY:");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  const st = Engine.newGame(CONTENT);
  const t0 = Engine.today(st, CONTENT, true);

  ok("the House's business comes first and is the only duty",
     t0.items[0].kind === "decision" && t0.required === 1,
     t0.items.map(i => i.kind).join(", "));
  ok("every item says where it is answered",
     t0.items.every(i => ["sit", "gov", "pap", "orb"].indexOf(i.tab) >= 0));

  /* OPPORTUNITIES ARE NOT OBLIGATIONS, and this is the assertion that
     keeps the feature honest. Plenty is available on day one. */
  const advanceable = CONTENT.bills.filter(b =>
    Engine.grantSlot(JSON.parse(Engine.save(st)), CONTENT, b.id).ok !== false).length;
  const makeable = CONTENT.instruments.filter(i =>
    Engine.canMake(st, CONTENT, i.id).ok).length;
  ok("what is merely available is not listed as business",
     advanceable > 3 && makeable > 3 && t0.items.length < 4,
     advanceable + " bills and " + makeable + " orders available, " +
     t0.items.length + " things asked");

  /* AND EVERY ITEM CLEARS. Fill the vacancy and it must leave the list. */
  const before = Engine.today(st, CONTENT, false).items.filter(i => i.kind === "vacancy");
  ok("a vacant ministry is asked about", before.length === 1, before[0] && before[0].text);
  const v = Engine.vacancies(st, CONTENT)[0];
  Engine.fillPost(st, CONTENT, v, 0);
  ok("and stops being asked about once it is filled",
     Engine.today(st, CONTENT, false).items.filter(i => i.kind === "vacancy").length === 0);

  /* The tab strip reads the same source, so a mark cannot disagree with
     the list that produced it. */
  const t1 = Engine.today(st, CONTENT, true);
  ok("the tabs named are exactly the tabs the items live on",
     t1.tabs.slice().sort().join(",") ===
     [...new Set(t1.items.map(i => i.tab))].sort().join(","),
     t1.tabs.join(", "));

  /* Something overdue must read as overdue, not merely as soon. */
  const o = Engine.newGame(CONTENT);
  Engine.apply(o, CONTENT, [{ undertake: { id: "late", text: "A promise", by: 1 } }]);
  Engine.advance(o, CONTENT);
  Engine.advance(o, CONTENT);
  const owed = Engine.today(o, CONTENT, false).items.filter(i => i.kind === "owed");
  ok("a promise past its day reads as overdue",
     owed.length === 0 || owed[0].when === "overdue",
     owed.length ? owed[0].when + " by " + owed[0].away : "(settled already, which is also correct)");

  /* THE LIST MUST NOT BECOME WALLPAPER. The session end is on the
     calendar all session; it is only business when it is close. */
  const f = Engine.newGame(CONTENT);
  ok("the rise is not business twenty sittings out",
     Engine.today(f, CONTENT, false).items.every(i => i.kind !== "rises"),
     "sessionEnds " + f.sessionEnds + " at sitting " + f.sitting);
  while (f.sitting < f.sessionEnds - 1) Engine.advance(f, CONTENT);
  ok("and is business when it is next week",
     Engine.today(f, CONTENT, false).items.some(i => i.kind === "rises"),
     "at sitting " + f.sitting + " of " + f.sessionEnds);

  if (bad) { console.log("\n" + bad + " ORDER-OF-DAY FAILURES"); process.exitCode = 1; }
})();


/* =============================================================
   A DEFERRED FACT, NOT ONLY A DEFERRED STORY.

   st.queue held {eventId, dueSitting} and nothing else, so anything the
   game wanted to happen LATER had to happen as an authored event: a
   court could not return a verdict, a dispatch could not arrive, a
   commission could not report, without prose written first. That is the
   one thing standing between building the engine and writing content
   afterwards rather than the other way round.
   ============================================================= */
console.log("\nA DEFERRED FACT (the queue carries effects):");
(function(){
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };
  const m = Engine.newGame(CONTENT);
  const before = m.scalars.treasury;
  Engine.apply(m, CONTENT, [{ queue: { after: 3, label: "The commission reports",
                                       effects: [{ move: { treasury: -7 } }] } }]);
  ok("a fact can be put in the queue with no event attached",
     m.queue.length === 1 && !m.queue[0].eventId && !!m.queue[0].effects);
  ok("and it has not happened yet", m.scalars.treasury === before);

  /* It is on the calendar, because it is labelled — a commission is a
     thing the government knows is coming. */
  const dl = Engine.deadlines(m, CONTENT).filter(d => /commission reports/i.test(d.text || ""));
  ok("a labelled fact is on the calendar before it lands", dl.length === 1,
     dl.length + " entries");

  Engine.advance(m, CONTENT);
  ok("and does not land early", m.scalars.treasury === before, "sitting " + m.sitting);
  Engine.advance(m, CONTENT); Engine.advance(m, CONTENT);
  ok("it lands on its day", m.scalars.treasury === before - 7,
     before + " -> " + m.scalars.treasury);
  ok("and leaves the queue", m.queue.filter(q => q.effects).length === 0);
  ok("and says so in the record",
     m.log.some(l => /commission reports/i.test(l.text)));

  /* An unlabelled one is nobody's business until it happens. */
  const n = Engine.newGame(CONTENT);
  Engine.apply(n, CONTENT, [{ queue: { after: 2, effects: [{ move: { treasury: -1 } }] } }]);
  ok("an unlabelled fact is on no calendar",
     Engine.deadlines(n, CONTENT).filter(d => d.kind === "expected").length === 0);

  /* An event entry still behaves exactly as it did. */
  const e0 = CONTENT.events[0];
  const q = Engine.newGame(CONTENT);
  Engine.apply(q, CONTENT, [{ queue: { event: e0.id, after: 0 } }]);
  ok("and a queued EVENT is still a story, not a fact",
     Engine.nextEvent(q, CONTENT) === e0);
  if (bad) { console.log("\n" + bad + " DEFERRED-FACT FAILURES"); process.exitCode = 1; }
})();

/* =============================================================
   THE GAME CAN BE WON.

   Bible 3.5.1: four settlements, each a reachable configuration of the
   existing state object. The engine adds a READER and never a branch,
   so this drives the four from constructed states rather than from
   anything the engine knows about them.
   ============================================================= */
console.log("\nTHE THREE-WAY COUNT (aye, nay, abstain):");
(function(){
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };
  const st2 = Engine.newGame(CONTENT);
  const d = Engine.division(st2, CONTENT, "divergence");

  /* resolveStance() collapsed `against` and `abstain` to the same nought,
     which is arithmetically right and politically blind: a party that
     abstained is one you might move next time and a party that voted
     against is not, and the count could not tell you which. */
  ok("every bench accounts for all of its seats",
     d.popular.aye + d.popular.nay + d.popular.abstain === d.popular.total,
     d.popular.aye + "+" + d.popular.nay + "+" + d.popular.abstain +
     " of " + d.popular.total);
  ok("and so does the functional bench",
     d.functional.aye + d.functional.nay + d.functional.abstain === d.functional.total);
  ok("each party row does too",
     d.rows.every(r => r.popularAye + r.popularNay + r.popularAbstain === r.popularSeats),
     d.rows.filter(r => r.popularAye + r.popularNay + r.popularAbstain !== r.popularSeats)
           .map(r => r.party).join(",") || "all");
  ok("a party that is against reads as nay, not as absent",
     d.rows.some(r => r.popularKind === "against" && r.popularNay > 0));

  /* THE THRESHOLD IS UNCHANGED, and deliberately. A majority here is a
     majority OF THE MEMBERS — §4.6.1's 21 of 40 is floor(40/2)+1 — so an
     abstention still costs the government what a nay costs it. Staying
     out of the lobby defeats a measure without being seen to, which is a
     real parliamentary form under an absolute-majority rule. */
  ok("the bar is a majority of the members, not of those voting",
     d.popular.need === Math.floor(d.popular.total / 2) + 1 &&
     d.functional.need === Math.floor(d.functional.total / 2) + 1,
     d.popular.need + " of " + d.popular.total);

  /* An authored abstention shows as one. */
  const bill = JSON.parse(JSON.stringify(CONTENT.billById.divergence));
  const victim = d.rows.find(r => r.popularKind === "against" && r.popularSeats > 0);
  bill.stances[victim.party] = "abstain";
  const C2 = Object.assign({}, CONTENT,
    { billById: Object.assign({}, CONTENT.billById, { divergence: bill }) });
  const d2 = Engine.division(st2, C2, "divergence");
  const row2 = d2.rows.find(r => r.party === victim.party);
  ok("a party told to abstain abstains whole",
     row2.popularAbstain === row2.popularSeats && row2.popularNay === 0,
     victim.party + ": " + row2.popularAbstain + " of " + row2.popularSeats);
  ok("and it does not become an aye",
     d2.popular.aye === d.popular.aye, d.popular.aye + " -> " + d2.popular.aye);
  ok("so abstaining costs the government exactly what opposing cost it",
     d2.popular.carries === d.popular.carries);

  /* And the estimate must not disagree with its own breakdown. */
  const rep = Engine.reported(st2, CONTENT, "divergence");
  ok("the reported count accounts for every seat too",
     rep.popular.aye + rep.popular.nay + rep.popular.abstain === rep.popular.total,
     rep.popular.aye + "+" + rep.popular.nay + "+" + rep.popular.abstain);
  ok("and its rows sum to its own benches, not to the true ones",
     rep.rows.reduce((n, r) => n + r.popularAye, 0) === rep.popular.aye);

  if (bad) { console.log("\n" + bad + " COUNT FAILURES"); process.exitCode = 1; }
})();

console.log("\nPAIRING (a courtesy the arithmetic does not support):");
(function(){
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };
  const st3 = Engine.newGame(CONTENT);
  const before = Engine.division(st3, CONTENT, "divergence");
  const foe = before.rows.find(r => r.party !== st3.playerParty && r.popularNay > 5);

  const cap = Engine.pairable(st3, CONTENT, "divergence", foe.party);
  ok("a pair needs a member of theirs voting against", cap.max > 0,
     cap.max + " available with " + foe.party);
  ok("and it cannot be made with yourself",
     Engine.pairable(st3, CONTENT, "divergence", st3.playerParty).max === 0);

  Engine.setPairs(st3, CONTENT, "divergence", foe.party, 6);
  const after = Engine.division(st3, CONTENT, "divergence");

  /* THE WHOLE POINT. At Westminster a pair is neutral because a majority
     is of those VOTING. Here it is a majority of the MEMBERS, so the
     opposition gives up a nay the threshold never counted and the
     government gives up an aye it did. The courtesy is asymmetric and it
     runs against whoever is in office. */
  ok("six pairs cost the government six ayes",
     after.popular.aye === before.popular.aye - 6,
     before.popular.aye + " -> " + after.popular.aye);
  ok("and the bar does not move an inch",
     after.popular.need === before.popular.need, "need " + after.popular.need);
  ok("so the margin narrows and nothing is given back",
     (after.popular.aye - after.popular.need) ===
     (before.popular.aye - before.popular.need) - 6,
     "margin " + (before.popular.aye - before.popular.need) +
     " -> " + (after.popular.aye - after.popular.need));

  const me = after.rows.find(r => r.party === st3.playerParty);
  const them = after.rows.find(r => r.party === foe.party);
  ok("a paired member is absent, not aye and not nay",
     me.popularAbsent === 6 && them.popularAbsent === 6);
  ok("and every seat is still accounted for on both sides",
     me.popularAye + me.popularNay + me.popularAbstain + me.popularAbsent === me.popularSeats &&
     them.popularAye + them.popularNay + them.popularAbstain + them.popularAbsent === them.popularSeats);
  ok("the bench totals account for the absences too",
     after.popular.aye + after.popular.nay + after.popular.abstain +
     after.popular.absent === after.popular.total,
     after.popular.aye + "+" + after.popular.nay + "+" +
     after.popular.abstain + "+" + after.popular.absent);

  /* A plan cannot be made bigger than either side can honour, and asking
     for the ceiling twice must not shrink it — pairable() reads the count
     with this bill's own pairs taken out for exactly that reason. */
  Engine.setPairs(st3, CONTENT, "divergence", foe.party, 999);
  ok("a plan is capped at what both sides can honour",
     st3.pairs.divergence[foe.party] === cap.max,
     st3.pairs.divergence[foe.party] + " of " + cap.max);
  ok("and the ceiling does not shrink as it is spent",
     Engine.pairable(st3, CONTENT, "divergence", foe.party).max === cap.max);

  Engine.clearPairs(st3, "divergence");
  ok("clearing a plan puts the ayes back",
     Engine.division(st3, CONTENT, "divergence").popular.aye === before.popular.aye);

  /* A save written before pairing existed still loads. */
  const old = JSON.parse(Engine.save(Engine.newGame(CONTENT)));
  delete old.pairs; old.version = 11;
  const back = Engine.load(JSON.stringify(old), CONTENT);
  ok("a save from before pairing gets an empty plan",
     back.pairs && Object.keys(back.pairs).length === 0 &&
     back.version === Engine.STATE_VERSION, "v" + back.version);

  if (bad) { console.log("\n" + bad + " PAIRING FAILURES"); process.exitCode = 1; }
})();

console.log("\nTHE SETTLEMENTS (3.5.1):");
(function(){
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };
  const fresh = () => Engine.newGame(CONTENT);
  ok("content carries four settlements", (CONTENT.settlements || []).length === 4,
     (CONTENT.settlements || []).length + " settlements");
  ok("and every one is a when block, not a branch",
     CONTENT.settlements.every(s0 => s0.when && typeof s0.when === "object"));

  /* A SETTLEMENT IS NOT A THING YOU INHERIT. The first draft of the
     restriction block was "the threshold is above 167", which the
     opening state satisfies — 168 is where the game starts — so the
     Commonwealth had settled before the first sitting by doing nothing.
     This is the assertion that caught it, and it is the general rule:
     no configuration the player was handed is an ending. */
  const open0 = fresh();
  ok("an opening state has settled nothing", Engine.checkSettlement(open0, CONTENT) === null,
     JSON.stringify(Engine.checkSettlement(open0, CONTENT)));
  ok("and no single settlement is true at the opening",
     CONTENT.settlements.every(s0 => !Engine.matches(open0, s0.when)),
     CONTENT.settlements.filter(s0 => Engine.matches(open0, s0.when)).map(s0 => s0.id).join(", "));

  /* Restriction: the threshold stands, and the reform was put and lost. */
  const r = fresh(); r.law.divergence_threshold_hours = 200;
  r.bills.divergence.stage = "defeated"; r.bills.divergence.dead = true;
  ok("a threshold left high is the restriction settlement",
     (Engine.checkSettlement(r, CONTENT) || {}).id === "restriction",
     (Engine.checkSettlement(r, CONTENT) || {}).id);

  /* Substrate neutrality: the Act carried AND the threshold still low.

     THE FLOOR. A settlement is carried, not reached. Driving the engine
     headless through four play policies found this one firing at sitting
     7 — about five minutes — because its `when` asked only that the
     number be low, and an event effect can move the number. So the first
     assertion here is the negative one: the number alone is not an
     ending, and the mirror of restriction is required. */
  const nudged = fresh(); nudged.law.divergence_threshold_hours = 24;
  ok("a threshold nudged low without an Act settles nothing",
     Engine.checkSettlement(nudged, CONTENT) === null,
     (Engine.checkSettlement(nudged, CONTENT) || {}).id);

  const sn = fresh(); sn.law.divergence_threshold_hours = 24;
  sn.bills.divergence.stage = "assented"; sn.bills.divergence.dead = true;
  ok("a threshold brought low by a carried Act is substrate neutrality",
     (Engine.checkSettlement(sn, CONTENT) || {}).id === "substrate_neutrality",
     (Engine.checkSettlement(sn, CONTENT) || {}).id);

  /* And repealed back up is not this settlement either, which is why the
     number is kept in the `when` beside the Act rather than replaced. */
  const repealed = fresh();
  repealed.bills.divergence.stage = "assented"; repealed.bills.divergence.dead = true;
  repealed.law.divergence_threshold_hours = 120;
  ok("an Act carried and then undone is not a settlement",
     Engine.checkSettlement(repealed, CONTENT) === null,
     (Engine.checkSettlement(repealed, CONTENT) || {}).id);

  /* Two of the four endings hang on a flag that NO CONTENT SETS. That is
     opencode's T6 and not an engine fault, but it is asserted here so the
     day it stops being true is a day the build tells somebody. Flip these
     to the positive form when the content lands. */
  const setsFlag = (f0) => JSON.stringify(CONTENT.events || []).indexOf(f0) >= 0;
  ok("KNOWN GAP: no event establishes a tribunal (opencode T6)",
     !setsFlag("tribunal_established"));
  ok("KNOWN GAP: no event lays a federal schedule (opencode T6)",
     !setsFlag("federal_schedule"));

  /* Graduated personhood beats either: a tribunal takes the number out
     of law, so the threshold stops deciding anything. */
  const g = fresh(); g.law.divergence_threshold_hours = 200;
  g.bills.divergence.stage = "defeated"; g.bills.divergence.dead = true;
  g.flags.tribunal_established = true;
  ok("a tribunal outranks whatever the threshold says",
     (Engine.checkSettlement(g, CONTENT) || {}).id === "graduated_personhood",
     (Engine.checkSettlement(g, CONTENT) || {}).id);

  /* The federal fudge is compatible with almost anything, so it is read
     last and only wins when nothing sharper is true. */
  const f = fresh(); f.flags.federal_schedule = true;
  ok("the federal settlement is the one that is read last",
     (Engine.checkSettlement(f, CONTENT) || {}).id === "federal_fudge",
     (Engine.checkSettlement(f, CONTENT) || {}).id);

  /* Rule 3: closure and dissolution are failure modes, not settlements. */
  const lost = fresh(); lost.law.divergence_threshold_hours = 200;
  lost.bills.divergence.stage = "defeated"; lost.bills.divergence.dead = true;
  lost.scalars.thermal_margin = 0;
  ok("a government that has fallen has settled nothing",
     Engine.checkLoss(lost, CONTENT).lost && Engine.checkSettlement(lost, CONTENT) === null);

  /* Rule 2: the list is never shown. Nothing may report progress toward
     a settlement, because an ending named in advance is a quest marker. */
  ok("and the engine offers no way to ask which one you are near",
     typeof Engine.settlementProgress === "undefined" &&
     typeof Engine.settlements === "undefined");
  if (bad) { console.log("\n" + bad + " SETTLEMENT FAILURES"); process.exitCode = 1; }
})();

/* ---------------------------------------------------------------------
   INITIATIVE, AND THE CLOCK THE PLAYER WINDS.

   An authored deadline is orchestration and the player can feel the hand
   that set it. A deadline the player set is the same pressure and reads
   as agency. So the assertions here are less about the verb working than
   about WHO CHOSE THE TIMING.
   --------------------------------------------------------------------- */
console.log("\nINITIATIVE:");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  const INI = CONTENT.initiatives || [];
  ok("the government has things it can start", INI.length >= 3, INI.length + " initiatives");

  /* TEMPO IS THE DECISION. An initiative whose tempos differ only in
     speed is a difficulty setting; they have to buy different things. */
  ok("every initiative offers more than one way of doing it",
     INI.every(i => (i.tempo || []).length >= 2));
  const sameEffects = INI.filter(i => {
    const e = (i.tempo || []).map(t => JSON.stringify(t.effects || null));
    return new Set(e).size < e.length;
  });
  ok("and the ways differ in more than speed", sameEffects.length === 0,
     sameEffects.map(i => i.id).join(", ") || "each tempo buys something different");
  ok("a slower way always answers later",
     INI.every(i => i.tempo.every((t, n) => n === 0 || t.after >= i.tempo[n - 1].after)));

  const st = Engine.newGame(CONTENT);
  const before = st.slots.total - st.slots.used;

  /* IT COSTS THE SAME TIME A BILL WANTS. That is what makes it a choice
     rather than a free button, and it is what finally makes 7.7 true. */
  const r = Engine.take(st, CONTENT, INI[0].id, 0);
  ok("taking one spends order-paper time", r.ok && st.slots.used > 0,
     before + " slots -> " + (st.slots.total - st.slots.used));

  /* THE PLAYER CHOSE WHEN THE ANSWER COMES. */
  const q = st.queue[st.queue.length - 1];
  ok("and queues an answer at the tempo she picked",
     !!q && q.dueSitting === st.sitting + INI[0].tempo[0].after,
     q ? "due sitting " + q.dueSitting : "nothing queued");
  const slow = Engine.newGame(CONTENT);
  Engine.take(slow, CONTENT, INI[0].id, 1);
  ok("a different way answers on a different day",
     slow.queue[slow.queue.length - 1].dueSitting !== q.dueSitting,
     "sitting " + q.dueSitting + " against " + slow.queue[slow.queue.length - 1].dueSitting);

  /* AND IT SOLVES PRE-EMPTION BY THE SAME ACT. The story must stop
     offering what she has already done. */
  ok("what she has started is not offered again",
     Engine.initiatives(st, CONTENT).find(x => x.id === INI[0].id).ok === false);
  ok("and a power she cannot afford is still shown, with the reason",
     Engine.initiatives(st, CONTENT).every(x => x.ok || (x.reason || "").length > 0));

  /* TIME RUNS OUT. Six slots a session against a legislative programme
     means she cannot do everything, which is the whole of 7.7. */
  const e = Engine.newGame(CONTENT);
  let taken = 0;
  (CONTENT.initiatives || []).forEach(i => { if (Engine.take(e, CONTENT, i.id, 1).ok) taken++; });
  ok("she cannot take everything in one session",
     taken < INI.length || e.slots.used >= e.slots.total,
     taken + " of " + INI.length + " taken, " + e.slots.used + "/" + e.slots.total + " slots spent");

  /* THE DIVISION DAY IS HERS. It was st.sitting + 2, an engine constant
     that nobody chose and the player could not move. */
  const d = Engine.newGame(CONTENT);
  const bill = CONTENT.bills.find(b => Engine.canDivide(d, CONTENT, b.id).ok &&
                                       d.bills[b.id].stage !== "drafting");
  if (bill) {
    const set = Engine.setDivision(d, CONTENT, bill.id, d.sitting + 6);
    ok("the government names the day a bill is put to the House",
       set.ok && d.bills[bill.id].dividesOn === d.sitting + 6,
       set.ok ? "set down for sitting " + set.on : set.reason);
    ok("but not before the House next sits",
       Engine.setDivision(d, CONTENT, bill.id, d.sitting).ok === false);
    ok("and a bill still in drafting cannot be set down at all",
       CONTENT.bills.filter(b => d.bills[b.id].stage === "drafting")
         .every(b => Engine.setDivision(d, CONTENT, b.id, d.sitting + 3).ok === false));
    ok("and not after it has risen",
       Engine.setDivision(d, CONTENT, bill.id, d.sessionEnds + 1).ok === false);
    ok("and the day she named is on the calendar",
       Engine.deadlines(d, CONTENT).some(x => x.kind === "division" &&
                                              x.sitting === d.sitting + 6));
  } else ok("a bill is available to set down", false, "none dividable at open");

  if (bad) { console.log("\n" + bad + " INITIATIVE FAILURES"); process.exitCode = 1; }
})();
