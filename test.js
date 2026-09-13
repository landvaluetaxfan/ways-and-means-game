/* Headless check: does the division calculator reproduce the bible's numbers? */
const fs = require("fs"), vm = require("vm");
const files = ["content/setup.js","content/parties.js","content/stations.js","content/constituencies.js","content/cabinet.js","content/instruments.js","content/minutes.js",
               "content/functional.js","content/labour.js",
               "content/characters.js","content/bills.js","content/events.js","content/glossary.js","content/encyclopedia.js","content/index.js"];
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
     STAGE_ORDER nor the name this setting uses for the upper house. */
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
   THE BED IS IN TUNE.

   Four eight-bar sections of hand-typed MIDI. A mistyped number is a
   wrong note that every static check passes and nobody hears until the
   arrangement happens to reach that bar, once, two minutes in. These
   also hold the claims the whole design rests on — rootless voicings, a
   join that cannot cadence, a mode that is only left on purpose —
   because a claim nothing checks is a claim that rots.
   --------------------------------------------------------------------- */
console.log("\nTHE SCORE:");
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

  const walk = [];
  F.ITINERARY.forEach(name =>
    F.SECTIONS[name].forEach((b, j) => walk.push({ b: b, sec: name, at: name + (j + 1) })));

  ok("the form is long enough not to announce its own loop", walk.length >= 48,
     walk.length + " bars = " + (walk.length * F.BEATS * 60 / F.BPM).toFixed(0) +
     "s at " + F.BPM + " BPM");
  ok("and the itinerary uses every section it defines",
     Object.keys(F.SECTIONS).every(k => F.ITINERARY.indexOf(k) >= 0),
     F.ITINERARY.join(" "));

  /* Every chord in the form must be a chord this module knows how to
     voice and how to improvise over. A typo here is a silent bar. */
  const unknown = [];
  walk.forEach(({ b, at }) => b.c.forEach(n => {
    if (!F.CH[n]) unknown.push(at + " " + n);
    else if (!F.TYPE[F.CH[n][1]]) unknown.push(at + " type " + F.CH[n][1]);
  }));
  ok("every chord resolves to a root and a type", unknown.length === 0,
     unknown.join("; ") || Object.keys(F.CH).length + " chords, " +
     Object.keys(F.TYPE).length + " types");

  /* ROOTLESS VOICINGS. The bass carries the root, which is what lets the
     same shape sit over different feet and what keeps four notes from
     turning into mud in the middle of the keyboard. */
  const rooted = Object.keys(F.TYPE).filter(t => F.TYPE[t].v.indexOf(0) >= 0);
  ok("every voicing leaves its root to the bass", rooted.length === 0,
     rooted.join(", ") || Object.keys(F.TYPE).length + " types rootless");

  /* HARMONIC RHYTHM is what separates this from a vamp with jazz chords
     on it. A form where nothing moves twice in a bar is a groove. */
  const twoChord = walk.filter(x => x.b.c.length > 1).length;
  ok("the harmony moves inside the bar, not just across it",
     twoChord >= walk.length / 6,
     twoChord + " of " + walk.length + " bars change chord at the half");

  /* IT MODULATES. A chord whose scale contains a note outside the home
     mode has taken the tune somewhere else, which is the thing a
     two-chord vamp can never do. */
  const HOME = [2, 4, 5, 7, 9, 11, 0];        /* D dorian */
  const away = [...new Set(walk.flatMap(({ b }) => b.c.filter(n => {
    const [r, t] = F.CH[n];
    return F.TYPE[t].s.some(i => HOME.indexOf(pc(r + i)) < 0);
  })))];
  ok("and the tune leaves the home mode and comes back",
     away.length >= 3, away.join(", "));

  /* THE MELODY, against the chord under it. Two chords in a bar split at
     the half, the same way the sequencer reads them. This is the whole
     difference between jazz and wrong, and it is eighty-odd hand-typed
     numbers that no other check can see. */
  const wrong = [];
  walk.forEach(({ b, at }) => (b.m || []).forEach(([m, beat, d]) => {
    const nm = b.c.length > 1 && beat >= F.BEATS / 2 ? b.c[1] : b.c[0];
    const [r, t] = F.CH[nm];
    if (F.TYPE[t].s.indexOf(pc(m - r)) < 0)
      wrong.push(at + " beat " + beat + ": " + NAME[pc(m)] + " over " + nm);
  }));
  const melNotes = walk.reduce((n, x) => n + (x.b.m ? x.b.m.length : 0), 0);
  ok("every note of the tune is in the scale of its own chord",
     wrong.length === 0, wrong.join("; ") || melNotes + " melody notes checked");

  /* A tune, not a motif: it has to have a range and it has to move. */
  const mel = walk.flatMap(x => (x.b.m || []).map(h => h[0]));
  /* a minor third is three semitones; the check said "a third or more"
     and tested for four, which is a major third and a different claim */
  const leaps = mel.filter((m, i) => i && Math.abs(m - mel[i - 1]) >= 3).length;
  ok("and the tune has a singer's range", mel.length > 40 &&
     Math.max(...mel) - Math.min(...mel) >= 12,
     named([Math.min(...mel)]) + " to " + named([Math.max(...mel)]) +
     ", " + (Math.max(...mel) - Math.min(...mel)) + " semitones");
  ok("with leaps in it and not just steps", leaps >= mel.length / 5,
     leaps + " intervals of a third or more");

  /* The join. A cadence there is learned in two passes and heard ever
     after; every ii-V INSIDE the head is welcome to resolve. */
  const last = walk[walk.length - 1].b, first = walk[0].b;
  ok("the form does not cadence into its own first bar",
     pc(F.CH[last.c[last.c.length - 1]][0]) !== pc(F.CH[first.c[0]][0] + 7),
     last.c[last.c.length - 1] + " -> " + first.c[0]);

  /* VOICE LEADING. Fixed shapes jump; a player moves as little as
     possible. Measured across the whole form rather than asserted. */
  let prev = null, moves = [], lo = 127, hi = 0;
  walk.forEach(({ b }) => b.c.forEach(n => {
    const v = F.voicing(F.CH[n][0], F.CH[n][1]);
    lo = Math.min(lo, v[0]); hi = Math.max(hi, v[v.length - 1]);
    if (prev) moves.push(v.reduce((a, x, i) => a + Math.abs(x - prev[i]), 0));
    prev = v;
  }));
  const avg = moves.reduce((a, x) => a + x, 0) / moves.length;
  ok("the comping voices lead rather than jump", avg < 6,
     avg.toFixed(1) + " semitones total across four voices per change");
  ok("and stay in one register", lo >= 52 && hi <= 79, "MIDI " + lo + " to " + hi);

  /* THE SIGNATURE LICK IS THE BAND'S OWN TUNE. A separate motif would
     be a second idea competing with the first. */
  ok("the unison lick quotes the head's opening",
     F.UNISON.slice(0, walk[0].b.m.length)
       .every((m, i) => m === walk[0].b.m[i][0]),
     named(F.UNISON));
  ok("and the hook is its first four notes",
     F.MOTIF.every((m, i) => m === F.UNISON[i]), named(F.MOTIF));
  ok("the run ascends without leaving the home mode",
     F.RUN.every(m => HOME.indexOf(pc(m)) >= 0) &&
     F.RUN.every((m, i) => i === 0 || m > F.RUN[i - 1]),
     F.RUN.length + " notes");

  /* THE SOLO section has the changes and not the tune, or the improviser
     is playing over somebody else's melody. */
  const solo = walk.filter(x => x.b.solo);
  ok("the solo section carries changes and no written tune",
     solo.length >= 8 && solo.every(x => !x.b.m && x.b.c.length),
     solo.length + " bars");

  /* THE DRUMMER IS A PLAYER. One bass pattern and no fills is the
     loudest possible announcement that this is a loop. */
  ok("the bass has more than one thing to play", F.CELLS.length >= 3 &&
     new Set(F.CELLS.map(c => JSON.stringify(c))).size === F.CELLS.length,
     F.CELLS.length + " distinct cells");

  /* Range at both ends of the key drift — a form that is fine in D and
     unplayable four semitones down is not fine. */
  /* the sequencer takes the octave up rather than go under MIDI 31, so
     that floor is the number this has to hold against */
  let bassLo = 127;
  walk.forEach(x => x.b.c.forEach(n => {
    let m = 33 + pc(F.CH[n][0] - 9);
    while (m + F.KEY_MIN < 31) m += 12;
    bassLo = Math.min(bassLo, m + F.KEY_MIN);
  }));
  ok("the whole form stays playable across the key drift",
     bassLo >= 31 && hi + F.KEY_MAX <= 88,
     "bass down to MIDI " + bassLo + ", comping up to " + (hi + F.KEY_MAX));
  ok("and the key cannot drift somewhere it never comes back from",
     F.KEY_MIN < 0 && F.KEY_MAX > 0 && F.KEY_MAX - F.KEY_MIN <= 12);

  /* THE IMPROVISER'S ONE DECISION. Everything else in the score is read
     off the page; this is chosen at runtime, over every chord in the
     solo, and a wrong answer is a wrong note sixteen bars at a time. */
  let offScale = 0, farthest = 0;
  Object.keys(F.CH).forEach(name => {
    const [r, t] = F.CH[name], sc = F.TYPE[t].s;
    for (let n = 60; n <= 88; n++) {
      const got = F.snap(n, r, sc);
      if (sc.indexOf(pc(got - r)) < 0) offScale++;
      farthest = Math.max(farthest, Math.abs(got - n));
    }
  });
  ok("the improviser always lands on a note of the chord's scale",
     offScale === 0, offScale ? offScale + " off-scale" : "20 chords x 29 notes");
  ok("and never has to move far to do it", farthest <= 2,
     "at most " + farthest + " semitones");

  ok("the kit plays in the bed and not only in a swell",
     F.BED.indexOf("drums") >= 0, F.BED.join(", "));
  ok("and the horn is still held back for the moods and the solo",
     F.BED.indexOf("lead") < 0);

  if (bad) { console.log("\n" + bad + " SCORE FAILURES"); process.exitCode = 1; }
})();

/* ---------------------------------------------------------------------
   AND IT PLAYS, AND THE MOODS MOVE IT.

   The section above proves the NOTES are right. Nothing there proves the
   code that plays them runs: jsdom has no Web Audio, so build() returns
   false in every harness and the sequencer, the eight voices, the four
   gestures and the eight moods are executed by no other check.

   This drives the whole arrangement through a recording stub and then
   fires each mood and reads back where the band ended up. It is not
   listening — it cannot be — but it catches everything that is not
   about taste: a voice that throws, a pattern addressing a step that
   does not exist, a key that walks off the end of the piano, a mood
   that says it jumps and does not, and an exponential ramp to zero,
   which is silent in a stub and a thrown DOMException in a browser.
   --------------------------------------------------------------------- */
console.log("\nAND IT PLAYS:");
(function () {
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  const M = require("./js/music.js"), F = M.__form;
  const made = {}, ramps = [];
  const bump = k => made[k] = (made[k] || 0) + 1;

  /* `anchored` counts the events actually placed on THIS param's timeline.
     A ramp reads its start value from the previous event, so a ramp with
     none is the silent-bed bug. cancelAndHold is not counted: it holds an
     existing event and cannot invent one. */
  function param(name) {
    const p = {
      value: 0, anchored: 0,
      setValueAtTime: (v, t) => { p.anchored++; ramps.push([name, "set", v, t, 1]); return p; },
      setTargetAtTime: (v, t) => { p.anchored++; ramps.push([name, "tgt", v, t, 1]); return p; },
      /* the stub models a ramp by its DESTINATION, which is enough to tell
         an opened layer from one left shut and not enough to be a synth */
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

  /* The sequencer paces itself with setTimeout. Capture the callback and
     drive the clock by hand so minutes pass in no time at all. */
  const realSet = globalThis.setTimeout, realClear = globalThis.clearTimeout;
  let pending = null, threw = null;
  globalThis.setTimeout = fn => { pending = fn; return 0; };
  globalThis.clearTimeout = () => { pending = null; };
  const tick = () => { if (!pending) return false; const fn = pending; pending = null;
                       ctx.currentTime += 0.04; fn(); return true; };
  const SECS = n => { const to = ctx.currentTime + n; while (ctx.currentTime < to && tick()); };
  const BAR = F.BEATS * 60 / F.BPM;

  let bars = 0; const seen = {}; let mix = null;
  try {
    M.init();
    ok("the graph builds and the transport starts", M.available() === true);

    /* a full pass of the arrangement, watching where it goes on its own */
    for (let i = 0; i < 70; i++) {
      SECS(BAR);
      const st = M.state();
      if (st.section) { seen[st.section] = true; bars++; }
    }
    ok("it walks the whole arrangement unaided",
       Object.keys(seen).length === Object.keys(F.SECTIONS).length,
       Object.keys(seen).sort().join(" ") + " over " + bars + " bars");

    /* ---- the moods, each read back rather than taken on trust ---- */
    const home = M.state().semitones;

    M.moment(); SECS(BAR * 2);
    const afterCarry = M.state();
    ok("a carried bill lifts the key", afterCarry.semitones > home,
       home + " -> " + afterCarry.semitones + " (" + afterCarry.key + ")");
    ok("and takes the head", afterCarry.section === "HEAD", afterCarry.section);

    M.defeat(); SECS(BAR * 2);
    const afterLoss = M.state();
    ok("a lost bill drops it again", afterLoss.semitones < afterCarry.semitones,
       afterCarry.semitones + " -> " + afterLoss.semitones + " (" + afterLoss.key + ")");
    ok("and slips into the section that is out of the mode",
       afterLoss.section === "BRIDGE", afterLoss.section);

    M.tension(); SECS(BAR);
    ok("a division halves the feel", M.state().halfTime === true);
    M.moment(); SECS(BAR);
    ok("and the result puts it back", M.state().halfTime === false);

    /* THE CLAMP. Good news must not walk the band off the piano. */
    for (let i = 0; i < 8; i++) { M.moment(); SECS(BAR); }
    ok("a run of good news stops at the ceiling",
       M.state().semitones === F.KEY_MAX, M.state().key);
    for (let i = 0; i < 10; i++) { M.defeat(); SECS(BAR); }
    ok("and a run of bad news at the floor",
       M.state().semitones === F.KEY_MIN, M.state().key);

    /* PROROGATION IS THE ONE CADENCE, and it takes the key home. */
    M.prorogue(); SECS(BAR * 2);
    ok("prorogation returns the key home", M.state().semitones === 0, M.state().key);
    ok("and restarts the arrangement", M.state().section === "VAMP",
       M.state().section);

    /* the two that change nothing structural, and must not */
    const before = M.state();
    M.undertake(); M.order(); SECS(BAR);
    ok("an undertaking and an order leave the key alone",
       M.state().semitones === before.semitones);

    M.rise(); SECS(BAR * 2);
    ok("a new government runs up into the head",
       M.state().section === "HEAD" && M.state().semitones === 0,
       M.state().section + " in " + M.state().key);
    M.sombre(); SECS(BAR * 2);
    ok("and a fallen one goes half time", M.state().halfTime === true);

    mix = M.state();
    M.stop();
  } catch (e) { threw = e; }
  globalThis.setTimeout = realSet; globalThis.clearTimeout = realClear;

  ok("every mood plays without throwing", !threw,
     threw ? threw.message + " | " + String(threw.stack).split("\n")[1].trim()
           : F.MOODS.length + " moods");

  ok("every voice was reached", (made.osc || 0) > 2000 && (made.noise || 0) > 800,
     (made.osc || 0) + " oscillators, " + (made.noise || 0) + " noise bursts");

  /* AN EXPONENTIAL RAMP TO ZERO throws a DOMException in a browser and
     does nothing in a stub, so it is invisible everywhere except on the
     player's machine. */
  const zeroed = ramps.filter(r => r[1] === "exp" && !(r[2] > 0));
  ok("no exponential ramp reaches zero", zeroed.length === 0,
     zeroed.length ? zeroed.length + " ramps to " + zeroed[0][2] + " on " + zeroed[0][0]
                   : ramps.length + " automation points");
  const backwards = ramps.filter(r => r[3] < -0.001);
  ok("and none is scheduled before the clock", backwards.length === 0);

  /* THE SILENT BED. A linear ramp takes its start value from the previous
     event on the param's timeline, and an assigned .value is not an event.
     Where that resolves the wrong way the whole bed sits at zero while
     every oscillator runs on time — audible nowhere, visible in no check,
     and reported as "no music on mobile". */
  const unanchored = ramps.filter(r => (r[1] === "lin" || r[1] === "exp") && !r[4]);
  ok("no ramp starts from an empty automation timeline",
     unanchored.length === 0,
     unanchored.length ? unanchored.length + " unanchored, first on " + unanchored[0][0]
       : ramps.filter(r => r[1] === "lin" || r[1] === "exp").length + " ramps anchored");

  ok("the module can report its own mixer", !!mix);
  if (mix) {
    const up = Object.keys(mix.levels).filter(k => mix.levels[k] > 0);
    ok("and the bed layers were actually opened", up.length >= 4,
       up.map(k => k + " " + mix.levels[k]).join(", "));
  }

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
