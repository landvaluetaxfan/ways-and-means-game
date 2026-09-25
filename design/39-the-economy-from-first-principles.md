# 39 — THE ECONOMY FROM FIRST PRINCIPLES

**Status: DECIDED AND BUILT, 25 Sep 2026: option C.** The proposal is kept
below as written; what the author decided and what was built are in
"Decided, and built" at the end. The author, answering design/37 D7:

> "let's approach it again from first principles, try to map out how our IRL
> modern-day economy reached the economy in the game, and try to compare
> against economists, futurologists, other academics, etc and if need be, i
> am willing to completely reconstruct the economy, or at least largely
> overhaul it. I am more partial towards an economy that more resembles the
> modern day, because I want to have economics and fiscal and monetary policy
> that feels real."

This note:

- traces a path from 2026 to 2080;
- checks the bible's economy against the people who have thought hardest
  about each piece of it;
- audits what the engine actually does;
- proposes three ways forward and recommends one.

Claims about the world are sourced. Claims about the design are labelled
judgement where they are.

## The short version

- **Most of the bible's economy is well founded, and it should stay.** These
  ideas have real intellectual lineages:
  - the four scarcities;
  - "goods free, rent astronomical, existence metered";
  - the Georgist case for taxing volume;
  - underwriting as the dominant financial institution;
  - closure as the measure of sovereignty.

  The thesis that energy is cheap and heat rejection binds is also the
  working engineering thesis of the orbital data-centre ventures launched
  in 2025.
- **The money does not hold, and that is why there is no monetary policy.**
  - A currency that *is* a physical quantity (§7.5.3, the MW-year) is a
    commodity standard: a gold standard denominated in heat. Under one, the
    money supply is set by physics, the central bank has nothing to do, and
    the economy inherits the rigidities that Eichengreen blames for spreading
    the Great Depression.
  - The bible says so without meaning to: "the Reserve Bank keeps the
    register and prints nothing". The protagonist ran that Bank for nine
    years.
  - The game cannot have the monetary policy the author wants while §7.5.3
    stands.
- **The fiscal model has three mechanical faults, whatever is decided about
  money:**
  - the appropriation is never charged;
  - interest runs about seventeen times too fast;
  - flows are counted per sitting while time is counted in days, so the
    new recesses pass without a tick.
- **Recommendation (judgement): option C.**
  - A floating Commonwealth currency, managed by an inflation-targeting
    Reserve Bank.
  - Heat rejection stays the physical ceiling of the economy, and becomes
    its potential output. The "thermal" price becomes the economy's
    energy-crisis price.
  - The state borrows at home in its own currency and abroad in Earth's.
  - Six readings on the Economy tab, the page a finance ministry reads
    every morning: growth, inflation, the policy rate, the exchange rate,
    the deficit, and debt against output.
  - As backstory, the Commonwealth could have opened on a thermal currency
    board that the Governor floated, which gives Flash's nine years at the
    Bank a record.

---

## 1. From 2026 to 2080

Bible §11.1 gives the dates. This section supplies the economics between
them, anchored where it can be to things that have already happened.

**2026 and the decade after: automation meets the energy wall.** Cognitive
automation is under way. Its limit is already physical: data centres are
constrained by power and by cooling. In 2025 two ventures took the next step:

- **Starcloud** flew an NVIDIA H100 in orbit in November 2025. The chip ran
  inference and shed its roughly 700 W of heat through radiator panels.
- **Google's Project Suncatcher** (announced November 2025) is building
  toward constellations of solar-powered TPU satellites. It is testing heat
  pipes and radiators in thermal vacuum, because in orbit energy is free and
  rejecting the heat is the hard part.

That is §7.1's "the constraint nobody uses and the best one available", as
an engineering programme fifty years before the campaign. The world does
not need to invent the idea that heat is money. It needs to follow a line
that is already drawn.

**The 2030s: the labour question.** The economics literature splits into
camps:

- **Automation creates new tasks** as fast as it destroys old ones: Autor,
  "Why Are There Still So Many Jobs?", 2015.
- **Displacement can outrun reinstatement**: Acemoglu and Restrepo, "The
  Race between Man and Machine", 2018, and "Robots and Jobs", 2020.
- **Wages can collapse** if automation reaches the last tasks faster than
  capital accumulates: Korinek and Suh, "Scenarios for the Transition to
  AGI", NBER 2024.

The Commonwealth's participation rate of 39% (§7.10) sits between the second
and third camps, and it is the right number for the world as drawn. The
policy experiments are also real by then:

- The largest US unconditional-cash trial (OpenResearch, $1,000 a month for
  three years, reported in 2024) found a 2-point fall in participation and
  about 1.3 fewer hours a week.
- That is small enough that a consumables floor is affordable. It is also
  large enough that somebody in the chamber will quote it against the floor
  every session.

**The 2040s: Earth settles personhood and automation** (§11.1). Emulation
arrives. Hanson's *The Age of Em* (2016) remains the one sustained economic
treatment of it. It predicts em wages falling toward the cost of the
hardware and energy that run them, which is subsistence priced in substrate
and heat. §6.10.3's "uploading as an economic decision" and substrate debt
are Hanson's economy with a welfare state wrapped around it.

**~2058 to 2064: orbital industry, then a state.** Manufacturing that follows
Wright's law (cost falling with cumulative output) becomes nearly free.
Goods that follow other laws do not:

- **Baumol's cost disease** (Baumol and Bowen, 1966) keeps care, teaching
  and craft dear.
- **Henry George** (*Progress and Poverty*, 1879) says the gains of progress
  flow to whoever owns position. Orbit adds two absolute ceilings: heat
  rejection and delta-v.

That is §7.5's rentier economy exactly. Peter Frase's *Four Futures* (2016)
has a name for abundance with scarcity maintained by rent: **rentism**. The
Commonwealth is rentism with a consumables floor bolted on, which is the
world's most accurate one-word description.

**2064 onward: a new state needs money.** A treaty organisation that becomes
a state in 2064 needs a currency on day one. Historically, new or small
states do one of four things:

- use another country's money (dollarisation: Ecuador, Panama);
- run a currency board pegged to something hard (Hong Kong since 1983;
  Argentina's convertibility, 1991–2001, which ended in crisis);
- issue a fiat currency and build a central bank;
- or peg and float later.

A state whose defining scarcity is heat, and whose founders distrusted
Earth, pegging its currency to rejection capacity is a very plausible
founding decision. What the record says happened next is the author's call
(§4, option B).

## 2. What the thinkers say, set against the bible

| Idea in the game | Lineage | Holds? |
|---|---|---|
| Volume tax, and the Single Tax Party | Henry George (1879); the **Henry George theorem** (Arnott and Stiglitz, 1979): in an efficient city, aggregate land rent equals spending on local public goods, so a tax on rent alone can fund them | **Yes, and better than the bible says.** In a habitat, pressurised volume *is* the land. The theorem makes volume taxation more than a party's hobby-horse: it is the one tax a habitat state could run on alone. §7.3 is right to lead with it. |
| Self-assessed volume leases | Posner and Weyl, *Radical Markets* (2018): Harberger, or "common ownership self-assessed", taxes. Owners declare a value, pay tax on it, and must sell at it. | **A good future mechanic.** It answers the slumlord partitioning a berth into six (§7.1) with a rule, not a raid. |
| Heat as the binding constraint | Thermodynamics. Landauer (1961): an irreversible bit operation costs at least kT ln 2. Georgescu-Roegen, *The Entropy Law and the Economic Process* (1971). The NASA Ames/Stanford study *Space Settlements* (SP-413, 1975) sizes habitat radiators. | **Yes.** It also has a hard implication the bible uses: minds run on computation, computation makes heat, so how many minds can exist is set by rejection capacity. |
| Money that *is* heat | Energy money: Technocracy Inc.'s energy certificates (1930s); Soddy, *Wealth, Virtual Wealth and Debt* (1926); Kim Stanley Robinson's carbon coin, *The Ministry for the Future* (2020) | **Half.** Soddy is the best support for the *debt* story: real wealth obeys thermodynamics, debt compounds, so debt outruns wealth. The carbon coin is the better model for the money: it is issued *by central banks* against a physical quantity and circulates beside ordinary money. It is not the unit of account. |
| No monetary policy | Commodity standards: Keynes on gold as a "barbarous relic" (1923); Eichengreen, *Golden Fetters* (1992): the gold standard transmitted and deepened the Depression; Friedman and Schwartz (1963) | **This is where the model breaks.** See §3. |
| A state that sheds people rather than default | Reinhart and Rogoff, *This Time Is Different* (2009): sovereigns default, restructure, inflate or impose austerity | **Keep the dark core and change the route.** Real states have four exits from unaffordable promises. Shedding people is the fourth, austerity, made literal. |
| Borrowing from Earth | "Original sin" (Eichengreen and Hausmann, 1999): small economies cannot borrow abroad in their own currency, so a depreciation raises the debt | **Yes, once there is a currency.** The Standby Facility would be in Earth's money. A falling currency makes the debt heavier, which is the modern shape of a debt trap (Argentina 2001, Greece 2010). Flash I's canon wants exactly this. |
| Stations with different closure in one union | Mundell, optimal currency areas (1961) | **Yes, and useful.** A high-closure station leaving the union is also leaving a currency union. Every secession argument then has a monetary chapter. |
| Time and interest across clock speeds | Krugman, "The Theory of Interstellar Trade" (written 1978, published 2010): interest on goods in transit must be computed in one frame's time | **The bible's own argument, sourced.** §7.5.3 needs an objective unit because clock rates differ twentyfold. A fiat currency with interest on the calendar meets the same need. The unit does not have to be heat for time to be objective. |
| A spending state limited by real resources | Modern Monetary Theory (Kelton, *The Deficit Myth*, 2020): a currency issuer's limit is inflation, meaning real resources, not money | **Literally true here.** The real resource is heat. A government that spends past rejection capacity gets inflation in the thermal price, and people priced out of running. MMT's abstraction becomes physics, which is the best available argument for giving the Commonwealth its own currency. |
| Money in 2080 | Central bank digital currencies. The digital euro's legislation passed committee in June 2026, a pilot is planned for 2027 and first issuance possible in 2029. | **All money is digital by 2080,** and the Reserve Bank can plausibly hold an account for every resident. The consumables floor and substrate insurance are then transfers the Bank can pay in a second, and could stop in one. |
| Political business cycles | Nordhaus, "The Political Business Cycle" (1975); economic voting (Lewis-Beck; Fair's presidential model) | **The link the new count is missing.** Inflation and joblessness feed standing, so the economy votes. |
| Space as an economy | O'Neill, *The High Frontier* (1976); Weinzierl, "Space, the Final Economic Frontier", *Journal of Economic Perspectives* (2018): space needs market design and a public role | Consistent with §7.5's regulated utilities in a market's clothes. |

## 3. What the engine actually does

Measured on the code at 25 Sep 2026.

| Piece | What it does | Verdict |
|---|---|---|
| The unit | `solvency` is the state's holding of quota, in MW-years. It opens at 52,000 and has no ceiling. | **A commodity standard.** It leaves no role for the central bank, no exchange rate with Earth, and no inflation from money. |
| Receipts | `receipts()` in the engine is Σ rate × price/100 × weight over `TAX_BASES` (volume 480, thermal 300, substrate 280, transit 140), about 1,200 a sitting | Coherent. At a sitting a day it is about 440 GW of rejection taken as tax, around 62 kW a resident, plausible only if rejection per head is enormous (design/37 N5). **The engine names the four taxes**, against the one architectural rule. |
| Spending | The appropriation's clauses carry costs, and `clauseCost()` uses them only as a ceiling in `setClause()`. | **Never charged.** The reserve rises in every run that governs: Last 52k → 122k, Cycle 99k. `setup.history` says it fell from 78,000 to 52,000 over eight years. |
| Interest | `owed × rate/100/12` a sitting | **About 17× too high**: a month's interest a sitting, where a sitting is a day and there are about 208 a year. |
| Time | Every flow is per sitting | **Now wrong in a second way.** Recesses are fourteen calendar days (design/38) and nothing accrues in them. Interest, receipts and the drift of prices should be counted in days. |
| Prices | Four indices drift a fifth of the way a sitting toward targets set by law | Good, and §7.9's chain of decision → price → station → event is the best-designed part of the economy. **Inflation** is those four averaged, with no demand side and no money side. |
| Productive economy | Participation, trade and private share (§7.10) | Real, but there is no measure of output. Nothing links the budget to activity. |
| Lenders | Earth's Standby Facility and the Underwriters' Reserve Notes, with terms as content | **The best-modelled piece**, but Earth lends in MW-years, which no Earth bank holds. With a currency it becomes the original-sin story. |

## 4. Three ways forward

### A. Keep the MW-year and fix the mechanics

- Charge the appropriation weekly.
- Accrue interest and receipts by the day.
- Move `TAX_BASES` and the price rules into content.

Canon §7.5.3 stands. **Cost:** small. **What it cannot do:** monetary
policy, an exchange rate, or inflation that feels like inflation. The author
has said this is not enough.

### B. A thermal currency board

- The Commonwealth issues a currency, but only against quota held at a
  fixed rate, as Hong Kong issues dollars only against US dollars.
- The Reserve Bank's whole job is the peg. Interest rates are whatever
  holding the peg demands.
- It is realistic, it keeps "money is a claim on room to be alive" as the
  anchor, and it produces the most dramatic crisis in the literature: a run
  on the peg, as in Argentina in 2001.
- **Cost:** medium. **What it cannot do:** discretionary monetary policy.

### C. A floating currency, with heat as the ceiling (recommended)

- The Commonwealth's own fiat currency, and a Reserve Bank that targets
  inflation.
- Quota becomes what it is on Earth by analogy: the economy's energy price,
  a traded commodity, and a strategic reserve on the Bank's balance sheet,
  as central banks hold gold.
- Heat rejection remains the ceiling, and now it is **potential output**.
  The bible's central idea survives and gets sharper: the franchise question
  and the budget question are still the same question, because spending
  past rejection capacity shows up as inflation in the thermal price, and
  inflation in the thermal price is people suspended.
- **Cost:** the largest. **What it gives:** everything the author asked for.

**The backstory that joins B and C (judgement, the author's to take or
leave).** The Commonwealth opened in 2064 on a thermal currency board, which
fits distrustful founders and a state defined by heat. The Governor
appointed in 2071 floated it. That hands Flash a record as Governor that is
more than "long enough to be a record":

- She is the banker who broke the peg.
- The opposition can say she gave away the one thing that made the money
  mean something.
- Her own party can say she made it possible to govern.

## 5. Option C, as a model

It has to satisfy §7.6: shallow simulation, deep consequence, nothing the
player needs a second window for. So it is **six readings** and a handful of
rules, with every constant in content.

| Reading | What it is | Moves on |
|---|---|---|
| **Growth** | output against last year, per cent | demand against capacity, closing a share of the gap each week |
| **Inflation** | per cent a year | the gap (a Phillips curve), the four scarcity prices (supply), import prices through the exchange rate, and expectations anchored by the Bank's credibility |
| **Policy rate** | the Reserve Bank's rate | a Taylor rule while the Bank is independent: neutral + inflation + ½ (inflation − target) + ½ gap |
| **Exchange rate** | the currency against Earth's reserve money | the rate gap with Earth, `friction`, and the trade balance |
| **Deficit** | receipts less spending less interest, per year | the appropriation (charged weekly), the tax rates on the four bases, and output |
| **Debt / output** | both debts, the foreign one converted at today's rate | the standard debt-dynamics identity: next year's ratio ≈ this year's × (1 + r − g) + the primary deficit |

- **Capacity (potential output)** rises with total heat-rejection capacity,
  participation and closure. The thermal margin, the existential clock, is
  capacity's safety margin, so the scalar the game already has becomes the
  ceiling of the economy.
- **The r − g line** (Blanchard, 2019) is Soddy's debt trap in modern
  clothes. While the rate on the debt is below growth, debt shrinks as a
  share of output on its own; when it rises above, debt compounds faster
  than the economy can carry it. The debt trap canon ending is that line
  crossing.
- **The economy votes.** Inflation above target, and participation below
  its trend, pull standing down each week. That joins the economy to the
  new count, which since design/38 responds to standing.

**The player's levers are the real ones:**

- **The budget**: the appropriation's clauses, priced in currency and
  charged weekly.
- **Tax rates** on the four bases. §7.3's "not income" can stand; it is a
  good distinctive rule.
- **The Reserve Bank**:
  - who governs it (a hawk or a dove, as characters, in a real appointment
    fight);
  - its mandate (inflation only, or inflation and participation, by
    bill);
  - pressure on it (it costs credibility, which unanchors inflation);
  - an emergency power to make it buy the Treasury's bonds, which
    finances anything once and inflation for a long time after.
- **The currency**: defend it by selling the Bank's quota reserve, or
  impose capital controls (friction with Earth).
- **Borrowing**:
  - at home in currency, as Reserve Notes to the Underwriters, who are also
    the rating agency, so the continuity rating becomes a spread;
  - abroad in Earth money, through the Standby Facility, carrying currency
    risk.

**What stays exactly as it is:**

- the four scarcity prices and §7.9's chain;
- the lenders' terms as content;
- participation, trade and private share;
- the Underwriters;
- closure;
- shed orders. A state that cannot pay still sheds people. It now reaches
  that point through markets refusing, the Bank refusing, and austerity,
  instead of by running out of heat in a vault.

## 6. What it costs, and in what order

**Phase 1, whichever option is chosen.** These are defects, and fixing them
is balance-moving, so they want the author's nod:

- charge the appropriation weekly;
- accrue interest, receipts and price drift by the calendar day, so a
  recess counts;
- move `TAX_BASES`, `RATE_STEP` and the four price rules from the engine
  into setup, leaving the engine to name no tax.

Measure the canon run before and after, since its thermal margin at the
count is the tightest number in the game.

**Phase 2, option C.**

- A currency (named by the author, since §2.7 forbids inventing the term).
- The Reserve Bank's state and rule.
- Inflation, the exchange rate, output and capacity.
- The debt in two currencies.
- The Economy tab rebuilt around the six readings. The account panel
  becomes the budget, and the chart gains inflation and the rate.

**Content to touch:**

- 159 `solvency` mentions across content, most of them `move` effects that
  re-denominate mechanically at one rate;
- 17 passages that say "MW-years";
- the lenders' sums;
- `setup.history`, where the record gains inflation and the rate.

**Canon to reopen:** §7.5.3 (LOCKED), §7.5.2's "prints nothing", and §7.6's
state list.

**Phase 3.** Events that use the new readings:

- a run on the currency;
- a downgrade;
- the Bank raising rates in the campaign's second week;
- the Governor's term expiring during the session.

## 7. What it does to Flash I

- **The canon debt trap becomes a textbook sovereign crisis.** The drawn
  Standby Facility is in Earth money, the currency falls as friction rises,
  the debt grows as the currency falls, and the Underwriters' spread widens
  as the thermal margin thins. The expropriation clause
  (`standby_default`) sits naturally on top of it.
- **Flash's competence and her party's instincts pull apart**, which is good
  drama. She is a central banker by training in a party of socialists and
  democrats. The party wants the Bank to finance the floor, and she knows
  what that does to the currency.
- **The canon count now reads standing** (design/38), and standing would
  read inflation. A debt-trap government campaigning through a falling
  currency can lose, which gives the "middle ground between perfect and
  failure" a number to sit on.

## Decisions for the author

1. **A, B or C?** Recommendation: C.
2. **Was the Commonwealth founded on a thermal peg, and did Flash float
   it?** A backstory offer, not a requirement.
3. **Is the Reserve Bank independent under the Perigee Charter?** Either
   answer is playable. Independence makes the Governor's appointment the
   lever; its absence makes monetary policy a direct choice with a
   credibility cost.
4. **The currency's name** (§2.7).
5. **Is income still untaxed?** Recommendation: yes. The four bases are the
   world's identity.
6. **Phase 1 now?** It is small, and it changes the canon's numbers.

## Sources

The web-checked items (25 Sep 2026):

- [Starcloud-1 reaches space with an NVIDIA H100 (DCD)](https://www.datacenterdynamics.com/en/news/starcloud-1-satellite-reaches-space-with-nvidia-h100-gpu-now-operating-in-orbit/) and [Starcloud launches orbital AI data centre (Data Center Frontier)](https://www.datacenterfrontier.com/site-selection/article/55337494/starcloud-launches-orbital-ai-data-center-with-nvidia-h100-gpu)
- [Google's Project Suncatcher (Google)](https://blog.google/innovation-and-ai/models-and-research/google-research/google-project-suncatcher-facts/) and [Suncatcher's TPUs and Planet partnership (DCD)](https://www.datacenterdynamics.com/en/news/project-suncatcher-google-to-launch-tpus-into-orbit-with-planet-labs-envisions-1km-arrays-of-81-satellite-compute-clusters/)
- [OpenResearch Unconditional Cash Study, employment findings](https://www.openresearchlab.org/findings/nber-working-paper-employment) and [NBER w32784](https://www.nber.org/papers/w32784)
- [ECB: Eurosystem moving to the next phase of the digital euro](https://www.ecb.europa.eu/press/pr/date/2025/html/ecb.pr251030~8c5b5beef0.en.html) and [ECB speech, 24 Mar 2026: preparing for a potential launch](https://www.ecb.europa.eu/press/key/date/2026/html/ecb.sp260324~66f71f7577.en.html)

The rest are standard references, cited by author and year in §2 and
available in any university library. Of the grounding they give, the three
most worth reading for this game are:

- Eichengreen, *Golden Fetters*, on what a commodity standard does to a
  state in a crisis;
- Eichengreen and Hausmann on original sin, which is the Standby Facility's
  real shape;
- Arnott and Stiglitz on the Henry George theorem, which is the strongest
  case for the Single Tax Party that the world has.

---

## Decided, and built (25 Sep 2026)

The author's answer:

> "fuck it, let's do C. This is a political simulation that is supposed to
> feel real, so if there is to be semi-complex fiscal mechanics (compared to
> other games out there) then let's do it. it's fine if we have to hand-hold
> at some parts, it should be an in-depth game / Commonwealth Dollar works /
> and yes, let's make the reserve bank independent as you said, but not
> written into the charter"

| # | Decision | Answer |
|---|---|---|
| 1 | A, B or C | **C**: a floating currency and an inflation-targeting Reserve Bank |
| 2 | A thermal peg that Flash floated | **Taken as backstory**, not overruled: a currency board 2064–2071, the Reserve Bank Act 2071, the float in 2073 at parity. The author's to reverse; it lives in bible §7.5.3 and two Concordance articles |
| 3 | Is the Bank independent under the Charter | **By statute, not by the Charter**: the Reserve Bank Act 2071 gives the Governor the rate and the Treasurer the remit; Parliament keeps a reserve direction and a Ways and Means order, both affirmative |
| 4 | The currency's name | **The Commonwealth dollar** (CW$, CWD). Earth's banks lend in US dollars |
| 5 | Income untaxed | **Yes**, by default: the four bases stand |
| 6 | Phase 1 | **Built with the rest** |

### What was built

**The account runs by the calendar.** Receipts, the standing programmes, the
voted estimates, the civic clock and interest are rates a year
(`Engine.budget`), and each tick charges the days since the last, so a
recess of fifteen days is fifteen days' money. Interest is a year's at the
lender's rate, not a month's every sitting. The appropriation is charged:
a supply bill at its clauses' defaults until it passes, then at what the
House voted. The four bases and the rate levels moved from the engine to
`setup.fiscal`, with annual weights: CW$220bn of receipts at standard rates,
CW$176bn of standing programmes and CW$48bn of default estimates, a deficit
of CW$4bn a year, which is the fall the reserve has shown since 2073.

**The macroeconomy** (`setup.macro`, `Engine.macro`, `runEconomy`):

- output closes on demand; demand is potential plus the opening strength,
  plus the fiscal STANCE against where it opened (the rates set and lines
  voted, at opening prices and output, so a windfall from dearer heat is not
  the government tightening), less the real rate against where it opened, a
  strong dollar and the quarrel, plus trade and any shock content deals;
- potential rises with the trend and participation and falls under a
  thermal margin of fifteen (0.8% a point): the radiators are the capacity;
- a Phillips curve with expectations anchored by the Bank's credibility, the
  four scarcity prices as supply and the dollar as imports;
- the Bank meets every 42 days from 6 May on a published Taylor rule;
- the dollar trades on the real-rate gap with Earth, friction, the debt, the
  balance, credibility and trade, slowed by exchange controls;
- the economy votes: inflation over the target and slack cost standing, a
  steady economy lifts it.

**Debt in two currencies.** A lender with a `currency` lends in it and is
owed in it (`Engine.debtHome` converts). `{move:{"loan.<id>": n}}` borrows
both sides at the day's rate. **Treasury bills** (`automatic: true`) take any
payment the reserve cannot meet, up to CW$60bn; past that, arrears.

**Content.** The Governor, Maren Castellane (a deliberate roster addition);
four orders (two reserve directions, the Ways and Means advance, exchange
controls); two initiatives (lean on the Governor, defend the dollar); eight
events (the remit, the inflation figure, the open letter, the dollar falls,
the downgrade, the Bank in the campaign, and the two initiative answers);
eleven readings for the Underwriters; the Reserve Bank and Commonwealth
dollar articles; two glossary terms taught and three assumed; tooltips.

**The Economy tab.** The account became a year's budget in dollars, the
bases yield a year, and a sixth panel, the Reserve Bank and the dollar,
carries inflation, the cash rate with what its rule asks and when it meets,
the dollar, growth against capacity, and credibility. The chart takes
inflation, the rate, the dollar, growth, the gap, the balance and the debt,
with 2073–2080 records for the first four. Nothing on the tab scrolls at any
of the seven measured shapes, and the one-column collapse no longer draws
two panels two pixels wide (a fault that predates this).

**What it did to the canon.** The canon still lands the debt trap at sitting
28 and goes to the count, now on 19 August at sitting 58, at standing 58:
the PSD holds 103 seats and the government's side 165 of 280, a working
majority, with the thermal margin at 5. The crisis it pays for is financed
now rather than free: it reaches the count owing CW$59.8bn in Treasury bills,
about a tenth of output, with the dollar near 0.79, inflation 3.4% and the
Bank raising again. Every playtest strategy ends where it ended before.

**Not built, and why.** The four price rules are still in the engine's tick
(design/39 §6 phase 1 asked for them in content too); they are the §7.9
chain and moving them needs an expression language the schema does not have.
The Bank's meeting in the campaign is a weighted chapter-three event, and
chapter three is a fixed sequence, so it is rare.

