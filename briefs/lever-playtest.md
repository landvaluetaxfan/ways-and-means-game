**Lane: Codex.** Written 28 Sep 2026 by Claude Code.

## The question

41 of 130 events never happened in 640 simulated runs
(`node tools/playtest.js --seeds 80`, 27 Sep):

- the leadership ballot: `leadership_ballot`, `signatures_build`,
  `the_paper`, `party_fracture`;
- the Tribunal: `tr_challenge_lodged`, `tr_ruling`, `the_licensing_reaction`;
- the emergency arc: `f1_emergency_declared`, `f1_emergency_lapses`,
  `f1_brink_2`, `f1_meltdown`;
- the UN: `un_floor_report`, `un_joint_offer`, `f1_icj_opinion`;
- and more. The sweep prints the full list.

Most are gated on levers no strategy pulls. The strategies lay an order only
when the docket's alert names an emergency rung, and they take no initiative
except `seek_terms`. So the table cannot tell a reachable arc from a dead
one.

## The work

**Strategy complete, 3 October 2026:** `design/66-advice-measurement.md`
records Pulls levers and the 80-seed sweep. The scoped three-matter audit
finds no dead entry; a separate legal-play path reaches the unsampled reserve
consequence. Per design/64 answer 20, the wider event audit below waits for
Stage 4. Do not redo the completed strategy or mistake zero coverage for
an impossible gate.

1. Add a strategy to `STRATEGIES` in `tools/playtest.js`, "Pulls levers".
   Each sitting it makes an order `Engine.canMake` allows (not an emergency
   rung, and at most one a sitting), takes an initiative
   `Engine.initiatives` offers, and otherwise plays like "First option,
   supply first". It must go through the engine's own verbs, as the file's
   header demands.
2. Re-run the 80-seed sweep. Classify every event still never met:
   - **reachable, by a path no strategy walks**: name the path;
   - **dead**: its gate cannot be satisfied. Either fix the gate, or archive
     the event to `content/archive/cut-events.js` (never delete).

Do not reorder `EVENTS`: the pool's seeded lean is keyed on position. New
events go at the end.

**Write the classification into `design/52-the-lever-arcs.md`**, with the
before and after numbers. Record any change to the four crisis strategies'
losses (33, 54, 21, 25 of 80) in `AGENTS.md`'s canon section.
