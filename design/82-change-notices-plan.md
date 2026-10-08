# Change notices implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task. Author review precedes implementation.

**Goal:** Every decision's change to a field displayed elsewhere has a truthful, clickable notice on Sitting.

**Architecture:** Move the source of change evidence from the interface into the engine. Compare detached projections of displayed state, return notices from `Engine.apply`, and add a decision wrapper without changing `Engine.choose`'s existing string result. Keep the existing numeric outcome table; persistent structural cards carry item navigation. The coverage check independently inventories state changes rather than calling the production differ to predict its own answer.

**Tech stack:** Existing no-build JavaScript closures, jsdom harness, Node checks, browser layout check.

**Spec:** `briefs/codex-handoff.md` E9; `briefs/act-one.md` Stage 1 finding 3, E9 and exit gate 5.

## Constraints

- Engine code names no concrete event, party, station or campaign.
- No canon, roster or Act I content changes. Plain new UI wording is listed for Claude's register pass.
- Keep `Engine.choose(st,C,event,index)` returning its current string or null; callers and test fixtures already rely on it.
- Notices describe actual changes, not authored intentions. Clamps, refusals and unchanged assignments do not claim success.
- No source editing during any check. Every new assertion is break-tested.
- Keep deterministic play and save shape unchanged: notice collections are transient return values, not save fields.
- The two-card transient notification cap must not truncate the full decision's visible notice collection.

## Review focus

1. A decision's own effects, choice effects, slot cost and settlement may all change displayed fields.
2. Removed items and revoked orders need navigation to their current record, not a missing active-list row.
3. A clause change can leave its bill's stage unchanged; comparing stages alone misses it.
4. A refused or clamped effect must not produce a success notice; unrelated real changes still get notices.
5. Duplicate writes and a value changed then restored must not create duplicate or misleading final-state cards.

## Task 1: displayed-state inventory and engine notices

**Files:** `js/engine.js`, `test.js`, `tools/noticecheck.js` (new), `design/82-change-notices-plan.md`.

**Interfaces:** Add `Engine.noticeSnapshot(st,C)` and `Engine.noticeChanges(before,after,C)`. `Engine.apply` returns an array of `{kind,tab,id,summary}`. A notice may additionally carry `fields` (covered state paths) and `open` (the existing navigation token); the required four fields remain intact.

- [ ] Grep each tab renderer for state reads. Record an explicit inventory in `tools/noticecheck.js`: displayed fields, derived dependencies, destinations, and intentionally hidden bookkeeping. Do not use `Engine.snapshot`: it omits structural changes and several displayed values.
- [ ] Confirm the inventory includes cabinet holders, bills and clauses, instruments, promises, lending facilities, prices and fiscal readings, stations, party/current loyalty, relationships and coalition membership, ledger balances, leadership signatures, initiative progress, calendar work and live advice. Inspect whether Foreign Affairs has mutable displayed state and include it if so.
- [ ] Add direct tests before implementing, using existing fixtures and content identities:

```js
const before = Engine.noticeSnapshot(st,C);
Engine.apply(st,C,effects);
const notices = Engine.noticeChanges(before,Engine.noticeSnapshot(st,C),C);
ok('a changed clause has a Chamber item notice',
  notices.some(n => n.kind === 'clause' && n.tab === 'cham' && n.id === bill.id));
```

  Separate assertions exercise each inventory category, removal, refusal, clamp, repeated writes and unchanged state. Each fixture obtains ids from content rather than typing campaign names.
- [ ] Implement detached primitive projections keyed by content ids and stable state paths. Derive titles from content and destinations from generic entity kinds; do not store live object references in the snapshot.
- [ ] Wrap the existing `apply` body with before/after projections. Preserve unknown-effect errors, counting and `syncMatters` behavior; return `[]` for an empty/no-op application.
- [ ] Add `Engine.chooseWithNotices(st,C,event,index)`:

```js
function chooseWithNotices(st,C,event,index) {
  const before = noticeSnapshot(st,C);
  const result = choose(st,C,event,index);
  return {result,notices:noticeChanges(before,noticeSnapshot(st,C),C)};
}
```

  This includes settlement and costs while preserving every existing `choose` caller. Eligibility/refusal semantics remain those of `choose`.
- [ ] Run focused engine tests. Remove a producer branch and confirm its assertion fails; restore it. Mutate a snapshot to retain a live reference and confirm the detached-snapshot assertion fails. Confirm seeded outcomes match the unchanged engine.

## Task 2: Sitting cards and item navigation

**Files:** `js/ui.js`, `js/motion.js`, `css/terminal.css` only if required, `tools/uitest.js`, `tools/uxtest.js` only if required.

**Interfaces:** The decision handler consumes `{result,notices}`. Cards feed `data-goto` and `data-open` through the existing `openTarget` item router; unsupported entity kinds gain generic router branches.

- [ ] Add UI assertions for a decision with more than two structural changes, a clause-only change, an appointment and a removed/revoked item. Check the cards are visible, not merely present as hidden text.
- [ ] Replace only the decision handler's `Engine.choose` call with the wrapper. Keep `lastResult`, `lastChanges`, cues, saves and outcome progression unchanged. Reset the transient notice array wherever `lastChanges` is reset.
- [ ] Render all structural notices in the decision outcome, with tab name and item summary. Escape every content title and id. Keep numeric deltas in the existing table; do not add a second table of identical readings.
- [ ] Reuse the existing motion reveal for cards. Cards remain readable and clickable with reduced motion or no Motion global. Remove the old decision-only structural notification source so the same change is not announced twice; other lever notifications remain untouched.
- [ ] Reuse `openTarget` for `bill`, `post`, `si`, `initiative`, `money`, `party` and `matter`. Add routes for promises, station details and other inventory categories, with visible-record fallbacks when an item is no longer active. Keyboard activation must work without triggering gameplay.
- [ ] Break each new selector, click route and reset assertion before trusting it. Run interface and interaction checks without source edits while they run.
- [ ] Run layout, inspect Sitting at 1920x1000 and 1366x768, and inspect a long notice set with reduced motion. Record screenshots and any remaining clipping.

## Task 3: independent sampled-path coverage gate

**Files:** `tools/noticecheck.js`, `package.json`, `tools/check.js`, `briefs/codex-handoff.md`, `briefs/act-one.md` status only.

**Interfaces:** `node tools/noticecheck.js` exits nonzero if any independently inventoried displayed field changed without a corresponding notice. It reports the seed, event, choice and state path.

- [ ] Run actual campaign decisions under the five existing answer strategies, with seeds from the established playtest tools. Snapshot independent displayed-field projections immediately before and after each decision, including settlement. Every legal answer should also be exercised in branch fixtures; sampled strategies alone may miss a choice.
- [ ] For each changed path, require a notice covering that path and a valid destination/item. Audit each effect verb as visible-changing or hidden-only; a newly introduced verb or unclassified changed state path fails the check rather than silently dropping out.
- [ ] Hold the visible projection independently from production code. Explicitly reviewed hidden fields include bookkeeping such as `seen`, `lastFired` and log storage; do not blanket-ignore a subtree that also contains displayed data.
- [ ] Break-test by stripping an actual clause notice, an appointment notice and a settlement notice. Plant a visible change in a branch not chosen by the first-option strategy and confirm branch coverage catches it. Each mutation must make the gate exit nonzero with the precise path.
- [ ] Add `noticecheck` to the bounded suite and its truthful denominator. Keep existing eighteen checks; the new gate becomes an additional check, not a replacement.
- [ ] Run full checks and layout against frozen source. Record timings, break-test evidence and new plain wording in the commit message. Update E9 status and release its claim in the finishing commit; push normally only when green.

## Author review before implementation

The existing numeric table already reports a number's change. This plan counts that as its notice, with coverage metadata and a destination added where needed, and uses separate cards for structural changes. It does not duplicate every numerical row as a card. Confirm this reading of “each as a card”, or require one card per numeric change too.

The engine inventory must be exhaustive before code is written. The list above is the audit scope, not a claim that all current renderer dependencies have already been mapped.
