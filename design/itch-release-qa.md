# itch.io release QA — independent verification

**Lane: opencode. Report only; no game source, content, canon or styles edited; no release uploaded.**
**Tested commit: `5ac385c`** — the build stamps `5ac385c, 2026-10-08`. Its game source is byte-identical
to `main`'s `d6f103f` (which carries Codex's E10 batch `f9cdbbd` and Claude's image restoration
`5450070`); the commits between are this lane's exchange claims, the E5 inventory and one message
(`git diff d6f103f..5ac385c -- . ':(exclude)exchange' ':(exclude)design' ':(exclude)briefs'` is empty).

Browser: **Microsoft Edge (Chromium) 154.0.0.0**, headless. Firefox was not available, so nothing
here is a Firefox result. Screenshots are in `%TEMP%\opencode\audit-logs\qa\`.

## Command results

| command | result |
|---|---|
| `npm run check` | **exit 0, 18/18 checks passed in 171.57s** (4 parallel readers), including `itchtest`: "the itch.io package is healthy" |
| `npm run layout` | **exit 0, healthy** at 2560x1440, 1600x1200, 1440x900, 1366x768, 1280x800, 1024x640, 820x1180 (menu + 13 tabs; editor 20 tabs). **3 font stacks fell back** (Arial Narrow, Arial, Consolas): the measured widths are not what a player with the named font sees |
| `npm run itch` | **exit 0**; `dist/ways-and-means-itch.zip` **4.0 MB**, `index.html` 6.8 MB. Story removed: events 109, business 80, achievements 18, instruments 16, bills 8, initiatives 7, minutes 4, settlements 4 |

## The zip, inspected (not the Pages build)

- The zip holds **only `index.html` at its root**. Confirmed by unpacking outside the repository.
- `window.PLAYTEST = {"campaign":"flash_i","build":"5ac385c, 2026-10-08","version":"0.5.0"}`.
- **No network call**: `fetch(`/`XMLHttpRequest` appear once each, in a source comment explaining why content is `.js`; `sendBeacon`/`WebSocket` are absent. No `data-dev` script tags (one occurrence is a comment). The editor is not in the page.
- `Math.random` (13 uses) is the seed itself, the audio noise texture, and motion jitter — no unseeded event selection.
- 36 images in the `window.__ASSETS` table, including `img/menu/gov.png` and `img/plays/flash_i_playbill.png`.

## Browser QA (Edge 154, real layout)

**Passes.** Menu (build stamp, narrow line, one campaign, no Sandbox); the opening at sitting 1 with the
restored introduction image and portraits drawn (42 images with `naturalWidth > 0`); **all nine player
tabs** (Sitting, Government, Chamber, Party, Relations, Economy, Orbit, Foreign Affairs, Concordance);
the Chamber order paper and the estimates clause panel at sitting 4 (levels correctly locked/greyed);
the Treasury appointment at sitting 3; the "One spare slot" promise decision at sitting 5; the count and
division at sitting 11; **Act I plays menu to curtain** (sitting 17, curtain dated in words "Treasury and
Reserve Bank, 8 May 2080", with the thank-you and the report pointer). Credits open from the menu.

- **Save and reload:** saved at sitting 4 via the topbar Save, reloaded the page, the menu offered
  Continue, and the game **resumed at sitting 4**.
- **Transcript / report copy:** the in-game Options button "Copy playtest report" produced a **1788-character**
  transcript headed `Build: 5ac385c, 2026-10-08 / Seed: … / WAYS AND MEANS — PLAYTEST TRANSCRIPT`.
- **Audio only after interaction:** `Sound.context()` is `null` on the menu; after the first click it is
  **running**, and Options reads "audio: running · bed bar 1/8 · 9 layers up".
- **Embedding, cross-origin iframe** (game served on one port, parent on another): at **1366x768** and at
  **960x600**, the menu is up, **no storage warning**, a save persists, and there is **no horizontal scroll**
  and no page error. (1366x768 is the size named in `briefs/playtest-slice.md`; 960x600 is itch.io's default.
  No iframe size is recorded in the repository, so both were tested rather than assumed.)
- **Narrow window:** at 820x1180 the menu shows the red line **"This game is for a desktop window."**

## Faults

1. **The real-browser console is not clean** — the one claim this QA contradicts. On load the browser logs
   `net::ERR_FILE_NOT_FOUND` (11 console errors in a full run; **2 unique URLs**: `img/menu/gov.png` and
   `img/plays/flash_i_playbill.png`). Both images **do render** (they are in `__ASSETS`; verified visually on
   the menu and the campaign card), so this is a **pre-rewrite fetch race**, not missing art: the `<img src>`
   is inserted with the bare path and the `MutationObserver` in the build shim rewrites it to the data URI a
   microtask later, after the browser has already started (and failed) the file fetch. `tools/itchtest.js`
   asserts "the console is clean" in jsdom, which does no real fetch, so it cannot catch this.
   **Fix:** resolve the `src` through `__ASSETS` **before** insertion — the `url()` helper already exists at
   `js/shell.js:203`; use it in the templates at `js/shell.js:191` (`gov.png`) and `js/shell.js:439/461`
   (the playbill), instead of relying on the observer. The playbill also carries `onerror="this.remove()"`,
   so the same race is one scheduling change away from deleting the image.
2. **Curtain header date.** The top bar reads `2080-05-23` while the curtain prose reads "8 May 2080".
   This is the already-recorded `briefs/act-one.md` item 3 ("the curtain page reads the date the next period
   opens, not the rise"), deferred to Codex. Not a new fault; named here so the two dates are not mistaken
   for a regression.

## What could not be checked

- **Firefox.** Only Edge/Chromium was available; a Firefox pass is still owed.
- **The real itch.io origin.** The iframe test used two local origins; itch.io's own third-party storage
  policy could differ.
- **The final uploaded page** and the **licences** on the credits page: the author's, per the brief.
- The report copy reached a **stubbed** clipboard; the `execCommand` fallback path was not exercised.
- Fonts are the system's, so layout widths are the substitute faces' (see the three fallbacks above).
