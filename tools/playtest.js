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

const files = ["content/setup.js","content/parties.js","content/stations.js",
  "content/constituencies.js","content/cabinet.js","content/instruments.js",
  "content/initiatives.js","content/minutes.js","content/functional.js",
  "content/labour.js","content/names.js","content/characters.js","content/bills.js",
  "content/events.js","content/glossary.js","content/encyclopedia.js",
  "content/business.js","content/settlements.js","content/actors.js","content/index.js"];
vm.runInThisContext(files.map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n") +
                    "\n;globalThis.__C = CONTENT;");
const CONTENT = globalThis.__C;
const Engine = require(path.join(root, "js", "engine.js"));

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const SITTINGS = Number(arg("--sittings", 60));
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
  /* supply first, for a government that wants to survive the rise */
  const order = (CONTENT.bills || []).slice().sort((a, b) => {
    const s = (x) => (x.test === "supply" ? 0 : 1);
    return strategy.budget ? s(a) - s(b) : s(b) - s(a);
  });

  /* divide on whatever will carry, before spending anything */
  for (const b of order) {
    const bs = st.bills[b.id];
    if (!bs || bs.dead || bs.stage !== Engine.DIVIDES_AT) continue;
    try {
      const r = Engine.divide(st, CONTENT, b.id);
      if (r) acts.push((r.carries ? "carried " : "lost ") + b.title);
    } catch (e) { /* not divisible yet; the engine said so */ }
  }

  /* then move something along, while there is time to do it with */
  let budgetSlots = strategy.slotsPerSitting == null ? 2 : strategy.slotsPerSitting;
  while (budgetSlots-- > 0 && st.slots.used < st.slots.total) {
    let moved = false;
    for (const b of order) {
      const bs = st.bills[b.id];
      if (!bs || bs.dead || bs.stage === "assented") continue;
      const r = Engine.grantSlot(st, CONTENT, b.id);
      if (r && r.ok !== false) { acts.push("time to " + b.title); moved = true; break; }
    }
    if (!moved) break;
  }
  return acts;
}

const STRATEGIES = [
  { id: "first",   name: "First option, supply first",
    note: "What a player does when they have stopped reading, but who does pay for the government.",
    budget: true, pick: () => 0 },
  { id: "last",    name: "Last option, supply first",
    note: "The other end of the same non-decision.",
    budget: true, pick: (e) => e.choices.length - 1 },
  { id: "cycle",   name: "Cycles the options, supply first",
    note: "Reaches more of the content than either end does.",
    budget: true, pick: (e, st, n) => n % e.choices.length },
  { id: "prog",    name: "Programme first, supply last",
    note: "Spends its order paper on its own bills and leaves the budget to the end. The oldest way to lose.",
    budget: false, pick: (e, st, n) => n % e.choices.length },
  { id: "idle",    name: "Answers, governs not at all",
    note: "Never grants a slot and never divides. The floor.",
    budget: true, slotsPerSitting: 0, pick: () => 0 },
  { id: "cheap",   name: "Cheapest option, supply first",
    note: "Never spends a slot on an ANSWER if it can avoid one.",
    budget: true,
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
    budget: true,
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
  let settled = null, settledAt = null;

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
      else { picks++; note(e.title + " — " + (e.choices[took].text || "#" + took)); }
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
    if (!settled && st.settledAs) {
      settled = st.settledAs; settledAt = st.sitting;
      note("-- settled: " + st.settledAs);
    }
    const end = Engine.checkEnd(st, CONTENT);
    if (end && end.over) {
      ended = end.kind + (end.reason ? ": " + end.reason : "");
      endedAt = st.sitting; break;
    }
    Engine.advance(st, CONTENT);
  }

  const total = (CONTENT.events || []).length;
  return { strategy, st, seen, marks, picks, refused, settled, settledAt,
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
            "  " + pad("settled", 26) + "outcome");
console.log("  " + "-".repeat(92));

const runs = STRATEGIES.map(s => play(s, SITTINGS));
runs.forEach(r => {
  console.log("  " + pad(r.strategy.name, 34) + num(r.endedAt, 5) + num(r.picks, 7) +
              num(r.refused, 6) + num(r.seen.size + "/" + r.total, 8) +
              num(r.reach + "%", 7) + "  " +
              pad(r.settled ? r.settled + " @" + r.settledAt : "-", 26) + r.ended);
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
  const r = runs.find(x => x.strategy.id === WANT_LOG) || runs[0];
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
