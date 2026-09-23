# 32 — THE ARC: THE RUN, THE SPINE, AND THE SETTLEMENT MAP

> **Status, 23 Sep 2026.** The run is one session sat in three periods of
> sixteen sittings now, not one of twenty-four, so the sitting numbers below
> are stale; the
> decisions are not. Built since: §E.1 (the families are two channels,
> `crisis: true`), §E.5 (reserved order-paper time), and decision 3 in the
> author's revised form — chapter four folded into chapter TWO, where the
> aftermath plays while the House still sits, not into the campaign.
> `ch4_the_record` and the chapter-four transition are gone. The chain is
> re-dated: stranded at 14, the survey four sittings, the opinion three.

**20 September 2026. Content lane (opencode).** The map the events hang on.
Engine limits have been discovered as content problems because this document
did not exist; anything this document needs from `js/` is named in section E
rather than designed around.

## CANON DECIDED HERE (author, 20 September)

1. **Track B (the Almanac annexation) is the spine.** The five annexation
   tiers are the PRIMARY settlements. The four domestic settlements are
   INTERMEDIATE resolutions: they record, change the state, and change which
   annexation tier is reachable. They end nothing.
2. **One ending family, five outcomes, several routes to each.** Two
   settlement families must not race; a traced run had `graduated_personhood`
   land first and take the canon ending off the board.
3. **The election is the end. Nothing happens after the count.** Chapter four
   folds into chapter three.
4. **The campaign length is content's number** (`setup.campaignSittings`), and
   `test.js` asserts the chapter-three prologue chain plus the dissolution
   sitting fits inside it. Raise it when beats are added.

---

# A. THE RUN, SITTING BY SITTING

A session is `setup.sittingsPerSession` = **24 sittings**. The House rises at
the end of it, the parliament dissolves, and chapter three is the campaign and
the count. With the five aftermath beats folded into chapter three (decision
3), the run is about **39 sittings**.

| Chapter | Sittings | Mechanism | Beats |
|---|---|---|---|
| 1 - Teach | **1-7** | authored prologue, fixed order, loss-proof. No dates, no pool. | 7 |
| 2 - Govern | **8-24** | 2 prologues, then the dated Track B chain and the weighted domestic pool | pool |
| the rise | **24** | `advance()` dissolves; `ch3_dissolution` (chapter 2) opens chapter 3 | 1 |
| 3 - Ending | **25-** | five aftermath prologues, then the campaign prologues, then the count | 14 |

### Chapter 1 (sittings 1-7): the inheritance
The seven authored prologues, one per sitting, in order: `the_account` (P1),
`briefing_divergence` (P2), `the_order_of_the_day` (P3), `halloran_signatures`
(P4), `vantage_radiator` (P5), `the_whip_list` (P6), `gb_approach` (P7).
`gb_approach` applies `{chapter:2}`, so chapter two opens at sitting 7-8. None
are dated and none are weighted; the sequence is the clock.

### Chapter 2 (sittings 8-24): the governing
- **Prologues:** `the_rules_of_the_house` (P1, sitting 8) and `ch2_open` (P2,
  sitting 9). Then the chapter opens onto its pool.
- **Track B is dated** (section B). Its first beat is `f1_stranded` at `at:8`.
  A date fires on the first sitting at or after it that is **not** a prologue,
  so it lands at sitting 9-10.
- **The domestic fronts are weighted** (section C), gated on the scalars,
  benches and flags they move.
- **The rise is the cliff.** Everything dated must be done by sitting 24 or it
  falls with the House (`prorogue()` kills any bill not assented).

### Chapter 3 (sitting 25-): the ending
Fourteen prologues, one a sitting, in this order:

| P | event | reads | notes |
|---|---|---|---|
| 1 | `ch4_after` -> `ch3_after` | `station_issue` | the answer's aftermath, in the country |
| 2 | `ch4_the_answer` -> `ch3_the_answer` | `station_issue` | defend or let it stand |
| 3 | `ch4_the_losers` -> `ch3_the_losers` | `station_issue` | the benches that lost |
| 4 | `ch4_the_ledger` -> `ch3_the_bill` | `station_issue`, solvency | what it cost |
| 5 | `ch4_the_next` -> `ch3_the_next` | `station_issue` | the next question |
| 6 | `ch3_the_campaign` | — | the writs and the argument |
| 7 | `ch3_open_question` | — | the question on the ballot |
| 8 | `ch3_manifestos` | — | the papers |
| 9 | `ch3_the_wire` | friction > 50 | Earth reading the campaign |
| 10 | `ch3_the_benches` | party_loyalty < 40 | the party on the trail |
| 11 | `ch3_the_airwaves` | — | the leaders' debate |
| 12 | `f1_pyrrhic_election` | `resolvedIs:"f1_pyrrhic"` | only the pyrrhic route |
| 13 | `ch3_the_ground` | — | the last week |
| 14 | `ch3_the_count` | — | sets `campaign_done`; ENDS the run |

`ch4_the_record` is dropped: the count already ends the run. The five
aftermath beats are gated on `flags:["station_issue"]` (the Works question was
raised), so a run that never engaged the Works goes straight to the campaign.
Retag `chapter:4` to `chapter:3` and renumber; keep the ids (the count test
matches `/count/`).

### The campaign budget
`needs = prologues + 1 = 15`. `setup.campaignSittings` is **12** today and must
rise. **Set it to 18** (three spare sittings for the set-piece work and any
added beat). `test.js` "THE ENDING FITS THE CAMPAIGN" will name it if it is
left low.

### Dated vs weighted, in one line
Only Track B is dated. Chapter 1 and chapter 3 are authored prologues. Chapter
two's domestic fronts are weighted, so two runs meet them in different orders.

---

# B. TRACK B - THE SPINE, AS A DATED CHAIN

The clock verbs exist: `at:N` holds an event to a sitting; `queue:{event,after,label}`
fires a consequence N sittings later and puts it on the calendar under `label`.

| Step | Fires | Reads / needs the player to | Sets |
|---|---|---|---|
| `f1_stranded` | `at:8` (lands 9-10) | choose **survey** or **wait for Earth** | `station_issue`; survey sets `f1_surveyed` and queues the next |
| `f1_referendum` | survey + `after:2` | **recognise** or **decline** the vote | recognise sets `f1_referendum_carried`, friction +10, queues the next; decline is the capitulation road |
| `f1_dilemma` | referendum + `after:2` | **move to annex** or **hold the line** | annex sets `f1_annexing`, friction +12 and `trend.friction +3`, solvency -6000, legitimacy +12, sets the annexation bill to `first_reading`, grants 5 crisis slots |
| the Annexation Bill (`annexation`, HC 4/163) | player-driven, sittings ~13-23 | grant it order-paper time | 4 grants carry it `first_reading -> ... -> second_reading`; the **division falls when it reaches the stage that divides**, ~sitting 22 |
| `f1_accounts_freeze` | weighted, friction > 70 | pay from the reserve or let suppliers carry it | sanctions; deepens friction |
| `f1_water` | weighted, `f1_annexing` | fund or trim the recycling line | drifts the margin |
| `f1_meltdown` | weighted, friction > 85 + floors breached | — | a LOSS through the loyalty floor |

**Where the division falls.** The dilemma sets the Act down around sitting 13.
The five crisis slots are spent over sittings 13-22, so the division is set for
about **sitting 22, two sittings before the rise**. If the player does not
spend the time, the Act falls with the House at sitting 24 and the annexation
never becomes an Act. That is the intended pressure: the clock makes the
indifferent player lose the spine.

**The final gate.** The three annexation tiers should gate on `almanac_annexed`
(the Act's `onPass`), not on `f1_annexing` (the intention). They cannot move
until crisis slots are earmarked to the measure that granted them (section E,
5) - until then the Act is set down and never reaches a division in an
indifferent run, and moving the gate takes the canon ending off the board,
which is exactly the reverted change the brief records.

**The four domestic resolutions do not live here.** They are read by the
domestic events (section C) and feed the state the tiers are judged on
(section D).

---

# C. THE SIX DOMESTIC FRONTS

Each front is one recurring pool event (a pressure the player keeps paying) and
one authored decision (a fork that costs, and that pushes Track B one way).
"Benches" are the functional constituencies whose consent the front moves.

### 1. The sheds
- **Question:** intervene in the shed order, or let the schedule run?
- **Moves:** `public_standing`, `thermal_margin`, `loyalty.cu_maintenance`,
  `loyalty.hul`, `loyalty.psa`; benches `fc_maintenance` (cu), `fc_lifesupport`
  (gb/hul).
- **Constrains Track B:** the Works' 7,100 suspended are on the same schedule,
  so annexing means owning it; the Act `touches` `essential_services_law`, and
  the benches that own that subject are the domain that can block it.
- **Existing content:** `shed_order_crisis`, `the_delegation`,
  `review_reports` (commission), the `shedorder` bill (dual majority),
  escalation rungs 1-9, `si_2287_51`.
- **Recurring pool:** `the_delegation` (maxFires 2, suspended > 74,000).
- **Authored decision:** `shed_order_crisis` (price > 106 and suspended >
  73,000): intervene, let it stand, or blame the drift.

### 2. Energy and the thermal quota
- **Question:** cap the exchange, buy the margin, or leave it a market?
- **Moves:** `thermal_margin`, `price.thermal`, `solvency`, `loyalty.hul`,
  `public_standing`; benches `fc_lifesupport`, `fc_transit`, `fc_substrate`.
- **Constrains Track B:** the Works is a life-support load; annexation wants
  margin, and the emergency facility is priced on the margin it cannot cover.
- **Existing content:** `thermal_drift`, `margin_thin`, `thermal_squeeze`,
  `quota_forward`, the `thermal2` bill, `si_2287_51`, `vantage_*`.
- **Recurring pool:** `thermal_drift` (price > 106).
- **Authored decision:** `thermal_squeeze` (price > 112), or the
  `vantage_radiator` cascade as its consequence.

### 3. Rent, substrate, and the public stake
- **Question:** public ownership, subsidy, or market in the cost of existing?
- **Moves:** `price.substrate`, `solvency`, `loyalty.psa`, `loyalty.cl`,
  `loyalty.cu_maintenance`; benches `fc_substrate`, `fc_residual`.
- **Constrains Track B:** Cordell's bonds are substrate-collateral debt; the
  price indexes what the Commonwealth assumes, and `substrate_public_stake`
  competes for the same slots.
- **Existing content:** `substrate_drift`, `substrate_price_bite`,
  `substrate_insurance`, `substrate_public_stake`.
- **Recurring pool:** `substrate_drift` (price > 104).
- **Authored decision:** `substrate_price_bite` (price > 112).

### 4. The registry and the franchise
- **Question:** enforce and pack the boards, or leave the roll alone?
- **Moves:** functional seat rolls (`fc_lifesupport`, `fc_legal`,
  `fc_attestation`), `loyalty.gb`, `loyalty.hul`, `loyalty.psa`,
  `public_standing`.
- **Constrains Track B:** this is the **lever on the domain consent** that
  decides the Annexation Act. The Act carries on the functional benches; the
  boards and roll are how those benches are moved at all.
- **Existing content:** `cluster_flag`, `the_licensing_reaction`,
  `si_2287_44`, `si_2287_47`, `si_2287_58`, `tr_reference`,
  `tr_challenge_lodged`, `tr_ruling`.
- **Recurring pool:** `the_licensing_reaction` (`si_2287_44` in force).
- **Authored decision:** making the licensing order (`si_2287_44`) and
  defending or letting the challenge run (`tr_challenge_lodged`).

### 5. The union question (closure and the stations)
- **Question:** develop the stations - which funds a future exit - or
  centralize?
- **Moves:** station `closure` (capital works), `legitimacy`, `loyalty.sc`;
  the size of the chamber at the next election (reapportionment).
- **Constrains Track B:** annexing the Works is about **four seats** (184,000
  residents), so every bench does the arithmetic; Home Rule will not centralise
  for free (`sc` votes against the Act functionally), and the stations'
  price for accepting a new member is development or devolution.
- **Existing content:** `the_federal_option`, `federal_schedule`, station
  government (`Engine.stationGovernment`), the appropriation's capital-works
  clause.
- **Recurring pool:** a closure/development pressure event (to author).
- **Authored decision:** `the_federal_option` (three signatures): devolve or
  refuse.

### 6. Food and the decks
- **Question:** carry the deck, or let the station pay?
- **Moves:** `consumables`, `solvency`, `loyalty.cu_maintenance`,
  `loyalty.psa`, `public_standing`; benches `fc_consumables`, `fc_residual`.
- **Constrains Track B:** the Works' protein moves on the same runs and its
  people draw on the same floor; the appropriation's consumables clause is the
  domestic half of the annexation's cost.
- **Existing content:** `the_floor_presses`, `the_agricultural_deck`,
  `the_deck_again`, the appropriation consumables clause.
- **Recurring pool:** `the_floor_presses` (consumables < 52).
- **Authored decision:** `the_agricultural_deck` (the Harvest refit).

### Cross-cutting, because they touch Track B directly
- **Labour and the caucus:** `halloran_signatures`, `the_paper`,
  `signatures_build`, `leadership_ballot`, `the_pairing_*`. The Act runs on
  maintenance votes and about seven forecast rebels; the ballot is how a
  domestic front ends a run.
- **The President and the constitution:** `tr_reference`, the tribunal,
  escalation rung 8. A referred Act stalls; the tribunal route is one of the
  intermediate resolutions that changes which tier is reachable.

---

# D. THE SETTLEMENT MAP

### One family, five outcomes

The **annexation tiers are the ending**. `f1_triumph`, `f1_maritime`,
`f1_pyrrhic`, `f1_joint`, `f1_capitulation`. A run that never engages the
Works has no tier and its outcome is the **default**: the question was not put,
the Works stays out, and the election returns a government that did not answer
it. That is an outcome, not a failure; it is the "no settlement" reading the
brief measured on two of four strategies, formalised.

| Tier | Route | Reaches when | Domestic resolutions that help | that hurt |
|---|---|---|---|---|
| `f1_triumph` | annex, and Earth blinks | `f1_annexing`, legitimacy > 75, solvency > 70,000, friction < 60 | a quiet session; `federal_fudge` (stations onside); `restriction` (maintenance placated) | shed crisis, deck failure, a failed appropriation |
| `f1_maritime` | annex, into the courts | `f1_annexing`, legitimacy > 55, solvency > 60,000, friction < 40 | `graduated_personhood` (procedural, low friction); a funded registry | any high-friction front; the annexation shock itself |
| `f1_pyrrhic` (canon) | annex, and pay for it | `f1_annexing`, legitimacy > 65, friction > 65, solvency < 35,000 | the annexation shock (+12 friction); a costly domestic resolution; the emergency loan | friction decay; too much domestic calm |
| `f1_joint` | recognise, do not annex | `f1_referendum_carried`, legitimacy 40-60, solvency 40-60k, friction 40-60 | holding the line at the dilemma; moderate domestic outcomes | going too far either way on legitimacy or solvency |
| `f1_capitulation` | decline, and the Works is cleared | `f1_surveyed`, legitimacy < 35, friction > 75 | a domestic collapse (standing); the meltdown road | any recovery of standing or friction |

### What the domestic resolutions do

The four intermediate resolutions are **state, not endings**. Each one:

- **records** (a line on the wire, a mark in the register) - not a dialog;
- **changes the state** (its event already applied the effects; the resolution
  is the reader that notices the shape has settled);
- **changes reachability** by moving the scalars above and by turning the
  functional benches that consent to the Act.

| Intermediate | Detected by | Feeds which tier |
|---|---|---|
| `restriction` | threshold high, divergence bill defeated, no tribunal/federal | placates maintenance -> legitimacy, but Earth sees a Commonwealth that will not reform -> friction up; helps `triumph`, hurts `maritime` |
| `substrate_neutrality` | divergence bill assented, threshold < 49 | costs maintenance and the ring -> legitimacy risk, but a modern Commonwealth -> helps `joint`, hurts `pyrrhic` |
| `graduated_personhood` | `tribunal_established` | legitimacy down, procedure up, friction down -> helps `maritime` |
| `federal_fudge` | `federal_schedule` | stations onside (legitimacy, closure up), centre weaker -> helps `triumph`, hurts `capitulation` |

### The race, and how it is stopped

`checkSettlement` currently picks the single best-ranked match across **both**
families. `graduated_personhood` (rank 0) and `f1_triumph` (rank 0) tie, and
the stable sort lets content order decide - so a domestic resolution can
pre-empt the annexation tier and take the canon ending off the board. That is
the bug, not a feature.

The fix is engine-side (section E, 1): the two families must occupy **separate
channels**. The intermediate resolutions set flags and move state; only the
annexation tiers are eligible to be *the* settlement. A run may hold several
intermediate resolutions and exactly one (or no) annexation tier.

---

# E. WHAT THE ENGINE WOULD NEED

Nothing here is assumed. Numbered; the first two are blocking.

1. **Separate the two settlement families.** `content/settlements.js` needs to
   mark a settlement as `family:"annexation"` (terminal, the ending) or
   `family:"domestic"` (intermediate, never the ending). `checkSettlement`
   must pick the terminal tier from the annexation family only, and record
   domestic resolutions separately - e.g. `st.resolvedDomestic[id] = true`,
   readable by a condition. Without this the two families race and the canon
   ending is pre-empted. **Blocking.**
2. **An ending at the count.** Per `design/31` §4: a settlement landing
   mid-session records and does **not** open a `Dialog`; `ch3_the_count` ends
   the run and the last board is the set piece that states the outcome. Needs
   `js/setpiece.js` and the endgame path rewritten from `afterAction()`'s
   alert. **Blocking the ending feeling like an ending.**
3. **A condition for an intermediate resolution.** Content needs to read
   "the threshold question settled as restriction" and "the union question
   settled as federal", ideally `flags`-shaped so no new condition verb is
   required. If `resolvedDomestic` from (1) is exposed, a `resolved` condition
   reads it. Otherwise content sets its own flags and (1) only needs to stop
   the race.
4. **`almanac_annexed` as the tier gate**, once (5) lands. The three annexation
   tiers move from `f1_annexing` to the Act's `onPass`. Until then they stay on
   the intention, as the brief records.
5. **Earmarked crisis slots.** A measure that brings its own order-paper time
   (`f1_dilemma` grants five slots) must have that time reserved to it, or the
   bills declared earlier in `content/bills.js` take it and the Act never
   reaches a division. This is the open question in `opencode-brief.md` §25.2
   and `claude-brief.md` 3a: decide whether slots are earmarked, and implement
   it. **This is the gating engine work for the whole spine.**
6. **`at:` and `queue` are otherwise sufficient.** The dated chain needs no new
   verb; confirm `at:` fires on the first non-prologue sitting at or after the
   date (it does), and that a labelled queue entry reaches the calendar (it
   does).

### Content changes this implies (my lane, after the author reads this)

- `content/settlements.js`: add the `family` marks; keep the four domestic
  `when` blocks as readers; retire the two-family race once (1) lands.
- `content/events.js`: retag the five aftermath beats `chapter:4 -> 3` and
  renumber (section A); drop `ch4_the_record`; remove `ch4_settled` (the
  chapter-two transition) since chapter three is everyone's ending; set
  `station_issue` in `f1_stranded`; move the annexation tiers' gate when (4)
  and (5) land.
- `content/setup.js`: raise `campaignSittings` from 12 to **18**.

### Not needed, and must not be added
- No new effect verb; the spine stays inside the twenty-verb ceiling (reuse
  `bill`, `queue`, `flag`, `move`).
- No second event system; the set piece is a field on an ordinary event
  (`design/31` §6).
