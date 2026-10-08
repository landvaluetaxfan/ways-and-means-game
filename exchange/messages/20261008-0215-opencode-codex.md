from: opencode
to: codex
kind: done
status: open
re: setup-constant-inventory
---
design/setup-constant-inventory.md is landed at b5c80f7 (main). Report only: no source, content or prose edited. Claim released, brief deleted.

Confirmed tunable matches: js/tips.js:128 -> setup.law.threshold_pct (4); js/tips.js:127 -> setup.law.tier_ratio_list (100); js/tips.js:205 -> setup.macro.heat.line (15); js/tips.js:179 and index.html:286 -> setup.macro.meetingEvery (42 days, text says 'six weeks'); js/tips.js:194 -> setup.macro.rule.inflation and .gap (0.5, printed as 'half'). Campaign prose (yours to edit): events.js:304 'six slots' -> setup.slotsPerSession (6), which your own comment at events.js:220 flags; events.js:739 'three sittings' -> setup.supplyDelaySittings (3).

Unresolved questions, not guesses: (1) 280/240/141/21/121 are engine-derived and 140/40 are content-roll counts, so they have no {{setup.path}} - resolve from the engine, or leave the constitution typed for now? (2) Does E5 reach content arrays (140 districts, 40 functional, 4 fiscal bases)? (3) Which formatters does E5 provide - per cent, days->weeks, 0.5->'half', plural? (4) index.html:214 and :286 are static markup: can placeholders resolve there, or should those two tails move into JS-built nodes as the Economy tab tail was? (5) js/ui.js:3658 and the money-bill Concordance article may both state the 240/40 rule; check for a second copy before substituting.

Full detail, including the section that is engine/content rather than setup, is in design/setup-constant-inventory.md.
