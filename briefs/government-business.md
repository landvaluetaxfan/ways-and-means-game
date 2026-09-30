# Government: active business and cabinet directory

**Lane: Codex. Design for Harper's review, 30 September 2026.**
Harper chose an active-business overview plus a cabinet directory, with
care not to duplicate the Sitting brief. This replaces the full-width
department-accordion presentation, not the department ownership model.
Approve this design before producing the implementation plan.

Read AGENTS.md, LESSONS.md's Interface and CSS sections, PROSE.md's
Interface section, design/61's Government section, design/62 and
design/64. This brief changes the Government presentation described by
those records; their engine, vacancy and advice rules still apply.

## Purpose and boundary

Government answers: what can this government do, what has it started,
and who is responsible? Sitting answers: what needs attention now, why,
and whose advice should be taken?

| Government | Sitting |
|---|---|
| Powers currently available, with their real costs and procedures | Ministerial notes, live readings and competing counsel |
| Initiatives under way and instruments awaiting parliamentary approval | Matter urgency, Set aside and escalation |
| Vacancies and appointment candidates | The sitting's decision, page and owed docket |
| Cabinet composition and departmental responsibilities | The campaign's current story |
| Register, undertakings, Tribunal and Presidency | The combined news and decision feed |

Do not render full matter cards in Government. When the matter engine
exists, an action may carry a short link to its related advice in Sitting.
Its title and destination suffice; do not copy the note, counsel, figures
or countdown. Before that engine exists, omit this affordance entirely.
Nothing here adds to Rise's count or manufactures an obligation.

## Screen structure

Use two primary columns on a wide screen:

- The larger column is **Government business**. It has a compact
  vacancy section, **Under way**, and **Available powers**.
- The smaller column is **Cabinet**. It holds the whole directory in
  content's seniority order, including the Prime Minister first.
- A secondary records area follows the business in the larger column.
  Register, Undertakings, Tribunal and Presidency are independent drawers.
  Their headings and genuine pending activity remain visible when folded.

Do not recreate the old four-column layout. Avoid a third fixed-width
document rail squeezing either working region. Wide monitors do not
stretch prose to the full business-column width: costs and controls sit
beside the work's title, not against a distant screen edge.

At narrow widths, stack Government business, Cabinet, then the records
area. Reset grid placements at the same breakpoint; no implicit tracks.
Use content-driven breakpoints, checked in real browsers, rather than a
browser-specific layout. Keep the existing terminal colours, fonts and
document-reader overlay.

## Business overview

**Vacancies** show the post, the mechanical restriction already in force,
and an Open department button. A vacancy without declared candidates is
still shown; do not imply it can be filled. Candidate details and the
appointment action remain in the department detail, with confirmation.
Hide this section when there are no vacancies.

**Under way** lists initiatives with an actual queued answer and orders
awaiting approval. Show owner, present status and the existing answer date
or sitting where known. Never treat a started flag alone as pending work,
or an instrument already in force as unfinished work. A vacant owner does
not erase an initiative running or an instrument already laid.

**Available powers** lists eligible, unstarted initiatives and unmade
instruments. It is a catalogue of available government powers, not an
urgency ranking or a recommendation. Group by the authored department,
in cabinet order, and keep content order within each group.

Each compact work entry shows its title, owner and existing cost or
procedure. Opening it reveals the authored explanation, tempo choices or
instrument details, and existing controls. Use one shared renderer and
action-binding path; the overview and department detail must not become
separate implementations of the same lever.

An action eligible in the story but temporarily unaffordable remains
visible with its existing refusal reason. Actions whose story gate is
closed are omitted. Department vacancies suppress new work, as the engine
already requires. An awaiting-approval order lives only in Under way;
making an instrument must move the entry instead of leaving a duplicate.

Use a short empty-state sentence for an empty Under way or Available
powers section. Do not insert dummy business or invented consequences to
fill the screen. No red badge for mere availability.

## Cabinet directory and department detail

Keep every department visible as a compact directory entry. The closed
entry shows department, holder and party, with a clear vacant marker.
Avoid printing the same ordinary relationship phrase on every entry.
Keep the current relationship reading accessible in the expanded detail;
this pass changes neither its value nor its bands.

Opening a department reveals its minister, relationship, existing
appointment or dismissal controls, and departmental work. Work is grouped
as in the overview. Instruments already in force or revoked remain
inspectable here and in the Register, with their actual status, even
though they are not active business.

Allow several departments to remain open for comparison. Reuse the
existing per-campaign Shell preference for their folds. Do not auto-open
every busy department, move directory entries when state changes, or
override a player's explicit fold on each redraw.

Overview entries and outside links use the existing typed targets
(`si`, `order`, `initiative`, `post`) through one opener. They open the
relevant work in its department and focus it. An unavailable target lands
on that department's summary with an explanation; an unknown target lands
on the Cabinet heading. Opening or browsing alone never executes a lever.

## Ownership, records and implementation boundaries

Read ownership from instrument `author` and initiative `post`. Unassigned
work stays under the Prime Minister with the existing lint warning. Do not
infer ownership from role strings or names. The remaining initiative
assignments belong to the ministerial-content work; this layout pass does
not silently change who can start an initiative while a post is vacant.

Register keeps the shared accessible document reader. Undertakings retain
their existing terms and destinations. Tribunal and Presidency retain
their existing controls. Drawer headings may show a pending count only
when derived from that institution's actual state; no count of historical
documents should masquerade as something owed. Remember explicit folds
for the session. Initially open drawers with actionable pending business,
and fold quiet records; preserve explicit player choices after that.

Files for the implementation plan: index.html, css/terminal.css, js/ui.js,
tools/uitest.js, tools/uxtest.js, tools/laycheck.js and tools/storymap.js
if its Government model requires updating. Update AGENTS.md's Government
description when the interface ships. Do not alter js/engine.js, schemas,
the editor, canon, campaign balance or ownership content for this pass.
If the overview cannot be derived from existing engine results, record
the missing contract here rather than invent a second rule in the UI.

Plain new interface labels and empty-state wording must follow PROSE.md;
name them in the implementation commit for Claude's later register pass.
Do not add reputation, forecasts, new ministers or new government powers.

## Acceptance and review

- At the opening, the vacant Treasury is visible without searching the
  cabinet. Existing available work is visible without opening nineteen
  departments. No ministerial note is repeated from Sitting.
- Starting an initiative produces exactly one pending entry; after its
  answer lands that entry disappears. It survives its owner's vacancy.
- Making an affirmative order moves it to pending work; approval resolves
  that state. In-force and revoked records remain inspectable elsewhere.
- Temporarily unaffordable work explains its refusal. Gated work and new
  work owned by a vacant department cannot be started from either view.
- Opening work from the overview, Sitting, an undertaking or the Register
  reaches the right entry. Each actual action has one listener and one
  confirmation. Cancellation has no simulation effect.
- Focus, department folds and scroll position survive redraws and tab
  changes. If work vanishes, focus returns to a meaningful surviving
  heading or owner entry. No disabled control traps keyboard navigation.
- Test long names, long explanations, all departments open, several
  running initiatives, multiple vacancies and record drawers open. Measure
  wide, laptop and narrow viewports with real-browser probes, including
  the Firefox-style scrollbar path. Inspect actual Firefox where possible;
  the emulated path is not a claim of Firefox verification.
- Before trusting each new check, break the behavior it asserts and see
  it fail. All thirteen npm run check checks must pass. Run npm run layout,
  using the attached-browser probe workflow if Chromium is unavailable.
- Develop on a branch, delete this brief with the final implementation,
  and push the checked batch to main under Harper's standing authority.

Self-review: this is a UI-only slice. It preserves department ownership,
stable cabinet order, existing lever execution and the owed/advised split.
Its pending-work signals come from simulation, never from invented advice.
