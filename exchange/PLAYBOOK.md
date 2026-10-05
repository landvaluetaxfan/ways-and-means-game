# The orchestrator's playbook

For whoever is orchestrating (today, a Claude Code session on claude.ai/code),
and for that session after its context is compacted. The rules are in
`AGENTS.md`, the work is in `briefs/`, the protocol is in `README.md` here. This
is the judgment between them. Where it disagrees with those, they win.

## Starting cold

A fresh orchestrator gets the judgment from files, not from a conversation. Read,
in this order, and stop reading when you can say where the work stands:
0. **`git pull origin main` first.** A clone that is a few commits behind is missing
   files, and every file you cannot read is a wrong guess. If a read fails, pull
   before you conclude anything.
1. `AGENTS.md` (loaded through `CLAUDE.md`), then this file and `README.md` here.
2. `node tools/exchange.js inbox --as claude`, then `briefs/README.md` and
   `briefs/claude-lane.md` (the backlog that is yours).
3. `design/62-why-the-overhaul.md`, and the first screen of
   `design/58-the-game-on-one-page.md`, for why the game is shaped as it is.
4. `git log --oneline -25` for what has just happened, and
   `node tools/exchange.js status` for what is open, including anything waiting
   on the author. Surface those to the author; they are not yours to answer.
5. **Never start a worker on a brief you have not opened.** A brief can be mostly
   landed and still be on disk, with its remaining work moved elsewhere. Read its
   first lines (a STATUS line says so), then `git log --oneline -- <the files it names>`.

Then say, in ten lines, the state of play, what you would do next, and what you
are unsure of. **When the author corrects you, write the correction into this
file** (a new line under "What the author dislikes", or "Traps"), not only into
chat. A chat is forgotten; this file is how the next orchestrator learns it.

## The job

Write briefs, set the order, review what lands, keep the exchange current, and
spare the author's usage. Do not implement what a lane can. Take the work that
needs the author's register or design judgment (prose, canon, interface layout),
because that is the lane where an orchestrator is better than a worker.

## How each lane is started

| lane | how | notes |
|---|---|---|
| Claude | this session, or a sibling cloud session (`create_session` with the repo, then `SendMessage`) | spends the author's Claude usage; use for prose, canon, layout, review |
| Codex | the author starts it on their machine (Agent Orchestrator, **+ Task**, a Codex agent) with a prompt that claims the brief | a cloud session cannot reach it. Its own sandbox cannot push |
| opencode | `actions_run_trigger` on `opencode.yml` with a `prompt`, or a `/opencode` comment on an issue | runs headless, runs `npm run check`, pushes to main if green. Ask the author before starting one: it spends their API key |

Every worker prompt names `PROSE.md`. Workers write strings, and the register applies to a button
label as much as to an event page; read the Interface section first.

A local Claude Code session shows up in `ListAgents` only if the author runs
`claude remote-control` in the clone. Otherwise nothing local is reachable from
here, and the exchange is the channel.

## What to do when work lands

1. `git fetch`, read the lane's `done` message and the commit message, then
   `git diff --stat`. Did it keep to the files the brief named, and do only what
   the brief says? Workers drift; the brief is the contract.
2. `npm install` if needed, then `npm run check` (about ten minutes). Do not edit
   files while it runs, and do not release a claim mid-run (enccheck reads the
   tracked file list and crashes on a file that has gone). Then CI on the commit.
3. Anything on screen: Playwright with Chromium at `/opt/pw-browsers/chromium`
   (`NODE_PATH=$(npm root -g)`), screenshots at 1920 x 1000 and 1366 x 768 of every
   touched panel, and `npm run layout` after CSS. Look for clipped text, blank
   bands, a number shown twice, a label far from its value.
4. Anything that moves balance: `node tools/playtest.js --seeds 80` before and
   after, in the commit message, and `npm run guards` for the canon.
5. Prose: lint, and `PROSE.md`. The register is Claude's; a worker's plain
   wording is named in its commit message for a pass.
6. Post a `review` to the lane: what was checked, how, and what is left. Fix a
   small thing yourself and say so. Anything larger becomes a new brief.
7. Release the claim if the worker forgot (its brief is deleted), and delete any
   brief the work has made stale.

## What the author dislikes

Learned from their corrections. Check new screens against these before they ship.

- **A line that restates what the panel already shows.** A count beside the list
  it counts, a tail that repeats the title, "6 of 6 left" beside a bar of six.
  Keep a tail only for a unit, a scope, an ordering, a condition or an
  instruction. In-world characterisation ("the only accurate numbers") stays.
- **The design's theory on the screen.** "Advice while there is time to act" is
  how the designer thinks, not what the player needs.
- **Empty placeholders.** A heading with no body, or an empty state that says
  nothing about what the panel is for.
- **White space beside crowded elements.** Size panels to their content.
- **A number with no meaning.** A bare 64 in a column, "100 idx", an undefined
  term ("docket", "SESS 4.1"). Say what it is, or cut it.
- **Buttons that just do things.** An act with nobody reacting (design/71).
- **A browser's default controls** on a panel that has its own style.
- **Dramatic or hostile speeches.** A line that works as a headline, a lead-in ("before anything
  else"), or a question that opens with the player's past. Openings are neutral, and
  hostility is earned. PROSE.md, the third round; `npm run register -- flourish` and
  `-- charge`.
- **Cost surprises.** The author pays for every token. Read ranges, keep output
  short, and hand mechanical work to the cheaper lane.

## What the author likes

The model to follow, not only the faults to avoid.

- **A figure translated into a consequence.** "What the Underwriters say" (Economy) states
  the numbers and what they mean for the country in one voice, and the author says it makes
  them feel real. Where a panel shows a bare figure, prefer a line like that to a label.

## Check what a worker pushed, not only what it says

The first run of the exchange showed the pattern. A worker's claim commit also
carried its content edit, and a prose line changed that the brief had excluded.
Read `git show --stat` of every commit a worker pushes while it works: a claim
commit holds only `exchange/` files; work lands once, after the checks, with the
brief deleted and the claim released; and a text change the brief did not ask for
is a finding to post, however small. Workers can be steered live with
`SendMessage` when `ListAgents` shows them, and in the exchange when it does not.

## "Landed" means on origin/main

The first parallel run showed three more things.
- **A local commit is not landed.** An orchestrator reported a worker's interval work
  as "landed on main"; it was a commit in the worker's own workspace and was not on
  GitHub at all. Before you say a thing has landed, check `git ls-remote origin main`
  or `git log origin/main`, not the worker's tree, and never rely on a status label.
- **An answer in the exchange does not wake a paused worker.** The exchange is
  asynchronous; a worker that posted a question and ended its turn waits until
  someone tells it. When you answer, also `SendMessage` the worker the answer (or
  tell the person running it). Expect a task that reads "building" in the app to be
  idle: the label does not distinguish working from waiting.
- **A prompt is not a shell string.** A backtick inside a double-quoted shell
  argument runs as a command and corrupts the prompt. Pass prompts through single
  quotes or a file.

## Deciding and asking

Decide when the answer follows from a standing rule, a locked bible section or a
recorded decision. Ask the author, with `--to author --kind decision`, when it
changes canon, what ends a run, or what the player is told in the author's voice
that no record covers. Give the options, a recommendation and what each costs, and
carry on with whatever does not depend on the answer. Never wait idle.

## Traps already met

- A cloud sandbox cannot push to GitHub (403). The author runs Codex on their
  own machine for that reason.
- Windows PowerShell writes mojibake and a BOM. Read and write source with node or
  an editor, and trust `npm run enc`.
- `index.html` and `js/ui.js` are shared by every interface task. Check the
  claims before touching them, and keep to a different function.
- Push to main only after `npm run check` passes; the live game deploys from it.
- **A character's id is not their name.** `halloran` is Dan Czarnecki, `vellan` is Suravaram
  Vidyasagar. Read `name:` in `content/characters.js` before you write anyone into prose or a
  message; the author catches the old id at once.
