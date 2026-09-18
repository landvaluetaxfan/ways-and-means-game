# 30 — THE TRIBUNAL

*The judicial system as a working mechanic. Framework, for the author's
approval before the content is written.*

---

## 1. Why it is the largest thing missing

The game's subject is **where the legal line sits**. A person is a copy that has
run for 168 hours; an order can suspend a register; a bill can be struck down on
review. Every one of those is a legal act, and the only institution that
adjudicates them is the President, who is a reserve power and not a court.

What exists already and does nothing:

- **The Tribunal** is named in content (the `the_tribunal` flag, `tribunal_refused`),
  and the settlement `federal_fudge` is gated on a settlement that involves it.
- **The judge who remembers** was written in T8 (`the_old_judge`): emulated in
  2249, sitting continuously since, and asked for a reference on whether
  **reclassification** is a question of fact for the courts or a branch of
  practice for the licensing boards.
- **`revokeInstrument`** already exists: an order can be taken out of force and
  its effects reversed.
- **`reviewReturns`** already exists: a referred bill comes back from the
  President's review and can be struck.

So the pieces are on the table and there is no bench to put them on.

## 2. What the mechanic is, in one sentence

**An instrument, or a policy, can be challenged; the Tribunal rules on a named
day; and the ruling can strike it, narrow it, or uphold it — and the government
can comply with a reference or refuse to, which is itself a decision the bench
remembers.**

That gives the game three things at once:

1. **A second clock.** A ruling is *due on a sitting*, which is the queue and
   the calendar, already built. It is the one deadline the government cannot
   whip.
2. **A lever for the opposition that is not a division.** A prayer needs
   numbers; a challenge needs a lawyer. The opposition can hurt the government
   in a lobby or in a courtroom, and the two cost different things.
3. **Consequence for the state's fastest tool.** An order is in force at once
   and prayable. Add review and it is also *challengeable*, which makes the
   instrument ladder a series of bets rather than a series of coup de main.

## 3. What it must not be

- **No new effect verb** (§15.5, the line of twenty-one holds). Every part of
  this is expressible with `move`, `flag`, `queue`, `law`, `actor` and the
  existing `revokeInstrument`.
- **No simulation of law.** No case list, no doctrine, no appeals. A case is a
  **queued event with a date**, and a ruling is a **choice gated on state**.
- **No randomness.** Rulings are conditions on the state, like referrals
  (`presidentDecides`) and every other mechanic here. A coin-flip court would
  break §1.5 and the whole argument of the game.
- **No second chamber of politicians.** The bench is not elected and cannot be
  whipped. That is the point of it.

## 4. The state, and how content writes it

**The bench is an actor.** `content/actors.js` gains one entry, exactly the way
the Earth states were added:

```js
{ id: "tribunal", name: "The Tribunal", kind: "court",
  foreign: false, reach: {}, wants: {},
  standing: 55, patience: 90,
  asks: "that references are answered, not ignored",
  note: "…" }
```

`standing` is the bench's **disposition toward the government**, not its
quality: high is a bench that reads the government's orders generously, low is a
bench that has been given reasons to read them narrowly. Content moves it with
the existing verb:

```js
{ move: { "actor.tribunal": -6 } }      // a reference ignored, an order defying a ruling
{ move: { "actor.tribunal": +4 } }      // a reference answered, a ruling complied with
```

No new verb, no new state shape, and `Engine.reconcile()` backfills the actor
into old saves on the same path as every other actor.

**A case is a queued event.** A challenge is content queuing a ruling:

```js
{ queue: [{ event: "tr_ruling", after: 4, label: "The Tribunal hears the challenge" }] }
```

The label puts the case on the calendar and on the Tribunal panel with a date,
which is the whole of the "second clock". `content/events.js` carries the
rulings, and each ruling's choices are gated on conditions that already exist:
`actorAbove` / `actorBelow` on `tribunal`, `lawIs`, `flags`, `siInForce`,
`scalarAbove` on `legitimacy` and `friction`.

**A ruling strikes, narrows, or upholds**, and each is already expressible:

| ruling | how |
|---|---|
| **struck** | `{ si: { <id>: { revoke: true } } }` if the SI verb supports revocation, or a flag the Concordance and content read; plus `{ move: { "actor.tribunal": -8 } }` if the government defied it |
| **narrowed** | `{ flag: { "<si>_narrowed": true } }`, and the order's `effect_note` and any later content read it. The order stays in force and does less |
| **upheld** | costs the challenger: `{ move: { "loyalty.<challenger>": -4 } }`, and the government banks `{ move: { "actor.tribunal": +3 } }` |

## 5. The conditions to add (conditions are not capped)

Three, and only the third is genuinely new:

1. **Cases in flight** are readable from the queue by event-id prefix, which the
   UI does today for foreign dispatches. No condition needed.
2. **`siChallenged`** — an order under challenge. Content can already gate on
   `siInForce` and a flag; a dedicated condition is optional.
3. **`rulingIs`** — which way the Tribunal ruled on a named subject, so that a
   *later* event can refer back to it ("the ruling the government defied in
   March"). This mirrors `resolvedIs` and is the one addition that earns its
   place, because long memory is the point of a court.

## 6. The surface

A **Tribunal panel** on the Papers tab, beside the orders it judges, on the
pattern the foreign panel already uses:

- the bench, its disposition as a bar, and what it wants;
- **in flight**: every case with the sitting it is due, which is the same queue
  the calendar reads;
- **last ruling**: which way it went and what it did.

That is three readings and no new visual language, which is what §5 of
`design/11` asks of a new instrument.

## 7. Where the content goes

Four events, and no more to start:

1. **`tr_challenge_lodged`** — the opposition challenges an order in force. It
   fires on `siInForce` for one of the orders the ladder can make, so the
   challenge is *caused by something the player did*. Choices: answer it
   (`actor.tribunal` +), or refuse to brief counsel (−).
2. **`tr_ruling`** — the ruling, gated on the bench's disposition and the
   government's conduct, striking, narrowing or upholding. Queued by the
   challenge, `once: true`.
3. **`tr_reference`** — the government refers a question of its own (the
   `the_old_judge` reference, extended): is reclassification a question of fact?
   **Answering it costs order-paper time and binds the government**; ignoring it
   costs the bench's disposition and the ruling goes the other way.
4. **`tr_foreign_courts`** — the Earth-side case. The salvage claim, the frozen
   accounts, the corporation's wind-up: a foreign court rules, the news arrives
   late, and the government reads it on the foreign panel. This is where the
   judicial layer meets `design/29`.

## 8. Acceptance

- An order in force can be challenged, and the challenge appears on the calendar
  and the panel with a date, with no new effect verb.
- A ruling branches on the bench's disposition and is asserted both ways.
- The bench's disposition moves when a reference is answered and when it is not.
- A struck order is out of force and its effects are reversed.
- `npm run check` still reports twenty-one effect verbs.

## 9. What the author has to decide

1. The bench's **name**: *the Tribunal* is already in content and is the
   recommendation.
2. Whether it is an **actor** (recommended, no new verb) or deserves its own
   state shape.
3. Which orders are **challengeable**: all of the ladder, or only the ones that
   touch personhood.
4. Whether the government can **defy** a ruling, and what defiance costs. This is
   the best decision in the document and it should cost a great deal.
