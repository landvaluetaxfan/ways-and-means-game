**Lane: Codex builds, Claude Code reviews.** Written 5 October 2026 after Claude audited the five
tabs the author called rough, and rewritten on 6 October after Claude walked all nine tabs of the
live build at 1366 x 768 and 1920 x 1000. The author's instruction: "mark these all down as designs
we want to implement." The reasons are in `design/79-the-ui-refinements.md`; this file is the plan.

# The interface passes

**STATUS: not started.** One pass at a time, in the order below. The passes share `index.html`,
`js/ui.js` and `css/terminal.css`, so two never run together. A pass is claimed as `ui-tabs` and
released when it lands. When a pass lands, delete its section here in the same commit; the last
pass deletes the file.

| pass | what | waits on |
|---|---|---|
| **0** | the popover, the history labels, the top bar | nothing |
| **1** | Government, and the shared type scale | pass 0 |
| **2** | Economy | pass 1 (the tokens) |
| **3** | Party | pass 1 |
| **4** | Relations | pass 1 |
| **5** | Placeholder portraits | pass 1 |
| **later** | Chamber focus | `witnessed-acts` landing |
| **later** | Foreign Affairs, the friction desk | the Acts II to V map (`design/78`) |

Orbit and Concordance are satisfactory and are **not** to be touched. The Sandbox is the author's
bench and is out of scope. Sitting and Chamber are touched only where a pass below names them.

## How every pass runs

1. `git pull origin main`, claim `ui-tabs`, read `PLAYBOOK.md`'s "What the author dislikes".
2. **Before:** screenshot each tab the pass touches at 1366 x 768 and at 1920 x 1000 (boot the game,
   play the opening, click the tab; `NODE_PATH=$(npm root -g)`, Chromium at
   `/opt/pw-browsers/chromium`). Use Act II (sitting 8 or later) so the tabs hold real content.
   **After:** the same shots. Post all of them to the orchestrator as paths in a `review` message.
3. Touch only the pass's own functions, markup and rules. Add no literal pixel size or colour that
   the stylesheet has a token for. Read `PROSE.md` (the Interface section) before you write any
   string. Wording a player reads is Claude's: write plain strings, and name every one in the commit
   message for a pass.
4. `npm run check` and `npm run layout`. Where a test asserts markup you changed, update the
   assertion and break-test it. No engine change, so no playtest.
5. **Leave alone the surfaces the unlanded witnessed-acts work edits** (branch `integrate/witness`,
   `briefs/witnessed-acts.md`): the Economy **Money calls** panel and its Draw buttons, the
   initiative-post and instrument dialogs, and everything in Sitting and Chamber that pass 0 does
   not name.

## Shared rules, set in pass 1 and used by every pass after

- **A type scale.** List every `font-size` the tabs use today. Collapse them to at most five steps
  held as tokens on `:root` (label, body, small mono value, value, large figure). Today a single
  row mixes three sizes and three faces, and many lists end in a small mono tail.
- **One panel grammar.** A panel is sized to its content. A tab has no blank band of more than about
  60 px beneath its lowest panel while another column is taller, at either size.
- **An empty state is one line, or the panel is absent.** No tall panel holding one sentence.
- **A number says what it is.** No bare 44, no "100 idx", no column of dashes at the opening.

## Pass 0: the popover, the history labels, the top bar

- **The notice popover.** A notice under the Government tab ("An undertaking has been entered...")
  stays across tabs and covers the history column's header and the Government utility strip.
  It dismisses on a click anywhere, on a tab change and after a few seconds, and it is never placed
  over the tab bar.
- **The history column** (Sitting, left). It labels every record "Decision.", pages, appointments
  and slot grants included. Three labels instead: **News** for a page, **Decision** for a choice
  taken, **Wire** as now, and **Record** for the engine's own lines (a slot granted, an appointment,
  a bill's stage). The "CHAPTER 2" divider falls mid-sitting; it belongs between sittings and reads
  "Act II" (the act's name is in the play data).
- **The Indicators panel** (Sitting, right) is cut by the status bar at 1366. Make it scroll inside
  its panel or fit.
- **The top bar.** "SESS 4.1" goes; the date and the act replace it (the appropriation-rename brief
  drops the session number everywhere else). The party and campaign string is clipped ("Flash I...");
  truncate it with a tooltip. The three small squares at the top right carry no label: label them,
  or remove them if they do nothing.

## Pass 1: Government

- **The Work File is empty on arrival.** Select something on arrival (the Treasury vacancy if there
  is one, else the first business), and keep the empty line only for a cabinet with no business.
- **The Cabinet rail** is fourteen tall silhouette rows, and it scrolls before the eleventh minister
  at 1366. Use a compact row that shows the business count already in `gov-rail-work`, so all
  fourteen fit. Draw a portrait only where one exists (pass 5 supplies placeholders).
- **"All government business"** reads as a text field. Style it as the rail's first row, with the
  selected state the ministers use.
- **Business rows have no grammar.** One title line, then one meta line: kind, cost, reference
  ("Initiative", "Order · SI 2080/51 · affirmative"). Today an order shows a blue link, a
  larger-type kind line and a tiny tag. The cost pips are gold outlines; use the small bevelled
  blocks of the order-paper counter above them.
- **The Treasury's vacancy** is a card, a rail tag and (by design) initiatives on the PM card. Say it
  twice at most. The `lean_on_governor` and `defend_dollar` placement is a canon question for the
  author: do not move them.
- **The utility strip** (Register, Undertakings, The Tribunal, Presidency) floats above the columns.
  Make it one row of tabs that matches the main tabs; the pending count is a badge in the main
  tabs' style.

## Pass 2: Economy

- **Do not touch Money calls.** Everything else is in scope.
- **Order by use:** the account, the prices, the Bank and the dollar, then the chart, with panels
  filling both columns. At 1366 the reserve chart and the Reserve Bank panel are below the fold; at
  1920 there is a blank band of about 300 px under the last row.
- **Earth's banks and the Underwriters appear three times**: in the Account, in Money calls and in
  the Underwriters text. Keep them in Money calls and in the text. In the Account, an undrawn
  facility is one line of quiet text at the label size, not "none" or "CW$0m" in the large figure
  type.
- **"What the Underwriters say" stays as it is.** The author (5 Oct): it makes the numbers feel real
  by turning them into consequences, and it is the model to follow elsewhere. Do not cut its figures.
  Give it room and the body type; do not restyle its voice.
- **Wording to fix** (plain strings, for a Claude pass): "100 idx", "80 /100", "The public 0 /yr",
  and the "The cost of existing" paragraph ("Index, 100 at the opening of the series..."). Say what
  each measures, in a phrase, or cut it.
- **The chart's first bar** carries an "empty" tag. Explain it on hover or drop it.

## Pass 3: Party

- **The left column is empty below the Benches table** (about 540 px at 1366, 800 px at 1920). Move
  "The Country" under the table; the right column then holds the Leadership alone.
- **"Standing by band"** prints the same figure five times at the opening. Show the national figure
  once, and list a band only when it differs.
- **The SIG column** is a column of dashes with no paper circulating. Hide it until a paper is.
- **The detail panel's text** keeps a narrow measure inside a wide panel. Let it fill (columns where
  the panel is wide). The mono tails under the bills ("26 of 32 . 6 will not vote with the party")
  repeat per row: say it once in a column head.

## Pass 4: Relations

- **"Who they vote with"** and the shadow cabinet are clipped at 1366: the last rows are cut off
  with no scroll cue. Give them their natural height; set the shadow cabinet as a two-column list of
  name and portfolio.
- **"What they want"** carries a mono tail on every bill ("drafting . +2 a stage you grant it").
  Make it a column, "Ledger per stage you grant", with the stage as the row's sub-label.
- **"The terms"** mixes mono and sans values. Right-align every value in one face and size.
- **The table's `CR` and `IF THEY GO` columns**: `CR` is undefined. Head it "Ledger".

## Pass 5: Placeholder portraits

Every minister except the Prime Minister has a grey silhouette, including the five who speak on the
clause pages. Draw an initials badge in the party's colour wherever a character has no portrait, in
the cabinet rail, on a page's caption and in the Party tab's member rows. Real art is the author's and
replaces a badge when it exists. One function, one place; no new image files.

## Later: Chamber focus

Waits for `witnessed-acts`, which holds the Chamber's drawing. The Chamber lists eleven bills while
the opening concerns two. Show this period's measures first (the ones with a stage still to go before
the rise) and collapse the rest under "Other measures (n)". Give every abbreviation a hover or a
column note: DUAL, SIMPLE, POP., FUNC., and the twelve party codes. "Who is for it, and why" is
clipped at the right edge at 1366. Check what the Anchor Concession's Grant button does at stage
"assent" and report it. The tutorial's dimming (`design/77`) uses the same regions.

## Later: Foreign Affairs, the friction desk

Waits for the Acts II to V map (`design/78`). The globe shrinks, its anchors get labels and a key
(the rings and the dotted lines). The panels become: Earth's pressure in words (money and the UN);
a card for each bloc (the Union, the African Union, Kenya, Gabon) with what it wants and where it
stands; the General Assembly's agenda and count; and, once the Works exists, a Works file showing the
ladder rung, the rescue date and the next ask. The globe, the key and the labels can go first and
need nothing else. Not audited: the MAP and STILL modes. Check them in this pass.

## Done when

The orchestrator has looked at the screenshots and the checklist above, and every line is met or has
a stated reason. The author sees one screenshot of each landed pass. Anything the author corrects
goes into `exchange/PLAYBOOK.md`, "What the author dislikes".
