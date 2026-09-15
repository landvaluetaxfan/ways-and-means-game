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

## T1 — [ ] Bills get people on them

A bill carries `owner`, which is a **party**. There is no person anywhere on a
bill. Fifty-four characters exist and exactly one has ever appeared in an
event, so nobody in this parliament has put their name to legislation.

Add to each of the seven bills in `content/bills.js`:

```js
author:     "character_id",        // the member in whose name it stands
cosponsors: ["character_id", …],   // 0–4
```

Rules that make this load-bearing rather than decorative:

- **The author is a person and `owner` stays the party, and they may
  disagree.** A backbencher's bill that their own party is lukewarm on is the
  most interesting case available and there should be at least one.
- **At least two bills take a cosponsor from outside the author's party.**
  Cross-party sponsorship is the cheapest possible signal of where a measure
  actually sits, and the only cheap way to show the chamber agreeing on
  anything.
- A **minister** as author means the government owns it. A **backbencher**
  means it does not. Use both.
- §2.7: the character roster is FROZEN. Every id must exist in
  `content/characters.js`. Do not invent a person.

## T2 — [ ] Descriptions that explain the politics, not the mechanism

A bill has `summary` (what it does) and `effectNote` (what follows). A player
reads *"Changes the law on divergence threshold hours"* and learns nothing
about why anyone cares.

Keep both, add a third:

```js
contested: "…"        // one short paragraph
```

**The case for and the case against, and neither written to win.** Name who
benefits, who pays, and what the honest objection is. If a reader can tell
which side the writer is on, it is not finished.

The register, from bible §9.1 on the player's own party:

> the Commons Union's restrictionism is a correct reading of material interest
> rather than prejudice, which is exactly what makes the player's own party
> uncomfortable rather than villainous

Both things true at once, and the game declining to resolve it.

§2.6 still binds: `contested` explains the politics of a mechanism already
introduced. It must not introduce a second mechanism.

## T3 — [ ] The references that make it a document

While in each bill, check `ref` reads like a real paper number and `title`
follows §3.9's naming scheme. The bill dossier is going to be headed like an
in-world instrument and these are the lines that will sit under the letterhead.

---

## T4 — [ ] The event pool, 24 → 55

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

## T5 — [ ] Quiet-sitting lines, 51 → 80

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

## T7 — [ ] Currents for the parties that should have them

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

## T13 — [ ] The substrate roster  ·  **do this second, after T4**

**Promoted to the top half of the list on 15 September.** It was not on this
list at all; it turned out to be the prerequisite for a whole section of
`design/26` and an unintended claim about the polity. `design/27` §C has the
full argument and the measurements. The short version:

The population is specified in full — 35 stations, four-way `composition` each,
per-station to four decimal places, weighting to **biological 64.0% · emulation
28.0% · uplift 4.0% · synthetic 4.0%** over 7,086,000 people.

**Of 54 members of the House, zero carry any substrate field.** The character
record is `id, portrait, name, role, party, seat, relationship, office, note,
functional`. One independent's free-text `note` mentions augmentation. That is
the entire substrate content of the legislature.

So the House currently reads as 100% default-embodied-root in a Commonwealth
that is 28% emulated, and it reads that way *by silence*, in a game whose
subject is who counts as a person.

Add to every character in `content/characters.js`:

```js
category: "biological" | "uplift" | "emulation" | "synthetic",
status:   ["instance", "suspended", "unattested", "disembodied"],  // any, usually none
```

Four rules:

1. **Bible §6.10's clean structure, not the law's broken one.** Category is
   what you are made of; status is what relation you stand in. The *schedule*
   the characters argue about still lists five categories in one list, and that
   conflation is a deliberate founding defect the courts keep patching — keep
   it in the world, not in the data.
2. **Augmented, interfacing, cyborg are not categories.** They are a
   `biological` with statuses, or with nothing at all and a line in `note`.
   Cat ears are a `note` and that was correct.
3. **Do not make the House proportional.** A legislature that mirrors its
   population is a default; one that does not is a grievance with a number on
   it. The bible describes the Public Substrate Association as *"young,
   emulation-heavy, list-tier strength and almost no district seats"* — so
   districts return the embodied and the list tier is where the emulated get
   in. Make the roster confirm that sentence. Write down the figure you land on
   in a comment at the head of the file so the next person can check it.
4. §2.7: the roster is FROZEN. This adds fields to existing people. Do not
   add, remove or recast anyone.

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
