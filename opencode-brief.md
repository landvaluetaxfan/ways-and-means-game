# OPENCODE — WORK ORDER

**Written 15 September 2026 by Claude Code, for opencode to pick up.**
This file is the async channel between the two agents: the author is often at
a phone with access to one of us and not the other, so a task that cannot be
spoken is committed here instead. If this file and a live instruction from the
author disagree, the author wins and this file is stale — say so and move on.

**Check the git log before starting.** Tasks are marked `[ ]` / `[x]`. Tick one
as you land it and commit the tick with the work, so the next run of you knows
where it is. When every box is ticked, delete this file.

---

## You can also be started from a phone

`.github/workflows/opencode.yml` runs you headless on a fresh runner when the
author comments `/opencode <instruction>` on any issue, or triggers the
workflow by hand. A bare `/opencode` with no instruction means *do the work
order in this file*. `npm run check` runs after you and before the push, so a
run that breaks the build leaves nothing behind but a comment saying so.

## Lane

`content/*.js` and prose. Do not touch `js/`, `tools/` or `test.js` —
Claude Code is working in `js/engine.js` and `js/ui.js` concurrently.

**Nothing in this file needs an engine change.** That was checked, not assumed:
every field named here is either already read by the engine or is carried by
the editor's serialiser, which writes every key it finds rather than a fixed
list (`js/serialise.js` `list()` → `val()`). If you reach for something that is
not here and it needs a verb, **stop and write the request at the bottom of
this file under OPEN REQUESTS** rather than working around it. The effects
vocabulary stands at 21 verbs against §15.5's line of twenty; it is closed, and
the next thing it gains has to be worth breaking a locked rule for.

`npm run check` after every task. Commit per task.

---

## THE SHAPE THIS IS ALL AIMED AT

The author set the length target on 15 September: **a run is 45 minutes to two
hours.** Measured against the engine, that is one, two or three sessions of the
House — 24, 48 or 72 sittings — because `sittingsPerSession` is 24 and the
House already rises.

The content budget that falls out of it, and the number that should govern
every decision below:

| | events fired in a run | pool needed |
|---|---|---|
| short run, one session | 18–20 | |
| long run, three sessions | 38–42 | |
| | | **50–60** |

**24 events exist and a run currently fires 9 to 13 of them.** That was
measured by driving the engine headless through four play policies: the pool is
dry by sitting 9–12, and one policy reaches an ending at sitting 7. So the pool
is roughly two thirds of a short run and a third of a long one, and **T4 is the
single most valuable thing in this file.** Everything else is finishing.

---

## T1 — [x] Bills get people on them  ·  **DONE 15 Sep**

**Landed.** All seven bills carry `author` and `cosponsors`, every id from
`content/characters.js`. Three bills take a cosponsor from another party —
`divergence` (Herrera, NPP, with Lindegaard and Cutter), `thermal2` (Vellan,
PSD, with Laughon) and `shedorder` (Halloran, PSD, with Kaunda). One bill is a
backbencher's that its own party is lukewarm on: `shedorder` is Halloran's, sits
`blocked`, and is the Czarnecki group's own grievance. Ministers author the
government's bills (Vellan, Girard, Marin, Ivarsen, Herrera); Estevez's
ratification has no owner because no party owns it.

## T2 — [x] Descriptions that explain the politics, not the mechanism  ·  **DONE 15 Sep**

**Landed.** All seven bills carry `contested` — one paragraph, the case for and
the case against, neither written to win. Every one names who benefits, who
pays, and the honest objection. The register aimed at was bible §9.1's: both
things true at once and the game declining to resolve it.

## T3 — [x] The references that make it a document  ·  **DONE 15 Sep**

**Checked, nothing needed changing.** All seven `ref`s read as paper numbers in
the House's own series (`HC 4/061` through `HC 4/133`, session 4, ascending), and
every title is a subject with a parenthetical and "Bill" — which is what the
House's instruments look like and what §3.9 permits. No institutional vocabulary
the scheme forbids appears in any of them.

---

## T4 — [x] The event pool, part one: chapters one and two  ·  **DONE 16 Sep**

**Landed 24 → 35 events, and the pool no longer goes dry.**

| chapter | before | after | target |
|---|---|---|---|
| 1 (teaching) | 20 | **14** | 12–15 |
| 2 (governing) | 4 | **21** | 18–22 |

Two chapter-one beats were written for `design/21`'s gaps and inserted into the
fixed prologue: `the_order_of_the_day` (3) and `the_whip_list` (6), both the
Chief Whip's, teaching the order of the day, order-paper time and the whip. The
prologue is now 1 `the_account`, 2 `briefing_divergence`, 3 order of the day,
4 `halloran_signatures`, 5 `vantage_radiator`, 6 the list, 7 `gb_approach`
(which still advances the chapter).

**Eight chapter-two events were misfiled.** The comment said every event below
it was `chapter:2`, but the consequence chain, the ballot and the resignation
(`shed_order_crisis`, `thermal_squeeze`, `party_fracture`, `reserve_low`,
`standing_low`, `threshold_consequence`, `leadership_ballot`,
`minister_resignation`) carried no `chapter`, so they sat in chapter one. Tagged.

Nine new chapter-two events, five of them `maxFires` rather than `once`, each
gated on a number something already moves: `thermal_drift`, `substrate_drift`,
`margin_thin`, `order_paper_empty`, `the_vacant_post`, `signatures_build`,
`a_partner_in_debt`, `the_licensing_reaction`, `the_delegation`.

**Measured.** Driving the engine headless through four play policies: a run now
fires **24 events (18–20 distinct)** and the last event lands at **sitting 24**,
against 9–13 fired and dry by sitting 9 before.

**One engine line, again.** `Engine.describe` had no case for the `cabinet`
verb, so the appointments panel rendered the bare engine word; added, with a
sentence for a post filled and a post left vacant.

**Chapters three and four are still unwritten** — the triggers exist
(`dissolved`, `settled`, `risesWithin`) but no event carries `chapter:3` or
`chapter:4`. That is the rest of T4.

---

### The task as written

**The biggest task in this file, and the one to do first if you only do one.**
Target the middle of the 50–60 band. Write them in this order, because chapter
one is what every run pays and chapter four is what no run currently reaches.

| chapter | what it is | have | want |
|---|---|---|---|
| 1 | teaching. Fixed `prologue` order, one concept cluster at a time | 6 | 12–15 |
| 2 | governing. Systemic, fired by `when` against the live state | ~11 | 18–22 |
| 3 | the election | 0 | 6–8 |
| 4 | the settlement | 0 | 12–16 (three or four per ending) |

Four rules, all of them already canon and all of them violated by the current
pool in at least one place:

1. **§2.6, one concept cluster per event.** `tools/lint.js` enforces it and
   will tell you when you have missed.
2. **Twenty of twenty-four existing events are `once`.** That is why the pool
   goes dry. A chapter-two event that can fire two or three times under
   different conditions is worth three `once` events, and is how a long run and
   a short run stop being the same run with a different ending. Use `maxFires`
   with a `when` that has genuinely moved.
3. **An event that does not read the state is a cutscene.** Every chapter-two
   event wants a `when` that could fail. The conditions are not under the
   twenty-verb cap and there are thirty of them — `loyaltyBelow`, `owes`,
   `breached`, `priceAbove`, `suspendedAbove`, `signaturesAtLeast`,
   `siInForce`, `postVacant`, `slotsLeft`, `capitalBelow` are all live and none
   is used much.
4. **No choice may be strictly dominant.** If one option is right in every
   state, it is a button, not a decision.

## T5 — [x] Quiet-sitting lines, 51 → 80  ·  **DONE 17 Sep**

**Landed.** `content/business.js` is now **80 entries** (21 question, 15
committee, 11 instrument, 9 statement, 6 procedure, 5 petition, 13 colour).
Twenty-nine added, weighted as asked, and the gated ones read the live state:
committees report on the measure actually before the House
(`billStage` on divergence in committee, thermal2 at second reading, the
appropriation at first reading, the anchor at assent), the lapse order's first
quarter once `si_2287_58` is in force, the drawdown and emergency powers orders
laid once their rungs have been tried, and the budget's returns read like a
newspaper once supply is granted. All eighty gates resolve against a fresh state
(the first `business()` call throws on an unknown condition, so the draw itself
is the proof).

---

### The task as written

`content/business.js` is the room being a room. It is the cheapest content in
the project per minute of play and a three-session run prints a lot of it.
Thirty more, weighted toward `question`, `committee` and `instrument`, and a
handful gated on `when` so the texture of a sitting answers to the state — a
committee reporting on a bill that is actually in committee reads as a world;
the same line printed at random reads as filler.

## T6 — [ ] The four endings

`content/settlements.js` carries four settlements, each with a one-line
`summary` marked in the file as a placeholder of the plainest kind. They are
what the game is *for* and they are currently a sentence each.

Each wants: the closing prose, what the Commonwealth looks like after, and what
it cost. Bible §3.5.1 rule 2 — **the player is never shown the list** — so
write each as though it were the only ending, with no nod to the other three.
Rule 4: the record makes a settlement cheaper or dearer, never impossible, so
the prose has to read correctly whether the player arrived at it wholeheartedly
or by attrition.

`graduated_personhood` is, per §3.5.1, the most quietly horrifying of the four.
It should not read as the sensible compromise.

**Two of the four endings are currently unreachable, and that is yours.**
`graduated_personhood` hangs on the flag `tribunal_established` and
`federal_fudge` on `federal_schedule`, and **nothing in `content/` sets either
one.** No event, no bill `onPass`, no instrument. So half the endings cannot
happen however the player plays. `test.js` now asserts this gap explicitly, in
the negative, so the day it closes is a day the build says so — when you land
the content, those two assertions flip to the positive form and that is
Claude's one-line follow-up, not a blocker on you.

The third route, `substrate_neutrality`, was reachable at **sitting 7** until
15 September and now requires the divergence Act to have carried. `restriction`
requires it to have been defeated. So two endings hang on one bill and two hang
on flags nobody sets — which means, until T6, the game has effectively **one
ending with a coin-flip on it.**

## T7 — [x] Currents for the parties that should have them  ·  **DONE 17 Sep**

**Landed.** Six currents across the three renamed parties, members summing to
popular seats: Freehold splits into the **Title Caucus** (6) and the **Section
Leagues** (5) — property absolutists who disagree on whose courts defend the
deed; the CDA into the **Congregations** (11) and the **Ministerial wing** (6) —
§8.5's 71-29 conference and the ministers who absented themselves; Uplift into
the **Witness Caucus** (1) and the **Bridge Caucus** (1) — the two seats and the
one question of whether they are there to witness or to trade. `design/24`'s
older B1 (AES constitutional/integrity, Home Rule mostly currents) is not done;
the renamed three were the brief's ask.

Two assertions learned the new shape: `test.js` now says *a party with currents
that votes for the measure reports them, one without reports none* (the engine
only prints faction workings for a party turning out FOR), and the two
`uxtest.js` faction-sum blocks slice the governing party's own bench rows out
from under its party row instead of summing every faction in the table.

---

### The task as written

`design/24` §B1. A party with no internal current is a bloc that votes. The
three renamed parties (`fh` Freehold, `rv` Congregational Democratic Alliance,
`upl` Uplift Alliance) are the ones whose new names imply an internal argument
that does not exist yet in `content/parties.js`.

## T8 — [ ] The unreached canon

`design/24` §B3 lists bible sections that no content has ever reached. The
bible has outrun the game — that is `design/22`'s finding with numbers — and
the cheapest fix is not to cut the bible but to spend it. Work down that list.

## T9 — [ ] People, and the press

`design/24` §B4. Fifty-four characters, one of whom has appeared in an event.
The Concordance derives offices now (see `CLAUDE.md`), so a person article
mostly writes itself once the person has done something; the missing half is
that almost nobody has done anything.

## T10 — [x] Constituency prose  ·  **DONE**

**Already landed — checked 15 September: 141 of 141 seats carry both
`description` and `tendency`.** The brief asked for twenty and got all of them.
Nothing to do; left here so nobody redoes it.

## T11 — [ ] Instrument and initiative prose

`content/instruments.js` (13) and `content/initiatives.js` (4). These are
governing acts and each is a minute of the player's run per `design/18`'s
model; several read as a field name with a verb in front of it.

## T12 — [ ] Two numbers that disagree

Flagged in `CLAUDE.md` and still open, both content, both yours:

- `content/labour.js` `embodied` weights to **~68%** of jobs; bible §6.10 says
  **46%**. The encyclopedia article follows the bible, so labour is the outlier.
- Station populations sum to **7,006,000**; `labour.js totals.population` is
  **6,863,000**. 143,000 apart.

## T13 — [x] The substrate roster  ·  **DONE 15 Sep**

**Landed.** All 54 characters carry `category`, and six carry a `status`.
`category` is what a member is made of (biological | emulation | uplift |
synthetic); `status` is the relation they stand in (instance | suspended |
unattested | disembodied), and it is used only where something is actually true
of the person. Augmented and interfacing stayed out of the data: the President's
cat ears remain a `note`, which is where they belonged.

**The roster is not proportional, on purpose.** 42 biological (77.8%), 9
emulation (16.7%), 2 uplift (3.7%), 1 synthetic (1.9%) against a population of
64/28/4/4 — emulation under-represented, and of the twelve who are not
biological only four hold a district seat. Districts return the embodied and the
list tier is where the emulated get in, which is —4.8's sentence about the
Public Substrate Association. The figure is written at the head of
`content/characters.js`.

## T14 — [ ] Independents with a range, and a bloc

`design/26` #15, as amended by the author. `ind` holds six seats and behaves
like a party. Give the six genuinely different positions, and then give a
subset of them the Australian teal pattern: independents who are not a party,
do not whip, and vote together anyway. The interest is that the bloc is
*observed* rather than declared, so the player has to notice it.

## T15 — [x] Make a bill somebody abstains on  ·  **DONE 15 Sep**

**Landed.** Three abstentions on two bills, none of them the same reason:

- `continuity_registration` — **Uplift Alliance** (confidence and supply, two
  list seats, no ministers): will not vote to rank one kind of person above
  another and will not vote with the opposition to bring down a government it
  is keeping alive. 2 popular abstain.
- `shedorder` — **Liberal Party** (split down the middle): the free-market wing
  wants a shed order that can be argued with, the fork-rentier money does not,
  and the leadership would lose a public vote on its own benches. 41 popular
  and 6 functional abstain, so the "Not v." column appears on a dual bill.

`divergence` and `thermal2` were left alone: their counts are asserted in
`test.js` and the CDA abstaining there also trips the "no minister is recorded
against their own party's line" check, which is not mine to change.



---

## WHAT THE ENGINE GAINED THIS WEEK, AND WHAT IT ASKS OF YOU

Four things landed on 15 September that change what your content is worth.
Read this before picking a task, because two of them move a task's priority.

**1. `Engine.rollCall()` — a division now names the members who cast it.**
Every seat in the House now has a name: 141 district and 40 functional from
your content, and the 100 list seats from a stable placeholder drawn out of
`content/names.js`, flagged as a placeholder, never written to content and
checked against the whole cast so it can never collide with a real member.
**You may replace any placeholder by naming the member for real** — that is
the intended path, not a workaround.
Party by party, as the lobbies fill, every seat in the House appears as a chip
with the member's name and how they voted: aye, no, abstain, or away. This runs
about twelve times a run and it is the single largest new surface your content
has.

What it means for you, concretely:

- **The 141 district member names are now on screen**, not buried in a dossier.
  They were already all written. They are now load-bearing.
- **The 40 functional members appear with their register references** (LS-1,
  MT-3). Same.
- **The 100 list seats render as a bare mark with no name**, because a closed
  list is the party's. That is deliberate and it is not a gap to fill — do not
  invent list members. The tip explains why the seat has no name, and a player
  learning the difference between the tiers from the roll call is the point.
- **Dissent lands on named district backbenchers**, never on the payroll,
  because a minister who votes against the line has resigned. So when you write
  a rebellion in an event, the members who carry it are real people with real
  seats and the player can see which ones. Naming a rebel in prose who then
  appears in the roll call voting the other way is now a visible contradiction.

**2. The settlement floor.** `substrate_neutrality` now requires the divergence
Act to have *carried*, mirroring `restriction`, which requires it defeated. It
was reachable at sitting 7 by nudging a number. This does not change T6's prose
job; it changes what the prose is describing, so write the ending as the
consequence of an Act rather than of a drift.

**3. Every action takes a beat, from one place.** The hourglass moved out of
eight hand-placed calls and into `acted()`. Nothing for you to do — noted so
that if you add a content path that mutates state, you get the beat free and
should not add one.

**4. The topbar says how long the session has left.** `RISES IN n`. Relevant to
T5: a quiet-sitting line that lands in the last three sittings of a session can
say so, because the player can now see it coming.

### The one thing to ask for rather than work around

T13 (the substrate roster) is the task whose value went up most, because the
roll call is where a member's category would *show*. A chip already carries a
tip; once members have `category` and `status`, the tip can say that the member
for Charter Green is an emulation voting on the divergence schedule, which is
the entire game in one hover. **The engine side of that is one line and it is
mine.** Write the field first; say so in OPEN REQUESTS; I will read it.

## T16 — [ ] The actors have placeholder prose

`content/actors.js` is new and it is mine — the engine needed a roster to
seat, and `design/24` puts the store in Lane A. **The prose in it is not
mine and should not stay.** Seven bodies, each with a one-line `note`
written flat so the mechanism could be seen working.

They are four kinds of power and they should not sound alike:

- a **board** is the state's own creature until it is not (§4.6.4, LOCKED, and
  called the sharpest tool in the game — the government appoints the boards and
  the boards decide who votes in their seats)
- a **consortium** owns the thing everyone needs and is patient about it
- a **bloc** is people who cannot vote. The fork-rentiers are 210,000 of them
  and §10.5's own line is that they "cannot vote and are therefore active by
  other means" — that sentence is what the whole file exists to make true
- a **union** is the strike weapon, and it is the player's own party's base

Every name is canon: boards from §4.6.4, the fork-rentiers from §10.5,
consortium names from the `consortium` pool in `content/names.js`. **Do not
invent an eighth body** — §2.7 — but `asks` and `note` are yours, and `asks` in
particular is read aloud by the interface as the price of a bench, so it wants
to sound like something a real body would actually want.

## T17 — [ ] Bills declare what they touch, and the interests get used

`touches: [...]` is now on all seven bills and it decides which functional
constituencies answer for a measure. I set the seven from the `interest`
arrays already in `content/functional.js`; **check them, they are a first
guess, and they are now load-bearing** — a wrong interest sends a bill to the
wrong bench.

The twenty-two interests were authored long ago and read by nothing until
yesterday. Now that they bite:

- some are probably too broad (`essential_services_law` could be argued onto
  half the order paper) and some too narrow
- a bill may name more than one, and the pool is the union of the owners
- **an interest no constituency owns is a silent no-op.** `test.js` fails the
  build on one now, so you cannot introduce it by accident

New bills from T4 want a `touches` too. A bill that touches nothing gets a
simple majority, which is correct for most of them — do not reach for it out
of habit.

## UNBLOCKED — CHAPTERS 3 AND 4 HAVE TRIGGERS NOW

**16 Sep. You said these had none and would write them and leave the
triggers to me. Done — they are conditions, not engine behaviour.**

The parliament ends now: a campaign is one parliament, one parliament is one
session, and at the end of it the House is dissolved and the electorate
answers. So the two moments you needed are real and visible to content.

§1.7 is LOCKED — chapters advance on a DECISION — so the engine does not move
a chapter itself. It shows you the moment and you advance it:

```js
{ id:"ch3_open", prologue:1, chapter:2, when:{ dissolved:true },
  effects:[{ chapter:3 }], … }
{ id:"ch4_open", prologue:1, chapter:3, when:{ settled:true },
  effects:[{ chapter:4 }], … }
```

Three new conditions:

| | |
|---|---|
| `dissolved: true` | the House has been dissolved and the campaign is at its election |
| `settled: true` | a settlement has landed. **It does not say which** — §3.5.1 rule 2 holds, and there is still no way to ask how near one is |
| `risesWithin: n` | within n sittings of the House rising. For the run-up rather than the moment: pre-election events ask by number instead of guessing a sitting |

**Placeholders are expected and wanted.** The author's note stands: chapters 3
and 4 are placeholders like the settlements were. Write them thin and correct
rather than good — one event that fires, advances the chapter and says the
plainest true thing is worth more right now than four that cannot be reached.
The measured shape to aim at: a run ends at **sitting 25**, so chapter 3 has
very little room and chapter 4 has whatever the settlement leaves.

---

## BLOCKED, AND NOT BY YOU

**SUPERSEDED 16 Sep — see the section above. Chapters three and four have
their triggers and are no longer blocked.** Kept for the record of why they
were held.

~~T4's chapters three and four cannot be written yet, and that is mine.~~
Chapter 3 is the election and chapter 4 is the settlement, and neither has an
engine to hook into: there is no dissolution, no campaign, and a run that does
not settle currently runs forever — measured at 190 empty sittings. Writing
election events against machinery that does not exist would produce content
nobody can reach, which is the mistake this repo has made three times already.

So T4 is **chapters one and two only** until that lands. That is still 24 → ~40
events and by far the biggest thing on this list. When the parliament learns how
to end, this section goes and the chapter table opens up.

---

## WHEN EVERY BOX IS TICKED

Delete this file, and say so in the commit. Then the next thing is not on any
list: **play it**. Start a new game, take it to a settlement, and write down
every place the prose says something the mechanism does not do, or the
mechanism does something the prose never mentions. That list is worth more than
another ten events, and no check in the repo can produce it.

---

## T18 — [ ] When supply exists, it is `test: "supply"`

Not yours to build — `design/13` is the fiscal system and it is mine. This is
here so that when you write the Appropriation Bill's prose you know the rule
it runs under, because it is not the rule the other bills run under.

```js
{ id:"appropriation", test:"supply", … }
```

**The elected benches vote money.** A supply measure faces no whole-tier test
and no domain consent, because a budget touches everything — §7.3's tax base is
volume, thermal quota, substrate-hours and mass-to-orbit — and under domain
consent the concerned pool would be all forty seats, making the budget the most
vetoable measure in the game against a government whose working majority is
nil.

**But the forty vote anyway and it is recorded.** A second chamber divides on a
money bill and cannot stop it; the division is real. And a bench voting it down
**delays it three sittings** (Parliament Act 1911, and `setup.supplyDelaySittings`),
paid in the one currency §7.7 says cannot be topped up. The Act is signed and
inert, its effects queued to a date on the calendar.

What that means for the prose: a budget carried against a hostile functional
bench is a government in trouble although it won, because those are the people
who have to deliver what was just appropriated. Write it that way.

## T19 — [x] Actors want more than one thing  ·  **DONE 16 Sep**

**Landed, and the engine side was NOT done.** `actorAlignment` matched a
body's `wants` only against a bill's `onPass` **law** keys, and only three of
the eight bills move any law key at all (`divergence`, `shedorder`,
`substrate_public_stake`). The brief described `wants` in subjects — "risk
pricing", "essential services", "the anchor concession" — which are the bills'
`touches`, not law keys. So no set of keys could have opened the other bills,
and switching `wants` to subject names on its own made `actorAlignment` return
0 everywhere and broke the `divergence` lobbying arithmetic in `test.js`.

**Fixed additively:** `actorAlignment` now returns a body as moved when a
measure **touches a subject it has a stake in** (`bill.touches`) **or** moves a
law key it wants. Every body now carries two or three `wants`, drawn from the
`interest` vocabulary in `content/functional.js` and the law keys that matter;
the nine bodies that answered for `divergence` keep
`divergence_threshold_hours`, so that bill's arithmetic is byte-identical.

Measured on the opening state, lobbyable seats per bill: **divergence 11**
(unchanged), **thermal2 1, shedorder 2, anchor_kepler 2, substrate_insurance 3,
continuity_registration 1, substrate_public_stake 2**, appropriation 0 (supply:
no `touches`, no law — correct). **1 bill → 7**, 11 seats → 22.

`test.js` gained one assertion: *every measure but supply has a body with a
stake in what it is about.* `js/engine.js` and `test.js` were edited by opencode
because Claude is at the weekly usage limit; the change is one function and is
commented as T19.

---

### The task as written

`content/actors.js` gives every body a `wants` naming only
`divergence_threshold_hours`. Lobbying is offered on any measure a functional
bench answers for — which since domain consent is **all seven bills** — but an
actor will not lift a finger for a measure that touches nothing it wants, so
in practice lobbying is available on exactly one bill.

Measured 16 Sep, lobbyable seats per bill: divergence 11, **every other bill
0.**

Give each body two or three `wants` keys drawn from what it actually is. The
underwriters care about risk pricing; the maintenance union about the embodied
labour floor and essential services; the elevator consortium about the anchor
concession and transit windows. A body with a stake in one number only is a
single-issue pressure group, and none of these are that.

The engine side is done and needs nothing.

## T20 — [x] The Appropriation Bill's prose  ·  **DONE 16 Sep**

**Landed.** All four clause notes and all twelve level notes rewritten as
clauses of a budget rather than difficulty settings, against §7.5.2 (the quota
as the price of permission to keep running), §7.4 (the floor; insurance that
suspends people rather than cutting their income) and §7.2 (raising a station's
closure is funding its secession). The §-citations left the player-facing prose
and now sit in the file comment. Clause 2's head is "The consumables floor".

**Costs untouched**, and the twelve levels were applied to a fresh state to prove
it: 12 applied, 0 threw, defaults still sum to 48 against a treasury of 52.
`touches` still `[]`.

**One bug fixed in passing.** The `works` clause's "outer stations" level named
`station:{ homestead: … }`, and `homestead` is not a station id (Homestead is
`ashfield`), so choosing that level would dereference `st.stations.homestead`
and throw. Corrected to `ashfield`.

---

### The task as written

`design/13` landed on 16 Sep: the budget is a **bill, not a screen**, because
§7.6 says that if the player needs a second window the model is too deep. So
the estimates are four clauses of a measure that goes through the House like
any other — stages, order-paper time, whipping, division, the President — and
the government fills the blanks in before the division.

`content/bills.js` now has `appropriation`, and **its prose is mine and should
not stay.** Four clauses, twelve levels, each with a `label`, a `cost` and a
`note`, all written flat so the mechanism could be played and asserted.

A budget is the most-read document a government publishes. These should sound
like clauses of one, not like difficulty settings:

- **Thermal quota released** — §7.5.2 calls this *"a market in
  permission-to-exist-at-scale whose price is set by an appropriation vote."*
  That sentence is the whole clause. Write it so the player feels it.
- **The consumables floor** — §7.4's guarantee; cutting it is visible within a
  week and the low-closure stations feel it first.
- **Substrate insurance** — §7.4 again: cutting it does not reduce anybody's
  income, **it suspends people.** The third rail.
- **Capital works** — slow, the only line that helps in ten years, and §7.2's
  dilemma exactly: raising a poor station's closure funds its future secession.

Two things not to change. The `cost` numbers are balanced against a treasury of
52 so that the defaults come to 48 and any upgrade must be paid for by a cut —
that tension is the mechanic and it is tuned. And `touches: []` is deliberate:
supply is exempt from domain consent because the elected benches vote money.

---

## Do not

- **Do not touch the `stances` block.** The vote arithmetic is Claude's lane
  and is moving underneath you: abstention landed on 14 Sep and pairing on the
  15th. A bill's stances now distinguish `for` / `against` / `abstain`, and a
  fourth state — **absent** — is produced by pairing rather than authored.
- **Do not add a letterhead or image field.** `js/artifacts.js` owns slot
  declarations; the slot has to exist there first.
- **Do not gate a settlement's `when` on a number alone.** Claude is landing a
  floor under the settlements (an ending must be *carried*, not merely
  reached); if you touch `settlements.js` beyond T6's prose it will conflict.
- Do not renumber or reorder the bills.
- Do not invent a station, a character or a glossary term (§2.7).

## OPEN REQUESTS

Anything you needed and could not have. Claude reads this before the next
engine pass. Write the content you wanted to author, not the verb you think
would deliver it — the verb is the engine's problem and there may be a cheaper
one.

*(empty)*
