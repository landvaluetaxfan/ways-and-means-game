**Lane: Codex builds, Claude Code reviews and writes the steps.** Written 5 October 2026 from
the author's request; the spec is `design/77-the-tutorial-mechanism.md`. Read it first.

# The tutorial mechanism

**STATUS: not started. Do not start it before `briefs/ui-tabs.md` pass 1 has landed**: that pass
sets the shared type-scale tokens the card must use, and it holds `index.html`, `js/ui.js` and
`css/terminal.css`. Claim it as `tutorial-mechanism`, and list in the claim the files below.

## What to build

1. **`js/tutorial.js`** (new, a plain `<script src>` like `js/tips.js`) and **`css/tutorial.css`**
   (new). The overlay: a dimmed layer with a pointer-blocking frame around the region and a
   live hole over it, a card beside it with title, body, the button, "Skip the tutorial", and
   Esc. It re-measures after every render, on resize and on scroll, and waits when its region
   is not on screen. It respects reduced motion and returns focus where it was
   (`js/focus.js`: read its header first).
2. **The region registry** in `js/ui.js`: a small table of named regions to selectors, and one
   call to `Tutorial.refresh()` at the end of the render. Touch nothing else in `ui.js`. The
   first regions: `order-paper-time` (the Government strip and the Chamber bar),
   `treasury-vacancy`, `calendar`, `order-paper`, `whip`.
3. **The content kind** in `js/schema.js`: `tutorial` steps with `id`, `when` (a condition,
   plus `onTab` and `done`), `region`, `title`, `body`, `voice` (optional character id),
   `once`. `test.js` fails if the schema and the engine's vocabulary differ, so add the
   entries there and in the editor's list. A campaign carries them in
   `content/campaigns/<id>/tutorial.js`, one `campaign("<id>", {...})` call.
4. **State**: `st.taught` (step id to the sitting it ran), beside `st.cxRead`, with a
   `STATE_VERSION` bump and its migration block (the next free number after 38; 37 is
   reserved for witnessed acts). The player's preference is `Shell.opts.tutorial`: `on`, `hints`
   or `off`, set in the Options popover, which also replays any step.
5. **One real step** in Flash I's `tutorial.js`: order-paper time, on the Government tab. Claude
   writes the rest.
6. **Prose registration**: the steps' text goes into `js/prosemap.js` so `npm run prose:check`
   still round-trips, and `tools/lint.js` holds it to `PROSE.md` like any other page.

## Checks

- **`tools/tutest.js`**, added to `npm run check` and to the checks table in `AGENTS.md` (the
  count of fourteen becomes fifteen). It asserts that every step's region resolves on its tab
  in a booted game; that a step fires once, in order, when its condition holds; that it
  waits on the wrong tab; that dismissing it records `st.taught` and a save and load does not
  repeat it; that `off` shows nothing; and that the overlay survives a re-render. **Break each
  assertion and watch it fail.**
- The other harnesses (`uitest`, `uxtest`, `layout`, the playtest) run with the tutorial off;
  `npm run check` and `npm run layout` pass, and `node tools/playtest.js --seeds 80` is
  byte-identical before and after.
- Screenshots of the card at 1366 x 768 and 1920 x 1000, on the Government tab, to the
  orchestrator.

## Leave alone

The Economy Money calls panel and the dialogs `integrate/witness` edits; Sitting and Chamber
drawing functions beyond the one render hook. Anything the brief did not foresee goes to the
exchange as a `question`, and you carry on with what does not depend on it.
