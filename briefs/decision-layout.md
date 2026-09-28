**Lane: Claude**, next, with the author (28 Sep 2026). Stylesheet and
`js/ui.js`'s sitting panel; no engine, no content.

# The decision sits too far below its page

The author, comparing a decision with one from Things That Never Were:
"decisions still awkwardly pushed to the bottom ... maybe paragraph takes up
entire width? don't know if this will be bad for legibility, or if it has a
better fix".

## What is wrong

- The prose is capped at 100 characters a line (`#sitting-prose`), and the
  choices span the full panel below it. The two blocks have different
  widths, so the decision reads as a separate strip at the foot of the
  screen, not as the end of the page.
- Each choice row stretches the full width. Its posture badge sits at the
  far right, so on a wide screen it sits far from the words it qualifies.
- A long body pushes the choices below the fold with nothing to say they
  are there.
- Things That Never Were keeps the question and its answers in one compact
  card: one width, one column, the answers directly under the question.

## Why not full width

At the sitting panel's width on a 1920 screen a full-width line would run to
about 180 characters. Reading slows and lines get lost past about 90. The fix
is to bring the decision to the text, not to widen the text to the decision.

## The plan

1. **One reading column.** Prose and decision share one width and one left
   edge, about 88 characters at the reading size. The portrait floats
   inside that column. The panel's spare width stays empty on both sides
   (centred) or on the right (left-aligned). Decide which by screenshot.
2. **The decision as the page's last section.** The DECISION rule and the
   choice rows sit directly under the last paragraph, inside the same
   column, with the page's spacing between them and not a panel break.
   The posture badge sits beside the label in that column.
3. **Compact rows.** Keep what a row carries (label, reactions, posture,
   the expanding note), with less padding. Four choices should fit where
   three fit now.
4. **A way down from a long page.** When the choices start below the fold,
   a small "Decision ↓" link at the top of the page jumps to them. Try a
   sticky decision header instead only if the link is not enough.
5. **Event pages keep their measure.** A page that takes the screen
   (`#s-sit.setpiece`) already reads at 66 characters. The same rule holds
   there: the answer rows take the page's width.

## Checks

- `npm run layout` at 1366, 1920 and 820 wide, after installing
  `fonts-liberation-sans-narrow` (AGENTS.md). Nothing clipped or escaping.
- `npm run check`, uitest and uxtest especially (focus, expanding rows,
  the division dialog).
- Screenshots before and after, at 1366 and 1920, of the opening decision
  (`the_commission`) and a four-choice decision, for the author.
