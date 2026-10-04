**Lane: opencode.** Written 4 October 2026 by Claude, from the author's
screenshot of the Economy tab on a 2000 × 990 window ("in rough shape"). It
replaces item 3 of the sitting-polish brief (items 1 and 2 were done by Codex and
verified by Claude on 4 October; that brief is deleted). Mechanical and measured: every change
below names the file, the function and the code, and each step is its own
commit.

Read `AGENTS.md` first, then `PROSE.md` Interface rules 8 and 9.

**Where to run it.** Steps 2 and 3 move panels and change the stylesheet, so
they need `npm run layout` (a real browser). Do them on the author's machine,
where Chromium exists. A headless runner has no browser: on one, do **step 1
only**, and say plainly in the commit message that no layout run happened. Never
report a layout check you did not run. If you can only run step 1, stop after
it; Claude reviews the rest in a browser.

## What is wrong, in the order a player meets it

1. **The panels are the wrong sizes for what they hold.** The top row's height
   is set by the tallest panel, the account, which holds the account rows *and*
   two money-call forms (about 630 px at a wide window). The prices table and the
   Reserve Bank panel stretch to match, and sit mostly empty below their last
   row, while the Underwriters' briefing, a long text, is squeezed into a
   330-px-wide box in the bottom row and scrolls.
2. **The third column takes all the slack** (`minmax(300px,1fr)` against
   fixed-width neighbours), so on a wide window the Bank and "What is made"
   panels are about a thousand pixels wide with three short rows in each.
3. **The money calls sit at the foot of the account**, below the fold at 1366 ×
   768, though they are what the player acts on (design/61).
4. **The two lenders appear twice** in one column: as account rows ("Earth's
   banks, none, 5.00 per cent, US$60.0bn undrawn") and again as call blocks
   that repeat the name and the rate.
5. **Units wrap under their figures** in the Reserve Bank panel ("2.8" with "%"
   on the next line; "0.840" and "US$"; "80" and "/100"). Cause: `.prow` is
   `grid-template-columns:1fr auto 54px`, and the value is the third cell, 54 px
   wide.
6. **A letter is hidden.** The selected row ("Held") has `box-shadow:inset 2px
   0 0 var(--gold)` and no left padding, so the gold bar covers the first letter
   of its sub-label: "asts 156 months at this rate".
7. **A dangling comma:** "The dollar: *near where it opened,*". Cause: the
   `fxSay` string in `drawBank` (js/ui.js, near line 1315) ends in `", "` when
   nothing follows it.
8. **An unlabeled empty column** in the prices table, between *Price* and *What
   the law does*. Cause: `drawBases` always emits `<th></th>` and a `bspark` cell,
   and the sparkline is empty until a price has history.
9. **Tails that restate the title or repeat the panel** (PROSE.md rule 8):
   "four bases, four prices, one row each", "drawings you can propose", and the
   "What is made" heading's "39.0% in paid work", which repeats the first row
   beneath it.
10. **Secondary labels are very small and low in contrast:** `.g-econ .plab em`
    is 10.5 px.

11. **The reserve chart hugs the left.** `.bigchart .bar{max-width:26px}`
    (css/terminal.css line 452) caps each bar, so eight yearly bars make a plot
    about 216 px wide in a panel 600 px wide. No scale is drawn beside it.
12. **Dead space inside panels, measured on the 2000 x 990 screenshot after step
    1:** the prices panel is blank for about 320 px below its note; the Reserve
    Bank panel for about 370 px; "What is made" for about 190 px. Meanwhile the
    account column, the money calls and the Underwriters' briefing are the most
    crowded things on the tab. Space is not the problem; where it is spent is.
13. **A scale mismatch:** figures are 18 px, their labels 10.5 px, and the panel
    headings 9 to 10 px. The tab is "read, not scanned" (the stylesheet's own
    words) yet is set at terminal-dense sizes, even on a window twice the size.
14. **Label and figure are far apart** on wide panels (a label at the far left, its
    figure at the far right, 900 px between), which makes rows hard to follow.
15. **The longest text is in the smallest box.** The Underwriters' briefing, four
    paragraphs, sits in a 330 x 250 px panel and scrolls.

Items 1 to 4, 11, 12, 14 and 15 are layout, 5 to 8 are bugs, 9 is wording, 10 and
13 are legibility. **Step 1 (done, 4 Oct) fixed 5 to 9.** Steps 2 and 3 are the
layout and legibility work, and the author's verdict on step 1 alone was "still
a lot of issues": whitespace in some panels, compaction in others.

## Constraints

- Do not touch `js/engine.js` or `content/`. Numbers come from content.
- Keep every id and data attribute the tests read: `#econ-account`,
  `#econ-calls`, `#econ-bank`, `#econ-real`, `#econ-outlook`, `#econ-bases`,
  `#econ-chart`, `[data-money-call]`, `[data-money-amount]`, `[data-draw]`,
  `[data-money-back]`, `[data-chart]`, `.money-refusal`. `tools/uitest.js` selects
  them (for example lines 1091 to 1163).
- No new player-facing text except the single column label *Trend* in step 1d.
  Name it in the commit message.
- Run `npm run check` before every push. Push each finished step to `main`.

## Step 1: five small bugs (safe headless)

**1a. Units stay on the line.** In `css/terminal.css`, after line 500
(`.g-econ .pval span{font-size:11px;}`), add:

```css
.g-econ .prow{grid-template-columns:minmax(0,1fr) auto auto;}
.g-econ .pval{white-space:nowrap;text-align:right;}
.g-econ .pval span{margin-left:2px;}
```

Rows with two children (the account's) put the value in the second, `auto`
column; rows with a sparkline use all three. Check the Bank's six rows, "What is
made" and the account rows.

**1b. The selected row no longer hides a letter.** After line 400
(`.g-econ .prow.pick.on{...}`), add:

```css
.g-econ .prow.pick{padding-left:6px;}
```

**1c. No dangling comma.** In `drawBank`, replace the `fxSay` assembly with:

```js
const fxMoved = Math.abs(m.fx / fx0 - 1) >= 0.03;
const fxSay = [
  fxMoved ? (m.fx < fx0 ? "down " : "up ") + Math.abs(Math.round((m.fx / fx0 - 1) * 100)) + "% since the opening"
          : "near where it opened",
  trend("fx").replace(/^,\s*/, "")
].filter(Boolean).join(", ");
```

Then read every other `say` builder in `drawBank` (`inflSay`, `next`, `gapSay`,
`credSay`) and make sure none can end in `,` or `;` when its optional part is
empty.

**1d. No empty column.** In `drawBases` (js/ui.js, near line 1231), compute
`const anyTrend = rows.some(row => ((st.priceHistory || {})[row.base] || []).length >= 2);`
(two points is the threshold `spark()` uses: it returns nothing below that). When `anyTrend` is
false, emit neither the `<th></th>` nor the `bspark` cell, and drop the matching
`<td></td>` in the totals row. When it is true, label the header `<th
class="n">Trend</th>`.

**1e. Cut the tails.** In `index.html`:
- delete `<em>four bases, four prices, one row each</em>` from the prices heading;
- keep "Commonwealth dollars, a year", "by its rule, every six weeks" and the
  Underwriters' "the only accurate numbers" (in-world voice, the author's
  decision);
- the "Money calls" tail goes in step 2, and the "What is made" heading's tail
  (`#econ-real-hdr`) in step 2 as well.

**Tests for step 1** (add to `tools/uitest.js`, then break each subject and
watch it fail, as AGENTS.md says):
- every `#econ-bank .plab em` text does not end in `,`, `;` or `:`;
- the prices table has no empty `<th>`, and every row has as many cells as the
  header;
- `.g-econ .pval` computes `white-space: nowrap` (jsdom can read the stylesheet
  if the test loads it; if not, assert the rule's presence in the stylesheet
  text).

## Step 2: re-place the panels (needs a browser)

Target arrangement, six panels in two rows:

```
        col 1              col 2               col 3
row 1:  The account        Prices              Money calls
row 2:  The Underwriters   The reserve (chart) The Reserve Bank and the dollar
                                               (with "What is made" folded in)
```

**2a. `index.html`, the Economy section (lines 258 to 324).**
- In `#p-acct`, delete the `<h3 class="rulehead">Money calls ...</h3>` and the
  `<div id="econ-calls"></div>` from the panel body. The body keeps only
  `<div id="econ-account"></div>`.
- Directly after `#p-acct`, add:

```html
<div class="panel" id="p-calls">
  <h2>Money calls</h2>
  <div class="pbody scrolls"><div id="econ-calls"></div></div>
</div>
```

  (`#econ-calls` keeps its id, so the tests still find it. This is the DOM order
  the narrow layout stacks in: account, calls, prices, and so on.)
- Delete the whole `#p-real` panel. Move its two children into `#p-bank`'s body,
  after `#econ-bank`:

```html
<div class="pbody scrolls">
  <div id="econ-bank"></div>
  <h3 class="rulehead">What is made, and who makes it</h3>
  <div id="econ-real"></div>
</div>
```

- Remove `#econ-real-hdr`, and in `js/ui.js` (near line 2416) delete the three
  lines that set `rh.textContent` ("39.0% in paid work"). Check `tools/` for any
  reference to `#p-real` or `#econ-real-hdr` and update it.

**2b. `css/terminal.css`.** Replace the grid and the placements (lines 350 to
351 and 364 to 369):

```css
.g-econ{grid-template-columns:minmax(264px,1fr) minmax(430px,1.5fr) minmax(300px,1fr);
  grid-template-rows:minmax(0,auto) minmax(250px,1fr);height:100%;min-height:0;}
#p-acct   {grid-column:1;grid-row:1;}
#p-bases  {grid-column:2;grid-row:1;}
#p-calls  {grid-column:3;grid-row:1;}
#p-outlook{grid-column:1;grid-row:2;min-height:0;}
#econ-chart{grid-column:2;grid-row:2;min-height:0;}
#p-bank   {grid-column:3;grid-row:2;min-height:0;}
```

Delete the `#p-real` rule (line 369). Fractions replace the fixed-and-slack
columns, so a wide window spreads the width instead of giving it all to the
third column. Check the narrow-window rule near line 1482
(`#s-econ .g-econ > .panel{grid-column:auto;grid-row:auto;}`) still stacks the
panels in a sensible order.

**2c. The call blocks stop repeating the account** (`drawMoneyCalls`, js/ui.js
near line 1377). In the template, change
`<div class="note">${esc(f.facility)} · ${Number(f.rate).toFixed(2)} per cent</div>`
to `<div class="note">${esc(f.facility)}</div>`. The rate and the room are
already on the account's lender row. Keep everything else, including the
amount field, the political note, Draw, and the refusal line.

**2d. Verify.** `npm run layout` must stay clean at all four sizes. Take
screenshots at 1366 × 768, 1920 × 1080, 2000 × 990, 1024 × 640 and 820 × 1180
and check: the account column fits without scrolling at 1366 × 768; the money
calls are visible without scrolling at 1366 × 768; no panel is more than half
empty at 2000 × 990.

## Step 3: spend the space, and set the type to match (needs a browser)

Do this after step 2. The goal is simple to state and to measure: **no panel
holds a large empty area, and nothing important is squeezed**, at 2000 x 990 and
at 1366 x 768.

**3a. Rows sized by their content; the tab scrolls as a whole, not inside narrow
panels.** In `css/terminal.css`, replace step 2b's grid rows and height:

```css
.g-econ{grid-template-rows:auto auto;height:auto;align-items:start;}
#s-econ.screen.on{height:100%;min-height:0;overflow-y:auto;}
.g-econ .pbody,.g-econ .pbody.scrolls{overflow:visible;max-height:none;}
```

(`align-items:start` stops a panel stretching to the tallest in its row, which
is what produced the blank boxes. Rows are `auto`, so each row is as tall as its
tallest panel. If at 1366 x 768 the tab then needs more than the window's
height, the whole tab scrolls once, rather than five panels each scrolling inside
a box. Keep the `scrolls` class on the panel bodies in the markup; only this
tab's rule above lifts it.) Check that `.screen.on` and the other screens'
rules are not affected: scope every selector to `#s-econ`.

**3b. Balance each row so its panels are about the same height,** because with
`align-items:start` unequal panels leave ragged white space under the shorter
ones. Row 1 (the account, the money calls, the prices) and row 2 (the briefing,
the chart, the Bank with "What is made") should each come out within about 60 px
of each other at 2000 x 990. Tune with the panel widths in 2b's
`grid-template-columns` fractions, not with fixed heights. The briefing wants to
be wide enough to read in about twelve lines: give column 1 more width on wide
windows (try `minmax(300px,1.25fr)`).

**3c. Fluid type, so a bigger window gets bigger text and not more margin.** In
`css/terminal.css`, replace the fixed sizes (lines 497 to 500, 507, 513) with:

```css
.g-econ .plab{font-size:clamp(13px,0.7vw,16px);}
.g-econ .plab em{font-size:clamp(11.5px,0.6vw,13.5px);}
.g-econ .pval{font-size:clamp(18px,1vw,24px);}
.g-econ .pval span{font-size:clamp(11px,0.55vw,13px);}
.g-econ .note,.g-econ p.ulook{font-size:clamp(12px,0.65vw,15px);}
.g-econ table{font-size:clamp(12.5px,0.68vw,15px);}
.g-econ > .panel > h2{font-size:clamp(10px,0.55vw,12.5px);}
```

At 1366 these resolve to the old sizes or just above; at 2000 they are about
10 per cent larger; they stop growing at 2560. Then measure the sub-label
colour against the panel background; if the contrast ratio is under 4.5:1,
darken it (`var(--ink)` at about 80 per cent, or the stylesheet's darker soft-ink
token). Do not guess.

**3d. Let rows breathe where they are short.** Rows of figures in the Bank and
"What is made" panels: the label and the figure are far apart on a wide panel
(issue 14). Flow them into columns so each row is about 340 to 460 px wide:

```css
#econ-calls{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:0 14px;align-content:start;}
#econ-bank,#econ-real{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));column-gap:20px;align-content:start;}
#econ-bank > :not(.prow),#econ-real > :not(.prow){grid-column:1 / -1;}
.money-call{padding:6px 0 8px;border-bottom:1px solid var(--chrome-dk);}
.money-call .btn{margin-top:5px;min-width:96px;}
```

If a child of `#econ-real` other than a row needs a different span, adjust the
`:not(.prow)` rule.

**3e. The chart uses its panel.** In `css/terminal.css` change
`.bigchart .bar{max-width:26px}` (line 452) to `max-width:80px`, and set
`.bigchart{min-height:180px}`. Eight yearly bars then fill up to 640 px and sixty
sitting bars still fill the panel. Add the plot's low and high figures at the
top and foot of the plot as small labels (`.chartaxis` already carries the two
end labels; the figures `low` and `high` are already printed in `.cnum`, so move
or repeat them beside the bars rather than inventing new numbers).

**3f. Verify, with numbers, not by eye.** In the browser (Edge or Chromium),
for each of 2000 x 990, 1920 x 1080, 1366 x 768, 1024 x 640 and 820 x 1180, run
this in the page and paste the result into the commit message:

```js
[...document.querySelectorAll("#s-econ .panel")].map(p => {
  const b = p.querySelector(".pbody") || p;
  const used = [...b.children].reduce((n, c) => Math.max(n, c.getBoundingClientRect().bottom), 0)
             - b.getBoundingClientRect().top;
  const r = p.getBoundingClientRect();
  return p.id + " h=" + Math.round(r.height) + " empty=" + Math.round(b.getBoundingClientRect().height - used);
})
```

Acceptance:
- at 2000 x 990 no panel reports `empty` over about 60 px, and no panel has an
  inner scrollbar;
- at 1366 x 768 the account, the money calls and the Underwriters' briefing are
  fully visible without an inner scrollbar (the tab as a whole may scroll);
- `npm run layout` is clean at all sizes, and the five screenshots are looked at
  by whoever ran it (describe what you saw in the commit message);
- all `[data-money-*]`, `[data-draw]` and `[data-chart]` behaviours still work
  (`npm run check`).

## Not in this brief (Claude's lane: wording)

- The "cost of existing" paragraph under the prices ("Index, 100 at the opening
  of the series...") is jargon.
- "The public: neither helping nor costing, 0 /yr" and "Credibility 80 /100" are
  cryptic, and "Trade balance 100 idx" has an unexplained unit.
- Amounts are typed in millions (8000 for eight billion) while every figure is
  shown in billions. Changing the input to billions means changing the handler
  and the tests, so it is a later batch, with its own review.
- The Underwriters' briefing leading the whole tab (design/61) is a larger
  re-layout; this brief puts the calls in the top row and leaves the briefing
  leading the lower row.

## Done

`npm run check` passes after each step; on the author's machine `npm run
layout` is clean; the new assertions fail when their subjects are broken. Delete
this brief in step 3's commit (or in step 1's, if only step 1 is possible, and
open a new brief for the rest).
