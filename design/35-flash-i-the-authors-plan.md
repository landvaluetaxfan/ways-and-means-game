# 35 — FLASH I: THE AUTHOR'S PLAN

*The author's own design document for the first campaign, transcribed
verbatim from `game_design.pdf` on 23 Sep 2026, with a map of what is built
appended. **This is the story plan.** It is the spine of Flash I, and where
another note or a bible section proposes a different centrepiece for this
campaign, this document wins.*

*Why it is here: it was not in the repo, and in its absence the backup
coercion "spine" of bible §13.2 and design/09 §6 was read as the story still
to be written. The author: "the main centrepiece you mentioned is a
holdover". The names below are the document's (the Federation, the four
meters by initials); the build calls them the Commonwealth, `legitimacy`
(DL), `solvency` (SS), `friction` (DF) and `thermal_margin` (LSM).*

---

## The document

Convert the treasury mechanic into a wider sovereign solvency

Diplomatic friction score which increases the likelihood of Earth nations
imposing sanctions, blockades, or legal injunctions

An Earth megacorporation abandons an aging, debt-ridden low-Earth-orbit
industrial platform. Its 300,000 stranded workers pass a referendum to join
the Federation, forcing the player into a major international crisis:

The station's host nation becomes embroiled in an international proxy
conflict on Earth, triggering global banking sanctions. The company's
financial accounts are frozen overnight, making it illegal for them to buy
fuel, process water imports, or pay worker salaries in orbital credits. The
state forces a retreat to save its domestic operations, leaving the station
completely isolated from the global financial grid.

Earth's government approves a fully funded, completely legal repatriation
plan. However, due to public procurement laws, safety inspections, and budget
cycles, the process will take two years. To an Earth bureaucrat, a two-year
emergency response for 300,000 citizens is remarkably fast; to an orbital
worker whose air scrubbers are failing in two months, it sounds like a death
sentence.

The station workers vote to join the Federation, for a range of reasons,
including the aforementioned ones, and because returning to Earth is
medically intensive, legally and socioeconomically challenging, and
disruptive.

- **The Dilemma:** Absorbing the platform expands industrial capacity but
  bloats public life-support budgets and risks an Earth embargo over
  defaulted corporate debt and salvage law violations. Rejecting it preserves
  short-term stability but destroys domestic legitimacy and triggers worker
  strikes across outer habitats.

Gameplay avoids rigid binary choices, relying instead on a variable-driven
simulation where micro-decisions influence four continuous state meters:

**Mechanics That Prevent Choreography**

- **Delayed Variable Drift:** Micro-decisions should alter trends rather than
  immediate totals. Decreasing water recycling funding shouldn't trigger an
  instant crisis; it should reduce the *Life-Support Margin* by 2% per turn,
  letting disaster sneak up on an careless player.
- **Compound Triggers:** Ensure failure states require multiple system
  failures. A single bad stat creates a manageable crisis; two bad stats
  trigger a severe political emergency.
- **High-Cost "Panic Buttons":** Bad paths feel fair only if the player can
  see them coming and burn valuable political capital to stop them.
  Emergency measures (e.g., martial law, executive decrees, emergency loans)
  let players avert outright failure, pulling a failing run back into a
  bruised, neutral stalemate.

| Outcome Tier | Variable Thresholds | Primary Narrative Outcome | Systemic Nuance & Long-Term Trade-offs | Emergency Pivot / Recovery |
|---|---|---|---|---|
| **Critical Triumph** *(Asymmetric Victory)* | High DL (>75) · High SS (>70) · Managed DF (<60) | **Orbital Powerhouse:** Full annexation. Earth drops debt claims under threat of satellite transit tariffs. | Unlocks heavy orbital manufacturing, but makes Earth hostile in the outcome. | *N/A (Peak Victory)* |
| **Standard Victory** *(Legal Precedent)* | Moderate DL (>55) · High SS (>60) · Low DF (<40) | **Maritime Charter:** International courts recognize salvage rights. Station becomes a legal Federation territory. | High initial legal and administrative costs stall short-term GDP growth, but builds strong international trust. | *N/A (Clean Resolution)* |
| **Pyrrhic Compromise** *(Debt Integration)* | High DL (>65) · Low SS (<35) · High DF (>65) | **Sovereign Debt Trap:** Platform annexed and 300k workers saved, but Federation assumes defaulted corporate bonds. | Prevents war and satisfies domestic voters, but forces a 3-year austerity regime that drains municipal budgets. | **Asset Liquidation:** Sell mining leases to private cartels to pay down interest. |
| **Managed Stalemate** *(Free Neutral Zone)* | Balanced Variables (All 40–60) | **UN/Orbital Joint Mandate:** Platform becomes a co-administered international free trade zone. | Averts trade embargo and saves lives, but fails to expand Federation territory; causes mild voter apathy. | **Diplomatic Lease:** Negotiate exclusive cargo access fees to monetize the buffer zone. |
| **Strategic Capitulation** *(Managed Failure)* | Low DL (<35) · High DF (>75) · Moderate SS | **Corporate Re-Entry:** Federation rejects referendum; Earth corporate security reclaims and clears the platform. | Completely avoids Earth embargo/war, but triggers massive domestic protests and union strikes across outer habitats. | **Cabinet Sacrifice:** Fire the Foreign Minister to absorb blame and restore public trust. |
| **Systemic Meltdown** *(Catastrophic Failure)* | Critical DF (>85) · Critical LSM (<20) · Critical SS (<20) | **Total Cascade Collapse:** Unilateral annexation without resources triggers an Earth embargo. Life support fails. | Mass riots, hyperinflation, and a parliamentary vote of no confidence. Game Over / Forced Resignation. | **Martial Law:** Temporarily suspend civil liberties to prevent government collapse (drives DL to 0). |

**Nuance Through Interdependent Variables**

- **Graduated Friction:** High *Diplomatic Friction* doesn't instantly cause
  war; it first increases import costs for life-support supplies, slowly
  dragging down *Life-Support Margin* over several turns.
- **Domestic Thresholds:** A player can sustain a low *Sovereign Solvency*
  indefinitely as long as *Domestic Legitimacy* stays high enough to pass
  emergency tax hikes.
- **Cascading Triggers:** Failing a trajectory check doesn't jump straight to
  the worst case—it drops the situation down one tier per turn, giving the
  player time to execute an **Emergency Pivot** before hitting **Systemic
  Meltdown**.

**Mutual Structural Vulnerability** Avoid a simple "dependent colony vs.
self-sufficient Earth" binary. Earth relies heavily on the Federation's
**orbital solar power relays** and satellite maintenance grid, while the
Federation depends on Earth for **nitrogen/volatile imports** and groundside
consumer markets. Neither side can pull the trigger on a total embargo
without causing immediate, self-inflicted domestic damage, creating a
high-stakes game of economic chicken.

**Narrative Asymmetry** Information moves differently across orbital
vectors. Earth citizens see news coverage of a **tragic industrial accident
being politicized by opportunistic space habitats**, while Federation
citizens see **Earth bureaucracy suffocating orbital workers**. The player
must manage media strategy on two fronts, using public addresses, diplomatic
leaks, or international press conferences to sway voters down on Earth.

**Procedural Friction & Horse-Trading** A government simulator feels truly
authentic when you have to work through **parliamentary committees,
emergency motions, and legal challenges**. Passing an emergency annexation
bill shouldn't just cost a resource point—it should require trading votes
with an opposition party, forcing you to promise agricultural subsidies or
dock-expansion rights to fringe station delegates just to get your policy
passed.

Crisis lasts the entire campaign as 1 session: canon-ending is pyrrhic,
causing an election victory

---

## Against the build (23 Sep 2026)

Measured against the content and engine as they stand, not against commit
messages.

| The document | Built | Where |
|---|---|---|
| Treasury into sovereign solvency | **yes** | `solvency`, receipts, named creditors (`setup.lenders`) |
| Diplomatic friction raising sanctions, blockades, injunctions | **yes**, as gated events and couplings | `friction`; `fa_*` events; couplings at 40/65/85 |
| The platform, the freeze, the repatriation plan, the referendum | **yes** | the `f1_*` chain, stranded at 14, dilemma at 21 |
| The dilemma | **yes** | `f1_dilemma`; the Almanac Works (Annexation) Bill |
| Four continuous meters | **yes** | `legitimacy`, `solvency`, `friction`, `thermal_margin` |
| Delayed variable drift | **yes** | `trend.*` moves; trends decay |
| Compound triggers | **yes** | multi-meter `when` gates; `f1_meltdown` on three floors |
| Panic buttons | **yes**: the emergency loan, the emergency order ladder, and the state of emergency | `f1_loan`, `repay_facility`, the thermal ladder, `declare_emergency` |
| The five tiers and their thresholds | **yes**, SS mapped to MW-years (70 → 70,000) | `content/settlements.js` |
| Systemic Meltdown | **yes**, as a loss | `f1_meltdown`; the cascade is a loss in the campaign too |
| Pivot: Asset Liquidation | **yes** (23 Sep): sell the Cordell leases after the debt trap, unless they are pledged to the facility | `sell_the_leases` |
| Pivot: Diplomatic Lease | **yes** (23 Sep) | `lease_the_zone` |
| Pivot: Cabinet Sacrifice | **yes** (23 Sep): vacates External Relations, whoever holds it | `sacrifice_the_minister` |
| Pivot: Martial Law | **yes** (23 Sep), as a state of emergency: the Commonwealth keeps no army | `declare_emergency`, `f1_emergency_lapses` |
| Graduated friction into import costs into LSM | **yes** | `setup.couplings` |
| Domestic thresholds (low SS sustained by DL through tax hikes) | **partly**: rates are the appropriation's clauses; nothing ties an emergency tax rise to legitimacy | |
| Cascading triggers, one tier per turn | **yes** (23 Sep), as two floors before the meltdown, one a sitting at most; the meltdown needs both | `f1_brink_1`, `f1_brink_2` (flags `f1_first_floor`, `f1_second_floor`), `f1_meltdown` |
| Mutual structural vulnerability | **yes** (24 Sep): a blockade costs Earth while it still buys from the Commonwealth, and the Commonwealth can hold back the relays and crews; whoever's stores run out first gives way | `setup.couplings` (group `earth_cost`), `hold_the_relays`, `restore_the_relays`, `f1_earth_answers` |
| Narrative asymmetry, two-front media | **thin**: one event (`fa_two_fronts`); no player lever for Earth opinion | |
| Committees, emergency motions, legal challenges | **yes** | committee stage and amendments, motions, the Tribunal |
| Horse-trading with fringe delegates | **yes**, generically: a lobbied bench costs a promise | `lobbyable`, undertakings |
| One session; canon pyrrhic; election victory | **yes** | `setup` (one session, three periods); bible §1.8 |

Five items are unbuilt (three of the four pivots, the tier cascade and
mutual vulnerability) and four are partial or thin (asset liquidation, the
panic buttons' martial law, domestic thresholds and the media front). Those
are the rest of this campaign.

**23 Sep, later:** the four pivots and the tier fall are built as examples
to rewrite. They are initiatives and events at the end of the files in
`content/campaigns/flash_i/`, the campaign's own folder since the same day.
Building
them found that an event's own `effects` were applied by nothing, so the
accounts freeze had never set `f1_frozen`: the meltdown could not come in
any run, and the indemnity could not pay. `choose()` applies them now. Left:
mutual vulnerability, the media front and domestic thresholds.

**24 Sep:** mutual vulnerability is built. Earth depends on the
Commonwealth for compute, for power from the orbital relays and for the
crews that maintain its satellites; the Commonwealth depends on Earth for
the nitrogen and water that come up the tethers. Two halves:

- **Earth's cost is structural** (world setup). Above the blockade line,
  while the Commonwealth sells Earth at least as much as it buys (trade 95
  or above), Earth's own losses pull friction down two a sitting. A total
  embargo holds only against a Commonwealth that trades little. It changed
  no existing run: the canon run and all seven playtest strategies end as
  before.
- **The Commonwealth's lever is Flash I's** (`hold_the_relays`, cost one
  slot): hold back the relays, or the relays and the crews. It costs trade
  and the Alliance's goodwill and gains standing at home. Earth answers two
  sittings later (`f1_earth_answers`). With consumables at 50 or above the
  Commonwealth can outlast Earth's grid and the Union gives way (friction
  down 10, or 18 with the crews held too); below 50 the Union waits and cuts
  the volatiles. `restore_the_relays` is giving way first, at a cost in
  legitimacy.

Left: the media front and domestic thresholds.
