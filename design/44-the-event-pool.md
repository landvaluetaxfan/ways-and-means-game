# 44 — The event pool, measured and cut

26 Sep 2026. The author: "you can cut down on events as you see fit:
something reasonable, something I can work with when I edit but not without
feeling like there's too little events." Asked after design/43 found that
chapter two's pool is saturated: a new event above weight 75 takes a sitting
from the crisis, and one below it rarely fires.

## What was measured

`node tools/playtest.js --seeds N` (new with this note) plays all eight
strategies on N seeds and prints each strategy's outcomes, the mean eligible
pool per sitting, the events that lose the pool and the events never met.
It uses `Engine.eligible`, so "never met" can be told apart from "eligible and
never drawn".

At twenty seeds, before the cut:

- **The chapter-two pool held 16.8 eligible events per sitting**, and the
  heaviest wins (with a seeded lean). About a dozen events were eligible
  from the chapter's first sitting to its last, whatever the player did.
- **Consequences lost to texture.** `ec_participation_report` was eligible
  in 93 runs for 2,716 sittings and drawn in none; `the_engineers_write` 80
  runs, none; `thermal_drift` 65 runs, none. These are the systemic
  reactions chapter two is for (bible §1.7), losing to events that react to
  nothing.
- **The never-met list is mostly doing its job.** The ballot, the meltdown,
  the brinks, the shed-order crisis and the trade, subsidy and clock
  consequences answer to conditions these strategies never create: a
  collapsing party, a bill they never pass, a price they never push. They
  stay.

## What was cut

Nine events, archived whole in `content/archive/cut-events.js`, which no
page loads. Each entry there says where it came from and why it went.

| event | why |
|---|---|
| `thermal_drift` | second of three thermal-price events; `thermal_squeeze` fires at the same pressure and carries the ladder's first rungs |
| `substrate_drift` | the same trigger as `substrate_price_bite`, at a lower weight, so it never fired |
| `the_engineers_write` | the third thermal-price event; never fired |
| `the_sublet_market` | the same subject as `the_minimum_berth`, and eligible from the chapter's first sitting |
| `the_delegation` | the same trigger as `shed_order_crisis` (suspensions past 73,000 or 74,000) |
| `the_opposition_asks` | Question Time already puts the Leader of the Opposition at the dispatch box every eight sittings |
| `order_paper_empty` | its gate `slotsLeft:0` means "at least none left", so it was eligible every sitting; the docket and the status bar already say when time is gone |
| `rb_campaign` | a chapter-three pool event, and chapter three is its prologue: never fired |
| `ch4_structural` | overlaps `ec_participation_report`; fired in three runs of 160 |

And one fix: `fa_two_fronts` reports "the platform's scrubbers" and had no
gate at all, so it could lead the news before the platform was stranded. It
waits for `f1_stranded` now.

**141 events to 132** (101 the world's, 31 Flash I's); chapter two's pool
from 79 to 71. Nothing kept names a cut event; lint would fail if one did.

## What it changed

- **The pool thinned from 16.8 to 13.8 eligible events a sitting.**
- **Consequences surface.** Across eighty seeds (640 runs):
  `ec_participation_report` went from 0 to 16 runs, `f1_water` (the Works'
  water line) from 27 to 59, and the weight-6 no-confidence motion fired
  for the first time, once.
- **Outcomes did not move.** At eighty seeds, runs reaching the count:

  | strategy | before | after |
  |---|---|---|
  | First option, supply first | 32 | 40 |
  | First option, never climbs | 3 | 3 |
  | Cheapest option | 46 | 45 |
  | Costliest option | 34 | 33 |
  | Last option | 80 | 80 |
  | Cycles the options | 79 | 77 |

- **The canon holds**: the count at sitting 57 (was 56), the thermal margin
  17 (was 9), the PSD on 87 and the government's side 149 of 280 at
  standing 42, as before. It carries more Treasury bills, CW$52.6bn with
  CW$7.4bn of room under the authority (was 44.8 and 15.2), and inflation is
  5.4 against 2.9 underlying (was 5.7 and 3.0).

## One seed is an anecdote

The first comparison, at twenty seeds, said Cheapest fell from 18 runs in 20
to 10, and that looked like a regression. Cutting `rb_campaign` alone, an
event that never fires, moved Cheapest from 18 to 14, because the pool's
seeded lean is keyed on an event's POSITION in the list: removing any event
reshuffles every run after it. At eighty seeds the difference vanished. So:

- **The playtest's one-seed table is a sample.** CLAUDE.md records single-
  seed findings like "Cheapest now reaches the count"; across seeds the
  ladder-climbing strategies reach it about half the time.
- **Judge a content edit with `--seeds 80`**, about forty seconds, and
  expect differences under about five runs in eighty to be the reshuffle.
- `test.js`'s Question Time assertion ran 24 sittings, two cadences, and a
  queued event that the reshuffle moved onto sitting 20 took that week's
  questions (a recurring item yields to a one-off). It runs three cadences
  now, read off the event.

## Left for the author

`--seeds 40` after the cut still lists three events as losing the pool:

- **`thermal_squeeze`** (weight 70): eligible in 71 runs, drawn in none. It
  offers the thermal ladder's first rungs as choices (design/38 §7), so
  today only the docket teaches the ladder. Raising it into the eighties
  would let it lead the ladder when the price crosses 108; that moves the
  canon, so it is the author's call.
- **`ec_participation_report`** (58): eligible in 171 runs, drawn in 8.
- **`ch4_rises_on_it`** (64): the canon's choice on it matters (it keeps
  order-paper time for the emergency ladder), and it fires in about one run
  in 140.

The rest of the chapter-two pool is one event per subject now. The
texture that is eligible throughout (the minimum berth, the rented halls,
the judge who remembers, the deck at Harvest, the pair for Cable End, the
remit letter, the waiting list) is what gives two runs different weeks, and
it stays.
