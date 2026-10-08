**Lane: opencode. Independent release verification for tonight's itch.io playtest.**

Start with `node tools/exchange.js inbox --as opencode`, then read `AGENTS.md`,
`PROSE.md`'s author standard and Interface section, and `briefs/itch-build.md`.
Use an isolated worktree. Wait until main includes Codex's completed E10 batch
and Claude's image restoration `5450070`; record the exact tested commit.
Claim this brief for `design/itch-release-qa.md`. Do not edit any game source,
content, canon, styles or other agent's checkout. Build outputs stay in your worktree.

Run `npm run check`, `npm run layout`, and `npm run itch`. Never edit source during
a check. Inspect the actual zip, not an earlier GitHub Pages build. Record browser
and font resolution; a missing browser or a skipped check is a limitation, not a pass.

In a real browser, inspect the unpacked release at 1920x1000 and 1366x768, and at
the proposed itch iframe size (record the actual size; do not assume fullscreen).
Check menu, introduction, act screen, all nine tabs, a Treasury appointment,
an order file, a clause, a promise, a division and the Act I ending. Confirm save
and reload, transcript copying, audio only after interaction, restored images,
credits and the narrow-window warning. Save and inspect screenshots. Do not say
Firefox passed if only Chromium/Edge was available. If iframe testing is unavailable,
state that explicitly. The author still verifies the final uploaded itch page.

Write `design/itch-release-qa.md` with the tested commit, command results, screenshots,
confirmed faults and what could not be checked. Put blockers into the exchange promptly;
do not fix them or silently dismiss them. Do not make a new public itch release.
For the report-only commit, run encoding and exchange checks, release your claim,
and delete this brief. Send Codex the evidence and commit, not just a pass verdict.
