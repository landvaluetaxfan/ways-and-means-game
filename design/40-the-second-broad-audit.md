# 40 — THE SECOND BROAD AUDIT

**Status: RUN, 25 Sep 2026.** The author asked to "keep doing broad analysis
of game design, worldbuilding, mechanics, realism, and the economic system for
a bit". This is the first audit of the game with a real economy in it: it was
taken after the dollar (`design/39`), the price rules moving into content, and
the ladder going on the docket (`design/38` §7). Like `design/37` it lists
what is wrong and leaves out what works.

The ranking follows `design/37`. **Fixed** means a clear defect or an item I
had planned and not built, with the check that now holds it. **Needs you**
means a decision, with a recommendation. **Noted** is realism and judgement
the author may want on file.

**Method.** Everything with a number was measured at commit 12b0fa9 plus this
pass, with Flash I's view (`T.view("flash_i")`) unless it says the world's.
The probes are:

- **Economic responses.** Change one thing at the opening, run 141 sittings
  with no events, and read `st.macro` at sittings 12, 32, 62, 102 and 141.
- **The economy's vote.** Hold inflation and the output gap fixed for forty
  sittings with no events, then read `Engine.forecast()`.
- **The value of each choice.** Sum each choice's immediate scalar moves
  (standing, loyalty, legitimacy, the thermal margin, consumables, solvency in
  thousands, friction inverted) and charge its order-paper slot.
- **Seed variety.** Play one strategy under six seeds and compare the event
  sequences.
- **Random play.** Sixty governments. Each takes a random choice at every
  event, carries supply first, and climbs the ladder when the docket names a
  rung (so the ladder is not what kills them).
- **A static read** of the textbook, the bible's §11.1, `content/cabinet.js`
  and Flash I's introduction.

The scripts are scratch and are not committed. §5 says which ones would be
worth keeping as tools.

---

## The short version

- **The opening is not a steady state.** The thermal price climbs from 100 to
  120 and substrate from 100 to 115 within twelve sittings, with no event
  behind either, and the budget goes from 0.7% of output in deficit to 2.3% in
  surplus. Every run opens with a price shock and a windfall.
- **Inflation reads price levels, not price changes.** A one-off rise in the
  thermal price becomes permanent inflation, and so does a dollar that has
  fallen and stays down. That is most of why the canon counts at 3.4%.
- **The Bank raises into supply shocks.** At friction 80, growth is −9% and
  the Bank still takes the rate from 4.5% to 7%, because its rule reads
  headline inflation.
- **Tax changes are enormous.** The four bases are the whole of revenue, 36%
  of output. Raising all four rates takes the balance to a 29% surplus and
  standing to 22. Abolishing them runs a 35% deficit and 12.7% inflation. A
  real budget moves receipts by one or two per cent of output.
- **The economy can decide an election, but in play it never does.** Held at
  8% inflation for forty sittings, it costs the government 17 seats. In play
  inflation ends at about 3% and the dollar at about 0.84, which costs a seat
  or two.
- **The first choice is usually the best one.** In 67 of 119 events, the
  first choice is strictly best by its immediate effects.
- **Every Flash I run is one of three.** Six seeds gave three event
  sequences, and all of them diverge at sitting 15.
- **Two in five uninformed governments fall in chapter two.** The government's
  side opens with a majority of one, 142 against 141. Any partner walking out
  brings a motion.
- **The crisis usually ends with no result.** 20 of 60 random governments
  reached the crisis. Three got a result, all of them the pyrrhic tier, and
  fourteen got none. The tiers' reserve bands were written for a reserve that
  rose every sitting, and it no longer does.
- **Legitimacy never reaches the vote.** It is one of two meters that sound
  alike, and only the other one decides the count.
- **Three pieces of prose contradict the canon:**
  - the textbook's 2079 money chapter describes the currency board that Flash
    abolished in 2073;
  - Flash's career has three incompatible versions;
  - the introduction's "She has four years" is wrong in a run that ends at
    this session's count.
- **Three things fixed:**
  - the Reserve Bank's meetings are on the calendar;
  - content can ask whether the Treasury has missed a payment;
  - a UX check that could only pass one way now tests what it says it tests.

---

## 1. Fixed, with the check that holds it

| # | Fault | Fix | Held by |
|---|---|---|---|
| F1 | The Reserve Bank's meeting dates were in the state (`st.macro.nextMeeting`) and nowhere the player could see them. The calendar was planned in design/39 stage 4 and never built, and a meeting is the one date in the economy the government can see coming and lean on the Governor before. | `deadlines()` lists every meeting to the end of the calendar year, a kind `bank` that carries its own DATE, since the Bank does not sit with the House, and counts `away` to the first sitting that will know the decision. The calendar tints the day gold and the key names it. On the docket it sits under the Economy tab. | `test.js`: *the Bank's meetings are on the calendar, dated as the Bank dates them*; *and a meeting held comes off it* |
| F2 | `st.macro.arrears` (what the Treasury could not pay past the bill authority) was printed by the account panel and the playtest, and content could not ask about it: `arrears` was not among the schema's economy readings, so lint refused it. | `economyReading` answers `arrears` (none is 0, not "no reading"), and `js/schema.js` lists it, so `economyAbove:{arrears:0}` asks "has the Treasury missed a payment?" | `test.js`: *and content can ask whether the Treasury has missed a payment* |
| F3 | `tools/uxtest.js` looked for the rise in the calendar grid by a class, `.m-rises`, that the cells stopped carrying when the kind became the day's tint. So the assertion passed only while the rise was among the next three things down, and the meeting dates ended that. | It counts the rise's pip (`s.p-rises`) in the grid, paging forward up to three months and back. | Proved by renaming the rise's kind in the engine: *FAIL the day the House rises carries a mark, 0 pips* |

`npm run check` passes (all thirteen), `npm run guards` passes, and
`npm run layout` is healthy at all seven shapes with the calendar key's sixth
item. The canon and the playtest are unchanged: F1 and F2 add readings and
marks, and nothing reads them to choose.

---

## 2. Needs you

### E1. The opening is not a steady state

Flash I at sitting 1, with no events, then the same run as it advances:

| | balance | receipts | thermal | substrate |
|---|---|---|---|---|
| sitting 1 | −0.7% | 220,000 | 100 | 100 |
| sitting 4 | +0.7% | 228,601 | 111 | 106 |
| sitting 7 | +1.6% | 233,794 | 116 | 110 |
| sitting 13 | +2.3% | 238,495 | 120 | 115 |

The opening prices are 100, but `setup.priceRules` targets about 120 for
thermal and 115 for substrate at the opening meters, so both climb on their
own. The levy is charged on value, so receipts rise 8% and a deficit becomes
a surplus. The chart's annual record ends at the opening value, and the live
curve jumps as soon as it starts.

**Options:**

- **(a) Rebase the rules** so that the opening meters give the opening prices,
  which makes the world's opening a steady state. A campaign that wants to open
  in disequilibrium says so with its own `opening` effects.
- **(b) Open the prices at their targets.** The record's last year then
  carries the jump as 2079's history.
- **(c) Keep it**, as "the squeeze is already under way", and say so: the
  briefing or the docket names the drift.

**Recommend (a).** A world that drifts before anybody touches it makes every
measurement start from a transient. This moves the canon (its reserve and its
inflation), and the guard prints both.

### E2. Inflation reads price levels, not changes

In `runEconomy`, the supply term is `weight × (price / 100 − 1)` and the
imports term is `opening dollar / dollar − 1`. Both are LEVELS measured
against the opening. So a thermal price that rises to 120 and stays there adds
inflation at every tick for as long as it stays there, and so does a dollar
that falls to 0.79 and stays down.

In every textbook Phillips curve, a relative price shock moves the price
LEVEL once and inflation for about a year. The first-round effect passes, and
only what reaches wages and expectations lasts. This is also most of E1's
consequence: the opening drift is a permanent addition to inflation, not a
blip.

**Fix, mine to build:** feed the supply and import terms from the CHANGE, as
a pass-through that absorbs a move over about a year (the same `approach()`
the model already uses). **Recommend yes, together with E3.** It moves the
canon's inflation, which is 3.4% at the count now.

### E3. The Bank raises into supply shocks

| friction 80 | sitting 12 | 32 | 62 | 102 | 141 |
|---|---|---|---|---|---|
| growth | −1.0 | −9.2 | −13.4 | −13.1 | −10.5 |
| inflation | 3.2 | 4.5 | 5.3 | 5.5 | 5.5 |
| cash rate | 4.5 | 5.5 | 6.0 | 7.0 | 6.75 |

The printed rule reads headline inflation, so a blockade that is shrinking
the economy gets a tightening on top. Real inflation-targeting banks "look
through" the first round of a supply shock. Where they say so, it is as a
core measure.

**Fix, mine to build:** the rule reads inflation without the supply and
import terms (core). The Concordance's paragraph on the rule says so, and the
Bank panel prints both. **Recommend yes, with E2.** A player leaning on the
Governor during the crisis is then leaning against a Bank that is looking
through the shock, which is the better scene.

### E4. Growth is jumpy

`growth` is the instantaneous change over one tick, a day or two, then
annualised and smoothed. Abolishing the four levies shows 41% growth.
Statistics offices report a quarter's growth annualised, or the year's.

**Fix, mine to build:** read growth as the change in output over the last
ninety-one days, from a short history. It changes a printed number and the
`growth` reading, and nothing in content gates on growth. **Recommend yes.**

### E5. Tax changes are enormous

Rates are `none 0 · low 0.5 · standard 1 · high 1.6`, applied to four bases
that are the whole of revenue: 220,000 on output of 612,000, 36%.

| from the opening | balance at 32 | gap at 141 | inflation at 141 | standing at 141 |
|---|---|---|---|---|
| all four raised | +25.5% | −18.1 | −2.8 | 22 |
| all four abolished | −31.3% | +30.4 | 12.7 | 29 |

Even one base moved one step is several per cent of output. A real budget
moves receipts by 0.5–2% of GDP. That realism is the author's stated aim
("supposed to feel real"), and the Ways and Means choices as written are each
a revolution.

**Options:**

- **(a) Finer steps**, such as −25%, −10%, standing, +10% and +25%. This
  rewrites four bills' choices and labels in `content/bills.js`.
- **(b) Keep four steps, closer together**: 0.8, 0.9, 1, 1.15. `setup.fiscal`
  only; the labels "Not levied" and "Charged half again" stop being true.
- **(c) Keep it.** The levers are the game's blunt instruments, and the
  consequence teaches that.

**Recommend (a).** It is content, and the prose is yours.

### E6. The economy can decide an election, and in play it doesn't

The channel works. Here are forty sittings with no events and the economy
held:

| held for forty sittings | standing | government's side |
|---|---|---|
| steady (2%, gap 0) | 46 | 137 |
| inflation 5% | 40 | 128 |
| inflation 8% | 33 | 120 |
| a slump, gap −4 | 39 | 127 |
| stagflation, 8% and −4 | 28 | 115 |

In play the economy stays inside the vote's band:

- the sixty random governments end at a mean inflation of 3.0%, the dollar at
  0.84 and debt at 0.8% of output;
- the canon ends at 3.4%, 0.79 and 9.8%, which costs a seat or two.

The shocks that would move the economy (friction, the thermal margin, the
civic clock) are reachable only through the crisis. Nothing in the world's
content is an economic event in its own right.

**Proposal, content:** a handful of world events that are economic shocks and
are dated rather than crisis-gated. Examples:

- an Earth recession (`economy:{shock:-3}`, plus trade);
- a harvest failure on a far station (`economy:{shock:...}` with a price);
- a run on the dollar when the debt passes a line (`economyAbove:{debt:...}`).

With E2 and E3 built, these read right. **Yours.**

### E7. The first choice is usually the best one

Scored by immediate effects only, the strictly best choice is:

| choices | events | first | last | middle | tie |
|---|---|---|---|---|---|
| 2 | 78 | 46 | 31 | — | 1 |
| 3 | 31 | 16 | 7 | 5 | 3 |
| 4 | 7 | 4 | 2 | 1 | 0 |
| 5 | 3 | 1 | 0 | 1 | 1 |
| **all** | **119** | **67** | **40** | **7** | **5** |

**The caveat is real.** Flags, queued consequences and later gates are not
scored. Many first choices are "take it now, pay later", and the payment is
invisible to this measure. Even so, a player who learns "the top one is
safe" is right more often than not.

**Options:**

- **(a) An authoring pass** over the 67 during the rewrite.
- **(b) Shuffle the displayed order** per government seed. This is
  deterministic, but a player who reloads sees the same order. The
  playtest's positional strategies would read the logical order, not the
  displayed one.
- **(c) Leave it.**

**Recommend (a)**, with the measure kept as a tool (§5) so the rewrite can
watch its own number.

### E8. Every Flash I run is one of three

Six seeds of one strategy gave three distinct Flash I event sequences, and
all of them diverge first at sitting 15. The world's view gave four.
Chapter one is dated (`at:`) and chained, and the seeded lean only chooses
among the eligible events once the chain loosens.

**Whether a story campaign should be this fixed is yours.** It is the shape
of a novel, and it makes the canon testable. If you want more variety, the
tool is variant beats with the same `at:` and different gates, not more
randomness (§1.5 forbids randomness in selection).

### E9. Two in five uninformed governments fall in chapter two

Sixty random governments:

| outcome | runs | when |
|---|---|---|
| reach the count | 28 (47%) | median side 131; 11 of 28 returned |
| lose a confidence motion | 24 (40%) | sittings 13–26 |
| lose the leadership ballot | 5 | all at sitting 17 |
| cascade | 3 | 41, 54, 56 |

The government's side opens at 142 against 141. Any partner that walks out
(`thresholds.partnerLeaves` 15) takes the majority, and a motion follows
`motionAfter` 3 sittings later. The mechanism from design/38 §3 works as
built. The question is whether 40% of play that chooses without reading
should fall before the crisis. A player who reads will do better, but
nothing tells them a partner is near the door.

**Options:**

- **(a) Warn on the docket** when a partner is within a few points of
  `partnerLeaves`. The engine reads `st.coalition` and names no party, the
  same shape as the vacancy line.
- **(b) Lower `partnerLeaves`.**
- **(c) Leave both.**

**Recommend (a).** It is legibility, like the ladder, and I can build it on
your word. (b) is a difficulty choice and yours.

### E10. The crisis usually ends with no result

Of the sixty, twenty reached the crisis:

| path | runs | reserve | legitimacy | friction | result |
|---|---|---|---|---|---|
| annexed | 4 | 0–9,600 | 58–96 | 64–73 | pyrrhic ×3, none ×1 |
| referendum carried | 4 | 17,600–37,100 | 15–38 | 29–32 | none |
| surveyed only | 12 | 15,400–46,400 | 14–49 | 18–33 | none |

Against the tiers in `content/campaigns/flash_i/settlements.js`:

- **Triumph** needs a reserve over 70,000, and **maritime** one over 60,000.
  After the Act, no random run held more than 9,600.
- **The joint mandate** needs 40,000 and legitimacy of at least 40. Every
  referendum run was under both.
- **Capitulation** needs friction over 75. The surveyed runs sat at 18–33.

The bands were written when the reserve rose every sitting a government
governed. Under the calendar account it runs a deficit, and a crisis
financed in bills sits near zero. So the two good endings are out of reach
by play, and the most common outcome of the campaign's central question is
no answer.

**Options:**

- **(a) Re-band** against the account as it runs now. The reserve could be
  counted in months of spending, or the debt share could replace the reserve
  in the tiers (`economyBelow:{debt:...}`).
- **(b) Add a fallback tier**, "the question left open", so every run that
  reaches the dilemma gets an ending, with its own epilogue line.
- **(c) Both.**

**Recommend (c).** It is Flash I's content, and the guards will need the
canon's tier re-checked.

### E11. Legitimacy never reaches the vote

Choices that move each meter:

| moves | choices (of 317) |
|---|---|
| standing | 151 |
| legitimacy | 64 |
| both | 18, of which 11 in the same direction |

Where each is read:

- **Standing** decides the count.
- **Legitimacy** ("the government being believed, at home") is read by the
  crisis tiers, one coupling's drag and the idleness drag, and by nothing the
  election sees.

A player is shown two meters that sound alike, and only one of them decides
the election.

**Options:**

- **(a)** Legitimacy weights the count a little: a government that is not
  believed campaigns at a discount.
- **(b)** Keep them apart and say so. The tip and the Concordance call
  legitimacy the crisis's meter, and its label says what it buys.
- **(c)** Leave it for the rewrite, since legitimacy is Flash I's own meter
  (`setup` notes it as such).

**Yours.** (b) costs only prose.

### E12. The textbook describes the money Flash abolished

`textbook.md`, chapter nine, *The unit of account* (fourth edition, 2079):
"We denominate in thermal rejection capacity … A unit of currency here is a
claim on radiator area."

Bible §7.5.3 (LOCKED) has the dollar issued by a currency board against quota
from 2064, and floated by Flash in 2073. In 2079 a dollar is a claim on
nothing in particular. The textbook wins on tone and the bible on facts, so
the passage needs a revision in Charnock's voice. A draft for you to take or
rewrite:

> ### The unit of account
>
> We denominated, until 2073, in thermal rejection capacity.
>
> Students find this arbitrary until they attempt an alternative. Hours will
> not serve, because clock rates differ twentyfold and a subjective hour is
> not a constant. Mass will not serve, because mass is nearly free. Energy
> will not serve, because energy is abundant. The founders' currency board
> issued a dollar only against a millionth of an MW-year of quota lodged with
> it, and so a unit of our currency was a claim on radiator area, which is a
> claim on the room for something to happen, which is — if one follows it all
> the way down — a claim on the room for someone to be alive.
>
> The Reserve Bank floated the dollar in 2073, and it is now a claim on
> nothing, like every other money worth having. We still keep the accounts in
> millions of dollars that were once MW-years, and the habit tells the truth:
> every price here is, underneath, a price of heat.
>
> I do not think our founders intended the metaphor. I think it is
> nonetheless the truest thing about our money, and I think it is truer now
> that it is only a metaphor.

### E13. Flash's career has three versions

| source | says | implies |
|---|---|---|
| `campaign.js` intro comment; bible §11.1; design/39 | Governor from 2071, "nine years as Governor before the premiership" | Governor until 2080 |
| `content/cabinet.js` | the Treasury is vacant because "the post the Prime Minister herself held until last week"; Skye was "your deputy at the Treasury for four years" | Treasurer 2076–2080 |
| the introduction | "She had never held elected office before her ascension to the premiership"; "She took First Spin at the election that made her Prime Minister" | a new member |
| the introduction | "She has four years. The session that opens on the eleventh of April is the fourth" | four years ahead of her |
| bible §11.1; design/32 | "Session 4, Week 112", and the run ends at this session's count | one session ahead of her |

These three versions cannot all be true: Governor until 2080, Treasurer until
last week, and never in elected office.

**One consistent version:**

- Governor from 2071 to 2076. She was the first, and the Bank is nine years
  old, so five years is still its record, and the 2073 float falls inside it.
- Treasurer from outside the House from 2076 to 2080. This needs the Charter
  to allow a minister without a seat for a time, which is a canon addition.
- Leader of the PSD in March 2080, returned for First Spin at a by-election,
  and Prime Minister "last week".
- The introduction's last line becomes something like "She has one session.
  The one that opens on the eleventh of April is the parliament's fourth and
  its last, and the House is already sitting."

**The other way round:** she was never Treasurer. The Treasury is vacant
because the last Treasurer went with the last leader, and Skye's note loses
"four years". Both are yours, since the introduction is your prose and the
seatless minister would be new canon.

### E14. The last page says who governs and not what they inherit

The epilogue after the count names the government. Nothing summarises the
country the player leaves:

- the debt and whom it is owed to;
- the dollar;
- inflation;
- the reserve;
- the thermal margin;
- the suspended.

For a campaign whose canon ending is "austerity to come", those are the
ending.

**Proposal, mine to build:** a "state of the country" table on the last page,
read from `Engine.macro`/`budget`/`debtHome`, beside the seats. **Recommend
yes.**

---

## 3. Noted

- **The reserve direction is close to the Bank of England Act 1998, s.19.**
  That section gives the Treasury a reserve power to direct the Bank on
  interest rates, by an order the House approves within 28 days and which
  lapses after three months unless renewed. Ours is an affirmative order that
  stands until revoked. A three-month term (a `lapses` on the instrument,
  renewed by laying it again) would be both more real and a better clock. The
  author's call, and a small one.
- **The Ways and Means advance** (`loan.reserve_bank`) is the Bank of
  England's overdraft for the government under another name. It was frozen at
  £370m after 2008, and briefly widened in April 2020. Requiring an order is
  right.
- **Weekly Treasury bill tenders** are how the UK's Debt Management Office
  finances the day. `coverShortfall`'s automatic tender is the same idea, and
  the authority (the cap) matches a debt ceiling set in statute.
- **The rule is Taylor (1993)** with a neutral real rate of 1% instead of 2%.
  That is defensible for a young economy with a high saving rate, and it is
  printed.
- **Transmission is compressed, deliberately.** A rate change reaches output
  within a quarter. Real lags are twelve to eighteen months for output and
  longer for inflation, and at those lags monetary policy would do nothing
  inside a 130-day run. Keep the compression, and say so in §7.5.4 if a
  reader asks.
- **The crisis spends by effect, and nothing votes it.** Emergency spending
  moves `solvency` directly. In Westminster, money spent beyond the vote needs
  a Supplementary Estimate or a Contingencies Fund advance. A supplementary
  appropriation bill (a world bill, one slot, divides like supply) would make
  the crisis's cost a vote the House can refuse. This is for the content
  round, if you want it.
- **The meeting dates run past the count.** The Bank meets on 9 September
  and after, when the run is over. That is harmless, and true: the Bank does
  not stop for an election.

---

## 4. What I would do next, if you say go

In order, each measured before and after against the canon and the playtest:

1. **E2 + E3 + E4**: the Phillips curve on changes, core inflation in the
   rule, and growth over a quarter. This is my model's error, and one change.
2. **E1 (a)**: a steady-state opening. It moves the canon, so the guard
   prints the new count.
3. **E9 (a)**: the docket warns when a partner nears the door.
4. **E14**: the state of the country on the last page.

E5, E6, E7, E8, E10, E11, E12 and E13 are content or canon, and yours.

---

## 5. How it was measured, and what is worth keeping

Six probes, each a short script against `tools/testkit.js`:

- the economic responses (E1–E5): ten scenarios, 141 sittings each;
- the economy's vote (E6);
- the choice values (E7);
- the seeds (E8);
- the random governments (E9, E10), and a single-seed trace of one;
- the meters' overlap (E11).

**Two are worth promoting to tools**, as neither belongs in `npm run check`:

- **the choice-value measure**, as `npm run bias`, so a rewrite can watch
  the first-choice count fall;
- **the random governments**, as a `--random` mode of `tools/playtest.js`.
  The seven strategies are all somebody's plan, and a random player is the
  nearest thing to a first-time one.

---

## Acceptance

Built in this pass, and asserted:

- `test.js`: *the Bank's meetings are on the calendar, dated as the Bank dates
  them*; *and a meeting held comes off it*; *and content can ask whether the
  Treasury has missed a payment*.
- `tools/uxtest.js`: *the day the House rises carries a mark*, now counted in
  the grid. It fails when the rise is taken off the calendar.

Proposed, and what each would need before it is called done:

- **E2/E3**: a `test.js` probe showing that a one-off price rise lifts
  inflation and then lets it fall back within a year, and that the Bank holds
  or cuts under a pure supply shock.
- **E1**: `test.js` holds every price at its opening value over twelve
  quiet sittings of the world's view.
- **E9 (a)**: a partner one point above `partnerLeaves` puts a line on the
  docket, and one well above it does not.
- **E10 (b)**: Flash I's guards assert that every random government that
  reaches the dilemma gets a crisis result.
- **E14**: `npm run ui` finds the state-of-the-country table on the last page
  with the debt and the dollar in it.
