**Lane: Codex builds the pipeline and the slice switch. Claude Code writes the slice's ending page,
the feedback prompt and any player-facing text, reading `PROSE.md` first.** Written 5 October 2026
from the author's idea: "playtesting branch deploys to itch.io, with the only available campaign being
a slice of the tutorial, up to an ending point within Act 1."

# The playtest slice on itch.io

**STATUS: not started. Two parts, and only the first can be built now.**

- **Part 1, the pipeline and the switch** (this brief): a `playtest` branch builds the one-file game,
  restricts it to one slice of one campaign, and pushes it to itch.io. It can be built and proved
  against the opening as it is today, ending at an arbitrary sitting.
- **Part 2, the content** (Claude and the author): the slice is worth sending to a stranger only when
  Act I's first fifths (`design/76`) and the tutorial (`design/77`, `briefs/tutorial-mechanism.md`)
  exist. Until then the pipeline ships the current opening and says so.

## What to build

1. **A slice switch in the build.** `npm run build -- --slice` (extend `tools/build.js`; it stays a
   splice, with no transform or minification) injects a small `window.PLAYTEST` object into the single
   file: `{ campaign: "flash_i", build: "<short commit>", endsAt: <see 2> }`. With it present, the main
   menu offers that one campaign and hides the Sandbox and any save from another campaign. The build's short commit shows in the corner of the menu and the Options popover, so
   feedback can name the build. Without `--slice` nothing changes, and `uitest` and `uxtest` prove it.
2. **An ending point.** The run stops at a condition the campaign names (`play.sliceEnd`, a condition
   from the existing vocabulary, so content owns it): for Act I, the Appropriation carried or lost
   (`design/76`). At that point the game shows one closing page (title, a short summary of the player's
   choices, and the feedback prompt), then returns to the menu. Until Act I exists, use a sitting
   number. The closing page's text is Claude's: ship a placeholder and name it in the commit message.
3. **A playtest report the player can copy.** One button on the closing page and in Options copies a
   plain-text report: build, seed, the choices made sitting by sitting (the in-game transcript that
   `design/64` already keeps), the final standing and confidence. The game makes **no network request**.
   The player pastes the report where the author asked for feedback.
4. **The deploy workflow**, `.github/workflows/playtest.yml`: on a push to `playtest` or a manual
   dispatch, run `npm run check`, run `npm run build -- --slice`, zip `dist/` as an HTML5 upload and push it
   with itch.io's own `butler` (download the official binary from `broth.itch.ovh`; do not add a
   third-party action to the supply chain) to the channel `html5-playtest`. It reads `BUTLER_API_KEY`
   from the repository secrets and the target (`<user>/<game>:html5-playtest`) from a repository
   variable `ITCH_TARGET`. It does not touch `main` or the Pages deploy (`pages.yml`).
5. **A short runbook** in `README.md`: how the author sets the secret and the
   variable, how to cut a playtest (`git push origin main:playtest`), and what the itch.io page needs.

## What the author does once

Create the itch.io project (**draft, restricted access with a password**, kind "HTML", viewport about
1366 x 768 with the fullscreen button on), create an API key, and add it as the `BUTLER_API_KEY` secret
and `ITCH_TARGET` variable. A cloud session cannot do any of this.

## Checks

- `npm run check` and `npm run layout` pass, and `node tools/playtest.js --seeds 80` is unchanged
  (this brief touches no content and no engine rule).
- A test (`tools/uitest.js`) boots the sliced build in jsdom: the menu shows one campaign and no
  Sandbox; the run stops at the end condition and shows the closing page; the report contains the
  build and the choices; **nothing in the sliced build calls `fetch`, `XMLHttpRequest` or
  `navigator.sendBeacon`**. Break each assertion and watch it fail.
- Run the sliced build under Chromium at 1366 x 768 inside an `<iframe>` of that size (itch.io embeds
  the game in one) and send screenshots of the menu and the closing page to the orchestrator.

## Leave alone

`pages.yml` (the live game from `main`), the editor, the engine's rules, and the content. The sliced
build is `main`'s code with one switch on; the `playtest` branch is a pointer to a commit of `main`,
never a fork of the story.
