# E5: setup text

Spec: briefs/codex-handoff.md item 4; briefs/act-one.md E5.
Inventory: design/setup-constant-inventory.md.

One resolver reads finite numeric constants from own setup properties. It accepts
`{{setup.path}}` and `{{setup.path|percent}}` (a fractional coefficient printed as
a percentage). It rejects missing paths, non-numbers, prototypes, unknown
formatters and malformed placeholders. It never reads simulation state.

The interface resolves text at escape/annotation boundaries and uses its active
campaign content. Decision titles and results resolve before entering history.
Lint resolves a detached view for the campaign it checks; prose exports and the
editor retain literal templates. Static Bank interval text uses an explicit
data attribute so each redraw resolves against the current campaign.

Scope rulings: constitutional totals and array lengths remain outside E5.
Intervals use days; coefficients use percentages, accurate for non-week intervals
and non-half coefficients. No new campaign prose is written here. Claude owns
the two Act I substitutions from inventory B and the register pass.

## Execution

1. Write resolver and integration assertions; observe missing API failure.
2. Implement resolver, rendered history and display boundaries; pass assertions.
3. Add lint validation using the same resolver; plant a missing campaign path and
   prove rejection. Test raw-template prose export and editor preservation.
4. Substitute confirmed tooltip constants and the static Bank interval.
5. Break each behavior deliberately; restore and run all checks, browser layout,
   and the 80-seed comparison. Obtain one independent whole-diff review.
6. Update handoff, release claim, commit and push the checked batch.

Review focus: campaign switching, malformed/prototype paths, old history after
tuning, escaped prose and tooltip text, editor/export retaining source templates.

## Verification, 8 October

Complete source: twenty checks passed in 287.57 seconds, against the unchanged
nineteen-check baseline of 288.52 seconds. This is a correctness check, not a
timing improvement claim. Twenty-two deliberate breaks were caught. Independent
review found four important faults; all were reproduced and repaired. Real Edge
also exposed ordinary JSON braces in the Sandbox; a regression test now preserves
JSON and mixed legacy substitutions while rejecting malformed setup tokens.

Edge layout passed at every requested size, with three font-stack warnings.
Inspected 1920x1000 and 1366x768 Bank screenshots: the interval, rule coefficients
and tooltip agree; the smaller explanation wraps and scrolls with the whole tab.
The 80-seed reports are byte-identical. No simulation rule, state shape or Act I
content changed. Inventory B substitutions and the prose register remain Claude's.
