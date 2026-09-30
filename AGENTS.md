# Ways and Means: instructions for every agent

This is the one file of instructions for Claude Code (which reads it through
`CLAUDE.md`), Codex and opencode. A live instruction from the author, Harper,
beats anything written here.

## The project

*Ways and Means* is a text-based narrative political thriller with real
electoral mechanics. It is set in the Circumterrestrial Commonwealth, a
federated republic of orbital habitats, in 2080. There is no build step and
no framework: `index.html` is the game and `editor.html` is the content
editor, and both open from `file://`. The game is a vessel for the author to
write campaigns in. **Flash I** is the proof of concept and so far the only
campaign.

## Where things live

Each kind of information has one home. Read only the home you need.

| | |
|---|---|
| how to work here, and the rules | `AGENTS.md` (this file) |
| **the current work** | `briefs/`, one task per file. Nothing else is a work list |
| canon, out-of-world | `bible.md`. Read the section index at its top, then only the range: `sed -n '274,296p' bible.md`. Sections are LOCKED, LEANING or OPEN |
| canon, in-world | `textbook.md` (`node tools/toc.js --index textbook.md` prints its index) |
| how to author content | `CONTENT_GUIDE.md` |
| how prose is written | `PROSE.md` |
| faults already made | `LESSONS.md`, by area. Read the section for what you are touching |
| why things are as they are | `design/`, dated decision records. A later record overrides an earlier one, and the files above override them all. `design/archive/` holds retired plans and status documents |
| the public description | `README.md` |

**Where an answer lives:**

| question | where to look |
|---|---|
| a rule | the bible |
| a number | the bible's §11, or the content file itself (content wins) |
| how something reads in-world | the textbook, which wins on tone |
| which seats exist and who holds them | `content/constituencies.js` |
| what a station is | `content/stations.js` |
| what an effect verb does | `js/schema.js`, then `EFFECTS` in `js/engine.js` |

## Lanes

| | |
|---|---|
| **Claude Code** | player-facing prose in the author's register, canon and design judgement, architecture, and the briefs |
| **Codex** | engine, tools, tests and interface work, from a brief |
| **opencode** | mechanical execution from a brief: applying an edited `prose.txt`, renames, small content edits, running the checks. A `/opencode` comment on a GitHub issue starts it headless (`.github/workflows/opencode.yml`) |

Pick up work from `briefs/README.md`. If a code task needs new canon or
player-facing prose, write it plainly, name it in the commit message, and
leave the register to Claude; lint holds all prose to `PROSE.md` whoever
wrote it. Hand engine work that can be specified to a brief rather than
spending the author's Claude usage on it.

## Work economically

The author pays for every token.

- **Grep before you open a file**, and read ranges, not whole files. Never
  read `bible.md`, `textbook.md`, `CONTENT_GUIDE.md` or `js/engine.js` whole.
- **Keep command output short**, with `| tail` or `| head`.
- **Before working on a mechanic**, read the bible's sections on it and say
  which of them are OPEN or thin.

## Standing rules

- **Push every finished batch to `main`** once `npm run check` passes. That
  deploys the live game (the author, 28 Sep: "push to main and live, do that
  for everything in the future too"). Develop on your branch, then
  fast-forward `main`, or merge your pull request.
- **`js/engine.js` names no event, no party and no station.** Content is data
  in `content/*.js`, in schemas the engine defines. What you want is nearly
  always a content entry, or rarely a new verb in `EFFECTS`/`CONDITIONS`
  with its entry in `js/schema.js` (`test.js` fails if the two differ) and
  the editor.
- **Content is `.js`, not `.json`**, because a browser blocks `fetch()` on
  `file://` and allows `<script src>`. Do not add modules or a build step.
- **Determinism.** Event selection has no randomness apart from the seeded
  `perSitting` roll (bible §1.5). Determinism is what makes balance testable.
- **The rosters are frozen** (bible §2.7). Invent no station, character or
  setting term in passing; add to canon deliberately, in the content files.
  **The date**: the campaign opens on 11 April 2080. Anything Commonwealth is
  2058–2080 and nothing is generations old (bible §11.1, LOCKED).
- **One concept cluster per event** (bible §2.6), which lint enforces.
- **A campaign is a unit and a folder** (`content/campaigns/<id>/`, one file
  per kind, each a `campaign("<id>", {...})` call). Play through
  `CONTENT.forCampaign(admin)`, never raw `CONTENT`. `test.js` tests the
  engine on the world's content; a campaign's promises are in its
  `guards.js` (`npm run guards`).
- **Decision, event, lever.**
  - A *decision* is the sitting's business, one a sitting.
  - An *event* is an entry with `setpiece`: a page that happened, shown
    before the decision. It is an outcome (`queuedOnly`), random
    (`perSitting`) or threshold event.
  - A *lever* is what the player starts: initiatives, orders, bills, the
    whip, the paper.

  Play a sitting with `Engine.playSitting(st, C, pick)`.
- **New events go at the END of their list**, because the pool's seeded
  lean is keyed on position. Judge a content edit with
  `node tools/playtest.js --seeds 80`, before and after. Cut events are
  archived in `content/archive/cut-events.js`, never deleted.
- **Prose follows `PROSE.md`**, and lint fails an event page, decision or
  choice that does not explain. Add a new company, institution or setting
  term to `INTRODUCE` in `tools/pagecheck.js` the day a page names it. Run
  `npm run prose` after a hand edit to content, or the next write-back
  reverts it.
- **State.** Bump `STATE_VERSION` when the state's shape changes, with
  migration guards ascending, one block per bump. Content owns identity, the
  save owns simulation, and `Engine.reconcile()` runs on every load. Player
  preferences go in `Shell.opts`.
- **One writer for each thing:** `bumpScalar`, `shiftLoyalty`,
  `Engine.divide()`, `Engine.benchRoll`, and `Engine.money` (`cw()` in the
  interface). The engine is one closure, so grep for
  `function <name>` before naming one.
- **The economy's constants are content's**: `setup.fiscal`, `macro`,
  `priceRules`, `lenders`, `couplings` and `alerts`. The unit is the million
  dollars. A number the interface prints is content's number, never a
  literal.
- **Dialogs** are `js/dialog.js` and answer through callbacks. The harnesses
  override them, so a signature change goes into `tools/harness.js` and
  `tools/edtest.js` too.
- **Before trusting a check, break its subject and watch it fail.**
- **Do not commit** the untracked duplicates that may sit at the root of the
  author's clone (`events.js`, `glossary.js`, `lint.js`,
  `encyclopedia_content.js`, `encyclopedia_renderer.js`, `js/codex.js`) or a
  mode change to `tools/dither.sh`.

## Flash I's canon

A campaign has one canon ending, and the next campaign opens on it (bible
§1.8). **Flash I's canon is the debt trap** (the author: "a middle ground
between perfect and failure").

A campaign is one Parliament's worth of government, with one election, at
its end. Flash I is the Parliament of 2080, to the election of 2084
(bible §1.8 and §11.1, design/58). What is built still has the older
arrangement: Vijlbrief's last session and the Works, to a count in August
2080. Until Stage 4 of design/58 rewrites it, the canon ending is read at
that count.

The canon government reaches the count on 13 August 2080, sitting 55, at
standing 52:

- **Seats:** the PSD holds 103 of 280, and the government's side 167, a
  working majority.
- **Thermal margin:** 5.
- **Debt:** it owes CW$29.6bn in Treasury bills, with CW$30.4bn of room left.
- **Inflation:** 6.5%, or 2.9% core, with its payments current.

`npm run guards` asserts that the canon is reachable by play and prints these
figures. Across 80 seeds, the four crisis strategies lose 33, 54, 21 and 25
runs, every loss a late thermal cascade. Keep the canon reachable until the
author rewrites it, and update these figures when they move.

## The interface

Nine tabs in play, and a tenth, Sandbox, in the author's sandbox. The order
is the one in `index.html`, and the record of decisions is no longer a tab:

| | |
|---|---|
| **Sitting** | the event page, then the decision; what has happened, the docket, the calendar, the indicators |
| **Government** | department cards, their instruments and open initiatives, undertakings, the Tribunal and the Presidency |
| **Chamber** | order-paper time, the order paper, the House, the whip, confidence, composition |
| **Party** | the player's own party: its currents as partners, the country forecast, the leadership, the paper |
| **Relations** | every other party, and who votes with whom; the coalition roster and the Opposition's shadow departments |
| **Economy** | the account, the four prices, the Reserve Bank and the dollar, the Underwriters, the chart |
| **Orbit** | the stations; the schematic with campaign markers, and one station's detail with explicitly national capacity readings |
| **Foreign Affairs** | the globe, actors and the forums (tab id `world`) |
| **Concordance** | the reference work. It knows only what the world knows |
| **Sandbox** | the author's bench (from the main menu): every decision, event and lever |

**What has happened** is the Sitting's left column: the wire's news and the
record's decisions, grouped by sitting, newest first (29 Sep). The playtest
transcript lives only in the in-game Options popover (design/64, answer 15).

The status bar keeps confidence, heat, the rise and the leadership paper in
words, with figures on hover, alongside the hint. Red tab counts remain
obligations; the quiet advice-dot hook awaits the brief engine.

**Party ids** are the initials of old names, and a poor guide to the names:

| id | name | short |
|---|---|---|
| cu | Party of Socialists and Democrats | PSD |
| cl | Liberal Party | LIB |
| psa | New Progressive Party | NPP |
| sc | Home Rule | HR |
| hul | Association of Engineers and Systems | AES |
| rv | Congregational Democratic Alliance | CDA |
| fh | Freehold Party | FH |
| gb | Alliance of Business and Government | ABG |
| des | One-G | ONE |
| geo | Single Tax Party | STP |
| upl | Uplift Alliance | UPA |
| ind | Independents | IND |

## Checks

```
npm install      # once, for jsdom
npm run check    # all thirteen, about two minutes; all must pass
```

| | |
|---|---|
| `test.js` | the engine on the world's content: chamber arithmetic, reconciliation, instruments, a 40-sitting smoke test |
| `tools/guards.js` | each campaign's own promises (`content/campaigns/<id>/guards.js`), Flash I's canon run included |
| `tools/lint.js` | legibility and references: concept load, terms taught before use, the prose checks, every id that content names |
| `tools/cxcheck.js` | Concordance links, see-alsos, banners |
| `tools/roundtrip.js` | the serialiser: identical play and identical data |
| `tools/renametest.js` | renaming every id preserves behaviour and leaves no old id |
| `tools/edtest.js` | the editor boots, and opening an entry changes nothing |
| `tools/uitest.js` | the menu, every screen, saves |
| `tools/uxtest.js` | focus, tips, audio, streaming, the division dialog |
| `tools/toc.js --check` | the bible's section index is current (`npm run toc` rebuilds it; never edit it by hand) |
| `tools/enccheck.js` | every source file is UTF-8, with no BOM and LF line endings |
| `tools/prose.js --check` | the prose export round-trips |
| `tools/storymap.js --check` | every view's story map draws |

**`npm run layout`** is outside `check` because it needs a real browser. It
boots the game and the editor in headless Chromium and reports clipped or
escaping content. Run it after touching the stylesheet or a panel. Install
`fonts-liberation-sans-narrow` first, or it measures a face about 22% wider
than the author sees; the run prints the faces it resolved.

## The code

```
js/engine.js          the rules; names nothing concrete
js/ui.js              game rendering
js/shell.js           menu, save slots, options, player preferences
js/schema.js          the content vocabulary, machine-readable
js/editor.js          the editor; js/serialise.js writes content back out
js/refs.js            reference tracking for safe rename
js/focus.js           focus, selection and scroll across a re-render (read its header first)
js/stream.js js/wait.js js/audio.js js/tips.js js/orbitchart.js js/encyclopedia.js
content/*.js          the world; content/campaigns/<id>/ a campaign's story
tools/                the checks, the playtest, the prose file, the story map, the build
```

## Windows

PowerShell 5.1 displays UTF-8 as mojibake, and its `Set-Content` then writes
the mojibake in for real, with a BOM. Read and write source with the editor's
tools or with node, never `Get-Content`/`Set-Content`, and trust
`npm run enc` over anything a console printed.
