**Lane: Claude Code.** Marked 4 October 2026, at the author's request, to be
done after the opening slice lands and before any human tester plays. It
costs the author's Claude usage, so it is deliberately last.

# Walk the opening as a first-time player

Play sittings 1 to 16 of Flash I (to the first recess) in the real browser
that Claude Code has, as someone who has never seen the game, and list every
point of confusion before a human tester meets it.

**How.** Use Playwright with the same Chromium as the layout check. At each
sitting take a screenshot of what a player sees, and record, without using
any knowledge of the code:
- what the screen asks of me, in my own words;
- what I would click, and why;
- what I did not understand (a term, a number, a button, a tab);
- what I expected to happen and what did.

Play it three ways: take the political bargain (the carve-out), refuse it,
and ignore the brief; and once following the owner's counsel and once the
dissent's. Do not use the engine to skip anything.

**Output.** `design/69-first-player-walkthrough.md`: a table of moments and
points of confusion, ranked by whether they would stop a player, plus a
short list of fixes sorted into Codex (interface), Claude (wording), and
author (design). Fix the cheap wording ones in the same commit.

**Why.** design/66 and the opening-slice brief say human enjoyment and
comprehension are unproven. A reading of the screens by something that can
follow the whole rule set will catch the obvious faults, so that human
testers spend their time on the non-obvious ones.

Delete this brief in the commit that writes design/69.
