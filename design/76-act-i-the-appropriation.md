# 76 — Act I: the Appropriation is the spine

**Decided by the author, 5 October 2026.** Act I is built on the Appropriation Bill, not on
the Divergence Threshold Bill. This replaces design/58's "Act I's aim is the inherited one:
carry the Divergence Threshold Bill and keep the coalition". The NPP's price stays canon
(bible §11.1) and stays live, as the bill that competes with the spine; it is not the spine.

## Why

The author asked whether the Divergence bill was really the best piece of legislation to
base the story on. It is the best mechanic (bible §6.4), but a poor Act I engine: Flash did
not choose it, its stakes are a number of hours and a count of future citizens, and its
consequences land in Act II. The Appropriation already carries the spine in the rules:

- It is a supply test by construction (`test: "supply"`). The House rising without it carried
  is a fall (bible §3.5, loss condition 5). The clock is the rise.
- It costs five of the period's six order-paper slots, so a government carries it properly or
  carries one other bill, not both (bible §7.7, the slot arithmetic).
- Its five clauses are the five things the government spends on (`content/bills.js`): thermal
  quota, the consumables floor, substrate insurance, capital works, the transit subsidy. The
  four prices are its clauses' outputs, and the Economy tab already says so. The defaults come
  to CW$48bn voted, against CW$176bn of standing programmes.
- Canon already makes the vacancy a stake: with the Treasury vacant, "officials prepare the
  budget and no minister signs it" (the Concordance's Treasury article).
- The campaign is called *Ways and Means*.

What is missing is the story. Every Act I event is about the Divergence bill, the Hard Left or
Ember Ridge. The Appropriation is a row on the order paper. The work is to make each clause a
bargain someone cares about, and the vote the Act's test.

## The shape

Five fifths, as design/73 and `briefs/story-walk.md` already count Act I, now keyed to the
bill. The three books are the evidence behind the clauses: the **Treasury's** (the figures),
the **engineers'** (the thermal margin and the failing arrays) and the **whips'** (the votes,
including the 40 functional members who delay a supply bill by three sittings).

1. **The Treasury without a minister.** Flash is recommissioned on 11 April, after winning the
   March election (she has been Prime Minister since January; bible §11.1). Ceyhan's question
   is about the books. The first matter is who holds the Treasury.
2. **The three books.** The whips' ledger (`the_order_of_the_day`, `the_whip_list`), the
   engineers' ledger (`gb_approach`, the Ember Ridge radiator) and the Treasury's, which is
   new.
3. **The clauses.** The estimates are drafted. Each clause gets one scene in which someone who
   wants it speaks, drawn from the clause's own effects. The carve-out contested matter
   (`briefs/opening-playable-slice.md`, Batch A) falls before sitting 8. The Divergence bill
   competes for the slots. The Hard Left's signatures arrive here, as the price of what the
   player has chosen.
4. **The consequence.** The stranding at sitting 14, as built, draws on the same estimates.
   Ember Ridge's cascade follows what was chosen in fifth 2. The 240 accounts become "who paid
   for the substrate".
5. **The vote.** A disclosure decision (publish the engineers' figure, or not), Question Time,
   then third reading. A functional objection delays supply three sittings, which is a beat of
   its own. Carried or lost ends Act I, and the first interval opens on the result.

## Constraints

- **Do not change the clauses' costs** (`content/bills.js` says so; they are tuned against
  the reserve of CW$52bn). Scenes inform and pressure the player; the clause panel stays the
  lever.
- New events go at the end of their lists. Judge each batch with
  `node tools/playtest.js --seeds 80`, before and after; keep the canon reachable
  (`npm run guards`).
- The names are frozen (bible §2.7): scenes use the characters and parties that exist.

## Open, for the author

1. ~~Who can hold the Treasury?~~ **Settled: it is the player's choice, among three candidates
   that already exist** in `content/cabinet.js` (design/14 §6.2): **Aster Skye**, Flash's deputy at
   the Treasury (the department stays steady); **Dan Czarnecki**, who leads the leadership
   paper (the challenger brought inside; his character id is `halloran`); **Nadia Abadi** of the CDA (the third partner paid). Their
   notes there are marked placeholder, "opencode's to re-author": that is Claude's to write.
   (An earlier draft of this note listed different options without reading the file.)
2. ~~The name "(Session 4)".~~ **Decided (author, 5 Oct): the bill is "Appropriation Bill 2080"**,
   named for the year, with "(No. 2)" for a supplementary one. Session numbers leave everything a
   player reads; the top bar drops `SESS 4.1` and shows no act label until Stage 4b maps acts onto
   sitting periods. `briefs/appropriation-rename.md`.
3. ~~What forces the vote?~~ **Decided (author, 5 Oct): a hard rise.** Nothing forces the vote;
   the rise is the deadline, and the player brings it when they choose. The reason to wait is
   information: the clause scenes and the three books come before the vote. Act I is not
   lengthened yet; slots are per period, and the length is settled by playtest. Because the
   estimates take five of six slots and the Divergence bill three, the NPP's price cannot be
   carried in the same period: "pay the NPP or pay the officials" is the Act's dilemma.

## Built, 5 October 2026: fifth 1

- **`the_commission`** says the Prime Minister is recommissioned after the March election, and the
  President states the budget rule plainly. **`the_account`** (retitled "The first question") asks
  one neutral question; its three answers keep their flags and effects. Both follow PROSE.md's
  third round (no flourish, neutral openings).
- **`the_treasury`** (the fourth opening beat) offers the three candidates and a fourth, to leave
  the post empty (the old `the_vacant_post` choice, kept so that "leave it vacant" survives). Skye
  is repriced: no money, Hard Left -6, Trades Left -3. The event writes the candidates' effects
  out again, and a guard holds the two copies equal. Abadi has a `role` now, because lint cannot
  gloss a person whose role is empty.
- **The opening is still eight beats**: the divergence briefing, the Treasury, then the order of
  the day. `the_whip_list` moved to the end of chapter two's pool (weight 78), where "Thursday"
  already teaches the same whipping. Adding a ninth beat shifted the schedule by a sitting and
  raised the first-option runs' losses from 10 to 23 of 80, and a no-op beat reproduced all of it.
- **The Treasury is no longer left vacant by every blind run**, so `Pulls levers` (earlier
  Treasury powers) lost its elections, and `Cycles the options` changed phase. The four crisis
  strategies now lose 14, 23, 4 and 16 of 80, against 10, 18, 4 and 10.
- **The canon moved** (AGENTS.md has the new figures): the room under the bill authority is
  CW$3.2bn, where it was CW$13.1bn, and the PSD holds 99 seats where it held 107. It is still the
  debt trap and still reachable. Restoring room is a tuning job for the Act I rewrite.

## Built, 5 October 2026: fifth 2

- **`the_estimates_costed`** (prologue 4, a page with no choice) is the Treasury's
  draft estimates: the ceiling (CW$48bn costed against a CW$52bn reserve), what a
  cheaper or dearer level means, the four tax rates, and who signs. The draft's
  line items are a document section, so the numbers are read, not narrated. It
  says tax rates "do not change what the House may vote. They decide how much
  each of the four yields over the year": the ceiling is the reserve, and a rate
  moves a yield, not the ceiling. Substrate insurance is described as cover for
  "digital residents", at the author's request; canon says "emulated" (the
  glossary) and the four character categories are biological, emulation,
  synthetic and uplift, so "digital resident" is the page's plain word and is not
  a canon term.
- **`the_order_of_the_day`** now teaches the order-paper slot before anything
  asks the player to spend one: six slots in each sitting period, and the
  Chief Whip's list wants them all. **`briefing_divergence`** (retitled "Time for
  one bill") puts the slot arithmetic as the choice: the estimates need five
  slots and the bill three, against six, so the government carries one of them
  this period. Its three choices are measured (ask Trottier to wait for the
  whips' count of the functional members), cautious (the estimates come first)
  and bold (the bill comes first).
- **The opening is still eight beats**, with chapter two at sitting 9. The page
  does not take a sitting's decision.
- **A choice-free page needed the harnesses taught.** `tools/playtest.js` and
  `test.js` crashed or looped behind the page, and the General Assembly guard
  called `Engine.choose` on it. They acknowledge it now, and `T.prologue1`
  counts only the prologue events that ask (LESSONS.md).
- **The canon moved, and the witness run is seeded**: `CANON_SEED` (5) in the
  campaign's guards. The canon reads sitting 55 (13 August 2080) at standing
  50, with CW$7.2bn of room, and AGENTS.md has the figures. The four crisis
  strategies lose 12, 20, 5 and 10 of 80, against 14, 23, 4 and 16.
  `Cycles the options` now loses all 80 to a vote of no confidence at sitting
  16 where it lost 43; it is blind to the content and it lands on the
  cautious branch, so it is a measure of that branch and not of the Act.

Still to write: fifth 3 (the clauses), fifth 4 (the consequence) and fifth 5
(the vote).
