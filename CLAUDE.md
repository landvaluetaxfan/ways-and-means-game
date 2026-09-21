# Working on this repo

A text-based narrative political thriller with real electoral mechanics, set in a
federated republic of orbital habitats. No build step, no framework, no bundler.
Open `index.html` in a browser to play, `editor.html` to author.

## HANDOFF — opencode, 11 Sep 2026 (dialogs, Concordance offices, chamber)

opencode worked on `main` at the author's direction and touched files outside its
usual lane. **Read this before editing `js/` or `content/encyclopedia.js`.** The
two features are in `git log` as *"Replace the browser's dialogs with the
terminal's own"* and *"Derive Concordance offices and party leaders from the
cabinet"*, both pushed.

**Native dialogs are gone.** New `js/dialog.js` draws `alert`/`confirm`/`prompt`
in the terminal's own chrome and answers through callbacks, not promises:

```
Dialog.alert(msg, opts?, done?)        done()
Dialog.confirm(msg, opts?, answer?)    answer(true|false)
Dialog.prompt(msg, opts?, answer?)     answer(string|null)
```

Every call site in `js/shell.js`, `js/ui.js` and `js/editor.js` now uses it; the
host is `#dlgdlg` and the CSS is `.dlg-*` in `terminal.css`. **The test harnesses
answer it through the same callbacks** (`tools/harness.js`, `tools/edtest.js`
override `Dialog.confirm/prompt/alert`), so if you change the signature you must
change those too or `npm run ui`/`ux`/`editor` stop booting. A dev-only check for
the module itself was left in `%TEMP%\opencode\dlgtest.js`, not in the repo.

**The Concordance derives offices now.** `js/encyclopedia.js` reads who holds
what from `C.cabinet` and `C.parties[].leader` (`officesOf`/`mainOffice`/
`officeLine`) instead of trusting a typed `role`. Person articles gained a
wikibox (Party / Seat / **Offices held**); the lede follows the office. Party
articles gained Leader + Leader's office + a Leadership section. Infobox rows
support a section header as `["", "Offices held", "head"]`. `js/refs.js`
`characterRefs` now follows `cabinet[].holder` and `parties[].leader`, so a
rename reaches both.

**New content fields to know about:** `parties[].leader` (a character id; `null`
for `ind`) and `cabinet[].title` (the *minister's* title, e.g. "Treasurer" or
"Leader of the House", distinct from the ministry `name`). The editor does not
expose either yet but serialises them unchanged.

**Content corrections made in the same pass:** Marin is Minister for Persons and
Continuity again (Abadi keeps `fc_medicine`, backbench); Anselm Ring's
composition was rebalanced so the population-weighted composition is the bible's
64/28/4/4; and stale facts in `content/encyclopedia.js` were fixed (station
count, functional-electorate range, the full cabinet ministry list, "two
Congregational Democratic Alliance Ministers", a doubled "the").

**Both inconsistencies that were open here are now closed** (checked 20 Sep 2026,
by measuring rather than by reading a commit message): `content/labour.js`
`embodied` weights to **46.1%** of jobs against bible §6.10's **46%**, and both
population figures are **7,086,000**. Leaving the paragraph as a record that they
were real, and that content fixed them.

**Also landed since that handoff:** row selection is now the gold tint in every
table (`.sel` was the dark inverted block; the `#cons-table` override is gone and
`tools/uxtest.js` was updated to match); a member-table tooltip widens to 360px
(`#tipcard.wide`) so a full office title fits on one line; and three Liberal
functional-seat MPs now hold shadow briefs — Quintana/Substrate, Ijaz/Transit,
Estévez/Anchors — with Otrione, Caillet and Nadeau backbenched. `js/ui.js` gained
`officeText()` for the full office in the functional tooltip.

**More since:** Gecko gets a drawn scrollbar (`decorateScrollers()` in `js/ui.js`
wraps `.p-cons`/`.p-doss` bodies in `.sbwrap` and appends `.sbar`; WebKit/Blink
keep their native bar — the check is `CSS.supports("selector(::-webkit-scrollbar)")`);
the whip's `MOVE` column is a segmented `.whipbar` (one block per whippable seat),
not a range input; and the orbit tab dropped the `p-cond` panel — the constituency
dossier is now an expandable `.consdet` row inside `#cons-table` (`consOpen` state,
`constituencyDetail()`), with `p-doss` spanning the full right column. Next up,
per the author: constituency prose (description, voting tendencies) in the expanded
row, then a capital designation.

**The capital is in:** `content/stations.js` has `winter_garden` (The Winter
Garden, ring band, 80k, one seat) and `content/constituencies.js` has
`capital_territory` (Capital Territory, `at_large`, `nonVoting: true`). The engine
reads `nonVoting`: `seedRoll`/`reconcile` carry the flag into the roll, and
`syncRoll`, `partyDistrict`, `vacantSeats`, `tierCheck`, `apportionment` and
`generalElection` all skip it, so the seat has a member and a page but sits outside
the 140-seat tier, the 280 chamber and every division. `test.js` was updated
(141 constituencies, 140 voting; station seats 141) and the `commonwealth` article's
station count moved to thirty. One fiction wrinkle left: the capital's electorate
(49,200) is excluded from the district-roll sum in `test.js`, so its adults are not
inside the bible's 4,149,803 and the districts were not rebalanced.

**Do not commit** the untracked root duplicates (`events.js`, `glossary.js`,
`lint.js`, `encyclopedia_content.js`, `encyclopedia_renderer.js`, `js/codex.js`)
or the `tools/dither.sh` mode change — they are pre-existing and left alone.

## CLOSED — the divergent branch is reconciled (21 Sep 2026)

`opencode/party-rename-and-economy` was a line of work committed from a stale
clone and left unrebased for eleven days. **It is landed.** Nothing is owed on
that branch and it can be deleted; the one commit that carried content was
`fee015a`, and what came across is below. Its engine half was written against
`STATE_VERSION 5` against today's 26, so it was cherry-picked rather than
merged, and **the party rename and the `gb` split were dropped** because both
were already here — which is what the old version of this section instructed.

**The four categorical axes are now five signed ones.** `ownership` became
`economic` and `closure` became `trade` (a signed axis needs a name that reads
in both directions — "ownership −0.75" says nothing), `authority` is new, and
positions are numbers from −1 to +1. Bible §8.1 is rewritten for it.

- **`null` is not zero, and the distinction is load-bearing.** Zero is the
  centre and a position content took; `null` is no position at all. Converting
  the sixteen currents, a near-zero number was written where the old value was
  `null` — and the canon forecast moved from 130 to 131, because six
  independents who had no view on personhood had been given a faint one.
  Restoring the nulls restored the number. `test.js` asserts 130.
- **Agreement is the cosine over the shared axes**, not `1 - |a - b|` as on the
  branch. That formula is biased: two positions on −1..+1 sit 0.67 apart on
  average, so it scores the mean party-bill pair at +0.412 where the old
  categorical scoring scored 0, and `inferStance` and the whip bands both cut
  at ±0.25 on the old basis. `a * b` centres correctly but compresses. Cosine
  centres at +0.064 and does not compress. §8.1 carries the table.
- **The engine still names no axis**, deliberately against the branch, which
  introduced `const AXES = [...]`. The dimensions are whatever a party and a
  bill both declare. `js/schema.js` holds the names and the poles, and
  **`index.html` now loads `js/schema.js`** so the interface can draw
  "strongly public" instead of "−0.75" without a second copy of the poles.

**§7.10 the productive economy is in**, at `STATE_VERSION 26`:
`st.economy = {participation, trade, private}`, an `economy` effect verb,
`economyAbove`/`economyBelow`, and `economyHistory` on the same sixty-sitting
window as the prices. Opening figures are in `content/setup.js`, not the
engine. `private` is authored and never drifts, so it keeps no curve.
Participation moves on the divergence threshold: cut it to forty hours and
participation goes 39 → **49.2** over twenty-six sittings against **40.1** if
it is left alone, and `test.js` asserts both so the canon cannot rot.

`ROADMAP.md` and `AUTHORING_FORMAT.md` came across too, each with a header
saying what in it is out of date — the roadmap was written against a nine-tab
interface that still had **Papers**.

**The party table is still a useful record**, since the ids are the initials of
the pre-rename names and are therefore a poor guide to what a party is called:

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

Three were renamed again on 14 Sep 2026 under bible §8.3's rule that a party
names itself for who it is and not for what it opposes: `fh` was the *Party of
Property Owners*, which is what a tax form calls them; `rv` was the *Democratic
Centre*, which described neither their economics nor their faith; `upl` was
*Common Kind*, a good phrase that identified nobody. Read
`content/parties.js`.

## THE TABS, AS OF 20 SEPTEMBER 2026

Nine, and the arrangement is younger than most of this file, so trust this
list over any older sentence here that implies a different one:

| | |
|---|---|
| **Sitting** | the event, the docket, the calendar, and the one indicator panel |
| **Government** | instruments · the document · what it can do · the ledger and cabinet, with the Tribunal and the Presidency folded at the edge |
| **Chamber** | order-paper time, the order paper, the House, the whip, and who is counted |
| **Economy** | the treasury, ways and means, the productive economy (§7.10), the prices and the law that sets them, the Underwriters' outlook, labour, and one chart anything above can be picked into |
| **Party** | *renamed from Parties, and refocused 21 Sep.* The twelve grouped by their relation to the government — in government, confidence and supply, outside — with the per-partner ledger, what each bench can be moved on, ideological distance, the live measure they will not carry, their currents, every member, and the party outside Parliament |
| **Orbit**, **World**, **Concordance**, **Record** | unchanged |

**Papers is gone**, folded into Government — an instrument, the register it
lands in, the court that can quash it and the office that assents to it are one
subject. Nothing named `pap` survives; `js/engine.js` used to emit `tab:"pap"`
targets and now emits `"gov"`.

**The indicator panel is on the Sitting screen and there is only one.** It used
to be drawn on Government and copied here by a `MutationObserver`. Do not
reintroduce the copy.

**THE COALITION ROSTER IS DRAWN THREE TIMES AND SHOULD NOT BE.** Measured 21
Sep, and recorded here because the third one is mine: Chamber's *Coalition*
(`#gov-coalition`) draws party/seats/loyalty, Government's *Coalition ledger*
(`#gov-ledger`) draws partner/ledger/loyalty, and the refocused Party tab
(`#party-table`) draws all four columns for all twelve parties grouped by
relation — so it strictly contains both of the others. Each has a local
excuse (Chamber's sits beside the margin, which is what Chamber needs;
Government's sits beside Undertakings), but the roster itself now has one
proper home. Before adding a fourth, read this.

Three things worth knowing before you touch the engine:

- `Engine.receipts(st)` is the revenue side of the budget (bible §7.3), and
  `tick()` is the only place in the engine that ADDS to `solvency`. Everything
  else that touches it is a content effect spending it.
- `Engine.benchRoll(st, C)` seats the whole House without a division. It is the
  first half of `rollCall` lifted out; do not write a second way to seat it.
- `CONTENT.partyOrg` is the party outside Parliament. Officers are deliberately
  NOT in `content/characters.js` — they hold no seat — but `namesTaken` reads
  them so the list-tier name generator cannot reuse one.

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
npm run check    # all ten, about three seconds
```

| | |
|---|---|
| `test.js` | chamber arithmetic against the bible, tier reconciliation, instrument acceptance, 40-sitting smoke test |
| `tools/lint.js` | legibility: concept load per event, terms used before taught |
| `tools/cxcheck.js` | Concordance links, see-alsos, banners |
| `tools/roundtrip.js` | editor fidelity: serialise → reload → identical play |
| `tools/renametest.js` | renaming an id preserves behaviour exactly |
| `tools/edtest.js` | editor boots and every tab works |
| `tools/uitest.js` | menu into a running game, every screen renders, saves round-trip |
| `tools/uxtest.js` | focus, tips, audio, streaming, the division dialog |
| `tools/toc.js --check` | the bible's section index is current |
| `tools/enccheck.js` | every source file is UTF-8, no BOM, LF, no bad decode |

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
walks all eight in-game tabs
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
content/*.js          everything authored
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
```

## Things that have already gone wrong

One line each, kept because they will otherwise happen again. The long
version of any of them is in the header of the file it names.

**Content and state**

- `payWhips` clears the plan, so a caller that divided afterwards charged for
  nothing. Always use `Engine.divide()`.
- `apportionment_ratio` was stored beside seats and population and the three
  diverged. Derived, never stored.
- The district tier summed to 56 while parties held 140. `test.js` reconciles
  both directions.
- Bump `STATE_VERSION` when the state shape changes, and write the migration
  guard ASCENDING, one block per bump — a descending guard let a v1 save match
  `< 4`, get stamped 4, and skip every earlier block.
- Content owns identity (name, band, form, seats); the save owns simulation
  (closure, suspended, attested). `Engine.reconcile()` runs on every load
  because a new station used to leave older saves with a hole in `st.stations`.
- Player preferences go in `Shell.opts`; world state goes in the save. Mute in
  a save file silences somebody else's machine on import.
- `CONTENT.encyclopedia` is an object — `meta`, `banners`, `articles` — not a
  list.

**CSS and layout traps, every one found by measuring rather than reading**

- An id outranks `.screen{display:none}`, so `#s-orb.screen{display:block}` put
  the habitat map on every tab at once. Any rule whose subject is a `#s-…`
  screen must include `.on`.
- Setting `scrollbar-color` or `scrollbar-width` makes Chromium silently ignore
  every `::-webkit-scrollbar` rule for that element. The standard properties are
  fenced behind `@supports not selector(::-webkit-scrollbar)`.
- `overflow-x:auto` forces `overflow-y:auto` too. Anything that scrolls in one
  axis says so in both.
- An inline `<svg>` with a viewBox and no width fills its container, so
  shrinking the coordinate space only magnifies the drawing.
- A class named for an appearance gets borrowed for anything wanting that
  appearance: `.sel` came to mean four things at once. It now means selection
  only; `.warn`, `.inforce`, `.vacant` and the editor's `.here` say what they
  mean, and differ in form as well as hue.
- The same trap from the other side: reusing an EXISTING component's class
  name for a new component. The main menu's ticker was nested in `.ticker`,
  whose `.ticker div` rule sets `padding-left:100%`, so every headline was
  pushed exactly one screen right and off the edge — rendering correctly,
  present in the DOM, invisible. Found by measuring: a span at x=1195 in a
  container ending at x=1195. Check whether a class exists before taking it.
- A fix for a column that must FIT is a bug in a column that SCROLLS. `.panel`
  carries `min-height:0` and `overflow:hidden` so it shrinks-and-clips instead
  of painting over its neighbour — correct in a grid row, wrong inside
  `#s-gov .stack`, which scrolls: the panels gave up their height to the column
  and then clipped what no longer fit. Undertakings measured 14px of content
  cut off inside a 14px box. Panels in a scrolling column are `flex:0 0 auto`.
- `.panel` clipping is only safe because "every `.pbody` is a scroller" — and
  `.pbody` carried no flex sizing, so it kept its content height as its basis
  and the PANEL clipped instead of the BODY scrolling. The content became
  unreachable, which is the one outcome that construction exists to prevent.
  `.panel > .pbody.scrolls` is `flex:1 1 auto;min-height:0`.
- `npm run layout` measures all of the above. It also learned not to cry wolf:
  `scrollHeight` counts absolutely positioned children, and this interface
  hangs things proud on purpose (the dual-majority threshold tick sits at
  `top:-2px`), so a fault is confirmed against IN-FLOW children only.

**Interface**

- Renderers replace containers wholesale, so focus falls to `document.body` on
  every state change. `js/focus.js` restores it by DATA KEY, never by index, and
  owns the only selection store — selection used to live in four places and the
  order paper hardcoded its highlight as a result.
- `.focus()` scrolls its target into view and will undo a scroll restore
  standing next to it. Restore with `{preventScroll:true}`, scroll after, and
  `scrollIntoView` only on a move the player asked for.
- Two listeners for one action is not twice as safe: `[data-go]` was bound in
  both `js/ui.js` and `js/encyclopedia.js` and every click rendered twice,
  invisibly. A keyboard path reaches the existing handler (`el.click()`).
- Sound comes from engine effects and user actions ONLY — never from `drawAll()`
  or anything reachable from it. Streaming text obeys this too: the renderer
  puts the finished text up silently and the ACTION HANDLERS reveal it.
- A division resolves on the click, before its dialog opens. That is what makes
  skipping safe and "muted reaches the same state" testable.
- Blanking text to type it out collapses the block; measure and hold the height.
- `js/tips.js` explains the TERMINAL; the Concordance and glossary explain the
  WORLD, and a tip with no body falls through to them, so nothing restates canon
  (§2.7). `?` is the keyboard trade: annotated readouts enter the tab order on
  the visible screen only. The Concordance screen itself carries no annotations
  on purpose — it is not government chrome, and it is where tips send you.
  `tools/uxtest.js` asserts an explanation nobody anchors is a failure, because
  it reads as coverage and is not.
- There is NO ASSET LOADING and cannot easily be: on `file://`, `fetch()` and
  `XMLHttpRequest` both fail. Base64 in a `.js` file through `atob` into
  `decodeAudioData` is the route that works.

**Text and encoding**

- A console that misreads UTF-8 will talk you into corrupting a file. PowerShell
  5.1 printed a correct em dash as the three characters U+00E2 U+20AC U+201D;
  the `Set-Content` "fix" for that phantom wrote the mojibake in for real, with
  a BOM, and `js/ui.js` shipped with `TONE_MARK`'s `−` and `·` expanded into
  that wreckage — so the live dossier printed it between every field. Never
  judge bytes by what a terminal drew. `npm run enc` is the only verdict.
  (This file names the damage by code point on purpose: prose that spells it
  out literally IS mojibake, and trips the check it is trying to explain.)
- The obvious test for that corruption is wrong, which is how it shipped after
  being verified: a scan for `Ã` in DECODED text finds nothing, because
  double-encoded UTF-8 decodes to `Â`. `Ã` is the raw-byte spelling. So
  `tools/enccheck.js` reverses the damage rather than matching it — a run is
  mojibake iff re-encoding it as CP1252 yields one valid non-ASCII character —
  and the reversal is also the repair. It works per RUN, not per file, because
  `js/ui.js` was only partly mangled and a whole-file reversal would have
  destroyed what was still right.

Every one of these is asserted somewhere in `npm run check`. Three of the checks
exist because of a specific miss: `tools/edtest.js` because a form function was
referenced in the editor and never defined, `tools/uitest.js` because a blank
screen is invisible to every static check, and `tools/enccheck.js` because
mojibake is invisible to a reviewer reading the same broken console.

## Authoring

See `CONTENT_GUIDE.md`. The short version: copy an existing entry in
`content/events.js` and change it. Effects and conditions are a closed
vocabulary — if it grows past about twenty verbs, content is leaking into the
engine.
