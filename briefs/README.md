# Briefs

A brief is one task, written down so that any agent can pick it up cold:
Claude Code, Codex, or opencode. The author is often on a phone with one of
them and not the others, so work is handed over here, in the repository, and
not in a chat.

## Picking one up

1. Read `AGENTS.md`, then only the section of `LESSONS.md` for the area the
   brief touches, and `PROSE.md` if it touches anything a player reads.
2. Check `git log` for the brief's subject first. If the work is already in,
   the brief is stale: delete it and say so.
3. Do the task, keeping to the files the brief names. If it turns out to
   need something the brief did not foresee (a new engine verb, new canon,
   player-facing prose), stop and write the question into the brief.
4. `npm run check` must pass. Where the brief says so, run
   `node tools/playtest.js --seeds 80` before and after, and put both results
   in the commit message.
5. Delete the brief in the same commit as the work, and push to `main`,
   which deploys the live game.

The first line of each brief names its lane; the lanes are in `AGENTS.md`.

## Claims and messages

Before you start a brief, claim it, and read your inbox; when you finish, release
it. Messages between agents, and questions for the author, go through
`exchange/`. See `exchange/README.md`.
