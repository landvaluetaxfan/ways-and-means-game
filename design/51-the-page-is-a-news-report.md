# 51 — An event page is a news report, and lint enforces it

**27 September 2026.** The author, on the Bellamy page design/50 called the
model:

> bellamy abandonment writing, same trap, just disappointingly confusing
> when the purpose is to properly explain to the player what is happening.
> The player doesn't know what Cordell is, and quite frankly reading the
> rest of it the player won't get a great idea of what's happening. This is
> reoccuring, and we really need some manner of safeguard and strict
> checking ... If I had to guess once again the target is an in-universe
> news source, think New York Times reporting on this.

And on the interface: "good direction for how the event looks".

## What was wrong

The page opened on "Cordell has wound up the company that ran the Bellamy
Almanac Works." Four of its first five nouns were names the player had never
met. The next sentence ran to 49 words. The Spindle, Ring Network, Tether 2
and the repatriation programme all appeared before anything said what they
were. It is the fault design/45 named: prose written for somebody who already
knows the world. The difference is that an event page is the one surface
meant to stop the player and tell them what happened.

design/45 wrote rules down, and the next pages broke them. A rule nobody
checks does not hold, so this time the rule is a check.

## The register

An event page is written the way a newspaper writes a story for a reader who
has not followed it:

- **A headline** (`setpiece.title`) saying what happened, in 14 words or
  fewer. The entry's own `title` stays as the slug the sandbox and the log
  use.
- **A lede** of 12 to 45 words: who did what, to whom, and why it matters.
- **A nut graf** next: why the Commonwealth should care.
- **Every name introduced where it first appears**: "Cordell, the Gabonese
  mining company"; "Tether 2, the space elevator anchored at Malindi";
  "Vesna Girard, the Minister for Substrate and Thermal".
- **Short sentences**: none over 40 words, and an average of 24 or fewer.
- **The third person.** "You" appears only inside quotations, and interface
  words ("tab") never.
- **Evocative in the details**, not in the syntax: the shift supervisor
  asking where the children born on the Works are being sent home to, the air plant tripping
  at ten past four.

## The check

`tools/pagecheck.js` holds the rules, and lint runs them on every event as a
**hard failure** ("EVENT PAGES THAT DO NOT EXPLAIN"). Decisions are counted
as an advisory: they sit inside the interface that explains them, and their
prose is the next pass (74 of 99 would fail today).

- **The headline, the lede and sentence length** are measured.
- **Names:** `INTRODUCE` lists every company, institution, paper, market and
  setting term a page may use, each with the words that explain it. The
  sentence that first uses a name, or the one after it, must contain one of
  those words. That is how a newspaper glosses: in an apposition, or in the
  next sentence. Add a name to the list the day content first uses it.
- **People:** a character's first mention carries a word of their role. The
  speaker gets no exemption, because a report introduces everybody. The
  Prime Minister needs no introduction.
- **The register:** "you" outside a quotation, and "tab", fail.

It was proved by breaking the Bellamy page six ways: no headline, Cordell
unexplained, a 62-word lede, "You have a choice", an unintroduced Girard,
and a mention of a tab. Each failed on its own, and the page as written
passes. On the first run, all 31 pages failed.

What a check cannot judge is whether an explanation is good. It can refuse a
page that gives none, which is the fault that kept coming back.

## The pages

All 31 were rewritten to the register. The Bellamy page now opens:

> Cordell, the Gabonese mining company, has abandoned the Bellamy Almanac
> Works, an orbital refinery that is home to 184,000 people. It wound up the
> company that ran the platform at midnight, leaving the residents with no
> employer, no money and two months of air.

Every figure is one content already held, and no mechanic changed. Two facts
were stated more plainly than content had stated them, both from the
author's plan (design/35):

- the accounts were frozen under "international sanctions arising from a
  conflict on Earth";
- the later freeze is the European Union's, whose banks hold the bonds.

**Left for the author:** whose sanctions froze Cordell's subsidiary in the
first place. The plan says the host nation was drawn into a proxy conflict,
and content never named the conflict.

## The interface

- **The speaker is the picture's caption, not the byline.** A report names
  its sources in the text, and under the headline a name read as the author.
  The portrait caption now reads "Aster Skye MP — Financial Secretary to the
  Treasury".
- **A new page opens at its headline.** `js/focus.js` restored a scroller's
  position after every render, so the second event of a sitting opened 700px
  down, halfway through its own story. The sitting panel now carries
  `data-page` (the entry and the sitting), and a box showing a different page
  starts at the top.
- **The editor has a Headline field**, and edtest writes one and reads it
  back.

## The balance

design/50 left Flash I forgiving: with an event and a decision every
sitting, the climbing strategies all but never lost. The author approved
tightening it.

**The lever:** the sanctions' middle line (friction above 65) drains the
thermal margin three points a sitting, where it drained two (`content/setup.js`
couplings). Across eighty seeds:

| strategy | losses: design/48 → design/50 → now |
|---|---|
| First option, supply first | 40 → 4 → 33 |
| First option, never climbs | 77 → 28 → 51 |
| Cheapest option | 35 → 0 → 32 |
| Costliest option | 47 → 5 → 35 |
| Last option, Cycles, Programme first, Governs not at all | unchanged |

Every loss is a cascade after sitting 30. The runs that reach the count do so
with a median margin of about 9.

**The canon** climbs the emergency ladder when the margin falls to 16, not
10. At 10 it reached the count on a margin of 2. A careful government climbs
sooner, and it pays for that in standing:

| | before | now |
|---|---|---|
| the count | sitting 55 | sitting 55 |
| thermal margin | 3 | 5 |
| PSD seats | 107 | 103 |
| the government's side | 171 of 280 at standing 55 | 167 of 280 at standing 52, working |
| Treasury bills owed | CW$24.4bn | CW$29.6bn |
| inflation (core) | 6.8 (3.0) | 6.5 (2.9) |

The dead `lastDays` test in the canon policy went with the old threshold,
since climbing at 16 already covers it.

## After the author's read (27 Sep)

The author's notes on the rewritten Bellamy page all came to one thing: it
abstracted where a reporter would be specific. "No employer, no money and
two months of air" did not say why. "A conflict" was not named. "The people
who feed, treat and teach them" was a figure of speech standing in for a
list of jobs. "No treaty with it and no duty to it" read as a slogan. And it
did not say why returning to Earth takes medical care.

The page now gives the cause of each fact:

- the European Union froze Gabon's sovereign fund in March;
- European rules freeze any company the fund owns more than half of;
- the operator banked in Europe, and other banks would not take its
  business;
- the air plant's filters and catalyst come up from Earth every month;
- Kenya's two years are a tender, an inspection, the certification of the
  descent cars, and the June budget;
- partial gravity thins bone and wastes muscle (bible §6.11);
- the charter's elected council of delegates is the body that asked for
  help.

**Proposed, for the author to confirm or replace:** the sanctions follow a
United Nations panel's finding that the Gabonese fund paid for weapons used
by separatists in Cabinda, the oil-producing Angolan exclave. That is the
"international proxy conflict" of design/35, which canon had never named.

**The check learned the fault.** `INTRODUCE` now carries two vagueness rules
as well as names. The first mention of sanctions must say whose they are.
The first mention of a conflict or a war must say where, and a month or a
weekday does not count as a place. Both were proved by breaking the page. On
the first run they caught three pages that said "sanctions" without an owner.

**An event keeps the side columns.** Only the last page, after the count,
takes the screen (`#s-sit.fullpage`). With the columns hidden, an event's
answers ran the full width of the window under a 66ch page. In the centre
column they are a decision's width, and the docket and calendar stay in
view.

The Sandbox menu item and each campaign's Sandbox bench lost their
subtitles.
