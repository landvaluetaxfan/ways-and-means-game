# 37 — THE DESIGN AUDIT

**Status: RUN, 25 Sep 2026.** The second audit. `design/34` looked for
structural faults, the kind that break a check. This one looks from four
angles that a check cannot see: **game design** (are the decisions real?),
**fun** (read the runs as a player), **worldbuilding** (does the world the
bible describes reach the screen?) and **realism** (procedure, the economy,
physics, the calendar). The brief was to be as broad and critical as
possible, so this is a list of what is wrong. What works is not listed.

The ranking follows design/34: fixed (with the check that now holds it),
needs you, for the content round, and noted.

**Method.** Measured where it can be measured, read by hand where it cannot,
and labelled when it is judgement. Measurements are taken from:

- the seven playtest strategies plus a *greedy* one (always the choice that
  raises public standing most), each over five seeds;
- a sweep of the election model across the whole standing meter;
- a static pass over every event, choice, flag and gate;
- two full transcripts, read as a player;
- the opening screen in Chromium at 1366×768.

Flash I findings are recorded as **lessons for its rewrite**, not as bugs in
a story the author is about to replace.

## The short version

- **The election is decided before the campaign.** `dissolve()` takes the
  count at the writs. Chapter three's seven beats move standing and spend the
  reserve, and cannot change a seat. The new House is on the Chamber tab a
  week before the count reads it out.
- **And the count hardly hears how the government governed.** Across the
  whole standing meter, from 10 to 100, the PSD's result moves from 78 seats
  to 93.
- **Two of the five ways to lose cannot happen.** Confidence sits at 142–144
  against 141 before the writs in every run, because nothing in content moves
  a partner or a seat. The leadership paper never holds more than two names,
  against the twelve a ballot needs. Every run ends at the count, on supply or
  in a cascade.
- **The event picker is a priority queue.** An event that is eligible but
  outranked waits for ever. `fa_conciliate`, the cure for the expropriation
  default, was eligible for 160 sittings and never fired. `f1_accounts_freeze`,
  the Meltdown's gate, was eligible for 19 and never fired. 42 of 123 events
  are never reached in 40 runs, and no sitting is ever quiet.
- **The appropriation costs nothing and a loan costs seventeen times its
  rate.** The reserve rises in every run that governs, from 52,000 to as much
  as 125,000, while setup's history says it fell for eight years.
- **The best score is declining the crisis.** The greedy player refuses the
  Works and finishes at standing 93 with 90 seats, above the canon's 86.
- **The playtest pulls two levers**, `grantSlot` and `divide`. The strategies
  that cascade never lay an emergency order, and a new player probably won't
  either: nothing on the screen says the ladder is there.
- **Five defects fixed:**
  - Every sitting period after the first was seventeen sittings, not sixteen.
  - Two different "rises in" counts on one screen.
  - An end page that never said who governs.
  - Czarnecki's paper counted to nine where the engine counts to twelve.
  - A stale count date in the bible.

---

## 1. Fixed, with the check that holds it

| # | Fault | Fix | Held by |
|---|---|---|---|
| 1 | **Every sitting period after the first sat seventeen sittings.** `recess()` set `risesAt = sitting + 16` on a sitting that was already the new period's first, so the periods ran 16, 17, 17. The session ended at 50, not 48. `sessionEndsAt()` already assumed sixteen, so the calendar dated everything owed "before the House rises" two sittings before the House rose. `prorogue()` had the same count. | `- 1` in both, with the reason at the site | test.js: *every sitting period is sittingsPerPeriod long* (16, 17, 17 before) and *the House rises when the calendar said it would* (deadline 49, dissolved at 51 before). Both shown to fail on the old engine. |
| 2 | **Two counts of one thing on one screen.** The top bar said RISES IN 16 over a status bar saying RISE IN 15. The header added a sitting. | One count; RISES TODAY at zero | uxtest: *and it is the same count as the status bar's* |
| 3 | **The last page did not say who governs.** It printed the Prime Minister's party as "the government" and said "It held where it stood" over counts where the coalition and its partners came back six short of a majority (the Cycles strategy: 82 held, side 136 of 141). | The page leads with the government side's seats against the majority, then the party's own line, and the mood follows the majority. Formation after the count is not modelled, so the page states the arithmetic and does not say who forms the next government (see D4). | uitest: *the last page says whether the government's side has a majority*, shown to fail without the line |
| 4 | **Czarnecki's paper counted to nine.** The event said "the count is nine. Czarnecki needs nine more names". The ballot takes twelve (`thresholds.ballot`) and the paper opens empty. The same event offered "her" a junior ministry, and he is "he" everywhere else. Its note gave him "four weeks" for a wait of four sittings, which is one week. The Guild Bench minute had "five of the nine" and a "she". | The numbers agree with the engine; pronouns and the wait corrected; the author's note on the character updated | Not held by a check. It is the SIGNATURES n/9 fault from CLAUDE.md, in prose this time. |
| 5 | **The bible dated the count 24 July.** That is the backstop's date. The canon count falls on 16 July, at sitting 55. | §1.7 gives the canon date, the backstop's date, and says the date belongs to the run | toc rebuilt |

**What fix 1 moved, measured.** The canon run is still the debt trap and still
reaches the count:

| | before | after |
|---|---|---|
| count at sitting | 56 | 55 (16 July) |
| thermal margin | 6 | 8 |
| PSD seats | 89 | 86 |

- Every Flash I guard passes.
- The playtest's outcome classes are unchanged: three cascades, two supply
  losses, two elections.
- Each strategy's reach moved by a point or two.
- One more event goes unreached (`cluster_flag`).

---

## 2. Needs you

Ranked by how much of the game each one decides. Each has the measurement,
and each gives the reason where the reason is judgement.

### D1. The count is taken before the campaign

`dissolve()` calls `generalElection()` the sitting the writs go out
(sitting 49). Chapter three then runs its beats:

- "Campaign on the record"
- "Put everything into the marginals" (−4,000 MW-years)
- "Defend the record"
- …

Each one moves `public_standing`, and none can reach a seat. In the greedy
run, standing climbed from 81 to 93 across the campaign and the result did
not change. The roll already holds the new House, so the Chamber tab, the
composition table and the status bar's CONFIDENCE show the result from the
day of the writs. **The count is readable a week before the count is read.**

Recounting each strategy at the count's own standing moves the result by
only one or two seats:

| strategy | standing, writs → count | PSD at the writs | PSD at the count | side at the count |
|---|---|---|---|---|
| First | 31 → 37 | 84 | 86 | 138 → 140 |
| Last | 15 → 19 | 79 | 80 | 127 → 129 |
| Cycle | 32 → 39 | 82 | 84 | 136 → 138 |

The effect is small because of D2. **Decide D1 and D2 together.** Fixing D1
alone buys very little.

*Proposal:*
- Take the count when the campaign ends: at the count beat, or at
  `campaignSittings`.
- Carry the old House through the campaign. It is dissolved, so nothing
  divides.
- Show a forecast during the campaign, not a result.

### D2. The election barely hears how the government governed

Measured on Flash I's opening House, setting standing uniformly:

| standing | PSD | coalition | coalition + C&S |
|---|---|---|---|
| 10 | 78 | 119 | 125 |
| 25 | 81 | 126 | 132 |
| 40 | 84 | 132 | 139 |
| 50 | 86 | 136 | 143 |
| 60 | 87 | 139 | 146 |
| 75 | 89 | 143 | 150 |
| 93 | 92 | 149 | 156 |
| 100 | 93 | 150 | 157 |

The whole meter moves the PSD by fifteen seats of 280. A government at
standing 10 (the Last strategy finished at 12) keeps 78 seats.

- **The cause.** `swungShares` multiplies government shares by
  `1 + (s−50)/100` and opposition shares by `1 − 0.4k`, then renormalises.
  Then district magnitudes and divisors round away most of what is left.
- **A neutral count still reshuffles the House.** At standing 50 the PSD goes
  82 → 86, the NPP 36 → 31 and Home Rule 34 → 37.
- **The Single Tax Party loses all three of its seats at every standing.** It
  falls under the list threshold, and nothing a player does keeps it in. That
  is the model's baseline, not a result of play.

*Proposal (judgement):*
- Make the swing a shift in vote-share points, with a coefficient measured so
  that the meter spans the real range. For example, standing 30 loses the
  majority and 70 wins it comfortably.
- A hung parliament at moderate standing should be a live outcome.
- Check that the baseline at 50 reproduces the opening House.

### D3. The functional tier is never contested, so the licensing board's vote never happens

`generalElection()` re-runs the district and list tiers only. The forty
functional seats go through the count unchanged.

The licensing order (`si_2080_44`) moves two functional seats from the Guild
Bench to the PSD **the day it is laid**: two sitting members change party
because an electorate widened. §4.6.4 calls the board "the sharpest tool in
the game", and the end page says board appointments "chang[ed] who was
entitled to vote". The vote they change is never held.

*Proposal:*
- The order changes the constituency's electorate.
- The count re-elects the functional tier from that electorate.

Realism agrees: a change to the franchise moves the next election, not the
member in the seat.

### D4. After the count, nobody forms a government

Fix 3 prints the arithmetic. Of the three strategies that reach the count, two
bring the government side back short: Last at 127 and Cycle at 136, against
141. The run ends there without saying whether Flash governs.

*Proposal:* a formation beat keyed on the count's arithmetic (content, one
event), or an engine rule that a side below the majority must find a
partner. This is your call, because the election ends the run
(design/32, "canon decided here").

### D5. Two of the five loss conditions cannot be reached

- **No confidence.** Before the writs, confidence is 142–144 in all seven
  strategies, against a majority of 141. Nothing in content moves a partner
  out or a seat across; the only movement is the licensing order's +2.
  `no_confidence_tabled` (weight 6) was eligible for ten sittings and never
  picked (D6).
- **Leadership.**
  - The paper's maximum in any run is **two** names. Both come from the
    licensing order's own `{signatures:2}`, and nobody asks anyone.
  - `party_fracture`, `signatures_build` and `leadership_ballot` are never
    reached in 40 runs.
  - `halloran_finds_nine` tells the player "the ballot is called for the week
    after next" and sets `leadership_ballot_called`, which nothing reads.
- **So every run ends by supply, in a cascade, or at the count.** The
  playtest shows all three and nothing else.

*Proposal:*
- A partner withdraws when its ledger or loyalty crosses a content threshold.
  That is an engine rule reading `setup`, like `thresholds.ballot`.
- `halloran_finds_nine` puts names on the paper (`{signatures: n}`). If it
  does not, it should not say the ballot is called.

### D6. The event picker starves low-weight events, and no sitting is quiet

`nextEvent()` takes the highest weight plus a seeded lean. For a pool that
refills faster than it drains, that is a priority queue. Measured across 14
runs:

| event | sittings eligible | weight | what it is |
|---|---|---|---|
| `substrate_drift` | 417 | 52 | |
| `ec_participation_report` | 160 | 58 | every §7.10 reading event |
| `f1_water` | 160 | 60 | |
| `fa_conciliate` | 160 | 62 | the cure for the Standby default |
| `fa_freight_reacts` | 154 | 56 | |
| `the_tribunal` | 38 | 74 | |
| `f1_accounts_freeze` | 19 | 87 | the only way to the Systemic Meltdown |
| `no_confidence_tabled` | 10 | 6 | |

None of them fired. 42 of 123 events are unreached in 40 runs (eight
strategies, five seeds). The playtest's seven strategies miss 56.

**No run had a sitting without an event.** design/17 argued for the quiet
sitting, and the picker cannot produce one.

*Proposal:*
- Aging: an eligible event's effective weight rises for each sitting it
  waits.
- A cooldown per category.
- Let a sitting pass when nothing clears a floor.

All three are deterministic and keep §1.5.

### D7. The fiscal model has two defects, and they point the same way

- **(a) The appropriation costs nothing.**
  - `clauseCost()` is a ceiling in `setClause()` and is never charged.
  - The account still prints "The appropriation: what the settled clauses
    cost" beside a reserve that rises.
  - The reserve grows in every run that governs: Last 52k → 122k, Cycle →
    99k, greedy → 86k.
  - `setup`'s own history says the reserve fell from 78,000 to 52,000 over
    four administrations. In play it rises from the day Flash takes office.
- **(b) A loan charges a month's interest every sitting.**
  - Service is `owed × rate/100/12` per sitting.
  - A sitting is a day, four a week, about 208 a year, so the charge is about
    **17× the printed rate**.
  - 16,000 drawn from Earth at 6.25% costs 83 a sitting: about 4,600 over a
    55-sitting run, against about 270 at the rate on the page.

Neither can move alone. (a) would take the reserve down. (b) is almost the
only thing that does now, apart from content. The canon's thermal margin of
8, and the three cascade losses, sit downstream of both.

*Proposal:*
- Charge the appropriation per sitting: its total divided by the session's
  sittings.
- Divide service by sittings a year.
- Then rebalance the canon against the guards.

### D8. The best result is declining the crisis

The greedy strategy declines the Works and settles `restriction` at sitting
20. It ends at standing 91–97 and 89–92 seats across five seeds: the best
result of any strategy, and above the canon's debt trap (86). What declining
costs is a legitimacy trend the player never sees (legitimacy ran 35–56).

*Judgement:* a thriller whose best score comes from refusing the thriller.
Declining should cost something the last page prints: the Works' 184,000,
Earth's reading of it, the wire.

### D9. The levers that decide runs are the ones nobody finds

The playtest calls `grantSlot` and `divide`. It never:

- lays an order or climbs the emergency ladder
- borrows or repays
- whips or lobbies
- sets a clause
- appoints or dismisses
- asks for a signature or wins one back

Its three cascade strategies (First, Cheapest, Costliest) are lost on a
ladder they never climb. The canon script climbs it and survives. A new
player is closer to the playtest than to the canon script.

*Judgement:* discoverability.
- Nothing on the docket says the ladder is open.
- The thermal events do not name it.
- The status bar shows THERMAL and nothing more.

*Proposal:*
- A docket item when the margin reaches the ladder's first rung.
- A playtest strategy that uses the levers, so a loss in the table means the
  game and not the tool.

### D10. Every game is the same game

`newGame()` seeds 20287 unless told otherwise, and the shell never tells it.
Across five seeds the event sequences differ and the outcome class does not,
so the seed is texture. But every player gets the same texture.

*Proposal:* a seed per new game, stored in the save. Runs stay deterministic
and reproducible (§1.5) and stop being identical.

### D11. The recess lasts no days

The House rises after sitting 16 (Wednesday 8 May) and sits again on
Thursday 9 May. §1.8 chose contiguous days on purpose, and the calendar is
built for them. As realism, though, a recess with no days in it is a line in
the log and not a recess.

*Proposal:* a week or two of recess days. That moves the count into August,
so it is a canon date.

### D12. The introduction's photograph

The Prime Minister's portrait is a press photograph (the commit that added it
says so). It shows a real person, with a Remembrance poppy on the lapel, which
is a present-day Commonwealth-of-Nations custom and out of place in orbit in
2080.

If the build is ever shared beyond the author, the likeness and the licence
matter. This is not a finding about who it is, and none is offered.

### D13. The engine names the four taxes

`TAX_BASES` in `js/engine.js` holds volume, thermal, substrate and transit
with their weights (480, 300, 280, 140) and pass-throughs. `RATE_STEP` holds
the clause levels' multipliers. This is content in the engine, against the
one architectural rule, and a campaign cannot author a different tax base.

*Proposal:* move both, verbatim, to `setup`. It preserves behaviour, and the
playtest printing identical tables is the proof. Not done here because the
interface and the editor read the names, so it is a pass of its own.

### D14. Standing is the only currency

The static pass counted effect sites and gates per scalar:

| scalar | effect sites | gates |
|---|---|---|
| `public_standing` | 162 | 4 |
| `party_loyalty` | 29 | 3 |
| `legitimacy` | 72 | 1 |

Most choices are "standing against one current's loyalty". The currents
matter only through the paper, which never fills (D5). So the game played is
standing, which feeds a count that barely hears it (D2), plus the thermal
margin, which is the cascade.

*Judgement:* the currents, the ledger and legitimacy are drawn, explained and
moved, and decide almost nothing. That is the design question under D2, D5
and D8.

---

## 3. For the content round

Lessons for the Flash I rewrite and for every campaign after it.

- **C1. Question Time repeats itself verbatim.**
  - It fires every four sittings, about ten times a run.
  - It always asks after "the Treasurer, who is also not answering", even
    once a Treasurer is appointed.
  - It always ends "It is the fourth time".
  - Answering properly costs a slot. Answering every time would take four of
    a period's six.
  - A recurring event needs variants keyed on state, or it teaches the player
    to stop reading.
- **C2. Many choices are not decisions.**
  - 13 events have one choice.
  - 11 choices do nothing.
  - 28 pairs have one option at least as good as the other on every meter
    both touch.
  - Examples: "Leave it empty" in `minister_resignation` and
    `the_vacant_post` costs standing and sets a flag nothing reads. Option
    #2 beats both others in `tr_ruling`, as #1 does in `indemnity_settles`,
    and one option beats four in `volume_charter_settles`.
  - Ten events have choices within 1.5 points of each other, among them
    `the_paper`, `f1_water`, `f1_brink_2` and `ch3_the_campaign`.
- **C3. 87 flags are set and never read.** Each is a consequence a note
  promised and the game never delivers.
  - Among them: `annexed_almanac_works`, `earth_gave_way`, `f1_debt_repaid`,
    `shed_order_promised`, `leadership_ballot_called` and
    `treasury_left_vacant`.
  - One flag is read and never set: `paired`.
  - The list is in the audit's scratch output. `npm run lint`'s flag audit
    reports sets without readers only for the flags it knows.
- **C4. Most of the world never appears.**

  | | never appears |
  |---|---|
  | stations | 25 of 35 never in an event, the five external stations among them |
  | characters | 32 of 54 never speak; 36 events have no speaker |
  | parties | the Single Tax Party, Uplift Alliance and Independents are never moved; Home Rule twice |
  | currents | only the PSD's four are ever moved |
  | themes | faith in two events, Mars in one |

  The bible's world is far bigger than the game's.
- **C5. The campaign chapter is thin, and (D1) inert.**
  - Seven beats, each a binary choice worth +2 to +4 standing either way.
  - The count is one click: "Read the final numbers."
  - Its prose was written for a shorter session: "The campaign is one
    session long by law" now describes seven sittings, while a session is
    three periods of sixteen.
- **C6. Declining the crisis is a dead end.** After *Wait* or *Hold the line*
  the Works' story stops, and nothing on screen says it will not return.
- **C7. The personhood question settles as a wire line.** That is by design
  (design/31 §4, a settlement records and does not interrupt). The setting's
  largest question still arrives as a ticker entry.
- **C8. Chapter one teaches by lecture.** `the_rules_of_the_house`,
  `the_order_of_the_day` and `the_whip_list` are briefings with one or two
  mild choices. design/21's rule is "teach by making the player need the
  mechanic", with a teacher who wants something the mechanic delivers. These
  explain the mechanic before anyone needs it.
- **C9. One note steps out of the fiction.** "the one answer the interface
  cannot give you", in `the_rules_of_the_house`. The register check reads the
  Concordance, not event notes.
- **C10. Partners do not react to defeat.** The NPP stays in coalition after
  its own price bill is defeated. This is the content side of D5.

---

## 4. Noted

- **The campaign is twelve days**: writs on 4 July (sitting 49), count on 16
  July (sitting 55).
  Real minimums run 25 working days (UK), 33 days (Australia) and 36 days
  (Canada). An invented constitution may do otherwise, but none says so here.
- **Supply carries at sitting 4.** That is realistic for an interim supply
  bill and quick for a main appropriation. It is consistent with §7.7, where
  supply is the thing to carry first.
- **Four anchors sit well off the equator**: Kourou 5.2°, Malé 4.2°, Leticia
  4.2°, Malindi 3.2°. An elevator wants the equator. A few degrees off is
  survivable with more tension and a curved lower tether. Kourou was chosen
  for rockets, not elevators, and one line in the Concordance would cover all
  four.
- **Twelve elevators within about fifteen years of the first anchor.** It is
  enormous, and §2.1's argument (automation as the cause of colonisation)
  covers it.
- **The fiscal scale.**
  - Receipts of about 1,200 MW-years a sitting are about 440 GW continuous,
    or about 62 kW per resident, as state revenue alone. Earth today uses
    about 2.5 kW per head of primary energy.
  - The civic clock line implies about 330 kW per emulated mind (500
    MW-years a sitting for 560,000 minds).
  - The numbers are consistent with each other and with "energy is trivial;
    rejection binds" (§7.5.3). A sentence there would stop somebody "fixing"
    them.
- **The Almanac Works' globe marker** (−4.1, 41.2) is not the International's
  anchor (−3.22, 40.12). Probably an offset so the markers do not overlap.
- **The opening screen at 1366×768.**
  - The Wire column takes a third of the width and says "No traffic this
    session".
  - The indicator panel is below the fold of the right column.
  - The status bar reads "One decision, then the House rises" (the day)
    beside RISE IN 15 (the recess): one verb, two meanings.
- **"Thirty-four stations"** in the campaign beat was checked and is right: 35
  stations, less the non-voting capital.

---

## 5. How it was measured

| finding | measurement |
|---|---|
| starvation, reach, seeds | eight strategies × five seeds on a copy of `tools/playtest.js` that exports its runner and adds the greedy strategy; each sitting logged the eligible pool, what fired and every scalar |
| choices | static pass: dominance compares only the meters both options touch and lists what each does besides |
| election sensitivity | `generalElection()` on a clone of the opening state, with every band's standing set |
| campaign recount | the state snapshotted before the writs, recounted at the count's standing |
| confidence and the paper | per-sitting trace, before the writs only |
| the calendar | `dateOfSitting()` and the period transitions of a bare run |
| the screen | headless Chromium, 1366×768, new game at sitting 1 |

The scratch tools are not committed. They are one-off measurements, and the
fixes that came out of them carry their own checks.

## Acceptance

- `npm run check` passes, including the four assertions added for fixes 1–3.
- Each of the four was shown to fail with its fix reverted.
- `npm run guards` reaches the canon ending by play (count at sitting 55).
- Items D1–D14 wait on the author. The content round inherits C1–C10.
