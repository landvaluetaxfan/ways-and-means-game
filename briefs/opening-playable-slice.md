**Lane: Codex, with author review of design/prose. Planning draft,
3 October 2026. Execute after review of `design/66-advice-measurement.md`.
The author decided the boundary question on 4 October (see "Author
decision" below); read design/66 and that section, then begin.**

# Flash I: prove the opening loop

## Goal

A short continuous stretch of the actual campaign should let a player
pursue Flash's inherited programme, buy support knowingly, set aside
credible advice, and recognise a later consequence of that choice.
This implements design/58 Round I, not Stage 4's four-year expansion.

**Architecture:** reuse the campaign's existing decisions, promises,
ministerial matters, initiatives and orders. Improve the missing links
between them in content and existing interface surfaces. Do not create a
parallel quest system, a demo campaign, new simulation, or another
Government layout. Flash I specifics remain in its content.

**Tech stack:** existing content registration, vanilla JS interface and
engine, campaign guards, jsdom checks and real-browser layout checks.

**Authority:** AGENTS.md; Bible §1.8, §2.6, §2.7, §7.6–7.8, §12.13 and
§13.2 (all LOCKED); design/58 Round I and Flash I section;
design/62; design/64. The thin areas are playable payoff timing and
legibility. The later 2080–84 chronology rewrite is deliberately excluded.

## Proposed slice boundary — author decision

Recommend a continuous opening through sitting 24, with roughly ten
important interactions rather than ten total sittings. Preserve the Works
stranding at sitting 14 and all existing air deadlines. This includes the
opening, the first recess and the first rescue/bargaining consequences.
The full campaign remains playable afterward; no new "slice ending".

The measurement batch must first establish when credible contested advice
actually occurs on normal play paths. If no natural path exposes it and a
traceable payoff by sitting 24, record that finding before changing content.
Choose explicitly between extending the test window and adjusting existing
content timing; do not lower thermal capacity or reorder events to force
exposure. Sitting 24 is a proposed test boundary, not a new canon date.

**Review question:** approve this boundary in preference to a compressed
ten-sitting rewrite? Implementation must not silently settle that choice.

**Measured finding, 3 October:** design/66 finds no live contested heat
advice by sitting 24; first exposure is between 32 and 48 on the measured
policies. Approve either a credible earlier competing-advice case around
existing opening business, or a longer continuous test window. Do not
silently move the Works or lower opening thermal capacity to force it.

## Author decision — 4 October 2026

The author chose **the licensing carve-out as the first contested matter**, in
preference to extending the test window to sitting 48 or adding a new early
heat case. The contested heat matter stays as the later one. Recorded by
Claude from the author's answer; the specification below is Claude's, so
verify it against content and play, and write any question into this brief.

**Why the carve-out** (decide cases not covered here by these reasons):
- It is the opening's one real bargain. The panel's votes carry the bill
  through the functional members, which buys support. It creates an
  obligation (SI 2080/45, with its dated promise) and it costs the partner
  the bill was meant to satisfy. This is design/58 Round I's question, "whose
  future leverage am I creating by getting my way today?", in the content
  that already exists. No new currency is needed.
- Neither side is foolish. That is what teaches judgement instead of
  obedience (design/62).
- It falls before the Works strands at sitting 14, so a first-time player meets
  contested advice in the opening, not a third of the way in.

**The two sides.**
- **Keep the votes.** The Chief Whip (Devi) and the Life Support minister
  (Vidyasagar, of the Trades Left): the panel's votes decide whether the bill
  carries, so approach the panel and, if it offers terms, take them.
- **Keep the partner.** The Deputy Prime Minister (Trottier, of the NPP),
  whose party joined the government for this bill: state the government's
  position on the threshold, and refuse any terms that keep copies off the
  licence. The cost of refusing is real: without the panel's votes the bill
  fails (`ch2_carveout_price`, the bold choice).

**What to build.**
- A matter on the carve-out in `content/campaigns/flash_i/matters.js`, with
  `counsel` for the second side (design/64 and the matter schema). Its
  remedies are existing levers: the initiatives `approach_guild` and
  `state_the_position` are the natural pair, and design/58 already names
  Devi and Trottier as their ministers. Choose the owner and counsel posts
  from `content/cabinet.js`. If no cabinet post fits the Chief Whip, ask
  rather than invent one: the rosters are frozen (bible §2.7).
- Raise it between the approach to the panel and the price decision, if play
  shows such a window (Task 1 finds the real dates). If the two fall in
  immediate succession, write the question and propose where the matter is
  raised.
- Both remedies cost something the player can read before acting, and the
  note on each is in the minister's own voice, plain, naming what they
  protect and what it costs the other side. Draft the wording for Claude's
  register pass. Do not call either remedy right.
- Refusing both and doing nothing stays playable. The matter then reaches
  its late decision (`ch2_carveout_price`) as the existing pages do.
- The consequences are the existing ones: the dated promise and its
  Registry resignation, the NPP conference, the bill's fate. Do not add a
  currency, a reputation or a new simulation.

**What to measure.** The contested-advice exposure by sitting 24 on the
natural paths, owner and dissent, before and after (design/66's method). If
exposure is still low, say so as a finding; do not tune it away.

The "Proposed slice boundary" above is superseded where it differs:
continuous test through sitting 24, with the contested carve-out inside it.

## Playtest window and priority — 4 October 2026

The author wants a human playtest of the opening as soon as it can be made
sound, aimed at **5 October**. That sets the order of work here.

**The window is sittings 1 to 16, to the first recess.** On the first-option
run (`node tools/playtest.js --log brief --sittings 40`) the opening falls
as follows:
- sitting 3: the whips' count of the Divergence bill;
- sitting 5: the twelve signatures, and sitting 7 the whip list;
- **sitting 8: the Life Support panel's offer** (`gb_approach`), the carve-out;
- sitting 13: the Registry resignation; sitting 14: the order never laid;
- sitting 15: the Works strands, and `f1_works_air` is the first matter that
  advice raises, one sitting before the recess;
- sitting 16: the House rises for the first recess.

The **contested carve-out matter must therefore be raised before sitting 8**,
around sittings 5 to 7, so that a tester meets advice before the bargain and
not after it. Today the first advice a player meets is at sitting 15.
Verify these dates on the other policies, since they depend on the route.

**Batch A is the minimum for the playtest. Do it first and push it.**
1. Task 1's evidence map, written into design/67. **Do not stop to wait for
   review**: write it, note any question in the brief, and continue. Claude
   reviews it after the push.
2. The contested carve-out matter, with `counsel`, inside the window.
3. The empty-brief orientation: sitting 1's brief must say what it is for,
   and the first matter must arrive early enough to be met in the window.
   Wording is drafted plainly for Claude's register pass.
4. Guards for both sides of the bargain and the refusal (Task 4's first
   bullet), and the 80-seed sweep before and after.

**Batch B waits for the first playtest's findings:** Task 3's advice-to-
receipt audit beyond reproducible faults, the rejected-advice callbacks, the
`design/67` playtest prompts in full, and the Firefox/Edge scrolling checks.
Do not start Batch B until Claude or the author says the playtest is done.

## Experience and non-goals

1. **The inherited programme:** carry the Divergence bill and hold the
   coalition. Establish this before explaining every institution.
2. **The political obstacle:** the functional majority cannot be bought
   into existence by simply whipping the coalition harder.
3. **The price:** the licensing carve-out buys support and creates an
   obligation, while antagonising the partner the bill was meant to satisfy.
4. **The disruption:** the Works arrives as a competing responsibility,
   not a replacement for all earlier political commitments.
5. **Judgement and consequence:** costly thermal protection versus a
   smaller cash-preserving remedy; prompt shipment versus slower manufacture;
   or a kept/broken licensing promise. The player sees what their own route
   caused without being graded or told that one minister was "correct".

Not every playthrough must take the carve-out, ignore advice or suffer a
failure. Different routes must preserve the choice to refuse. A consequence
may be lost support, a delayed programme or a smaller safety cushion, not
necessarily a disaster. Later air failure is tested in full-run guards,
not forced into the slice.

No new characters, institutions, ending, blanket tab locks, mandatory
tutorial actions, bargaining currency, reputation system or full campaign
chronology rewrite. Keep ordinary levers open. Do not duplicate Sitting
advice in Government or expose hidden ending grades.

## Files and boundaries

- Modify `content/events.js` only for existing opening decisions and their
  existing follow-ups. They currently live here; do not move their whole
  collection into the campaign as incidental cleanup.
- Modify `content/campaigns/flash_i/events.js` for existing Works decision
  notes/results and narrowly necessary consequence content.
- Modify `content/campaigns/flash_i/campaign.js` only for immediate programme
  orientation in existing presentation blocks, not the historical rewrite.
- Modify `content/campaigns/flash_i/matters.js` and `initiatives.js` only
  where the approved evidence map demonstrates a missing explanation.
- Modify `content/campaigns/flash_i/guards.js`: scripted playable routes.
- Modify `js/ui.js`, `tools/uitest.js`, `tools/uxtest.js` only for proven
  gaps in existing advice/action/result navigation and feedback.
- Modify `tools/laycheck.js` only to add occupied slice states to its
  existing probes; no browser-launcher overhaul in this batch.
- Modify `tools/prose.txt` through `npm run prose` after content edits.
- Create `design/67-opening-slice-evidence.md`: beat map, routes, evidence,
  prose handoff and remaining questions, not another work list.
- Modify `briefs/the-brief.md` when its slice acceptance is resolved.

No planned engine/schema/save or CSS/index structure changes. If the slice
needs them, write a specific scope-extension question here before doing it.

## Task 1 — Establish the beat and evidence map

- [ ] Read LESSONS.md "Content and balance", "Interface" and "Checks and
  tools", PROSE.md, and design/66's measurements. Inspect relevant content
  ranges and existing guards before proposing a new event.
- [ ] Capture the 80-seed pre-content baseline at the measurement commit.
- [ ] Trace continuous legal play, with no injected flags, fake sitting
  changes or hidden rescue actions, for these routes:
  - carve-out offered and its Registry order made in time;
  - carve-out promised but not delivered, triggering the real resignation;
  - carve-out refused, preserving the political alternative;
  - owner and dissent thermal advice under the same decision policy;
  - early shipment and slower manufacture when each is actually available.
- [ ] For each route record what the player knew before acting, the actor
  asking, the price, when the engine applies it, and the first visible payoff.
  Candidate anchors already exist: `briefing_divergence`, `gb_approach`,
  `ch2_carveout_price`, `ch2_psa_conference`, `f1_stranded`, and the three
  matters. Derive actual dates from play, not their list positions.
- [ ] Mark each required experience as present, poorly explained or missing.
  Reuse present beats. Record any genuinely missing consequence as a content
  proposal with its cause, gate and delay before drafting it.

This task's deliverable is an evidence map with concrete changes and their
file/entry targets, not permission to rewrite the whole opening. Missing
leverage must not be disguised by a paragraph claiming it exists.

## Task 2 — Orientation and political price

- [ ] Add failing campaign/UI assertions for the specific gaps identified
  in Task 1. Teach the existing flow through short notes in relevant
  decisions/results, not new popovers on every screen.
- [ ] Make the immediate aim and coalition constraint explicit in the
  opening. Do not spoil the Works before sitting 14 or accidentally revise
  the legacy chronology that Stage 4 still owns.
- [ ] At the functional obstacle, explain why its votes matter and where
  to inspect the count. At the concession, distinguish a promise from the
  order that fulfils it, who holds the promise, and when it is due.
- [ ] Keep refusals playable. Results name the political cost of the actual
  choice, without suggesting the player has obeyed or failed a quest.
- [ ] Use the existing queued NPP response and Registry resignation as
  concrete receipts. If a new callback is necessary, append its event to
  the list and gate it on the actual originating choice. Never reorder the
  seeded pool or promise a cost the effects do not apply.

## Task 3 — Advice, action and receipt

- [ ] Exercise advice -> Government/Economy/Chamber -> action -> Sitting
  in a real browser before modifying it. Fix only a reproducible missing
  destination, lost context, inaccurate availability/status or absent notice.
- [ ] A remedy says what it costs and what competing interest it protects.
  Keep both thermal recommendations credible, with live minister identities.
- [ ] Show the actual states: started, waiting for approval, under way,
  settled or failed. Preserve pending work and its return route after
  rerender and save/load; do not claim a make immediately put an order in force.
- [ ] On a delayed answer, connect the outcome to the action that caused it
  using the existing event/result/history surfaces. No duplicate brief or
  permanent scorecard. Honour Bible §12.13's distance/status rules.
- [ ] Where rejecting advice has no authored later explanation, draft a
  narrow callback proposal first. Numeric changes alone do not satisfy the
  traceable-consequence goal, and adding a narration alone cannot invent
  a simulation effect. No broad balance tuning in this task.

## Task 4 — Verification and first-player handoff

- [ ] Add campaign guards for both promise outcomes and the refusal route,
  owner/dissent remedies, shipment/manufacture, and the Works timing. Play
  through the engine rather than calling effects to manufacture the route.
- [ ] In UI/UX checks assert the real advice destination, return path,
  pending/settled distinction, keyboard focus after rerender and save/load.
  Do not assert only that reassuring text exists.
- [ ] Break each new assertion's subject and observe its named failure;
  restore it and observe green. Existing guards must still reach the canon.
- [ ] Run `npm run prose`, the 80-seed post-content sweep, story-map
  regeneration if content wiring changed, then all thirteen checks.
  Explain any old-policy outcome movement rather than hiding it.
- [ ] Run `npm run layout`, with the required fonts where available.
  Check occupied advice/expanded work files in actual Firefox and Edge,
  native and custom scrolling, desktop/medium/phone widths. If the standard
  launcher fails, record it and use the same prepared probes directly;
  never report that failure as a passing layout run.
- [ ] Record plain draft wording for Claude's register pass and five short
  playtest prompts in design/67: What are you trying to do? Why this remedy?
  What did it cost? What are you waiting for? Why did this consequence occur?
  Human enjoyment and comprehension remain unproven until players respond.
- [ ] Commit independently reviewable batches (orientation/political price;
  advice/receipts). All thirteen checks before each finished batch's main
  push. Delete this brief in its finishing commit; delete the parent only
  when its remaining acceptance work is genuinely resolved. An unfavourable
  counsel measurement remains a named design finding, not a silent pass.

## Review focus

- A player refuses the concession: no forced betrayal or broken tutorial.
- An adviser is absent or a remedy is unaffordable: no false promise of an
  executable rescue, and the existing refusal reason remains accessible.
- A different decision displaces a consequence: it waits through normal
  scheduling rather than vanishing or being forced over a required anchor.
- A save is loaded mid-remedy: no duplicate charge, lost approval or false
  settlement, and no new save shape to support a presentation-only slice.
- A narrow Firefox viewport with several open matters: action/return controls
  remain usable without horizontal escape or disappearing scroll contents.

**Execution proposal:** implement these two briefs sequentially in this
session, with measurement findings reviewed before content changes. No
parallel agents or extra Opencode task is required for this coupled work.
