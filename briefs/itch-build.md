**Lane: Codex builds, opencode runs the checks. Claude Code wrote it, 7 October 2026.** Exit gate
items 12 to 16 of `briefs/act-one.md`: what the public itch.io playtest slice needs that the game
does not yet have. Read that section first.

# The itch.io build

**STATUS (7 October, Claude Code): built, items 1, 2, 4 (all but the feedback place), 5 and 6.** The claim was not
taken: Codex has held nothing active since 5 October, so Claude wrote the tools and made three small hunks
in files `ui-tabs` holds (`js/ui.js`: the curtain's thank-you section; `css/terminal.css`: `.menu-narrow`;
`js/shell.js` is nobody's). What exists:

- `tools/package-itch.js` (`npm run itch`) builds with `tools/build.js --release` and writes
  `dist/ways-and-means-itch.zip` (4 MB, one `index.html` of 6.8 MB). `--release` drops the `data-dev` scripts,
  **removes the world's untagged story from the source text of each inlined content file**
  (`tools/storystrip.js`, 109 events, 80 lines of business, 18 achievements and so on), and sets
  `window.PLAYTEST` (the playtest frame `js/shell.js` already had: one campaign, no Sandbox, the build on the
  menu and in the report) with the commit and the date. The strip is the stopgap the brief allowed; the lasting
  fix, a fixture of the engine's own for `test.js`, is still open.
- `tools/itchtest.js` (`npm run itchtest`, the seventeenth check (`tutest` is the eighteenth)) unpacks the zip outside the repository and
  plays the page: zip contents, no network call in the code, no untagged story entry in the page, no retired
  phrase in it that a carried file does not also hold, boot from `file://` and from a static server, the
  opening, a save written and read back, an older state shape migrates, a newer one is refused, the
  console clean, and Act I from the menu to the curtain. Each assertion was broken once and failed.
- The curtain page now has a "Thank you for playing" section that points to Options > Copy playtest report, and
  names `setup.feedback` where the campaign gives one. **It gives none yet: the author chooses where reports go.**
- A load of a save from a newer build now throws a plain reason (`Engine.load`) and the shell shows it.
- The credits say the sound is generated, the page uses no downloaded fonts, and the globe is Natural Earth.

Open: the narrow-screen line and the page at itch's embed size in Chromium (`npm run layout` does not yet
cover the release page), and the author's confirmation of the art's licences below. **A finding for the
author:** 132 lines of the old story's first sentences appear unchanged in Act I's own files (114 in
`flash_i/events.js`, 13 in `business.js`); `itchtest` lists the count, and `briefs/act-one.md` stage 4 should
name them for a rewrite pass if the gate means none.

## What to build

1. **`tools/package-itch.js`.** Runs `tools/build.js` (one playable file, no `data-dev` scripts),
   and writes `dist/ways-and-means-itch.zip` holding `index.html` (the built file) and nothing
   else. itch.io serves a zip of an HTML5 game with `index.html` at its root, and the single file
   keeps the page working with no server. The build was 15 MB while the page carried a recorded
   track; that track was cut on 7 October (`content/anthem.js`), so the build is about 7 MB, and the
   music is the generated bed alone.
2. **`tools/itchtest.js`**, added to `npm run check` and to the checks table in `AGENTS.md`. It
   unzips the build into a fresh directory outside the repository and asserts: the zip holds
   only `index.html`; the page boots from `file://` and from a static server in jsdom and
   Chromium; the opening plays; a save is written and read back; the console is clean; and
   **no retired prose is in the bundle** (the gate's line: a list of retired phrases, taken
   from `content/archive/` and the parked story, must not appear in the page). **Break each
   assertion and watch it fail.** The retired-prose assertion fails today: the world's untagged
   story (`content/events.js` and the other story files the engine tests play on) ships inside
   the page, unseen. The lasting fix is a fixture of the engine's own for `test.js`, so that
   the story files can be archived and dropped from the shipping page (`briefs/act-one.md`,
   "How old text leaves the build", rule 3). Until then the build can drop the story kinds'
   untagged entries at build time, and say in the check that it does.
3. **Embedding.** The page runs in an iframe on another origin: saves persist (`localStorage` can
   throw there, so every read and write is wrapped and the game says so once when it cannot
   save), audio starts only after a click, and the layout holds at itch's embed size and in
   fullscreen. A screen narrower than 900 px gets one plain line, "This game is for a desktop
   window", and the menu's save and load stay usable. Checked in Chromium at 1366 x 768,
   1920 x 1000 and the iframe size.
4. **A feedback path.** A version stamp (the commit's short hash and the date, written by the
   packaging step into the page) on the menu and in the head of every transcript. The curtain
   page thanks the player, says where to send feedback, and offers "Copy my run's transcript".
   **The place to send feedback is the author's to choose**: leave it as one string in
   `content/campaigns/flash_i/campaign.js` (`setup.feedback`) and ask the author in the
   exchange. No network call anywhere: the game collects nothing, and `itchtest` greps the
   page for `fetch(`, `XMLHttpRequest`, `sendBeacon` and `WebSocket` outside the editor.
5. **Saves across builds.** A build that changes the state's shape bumps `STATE_VERSION` with a
   migration (`AGENTS.md`). The test loads a save written by the previous release's state
   shape and asserts it migrates, or that the load says plainly that an older save cannot
   continue and offers a new game.
6. **A credits page** the game shows from the menu: every font, sound, image and data file in
   the zip, with its licence. **I cannot verify licences from the repository, so the author
   does.** The inventory, from a search of what the page loads, is below. A file without a
   licence the author can show is removed or replaced before it ships.

## The inventory the author confirms

Loaded by the page: `img/menu/tether.jpg`, `img/menu/gov.png`, `img/artifacts/flash-intro.png`,
`img/plays/flash_i_logo.png`, `flash_i_logo_black.png`, `flash_i_playbill.png`,
`img/portraits/flash.png`, `gb_chair.png`, `placeholder.png`, `tenaya.png`, `watkins.png`,
`img/signature-ink.png`, and the party logos in
`img/logos/` (twelve parties and their marks, a flag and `retrograde.png`). The sound is generated in
the browser (`js/audio.js`, `js/music.js`), so there is no audio file. There is no font file either:
the stylesheet uses the system's fonts (`--f-ui`, `--f-data`), so the page looks different on each
platform, and `npm run layout` measures one face.

**Art, the author's word (8 October):** every visual is the author's own or Creative Commons. `tether.jpg` is a Wikimedia Commons image the author edited (its author and licence are needed for the credits page); the rest the author made. `vantage_radiator.png` was generated by Claude and was removed.

**Licence findings (8 October), open until the author acts.** `tether.jpg` is "Florida" by Ralph Hockens, CC BY 3.0
(Wikimedia Commons): credited on the credits page, with the edit named. **`img/portraits/flash.png` and
`img/artifacts/flash-intro.png` are an edited photograph of CC BY-NC-ND 2.0** ("UK Government hosts AI Summit at
Bletchley Park", UK Government, on Flickr). ND forbids distributing a modified version, so these two cannot ship
as they are, and NC would bar a later paid release; the photograph is also of a real person shown as a fictional
Prime Minister, which a Creative Commons licence does not cover. **Cut on 8 October, on the author's word**, with `img/portraits/watkins.png` (a photograph with the UN emblem): the Prime Minister and the Leader of the Opposition now have no portrait file (the interface already shows the party's mark and the placeholder), and the introduction page has no image. `tenaya.png` is the author's own. Portraits for both are still to be made.
Also to be sourced: `tenaya.png` (a photograph of a cat; its author is unknown) and `watkins.png` (a photograph
with the United Nations emblem behind it, whose use the UN restricts).

**Removed on 7 October**, on the author's word: the recorded track "Ready to Fly" (the
introduction's music, a commercial recording with no licence to show) and
`img/La_Bionda__One_for_you_one_for_me.mid` (a transcription of another artist's recording,
referenced nowhere). `img/signature.png` is referenced nowhere and should not ship.

## Leave alone

The game's rules and content. Anything the brief did not foresee goes to the exchange as a
`question`, and you carry on with what does not depend on it.
