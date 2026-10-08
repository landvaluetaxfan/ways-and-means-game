# Engine-owned test fixtures

8 October 2026. Codex. The author approved the approach in chat. This written
design is awaiting review; implementation has not started.

## Purpose and boundary

Complete job 5 of `briefs/codex-handoff.md` and rule 3 of "How old text leaves
the build" in `briefs/act-one.md`. Engine and interface tests need their own
scenarios before the retired world's story can leave the game's source files.
The itch build currently removes that story with `tools/storystrip.js`.

Keep Act I's behaviour, authored text and reference rosters unchanged. Add no
engine verb, state field, migration, character or post. This is a test-data
and loading-boundary change. The determinism rule in bible §1.5 is LOCKED.

## Chosen approach

Create test-owned scenarios under `tools/fixtures/`, archive the original
world-only story, then remove the release-time source stripping. Preserve
scenario ids and ordered arrays during this migration because engine tests
already address those ids and seeded selection depends on position.

Loading the archive directly would keep tests dependent on retired writing.
Keeping the packaging filter would leave retired story in the source page.
Neither completes the handoff's requested boundary.

## Fixture contract

The fixture owns the rule-bearing parts of its scenarios: gates, scheduling,
flags, effects, choices, dependencies, initial setup and administration data.
It uses the canonical reference rosters through the existing content loader.
It does not inherit its opening, locks, reveals or ending from Flash I.

Use explicit test labels for narrative fields. Preserve string-valued rule
fields, including ids, flag names, condition values and effect arguments.
Identify display fields by their schema and readers before changing them;
do not remove strings recursively. Where a check asserts rendered wording,
replace its expected fixture wording while retaining the behaviour it checks.
Keep functions as JavaScript; JSON serialization cannot preserve them.

The engine profile preserves the current `test.js` scenarios. The interface
profile includes the additional parked scenarios the current harness uses.
Both profiles are test-only and get fresh mutable copies when loaded. Keep
their current ordering and relationships. Do not simplify the scenario set
or rewrite its ids while separating it from authored content.

## Loading boundaries

- `tools/testkit.js`: authored loading remains available for campaign guards
  and content checks. The engine test view comes from the explicit fixture.
  Existing callers of `world()` can retain their API during the migration.
- `tools/harness.js`: normal DOM checks inject the interface fixture through
  an explicit test-only path. `HARNESS_REAL=1` continues to load only the real
  game. Replace the current retagging of parked content and the copied Flash I
  administration with the fixture's own data.
- Content checks continue to inspect every authored campaign. Fixtures must
  not make a missing campaign entry appear present in authored data.
- Game and editor script lists never load `tools/fixtures/` or the new archive.
  Do not put fixture defaults or scenario names into `js/engine.js`.

Inspect callers that reach content globals as well as callers of `world()`.
Tests must explicitly obtain fixture entries; changing globals to make tests
pass must not hide the actual contents of the shipping page.

## Archival boundary

Inventory world-only entries by kind and source before changing arrays. An
untagged story entry, or one tagged only for `world`, is a candidate. Preserve
entries shared with a real campaign, including `campaign: ["world", "flash_i"]`.
Reference collections remain live.

Move retired entries, including their leading comments, under
`content/archive/world/`. Adapt the existing archival tooling to prove each
original entry was preserved byte-for-byte; do not overwrite files in
`content/campaigns/parked/`. Keep original tags and functions in the archive.
The source arrays retain shared entries in their original relative order.

Review lint, prose export, editor serialization, rename checks and story-map
readers after the move. Archive entries are preserved history, not live
authoring data. Re-export `prose.txt` through its existing tool when the live
content inventory changes. Do not edit Act I paragraphs to fix tooling.

## Release and acceptance

After fixtures and archival work, the normal page's data contains no retired
world-only story. Remove the call to `tools/storystrip.js` from the release
builder. Preserve the existing exclusion of `data-dev` parked scripts and the
playtest frame. Release inspection checks the actual resulting data, not just
a few retired phrases or the existence of a stripping pass.

Required evidence:

1. Record the pre-change engine and DOM scenario inventories and test results,
   plus the real Act I 80-seed report.
2. Break each new boundary assertion: leak a fixture into the page, omit a
   fixture dependency, leak an archived entry, and drop a shared campaign
   entry. Confirm each assertion fails for its intended cause.
3. Existing engine and DOM checks pass with the independent fixtures. Verify
   changes to retired authored story cannot change the fixture profile.
4. Byte-preservation checks cover every archived entry and its comments.
5. The real Act I 80-seed report is unchanged. All full-suite checks pass;
   no assertion is removed to accommodate the archive.
6. Run layout and inspect the packaged game in a real browser, including a
   cross-origin itch-sized frame, save/load and play to the curtain. Fixtures
   and archives appear in neither the normal page's script graph nor the zip.

Run checks against a stable tree, with no source edits while they execute.
Push finished implementation batches only after the full suite passes.

## Outside this design

The Promises tutorial card, the campaign curtain frame, Act I's two remaining
setup-token substitutions and its prose review remain separate handoff jobs.
The existing curtain's stale Sitting heading is recorded; this migration
does not repair it. New unresolved design cases go into the handoff brief.
