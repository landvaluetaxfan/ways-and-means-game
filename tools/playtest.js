/* =============================================================
   THE PLAYTEST TRANSCRIPT.

     npm run playtest                 every strategy, one table
     node tools/playtest.js --log cut the run's own record, sitting by sitting
     node tools/playtest.js --sittings 60

   design/33 §6. Two problems, one machine.

   OUTWARD: a playtest run that ends and leaves nothing behind wastes most of
   what a tester is worth. You get "I liked it" and "I got stuck somewhere".
   The state already carries the log, the wire, the undertakings and the
   scalars; a run that prints them is a run somebody can read.

   INWARD, AND THIS IS WHY IT LEADS: in two days the same headless probe was
   written eleven times — content coverage, the Flash I chain's timing,
   friction across a run, whether the Annexation Act carries, which settlement
   lands first, what forty sittings of receipts come to. One machine that
   plays several strategies and prints one table answers all of those and the
   next twenty without anybody writing a probe.

   IT READS STATE AND NEVER WRITES IT — except on the copy it is playing.
   `nextEvent` MUTATES: it pulls a due event off the queue. So every strategy
   plays its own state, built fresh, and nothing here is handed a state
   somebody else still wants. js/ui.js's lookAhead learned this the hard way
   and says so in its header.

   A STRATEGY IS NOT AN AI. It is a rule for picking a number, stated in one
   line, so that when two strategies end differently the difference is
   attributable. "Always the first choice" is a real strategy: it is what a
   player does when they have stopped reading.
   ============================================================= */

const fs = require("fs"), vm = require("vm"), path = require("path");
const root = path.join(__dirname, "..");

/* the content files index.html loads, in its order (tools/loadcontent.js) */
vm.runInThisContext(require("./loadcontent.js").source() + "\n;globalThis.__C = CONTENT;");
/* The campaign's view of the content (design/36 §3): `--campaign <id>`,
   Flash I by default. */
const CAMPAIGN = (process.argv.indexOf("--campaign") >= 0
  ? process.argv[process.argv.indexOf("--campaign") + 1] : null) || "flash_i";
const CONTENT = globalThis.__C.forCampaign(CAMPAIGN);
const Engine = require(path.join(root, "js", "engine.js"));

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
/* THE CAP IS THE RUN'S OWN LENGTH, from setup: every session, the campaign
   after the writs, and slack. It was a flat 60, and when the campaign began
   at sitting 51 the cap cut it off before the count — the tool reported a
   run the game had not finished. */
const RUN_LENGTH = (CONTENT.setup.sittingsPerPeriod || 24) *
                   (CONTENT.setup.periodsPerSession || 1) *
                   (CONTENT.setup.sessionsPerParliament || 1) +
                   (CONTENT.setup.campaignSittings || 12) + 6;
const SITTINGS = Number(arg("--sittings", RUN_LENGTH));
const WANT_LOG = argv.indexOf("--log") >= 0 ? String(argv[argv.indexOf("--log") + 1] || "") : null;

/* ---------- the strategies ----------
   Each is a name and a pick(event, state) returning a choice index. They are
   deliberately dumb and deliberately different: a spread of dumb players is
   what tells you whether the CONTENT has a spread in it. */
/* ---------- governing ----------
   A STRATEGY THAT ONLY ANSWERS EVENTS IS NOT PLAYING THE GAME, and the first
   table proved it: all five lost supply at sitting 25, because nothing ever
   spent a slot to move the Appropriation toward a division, so the House
   rose without a budget. That is not a finding about the content; it is a
   finding about the probe, and the difference matters.

   So each sitting a strategy also does government business: grants
   order-paper time to a bill and divides on anything ready. What it
   PRIORITISES is the interesting variable, and it is what the `budget`
   flag below picks out — a government that carries supply first against one
   that spends its time on its programme is the oldest choice in this game.

   Everything here goes through the engine's own verbs (grantSlot, divide),
   never by writing state. payWhips clears the plan, so a caller that divided
   afterwards charged for nothing: Engine.divide() is the only way in, which
   CLAUDE.md records and this obeys. */
function govern(st, strategy) {
  const acts = [];
  /* IT HOLDS THE COUNTRY BY READING THE DOCKET (design/38 §7). Three
     strategies cascaded because nothing told them the emergency orders
     exist, which made a cascade in this table a finding about the tool and
     not the player. A strategy that `climbs` does what the order of the day
     says when an alert on it is today's business: approves the order that
     is laid and waiting, or lays the one it names. It reads Engine.today()
     and nothing else, so the table is also a test of the warning: an alert
     that named the wrong order, or none, would show up here as a cascade. */
  const alerts = strategy.climbs
    ? Engine.today(st, CONTENT, false).items.filter(i => i.kind === "alert" && /^order:/.test(i.focus || ""))
    : [];
  alerts.filter(a => a.when === "now").forEach(a => {
    const id = a.focus.slice("order:".length);
    const s = st.instruments[id] || {};
    const r = s.awaitingApproval ? Engine.approveInstrument(st, CONTENT, id)
                                 : Engine.makeInstrument(st, CONTENT, id);
    if (r && r.ok !== false)
      acts.push((s.awaitingApproval ? "approved " : "laid ") + ((CONTENT.instrumentById[id] || {}).title || id));
  });
  /* and keeps time in hand while an order waits on the House, or one is
     about to be wanted, as the canon script does */
  const holding = alerts.length ? 1 : 0;
  /* supply first, for a government that wants to survive the rise */
  const order = (CONTENT.bills || []).slice().sort((a, b) => {
    const s = (x) => (x.test === "supply" ? 0 : 1);
    return strategy.budget ? s(a) - s(b) : s(b) - s(a);
  });

  /* divide on whatever will carry, before spending anything.

     WHAT divide() ACTUALLY RETURNS, which this read wrongly for as long as
     it existed. It is `{ ok:false, reason }` when the House will not divide
     and `{ result, paid, assent }` when it does, with the outcome at
     `result.carries`. This read `r.carries` -- a field divide() has never
     had -- so it was undefined, falsy, and every call was written down as
     "lost": refusals, successes and defeats alike. The transcript showed
     the Appropriation "lost" thirteen sittings running, which reads as the
     budget failing thirteen divisions, when a defeated bill is DEAD
     (divide() sets bs.dead) and would have been skipped the next sitting.
     Every one of those was the House declining to divide at all, and the
     reason it gave was in `r.reason` the whole time.

     So the three outcomes are three words now, and a refusal carries the
     House's own reason -- which is the most useful line in the transcript,
     because it says what a player would have been told. */
  for (const b of order) {
    const bs = st.bills[b.id];
    if (!bs || bs.dead || bs.stage !== Engine.DIVIDES_AT) continue;
    try {
      const r = Engine.divide(st, CONTENT, b.id);
      if (!r) continue;
      if (r.ok === false) acts.push("no division on " + b.title + ": " + r.reason);
      else acts.push((r.result && r.result.carries ? "carried " : "defeated ") + b.title);
    } catch (e) { /* not divisible yet; the engine said so */ }
  }

  /* then move something along, while there is time to do it with.

     "SUPPLY FIRST" HAS TO KEEP SUPPLY'S VOTE, and it did not. The session
     opens with six slots of order-paper time and the Appropriation opens at
     first reading: four grants to reach third reading and one more for the
     division itself, so passing the budget costs five of the six. This loop
     sorted supply first and then spent every slot it could -- and once
     supply reached third reading, granting it more time is refused
     ("awaiting a division"), so the loop moved on and spent the remaining
     slot on the next bill down. On the day the division was set for there
     was no time left to hold it. "Last option, supply first" was refused
     twenty-two sittings running for "no order-paper time left this
     session" and fell on supply at the rise, which the table reported as a
     finding about supply when it was a finding about this loop.

     So a budget-first government reserves what supply still needs -- a slot
     for each stage left to climb and one for the division -- and spends
     only the surplus on its programme. A programme-first government does
     not, because putting its programme ahead of the budget is the whole of
     what that strategy is testing, and it should be allowed to lose on it. */
  const reserve = (strategy.budget ? supplyNeed(st) : 0) + holding;
  let budgetSlots = strategy.slotsPerSitting == null ? 2 : strategy.slotsPerSitting;
  /* AND A MEASURE WITH TIME OF ITS OWN IS GIVEN IT FIRST (reserved
     order-paper time, design/32 §E.5). It costs the session's own time
     nothing, so no government leaves it unspent. This loop stopped the
     moment the GENERAL pool was empty and so never touched the reserve: the
     Annexation Bill fell at the rise with five slots of its own unused,
     which is the failure the reserve exists to prevent, reproduced in the
     tool that measures it. */
  const general = () => st.slots.total - st.slots.used;
  const own = b => Engine.reservedFor(st, b.id) > 0;
  const ordered = order.slice().sort((x, y) => (own(y) ? 1 : 0) - (own(x) ? 1 : 0));
  while (budgetSlots-- > 0) {
    let moved = false;
    for (const b of ordered) {
      const bs = st.bills[b.id];
      if (!bs || bs.dead || bs.stage === "assented") continue;
      if (!own(b) && general() < 1) continue;
      /* the slot supply's vote needs is not this bill's to spend */
      const isSupply = b.test === "supply";
      if (!isSupply && !own(b) && general() <= reserve) continue;
      const r = Engine.grantSlot(st, CONTENT, b.id);
      if (r && r.ok !== false) { acts.push("time to " + b.title); moved = true; break; }
    }
    if (!moved) break;
  }
  return acts;
}

/* WHAT SUPPLY STILL NEEDS, in slots: one per stage it has left to climb to
   the division, and one for the division itself. Nought once it is past the
   division -- awaiting assent, assented, or dead -- because there is nothing
   left for order-paper time to buy it. Read off the engine's own stage
   ladder rather than a number typed here, so a change to the ladder cannot
   leave this reserving the wrong amount. */
function supplyNeed(st) {
  const sup = (CONTENT.bills || []).find(b => b.test === "supply");
  if (!sup) return 0;
  const bs = st.bills[sup.id];
  if (!bs || bs.dead) return 0;
  const at = Engine.STAGE_ORDER.indexOf(bs.stage);
  const divides = Engine.STAGE_ORDER.indexOf(Engine.DIVIDES_AT);
  if (at < 0 || at > divides) return 0;
  return (divides - at) + 1;
}

/* EVERY SUPPLY-FIRST STRATEGY CLIMBS THE LADDER when the docket says so
   (design/38 §7), and one does not, so the ignorant case is still measured:
   a cascade there is what the warning is for. */
const STRATEGIES = [
  { id: "first",   name: "First option, supply first",
    note: "What a player does when they have stopped reading, but who does pay for the government.",
    budget: true, climbs: true, pick: () => 0 },
  { id: "blind",   name: "First option, never climbs",
    note: "The same player, ignoring the order of the day's warning about the thermal margin.",
    budget: true, climbs: false, pick: () => 0 },
  { id: "last",    name: "Last option, supply first",
    note: "The other end of the same non-decision.",
    budget: true, climbs: true, pick: (e) => e.choices.length - 1 },
  { id: "cycle",   name: "Cycles the options, supply first",
    note: "Reaches more of the content than either end does.",
    budget: true, climbs: true, pick: (e, st, n) => n % e.choices.length },
  { id: "prog",    name: "Programme first, supply last",
    note: "Spends its order paper on its own bills and leaves the budget to the end. The oldest way to lose.",
    budget: false, pick: (e, st, n) => n % e.choices.length },
  { id: "idle",    name: "Answers, governs not at all",
    note: "Never grants a slot and never divides. The floor.",
    budget: true, slotsPerSitting: 0, pick: () => 0 },
  { id: "cheap",   name: "Cheapest option, supply first",
    note: "Never spends a slot on an ANSWER if it can avoid one.",
    budget: true, climbs: true,
    pick: (e) => {
      let best = 0, cost = Infinity;
      e.choices.forEach((c, i) => {
        const s = (c.cost && c.cost.slot) || 0;
        if (s < cost) { cost = s; best = i; }
      });
      return best;
    } },
  { id: "spender", name: "Costliest option, supply first",
    note: "The opposite, so a slot economy that only works one way shows up.",
    budget: true, climbs: true,
    pick: (e) => {
      let best = 0, cost = -1;
      e.choices.forEach((c, i) => {
        const s = (c.cost && c.cost.slot) || 0;
        if (s > cost) { cost = s; best = i; }
      });
      return best;
    } }
];

/* ---------- one run ---------- */
function play(strategy, sittings) {
  const st = Engine.newGame(CONTENT);
  const seen = new Set();
  const marks = [];
  let picks = 0, refused = 0, ended = null, endedAt = null;
  let settled = null, settledAt = null, resolved = null, resolvedAt = null;

  const note = (text) => marks.push({ at: st.sitting, text });

  for (let i = 0; i < sittings; i++) {
    /* the event, if the House has one for us */
    const e = Engine.nextEvent(st, CONTENT);
    if (e) {
      seen.add(e.id);
      const n = e.choices.length;
      let took = null;
      const want = strategy.pick(e, st, picks);
      /* A choice can be closed by a condition. Try the wanted one, then
         every other, so a strategy is never silently stuck. */
      const order = [want].concat(Array.from({ length: n }, (_, k) => k));
      for (const k of order) {
        if (k < 0 || k >= n) continue;
        if (Engine.choose(st, CONTENT, e, k) !== null) { took = k; break; }
      }
      if (took === null) refused++;
      /* `label`, which is the field the game draws. This read `.text`, so
         every choice in every transcript printed as "#1" or "#2" -- the one
         line meant to say what the government decided said nothing. Same
         fault as the division result above: a field read by a name the
         data does not use, falling back to a placeholder without a word. */
      else { picks++; const c = e.choices[took];
             note(e.title + " — " + (c.label || c.text || "#" + took)); }
    }

    /* AND THEN IT GOVERNS. */
    govern(st, strategy).forEach(a => note(a));

    /* HAS IT ENDED? Engine.checkEnd is the authority and nothing else is.
       The first version of this loop broke on checkSettlement and reported
       four of five strategies "ending" at sitting 15 - but a settlement does
       not end a run. The crisis resolves and the government goes on
       governing until the House rises and the electorate answers. Stopping
       there would have made every number in this table a measurement of the
       wrong thing, which is the failure a balance tool can least afford.
       checkEnd also reads dissolution BEFORE loss, for the reason its own
       header gives: you cannot lose a confidence vote in a chamber that no
       longer exists. */
    /* TWO CHANNELS (bible §3.5.1): the crisis RESULT, which is the
       campaign's outcome and lands once, and the ANSWER to the standing
       question, which is intermediate. This read only the second, so a run
       whose crisis resolved looked like a run where nothing happened. */
    if (!resolved && st.resolvedAs) {
      resolved = st.resolvedAs; resolvedAt = st.resolvedAt || st.sitting;
      note("-- the crisis resolved: " + st.resolvedAs);
    }
    if (!settled && st.settledAs) {
      settled = st.settledAs; settledAt = st.sitting;
      note("-- the question answered: " + st.settledAs);
    }
    const end = Engine.checkEnd(st, CONTENT);
    if (end && end.over) {
      ended = end.kind + (end.reason ? ": " + end.reason : "");
      endedAt = st.sitting; break;
    }
    Engine.advance(st, CONTENT);
  }

  const total = (CONTENT.events || []).length;
  return { strategy, st, seen, marks, picks, refused, settled, settledAt, resolved, resolvedAt,
           ended: ended || "still governing", endedAt: endedAt || st.sitting,
           reach: total ? Math.round(seen.size / total * 100) : 0, total: total };
}

/* ---------- the table ---------- */
const pad = (s, n) => String(s === undefined || s === null ? "" : s).padEnd(n);
const num = (s, n) => String(s === undefined || s === null ? "" : s).padStart(n);

console.log("PLAYTEST");
console.log("=".repeat(96));
console.log("  " + SITTINGS + " sittings each, " + STRATEGIES.length + " strategies, " +
            (CONTENT.events || []).length + " events in content\n");

console.log("  " + pad("strategy", 34) + num("sat", 5) + num("chose", 7) +
            num("shut", 6) + num("events", 8) + num("reach", 7) +
            "  " + pad("crisis result", 20) + pad("answer", 24) + "outcome");
console.log("  " + "-".repeat(92));

const runs = STRATEGIES.map(s => play(s, SITTINGS));
runs.forEach(r => {
  console.log("  " + pad(r.strategy.name, 34) + num(r.endedAt, 5) + num(r.picks, 7) +
              num(r.refused, 6) + num(r.seen.size + "/" + r.total, 8) +
              num(r.reach + "%", 7) + "  " +
              pad(r.resolved ? r.resolved.replace(/^f1_/, "") + " @" + r.resolvedAt : "-", 20) +
              pad(r.settled ? r.settled + " @" + r.settledAt : "-", 24) + r.ended);
});

/* THE METERS AT THE CLOSE, because "it ended" is not a finding and
   "it ended with friction at 96" is. */
/* `confidence` is DERIVED and never stored (bible 7.6), so it is read
   through the engine rather than off the scalars, where it is always
   undefined - the first table printed a column of nothing for it. */
const METERS = ["party_loyalty", "public_standing", "consumables",
                "thermal_margin", "solvency", "legitimacy", "friction"];
console.log("\n  where each run finished");
console.log("  " + pad("strategy", 34) + num("conf", 9) +
            METERS.map(m => num(m.slice(0, 7), 9)).join(""));
console.log("  " + "-".repeat(92));
runs.forEach(r => {
  console.log("  " + pad(r.strategy.name, 34) +
    num((function () { try { return Engine.confidence(r.st); } catch (e) { return "-"; } })(), 9) +
    METERS.map(m => num(r.st.scalars[m] == null ? "—" :
      (m === "solvency" ? Math.round(r.st.scalars[m] / 1000) + "k" : r.st.scalars[m]), 9)).join(""));
});

/* AND THE MONEY AT THE CLOSE (design/39), because a run that reached the
   count owing a tenth of output with the dollar down a fifth is not the
   same run as one that reached it square. */
console.log("\n  the money at the close");
console.log("  " + pad("strategy", 34) + num("reserve", 9) + num("debt", 9) + num("of out", 8) +
            num("arrears", 9) + num("inflat", 8) + num("rate", 7) + num("dollar", 8) + num("gap", 7));
console.log("  " + "-".repeat(92));
runs.forEach(r => {
  const b = Engine.budget(r.st, CONTENT), m = Engine.macro(r.st, CONTENT) || {};
  const bn = n => (n / 1000).toFixed(1) + "bn";
  console.log("  " + pad(r.strategy.name, 34) + num(bn(r.st.scalars.solvency || 0), 9) +
    num(bn(b.debt), 9) + num(b.debtPct + "%", 8) +
    num(bn((r.st.macro && r.st.macro.arrears) || 0), 9) +
    num(m.inflation == null ? "-" : m.inflation + "%", 8) + num(m.rate == null ? "-" : m.rate.toFixed(2), 7) +
    num(m.fx == null ? "-" : m.fx.toFixed(3), 8) + num(m.gap == null ? "-" : m.gap, 7));
});

/* WHAT NOBODY REACHED. The most useful column in the whole tool: content
   that no strategy ever saw is content the player will not see either. */
const reached = new Set();
runs.forEach(r => r.seen.forEach(id => reached.add(id)));
const missed = (CONTENT.events || []).filter(e => !reached.has(e.id));
console.log("\n  events no strategy reached: " + missed.length + " of " +
            (CONTENT.events || []).length);
if (missed.length) {
  missed.slice(0, 18).forEach(e =>
    console.log("      " + pad(e.id, 26) + (e.title || "").slice(0, 58)));
  if (missed.length > 18) console.log("      ... and " + (missed.length - 18) + " more");
}

/* ---------- the record a tester pastes back ---------- */
if (WANT_LOG !== null) {
  /* BY ID OR BY ANY PART OF THE NAME, and an unknown one is refused. It fell
     back to the first strategy without a word, so asking for "Last option"
     printed "First option" and three transcripts came back identical. */
  const want = WANT_LOG.toLowerCase();
  const r = runs.find(x => x.strategy.id === want) ||
            runs.find(x => want && x.strategy.name.toLowerCase().includes(want));
  if (!r) {
    console.log("\nno strategy matches --log " + JSON.stringify(WANT_LOG) + "; ids are " +
                runs.map(x => x.strategy.id).join(", "));
    process.exit(1);
  }
  console.log("\n" + "=".repeat(96));
  console.log("TRANSCRIPT — " + r.strategy.name);
  console.log("  " + r.strategy.note);
  console.log("=".repeat(96));
  r.marks.forEach(m => console.log("  sitting " + num(m.at, 3) + "   " + m.text));
  console.log("\n  " + r.ended + ", at sitting " + r.endedAt + ".");
  (r.st.log || []).slice(-12).forEach(l =>
    console.log("      " + (l.text || "").slice(0, 88)));
}

console.log("");
