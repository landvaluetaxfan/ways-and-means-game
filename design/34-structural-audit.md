# 34 — THE STRUCTURAL AUDIT

**Status: PLANNED, 23 Sep 2026. Approved by the author; not yet run.**

## Why

The game was built by several authors — the author, Opus 5, DeepSeek v4 and
v4.1 flash, and Claude — and the faults found in the week of 20-23 Sep
clustered at the SEAMS between them rather than inside anyone's work: a flag
one author set and nothing read (affirmative orders could never be approved),
a rename sweep that broke another author's reference (the vacant-Treasury
event named a post that no longer existed), a decision written into a design
note and never built (design/32's fold of chapter four), one number held in
three places (a ballot's "nine" signatures against a threshold of twelve),
and tools that measured a different game from the one players see (four
faults in the playtest, a harness running a different script list). About
twenty in four days, most found by accident while doing something else.

A structural pass looks for those classes on purpose, once, across the whole
codebase, before the content round builds on these systems.

## Method: by class of fault, not by reading everything

Each class gets a mechanical detector where one can exist, and only the hits
are read. A detector that earns its keep becomes a check in `npm run check`
so the class stays fixed, the way `tools/enccheck.js` came out of the
mojibake.

1. **Written but never read** — state fields, flags, content fields.
2. **Read but never written** — conditions waiting on flags nothing sets;
   fields the interface reads that the engine never writes.
3. **Promises and gates that cannot resolve** — undertakings with no
   `discharge`, gates that can never be true or are true from the opening,
   queued events that ignore their own `when`.
4. **One fact in two places** — literals in the interface that duplicate
   content, stored values that should be derived, copies in the docs.
5. **Decided but not built** — all 34 design notes against the code, each
   given a status line.
6. **Checks that cannot fail** — break each check's subject on purpose and
   see whether the check notices.
7. **Reachability** — for each event no playtest strategy reaches, whether
   its gate is impossible or merely rare.
8. **Saves** — every state field survives save, load and migration.

## Deliverable

This file, rewritten as a ranked report: small certain fixes made with tests
and listed; anything needing the author's judgement listed as a decision;
detectors kept as checks. Time-boxed to one focused pass.

## Already found, before the pass began

- **`act_carveout_broken` cannot be earned.** The achievement waits for
  `flags:["gb_carveout_broken"]`; an EVENT of that name fires when the
  licensure promise breaks (`onBreach`), but nothing sets a flag of that
  name. Class 2. Found by a two-minute scan of flags content requires against
  flags any effect sets (42 required, 2 never set; the other, `paired`, is
  set by the engine and is fine).
- **The emergency loan's promise has no `discharge`** (`f1_loan`, already in
  `CLAUDE.md`). Class 3; the pass should find whether it is alone.
- **`act_carveout_kept` matches log TEXT** (`logAbsent:["was not laid","not
  renewed"]`), so rewording a log line silently changes who earns it. Class 4.
