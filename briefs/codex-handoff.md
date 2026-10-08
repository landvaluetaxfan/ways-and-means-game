**Lane: Codex. Written by Claude Code, 8 October 2026, when the playtest build was one clean check from shipping.** Read
`AGENTS.md`, then `briefs/act-one.md` (the plan and the exit gate) and `briefs/itch-build.md` (the build). This file is what
changed since Codex last worked here (5 October), what is safe to build on, and what is yours.

# The state of the build

Flash I is built to the end of Act I (sittings 1 to 16, the rise, `a1_works_abandoned` as the curtain). The public playtest
build is `npm run itch` (`dist/ways-and-means-itch.zip`, one `index.html`, about 4 MB). The author will upload it to itch.io
and send testers a Discord link; there is no network call anywhere and no server.

`npm run check` has **nineteen** checks, including E9's independent notice coverage. E10 runs bounded parallel readers; on the author's Windows checkout the
unchanged baseline took 524.40 seconds and the final passing run took 349.27 seconds. Run it in the
background and wait for it; never edit a source file while it runs, because the DOM checks read files late. **Break a check's
subject and watch it fail before you trust it** (`AGENTS.md`); this session found a vacuous assertion that way
(`itchtest` read `document.body.textContent`, which includes every inline script).

# What Claude Code built, 7 and 8 October (all on `main` once the last check passes)

| | where | notes |
|---|---|---|
| The release build | `tools/build.js --release`, `tools/storystrip.js`, `tools/package-itch.js`, `tools/minizip.js` | strips the world's untagged story out of the inlined files; sets `window.PLAYTEST` (the playtest frame `js/shell.js` already had) |
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
4. **E5, setup constants in text** (`{{setup.slotsPerPeriod}}`-style, resolved when the page is shown and by lint, stored
   rendered in the log, round-tripped by the prose file and the editor). Mechanic issue 12: tooltips carry typed constants.
5. **A fixture of the engine's own for `test.js`**, so the world's untagged story can be archived and dropped from the
   shipping page by data and not by `tools/storystrip.js`. Brief `act-one.md`, "How old text leaves the build", rule 3.
6. **The tutorial's "Promises" card** and any step the author marks after playing.
7. **E1's signed-off form**: a campaign `play.curtain` frame (`design/80`).
8. **E11, full-page superevents**, only if the author still wants it after playing the build.

# Not yours

The prose, the canon and the content of Act I (Claude Code's lane, and the author's to mark), the 43 paragraphs that share
wording with the retired story (`reused-old-story.txt`, ignored by git, is the list), and anything the author reports from
playing: those go to `exchange/PLAYBOOK.md`, "What the author dislikes", and the checks grow to cover them.
