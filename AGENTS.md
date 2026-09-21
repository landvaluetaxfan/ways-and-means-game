# AGENTS.md

Canonical instructions live in **`CLAUDE.md`** — read it before changing anything.
This file exists so agents that look for `AGENTS.md` (opencode and friends) still
get the non-negotiables. If the two ever disagree, `CLAUDE.md` wins.

> Previously this path was a symlink to `C:/Users/led19/Documents/orbital/CLAUDE.md`,
> an absolute Windows path that resolved on exactly one machine and was a dangling
> link everywhere else, CI included. Keep it a real file.

## Division of labour

This repo is worked by two agents with different remits. Stay in your lane; it is
the whole reason the engine/content split is enforceable.

| | |
|---|---|
| **Claude Code** | `js/*`, `tools/*`, `test.js`, schema and vocabulary changes, structural/UI work, anything touching `js/engine.js` |
| **opencode** | `content/*.js` — events, bills, characters, stations, encyclopedia, glossary. Prose. |

If a content change seems to need an engine change, stop and leave it for the
engine pass. If an engine change seems to need new prose, leave a TODO in the
brief rather than writing placeholder narrative.

## The non-negotiables

1. **`js/engine.js` names no event, no party, no station.** Content is data in
   `content/*.js`. Adding content by editing the engine is always wrong; the
   thing you want is a content entry, or rarely a new verb in `EFFECTS`/
   `CONDITIONS` plus a matching entry in `js/schema.js`.
2. **No randomness in event selection** (bible §1.5). Determinism is what makes
   balance testable. `Math.random` is confined to the editor's graph layout and
   the seeded name generator.
3. **The rosters are frozen** (bible §2.7). Do not invent a station, a character
   or a glossary term in passing. Add to canon deliberately.
4. **One concept cluster per event** (bible §2.6). `tools/lint.js` enforces it.
5. **Bump `STATE_VERSION` and add an ascending migration block** whenever the
   shape of the state object changes. `test.js` walks every old version forward.
6. Content is `.js`, not `.json`, so the game opens from `file://` where
   `fetch()` is blocked. Do not "modernise" this into modules or a build step.

## Is there a work order waiting?

`opencode-brief.md` in the repository root, when it exists, is a task written
for you by Claude Code and committed rather than spoken — the author is often
away from the machine that runs you and this is the only channel between the
two agents. **Read it before starting anything.** Check the git log first: if
the work is already in, the file is stale and should be deleted.

A live instruction from the author always beats it.

## The prose file

The author edits prose in one place now, and it is not the content files.

```
npm run prose        write prose.txt — every sentence in the game
npm run prose:in     put an edited prose.txt back
npm run prose:check  the round trip (already part of npm run check)
```

There is also **prose.html**, a browser page that does the same thing with a
tree, a live preview and a download button. `npm run prosepad` checks it.

**If the author hands you an edited prose.txt: put it at the repository root
and run `npm run prose:in`.** That is the whole job. It replaces each passage
in its own content file surgically and leaves every comment and effect where
it was.

- Do **not** hand-edit content files from the prose file, and do **not**
  re-serialise them. The importer exists precisely because re-serialising
  produces valid JavaScript and destroys every comment in it, and the
  comments in `content/*.js` are half of what this repo knows.
- It refuses anything it cannot place unambiguously and names it. Those are
  the only ones to do by hand.
- A line starting `# ` inside a block is a note and is stripped on the way
  in. That is the channel for describing what a passage must DO without
  putting it in the game.
- Run `npm run check` afterwards; the round trip is asserted there.

## Before you finish

```
npm install      # once, for jsdom
npm run check    # all ten, about three seconds
```

All ten must pass. They are the only playtester this project has.

## Windows: never read or write source through the shell

PowerShell 5.1 decodes UTF-8 as Windows-1252, so `Get-Content`, `Select-String`
and `Out-File` DISPLAY correct UTF-8 (em dashes, minus signs, middle dots, the
section mark) as mojibake. That display is a lie about the file. Worse, the
`Set-Content` "fix" for it writes the corruption in for real.

- READ source with the editor `read` tool, or `node -e`. Both decode UTF-8
  correctly. Never `Get-Content`, never `Select-String`, when the bytes matter.
- WRITE source with the editor `edit`/`write` tools, or `node -e` with
  `fs.writeFileSync`. Never `Set-Content`/`Out-File` on `.js`, `.css`, `.html`
  or `.md` — PowerShell 5.1's `Set-Content -Encoding UTF8` also adds a BOM.
- To test for real corruption, run `npm run enc` (`tools/enccheck.js`) and
  ignore whatever the console printed. It reads every tracked text file with
  node, and `--fix` repairs what it finds.

**Do not hand-roll that test.** The obvious version of it is wrong, and it is
why this corruption shipped *after* being verified. The check that cleared it
scanned the decoded text for `\u00c3` (`\u00c3`) followed by a continuation byte \u2014
but that spelling belongs to the raw bytes. Once node has decoded the file,
double-encoded UTF-8 reads `\u00c2`, not `\u00c3`. The test matched nothing, and a
mangled `js/ui.js` was declared clean and left live.

`tools/enccheck.js` does not pattern-match the damage at all. It tries to
REVERSE it \u2014 a run is mojibake if and only if re-encoding it as CP1252 yields
bytes that decode as one valid non-ASCII character. That is decidable, and it
is also the repair.
