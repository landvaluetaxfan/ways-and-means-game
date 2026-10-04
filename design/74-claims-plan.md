# 74 — Claims implementation plan

4 October 2026. Scope: `briefs/leverage-claims.md`, steps 1 and 2 of design/68.
Bible §7.6 is LOCKED and explicitly says the numeric ledger thins while named
claims persist. No OPEN or thin canon section governs this mechanic.

## Existing undertaking reads and writes

Line numbers refer to the starting revision of this plan. The references below
include direct state access and the content vocabulary that produces it.

| Place | Current use |
|---|---|
| `js/engine.js:221,349-350` | Initialise and migrate the array. |
| `js/engine.js:3229,3308-3311,3833` | Read a signed promise; create a win-back promise and a lobbying promise. |
| `js/engine.js:4345-4347` | Evaluate outstanding and breached conditions. |
| `js/engine.js:4884-4907` | `undertake` writes an entry; `discharge` marks it kept. |
| `js/engine.js:5475-5530` | Settle, list open entries, and break overdue entries. |
| `js/engine.js:5741-5742,5825,5859` | Describe an effect and count outstanding promises in the change report. |
| `js/engine.js:7702-7786` | Find where a promise is kept and put its deadline on the calendar. |
| `js/engine.js:8418,8604,8823` | Check promises at the period end, prorogation, and dissolution. |
| `js/ui.js:820,2010,2306,2698,3073-3109,5160,5283` | Read promise state for the player interface, including the existing Undertakings panel. No panel changes in this stage. |
| `js/shell.js:269` | Read kept/breached entries for achievements. |
| `js/schema.js:141-147,207-208,234-235` | Describe the `undertake` and `discharge` effects and promise conditions. |
| `js/editor.js:163,168-175,330-355,460-462` | Enumerate undertaking ids; preserve a JSON undertaking through form read/write. |
| `js/serialise.js:22-44,47-58,170-177` | Serialize any effect fields; document the authored vocabulary in generated headers. |
| `js/refs.js:203-206,226,294` | Track ids within authored undertaking effects for safe rename. |
| `content/achievements.js:91`, `content/campaigns/flash_i/guards.js:42-125,192-224,294,604-607` | Read the named carve-out and loan promises in content checks. |
| `test.js:785,1116-1121,1973-2026,2703-2804,3108-3109,4585-4588,5272-5276,5842-5854` | Fixtures and assertions for promise creation, deadline, discharge, and breach. |
| `tools/edtest.js:289,297-301`, `tools/laycheck.js:441-465`, `tools/uitest.js:141-149,676-681,917-919`, `tools/uxtest.js:1516-1547,1677-1698,1991-1992` | Editor and interface fixtures. |
| `tools/lint.js:871,887,933-937,1146,1158`, `tools/storymap.js:90-91,136`, `tools/playtest.js:16` | Reference checks, story graph, and transcript context. |
| `index.html:102,136` | Existing Undertakings button and panel; unchanged. |

## Claim shape and behavior

Keep the array and the current effect verbs. Add `holder`, `kind`, `direction`,
`expects`, optional `limit:{when,then}`, and `origin` to each entry. An authored
promise defaults to kind `promise`, direction `owed`, and `expects` equal to
`text`. Preserve `owed_to`, `post`, `by`, `discharge`, `onBreach`, `made`, and the
existing fulfillment behavior so the live carve-out reads the same in play.
Allow `called` for a holder's request. A breach creates a separate claim in the
same array, held by the original holder with direction `against`, without
changing the current breach effects or interface. The exact legacy mapping for
`holder`, `origin`, and fulfilled-state spelling is awaiting clarification.

## Save and content vocabulary

Reserve version **36** for this change. Add an ascending `if (st.version < 36)`
migration that fills missing claim fields on old undertakings and creates a
grievance for each already broken one, without requiring content. New entries
use the same normalisation. Extend the `undertake` schema template and editor's
JSON form support for all fields; update the serialiser's vocabulary comment.
No Flash I content or story text changes.

`setup.fade` is a content-owned fraction, defaulting to 0.5. Export
`Engine.fadeLedger(st, C, span)` without calling it from the sitting loop. It
moves signed `capital[partner]` toward zero and returns `{party,before,after}`
rows. `span` is accepted for the synthetic interval and future interval report;
the interval worker will decide when to invoke this function.

## Verification

1. Save the 80-seed playtest transcript before implementation; compare it
   byte-for-byte with the after transcript.
2. Test new and migrated promise fields, the carve-out's state shape, the
   grievance on breach, and editor/schema/serialiser preservation of fields.
3. Test a synthetic interval with ledger +3 and an open promise: fade the
   ledger, assert the promise is unchanged, deliberately mutate the fade to
   alter claims and confirm the test fails, then restore it.
4. Run guards and all of `npm run check`, then rebase on main and rerun the
   necessary checks before landing.

## Built (Claude, 4 Oct evening: Codex's usage ran out after this plan)

Steps 1 and 2 of design/68, as planned, with these decisions:
- **Fulfilled state stays `kept`**; `called` is added. design/68 now says so.
- **`holderKind`** is `party`, `current`, `post`, `actor`, or `person`. A legacy
  promise owed to a named member (`owed_to`) is held by that person; the claim
  fields are filled from `post` or `owed_to`, and the kind is resolved from content
  in `reconcile`. Authored claims should name a party, current, post or actor.
- **Grievances live in `st.grievances`**, not in `st.undertakings` as the plan first
  proposed: an entry in the promise array would be listed and counted by every
  reader that walks it (the Undertakings panel, Relations, the docket's owed count).
  `Engine.claims(st)` returns both. A grievance is `{ direction: "against", state:
  "held", origin: <the broken promise's id> }`.
- **`origin` is `null`** until authored; nothing threads a source through `apply()`.
- **`Engine.fadeLedger(st, C, span)`** thins `capital` by `setup.fade` (default 0.5,
  per interval) and never touches a claim. It is not yet called by anything: the
  interval engine calls it.
- `STATE_VERSION` is 36; the migration fills the fields and grieves for promises
  already broken. `js/refs.js` renames a `holder`. Verified: the 80-seed playtest is
  identical to the baseline, `npm run check` passes, and the fade test fails when
  the fade is made to touch a claim.

