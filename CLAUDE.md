# Working on this repo

A text-based narrative political thriller with real electoral mechanics, set in a
federated republic of orbital habitats. No build step, no framework, no bundler.
Open `index.html` in a browser to play, `editor.html` to author.

The game is a vessel for the author to write campaigns in; **Flash I** is the
proof of concept. This file holds what applies to every task. **`LESSONS.md`
holds every fault already made, with the long version, and the records of past
handoffs: read its section for the area you are about to touch** (the table at
the end says which).

## Standing rules

- **Do not commit** the untracked root duplicates (`events.js`, `glossary.js`,
  `lint.js`, `encyclopedia_content.js`, `encyclopedia_renderer.js`,
  `js/codex.js`) or the `tools/dither.sh` mode change.
- **The date.** The campaign opens on **11 April 2080** and the Commonwealth is
  sixteen years old. `bible.md` §11.1 carries the LOCKED timeline: anything
  Commonwealth is 2058–2080, anything Earth may be earlier, and nothing is
  generations old. Check a new date against it.
- **A campaign is a unit and a folder** (`content/campaigns/<id>/`, one file per
  kind, each a `campaign("<id>", {...})` call). Play through
  `CONTENT.forCampaign(admin)`; never hand the engine raw `CONTENT` for a game.
  `test.js` tests the engine on the world's content; a campaign's own promises
  are in its `guards.js` (`npm run guards`).
- **Decision, event, lever** (design/49–51). A *decision* is the sitting's
  business, one a sitting. An *event* is something that happened: an entry with
  `setpiece`, a page that takes the screen before the decision, of three kinds
  (outcome `queuedOnly`, random `perSitting`, threshold). A *lever* is what the
  player starts (initiatives, orders, bills, the whip, the paper). Play a
  sitting with `Engine.playSitting(st, C, pick)`, never one `nextEvent` a
  sitting.
- **New events go at the END of their list**, because the pool's seeded lean
  is keyed on position. **Judge a content edit with
  `node tools/playtest.js --seeds 80`**; one seed is an anecdote. Cut events
  are archived in `content/archive/cut-events.js`, never deleted.
- **An event page is a news report, and lint fails one that does not explain**
  (`tools/pagecheck.js`, design/51): a headline in `setpiece.title`, a lede
  saying what happened, short sentences, the third person, and every name
  introduced where it first appears. Add a new company, institution or setting
  term to `INTRODUCE` the day a page names it. Read design/45 and design/51
  before writing any player-facing prose, and run `npm run prose` after a hand
  edit to content, or the next write-back reverts it. Prose calls the chamber
  **Parliament**, or the House for short, not the House of Delegates (the
  author, 27 Sep).
- **State.** Bump `STATE_VERSION` when the state shape changes, with migration
  guards ASCENDING, one block per bump. Content owns identity, the save owns
  simulation, and `Engine.reconcile()` runs on every load. Player preferences
  go in `Shell.opts`, never the save.
- **One writer for each thing:** `bumpScalar` for a scalar, `shiftLoyalty` for
  loyalty, `Engine.divide()` for a division, `Engine.benchRoll` to seat the
  House, `Engine.money` (`cw()` in the interface) to print money. The engine is
  one closure, so `grep -n "function <name>"` before naming a function.
- **The economy's constants are content's** (`setup.fiscal`, `setup.macro`,
  `setup.priceRules`, `setup.lenders`, `setup.couplings`, `setup.alerts`). The
  unit is the million dollars. `Engine.budget` and `Engine.receipts` take `C`.
- **A number the interface prints is content's number**, never a literal.
- **Dialogs** are `js/dialog.js` and answer through callbacks
  (`Dialog.alert/confirm/prompt(msg, opts?, done?)`). The harnesses override
  them, so a signature change goes into `tools/harness.js` and
  `tools/edtest.js` too.
- **Before trusting a check, break its subject and watch it fail.** A flag set
  and never read is a mechanic somebody started; a name read and never written
  is a feature that isn't there.

## Flash I's canon

A campaign has one canon ending, and the next campaign opens on it (bible
§1.8). **Flash I's canon is the debt trap** (the author, 23 Sep: "a middle
ground between perfect and failure"). Since design/51 the canon government
reaches the count on 13 August, sitting 55, at standing 52: the PSD holds 103
of 280 and the government's side 167, a working majority, on a thermal margin
of 5. It owes CW$29.6bn in Treasury bills (CW$30.4bn of room left), with
inflation 6.5% (2.9% core) and its payments current. The election ends the
run; nothing comes after the count (design/32). The guards assert that the
canon is reachable by play and print these figures. Keep that true until the
author rewrites the canon.

Across 80 seeds the four crisis strategies lose 33, 51, 32 and 35 runs, every
loss a thermal cascade late in the run.

## The interface

Ten tabs; trust this over older notes.

| | |
|---|---|
| **Sitting** | the event page, then the decision; the docket (the polls once the writs are out), the calendar, the one indicator panel |
| **Government** | instruments, the register, the document, order-paper time, undertakings, cabinet; the Tribunal and the Presidency at the edge |
| **Chamber** | order-paper time, the order paper, the House, the whip, confidence (the margin), composition |
| **Economy** | the account, the four prices and what sets them, the Reserve Bank and the dollar; a band with the Underwriters, the chart and the productive economy. Nothing scrolls at any measured shape |
| **Party** | the player's own party: its currents, one current, the leadership and the paper |
| **Relations** | every other party by relation, one relationship, who they vote with. The coalition roster is drawn here only |
| **Foreign Affairs** | the globe, what is selected, relevant actors, the forums (tab id `world`) |
| **Orbit**, **Record** | the stations; the record |
| **Sandbox** | the author's bench, from the main menu's Sandbox: every decision, event and lever, shown in the game |
| **Concordance** | the reference work. It knows only what the world knows: bills in `drafting` have no page, and a section may carry `when` |

The long history of each tab is in `LESSONS.md`'s records.

**Party ids** are the initials of old names, so a poor guide to what a party
is called:


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


## Finding things without reading everything

`bible.md` is ~1,700 lines and `textbook.md` ~750. Reading either in full to
answer one question is the most expensive habit available here.

- `bible.md` carries a generated section index at the top, with a line number
  per section. Read the index, then the range: `sed -n '274,296p' bible.md`.
  `npm run toc` rebuilds it; `npm run tocheck` (part of `npm run check`) fails
  if it has gone stale. Never hand-edit the index block.
- `node tools/toc.js --index textbook.md` prints the same thing for the
  textbook without touching the file. Its `## CONTENTS` is in-world prose
  written by Charnock and takes no line numbers.
- Section status is in the index: **LOCKED** is settled canon, **OPEN** is
  genuinely undecided, **LEANING** is a working answer that may move.

Where the answer lives, when it is not obvious:

| Question | Look in |
|---|---|
| what a rule *is* | `bible.md`, via the index |
| what a number *is* | `bible.md` §11 named canon, or the content file itself |
| how it *reads* in-world | `textbook.md` |
| which seats exist, who holds them | `content/constituencies.js` — the roll |
| what a station is | `content/stations.js` |
| what an effect verb does | `js/schema.js`, then `EFFECTS` in `js/engine.js` |
| what is being built now | `sweep-brief.md` |

## Before changing anything

Read the relevant sections of `bible.md`. It is canon and it is long. In
particular:

- **§2.7 generation drift** — the station roster, the person roster and the
  glossary are frozen lists. Do not invent a station, a character or a setting
  term. Add to canon deliberately, in the content files, not in passing.
- **§1.5 engine constraints** — six or seven orthogonal scalars, deterministic
  resolution. **Do not add randomness to event selection.** Determinism is what
  makes balance testable.
- **§2.6 explanation cost** — one concept cluster per event. `tools/lint.js`
  enforces it.

`textbook.md` is in-world and knows nothing about the game. Where it disagrees
with the bible on a number, the bible wins. Where it disagrees on tone, it wins.

## The one architectural rule

**`js/engine.js` names no event, no party, no station.** Content is data in
`content/*.js`, conforming to schemas the engine defines. If you find yourself
editing the engine to add content, stop — the thing you want is a new entry in a
content file, or rarely a new verb in `EFFECTS`/`CONDITIONS` plus a matching
entry in `js/schema.js` so the editor can author it.

Content is `.js` rather than `.json` on purpose: `fetch()` is blocked on
`file://`, `<script src>` is not, so the game opens from disk with no server.

## Run the checks

```
npm install      # once, for jsdom
npm run check    # all thirteen, about two minutes
```

`uxtest` is about seventy seconds of that and `edtest` about twenty-five
(it opens every entry in the editor, design/34); the other eleven take a few
seconds between them. Run one on its own with `npm run <name>`.

| | |
|---|---|
| `test.js` | the ENGINE on the world's content alone: chamber arithmetic against the bible, tier reconciliation, instrument acceptance, 40-sitting smoke test. Plays no campaign |
| `tools/guards.js` | each campaign's own promises, in `content/campaigns/<id>/guards.js`: Flash I's chain, Act, tiers, pivots and canon run |
| `tools/lint.js` | legibility: concept load per event, terms used before taught |
| `tools/cxcheck.js` | Concordance links, see-alsos, banners |
| `tools/roundtrip.js` | the serialiser: serialise → reload → identical play AND identical data |
| `tools/renametest.js` | renaming every id preserves behaviour, and leaves no old id anywhere |
| `tools/edtest.js` | editor boots, every tab works, and opening an entry changes nothing |
| `tools/uitest.js` | menu into a running game, every screen renders, saves round-trip |
| `tools/uxtest.js` | focus, tips, audio, streaming, the division dialog |
| `tools/toc.js --check` | the bible's section index is current |
| `tools/enccheck.js` | every source file is UTF-8, no BOM, LF, no bad decode |
| `tools/prose.js --check` | the prose export round-trips |
| `tools/storymap.js --check` | every view's story map draws (`npm run storymap` writes them to `storymap/`, which is not committed) |

`tools/lint.js` is also where references are checked: every id a gate,
effect, promise, initiative or award names must exist (design/34).

**Run them after any content change.** They are the only playtester this project
has until a human one arrives.

### And one that is not in `check`

```
npm run layout   # needs a real browser; measures what jsdom cannot
```

**Install the narrow face first, or it measures the wrong interface:**

```
apt-get install -y fonts-liberation-sans-narrow
```

`--f-ui` is the terminal's own face and carries every label and table column.
Its stack is `Liberation Sans Narrow, Arial Narrow, Arial, Helvetica,
sans-serif`, and a runner with none of those installed falls all the way to
the generic and measures full-width Liberation Sans — **21.9% wider** than
the author sees (2562.7 against 2101.7 for a fixed test string). Passing
stayed sound, since measuring wide and finding no overflow implies none when
narrow, but the tool was reporting on a different typeface than the game
renders and nothing said so. Every run now prints the face it resolved for
each stack and flags a fallback, so read that block before trusting a width.
Segoe UI, Georgia and Bodoni MT are absent here too and always will be —
those fallbacks are expected, and the narrow one was not.

`tools/laycheck.js` boots the game in headless Chromium, measures the main menu,
walks all ten in-game tabs
and reports content that is **clipped** (the player never sees it) or that
**escapes its own border**. Every CSS trap listed below was found by measuring
rather than reading, and jsdom has no layout engine — `npm run ui` can prove a
panel exists and never that it fits. It is out of `npm run check` deliberately:
the ten there need only node and jsdom, and a check that silently skips when a
runner has no browser reads as coverage and is not. Run it when you touch the
stylesheet or a panel, and before a playtest build.

## Layout

```
index.html            the game
editor.html           the content editor
bible.md              canon, out-of-world. Read this first.
textbook.md           canon, in-world. Charnock's primer.
sweep-brief.md        the current build phase
content/*.js          everything authored: the world's
content/campaigns/<id>/  one campaign's story, one file per kind
js/engine.js          rules. Names nothing concrete.
js/ui.js              game rendering
js/editor.js          the editor
js/schema.js          the content vocabulary, machine-readable
js/refs.js            reference tracking for safe rename
js/coverage.js        what-to-do-next analysis
js/orbitchart.js      the habitat schematic
js/shell.js           main menu, save slots, options, player preferences
js/audio.js           the sound bus. Read its header before adding a cue.
js/focus.js           what survives a re-render: focus, selection, scroll.
                      The only selection store. Read its header first.
js/stream.js          text arriving a character at a time. Never called
                      from a renderer; see its header for why.
js/wait.js            the three ways the terminal says it is thinking.
js/tips.js            what the abbreviations mean. Explains the TERMINAL;
                      defers to the Concordance for the WORLD.
js/artifacts.js       named image slots. Reusable: key on a slot name, not
                      a path, and never make it menu-specific.
tools/harness.js      one jsdom, shared by uitest and uxtest
tools/                checks, index generator, image pipeline, bundle
tools/storymap.js     the story's wiring as a page: `npm run storymap`,
                      then open storymap/index.html. Generated, ignored.
```


## Where the lessons are

Every entry in `LESSONS.md` is a fault that happened. Before touching:

| | read in `LESSONS.md` |
|---|---|
| the engine, content, saves, the campaign's balance or its canon | *Content and state* |
| the stylesheet or any panel's size | *CSS and layout traps* (and run `npm run layout`) |
| rendering, focus, selection, sound, tips, the editor, the harness | *Interface* |
| any file's bytes, or a terminal that shows mojibake | *Text and encoding* (and run `npm run enc`) |
| the dialogs, the Concordance, the tabs, the party renames, the date sweep | *Records* |

## Authoring

See `CONTENT_GUIDE.md`. The short version: copy an existing entry in
`content/events.js` and change it. Effects and conditions are a closed
vocabulary — if it grows past about twenty verbs, content is leaking into the
engine.
