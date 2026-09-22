# SWEEP BRIEF — CLOSING THE CONSEQUENCE CHAIN

> **READ THIS FIRST — much of what follows is a RECORD and not a work order.**
> `CLAUDE.md` names this file as "what is being built now" and it had stopped
> being that. Same treatment as `ROADMAP.md` and `AUTHORING_FORMAT.md`: the
> document stays because the reasoning in it is still good, with a header
> saying which parts have been overtaken.
>
> **Out of date below:** the two-lane split (Lane A engine / Lane B content,
> Claude Code and opencode running at once) describes a division of labour
> that is no longer how the work is being done — the lanes have been running
> together on `main` since 21 Sep. Anything in Part 0 about *which* lane is
> open should be read as history.
>
> **Still good below:** the consequence-chain reasoning, the gap analysis,
> and every argument about why a mechanic is shaped the way it is. `design/`
> is intact and `design/README.md` §5 still maps it document by document.
>
> **WHERE THE BUILD ACTUALLY IS (22 Sep 2026).** The interface passes: the
> Economy tab was rebuilt around the fact that the tax bases and the scarcity
> prices are one set of four things; the Party tab is interparty affairs
> rather than a browser of twelve; the Concordance has Wikipedia's register
> and can gain sections as the campaign moves. The canon date settled at
> **11 April 2080** with a **two-decade** history, which `bible.md` §11.1
> holds and which is LOCKED — read it before dating anything. Prose is
> through a register pass: `npm run register` reports zero mechanical habits
> and six adjudicated judgement calls recorded in `PROSE_REGISTER.md`.
>
> **What is next is CONTENT**, which is where the remaining weight is. The
> engine's vocabulary is closed and sufficient; the checks are the only
> playtester until a human one arrives, and they are green at 1,114
> assertions.

**For execution against the repo. Companion to `bible.md` v4 and `design/`.**
Where this brief and the bible disagree on a number, the bible wins and this
brief is wrong — raise it rather than silently diverging.

This supersedes the seat-system brief, closed out in Part A. Its gap list is now
`design/`, mapped document by document in `design/README.md` §5.

---

## PART 0 — WHERE THE BUILD IS

> **THE CURRENT WORK ORDER IS `design/24-the-build-order.md`.** Two lanes that do
> not collide: Lane A is engine (Claude Code), Lane B is content (opencode), and
> Lane B needs no new schema so both can run at once. Read `design/23` for why
> lobbying, actors and polling are one feature and not three. The parts below
> are the record of the sweeps that closed before it.

| | |
|---|---|
| Engine | Substantially complete for governing, deciding and **pacing**. Divisions with dual majority, whipping against a per-partner ledger, statutory instruments with prayer and reversal, cabinet vacancies gating instruments, scarcity prices, the district and functional rolls, elections, undertakings, a seeded PRNG, the derived reading of what a choice does — and since: a **calendar** where a sitting is a day, **order-paper time as a clock** (a division costs a slot, wants a second reading, and the House hears two a day), a queue that carries **a deferred fact and not only a deferred story**, and `checkSettlement()`, so the game can be won. Save migration to **v11**. |
| Content | **21 events**, 7 bills, 13 instruments, 3 initiatives, 51 items of quiet business, 4 settlements. Chapter one is over budget; chapters three and four are unstarted. This is still the project. |
| Plan | `design/` — twenty-four documents. `22` is the measured sweep, `23` the argument, `24` the work order. |

**The ratio is still the risk** (§15.3.6), and `design/22` measured it: 1 of 54
characters appears in an event, 3 of 35 stations, 14 of 31 conditions are used,
and `public_standing` is moved by forty effects and gated by one. The bible is
not outrunning the game any more — it has outrun it, and Lane B is the answer.

---

## PART A — WHAT THE LAST TWO SWEEPS CLOSED

- **The seat system**: the roll is the only source of truth, four verbs move a
  seat, elections reconcile both directions, `nonVoting` carries the capital.
- **The sitting screen**: a choice is a row that expands, carrying a derived
  reading of its own effects, the undertaking it would create, the cabinet's
  reaction, and a commit button that names the act. `when` and `cost` on a
  choice. The decision figure and the hourglass.
- **Undertakings and the docket**: a choice does not perform an act, it
  undertakes to; the act is carried out on the screen that owns it and
  `settle()` notices. No control anywhere marks one done, and `tools/uxtest.js`
  asserts there never will be.
- **The seed**: selection is deterministic given the save. Ties break on a draw,
  `chance` is tested once and remembered, divisions stay exact.
- **`suspendedAbove` / `suspendedBelow`**: the last link of §7.9's chain.
- **The consequence-chain audit** in `tools/lint.js`.

**Vocabulary: 20 effects, 29 conditions.** The `move` consolidation landed —
five number-movers into one namespaced verb, `unflag` folded into `flag`,
`byelection` folded into `vacate_seat` — so the count is back under §15.5's line
with room for the six the plan still needs.

---

## PART B — THE PHASE: CLOSE THE CHAIN

§7.9 is LOCKED and states both the chain and a design rule about it:

```
decision  ->  price  ->  station conditions  ->  event
```

> a `price` effect with no event gated on it is a number nobody sees; an event
> gated on a price nothing moves will never fire.

The first three links work. The fourth barely exists. `npm run lint` now reports
it, and the current build breaks the rule six ways:

```
law.divergence_threshold_hours    moved by 1   gated by 0   NUMBER NOBODY SEES
price.thermal                     moved by 1   gated by 0   NUMBER NOBODY SEES
scalar.party_loyalty              moved by 6   gated by 0   NUMBER NOBODY SEES
scalar.public_standing            moved by 17  gated by 0   NUMBER NOBODY SEES
scalar.treasury                   moved by 3   gated by 0   NUMBER NOBODY SEES
station                           moved by 3   gated by 0   NUMBER NOBODY SEES
```

**Seventeen effects move public standing and nothing in the game is gated on it.**
That is the phase: make the numbers the game already moves into things that
happen to the player.

**This is mostly a content phase.** The engine's share is done.

---

## PART C — OPENCODE'S LANE

`content/*.js`. In priority order.

### C.1 The crisis the bible already promises

§7.9, worked in canon: *"Do nothing and the index climbs until the crisis event
fires at about sitting 19."* It does not exist. Write it: gated on
`priceAbove: {substrate: …}`, arriving as a shed order rather than a headline.

### C.2 One event per broken row above

Six rows, six gates. They need not be six new events — an existing event gaining
a `when` closes a row as well as a new one does. Priorities:

- **`public_standing`** first, since seventeen effects move it. What happens to a
  government nobody supports, and what happens to one everybody does?
- **`price.thermal`**, which is moved and watched by nothing, and is the index the
  whole setting is about.
- **`station`** — `stationBelow` and the new `suspendedAbove` both work now. §7.9's
  worked example is Homestead; `js/coverage.js` reports 31 of 33 stations
  appearing in no event.

### C.3 The escalation ladder

`design/03` §4. Nine rungs before involuntary suspension, each a statutory
instrument or a bill, each gated on the rung above having been tried. **Nine
content entries and zero engine changes** — the most-discussed design problem in
the game turns out to need no code.

Suspension must never be the efficient answer. Today it is free: the engine sheds
7,791 people over forty quiet sittings and nothing reads the number back.

### C.4 Chapter two, and the player character

Chapter two has four events. And before the narrative pass proper, `design/14`
asks for decisions that gate everything else:

- her **record** — three to five acts an opponent could read out;
- the **brief** — what she was elected to do, stated once, in-world, in the first
  two sittings. The game currently has four ways to lose and states no purpose.
- fix her seat: `content/characters.js` says First Spin, §11.2 says Anselm Ring.

### C.5 Currents for the parties that matter

`design/04` §6.5. All four currents belong to the governing party; the other
eleven are monolithic. Now that a current's axes decide who walks through the
lobby, two or three currents inside the **New Progressive Party** (the coalition
partner) and the **Alliance of Business and Government** (the functional bench
that decides every dual majority) turn coalition management into a negotiation
with factions rather than with a bloc.

Content only — the engine needs nothing. **Cap it there.** Thirty currents across
twelve parties is the spreadsheet §7.6 forbids; the value is in the two or three
benches whose internal argument the player has to manage.

### C.6 Two rewordings owed

`content/events.js` carries two mechanical demonstrations flagged in place. The
undertaking's `text` is what the order paper prints and the wording is prose.

---

## PART D — CLAUDE'S LANE

Small, and none of it blocks Part C.

- ~~The calendar~~ — **done** (`design/15`). Sessions end, order-paper time
  refills, unpassed business falls, and a division has a day.
- ~~The `move` consolidation~~ — **done**, along with four pre-existing
  data-loss bugs in the editor that the migration exposed.
- ~~A `brief` field on `content/cabinet.js`~~ — **done**. Cabinet advice keys on
  the ministry that owns a subject before it falls back to party.
- ~~Money, the half that needed no canon~~ — **done**: confidence and supply is
  a distinct whip relationship, and the volume price is continuous.
- ~~The currents vote~~ — **done** (`design/04` §6.5). A party with factions no
  longer resolves as one bloc at one rate: each current turns out at its own
  discipline, and one whose axes disagree with the measure turns out less. The
  four `axes` objects in `content/parties.js` had been read by nothing since they
  were written. The bible's 128 is untouched, because that forecast is stated in
  content rather than derived.

**Two fiscal questions are now decided** and written up in `design/13` §8.3: no
sovereign deficit — the setting has no lender, and the thing a deficit is for is
already `thermal_margin`, which has a physical transmission and a loss condition
— and no budget vote at sitting one, but an **inherited** appropriation as a
document, with the player's own first budget at the session boundary.

**Now blocking, and the author's:** lock §7.5.3, name the unit, and amend
§7.6's treasury line. The exact wording is written out in `design/13` §8.1.
Until it lands, the denominated stock, the Appropriation Bill and a treasury
that is a quantity rather than an index all stay unbuilt.

- **The `move` consolidation** (`design/01`), once the author decides. It touches
  every event and the editor, and it gets more expensive with every event
  written.
- **A `brief` field on `content/cabinet.js`** so cabinet advice keys on the
  ministry that owns a subject rather than only on party. Schema entry plus the
  reader; the values are content.
- **Make the chain audit a hard failure** once Part C closes the rows. It reports
  loudly and passes today, because a check that fails from the day it lands gets
  disabled rather than fixed.
- **Amend §1.5** for the seed, in the words `design/06` §2.1 proposes. The engine
  is already deterministic-given-the-save; the bible has not been told.

---

## PART E — ACCEPTANCE

- `npm run check` green, and `npm run lint`'s consequence-chain table showing no
  `NUMBER NOBODY SEES` and no `EVENT NEVER FIRES`.
- A playthrough that does nothing for twenty sittings meets a crisis.
- Suspension has a political cost that an event delivers, not a scalar.
- `js/coverage.js` reports fewer than twenty stations appearing in no event.

---

## PART F — OUT OF SCOPE THIS PHASE

Foreign affairs (`design/11` — gated on chapter one reaching ~25 events),
lobbying and amendments (`design/07`), the election (`design/10`), knowledge and
scandal (`design/09`), money and supply (`design/13` — a canon decision first).

---

## PART G — SAVE MIGRATION

`STATE_VERSION` is 9. Blocks 8 (undertakings) and 9 (the seed) are ascending and
each stamps only its own version. **Never delete one and never reorder them** — a
descending guard once let a v1 save match `< 4`, get stamped 4, and skip every
earlier block.

---

## PART H — OPEN DECISIONS THIS PHASE RAISES

- **The `move` consolidation.** The author's call; the vocabulary is over budget
  until it is made.
- **§7.5.3 money.** LEANING, and `design/13` recommends locking it, naming the
  unit, and amending §7.6's treasury line. Everything fiscal waits on it.
- **What the player is expected to do**, per `design/14` §4. The game has four
  loss conditions and no stated purpose.
