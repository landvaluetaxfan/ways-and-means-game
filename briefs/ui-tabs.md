**Lane: Codex builds, Claude Code reviews.** Written 5 October 2026 after Claude audited
the five tabs the author called rough: Government, Economy, Party, Relations and Foreign
Affairs. Sitting, Chamber, Orbit and Concordance are satisfactory and are **not** to be
touched. The Sandbox is the author's bench and is out of scope.

# The five tabs

**STATUS: not started.** One pass per tab, in this order, one at a time. They share
`index.html`, `js/ui.js` and `css/terminal.css`, so two passes never run together, and a
pass is claimed as `ui-tabs` and released when its tab lands. When a tab lands, delete its
section here in the same commit; the last pass deletes the file.

**Order:** Government (the player acts here, and it sets the shared tokens), Economy, Party,
Relations, Foreign Affairs.

## How every pass runs

1. `git pull origin main`, claim `ui-tabs`, read `PLAYBOOK.md`'s "What the author dislikes".
2. **Before:** screenshot the tab at 1366 x 768 and at 1920 x 1000 (boot the game, pass the
   opening pages, click the tab; `NODE_PATH=$(npm root -g)`, Chromium at
   `/opt/pw-browsers/chromium`). **After:** the same two shots. Post all four to the
   orchestrator as paths in a `review` message.
3. Touch only the tab's own functions, markup and rules. Add no literal pixel size or colour
   that the stylesheet has a token for. Wording a player reads is Claude's: write plain
   strings, and name every one in the commit message for a pass.
4. `npm run check` and `npm run layout`. Where a test asserts markup you changed, update the
   assertion and break-test it. No engine change, so no playtest.
5. **Leave alone the surfaces the unlanded witnessed-acts work edits** (branch
   `integrate/witness`, `briefs/witnessed-acts.md`): the Economy **Money calls** panel and its
   Draw buttons, the initiative-post and instrument dialogs, and everything in Sitting and
   Chamber.

## Pass 1 also sets the shared rules

- **A type scale.** List every `font-size` the five tabs use today. Collapse them to at most
  five steps held as tokens on `:root` (label, body, small mono value, value, large figure),
  and use them in all five passes. Today a single card row mixes three sizes and three faces.
- **One panel grammar.** A panel is sized to its content. A tab has no blank band of more than
  about 60 px beneath its lowest panel while another column is taller, at either size.
- **An empty state is one line, or the panel is absent.** No tall panel holding one sentence.
- **A number says what it is.** No bare 44, no "100 idx", no column of dashes at the opening.
- **Top bar** (shell, once): the party and campaign string is clipped ("Flash I..."). Fit it or
  truncate it with a tooltip. `SESS 4.1` is an unexplained label: say what it is or cut it.

## Government

- **The Work File is empty on arrival**: a blank pane two thirds of the screen wide. Select
  something on arrival (the Treasury vacancy if there is one, else the first business), and
  keep the empty line only for a cabinet with no business at all.
- **The Cabinet rail** is fourteen identical grey silhouettes, and the rail scrolls before the
  eleventh minister at 1366. Draw a portrait only where one exists. Use a compact row that
  shows the business count already in `gov-rail-work`, so all fourteen fit.
- **"All government business"** reads as a text field. Style it as the rail's first row, with
  the selected state the ministers use.
- **Business rows have no grammar.** One title line, then one meta line: kind, cost, reference
  ("Initiative", "Order · SI 2080/51 · affirmative"). Today an order shows a blue link, a
  larger-type kind line and a tiny tag. The cost pips are gold outlines; use the small
  bevelled blocks of the order-paper counter above them (the strip was fixed in `8029eb4`).
- **The Treasury's vacancy** is a card, a rail tag and (by design) initiatives on the PM card.
  Say it twice at most. The `lean_on_governor` and `defend_dollar` placement is a canon
  question for the author: do not move them.
- **The utility strip** (Register, Undertakings, The Tribunal, Presidency) floats above the
  columns. Make it one row of tabs that matches the main tabs; the pending count is a badge in
  the main tabs' style.

## Economy

- **Do not touch Money calls.** Everything else is in scope.
- **"What the Underwriters say"** repeats the Account's figures in prose (receipts, spending,
  the deficit, the reserve, the four prices). That text is built from the engine's figures
  (design/45) and is the author's call, not yours: leave it, and post a `question` with the
  duplication to the author.
- **"none", "none", "CW$0m"** are set in the large figure type. An undrawn facility is quiet
  text at the label size.
- **Wording to fix** (plain strings, for a Claude pass): "100 idx", "80 /100", "The public 0 /yr",
  and the cost-of-existing paragraph ("Index, 100 at the opening of the series"). Say what each
  measures, in a phrase, or cut it.
- **Layout.** At 1366 the tab scrolls 280 px and the chart and the Reserve Bank fall below the
  fold. At 1920 there is a 300 px blank band under the last row. Order by use: account, prices,
  the Bank and the dollar, then the chart, with panels filling both columns.
- **The chart's first bar** carries an "empty" tag. Explain it on hover or drop it.

## Party

- **The left column is empty below the Benches table** (about 540 px at 1366). Move "The
  Country" under the table; the right column then holds the Leadership alone.
- **"Standing by band"** prints 44 five times at the opening, because every band equals the
  national figure. Show the national figure once, and list a band only when it differs.
- **The SIG column** is a column of dashes with no paper circulating. Hide it until a paper is.
- **The detail panel's text** wraps at about 450 px inside a 560 px panel. Let it fill. The mono
  tails under the bills ("26 of 32 . 6 will not vote with the party") repeat per row: say it
  once in a column head.

## Relations

- **"Who they vote with"** is clipped at 1366: the last rows are cut off with no scroll cue.
  Give it its natural height. The shadow cabinet is thirteen two-line entries; set it as a
  two-column list of name and portfolio.
- **"What they want"** carries a mono tail on every bill ("drafting . +2 a stage you grant
  it"). Make it a column, "Ledger per stage you grant", with the stage as the row's sub-label.
- **"The terms"** mixes mono and sans values. Right-align every value in one face and size.
- **The table's `CR` and `IF THEY GO` columns**: `CR` is undefined. Head it "Ledger".

## Foreign Affairs

- **Two tall, near-empty panels** (What is selected, Relevant actors), each with one sentence,
  beside the globe at the opening. Make the right-hand column "What is selected", sized to its
  content, and show "Relevant actors" only when there is one. Let the globe have the width.
- **The toolbar hint** ("Drag to turn it. Click an anchor or a country. Wheel to zoom.") touches
  the panel's edge.
- **The globe has no key** to the rings and the dotted lines. Add one short line.
- **Not audited:** the MAP and STILL modes. Check them in this pass.

## Done when

The orchestrator has looked at the four screenshots and the checklist above, and every line is
met or has a stated reason. The author sees one screenshot of each landed tab. Anything the
author corrects goes into `exchange/PLAYBOOK.md`, "What the author dislikes".
