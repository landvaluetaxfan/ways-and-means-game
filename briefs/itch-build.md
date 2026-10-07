**Lane: Codex builds, opencode runs the checks. Claude Code wrote it, 7 October 2026.** Exit gate
items 12 to 16 of `briefs/act-one.md`: what the public itch.io playtest slice needs that the game
does not yet have. Read that section first.

# The itch.io build

**STATUS: not started.** Claim it as `itch-build` with `tools/package-itch.js`, `tools/itchtest.js`
and the credits page's file. `js/ui.js`, `index.html` and `css/terminal.css` are held by
`ui-tabs`, so the version stamp, the feedback line and the narrow-screen line are written to a
small new file (`js/release.js`, a plain `<script src>`) that adds them to the menu and the
curtain page, and a hook is asked of `ui-tabs` through the exchange.

## What to build

1. **`tools/package-itch.js`.** Runs `tools/build.js` (one playable file, no `data-dev` scripts),
   and writes `dist/ways-and-means-itch.zip` holding `index.html` (the built file) and nothing
   else. itch.io serves a zip of an HTML5 game with `index.html` at its root, and the single file
   keeps the page working with no server. The build is about 15 MB because the music track is
   inlined (`img/audio/ready_to_fly.ogg`, 5.5 MB), and itch accepts far more.
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

Loaded by the page: `img/audio/ready_to_fly.ogg` (5.5 MB; the introduction's music, "The
introduction opens on Ready to Fly, 52 seconds in"; source and licence unknown to the
repository), `img/menu/tether.jpg`, `img/menu/gov.png`, `img/artifacts/flash-intro.png`,
`img/plays/flash_i_logo.png`, `flash_i_logo_black.png`, `flash_i_playbill.png`,
`img/portraits/flash.png`, `gb_chair.png`, `placeholder.png`, `tenaya.png`, `watkins.png`,
`img/events/vantage_radiator.png`, `img/signature-ink.png`, and the party logos in
`img/logos/` (twelve parties and their marks, a flag and `retrograde.png`). There is no font
file: the stylesheet uses the system's fonts (`--f-ui`, `--f-data`), so the page looks different
on each platform, and `npm run layout` measures one face.

**Not loaded and not to ship:** `img/La_Bionda__One_for_you_one_for_me.mid` (108 KB, a
transcription of another artist's recording, referenced nowhere; the author may wish to remove
it from the repository altogether) and `img/signature.png` (referenced nowhere).

## Leave alone

The game's rules and content. Anything the brief did not foresee goes to the exchange as a
`question`, and you carry on with what does not depend on it.
