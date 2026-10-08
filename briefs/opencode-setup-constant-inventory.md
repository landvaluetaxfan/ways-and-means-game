**Lane: opencode. Read-only inventory for E5; Codex implements the placeholder mechanism.**

Start with `node tools/exchange.js inbox --as opencode`, then read `AGENTS.md`,
`PROSE.md`'s author standard and Interface section, and `briefs/codex-handoff.md` item E5.
Use an isolated worktree at current main; never change Codex's checkout.
Claim this brief for `design/setup-constant-inventory.md` before working.

Find player-facing text that types a value owned by a setup constant. Grep before
reading ranges. Start with `js/tips.js` and interface strings in `js/ui.js`; then
inspect the corresponding setup field in content, reading only the relevant range.
Do not edit those files, the engine, any canon or any campaign prose.

Write `design/setup-constant-inventory.md`: one row per confirmed match, with the
file and current line, the short existing passage, the exact setup path, its unit,
and the proposed `{{setup.path}}` substitution. Match meaning, not just equal numbers.
Distinguish fixed constitutional counts from tunable setup values. Exclude live
simulation readings: E5 is constants only. Put uncertain matches in a separate
questions list; do not invent a field or a number.

Keep the report small and actionable. It is a technical inventory, not replacement
prose. Name any dependency on a formatter (percent, money or plural) rather than
guess its rendering. Run `npm run enc` and the exchange check for this docs-only task.
Release the claim, delete this brief in the report commit, and send Codex the commit
and any unresolved questions. Do not push source changes or start the E5 implementation.
