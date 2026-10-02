# 65 — Refined Cabinet desk implementation plan

> For agentic workers: use superpowers:executing-plans for native execution.
> The author approved continuous execution on 1 October, including skipping
> another planning checkpoint. Follow the brief, not the prototype's data.

**Goal:** Put Government's business list beside a roomy work file, with a
compact permanent Cabinet and record utilities sharing the file area.

**Architecture:** Keep the existing content-derived departmental renderers,
engine gates and confirmation callbacks. Reuse their rendered controls in
the inspector rather than introduce a second action implementation. Focus
owns work selection; Shell preferences retain only campaign-scoped bookmarks.

**Tech stack:** classic JavaScript, static HTML/CSS, jsdom checks, real Edge
through the repository's prepared Chromium layout probes. No build step.

**Spec:** `briefs/refined-cabinet-desk.md`, retired with the implementation;
the original brief remains available in Git history.

## Global constraints

- Finish the already-started Economy calls batch before touching Government.
  Work on the existing Codex branch; preserve the author's root duplicates.
- No content, schema, simulation-state or engine changes in this overhaul.
- Preserve every existing action and gate, including dismissal, protected
  posts, candidates, running answers, approval, prayer, revocation and reading.
- Interface labels are plain drafts. Name additions in commit messages.
- Never execute work while inspecting it or navigating from Sitting.
- Keep independent column scrolling and the seven existing layout viewports.
  Quiet space below short content is intentional; do not invent filler.
- Keep the single document opener and its trap/return-focus handling.
- Run all thirteen checks before each implementation commit. Deliberately
  break each new test's subject and require the intended assertion to fail.

## Review focus

1. Real vacancy: selecting it opens candidates once in the work file;
   cancellation leaves the vacancy, and appointment updates the live roster.
2. Existing running work survives vacancy and remains inspectable without a
   second Start action. Test the real queue and answer sitting.
3. Selecting an order opens only its file actions. Making/approving/revoking
   still uses the existing gates; document Read retains its keyboard trap.
4. Record utilities retain the selected work and its position. Return to work
   restores it, while Close file does not auto-select another item on redraw.
5. Sitting routes retain the exact lever and requested tempo. At narrow widths
   Back to business restores scope and scroll without changing simulation.

## Task 1: Cabinet, business list and right-hand work file

**Files:** `index.html`, `css/terminal.css`, `js/ui.js`, `tools/uitest.js`,
`tools/uxtest.js`. Modify Shell only if its existing preference path cannot
hold the validated campaign bookmark; no new save state.

**Interfaces:** Keep `govPreferences(admin)`, `setGovOpen(id,open)`,
`drawGovWorkspace()`, `drawGovInspector()`, `revealGovFile()` and
`openTarget(button)` private to UI. Use `Focus.selected/seed` for the typed
work key (`initiative`, `si`, `running`, `post`), not a third selection store.
Legacy initiative/order renderers must read the same key. Preserve stable
control ids and retain the original engine action handlers.

- [ ] Add real-UI tests before changing markup: the file has a separate
  desktop pane outside the list, inspecting is simulation-neutral, list rows
  contain no execution buttons, and all execution controls are in the file.
  Example boundary assertion:

```js
const before = w.eval('Engine.save(UI.state())');
head.click();
ok('inspection never executes work',
   w.eval('Engine.save(UI.state())') === before);
ok('business rows only inspect',
   !$('#gov-business [data-make], #gov-cabinet [data-make]'));
ok('the selected file owns Make once',
   w.document.querySelectorAll('#gov-inspector [data-make]').length === 1);
```

- [ ] Reshape Government into the existing compact Cabinet rail, bounded
  business panel and independent file panel. Keep live party labels/portraits.
  Reduce the department header to orientation and existing minister controls;
  remove the repeated large portrait/banner. Default to All government.
- [ ] Replace separate open-file variables with the Focus-owned typed key;
  retain only explicit valid campaign bookmarks through Shell. Closing clears
  the key and returns focus to the originating visible item, not another file.
- [ ] Use existing initiative and instrument details/actions in the file.
  Remove action duplicates from list rows, including hidden duplicates.
- [ ] Add inspectable queue-backed running work. Move existing appointment
  candidates after their handlers are attached; requery candidates on click.
  Preserve dismissal and protected-post explanations in compact orientation.
- [ ] Test all review-focus cases 1–3, changed holders, missing work, redraw,
  campaign/tab return, and exact Sitting initiative tempo. Confirm all new
  assertions catch their named faults, run check, commit the complete desk.

## Task 2: Records as file utilities

**Files:** same files; retain existing `pp-list`, `gov-owed`, `pp-tribunal`,
`gov-pres` content containers and the Papers renderer. No Papers rewrite.

**Interfaces:** `drawGovRecords()` derives current counts after
`Papers.render()`, updates native utility buttons, and exposes only the active
record in the right file panel. Record selection is separate from the retained
work key. Returning clears the record selection, not the work bookmark.

- [ ] Write failing tests for opening one utility, no work execution, exactly
  one visible record surface, retained work on return and work scroll position.
- [ ] Move the four record surfaces into the right-hand panel behind the
  utility toolbar. Keep their ids, original callbacks and document reader.
  Replace old auto-open/fold assertions with explicit selection/return tests;
  retain assertions for real pending counts and signing/undertaking behavior.
- [ ] Test document Close/Escape/Tab return paths from both Register and order
  Read. Mutation-test the assertions, run check and commit the utility move.

## Task 3: Responsive behavior, browser verification and integration

**Files:** Government CSS/markup/UI, its tests, Government probes only in
`tools/laycheck.js`, Government description only in `AGENTS.md`, and delete
`briefs/refined-cabinet-desk.md` in the final implementation commit.

- [ ] Write failing tests for a content-derived department selector and Back
  to business preserving the selected department, active work and position.
- [ ] At medium width use the selector above business/file columns. At narrow
  width show business or its open file with a labelled Back control. Keep
  headings visible and every scrolling pane reachable and escapable.
- [ ] Run real-browser geometry assertions: file starts to the right of the
  business panel on desktop; all posts are reachable; long file text scrolls;
  no page horizontal escape. Exercise opening, vacancy, running work, records
  and trusted Tab/Shift+Tab/Enter/Space interactions at existing viewports.
- [ ] Run the thirteen checks, the prepared game/editor layout probes at all
  seven viewports and the actual responsive interactions. Report unavailable
  Firefox automation rather than infer cross-browser proof from jsdom.
- [ ] Get the native execution's one independent whole-branch review. Fix
  important faults test-first and rerun the complete suite on frozen source.
- [ ] Update Government's AGENTS description, remove the completed brief in
  this same commit, and push the fully checked batch to main. Preserve the
  unfinished wider strategy/ten-sitting brief; do not claim those completed.

## Self-review

The brief's workspace, selection/actions, records, space/responsive and
acceptance sections map to Tasks 1, 2, 3, 3 and all three respectively.
The five review-focus cases have owning tasks and observable UI assertions.
The Economy prerequisite prevents unrelated dirty edits entering desk commits.
No new public engine interface or setting content is required.

## Execution record — 2 October 2026

Tasks 1–3 were implemented as one Government-only batch. The shared selection,
file and responsive contracts made intermediate presentation commits less
useful than a single verified change. No engine or campaign content changed.

Verification includes twenty-six deliberately broken renderer/markup cases,
an independently broken desktop grid placement, and a broken selection-marker
style. Each failed its intended assertion before restoration. The independent
whole-batch review found appointment focus loss on narrow screens and missing
office/running-row selection markers. Both were repaired test-first; actual
Treasury dismissal reproduced the same focus fault and received the same fix.
The full-suite selection-ownership check caught a ninth generic selection
class writer. Highlights now paint the Focus-derived accessible pressed state
directly, preserving the eight original table-selection writers.
The final staged source passes all thirteen checks, with zero unexpected
failure lines. All fourteen prepared game/editor layout runs report zero
findings, and the native browser checks pass at all five responsive sizes.

The normal layout launcher cannot collect Edge's output on this Windows host.
Its unchanged seven game/editor viewport probes instead run in disposable
Playwright Edge contexts. Windows resolves Arial Narrow, Arial and Consolas,
the author's intended faces. Native interaction checks cover five sizes,
including 390px, cancellation, real appointment/dismissal, starting work,
record return and retained reading/list positions. Firefox remains unverified.

Draft interface wording for Claude: Government records; Department;
All government; Office details;
the appointments suffix; Back to business; Return to work; Select business to
read its terms and available actions; No business in this department; This
appointment is no longer available.

Rulings: use the existing named development checkout without extra isolation;
combine the three presentation tasks into one batch; review the frozen diff
against 693bf4f before committing; report Firefox as unverified; keep the
already-deployed ministerial/Economy work outside this review; use the full
campaign guards but no new balance baseline for a presentation-only change;
delete the brief and publish only after final verification. These trade-offs
leave Firefox-specific and unrepresented cross-panel interactions possible,
and may change player behavior despite unchanged simulation rules. No review
minors are deferred: row-selection indication was upgraded and fixed because
it is necessary for the approved list/file orientation.
