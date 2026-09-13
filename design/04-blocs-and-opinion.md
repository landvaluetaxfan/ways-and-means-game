# 04 — BLOCS AND OPINION

`material_interest` exists on thirty stations, a hundred and forty-one
constituencies and every archetype. The engine reads none of it
(`loop-brief.md` §1.3). This document makes it load-bearing **without adding a
single field to the state object**, because the obvious version of this feature
is forbidden by canon and the forbidden version is also the worse one.

---

## 1. What not to build

The tempting design is an opinion model: a stored number per bloc, moved by
effects, decaying over time, feeding `public_standing`. Reject it, on two grounds.

**§7.6 is LOCKED.** *"Shallow simulation, deep consequence. No supply-chain or
price solver."* And the test: *"if the player would need a second window to
compute the right answer, the model is too deep."* Six blocs with stored,
decaying standing is a spreadsheet.

**`sweep-brief.md` C.5 proposes a sixth scalar** for electoral standing. Rejected
here for the same reason — a sixth number the player must track is the wrong
answer to "the model cannot see blocs". The right answer is a derivation the
player can read on demand and never has to hold in their head.

## 2. What to build: a derivation

A bloc's standing is **computed when asked, from data that already exists**, and
stored nowhere.

```js
/* Engine.blocView(st, C) -> [{ id, name, aggrieved, because }] */
```

Three inputs, all present today:

1. **`material_interest` tags** — what this bloc's welfare depends on. Already
   authored on every station, constituency and archetype.
2. **The four prices** — how those things are going.
3. **The law object** — `divergence_threshold_hours`, `substrate_public_share`,
   `civic_clock_minimum`, `suspension_debt_accrual` and the rest.

A bloc is *aggrieved* when the things it depends on have moved against it since
the opening of the session. That is a comparison, not a simulation: no
integration, no decay, no hidden accumulator. Re-derive it and you get the same
answer from the same state, which keeps I1 and I2 intact for free.

`because` is the important field and the one that keeps this honest: the
derivation must be able to say *which* interest moved and by how much, in one
clause, or it is too deep. If it cannot be explained in a sentence the player
could have worked out themselves, cut it until it can.

## 3. The blocs

Named in the bible, currently invisible to the chamber. This list is the
setting's, not the engine's — it lives in `content/blocs.js` and the engine
learns it from there (T3).

| bloc | interest | canon |
|---|---|---|
| embodied labour | volume, transit, wage exposure | §10.3, §10.3.1 |
| the emulated poor | substrate, thermal, clock minimum | §6.10.2 |
| the long-lived emulated | substrate insurance, backups | §6.10.2, §7.4 |
| fork-rentiers | the divergence threshold | §10.5, and Part XVI: 210k people with a direct interest and **no parliamentary voice** |
| guild licensees | licensure, standards | §4.6.4 |
| consortium shareholders | anchors, tether traffic, quota | §10.10 |

§6.10.1 is the load-bearing one and the engine must not flatten it: **the real
class axis is exposure, not substrate.** A bloc model that sorts people into
biological and emulated has reproduced the mistake the bible spent a section
warning against. Exposure — `0.75 − closure`, the same weighting §7.9 already
uses for stations — cuts across substrate and is what actually predicts who
suffers.

## 4. The condition

```js
when: { blocAggrieved: ["fork_rentiers", "emulated_poor"] }
```

One condition. It is the whole point of the derivation: under §7.9 the chain must
terminate in an event, so what content needs is not a number to read but a gate
to hang an event on.

## 5. Where it surfaces

**Not as a meter.** Meters invite optimisation and §7.6's test rules them out
here. Two places, both on demand:

- **The Chamber screen**, as a column or an overlay: which benches answer to
  which aggrieved interest. This is where it earns its keep, because it turns
  "the functional bench will not carry this" from a fact into a reason.
- **A constituency's expanded row**, which already exists (`consOpen`,
  `constituencyDetail()`), naming the interests that seat answers to and whether
  they are currently moving against it.

## 6. What this unlocks

The fork-rentier problem Part XVI raises — *210,000 people with a direct interest
in the threshold and no expression in the chamber* — becomes stateable once blocs
are derivable. It stays a **political** problem rather than becoming a mechanical
one: the bloc is visible, aggrieved, and structurally unable to vote, which is
the setting's argument rather than a bug in it.

The same derivation is what `09` needs to change the electorate between
parliaments, and what `06` needs to price an amendment's cost in bloc terms
rather than in raw loyalty.

## 6.5 The other kind of bloc — currents, and what was inert in them

Asked whether parties should be *"weighted towards multiple different ideological
blocs"*, the honest answer turned out to be that half the mechanism had been in
the build the whole time and the other half was decoration.

`content/parties.js` carries **CURRENTS**: factions inside a party, each with its
own `members`, its own `loyalty`, and **its own four axes**, independent of its
party's. Four of them, all inside the governing party:

| | members | loyalty | |
|---|---|---|---|
| Maintenance bloc | 31 | 29 | public · restrictionist · federal · closurist |
| Leadership loyalists | 22 | 88 | public · restrictionist · federal · — |
| Deck cooperativists | 18 | 54 | public · restrictionist · **station** · closurist |
| Czarnecki group | 11 | 12 | public · restrictionist · federal · closurist |

The loyalty half was wired: a current is a `move` target and a `loyaltyBelow`
subject, and the leadership challenge reads one. **The axes were read by
nothing.** `axisAgreement` was only ever called with a *party's* axes, and a
division resolved all eighty-two members at one rate derived from one number.
Four ideological positions sat in content as documentation.

This is worth stating plainly because it is a §7.9 violation in a form the
consequence-chain audit cannot see: the audit compares effect verbs against
conditions, and these were neither. They were a field nobody read.

### The distinction that matters

Currents and blocs are the same idea on opposite sides of the chamber door, and
neither substitutes for the other.

| | currents | blocs (§§2–5 above) |
|---|---|---|
| the question | who votes how | who suffers what |
| where | inside a party, in the House | outside it, in the electorate |
| the data | `CURRENTS[].axes`, `.loyalty` | `material_interest`, prices |
| the output | a division result | an event, and eventually a seat |
| stored? | loyalty yes, size as a **share** | nothing at all |

### What the engine now does

`turnout()` resolves a party's delivery **faction by faction**: each current at
its own discipline, and a current whose axes disagree with the measure turning
out proportionally less, to nobody at total disagreement. Disagreement only ever
costs — a faction cannot deliver more members than it has, so a popular measure
buys quiet rather than extra votes.

**The case it exists for** is a party with no position on an axis whose currents
all have one. The governing party's `closure` is `null`; two of its currents are
`closurist` and the bill in front of it is `integrationist`. Read at party level
the axis is simply skipped. Read at current level it costs the deck
cooperativists nearly half their turnout, and no other mechanism in the engine
could have seen it.

Three properties, each asserted in `test.js`:

- **Members are a share, not a count.** Content states a faction's size; the roll
  states the party's, and an election moves the roll without touching the
  content. A current is resized against whatever its party currently holds —
  `apportionment_ratio` taught this once already.
- **A stated forecast is not attributed to the factions.** `{for: 68}` is a
  number the whips handed the Prime Minister. Splitting it across currents
  afterwards would be the interface inventing a reason the content did not give,
  so the engine returns no breakdown for a stated count. The bible's 128 is
  untouched for exactly this reason.
- **Every column sums.** Faction seats sum to the party's seats and faction ayes
  to the party's ayes, by largest remainder, in the engine and on the screen.

### The content this now makes worth writing — opencode's lane

**All four currents belong to one party.** The other eleven are monolithic, and
the mechanism that would make coalition management a negotiation with factions
rather than with a bloc is now sitting there unused for all of them.

Two or three currents inside the parties the player actually negotiates with —
the New Progressive Party and the Alliance of Business and Government first,
since one is the coalition partner and the other is the functional bench that
decides every dual majority. **Content only; the engine needs nothing.**

The discipline is §7.6's: **cap it at the parties that are negotiated with.**
Thirty currents across twelve parties is the spreadsheet the depth test forbids,
and the value is entirely in the two or three benches whose internal argument the
player has to manage.

### What is deliberately NOT built

**Whipping a named current.** The whip moves members, not factions, and a plan
that targets a faction is a bargain rather than a whip — `design/07`, where the
currency is different and the counterparty can refuse.

**A current defecting to another party.** `content/parties.js` already says a
current that drifts far enough *"simply becomes a party in the list above"*.
That is a content event and a `vacate_seat`, not an engine feature.

## 7. Acceptance

- `Engine.blocView()` adds nothing to `Engine.save()` output — asserted by
  calling it and comparing byte-for-byte.
- Called twice on identical state it returns identical results; called after a
  price move it returns different ones.
- `because` is present and non-empty for every aggrieved bloc.
- `blocAggrieved` gates an event in both directions.
- `content/blocs.js` round-trips through the editor (`tools/roundtrip.js`), and
  `js/refs.js` follows bloc ids so a rename reaches them.
- `grep -E 'fork_rentier|emulated|guild' js/engine.js` returns nothing (T3).

For §6.5, all present in `npm run check`:

- A current that is **more** loyal than another and **less** willing turns out
  less, which is only possible if its own axes are read.
- Faction seats and faction ayes each sum to the party figure above them, in
  `test.js` and again in the rendered table in `tools/uxtest.js`.
- A party with no currents reports none, and none of the eleven monolithic
  parties' numbers moved.
- A stated `{for: n}` forecast produces no faction breakdown.
- A party that loses seats has factions that shrink with it and still add up.
- T3: no branch in `js/engine.js` names a party or a current. The four
  occurrences of an id there are worked examples in doc comments
  (`{move:{"loyalty.psa":8}}`), which is the file explaining its own
  vocabulary rather than encoding a party.
