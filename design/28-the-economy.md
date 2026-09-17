# 28 — THE ECONOMY

*The markets in §7.5.2, made playable — and the one line of `design/13`
this document reverses.*

> **STATUS, 17 September 2026 — THE PLAN, AND A DECISION.**
>
> `design/13` §6 ruled: *"None of §7.5.2's markets are simulated. Quota
> trading, underwriting, volume leases and substrate futures are setting.
> They appear in prose, in the Concordance, and as the subject of events."*
> **The author has since asked for them to be built.** So this document
> reverses that line, and the reverse is narrow: the markets become
> **positions the government can take**, priced by the four numbers already
> in the model. What §6 was protecting — no supply-chain solver, no second
> window — is now a constraint ON this document rather than a reason
> against it.
>
> **LANDED.** Phase 1 (the appropriation drives the four prices), phase 2
> (the quota forward), and phase 3 (underwriting, volume leases and the
> substrate debt, with their glossary terms) are in, all content-only after
> phase 1. Phase 4 (the denominated treasury) landed on the author's
> decision that the old index point is a thousand MW-years: the
> Commonwealth opens holding 52,000, the appropriation's defaults come to
> 48,000, and every solvency effect in content is re-costed at that scale.
> Because it is a pure rescale, no balance ratio moved. Phase 5 (the
> Concordance) is next.

---

## 1. What is being reversed, and what is still forbidden

`design/13` §6's reason stands and is kept:

> Simulating them would be the supply-chain solver §7.6 rules out in its
> first line.

So the constraint is not "do not represent the markets" but **"do not
simulate a clearing price"**. Nothing here computes an equilibrium, a book,
a yield curve or a margin call. Every market is:

- a **position**: something the government takes now, that comes due later;
- **priced by the four indices** (`thermal`, `substrate`, `volume`,
  `transit`), which are legislative outputs (§7.9) and not market outcomes;
- **settled by an event**, which is where a player reads it (T2).

A position is therefore: a `move` now, a `queue` entry on the calendar, and
a **settle event** whose `when` reads the state at the day it lands. That
is the whole vocabulary. **No new effect verb** — the twenty-verb line
(§15.5) holds at twenty-one and this document does not touch it. Conditions
are not capped (§7.6), so a settle event may read whatever it needs.

**Still forbidden, and for the same reasons:** a revenue model, a bond
market, an interest rate, a running deficit across sessions (§13 §6, §8.3),
and public equity (§7.5.1 LOCKED — franchise attaches to corporate control,
so an IPO dilutes a parliamentary vote).

## 2. The unit — and why nothing is invented

`design/13` §8.1 asks for three bible edits before any engine work, one of
which invents a unit and therefore needed a canon decision.

**The decision: the Commonwealth's money is quota, and the unit is the
MW-year rejected.** No coin is named. The UI already says *"per MW-year
rejected"* for the thermal price, and §7.5.3 already denomination by thermal
rejection capacity; so the unit of account is a quantity of the thing the
game is about, the money is the quota claim on it, and **the state's holding
is the treasury.** That is §7.5.3 locked without inventing a setting term
(§2.7), and it is also why §7.5.3's poetry is true rather than decorative:
*"a currency that is a claim on radiator capacity is a claim on room for
someone to be alive."*

**Therefore `treasury` becomes the quota the state holds** — a quantity,
shown exactly, for the reason capital is (§13 §5). This is the one large
content re-cost in the document and it is phased last (§6), because every
`solvency` number in the game is currently an index point.

## 3. The four markets, as positions

Each is in §7.5.2 already. The last column is the whole engineering
difference between this document and the solver §6 forbade.

| market | §7.5.2 | the position | settled by |
|---|---|---|---|
| **quota trading and forwarding** | "traded, hedged, forwarded and defrauded" | **Sell quota forward**: take the money now for capacity delivered at a named sitting. **Buy cover**: pay now against the quota release coming short. | a settle event that reads `price.thermal` / `law.thermal_release` on the day |
| **underwriting** | "the dominant institution"; prices failure continuously | **Take an indemnity**: the Underwriters carry a named risk for the session. Pay a premium now; if the event fires, the payout offsets it. | a settle event gated on the risk's own flag |
| **volume leases** | "long-dated, inheritable, the household store of wealth" | **Charter volume**: the state leases volume forward to a station or a body, at a term, in exchange for closure or cash. | a settle event at the term's end |
| **substrate futures and debt** | "forward contracts on mind-hours"; "credit secured against your own continuation" | **Assume or write off**: the state takes on, or cancels, debt secured against people's continuation. (Flash I's pyrrhic tier is the worked example.) | a settle event reading the station's `suspended` and the price |

Two consequences worth stating before the table of phases:

- **A position is visible.** It is a `queue` entry with a `label`, which
  puts it on the parliamentary calendar (`design/15`) under that label and
  in the docket. A contract the player cannot see is the failure this
  project keeps finding; a labelled queue entry is the existing fix.
- **A position can be broken, and breaking it is a promise broken.**
  Where a position names a delivery, its failure is an `undertake` with a
  deadline, not a silent loss. That is `design/02`'s spine reused.

## 4. The appropriation drives the four prices

`design/13` §2.3 found the defect: two of the four prices are barely driven
and the appropriation drives none of them:

| price | driven by now |
|---|---|
| thermal | `thermal_margin` |
| substrate | `substrate_public_share`, and thermal |
| **volume** | `treasury`, continuously (was a binary) |
| **transit** | `treasury`, linearly |

**Phase 1 makes the appropriation the driver**, per §7.9:

> The four prices are legislative outputs, and the appropriation is the
> legislation.

The mechanism is small and needs no new verb: **each appropriation clause
sets a `law` key for the level chosen** (`law.capital_works`,
`law.transit_subsidy`, `law.thermal_release`, and the two welfare clauses as
booleans), and `tick()` reads those keys for the volume and transit target
it already computes. The clauses keep their existing effects; the law keys
are the appropriation's fingerprint on the market, readable by content and
by the Concordance.

## 5. What content gets, concretely

New content files, in the existing idiom:

- `content/contracts.js` — the four markets as **initiatives** (a thing the
  government starts, answered later with a branch), each with its settle
  event in `content/events.js`. *No new file reader is needed: `initiatives`
  and `events` already exist; this file is the author's if they want it as a
  separate list, and the engine change is zero either way.*
- Settle events in `content/events.js`: chapter two and three, `queuedOnly`
  where they are only reachable from a queued position.
- Glossary terms the first time each is met, in `content/glossary.js`:
  *forward*, *indemnity*, *charter* (a volume lease), *write-off*. Each is
  introduced once (one concept cluster per event, §2.6 and the lint).

## 6. Phases

| # | phase | engine | content |
|---|---|---|---|
| **1** | The appropriation drives the four prices | `tick()` reads the appropriation's law keys | the clauses set them |
| **2** | The position pattern: sell quota forward | none | the initiative + the settle event |
| **3** | The other three markets | none | initiatives + settle events + the terms |
| **4** | Denominating the treasury (§13 §5) | `solvency` becomes a quantity; the meter becomes exact | the re-cost of every `solvency` effect |
| **5** | The Concordance reaches them (§13 §6) | none | articles for the four instruments |

Phase 4 is deliberately last and deliberately alone: it is the one change
that touches every other number in the game, and it is only worth doing once
the markets exist to be denominated.

## 7. Acceptance

- Every position appears on the parliamentary calendar under its own label
  while it is open.
- A settle event **branches on the state at the day it lands**, and the
  branch is asserted in both directions (a forward sold into a tight release
  pays; the same forward into a loose one costs).
- The four prices move when the appropriation says so, asserted per clause.
- No position, and no settle event, introduces a new effect verb: asserted
  by the existing count in `test.js` (twenty-one verbs, §15.5).
- Every instrument is introducible in one sitting: asserted by the existing
  legibility lint against glossary introductions.
- `solvency` is a quantity and is shown exactly (§13 §8.1), asserted after
  phase 4.
