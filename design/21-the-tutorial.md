# 21 — THE TUTORIAL

*How the game teaches its own systems, given that it cannot use a tutorial box.*

> **STATUS, 14 September 2026 — THIS IS A BRIEF.**
>
> Chapter one is already canon the teaching chapter (`05` §3: *"fully authored,
> fixed order… one concept cluster at a time, in an order somebody chose"*), and
> the prologue events exist. What does not exist is a statement of **what each
> beat teaches** and **where the two untaught mechanics get taught.** Three
> beats here have no home yet.

---

## 1. The problem

The narrative is taught. The prologue does that — `the_account`,
`briefing_divergence`, `halloran_signatures`, `vantage_radiator`, `gb_approach`,
one per sitting, in a fixed order.

The **systems** are not taught. They are annotated: hover tooltips and the `?`
mode explain a column or a number *if the player already knows to ask*. A player
can reach chapter two without ever

- spending order-paper time,
- committing a member to a division,
- or reading the order of the day,

and then conclude the bill died for no reason. That is the failure this
document exists to prevent.

## 2. The principle

> **Teach by making the player need the mechanic, in the world's voice, one
> sitting at a time.**

Three consequences, and each is a rule:

1. **Not a tutorial box.** `design/14` forbids it — no modal, no checklist, no
   "welcome, Prime Minister". The player is a person in a room with a problem,
   not a user on a course.
2. **The teacher is a person who wants something.** The Chief Whip wants the
   bill carried. The Law Officer wants the order asked for. The thing they want
   is delivered *by* the mechanic, so learning it is the way to give it.
3. **One mechanic per sitting.** Chapter one is authored and fixed-order for
   exactly this reason. Two mechanics in one beat is two things learned badly.

## 3. The curriculum

What the player must be able to **do** by the end of chapter one, and the beat
that teaches each.

| # | the player can… | taught by | exists? |
|---|---|---|---|
| 1 | read a decision and see a number move for it | `the_account` (prologue 1) | **yes** |
| 2 | say what a bill is, what stage it is at, and why the dual test applies | `briefing_divergence` (prologue 2) | **yes** |
| 3 | **read the order of the day, and act on what it asks** | the first sitting | **to write** |
| 4 | **grant order-paper time, and watch a bill advance a stage** | the Chief Whip, sitting 2 | **to write** |
| 5 | **commit members to a division, and pay for it** | the Chief Whip, before the division | **to write** |
| 6 | call a division and read the two tests | the divergence division | partly |
| 7 | say what loyalty is and why the caucus is an antagonist | `halloran_signatures` (prologue 3) | **yes** |
| 8 | make a statutory instrument, and see it is not a bill | `gb_approach` → the licensing order | partly |
| 9 | make a promise, and know it can be broken | `gb_approach` (the carve-out undertaking) | **yes** |
| 10 | see a station in trouble and a price behind it | `vantage_radiator` (prologue 4) | **yes** |
| 11 | know what the government is FOR | `design/14` §4 — the chapter-one frame | partly |

Rows 3, 4 and 5 are the gaps, and they are the two most important mechanics in
the game. A player who cannot whip a division has not played *Ways & Means*.

## 4. The first session, sitting by sitting

The teaching chapter is the **first session** (six sittings, `sittingsPerSession`).
This is the shape it should have; §3 says what each beat teaches.

| sitting | the beat | teaches |
|---|---|---|
| 1 | `the_account` — the interview. The order of the day is open beside it with one thing asked. | a decision (1), and that the **day** is a thing you read (3) |
| 2 | `briefing_divergence`. The Chief Whip closes with the arithmetic: the bill needs time, the session has six slots, the House rises in N. Grant the first slot **in the scene.** | the bill (2) and order-paper time (4) |
| 3 | `halloran_signatures` — the caucus, a promise, a threat. | loyalty and undertakings (7, 9) |
| 4 | `vantage_radiator` — a station, a price, a choice. If the player has an order to make, make it here. | stations and instruments (8, 10) |
| 5 | `gb_approach` — the functional bench, and the deal that becomes the licensing order. | the functional tier, the instrument, the promise (8, 9) |
| 6 | the division. The Chief Whip brings the whipping list. **Whip once, then divide.** | the whip (5) and the division (6) |

The division lands at the end of the teaching session by design: the player has
spent five sittings acquiring the tools and one using them, and the result —
carried, or dead on the functional bench — is the first thing the game ever
tells them about its own argument.

**The licence to teach in the scene.** Rows 4 and 5 need the Chief Whip to say a
thing that is, mechanically, a tutorial line. `design/14`'s rule still holds:
the prose never puts words in the Prime Minister's mouth. The Chief Whip can say
whatever he likes. That is the whole trick — *"you have six sittings of House
time and the bill needs two of them"* is not a tutorial box, it is a whip
reporting.

## 5. The safety net

Chapter one must be **loss-proof**, or the tutorial is a trap.

- No loss condition can fire in chapter one. The coalition is at 141 of 141 and
  the session is short; the numbers cannot fall far enough. **Assert this**, so a
  future content edit cannot quietly make the teaching chapter lethal.
- Nothing the player does in chapter one is permanent. A bill allowed to fall, a
  slot wasted, a partner annoyed — all recoverable by prorogation.
- Every teaching beat has a **second chance**. If the player does not grant the
  slot in sitting 2, the Chief Whip asks again in sitting 3. A missed teach is
  not a missed game.
- The division can be lost without ending anything. The first division *should*
  be loseable, because the dual test is the lesson and a lesson with no stakes
  is not learned.

## 6. Surfacing

The systems are taught in the scene; they must also be **re-findable** when
forgotten. The rule: *the game never explains a thing the player has not met.*

| surface | does |
|---|---|
| the order of the day | what is asked, now, each a control to where it is answered |
| the tab badge | the same, on the tab, with a hover card naming the same things |
| tooltips | what a column or number *does*, on the convention the player has met |
| `?` mode | the same, for a keyboard, on demand |
| the Concordance | the world's own answer, when the player pulls it |

The order matters: **the scene teaches, the surface reminds.** A surface that
fires before the scene has run is an unexplained red box, which is the thing
this whole document is against.

## 7. Deliberately not done

- **A tutorial box, a modal, a welcome.** `design/14` §3.
- **A mission checklist.** The order of the day is not a quest log; it is what
  the House is asking today, and it empties when answered.
- **Gating the interface.** Nothing is hidden until taught. A player who reads
  the docket before sitting 3 has lost nothing.
- **A tooltip wall on first run.** Explaining six things the player has not met
  is six things not learned.
- **Teaching by failing quietly.** Every refusal says why (`design/18` §the
  division button); a mechanic the player cannot see refuse is a bug report.

## 8. Acceptance

- No loss condition can fire before the end of chapter one, asserted.
- A player who never grants a slot still passes chapter one, and the Chief Whip
  has asked more than once — asserted on a scripted playthrough.
- The first division cannot be called without the whip panel having been
  offered, asserted.
- Every row in §3 that says "yes" has an event id; every row that says "to
  write" has one by the time chapter one is called done.
- By the end of the first session the player has spent at least one slot, made
  at least one order or promise, and seen one division — asserted on the trace.
