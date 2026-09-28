**Lane: Codex.** Written 28 Sep 2026 from the author's note, to do next.

The author: "decisions, both the decisions themselves and the body text
should have tooltips, links to concordance pages, etc." Read `LESSONS.md`
"Interface" first.

## What exists

- `annotate(html)` in `js/ui.js` (about line 4403) wraps glossary terms in
  the decision body (`#sitting-prose`) and on event pages with a tooltip
  (`data-tip-title`/`data-tip-body`, drawn by `js/tips.js`) and a link to
  the term's Concordance article. It knows only glossary terms.
- A choice's label, note and result are printed with plain `esc()` in
  `choiceRow` (about lines 4929 and 4935), in the result line, and in the
  sandbox (about 7957 and 8163). They get no annotation at all.
- `Concordance.knows(id)` (`js/encyclopedia.js`, about line 1183) answers
  whether an article exists. `[data-go]` inside `#shell` opens one
  (`LESSONS.md`: the handler is scoped to `#shell` because the menu uses the
  attribute too).

## The work

1. **Link names, not only terms.** Wherever a decision's body, a choice's
   note or a result names a person, a party, a current, a station, a
   constituency, an institution (the Tribunal, the Reserve Bank, the
   Underwriters, the Registry) or a company, link the first mention in each
   passage to its Concordance article with `data-go`. Give it a tooltip whose
   body is the article's first sentence. Build the name-to-article index
   from content (characters' names and surnames, parties' names and short
   names, currents, stations, `INTRODUCE`'s names in `tools/pagecheck.js`),
   never from a list typed into the interface. Match the longest name first,
   as `annotate()` does for terms.
2. **Choices.** Annotate the note and the result the same way. A label sits
   inside a `<button>`, and a link inside a button is invalid and would
   fire the choice, so a label gets tooltips only, with no `data-go`.
3. **One tooltip system**: `js/tips.js`, as `annotate()` already uses. No
   new tab stops outside explain mode.
4. **Tests**: `tools/uitest.js` asserts that a decision's body links a
   named party and a named person, that a choice's note carries a link,
   and that a label carries a tooltip and no link. Break each one and watch
   it fail. Run `npm run check` and `npm run layout`.
