**Lane: Codex** (the fixture's prose is throwaway and stays out of the game).
Written 28 Sep 2026 by Claude Code. From `design/46` "What is left".

## Why

The game is a vessel for the author to write campaigns in, and Flash I is
the only campaign that has ever been written for it. Nobody knows where the
vessel forces a second author out of content and into code.

## The work

1. Read `CONTENT_GUIDE.md`, `design/46`, and how a campaign registers: the
   `campaign("<id>", {...})` calls in `content/campaigns/flash_i/`,
   `tools/loadcontent.js`, and `CONTENT.forCampaign`.
2. Write a throwaway campaign of six to eight events on a different premise
   from Flash I, using only the world's existing stations, characters and
   parties. Invent no canon (bible §2.7). Include:
   - a decision chain;
   - an outcome event;
   - a promise (`undertake`);
   - an order;
   - a settlement, so that it can end.

   Put it in a fixture folder, for example
   `tools/fixtures/campaigns/dryrun/`, never in `content/`, so it can't
   appear in the game's menu.
3. Author it the way the author would, through the editor's "make a new
   campaign" and entry forms wherever they reach (`js/editor.js`). **Log
   every point where the work was forced out of content:** an engine edit,
   raw JSON, a hand-edited file, or not knowing how.
4. Add a check that loads the fixture, plays it to its end with
   `Engine.playSitting`, and asserts that it settles. Wire it into
   `npm run check`.

**Fix the small gaps you found. Write the rest into
`design/53-the-dry-run.md`**, with what each would take.
