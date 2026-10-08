# Setup constants typed in text — inventory for E5

**Lane: opencode. Report only; no source, content or prose was edited. Surveyed against `main` `d6f103f`.**

E5 will resolve values in player-facing text from the setup, `{{setup.path}}`-style
(`briefs/codex-handoff.md` item 4, `briefs/act-one.md` item 12). This is the list of
places that type a number a setup constant already owns. It is an inventory, not
replacement prose: the wording stays as it is and only the figure is substituted.

**Method.** Grepped `js/tips.js` and the interface strings in `js/ui.js` for digits and
number words, then `js/shell.js`, `js/tutorial.js` and `index.html`, then the flagged
campaign prose; read only the ranges that matched. Live readings (a scalar's current
value, a price, a loyalty) are excluded by instruction: E5 is constants only. The
engine and content already read many of these live (e.g. `js/ui.js:1438` prints
`${M.meetingEvery || 42} days`, and `js/ui.js:3660` already substitutes
`words(C.setup.supplyDelaySittings || 3)`); E5 formalises a pattern that is partly
there by hand.

## A. Tunable setup values typed in interface text (confirmed)

| where | passage as it reads | setup path | as-is | unit | proposed | note |
|---|---|---|---|---|---|---|
| `js/tips.js:128` | "needs 4 per cent of the national vote to qualify" | `setup.law.threshold_pct` | 4 | per cent of the national vote | `{{setup.law.threshold_pct}} per cent` | needs a percent formatter |
| `js/tips.js:127` | "100 seats allocated from closed party lists by D'Hondt" | `setup.law.tier_ratio_list` | 100 | seats | `{{setup.law.tier_ratio_list}} seats` | the one tier count that is a law, not a roll; needs plural |
| `js/tips.js:205` | "under a thermal margin of 15 every point costs output" | `setup.macro.heat.line` | 15 | thermal-margin points | `{{setup.macro.heat.line}}` | engine default is 20 (`js/engine.js:6595`), setup sets 15; confirm which is canonical |
| `js/tips.js:179` | "at a meeting every six weeks" | `setup.macro.meetingEvery` | 42 | days | `{{setup.macro.meetingEvery}}` | text says *weeks*; 42/7 = 6. Needs a weeks formatter, or the value restated in weeks |
| `index.html:286` | "by its rule, every six weeks" | `setup.macro.meetingEvery` | 42 | days | same token | static HTML: see question 4 |
| `js/tips.js:194` | "plus half its miss from the target, plus half the output gap" | `setup.macro.rule.inflation`, `setup.macro.rule.gap` | 0.5, 0.5 | coefficient | `{{setup.macro.rule.inflation}}` / `{{setup.macro.rule.gap}}` | 0.5 must render as the word "half", not "0.5" |

## B. Campaign prose that types a setup constant (flagged; Codex's to edit)

`content/campaigns/flash_i/events.js:220` names this brief: "\"Six slots\" is typed here,
and `setup.sittingsPerPeriod` is not the same number". The right path is
`setup.slotsPerSession` (6); `sittingsPerPeriod` is 16 and is a different quantity.
Same file, line 903, records that a page deliberately left moving numbers to the
Economy tab rather than type a second copy. Not edited here.

| where | passage as it reads | setup path | as-is | unit | proposed | note |
|---|---|---|---|---|---|---|
| `events.js:304` | "The estimates need five of the six slots this period" | `setup.slotsPerSession` | 6 | order-paper slots | `{{setup.slotsPerSession}}` | "five"/"four"/"fifth" are procedural (four stages + the division), not setup |
| `events.js:739` | "if most of them vote against it, they delay it by three sittings" | `setup.supplyDelaySittings` | 3 | sittings | `{{setup.supplyDelaySittings}}` | already substituted in the UI at `js/ui.js:3660` |

## C. Fixed constitutional counts (bible §11 locks) — typed, no single setup path

These are the counts `briefs/act-one.md:551` calls "the constitution's own". Only the
list tier (`100`) has a direct setup path; the rest are derived from the rolls and one
law value. The engine already computes the totals, so E5 could resolve them from the
engine rather than a setup path — but that is a decision, not a field to invent
(question 1). The `21` and `121` are majorities derived from `40` and `240`.

| where | passage as it reads | value(s) | owns it |
|---|---|---|---|
| `js/tips.js:90` | "measured against all 280 seats" | 280 | derived `Engine.chamberTotal` |
| `js/tips.js:95-97` | "280 seats in all. 140 come from districts, 100 from party lists, and 40 from functional constituencies" | 280,140,100,40 | 140 = `content/constituencies.js` roll; 100 = `setup.law.tier_ratio_list`; 40 = `content/functional.js` |
| `js/tips.js:106` | "The 240 members returned by districts and lists together" | 240 | derived `Engine.popularTotal` |
| `js/tips.js:111` | "a majority of the 240 members returned by districts and lists" | 240 | derived |
| `js/tips.js:123` | "140 seats, first past the post, one constituency at a time" | 140 | `content/constituencies.js` |
| `js/tips.js:141` | "141 of 280. Half the chamber plus one." | 141,280 | derived `Engine.majority` |
| `js/ui.js:690` | "280 seats · a bill needs 141, and a dual bill needs 21 of the functional 40" | 280,141,21,40 | derived; 21 = floor(40/2)+1 |
| `js/ui.js:3658-3668` | "a majority of the 240 elected members. The 40 functional members …" | 240,40 | derived; the "40" also appears as the word "forty" at 3664/3668 |
| `index.html:214` | "40 seats, dual majority" | 40 | `content/functional.js` total |
| `events.js:40` | "The House has 280 seats, so a majority is 141" | 280,141 | derived |
| `events.js:739` | "The 240 elected members decide the estimates" … "The 40 functional members" | 240,40 | derived |

## D. Related typed numbers that are NOT setup constants

Named so E5 does not chase them, and so the author can decide whether any should become
tunable.

- `js/tips.js:100-101` "at loyalty 0 a party delivers 75 per cent … at 40 delivers 85 of every 100". Owned by the engine's turnout floor `0.75` (`js/engine.js:1780-1783`), not by setup. Stale only if the engine formula changes.
- `js/ui.js:6258` "within three points". Owned by `Math.abs(g - o) < 0.03` (`js/engine.js:8680`).
- `js/ui.js:691` "Thirty-four habitats". The count of `content/stations.js`. A content count, not setup.
- `js/ui.js:2004`, `js/ui.js:2493` "the eleven seat-holding firms". A content count.
- `js/tips.js:321`, `js/tips.js:344`, `js/ui.js:8432` "out of 100" / "Each starts at 100". The 0–100 scalar and index scale, engine-wide, not a setup scalar.

## Questions (do not invent a field or a number)

1. **Derived constitutional totals have no `{{setup.path}}`.** 280, 240, 141, 21 and 121 are `Engine.chamberTotal` / `popularTotal` / `majority` and two `floor(n/2)+1` results; 140 and 40 are counts of content rolls. Does E5 resolve engine values (say `{{engine.majority}}`), expose a chamber block, or leave section C typed for now?
2. **Component counts from content.** 140 (`content/constituencies.js`) and 40 (`content/functional.js`) are roll lengths. Is E5 meant to reach content arrays at all, or only `setup` scalars?
3. **Formatters.** "every six weeks" needs days→weeks; "half" needs 0.5→word; "4 per cent" needs a percent formatter; several need plural agreement. Which of these does E5 provide, and are they shared with `js/ui.js`'s existing `words()`/`pc()` helpers?
4. **`index.html` is static.** The two matches there (`index.html:214`, `:286`) are in markup loaded before any script runs. Can E5 resolve placeholders in static HTML, or should those two tails move into JS-built nodes the way the Economy tab's tail was cut/supplied?
5. **`setup.fiscal.bases` length.** "the four bases"/"the four scarce goods" (`js/tips.js:171`, `:344`; `js/ui.js:1583`) is an array length, not a scalar path. In or out of E5?
6. **One source of truth.** `js/ui.js:3658` and the Concordance article for a money bill may both state the "240 / 40" rule. Confirm before substituting so the two do not diverge again.
