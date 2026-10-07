**Lane: Claude Code writes and reviews; Codex builds the engine items; opencode runs
mechanical steps.** Written 7 October 2026 on the author's decision in `design/80`. The
reasons are there. This file is the plan and the exit gate.

# Act I, built whole

**STATUS: stage 0 done (the record and this plan), and the author confirmed the assumptions at
the foot on 7 October. Stage 1 (the ledger, the retirement tiers, the Act I world) is drafted
below for the author to read. Nothing is retired yet.**

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

## Two kinds of thing, and what each owes the player

The author's complaint was a bill sitting in drafting before the story had brought in the
Works. That is a **story thing** showing before its scene. A **reference thing** is a
different matter, and the rule is not the same for both.

- **Story things** follow the ledger, and nothing shows before its row: bills, orders,
  initiatives, events and pages, wire items, matters, undertakings, achievements, and anyone
  who speaks or acts.
- **Reference things** are the standing structure of the world: the Earth and its anchors, the
  stations, the districts, the parties and their currents, the offices and who holds them,
  and the Concordance's reference articles. They are visible from the start, because a map
  that fills in as you play is another game. Their text carries nothing from Acts II to V, and
  a section that changes later is dated (`since`) so that it appears only when the world has
  reached it.

## The introduction ledger (draft, for the author)

One row per sitting. The columns are the contract between scenes: what is **first met** there,
and which control **opens**. A term used before its row fails lint, and a story thing shown
before its row fails the visibility test. The beats are the Claude Doc's outline. The
columns after them are mine.

| sitting | beat (who) | first met | opens |
|---|---|---|---|
| 1 | recommissioned; the House must carry the estimates before it rises (the President) | the Charter, a majority of the House, confidence, the Prime Minister's office | nothing |
| 2 | the first question: what should voters expect (Ceyhan) | the party's currents, loyalty | nothing |
| 3 | who holds the Treasury (Castellane; Skye, Czarnecki, Abadi) | orders, initiatives, collective responsibility, the leadership ballot, the estimates, the rise, the sitting period, the Reserve Bank | appoint, for the Treasury only |
| 4 | the draft estimates (the Treasury), then the order paper (Devi) | the Appropriation Bill 2080, the five clauses by name, the reserve, the wire, the order paper, stage, slot, order-paper time | grant order-paper time |
| 5 | a quiet wire item, then the one spare slot: the treaty, or hold it (Ivarsen, Trottier) | a treaty, ratification, the Anchorage concession, Kenya, a partner's patience (capital, the whips' ledger) | nothing new |
| 6 | energy and cooling; Ember Ridge short of cooling (Girard) | the thermal quota, cooling, the thermal margin, a station's heat | set the thermal clause; make orders (the first two rungs of the conservation ladder) |
| 7 | the basics: air, water, food (Ashgrove) | the consumables floor | set the floor clause |
| 8 | cover: substrate insurance, the New Progressives' price (Trottier, Marin) | substrate insurance, the means test, the registers of the insured and the suspended | set the cover clause |
| 9 | infrastructure: works (Tómasson) | capital works, a station's pull to leave | set the works clause |
| 10 | transport: the fare subsidy (Vasmer) | the transit subsidy, launch windows | set the transit clause |
| 11 | the whips' count of the House (Devi) | the whips, the count, the functional members, the dual majority | the whip: commit members to a division |
| 12 | the count, with your own party's currents (Devi) | how a current votes | nothing new |
| 13 | the division, or a functional objection that delays it three sittings (Devi) | the division, an objection | call the division |
| 14 | Question Time (Watkins) | the Opposition, Question Time, shadow ministers | nothing new |
| 15 | the Underwriters' read of the carried budget | the Underwriters, Earth's banks, the Economy tab's account | the Economy tab's Money calls |
| 16 | the rise: supply carried, or the government falls | nothing | nothing |

Where the Chamber is empty before sitting 4 ("nothing is before the House yet"), the
Chamber says so in one line. The clause panel is on the Appropriation's detail in the
Chamber, so each clause lever opens with its page there.

The division is the Act's climax, and the player is brought to it more than once: at the
whips' count, when the bill reaches third reading, and at every sitting from 15 if it has not
been called, because the rise is the deadline and nothing forces the vote (`design/76`: the
reason to wait is information). The treaty stays at committee, so it never reaches a
division in Act I (`design/78`).

## How old text leaves the build

The first plan here, three tiers chosen per entry, was tried on a scratch copy of the tree on
7 October and corrected. What works, and what it costs:

1. **A campaign sees story only if it is tagged for it** (default-deny, in `content/index.js`).
   The story kinds are events, bills, orders, initiatives, matters, tiers, achievements and
   resolutions. An untagged one belongs to the world's view alone, the view `test.js` plays
   on, so a story written for a later act cannot show before the story has brought it in. The
   reference kinds (parties, stations, characters and the rest) are still every campaign's.
   An entry that a test and a campaign both need is tagged `campaign: ["world", "flash_i"]`.
   This is the structural fix for the annexation bill in drafting; the checks assert it.
2. **Flash I's own story is parked.** `tools/park.js` moves entries out of a content file,
   byte for byte with the comments that lead them, into `content/campaigns/parked/<kind>.js`,
   a `campaign("parked", {...})` call, and proves that nothing changed but the tag. The
   script tags for those files carry `data-dev`, so the itch.io build leaves them out. Tried:
   34 events, 1 bill, 6 tiers, 12 initiatives, 3 matters, 4 resolutions and 8 achievements,
   all verified entry for entry.
3. **The world's untagged story stays where it is, as the engine tests' fixtures.** It is
   invisible to Flash I under rule 1. Moving it out as well broke `test.js` at once, because
   the tests lean on the story chain's order (with the old opening gone, `gb_approach` fired
   at sitting 1 and its promise fell due inside a helper that passes no content). The lasting
   fix is a fixture of the engine's own, and until then these entries ship in the data files,
   unseen. **Before the itch.io release** the fixture exists, they are archived, and the
   shipped bundle holds no retired prose. That is a line in the exit gate.
4. **Two holding tags** (`parked`, `world`) are accepted by lint and by the editor's
   validator, which otherwise reject a tag that no administration plays.

What the cut disturbs, so that it is done in one commit with the first slice and not alone:
`test.js` (one assertion, which asserted that a campaign sees all of the world), lint (the
holding tags, and parked matters naming instruments a campaign cannot see), the editor test
(its "play in the game" step picks an event that is now parked), the Flash I guards (38
failures: they assert the old story, so they are archived and replaced by Act I's own),
and `tools/uitest.js` and `tools/uxtest.js`, which play the old opening. `js/engine.js`
names two events itself (`f1_dilemma`, `the_pairing_kept`), which breaks the rule that the
engine names none and must go before the cut.

Reference text is not parked. Every entry is read against the rules and the ledger and
rewritten where it fails, with its disposition recorded, so that nothing is skipped.
`tools/prose.js` already lists every player-facing sentence under an address; the
disposition record is keyed on those addresses and a check fails if one has none.

## The Act I world (draft, for the author)

Sizes, from the inventory: 79,000 words of prose across the content files, of which 44,000
are the 143 events, 11,000 the districts, 4,500 the Concordance's authored articles, 2,500
the bills, 2,200 the characters.

- **Bills.** Visible: `appropriation`, renamed Appropriation Bill 2080 (`briefs/appropriation-rename.md`),
  and `anchor_kepler`, the Anchorage treaty, restaged at committee so that it needs three
  slots. The other nine are parked: `divergence`, `thermal2`, `shedorder`,
  `substrate_insurance`, `continuity_registration`, `substrate_public_stake`, `civic_clock`,
  `debt_moratorium`, `annexation`. The order paper in Act I holds two lines.
- **Orders.** Visible: `rung1_conservation` (SI 2080/61) and `rung2_clockrate` (SI 2080/62),
  the first two rungs of the conservation ladder, made at Ember Ridge. The other sixteen are
  parked.
- **Initiatives.** At most three, chosen when the Treasury scene is written, from the
  Treasurer's own (`quota_forward`, `charter_volume`, `lean_on_governor`, `defend_dollar`).
  The rest are parked. `lean_on_governor` and `defend_dollar` stay where the author left them.
- **People.** Reference. The speakers in Act I are the President, Ceyhan, Skye, Czarnecki,
  Abadi, Castellane, Devi, Ivarsen, Trottier, Girard, Ashgrove, Marin, Tómasson, Vasmer and
  Watkins. Each is introduced by their scene, and their note says only what the world
  knows by then.
- **Events.** All 143 are retired. The 34 tagged `flash_i` and the world events that the
  tests name are parked until their checks are re-pointed; the rest are archived.
- **The Flash I guards** (`content/campaigns/flash_i/guards.js`, 1,187 lines, 45 event
  references) are archived and replaced by a new file holding Act I's promises.

## Stage 1 findings

- **The checks are too slow to be a gate.** `npm run check` took 22 minutes on 7 October,
  13 of them in `tools/uitest.js`. A V8 profile puts the cost in `document.querySelector`,
  reached through the page's `$` helper, scanning a large jsdom DOM, mostly in the
  Government block. The fourteen checks are independent and run one after another. The gate
  needs minutes, so this is engine item E10.
- **The tests lean on story content.** `test.js` names `divergence` 56 times, which is why
  the park tier exists. The lasting fix is a fixture for the engine tests, so that no test
  depends on a story bill.
- **My earlier Decision 5 draft is superseded**, as `design/80` says.

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
   as the free route to the same division. The first division is taught by a card. The ledger
   fixes the sittings: the player is brought to the Appropriation's division at the whips'
   count, at third reading and at every sitting from 15 if it is still uncalled.
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

- **E1 The curtain. Landed, minimal (Claude, 7 October).** A campaign names its closing page
  in `setup.actEnd: { event, note }`. `Engine.checkEnd` returns `{ over:true, kind:"act",
  reason:"curtain" }` once the House has risen and the next period has begun (`st.period`
  above `actEnd.period`, default 1), read after supply lost and no confidence, so a lost rise
  is still the supply loss. The last page, the state of the country and the curtain call read
  `kind:"act"` in `js/ui.js`; the event is `queuedOnly` and never fires, so no decision is
  taken on it. Guards: `THE ACT CAN BE WON`, `THE CURTAIN IS THE ALMANAC WORKS ABANDONED`;
  `test.js` (periods block); `tools/uitest.js` (the curtain block). Codex still owes the
  signed-off form: a campaign `play.curtain` frame, and a dated last page (the state of the
  country reads the date the next period would open on, 23 May, and not the rise's, 8 May).
- **E2 The introduced record.** Scenes, wire items and events name what they introduce; the
  save records it; every list the player sees (bills, orders, stations, people, Concordance)
  filters by it. `STATE_VERSION` bump with a migration guard.
  *Content half of E2 (Claude, 7 October).* A scan of Act I's scenes in play order
  (`a1_commission` to `a1_underwriters`) gives the first scene that names each person, station,
  party, bill and glossary term, so the `introduces` data can be filled from it rather than
  written twice. Sitting 1: Flash, Tenaya (the President), Vijlbrief, the Winter Garden, the
  PSD, LIB, NPP, CDA and the independents, the Charter, Parliament, the Prime Minister.
  Sitting 2: Czarnecki (id `halloran`), Ceyhan, Anselm Ring. Sitting 3: Skye, Abadi, Castellane.
  Sitting 4: Devi (id `okarie`). Sitting 5: Ivarsen, Anchorage, `anchor_kepler`. Sitting 6:
  Girard, Ember Ridge, the thermal margin, the engineering authority. Sitting 7: Ashgrove.
  Sitting 8: Marin, Trottier. Sitting 9: Tómasson, Homestead, Home Rule. Sitting 10: Vasmer.
  Sitting 14: the AES. The glossary's `introduced` ids already name Act I's scenes for
  substrate, suspension, closure, the thermal margin, the engineering authority, the shed order,
  the functional constituency and the dual majority; every other term keeps the id of a parked
  event and so never opens in Act I. Two things the filter must catch that a scan of scenes
  cannot: a bill's Concordance article prints a **division forecast** ("On present numbers the
  bill carries") from sitting 1, three sittings of teaching before the count exists; and the
  Chamber lists the Appropriation with a Grant button before `a1_order_paper` has taught slots.
- **E15 Interface strings** (Claude wrote the replacements on 7 October, Codex applies them in
  `js/ui.js`, which the `ui-tabs` claim holds; the rule is `PROSE.md`, Interface 9: an empty state
  says what will appear and when). Line numbers are today's and drift.

  | where | now | replace with |
  |---|---|---|
  | `drawPartyCurrent`, on the order paper (1933) | Nothing is before the House. | No measure is on the order paper, so this current has no vote to cast yet. |
  | `drawOpposition` (2447) | Nothing yet. | The Opposition's questions, motions and votes are listed here as they happen. |
  | `drawGovernment`, a department with no business (2816) | No business in this department. | This department has nothing before you. An order its minister can make appears here once the Prime Minister may make it. |
  | `docketHTML` (6309) | Nothing before the House but the sitting itself. | No measure is due for debate or a division this sitting. |
  | `drawDecision`, board (7353) | Nothing on the board moved. | No figure on the board changed this sitting. |
  | `drawDecision`, heading with no answer open (7384) | No answer is open now | No decision this sitting |
  | the Chamber before sitting 4 (E2) | (the list is empty) | No measure is before the House yet. Measures are listed here once the order paper has been put in front of you. |
  | the choice panel's promise heading (5542) | You would be undertaking | You would be promising |
  | the note under it (5544) | It goes on the order paper. Keep it there and it stands against you. | The promise goes on the Owed list. If it is not kept by the date shown, the person it was made to acts on it. |

  Two strings keep as they are because they already say what to do: "Nothing is asked of you
  today. The House may rise." and "Nothing on the order paper demands a decision this sitting."
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
- **E10 A check that runs in minutes.** Run the fourteen independent checks in parallel, and
  cut the per-call DOM scans in `tools/uitest.js` and the helpers it drives. Evidence in
  "Stage 1 findings". It must not weaken a check.

- **E11 Superevents** (the author's idea, 7 October). An event may carry `setpiece.scale:
  "super"`, and then its page takes the whole Sitting tab: the centre column widens until the
  side columns are gone, using the dither already in `js/motion.js` as the widening, and the
  sides return when the decision is made. A thin ribbon keeps the date and the rise's
  countdown, so the player is never without them. Reduced motion is instant. It is for the
  few events that change the world, such as the stranding at the Works, a carried motion of
  no confidence, the thermal cascade beginning, the election called. It is not for texture,
  and not for a random event unless that event changes the state of the game. Lint warns
  above two in an act, so that the width stays an event. The author's first: the Almanac
  Works abandoned (`design/78`). **Proposal, for the author:** make it the Act I curtain's
  last beat, since `design/78` has the stranding opening what follows the rise, so the
  slice ends on it and the superevent is exercised in the build.

- **E12 A clause effect. LANDED (Claude, 7 October, minimal).**
  `{clause:{bill:"appropriation", clause:"floor", level:"lift"}}` sets a level through
  `Engine.setClause`, refused as the Chamber's panel refuses it (the refusal is logged, as a bad
  id is). A promise may be kept by it: `discharge:{clause:{bill, clause, level}}`, which reads
  the plan, defaults included. The effects panel names the clause and the level
  (`describe`), the Owed list says where it is kept (`undertakingWhere`: "Set the consumables
  floor to lifted", in the Chamber), lint checks the bill, clause and level, and
  `js/refs.js` follows a renamed bill. What it does **not** do, and is Codex's: return a change
  notice (E9), and a condition that reads a level (`clauseIs`) so a page can react to the
  level the player set.
- **E13 A whip effect. LANDED (Claude, 7 October, minimal).**
  `{whip:{bill, party, tier?, seats?}}` commits a party's members through `Engine.setWhip`
  (all that can be moved when `seats` is omitted); the plan is paid at the division like any
  other and the Chamber can change it until then. Needed so that "press the party" and "ask
  Trottier" in the count scene (sitting 11) are the act and not the announcement of it. Same
  limits as E12: no change notice.

Both are additive hunks in `js/engine.js` (`EFFECTS`, `met`, `describe`, `undertakingWhere`),
`js/schema.js`, `js/refs.js`, `tools/lint.js` and `test.js`, in files the `witnessed-acts` claim
holds. They are small and listed in the commit that carries them, so a merge is the reader's
diff and nothing more. **Also in that commit**, found while building the slices: the first rung
of the ladder may carry a campaign's lock (`when:{flagsAbsent:[...]}`), which `test.js` had
forbidden; the Owed list had no words for a promise of a slot or a level.

## What is built, sitting by sitting

The ledger's sittings 1 to 11, 14 and 15 are built, as `a1_` events in
`content/campaigns/flash_i/events.js`, with guards in `guards.js`. Sitting 12 and 13 are the
player's own work in the Chamber (the count's whips, the division) and have no scene. What
remains is the rise.

| sitting | built as | what the player does |
|---|---|---|
| 1 to 4 | the commission, the first question, the Treasury, the estimates and the order paper | answer; appoint; learn slots |
| 5 | `a1_treaty`, `a1_spare_slot` | promise the spare slot (a promise, kept in the Chamber) or hold it |
| 6 | `a1_cooling`, `a1_ember_ridge` | answer Girard; the first order opens (`a1_orders_locked`) |
| 7 to 10 | a page and a decision each: the floor, the cover, the works, the transit subsidy | promise a level (kept by setting it), or refuse; the money has to come from another clause |
| 11 | `a1_count` | the whip: nothing, your party's goodwill, or a partner's credit |
| 14 | `a1_qt_ember`, `a1_qt_promise`, `a1_qt_reserve` | one question, chosen by what the player did |
| 15 | `a1_underwriters` | a page; the Economy tab is the card's business |
| 16 | `a1_works_abandoned` (curtain page; E1 landed) | the curtain, and the Almanac Works abandoned. Full-page superevent (E11) still to come |

### Stage 4, the levers' and the reference text (Claude, 7 October)

Done, read against `PROSE.md` and checked by lint and the prose round trip:

- **The Appropriation Bill.** Summary, effect note, contested text, every clause and level
  label and note. The tax clauses are renamed to the words the estimates page uses (tax on
  pressurised volume, cooling, computing time, freight to orbit), the typed CW$ figures are
  gone from their notes because the tooltip adds the Treasury's costing, and the works level
  names Homestead, the one station whose closure the effect moves. The floor and transit
  notes now say that a standing cost lowers the most the estimates may spend (`solvency`).
- **The two orders, the treaty bill's contested text, the 18 cabinet notes and the three
  Treasury candidates' notes, two party notes (a doubled sentence in each), and one
  current (the Confessionals, which named the divergence bill).** The cabinet notes were
  design notes ("the sharpest tool in the game") shown on the Government tab.
- Character `note` fields are the author's design notes and are not printed; only `bio`
  reaches the Concordance ("Career"), and those are in register and carry nothing after
  Act I.

Not done, and where it goes: the 35 stations' `dependency` and `grievance` (printed in the
Concordance as "Principal dependency" and "Principal grievance", several as fragments such as
"Everything." and "Where the contracts went."; one names the divergence threshold) belong with
stage 5's pass on the generated articles. `setup.fiscal.bases` names ("Volume", "Thermal
quota", "Substrate-hours", "Mass to orbit") are the Economy tab's labels and should match the
estimates page too. Codex's E2 hides everything above by the introduced record.

**Promises are the spine of 5 to 10.** Each is a real undertaking with a deadline by sitting 14,
a place where it is kept (the Owed list names it) and a page for its breach, which sets the flag
`promise_broken` that Question Time reads. By sitting 10 a player who promised every minister what
they asked holds promises the reserve cannot pay for: that is the budget, learned by play (guarded
in `flash_i/guards.js`).

### The rise: draft text for E1 and E11 (for Codex to wire, and the author to mark)

The date needs the author's word. `bible.md` and `content/world.js` say the Commonwealth learned of
the abandonment on **6 May**; the House rises on **8 May** (sitting 16). A curtain that ends on the
abandonment either moves the date to the rise or has the news arrive as the House rises. I have
written it as arriving at the rise and changed nothing else.

**The superevent** (`setpiece.scale:"super"`), the curtain's last beat. A news page, third person:

> **Cordell abandons the Almanac Works, and 184,000 people are left without an operator**
>
> Cordell, the mining company that owns the Bellamy Almanac Works, has wound up the company that
> operated it. The platform's 184,000 residents now have no operator to pay for their air, water or
> fuel.
>
> The Works is a refinery and foundry on Tether 2, the International Earth-Orbit Elevator, whose
> anchor stands at Malindi in Kenya. It smelts the ore that Cordell's extraction platforms bring in
> and rolls it into structural metal and hull plate.
>
> Cordell is owned by the sovereign wealth fund of Gabon. The European Union froze the fund's assets
> in March, and Cordell's accounts in Europe have stayed frozen since. The operator could not pay its
> suppliers, and its engineers say the platform's air will last about two months.
>
> Kenya, on whose coast the tether stands, has approved a plan to bring down the residents who wish
> to come. Its tender law and the platform's safety inspection put the last descents in 2082. The
> European Union, whose banks hold the platform's bonds, says that whoever takes the platform takes
> its debts.

Every fact in it is already canon (`content/world.js`, `content/actors.js`); the only new thing is
the day.

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
   **First measurement, 7 October (`npm run balance`, `tools/actbalance.js`).** Act I has no random
   event, so every seed plays the same game, and the 240-seed clause is moot until a random event
   exists: the variation is the player's answers. No answer strategy loses. All reach the curtain,
   because nothing ends a run except leaving the estimates unmoved (`STILL=1` shows that, all
   `loss:supply`). What the answers change is the price. Refusing every promise ends at public
   standing 49 and New Progressive loyalty 30. Promising every minister and keeping what the
   Treasury's ceiling allows ends at standing 32 and loyalty 37, with two of six promises broken.
   Promising and keeping nothing is the worst: loyalty 23, against 15, the line at which the party leaves the coalition, and 30 for
   refusing. So the dilemma is real and a broken promise costs more than a refused one. If the
   author wants a run to be losable in Act I, that needs a decision; today it is loss-proof by
   design (`design/77`, constraint 3).
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

## Mechanic issues found while building (exit gate 10)

Each is fixed, or deferred with its reason and its owner. Kept in order found; add to it, do not
reword it.

| # | issue | state |
|---|---|---|
| 1 | A bill in drafting is on the order paper with a Grant button, so staging it to "drafting" does not hide it | Deferred to E2. A refusal in `canGrant` was tried and reverted, because `uxtest` grants time to a drafting bill by design |
| 2 | The run did not end at the rise: a carried rise opens the next period, with an interval page | Fixed (E1, `Engine.checkEnd` on `st.period`) |
| 3 | The curtain page reads the date the next period opens (23 May), not the rise (8 May) | Deferred to Codex with E1's frame |
| 4 | Every seed plays the same game, because Act I has no random event | Recorded in `tools/actbalance.js`. The 240-seed gate is moot until one exists |
| 5 | No answer strategy loses; only leaving the estimates unmoved ends the run | Deferred to the author, who decides whether Act I may be lost (design/77 says it stays loss-proof) |
| 6 | Floor "lifted" and transit "every station" lower the Treasury's ceiling (`solvency -4000`), and no text said so | Fixed in the clause notes and the floor page |
| 7 | The works "outer" level moves one station's closure (Homestead) while the text said the outer stations' | Fixed in the text. Deferred: whether the effect should reach more stations, which changes Acts II to V's secession arithmetic |
| 8 | The four tax clauses sit in the Chamber's clause panel with five levels each and are mentioned in one paragraph at sitting 4 | Deferred to the author: lock them until the Economy tab opens at sitting 15, or teach them. Open question 5 in `design/81` |
| 9 | The clause panel named the taxes "Ways and Means: volume" and the page named them "tax on pressurised volume"; the Economy tab's base names differ again | Fixed in the bill and in `setup.fiscal.bases` (pressurised volume, cooling, computing time, freight to orbit) |
| 10 | A bill's Concordance article prints a division forecast from sitting 1 | Deferred to E2 |
| 11 | `Appropriation (Session 4) Bill` and `HC 4/` references still show | Deferred to opencode (`briefs/appropriation-rename.md`) |
| 12 | Tooltips carry typed constants ("a thermal margin of 15") | Deferred to E5's placeholders |
| 13 | `prose:in` writes prose.txt over the source, so a hand edit after generation is silently reverted | Recorded in `LESSONS.md`. Deferred: make `prose:in` refuse when the source has changed since the export |
| 14 | `lint` ordered the world's retired events with Act I's glossary, and read neither choice notes nor headlines | Fixed. It now reads the live campaign's path and the notes, and caught two early uses of a term |
| 15 | The glossary's `handle` asides are analogies ("Voter ID, for a world where copies are cheap"), against the Reference rule of no metaphor | Deferred to the author. Open question 6 in `design/81` |
| 16 | The quiet sittings (12, 13, 16) print lines from the world's old `business` pool, 80 lines of pre-reset text, several about the divergence bill, reclassification and an emergency thermal appropriation that Act I does not have | Fixed. `business` and `minutes` are now story kinds (`content/index.js`), Act I has its own 29 business lines (`content/campaigns/flash_i/business.js`) and no minute, and a guard holds both |
| 17 | The Register held two Prime Minister's minutes from the retired story (a direction on licensing boards; a minute about "the division on Thursday") from sitting 1 | Fixed with 16 |
| 18 | The Anselm Elevator actor note said its concession "awaits ratification by the House", which is the International's treaty, not the Beanstalk's | Fixed |

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
- **The play's frame is kept as the author wrote it** (`content/campaigns/flash_i/campaign.js`:
  the introduction, the cast, three acts with their epigraphs and stage directions, two
  intervals and the curtain call). Act I's card, "The House Is Sitting", fits the slice. The
  intervals and the curtain call describe a three-act play that ends at an election; the
  slice ends at the rise, so they need the author's word on the five-act shape. E1 is wired
  without them: the run ends on the curtain page and the interval is never reached.
  Nothing in them has been rewritten.
- **The promises' deadlines** (sitting 6's appeal, three sittings; sitting 5's treaty slot,
  eight; the four clause promises, four to five, all due by sitting 14) are provisional and
  want a playtest. So does every number in the choices, which the commit marks PROVISIONAL.
- **Question Time is the only scene that depends on what the player did.** Its three
  variants are exclusive; a fourth (for a government that carried the estimates early, or
  whipped hard) is easy to add if the playtest wants one.
