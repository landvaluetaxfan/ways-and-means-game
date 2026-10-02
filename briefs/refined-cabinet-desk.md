**Lane: Codex.** Written 1 October 2026 from the author's approval of the
Refined Cabinet desk prototype. This is the design brief, not authority to
change the game's mechanics. Implementation has not started.

## Why this change

The cabinet-led Government tab works, but remains confusing. Its business
list stretches across the screen; opening work puts the explanation below
that list and moves the action out of its row. The cabinet, business, open
file and institutional drawers read as a stack, not a workspace.

The author chose the Cabinet desk structure, with the Business desk's
generosity toward the file. A large minister banner was rejected because
it repeats identity and spends height. The author explicitly accepts quiet
space below short columns: do not manufacture information to fill it.

This brief supersedes the current Government arrangement only. Advice,
decisions and their deadlines remain in Sitting; Government is where the
player examines and uses existing powers. No repeat of the Sitting brief.

## Read first

- `AGENTS.md`, `briefs/README.md`, and `LESSONS.md` Interface and CSS/layout.
- `design/64-answers-to-codex.md`, answers 9 and 10, for ownership and
  vacancies. Existing running work survives a vacancy.
- Government's existing renderers and routes in `js/ui.js`; grep first.
  Read the header of `js/focus.js` before changing focus handling.
- `PROSE.md` before drafting any player-facing interface wording.

The approved prototype is `refined-cabinet-desk.html` in this chat's
visualizations. Its roster illustrates all nineteen posts. Its business
entries, candidate summaries and text are illustrative, not a new content
source; do not copy its lists into production.

## The workspace

Desktop has three stable areas, in reading order:

1. **Cabinet:** a compact permanent rail in content's seniority order.
   Portrait, minister name, department and labelled party colour identify
   each post. Preserve vacancies and all posts; do not show only a handful
   to make the layout look good. No new relationship scores or invented
   reputation data. Reuse actual portraits and their existing fallbacks.
2. **Business:** a compact selectable list for the chosen department, or
   all government. Show appointments, work under way and available powers
   as distinct groups, only when populated. Retain existing running-work
   information and pending approval destinations. Empty departments get
   one useful empty-state note, not rows of empty headings.
3. **Work file:** the largest reading area, to the right of the list. Its
   heading, explanation, existing effect/cost/time information, procedure,
   availability reasons and action controls belong together. Use the
   existing explanatory content, not a newly inferred simulation summary.

Start a new preference context on **All government business**; remember
the player's explicit department selection on tab round-trips and saves.
Selecting a department filters the list without starting or stopping work.
Its heading names the department and current holder, without a large banner.

Give the cabinet a bounded width, the list a bounded readable width, and
the file the remaining useful width. Do not allocate equal thirds or let a
long title stretch the list. The prototype's dimensions are a reference,
not mandatory pixel values. Text must remain readable at laptop widths.

## Selection and actions

- Clicking a business item selects it and updates the right-hand file.
  The row remains visibly selected; nothing is appended beneath the list.
- Rows carry title, type and useful existing status/time information. They
  do not carry a second Make/Start/appoint action. All action controls for
  the selected work live in its file, so an action never appears to vanish
  when a row opens. Preserve all necessary options, including initiative
  tempos, instrument revocation and appointment candidates/consequences.
- Identify the file's responsible department and live minister compactly.
  Replacing or removing a minister updates the identity and gates without
  leaving a stale face, name or usable action.
- Every existing Government route, including a Sitting matter's remedy,
  opens the exact target and correct department, preserving any authored
  tempo. Navigation does not spend slots, execute a lever or affect a clock.
- Closing a file clears its open state without clearing department
  selection or resetting the business-list position. If its item ceases
  to exist, clear the stale file safely and explain real unavailability.
- Rendering never chooses a different file merely because available work
  changed. A saved explicit selection may be restored only if still valid.

## Records are utilities, not another column

Register, undertakings, Tribunal and Presidency have compact, labelled
controls outside the cabinet/business/file content, like the prototype's
toolbar. Selecting one shows its existing content in the file area. Preserve
every existing reading, referral, appointment, assent and document action;
this is a relocation, not a cut to what those panels do.

The selected work and its reading position remain remembered while a
record is open. **Return to work** restores that file; it does not silently
choose a new item. Keep record selection distinguishable from work
selection. There is no permanent full-width stack of four drawers beneath
the business. Preserve the original document reader and its focus trap;
opening a document through the Register must still use the same opener.

## Space, scrolling and small screens

The game still takes the available viewport. Cabinet, business and file
contents scroll independently as needed, with headings and orientation
remaining visible. Selecting a file must not scroll the list or move the
cabinet. Long text and all nineteen posts must remain reachable.

Natural quiet space below short content is acceptable. Do not stretch
rows, enlarge portraits, add explanatory filler, duplicate advice or invent
charts to occupy it. Distinguish quiet space from a broken grid track,
content accidentally hidden, clipped controls or an oversized title banner.

When three readable columns no longer fit, use a labelled department
selector plus business/file side by side. At narrower widths the file
replaces the list, with **Back to business** preserving scope and list
position. Do not squash three columns into unreadable widths. Essential
actions and record controls remain available without hover.

## Scope and files

Allowed production files: `index.html`, `css/terminal.css`, `js/ui.js`, and
`js/shell.js` only if existing Government preference storage needs extending.
Use `Shell.opts` for view preferences, never simulation state.

Checks: `tools/uitest.js`, `tools/uxtest.js`, and Government-specific probes
in `tools/laycheck.js`. Do not change other tab layouts, the tab order or
viewport definitions to make a check pass. Update only the Government
description in `AGENTS.md` when the implemented layout changes its contract.

No engine, schema, campaign content, economics or canon changes. Preserve
open levers independently of advice and existing vacancy gates. Any new
interface labels are plain drafts, named in the commit message for Claude's
register pass. If existing APIs cannot supply something, record the question
here rather than adding a rule or fabricated reading.

Keep this separate from the unfinished ministerial-advice/Economy batch.
Preserve that work and the author's root duplicates. Do not silently stage
unrelated edits into the Government implementation commit.

## Acceptance

- All posts and live occupants appear; selecting each scopes its own work.
- Selecting work opens one right-hand file, not a detail below the list.
  Switching items replaces it and retains the list position.
- Actions appear once, in the file, and still use existing confirmation and
  engine paths. Opening, closing and switching files are simulation-neutral.
- Appointments, initiative tempos, running work, affirmative pending
  approvals, negative orders, revocation and unavailable cases remain usable
  or correctly gated. Exercise actual content, not only a two-row fixture.
- Register and each other record retain their actions; returning restores
  the selected work and scroll. Documents preserve their keyboard trap.
- Real direct navigation from Sitting reaches the exact Government lever
  and focus target without executing it.
- Department, file and record navigation survives redraw/tab round-trips.
  Changed occupants, a vacancy and removed targets do not leave stale UI.
- Keyboard users can select, close and return using trusted Enter/Space,
  Tab and Shift+Tab. Focus stays visible and useful after replacements;
  each scrolling region can be entered and left.
- Inspect opening, long-file, running-work, vacancy/appointment and record
  states in a real browser at the existing layout viewports. At narrow
  widths, verify Back to business rather than accepting clipped columns.
- Break each new test's subject and confirm it fails before trusting it.
  Run all thirteen checks and layout on the final source. Record browser
  and font availability honestly; Opencode's successful old-layout keyboard
  audit at `81e8e9b` is a baseline, not proof of this new layout.

Delete this brief in the commit that finishes the implementation, after
the author's approval of the written design and implementation plan. Push
the finished, fully checked batch to main under the standing authorization.
