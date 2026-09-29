# Lessons

Every entry here is a fault this project has already made, reduced to the
rule that prevents it. Read the section for the area you are about to touch.
The full stories are in git history (`git log -p -- LESSONS.md`, before 28
Sep 2026) and in the design notes cited.

## Engine and state

- **One writer for each thing.**
  - `bumpScalar` for a scalar: solvency has no ceiling, the rest clamp to
    0–100.
  - `shiftLoyalty` for loyalty. A party with currents stores only its
    currents; its own figure and the Party loyalty meter are their
    member-weighted mean.
  - `Engine.divide()` for a division (`payWhips` clears the plan, so dividing
    after it charges for nothing).
  - `Engine.benchRoll` to seat the House.
  - `Engine.money` (`cw()` in the interface) to print money.
- **Derive a figure you can compute; never store it.** A stored
  `apportionment_ratio` drifted from the seats and population it came from.
- **The engine is one closure, and function declarations hoist.** A second
  `function drift` silently replaced the first everywhere. Run
  `grep -n "function <name>"` before naming a function.
- **A flag set and never read is a mechanic somebody started; a name read and
  never written is a feature that isn't there.**
  - Affirmative orders were laid and paid for, and could never be approved.
  - The Party tab read `st.loyalty`, which does not exist.

  Grep for the readers the day you write a field, and for its writer the day
  you read one.
- **State.**
  - Bump `STATE_VERSION` when the state's shape changes, with migration
    guards ascending, one block per bump. A descending guard let a v1 save
    skip every earlier block.
  - Content owns identity; the save owns simulation. `Engine.reconcile()`
    runs on every load.
  - Player preferences go in `Shell.opts`, never the save.
- **An effect that refuses returns `{ok:false}`, and effects discard results.**
  A `cabinet` effect naming no post did nothing and printed success.
  `test.js` resolves every `cabinet` effect against the posts; a new verb
  that can refuse needs the same.
- **An event's own `effects` apply first, then the choice's** (`choose()`).
  For a while nothing applied them.
- **One calendar.**
  - A session is three sitting periods of sixteen. A recess refills
    order-paper time and ends nothing. Bills fall, and promises owed "before
    the House rises" come due, at the session's last rise.
  - `walkSittings()` is the only calendar; `recessDays` moves only dates.
  - A Bank meeting is a date, not a sitting: read `date` from the deadline
    mark.
- **The run's shape** (`design/32`).
  - The election ends the run. The count is taken by `count()` at the end of
    the campaign, never in `dissolve()`.
  - After dissolution only the physical ends a run: a thermal cascade
    during the campaign is a loss.
- **The economy runs by the calendar** (`design/39`).
  - Every flow is a yearly rate charged by the day, and the unit is the
    million dollars.
  - A payment the reserve cannot meet becomes Treasury bills, up to the
    authority, and then arrears, which cost.
  - Every constant is content's: `setup.fiscal`, `macro`, `priceRules`,
    `economyRules`, `lenders`, `couplings` and `alerts`. The engine names no
    price and no lender.
  - A lender with a `currency` is owed in it: `debtOf` gives the lender's
    own money, `debtHome` converts.
- **Couplings apply their highest line per `group`**, not across all of
  them.
- **Settlements have two channels.**
  - `crisis:true` lands in `resolvedAs` once; the rest land in
    `settledAs`.
  - `settled` and `resolved` take an id or a boolean.
  - A settlement is recorded; it does not interrupt play.
- **Standing fades toward 45** (`setup.standingDrift`), so free standing
  early is worth little.
- **A lost majority is a motion, not a verdict**: `thresholds.partnerLeaves`,
  `partnerReturns`, `motionAfter`.
- **The event pool.**
  - Selection is deterministic, apart from the seeded `perSitting` roll kept
    in `st.rolledToday`.
  - The pool offers one event a sitting.
  - The seeded lean is keyed on an event's position, so new events go at
    the END and cut ones are archived in `content/archive/cut-events.js`.
  - Aging is off (`ageWeight: 0`); Question Time does its job.
- **Play a sitting with `Engine.playSitting`.** A loop that calls
  `nextEvent` once a sitting skips the decision after an event.
- **Build a campaign's view once and use it everywhere.** Take
  `CONTENT.forCampaign(admin)` and hand that same view to every engine call.
  Mixing it with raw content once put the calendar 207 years out.

## Content and balance

- **Judge a content edit across 80 seeds** (`node tools/playtest.js --seeds
  80`). One seed is an anecdote, and differences under about five runs in
  eighty are the reshuffle.
- **Test a new gate against the opening state**, as well as the state it
  wants: `Engine.matches(newGame(C), when)`. Standing opens at 44, so a gate
  of "below 46" was true from the first sitting.
- **Before adding an event to chapter two, ask what it displaces.** The pool
  is saturated: about twenty events are eligible, at a median weight of 70.
  Above about 75 a new event takes a sitting from the crisis; below it, the
  event rarely fires. Queue it from the choice that makes it true instead.
- **Friction is a knife edge in an annexing run**, because it feeds the
  thermal drain. Try a new consequence as legitimacy first.
- **Chapter budgets are in bible §1.7**: 12–15, 23–28 and 6–8 events. Size a
  round of content against its chapter.
- **A choice appended to an event moves every strategy that picks by
  position.** Only the canon script's named picks are stable.
- **Order-paper time and orders.**
  - Reserved time (`{slots:{reserve:{bill:n}}}`) is spent only by its bill,
    and it goes at the rise.
  - An instrument's `approvalFloor` holds a government bench on approval
    whatever its loyalty.
- **The bible copies content, and the copies rot.** Where the bible restates
  a roster or a count, content owns it.
- **Prose outlives renames.** Lint fails the words of an old id in prose, and
  a constituency figure written out. Seat prose uses `{electorate}`,
  `{ratio}`, `{represented}` and `{member}` (`PROSE.md`).
- **Run `npm run prose` after a hand edit to content**, or the next
  `prose:in` reverts the edit.

## Campaigns

- **A campaign is a folder of `campaign("<id>", {...})` calls.** Play through
  `CONTENT.forCampaign(admin)`, never raw `CONTENT`.
- **Engine tests and campaign tests are separate.** `test.js` tests the
  engine on the world's view; a campaign's story is asserted in its own
  `guards.js`. A sweep for well-formedness must read every view
  (`T.views()`), not only the world's.
- **With one campaign, a cross-campaign check is vacuous.** Lint checks that
  no campaign can see an entry naming another campaign's id; that check was
  proved with a probe campaign.
- **`content/setup.js` is hand-edited on purpose.** Its comments document
  every setting, and it defines `campaign()`. A campaign changes setup
  through its administration record.

## Checks and tools

- **Before trusting a check, break its subject and watch it fail.** These
  all passed faults for weeks:
  - a rename test that asked `refs.js` whether `refs.js` had missed
    anything;
  - a round trip that compared play, not data;
  - an assertion of the form `x ? true : true`.
- **An OR in an assertion is two checks**; break each one. A check that
  reads a retired class passes by its other branch.
- **A tool that sets state can mask a missing setter.** The flag audit
  counted a developer console's effects as real.
- **A field read by a name the data does not use falls back silently.** The
  playtest read `r.carries` and `.text` for data that uses `result.carries`
  and `label`.
- **The harness runs exactly the scripts `index.html` runs**, taking the list
  from the page. A top-level `const` does not cross jsdom's separate script
  evaluations, so a module assigns to `window` explicitly.
- **jsdom applies no stylesheet.** A page no check has looked at is a page
  nobody knows draws: `npm run layout` measures the game and the editor in
  Chromium. Also, jsdom's `HTMLAnchorElement.click()` does not dispatch; use
  a `MouseEvent`.
- **The engine and `js/schema.js` must list the same verbs**, and `test.js`
  fails when they differ. A new verb goes in both, and in the editor.
- **The editor edits a clone of its entry.** A form that cannot draw a field
  must still carry it: `edtest` opens every entry and requires nothing to
  change.

## Interface

- **A number the interface prints is content's number.** The status bar once
  read `SIGNATURES n/9` against a threshold of 12.
- **Focus.** Renderers replace containers wholesale, so `js/focus.js`
  restores focus and selection by data key, and owns the only selection
  store. Call `.focus({preventScroll:true})`, then scroll.
- **Sound** comes from engine effects and user actions only, never from
  `drawAll()`. Streaming text obeys the same rule.
- **A division resolves on the click**, before its dialog opens.
- **Blanking text to type it out collapses the block**, so hold its height.
- **Tips and lore.** `js/tips.js` explains the terminal; the Concordance and
  the glossary explain the world.
- **One listener for each action.** `data-go` serves both the menu and the
  Concordance, so its handler is scoped to `#shell`.
- **A truthy guard around a missing function is silence.** A container's
  only child is not the container.
- **Two predicates and a legend.** A predicate and its negation are not
  always the only two cases. A hidden legend is not an explained one.
- **There is no asset loading on `file://`.** Put base64 in a `.js` file.
- **When a panel is merged or renamed**, grep the stylesheet for its id, and
  the `.md` files for its name.
- **A merge inherits every source's growth.** "What has happened" folds the
  wire and the record into one feed, and it renders all of `st.wire` and all
  of `st.log` (`js/ui.js:2920`) on every `drawAll()`. Neither array is
  capped in the engine, because every write to either is an unshift, and the
  two panels it replaced were capped at 16 and 40. A campaign is now a whole
  Parliament long, so cap the merge or memoise it on a length key.
- **A flag nothing reads becomes a visible bug.** `chapterMark`
  (`js/engine.js:4873`) marks a chapter break in `st.log` and has never been
  read. The Record table swallowed it; the merged feed prints it as
  `Decision. - Chapter 3 -`, which reads as a decision that happened. Wire it
  up as a group header, or drop the flag.
- **A folded tab goes stale in the documents too.** `AGENTS.md` kept saying
  ten tabs and kept listing Record, in the same commit that folded it, and
  `bible.md` §12.4 "Screens — LOCKED" still enumerates ten including Record.
  LOCKED is the author's to reissue; nothing else waits on it.
- **Moving a panel carries its affordances with it.** The Record panel's
  playtest transcript had a note saying what the textarea was for, a Select
  all button, and a `try/catch` on the Blob download. The Options popover
  kept the textarea and the button and lost the rest. The move was asked for
  (design/64, answer 15); the guidance was not, and a tester is what it is
  for.

## CSS and layout (run `npm run layout`)

- **Screens.** A rule whose subject is a `#s-…` screen must include `.on`,
  because an id outranks `.screen{display:none}`.
- **Scrollbars.** Setting `scrollbar-color` or `scrollbar-width` makes
  Chromium ignore `::-webkit-scrollbar`. Fence the standard properties behind
  `@supports not selector(::-webkit-scrollbar)`.
- **Overflow.** `overflow-x:auto` forces `overflow-y:auto`, so state both.
- **SVG.** An inline `<svg>` with a viewBox and no width fills its
  container.
- **Classes.** A class names a meaning, not an appearance. Check a class
  name is free before taking it: `.ticker div` pushed the menu's ticker off
  screen.
- **Panels.**
  - Panels in a scrolling column are `flex:0 0 auto`.
  - `.panel > .pbody.scrolls` is `flex:1 1 auto; min-height:0`.
  - Every `.pbody` keeps `scrolls`: no scrollbars is a matter of fitting.
- **A column that scrolls is a column whose contents were never sized.**
  Measure what the content needs by summing its in-flow children, not the
  box. Place panels in named grid cells.
- **Rows** go `auto`, then `1fr`.
- **A heading that gains a control** needs its own `flex-wrap`.
- **Bars.** `flex:1 1 0` bars need a `max-width`.
- **laycheck** confirms a fault against in-flow children only.

## Text and encoding

- **Never judge bytes by what a terminal drew.** PowerShell 5.1 shows UTF-8
  as mojibake, and its `Set-Content` "fix" then writes the mojibake in, with
  a BOM. Read and write source with node or the editor tools.
- **`npm run enc` is the only verdict.** It reverses the damage run by run
  rather than pattern-matching it: a scan of decoded text for `Ã` finds
  nothing.
