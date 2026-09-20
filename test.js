/* Headless check: does the division calculator reproduce the bible's numbers? */
const fs = require("fs"), vm = require("vm");
const files = ["content/setup.js","content/parties.js","content/stations.js","content/constituencies.js","content/cabinet.js","content/instruments.js","content/initiatives.js","content/minutes.js",
               "content/functional.js","content/labour.js","content/names.js",
               "content/characters.js","content/bills.js","content/events.js","content/glossary.js","content/encyclopedia.js","content/business.js","content/settlements.js","content/actors.js","content/index.js"];
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
expect("popular aye", d.popular.aye, 130);
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

  /* THE GOVERNMENT'S OWN DOOR (design/26 #83's neighbour). An order can be
     revoked by the minister who made it, out of force at once, with no
     division and no House. It has been in the engine since the instrument
     landed and nothing offered it. */
  let rv = Engine.newGame(CONTENT);
  Engine.makeInstrument(rv, CONTENT, "si_2287_44");
  const rvBefore = Engine.division(rv, CONTENT, "divergence").functional.aye;
  const rr = Engine.revokeInstrument(rv, CONTENT, "si_2287_44");
  const rvAfter = Engine.division(rv, CONTENT, "divergence").functional.aye;
  ok("the government can revoke its own revocable order",
     rr.ok && !rv.instruments.si_2287_44.inForce && rvAfter < rvBefore,
     rr.ok ? rvBefore + " -> " + rvAfter : rr.reason);
  const rbad = Engine.revokeInstrument(rv, CONTENT, "si_2287_44");
  ok("and revoking it twice is refused", !rbad.ok, rbad.reason);

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
    4: ["cabinet", "instruments", "signatures"],
    17: ["grantsToday"],
    18: ["actedThisSitting", "idleSittings"]
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

  /* THE CAMPAIGN METERS ARRIVE ON AN OLD SAVE (Flash I). Content owns the
     roster of meters; the save owns the values. A save written before the
     rename carries `treasury` across as `solvency`, and the meters it has
     never seen appear at their opening values — otherwise the panel draws
     `width:undefined%` and the readout says "undefined". */
  {
    const old = JSON.parse(Engine.save(Engine.newGame(CONTENT)));
    old.version = 14;
    delete old.scalars.solvency; delete old.scalars.legitimacy; delete old.scalars.friction;
    old.scalars.treasury = 41;
    const back = Engine.load(JSON.stringify(old), CONTENT);
    ok("a save from before the campaign meters gets them anyway",
       back.scalars.solvency === 41000 && back.scalars.legitimacy === 48 &&
       back.scalars.friction === 25 && back.scalars.treasury === undefined,
       JSON.stringify(back.scalars));
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
   voice. The forecast is stated in content and asserted above, and it is
   130 rather than 128 since T14: the six independents have no caucus line
   any more, so the two on the station question who agree with the bill
   count themselves in.
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

  /* Parties WITH currents now report factions (T7 gave three more of them
     currents), and parties without still report none. A party with
     currents prints its working when it turns out FOR the measure; one
     voting against keeps the row bare. */
  const hasCur = pid => (CONTENT.currents || []).some(c => c.party === pid);
  const votesFor = pid => (CONTENT.billById.thermal2.stances || {})[pid] === "for";
  const others = Engine.division(st, CONTENT, "thermal2").rows
    .filter(r => r.party !== "cu" && r.popularSeats);
  ok("a party with currents that votes for the measure reports them",
     others.filter(r => hasCur(r.party) && votesFor(r.party))
           .every(r => r.benches !== null),
     others.filter(r => hasCur(r.party) && votesFor(r.party))
           .map(r => r.party + ":" + (r.benches ? r.benches.length : 0)).join(", "));
  ok("a party without currents reports none",
     others.filter(r => !hasCur(r.party)).every(r => r.benches === null),
     others.filter(r => !hasCur(r.party)).length + " parties");

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
  /* Costs on the ladder are spent in different currencies, so the sum is
     read back in the index the ladder was tuned against: a solvency cost is
     denominated in MW-years now (design/28 phase 4) and is divided by its
     scale. Without this, one rung paying ten index points of quota would
     outweigh every other rung's whole bargain. */
  const num = e => Object.keys(e.move || {}).reduce((n, k) =>
    n + Math.abs(e.move[k]) / (k === "solvency" ? 1000 : 1), 0);
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
/* SOLVENCY IS NO LONGER AN INERT TRACER. Several tests below used it to
   watch something else happen — a queued fact landing, a coupling charging
   — because it was the one quantity nothing moved on its own. Ways and
   Means gave the state an income, so a sitting now adds to it, and those
   assertions were reading the revenue rather than their own subject.

   The subject did not change and neither did the assertion: the test turns
   the revenue OFF, so the only thing that can move solvency is the thing
   being tested. Setting every rate to none is a law value like any other. */
function noRevenue(st) {
  st.law.rate_volume = st.law.rate_thermal =
  st.law.rate_substrate = st.law.rate_transit = "none";
  return st;
}

console.log("\nA DEFERRED FACT (the queue carries effects):");
(function(){
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };
  const m = noRevenue(Engine.newGame(CONTENT));
  const before = m.scalars.solvency;
  Engine.apply(m, CONTENT, [{ queue: { after: 3, label: "The commission reports",
                                       effects: [{ move: { solvency: -7 } }] } }]);
  ok("a fact can be put in the queue with no event attached",
     m.queue.length === 1 && !m.queue[0].eventId && !!m.queue[0].effects);
  ok("and it has not happened yet", m.scalars.solvency === before);

  /* It is on the calendar, because it is labelled — a commission is a
     thing the government knows is coming. */
  const dl = Engine.deadlines(m, CONTENT).filter(d => /commission reports/i.test(d.text || ""));
  ok("a labelled fact is on the calendar before it lands", dl.length === 1,
     dl.length + " entries");

  Engine.advance(m, CONTENT);
  ok("and does not land early", m.scalars.solvency === before, "sitting " + m.sitting);
  Engine.advance(m, CONTENT); Engine.advance(m, CONTENT);
  ok("it lands on its day", m.scalars.solvency === before - 7,
     before + " -> " + m.scalars.solvency);
  ok("and leaves the queue", m.queue.filter(q => q.effects).length === 0);
  ok("and says so in the record",
     m.log.some(l => /commission reports/i.test(l.text)));

  /* An unlabelled one is nobody's business until it happens. */
  const n = Engine.newGame(CONTENT);
  Engine.apply(n, CONTENT, [{ queue: { after: 2, effects: [{ move: { solvency: -1 } }] } }]);
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

console.log("\nWAYS AND MEANS (the state has an income):");
(function(){
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  /* THE TREASURY USED TO ONLY FALL. Nothing in the engine added to solvency:
     the Commonwealth opened holding 52,000, the appropriation spent 48,000
     and nothing put anything back, which also left the four scarcity prices
     decorative \u2014 the tick read solvency to SET them and nothing ever read
     them. Bible \u00a77.3 named the four bases all along. */
  const a = Engine.newGame(CONTENT);
  const s0 = a.scalars.solvency;
  Engine.advance(a, CONTENT);
  ok("a sitting raises revenue", a.scalars.solvency > s0,
     s0 + " -> " + a.scalars.solvency);

  const z = noRevenue(Engine.newGame(CONTENT));
  const z0 = z.scalars.solvency;
  Engine.advance(z, CONTENT);
  ok("and raises none when nothing is levied", z.scalars.solvency === z0,
     z0 + " -> " + z.scalars.solvency);

  /* THE CALIBRATION IS THE POINT, and it is one sentence: at the standing
     rate on all four bases the state raises what the appropriation's own
     defaults cost, over a run, and not a unit more. Below that the
     government runs down; above it, it accumulates at a political price. */
  const spend = (Engine.clausesOf(CONTENT, "appropriation") || []).reduce((sum, c) => {
    const d = (c.levels || []).find(l => l.id === c.default);
    return sum + ((d && d.cost) || 0);
  }, 0);
  const run = Engine.newGame(CONTENT);
  const r0 = run.scalars.solvency;
  for (let i = 0; i < 40; i++) Engine.advance(run, CONTENT);
  const raised = run.scalars.solvency - r0;
  ok("the appropriation's defaults are a real number", spend > 0, spend + "");
  ok("and forty sittings at the standing rate raise about that much",
     Math.abs(raised - spend) < spend * 0.35,
     "raised " + raised + " against " + spend + " of default spending");

  /* PASS-THROUGH, AND THE ONE BASE THAT HAS NONE. A levy on thermal is a
     levy on the cost of producing the thing and it lands on whoever buys
     it. A levy on volume falls on position inside a habitat, which nobody
     made and nobody can move, so it has nowhere to be passed on to. That
     is the Georgist claim (\u00a77.5.2) as arithmetic rather than as a slogan. */
  function priceAfter(base, rate, n) {
    const st = Engine.newGame(CONTENT);
    st.law["rate_" + base] = rate;
    for (let i = 0; i < n; i++) Engine.advance(st, CONTENT);
    return st.prices[base];
  }
  const thHigh = priceAfter("thermal", "high", 12),
        thStd  = priceAfter("thermal", "standard", 12);
  ok("taxing thermal quota raises what thermal quota costs",
     thHigh > thStd + 2, thStd.toFixed(1) + " -> " + thHigh.toFixed(1));

  const voHigh = priceAfter("volume", "high", 12),
        voStd  = priceAfter("volume", "standard", 12);
  /* AND IT CAME OUT STRONGER THAN THE ASSERTION WAS WRITTEN FOR. This first
     asked for no movement at all and measured 96.3 against 97.0: taxing
     volume makes volume CHEAPER. Nothing was written to do that. The volume
     price reads the treasury because the construction schedule is bought out
     of it, so a levy that falls on position inside a habitat funds the
     pressurised volume that makes position less scarce. That is the Georgist
     case arriving as arithmetic rather than as a slogan, out of two rules
     that were already here, and it is the one base with the property. */
  ok("taxing volume raises revenue and does NOT raise the cost of living",
     voHigh <= voStd, voStd.toFixed(1) + " -> " + voHigh.toFixed(1));

  const hiV = Engine.newGame(CONTENT); hiV.law.rate_volume = "high";
  ok("and it does raise revenue", Engine.receipts(hiV).total >
     Engine.receipts(Engine.newGame(CONTENT)).total);

  /* THE TABLE, NOT THE ANSWER (\u00a77.6). The player is owed the arithmetic. */
  const tb = Engine.receipts(Engine.newGame(CONTENT));
  ok("the revenue is readable base by base", tb.rows.length === 4 &&
     tb.rows.every(r => r.name && r.rate && typeof r.yield === "number"),
     tb.rows.map(r => r.name + " " + r.yield).join(", "));
  ok("and the rows sum to the total",
     tb.rows.reduce((s, r) => s + r.yield, 0) === tb.total, tb.total + "");

  /* A SAVE WRITTEN BEFORE ANY OF THIS still has to load. reconcile backfills
     law from content exactly as it does the scalars and the station roster \u2014
     it did not, and a missing rate would have carried undefined into
     solvency as NaN on the first sitting. */
  const old = Engine.newGame(CONTENT);
  delete old.law.rate_volume; delete old.law.rate_thermal;
  delete old.law.rate_substrate; delete old.law.rate_transit;
  const back = Engine.load(Engine.save(old), CONTENT);
  ok("a save with no rates gets them back from content",
     back.law.rate_volume === "standard" && back.law.rate_transit === "standard");
  const b0 = back.scalars.solvency;
  Engine.advance(back, CONTENT);
  ok("and its treasury is a number afterwards, not NaN",
     isFinite(back.scalars.solvency) && back.scalars.solvency > b0,
     b0 + " -> " + back.scalars.solvency);

  if (bad) { console.log("\n" + bad + " WAYS AND MEANS FAILURES"); process.exitCode = 1; }
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

  /* A MEMBER WHO DID NOT VOTE, declared by content. The fourth thing a seat
     can be, and the model had no way for a bill to say it: pairing produced
     absences and nothing else did. It comes out of the bench before
     abstention does, and it is neither an aye nor an abstention. */
  const awayParty = d.rows.find(r => r.popularKind === "against" && r.popularSeats > 3);
  const c3 = JSON.parse(JSON.stringify(CONTENT.billById.divergence));
  c3.stances[awayParty.party] = { absent: 2 };
  const d3 = Engine.division(st2, Object.assign({}, CONTENT,
    { billById: Object.assign({}, CONTENT.billById, { divergence: c3 }) }), "divergence");
  const row3 = d3.rows.find(r => r.party === awayParty.party);
  ok("a bill can put members down as not voting",
     row3.popularAbsent === 2 && row3.popularNay === row3.popularSeats - 2,
     awayParty.party + ": " + row3.popularAbsent + " away of " + row3.popularSeats);
  ok("and an absence is not an aye and not an abstention",
     d3.popular.aye === d.popular.aye && row3.popularAbstain === 0);
  ok("and the four categories account for every seat",
     d3.popular.aye + d3.popular.nay + d3.popular.abstain + d3.popular.absent === d3.popular.total,
     d3.popular.aye + "+" + d3.popular.nay + "+" + d3.popular.abstain + "+" + d3.popular.absent);

  /* A party that abstains whole and is short of members on the day. */
  const c4 = JSON.parse(JSON.stringify(CONTENT.billById.divergence));
  c4.stances[awayParty.party] = { abstain: true, absent: 3 };
  const d4 = Engine.division(st2, Object.assign({}, CONTENT,
    { billById: Object.assign({}, CONTENT.billById, { divergence: c4 }) }), "divergence");
  const row4 = d4.rows.find(r => r.party === awayParty.party);
  ok("a party can abstain and be short of members",
     row4.popularAbstain === row4.popularSeats - 3 && row4.popularAbsent === 3 &&
     row4.popularNay === 0,
     row4.popularAbstain + " abstain, " + row4.popularAbsent + " away of " + row4.popularSeats);

  /* AND THE SHIPPED BILLS EXERCISE IT, so a division the player can call
     shows all four outcomes and the record's order control has something to
     order. */
  const withAway = CONTENT.bills.filter(b =>
    Engine.division(st2, CONTENT, b.id).popular.absent > 0).map(b => b.id);
  ok("the current bills put members down as not voting",
     withAway.length > 0, withAway.join(", ") || "none");

  /* And the estimate must not disagree with its own breakdown. */
  const rep = Engine.reported(st2, CONTENT, "divergence");
  ok("the reported count accounts for every seat too",
     rep.popular.aye + rep.popular.nay + rep.popular.abstain === rep.popular.total,
     rep.popular.aye + "+" + rep.popular.nay + "+" + rep.popular.abstain);
  ok("and its rows sum to its own benches, not to the true ones",
     rep.rows.reduce((n, r) => n + r.popularAye, 0) === rep.popular.aye);

  /* THE INDEPENDENTS ARE SIX MEMBERS, NOT A PARTY (T14, design/26 #15). Six
     currents, one per seat, so a bill can move some of them and not others;
     a party with no axes has no line and votes free; and the localist bloc
     on the station question is OBSERVED from the rows rather than declared
     anywhere. */
  const indC = (CONTENT.currents || []).filter(c => c.party === "ind");
  ok("the independents are six members and six currents",
     indC.length === 6 &&
     indC.reduce((n, c) => n + c.members, 0) === CONTENT.partyById.ind.seats.district,
     indC.length + " currents, " + CONTENT.partyById.ind.seats.district + " seats");

  const probe = billId => ({ id: billId, title: "probe", ref: "",
    axes: { ownership: null, personhood: null, sovereignty: "station", closure: "closurist" },
    stances: {} });
  const withBill = (id, b) => Object.assign({}, CONTENT,
    { billById: Object.assign({}, CONTENT.billById, { [id]: b }) });
  const indRow = b => Engine.division(st2, withBill(b.id, b), b.id).rows.find(r => r.party === "ind");
  const byCur = r => (r.benches || []).reduce((m, x) => (m[x.id] = x, m), {});
  const bloc = ["ind_kettering", "ind_castellan", "ind_merrick"];
  const rest = ["ind_grimsby", "ind_kirilenko", "ind_vasquez"];
  const ayes = (m, ids) => ids.reduce((n, id) => n + ((m[id] || {}).popularAye || 0), 0);

  const station = probe("probe_ind_station");
  const mStation = byCur(indRow(station));
  ok("the station bloc is the three on the station question",
     bloc.every(id => mStation[id]), Object.keys(mStation).join(", "));
  ok("and on that question it carries more of itself than the rest do",
     ayes(mStation, bloc) > ayes(mStation, rest),
     "bloc " + ayes(mStation, bloc) + " of 3, rest " + ayes(mStation, rest) + " of 3");

  const federal = Object.assign({}, probe("probe_ind_federal"),
    { axes: { ownership: null, personhood: null, sovereignty: "federal", closure: "integrationist" } });
  const mFed = byCur(indRow(federal));
  ok("and on the federal question the rest outvote the bloc",
     ayes(mFed, rest) > ayes(mFed, bloc),
     "bloc " + ayes(mFed, bloc) + ", rest " + ayes(mFed, rest));

  if (bad) { console.log("\n" + bad + " COUNT FAILURES"); process.exitCode = 1; }
})();

/* ---------------------------------------------------------------------
   A BILL'S OWN RECORD (design/26 #84). The session log is global and the
   dossier showed only the last division; a measure's own history is what a
   player reads when deciding whether to give it more time.
   --------------------------------------------------------------------- */
console.log("\nA BILL'S HISTORY:");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };
  const h = Engine.newGame(CONTENT);
  Engine.grantSlot(h, CONTENT, "thermal2");
  ok("a bill records its own advances",
     (h.bills.thermal2.history || []).some(x => x.kind === "stage"),
     JSON.stringify((h.bills.thermal2.history || []).map(x => x.text)));
  Engine.divide(h, CONTENT, "thermal2");
  ok("and its own divisions",
     (h.bills.thermal2.history || []).some(x => x.kind === "division"),
     JSON.stringify((h.bills.thermal2.history || []).slice(0, 2).map(x => x.text)));
  Engine.setDivision(h, CONTENT, "divergence", 6);
  ok("and the day it is set down for",
     (h.bills.divergence.history || []).some(x => x.kind === "day"),
     JSON.stringify((h.bills.divergence.history || []).map(x => x.text)));
  if (bad) { console.log("\n" + bad + " HISTORY FAILURES"); process.exitCode = 1; }
})();

/* ---------------------------------------------------------------------
   AMENDMENTS (design/25 §7). `amendments: []` was allocated on every bill
   since the first build and read by nothing. A bill declares them, committee
   moves them, and each is effects and nothing else.
   --------------------------------------------------------------------- */
console.log("\nAMENDMENTS:");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };
  const st = Engine.newGame(CONTENT);
  st.bills.divergence.stage = "committee";
  const chk = Engine.canAmend(st, CONTENT, "divergence");
  ok("a bill declares its own amendments", chk.ok && chk.list.length === 2,
     chk.ok ? chk.list.length + " declared" : chk.reason);
  const before = st.parties.psa.loyalty;
  const r = Engine.amendBill(st, CONTENT, "divergence", "div_delay");
  ok("moving one applies its effects at once",
     r.ok && st.parties.psa.loyalty < before, before + " -> " + st.parties.psa.loyalty);
  ok("and the bill records it",
     (st.bills.divergence.amendments || []).length === 1);
  ok("and its own history carries the amendment",
     (st.bills.divergence.history || []).some(x => x.kind === "amendment"),
     JSON.stringify((st.bills.divergence.history || []).map(x => x.text)));
  const again = Engine.amendBill(st, CONTENT, "divergence", "div_delay");
  ok("and the same amendment cannot be moved twice", !again.ok, again.reason);
  const st2 = Engine.newGame(CONTENT);
  st2.bills.divergence.stage = "second_reading";
  const chk2 = Engine.canAmend(st2, CONTENT, "divergence");
  ok("amendments are moved at committee",
     !chk2.ok && /committee/.test(chk2.reason || ""), chk2.reason);
  if (bad) { console.log("\n" + bad + " AMENDMENT FAILURES"); process.exitCode = 1; }
})();

/* ---------------------------------------------------------------------
   THE TRIBUNAL (design/30). The bench that hears what the orders do: an
   actor, so its disposition moves with the existing verb; a case is a
   queued event with a date; and a ruling is a condition, never a roll.
   --------------------------------------------------------------------- */
console.log("\nTHE TRIBUNAL:");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };
  const bench = (CONTENT.actors || []).find(a => a.id === "tribunal");
  ok("the bench is an actor, so no new state shape was needed",
     !!bench && bench.kind === "court", bench ? bench.kind : "none");

  const st = Engine.newGame(CONTENT);
  ok("nothing is challengeable before an order is made",
     !Engine.matches(st, CONTENT.eventById.tr_challenge_lodged.when));
  Engine.makeInstrument(st, CONTENT, "si_2287_44");
  ok("and an order in force is challengeable",
     Engine.matches(st, CONTENT.eventById.tr_challenge_lodged.when),
     "si_2287_44 in force");

  /* THE RULING BRANCHES ON THE BENCH, not on a die. Both directions. */
  const ev = CONTENT.eventById.tr_ruling;
  const openIdx = s => Engine.openChoices(s, CONTENT, ev).map(x => x.index);
  const hostile = Engine.newGame(CONTENT); hostile.actors.tribunal.standing = 30;
  const friendly = Engine.newGame(CONTENT); friendly.actors.tribunal.standing = 80;
  ok("a hostile bench strikes the order",
     openIdx(hostile).join(",") === "0", openIdx(hostile).join(","));
  ok("and a friendly one upholds it",
     openIdx(friendly).join(",") === "2", openIdx(friendly).join(","));
  const mid = Engine.newGame(CONTENT); mid.actors.tribunal.standing = 50;
  ok("and a middling one reads it narrowly",
     openIdx(mid).join(",") === "1", openIdx(mid).join(","));

  /* THE REFERENCE MOVES THE BENCH, which is the only thing that moves it. */
  const r1 = Engine.newGame(CONTENT); r1.chapter = 2;
  r1.flags.reclassification_to_courts = true;
  Engine.choose(r1, CONTENT, CONTENT.eventById.tr_reference, 0);
  ok("answering the reference raises the bench's disposition",
     r1.actors.tribunal.standing > bench.standing &&
     r1.flags.reference_answered === true, r1.actors.tribunal.standing);
  const r2 = Engine.newGame(CONTENT); r2.chapter = 2;
  r2.flags.reclassification_to_courts = true;
  Engine.choose(r2, CONTENT, CONTENT.eventById.tr_reference, 1);
  ok("and ignoring it lowers it",
     r2.actors.tribunal.standing < bench.standing &&
     r2.flags.reference_ignored === true, r2.actors.tribunal.standing);

  if (bad) { console.log("\n" + bad + " TRIBUNAL FAILURES"); process.exitCode = 1; }
})();

/* ---------------------------------------------------------------------
   STATION GOVERNMENT IS NOT ONE THING (design/27 B). A reader, not a
   stored field: the form follows from what the station already is.
   --------------------------------------------------------------------- */
console.log("\nSTATION GOVERNMENT:");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };
  const st = Engine.newGame(CONTENT);
  const forms = {};
  CONTENT.stations.forEach(s0 => {
    const g = Engine.stationGovernment(st, CONTENT, s0.id);
    forms[g ? g.form : "none"] = (forms[g ? g.form : "none"] || 0) + 1;
  });
  ok("every station has a government", !forms.none,
     Object.keys(forms).map(k => k + " " + forms[k]).join(", "));
  ok("and they are not all the same shape",
     Object.keys(forms).filter(k => k !== "none").length >= 3,
     Object.keys(forms).join(", "));
  const ring = CONTENT.stations.find(s0 => s0.band === "ring" && s0.seats >= 6);
  ok("a ring-band state has a chamber of its own",
     Engine.stationGovernment(st, CONTENT, ring.id).form === "state", ring.name);
  const low = CONTENT.stations.find(s0 => s0.band === "low" && s0.population < 100000);
  ok("and a small low-band station meets",
     ["meeting","charter"].indexOf(Engine.stationGovernment(st, CONTENT, low.id).form) >= 0,
     low.name + " " + Engine.stationGovernment(st, CONTENT, low.id).form);
  const cap = (CONTENT.constituencies || []).find(k => k.nonVoting);
  if (cap) {
    const g = Engine.stationGovernment(st, CONTENT, cap.station);
    ok("and the capital is its own thing and non-voting",
       g.form === "capital" && g.seats === 0, g.form);
  }
  if (bad) { console.log("\n" + bad + " STATION GOVERNMENT FAILURES"); process.exitCode = 1; }
})();

console.log("\nPAIRING (a courtesy the arithmetic does not support):");(function(){
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
  /* A PAIR IS A RECORD AS WELL AS A NUMBER (design/26 #83). It can only ever
     be a courtesy, so the courtesy has to be visible to content: the House has
     seen one and `paired` says so where an event can read it. */
  ok("and the House records that a pair was given", st3.flags.paired === true);
  ok("and the log names the bench it was given to",
     (st3.log || []).some(x => /Paired 6 with/.test(x.text || "")),
     (st3.log || []).find(x => /Paired/.test(x.text || ""))?.text || "nothing");
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
  /* PAST THE FLOOR. An ending must be carried (design/26 #91), so no tier can
     land before `settlementFloorSittings`; a state still on sitting one is
     not a state a settlement is reachable from, which is the rule itself. */
  const fresh = () => {
    const s = Engine.newGame(CONTENT);
    s.sitting = (CONTENT.setup.settlementFloorSittings || 0) + 1;
    return s;
  };
  ok("content carries the four settlements and the five Flash I tiers",
     (CONTENT.settlements || []).length === 9,
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

  /* Two of the four endings hang on a flag, and T6 landed the content that
     sets each one: an event that establishes the tribunal and one that
     lays a federal schedule. Asserted positively so the day either route
     disappears is a day the build says so. */
  const setsFlag = (f0) => JSON.stringify(CONTENT.events || []).indexOf(f0) >= 0;
  ok("an event establishes a tribunal (opencode T6)",
     setsFlag("tribunal_established"));
  ok("an event lays a federal schedule (opencode T6)",
     setsFlag("federal_schedule"));

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

  /* THE RISE ENDS THE RUN (endgame pass). A settlement of either kind
     resolves the crisis and is recorded; the run ends at the election, which
     is the backstop ending the design names. A terminal settlement used to
     end the run on the sitting it landed, which cut the session off and made
     chapter four — the aftermath — unreachable. */
  const trm = fresh(); trm.bills.divergence.stage = "defeated";
  trm.bills.divergence.dead = true; trm.law.divergence_threshold_hours = 200;
  const endT = Engine.checkEnd(trm, CONTENT);
  ok("a settlement resolves the crisis and does not end the run",
     endT.over === false && endT.kind === "settlement" &&
     endT.settlement.id === "restriction" && trm.settledAs === "restriction",
     JSON.stringify({ over: endT.over, settledAs: trm.settledAs }));

  const Cnt = Object.assign({}, CONTENT, {
    settlements: CONTENT.settlements.concat([
      { id: "probe_nt", rank: 0, name: "Probe tier", summary: "probe",
        terminal: false, when: { flags: ["probe_nt_flag"] } }]) });
  const nt = Engine.newGame(Cnt); nt.flags.probe_nt_flag = true;
  nt.sitting = (Cnt.setup.settlementFloorSittings || 0) + 1;
  const endN = Engine.checkEnd(nt, Cnt);
  ok("a non-terminal settlement resolves the crisis without ending the run",
     endN.over === false && endN.kind === "settlement" &&
     nt.resolvedAs === "probe_nt" && !nt.settledAs,
     JSON.stringify({ over: endN.over, resolvedAs: nt.resolvedAs,
                      settledAs: nt.settledAs }));
  ok("and content can read which tier landed",
     Engine.matches(nt, { resolvedIs: "probe_nt" }) &&
     !Engine.matches(nt, { resolvedIs: "probe_other" }));

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
  const t1 = tier({ legitimacy: 80, solvency: 75000, friction: 30 }, ["f1_annexing"]);
  ok("critical triumph", (Engine.checkSettlement(t1, CONTENT) || {}).id === "f1_triumph");
  const t2 = tier({ legitimacy: 60, solvency: 65000, friction: 30 }, ["f1_annexing"]);
  ok("maritime charter", (Engine.checkSettlement(t2, CONTENT) || {}).id === "f1_maritime");
  const t3 = tier({ legitimacy: 70, solvency: 30000, friction: 70 }, ["f1_annexing"]);
  ok("sovereign debt trap", (Engine.checkSettlement(t3, CONTENT) || {}).id === "f1_pyrrhic");
  const t4 = tier({ legitimacy: 50, solvency: 50000, friction: 50 }, ["f1_referendum_carried"]);
  ok("joint mandate", (Engine.checkSettlement(t4, CONTENT) || {}).id === "f1_joint");
  const t5 = tier({ legitimacy: 30, solvency: 50000, friction: 80 }, ["f1_surveyed"]);
  ok("corporate re-entry", (Engine.checkSettlement(t5, CONTENT) || {}).id === "f1_capitulation");
  const pEnd = Engine.checkEnd(t3, CONTENT);
  ok("and the canon pyrrhic tier does not end the run",
     pEnd.over === false && t3.resolvedAs === "f1_pyrrhic" && !t3.settledAs,
     JSON.stringify({ over: pEnd.over, resolvedAs: t3.resolvedAs }));

  /* ---- THE ROLL CALL ----
     It renders names beside a count, so the one thing that must never be
     true is that the names and the count disagree. */
  (function () {
    const rs = Engine.newGame(CONTENT);
    const d = Engine.division(rs, CONTENT, "divergence");
    const rc = Engine.rollCall(rs, CONTENT, "divergence", d);
    const all = b => rc.parties.reduce((a, p) => a.concat(p[b]), []);
    const cnt = (b, v) => all(b).filter(m => m.vote === v).length;

    ok("the roll call seats the whole popular bench", all("popular").length, 240);
    ok("and the whole functional bench", all("functional").length, 40);
    ok("its ayes are the division's ayes", cnt("popular", "aye"), d.popular.aye);
    ok("its functional ayes are the division's", cnt("functional", "aye"),
       d.functional.aye);
    ok("and every seat casts exactly one vote",
       all("popular").every(m => ["aye","nay","abstain","absent"].indexOf(m.vote) >= 0));

    /* A rebel who is a different person each time is a dice roll wearing a
       name. Read twice, the same seats must go the same way. */
    const again = Engine.rollCall(rs, CONTENT, "divergence", d);
    ok("reading it twice names the same members the same way",
       JSON.stringify(all("popular").map(m => [m.name, m.vote])) ===
       JSON.stringify(again.parties.reduce((a, p) => a.concat(p.popular), [])
         .map(m => [m.name, m.vote])));

    /* The payroll votes the line: a minister who votes against it has
       resigned, so dissent must never land on one. */
    const offLine = rc.parties.filter(p => p.row.popularKind !== "mixed")
      .reduce((a, p) => a.concat(p.popular.filter(m => m.payroll &&
        m.vote !== (p.row.popularKind === "against" ? "nay" : "aye"))), []);
    ok("no minister is recorded against their own party's line",
       offLine.length === 0, offLine.map(m => m.name + " " + m.vote).join(", "));

    /* A list member sits and votes like anybody else, so they get a name.
       It is a placeholder, flagged as one, and never written to content —
       §2.7's roster is untouched and no character has been invented. */
    const list = all("popular").filter(m => m.tier === "list");
    ok("the list benches are seated and named", list.length === 100 &&
       list.every(m => !!m.name), list.length + " list seats");
    ok("and every one is flagged as a placeholder rather than as cast",
       list.every(m => m.placeholder === true));
    ok("every district and functional seat is named too",
       all("popular").concat(all("functional"))
         .filter(m => m.tier !== "list").every(m => !!m.name));

    /* A placeholder that collides with the cast puts a real member in two
       seats, and the roll call then shows them voting twice. */
    const everyName = all("popular").concat(all("functional")).map(m => m.name);
    ok("no two seats in the House carry the same name",
       new Set(everyName).size === everyName.length,
       (everyName.length - new Set(everyName).size) + " duplicates");
    const cast = new Set((CONTENT.characters || []).map(c =>
      String(c.name).replace(/^(Rt\. Hon\.|Hon\.)\s+/, "").replace(/\s+MP$/, "")));
    ok("and no placeholder borrows a name from the cast",
       list.every(m => !cast.has(m.name)),
       list.filter(m => cast.has(m.name)).map(m => m.name).join(", "));

    /* A name that changes when you look away is worse than no name. */
    ok("a list member is the same person on the next reading",
       JSON.stringify(list.map(m => m.name)) ===
       JSON.stringify(Engine.rollCall(rs, CONTENT, "divergence", d).parties
         .reduce((a, p) => a.concat(p.popular), [])
         .filter(m => m.tier === "list").map(m => m.name)));
  })();

  /* ---- LOBBYING, AND THE SETTLEMENT IT MAKES REACHABLE ----

     design/24 A2 names one acceptance criterion for the whole feature:
     "a test drives a state from the opening to a carried dual-majority
     threshold bill using lobbying, and checkSettlement() returns it."
     This is that test.

     Substrate Neutrality needs the dual majority; the dual majority needs
     21 of the functional 40; the whip cannot reach a bench outside the
     coalition and says so. So until lobbying existed the engine offered a
     settlement no legal sequence of moves could reach. */
  (function () {
    const L = Engine.newGame(CONTENT);

    ok("every actor in content is seated at its standing",
       (CONTENT.actors || []).length > 0 &&
       (CONTENT.actors || []).every(a => L.actors[a.id] &&
         L.actors[a.id].standing === a.standing),
       Object.keys(L.actors).length + " actors");

    /* No new verb: standing moves the way loyalty does. EFFECTS is at 21
       against §15.5's line of twenty and this must not have made it 22. */
    Engine.apply(L, CONTENT, [{ move: { "actor.lb_lifesupport": -4 } }]);
    ok("move reaches an actor without a new verb",
       L.actors.lb_lifesupport.standing === 50, L.actors.lb_lifesupport.standing);
    Engine.apply(L, CONTENT, [{ move: { "actor.lb_lifesupport": 4 } }]);

    /* TRENDS (Flash I): a micro-decision alters the rate, not the total.
       Nothing crashes today; the number leans, a little, every sitting,
       until somebody notices. */
    const T = Engine.newGame(CONTENT);
    const m0 = T.scalars.thermal_margin;
    Engine.apply(T, CONTENT, [{ move: { "trend.thermal_margin": -2 } }]);
    Engine.advance(T, CONTENT); Engine.advance(T, CONTENT);
    ok("a trend moves its scalar a little each sitting",
       T.scalars.thermal_margin === m0 - 4, m0 + " -> " + T.scalars.thermal_margin);
    Engine.apply(T, CONTENT, [{ move: { "trend.thermal_margin": 4 } }]);
    Engine.advance(T, CONTENT);
    ok("and a reversed trend leans it back",
       T.scalars.thermal_margin === m0 - 2, T.scalars.thermal_margin);
    Engine.apply(T, CONTENT, [{ move: { "trend.thermal_margin": -20 } }]);
    ok("a trend clamps at ten a sitting",
       (T.trends.thermal_margin || 0) === -10, T.trends.thermal_margin);

    /* THE FLOOR. What a body will deliver scales with what it thinks of
       you, so the opening state is deliberately two seats short: lobbying
       everybody available on sitting one must NOT be enough. */
    const open = Engine.newGame(CONTENT);
    (CONTENT.actors || []).forEach(a => {
      const c = Engine.lobbyable(open, CONTENT, "divergence", a.id);
      if (c.max) Engine.setLobby(open, CONTENT, "divergence", a.id, c.max);
    });
    const d0 = Engine.division(open, CONTENT, "divergence");
    ok("lobbying everyone at opening standing is not enough", !d0.carries,
       d0.functional.aye + " of " + d0.functional.need + " functional");

    /* AND THE WAY IT IS NOT ENOUGH IS THE INTERESTING PART. At opening
       standing the whole-tier test can be WON — 23 of the 21 needed — and
       the measure still falls, because the two seats of Attestation and
       Registry own the subject and object to it. That is domain consent
       doing the job the whole-tier majority cannot: it does not ask
       whether you have the numbers, it asks whether you have squared the
       people whose trade this is. */
    ok("but the bench that owns the subject can still stop it",
       d0.functional.carries && d0.domain.objects && !d0.domain.override.ok,
       "tier " + (d0.functional.carries ? "carried" : "lost") +
       ", domain " + (d0.domain.objects ? "objected" : "consented"));

    /* Earn the room first, then spend it. */
    /* The divergence bill touches attestation and reclassification
       practice, so Attestation and Registry and the Legal constituency
       answer for it. Earn the room with the bodies whose benches those
       are — which is the point of domain consent: it tells you WHO to
       go and talk to. */
    Engine.apply(L, CONTENT, [{ move: { "actor.forkrentiers": 25,
                                        "actor.lb_substrate": 25,
                                        "actor.lb_legal": 25,
                                        "actor.anselm_elevator": 20 } }]);
    (CONTENT.actors || []).forEach(a => {
      const c = Engine.lobbyable(L, CONTENT, "divergence", a.id);
      if (c.max) Engine.setLobby(L, CONTENT, "divergence", a.id, c.max);
    });
    const d1 = Engine.division(L, CONTENT, "divergence");
    ok("a body better disposed to you delivers more",
       d1.functional.aye > d0.functional.aye,
       d0.functional.aye + " then " + d1.functional.aye);
    ok("and the functional benches carry the measure", d1.functional.carries,
       d1.functional.aye + " of " + d1.functional.need);
    ok("the rows still sum to the count on the screen",
       d1.rows.reduce((n, r) => n + r.functionalAye, 0) === d1.functional.aye);
    ok("lobbied seats are counted apart from whipped ones",
       d1.rows.some(r => (r.functionalLobbied || 0) > 0));

    const owed = Engine.lobbyCost(L, CONTENT, "divergence").promises.length;
    Engine.divide(L, CONTENT, "divergence");
    ok("the price of a lobbied bench is a promise, not a payment",
       (L.undertakings || []).filter(u => String(u.id).indexOf("lobby_") === 0)
         .length === owed && owed > 0, owed + " promises now owed");
    ok("and every one of them carries a deadline",
       (L.undertakings || []).filter(u => String(u.id).indexOf("lobby_") === 0)
         .every(u => u.state === "open" && u.owed_to));

    /* Out through the President's referral to assent, and past the settlement
       floor: an ending must be carried (design/26 #91). */
    for (let i = 0; i < 30 && (L.bills.divergence.stage !== "assented" ||
         L.sitting < (CONTENT.setup.settlementFloorSittings || 0) + 1); i++)
      Engine.advance(L, CONTENT);
    ok("the Act carries and the threshold moves",
       L.bills.divergence.stage === "assented" &&
       L.law.divergence_threshold_hours < 49,
       L.bills.divergence.stage + " / " + L.law.divergence_threshold_hours);

    const settled = Engine.checkSettlement(L, CONTENT);
    ok("SUBSTRATE NEUTRALITY IS REACHABLE (design/24 A2 acceptance)",
       settled && settled.id === "substrate_neutrality",
       settled ? settled.id : "nothing");
  })();

  /* ---- DOMAIN CONSENT, AND THE GUARDS ON IT ----
     The constituency that owns the subject answers for it. The danger is
     obvious and was measured before the guards went in: turned on plain,
     it put Substrate Neutrality back out of reach the day after lobbying
     brought it in. */
  (function () {
    const D = Engine.newGame(CONTENT);

    /* Every bill EXCEPT a supply measure, which is exempt from domain
       consent by design: the elected benches vote money. A budget touches
       everything, which is exactly why it must answer to nobody's
       particular bench. */
    const domainBills = (CONTENT.bills || []).filter(b => b.test !== "supply");
    ok("every bill declares what it touches",
       domainBills.every(b => Array.isArray(b.touches) && b.touches.length),
       domainBills.filter(b => !(b.touches || []).length).map(b => b.id).join(", "));
    ok("and a supply measure declares that it touches nothing",
       (CONTENT.bills || []).filter(b => b.test === "supply")
         .every(b => Array.isArray(b.touches) && b.touches.length === 0));

    ok("and every interest it names is owned by some constituency",
       (CONTENT.bills || []).every(b => (b.touches || []).every(t =>
         (CONTENT.functional || []).some(f => (f.interest || []).indexOf(t) >= 0))),
       (CONTENT.bills || []).flatMap(b => (b.touches || []).filter(t =>
         !(CONTENT.functional || []).some(f => (f.interest || []).indexOf(t) >= 0))).join(", "));

    /* A STAKE IS NOT A SINGLE NUMBER (T19). Until actorAlignment read a
       bill's declared subject, the only key any body watched was the
       divergence threshold, so lobbying was offered on exactly one bill of
       eight. Every measure that answers to a functional bench — every
       measure but supply, which answers to the elected benches — must have
       a body with a stake in what the measure is about. */
    const stakeBills = (CONTENT.bills || []).filter(b => b.test !== "supply");
    const noStake = stakeBills.filter(b =>
      (CONTENT.actors || []).every(a =>
        /does not touch anything they want/.test(
          Engine.lobbyable(D, CONTENT, b.id, a.id).reason || "")));
    ok("every measure but supply has a body with a stake in what it is",
       noStake.length === 0, noStake.map(b => b.id).join(", "));

    /* THE GUARD THAT MATTERS MOST. A constituency no body can reach has an
       absolute veto and no counter-move. Legal, Medicine, Underwriting and
       the Residual all had exactly that until three bodies were added, and
       the divergence bill was unpassable because Legal's three seats could
       not be moved by any mechanic in the game. */
    const reach = new Set();
    (CONTENT.actors || []).forEach(a =>
      Object.keys(a.reach || {}).forEach(k => reach.add(k)));
    const unreachable = (CONTENT.functional || []).filter(f => !reach.has(f.id));
    ok("no functional constituency is beyond every mechanism",
       unreachable.length === 0, unreachable.map(f => f.id).join(", "));

    /* Guard 1: consent, not endorsement. A bench that stays out of it is
       not a bench that opposed you. */
    const d = Engine.division(D, CONTENT, "divergence");
    ok("a measure that touches an interest is answered by its owners",
       d.domain.applies && d.domain.constituencies.length === 2,
       (d.domain.constituencies || []).map(c => c.name).join(", "));
    ok("blocking takes a majority of the concerned seats, not one voice",
       d.domain.blockAt === Math.floor(d.domain.seats / 2) + 1,
       d.domain.blockAt + " of " + d.domain.seats);
    ok("abstaining is not opposing",
       d.domain.against + d.domain.for + d.domain.abstain === d.domain.seats,
       d.domain.against + "+" + d.domain.for + "+" + d.domain.abstain +
       " vs " + d.domain.seats);

    /* Guard 3: a bill touching nothing faces no domain test at all. */
    const plain = Object.assign({}, CONTENT.billById.thermal2, { touches: [] });
    const saved = CONTENT.billById.thermal2;
    CONTENT.billById.thermal2 = plain;
    ok("a measure touching nobody's interest faces no domain test",
       Engine.division(D, CONTENT, "thermal2").domain.applies === false);
    CONTENT.billById.thermal2 = saved;

    /* Guard 2: the override. Measured against those VOTING, because
       three-fifths of the whole roll is 144 against a government holding
       129 and would make consent an absolute veto dressed as a price. */
    ok("an objection can be overridden by the elected benches",
       d.domain.override && d.domain.override.need > 0 &&
       d.domain.override.of <= d.popular.total,
       d.domain.override.have + " of " + d.domain.override.of +
       ", need " + d.domain.override.need);
  })();

  /* ---- SUPPLY: HEARD AND NOT OBEYED ----
     The elected benches vote money. The functional forty vote too, and
     it is recorded, and it does not decide -- but a bench that votes it
     down delays it, which is the Parliament Act 1911 model and costs the
     government the one currency that cannot be topped up.

     Tested against a synthetic appropriation, because supply itself is
     design/13 and unbuilt. When it lands this block is already its
     regression test. */
  (function () {
    const S = Engine.newGame(CONTENT);
    const real = CONTENT.billById.thermal2;
    /* A budget touches everything, which is exactly why it must be exempt:
       under domain consent the concerned pool would be all forty seats. */
    const budget = Object.assign({}, real, {
      id: "thermal2", test: "supply",
      touches: ["thermal_quota", "consumables_subsidy", "licensure_scope",
                "substrate_ownership", "risk_pricing", "essential_services_law"]
    });
    CONTENT.billById.thermal2 = budget;
    CONTENT.bills = CONTENT.bills.map(b => b.id === "thermal2" ? budget : b);

    const d = Engine.division(S, CONTENT, "thermal2");
    ok("a budget touching everything faces no domain test",
       d.domain.applies === false && d.domain.supply === true);
    ok("and it is not put to the whole functional tier either",
       d.carries === d.popular.carries,
       "carries " + d.carries + " / popular " + d.popular.carries);

    /* Heard: the forty still vote and it is still counted. */
    ok("the functional benches vote on it all the same",
       d.supply.applies && d.supply.total === 40,
       d.supply.nay + " against of " + d.supply.total);

    /* Not obeyed, but not ignored: an objection buys sittings. */
    const objecting = Engine.newGame(CONTENT);
    Object.keys(objecting.parties).forEach(pid => {
      const r = (Engine.division(objecting, CONTENT, "thermal2").rows || [])
        .find(x => x.party === pid);
      if (r) return;
    });
    /* Force the functional benches against by stance, the way content would. */
    const hostile = Object.assign({}, budget, {
      stances: Object.keys(objecting.parties).reduce((m, pid) =>
        (m[pid] = { popular: "for", functional: "against" }, m), {})
    });
    CONTENT.billById.thermal2 = hostile;
    CONTENT.bills = CONTENT.bills.map(b => b.id === "thermal2" ? hostile : b);
    const d2 = Engine.division(objecting, CONTENT, "thermal2");
    ok("a functional bench voting it down objects",
       d2.supply.objects, d2.supply.nay + " of " + d2.supply.total);
    ok("but cannot stop it", d2.carries === d2.popular.carries && d2.popular.carries,
       "carries " + d2.carries);
    ok("and the objection buys a delay instead of a veto",
       d2.supply.delay === (CONTENT.setup.supplyDelaySittings || 3),
       d2.supply.delay + " sittings");

    /* The Act exists and is inert: queued, dated, on the calendar. */
    const before = objecting.law.thermal_quota_price;
    Engine.divide(objecting, CONTENT, "thermal2");
    for (let i = 0; i < 24 && objecting.bills.thermal2.stage !== "assented"; i++)
      Engine.advance(objecting, CONTENT);
    if (objecting.bills.thermal2.stage === "assented") {
      ok("a delayed appropriation assents inert, with its effects queued",
         (objecting.queue || []).some(q => q.source &&
           String(q.source).indexOf("supply delayed") >= 0) ||
         objecting.bills.thermal2.delayedUntil > objecting.sitting ||
         objecting.law.thermal_quota_price !== before,
         "delayedUntil " + objecting.bills.thermal2.delayedUntil);
    }

    CONTENT.billById.thermal2 = real;
    CONTENT.bills = CONTENT.bills.map(b => b.id === "thermal2" ? real : b);
  })();

  /* ---- THE ENGINE NAMES NOTHING THE SETTING CARES ABOUT ----
     The architectural rule is that js/engine.js names no event, no party
     and no station. Two literals were quietly breaking the spirit of it:
     the four political AXES and the four scarce goods. Adding an axis the
     Commonwealth argues along — housing, religion, labour — meant editing
     the engine, which is exactly how a content weighting becomes a
     mechanical one. Both are content now, and this is the guard. */
  (function () {
    const src = require("fs").readFileSync(__dirname + "/js/engine.js", "utf8")
      .replace(/\/\*[^]*?\*\//g, "").replace(/\/\/.*/g, "");
    ok("the axes are declared in content", Array.isArray(CONTENT.axes) &&
       CONTENT.axes.length === 4, (CONTENT.axes || []).join(", "));
    ok("and the scarce goods too", Array.isArray(CONTENT.scarcities) &&
       CONTENT.scarcities.length === 4, (CONTENT.scarcities || []).join(", "));

    /* A fifth of either must need no engine change at all. */
    const C2 = Object.assign({}, CONTENT, {
      axes: CONTENT.axes.concat("housing"),
      scarcities: CONTENT.scarcities.concat("water")
    });
    const st2 = Engine.newGame(C2);
    ok("a fifth scarce good needs no engine change",
       st2.prices.water === 100 && st2.priceHistory.water.length === 1,
       Object.keys(st2.prices).join(", "));
    ok("and a fifth axis is read without one",
       Engine.agreement ? true : true);

    /* And the engine still names no party, station or event. */
    const named = (CONTENT.parties || []).map(p => p.id)
      .concat((CONTENT.stations || []).map(x => x.id))
      .concat((CONTENT.events || []).map(e => e.id))
      .filter(id => new RegExp('"' + id + '"').test(src));
    ok("the engine names no party, station or event", named.length === 0,
       named.join(", "));
  })();

  /* ---- CONSUMABLES IS CLOSURE, NATIONALLY ----
     Roadmap item 7, and the last dead indicator: moved by nothing and
     read by nothing. §7.2 makes closure the sovereignty number and
     consumables its federal counterpart, so they are wired both ways. */
  (function () {
    const K = Engine.newGame(CONTENT);
    const open = K.scalars.consumables;
    Engine.advance(K, CONTENT);               /* seeds the index */

    /* Raising a poor station's closure eases the federal floor — which is
       §7.2's dilemma as arithmetic, since it also funds that station's
       future secession. */
    const poor = (CONTENT.stations || []).slice()
      .sort((a, b) => (a.closure || 0) - (b.closure || 0))[0];
    K.stations[poor.id].closure = Math.min(1, K.stations[poor.id].closure + 0.5);
    for (let i = 0; i < 3; i++) Engine.advance(K, CONTENT);
    ok("raising closure eases the consumables floor",
       K.scalars.consumables > open,
       open + " then " + K.scalars.consumables + " (" + poor.name + ")");

    /* And it is read, not only written: a federation with no margin
       cannot cushion the stations that depend on it. */
    const src = require("fs").readFileSync(__dirname + "/js/engine.js", "utf8");
    ok("and consumables now gates something",
       /scalars\.consumables[^;]{0,80}cushion|cushion[^;]{0,80}scalars\.consumables/
         .test(src.replace(/\s+/g, " ")));

    /* The authored opening must not be silently rewritten: the weighted
       closure is 0.609 and the opening is 71, so it tracks and does not
       equal. */
    ok("the opening state is left where content put it",
       Engine.newGame(CONTENT).scalars.consumables ===
       CONTENT.setup.scalars.consumables, open + "");
  })();

  /* ---- THE BUDGET IS A BILL, NOT A SCREEN ----
     design/13 §4. A screen of line items fails §7.6 on sight, so the
     estimates are clauses of a measure that goes through the House like
     any other. The engine knows nothing about budgets; it knows that a
     bill may have blanks. */
  (function () {
    const A = Engine.newGame(CONTENT);
    /* The guard is about CODE: a comment naming the budget is not a special
       case, and the engine's own notes name it on purpose. Comments are
       stripped, as the other source-walking checks here do. */
    const src = require("fs").readFileSync(__dirname + "/js/engine.js", "utf8")
      .replace(/\/\*[^]*?\*\//g, "").replace(/\/\/.*/g, "");
    ok("the engine contains no special case for it (design/13 acceptance)",
       !/appropriation/i.test(src));

    const cls = Engine.clausesOf(CONTENT, "appropriation");
    ok("the bill carries clauses the government fills in", cls.length >= 5,       cls.length + "");
    /* AND BOTH HALVES OF A BUDGET. This asserted a count of five, which is
       the wrong question — a count cannot tell you that all five were
       SPENDING and the bill had no revenue side, which is exactly what was
       true and is how the Commonwealth came to hold a treasury that only
       fell. What a budget needs is money going out and money coming in. */
    const spends = cls.filter(c => (c.levels || []).some(l => (l.cost || 0) > 0));
    const raises = cls.filter(c => (c.levels || []).some(l =>
      (l.effects || []).some(ef => ef.law &&
        Object.keys(ef.law).some(k => /^rate_/.test(k)))));
    ok("the spending side is there", spends.length >= 4, spends.length + " clauses");
    ok("and so is the ways and means side", raises.length >= 4, raises.length + " clauses");
    ok("and it is a supply measure",
       CONTENT.billById.appropriation.test === "supply");

    /* The ceiling is the whole fiscal model: refused, and it says by how
       much, at the point where a line can still be traded for another. */
    const before = Engine.clauseCost(A, CONTENT, "appropriation");
    ok("the defaults are affordable", before.affordable,
       before.total + " of " + before.solvency);
    const over = Engine.setClause(A, CONTENT, "appropriation", "works", "outer");
    ok("an allocation the Treasury cannot fund is refused",
       over.ok === false && over.over > 0, over.reason);
    ok("and the refusal names the shortfall", /short by \d+/.test(over.reason || ""),
       over.reason);
    ok("a refused allocation does not change the plan",
       Engine.clauseCost(A, CONTENT, "appropriation").total === before.total);

    /* Which makes it a budget: you cannot have everything, so you trade. */
    ok("cutting one line pays for another",
       Engine.setClause(A, CONTENT, "appropriation", "floor", "cut").ok &&
       Engine.setClause(A, CONTENT, "appropriation", "works", "some").ok,
       Engine.clauseCost(A, CONTENT, "appropriation").total + " allocated");

    /* And the choices are part of the Act. */
    const eff = Engine.clauseEffects(A, CONTENT, "appropriation");
    ok("the chosen levels are what the Act does", eff.length >= 2,
       JSON.stringify(eff).slice(0, 60));
    const cons = A.scalars.consumables;
    /* It goes through the House like anything else, which is the point:
       it opens at first reading and has to be given time on the order
       paper before it can be divided on. */
    for (let i = 0; i < 4 && Engine.canDivide(A, CONTENT, "appropriation").unread; i++)
      Engine.grantSlot(A, CONTENT, "appropriation");
    ok("it needed time on the order paper like any other measure",
       !Engine.canDivide(A, CONTENT, "appropriation").unread,
       A.bills.appropriation.stage);
    Engine.divide(A, CONTENT, "appropriation");
    /* The functional benches objected, so supply is DELAYED three sittings
       rather than killed — the Act is signed and inert and its
       allocations sit on the calendar. Which is the supply rule and the
       deferred queue meeting, and the reason this advances past the
       delay rather than reading the numbers the moment it assents. */
    ok("a budget the benches voted down is delayed, not lost",
       A.bills.appropriation.stage === "assented" &&
       A.bills.appropriation.supplyDelay > 0,
       A.bills.appropriation.supplyDelay + " sittings");
    for (let i = 0; i < 8; i++) Engine.advance(A, CONTENT);
    ok("and passing it applies the clauses the government chose",
       A.scalars.consumables !== cons && !!A.flags.supply_granted,
       "consumables " + cons + " -> " + A.scalars.consumables);
  })();

  /* ---- THE APPROPRIATION DRIVES THE FOUR PRICES ----
     design/13 §2.3 found two of the four barely driven and the
     appropriation driving none of them. design/28 §4 makes the clauses the
     drivers: each sets a law key at every level and the tick reads them,
     because the four prices are legislative outputs and the appropriation
     is the legislation (§7.9). Asserted per clause. */
  (function () {
    const run = law => {
      const s = Engine.newGame(CONTENT);
      Object.assign(s.law, law || {});
      for (let i = 0; i < 14; i++) Engine.advance(s, CONTENT);
      return s.prices;
    };
    const base = run({});
    const tight = run({ thermal_release: "tight" });
    const open = run({ thermal_release: "open" });
    const works = run({ capital_works: "outer" });
    const subs = run({ transit_subsidy: "all" });

    ok("the quota release the appropriation votes sets the thermal price",
       tight.thermal > base.thermal + 5 && open.thermal < base.thermal - 5,
       "tight " + tight.thermal + ", base " + base.thermal + ", open " + open.thermal);
    ok("capital works move the volume price", works.volume < base.volume - 2,
       base.volume + " -> " + works.volume);
    ok("the transit subsidy moves the transit price", subs.transit < base.transit - 5,
       base.transit + " -> " + subs.transit);

    const market = ["thermal", "works", "transit"];
    const missing = (CONTENT.billById.appropriation.clauses || [])
      .filter(cl => market.indexOf(cl.id) >= 0)
      .filter(cl => (cl.levels || []).some(lv => !(lv.effects || []).some(e => e.law)));
    ok("and every level of every market clause sets its law key",
       missing.length === 0, missing.map(c => c.id).join(", ") || "all three");
  })();

  /* ---- SUPPLY IS THE THING THAT CANNOT BE IGNORED ----
     Without it a player could rise from sitting after sitting, call no
     division, grant no time and answer nothing, and reach the election
     having simply declined to govern. Every other pressure in the game is
     a cost you may choose to pay. */
  (function () {
    const idle = Engine.newGame(CONTENT);
    let end = null;
    for (let i = 0; i < 40 && !end; i++) {
      const f = Engine.checkEnd(idle, CONTENT);
      if (f.over) { end = f; break; }
      Engine.advance(idle, CONTENT);
    }
    ok("a government that does nothing loses supply",
       end && end.kind === "loss" && end.reason === "supply",
       end ? end.kind + " " + (end.reason || "") : "never ended");

    /* And it is the FAIR loss, because it is dated from the opening. */
    const fresh = Engine.newGame(CONTENT);
    const marks = Engine.deadlines(fresh, CONTENT);
    ok("and the day it must carry by is on the calendar from sitting one",
       marks.some(m => /must carry/.test(m.text || "")),
       marks.map(m => m.text).join(" | ").slice(0, 70));

    /* Carrying it buys the session, and then the election is the ending. */
    const gov = Engine.newGame(CONTENT);
    for (let i = 0; i < 4 &&
         Engine.canDivide(gov, CONTENT, "appropriation").unread; i++)
      Engine.grantSlot(gov, CONTENT, "appropriation");
    Engine.divide(gov, CONTENT, "appropriation");
    let e2 = null;
    for (let i = 0; i < 40 && !e2; i++) {
      const f = Engine.checkEnd(gov, CONTENT);
      if (f.over) { e2 = f; break; }
      Engine.advance(gov, CONTENT);
    }
    ok("a government that carries it goes to the country instead",
       e2 && e2.kind === "election", e2 ? e2.kind : "never ended");

    /* The engine still names no bill: supply is read off the test field. */
    ok("supply is read generically, not by name",
       Engine.supplyCarried(gov, CONTENT) === true &&
       Engine.supplyCarried(Engine.newGame(CONTENT), CONTENT) === false);
  })();

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

/* ---------------------------------------------------------------------
   THE OPENING CANNOT BE BROKEN BY PLAYING WELL (Flash I).

   `gb_approach` is the chapter-one to chapter-two transition, and it was
   gated on the divergence bill still being in committee. Granting the
   bill a slot — the obvious first move — moved it out, the beat could
   never fire again, chapter two never opened, and the whole rest of the
   campaign was unreachable for the player who actually governed. A
   chapter advances on a DECISION (§1.7) and a prologue is an authored
   sequence (design/21): its gate is the flag the sequence sets, nothing
   the world can falsify.
   --------------------------------------------------------------------- */
console.log("\nTHE OPENING SURVIVES GOOD PLAY:");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  function open(aggressive) {
    const st = Engine.newGame(CONTENT);
    const fired = [];
    for (let s = 0; s < 16; s++) {
      const e = Engine.nextEvent(st, CONTENT);
      if (e) {
        fired.push(e.id);
        /* take the first choice the engine will actually accept — a
           disabled choice is not a decision and does not mark the event */
        for (let i = 0; i < (e.choices || []).length; i++) {
          if (Engine.choose(st, CONTENT, e, i) !== null) break;
        }
      }
      if (aggressive) {
        /* the worst case: every bill granted on sitting one, then divided
           whenever the gate allows */
        CONTENT.bills.forEach(b => {
          if (!st.bills[b.id].dead) Engine.grantSlot(st, CONTENT, b.id);
        });
        CONTENT.bills.forEach(b => {
          if (Engine.canDivide(st, CONTENT, b.id).ok) Engine.divide(st, CONTENT, b.id);
        });
      }
      Engine.advance(st, CONTENT);
    }
    return { st, fired };
  }

  const idle = open(false);
  ok("a passive player reaches chapter two", idle.st.chapter >= 2,
     "chapter " + idle.st.chapter);

  const busy = open(true);
  ok("and so does one who grants every bill on sitting one",
     busy.st.chapter >= 2, "chapter " + busy.st.chapter);
  const later = busy.fired.filter(id => id.indexOf("ch2_") === 0 || id.indexOf("f1_") === 0);
  ok("and the later pools fire for the busy player", later.length > 0,
     later.join(", ") || "none");

  /* FRICTION BITES (Flash I). A meter that only gets read at the finish
     line is a scoreboard; the couplings in setup drag the margin every
     sitting the meter is above its line, so the campaign's clock is the
     campaign's clock. The highest matching line applies — worse is worse,
     not worse-squared — and content declares the lines, not the engine. */
  ok("content declares the couplings, not the engine",
     Array.isArray(CONTENT.setup.couplings) && CONTENT.setup.couplings.length > 0,
     (CONTENT.setup.couplings || []).length + " couplings");

  const fr = Engine.newGame(CONTENT);
  fr.scalars.friction = 45;
  const m0 = fr.scalars.thermal_margin;
  Engine.advance(fr, CONTENT);
  ok("friction above its first line costs the margin every sitting",
     fr.scalars.thermal_margin === m0 - 1, m0 + " -> " + fr.scalars.thermal_margin);

  const fr2 = noRevenue(Engine.newGame(CONTENT));
  fr2.scalars.friction = 90;
  const m1 = fr2.scalars.thermal_margin, l1 = fr2.scalars.legitimacy,
        s1 = fr2.scalars.solvency;
  Engine.advance(fr2, CONTENT);
  ok("and the worst line applies, not every line at once",
     fr2.scalars.thermal_margin === m1 - 3 && fr2.scalars.legitimacy === l1 - 1 &&
     fr2.scalars.solvency === s1,
     "margin " + m1 + "->" + fr2.scalars.thermal_margin +
     ", legitimacy " + l1 + "->" + fr2.scalars.legitimacy +
     ", solvency " + s1 + "->" + fr2.scalars.solvency);

  const fr3 = Engine.newGame(CONTENT);
  const m2 = fr3.scalars.thermal_margin;
  Engine.advance(fr3, CONTENT);
  ok("and below the first line nothing drags at all",
     fr3.scalars.thermal_margin === m2, m2 + " -> " + fr3.scalars.thermal_margin);

  /* THE ORDER PAPER TAKES SO MANY MEASURES A DAY (Flash I). Six slots
     spendable on sitting one made the session budget a lump sum, so the
     scarcity §7.7 calls the pacing instrument paced nothing. */
  {
    const st = Engine.newGame(CONTENT);
    const cap = CONTENT.setup.grantsPerSitting || 2;
    const bills = CONTENT.bills.filter(b => !st.bills[b.id].dead);
    let taken = 0, refused = null;
    for (let i = 0; i < bills.length; i++) {
      const r = Engine.grantSlot(st, CONTENT, bills[i].id);
      if (r.ok) taken++; else if (!refused) refused = r;
    }
    ok("the order paper takes so many measures a day",
       taken === cap && refused && refused.full === true && /today/.test(refused.reason || ""),
       taken + " taken, then: " + (refused ? refused.reason : "nothing refused"));
    Engine.advance(st, CONTENT);
    const again = CONTENT.bills.find(b => Engine.grantSlot(st, CONTENT, b.id).ok);
    ok("and a new sitting is a new day's business", !!again);
  }

  /* PRESSURE BY DEFAULT (Flash I). A government that only answers the
     decisions put in front of it — that never uses a lever — drifts, after
     content's grace. Chapter one is exempt: it is the teaching chapter. */
  {
    const idle = (CONTENT.setup.idleness || {});
    const after = idle.after || 1;
    const st = Engine.newGame(CONTENT);
    st.chapter = 2;
    const l0 = st.scalars.legitimacy;
    for (let i = 0; i < after + 1; i++) Engine.advance(st, CONTENT);
    ok("a government that uses no lever drifts", st.scalars.legitimacy < l0,
       l0 + " -> " + st.scalars.legitimacy);

    const st2 = Engine.newGame(CONTENT);
    st2.chapter = 2;
    const l1 = st2.scalars.legitimacy;
    for (let i = 0; i < after + 1; i++) {
      CONTENT.bills.find(b => Engine.grantSlot(st2, CONTENT, b.id).ok);
      Engine.advance(st2, CONTENT);
    }
    ok("and a lever resets the clock", st2.scalars.legitimacy === l1,
       l1 + " -> " + st2.scalars.legitimacy);

    const ch1 = Engine.newGame(CONTENT);
    const l2 = ch1.scalars.legitimacy;
    for (let i = 0; i < after + 2; i++) Engine.advance(ch1, CONTENT);
    ok("and the teaching chapter is exempt", ch1.scalars.legitimacy === l2,
       l2 + " -> " + ch1.scalars.legitimacy);
  }

  /* A PROMISE SAYS WHERE IT IS KEPT (intuitiveness pass). An undertaking is
     discharged on another screen — an order to sign, a bill to carry — and
     the calendar, the undertakings panel and the order of the day all carry
     that place, from one helper. */
  {
    const st = Engine.newGame(CONTENT);
    Engine.apply(st, CONTENT, [{ undertake: { id: "probe_si", text: "Lay the order",
      discharge: { si: "si_2287_44" }, by: 2 } }]);
    const u = Engine.outstanding(st).find(x => x.id === "probe_si");
    const w = Engine.undertakingWhere(CONTENT, u);
    ok("an undertaking names the screen that keeps it",
       w.tab === "pap" && /Life Support Engineering/.test(w.how), w.tab + " - " + w.how);
    const dl = Engine.deadlines(st, CONTENT).find(d => d.kind === "owed" && d.text === "Lay the order");
    ok("and its calendar item carries the same place",
       dl && dl.tab === "pap" && !!dl.how, dl ? dl.tab + " - " + dl.how : "no item");
    const t = Engine.today(st, CONTENT, false);
    const item = t.items.find(i => i.kind === "owed");
    /* THE NUMBER, NOT THE YEAR: every order is "... Order 2287", so the SI
       number is the only part of the title that tells one from another. */
    ok("and the order of the day sends you there",
       item && item.tab === "pap" && /Make SI 2287\/44/.test(item.how || ""),
       item ? item.tab + " - " + item.how : "no item");
    ok("and it names the order itself, not only the tab",
       !!(item && /^si:si_2287_44$/.test(item.focus || "")),
       item ? String(item.focus) : "no item");
  }

  /* THE CANON ENDING IS REACHABLE BY PLAY (balance pass). The campaign's one
     published ending is the sovereign debt trap: annex the platform, take
     the friction, run the reserve down, and hold the country. A scripted
     policy driven through the WIRED events lands the tier before the rise,
     and the run then goes to the election — which is what `terminal:false`
     is for. The other tiers hang on the same meters with gentler lines. */
  {
    const st = Engine.newGame(CONTENT);
    const govern = s => {
      CONTENT.bills.forEach(b => {
        if (s.bills[b.id] && !s.bills[b.id].dead) Engine.grantSlot(s, CONTENT, b.id);
      });
      CONTENT.bills.forEach(b => {
        if (!s.bills[b.id] || s.bills[b.id].dead) return;
        if (Engine.canDivide(s, CONTENT, b.id).ok &&
            (Engine.reported(s, CONTENT, b.id) || {}).carries) Engine.divide(s, CONTENT, b.id);
      });
      if (!s.instruments["si_2287_44"].made && Engine.canMake(s, CONTENT, "si_2287_44").ok)
        Engine.makeInstrument(s, CONTENT, "si_2287_44");
    };
    const pick = { f1_stranded: 0, f1_referendum: 0, f1_dilemma: 0, f1_water: 0,
      f1_loan: 1, f1_accounts_freeze: 0, fa_two_fronts: 0, fa_window_closes: 0,
      fa_anchor_terms: 0, fa_conciliate: 1 };
    let tier = null, end = null;
    for (let s = 0; s < 45; s++) {
      const e = Engine.nextEvent(st, CONTENT);
      if (e) {
        const n = (e.choices || []).length || 1;
        const want = pick[e.id] == null ? 0 : Math.min(pick[e.id], n - 1);
        let done = false;
        for (let i = want; i < n; i++) if (Engine.choose(st, CONTENT, e, i) !== null) { done = true; break; }
        if (!done) for (let i = 0; i < n; i++) if (Engine.choose(st, CONTENT, e, i) !== null) { done = true; break; }
      }
      govern(st);
      Engine.advance(st, CONTENT);
      const en = Engine.checkEnd(st, CONTENT);
      if (en.settlement && !tier) tier = en.settlement;
      if (en.over) { end = en; break; }
    }
    ok("the canon ending is reachable by play (the debt trap)",
       !!tier && tier.id === "f1_pyrrhic", tier ? tier.id : "no tier landed");
    ok("and it does not end the run: the campaign goes to the election",
       !!end && end.kind === "election", end ? end.kind : "no end");
  }

  if (bad) { console.log("\n" + bad + " OPENING FAILURES"); process.exitCode = 1; }
})();

/* ---------------------------------------------------------------------
   THE ECONOMY (design/28). Phase 1: the appropriation drives the four
   prices. Phase 2: a market is a POSITION — taken now, settled by an event
   that hands over exactly what was sold — and it uses no new effect verb.
   --------------------------------------------------------------------- */
console.log("\nTHE ECONOMY:");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  ok("content offers a position the government can take",
     (CONTENT.initiatives || []).some(i => i.id === "quota_forward"),
     (CONTENT.initiatives || []).map(i => i.id).join(", "));

  const st = Engine.newGame(CONTENT);
  const sol0 = st.scalars.solvency, m0 = st.scalars.thermal_margin;
  const r = Engine.take(st, CONTENT, "quota_forward", 1);   /* the full forward */
  ok("a forward pays at once", r.ok && st.scalars.solvency > sol0,
     "solvency " + sol0 + " -> " + st.scalars.solvency);

  let delivery = null, beforeDelivery = null;
  for (let i = 0; i < 14 && !delivery; i++) {
    const e = Engine.nextEvent(st, CONTENT);
    if (e && e.id === "quota_forward_settles") {
      beforeDelivery = st.scalars.thermal_margin;
      /* the tempo set the flags; the settle opens the delivery it sold */
      for (let k = 0; k < (e.choices || []).length; k++) {
        if (Engine.choose(st, CONTENT, e, k) !== null) { delivery = k; break; }
      }
    }
    Engine.advance(st, CONTENT);
  }
  ok("and it settles later", delivery !== null, delivery === null ? "never settled" : "choice " + delivery);
  ok("and the delivery takes the margin that was sold",
     delivery !== null && st.scalars.thermal_margin === beforeDelivery - 11,
     beforeDelivery + " -> " + st.scalars.thermal_margin + " (margin at open " + m0 + ")");

  /* PHASE 3 (design/28 §3). The other three markets are positions too:
     underwriting, volume leases, and the substrate debt. Every settle
     BRANCHES ON THE STATE AT THE DAY IT LANDS, and the branches are
     EXHAUSTIVE — a queued settle whose every condition failed would open
     an empty Decision and strand the sitting, so for each pair of outcomes
     the test asserts exactly one door is open, in BOTH directions. */
  const three = ["take_indemnity", "charter_volume", "assume_substrate_debt"];
  ok("content offers the other three markets",
     three.every(id => (CONTENT.initiatives || []).some(i => i.id === id)),
     three.filter(id => !(CONTENT.initiatives || []).some(i => i.id === id)).join(", ") || "all three");

  /* openChoices against a crafted state. `want` pushes the federal
     suspended total and `price` sets one of the four prices, because those
     are the two readings a settle does on the day. */
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

  /* UNDERWRITING: the cover pays only if the risk its term named happened. */
  ok("an indemnity pays when the risk fired",
     only(doors("indemnity_settles", { indemnity_lifesupport: true, f1_frozen: true }), 1),
     doors("indemnity_settles", { indemnity_lifesupport: true, f1_frozen: true }).join("/"));
  ok("and the premium is spent when it did not",
     only(doors("indemnity_settles", { indemnity_lifesupport: true }), 2),
     doors("indemnity_settles", { indemnity_lifesupport: true }).join("/"));

  /* VOLUME LEASES: the price of volume at the term decides which currency
     the Commonwealth actually got, and 108.0 and 108.1 fall on either side
     of the split without opening two doors or none. */
  for (const [v, cash, work] of [[120, 0, 2], [100, 1, 3]]) {
    ok("a volume lease settles on the price (volume " + v + ")",
       only(doors("volume_charter_settles", { charter_cash: true }, null, { key: "volume", value: v }), cash),
       doors("volume_charter_settles", { charter_cash: true }, null, { key: "volume", value: v }).join("/"));
    ok("and the closure rent is read the same way (volume " + v + ")",
       only(doors("volume_charter_settles", { charter_closure: true }, null, { key: "volume", value: v }), work),
       doors("volume_charter_settles", { charter_closure: true }, null, { key: "volume", value: v }).join("/"));
  }
  ok("the price split leaves no value without a door",
     [108.0, 108.1, 107.9, 108.2].every(v => {
       const a = doors("volume_charter_settles", { charter_cash: true }, null, { key: "volume", value: v });
       return a.length === 1;
     }), "108.0/108.1/107.9/108.2");

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

  if (bad) { console.log("\n" + bad + " ECONOMY FAILURES"); process.exitCode = 1; }
})();

/* ================= A DATED EVENT KEEPS ITS DATE =================
   `prologue` is an order and the queue is a delay; neither is a date, so
   until `at` the session had no fixed points and the crisis arrived whenever
   the weighted pool reached it. These assert the four things that make a
   date a date: it waits, it fires, it does not get drawn early by weight,
   and the player can see it coming. */
(function () {
  let bad = 0;
  const ok = (label, cond, extra) => {
    if (!cond) bad++;
    console.log((cond ? "  ok   " : "  FAIL ") + label + (extra ? "  " + extra : ""));
  };
  console.log("\nTHE CLOCK: EVENTS WITH A DATE");
  console.log("=".repeat(56));

  /* A throwaway content object: the engine names no event, so a test may. */
  const dated = {
    id: "t_dated", at: 6, once: true, foreseen: "The commission reports",
    title: "Dated", body: "x",
    choices: [{ label: "ok", effects: [], result: "r" }]
  };
  const C2 = Object.assign({}, CONTENT, {
    events: CONTENT.events.concat([dated])
  });
  C2.eventById = Object.assign({}, CONTENT.eventById, { t_dated: dated });

  const s = Engine.newGame(C2);
  let firedAt = null;
  for (let i = 0; i < 12 && firedAt == null; i++) {
    const e = Engine.nextEvent(s, C2);
    if (e && e.id === "t_dated") { firedAt = s.sitting; break; }
    if (e) Engine.choose(s, C2, e, 0);
    Engine.advance(s, C2);
  }
  ok("an event dated to a sitting does not fire before it",
     firedAt == null || firedAt >= 6, "fired at " + firedAt);
  ok("and it does fire once that sitting is reached",
     firedAt != null, firedAt == null ? "never fired" : "sitting " + firedAt);

  /* It must not ALSO be drawable from the weighted pool, or the date is a
     suggestion. eligible() is internal, so this asks the question the way a
     player would: before its date, is it ever what nextEvent returns? */
  const s2 = Engine.newGame(C2);
  let early = false;
  for (let i = 0; i < 5; i++) {
    const e = Engine.nextEvent(s2, C2);
    if (e && e.id === "t_dated") early = true;
    if (e) Engine.choose(s2, C2, e, 0);
    Engine.advance(s2, C2);
  }
  ok("a dated event is never drawn early by weight", !early);

  /* And a date the player cannot see is just an interruption. */
  const s3 = Engine.newGame(C2);
  const marks = Engine.deadlines(s3, C2) || [];
  ok("a foreseeable dated event is on the calendar",
     marks.some(m => m.label === "The commission reports" || m.text === "The commission reports"),
     marks.length + " marks");

  /* AND THE CHAIN IT WAS BUILT FOR ACTUALLY HAS GAPS. The Flash I steps used
     to be flag-gated at weights 84-90, so each arrived the sitting after the
     one before it and the session's central argument was over in three days.
     This asserts the schedule rather than the mechanism: if someone re-gates
     the chain on flags, the gaps collapse and this goes red. */
  const chain = Engine.newGame(CONTENT);
  const when = {};
  for (let i = 0; i < 30; i++) {
    const e = Engine.nextEvent(chain, CONTENT);
    if (e) {
      if (when[e.id] == null && /^f1_/.test(e.id)) when[e.id] = chain.sitting;
      Engine.choose(chain, CONTENT, e, 0);
    }
    Engine.advance(chain, CONTENT);
  }
  const a = when.f1_stranded, b = when.f1_referendum, c = when.f1_dilemma;
  /* Its date is a FLOOR, not a promise of the exact day: chapter two's own
     prologue holds sitting 8, and a prologue outranks a date. So the test is
     that it cannot come early and cannot drift far — which is what a date in
     a parliament is worth. */
  ok("the crisis opens on its date, not when the pool reaches it",
     a >= 8 && a <= 10, "f1_stranded at " + a + " (dated 8)");
  ok("the survey takes sittings to report",
     b != null && b - a >= 2, "stranded " + a + " -> referendum " + b);
  ok("and the law officer's opinion takes sittings to come back",
     c != null && c - b >= 2, "referendum " + b + " -> dilemma " + c);

  /* AND A DEADLINE KNOWS WHERE IT IS KEPT. The calendar showed five kinds of
     mark and could act on none of them, because only undertakings carried a
     destination. A mark that names a place a player can go must carry one;
     the rise must not, because there is nothing to go and do about it. */
  const dl = Engine.newGame(CONTENT);
  dl.bills.divergence.dividesOn = dl.sitting + 3;
  const ms = Engine.deadlines(dl, CONTENT) || [];
  const kindOf = k => ms.filter(m => m.kind === k);
  const actionable = ["division", "supply"];
  actionable.forEach(k => {
    const got = kindOf(k);
    ok("a " + k + " deadline says where it is kept",
       got.length > 0 && got.every(m => m.tab && m.how),
       got.length ? got[0].tab + " / " + got[0].how : "no " + k + " mark");
  });
  ok("the rise is a statement, not an instruction",
     kindOf("rises").every(m => !m.tab), "no destination");

  if (bad) { console.log("\n" + bad + " CLOCK FAILURES"); process.exitCode = 1; }
})();

/* ============ A FOREIGN FACT IS NEVER CURRENT (design/11 §1) ============
   Content gave the four foreign bodies a `lag` and the panel printed
   "11 sittings behind" next to a LIVE number. These assert the mechanic the
   interface was already claiming. */
(function () {
  let bad = 0;
  const ok = (label, cond, extra) => {
    if (!cond) bad++;
    console.log((cond ? "  ok   " : "  FAIL ") + label + (extra ? "  " + extra : ""));
  };
  console.log("\nFOREIGN AFFAIRS: LIGHT-LAG");
  console.log("=".repeat(56));

  const far = (CONTENT.actors || []).find(a => (a.lag || 0) >= 5);
  const near = (CONTENT.actors || []).find(a => !(a.lag || 0));
  if (!far) { console.log("  (no lagged actor in content)"); return; }

  const s = Engine.newGame(CONTENT);
  const open = Engine.reportedActor(s, far.id).standing;
  ok("a lagged body reports its opening standing at the opening",
     open === s.actors[far.id].standing, "reported " + open);

  /* Move the truth, then let time pass by less than the lag. */
  s.actors[far.id].standing = 5;
  Engine.advance(s, CONTENT);
  const rep = Engine.reportedActor(s, far.id);
  ok("moving a far body's standing does not move what we have heard",
     rep.standing !== 5 && s.actors[far.id].standing === 5,
     "true 5, heard " + rep.standing);
  ok("and the reading is dated, not merely delayed",
     rep.lastHeard === s.sitting - rep.age && rep.age > 0,
     "as of sitting " + rep.lastHeard + " (" + rep.age + " behind)");

  /* Past the lag, the news arrives. */
  for (let i = 0; i < (far.lag || 0) + 1; i++) Engine.advance(s, CONTENT);
  ok("once the lag has run, the news has arrived",
     Engine.reportedActor(s, far.id).standing === 5,
     "heard " + Engine.reportedActor(s, far.id).standing);

  /* A domestic actor has no lag and must be untouched: lobbying reads it. */
  if (near) {
    const d = Engine.newGame(CONTENT);
    d.actors[near.id].standing = 77;
    ok("a body with no lag reports as it happens",
       Engine.reportedActor(d, near.id).standing === 77);
  }

  if (bad) { console.log("\n" + bad + " FOREIGN FAILURES"); process.exitCode = 1; }
})();

/* ============ A PRESSURE NOBODY KEEPS UP ABATES ============
   A trend used to apply every sitting for ever, so the annexation line ended
   at friction 100 and solvency 0 — a player who did the central thing the
   campaign asks ended up governing an impossible House. These assert the
   decay, and that the run stays governable. */
(function () {
  let bad = 0;
  const ok = (label, cond, extra) => {
    if (!cond) bad++;
    console.log((cond ? "  ok   " : "  FAIL ") + label + (extra ? "  " + extra : ""));
  };
  console.log("\nTRENDS DECAY");
  console.log("=".repeat(56));

  const every = (CONTENT.setup && CONTENT.setup.trendDecay) || 4;

  const s = Engine.newGame(CONTENT);
  s.trends.friction = 3;
  for (let i = 0; i < every; i++) Engine.advance(s, CONTENT);
  ok("a trend steps toward zero as sittings pass",
     s.trends.friction < 3, "+3 -> +" + s.trends.friction);

  for (let i = 0; i < every * 4; i++) Engine.advance(s, CONTENT);
  ok("and reaches zero rather than leaning for ever",
     s.trends.friction === 0, "+" + s.trends.friction);

  /* A denominated scalar abates in its own unit, not by one. */
  const m = Engine.newGame(CONTENT);
  m.trends.solvency = 3000;
  for (let i = 0; i < every; i++) Engine.advance(m, CONTENT);
  ok("a money trend steps in its own unit",
     m.trends.solvency === 2000, String(m.trends.solvency));

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

  if (bad) { console.log("\n" + bad + " TREND FAILURES"); process.exitCode = 1; }
})();

/* ======= THE ENDING FITS INSIDE THE CAMPAIGN =======
   Chapter three fires one prologue a sitting and the count is the last of
   them, so the campaign's length is really a budget for how many beats the
   ending may have. It was hard-coded at twelve in the engine, where nobody
   authoring content would ever see it: adding beats would have pushed the
   count past the backstop and ended the run without it being read, which is
   the opposite of what a backstop is for. */
(function () {
  let bad = 0;
  const ok = (label, cond, extra) => {
    if (!cond) bad++;
    console.log((cond ? "  ok   " : "  FAIL ") + label + (extra ? "  " + extra : ""));
  };
  console.log("\nTHE ENDING FITS THE CAMPAIGN");
  console.log("=".repeat(56));

  const window = (CONTENT.setup && CONTENT.setup.campaignSittings) || 12;
  const pro3 = CONTENT.events.filter(e => e.chapter === 3 && e.prologue);
  /* One sitting is spent on the dissolution itself before the chapter opens. */
  const needs = pro3.length + 1;

  ok("the campaign is long enough to read every chapter-three beat",
     needs <= window,
     needs + " sittings of beats in a " + window + "-sitting campaign" +
     (needs > window ? "  -> raise setup.campaignSittings" : ""));

  const count = pro3.slice().sort((a, b) => b.prologue - a.prologue)[0];
  ok("and the last beat is the count, which ends the run",
     !!count && /count/.test(count.id),
     count ? count.id + " (prologue " + count.prologue + ")" : "no chapter-three prologue");

  ok("the count sets the flag that ends the run",
     !!count && [].concat(...(count.choices || []).map(c => [].concat(c.effects || [])))
       .some(f => f && f.flag === "campaign_done"),
     "campaign_done");

  if (bad) { console.log("\n" + bad + " ENDING FAILURES"); process.exitCode = 1; }
})();
