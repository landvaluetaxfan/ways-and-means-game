**Lane: opencode** (mechanical). Written 5 October 2026 from the author's decisions in
`design/76`: the first bill of the 2080 Parliament is named for the year, and session numbers
leave everything a player reads.

# Rename the Appropriation, and retire "Session 4"

**STATUS: step 1 done (Claude Code, 7 October, with the Act I text pass): the title is `Appropriation Bill 2080` and every `HC 4/` reference is `HC 2080/`, in `content/bills.js`, the parked bills, `content/instruments.js` and `test.js`. Step 2, the top bar's `SESS 4.1`, waits for `briefs/ui-tabs.md` pass 1 to land on origin/main.**

## What changes

1. **Content and tests (now).**
   - `content/bills.js`: the title `Appropriation (Session 4) Bill` becomes `Appropriation Bill
     2080`. Every bill's `ref` of the form `HC 4/NNN` becomes `HC 2080/NNN`, in
     `content/bills.js` and `content/campaigns/flash_i/bills.js` (the Parliament elected in 2076
     had session 4; this one has not). The id `appropriation` does not change.
   - Update what asserts or mentions the old names: `test.js` (lines about `HC 4/117`), the
     comment in `content/instruments.js`, and anything `grep -rn "Session 4\|HC 4/"` finds outside
     `content/archive/`. Add a supplementary bill later as `Appropriation (No. 2) Bill 2080`.
   - `content/setup.js` `session: 4`: leave the number alone unless `grep` shows nothing but the
     top bar reads it; if so set it to 1 and say so in the commit message.
2. **The top bar (after pass 1 lands).** In `drawTitle` (`js/ui.js`) drop `SESS 4.1`: the bar reads
   `SITTING 001 / 2080-04-11 / RISES IN 15`. Do not add an act label: the theatre's acts are still
   the old chapters, and an act label waits for Stage 4b (`design/73`). Pass 1 adds a tooltip to the
   old label; this step removes the label and the tooltip with it.

## Checks

`npm run check`. `node tools/playtest.js --seeds 80` must be identical before and after (these are
strings). Read `PROSE.md`'s Interface section before changing any string a player reads, and run
`npm run prose` after a content edit.
