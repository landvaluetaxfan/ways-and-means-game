# 79 — The UI refinements

**Decided by the author, 6 October 2026**, after Claude walked every tab of the live build at
1366 x 768 and 1920 x 1000 (sitting 8, in Act II): "Good, mark these all down as designs we want
to implement." Every idea below is a design to build. The work list is `briefs/ui-tabs.md`, which
this record feeds; where the two differ, the brief is the plan and this is the reason.

This replaces the five-tab audit of 5 October (`briefs/ui-tabs.md` as it stood). It keeps that
audit's rules: the Underwriters panel stays, the Economy Money calls are not touched, a number says
what it is, and wording a player reads is Claude's.

## What the walk found

**Across the interface**
- A notice popover under the Government tab stays on screen across tabs and covers the history
  column's header and the Government utility strip.
- The top bar says "SESS 4.1" and clips the party string to "Flash I...". Three small squares at
  the top right have no label.
- Type sizes and faces are mixed within single rows, and many lists end in a small mono tail.
- Every minister except the Prime Minister has a grey silhouette for a portrait, including the five
  who speak on the clause pages.

**Sitting.** The history column labels every record "Decision.", pages and appointments and slot
grants included. A "CHAPTER 2" divider falls in the middle of a sitting's entries. At 1366 the
Indicators panel is cut by the status bar.

**Government.** The Work File is a blank pane two thirds of the width. The cabinet rail is tall
silhouette rows, so about ten of fourteen fit. "All government business" reads as a text field.
Business rows have no shared grammar.

**Chamber.** It lists eleven bills while the opening concerns two. DUAL, SIMPLE, POP., FUNC. and
the twelve party codes are unexplained, and "who is for it, and why" is clipped at the right edge.
The Anchor Concession sits at stage "assent" with a Grant button, and what that does needs
checking.

**Party.** At 1920 the content ends at about 55% of the height and the left column is empty below
the Benches table. "Standing by band" prints the same figure five times, and the SIG column is
dashes.

**Relations.** At 1366 "Who they vote with" and the shadow cabinet are cut off, and "CR" is
undefined.

**Economy.** At 1366 the reserve chart and the Reserve Bank panel are below the fold; at 1920 a
band of about 300 px is blank. Earth's banks and the Underwriters appear in the Account, in Money
calls and in the Underwriters text. "none" and "CW$0m" are set in large figure type.

**Orbit and Concordance** are sound. **Foreign Affairs** has two tall panels with one sentence
each, three unlabelled anchors, and nothing that shows Earth's pressure.

## The designs

1. **Foreign Affairs is the friction desk.** The globe shrinks, its anchors are labelled and it has
   a key. The panels become: Earth's pressure in words (money and the UN, the two forms the author
   kept in `design/78`); a card for each bloc (the Union, the African Union, Kenya, Gabon) with
   what it wants and where it stands; the General Assembly's agenda and count; and, once the Works
   exists, a Works file showing the ladder rung, the rescue date and the next ask. It waits for
   Acts II to V (`design/78`); the globe, the key and the labels can go first.
2. **A focus mode for the Chamber.** This period's measures first; the rest collapse under "Other
   measures (n)". Every abbreviation gets a hover or a column note, and the clipped table gets its
   width. It pairs with the tutorial's dimming (`design/77`) and waits on `witnessed-acts`, which
   holds the Chamber's drawing.
3. **Government selects something on arrival.** The Treasury vacancy first, then the first
   business. The rail is compact rows with the business count, "All government business" is the
   rail's first row, and business rows share one grammar: title, then kind, cost and reference.
4. **Economy, ordered by use.** The account, the prices, the Bank and the dollar, then the chart,
   with panels filling both columns. Earth's banks and the Underwriters appear once in the Account,
   as quiet text when undrawn. The Underwriters panel and Money calls stay as they are.
5. **Party fills its height.** "The Country" moves under the Benches table, the national figure is
   shown once and a band only when it differs, SIG hides until a paper circulates, and the detail
   text uses the panel's width.
6. **A truer history column.** News, Decision and Wire are three labels, so a page reads as news
   and an appointment as a record. The act break reads "Act II". The notice popover dismisses on a
   click or a tab change and never covers the tabs.
7. **A clean top bar.** The date and the act replace "SESS 4.1" (the rename brief already drops
   the session number). The party string is truncated with a tooltip, and the three squares are
   labelled or removed.
8. **Placeholder portraits.** Initials badges in the party's colour until real art exists, or the
   existing dither pipeline for a consistent set. Art is the author's.
9. **Relations, and one type scale.** Relations gets its natural height, "CR" becomes "Ledger" and
   values share one face. The five tab passes share five type-scale tokens.

## Order

1. **Pass 0:** the popover, the history labels and the top bar (designs 6 and 7). Small, visible on
   every screen, and no design decisions are open.
2. **Pass 1, Government** (3 and the shared type scale). The tutorial mechanism waits on it.
3. **Economy** (4), **Party** (5), **Relations** (9).
4. **Placeholder portraits** (8), whenever a pass is free.
5. **Chamber focus** (2) after `witnessed-acts` lands, and **Foreign Affairs** (1) after the Acts II
   to V map.

## Constraints

No engine rule changes, so no playtest; `npm run check` and `npm run layout` pass, with before and
after screenshots at both sizes. Orbit and Concordance are not touched. Any new wording is Claude's,
read against `PROSE.md`.

## Built

**6 October, the labels and the key (design 1, first slice).** The author said to start on Foreign
Affairs, so the part that needs nothing else went first: every tether is named on the globe and the
map, and a key under the drawing says what the gold, the plain and the orange marks are. Labels are
placed greedily in order of importance (the selection, the Commonwealth's four, the Almanac Works,
then the rest), so a crowded stretch of East Africa names the Commonwealth's anchors and leaves a
foreign one unnamed until a turn, a zoom or a click gives it room. **The globe's shrink did not go
with it.** Shrinking before there are panels to fill the space only opens a blank band, which is
what the audit objected to, so it lands with the first desk panel.

**6 October, pass 0 (designs 6 and 7).** Built, and the walk's findings were corrected as it was.
- **The notice card.** The audit said it "stays across tabs". It does not: it is `pointer-events:none`
  and fades in about two seconds, and the screenshot script had switched tabs inside that window. What
  was real is that it sits over the first lines of the panel the player has just opened. A click on a
  tab now takes it down, with the cards queued behind it (`Motion.dismiss`). Code that opens a tab
  straight after a decision does not, or no card would ever show; a test holds that.
- **The history column.** Four labels from what the engine wrote: News (a page), Decision (a choice
  taken), Record (the engine's own lines: an appointment, a division, an assent) and Wire. The
  brief said "three" and listed four. The "Chapter 2" mark reads "Act II begins: Ways and Means".
  **It stays mid-sitting.** The list is newest first, so the mark stands below the entries of the new act
  and above those of the old, which is where the chapter turned. Moved between sittings it would
  mislabel the entries of that sitting.
- **The Indicators panel.** Not a fault. The column scrolls with the game's drawn bar (781 px of
  content in 655 at 1366) and fits exactly at 1920. Dropped.
- **The top bar.** "SESS 4.1" is the act ("ACT II"), where the play has acts. The slot name, clipped
  with an ellipsis at 220 px, carries its whole text on hover.
- **The three squares** are deliberate window chrome and do nothing; the stylesheet calls them the
  dummy window boxes. Left as they are. The author may want them gone, which is one line.

