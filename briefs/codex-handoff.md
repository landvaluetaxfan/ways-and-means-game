**Lane: Codex. Written by Claude Code, 8 October 2026, when the playtest build was one clean check from shipping.** Read
`AGENTS.md`, then `briefs/act-one.md` (the plan and the exit gate) and `briefs/itch-build.md` (the build). This file is what
changed since Codex last worked here (5 October), what is safe to build on, and what is yours.

# The state of the build

Flash I is built to the end of Act I (sittings 1 to 16, the rise, `a1_works_abandoned` as the curtain). The public playtest
build is `npm run itch` (`dist/ways-and-means-itch.zip`, one `index.html`, about 4 MB). The author will upload it to itch.io
and send testers a Discord link; there is no network call anywhere and no server.

`npm run check` has **twenty** checks, including E9's independent notice coverage and E5's setup-text contracts. E10 runs bounded parallel readers; on the author's Windows checkout the
unchanged baseline took 524.40 seconds and the final passing run took 349.27 seconds. Run it in the
background and wait for it; never edit a source file while it runs, because the DOM checks read files late. **Break a check's
subject and watch it fail before you trust it** (`AGENTS.md`); this session found a vacuous assertion that way
(`itchtest` read `document.body.textContent`, which includes every inline script).

# What Claude Code built, 7 and 8 October (all on `main` once the last check passes)

| | where | notes |
|---|---|---|
| The release build | `tools/build.js --release`, `tools/package-itch.js`, `tools/minizip.js` | inlines the authored page without rewriting story; retired world story is archived outside the source graph; keeps `data-dev` exclusions and sets `window.PLAYTEST` |
| Its test | `tools/itchtest.js` | unzips outside the repo, plays Act I menu to curtain through the page, saves, no network, no retired phrases, the lever ladder and reveals as drawn |
| The curtain | `setup.actEnd`, `Engine.checkEnd` kind `"act"`, `js/ui.js` | a dated last page (the day the House rose), a thank-you section |
| The lever ladder (E3) | `setup.locks`, `Engine.lockOf` | `grant`, `divide`, `whip`, `money`, `clause:<id>`; a scene's own `clause` and `whip` effects bypass it; the sandbox is never locked |
| Reveals (E2, in part) | `setup.reveals`, `Engine.revealed` | the Chamber's list waits for `a1_order_paper`; the count (benches, the bill's stances, its Concordance forecast) for `a1_count` |
| The tutorial | `js/tutorial.js`, `css/tutorial.css`, `tools/tutest.js` | see `briefs/tutorial-mechanism.md`'s status |
| Postures optional, earned answers | `tools/lint.js`, `js/ui.js`, `CONTENT_GUIDE.md` | `because` on a gated choice; at most four open answers and an earned fifth |
| A condition | `keptAtLeast` in `CONDITIONS` and `js/schema.js` | |
| Checks | `tools/fidget.js`, `tools/flagaudit.js` | a player who uses every lever at random across 240 seeds; every flag the act sets is read |
| A refusal | `Engine.load` | a save from a newer build throws a plain reason |
| Strings | E15's list in `briefs/act-one.md` | applied in `js/ui.js` |

I made small hunks in files `ui-tabs` and `witnessed-acts` hold (`js/ui.js`, `js/engine.js`, `index.html`,
`css/terminal.css`, `js/schema.js`, `test.js`), because nothing of Codex's has landed since 5 October. **Pull before you
touch them.** `exchange/claims` still lists both claims; release or renew them.

# Traps you will meet

- **The DOM checks play on a fixture government** (`tools/harness.js`, the old Flash I). It must carry none of Flash I's
  `actEnd`, `locks` or `reveals` (it strips them); a new campaign-level gate needs the same line there or `uitest` fails in
  twenty places.
- `tools/laycheck.js` and `tools/actwalk.js` play the real Flash I; the sandbox flag disables locks, reveals and the tutorial.
- A `seen` condition is recorded **after** a decision's effects, so a scene's own choice cannot be gated on its own `seen`.
- Do not use `pkill -f` or `pgrep -f` with a string that appears in your own command line; it kills your shell.

# Yours, in order

**E10 complete (Codex):** all eighteen checks passed in 349.27 seconds, against the unchanged 524.40-second
baseline (33.4% faster). The prose write-back runs alone, then up to four readers run together. UI and itch
checks share a bundle-writing resource and cannot overlap. The original Government selection assertion
failed before and after the lookup changes; fifteen focused mutations also failed as intended, covering live
DOM replacements, selector semantics, failure/output preservation and shared-build exclusion. Review caught
and corrected a local harness-name shadow, sibling selector scoping and the shared-build race. No existing
assertions were removed and no player-facing wording was added.

1. **Make `npm run check` fast (E10): done.** The eighteen checks remain; runner contracts are tested before the
   engine test within the existing `test` job. DOM lookups use live ID indexing and panel-scoped descendants,
   with document lookup retained for grouped selectors and siblings. No check was removed or split away.
2. **E9, change notices: implemented.** `apply` returns actual final-state notices; `chooseWithNotices` includes
   decision costs and settlement while preserving `choose`'s string result and save shape. Numerical changes stay
   in What moved, as approved; uncapped structural cards open the current item. The independent gate checks
   1,480 legal answer branches across eight seeds and five strategies, including control gates and map changes,
   and rejects missing fields or wrong destinations. Eighteen original mutations were caught; stripping real
   clause, appointment and settlement notices failed on precise paths, as did an unreported second-answer change.
   Review fixes cover role-based relationship routes, domestic actors below lobbying eligibility, map designation,
   resolution availability and unlock targets. Empty effects still update advice clocks. The complete nineteen
   checks passed in 280.29 seconds; real Edge layout passed, with three font-stack warnings. Fifteen reduced-motion
   cards were inspected at 1920x1000 and 1366x768. The 80-seed before/after reports are byte-identical.
   Plain new wording for Claude's register pass: Changed items; updated; removed; final bill stages, post holders
   and undertaking states in item summaries; clause names and final levels. No Act I prose or content changed.
3. **E4, guarded writers: implemented.** OpenCode's `87b40e2` guards filled Cabinet posts and backward bill
   stages. Codex's follow-up closes the off-ladder exceptions: ended bills cannot reopen, enacted bills
   cannot become defeated/withdrawn/fallen, unknown stages are refused, and blocked bills advance from
   their existing first-reading position. Refusals reject the entire bill patch and log a line. Campaign
   opening can restage known stages because it defines the initial state. Fifteen transition assertions
   were break-tested; the 80-seed before/after reports are byte-identical. The editor retains explicit
   Cabinet replacements as raw JSON; adding its normal replacement control remains a small editor follow-up.
4. **E5, setup-text infrastructure: implemented (Codex).** Numeric `{{setup.path}}` tokens and coefficient
   `|percent` formatting resolve in active-campaign pages, frames, references, tutorials and tooltips. Recorded
   history, wire, bill history, amendment labels and promises retain their original rendered values. Lint uses
   each entry's campaign setup; exports and editor serialization retain literal templates. The real-browser
   probe caught ordinary JSON braces being mistaken for templates; the repaired resolver preserves JSON and
   legacy single-brace substitutions. Twenty checks passed in 287.57 seconds; 22 deliberate breaks were caught.
   Edge layout passed, with three font-stack warnings. Screenshots at 1920x1000 and 1366x768 show the tuned
   Bank interval, coefficients and tooltip agreeing; the smaller Bank explanation wraps and scrolls with the
   tab. The 80-seed reports are byte-identical. New plain wording for Claude: Bank intervals in days,
   coefficients as percentages in tooltips and the Bank explanation, and setup-token diagnostics.
   **Still Claude's:** inventory B's two Act I token substitutions and the register pass. Constitutional
   totals remain outside setup-only E5. Plan and scope rulings: `design/83-setup-text-plan.md`.
5. **A fixture of the engine's own for `test.js`: implemented and independently reviewed**, so the world's untagged story can be archived and dropped from the
    shipping page by data and not by `tools/storystrip.js`. Brief `act-one.md`, "How old text leaves the build", rule 3.
    **In progress, 8 October:** the author approved `design/84-engine-fixture.md` and native execution of
    `design/85-engine-fixture-plan.md`. Task 1 adds independent engine/interface profiles, ordered-rule
    contracts and fresh-copy checks. Existing consumers and source story remain unchanged in this batch.
    Twenty checks passed in 297.50 seconds; fixture mutations cover ordering, gates, setup and isolation.
    **8 October continuation:** Task 2 is committed in `05125b4`; its full suite passed 20/20 in
    314.13 seconds. Task 3's source/archive move is checkpointed in `e98602a`, explicitly unfinished.
    All 246 archived chunks and four shared survivors match their pre-move source bytes.
    Task 3 is complete: 20/20 checks passed in 172.34 seconds; 31 audit/flag mutations and one
    fixture-setup serialization mutation fail for their intended reasons. The 960-run report matches
    the baseline after decoding and LF normalization. Edge's direct layout probe finds no faults
    at seven sizes, native and wrapped; the CLI dump runner returned no usable document.
    Task 4 removes packaging surgery and retires `tools/storystrip.js` (its only executable consumer
    was the builder). Independent source-page/model and unpacked-bundle assertions cover all ten
    story collections and reject fixture/archive scripts. Thirteen deliberate boundary mutations
    fail. Packaged Edge runs at 1920x1000, 1366x768 and a cross-origin 960x640 frame reach the curtain,
    restore a complete save through Continue, and have clean console/external-network logs.
    The pre-review tree passed 20/20 checks in 185 seconds, with zero direct Edge layout findings
    and a matching 960-run baseline. The fresh reviewer independently reconstructed both original
    profiles and all 250 source chunks. Two Important findings were repaired RED→GREEN: lexical
    comments before commas now travel with their retired entry without leaving holes; a law feeding
    an isolated policy cycle cannot pass without terminal feedback. Existing holes fail before writing.
    Three deliberate review-fix mutations fail. Final reviewed tree: 20/20 checks in 179.27 seconds,
    zero findings from direct Edge layout probes at seven sizes native/wrapped, and the 960-run
    report matching baseline after decoding/LF normalization. Job 5 is complete; its claim is released
    with the finishing commit. Other jobs in this brief remain. No new player-facing wording.
    **Deferred minor:** AGENTS.md's historical loading paragraph and comments in testkit/harness still
    describe the former arrangement; the independent profiles and world archive described above
    are the current implementation.

    **Existing curtain follow-up (separate job 7):** the header shows sitting 17, 23 May, while the
    curtain report is dated the 8 May rise. At smaller sizes the report figures and thank-you section
    require scrolling the reading pane; copying the report is in Options. The archive migration changes
    neither the curtain nor its wording.

    **Archival decisions approved by the author, 8 October:**

    - Explicitly reserve `led_on_competence`, `led_on_continuity` and `led_on_break` for live
      callbacks recalling the opening speech. Their immediate effects remain. The writing's
      promised quotations still need those callbacks; Claude should revisit them for the standalone
      slice. A real reader must retire its reservation; a comment or archived page cannot do so.
    - Remove the default setup's `onPartnerWithdraws` and `onPartnerStandsAside` hooks naming
      archived pages. The independent fixtures retain their original hooks and setup hashes.
    - Repair the consequence audit before requesting new scenes. It now reads each playable
      campaign separately, counts policy-rule movers, House business and alerts, and traces rule
      dependencies. Fresh engine probes establish price → inflation → standing, and closure or
      suspension → recorded news. These are structural dependency proofs, not a promise that
      every threshold fires within Act I. A cycle, a comment or a number displayed alone cannot
      satisfy the rule. Malformed graphs fail closed. No Act I writing or engine rule changes.
6. **The tutorial's "Promises" card: implemented (Codex).** The `owed` region highlights the first
   visible open promise, under Coming up initially and Owed as its deadline approaches. The card waits
   when no promise row exists; other obligations do not trigger it. The real Act I path, deadline
   transition, redraw, tab changes, dismissal, save/load and Options replay are covered by `tutest`.
   Plain wording adjusted for Claude's register review: the drafted card names Coming up and Owed,
   and says to keep the promise where its row says. Any steps the author marks after playing remain open.
   Twenty checks passed in 187.76 seconds; four in-memory region/tab mutations failed as intended.
   Direct Edge layout found no faults at seven sizes, native and wrapped (Arial Narrow/Arial/Consolas
   fallbacks); four settled screenshots at 1920x1000 and 1366x768 were inspected. The 80-seed reports
   are byte-identical. This checkout uses locked local jsdom and the existing migration worktree's
   Acorn 8.19.0 through NODE_PATH; Acorn is not declared in the project's lockfile.
7. **E1's signed-off form (Codex, 9 October):** the campaign's `play.curtain`
   owns `after`, `event` and `note`. Older campaigns using `setup.actEnd` still work.
   The closing page, header and copied report share the closing sitting and date;
   losses of supply or confidence still take precedence. Event renaming follows the frame.
   Plain interface wording for the register pass: “The House has risen” and
   “This run has ended. The playtest transcript is in Options.”
   Verification: 20/20 checks in 194.83 seconds; Edge native and wrapped layout
   at seven sizes, zero findings; curtain screenshots at 1920x1000 and 1366x768;
   80-seed before/after results identical. Feedback destination is given by the author
   directly to testers (Discord); no channel or invite is required in the game.
8. **E11, full-page superevents**, only if the author still wants it after playing the build.

# Not yours

The prose, the canon and the content of Act I (Claude Code's lane, and the author's to mark), the 43 paragraphs that share
wording with the retired story (`reused-old-story.txt`, ignored by git, is the list), and anything the author reports from
playing: those go to `exchange/PLAYBOOK.md`, "What the author dislikes", and the checks grow to cover them.
