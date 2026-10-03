**Lane: Codex. Approved by the author, 3 October 2026. Execute before
`opening-playable-slice.md`.**

# Measure ministerial advice

## Goal and authority

Finish the measurement portion of `the-brief.md`, not its content rewrite.
Implement design/64 answer 20 and design/63's strategy acceptance work.
Read AGENTS.md, LESSONS.md "Checks and tools", design/64 answers 1–6,
16–20, and the measurement sections of `the-brief.md` first.

The relevant Bible rules are §1.5 (determinism), §7.6 (shallow simulation),
§7.7 (time), and §7.8 (support): all LOCKED. No new mechanic or canon is
needed. The thin area is evidence about competing advice, not its lifecycle.

**Architecture:** keep the existing playtest loop and eight strategies.
A small tools-only driver reads the same live matter view the interface
uses and invokes existing engine verbs. It has no campaign identities.
Its bookkeeping belongs to the simulated run, never the saved game.

**Tech stack:** CommonJS Node tools and the existing vanilla JS engine;
no dependencies, build step, new state fields, or engine verbs.

## Files and boundaries

- Modify `tools/playtest.js`: strategy definitions, driver integration,
  structured measurements and human-readable output.
- Create `tools/adviceplay.js`: generic selection/action driver, separately
  importable without starting a sweep.
- Modify `test.js`: synthetic-world tests for that driver.
- Create `design/66-advice-measurement.md`: revision, policies, results and
  scoped reachability findings. This is a result record, not a work list.
- Modify `briefs/lever-playtest.md`: mark its strategy complete; keep its
  wider dead-event audit explicitly deferred to Stage 4.
- Modify `briefs/the-brief.md`: mark measurement complete and retain the
  slice's remaining acceptance work.
- Modify AGENTS.md only if fresh results require correcting its measured
  figures; never substitute an older figure from a brief.

No content, UI, CSS, package script or engine change is planned. If the
driver exposes an engine defect, record its reproduction and a repair
question here; do not quietly repair it or bias the measurements around it.

## Task 1 — Freeze the comparison

- [ ] Record HEAD and the command, then run
  `node tools/playtest.js --seeds 80` before changes. Retain its full output
  outside the checkout until the report is written.
- [ ] Record the eight old policies and their governing order. Do not
  replace the existing loop merely to use a newer convenience API.
- [ ] Record the four crisis policies, end reasons, count arrivals and
  resolution/settlement distinctions. A settlement is not a completed run.
- [ ] Audit where pending affirmative approvals, supply reservations and
  delayed initiatives are processed. Advice is an additional governing
  phase after the decision, before ordinary governing, for new policies only.

## Task 2 — Generic advice driver, with failing tests first

Proposed tools-only interface:

```js
// mode: "first" | "owner" | "dissent"
// memory: fresh per run, retained across its sittings; not attached to st.
// records: [{sitting, matter, remedy, kind, action, status, reason}]
actOnAdvice(Engine, st, C, mode, memory) -> records
```

Select the first open matter in `Engine.matters(st,C)` order that is not
already under way. Take at most one advice action a sitting, including a
continuation requiring House approval. Re-read availability before acting.
No direct writes to simulation state and no flag/id recognition to choose
what is urgent or which remedy is recommended.

Policy definitions, with identical first-option decision picking and
supply-first ordinary governing:

| policy id | rule |
|---|---|
| `brief` | First currently executable remedy in authored order |
| `owner` | Live owning minister's counsel; otherwise the `brief` rule |
| `dissent` | First live non-owner counsel in authored order; otherwise the `brief` rule |

For owner/dissent, a present but unavailable preferred remedy produces a
logged wait/refusal, not a silent switch to the rival recommendation. A
vacant counselling post is not live counsel. Log that a fallback was used.
Never infer the recommendation from its display position or party.

Target dispatch uses the existing APIs:

```js
Engine.take(st, C, target.id, target.tempo || 0);          // initiative
Engine.makeInstrument(st, C, target.id);                 // new order
Engine.approveInstrument(st, C, target.id);              // pending order
Engine.grantSlot(st, C, target.id);                      // bill stage
Engine.divide(st, C, target.id);                         // at DIVIDES_AT
Engine.borrow(st, C, remedy.amount, target.id);          // money
```

The driver must distinguish starting an affirmative order from approving
it. Remember the selected target in run-local memory and continue its
pending approval on a later sitting using `Engine.canApprove`, even when
the make gate now refuses or another matter becomes urgent. Pending work
does not count as settlement. A delayed initiative is not started again
while `underway` holds. Finish a pending continuation before selecting a
new remedy; approval consumes that sitting's advice action.

An engine refusal is reported with its reason; an exception is a tool
failure and must propagate, not be swallowed as a plausible outcome.

Concrete synthetic tests in `test.js` must cover:

- [ ] Opposite counsel targeting two synthetic remedies selects different
  engine actions even after display/remedy order is swapped.
- [ ] A blocked dissent logs a refusal and does not execute owner counsel.
- [ ] Absent/vacant counsel falls back explicitly, without inventing advice.
- [ ] A make followed by approval charges the real cost once per stage;
  approval is attempted later, not replaced by another paid make.
- [ ] An initiative held for three sittings is started once and closes only
  when the actual settlement condition holds.
- [ ] Money uses the live derived amount; bill dispatch distinguishes stage
  advancement, division success, defeat and refusal.
- [ ] Two calls with the same seed/content/policy produce identical action
  records; renamed matter/target ids preserve action behaviour.
- [ ] Zero executable remedies, an empty brief, an unknown target kind and
  an engine exception have explicit outcomes, not silent success.
- [ ] Supply and order-approval time are recalculated after advice spends
  time. No pre-advice reservation is incorrectly reused by the new policy.

For every assertion, deliberately break its subject, run `npm run test`
and observe the named failure, restore it, and observe green. Test the
driver with synthetic world content, not Flash I identities in test.js.

## Task 3 — Lever coverage and measurements

- [ ] Add `levers`, "Pulls levers", per `lever-playtest.md`: ordinary
  first-option/supply-first behaviour plus at most one legal non-emergency
  order and one offered initiative per sitting. Use content order and the
  engine gates; never force an unavailable action. Preserve supply and
  pending-approval reservations before optional actions.
- [ ] Test its caps, emergency exclusion and refusal handling through the
  same tools-only driver module. Do not change the eight existing policies.
- [ ] Add transcript records for advice exposure, selected counsel/remedy,
  action/refusal, underway/closed/late/failed transitions and fallback use.
  Read transitions from engine-owned state; never set them to make a report.
- [ ] Run the 80-seed sweep after changes. Compare each old policy against
  its baseline; all old outcomes must be unchanged by a tools-only batch.
- [ ] Compare owner and dissent on paired seeds, recording which runs
  actually encountered contested advice with both counselling posts filled.
  Report count survival, heat failures, reserve, debt/arrears, political
  position, remedy spend and time. Separate all-run and exposed-run results.
- [ ] Audit only events touched by the three matters and their remedies:
  distinguish not exposed, reachable by an unwalked route, and an impossible
  gate. Name the route; a zero coverage count is not proof of dead content.

Do not tune prices, deadlines or weights to make a table pass. "Most reach
the count" means more than half, reported as an observed result rather than
a permanent balance assertion. "Neither counsel dominates" is a question
to assess across survival, money and politics, not just a loss-count tie.
If one dominates, explain the evidence and recommend a separate design
change. The tool/report can be complete while design acceptance is not.

## Task 4 — Review and handoff

- [ ] Write design/66 with before/after figures, paired results, exposure
  counts, first contested-advice timings, refusal reasons and traces for
  representative owner/dissent runs. Those timings inform the slice.
- [ ] Name limitations: mechanical policies are not first-time players,
  and survival cannot establish whether the choices are enjoyable.
- [ ] Run `npm run check`, all thirteen, and guards; confirm canon remains
  reachable. No panel changes means layout is not needed for this batch.
- [ ] Mark the folded-in work in the parent briefs, delete this brief in
  the finishing commit, include baseline/after results in the commit
  message, and push the finished batch to main.

**Stop point:** report findings and any defect/design question before
changing campaign content. Then proceed to the separately approved slice.
