# 59 — The triage: every system against the page

**29 September 2026. A proposal; nothing is removed.** Each system built so
far is held up against design/58 (the game on one page), and given a
place:
- **core**: carrying the House;
- **theatre**: major or minor in a given campaign;
- **world**: only the prose and the Concordance use it;
- **rework**: it is needed, but in another shape;
- **cut**.

The counts are from Flash I's content on this commit. "Moved" is the
number of effects that change a meter; "read" is the number of conditions
that test it.

## The finding that changes most: how a game ends

design/58 says an ending is better for **what you achieved** and **how you
are remembered**. The author chose not to count whether you lasted.

The game today grades the ending by **the seat count**. The six epilogues
(landslide, working, narrow, hung, defeat, rout) are keyed on the
government's side of the House after the count. The settlement of the
question (f1_triumph, f1_pyrrhic, f1_joint, f1_capitulation, f1_open and
the rest) is the nearest thing to "what you achieved", but it does not
decide the last page. Nothing adds up "how you are remembered".

**Rework:**
- The last page reads the aim first. For Flash I, that is what became of
  the Works: the settlement families already exist.
- Then it reads the record: promises kept and broken, legitimacy, and the
  chronicle.
- The count becomes a means. A fall or a rout still ends the story badly,
  and the seats set Flash II's footing.
- The curtain call is where both measures are read out.

## Core: carrying the House

| system | verdict | why |
|---|---|---|
| order-paper time, sitting periods | **core** | the scarce thing; it is what makes advice a choice (design/58) |
| bills, the order paper, divisions, the two majorities, the objection | **core** | the House itself. The functional tier is the House's distinctive rule, and Flash I's bill turns on it |
| the whip | **core** | a vote paid for with the party's loyalty |
| partners, undertakings | **core** | a vote paid for with a promise |
| the ledger (the whips' running account) | **rework** | nothing in content reads it. It becomes the visible price of a partner's votes, or it goes |
| confidence, no-confidence | **core** | the power to stay |
| the party's currents, the leadership paper | **core, as the whip's price** | loyalty is derived from the currents, and the paper reads loyalty (6 conditions). No content reads a single current (0), so the per-current detail is world unless a campaign makes the party a major theatre |

## Theatres

| system | Flash I | verdict | why |
|---|---|---|---|
| the account: the reserve, bills, arrears, taxes, lenders, the Standby Facility, the Underwriters | **major** | keep | the Works is paid for, and the canon is the debt trap. The reserve is moved 107 times and read 10 |
| the macro model: inflation, the cash rate, the dollar, growth, participation | minor | **world by default** | it colours standing and the prose. It becomes matters only in a campaign that makes the economy major. The Bank's orders (si_2080_71–74), defend_dollar and lean_on_governor are minor levers |
| the heat: the thermal margin, the ladder's orders | **major** | keep | the Works' heat counts against the margin, and the cascade is the loss. The margin is moved 48 times and read 7 |
| consumables | major, with the heat | keep | the Works' air is the aim's clock |
| stations: closure, dependency, grievance, tiers, the shed order, suspension | minor | **mostly world** | 35 stations give the prose its authority. The tier and closure conditions (26 and 14) belong to the heat and to the story's pages |
| foreign affairs: actors, dispatches, lag | **major** | keep, and connect | the Works' fate is decided abroad. Friction is moved 47 times and read 11. Actors are read by only 5 conditions, so the Works' outcome must read them |
| the UN forum and the Security Council | major, via the Works | **rework** | no condition reads the forums directly, and the UN events are among those never met. Each vote must bear on the Works, or it is flavour |
| public positions | minor | keep | reached through decisions and a few initiatives |
| appointments, dismissals, vacancies | minor | **rework: the cabinet is the advisers** | design/58: the cabinet you keep is the advice you get. A vacant post leaves its theatre unadvised |
| inquiries and deals (initiatives) | minor | **rework** | each needs a matter or a window. The six open from sitting one with no reason (approach_guild, commission_review, state_the_position, quota_forward, charter_volume, lean_on_governor) get one, or are cut |
| the Tribunal | minor | keep, reached by decisions | tr_challenge_lodged and tr_ruling are never met; they need a way in |
| the Presidency's reserve powers | — | **world** | it matters at the commission and in rare crises, through the story |

## Measures

| meter | moved | read | place |
|---|---|---|---|
| public standing (and the four bands) | 194 | 5 | means: it feeds the count. It is moved everywhere and decides little, which is design/37 D14 again |
| legitimacy | 106 | 14 | **rework into the record**, "how you are remembered" |
| friction | 47 | 11 | Flash I's foreign theatre |
| the reserve (solvency) | 107 | 10 | the money theatre |
| the thermal margin | 48 | 7 | the heat theatre |
| consumables | 20 | 4 | the heat theatre, and the Works' clock |

## Interface and world

| system | verdict |
|---|---|
| Today and the docket | **rework into the brief** (design/57, 58), beside the obligations. The three alerts, the ladder's lead time, the reserve's runway and the Underwriters' outlook are the brief's raw material |
| the wire, the day's business, the calendar | keep, as interface |
| the Concordance | world, and it stays |
| the theatre frame | keep. The curtain call is where the two ending measures are read |
| the Record tab, the chronicle | **rework into the record**, one of the two ending measures |
| achievements | keep, as a meta layer |
| minutes, artifacts, the anthem | world |
| the Sandbox, the editor | tools |

## The order this suggests

1. **The ending.** Read the aim, then the record, with the count as a
   means. This decides what everything else is for.
2. **The brief**, with the cabinet as the advisers.
3. **Levers attached to matters.** Initiatives get a matter or a window,
   and the six unprompted ones get one or are cut.
4. **Flash I's foreign theatre connected to the Works**: the actors and
   the UN votes bear on its outcome.
5. **Then prose**: the missing choice notes, the opening (which will teach
   the brief), and the slate.

Nothing in the core is cut. The systems marked world lose screen space
and gain nothing. Each rework is small in the engine, because each one
uses readings the engine already makes. The largest is the ending, and it
is mostly content.
