# 27 — FOUR THREADS THE HUNDRED OPENED

**15 September 2026.** `design/26`'s triage came back ninety-six in, one out,
one undecided. Selection is therefore not the problem any more and ordering is.
But four of the author's replies were not dispositions — they were new design,
and each is larger than the idea that prompted it. They are here rather than in
`26` because `26` is a list to pick from and these are decisions to make.

---

## A. ONE ELECTION, IN THE MIDDLE

**The decision.** A run contains exactly one general election and it falls in
the middle — the point at which the player can lose. Not a terminal event and
not a chapter transition tacked to the end: the hinge.

This settles what `design/10` left open and it changes the run shape
`design/18` proposed. Against the 45-minute-to-two-hour band:

| | sittings | the election falls at |
|---|---|---|
| short run, one session | 24 | sitting 12 |
| long run, three sessions | 72 | end of session 2 |

**The mid-game election is a better instrument than a terminal one** and it is
worth writing down why, because the terminal version is the obvious design and
it is wrong here. An election at the end grades the player. An election in the
middle *is played through* — the second half is governed with whatever the
first half earned, which is the only way a consequence chain longer than a
session becomes legible. It also gives the four settlements somewhere to be
decided that is not the last five minutes.

**Preselection** (`26` #17) sits immediately before it. A local party that can
sack its own member is a threat the leadership does not control, and placed
here it does a second job: it shows public opinion moving *before* the
electorate gets to move it, which is the difference between a poll and a
warning.

**Opposition** (`26` #50) is not for this run. The author's framing:

> Opposition mode could be for a different campaign, for after this first one.

### The canon question

The author's larger idea, recorded because it governs everything above:

> there could be a "canon" in which there's a canon way each campaign (each
> campaign representing 1–3 parliamentary sessions) goes, so that they make
> sense chronologically.

This is a real structural proposal and it wants a decision before content
scales, because it is the difference between **four endings** and **a
chronology**. Two readings, and they are not compatible:

1. **Campaigns are alternatives.** Four settlements, four ways one parliament
   can end, replayed. What `bible` §3.5.1 currently assumes.
2. **Campaigns are a sequence.** Campaign one ends *somehow*, a canon outcome
   is chosen, and campaign two opens in the Commonwealth that outcome produced —
   possibly in opposition, possibly as a different leader (`design/14` §6).

Reading 2 is much the better game and it costs a rule: **§3.5.1's four
settlements stop being endings and become states of the world.** That is not a
small edit, and it is one the author has to make rather than me.

Until it is made, `26` #96 (the record between runs) is the cheap hedge — show
what the last Commonwealth settled on at the start of the next, and the
chronology exists in the player's head at no engine cost.

---

## B. STATION GOVERNMENT IS NOT ONE THING

**The author's sketch**, which is better than the uniform model `26` #61
assumed:

> Anselm might have a "state government" and then a significant amount of
> subdivisions inside it like municipalities and cities; some large stations
> might be like city-states, smaller stations being like home-rule cities, a
> bunch of interesting governmental structures.

**Why this is the right call and not decoration.** `federal_fudge` is one of
the four settlements — *"each station answers for itself, and the Commonwealth
does not ask"* — and it is currently the weakest of the four, because if every
station is governed identically then federalism is an administrative
rearrangement rather than a politics. A Commonwealth of thirty-five polities
with **different constitutions** makes that ending mean something specific:
devolving to Anselm Ring, which has a legislature of its own, is a different
act from devolving to Homestead, which has a town meeting.

The roster already supports this and nobody has used it. `content/stations.js`
carries `band`, `type`, `form`, `population` and a four-way `composition`;
population runs from 80,000 (The Winter Garden) into the millions. **A
station's government should be derivable from what it already is**, not typed
by hand:

| what the station is | the form it takes |
|---|---|
| large, ring band, multi-seat | a state government with municipalities beneath it |
| large, single, dense | a city-state — one government, no subdivision |
| mid-size | a home-rule charter — wide powers, one council |
| small, low band | direct administration, or a town meeting |
| the capital | its own thing, and non-voting (already true) |

That is a **reader**, not a stored field, and so costs nothing against §15.5's
verb cap. It is the same pattern as the Concordance deriving offices from the
cabinet rather than trusting a typed `role`.

---

## C. THE SUBSTRATE ROSTER — A MEASURED HOLE

**The author's question:** what is the split of legislators who are fully
biological, augmented, interfacing, uploads, synthetic, instances, uplifts,
cyborgs — compared with the population's actual demographics?

**Answered by measuring, and the answer is worse than a gap.**

The population is modelled in full. Across 35 stations, weighted by population,
`content/stations.js` gives:

| | |
|---|---|
| biological | **64.0%** |
| emulation | **28.0%** |
| uplift | **4.0%** |
| synthetic | **4.0%** |
| | *7,086,000 people* |

Per-station it is specified to four decimal places — Anselm Ring is
`biological 0.5187, emulation 0.3814, uplift 0.0388, synthetic 0.0611` — and
the bible gives the physical reason the spread exists (§: rejection geometry
varies by band, so *"Farstead is 47% emulated and Homestead 81% biological"*).
This is one of the best-specified things in the project.

**And of 54 members of the House, zero carry any substrate field.** Not
`category`, not `status`, nothing. The character record is `id, portrait, name,
role, party, seat, relationship, office, note, functional`. The single
exception is free text: one independent's `note` mentions *"Biologically
augmented: cat ears."*

So the House is implicitly 100% default-embodied-root, in a Commonwealth that
is 28% emulated. **That is not a missing feature; it is an unintended claim
about the polity**, and it is being made by silence in a game whose entire
subject is who counts as a person.

### What it blocks

Every idea in `26` §VIII depends on this and none of them can start without
it: subjective time as a resource (#71), the proxy vote for an instance (#72),
continuity of membership (#73), quorum with instances (#75), pairing across
substrates (#76), whether an instance can hold office (#78). **The substrate
roster is the prerequisite for the whole section**, which reframes it from a
content chore to the top of the queue.

### The shape it should take

Bible §6.10 already supplies the schema and warns against the obvious mistake.
The law lists five categories in one schedule and **that is a category error
kept on purpose** — the drafters conflated what you are made of with what
relation you stand in to another person, and the courts have patched it ever
since. The clean structure the law does *not* use:

- **Category** (substrate of origin): biological · uplift · emulation · synthetic
- **Status** (cross-cutting, changeable): root/instance · running/suspended ·
  attested/unattested · embodied/disembodied

So a member gets a `category` and a bundle of statuses, and the interesting
members are the ones whose bundle is contested. Two rules:

1. **Use the clean structure in the data and the broken one in the world.**
   The engine reads category and status separately; the *schedule* the
   characters argue about still lists five. That is where the litigation is.
2. **The author's list — augmented, interfacing, cyborg — are not categories.**
   They are a biological with statuses, and collapsing them into the four
   keeps the vocabulary at the size §7.6 allows. The cat ears are a `note`,
   correctly.

### And then the actual question

Once members have the field, the House's composition can be compared with the
Commonwealth's, and **the answer should not be proportional.** A legislature
that mirrors its population is a worldbuilding default; one that does not is a
grievance with a number attached — and the Public Substrate Association is
described in the bible as *"young, emulation-heavy, list-tier strength and
almost no district seats."* That sentence predicts an under-representation the
data should confirm. Districts return the embodied; the list tier is where the
emulated get in. Make the roster say so, and `26` #44 (the franchise as a
bill) has something to be about.

---

## D. MAKING A DECISION'S EFFECT OBVIOUS

The author, on the direction §12.13 started:

> I really like the direction we went in with making decisions feel like they
> cause changes and how it's intuitive where we see the changes in other tabs,
> although I think we need to make it even way more intuitive what decisions
> actually do.

Two requests, one small and one standing.

**The small one: the hourglass on every decision.** `js/wait.js` owns the three
ways the terminal says it is thinking, and the delay currently fires on some
actions and not others. Every decision should take a beat. The reason is not
polish: a state change the player did not watch happen is a state change they
have to go and find, and the beat is what makes the causal link between the
click and the change perceptible at all. It is also the cheapest item in this
document.

**The standing one: find the other places.** §12.13 gave every action a report
and `acted()` wires the reporting; what it does not do is *animate* the arrival.
The places a change currently lands silently, worth auditing in order of how
often a player sees them:

- a scalar moving in the status bar
- a seat changing hands in the chamber diagram
- a bill changing stage in the order paper
- the calendar gaining a dated entry
- an undertaking passing from open to owed to breached
- capital moving in the ledger
- a station's opinion shifting on the orbit map

Per the author's earlier instruction, **this is a standard of the game's visual
design and not a per-feature decision**: a change the player caused gets a
visible arrival, wherever it lands.
