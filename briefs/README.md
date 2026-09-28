# Briefs

A brief is one task, written down so that any agent can pick it up cold:
Claude Code, Codex, or opencode. The author is often on a phone with one of
them and not the others, so work is handed over here, in the repository, and
not in a chat.

## Picking one up

1. Read `AGENTS.md`, then only the sections of `CLAUDE.md` and `LESSONS.md`
   the brief names. Do not read `bible.md` or `textbook.md` whole: use the
   section index at the top of `bible.md` and `sed -n` the range.
2. Check `git log` for the brief's subject first. If the work is already in,
   the brief is stale: delete it and say so.
3. Do the task. Keep to the files the brief names. If the task turns out to
   need a change the brief did not foresee (a new engine verb, new canon,
   player-facing prose), stop and write that into the brief rather than
   improvising it.
4. `npm run check` must pass. Where the brief says so, run
   `node tools/playtest.js --seeds 80` before and after and put both results
   in the commit message.
5. Delete the brief in the same commit as the work, and push to `main`. A
   push to `main` deploys the live game (the author, 28 Sep: "push to main
   and live, do that for everything in the future too").

## Lanes

| | |
|---|---|
| **Claude Code** | player-facing prose in the author's register (event pages, decisions, choices), canon and design judgement, architecture, and writing these briefs |
| **Codex** | engine, tools, tests and interface work from a brief |
| **opencode** | mechanical execution from a brief: applying an edited `prose.txt`, renames, small content edits, running the checks |

Each brief's first line names its lane. Prose that a code task needs is
written plainly and marked in the commit message for Claude to revise;
`npm run lint` holds every page, decision and choice to the rules in
`design/51` whoever wrote it.
