**Lane: Codex.** Written 28 Sep 2026 by Claude Code. From `design/47`,
"Not done". Read `LESSONS.md` "Interface" and "CSS and layout" first.

The Sandbox tab is the author's bench: every decision, event and lever,
shown in the game. The code is in `js/ui.js` (the `sbx*` functions, about
lines 7950–8250).

1. **Readable effects.** The bench prints a choice's effects as raw JSON.
   Print them with `Engine.describe(st, C, effects)`, the reading the
   decision panel uses (`choiceRow`), and keep the JSON behind a toggle for
   the author.
2. **Move the sitting.** A gate on the sitting number cannot be met from
   the bench. Add "play on N sittings", which plays them through the engine
   (`Engine.playSitting` then `Engine.advance`, as `tools/playtest.js`
   does), never by writing `st.sitting`. Faking the number leaves the rest
   of the state disagreeing, which is why this was left undone.
3. **Set a bill's stage.** The same, through the engine's own effect:
   `Engine.apply(st, C, [{ bill:{ <id>:{ stage:"<stage>" } } }])`, with the
   stages from `js/schema.js` `vocab.billStages`.

**Acceptance:** extend the sandbox assertions in `tools/uitest.js`, run
`npm run check`, and run `npm run layout` (install
`fonts-liberation-sans-narrow` first; `AGENTS.md` says why). Add a line to
`design/47` saying what was built.
