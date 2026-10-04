**Lane: Codex, or opencode on a machine with a real browser.** Written 4
October 2026 by Claude, from the author's note on the Economy tab's chart
("Bar graph is alright. Doesn't feel like a real stock market/financial
indicator") and their choice: **lines for the sitting-by-sitting view, bars for
the yearly record.** Read `AGENTS.md` first, then this brief. The panel and its
layout are finished (Codex's step 3); this changes what is drawn inside
`#econ-chart`.

## Why it does not read as an indicator

It is a bar chart of a stock (a balance, a rate, a price), which is a line's
job; bars are for per-period flows. It has no axes: only two end labels and a
"high" and a "low", no scale, no gridlines. It lacks the furniture a financial
chart has: a last-value tag, the change since the last reading, a reference
line, a hover readout. And eight yearly points are too few to be a line, so the
yearly record stays bars, which is right for annual figures.

## The code

`js/ui.js`: `drawChart()` (near line 1121) draws the chart; `chartSeries(key)`
supplies `{label, unit, fmt, signed, pts, record, from, to}`; `chartScale` is
`"session"` (sitting by sitting, up to the last 60) or `"record"` (yearly,
content's `setup.history`); `chartOn` is the selected figure (`solvency`,
`balance`, `debt`, `inflation`, `rate`, `fx`, `growth`, `scarcity`, ...).
`css/terminal.css`: `#s-econ .chartwrap`, `.cplot`, `.chartbounds`, `.bigchart`,
`.chartaxis`. `tools/uitest.js` asserts the current bars and plot coverage.
Keep the heading controls (`#chart-scale`) and the 60-reading window.

## What to build

**Session view: a line with an area fill.** An inline SVG for the plot only
(`viewBox`, `preserveAspectRatio="none"`, `vector-effect:non-scaling-stroke` on
the strokes). All text (axis labels, the tag, the readout) is HTML positioned
over the plot by percentage, because text inside a stretched SVG distorts.
Line in `var(--ink)`, area at low opacity, the last point a gold dot
(`var(--gold)`, as the last bar is now).

**Record view: the same bars, with the same furniture below.** Label every
bar's year under it (there are about eight); if there are more than twelve,
label every second or third.

**The furniture, in both views:**
1. **A right-hand vertical axis** with four to six tick values and a light
   horizontal gridline at each, formatted with the series' own `fmt`. Use a
   "nice" tick step (1, 2 or 5 times a power of ten). The plot's range runs from
   the first tick at or below the data to the first at or above it; for `signed`
   series zero is always a tick and gets a slightly stronger line. This replaces
   the "high" and "low" labels (`.chartbounds`): remove them.
2. **A last-value tag** on the right edge at the last point's height: a small
   filled box showing `fmt(now)`.
3. **The change since the last reading**, beside the big current value: `▲` or
   `▼` and the signed difference in the series' units (for example `▲ +0.3%`).
   Neutral colour: whether up is good depends on the figure, and the tab's
   existing `up`/`down` classes mean alarm and calm, not rise and fall. Show
   nothing when there is one reading.
4. **A hover readout.** On pointer move over the plot, a vertical hairline and a
   small readout at the top of the plot: the reading's label (`sitting N`, or the
   year) and its value. No `title` attribute (this interface uses none); build
   the readout as an element. Make the plot focusable and move the readout with
   the left and right arrow keys, so it is not pointer-only.
5. **Reference lines, drawn from engine and content values, never typed:**
   - inflation: a dashed line at the Bank's target (`Engine.macro(st, C).target`),
     labelled `target`;
   - every `signed` series and the reserve: a line at zero (labelled only on
     the reserve, `empty`);
   - no other series needs one now.
   The labels `target` and `empty` are the only new player-facing words; name
   them in the commit message for Claude's register pass.

**Unchanged:** the heading ("The reserve", its tail), the scale buttons, the 60
window, the one-reading and no-record messages, ids and data attributes.

## Tests (tools/uitest.js)

Update the assertions that count bars or measure plot coverage for the session
view; keep the bars assertions for the record view. Add, and break each subject
to watch it fail:
- session view draws one `svg` polyline with `min(60, readings)` points;
- record view draws one bar per year, each year labelled;
- the ticks are four to six, ascending, evenly spaced, and bracket the data;
- the tag's text equals `fmt(last)`; the change's sign matches last minus
  previous; there is no change element with one reading;
- inflation shows a reference line whose value is the engine's target;
- a pointer move at the plot's midpoint shows the middle reading in the readout.

## Verify

`npm run check` and `npm run layout`. Screenshots at 2000 x 990 and 1366 x 768
for: the reserve (session and record), inflation, the budget balance (signed),
and the cost of existing. Look at each and describe what you see in the commit
message. Measure the contrast of the axis labels against the panel (at least
4.5:1). The step 3f empty-space numbers for `econ-chart` must not get worse.

## Not in this brief

The Economy tab's cryptic wording and the amounts typed in millions (Claude's
lane and a later batch). Delete this brief in the commit that finishes it.
