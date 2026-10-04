**Lane: Codex.** Written 4 October 2026 by Claude from `design/58` ("How the
story moves", Round G and "Decided: intervals are read, then a course is set"),
`design/60` and bible §1.8. This is the engine core of Stage 4. **Plan first**:
write `design/75-interval-plan.md` (what `advance`, `recess`, `prorogue`,
`dateOfSitting` and the theatre frame's `acts` and `intervals` in
`content/campaigns/flash_i/campaign.js` already do, with file and line; what is
missing; the content shape; the save change; the tests) and commit it. Do **not**
invent a second structure beside the theatre frame's: extend it.

## What an interval is

An act is a run of sitting days; the months between acts are skipped (Round G).
At the skip the world moves without the player, and the player is told, then
sets a course. Today the calendar can already put months between two sittings
(`dateOfSitting`), and the theatre frame can show an interval page. What does not
exist is the **simulation of the gap, the report of it, and the choices after it.**

## Build

`Engine.interval(st, C, gap)`, called by `advance` when the next sitting's date is
more than `setup.intervalDays` after this one (content-owned; propose 28), or when
content flags the calendar entry as an interval. It:
1. **Runs the elapsed time.** Check first that the calendar-time accounting
   (LESSONS "Engine", the economy's `accrue` by days) already carries a gap of
   months correctly: receipts, spending, interest, inflation, the Bank's meetings.
   If it does not, carry it, and say what was wrong.
2. **Resolves what falls inside the gap:** undertakings and queued items whose day
   falls in it (use the existing resolvers; no new randomness).
3. **Runs interval steps**, a small registry `intervalSteps` of `{ id, run(st, C,
   gap) -> report rows }`. Register the economy step here. Another branch
   (`briefs/leverage-claims.md`) exposes `Engine.fadeLedger`; register it as a step
   when it is on main, and design the registry so that is a one-line change.
4. **Builds the report** into `st.interval = { id, from, to, days, rows }`, where
   each row is `{ kind: "endured" | "decayed" | "used", text }` (design/58: what
   endured, what decayed, who used the absence). Text is filled with engine
   figures through the same `{figure}` slots as the Underwriters' briefing, and
   content owns the sentence templates (`setup.intervals`).
5. **Opens a course-setting window:** one or two ordinary decisions declared on the
   interval in content (`choices: [event ids]`), asked after the report, before
   the House returns. Reuse the event and decision machinery; do not add a new
   dialog.
6. **Opens the reshuffle window:** while `st.interval` is open, the cabinet may be
   changed without the usual resignation and dismissal gates (find them: "why a
   minister can or cannot be dismissed"). Say in the plan what you chose.

The interface needs only the existing interval page plus the report rows and the
choices. Names in the interface: "Endured", "Decayed", "Used the absence". Write
them plainly and name them in the commit for Claude's register pass.

## Prove it without Flash I

A **synthetic two-act campaign** in `test.js` (not Flash I): act one of three
sittings, a four-month gap, act two of three. Assert the date jumps, the economy
accrued the gap, a queued item inside it resolved, the report has the three kinds
of row, a course choice is asked and answered, the reshuffle window is open and
then closes, and save and load round-trip mid-interval. Flash I's calendar is
**not changed** here (Stage 4b, with the author).

## Measure

- `node tools/playtest.js --seeds 80` before and after: **identical**, and
  `npm run guards` reaches the canon. A campaign with no interval must behave
  exactly as now.
- Bump `STATE_VERSION` to **38** with a migration (36 and 37 are reserved for
  `leverage-claims` and `witnessed-acts`). Keep your number even if theirs lands
  first; keep `STATE_VERSION`'s comment line in ascending order on merge.
- `npm run check`, and `npm run layout` for the interface.
- Break the gap accrual (skip it) and watch the new test fail.

Claim the brief first (`node tools/exchange.js claim interval-engine --lane codex
--files js/engine.js,js/schema.js,js/ui.js,js/editor.js,test.js`) and push the claim
alone. Delete this brief in the commit that finishes it and release the claim.
