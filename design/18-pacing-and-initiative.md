# 18 — PACING AND INITIATIVE

*A review of whether the design corpus adds up to a game, a length target and
the arithmetic behind it, and one mechanism that gives the player something to
start.*

---

## 0. ARE WE ON THE RIGHT PATH?

The honest answer is **yes on every part and not yet on the whole**, and the
reason is specific rather than a matter of taste.

### 0.1 What the corpus is genuinely good at

Seventeen design documents, a 132-section bible, and two briefs. The discipline
in them is real and worth naming, because the diagnosis below is not "we have
been careless":

- every proposal is tested against three stated rules (`README` §2);
- several features are specified as **smaller** than they sound because canon
  forbids the large version, and the documents say so;
- LOCKED / OPEN / LEANING is a real governance distinction that is honoured;
- the code is measured rather than asserted — 387 assertions, and the ones
  that matter were written after a failure rather than before.

That is not design on a whim. Every document asks *"is this system correct?"*
and answers it.

### 0.2 The one question nothing asks

**No document asks how long the game is.**

That is not a rhetorical point. It was searched for: no target length, no
playthrough duration, no chapter count, no content budget appears in
`bible.md`, in `design/01`–`17`, in `sweep-brief.md` or in `loop-brief.md`.
The nearest thing is §12.11's note that the signature animation is *"wonderful
six or eight times a playthrough"*, which implies a length nobody has stated.

Everything downstream of that silence is guesswork, and this is the actual
source of the feeling that the design has been improvised:

- **`sittingsPerSession` is 24** and nothing says why, or how many sessions a
  game has.
- **Chapters advance on a decision** (§1.7, LOCKED) so the narrative's pace is
  entirely in content's hands, with no document saying what that pace should be.
- **"Chapter one needs ~25 events"** (§16.6) implies a total, but the total is
  never written down, so nobody can tell whether 21 events is a fifth of the
  game or half of it.

### 0.3 The structural finding

**`checkLoss()` has four conditions. There is no `checkWin()`.**

The game cannot be finished well. `design/05` §5.1 specifies four settlements
as the ending and they exist **only in a subordinate document** — they are not
in the bible, not in the engine, and not in content. The most important design
decision in the project, which is what the game is *for*, is the one with the
least authority behind it.

That is a governance problem, not a coding one, and §8 says what to do about it.

### 0.4 So: the path is right, the map has no scale

The systems are correct and mostly built. What is missing is **the arithmetic
that turns systems into a game of a particular size** — and without it, every
question about pacing is unanswerable, which is why they keep being answered by
instinct.

The rest of this document supplies the scale.

---

## 1. THE LENGTH TARGET

Proposed, and this is the number everything else derives from:

> **A first playthrough is two to two and a half hours.** Three sessions of the
> House, one general election, one settlement. Replay value comes from the
> other three settlements and `design/14` §6's second leader, not from length.

Why not longer: the loss conditions are sharp and a player who loses at ninety
minutes must not have lost six hours. Why not shorter: four settlements need
room to become distinguishable, and §2.6's one-cluster-per-event rule means the
vocabulary alone takes a chapter to teach.

## 2. THE ARITHMETIC

The model, with every figure stated so it can be argued with:

| unit | time | count | total |
|---|---|---|---|
| a decision event — read ~200 words, weigh, expand a choice, commit | 90s | 45 | 67 min |
| a quiet sitting — an order paper with nothing to answer | 20s | 27 | 9 min |
| a division, with its reading-out | 120s | 12 | 24 min |
| a governing act — a whip plan, an instrument, an appointment, an initiative | 60s | 30 | 30 min |
| | | | **≈ 2h 10m** |

Which fixes the shape: **72 sittings, three sessions of 24, about 45 decision
events, about 12 divisions.**

And it fixes the content budget, which has never been stated:

| chapter | what it is | events |
|---|---|---|
| 1 | teaching. Fixed order, one cluster at a time | 12–15 |
| 2 | governing. Systemic; crises from thresholds and the seed | 15–18 |
| 3 | the election. A chapter transition (`05` §5) | 6–8 |
| 4 | the settlement | 8–10 |
| | **total** | **45–50** |
| | plus quiet-sitting order-paper lines | ~40 one-liners |

**Twenty-one events exist.** That is not "barely begun" — it is *most of the
way through chapter one and into chapter two*, and the honest headline is
**roughly 45% of the decision content**, with the cheap half (the quiet-sitting
lines) not started.

---

## 3. THE PACING INSTRUMENT

The game currently has no way to regulate how fast a player moves through
content: `nextEvent()` fires whenever the pool has something eligible, and the
player presses *rise until the next sitting* until it does.

> **Order-paper time is the clock, and everything must compete for it.**

§7.7 already says this — *"the currency that cannot be topped up"* — and it is
currently false, measured: **zero sittings in sixty ever ran out of slots.**
The reason is one line of engine:

```js
function grantSlot(st, C, billId)   // a BILL. nothing else can spend time.
```

Seven bills, most of them in stages where a slot does nothing, against six
slots a session. Nothing competes, so nothing is scarce, so the clock does not
tick.

**Three changes make it tick, and none of them is a new number:**

1. **A division costs a slot.** It is House time and it is currently free.
2. **An initiative costs a slot** (§4).
3. **Nothing else changes.** Six slots a session, against a programme that
   wants two stage-advances and a division per bill, means the player can carry
   **one bill properly per session, or fumble two.** That is the game, and it is
   §7.7 finally being true.

This is also the answer to pacing: a session has a fixed budget, so the *player*
decides what the session was about, and the length of a playthrough stops being
a function of how fast they click.

---

## 4. INITIATIVE — one mechanism, four problems

The player cannot start anything. Everything arrives. A prime minister with no
agenda-setting power is a spectator with buttons.

The temptation is six powers — commission a report, summon a person, announce a
position, reshuffle, legislate, tour a station. Resist it. **One mechanism does
all of them**, because they differ only in prose:

> **AN INITIATIVE: the player spends order-paper time to put something in
> motion, and the consequence arrives later as an event.**

```js
/* content/initiatives.js */
{ id: "ask_the_guild",
  title: "Ask the Guild Bench chair to a private meeting",
  cost: 1,                                    /* order-paper slots */
  when: { flagsAbsent: ["guild_met"] },
  effects: [ { flag: { guild_asked: true } },
             { queue: { event: "guild_answers", after: 3 } } ] }
```

### 4.1 Why this is the right shape

**It needs no new vocabulary.** `flag`, `queue` (which already takes
`{after: N}`), `move` and `undertake` all exist. A design that needs no new
verbs is a design that fits the engine rather than fighting it — and §15.5's
twenty-verb line stays untouched.

**It solves four problems at once**, which is the real argument for it:

| problem | how |
|---|---|
| the player cannot initiate | this is the initiating |
| order-paper time is never scarce | initiatives compete with bills for slots |
| 36 of 60 sittings are empty | a quiet sitting is when you *start* something |
| pre-emption (`design/17` §1) | the flag she sets guards the event that would have offered it — the story stops offering what she already did, because she did it |

**The consequence is an event**, three sittings later, which is §7.9's terminus
satisfied by construction rather than by discipline.

### 4.2 What the engine needs

Small, and all of it additive:

```
Engine.initiatives(st, C)   -> the list whose `when` passes and whose cost fits
Engine.take(st, C, id)      -> spend the slots, apply the effects, log it
```

Plus `grantSlot`'s check generalised into a `spendSlots(st, n)` that the
division and the initiative both use, a `js/schema.js` entry so the editor can
author them, and `js/refs.js` following initiative ids for safe rename.

### 4.3 What an initiative must never be

- **Not free.** A free initiative is a button, and the player will press all of
  them on the first sitting.
- **Not instant.** The delay is what makes it a decision rather than a menu:
  she commits the time now and learns the answer later, possibly after the
  situation has changed.
- **Not guaranteed.** The queued event decides what happened. An initiative
  that always works is a vending machine.
- **Not a bill.** Legislation goes through the order paper as it does now.

---

## 5. WHAT THE ENGINE STILL NEEDS, TOTAL

After `design/17`'s list and this one, in dependency order:

| # | change | size | why |
|---|---|---|---|
| 1 | `spendSlots()`, and a division costs one | small | the clock starts ticking |
| 2 | initiatives: two functions, a schema entry, a content file | small | §4 |
| 3 | **`checkSettlement()`** — content declares four settlements as `when` blocks; the engine reports which one the state has reached | small | the game has no ending |
| 4 | the quiet-sitting order paper — a reader for a pool of one-liners | small | 36 of 60 |
| 5 | `move` logs an unresolved target; lint resolves them | tiny | typos vanish silently |
| 6 | foreign affairs as a price and a concession (`17` §4.3) | small | the fiction already assumes it |

**Every one is small, and `checkSettlement` is the important one.** It needs no
new conditions: a settlement is a `when` block, and `matches()` already
evaluates those. Four blocks in content and the game can be finished.

---

## 6. Acceptance

- `content/setup.js` names a session count, and `bible.md` names a target
  playthrough length.
- A division cannot be called with no order-paper time left, asserted.
- A playthrough that spends its slots on initiatives cannot also pass two
  bills in the same session, asserted.
- `Engine.checkSettlement()` returns one of four settlements for four
  constructed states, and `null` for the opening state.
- Fewer than ten of sixty sittings have nothing printed on the order paper.
- An initiative's consequence arrives as an event, not as a scalar move.
- `npm run lint` fails on an initiative whose queued event does not exist.

---

## 7. WHAT SHOULD GO TO THE BIBLE

This is the governance half, and it matters more than any single feature.
Three things are load-bearing and live in documents the bible outranks:

1. **The four settlements** (`design/05` §5.1). This is what the game is for.
   It belongs in Part III as a LOCKED section, with the state configuration
   each one names.
2. **The target length and the shape** — three sessions, one election, one
   settlement, about two hours. §1.7 locks that chapters advance on a decision
   and says nothing about how many there are.
3. **That order-paper time is the pacing instrument**, not merely a scarce
   good. §7.7 nearly says it; it should say it, because the moment it is canon,
   "a division is free" becomes a bug rather than a choice.

Until those are canon, every pacing question gets re-answered from instinct,
which is exactly the thing this document was written to stop.
