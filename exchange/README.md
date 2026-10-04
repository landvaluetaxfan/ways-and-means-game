# The exchange

Claude Code, Codex and opencode share one repository and nothing else, and the
author often has only one of them open. What they say to each other lives here,
as files, so that no one has to carry it by hand. The tool is
`node tools/exchange.js` (no install; `npm run exchange -- <command>` is the
same). Its header lists every command.

## The five habits

1. **Start by reading the inbox:** `node tools/exchange.js inbox --as <lane>`
   (`claude`, `codex` or `opencode`). It prints the messages waiting for you and
   the claims others hold. Claude Code runs it by itself at session start;
   Codex and opencode read it because `AGENTS.md` says to.
2. **Claim a brief before you work on it** with the files you will touch, and
   push the claim **on its own, to main, at once** (`exchange/` only, commit
   message "claim: <brief>"). A claim is how the others learn a file is busy.
   If you must touch a claimed file, change a different part and post a note.
3. **Say what the next agent needs** as a message, not in chat: a finding, a
   blocker, a question the brief did not foresee, a review of work that landed.
   A message is one file, `messages/<stamp>-<from>-<to>.md`, with a header and a
   text. It stays `open` until the reader acts on it and runs `close`.
4. **Release the claim in the commit that finishes the work**, with the brief's
   deletion. `npm run check` fails on a claim whose brief is gone, so a landed
   brief cannot hold its files forever, and it reports claims older than a week.
5. **Ask the author through the exchange,** with `--to author --kind decision`:
   the options, your recommendation and what each costs. The author answers in
   any session ("answer <id>: the second"), and whoever hears it closes the
   message with the answer, so it reaches every lane and survives the session.

## Kinds

| kind | use |
|---|---|
| `note` | something the reader should know before they touch a file |
| `question` | a question the brief did not foresee; Claude answers, in a `design/` record if it is a decision |
| `answer` | the reply, made by `close <id> "reply"` |
| `finding` | a fact found while working (a test that cannot run offline, a file that moved); lasting ones also go in `LESSONS.md` |
| `review` | a verdict on landed work: what was checked and how, and what is left |
| `blocker` | you cannot continue; say what you need and from whom |
| `decision` | for the author, with options and a recommendation |
| `done` | the work landed; the commit is named |

## Rules

- **Git is the only transport.** Codex's cloud sandbox cannot push, and a chat
  is not shared. A message not pushed to main does not exist for the others.
- **One file per message and per claim**, never edited by hand except to close.
  That is why two agents writing at once do not conflict.
- **A message is for one lane** (or `all`). Do not answer your own mail, and do
  not leave a message open once you have acted on it.
- **Keep it to what changes what the reader does.** A message that only reports
  effort is noise; the commit message already says what was done.
- **The tool never runs git.** Commit `exchange/` yourself and push it.
- **Check:** `node tools/exchange.js check --as <lane>` validates the files and
  notes any file you changed that another lane holds. It is part of
  `npm run check`.
