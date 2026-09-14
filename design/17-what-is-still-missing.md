# 17 — WHAT IS STILL MISSING

*Measured against the build on 14 September 2026, not against the plan.
Everything numbered here was counted, not estimated.*

`design/01`–`16` specify systems. This document is about three things they do
not cover: what happens when the player gets ahead of the story, why the loop
still has holes with every planned system built, and what foreign affairs
should actually be.

---

## 1. PRE-EMPTION — the player getting ahead of the story

**The question: what happens if the player makes an order that a later event
was going to introduce?**

### 1.1 The vocabulary exists and content does not use it

The engine has six conditions built precisely so an event can check whether its
own premise is still true:

| condition | uses in content |
|---|---|
| `flagsAbsent` | 5 |
| `billStage` | 1 |
| **`siNotMade`** | **0** |
| **`postVacant`** | **0** |
| **`owes`** | **0** |
| **`breached`** | **0** |

Four conditions written so content could see what the player has already done,
and **none of them is called anywhere.** Of the six events whose choices act on
something the player can also do from another screen, **three carry no guard at
all**: `halloran_finds_nine`, `vantage_cascade`, `ch2_carveout_price`.

`owes` and `breached` being unused is worse than it looks: it means the
undertakings system — the spine of `design/02`, the thing that makes a promise
cost something — **has no terminus.** Nothing in the game notices that the
player owes anything or has broken anything. That is §7.9's design rule broken
by a system built specifically to satisfy it.

### 1.2 But guarding is only one of three answers, and it is the worst one

`eligible()` re-checks `when` at selection time, so a guarded event is correctly
skipped. The problem is what "correctly" means in a narrative game:

> **A player who acts efficiently silently loses content.** They make the order
> early, the event that would have introduced it never fires, and they never
> learn it existed. They are punished for competence with less game.

So skipping cannot be the only posture. Three are needed, and the engine
already supports all three — this is a content discipline, not an engine gap:

**GUARD — the event is about a decision that no longer exists.**
`when: {siNotMade: ["si_2287_44"]}`. Correct where the whole event is "shall we
make this order". Use sparingly: every guard is content the player may never see.

**ADAPT — the event still has a question, but a different one.** Two events,
same subject, mutually exclusive `when`. One asks whether to make the order; the
other opens with it already in force and asks what to do about the reaction.
Twice the prose for one beat, and the right answer for anything important.

**REPROACH — the event fires anyway and knows.** The cheapest and the most
interesting: the minister arrives to propose a thing the Prime Minister did
last week without telling him. `when: {siInForce: [...]}` and a body that reads
the pre-emption as a *fact about her government* rather than as a bug.

> **The rule for content: an event whose premise the player can falsify must
> declare which of the three it is.** Nothing else is acceptable, and a lint
> check should eventually enforce it.

### 1.3 The engine change this actually needs

One, and it is small. A `move` to a relationship or loyalty target that does
not exist **fails silently** — `{move: {"rel.nobody": 5}}` does nothing and
says nothing, where `{move: {"nonsense.x": 5}}` at least logs `IGNORED`. The
same hole swallows a typo'd party or current id. Every namespace should log the
miss, and `tools/lint.js` should resolve every `rel.` and `loyalty.` target in
content against the roster.

---

## 2. THE CALENDAR — built, and not felt

**It is implemented.** `sessionEnds` is set at `newGame`, migrated on load, and
`advance()` prorogues when the sitting passes it. Measured over sixty sittings:
**two prorogations**, and three bills fell at the first one. That part works and
does not need touching.

**What does not work is the pressure it was built to create.** From the same run:

```
sittings with zero order-paper slots left : 0
events that fired                        : 21 of 60
bills with a division day set by content : 0 of 7
```

Three findings, and the middle one is the worst.

### 2.1 Order-paper time is not scarce, and §7.7 says it is the whole point

§7.7 calls order-paper time *"the currency that cannot be topped up"*. In sixty
sittings the player never once ran out. Six slots per session against a
legislative programme of seven bills, most of which never reach a stage where a
slot would help. The scarcity mechanic is inert.

The fix is not more slots or fewer. It is that **nothing competes for them.**
A slot is only a choice when two things want it in the same session.

### 2.2 Thirty-nine of sixty sittings had nothing in them

This is the biggest hole in the loop and it is not in any design document.

A player who reaches sitting 12 presses *rise until the next sitting* and keeps
pressing. `design/06` covers variance and `design/03` covers the consequence
chain, but neither answers the plain question: **what is a quiet sitting?**

A real parliament always has business. The answer is not more events — it is
that a quiet sitting should still print an order paper: questions taken,
a committee reporting, an instrument laid, a member's statement. Most of it
unactionable, some of it foreshadowing. **This is the difference between a game
with gaps and a game with a rhythm**, and it is cheap: a pool of one-line
entries with `when` conditions, drawn from the same seed, printed on the sitting
screen with no decision attached.

### 2.3 A division has a day and nothing sets it

`dividesOn` exists, `canDivide()` enforces it, and **no bill in content uses
it.** So the player still chooses when every division happens, which was the
original complaint the calendar was built to answer.

---

## 3. THE LOOP — what is missing with every planned system built

### 3.1 The player cannot initiate anything

This is the deepest one and no design document covers it.

Everything that happens, happens *to* her. She can grant a slot, make an
instrument the content authored, fill a post the content vacated, whip a bill
the content wrote, and divide when she likes. She can never say **"I want to do
X."** A prime minister with no agenda-setting power is a spectator with buttons.

The cheapest real version is not a bill editor. It is **the standing agenda**:
three or four things she can put her weight behind at any sitting — a policy
area, a station, a partner — which do not resolve immediately but change which
events are eligible and what they cost. It is `when` conditions on a flag she
sets herself. Engine cost: one effect verb and one condition, both of which
`flag`/`flags` already are.

### 3.2 The consequence chain is still open four ways

```
law.divergence_threshold_hours   moved by 1  gated by 0   NUMBER NOBODY SEES
price.substrate                  moved by 0  gated by 1   EVENT NEVER FIRES
scalar.thermal_margin            moved by 0  gated by 1   EVENT NEVER FIRES
station                          moved by 3  gated by 0   NUMBER NOBODY SEES
```

The two `EVENT NEVER FIRES` rows are new and they are the more embarrassing
kind: content has written an event gated on `price.substrate` and on
`thermal_margin`, and **nothing in the game moves either number.** An event that
cannot fire is worse than a number nobody reads, because somebody wrote it.

### 3.3 One station of thirty-five appears in any event

The setting is thirty-five inhabited places and the game is about one of them.
`design/03` asks for station events; this is the measurement of how far there is
to go.

### 3.4 Nothing accumulates across a session boundary

Prorogation refills the slots and drops the unpassed bills, and that is all it
does. The player carries no record. There is no "in your first session you did
X" that a later event can read, which is exactly what `owes`/`breached` were for
and exactly what nothing uses.

---

## 4. FOREIGN AFFAIRS

### 4.1 There is no state, and there is already a surface

`st.rel` does not exist; relationships live on characters. Nothing outside the
Commonwealth is modelled at all.

But the *fiction* is already load-bearing in content that shipped:

- `anchor_kepler` — a bill in the upper house about an anchor;
- `tether_traffic` and `anchor_concession` — material interests on stations;
- *"Tether 2, whose anchor stands on foreign soil."*

So the setting has already committed to the outside world mattering, and the
engine cannot see any of it.

### 4.2 `design/11` is right about the axis and wrong about the timing

Light-lag as the organising principle is the correct idea and should not be
diluted: *a map ordered by delay is a map of how alien each relationship is*,
and **a foreign fact is never current** is the best single rule in that
document.

But `design/11` gates itself on chapter one reaching ~25 events. There are 13,
and at the current rate that gate will not open. Meanwhile the fiction is
already leaning on foreign facts the engine cannot represent.

### 4.3 The version to build now: a price and a debt, not a map

Foreign affairs does not need actors, a chart, or light-lag simulation to start
earning its place. It needs the Commonwealth to be **dependent on something it
does not control**:

1. **One foreign price.** `price.transit` already exists and `anchor_kepler`
   already moves it. Let a foreign decision — not the player's — move it too,
   arriving as a wire item with a stated delay: *"as of eleven days ago."* That
   is light-lag, delivered for free, with no new state.

2. **One concession that can be withdrawn.** The anchor on foreign soil is the
   obvious one. A flag, a price, and an event. If it goes, transit prices and
   the stations that depend on tether traffic feel it — which closes one of the
   `station` chain rows in §3.2 at the same time.

3. **No new verbs.** `move`, `flag`, `wire` and `queue` cover all of it.

The full `design/11` — the delay map, the metanationals, Kessler severance —
stays where it is and stays gated. What changes is that the Commonwealth stops
behaving like a closed system before then.

---

## 5. In priority order

| # | what | why | whose |
|---|---|---|---|
| 1 | **The quiet sitting** — a pool of unactionable order-paper lines | 39 of 60 sittings are empty; this is the loop's biggest hole | content + a small reader |
| 2 | **Declare a posture on every pre-emptable event** — guard, adapt or reproach | 3 unguarded today, and 4 conditions unused | content |
| 3 | **Close the two `EVENT NEVER FIRES` rows** | somebody wrote an event that cannot happen | content |
| 4 | **Make `owes`/`breached` read by something** | the undertakings spine has no terminus | content |
| 5 | **Set `dividesOn` on the bills** | the calendar's teeth, unused | content |
| 6 | **The standing agenda** — one verb, one condition | the player cannot initiate anything | Claude |
| 7 | **Foreign affairs as a price and a concession** | the fiction already assumes it | Claude + content |
| 8 | **`move` logs an unresolved target; lint resolves them** | typos vanish silently | Claude |
| 9 | **Something competes for a slot** | the one scarcity mechanic is inert | content |

Six of nine are content, which is the same answer `sweep-brief.md` has been
giving since Part D: the engine is not the constraint.

## 6. Acceptance

- A playthrough of sixty sittings has fewer than ten sittings with nothing
  printed on the order paper.
- `siNotMade`, `postVacant`, `owes` and `breached` are each used at least once.
- `npm run lint` reports no `EVENT NEVER FIRES`.
- At least one bill in content carries `dividesOn`.
- A `move` naming a target that does not exist appears in the log, and
  `npm run lint` fails on one in content.
- At least one price the player does not control moves from outside the
  Commonwealth, and the wire says how old the news is.
