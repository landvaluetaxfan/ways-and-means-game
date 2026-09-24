/* THE GROUND EVERY TEST STANDS ON.

   Two kinds of test, and they must not be mixed:

     test.js                              the ENGINE and the WORLD's content.
                                          Plays the world's view: every
                                          entry with no campaign, none of any
                                          campaign's.
     content/campaigns/<id>/guards.js     one campaign's STORY: its chain,
                                          its tiers, its canon run. Run by
                                          tools/guards.js.

   WHY. test.js used to play Flash I and assert its story among the engine's
   rules, in one script five thousand lines long. A rewrite of Flash I is
   what the author means to do, and the first assertion it broke would have
   thrown and taken every engine test after it down too, so the one thing
   that says "the rules still hold" would have gone dark exactly when the
   story was being changed. A campaign's guards belong to whoever writes
   the campaign: rewrite the story, rewrite its guards; the engine's tests
   do not move.

   Both load content from here, so they cannot disagree about what it is. */
"use strict";
const vm = require("vm");
const LC = require("./loadcontent.js");

let ALL = null;
/* Every campaign's content at once, as the page assembles it. Run in THIS
   context, as test.js always has, so a test may reach a content global. */
function all() {
  if (!ALL) {
    vm.runInThisContext(LC.source() + "\n;globalThis.__C = CONTENT;");
    ALL = globalThis.__C;
  }
  return ALL;
}

/* THE WORLD'S VIEW: what a campaign with no story of its own would play.
   `forCampaign` takes an administration, and this one names no campaign
   any entry is tagged for, so it sees the world and nothing else. */
function world() { return all().forCampaign({ id: "world" }); }

/* One campaign's view, by the id of the administration that opens it. A
   name that is not one is an error, not the whole of content. */
function view(id) {
  const A = all();
  if (!(A.administrations || []).some(a => a.id === id))
    throw new Error("no administration '" + id + "' to build a view for");
  return A.forCampaign(id);
}

/* EVERY VIEW THE GAME CAN PLAY: the world's, and each administration's.
   For the checks that are about CONTENT being well formed rather than about
   what a rule does: "no event opens a fourth chapter", "the count fits the
   campaign". On the world's view alone those pass over every campaign's
   entries, which is the silent kind of pass. */
function views() {
  return [{ id: "world", C: world() }].concat(
    (all().administrations || []).map(a => ({ id: a.id, C: all().forCampaign(a.id) })));
}

/* HOW LONG THE OPENING IS, counted rather than written down. Chapter one's
   prologue beats hold the first sittings of a run, and assertions that
   measure a crisis's date or a canon run's length are really measuring
   that: both went red when the President's commission was added as a new
   first beat, which is a test measuring the tutorial and calling it the
   crisis. */
function prologue1(C) {
  return C.events.filter(e => (e.chapter || 1) === 1 && e.prologue).length;
}

/* And how long a whole run can be: every sitting period of every session,
   the campaign after the writs, and slack. Read from setup, because the
   length is content's and moved from one session to three on 22 Sep 2026:
   the two loops that had it written in as 40 and 38 were the first two
   failures. */
function runBound(C) {
  return (C.setup.sittingsPerPeriod || 24) *
         (C.setup.periodsPerSession || 1) *
         (C.setup.sessionsPerParliament || 1) +
         (C.setup.campaignSittings || 12) + 4;
}

/* A state whose four tax rates are off, so a test of what a sitting DRAGS
   is not also measuring what it earns. */
function noRevenue(st) {
  st.law.rate_volume = st.law.rate_thermal =
  st.law.rate_substrate = st.law.rate_transit = "none";
  return st;
}

/* A NAMED BLOCK OF ASSERTIONS THAT CANNOT TAKE THE REST DOWN WITH IT. The
   block gets its own `ok`; if it throws (an event it names is gone, say),
   that is one failure with the reason, and the next block still runs. For
   a campaign's guards above all: a story being rewritten will throw. */
let failures = 0;
function guard(title, fn) {
  console.log("\n" + title);
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };
  try { fn(ok); }
  catch (e) {
    bad++;
    console.log("  FAIL the block threw: " + e.message);
  }
  if (bad) { failures += bad; process.exitCode = 1; }
  return bad;
}
function failed() { return failures; }

module.exports = { LC, all, world, view, views, prologue1, runBound, noRevenue, guard, failed };
