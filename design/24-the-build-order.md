# 24 — THE BUILD ORDER

*`design/23` argues that lobbying, actors and polling are one feature. This is
the executable version: numbered tasks, the lane each belongs to, the files each
touches, and what has to be true before it is done.*

**Two lanes, and they do not collide.** `AGENTS.md` is the authority: Claude Code
owns `js/*`, `tools/*`, `test.js`, schema and vocabulary; opencode owns
`content/*.js` and prose. Every task below names its lane. The two columns can
run at the same time because Lane B needs **no new schema** — every task in it
uses vocabulary that already exists and is already tested.

---

## 0. The three shapes, decided up front

Lane B does not need these, but Lane A must not invent them twice, and anything
authored against them later should match. Final shapes land in `js/schema.js`.

**An actor** — `content/actors.js`, new file.

```js
{ id: "licensing_board",
  name: "The Licensing Board",
  kind: "statutory",              // statutory | industrial | commercial |
                                  // confessional | judicial | press
  standing: 50,                   // regard for the government. Slow, like loyalty.
  patience: 3,                    // sittings it waits before acting on its own
  wants: "…",                     // one line
  lever: "…",                     // one line: what it can do TO YOU
  benches: ["fc_substrate"],      // functional constituencies it can move
  price: [ /* undertakings it will accept — below */ ] }
```

Three stored fields and no more (§7.6). Everything else is content the engine
reads and never writes.

**A price** — an undertaking template, because lobbying pays in the future tense.

```js
{ id: "board_review",
  text: "A review of the licensing schedule before the House rises",
  by: 6,                          // sittings; null means "before prorogation"
  moves: { fc_substrate: 2 },     // functional seats delivered for this division
  onBreach: "evt_board_snubbed" }
```

**A pollster** — an actor with `kind:"press"` and a house effect.

```js
lean: { subject: "threshold", points: 3 },   // this house reads 3 high on this
cost: 1                                       // slots to commission
```

---

## LANE A — ENGINE  ·  Claude Code

### A1. The actor store
`js/engine.js`, `js/schema.js`, `test.js`

- `st.actors = { id: {standing, patience, lastAct} }`, seeded in `newGame()` from
  `C.actors`, backfilled by `reconcile()` the way parties and stations are.
- `STATE_VERSION` 12 with an ascending migration block.
- `move` reaches `actor.licensing_board` the way it already reaches `loyalty.cu`
  — **no new verb.**
- New conditions: `actorAbove` / `actorBelow`. Conditions are not under the
  twenty-verb cap; effects are.

**Done when:** a save written at v11 loads with every actor at its content
standing; `move:{"actor.x":-5}` moves one; `reconcile()` backfills an actor added
to content after the save was written.

### A2. Lobbying
`js/engine.js`, `js/ui.js`, `test.js`

- `st.lobby[billId][actorId] = seats`, parallel to `st.whips` in every respect:
  planned, revisable, and **not charged until the division is called**.
- `Engine.lobbyable(st, C, billId, actorId)` — what this actor will move on this
  measure, and at what price, or why not.
- `Engine.setLobby(...)` / `Engine.clearLobby(...)`, and `divide()` charges by
  creating the undertaking through the existing `undertake` path — so the debt
  carries a deadline, a responsible minister and an `onBreach` for free.
- `division()` adds lobbied seats to the functional aye. They must show in the
  breakdown distinctly from whipped seats: **whipped is a member you moved,
  lobbied is a bench somebody else moved for you.**
- UI: a second panel under the whip on the Chamber tab, same shape, priced the
  same way — and the price card says *what you are promising*, not what you are
  spending, because that is the whole point.

**Done when:** substrate neutrality is reachable. A test drives a state from the
opening to a carried dual-majority threshold bill using lobbying, and
`checkSettlement()` returns it. That test is the acceptance criterion for the
entire feature.

### A3. Opinion, and the first pollster
`js/engine.js`, `js/ui.js`, `test.js`

- Generalise the machinery behind `reported()`: it is *a number, from a source,
  wrong by something, with provenance*. Extract that and point it at opinion.
- `Engine.poll(st, C, houseId, subject)` → `{value, need?, asOf, house, prov}`.
  Seeded by `noise()` so a redraw cannot re-roll it.
- Subject opinion is **derived, never stored** — from `st.law`, station
  conditions and `public_standing`. §7.6 holds: one number, refracted.
- Commissioning a poll is an initiative (`content/initiatives.js`), so it costs
  order-paper time and arrives later through the deferred queue.
- UI: a poll is a dated readout with its house on it. Never a live figure.

**Done when:** two houses report different numbers for the same state and
neither is the true one; the same house asked twice on the same sitting gives
the same answer; `st.scalars.public_standing` is gated by more than one thing.

### A4. Actors act
`js/engine.js`, `test.js`

- In `advance()`, after `resolveDue()`: an actor whose `patience` has elapsed
  and whose standing is low enough posts a fact into the queue.
- The engine chooses **nothing** about what. Content declares `onImpatient` as
  effects, exactly like `onBreach`.

**Done when:** a constructed state with a hostile actor produces a queued fact
without the player doing anything, and the calendar shows it if it is labelled.

### A5. The checks that keep it honest
`tools/lint.js`, `tools/uxtest.js`

- Every actor declares a lever and at least one price, or it is a number
  wearing a name.
- Every `onBreach` and `onImpatient` names an event or effects that exist.
- The consequence-chain audit **counts**: warn above roughly 6:1 moved-to-gated.
  It currently passes `public_standing` at 40:1 because the bar is "at least
  one", and that bar is why the number is dead.

---

## LANE B — CONTENT  ·  opencode

**None of this waits for Lane A.** Every task uses vocabulary that exists today.
The four tasks are in priority order and each one closes a gap `design/22`
measured.

### B1. Currents for the parties that should have them
`content/parties.js` (the `CURRENTS` list)

The player's party has four currents. The other eleven have none, so the
Commons Union splits like Westminster and everyone else votes like a machine,
and nothing in the fiction explains why. The engine has supported this since
currents existed — `benches()` resolves faction by faction.

Canon already specifies two of them:

- **Association of Engineers and Systems** splits *constitutional* (emergency
  powers codified and limited) against *integrity* (that distinction is not
  meaningful) — §8.5.
- **Congregational Democratic Alliance**: conference voted against threshold
  reform 71–29 and its three ministers absented themselves rather than divide
  against the leadership in public — §8.5. That is a current with a number
  already attached.
- **Home Rule** is "ideologically incoherent across stations, which is realistic
  and mechanically fun: they cannot whip their own members" — §8.5. That party
  should be *mostly* currents.

Start with those three. The Liberal Party at 47 seats with no internal division
is the next least credible.

**Done when:** members sum to the party's popular seats for every party that has
currents, which `test.js` already asserts.

### B2. Events that read the state
`content/events.js`

**Seventeen of thirty-one conditions have never been used.** `chapterAtLeast`,
`inGovernment`, `capitalAbove`, `siInForce`, `postVacant`, `priceBelow`,
`suspendedBelow`, `breached`, `lawAbove`, `loyaltyAbove` and the rest. The
apparatus for making an event depend on what the player has already done is
built, tested and idle.

This is the cheapest fix available to the worst number in the project:
`public_standing` is moved by forty effects and gated by one.

**Done when:** at least ten of the seventeen are used somewhere, and the chain
audit shows every scalar gated by three or more.

### B3. The unreached canon
`content/events.js`, `content/business.js`, `content/stations.js`

Four themes are LOCKED in the bible and appear in **no event at all**:

- **Volume** — §6.10 calls it the fundamental scarce good and the volume fight
  "almost entirely a biological politics": density regulation, minimum-volume
  standards, subletting, partitioning a berth into six. `station` already moves
  any numeric field on any station, so this needs no engine work whatever.
- **Courts** — §10.8. Long-lived emulated judges who personally remember the
  founding. Reclassification as a branch of practice.
- **Consumables** — one of the six scalars, and §10.1 puts the agricultural
  decks at "the emotional centre of any station".
- **Congregations** — §10.9 is marked *LOCKED, currently THIN* and it is the
  section that named the CDA. A cross-confessional bloc of non-recognisers,
  economically left and culturally immovable.

Foreign affairs is the fifth zero and is **correctly** absent: Part XVI gates it
at ~25 chapter-one events and there are 17. Leave it.

### B4. People, and the press
`content/events.js`, `content/characters.js`

**One of fifty-four characters appears in any event.** Fifty-three have a party,
a seat, an office and a Concordance article, and never speak.

The cheapest fix is not an event each. It is letting two of them be quoted in
the same wire item taking opposite sides — and giving the wire more than one
masthead, because one neutral voice is a narrator and three with owners is a
world. *The Spindle* already exists with a political editor.

---

## The dependency graph, in one line each

```
A1 actors ──┬─→ A2 lobbying ──→ substrate neutrality becomes reachable
            ├─→ A3 polling  ──→ public_standing stops being dead
            └─→ A4 they act ──→ the world stops waiting to be addressed

B1 currents ─→ B2 when-blocks ─→ B3 unreached canon ─→ B4 people
   (no dependency on Lane A at any point)
```

## And after that

`design/25` carries eight pieces of real parliamentary procedure that this
parliament does not have — supply, the programme speech, commencement, the
ministerial direction, allocation of time, collective responsibility,
amendments and select committees. Deferred, but costed, and two of them
(commencement, amendments) are nearly free because the machinery is already
allocated. Supply is the largest structural hole in the game and `design/13`
has already done most of the thinking on it.

## What is explicitly not in this plan

Committee, question time, by-elections, deputations, strikes, the Speaker and
the press-with-a-line beyond B4 are all in `design/23` §5 and all deferred. They
are cheap *after* A1, and building any of them first means building a private
version of the actor store inside it.
