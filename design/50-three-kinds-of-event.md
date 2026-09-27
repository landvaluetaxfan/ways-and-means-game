# 50 — Three kinds of event, levers, and pages worth reading

**27 September 2026.** The author, after design/49:

> Like say, when Bellamy is abandoned, that is an event that warrants a
> handful of paragraphs that elicit reading: this way the game will feel
> real with a proper narrative.
>
> For 2, in which the player initiates something you can probably come up
> with your own term for it.
>
> If it helps since an event that's dependent on solely an outcome overlaps
> with an outcome, we can separate into outcome events, random events, and
> threshold events I guess.

## The words, all of them

| | what it is | where |
|---|---|---|
| **decision** | what the sitting asks: the sitting's business, one a sitting | the Sitting panel |
| **event** | something that happened: a page that arrives before the decision without taking its place | takes the screen |
| **lever** | what the player starts: an initiative, an order, a bill set down or given time, the whip, the paper, a Draw, a Table | the tab that holds it |

**Levers** is the new word, the author's to replace if it does not fit. It
is "the levers of government", and it was free: `move`, `act` and `measure`
all mean something else in this code already. The sandbox groups its
initiatives and orders under it.

## Three kinds of event

The kind is read off the fields that already say it (`Engine.eventTrigger`),
so it cannot disagree with them:

| kind | the field | it comes |
|---|---|---|
| **outcome event** | `queuedOnly` | when something the player did queues it: a decision's answer, a lever, a vote |
| **random event** | `perSitting` (or `chance`) | when the dice say: `perSitting: 0.1` is a one-in-ten roll each sitting its gate holds, from the government's seed |
| **threshold event** | anything else | the first sitting its gate holds: a meter crossed, a flag set, a date, a chapter reached |

**`perSitting` is new**, because nothing made an event's timing random.
`chance` decides once whether a thing ever happens; `perSitting` decides
when. It is rolled once a sitting, not once an asking, and
`st.rolledToday` keeps the roll, since a sitting that opens with an event
asks again for its decision. It is seeded like every other draw, so the
same government meets it on the same sitting. No entry in content uses it
yet. Across three hundred seeds a quarter-a-sitting event arrives after 3.8
sittings on average, at more than five different sittings.

**One event from the pool a sitting.** Threshold events chain. The first
floor's flag opens the second floor's gate, and the second's opens the
meltdown's. With nothing holding them apart, all three landed on one
sitting (Flash I's guards caught it), where the author's plan wants "one
tier per turn" so a government has time to pull back. Once an event from
the pool has been answered, the pool's other events wait for the next
sitting. An outcome event, a dated one and a prologue beat are never held,
because they were due.

**Found by its own test:** narrowing the pool to events before rolling the
dice left a sitting with no decision at all whenever the roll failed. The
dice come first now.

## The pages

**The page is the body, then what is written for the page.** An event's
story is its `body`, as any entry's is: the first paragraph is the lede and
the rest follow at the introduction's reading size. Its `setpiece.sections`
add what a body cannot: *What is being said* (voices), a document in the
document face, a headed passage. An epigraph goes first. So nothing is
written twice. Lint reads the story where it reads every entry's, and the
page footnotes glossary terms as a decision's prose does.

**Thirty-one pages were written**, three to six paragraphs each. The
Bellamy abandonment is the model:

- the wind-up notice filed in Port-Gentil;
- what the Works is and who is on it;
- why the wind-up was lawful;
- Kenya's two-year programme against two months of air;
- why almost nobody asks to go down;
- what the Commonwealth could do today;
- then four voices (The Spindle, Earth-side wire copy, Kenya's foreign
  ministry and a shift supervisor) and the notice itself.

Every figure is one content or the bible already holds: 184,000 residents,
97,000 on the payroll, 7,100 suspended, Tether 2 at Malindi, the Gabonese
sovereign fund, the CW$60bn Standby Facility signed in 2078, and each
choice's own sums. The earlier pass's voice was kept, and the new pages
avoid the prose faults design/42 and design/45 name.

**Eight more of Flash I's beats became events**, because they are things
that happen and are among the campaign's most important:

- the workers' vote (outcome, after the survey);
- the accounts freeze (threshold);
- both floors giving way (threshold);
- the agent's default notice (threshold);
- the Union tabling its resolution (outcome);
- the emergency order running out (outcome);
- the facility closing (outcome).

Events now: 19 outcome, 12 threshold, 0 random.

**Moods are the ones that resolve on their own** (`SCHEMA.vocab.eventMoods`).
`tension` brings the drums in until a division's result takes them out, so
the three events design/49 gave it would have played drums until the next
division. `prorogue` stays the score's one full stop. Lint fails an event
that names another.

## Continuity faults fixed in passing

- **"The mandate" said the returns were complete before the count.** It is
  chapter three's seventh beat and the count is the ninth. Its wire said
  "THE GOVERNMENT IS RETURNED", even in a run that goes on to lose. It is
  now the campaign beat where the government asks the country for a
  mandate on the debt.
- **"The writs" said the campaign was "a fortnight by law".** It runs
  twelve sittings, three weeks, as the next beat already said.
- **The no-confidence notice named Thursday.** A motion comes three sittings
  later, so it is Thursday only when the notice lands on a Monday. It says
  "three sitting days from today" now.
- **The stranding said "The Works has voted"** four sittings before the
  vote. The delegates call the vote on the stranding page, and the survey
  returns the result.

**Found and left for the author:** the dilemma says Cordell "kept the
leases", and `sell_the_leases` says "the leases came with the platform". The
facility and the sale both treat them as the Commonwealth's. The pages
follow the initiatives, and the dilemma's sentence is the author's to
settle.

## What it moved

Every event added is a sitting that also meets a decision. Across eighty
seeds:

| strategy | losses: design/48 → design/49 → now |
|---|---|
| First option, supply first | 40 → 18 → 4 |
| First option, never climbs | 77 → 59 → 28 |
| Cheapest option | 35 → 6 → 0 |
| Costliest option | 47 → 16 → 5 |
| Last option, Cycles, Programme first, Governs not at all | unchanged within the reshuffle |

Flash I's canon still lands the debt trap and reaches the count at sitting
55, with 171 of 280 at standing 55. Its thermal margin at the count is 3,
the thinnest it has been; it has run 4 to 17 across earlier changes.

**The campaign is now forgiving,** and that is the author's to judge. The
levers that would tighten it without touching this rule:

- make decisions cost more;
- raise the standing fade (`setup.standingDrift`);
- give the thermal events more teeth;
- give a few threshold events a `perSitting` below one, so they come later.

## Checks

- **test.js**:
  - the three kinds are read off the fields;
  - a chain of threshold events falls one a sitting, and an outcome event
    due the same sitting still comes;
  - a random event's sitting varies, averages about one over its odds, is
    the same for the same seed, and is rolled once a sitting, keeping the
    decision when the roll fails;
  - an event's moods exclude the ones that wait for a division.

  Each rule was broken and its test failed.
- **uitest**: each kind's filter finds only its kind, and between them they
  find every event; an outcome event says which kind it is.
- **edtest**: the Kind field walks a decision through threshold, outcome
  (queued only), random (odds 0.1, then 0.25 read back) and threshold
  events, and back to a decision. The open-everything sweep holds all
  thirty-one pages intact.
- **lint**: event moods and section kinds.
- **`npm run layout`**: two event pages at every shape, one of them the new
  Bellamy page.
