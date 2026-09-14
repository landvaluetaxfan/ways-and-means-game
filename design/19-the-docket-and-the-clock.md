# 19 — THE DOCKET AND THE CLOCK

*The decisions from the wide review, the corrected cut list, and how time is
shown. Companion to `18`, which supplied the arithmetic.*

---

## 1. The diagnosis, stated once

**There are two games and they do not touch.**

**Game A** is a narrative choice game — events, choices, flags, prose. All
twenty-one events live here. **Game B** is a parliamentary management game —
whips, order-paper slots, divisions with dual majorities, instruments,
appointments, factions that vote their own axes. Nearly all the engineering
lives here.

They are joined by two thin wires: undertakings (A → B) and scalars that events
read (B → A). **A player can finish Game A without meaningfully playing Game B.**

That is more fundamental than pacing, and it is why the loop feels thin when
both halves are good.

### 1.1 The world is much larger than the game

| built | reaches the player |
|---|---|
| 141 constituencies | **1** named in any event |
| 54 characters | **5** |
| 35 stations | **2** |

Not waste — the world is why the prose has authority — but the ratio is a
warning light, and §4 says what to do about it.

## 2. The loop, and the missing verb

Stated honestly, the loop today is:

> read → choose → watch numbers move → advance

That is a visual novel with a spreadsheet attached. The intended loop is:

> **read → commit → *govern toward it* → be judged**

The missing verb is the third. An event currently **applies** effects. It should
more often **hand the player a problem the board can solve** — and the whips,
the slots and the division are how it gets solved.

> **THE RULE: every chapter puts commitments on the docket with a date, and the
> session's order-paper time is the entire capacity to meet them. The player
> will not meet all of them. Which one they drop is the game.**

Undertakings were always this idea; they have been used as narrative flags
rather than as targets with a clock and a cost.

## 3. The three currencies, and one job each

No overlap, and each genuinely insufficient every session:

| | is | answers |
|---|---|---|
| **order-paper time** | the clock (§7.7, now canon) | *what can I do?* |
| **capital with partners** | the negotiation | *who will help?* |
| **loyalty** | the constraint | *who can I afford to disappoint?* |

Today all three are counters and none is ever agonised over. A currency nobody
runs out of is a readout.

## 4. THE CUT LIST — corrected

The first draft of this list proposed cutting `consumables` because content
never touches it. **That was wrong, and the correction is instructive.**

§7.2 is LOCKED: *"Every habitat has a closure ratio… At 0.4 it dies in weeks
without federal consumables. At 0.95 it can credibly threaten to leave."*
Closure is the sovereignty number and **`consumables` is its national
counterpart.** Cutting the scalar would gut the setting's best idea, and the
engine already reads closure (`exposure = 0.75 − closure` decides which
stations feel a price bite first).

> **The reason `consumables` is dead is that it was never wired to closure.**
> Derive the national floor from the closure ratios across the roster and both
> become load-bearing at once — a station at 0.4 is a station that votes with
> whoever keeps the consumables coming, which is §7.2 finally being playable.

**A dead number is more often unwired than unwanted.** Check the wiring before
reaching for the knife.

What genuinely should go:

- **The 141-constituency roll as a *player-facing* system.** Keep it as the
  engine's source of truth — it is excellent and the arithmetic depends on it —
  but stop treating full coverage as a goal. One constituency the player knows
  well beats a hundred they scroll past.
- **Foreign affairs as a map.** Ship the price and the withdrawn concession
  (`17` §4.3). The light-lag chart is the version that never gets finished.
- **Opposition mode.** §3.6 is LEANING and it is a second game. Decide against
  it properly rather than leaving it open for years.

## 5. HOW TIME IS SHOWN — built

Pacing was *"four sittings left of session 4"*, a number in a sentence.
A number in a sentence is read; a grid is felt.

**A sitting is a day, and the House sits four days in seven.** The date of
sitting N is a pure function of N, so a deadline three months out lands on a
square that cannot drift. `Engine.deadlines()` is the single source both the
calendar and the docket read.

The month grid on the sitting page:

| | |
|---|---|
| sitting days | paper |
| days the House does not sit | the ground it sits on |
| today | the only filled square, so the eye finds it before reading |
| a day carrying something | a corner flag — red division, green promise owed, black rise |
| under it | the next three things, and how many sittings away |

Bounded two months either side: a calendar you can wander into next year on has
stopped being about this session.

**What still needs to be visible**, in the same language:

1. **Slots as pips, not a fraction.** "4 of 6" is a number; six marks with two
   struck through is a quantity.
2. **A deadline you are going to miss should say so** before you miss it — the
   flag turns when the sittings remaining are fewer than the stages remaining.
3. **The election on the calendar from the moment it is called**, months out.

## 6. The order of work

| # | | why first |
|---|---|---|
| 1 | ~~the clock runs; the calendar~~ | **done** — time was invisible and stopped |
| 2 | `spendSlots()`; a division costs one | the clock ticks, scarcity begins |
| 3 | slot pips | the currency becomes visible |
| 4 | deadlines on the docket that can be missed at a cost | Game A starts setting Game B's targets |
| 5 | initiatives (`18` §4) | the player can start something |
| 6 | `checkSettlement()` | the game can be won |
| 7 | consumables derived from closure | two dead numbers become one live one |
| 8 | the quiet-sitting order paper | 36 of 60 sittings are empty |

## 7. Acceptance

- No indicator on screen is unread by content.
- A session cannot both pass two bills and take two initiatives.
- A missed deadline costs something the player can name afterwards.
- `Engine.checkSettlement()` returns one of four for four constructed states.
- A player asked "how long until the House rises" can answer by looking, not
  counting.
