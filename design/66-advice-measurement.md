# 66 — Ministerial advice measured

3 October 2026. Baseline: `fc9b9ea`. Tools-only batch; no campaign,
engine, price, deadline or save change. Bible §0.3 separately clarifies
the author's permission to question LOCKED rules, not change them alone.

## Method

Before: `node tools/playtest.js --seeds 80`, eight policies, 640 runs.
After: the same command, twelve policies, 960 runs. All eight original
policies' outcome distributions are identical before and after. The four
crisis-policy losses remain 10, 18, 4 and 10, as AGENTS.md records.

For structured evidence:

```
node tools/playtest.js --seeds 80 --report advice-results.json
```

The generated JSON records policy/seed, end reason, crisis result, count
timing, final reserve/debt/arrears/heat/standing/confidence, reached events,
advice exposure, actions/refusals and lifecycle transitions. Do not commit
the large raw report. Full run and mutation evidence for this batch is in
the author's local `advice-measurement` verification artifact folder.

The three advice policies share first-option decisions and the existing
supply-first governing policy. Each has at most one advice action a
sitting, before ordinary governing. First follows the first executable
remedy; owner follows live owning counsel; dissent follows live non-owner
counsel. Missing counsel explicitly falls back to first. A preferred
but blocked remedy waits, rather than silently switching sides.

An affirmative order continues to approval on a later sitting, even if
the make gate is now closed. A bill continues through its actual stages
and dated division. Delayed initiatives are not restarted. Engine gates,
costs, exchange conversion and action results are authoritative. Tool
exceptions propagate rather than being written down as political defeats.

Pulls levers adds at most one ordinary order/approval and one available
initiative after ordinary governing, preserving supply and approval time.
The review found that ordinary bill work could consume an approval's
reserved slot before the lever phase. Both stage grants and divisions now
protect it for the new policies only; the eight historical policies retain
their original behaviour. Integrated real-engine regressions cover both.
The new ordinary-division guard also protects supply/ladder reservations.
Thus comparison with the old first-option policy measures the combined
policy, not the isolated causal effect of reading advice. Owner and dissent
share the same new reservation rules with each other.
Emergency relief is identified from content's alert `raises` fields and
instrument effects, as the engine does, not from a typed list of rung ids.

## Results

| policy | reaches the count | cascade losses | live contested counsel encountered | exposed runs reaching count |
|---|---:|---:|---:|---:|
| First option, supply first (old comparator) | 70/80 | 10 | — | — |
| Follows the brief | 76/80 | 4 | 55/80 | 52/55 |
| Owner's counsel | 76/80 | 4 | 55/80 | 52/55 |
| Dissent | 72/80 | 8 | 55/80 | 48/55 |

Both advice variants reach the count in most seeds. This meets the
mechanical survival proxy; it does not establish that first-time people
understand the advice or find the decisions enjoyable.

The 55 commonly exposed seeds provide the paired comparison. Owner
survives where dissent loses in five; dissent survives where owner loses
in one. The others agree on survival. Mean final readings on those same
55 seeds, not a comparison between different exposed populations:

| reading | owner | dissent |
|---|---:|---:|
| Reserve, CW$m | 1,746.9 | 1,177.8 |
| Debt, CW$m | 22,591.3 | 23,414.2 |
| Arrears, CW$m | 707.0 | 1,683.4 |
| Thermal margin | 9.15 | 8.27 |
| Standing | 56.33 | 55.78 |
| Confidence reading | 168.05 | 166.40 |

These are terminal readings, not a same-date experiment: losses end
earlier. Restricting to the 47 paired seeds where both reach the count
changes the interpretation:

| reading, both reach count | owner | dissent |
|---|---:|---:|
| Reserve, CW$m | 1,833.0 | 1,371.6 |
| Debt, CW$m | 18,964.5 | 18,681.4 |
| Arrears, CW$m | 652.3 | 873.8 |
| Thermal margin | 9.89 | 9.47 |
| Standing | 56.85 | 57.17 |
| Confidence reading | 169.60 | 169.11 |

Dissent has slightly lower debt and higher standing in that surviving
subset. Conditioning on survival also excludes the failed paths, so this
table is a useful qualification, not a substitute for the survival result.

Dissent uses fewer advice slots and has a smaller immediate net cash
outflow from advice actions: across all 80 runs, 0.10 versus 0.4125 slots,
and CW$4,710.3m versus CW$6,560.3m net cash outflow. That cash measure
includes receipts as well as payments; it is not gross remedy expenditure.
These are advice-phase costs only, not all subsequent emergency spending.
Some of the initial economy remains in the surviving pairs' lower debt.

**Assessment:** owner has the better observed survival rate and terminal
reserve/heat; dissent has the smaller immediate cost and modest debt and
standing advantages among paired survivors. Neither strictly dominates.
There is a measurable trade-off, but these mechanical policies do not
establish a compelling player choice. Do not label the design accepted
merely because both policies usually live, or tune it from one mean table.

## Timing and refusals

The first live contested heat advice occurs between sittings 32 and 48
on these paths. No such exposure occurs by sitting 24. The first owner
trace on default seed makes the allocation at sitting 39. A second heat
episode can meet an already-made order; the counsel cannot just make it
again. The policies truthfully wait or fall back as their stated rules say.

Exposure is not necessarily a fresh choice. On the default seed the rival
becomes live at sitting 41, after allocation was already laid at 39; the
subsequent approval is a continuation, not a new competing-advice choice.
Action records therefore retain whether counsel was contested when the
remedy was selected, and mark continuations separately. Owner starts a
remedy under live competing counsel in 49/80 runs, dissent in 54/80. On
the 49 seeds where both do, count survival is 46/49 versus 42/49.

Representative seed index 1 (`7932`): at sitting 46 owner lays allocation,
pays CW$6,000m and waits for approval; at 47 approval is refused for lack
of House time. Dissent instead makes conservation at 46, with no immediate
cash outflow or House slot. At 49 its rival post is no longer live, so its
explicit fallback lays allocation and also waits. That is a whole-policy
comparison with later counsel changes, not two isolated immutable choices.

Owner records 325 advice refusals for no time and 157 for an already-made
order. Dissent records 275 for no time, 167 for an already-made order and
17 with both orders already made. These counts are repeated blocked
attempts, not distinct bugs or distinct players. Counsel fallback counts
also include the uncontested air/reserve matters, not just absent ministers.

The driver actually approves the heat allocation in 33/80 owner runs and
8/80 dissent runs; dissent makes conservation in 57/80, including fallbacks.
Laying a paid order is therefore not evidence that its heat relief arrived.
An opening choice must make approval time as legible as its cash price.

The political history, choice policy, supply reservation and emergency
governing all affect these results. This is a comparison of two fixed
policies, not a claim about every way a human can use conservation.

## Scoped reachability audit

Counts are runs reaching an entry across the twelve-policy sweep, not
number of times a recurring entry fired.

| entry | runs reaching it |
|---|---:|
| `thermal_squeeze` | 350 |
| `f1_heat_shortage` | 254 |
| `reserve_low` | 63 |
| `f1_reserve_shortage` | 0 |
| `f1_air_last_chance` | 160 |
| `f1_air_fails` | 84 |
| `f1_air_paid` | 320 |

The reserve consequence is **reachable, not dead**. A separate legal-play
probe keeps first-option/supply-first governing but chooses "Spend what
is left" at `reserve_low`. It reaches `f1_reserve_shortage` in five of
80 seeds (indices 14, 24, 34, 50, 73; seed formula remains the tool's
`7919*k+13`). No injected flags, cash, sitting changes or developer
effects are used. Other policies commonly refill the reserve at that
decision or finish/lose before the consequence. Archive nothing.

Pulls levers reaches the count in 32/80 runs; its 48 losses comprise
33 cascades and 15 confidence losses. Indiscriminately exercising powers
is useful coverage, not a recommended player policy. The wider dead-event
classification remains deferred to Stage 4 per design/64 answer 20.

## Decisions for the playable slice

1. **An opening through sitting 24 cannot prove the existing contested
   heat loop on these policies.** Recommended: author one credible early
   competing-advice case around existing opening business, rather than
   moving the Works or artificially damaging the opening thermal margin.
   Alternative: extend the continuous test through the observed late heat
   dilemma. Both need author approval before content changes.
2. **Make the dissent's financial advantage intelligible in play.**
    Identify what preserving cash and debt room lets a player do before raising
   the paid remedy's price or weakening it. There is no approved new effect
   or deadline here. Keep the current prices until this is designed.
3. **Recurring advice needs to acknowledge exhausted remedies.** The
   current truthful "already made" refusal is useful evidence. A new
   fallback, reissue mechanic or different recurrence rule needs its own
   proposal; do not hide this by letting the tool remake an in-force order.

Measurement work is complete. Slice acceptance, contested-choice design
and human playtesting remain open. No player-facing wording was added.
The Bible clarification is an agent-facing rule, not campaign prose.

Verification: all thirteen checks pass, including canon guards. The new
driver assertions were exercised against deliberately broken subjects;
34 mutations fail, including both reservation paths, separate approval and
bill defeats, counsel identity, delayed settlement and choice provenance.
No panel changed, so no layout run is required for this batch.
