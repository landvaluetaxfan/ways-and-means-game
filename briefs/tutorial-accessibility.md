**Lane: Codex. Author approved 9 October 2026.**

# Small accessibility fixes

Keep tutorial cards within short viewports with scrollable content; allow keyboard users to reach the highlighted live controls as well as tutorial buttons; expose selected estimate clause options through accessible button state. No new player-facing prose, fiscal rules, story or save shape.

Scope: js/tutorial.js, css/tutorial.css, js/ui.js, tools/tutest.js, tools/laycheck.js, tools/uitest.js. Add focused regressions and watch them fail first, then implement. Run npm run check and real-browser native/wrapped layout, including short viewports and enlarged tutorial text. Preserve re-render, dismissal and focus restoration. Release this brief and claim together after verification; push to main.
