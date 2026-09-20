# 33 — SIX THINGS THE GOVERNMENT CANNOT YET DO, AND ONE RECORD

**20 September 2026.** Five political mechanisms the build is missing, and a
playtest transcript. Written as a spec because most of these are engine work
wearing content's clothes, and the lane matters: handing the content agent a
task whose mechanism does not exist produces prose nobody can reach, which is
the mistake this repo has made three times.

**Lane is marked per item.** Claude builds every mechanism; opencode writes
every word of what it says. Nothing here should be authored before the
mechanism it needs is in.

---

## 1. The opposition can table a confidence motion — ENGINE, then content

Confidence is currently something the government **loses passively**: the
arithmetic goes wrong, `checkLoss` notices, the run ends. The opposition never
*decides* anything. That makes them a resistance value rather than an actor,
and it is the single biggest reason the chamber feels like weather.

**What it needs.** A division the player did not call. `Engine.divide()` and
the whole forecast/whip apparatus already work; what does not exist is a
division arriving on the order paper from the other side, on a date, that the
government must survive. The clock machinery built on 19 Sep is exactly right
for this: the motion is tabled, it gets a sitting, and it sits on the calendar
as a `division` mark the player can see coming and cannot cancel.

**What makes it interesting rather than punitive:** tabling one costs the
opposition something. A motion that fails strengthens the government — that is
what a confidence vote is *for* — so content should make it a gamble the
opposition takes when the meters say it can win, not a heckle.

## 2. Question Time — ENGINE (small), then content

The one recurring obligation where the opposition acts **on** the player, and
the natural pulse the session is missing. It is also, incidentally, the answer
to the standing complaint that the loop has no schedule: a fixed weekly beat
is a schedule you feel without being told about.

**What it needs.** Almost nothing new. An event with `at:` on a repeating
cadence — which `at` does not yet do, since it holds one sitting. The smallest
honest change is `every: N` beside it, meaning "this sitting and every Nth
after", which `nextScheduled()` can read without a new verb.

**What it costs.** Order-paper time, because everything does. It should move
`public_standing` on the answer and `party_loyalty` on how the benches heard
it, which is what Questions actually decide.

## 3. The reshuffle — ENGINE (small), then content

The most Westminster lever there is, and it is nearly free: `cabinet`,
`appoint` and `vacate` all exist, and `postVacant` is one of the conditions
content has never used. What is missing is the player being able to do it
deliberately, on the Government screen, rather than it happening to her.

**Why it earns its place.** It makes an appointment a *bet* (design/25 §6).
A seat buys a faction's loyalty and silences its most credible critic, and the
resignation, when it comes, is a weapon precisely because they were inside.
Sacking a minister to buy a bloc's votes on a bill is the clearest possible
expression of what this game is about.

**The cost is not a number.** It is the relationship: the sacked minister's
`relationship` collapses, their current's loyalty moves, and they are now on
the backbenches with a reason.

## 4. Patronage — the boards as something you spend — ENGINE

§4.6.4 is LOCKED and calls the licensing boards the sharpest tool in the game:
franchise in a functional constituency runs through professional licensure,
**and the government appoints the boards**. That is written down, and the
player cannot do it.

This is the missing half of the annexation problem found on 20 September. A
bill's `touches` names domains; the functional constituencies concerned with
those domains can block it; and the government's own constitutional answer to
being blocked — appoint the boards — is not in the player's hand. Give it to
her and domain consent becomes a fight rather than a dice roll.

**What it needs.** Board seats as a small, countable resource with a cost in
legitimacy, and a visible ledger of which boards the government has moved.
It should be slow and it should be remembered: packing a board is the kind of
thing an opposition runs an election on.

## 5. Standing is one number, so the election is one number — ENGINE

`public_standing` is national, so the campaign chapter resolves a single
scalar and the annexation's four seats are arithmetic rather than politics.
Standing per BAND (low, middle, ring) is the smallest version that changes
this: it makes a station's closure a political fact, gives the campaign
somewhere to be fought, and makes "who gains those four seats" a question with
an answer.

**Do not model this per station.** Thirty-five numbers nobody can hold in
their head is the failure mode; three is a politics.

---

## 6. THE RECORD — a playtest transcript — TOOLS, and the priority

**This is the one to build first, and it is not a mechanism.**

The build is heading for playtest with a small number of human testers. A run
that ends and leaves nothing behind wastes most of what a tester is worth: you
get "I liked it" and "I got stuck somewhere". The state already carries the
log, the wire, the undertakings, the scalars and a session record. Exporting
them turns one playtester into data — what they chose, on which sitting, what
moved, where they stalled, how it ended.

**And the same thing pointed inward is the balance tool this project keeps
hand-rolling.** In one session on 19–20 September the same headless probe was
written five times: content coverage, the Flash I chain's timing, friction
across a run, whether the Annexation Act carries, which settlement lands
first. A `tools/playtest.js` that plays several strategies and prints one
table answers all five and the next twenty without anybody writing a probe.

**Two outputs, one machine.**

- `npm run playtest` — plays N strategies headlessly, prints a table:
  sittings survived, events reached of the total, chapters reached,
  settlement, ending, and the meters at the close.
- An **export** in the game: the finished run writes a plain-text record a
  tester can paste back. Prose is content's; the format is not.

It has one hard rule: **it reads state, it never writes it.** `nextEvent`
mutates — it pulls a due event off the queue — so any look-ahead runs on a
copy. `lookAhead()` in `js/ui.js` already learned this the hard way and says
so.

---

## Order

6 first, because it makes everything after it measurable. Then 3 and 2, which
are small and change how a session feels. Then 1, which needs the clock. Then
4 and 5, which are the two that change the shape of the game and should not
be built while anything above them is still moving.
