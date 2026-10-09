**Lane: opencode.** The author requested this delegation on 8 October 2026.

# E11: the existing superevent presentation

Implement only E11 in `briefs/act-one.md` (lines under E11). Read `AGENTS.md`,
`PROSE.md`'s author standard and Interface register, `LESSONS.md`'s interface/check
lessons, and the headers of `js/motion.js` and `js/focus.js` first. Start with
`node tools/exchange.js inbox --as opencode`, then claim this brief in a separate
exchange commit pushed to main. Codex is handling release cleanup and read-throughs.
Claude is unavailable; the author authorized Codex and opencode to finish this build.

## The agreed behavior

- `setpiece.scale:"super"` expands the page across the Sitting tab, hiding its side
  columns for the page and restoring them when acknowledged. Ordinary setpieces
  retain their existing layout. Use existing dither motion, with an instant reduced
  motion path. Motion originates only in actions/outcomes, never redraw/render calls.
- Keep the date and rise information visible in a thin ribbon, using the existing
  campaign clock and closing endpoint. The curtain remains sitting 16, 8 May.
- Tag `a1_works_abandoned` as the first superevent. Its existing prose, campaign
  curtain, cast, epigraph and report remain intact. The ending is already full-page;
  ensure the `scale` setting survives the ending-page adapter rather than assuming
  only ordinary queued events can use it. Do not invent another story event.
- Add the E11 warning for more than two superevents in an act. Do not change content
  selection, engine outcomes, saved state, order-paper rules, or prose.
- Reopening/loading/redrawing a page must not repeat its entry animation, lose focus,
  or strand an overlay. Acknowledgement restores the ordinary Sitting layout.

## Scope and evidence

Expected files: `js/ui.js`, `js/setpiece.js`, `js/motion.js`, `css/terminal.css`,
`content/campaigns/flash_i/events.js`, `tools/uitest.js`, `tools/uxtest.js`,
`tools/lint.js`, `tools/itchtest.js`, and this brief. Add `js/schema.js` or an editor
preservation check only if the existing metadata contract requires it. No engine edits.
Codex's two setup-token substitutions touch different event bodies in events.js;
preserve them and post an overlap note on the exchange.

Test ordinary/super layout, acknowledgement, repeat redraw/load, reduced motion and
the real curtain. Break each new behavioral assertion before trusting it. Run the
full `npm run check`, and real-browser layout at 1920x1000 and 1366x768, including
the packaged curtain. Record any browser limitation honestly. Use installed Edge
on Windows when bundled Chromium is unavailable. Do not install or alter global tools.

Commit the implementation on your own `opencode/superevents` branch and leave the
claim held for review. Do not push implementation to main: Codex reviews, integrates,
reruns the required checks, releases the claim, and pushes the finished batch.
Write a concise done/review message to the exchange naming your commit, tests and
remaining issues. Do not touch the author's dirty primary checkout.
