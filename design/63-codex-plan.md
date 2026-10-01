# 63 — Codex plan for the tabs and the brief

> **For agentic workers:** Use superpowers:executing-plans for native execution
> or superpowers:subagent-driven-development if the author selects delegation.
> The current steps 2 and 3 implementation plan is section 6; sections 1–5
> preserve the original review. Section 6 supersedes their stale details for
> this batch. Review the plan and confirm the execution method before code.

**29 September 2026; revised after design/64.** Understanding and plan only.
No implementation is in this document. Line numbers describe the tree as read
for the plan. `design/64-answers-to-codex.md` overrides the two briefs here.

## 1. Understanding

- The overhaul fixes a timing problem, not a shortage of powers: the game has
  many levers, but presently teaches their value only when a decision is
  already due. The intended loop is advice early, a dearer decision later,
  then the consequence as a page. It must show the campaign's aim beside the
  costs of carrying the House, without turning either into an on-screen score.
- `briefs/tabs-overhaul.md` first makes the existing state legible and removes
  duplicate menus. It serves design/58's **carrying the House** core, **words
  before figures**, **open levers, matter first**, cabinet-as-advice, and the
  Sitting-first order (`design/58-the-game-on-one-page.md:110-176,192-253,314-332`).
- `briefs/the-brief.md` then adds the missing reason to act: up to four partial,
  owned pieces of advice, one newly raised per sitting, which age independently
  from brief to decision to page. It serves design/58's price gradient,
  constant-but-competing advice, vacancy rule, triage, and owed/advised split
  (`design/58-the-game-on-one-page.md:198-253,324-332`).
- Strong reasoning: matter-first preserves player initiative while giving a
  lever context; keeping `Engine.today()` obligations-only preserves the red
  badge's meaning; putting Chamber, Party and Relations together makes the
  three prices of a vote spatially legible.
- Remaining qualifications, now bounded by design/64:
  - "Most first-time players" is measured by a deterministic strategy which
    always takes the first remedy. That is a useful regression proxy, not yet
    evidence about first-time comprehension.
  - design/61's header still says Orbit is open, while its second-round answer,
    the brief and design/64 say it is decided (`design/61-the-tabs.md:1-5,104-125,163-170`).
  - The briefs left urgency, overflow, due/grace timing and event roles
    underspecified. design/64 resolves them: time to late stage, cabinet
    seniority and content order determine priority; open matters are never
    displaced; `late` is a plain decision; `page` is a queued-only,
    choice-free setpiece after `grace` (default two).

## 2. Plan by step

### Tabs overhaul

1. **Tab order and Record removal — small (about 30–50 lines).**
   - Touch `index.html:33-44,500-521`, tab/screen expectations in
     `tools/uitest.js:720-742`, and any tab-order assertions in
     `tools/uxtest.js:1140-1155`.
   - Reuse the existing `data-t`/`#s-*` tab mechanism. Move Party and Relations
     before Economy; remove `data-t="log"` and `#s-log`, but retain Sandbox's
     conditional tab.
   - No engine, schema, editor or state work. Risk: keyboard/tab counts, the
     active-screen fallback, and stale Record links. Likely failures: `npm run
     ui`, `npm run ux`, `npm run layout`.

2. **Record into Sitting; transcript into Options — medium (120–180 lines).**
   - Touch `index.html:46-74,500-521`; `drawExport()` and `transcript()` around
     `js/ui.js:873-973`, `drawSitting()` at `js/ui.js:6271`, `drawLog()` at
     `js/ui.js:7913`; shared options markup/wiring at
     `js/shell.js:881-1000`; layout at `css/terminal.css:449-452,677-692`; UI
     transcript tests at `tools/uitest.js:720-742`.
   - Reuse `st.wire`, `st.log`, `transcript()`, and the single shared
     `optionsHTML()`/`wireOptions()` path. Render a merged, stable newest-first
     stream keyed by sitting, rather than copying either list into new state.
   - No engine/schema/editor/state change. New interface: a "What has happened"
     feed and an in-game Options transcript block. Risk: duplicate entries,
     ordering within the same sitting, focus after redraw, download wiring in
     both Options surfaces, and cramped left column. Checks: UI, UX, layout,
     prose.

3. **Chamber duplicates — medium/large (220–320 lines).**
   - Touch Chamber markup at `index.html:168-244`; `drawGovernment()`'s existing
     grant panel at `js/ui.js:2425-2585`; `drawOrderPaper()` at
     `js/ui.js:7005-7052`; `drawChamberPicker()` at `js/ui.js:6774-6829`;
     `drawChamberForecast()` at `js/ui.js:6831-6866`; `drawBenchTable()` at
     `js/ui.js:6937-6966`; `drawChamber()` at `js/ui.js:7054`; and
     `drawFunctional()` at `js/ui.js:7741`; Chamber CSS at
     `css/terminal.css:693-745`.
   - Reuse `Engine.grantSlot`, `Engine.reservedFor`, the current refusal text,
     `Focus`'s `cham-bills` identity, `benchTableHTML()`, and the existing
     confidence calculation/bar. Move, do not duplicate, Grant wiring and its
     slot/refusal logic into each order-paper row; put the slot bar in that
     panel's heading; make Functional a closed `<details>` below Composition;
     put confidence in Parliament's heading and remove `#chamber-legend` after
     ensuring composition carries every colour.
   - No planned engine/schema/editor/state change. New tests should cover Grant
     from the selected row, reserved time, focus surviving a changed bill, and
     the drawer. Risk: a button inside a selectable row doing two actions;
     selection/focus loss; `:has`/height CSS; bill detail still clipping.
     Checks: test, UI, UX, story map, layout.

4. **Government by department — large (450–650 lines plus content edits).**
   - Touch Government markup `index.html:89-165`; `drawGovernment()` at
     `js/ui.js:2425`; instruments' UI around `js/ui.js:2650-2940`;
     `initHTML()`/`drawInitiatives()` at `js/ui.js:5000-5070`; dialog conventions
     in `js/dialog.js:1-40`; Government CSS at `css/terminal.css:210-218,637`;
     initiative forms at `js/editor.js:1179-1252`; instrument forms at
     `js/editor.js:1592-1645`; and content assignment.
   - Reuse cabinet order and live holders from `content/cabinet.js:16-115`,
     instruments' existing `author` post field (`content/instruments.js:1-12`,
     `js/engine.js:2436-2452`), cabinet `brief` subjects, existing relationship
     values, current instrument buttons, appointment UI, and Dialog callbacks.
   - New content/schema/editor work is required only for initiatives: add
     `post` (not a second field on instruments), expose it in the initiative
     editor, validate/ref-track it, and assign every world/campaign initiative.
     Instruments keep their existing post/department field (`author`), while
     initiatives gain `post`. Unassigned actions appear on the Prime Minister's
     card and lint warns rather than fails. No state migration: ownership is
     content. Build a document overlay using Dialog conventions; keep
     undertakings/Tribunal/Presidency adjacent. Empty future regions should be
     structural hooks, not visible empty copy.
   - Risks: the brief says "open only", while `Engine.initiatives()` at
     `js/engine.js:7938-7957` returns closed entries with reasons; vacancy must
     suppress actions consistently, not merely hide them; instrument selection
     currently drives the persistent reader; 16 post cards may overflow.
     Checks: editor, roundtrip, rename, lint, UI, UX, story map, layout.

5. **Party currents and country — medium (250–350 lines).**
   - Touch `index.html:353-380`; `drawParty()` at `js/ui.js:1622-1673`,
     `drawPartyCurrent()` at `js/ui.js:1675-1760`, `drawLeadership()` at
     `js/ui.js:1762`, Relations' reusable term blocks at
     `js/ui.js:2045-2155`, and Party CSS at `css/terminal.css:429-433`.
   - Reuse current descriptions/axes, named members, undertakings, authored
     party bills, optional new `leader` and `asks` fields (falling back to the
     senior member), `currentOnMeasures()` (`js/ui.js:1592-1620`), and
     `Engine.forecast()` (`js/engine.js:8246-8264`) for bands and projected
     seats. `briefs/psd-currents.md` supplies no mechanical work; it remains a
     Claude design question.
   - No engine/state migration should be needed. Derive wants and differences
     from existing axes/bills; add optional content `leader` and `asks`, with the
     senior member as leader fallback. Add tooltip figures to word mappings.
   - Risks: `Engine.forecast().mine` is total projected seats, so "win or lose"
     must compare with `Engine.partyTotal`; current promises are indirect via
     the promised person's party/current and need an agreed attribution rule;
     prose may duplicate Relations. Checks: test, UI, UX, lint, layout.

6. **Opposition panel — small/medium (100–160 lines).**
   - Touch Relations markup `index.html:382-406`, `drawRelations()` at
     `js/ui.js:1949-2155`, characters at `content/characters.js:119-241`, and
     Relations CSS at `css/terminal.css:436-440`.
   - Reuse the character with role `Leader of the Opposition`, party leader and
     live party seat totals. Shadow ministers are characters whose `role`
     begins "Shadow Minister", not offices in `content/constituencies.js`.
   - Add structured optional `shadow:"<post id>"` fields to characters and
     editor/schema/reference validation. Populate existing characters once from
     their role strings; runtime reads only `shadow`. Add the explicit empty
     moves list requested. Risk: hard-coding Watkins/party; departed people;
     duplicated selected-opposition details. Checks:
     UI, lint, layout.

7. **Orbit state and campaign marker — medium/large (200–350 lines).**
   - Touch `drawStation()` at `js/ui.js:7573-7632`, orbit markup at
     `index.html:408-429`, orbit CSS at `css/terminal.css:760-785`, and possibly
     the chart renderer `js/orbitchart.js`.
   - Reuse `st.stations` and its simulation fields `closure`, `suspended`, and
     `attested` (`js/engine.js:54,658-670`), national `st.standing` by electoral
     band, and `station_issue` from `f1_stranded`
     (`content/campaigns/flash_i/events.js:50-73`).
   - Per-station heat and consumables do not exist; show the national
     `thermal_margin` and `consumables` explicitly as national readings beside
     station exposure derived from existing fields. Add the Works as a generic,
     campaign-owned marker on the schematic, keyed from Flash I content; it is
     not a station and adds no electoral/state simulation.
   - Risks: falsely presenting a national value as local; letting the generic
     campaign marker leak Flash I knowledge into the renderer; confusing
     electoral standing-by-band with a station reading. Checks if resolved: test, editor/roundtrip/rename for new
     content, UI, story map, layout.

8. **Status essentials — small/medium (100–150 lines).**
   - Touch `drawStatus()` at `js/ui.js:498-565`, status markup
     `index.html:523-536`, status CSS `css/terminal.css:183-195`, and UI/UX
     assertions.
   - Reuse `Engine.confidence()/majority()`, `st.risesAt`,
     `st.scalars.thermal_margin`, the ballot threshold and `st.signatures`, and
     `tipAttr`/tips. Keep `#sb-msg` hint/status text as the flexible fifth
     region, not an indicator.
   - No engine/schema/editor/state change. Interface-owned bands can say the
     four readings in words, with exact values in `data-tip-*`; thresholds must
     come from content. Risk: the design's example "safe by six" is itself a
     number, and dissolution has no rise. Checks: UI, UX, layout.

9. **Advisory dots hook — small (50–90 lines).**
   - Touch `drawToday()` at `js/ui.js:5158-5215` and badge CSS at
     `css/terminal.css:2836-2860`.
   - Reuse the real `.tab-n` element and its tooltip for red obligations. Add a
     separate idempotent `drawMatterDots(tabIds)` that toggles a CSS class/
     dedicated node without deleting `.tab-n`; initially call it with `[]`.
   - No engine/schema/editor/state work until matters exist. Risk: `drawToday()`
     currently removes/rebuilds badge children on every redraw, so dot and red
     count must not own the same node. Checks: UI, UX, layout.

### The brief

1. **Content plumbing and schema — medium (250–350 lines).**
   - Add `MATTERS` and load it before `content/index.js` in `index.html:539-560`
     and `editor.html`; register/filter/index it in `content/index.js:3-75`;
     allow campaign registration in `content/setup.js:1131-1161`; serialise it
     in `js/serialise.js:64-125,181-225`; add collection/reference support in
     `js/refs.js:37-40`; and add a Matter editor kind alongside campaign kinds
     in `js/editor.js:35-62,1145-1325,1819-1860,1925-1950`.
   - Reuse the existing condition editor (`raise`, `due`, `settled`), post/event
     vocabularies, campaign tagging/splitting, and clone-then-write forms.
   - Prefer a typed remedy target (see section 5) over an ambiguous string.
     Add validation/lint for owner posts, scalar figures, lever targets, late
     and page event ids. No new effect or condition is yet proven necessary.
   - Risks/checks: every collection has many registries; omissions appear as
     editor roundtrip loss or unsafe rename. Break a matter reference and
     confirm lint/rename fails; then run lint, editor, roundtrip, rename, enc.

2. **State, migration and reconciliation — medium/large (300–450 lines).**
   - Touch `STATE_VERSION`/`newGame()` at `js/engine.js:16-110`, ascending
     `migrate()` at `js/engine.js:290-552`, and `reconcile()` at
     `js/engine.js:580-770`.
   - Reuse `matches()`, live `st.cabinet`, event seen/queue conventions, and
     content-owned identity/save-owned simulation. Add one v35 block and one
     state table, not parallel arrays that can disagree.
   - Proposed state:
     `st.matters[id] = {state:"waiting"|"open"|"noted"|"decision"|"page"|"settled", raisedAt:null|sitting, openedAt:null|sitting, notedAt:null|sitting}`.
      Derived urgency/due dates stay computed from content plus `eligibleAt`,
      the first sitting the raise condition held, never visible admission.
     `reconcile()` adds/removes content identities and evaluates raises after
     cabinet/content repair; old saves start empty, then deterministically raise
     whatever is due, subject to capacity.
   - Risks: reconciliation must not replay a settled matter; migration has no
     `C`, so only creates the table; same-sitting evaluation order matters.
     Unit tests: v34 load, deleted/added matter reconciliation, vacancy,
     deterministic one-new/four-open/overflow ordering, noted clock.

3. **Matter lifecycle in the sitting loop — large (400–600 lines).**
   - Touch `Engine.playSitting`, `choose()`, `advance()` around
     `js/engine.js:5784,8567`, event selection/queue paths, and export new query
     functions near `Engine.initiatives()` at `js/engine.js:7938`.
   - Reuse `matches()`, deterministic content order, the event queue, and live
     post vacancy. Add pure `Engine.matters(st,C)` plus a single lifecycle
     writer invoked at a defined boundary (recommended: after the prior
     sitting's consequences/advance, before selecting this sitting's decision).
   - Rank eligible waiting matters by explicit authored urgency then content
     order; admit no more than one and never over four. A noted matter remains
     timed. At due, queue/offer its `late` decision through the existing one
     decision per sitting machinery; if still unresolved after the decision's
     deadline, queue `page`. Re-check `settled` after every lever/event effect
     and at advance. A vacancy blocks raising, not clocks already started.
   - Risks: stealing the sitting's existing decision, duplicate events,
     setpiece/decision ambiguity, settled conditions that become false later,
     and no defined deadline between late decision and page. Tests must assert
     each transition and save/load determinism.

4. **Thin-slice content and conversion of alerts — large, content-heavy
   (three matters plus adaptations).**
   - Add `content/campaigns/flash_i/matters.js`; adapt alerts at
     `content/setup.js:752-772`; reuse thermal order discovery from
     `Engine.today()` at `js/engine.js:7817-7865`; reuse the Works chain at
     `content/campaigns/flash_i/initiatives.js:260-290` and
     `content/campaigns/flash_i/events.js:1410-1515`.
   - Owners: Treasury for reserve, Substrate and Thermal for the global margin
     (design/58's grid interest), and Life Support for air. Reuse existing initiative/order/facility
     actions; do not create a new act merely for the brief.
   - Keep obligations in `setup.alerts`/`Engine.today()` where they are owed;
     remove only the early advisory duplication. Arrears may remain an alert
     after the reserve matter has become fact. Write three plain notes and name
     them in the implementation commit.
   - Risks: converting all three alerts is not one-to-one with the requested
     three matters (`bill_authority` and `arrears` are two stages of reserve);
     air's existing failure event combines page and decision; balance/canon
     may move if lifecycle events displace decisions. Checks: prose, lint,
     guards, before/after 80 seeds.

5. **Sitting brief and lever navigation — medium/large (300–450 lines).**
   - Replace Today/docket in `index.html:59-72`; extend `drawSitting()` at
     `js/ui.js:6271`, `openTarget()` at `js/ui.js:5080-5137`, and use the dot
     hook from tabs step 9. CSS begins at `css/terminal.css:677-692`.
   - Reuse `Engine.today()` for an "owed" subsection, existing docket content,
     `tipAttr`, `openTarget`, and identity-based focus. Each matter card shows
     owner/note, derived readouts, remedy buttons, and Set aside.
   - Add only interface handlers calling engine lifecycle/lever queries; do not
     duplicate action execution in UI. Figures should declare a source key and
     display mapping so live state, words and hover value cannot drift.
   - Risks: four cards plus calendar/indicators cannot fit at 768px; opening a
     remedy whose lever is unavailable; focus after Set aside; red owed rows
     must remain visually distinct. Checks: UI, UX, story map, prose, layout.

6. **Economy calls — medium (180–260 lines).**
   - Touch `drawEconomy()` at `js/ui.js:1388-1490`, `Engine.facilities()`/
     `borrow()` at `js/engine.js:6690-6765`, and Economy markup/CSS.
   - Reuse lender content, `Engine.canBorrow`/`borrow`, `cw()`, and existing
     confirmation callbacks. List only calls named by open matters, linked back
     to their matter; remove account Draw buttons rather than leaving two
     action paths.
   - A money remedy needs parameters (lender and amount/utilisation), not only
     a lever id. Unless the schema supplies them, the engine cannot execute
     "draw" from a generic target. No state migration expected.
   - Risks: design/61 also names tax, sale and budget line, but no common money
     call abstraction exists. Thin slice should move only existing borrowing;
     broader calls await content/mechanics. Checks: test, UI, UX, layout.

7. **Playtest strategy and acceptance — medium (180–250 lines plus runs).**
   - Touch `govern()`/`STRATEGIES` at `tools/playtest.js:75-260` and the play
     loop below `tools/playtest.js:280`; add engine tests in `test.js` and
     campaign promises in `content/campaigns/flash_i/guards.js` where needed.
   - Reuse `Engine.playSitting`, the engine's remedy/action API, and urgency
     ordering. "Follows the brief" should, before ordinary governing, ask
     `Engine.matters()`, select the most urgent open matter (engine order), and
     invoke its first currently executable remedy through the same engine verb
     as UI. It should not inspect flags or matter ids.
   - Keep `Engine.today()` governing for owed business, including thermal
     orders once they truly become obligations. Report losses; do not tune.
     Fold only the *strategy* part of `briefs/lever-playtest.md` here; its full
     dead-event classification is separate scope unless the author says
     otherwise.
   - Before trusting tests, deliberately break a raise condition, a remedy
     reference and migration initialization and observe failures. Run baseline
     and after `node tools/playtest.js --seeds 80`, then guards and full check.

## 3. Decisions supplied by design/64

1. Urgency is sittings remaining before late; ties are cabinet seniority, then
   content order. Open matters never get pushed out. A fifth queues by urgency,
   at most one enters per sitting, and one already due goes straight to `late`.
2. Numeric `due` starts when `raise` first holds; conditional `due` fires when
   first true; if both exist, the first wins. `grace` defaults to two sittings.
3. `late` is a plain decision; `page` is a queued-only setpiece without choices.
   Lint enforces both. Dated/required anchors outrank late decisions, which
   outrank the ordinary pool.
4. Settlement is permanent unless `recurs:true`. Heat and reserve recur; air
   does not. Starting a remedy before due holds late until it lands; only
   `settled` closes the matter.
5. Figures are live `{label, source, bands}` declarations. Shared word bands
   live in `setup.readouts` and serve both matters and the status bar. A visible
   phrase may keep a number when the number is the point. The whip-range change
   is deferred.
6. Headroom/`bill_authority` becomes the early reserve matter; arrears remains
   owed. Remedies carry the preset parameters of existing levers; no new money
   mechanic is added.
7. Orbit shows national heat and consumables beside exposure derived from
   existing station fields. Flash I supplies a generic campaign marker for the
   Works; the Works does not enter the station roster.
8. Instruments retain their existing department/post mapping; initiatives gain
   `post`. Unassigned entries render on the Prime Minister's card and produce a
   lint warning. A vacancy blocks new work and answering its open matters, but
   does not cancel anything already running.
9. Currents derive wants/differences and gain optional `leader` and `asks`; the
   senior member is the leader fallback. Shadow ministers gain structured
   `shadow` post ids, populated once from roles and read structurally at runtime.
10. The transcript appears only in the in-game Options popover. The folded
    lever-playtest work adds its strategy and audits only events touched by the
    three matters.

## 4. Order and slicing

- Keep the high-level order: tabs first, matters second. The brief UI depends
  on the Sitting structure, department cards and advisory-dot hook.
- Change the tabs order internally:
  1. tab order + Record/Sitting + transcript;
  2. Chamber;
  3. status + dots (small shared primitives);
  4. Government ownership/content, then department UI;
  5. Party + Relations;
  6. Orbit after the generic campaign-marker content shape is in place.
- Do not make nine commits merely because there are nine numbered bullets.
  Keep one reviewable commit per visible tab, but merge tab-order with Record
  folding, and status with badges. Split Government's content ownership/editor
  change from its layout so roundtrip/rename failures are isolated.
- Split the brief into: (a) collection/editor plumbing; (b) v35 state and pure
  lifecycle engine with tests; (c) Sitting UI/navigation; (d) three Flash I
  matters and Economy calls; (e) playtest strategy/report. This keeps content
  balance out of the state migration commit.
- **First implementation commit:** `Fold the Record into Sitting and reorder the tabs`.

## 5. The brief's design

### Content schema

```js
{
  id: "reserve_low",
  campaign: "flash_i",          // campaign() normally supplies this
  owner: "treasury",            // cabinet post id
  // urgency is derived from time remaining; ties use owner seniority/order
  raise: { /* ordinary condition block */ },
  note: "From the Treasurer: ...",
  figures: [
    { label: "The reserve", source: "solvency", bands: [/* content-owned */] },
    { label: "Bill authority left", source: "economy.headroom", bands: [/* ... */] }
  ],
  remedies: [
    { target: { kind: "money", id: "earth", amount: "utilisation" },
      takes: 0, note: "Draw on the standby facility." },
    { target: { kind: "instrument", id: "si_..." },
      takes: 1, note: "Lay the order." }
  ],
  due: { after: 3, when: { /* optional condition; first wins */ } },
  grace: 2,
  recurs: true,
  late: "reserve_decision",
  page: "reserve_failure",
  settled: { /* ordinary condition block */ }
  // forecast: reserved for later; not interpreted now
}
```

- `target.kind` should be one of `initiative`, `instrument`, `bill`, `order`
  (only if distinct from instrument in this code), or `money`. It gives refs,
  editor vocab, destination tab/focus and execution a type; a bare `lever`
  string cannot safely distinguish namespaces or carry money parameters.
- `takes` is display/advice, not an alternative timer or action. Where the
  engine already knows an initiative tempo, validation should catch a mismatch
  rather than silently overriding it.

### State and migration

```js
matters: {
  reserve_low: {
    state: "open",              // waiting/open/noted/held/decision/page/settled
    eligibleAt: 18,              // first sitting `raise` held; numeric due base
    raisedAt: 18,
    notedAt: null,
    lateAt: null,
    remedy: null                 // target/landing only while a remedy holds late
  }
}
```

- Bump the current state version by one (34 to 35 in the tree reviewed here). The `<35` migration creates `st.matters = {}` only and stamps
  35. `reconcile(st,C)` adds content matter ids as `waiting`, drops ids no
  longer in the campaign view, preserves simulation fields, and then runs the
  ordinary deterministic raise pass. No copied note, owner, priority or due
  value belongs in the save.

### Flow

1. At the sitting boundary, close any matter whose `settled` condition has
   first held.
2. Date eligibility the first sitting `raise` holds. Numeric and conditional
   due clocks run even while queued. A started remedy moves the matter to `held`
   until its existing lever lands; it suppresses late but does not settle.
3. Admit at most one eligible matter per sitting while fewer than four are open,
   ordered by sittings to late, owner seniority, then content order. Never evict
   an open matter. A queued matter already due bypasses the brief for `late`.
4. `Engine.matters()` returns the derived owner, live figures, remedies,
   target tabs and timing. UI renders it; Set aside changes only `open` to
   `noted`, without changing `raisedAt`.
5. A remedy navigates to and uses the existing lever. Effects remain the one
   source of truth. After every action/effect, the lifecycle writer evaluates
   `settled`; it does not infer success merely from a click.
6. Selection precedence is dated/required anchor, then a due late decision,
   then the ordinary pool. If still unsettled `grace` sittings after `late`,
    queue `page`. Close permanently when `settled` first holds. A recurring
    matter must observe `raise` become false, then true again, before another
    episode starts; do not reopen it merely because it has closed.

### Reuse and measurement

- Reuse `setup.alerts` as authored **owed warnings**, not as a second advice
  engine. Convert `bill_authority` into the reserve matter's early warning and
  retain `arrears` as an owed alert. The heat alert's existing effect-based search for the next helpful
  instrument is a useful model, but remedies should name their targets in
  content rather than rediscover them. Reserve/arrears wording and thresholds
  can seed the new matter's raise/urgent/figures without duplicating them.
- Keep `Engine.today()` unchanged in purpose: decisions, deadlines,
  vacancies, endangered partners and actionable alerts remain obligations.
  The Sitting brief may compose `Engine.matters()` and `Engine.today()` in one
  column, but red counts and Rise use only `today().items`.
- The playtest strategy reads the same ordered `Engine.matters()` view as the
  UI, takes the first executable remedy of its first (most urgent) matter via
  the existing engine verb and its authored preset parameters, then performs its normal supply-first governing
  and calls `Engine.playSitting`. It records refusals rather than reaching into
  state. Run the current 80-seed sweep before implementation, the same sweep
   after it, and report the new strategy's loss count separately without tuning.

## 6. Current implementation plan — 1 October 2026

**Goal:** Build roadmap step 2's campaign-independent matter foundation and
step 3's three Flash I matters, Sitting advice and Economy remedy navigation.

**Architecture:** Campaigns declare matters and typed remedies. One engine
lifecycle writer owns their clocks and transitions; read-only queries supply
the game and tools. Remedies lead to existing powers, rather than executing a
second version of those powers from the Sitting.

**Tech stack:** Classic JavaScript scripts, no framework or build step,
existing Node checks and jsdom; real-browser layout measurements.

**Spec:** `briefs/the-brief.md`, `design/64-answers-to-codex.md`, design/58
Round I, and the air-chain decision approved in the brief on 1 October.

### Global constraints

- Up to four open at once, and at most one new a sitting.
- Engine code names no concrete event, party, station or matter.
- A vacant department raises nothing new; running work and existing clocks
  continue. New levers still use their own vacancy gates.
- `Engine.today()` remains obligations-only; advice never adds red counts.
- Due starts when raise first holds, including queued matters. Grace starts
  when the late decision is actually answered, not when it first became due.
- Only `settled` closes a matter. Recurrence requires a false-to-true raise.
- No new money mechanic, roster entry, randomness, module or dependency.
- Preserve the cabinet-led Government workspace and untracked root duplicates.
- New prose is plain, exported with `npm run prose`, and named in commits for
  Claude's register pass. New events are appended, not inserted into the pool.
- Run all thirteen checks before each finished batch and push to main.
- Do not delete the brief: step 4's strategy acceptance and ten-sitting slice
  are not part of this authorization.

### Review focus

1. Loading an old save must initialize matters without replaying events.
2. Re-rendering or opening a tab must not admit, pause or advance a matter.
3. A queued late decision displaced by supply must retain its place and gain
   its full grace period after the player finally answers it.
4. Starting a refused or unavailable remedy must not pause any clock; acting
   through the ordinary Government/Economy control must count too.
5. A consequence page with no choices must apply and record its effects once
   in both the browser and `Engine.playSitting()`.

### Task 1: Complete collection and editor plumbing

**Files:** Create `content/matters.js`; modify `content/index.js`,
`content/setup.js`, `index.html`, `editor.html`, `js/schema.js`, `js/editor.js`,
`js/serialise.js`, `js/refs.js`, `js/prosemap.js`, `tools/lint.js`, `tools/prose.js`,
`tools/roundtrip.js`, `tools/renametest.js`, `tools/edtest.js`,
`tools/storymap.js`, and `test.js`.

**Interfaces:** Produce `C.matters`, `C.matterById`, `campaign(id,{matters})`
and the editor's `matters` collection. A remedy has a stable local `id` so
counsel references survive display sorting:

```js
const MATTERS = [];
// Schema example with every reference namespace explicit:
{
  id: "reserve_probe", owner: "treasury",
  raise: { scalarBelow: { solvency: 5000 } },
  note: "The reserve needs replenishing before the next payment.",
  figures: [{ label: "The reserve", source: "scalars.solvency",
              bands: [{ min: 5000, text: "held" }, { min: null, text: "low" }] }],
  remedies: [{ id: "facility", target: { kind: "money", id: "earth",
                  amount: "utilisation" }, takes: 0,
              note: "Open the existing facility drawing." }],
  counsel: [{ post: "treasury", remedy: "facility",
             note: "Borrow while the terms remain available." }],
  due: { after: 3 }, grace: 2, recurs: true,
  late: "reserve_probe_late", page: "reserve_probe_page",
  settled: { scalarAbove: { solvency: 4999 } }
}
```

- [ ] Write a synthetic campaign matter round-trip test, assert the world view
  excludes it, and make the editor open/save preserve all fields and unknown
  future `forecast` data. Run it red before adding the collection.
- [ ] Add the world script before campaign scripts on both pages, index the
  collection and register campaign additions. Derive tool loads from the
  existing HTML script inventory, not another hand-written file list.
- [ ] Add condition, readout, typed-target and counsel editing. Target kinds
  are initiative, instrument, bill and money; order is an existing instrument,
  not a second namespace. Initiative targets may carry `tempo`; money targets
  carry lender and numeric amount or `"utilisation"`.
- [ ] Track raise, due.when and settled as conditions; owner/counsel posts,
  target ids, and late/page event ids as references. Rename local remedy ids
  together with their counsel references.
- [ ] Include matters and their late/page/remedy links in the story map's
  campaign view; prove an added or renamed matter does not leave a stale node
  or silently disappear from the author's map.
- [ ] Reject missing owners/targets, duplicate local remedy ids, broken counsel
  references, nonpositive grace, malformed due, late setpieces, and pages with
  choices or without `queuedOnly`. Preserve `forecast` without interpreting it.
- [ ] Deliberately corrupt each new reference/shape assertion and observe its
  failure. Run editor, lint, rename, round-trip and encoding checks, then the
  full check and commit the independently usable collection.

### Task 2: State, lifecycle and consequence acknowledgement

**Files:** Modify `js/engine.js`, `test.js`, `tools/uxtest.js` and `js/ui.js`
only for choice-free acknowledgement. Read LESSONS Interface and the focus
header before the UI edit.

**Interfaces:** `Engine.matters(st,C)` returns an array of visible matters in
urgency order; `Engine.noteMatter(st,C,id)` sets one aside and returns
`{ok,reason?}`. The internal lifecycle
writer also receives successful lever starts, so it recognizes actions taken
outside the brief. `Engine.acknowledge(st,C,event)` handles genuinely
choice-free setpieces, not decisions or entries whose choices are gated shut,
and returns `{ok,reason?}`.

```js
// Save simulation, never copies of authored notes or bands.
st.matters[id] = {
  state: "waiting", eligibleAt: null, openedAt: null, notedAt: null,
  lateAt: null, pageAt: null, paused: 0, hold: null,
  rearm: false
};
// Migration adds only the table; reconcile owns content identities.
if (st.version < 35) { st.matters = {}; st.version = 35; }
```

Each query row contains `id`, `state`, the live owner/holder, `note`, derived
`figures`, derived remedy `ok/reason/tab`, `counsel`, `remaining`, and optional
`underway` target/landing information. Queries leave the save byte-identical.

- [ ] Write engine fixtures using the existing `ok(label,condition)` pattern,
  world content plus synthetic matters/events, and run them red:

```js
const owner = CONTENT.cabinet[0].id;
const late = { id: "probe_late", queuedOnly: true, title: "Last chance",
  body: "The remedy has not landed.", choices: [{ label: "Wait", effects: [] }] };
const page = { id: "probe_page", queuedOnly: true,
  setpiece: { title: "The consequence" }, title: "The consequence",
  body: "The remedy did not land.", choices: [], effects: [{ flag: "probe_fact" }] };
const matter = { id: "probe", owner, raise: { flags: ["probe_raise"] },
  note: "Act before the deadline.", figures: [], remedies: [],
  due: { after: 3 }, grace: 2, late: late.id, page: page.id,
  settled: { flags: ["probe_done"] } };
const C = Object.assign({}, CONTENT, { matters: [matter], events: [late, page],
  matterById: { probe: matter },
  eventById: { probe_late: late, probe_page: page } });
const st = Engine.newGame(C);
st.cabinet[owner].holder = CONTENT.characters[0].id;
Engine.apply(st, C, [{ flag: "probe_raise" }]);
const raisedAt = st.matters.probe.eligibleAt;
const before = Engine.save(st);
Engine.matters(st, C);
ok("matter queries are pure", Engine.save(st) === before);
Engine.noteMatter(st, C, "probe");
ok("noting leaves the original clock", st.matters.probe.eligibleAt === raisedAt);
```

- [ ] Add v35 state initialization and ascending migration. Reconcile adds
  missing content ids, drops removed ones and preserves simulation fields.
  Test v34 load, deletion, addition, save/load and synthetic-id renaming.
- [ ] Observe eligibility after effects and at sitting boundaries. Admit at
  most once a sitting, order by time to due, then cabinet/content order, and
  never evict. Noted matters retain their clocks; due queued matters enter the
  late-decision queue without requiring admission. Test crowded queues,
  equal deadlines, vacancy after raising and repeated same-sitting updates.
- [ ] Pause only when an existing lever accepts a timely start. Track its
  existing pending work, not a `takes` timer: initiative outcome queue,
  instrument approval, or bill progression. Immediate remedies evaluate
  settlement immediately. Resume unresolved holds on completion or failure;
  test actual starts, refusals, cancellation and partial improvement.
- [ ] Put due pages before decisions; keep dated/required decisions above late
  matters and late matters above the ordinary pool. Do not place late entries
  in the ordinary queue ahead of anchors. Test collision, grace, settlement
  before a queued page, recurrence and one-decision-per-sitting behavior.
- [ ] Project dated matter stages into `Engine.deadlines` and the existing
  calendar using the same clock calculations. Keep advisory dates distinct
  from obligations: a calendar mark must not add to Rise or red tab counts.
  Test that the air deadline remains visible after removing its old `at` field
  and moves with a postponed late decision instead of keeping a stale date.
- [ ] Add acknowledgement for setpieces with an empty choices list. Share the
  existing event recording/effects path with `choose`; acknowledgement must
  not count as the sitting's governing decision. Keep `passOver` for gated
  choices, whose effects must not run:

```js
Engine.acknowledge(st, C, page);
const once = Engine.save(st);
Engine.acknowledge(st, C, page);
ok("acknowledgement is once only", Engine.save(st) === once);
```

- [ ] Use acknowledgement in the UI Continue handler and `playSitting` only
  when `isEvent(e)` and the authored choices list is empty. Assert the page's
  effects, seen record and log appear once; the same sitting still gets a
  decision. Mutate acknowledgement separately in engine and UI to prove tests.
- [ ] Run focused engine/UX tests, mutation probes, all thirteen checks and
  commit the generic foundation without real campaign matters.

### Task 3: Three Flash I matters and the approved air conversion

**Files:** Create `content/campaigns/flash_i/matters.js`; modify
`content/campaigns/flash_i/events.js`, `content/campaigns/flash_i/initiatives.js`,
`content/setup.js`, both HTML script
lists, campaign `guards.js`, `tools/prose.txt` and, only for moved measured
canon figures, `AGENTS.md`.

**Interfaces:** Supply three campaign entries and their late/page event
references using Task A's schema. Owners are Substrate and Thermal, Treasury
and Life Support. Reuse existing order, initiative and lender ids.

- [ ] Capture the pre-change 80-seed results before this content commit. Add
  campaign guards that require three matters, two genuinely different heat
  counsel targets, valid late/page shapes and the early air prices unchanged.
  Run the new guards red.
- [ ] Convert the early heat alert and bill-authority advice into matters;
  retain critical heat and arrears as owed alerts. Heat uses the existing
  15/8 thresholds and reserve uses the existing 5000/30000 readings. Keep
  settlement/raise thresholds in content, not UI literals.
- [ ] Grid counsel recommends the existing paid thermal allocation; Treasury
  counsel recommends the existing smaller conservation appeal to preserve
  money. Spell out that it buys less margin, not that one minister is wrong.
  Use existing prices and political costs; do not rebalance them.
- [ ] Heat/reserve late decisions reuse the existing thermal-squeeze and
  reserve-low choice economics. Their pages report the unresolved shortage
  and its existing simulation consequences; invent no extra death count,
  station failure or financial penalty. Append campaign lifecycle entries and
  prevent their ordinary-pool duplication. Avoid retuning the world entries.
- [ ] Make air's late decision a last-chance CW$2400m payment or refusal.
  Preserve the CW$1600m/one-sitting and CW$600m/three-sitting early remedies.
  Assign the existing air initiative to Life Support through its existing
  `post` field, so that its owning department's vacancy gate applies.
  A timely payment sets the existing paid flag; declining does not settle.
  Preserve the existing failure event id for the choice-free queued page,
  remove its fixed `at:40`, and apply death-related losses only on that page:
  the existing refusal's legitimacy -12, legitimacy trend -2 and standing -8.
  The pre-death payment has no death-related penalty. Preserve the refusal's
  political declaration as its wire, but report the deaths only on the page.
  Start air's numeric due clock on first `station_issue`; use 24 sittings so
  the normal sitting-14 raise gives sitting-38 last chance and sitting-40
  consequence, but displaced decisions retain their full two-sitting grace.
- [ ] Guard paying early, paying late, refusing, competing supply, no duplicate
  air-failure flags and settlement by annexation/other existing crisis ending.
  If a legacy save already records `f1_air_fails`, reconciliation must not
  present those deaths again. Test before/after saves and resumed holds.
- [ ] Export prose, run 80 seeds again and canon guards; report changes rather
  than tuning to achieve an arbitrary loss rate. Break each new campaign guard
  and observe failure, then run all thirteen checks and commit with new notes,
  last-chance wording and consequence-page wording named for Claude.

### Task 4: Sitting advice and existing-lever navigation

**Files:** Modify `index.html`, `js/ui.js`, `css/terminal.css`, `js/focus.js`
only if a matter row registration is needed, `tools/uitest.js` and
`tools/uxtest.js`. Read LESSONS Interface/CSS first.

**Interfaces:** Render Task B's query above the calendar; compose it with
`Engine.today` for a visibly separate owed subsection. Reuse `openTarget` and
the existing advice-dot hook. Navigation never executes the remedy.

- [ ] Add UI tests with synthetic open/noted/held matters; run red. Assert
  minister identity, live readout hover figures, two distinct counsel notes,
  navigation to the exact target and unchanged red counts/Rise advice count.
- [ ] Draw up to four matter cards with stable `data-matter` identity, note,
  readouts, independent deadline, remedies and Set aside. Show underway work
  from the engine. No second full brief inside Government.
- [ ] Match typed targets to existing inspector keys:

```js
const target = remedy.target;
const open = target.kind === "instrument" ? "si:" + target.id
  : target.kind + ":" + target.id;
// Initiative/instrument -> Government; bill -> Chamber; money -> Economy.
```

- [ ] Pass initiative tempo and money presets to the destination without
  starting anything. Preserve ordinary lever controls and allow their existing
  adjustments. A disappeared or unavailable target gives its actual reason,
  never a successful-looking dead link.
- [ ] Set aside calls `noteMatter` then redraws; restore focus to the nearest
  surviving matter or panel, never a detached control. Update quiet dots from
  visible matters only and clear stale ones.
- [ ] Deliberately break every new UI assertion's subject, including each
  branch of compound assertions. Run UI/UX/story-map/full checks and real
  browser layout at the project's seven viewports with intended Windows fonts;
  test four open matters and expanded counsel, not only an empty opening.
  Commit the Sitting panel change and plainly identify new interface labels.

### Task 5: Economy calls and integration handoff

**Files:** Modify `js/ui.js`, Economy markup in `index.html`,
`css/terminal.css` if needed, `tools/uitest.js`, `tools/uxtest.js`, and the
progress note in `briefs/the-brief.md`.

**Interfaces:** An Economy call is an existing `Engine.borrow` action named
by a matter's typed money target, with the same `canBorrow`, facility terms
and confirmation. Open matters provide context; they are not permission to
close the underlying lever when no matter is visible.

- [ ] Run UI tests red for contextual lender/amount selection, adjustable
  presets, matter backlink, no double borrowing, cancellation and ordinary
  borrowing with no open matter. Keep existing repayment tests intact.
- [ ] Move Draw out of the account's balance rows into the calls area. Show
  matter-linked calls first; retain independent access to existing drawable
  facilities, as design/58 requires open levers. Do not add tax/sale/budget
  mechanics or execute from a Sitting remedy click.
- [ ] Delegate drawing to the existing confirmation callback and engine:

```js
const gate = Engine.canBorrow(st, C, amount, lender);
if (!gate.ok) return;
// The existing confirmation callback alone performs this action:
const result = Engine.borrow(st, C, amount, lender);
if (result.ok) drawAll();
```

- [ ] Mutation-test new assertions; run all thirteen checks, the post-content
  80-seed sweep and canon guards. Run real-browser layout for Sitting and
  Economy. Report any browser unavailable, without calling jsdom layout proof.
- [ ] Obtain one independent whole-branch review, resolve findings, rerun
  affected checks, and push the finished batch to main after full checks.
  Mark completed portions in the brief but leave strategy acceptance and the
  ten-sitting slice pending; do not claim contested-counsel balance proven.

### Plan self-review

The five review-focus cases are covered in Tasks B, C, D and E. Task A covers
campaign isolation and authoring round-trip; no UI owns clocks or action
effects. Tasks C/D/E provide the requested three matters and destinations
without rebuilding Government. The strategy claims from the original brief
remain explicitly outside this batch, not silently waived. Test examples use
the repository's existing check style; all proposed public methods are defined
in Task B. Native execution is recommended because the collection, lifecycle
and UI contracts are tightly coupled and the author values usage economy.
