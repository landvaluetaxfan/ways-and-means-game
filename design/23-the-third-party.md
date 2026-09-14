# 23 — THE THIRD PARTY

*A plan for the lobbying currency, for actors outside the chamber, and for
public opinion — and an argument that these are one system and not three.*

---

## 1. The diagnosis

Everything currently on screen is either **your resource** or **your decision**.
The coalition ledger is what you are owed. The order paper is what you will do.
The indicators are how you are doing. The wire reports the consequences of
things you chose. Even the opposition exists only as a column of numbers that
resists you.

> **The world only exists when it is addressed to you.**

That is the signature of a menu, and it is why the setting feels larger in
`bible.md` than it does in play. The bible is full of people pursuing their own
interests — consortiums, congregations, the licensing board, a union whose
strike weapon amounts to a credible threat to kill everyone — and not one of
them can do anything unless the player pokes it first.

The missing layer is not detail. It is **agency belonging to somebody else.**

---

## 2. Three currencies, three tenses

Part XVI says lobbying "needs its own currency", and the reason the obvious
candidates feel wrong is that the game already has two and they are both taken:

| currency | tense | what it is | who it works on |
|---|---|---|---|
| **capital** | past | a signed ledger of favours done and owed | governing partners only |
| **order-paper time** | present | the scarce good, six slots a session | the House as a body |
| **???** | **future** | — | **everyone who owes you nothing** |

Capital is *what you did*. Order-paper time is *what you have*. The missing one
is **what you promised**, and the game already has the machinery: `undertake`
carries an id, a text, a deadline (`by`), a responsible minister (`post`), an
`onBreach` event, and — the field that matters — **`owed_to`**.

> **Lobbying is not a resource you spend. It is an obligation you take on.**

You do not buy the Guild Bench. You give the licensing board an undertaking with
a date on it, and they deliver their bench for this division. The cost arrives
later, at the deadline, and it arrives whether the bill carried or not.

This is mechanically distinct from both existing currencies, it is dramatically
the right shape for lobbying, and it makes the undertaking system load-bearing
instead of decorative. It also closes a correctness hole: **substrate neutrality
requires the dual majority, the dual majority requires the functional forty, and
the functional forty cannot currently be moved at all** — so one of the four
settlements is presently unreachable.

---

## 3. The spine: an actor store

Everything below needs the same thing first.

```js
st.actors = {
  licensing_board: { standing: 50, patience: 3, lastAct: 0 },
  maintenance_unions: { standing: 61, patience: 1, lastAct: 0 },
  ring_network: { standing: 44, patience: 5, lastAct: 0 }
};
```

Three fields and no more, because §7.6 is LOCKED and this must stay shallow:

- **standing** — how you are regarded. Slow, like party loyalty.
- **patience** — how long they will wait before acting on their own.
- **lastAct** — when they last did something, so they do not act every sitting.

Content declares the rest, because content declares everything: who they are,
what they want, what they can do to you, and what they will accept.

**An actor is defined by its lever, not its opinion.** A body that can only
approve or disapprove is a number. A body that can *withhold a licence*,
*call a strike*, *refuse a berth*, *publish*, or *sue* is a player. The
bible has already specified the levers:

| actor | lever (all from canon) |
|---|---|
| the engineering authority | suspends the tier-four register without notice and without telling a minister (§6.6) |
| the licensing board | decides who holds a functional franchise (§4.6.4) |
| the maintenance unions | a strike weapon amounting to a credible threat to kill everyone (§6.10) |
| the Attestation Registry | can flag a cluster, *and that is the whole of its power* (§10.7) |
| the metanationals | elevator consortiums, substrate providers, consumables cartels — near party-tier power (§10.10) |
| the courts | long-lived emulated judges who personally remember the founding (§10.8) |
| the congregations | will not admit emulations; the CDA is their expression (§10.9) |
| the fork-rentiers | 210,000 people with a direct interest in the threshold and no seat (Part XVI) |

**And they act on their own.** The deferred queue built this session is exactly
what that needs: an actor posts `{after, label, effects}` and the consequence
arrives on its day, on the calendar if it is foreseeable and unannounced if it
is not. No prose required for the mechanism to exist.

---

## 4. Public opinion, and the pollsters

`public_standing` is moved by forty effects and gated by one. It is the most
written-to number in the game and it changes the world exactly once.

### 4.1 The insight: a poll is a reported division

`Engine.reported()` already implements *a number, from a source, wrong by
something, with its provenance attached*. That is not a division mechanic. That
is **an imperfect-information mechanic that happens to be pointed at divisions**.

> A poll is the same function pointed at opinion.

Same seeded error so a redraw cannot re-roll it. Same provenance line. Same
rule that the player never sees the true figure. The work is generalising
`reported()`, not writing a polling system.

### 4.2 Opinion is not a second scalar

§7.6 caps the model at six or seven orthogonal numbers and it is right to.
`public_standing` stays **the** number. What a poll reports is that number
**refracted through a subject and a house**:

- **a subject** — the threshold, volume, thermal, the government generally.
  Derived from `st.law` and station conditions, never stored.
- **a house** — pollsters are actors, and an actor has a lean. A poll from a
  Freehold-aligned house reads three points differently from one taken by the
  union's own research bureau, and neither is lying.
- **a date** — a poll is as of when it was taken. This is the same *dated, not
  hidden* discipline `design/11` specifies for foreign facts, arrived at
  independently, which is a good sign it is the right one.

### 4.3 What it buys mechanically

Three things, all of which the game currently lacks:

1. **A reason to look at public_standing.** A number you are shown directly is
   a score. A number you must *commission an estimate of* is information.
2. **Marginality.** Opinion per station, derived, tells you which of your own
   members are in danger — and a member with a two-hundred-vote majority votes
   differently from one with ten thousand. This is the real discipline in a
   caucus and the whip currently has no access to it.
3. **Something to be wrong about.** A poll that turns out to have been wrong is
   the single most reliable drama in electoral politics.

---

## 5. What else the same store unblocks

Ordered by cost, cheapest first. Everything here rides the actor store, the
deferred queue, or both.

**Already built and unused — free or nearly:**

- **By-elections.** `vacate_seat` and `election` are effect verbs that no
  content has ever used. A member dies or resigns, a seat is contested
  mid-term, and the result is a referendum on you that you did not call.
  Biological members die and emulated ones do not (§6.10) — the mechanic
  carries the setting's sharpest argument for free.
- **The Speaker.** Solveig Ilyin exists, sits in the chair, and does nothing.
  A Speaker who can rule an instrument out of order is one condition.
- **Ministerial resignation.** `cabinet` can vacate a post and `postVacant` is
  an unused condition. A minister who resigns over a decision is the cheapest
  consequence in the game.

**Small, and high return:**

- **The press with a line.** *The Spindle* has a masthead and a political
  editor. One masthead is a narrator; three with different owners reading the
  same event differently is a world. The wire is currently one voice and that
  voice is neutral, which no newspaper has ever been.
- **Deputations.** A station sends people to see you. Uses the actor store and
  gives the thirty-two stations nobody visits a way into the room.
- **Strikes.** The union lever, above. A strike is a deferred fact with a
  price and a date — the queue does it.

**Structural, and worth it:**

- **Committee.** A bill in committee is decided by twelve people, not two
  hundred and eighty, and the arithmetic in a small room is a different game.
  This is where lobbying would actually bite hardest.
- **Question time.** A recurring obligation where the *opposition* chooses the
  subject. The player answering a question they did not want asked is the
  format the whole genre is built on.

**Cultural, and what makes it a place rather than a chamber:**

- **The calendar should carry things that are not yours.** Station festivals
  timed to the spin-up anniversary (§10.1), a court sitting, the anniversary of
  the failed revolution — which Part XVI notes still needs a date, a cause and
  a roster of who stood where.
- **Obituaries.** The gerontocracy of §10.4 is an *emulated* gerontocracy.
  Biological political generations turn over and emulated ones never do. A
  death notice in the wire is one line and states the whole thesis.

---

## 6. The order of work

Each step is small because the primitives exist. The dependency chain is real:
do them out of order and each one grows a private version of the store.

| # | | why here | size |
|---|---|---|---|
| 1 | **the actor store** | everything below needs it; three fields | engine, small |
| 2 | **lobbying as an undertaking to an actor** | unblocks a settlement that is currently unreachable | engine, small |
| 3 | **`reported()` generalised; the first pollster** | fixes the 40:1 on the most-written number in the game | engine, small |
| 4 | **actors act on their own, through the queue** | the world stops waiting to be addressed | content, mostly |
| 5 | **by-elections** | two unused verbs, and opinion starts to bite | content + a reader |
| 6 | **the press with a line** | the largest immersion gain per line written | content |
| 7 | **committee** | where lobbying pays off; a second arithmetic | engine, medium |

---

## 7. What this does not need

Worth stating, because the temptation in each case is real and §7.6 is LOCKED.

- **Not an opinion model.** No demographic cross-tabs, no swing calculation. One
  number, refracted by subject and house at the point it is reported.
- **Not a lobbying economy.** No influence points to farm. An obligation with a
  deadline and a breach penalty, which the engine already has.
- **Not new verbs.** The twenty-verb line holds at twenty. `undertake` gains an
  actor as an `owed_to`; `queue` already carries facts; `move` already reaches
  a namespaced key and can reach `actor.licensing_board` the way it reaches
  `loyalty.cu`.
- **Not individual MPs.** Established earlier: the current is the political
  unit. Marginality per *seat* is a property of the roll, which exists, and not
  a personality per member, which would be a second window.

---

## 8. The one-line version

Build the store that lets somebody other than the Prime Minister want something,
and lobbying, polling, the press, the unions, the courts and foreign affairs all
turn out to be the same feature wearing different coats.
