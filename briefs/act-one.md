**Lane: Claude Code writes and reviews; Codex builds the engine items; opencode runs
mechanical steps.** Written 7 October 2026 on the author's decision in `design/80`. The
reasons are there. This file is the plan and the exit gate.

# Act I, built whole

**STATUS: stage 0 done (the record and this plan). Nothing else started.**

The playable game is Act I, sittings 1 to 16, closing on the rise. Every word a player reads is
rewritten, scoped to what Act I has introduced, and built one sitting at a time. The author
reviews afterwards. The build is for playtesting, for setting up the tutorial and for refining
the mechanics. It is not a demo of a game that is nearly there, so the exit gate below is
the definition of done, and `npm run check` alone is not.

## Scope

**Retired and rewritten:** event pages, decisions, choices, notes, results, the wire; bills,
orders and initiatives (titles, summaries, effect notes); characters, parties, stations,
districts; the glossary, tooltips and tutorial text; the Concordance's articles and
templates; the textbook. Retired text goes to `content/archive/`, never deleted.

**Kept as data:** seats, costs, the economy's constants, the engine, the schema. They are
tuned. The playtest checks them.

**Not in this build:** Act II onward, the election and the canon count, the signing window
for orders (parked, `design/71`), the signature art, the Foreign Affairs friction desk, the
UI passes in `briefs/ui-tabs.md`. They stay on their own briefs.

## Method: one sitting at a time

Not layer by layer. A **slice** is one sitting with everything it brings in, and it is done
when:

1. its scene is written to the scene contract below and passes lint and `npm run register`;
2. every bill, order, initiative, person, station and term it introduces has its entry
   written and no other entry is visible yet;
3. its Concordance and glossary entries exist, scoped to what the world knows by then;
4. its tutorial card exists, if it teaches a lever, and the lever is inert before it;
5. a guard asserts what it promises, and a test plays the slice;
6. I have played it through the harness as a first-time player, and the confusion log for it
   is empty.

Order: sittings 1 to 4 first (drafted in the Claude Doc, and the author has marked 1 to 3),
then the rest of the outline in the doc: the treaty beat, the five clause scenes, the whips'
count, the division, Question Time, the Underwriters' reading, the rise. A slice that
exposes a fault in an earlier one reopens the earlier one.

## The introduction ledger (stage 1 fills it)

One row per sitting. The columns are the contract between scenes: what is **first met**
there (terms, bills, orders, people, stations, tabs), and which control **opens**. A term
used before its row fails lint. An entity shown before its row fails the visibility test.

| sitting | beat | first met | opens |
|---|---|---|---|
| 1 | the commission | the Charter, a majority, confidence | nothing |
| 2 | the first question | the currents, loyalty | nothing |
| 3 | who holds the Treasury | orders, initiatives, collective responsibility, the ballot, the estimates, the rise | appoint (the Treasury) |
| 4 | the draft estimates, the order paper | the order paper, stage, slot, order-paper time | grant order-paper time |
| 5 to 16 | per the outline in the Claude Doc | to be written in stage 1 | to be written in stage 1 |

## Three faults the author found by playing the old build (7 October)

The author played to Act II and reported: no bill was ever moved to a division, nothing said
when to; the Divergence Threshold bill fell in an Act II decision with no vote, no animation
and no reason to leave the Sitting tab; and changes that land in other tabs are not clear.
Cause, found in `ch2_carveout_price`: the choice writes `bill:{divergence:{stage:"defeated"}}`
straight onto the bill, and its result text narrates a division the engine never ran. This
is the decision-versus-lever seam again, from the other side. The rules that follow:

1. **Only a division decides a bill.** The terminal stages (`passed`, `defeated`,
   `withdrawn`, `assented`) are written by `Engine.divide()` and the assent path alone
   (`AGENTS.md`, one writer for each thing). Content may move votes (loyalty, a bargain, a
   promise) and may **call** a division. It may not announce a result. Lint fails a `bill`
   effect that writes a terminal stage.
2. **The story brings the division.** When a measure reaches third reading, or the whips'
   count says it is ready, a scene asks the player (call it now, wait for the count, pull the
   measure), and the vote runs on screen with its result page. The Chamber's control stays
   as the free route to the same division. The first division is taught by a card. Across
   Act I the player is asked to call the Appropriation's division at least twice before the
   rise, so that nobody reaches the rise without having seen one. The ledger fixes the
   sittings.
3. **No silent change.** Every effect that changes something shown in another tab produces a
   notice on the Sitting tab, using the existing card animation (`js/motion.js`), naming the
   tab and the item, and clicking it opens the item there. The engine's effects return what
   they changed and where; an effect with no target fails lint. A bill's fate, an order made
   or revoked, a post filled, a promise written, money drawn, a station's state: each has one.
   The author's idea of animating the undertaking window opening, being written in and
   closing is too large; the card names what was written, and that is the standard.

## The scene contract

Every scene, whoever writes it:

1. **It declares its premise** (`needs`, the same vocabulary as `when`). A scene whose premise
   is false does not fire, or fires its "already done" variant.
2. **A lever the scene's choices write is guarded.** Appointing refuses a filled post, and a
   bill moves stages forward only. The scene has an "already done" branch.
3. **A choice that announces an intention creates a promise** (`undertake`, owed to someone,
   with a limit and a discharge), so the player's levers keep or break it. A flag that nothing
   reads is a fault.
4. **No typed live figure.** Figures that are constants of the setup are printed from it. The
   rest are written as ranges the state cannot leave, or not at all.
5. **One concept chain a page**, introduced before it is used, by the narration. A
   character never states what the narration or the listener already has.
6. **Choices are about things the player already understands.** The first choice a concept
   appears in is made after the page that introduced it.
7. **PROSE.md** in full, and the explanation pass's rules.

## Engine items (Codex, from this brief)

Each needs a design check with me before it starts. All touch files the existing claims hold
(`witnessed-acts`: `js/engine.js`, `js/schema.js`, `js/editor.js`, `js/ui.js`, `test.js`;
`ui-tabs`: `index.html`, `js/ui.js`, `css/terminal.css`), so they wait for those claims to
release or are sequenced with them.

- **E1 The curtain.** A carried rise ends the run on a content-supplied page (`act_end`). A
  lost rise is the existing supply loss. Nothing after it runs.
- **E2 The introduced record.** Scenes, wire items and events name what they introduce; the
  save records it; every list the player sees (bills, orders, stations, people, Concordance)
  filters by it. `STATE_VERSION` bump with a migration guard.
- **E3 The tutorial and the lever ladder** (`design/77`, plus this ladder). Cards that dim and
  block the pointer outside one region. Writing controls inert until taught, dimmed with one
  line saying when they open, a ratchet that only opens. The player's taught record lives in
  `Shell.opts`, not in the save, so a second campaign does not teach again.
- **E4 Guarded writers.** `cabinet` refuses to overwrite a filled post unless the effect says
  so. `bill` moves forward only. A refused write logs a line, as a bad id already does.
- **E5 Setup constants in text.** `{{setup.slotsPerPeriod}}`-style placeholders, resolved when
  the page is shown, resolved statically by lint, stored rendered in the log, round-tripped by
  the prose file and the editor. Constants only.
- **E6 `needs` and `touches` in the schema, and the lint rule** for the scene contract.
- **E7 The fidget strategy** in `tools/playtest.js`, and the visibility, first-use and scene
  checks below as `tools/` checks, each break-tested.
- **E8 Calling a division from content.** An effect that runs `Engine.divide()` for a named
  measure and shows the vote and its result, and the lint rule that content cannot write a
  terminal stage.
- **E9 Change notices.** Effects return `{kind, tab, id, summary}` for what they changed;
  the Sitting tab shows each as a card; every cross-tab effect must have one. The check:
  snapshot the state before and after each decision on sampled paths, and fail on any change
  to a displayed field with no notice.

## The exit gate

The playtest build ships only when **all** of these hold. Each is a machine check or a
named human read, and none is a judgement of "looks fine".

1. **`npm run check` and `npm run layout`** pass, the latter at 1366 x 768 and 1920 x 1000
   on every tab Act I shows.
2. **Visibility.** On sampled seeds and strategies, at every sitting, everything a player can
   see (bill, order, initiative, person, party, station, term, article, wire item) has been
   introduced by then. Break-tested: a planted early entry fails it.
3. **First use.** No term from the ledger's vocabulary appears in any text before its row.
   Break-tested.
4. **Scene contract.** No scene fires with a false premise. A decision that writes a lever
   has its "already done" branch. No flag is written and never read. Break-tested.
5. **No silent change, and no announced vote that did not happen.** On sampled paths, every
   change to a field another tab displays has a notice on the Sitting tab, and every bill's
   terminal stage was written by a division. Break-tested.
5b. **The fidget playtest.** A strategy that uses every writing lever, in a random legal
   order, before each decision. Across 240 seeds every run reaches the rise or ends with a
   recorded reason: no `IGNORED:` line, no stuck sitting, no unreachable ending, no
   contradicted scene.
6. **Balance.** The four crisis strategies and the fidget run across 240 seeds. The dilemma
   of the Act, pay the New Progressives or pay the officials, is real: neither extreme
   dominates. The bands are proposed after the first measurement and agreed with the author.
7. **The tutorial.** Every taught lever has one card that fires once, the lever is inert before
   it and live after, Options can replay it, and `tools/tutest.js` passes.
8. **My read-through.** I play all of Act I through the harness as a first-time player on
   three paths (cautious, bold, fidget), and log every moment where a term is unexplained,
   an action is unclear, a number is unexplained, a scene contradicts the state, or a page
   repeats what the last said. The log is empty when the build ships, and it goes to the
   author with it.
9. **The review sheet.** Every player-facing text in order of play, in one file, for the
   author to mark (`npm run prose`).
10. **Mechanics.** A written list of every mechanic issue found while building, each either
    fixed or consciously deferred with a reason.
11. **The author's first playthrough** is the acceptance test. What they flag goes to
    `exchange/PLAYBOOK.md`, "What the author dislikes", and the checks above grow to cover it.

The build is also the public playtest slice for itch.io (the author, 7 October), so strangers
are the first-time players, and the gate adds what a public release needs:

12. **Packaging.** `tools/package-itch.js` builds a zip of the shipping files only: the page,
    `js/`, `css/`, `content/` without `content/archive/`, and the fonts, audio and art the
    game loads. No editor, tools, design records, bible, briefs or retired text. A check lists
    the zip and fails on any file not on an allow-list, then unzips it into a clean directory
    and plays the opening from a static server and from `file://`, saving and reloading.
13. **Embedding.** The game runs in an iframe on its own origin: saves persist, audio starts
    only after a click, the console is clean, and the layout holds at itch's embed size and
    in fullscreen. A narrow screen gets one plain line saying the game is for a desktop
    window. Checked in Chromium.
14. **A feedback path.** A version stamp on the menu and in every transcript. The curtain page
    thanks the player, says where to send feedback (the author chooses the place), and lets
    them copy the run's transcript. No network call anywhere, so the game collects nothing.
15. **Saves across builds.** A build that changes the state's shape bumps `STATE_VERSION` with
    a migration, or says plainly on load that an older save cannot continue.
16. **Rights.** Every font, sound, image and data file in the zip is listed with its licence on
    a credits page the game shows. Anything without a licence the author can show is removed
    or replaced before it ships. I cannot verify licences from the repository, so the author
    confirms this list.

A gate cannot promise that the game will feel refined. It promises that every class of fault
we have found so far is checked by a machine, and that a person reads for the rest before the
author does.

## Assumptions the author may overturn

- Act I runs to the rise at sitting 16, as the doc's outline says, and the curtain page
  ends the build on a carried rise.
- The Divergence bill and its personhood fight are parked, and the Anchorage treaty is the
  bill that competes with the Appropriation for time (`design/78`).
- Lever scope: writing controls are inert until taught in Act I only. From the rise the story
  sets the agenda and every lever is open (`design/58` Round E).
- Old text is archived, not deleted.
- Axes stay as the bible has them. The personhood axis shows only where a bill on the paper
  moves it, and is glossed where it first appears.
