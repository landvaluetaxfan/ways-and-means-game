**Lane: Codex.** Draft for Harper's review, 30 Sep 2026. **Do not execute
until Harper approves this brief.** This implements the Government-page
design discussed after the tab repairs in `3ac8ec2`.

Read `AGENTS.md`, `briefs/README.md`, and `LESSONS.md`'s Interface and CSS
sections first. Read `js/focus.js`'s header before changing focus behavior.
The department and vacancy rules remain those in `design/61-the-tabs.md`
and `design/64-answers-to-codex.md`, answers 9 and 10.

## Purpose

Government should let the player survey the cabinet, identify available
and running work, and act through the department that owns it. The current
two-column card grid stretches a quiet department to match its busy
neighbor and prints empty Instruments and Initiatives headings. Replace
that grid with a vertical register of expandable department cards.

Keep the workstation style, department ownership, and content's seniority
order. This is an interface change using existing simulation data.

## Scope and files

- `index.html`: Government markup, supporting folds, remove the separate
  Appointments panel.
- `css/terminal.css`: Government's department register, summaries, expanded
  business and responsive behavior. Leave unrelated panels alone.
- `js/ui.js`: Government rendering, populated sections, appointments,
  fold restoration, and navigation to a department or its work.
- `js/shell.js`: a player-preference default only if required; use the
  existing options writer for persistence.
- `js/focus.js`: only if the existing focus API cannot preserve identity
  for department summaries and appointment controls. Extend that API
  rather than introducing another selection or focus store.
- `tools/uitest.js`, `tools/uxtest.js`: behavior and keyboard regressions.
- `tools/laycheck.js`: measure expanded and collapsed department layouts;
  keep the tab list and order unchanged.

No engine, schema, content, canon, save-shape or editor changes. Do not
implement `briefs/the-brief.md` here. If a requirement needs new simulation
data, record the question in this brief instead of inventing it.

## 1. The department register

- One card for the Prime Minister, then one per live content cabinet post,
  in content order. Use a single vertical column, including on wide screens.
- Each card has a native disclosure summary: department name, current
  holder with the existing party mark and relationship wording, or VACANT.
  Use flexible wrapping so a long name cannot displace the controls.
- Show quiet counts for nonempty kinds of work: available instruments,
  available initiatives, and initiatives under way. Derive these from the
  same entries the expanded card renders. An initiative under way belongs
  only in the running count; do not count it twice. Omit zero counts.
  These are descriptions, not red obligation badges or advice dots.
- Keep character links and Dismiss actions in the expanded body, rather
  than nesting interactive controls inside the disclosure summary. The
  holder's plain name remains visible when closed.
- Several cards can be open together. Opening one never closes another.
- No equal-height partners, empty headings, fixed card heights, or blank
  regions reserving space for future matters and forecasts.

## 2. Defaults and memory

- With no recorded preference, the Prime Minister and vacant departments
  start open; other departments start closed. Their summaries still reveal
  available and running work.
- Persist explicit open/closed choices in player preferences, scoped by
  `st.admin` and post identity. Keep the Prime Minister preference separate
  from authored post keys. Use `Shell.options` and its existing setter;
  never put this presentation state in the game save.
- An explicit choice overrides defaults, including closing a vacancy.
  Toggling persists that choice without redrawing the entire tab. Rendering
  restores it without treating synthetic toggle events as user input.
- Repeated rendering, tab changes and save reloads preserve choices.
  Ignore malformed preferences and ids absent from the current roster.
- Filling a vacancy keeps that department open and restores focus there,
  even when the appointment button disappears. Normal state updates do not
  reopen departments the player closed.

## 3. Expanded business and appointments

- Retain the existing instrument detail, Make/Approve/Read controls,
  initiative options, running status and Dismiss behavior.
- Render Instruments only when its table contains visible entries. Render
  Initiatives only when there are available entries, and Under way only
  when there are running entries. Do not add generic empty-state paragraphs.
- Classify business with the existing engine results. Preserve all actions
  currently visible, including instruments already in force and running
  initiatives whose post later becomes vacant.
- A vacancy keeps its existing explanation of the restriction. Place its
  candidates, notes, effect descriptions and appointment buttons inside
  that department. Reuse `Engine.candidates`, the existing confirmation and
  `Engine.fillPost`; keep one listener and one execution path per action.
- A vacant post with no candidates remains visible and explains its
  existing restriction; do not invent candidates or imply it is fillable.
- Remove `#gov-appoint-panel` and the old centralized renderer. Update
  consumers and tests; grep for both old appointment ids before removing
  them. There must be no duplicate candidate lists or silent null writes.

## 4. Supporting column and navigation

- Keep the Register open in the right-hand column, with its existing
  document reader. Preserve the modal's keyboard trap, backdrop dismissal
  and return-focus behavior through every entry point.
- Make Undertakings a fold. Initially closed when empty and open when
  populated; after the player toggles it, honor that choice for the session
  rather than forcing it open on every render. Existing obligation counts
  continue to communicate outstanding promises.
- Retain the Tribunal and Presidency folds. At the existing narrow-screen
  collapse, supporting panels follow the department register in page flow.
- Update existing instrument/order destinations so they first open the
  owning department, then open, scroll to and focus the target. Resolve
  ownership from content; unassigned work belongs to the Prime Minister.
- Give vacancy entries in the Sitting's docket an explicit post target;
  following one opens that department and focuses its first appointment
  button, or its summary if there is no candidate.
- Provide the same interface navigation path for initiatives and for a
  department alone, ready for the matter brief to call later. These are UI
  destinations, not engine verbs. Do not create matter cards or advice data.
- Programmatic navigation may open a closed target department and record
  that choice. It leaves every other department's fold unchanged. If a
  target no longer exists, land on its surviving department summary where
  ownership is still known; otherwise on the Departments heading. Do not
  silently focus the document body or open a different lever.

## Delivery order

1. Add failing behavior tests; implement the register, populated sections
   and fold preferences. Check before committing.
2. Add failing appointment and navigation tests; move appointment choices
   and make destinations reveal their owning departments. Check before
   committing.
3. Exercise keyboard, focus, modal and responsive layouts; fix measured
   faults, run the final checks, and finish the brief in the last commit.

Keep the existing game playable at each commit. Any new player-facing
wording must be plain, follow `PROSE.md`'s Interface section, and be named
in its commit message for Claude to revise. Reuse existing wording wherever
possible. Counts use live data and labels, never authored numeric literals.

## Acceptance

- The opening shows every post in seniority order, with the Prime Minister
  and the vacant Treasury open. Quiet departments are compact summaries.
  The Treasury's candidates appear there exactly once.
- Open departments with different amounts of business have their own
  content heights. Empty section headings are absent. Summary counts agree
  with expanded contents before and after an action.
- Closing a card, rerendering, switching tabs and reloading a save preserve
  its choice. Two administrations do not overwrite each other's choices;
  malformed stored preferences do not prevent the game from booting.
- A fixture with a running initiative and an instrument in force retains
  both when the department becomes vacant, while new work stays blocked.
  A fixture with two vacancies places each candidate under the right post.
- Clicking and keyboard activation both disclose departments. Character
  links, Dismiss, appointment confirmation/cancellation and instrument
  controls still work without accidentally toggling the containing card.
- A successful appointment removes that post's candidates and keeps its
  card open with focus on a surviving control or summary. Canceling does
  not change the holder or fold state.
- Instrument, initiative and vacancy links reveal a previously closed
  department and land on the intended target. A removed target follows the
  specified fallback. Unrelated folds and scroll positions remain stable.
- Register documents retain Escape, both Tab boundaries and return focus.
  Repeated rendering and opening do not accumulate handlers or run an
  appointment twice.
- Before trusting each new assertion, break the behavior and observe its
  failure. Use mutated fixtures for vacancy and ownership cases; do not
  alter canon content to make a test pass.
- `npm run check`: all thirteen pass before each commit. Canon guards
  remain unchanged. No state-version bump is needed.
- Measure game layouts at the seven existing layout sizes with defaults,
  all departments open, and a populated undertaking fold. Check the editor
  too because the stylesheet is shared. Include an extra 640px-wide game
  check. Verify the Firefox scrollbar-wrapper path as well as Chromium.
  No clipping, empty grid tracks or implicit columns; keyboard targets must
  be visible inside opened cards. If CLI Chromium is unavailable, use the
  identical locally served `laycheck --prepare` probes in an attached
  browser and state that substitution in the report.

After approval and execution, delete this brief in the same final commit
as the completed work, and publish the checked batch to main under the
standing deployment instruction. Report commits, test results, layouts
actually measured, any browser not verified, and wording for Claude.
