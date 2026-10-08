# Engine-owned fixture implementation plan

> For agentic workers: use superpowers:executing-plans for native execution,
> or superpowers:subagent-driven-development if the author chooses delegation.
> Complete and verify each task before proceeding to its dependent task.

**Goal:** Give engine and interface checks independent scenarios so retired
world story can be archived and removed from the game's source data.

**Architecture:** Test-only JavaScript owns the two scenario profiles. The
existing content loader supplies canonical references and real campaign
views. An archival tool preserves original source chunks and proves the move;
the release builder then inlines clean source without stripping story arrays.

**Tech stack:** Plain JavaScript, Node, the existing Acorn parser, jsdom and
the existing real-browser layout runner. No new runtime dependencies.

**Spec:** `design/84-engine-fixture.md`, approved by the author on 8 October
2026. This plan awaits the author's review and execution-method choice.

## Global constraints

- Keep Act I's behaviour, authored text and reference rosters unchanged.
- Add no engine verb, state field, migration, character or post.
- Preserve scenario ids and ordered arrays during this migration.
- Keep functions as JavaScript; JSON serialization cannot preserve them.
- Game and editor script lists never load `tools/fixtures/` or the new archive.
- No source edits while checks execute. Do not change the dirty primary clone.
- Claim implementation files separately before touching them. Notify Claude
  before editing the content-reader sections of held test tools; do not edit
  Act I content. Release the claim when the finished job lands.

## Review focus

1. Shared world/Flash I entries remain live and in the same relative order.
2. DOM fixtures carry their own government, including no Act I ending or locks.
3. Duplicate ids across parked and world source retain the harness's current
   resolution and array order; do not merge profiles by an id-keyed object.
4. Fixture copies retain functions and nested effect arguments, and mutations
   in one test do not affect another test or authored campaign data.
5. Archive comments and multiline literals survive exactly; script graphs and
   the bundle exclude fixture/archive data without a packaging-only filter.

## File map and interfaces

- Create `tools/fixtures/engine-data.js` and `interface-data.js`: independent
  profile factories, each returning fresh `{story, setup, administrations,
  sandbox}` data. Each story property is an ordered array. These files own
  test scenarios and are never loaded by either HTML page.
- Create `tools/fixtures/contracts.js`: frozen pre-migration ordered ids and
  operational-field expectations for both profiles, exported as `baseline`.
  Contract checks use this captured oracle, not the data factory they check.
- Create `tools/fixtures/index.js`: browser-compatible `EngineFixture` object
  with `build(referenceContent, profile)` returning a reindexed content view.
  In Node it also exports that object. Supported profiles are `engine` and
  `interface`; reject other names. Its browser form has no `require()` call.
- Modify `tools/testkit.js`: `world()` uses `EngineFixture.build(all(),
  "engine")`; `all()` and `view(id)` remain authored loaders. `views()` keeps
  coverage of every real administration, with the fixture explicitly named.
- Modify `tools/harness.js`: inject the three fixture scripts only in fixture
  mode, replace its retagging/copying block, and preserve `HARNESS_REAL=1`.
- Create `tools/fixturetest.js`: export `run()` and support direct execution.
  Invoke it from `test.js` so it is part of the existing full-suite engine job.
- Modify `tools/park.js`: export its parser/range helpers under a main-module
  guard; preserve its existing CLI and parked destination behaviour.
- Create `tools/archiveworld.js`: `inventory(root)` returns ordered records
  `{file, list, kind, id, start, end, raw, shared}`; CLI `--dry` reports the
  candidates, `--write` archives/removes candidates, and `--verify` checks the
  archived chunks against the stored hashes and inventories.
- Create `content/archive/world/<kind>.js` and `manifest.js`: preserved source
  chunks and their `{file, kind, id, ordinal, sha256}` provenance. They are
  historical files and have no page script tags.
- Modify the inventoried `content/*.js` story arrays, `tools/build.js`,
  `tools/itchtest.js`, and affected live-content readers only. Update
  `prose.txt` through its exporter, `AGENTS.md`'s fixture descriptions and the
  handoff status. Keep the broader handoff brief.

## Task 1: Capture and verify independent profiles

**Files:** Create the four `tools/fixtures/` files and `tools/fixturetest.js`;
modify `test.js` only to call the new contract check. No source story removal.

- [ ] Record a fresh full-suite baseline and the real 80-seed report outside
  the repository. Inventory the engine world view and current DOM fixture
  view, including ordered ids, effects, scheduling, setup and administrations.
  Use the current harness as the DOM oracle before changing it.

  ```powershell
  $env:NODE_PATH='C:/Users/led19/Documents/orbital/node_modules'
  npm.cmd run check
  node tools/playtest.js --seeds 80
  ```

- [ ] Write failing profile contract checks, then run
  `node tools/fixturetest.js`. Assert fresh copies, exact ordered inventories,
  unchanged operational fields and a government independent of Flash I.

  ```js
  const a = EngineFixture.build(authored, "engine");
  const b = EngineFixture.build(authored, "engine");
  assert.notEqual(a.events, b.events);
  assert.notEqual(a.events[0].choices, b.events[0].choices);
  assert.deepEqual(a.events.map(x => x.id), baseline.engine.events);
  assert.deepEqual(a.events[0].choices[0].effects,
                   baseline.engine.firstChoiceEffects);
  const dom = EngineFixture.build(authored, "interface");
  const admin = dom.administrations.find(x => x.id === "harness");
  assert.equal(admin.setup.actEnd, undefined);
  assert.equal(admin.setup.locks, undefined);
  assert.equal(admin.setup.reveals, undefined);
  ```

- [ ] Produce static, independently owned JavaScript profiles from the
  baseline. Preserve object expressions for rule-bearing fields. Replace
  only inventoried display paths: entry title/body/summary/note/closing,
  choice label/note/result, bill effect descriptions and amendment display
  fields, business text, minute subject/body, and setpiece page text. Record
  the exact path list before transforming it. Preserve ids, speakers, costs,
  acts, dates, gates, effects and campaign-routing fields. Fixture wording
  uses deterministic labels identifying kind/id/path, with no new canon.

  ```js
  const assert = require("node:assert/strict");
  const EngineFixture = require("./fixtures/index.js");
  const baseline = require("./fixtures/contracts.js");
  // fixturetest.js obtains authored content through loadcontent.js.
  const authored = require("./loadcontent.js").loadContent();
  ```

- [ ] Build the profile by replacing story arrays, setup and administration
  data on a fresh reference-content copy, then call the existing view builder
  to rebuild lookup maps. Copy arrays/objects recursively and retain functions:

  ```js
  function copy(v) {
    if (Array.isArray(v)) return v.map(copy);
    if (v && typeof v === "object")
      return Object.fromEntries(Object.entries(v).map(([k,x]) => [k,copy(x)]));
    return v;
  }
  // The overlay is a fresh profile factory result; references are copied too.
  const model = Object.assign(copy(referenceContent), overlay.story, {
    setup: overlay.setup, administrations: overlay.administrations,
    sandbox: overlay.sandbox
  });
  return referenceContent.forCampaign.call(model, {id:"world"});
  ```

- [ ] Add tests for a function-valued rule, nested-copy isolation and duplicate
  id order. Mutate the authored world's first event and Flash I's setup;
  confirm fixture profiles are unchanged. Restore those probes in memory.
  Deliberately break one fixture gate, remove a dependency and reverse a
  seeded array; confirm the named contracts catch each break. Run the full
  suite before committing/pushing this independently usable fixture batch.

## Task 2: Move test consumers to the fixtures

**Files:** `tools/testkit.js`, `tools/harness.js`, `test.js`,
`tools/fixturetest.js`; change other consumers only where inventory finds an
explicit dependency on the former world test view.

- [ ] Add failing checks that the engine test view is independent and the
  real view remains authored. Record the harness's profile and compare its
  operational inventory with Task 1's DOM baseline.

  ```js
  const T = require("./testkit.js");
  const realActBefore = {events:T.view("flash_i").events.map(x => x.id)};
  // Capture realActBefore before invoking or mutating either fixture profile.
  assert.deepEqual(T.world().events.map(x => x.id), baseline.engine.events);
  assert.deepEqual(T.view("flash_i").events.map(x => x.id), realActBefore.events);
  assert.notEqual(T.world().events, T.all().events);
  ```

- [ ] Route `world()` to the engine fixture. Keep `all()` as raw authored
  content; replace test references to former world globals with explicit
  fixture references. Content-validation assertions still inspect every real
  campaign, and fixture-only checks do not assert the shipping content exists.

- [ ] In the harness, load profile factories and the builder through `w.eval`
  only when `HARNESS_REAL` is unset. Replace the legacy world/parked retagging
  and copied Flash I setup with the interface profile. Preserve the current
  fixture menu behaviour. Do not change `js/ui.js` for fixture loading.

- [ ] Assert real-mode harness contents equal the authored campaign view.
  Change Flash I's opening/ending/locks in an isolated probe and confirm the
  fixture profile stays identical. Deliberately enable injection in real
  mode and confirm that boundary assertion fails.

- [ ] Run `node test.js`, `node tools/uitest.js`, `node tools/uxtest.js` and
  `node tools/actwalk.js`, sequentially or under the existing check runner.
  Verify all former rule assertions still execute. Update expected neutral
  fixture wording without removing behavioural assertions. Run the full
  suite before committing/pushing the consumer migration.

## Task 3: Archive world-only story with proof

**Files:** `tools/park.js`, `tools/archiveworld.js`, the inventoried top-level
story files, `content/archive/world/`, `tools/fixturetest.js`, affected
content-reader sections, `prose.txt`, `AGENTS.md`.

- [ ] Export Acorn/range helpers from `tools/park.js` without executing its
  CLI on import. Test `archiveworld.inventory()` on an isolated small source
  containing comments, a multiline literal, a function and these tags:

  ```js
  const source = `const EVENTS = [
    /* retained comment */ {id:"old", body:\`line one\nline two\`},
    {id:"world_only", campaign:"world", when:function(){return true;}},
    {id:"shared", campaign:["world","flash_i"]},
    {id:"live", campaign:"flash_i"}
  ];`;
  // Write only inside a fresh temporary test directory.
  const records = archiveworld.inventory(tempRoot);
  assert.deepEqual(records.filter(x => !x.shared).map(x => x.id),
                   ["old", "world_only"]);
  ```

- [ ] Implement static tag classification. Untagged and world-only story
  objects are removable; shared/live entries remain. Reject unsupported tag
  expressions and duplicate archival destinations with explicit errors.
  Write raw entry chunks with leading comments into archive arrays. Preserve
  existing tags and function expressions. Store SHA-256 and original order
  in a JavaScript manifest. Modify source ranges from last to first.

- [ ] Run `--dry` against the checkout and review every source/kind/id against
  the release stripper's former inventory. Confirm shared entries are excluded
  from removals. Run `--write`; verify each archived raw chunk, including
  comments, against both the baseline and manifest. Repeating the migration
  must report no candidates and leave archive files unchanged.

- [ ] Test changed archive bytes and comments, dropped shared data, duplicated
  entries and reordered survivors. Each mutation must fail its named assertion.
  Inspect all page/model loaders so archival files stay out of live data;
  preserve editor, rename, reference and campaign-validation coverage.
  Re-export prose with `npm.cmd run prose` after the source inventory changes.

- [ ] Run the full suite and compare real Act I's 80-seed report byte-for-byte
  with Task 1. Update only fixture/loading documentation. Commit and push the
  verified archive batch with archived counts and byte-proof results.

## Task 4: Remove packaging surgery and verify the release

**Files:** `tools/build.js`, `tools/itchtest.js`, `tools/fixturetest.js`,
`briefs/codex-handoff.md`; retire `tools/storystrip.js` only after finding and
replacing every remaining consumer. Keep `data-dev` exclusion intact.

- [ ] Add independent checks of source-page/model script graphs and the
  unpacked release. Assert no fixture/archive scripts are loaded and no
  world-only story entries exist in the source or bundle data.

  ```js
  assert.equal(LC.scriptsOf("index.html").some(p =>
    /^tools\/fixtures\//.test(p) || /^content\/archive\/world\//.test(p)), false);
  for (const k of storyKinds) {
    assert.equal(authored[k].filter(x => x.campaign == null ||
      [].concat(x.campaign).every(c => c === "world")).length, 0);
  }
  // Apply the same data predicate to the unpacked page's evaluated CONTENT.
  ```

- [ ] Remove the builder's `strip()` import/call and its removal-count output.
  Keep ordinary source inlining, parse/error checks, assets, parked exclusions
  and `window.PLAYTEST`. Keep retired-phrase checks as additional coverage;
  the entry/script checks must not depend on the builder's implementation.

- [ ] Deliberately leak one fixture script, one archived entry and one untagged
  story entry into isolated page/bundle probes; each new assertion must fail.
  Run `npm.cmd run check` and `npm.cmd run layout` on a stable tree.

- [ ] Inspect the packaged game in a real browser at 1920x1000 and 1366x768,
  plus a 960x640 cross-origin frame. Play menu to curtain, save/load, inspect
  screenshots and console/network results. Compare the final 80-seed report.
  Record any existing curtain issue without changing that separate job.

- [ ] Update the handoff's completed job 5 and loading descriptions, release
  the claim, and push the checked batch. Keep the handoff brief for its other
  jobs. Report commits, suite/layout results, archive counts, determinism
  comparison, browser evidence and any unresolved questions.

## Execution gate

The design is approved. The author must review this plan and choose native
or subagent-driven execution before product edits begin. Native execution is
recommended because the profile, consumer and archive tasks share sequential
contracts; use one independent review of the completed migration.
