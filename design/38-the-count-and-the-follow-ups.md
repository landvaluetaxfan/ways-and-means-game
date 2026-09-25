# 38 — THE COUNT, AND THE FOLLOW-UPS TO THE AUDIT

**Status: BUILT, 25 Sep 2026**, except §6 and §7, which are proposals, and
the economy, which is `design/39`. This records what was built from the
author's answers to design/37, what each change measured, and what is still
the author's to decide.

The author's answers, in order:

1. The election is "at least half of the actual gauge a player looks at when
   their campaign is over", and the campaign "needs to be able to change the
   election, drastically, ranging from massive loss to landslide that returns
   you to government, and everything in between".
2. See 1.
3. The unreachable losses: "we can probably fix this somewhat easily".
4. Starvation: "events which haven't appeared get weighted to appear more the
   longer a run goes on without them? although maybe this biases rare events
   towards happening later in the run".
5. The economy: from first principles, compared against the literature, with
   an overhaul toward a modern-feeling economy welcome. That is `design/39`.
6. Declining the crisis scores best: suggest a fix (§6).
7. The ladder nobody finds: suggest a fix (§7).
8. Formation after the count: an epilogue. The seed, the recess and "everything
   else": build them.

## The short version

- **The count listens, and the campaign decides it.** The count is taken when
  the campaign ends, on a real vote.
  - Standing 10 gives the government's side 94 of 280, and 100 gives it 213.
  - From one run's writs, the campaign alone spans 114 to 174 seats.
  - The polls replace the docket, and an epilogue closes the run.
- **Standing fades.** It could only rise, so a greedy player hit 100 before
  the writs, declined the crisis, and won a landslide. Every band now pulls
  toward 45 at 5% a sitting.
- **Both unreachable losses can happen, and only when earned.**
  - A partner walks out at loyalty 15 and returns at 30; the opposition moves
    no confidence three sittings later.
  - Fighting Czarnecki holds the ballot.
- **Aging the event pool was built, measured and left off.** It made runs more
  alike and did not help. The pool is over-subscribed, and Question Time every
  eight sittings instead of four did what aging could not.
- **The recess takes fourteen days, and every government draws its own seed.**
- **Canon moved.** It is still the debt trap and still the count. The count
  now falls on 15 August at sitting 57, with the thermal margin at 5. The PSD
  returns with 119 seats and a working majority of 183 at standing 70.

---

## 1. The count (answers 1 and 2)

**When.** `dissolve()` records the House that goes to the country, and nothing
else. `count()` runs the general election when the campaign ends: the last
beat sets `campaign_done` (the engine counts inside `apply()`), or
`campaignSittings` run out (`advance()`). `checkEnd` calls the run over only
once the count is taken.

**The vote.** A district was 0.68 for its holder, plus 0.32 of a national
figure for everyone. No swing could take a seat, so only the 100 list seats
ever moved. The new model:

| | |
|---|---|
| **List** | `parties[].vote`, the last election's list vote in per cent, solved so that D'Hondt under the 4% threshold returns the opening list seats. The one exception is below. |
| **District** | A notional result derived once from content. The national vote is lifted by the share of the station's and band's seats the party held. The holder leads its rival by a margin ranked **within its own party's seats** (`marginMin + marginSpan × r^marginShape`). Ranking across the whole House made the PSD's concentrated seats all safe, and a government could lose twenty points of standing without losing a seat. A constituency may carry `notional` to replace the derivation with a real result. |
| **Functional** | Recounted by sector from the current roll (so the licensing board's franchise carries into it), by largest remainders. The tide reaches each franchise by `setup.election.functional`: licensure 0.4, corporate 0.15, union bloc 0.3, residual 1. |
| **Swing** | `setup.election.swing` (0.35) points of the vote for each point of standing away from 50, read where the seat is. Inside the government's side and the rest, the points go in proportion to the vote. A party's `swing` weights how much of the tide reaches it: independents carry 0. |

Measured on the opening House:

| standing | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 |
|---|---|---|---|---|---|---|---|---|---|---|
| government's side | 94 | 106 | 116 | 127 | 141 | 166 | 178 | 189 | 201 | 213 |

At 50 the count returns the opening House, except for **the Single Tax
Party**, which takes a fourth seat from the NPP. No list vote at or above a 4%
threshold earns three seats of a hundred under D'Hondt, so the opening House
contradicts its own threshold. The party is held at 4.1% ("within a point of
the threshold", as its note says). **The author's call:**

- four seats in the opening House;
- a lower threshold at the last election;
- or an exemption.

The old count barred the party at every standing, because it diluted a
list-only party's vote with the district tier.

**The campaign.** Every beat had +2 to +4 standing on every answer, so no
path could lose ground. Now:

- Running on the record, or defending it in the debate, wins where the
  country believes it (legitimacy above 54) and loses where it does not.
- Making the election about the question pays only for a government ahead.
- The debate gains an admission.
- A new beat has the opposition publish a dossier.
- The last week chooses where: the ring, the low band, everywhere, or
  nowhere.

With the dossier, chapter three has up to nine beats against §1.7's budget of
six to eight. They fit the twelve-sitting campaign, and `test.js` holds that.

Measured from one run's writs (standing 42, forecast 131):

- 432 paths through the campaign;
- the government's side ranges from 114 to 174, median 141;
- the PSD ranges from 59 to 110.

**The polls.** During the campaign:

- The Sitting screen's docket becomes *The polls*: the government's side
  against the majority and the movement since the writs, then each band's
  projected seats, its close ones and its standing.
- The status bar reads POLL instead of CONFIDENCE, and the clock reads the
  campaign's day.
- The wire carries the day's projection.

`Engine.forecast()` is the count on a copy.

**Standing fades.** 61 of 125 events offered a standing gain, and nothing drew
it back. With the count listening, standing decided everything, and a player
taking every gain won every election. `setup.standingDrift` pulls each band 5%
of the way to 45 a sitting, with the fractions carried. At the count:

| strategy | standing | government's side |
|---|---|---|
| cycles its answers | 35 | 122, defeat |
| greedy (and declines the crisis) | 74 | 183, working majority |
| first option | 79 | 192, landslide |

## 2. The epilogue (answer 8)

`setup.epilogues` is a list of passages, each with a `when`. The first that
matches the counted result is printed on the last page. The world's six are
landslide (185 or more), working majority (160), returned narrowly (141), no
majority (125), defeat (100) and rout. New conditions read the result:

- `returned`: the government's side has a majority;
- `sideAtLeast` and `sideBelow`: its seats in the new House.

A campaign can put its own list in its setup, and an entry can also gate on a
settlement or a flag. Flash I has none yet. **Suggestion for the content
round:** a Flash I epilogue for the debt trap ("returned, with austerity to
come"), gated on `resolvedIs: "f1_pyrrhic"` and `returned: true`.

The last page also:

- leads with the government's side against the majority (design/37);
- gives its mood by the majority;
- prints the seed.

## 3. The losses (answer 3)

- **Confidence.** Nothing ever moved a partner, so confidence sat at 142–144
  against 141 in every run. Now:
  - A coalition or confidence-and-supply partner walks out when its loyalty
    falls to `thresholds.partnerLeaves` (15). It comes back at
    `partnerReturns` (30) if that happens before the writs.
  - When the government loses its majority, the opposition tables a motion
    `motionAfter` (3) sittings out, and the House decides it. `checkLoss` no
    longer ends the run the moment confidence dips. Bible §3.5 says the loss
    is a confidence *vote*, and now it is one.
  - The world event `partner_walks` (named by `setup.onPartnerWithdraws`)
    offers terms (a slot, and `court: 16`), the whips (`court: 6`), or
    facing the House.
  - The Relations tab marks a partner that walked and one near the line.
- **Leadership.** Fighting Czarnecki said the ballot was called "the week
  after next" and set a flag nothing read. The names now go on the paper
  eight sittings out, and the engine holds the ballot on the benches' loyalty
  that day.
- **Measured.**
  - Across 40 runs, 5 end on no confidence, all of them relentlessly hostile
    to the NPP.
  - At 20 the NPP walked at sitting 13 after two hostile answers in three
    sittings; at 15 it takes three.
  - A government that fights the ballot at typical loyalty loses it (29–31
    for, 37 needed). That is a gamble the Party tab's forecast shows before
    the day.

## 4. The pool (answer 4)

Aging was built as the author described. `st.waited` counts the sittings an
event spends eligible and unchosen, and `setup.ageWeight` adds per sitting.
It accrues only while the event is eligible, so it does not bias rare events
toward the end of the run: it pulls a starved event forward from the day it
could first fire. Measured across eight strategies and five seeds:

| ageWeight | distinct events a run | eligible, never fired | median wait | reached across 40 runs |
|---|---|---|---|---|
| 0 | 35.1 | 17.3 | 8 | 79 |
| 3 | 35.4 | 16.2 | 17 | 70 |
| 6 | 35.5 | 15.8 | 18 | 68 |

It does not help. About twenty events are eligible each sitting for one slot,
and Question Time took ten of a run's fifty-five sittings. Aging only
reorders an over-subscribed queue, and it makes runs more alike. **Question
Time every eight sittings** instead raised a run to 39.3 distinct events and
cut the starved ones to 14. It also fired `fa_conciliate` and `f1_water` for
the first time (5 runs in 40 each).

`ageWeight` stays in setup at 0, for a campaign whose pool is thin.

## 5. The rest of 8

- **A seed per government.** The shell draws one and the save keeps it, so a
  run is still a pure function of its seed and its choices. The last page
  prints it. The harness pins `Math.random`.
- **The recess takes `setup.recessDays` (14).** The House rose on a Wednesday
  and sat on the Thursday. The sittings in a run are the same; only the dates
  move. The count moves from mid-July to mid-August. The calendar marks
  recess days, and the log dates the return.
- **The functional tier is recounted** (§1).
- **Moving the tax bases into content** belongs to the economy (design/39
  phase 1). The four prices are also written into `tick()`, so moving
  `TAX_BASES` alone would not free the engine.
- **The portrait** remains the author's (design/37 D12).
- **Standing as the only currency** (design/37 D14) is half answered by §1's
  fade. Design/39's economic voting is the other half.

Found on the way and fixed:

- The transcript's date called `dateOfSitting(st, C, n)`, which takes
  `(C, n)`. It dated the transcript in the 2340s.
- "Her Majesty's Government" in a republic.
- The editor dropped the effects from a queued entry that carries effects and
  no event.
- Lint, the story map and the rename tracker each learned that entry kind,
  and setup's `on...` hooks. Each was shown to fail without the change.

## 6. Suggested: declining the crisis (answer 6)

§1's fade already ended the arithmetic of it: the greedy decliner now comes
second to the first-option player. What remains is that declining is a
**narrative dead end**. It sets no flag, so nothing later can know it
happened. The suggestion, in order of effect:

1. **Flag the refusal.** `f1_waited` on *Wait for Earth's process*, `f1_held`
   on *Hold the line*. Two lines of content.
2. **The Works does not wait.** Queue two consequences 6 and 12 sittings out:
   - the scrubbers failing on schedule, as the survey said they would;
   - Kenya's evacuation beginning under its procurement law.

   Each costs standing in the far and external bands (`standing.far`,
   `standing.external`), where the Works' kin are on the roll. The world
   keeps going without the player, which is the argument for acting.
3. **The campaign asks.** A chapter-three beat gated on either flag, *The
   184,000*, in which the opposition's case is the Works. Answering it needs
   legitimacy, like the record beats.
4. **The last page says what happened to them.** A Flash I epilogue gated on
   the flag. The world can then read, in the closing prose, what refusing
   cost.

Measure it the way design/37 measured the greedy player: declining should be a
way to win only for a player who deals with what it sets off.

## 7. Suggested: the ladder nobody finds (answer 7)

Three strategies cascaded because nothing told them the emergency orders
exist. The suggestion:

1. **The docket asks for it.** When the thermal margin reaches the first
   rung's line, *Today* carries "The thermal margin is under N: the emergency
   orders are open", pointing at the Government tab. `today()` already
   reports obligations. This is one more, derived from the instruments that
   raise the margin, which is how the canon script already finds them.
2. **The thermal events offer the order.** `reserve_low`, `thermal_squeeze`
   and `vantage_radiator` each gain a choice that lays the next rung
   (`{si: ...}`), so the first time a player meets the ladder is inside a
   decision rather than behind a tab.
3. **The THERMAL chip says so** when it turns red, in its tip.
4. **The playtest climbs it.** The supply-first strategies borrow the canon
   script's `holdTheCountry`, and a new strategy "never climbs" keeps the
   ignorant case. A cascade in the table then means a player who ignored the
   warning, not a tool that could not see it.

Measure: with 1 and 2 in, First, Cheapest and Costliest should reach the count.

## For the author

1. **The Single Tax Party:** four seats, a lower threshold at the last
   election, or an exemption.
2. **The canon numbers:** 15 August at sitting 57, the thermal margin at 5,
   the PSD at 119 seats, and a working majority of 183 at standing 70. CLAUDE.md
   and bible §1.8 carry them.
3. **A Flash I epilogue** for the debt trap.
4. **§6 and §7**, which are content and a small interface change.
5. **The economy**, design/39.
