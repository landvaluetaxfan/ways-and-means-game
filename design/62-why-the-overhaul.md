# 62 — Why the overhaul: the objectives, for whoever builds it

**29 September 2026.** Written by Claude, at the author's request, so that
Codex, or whoever builds `briefs/tabs-overhaul.md` and `briefs/the-brief.md`,
understands what the changes are for and why each design decision was made.
The decisions themselves are in `design/58` (the game) and `design/61` (the
tabs). This record is their reasons. When a brief does not cover a case,
decide it by the reasons here.

## The problem this solves

The author, 29 Sep: "we still sort of fall into the trap of giving the
player a bunch to do, but they don't know when to do it on their own …
to them, they're just buttons that do things." And then: "this stems from
a structural and foundational issue of us not doing enough game design
before building a significant amount of systems."

The game had rich systems: the House, the economy, the stations, foreign
affairs, the party. It gave the player no reason to use any of them until
an event forced a decision. A player could not tell that a lever mattered
before the moment it was too late. `design/57` examined the problem.
`design/58` then designed the game on one page, through rounds of
questions to the author. Every change in the two briefs follows from that
page.

## What the game is

- **The fantasy:** "You are the Prime Minister. You came to do something,
  and every step toward it costs you some of the power to stay." So the
  interface must show two things at once: **the aim** (for Flash I, saving
  the Almanac Works) and **the cost** (the House, the party, the money, the
  heat).
- **There is no winning, only endings.** An ending is judged on what you
  achieved and how you are remembered, and the grade is revealed only at
  the end. So the interface must never score the player during play. It
  shows the situation and leaves the verdict to the curtain.
- **The core is carrying the House.** Every campaign is a Prime Minister
  governing through a Parliament. Time on the order paper is scarce, and
  votes have a price: the party's loyalty, a partner's promise, a
  concession, and rarely a post. Everything else (money, the stations,
  foreign affairs) is a **theatre** that a campaign turns up or down. Flash
  I's major theatres are foreign affairs, money and the heat.
- **Difficulty:** most first-time players should reach the count. A good
  ending takes skill or a second play. The proxy is that a strategy that
  does what the brief says reaches the count in most seeds. Today the
  strategies that obey the docket lose 21 to 33 runs of 80, which is harder
  than the target.

## Why the brief (`the-brief.md`)

- **Advisers early, the story late, and early is cheaper.** A matter is
  raised by a named minister while there is time, and acting then is
  cheapest. Ignored, it comes back as the sitting's decision, with worse
  options. Ignored again, it happens as a page. The player is not told the
  rule. They learn it the first time the late version bites. That price
  gradient is what teaches "when to act".
- **Advice never tapers.** The author: in real life the cabinet does not
  advise the Prime Minister less as the Parliament goes on. So the skill
  is not noticing that advice exists. It is **choosing which advice to
  take**. Three things make that a choice:
  - there is more advice than capacity: four matters at most, one new a
    sitting, and time and money for one or two;
  - advisers have interests: the Treasury wants the account balanced, and
    the grid's minister wants the heat kept;
  - the cabinet you keep is the advice you get: a vacant post raises
    nothing.
- **Levers are open, matter first.** A matter shows the levers that answer
  it, so the player meets a lever where it is needed. The tabs stay open
  for a player acting on their own reading. Pure gating would shepherd the
  player, and pure openness is the "buttons that do things" the author
  complained of.
- **Rise counts only what is owed.** The brief is advice. If Rise counted
  advice, the player would feel ordered about, and the obligations that
  really bind (supply, a vacancy, a promise) would be lost among it.
- **A set-aside matter runs on.** Setting a matter aside is a real choice
  with a cost, not a way to dismiss it.
- **The thin slice first** (heat, reserve, the Works' air): these three
  already kill runs, so they prove that the brief saves the players it
  should. The "follows the brief" playtest strategy is the measurement.
  Report it; do not tune toward it.

## Why each tab changes (`tabs-overhaul.md`)

- **The tab order groups Chamber, Party and Relations.** They are the three
  places a vote is priced: order-paper time, your own party's loyalty, a
  partner's terms. Putting them side by side says that they are one
  subject.
- **The Record folds into the Sitting.** The player looks back where they
  act. The Concordance keeps the world's history, which is a different
  thing: what the public knows, not what the government decided.
- **Chamber keeps its look and loses its repeats.** The author likes how
  it looks. It is crowded because it says the same thing twice: the bills
  in two lists, the parties in two tables. Merge them; do not redesign it.
- **Government by department.** This is where the advice lives. A card for
  each post makes three of design/58's rules visible:
  - the cabinet you keep is the advice you get;
  - a vacant post leaves its matters unraised;
  - a minister's forecasts can be wrong, and their record shows it.

  The old tab listed about twenty instruments and nine levers the player
  could not use. That told them nothing about when they could.
- **A lever that is not open is not listed.** A greyed row says "not
  yet" without saying when or why. It adds noise and teaches nothing. The
  brief says when a lever opens.
- **Party mirrors Relations.** A current in your own party and a partner
  in the coalition are the two sides of the same price, the whip's and the
  bargain's, so they should read alike. "The country" gives the player
  somewhere to watch the count coming, since the count is now the finale.
- **Relations gains the Opposition,** because the Leader of the Opposition
  is now a rival who acts: he moves against the government and he is who
  you face at the count.
- **Orbit keeps its look and gains the stations' state.** The author likes
  Orbit. The heat is one of Flash I's major theatres and showed only as
  "closure", so the station panel now says it in words.
- **The status bar keeps four essentials, in words:** confidence, the
  heat, the time to the rise, and the paper against the leadership. These
  decide survival. The rest is on the tabs.
- **Readouts in words, figures on hover.** The player should read the
  country as a minister would describe it ("the margin is thin") and reach
  the figure when they want it. Numbers first made the game a spreadsheet.
- **Badges:** a red number means "you must" (something is owed), and a quiet
  dot means "there is advice here". Keep them distinct, or the red stops
  meaning anything.
- **Economy: the Treasurer runs the routine, and the player makes the big
  calls:** a tax, a loan, a sale, the budget line. Money is a theatre of
  consequential choices, not bookkeeping. So the Draw buttons become calls
  that matters raise.

## The larger shape: not to build now, but to leave room for

These are decided in design/58 and come later. Build nothing that closes
them off.
- **A campaign is one Parliament, with one election, at its end.** Flash I
  opens on 11 April 2080 on a fresh coalition deal and runs to the 2084
  count.
- **Five acts.** Each act is a sitting period of consecutive days, and time
  is skipped between acts. So an act must be able to start in any month
  and year, and deadlines counted in sittings work inside an act.
- **Stories move by fixed anchors, reactions and one fork an act.** Beats
  happen because of conditions the player created, not dates.
- **At the run-in, the Sitting becomes the election screen:** a seat map,
  polls, preselection, then the count seat by seat. A hung House is then
  bargained.
- **Summits** are foreign set pieces, and **forecasts and reputations**
  come to the ministers' cards.
- **The grid of endings:** twelve for a campaign, read at the curtain.

## The tests for a judgement call

`design/58` ends with this rule: every system serves the core, serves a
theatre some campaign makes major, or is world (prose and the
Concordance). Otherwise it is cut.

When something is unclear, ask:
1. Does it help the player know **when** to act, and **what it costs**?
2. Does it keep "owed" and "advised" apart?
3. Does it keep the look the author likes?
4. Does the engine still name nothing concrete, with the content carrying
   the specifics?

If the answer needs new canon or player-facing prose, write it plainly and
leave the register to Claude.
