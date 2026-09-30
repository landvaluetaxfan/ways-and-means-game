**Lane: Codex.** Written 29 Sep 2026 by Claude from the author's decisions.
Do it first, before `the-brief.md`.

**Read `design/62-why-the-overhaul.md` first.** It gives the objectives of
these changes and the reasons behind every design decision they carry out.
When this brief does not cover a case, decide it by that record's tests.
**Codex's questions are answered in `design/64-answers-to-codex.md`,**
and those answers win over this brief where they differ. In particular,
the whip's narrowing range is deferred (answer 13): the whip stays as it is.

The author: "while I like chamber, it definitely still is really packed, and
other tabs are under-designed." Every decision is in `design/61-the-tabs.md`,
and the game design it serves is `design/58-the-game-on-one-page.md`. Read
both, then `LESSONS.md` "Interface", and the header of `js/focus.js` before
touching any re-render.

This brief is the part of design/61 that needs **no new engine**. Work that
waits on the brief engine (the Sitting's right column, the Economy's calls
list, the Opposition's moves, the election screen) is in `the-brief.md` or
later, and is listed at the end so you do not build it here.

## Rules for every step

- **Keep the look.** The author likes the current style. Chamber in
  particular keeps its look: merge its duplicates, do not redesign it.
- **Readouts in words, figures on hover** (design/58). Where a step turns a
  figure into words, the words come from content or a small mapping the
  interface owns. Hover through `js/tips.js` (`data-tip-title` and
  `data-tip-body`).
- **A lever that is not open is not listed.** It appears when it opens.
  This applies to Government's initiatives and the ladder ("NOT OPEN TO
  YOU" rows today).
- Any new player-facing text: write it plainly, name it in the commit
  message, and leave the register to Claude. Lint holds it to `PROSE.md`.
- Run `npm run layout` after each tab (install
  `fonts-liberation-sans-narrow` first), and `npm run check`. Update
  `tools/uitest.js` where a panel it tests moves.
- One commit per step. Push each to `main`.

## Steps

1. **The tab order.** DONE. In `index.html` (about line 34), make it Sitting,
   Government, Chamber, Party, Relations, Economy, Orbit, Foreign Affairs,
   Concordance. **The Record tab goes** (see step 2).

2. **The Record folds into the Sitting.** DONE. `drawLog()` (`js/ui.js` ~7913)
   renders the record of decisions. The Sitting's left column is the Wire
   (`drawSitting()` ~6271). Make that column "What has happened": the
   Wire's news and the record's decisions, newest first, sitting by
   sitting. The playtest transcript (`drawExport()` ~932) moves to the
   Options menu (`js/shell.js`). The Concordance already carries the
   history secondarily, so leave it alone.

3. **Chamber: merge the repeats.** DONE. (`drawChamber()` ~7054, with
   `drawOrderPaper`, `drawChamberPicker`, `drawChamberForecast`,
   `drawChamberWhip`, `drawBenchTable` and `drawFunctional`).
   - The **order-paper time** panel lists the same bills as the order paper,
     only to carry the Grant buttons. Move each Grant button into its bill's
     row on the order paper. Show the time bar ("6 of 6 left this period")
     in the order paper's heading, and remove the time panel.
   - The **Parliament diagram's party legend** repeats the composition
     table. Remove the legend, and let composition carry the colours.
   - **Confidence** (a single line) goes into the diagram's heading.
   - The **functional constituencies** become a drawer (`<details>`) under
     composition, closed by default.
   - The **selected bill** takes the freed room on the left, so that it is
     no longer cut off at 1366 × 768.

4. **Government by department.** DONE. (`drawGovernment()` ~2425,
   `drawInitiatives()` ~5034).
   - Replace the four columns with **one card per cabinet post**, in the
     order of `content/cabinet.js`. Each card shows:
     - the holder, or "vacant";
     - how they stand with the Prime Minister (the character's
       `relationship`, in words);
     - the instruments their department can make;
     - the initiatives and ladder levers it can start, **open ones only**.
   - An instrument or initiative belongs to a department through a field
     in content. Check the schema first: if one exists (a `department`,
     `office` or `post`), use it. If not, add `post:"<cabinet id>"` to the
     schema (`js/schema.js`), the editor and every instrument and
     initiative. Anything unassigned goes on the Prime Minister's card.
   - A **vacant post** is a card with nobody on it and nothing it can make.
     That is design/58's rule, "a vacant post means nobody raises its
     matters", made visible.
   - The **Document** reader becomes an overlay (`js/dialog.js` style),
     opened from an instrument.
   - **Undertakings, the Tribunal and the Presidency** go in a narrow
     column beside the cards.
   - Leave room on each card for two things the brief will add: the
     matters the minister has raised, and their forecasts with whether
     each came true. An empty placeholder is fine. Do not invent data.

5. **Party: each current is treated like a partner** DONE. (`drawParty()` ~1622,
   `drawPartyCurrent()` ~1675, `drawLeadership()` ~1762).
   - Give the selected current the same terms `drawRelations()` (~1949)
     gives a partner:
     - who leads it;
     - what it wants: its measures and asks, where content has them;
     - what you have promised it;
     - where it parts from you;
     - how it would vote on each bill before the House.

     Reuse the Relations layout.
   - Add **"The country"**: a compact tracker with the polls by band (the
     standing figures the Sitting's indicators show today) and the seats the
     party would win or lose if the count were today. Use the engine's
     existing count model. Grep for the election and poll functions before
     writing one.
   - `briefs/psd-currents.md` is related. Read it, and fold in what fits.

6. **Relations: the Opposition panel** DONE. (`drawRelations()`). Add a panel for
   the Leader of the Opposition (in Flash I, Watkins: `content/characters.js`,
   role "Leader of the Opposition") and his party: the leader, his shadow
   cabinet (members with a "Shadow" office in `content/constituencies.js`)
   and the party's seats. His **moves** come later with the brief. Leave a
   "what he is doing" list, empty with the line "Nothing yet."

7. **Orbit keeps its look and adds the stations' state** (`drawStation()`
   ~7573). The selected station's detail panel gains a "State" section in
   words: its heat, its consumables and its standing, with figures on
   hover. Use the engine's per-station values; grep before adding any. If
   the Works (Flash I) has a stranded flag, mark it on the schematic
   when it is set. Do not add map modes: the author set them aside.

8. **The status bar keeps only the essentials, in words** (`drawStatus()`
   ~498, `#statusbar` in `index.html` ~525). Keep four items:
   - confidence;
   - the heat (the thermal margin);
   - the time to the rise;
   - the paper against the leadership.

   Each is in words ("confidence: safe by six"), with the figure on hover.
   Remove the others (READY, CHAPTER, SLOTS, SIGNATURES as a figure,
   THERMAL %), and keep the hint text.

9. **Badges** (`drawToday()` ~5158). Leave the red count, which marks what
   is owed from `Engine.today()`, as it is. Add a **quiet dot** for a tab
   where a matter in the brief lives. The hook can wait for the brief
   engine: add the CSS class and a function that takes a list of tab ids,
   and call it with an empty list.

## Not in this brief

- The Sitting's right column as the brief, and the matters: `the-brief.md`.
- The Economy's list of big calls, and the Draw buttons becoming calls:
  `the-brief.md`, where the calls come from matters.
- The Opposition's moves, and the Foreign Affairs dispatches and summits:
  later stages of design/58.
- The election screen at the run-in: later.

When all nine steps are in, delete this brief in the last step's commit.
