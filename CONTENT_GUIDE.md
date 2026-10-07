# CONTENT GUIDE

How to add things without touching the engine. If you find yourself editing
`js/engine.js` to add content, stop — the thing you want is nearly always a new
entry in `/content`.

## Running it

Open `index.html` in a browser. No server is needed: content files are plain
`.js`, because a browser blocks `fetch()` on a `file://` URL and allows
`<script src>`. Run `npm run check` after any content change.

## The files

```
index.html          shell and script order
css/terminal.css    all styling — the mockup, unchanged
js/engine.js        rules. Names no event, party, or station.
js/ui.js            rendering. Contains no rules.
content/setup.js      opening state
content/parties.js    parties and internal currents
content/stations.js   the station roster
content/characters.js the fixed cast
content/bills.js      bills and how each party votes on them
content/events.js     the world's events
content/forums.js     the forums (the General Assembly) and the world's resolutions
content/campaigns/<id>/  a campaign's own story, one file per kind
                      ← you will live here
```

---

## Campaigns

A **campaign** is one government's story: Flash I is the first, and the
proof of concept. The content holds two things at once:

- **The world** — parties, stations, constituencies, characters, the
  glossary, the Concordance, and every event, bill or settlement in the
  files directly under `content/`. Every campaign plays the world.
- **A campaign's own story** — a folder, `content/campaigns/<id>/`. Only
  that campaign sees what is in it; to every other campaign it does not
  exist.

Flash I's folder, which is the one to copy:

```
content/campaigns/flash_i/
  campaign.js       the administration the menu offers, its setup, its
                    introduction
  events.js         the crisis, the panic buttons' answers, the canon election
  bills.js          the Annexation Act
  settlements.js    the five outcome tiers
  initiatives.js    the facility, Earth's terms, the pivots
  achievements.js   its awards
  guards.js         what the story promises, as tests (not loaded by the game)
  scaffold.example.js   the pre-build scaffold, loaded by nothing
```

Each file is one call. The entries inside are written exactly as they are in
the world's files:

```js
campaign("flash_i", { events: [

  { id:"f1_stranded", chapter:2, at:14, once:true, ... },

] });
```

`campaign()` (in `content/setup.js`) tags every entry `campaign:"flash_i"`
and adds it to the world's list of that kind, so the engine, the editor and
every check see it without being told where it lives. The kinds a campaign
may add are `administrations`, `events`, `bills`, `settlements`,
`initiatives`, `instruments`, `achievements`, `minutes`, `characters`,
`actors`, `business`, `glossary` and `articles`. Misspell one and the page
throws rather than dropping the campaign's story without a word.

**The tag decides, not the folder.** An entry in a world file carrying
`campaign:"flash_i"` is just as much Flash I's; the folder is where a
campaign's entries are kept, and the editor writes them back there. An entry
meant for several campaigns stays in the world's files, untagged, and can
branch on which one is running with the `campaign` condition:
`when:{ campaign:"flash_ii" }`.

**Starting a new campaign in the editor** (since 25 Sep):

1. Open `editor.html`, go to **Campaigns** and press **New**. Give the id;
   it names the folder and goes on every entry of the campaign.
2. Fill in the record: party, Prime Minister, the term, the setup it
   changes (the opening date and meters as fields, anything else as JSON),
   the opening effects, and the introduction, section by section.
3. Write its events, bills, endings, initiatives and awards on their own
   tabs, choosing the campaign in each entry's **Campaign** field.
4. Press **Export this campaign** on the Campaigns tab. Each file downloads
   as `<id>-<kind>.js`: move it to `content/campaigns/<id>/<kind>.js`. The
   tab lists the `<script>` lines to add to **both** `index.html` and
   `editor.html`, after the world's content and before `content/index.js`,
   and warns until the editor's own page loads them.
5. Write its `guards.js` (below) when the story has promises worth keeping.

**Or by hand:**

1. Copy `content/campaigns/flash_i/` to `content/campaigns/<new id>/`, and
   change the id in every `campaign()` call.
2. In `campaign.js`, make the administration yours:

   ```js
   { id:"flash_ii", party:"cu", leader:"flash", ordinal:"II",
     from:2084, to:2088, session:1,
     setup:{ startDate:"2084-05-02",               // merged ONE LEVEL deep over the world's:
             scalars:{ solvency:30000 },           // change one scalar, keep the rest
             lenders:{ bondholders:{ name:"...", rate:{ fixed:6 } } } },
     opening:[                                     // effects applied at the first sitting
       { flag:"f1_resolved_pyrrhic" },             // how the last campaign's canon ending
       { move:{ "debt.bondholders":30000 } },      // becomes this one's starting state
       { coalition:{ remove:["rv"] } } ],
     intro:{ ... } }
   ```
3. Add the folder's files to **both** `index.html` and `editor.html`, after
   the world's content and before `content/index.js`. Every tool reads the
   page's list, so nothing else needs telling; lint fails if the two pages
   disagree.
4. Empty the copied files and write the story. Keep `guards.js` and rewrite
   its blocks to say what YOUR story promises; `npm run guards -- <id>` runs
   them.

An administration can also play **another's** campaign: a variant with
`campaign:"flash_i"` gets Flash I's content, setup and opening, with its
own setup on top. Administrations are not tagged, because their `campaign`
field means the campaign they play.

**See it in the game.** The main menu's **Sandbox** opens any campaign on
the author's bench: its tab lists every decision and event, reads each
one's gate condition by condition, and puts any of them on the Sitting
screen as a player meets it (an event as its page, then the sitting's
decision after it). Choose, look at what moved, then **try another choice** or
**Undo**. The editor's **Play in the game** button on an event opens the same
bench with that event, as the form holds it, unsaved edits included. The
sandbox keeps its own save and records no ending and no award. A campaign
may give the tab **shortcuts** to a state: a `sandbox` list of
`{id, label, note, effects}` tagged with the campaign (Flash I's are in
`content/events.js`).

**Append, do not insert.** The pool's seeded lean is keyed on an event's
position in the list a campaign plays, which is the world's events followed
by the campaign's. A new event goes at the end of its file.

**The story map: see the wiring before you pull on it.** `npm run storymap`
writes `storymap/<id>.html` for the world and every campaign; open
`storymap/index.html`. Each page has:

- the campaign's own entries as a graph, left to right by what leads to
  what: queues, initiatives' answers, flags set and read, *after* gates,
  results read, bills moved, broken promises;
- every event by chapter, each with its gate, its choices and what they
  do, and where it comes from and leads to;
- every flag with who sets it, clears it, needs it and is shut by it;
- the loose ends: a queued-only event nothing queues, a gate waiting on a
  flag nothing sets, and the flags set that nothing reads.

It is generated from the content the game plays, so it is never out of
date unless it was drawn before your last edit; draw it again. It is not
committed.

**Guards: the story's tests are the campaign's.** `test.js` tests the
engine on the world's content and never reads a campaign's folder. What a
campaign promises (the crisis opens on its date, the Act can be carried,
every tier is reachable, the canon run lands its ending and reaches the
count) is asserted in its own `guards.js`, which `npm run guards` runs for
every campaign the page loads, and `npm run check` runs with everything
else. When a rewrite breaks a guard, the guard is telling you the story
changed: change the guard to the new promise, or delete it if the promise
is gone. Each block runs on its own, so a block naming an event you removed
fails once with the reason and the rest still run.

`npm run lint` checks that every tag names a campaign, and that nothing a
campaign can see names something it cannot. A shared event that queues a
Flash I event is fine in Flash I and broken everywhere else, and lint says
so. `CONTENT.forCampaign(id)` builds any campaign's view, and it is what the
game, the tests and the playtest all play.

**The prose file and the editor both know the folders.** `npm run prose`
lifts a campaign's sentences with the world's, and `npm run prose:in` writes
each back to the file it came from. The editor's export writes the world's
entries to the world's file and each campaign's to `<id>-<kind>.js`, whose
header says where in the folder it goes. **The two are not alike.** The
prose file replaces one string in place and leaves everything else in the
file as it was. The editor's export regenerates the whole file from data
and drops every comment in it, so a file whose comments matter is edited by
hand or through the prose file, not through the export.

**What the editor writes.** The **campaign record** (with the economy it
opens with), events, bills, **endings** (settlements), **initiatives**,
**awards** (achievements), **orders** (instruments), the **cabinet**,
parties (with their leader), stations, seats,
functional seats, characters, the Concordance and the glossary. An ending's
conditions are the events' conditions; an initiative's tempos each carry a
delay, an extra cost, their own conditions and their own effects; an award's
conditions are its own (`SCHEMA.awardConditions`: how the run ended, which
ending it reached, promises kept or broken, flags, the record), and it
offers only crisis results for "the crisis result" and only answers for "the
answer it reached", since an award asking the wrong one can never be earned.
A condition on several meters at once (`scalarAbove:{legitimacy:65,
friction:65}`) is one row of pairs, with `+` for another.

**What it does not write: the world's `content/setup.js`.** Its comments
are the documentation of every setting and an export would drop them, so
it is edited by hand. A campaign changes the world's setup through its own
record instead, which merges over the world's one level deep: the opening
date and meters and the opening economy (inflation, cash rate, dollar, the
Bank's credibility, the four tax rates) have fields, and anything else
(lenders, thresholds) goes in its "Other setup" JSON.

## The campaign as a play (design/56)

A campaign's administration may carry `play`: a title, a logo (the title as
an image; or a `mark`, an ornament) and a flat `logoSmall` for small sizes, a playbill (the image the menu chooses
the government from), a cast, one
act per chapter (a title, an epigraph and a stage direction), an interval for
each recess, and an epigraph for the curtain call. Its introduction closes, before
the signature, with the note for the performer ("The role") and a `cast`
section ("Cast of characters"), which lists the cast. The frame stays at the edges: acts, intervals and
the curtain call are shown by the interface, never inside an event. On an
event page a `margin` section is the Prime Minister's own note on the
document above it, initialled.

## Adding an event

Copy an entry in `content/events.js`, or in a campaign's `events.js` for
that campaign's story. Nothing else changes.

```js
{ id:"unique_id",
  weight:70,              // higher fires first among eligible events
  once:true,              // omit to allow repeats
  queuedOnly:true,        // omit unless it should ONLY fire from a queue effect
  when:{ minSitting:3, flagsAbsent:["already_done"] },
  title:"Shown in the header and the record",
  speaker:"halloran",     // a character id, or null
  body:`Prose. Blank lines become paragraphs.`,
  choices:[
    { posture:"cautious",   // cautious, measured or bold: see below
      label:"What the button says",
      effects:[ {move:{public_standing:-4}}, {flag:"already_done"} ],
      result:"One or two lines shown after the choice." }
  ]}
```

**Where it goes, and whether it will fire** (design/44):

- Add it at the **end** of its list. The pool's seeded lean is keyed on an
  event's position, so an insertion mid-list reshuffles every run after it.
- **Chapter two's pool holds about fourteen eligible events a sitting**, and
  the heaviest wins. An event eligible from the chapter's first sitting
  competes with all of them; one gated on a condition (a price, a flag, a
  bill's stage) meets only the events sharing its moment. Gate texture on
  something, and give a consequence the weight to beat texture.
- **Measure it**: `node tools/playtest.js --seeds 80` lists every event
  that is eligible in many runs and almost never drawn, and every event never
  met. Differences under about five runs in eighty are the reshuffle, not
  the edit.
- An event cut from the game is kept whole in
  `content/archive/cut-events.js` (not loaded), with why; paste one back at
  the end of its list to restore it.

### Decisions, events and levers

Three words for the three things a campaign is made of (design/49,
design/50):

- **A decision** is what the sitting asks: the sitting's business, drawn in
  the ordinary Sitting panel, one a sitting.
- **An event** is something that happened: a page that takes the screen
  before the sitting's decision, without taking its place.
- **A lever** is what the player starts: an initiative, an order, a bill set
  down or given time, the whip, the paper. Levers live in their own files
  and on their own tabs; an initiative's answer is usually an outcome event.

An entry is an event when it carries `setpiece`:

```js
{ id:"f1_stranded", chapter:2, at:14, once:true,
  setpiece:{ title:"Mining company abandons orbital refinery, leaving 184,000 people with two months of air",
    mood:"threat", sections:[
    { kind:"voices", head:"What is being said", body:[
      { said:"They filed a return in the spring and nothing since.",
        who:"Ivor Ceyhan, political editor of The Spindle, the Commonwealth's newspaper of record" } ] },
    { kind:"document", head:"The notice of wind-up", body:"...", source:"..." } ] },
  title:"A hundred and eighty-four thousand",
  body:`The story, a handful of paragraphs. The first is the lede.`,
  choices:[ ... ] }
```

- **The page is the body, then the sections.** Write the event's story in
  `body`, as for any entry: three to six paragraphs, enough to be read. The
  first is set as the lede. `sections` add what a body cannot: *What is
  being said* (`voices`), an in-world paper (`document`, with a `source`),
  a headed passage (`body` with a `head`). An `epigraph` goes first.
  `setpiece: true` is an event whose page is its body alone.
- **The page is a news report**, and `npm run lint` fails one that is not:
  headline, lede, short sentences, the third person, every name introduced.
  The rules are in `PROSE.md`, "News".
- **The picture** is the art slot (`setpiece.art`) if there is one,
  otherwise the entry's `image`, otherwise the speaker's portrait, captioned
  with their name and office. The dateline comes from the sitting.
- **A mood** is one of `SCHEMA.vocab.eventMoods`, the ones that play and
  resolve on their own. Each already means a moment in the score, so name
  one only where the event is that kind of moment.

**Three kinds of event**, read off the fields, so there is nothing extra to
keep in step:

| kind | write | it comes |
|---|---|---|
| **outcome event** | `queuedOnly: true`, queued by a choice, an initiative (its `event`) or a resolution | when the thing the player did comes due |
| **random event** | `perSitting: 0.1`, with or without a `when` | each sitting its gate holds, a seeded roll at those odds; 0.1 is ten sittings on average |
| **threshold event** | a `when`, an `at` or a `prologue` | the first sitting its gate holds |

An event whose gate holds comes before every decision, whatever the
weights, and **one event from the pool comes a sitting**: a chain of
threshold events (a first floor, a second, a collapse) falls one a sitting,
so a government has time to answer each. Outcome, dated and prologue events
are never held back. Answered, an event continues to the sitting's
business.

The editor's event form has a **Kind** field (Decision, or an outcome,
random or threshold event), and changing it writes the fields that kind
needs. The Sandbox tab filters by all four, and groups initiatives and
orders under **Levers**.

### Posture: cautious, measured, bold

A choice says how far it goes (`design/40` E7) **when that is true of it**. A posture
is optional but not uncommon: lint fails an entry only for an unknown word, for more than
four answers open whatever the state or more than five in all, and for fewer than 60% of
competing answers carrying one across the content. A lone bold answer, or a cautious and a
bold with nothing between, is a dilemma and not a gap; do not write a measured answer to
fill it. Two answers may share a posture where they differ in who they favour. An answer
that is open only because of what the government has done (a kept promise, a signature,
banked capital) is gated by `when` and says why in `because`, in one clause that
completes "Open because ...": it lists last, with an "earned" mark, and lint fails a gated
answer beside open ones without it. Two wordings of one answer chosen by the state are not
earned answers and need no `because`.

The Sitting screen lists the cautious answer first, then the measured one, then the
bold one, then any answer with no posture, then the earned ones, and marks each; the engine
keeps the order you wrote, so reordering never changes a run. An entry whose choices are
all gated, so the state picks one, or that has one answer, carries none.

Posture is the ACTION, not the size of its consequences. Doing nothing can
be expensive and still be the cautious answer; a big public stand can cost
little and still be bold. As written across the world's content the three
read as a political trade, and new content should keep it that way:

| | on average |
|---|---|
| **cautious** | keeps the party, costs public standing, spends little, and is usually worth least |
| **measured** | does something and keeps something back |
| **bold** | buys standing, a partner and legitimacy, strains the party and the reserve, and is where things go wrong later |

A government that always takes one posture should lose, each in its own
way. Measured on Flash I: always cautious reaches the count and loses it
heavily; always bold is removed by its own party; always measured loses a
partner. Keep the first answer on the screen from being the best one: it was
strictly best by its immediate effects in 67 of 119 events before postures,
because content had a habit of writing the good answer first.

### Conditions (`when`)

| key | example |
|---|---|
| `minSitting` / `maxSitting` | `minSitting:5` |
| `flags` / `flagsAbsent` | `flags:["shed_order_promised"]` |
| `scalarAbove` / `scalarBelow` | `scalarBelow:{thermal_margin:20}` |
| `lawIs` / `lawAbove` / `lawBelow` | `lawBelow:{divergence_threshold_hours:100}` |
| `loyaltyAbove` / `loyaltyBelow` | `loyaltyBelow:{cu_halloran:20}` — works on parties or currents |
| `stationBelow` | `stationBelow:{anselm:{closure:0.35}}` |
| `billStage` | `billStage:{divergence:"committee"}` |
| `inGovernment` | `inGovernment:false` |
| `seen` | `seen:["f1_stranded"]` — events already met; how a sequence chains |
| `settled` / `resolved` | `resolved:true`, or an ending's id |
| `owes` / `breached` | `breached:"carry_threshold"` — a promise still open, or broken |

**Who** (design/46). An event can move a person, so a story can ask about one:

| key | example | true when |
|---|---|---|
| `holds` | `holds:{treasury:"skye"}` | that person holds the post; a list means any of them |
| `inCabinet` / `outOfCabinet` | `outOfCabinet:["ceyhan"]` | they hold some post, or none |
| `signed` / `notSigned` / `refused` | `signed:["piastri"]` | where they stand on the leadership paper |
| `seated` / `unseated` | `unseated:"watkins"` | whether they still sit for their party (a vacancy that names them, or their party losing the seat at the count, unseats them; a by-election their party wins back returns somebody else) |
| `relationshipAbove` / `Below` | `relationshipBelow:{ceyhan:30}` | what `rel.<person>` moves, 0 to 100; `president` too |

All conditions in a `when` must hold, and a list inside one means every
item. Omit `when` for always-eligible, and read "Where it goes" above before
you do: an always-eligible event competes with the whole pool. `js/schema.js`
describes every condition the engine knows, which is what the editor offers
(`test.js` fails the day one is added to the engine and not to the schema):
among the rest are `priceAbove`, `economyAbove`, `actorBelow`, `postVacant`,
`risesWithin`, `dissolved` and `resolutionIs` (a forum's business).

### Effects

| verb | example | notes |
|---|---|---|
| `move` | `{move:{public_standing:-4}}` | adds to a meter; a namespaced key moves something else (below) |
| `law` | `{law:{divergence_threshold_hours:40}}` | sets, does not add; `null` clears |
| `economy` | `{economy:{participation:2}}` | the productive economy and the Reserve Bank's readings |
| `station` | `{station:{perigee:{closure:0.03}}}` | numbers add, strings set |
| `flag` | `{flag:"gb_approached"}` | a string, a list, or `{flag:{x:false}}` to clear one |
| `bill` | `{bill:{shedorder:{stage:"second_reading"}}}` | a stage, or `dead:true` |
| `coalition` | `{coalition:{remove:["rv"]}}` | also `add` |
| `cabinet` | `{cabinet:{treasury:{holder:"skye", party:"cu"}}}` | `null` leaves the post vacant |
| `si` | `{si:"si_2080_44"}` | lays an instrument |
| `slots` | `{slots:{reserve:{annexation:5}}}` | order-paper time; `total` for the general pool |
| `undertake` | `{undertake:{id:"carry_threshold", …}}` | a promise, with its discharge and breach; the editor starts one from a template |
| `discharge` | `{discharge:"carry_threshold"}` | counts an open promise kept, when events overtake it |
| `vacate_seat` | `{vacate_seat:{constituency:"anselm_proper", party:"cl", why:"resigned", member:"watkins", then:"byelection"}}` | `member` says who left, which `unseated` reads |
| `resolution` | `{resolution:{un_icj_salvage:"table"}}` | a forum's business (design/43) |
| `wire` | `{wire:"HEADLINE IN CAPS"}` | appears in the wire panel |
| `queue` | `{queue:[{event:"followup", after:4}]}` | fires in N sittings |

`move`'s namespaces: `loyalty.<party or current>`, `rel.<character>` (or
`rel.president`), `price.<good>`, `capital.<party>` (the ledger),
`trend.<meter>` (a drift each sitting), `standing.<band>`, `actor.<id>`,
`member.<forum member>`, `debt.<lender>` and `loan.<lender>`. Seats move
only by `cross` and `vacate_seat`; `court`, `motion`, `election`,
`chapter`, `functional` and `signatures` are the rest. `js/schema.js`
describes every verb, and **`scalar`, `loyalty`, `relationship`, `price`,
`capital` and `unflag` are retired**: lint fails content that uses them.

To add a new verb, add it to `EFFECTS` in `engine.js` and describe it in
`js/schema.js`, or `test.js` fails. Keep the list short — if the vocabulary
grows past twenty, content is leaking into the engine.

---

## Adding a bill

`content/bills.js`. A bill's `stances` object says how each party votes; parties
you leave out are inferred from axis agreement, so you never have to list all
eleven.

```js
stances:{
  cu:  { popular:{for:68}, functional:"for" },   // splits by bench
  psa: "for",
  sc:  { free:true },        // splits on party loyalty
  cl:  { forPct:0.3 },
  hul: "against"
}
```

Stance forms: `"for"` · `"against"` · `"abstain"` · `{for:n}` (n seats in that
bench) · `{forPct:0..1}` · `{free:true}` · `{popular:…, functional:…}`.

Set `dualMajority:true` for bills touching life-support integrity or amending the
charter. Those must carry separately on both benches — the trap the campaign is
built on.

`onPass` and `onFail` are effect arrays, same vocabulary as events.

---

## Adding a resolution (design/43)

The House is where the government whips; a **forum** is where it asks. The
General Assembly is the world's forum, in `content/forums.js`, and a
campaign's resolutions go in its folder (`resolutions.js`), or on the
editor's **Resolutions** tab.

```js
{ id: "un_icj_salvage", forum: "un_ga", sponsor: "commonwealth_mission",
  title: "Request for an advisory opinion on the salvage of abandoned orbital platforms",
  summary: "Asks the International Court of Justice whether ...",
  axes: { orbital: 0.6, creditors: -0.6 },      // on the forum's own axes
  when: { flags: ["almanac_annexed"] },         // when the government may table it
  whenText: "the Annexation Act has to be law first",
  onPass: [ { flag: "un_icj_requested" }, { queue: [ { event: "f1_icj_opinion", after: 4 } ] } ],
  onFail: [ { move: { legitimacy: -3 } } ] }
```

- **A member votes** its position projected on the resolution's, plus the
  Commonwealth's vote times its standing, plus the forum's climate (the
  General Assembly reads friction). Beyond the forum's `line` it votes; inside
  it, it abstains. A bloc votes its line with `cohesion` of its seats.
- **Majority** is of those present and voting; `majority: 0.6667` makes an
  important question. `vote` sets the Commonwealth's vote until the
  government changes it (`"against"` for a resolution aimed at it).
- **Table it from content** with `{resolution:{<id>:"table"}}`. This does NOT
  check the resolution's `when`, because another member tables its own
  through an event; a choice that tables the Commonwealth's own should carry
  the same `when`.
- **Move a member** with `{move:{"member.<id>": n}}`. A member with an
  `actor` moves the actor, so the powers panel and the forum agree.
- **Read the result** with `resolutionIs:{<id>: "adopted"}` (or a list of
  statuses), or with the flags its `onPass` and `onFail` set.
- **Deliver its story by queue, not by weight.** Chapter two's pool is
  saturated: an event above weight 75 takes a sitting from the crisis and one
  below it rarely fires. Queue the event from the choice that makes it true,
  or better, make it a choice on an event already there (the World Court's
  question is the bondholders' notice's fourth answer). Then run the guards
  and the playtest and compare.
- **Keep friction out of a forum's consequences** in an annexing run until
  measured: friction feeds the thermal drain, and two points of it tipped a
  playtest strategy into a cascade that three did not.

---

## Adding a party or a station

Add an object to `content/parties.js` or `content/stations.js`. Seat totals,
the hemicycle, the legend, division maths, and the constituency table all update
from the data — no rendering code to touch.

Station roster is **frozen canon**. Adding one is a deliberate act, not something
a content pass does.

---

## Prose

Every sentence a player reads follows `PROSE.md`: the author's standard, the
register for each surface, what lint fails, the Underwriters' briefing
figures and the constituency placeholders. Read it before writing any.

The rules that keep content working (the engine names nothing, determinism,
state versions, the checks) are in `AGENTS.md`.

---

## Images

Optional throughout. Every image reference degrades to nothing if the file is
missing, so you can write content that names an image before you have made it.

### The rule

Images are **not decoration, they are evidence of a source.** The palette says
who rendered the picture, before the player reads the caption:

| palette | source in world | use for |
|---|---|---|
| `registry` | the government system itself | character portraits, ID photos, official records |
| `newsprint` | *The Spindle* | press photographs |
| `broadcast` | Ring Network | broadcast stills, live footage |
| `deck` | civilian, agricultural decks | warmth, the human register |

This is the split visual language from the bible applied to photography. The
system chrome is drab; the images carry their origin in their colour.

### Processing

```bash
./tools/dither.sh registry  160 4:5  src/halloran.jpg img/portraits/
./tools/dither.sh newsprint 640 12:5 src/*.jpg        img/events/
```

Args: `<palette> <width> <aspect> <inputs...> <outdir>`. Output is an indexed
PNG8 — a portrait lands around 2 KB, a plate around 11 KB.

**Aspect is not optional.** The CSS pins both shapes, so an image that arrives
the wrong shape gets cropped again in the browser and you lose control of the
framing:

| | aspect | width | why |
|---|---|---|---|
| portraits | `4:5` | 160 | an ID photo shape; renders at 96×120 |
| plates | `12:5` | 640 | a still frame band; never eats the reading column |

The crop fills and centre-crops rather than letterboxing, so a 12:5 plate from a
16:9 source loses roughly a quarter of its height. Centre anything that matters,
or crop the source yourself first.

A square image with `width:100%` and no height constraint renders as tall as the
panel is wide, which is how this was originally wrong.

The pipeline is `-resize` → slight desaturate → `-posterize 6` →
`-dither Riemersma` → `-remap palette.png`. Posterize must come **before**
remap; running it after re-quantizes colours that were already snapped to the
palette and can push them back off it.

### Wiring it up

A character portrait:
```js
{ id:"halloran", portrait:"halloran.png", name:"Tarrin Halloran MP", ... }
```

An event plate:
```js
image:{ src:"vantage_radiator.png", palette:"broadcast",
        caption:"Radiator array 4, Vantage High", credit:"Ring Network" }
```

### Practical notes

- Portraits below about 120px wide turn faces into noise. 160px is the floor.
- `image-rendering: pixelated` is set in the CSS. Without it browsers smooth the
  upscale and the whole effect dies.
- A saturated spot colour in a palette pulls a lot of midtones onto it. If
  `newsprint` reds are dominating a photograph, desaturate harder before remap
  rather than editing the palette.
- Riemersma is organic and painterly. For an image that should read as
  *machine-generated* — a registry scan, a sensor capture — swap
  `-dither Riemersma` for `-ordered-dither o4x4`, which gives a regular Bayer
  grid and looks like output from a system rather than from a camera.
- Edit `tools/palettes/*.png` and re-run the batch to restyle every image in the
  game at once. That single point of control is the main reason to do this at all.

---

## Scarcity prices — making consequences visible

Four index numbers, 100 at the opening of the series: **thermal quota**,
**substrate rent**, **volume**, **transit**.

Deliberately not a stock market. There is no point pricing equities in an economy
where goods are nearly free, and §7.5 warns against any model the player would
need a second window to solve. These are the four things that are actually
scarce, and every one is a **legislative output rather than a market outcome** —
§2.3's rule applied to the economy.

### The causal chain

This is the whole point, and it is the answer to "do my decisions matter":

```
decision  →  price  →  station conditions  →  event
```

Worked example, currently in content:

- The **Substrate (Public Stake) Bill** sets `substrate_public_share` to 0.6 and
  knocks 26 points off the substrate index.
- Each sitting, `Engine.tick()` drifts prices a fifth of the way toward what the
  current policy implies — so prices *lag* policy, and politics happens in the lag.
- Stations answer to the substrate price, weighted by exposure `0.75 − closure`,
  so low-closure habitats feel it first. A station that cannot pay does not
  economise; it sheds people, and the shed order says which.
- `substrate_price_bite` fires on `priceAbove: {substrate: 112}`.

Play it out: **do nothing** and the index climbs to 112 by sitting 19, the event
fires, and Ashfield reaches 12,295 suspended. **Pass the bill** and the index
settles at 97, the event never fires, and Ashfield sits at 10,931.

Fourteen hundred people, attributable to one division. That is what consequence
means here — not a meter moving, but a named place with a different number in it
because of something you did twenty sittings ago.

Note also that **inaction is a decision**. The drift is upward by default.

### Authoring with prices

| | |
|---|---|
| effect `price` | `{price:{substrate:-26}}` — index points |
| condition `priceAbove` / `priceBelow` | `{priceAbove:{substrate:112}}` |

Put a `price` effect on any bill that changes what something costs, and gate
events on the result. A price effect without an event gated on it is a number
nobody sees; an event gated on a price nothing moves will never fire.

The panel shows a sparkline per price, so the player can see the shape of what
they did rather than only its current value.

---

## Coalition capital, order-paper time, and the whip

Three mechanics, one loop. Loyalty is how a partner **feels** about you — slow,
driven by policy alignment, decides whether they rebel. Capital is what you
**owe or are owed** — fast, transactional, decides whether they do you a favour
they don't want to do. A partner can dislike you and still owe you.

### The ledger

`st.capital` is one signed number per partner. Positive means they owe you;
negative means you owe them. **Nothing decays and nothing is forgiven.** It is
shown exactly, because this game is for people who want the arithmetic.

### Where capital comes from

Time on the order paper. A session has a fixed number of slots
(`setup.slotsPerSession`, currently 6) and every one you give a partner is one
you don't get. Granting a slot advances that bill one stage and, if a partner
owns it, puts them in your debt: **+2**, or **+3** if it's flagged `priority`.

Bills therefore carry `owner` and `priority`. Time is the right currency because
unlike money it cannot be topped up.

### Discipline

A bare `"for"` stance is a party *position*, not a guarantee of turnout. What it
actually delivers is `seats × (0.75 + 0.25 × loyalty/100)` — full loyalty
delivers everyone, no loyalty still delivers three quarters. **The gap between
position and delivery is exactly what the whip buys back.** An explicit
`{for: n}` is a stated count and is taken at face value, which is how the
divergence bill's forecast numbers stay fixed at 128 and 12.

### The whip

Before a division you can commit members. What you can move, and what it costs,
both depend on axis distance from the bill:

| alignment | movable | cost |
|---|---|---|
| broadly agrees (> +0.25) | 100% of the gap | 0.5 / seat |
| no strong view | 50% | 1.0 / seat |
| fundamentally opposed (< −0.25) | 15% | 2.5 / seat |

That table is what keeps the four axes load-bearing rather than decorative: you
cannot buy a party out of its own position, only out of its apathy.

Your **own** party costs `party_loyalty`, not capital — you don't owe yourself,
you spend internal discipline. Parties **outside the coalition cannot be
whipped at all**; moving those benches is lobbying, a different activity with a
different currency, and the panel says so.

Going into debt is allowed. Overdrawing costs that partner **2 loyalty per
capital point overdrawn**, because calling in credit you don't have is a favour
rather than a transaction.

Whipping is a plan until you divide. Nothing is charged until then, so it can be
revised or cleared.

**Always call `Engine.divide(st, C, billId)`** rather than sequencing it
yourself. The result must be computed while the plan is still attached, because
paying for it clears it — getting that order wrong is silent, and costs the
player capital for nothing.

### What it does not fix

The divergence bill's functional trap is untouched by all of this, deliberately.
The coalition holds 12 of 40 functional seats and needs 21; there is no headroom
to whip because every one of those 12 is already voting for it. The whip panel
says so in as many words. That is a structural problem with a political
solution, not a whipping problem.

### New verbs and conditions

| | |
|---|---|
| effect `capital` | `{capital:{psa:+3}}` — move a debt |
| effect `slots` | `{slots:{total:+1}}` or `{slots:{refill:true}}` |
| condition `capitalAbove` / `capitalBelow` | `{capitalAbove:{rv:0}}` |
| condition `slotsLeft` | `{slotsLeft:2}` |

---

## Functional constituencies

`content/functional.js` — the forty seats elected by profession and industry
rather than place. Bible §4.6.

`franchise` is the field that matters, because each type plays completely
differently:

| franchise | how a seat is won | example |
|---|---|---|
| `licensure` | individuals holding a professional licence | Life Support Engineering, 4,100 electors |
| `corporate` | companies vote, not employees | Elevator Consortiums, **62** electors |
| `union_bloc` | a union casts for its members | Maintenance and Trades, 214,000 |
| `residual` | everyone in no recognised sector | 3,910,000 electors, **one seat** |

Two of these are levers rather than flavour. A **licensure** seat has a
government-appointed board, so widening or narrowing the licence changes who
votes there by regulation, with no bill before the House. A **corporate** seat
is controlled by whoever controls the companies, and subsidiaries can be
incorporated to manufacture votes — which collides with personhood law the
moment instances count as persons.

`held` must reconcile with each party's `functional` count in `parties.js`. The
editor's validation panel errors if they drift, in both directions.

---

## Chapters and branching

Four routes exist for getting an event in front of the player. Understanding
which one you want is most of authoring.

### 1. Chapter

`chapter: 2` on an event means it cannot fire until the game is in chapter 2.
An event with **no** `chapter` is available in every chapter — useful for
recurring pressure events, dangerous for anything story-specific.

The game starts in chapter 1. Nothing advances automatically: a choice must
apply `{chapter: 2}`. That is deliberate — chapters turn on a decision, not on a
timer.

### 2. Prologue — the authored opening of a chapter

`prologue: 1`, `prologue: 2`… fire in order, one per sitting, at the head of
**their own chapter**. They skip any whose `when` fails. This is where you
control what the player meets first and in what order, which is how the
one-concept-cluster-per-event rule gets enforced in practice.

### 3. The weighted pool

Everything with neither `prologue` nor `queuedOnly`. Each sitting the engine
takes every event whose `chapter` matches and whose `when` passes, and fires the
highest `weight`. Ties break on id, so it is fully deterministic — same state,
same event, always. **Do not add randomness**; determinism is what makes balance
testable.

### 4. Queued

`queuedOnly: true` means unreachable except when a choice fires
`{queue:[{event:"…", after:3}]}`. This is how consequences land later. Always
mark follow-ups `queuedOnly`, or they fire before the thing they follow — the
linter will tell you.

### Threading it together with flags

A choice sets `{flag:"shed_order_promised"}`; later events gate on
`flags:["shed_order_promised"]` or `flagsAbsent:[…]`. That is the whole
branching mechanism. The **Branches** tab in the editor draws all four edge
types: chapter advances (blue, thick), queues (red), flag unlocks (green), flag
blocks (grey dashed).

### Worked example — adding chapter 3

1. In the editor, open the event that should end chapter 2. On every choice that
   should close the act, add the effect **Advance to chapter → 3**.
2. Write the opening: a new event with **Chapter 3**, **Prologue 1**. This fires
   the sitting after the advance.
3. Write the body of the chapter: events with **Chapter 3** and a weight,
   gated on whatever flags chapter 2 set.
4. Follow-ups get **Chapter 3** and **queued only**.
5. Check the validation panel. It errors if a chapter has events but nothing
   advances to it, and warns if a chapter has no openable events.

Chapter 2 in the shipped content is a worked example: `gb_approach` closes
chapter 1 on every branch, `ch2_open` is its prologue, `ch2_carveout_price`
gates on a flag set in chapter 1, and `ch2_psa_conference` is queued from a
choice inside it.

---

## The Concordance (encyclopedia)

An in-world reference work, not a manual. It is **a view over content that
already exists**: every party, station, bill, character and glossary term gets
an article generated from its own data, with seat counts, closure ratios and
division forecasts read live from state. A new party gets an article for free,
and no number in the encyclopedia can ever disagree with the game.

You only hand-write an article when you want prose the data cannot produce:
history, controversy, the argument about the thing.

Currently 7 hand-written, 56 generated.

### It is not neutral

The banners are the point. Bible §9.4 says ideologies should be refracted rather
than presented; a maintenance banner is refraction you can read at a glance.

| banner | says |
|---|---|
| `neutrality` | the article is disputed |
| `contested` | an active political fight, changing fast |
| `single` | relies largely on one source |
| `protected` | attested accounts of standing only |
| `stub` | nobody has wanted to write this |
| `cleanup` | below standard |
| `orphan` | few articles link here |

The article on the failed revolution of 2251 is a stub, disputed,
single-sourced, edited by an unattributed unattested account, and reverted nine
times this session. That tells the player more about the politics of memory
than three paragraphs of history would.

### Writing an article

```js
{ id:"the_permanent_emergency", title:"The permanent emergency",
  category:"Constitutional theory",
  banners:["neutrality","contested"],
  edited:{ by:"multiple", attested:true, note:"142 revisions this session" },
  summary:"One paragraph. Shown as the lede.",
  sections:[ { h:"The argument for", body:"…" },
             { h:"The argument against", body:"…" } ],
  see:["engineering_authority","shed_order","hul"] }
```

Links are `[[id]]` or `[[id|shown text]]`. A link to an id that does not exist
renders red, exactly as it should. Generated ids: parties and stations use their
own id (`cu`, `ashfield`), bills use `bill_<id>`, characters `person_<id>`,
glossary terms `term_<slug>` or the bare slug.

Run `node tools/cxcheck.js` to confirm every link, see-also and banner resolves.

### Over time: standing, history and state (design/55)

An article is written on a date by someone in 2080, and it knows only what
the world knows that day. Standing text is true on the campaign's opening
day and needs no mark. Anything later carries a condition, in the grammar
events use:

```js
sections:[
  { h:"The charter", body:"…" },                                   // standing
  { h:"Accession", since:{ flags:["almanac_annexed"] },              // history
    body:"On {date} Parliament carried the Act…" },
  { h:"Sanctions", while:{ scalarAbove:{ friction:40 } }, body:"…" } // state
]
```

- `since` is history. It appears from the day its condition first holds and
  stays afterwards, dated by the engine; `{date}` in its body is that day.
  Write it in the past tense.
- `while` (or the older `when`) is state. It shows only while the condition
  holds, and is the way a scalar reaches the prose. Write it in the present
  tense.
- An article, a character (`since` on the entry) and a banner
  (`{ id:"contested", since:… }`) take the same marks. A foreign power's
  or a foreign platform's dated sections go in a `cx` list on its entry,
  and a lender's in its `terms.sections`.
- No game units in the prose: no sittings, meters or scores. A history
  section is listed in the article's revision record, and the navigation
  marks it until it is read.

### The Concordance

An in-world reference work, so it keeps Wikipedia's **furniture**: a lead that
defines the subject in its first sentence, sentence-case headings, an infobox on
the right, a See-also list at the foot, third person, no address to the reader.
The maintenance banners are the refraction; the prose itself stays encyclopedic.

But the prose is written in the **plain register**, not a literary one:

- **Plain declaratives.** "The congress sat for eleven weeks and produced a text
  no single delegation would have written." Not "A text no single delegation
  would have written was produced by a congress that sat for eleven weeks."
- **No em dashes.** A comma, a colon or a full stop does the work.
- **No "not X but Y".** "What orders the population is whether a person can be
  switched off." Not "The distinction that orders the population is not what a
  person is made of but whether they can be switched off."
- **No rhetorical closers.** A sentence ends when the fact ends. If a line is
  there for effect rather than information, cut it.
- **The bias is in the furniture, not the prose.** The maintenance banners
  (`neutrality`, `contested`, `stub`, `protected`), the edit record and the
  protection status carry the in-world point of view. The reader sees the bias
  in the machinery, never in the sentences.

### Editing it

The **Concordance** tab in the editor edits the hand-written articles: title,
category, banners, the edit record, summary, sections, and see-alsos. Generated
articles are not editable and should not be — they come from the data, which is
the point. To change what the article on a party says, change the party.

### Why it is exempt from the legibility lint

`tools/lint.js` governs prose the player is **forced** to read — events. The
Concordance is prose the player **pulls**. Different contract: an event may
introduce one concept cluster, an encyclopedia article may assume the reader
came looking. Do not let encyclopedia coverage become an excuse for dense
events; the lint still governs those.

---

## The editor

Open `editor.html`. Same government chrome, no server, no database.

It reads the same `content/*.js` files the game reads, edits them in memory, and
writes them back out in the same format. There is one source of truth and it is
the content files — the editor is a convenience over them, never a replacement.
`node tools/roundtrip.js` proves it: serialise everything, re-evaluate it, play
40 sittings, and confirm the trace, scalars and divisions are identical.

### Tabs

**Events** — id, title, speaker, weight or prologue position, once/queuedOnly,
image, body, and choices. Effects and conditions are **pickable, not typed**:
the dropdowns are built from `js/schema.js`, so you never have to remember the
verb vocabulary or which parties exist. Flag fields autocomplete from every flag
already used anywhere in the content.

**Bills** — a stance grid, one row per party, one column per bench. Change a
stance and the division forecast recomputes live underneath, using the real
engine. This is how you tune a bill to sit exactly on the knife edge.

**Concordance** — hand-written encyclopedia articles: banners, edit record,
sections, see-alsos.

**Functional** — the forty sector seats, with franchise-specific warnings and
live reconciliation against party seat counts.

**Stations** — includes an **archetype roll**. Pick an archetype and the editor
generates band, form, population, apportionment ratio, closure, suspended count,
attestation and seat count *together*. That matters: a low-closure industrial can
has a high suspended count and low attestation because those are one fact seen
three ways. Rolling them independently produces places that do not make sense.
Ten archetypes ship in `content/archetypes.js` and they are ordinary content —
edit the ranges, add your own.

**Parties · Characters · Glossary** — plain forms. You name the
constituencies, the parties, the currents, the people. Party seat totals sum as
you type; the chamber total and majority update in the validation panel.

**Branches** — the event graph. Three columns (prologue, weighted pool, queued
only) with edges for what queues what, what a flag unlocks, and what a flag
blocks. Click any node to jump to editing it.

### Validation

The right-hand panel runs continuously: duplicate ids, unknown verbs or
conditions, choices with no effects, events queueing something that doesn't
exist, events queued but not marked `queuedOnly`, glossary terms with no
introducing event, and the one-concept-cluster-per-event rule. Chamber
arithmetic is shown at the bottom so you notice immediately if seat edits have
broken the majority.

### Adding a new effect verb

1. Implement it in `EFFECTS` in `js/engine.js`.
2. Describe it in `effects` in `js/schema.js`.

The editor gains a form for it with no further work. That two-step is the whole
extension story, and it is why the vocabulary should stay small.

### Renaming an id

**Never edit an id in the text field.** Ids are referenced from a dozen places —
bill stances and owners, effect and condition keys, functional `held` blocks,
`party_leans`, setup arrays, Concordance links and see-alsos — and most of those
fail *silently*. A stance keyed to a party that no longer exists falls through to
axis inference and the division quietly comes out different.

Use **rename…** next to the Id field. It finds every reference, shows you the
count and the first dozen sites, and rewrites them together. `node
tools/renametest.js` proves it: rename all 54 entities, play 40 sittings, and
confirm the trace, scalars, ledger, loyalties and divisions are identical.

Strings that merely *look* like the id — a `material_interest` tag that shares a
word with a bill — are listed separately and never rewritten, because a tag
meaning "this sector cares about substrate insurance" is not a reference to the
bill of that name.

### Undo and filter

**Undo** snapshots before every new, duplicate, delete and rename. Forty deep.

**Filter** searches ids, names, and the whole serialised entry, so you can find
an event by a phrase in its body. Irrelevant at 11 events, essential at 200.

### What to do next

The third panel runs a coverage analysis over the actual content and returns
prioritised, actionable findings rather than metrics. It exists to catch one
failure in particular: **content clustering on crisis.** If every event fires
when an indicator is low and none fires when it is high, the player who manages
well finds the game goes quiet, and reads that as a bug.

It also tracks thin chapters, chapters with no opening, choices with no effects,
one-choice events, stations and parties that never appear, bills with no owner,
glossary terms never taught, and missing art. The verdict line at the top names
the current milestone — skeleton, one chapter, gaps, building.

### Drafts and the export trap

The editor holds everything in memory. A **draft is written to this browser**
every second or so, and offered back when you reopen the page, so a closed tab
no longer loses a session. **Discard draft & reload** throws it away and reloads
from disk.

But the draft is not the game. Only exported files reach it:

Edit → **Export all content files** → move them from **Downloads** into
`content/` → reload `index.html`.

The status bar shows **UNEXPORTED CHANGES** until you export, and the browser
warns before you close with unsaved work. Use **Preview file** to see exactly
what will be written. Keep `content/` in git and the exports diff cleanly.

### Images, without the command line

The **Images** tab processes any image into the game's palettes in the browser.
No ImageMagick, no terminal. Choose a kind, pick a file, see it in the palette,
download it, move it into the folder named on screen.

| kind | size | aspect | folder |
|---|---|---|---|
| Portrait | 160 | 4:5 | `img/portraits/` |
| Event plate | 640 | 12:5 | `img/events/` |
| Logo / mark | 64 | 1:1 | `img/logos/` |

Aspect and size are pinned because the CSS pins them too — an image that arrives
the wrong shape gets cropped again in the browser and you lose control of the
framing. The processor fill-crops rather than letterboxing or squashing.

**Two dithers, and the choice carries meaning.** *Ordered* (Bayer grid) reads as
machine output, which is right for a registry scan, an ID photo, or an emblem
from a state press. *Diffusion* (Floyd–Steinberg) reads as photographic, which is
right for a press or broadcast still. The tab defaults sensibly per kind and you
can override.

`tools/dither.sh` still exists and is better for batches. The tab is for one
image at a time, which is most of the time.

### Namelists

`content/names.js` holds pools for people, stations, consortiums, press titles
and bill titles. **Roll** buttons sit next to the name field on characters,
stations and bills.

Naming here is not neutral. Two centuries of habitation blended the founding
populations, so given and family names cross freely and a name says little about
origin — which is the point. What does carry information is the `family_earthborn`
list: **an unblended family name reads as Earth-born**, nobody says so out loud,
and everybody notices. That is §10.2's inverted nativism showing up in a name.

Station names split by era: the founding generation named habitats for people and
instruments (`station_founding`), the industrial expansion named them for what
they did (`station_industrial`). Rolling a station picks an era, so the roster
stays historically stratified without anyone tracking it.

```js
Names.person()                  // Adaeze Rasheed
Names.person({earthborn:true})  // Cosima Moreau
Names.station()                 // Wickstead Anchorage
Names.bill()                    // Shed Order (Registration) Bill
Names.roll("press")             // The Perigee Review
Names.setSeed(4711)             // deterministic — a rolled roster regenerates identically
```

## Making a division stop

A division is read out party by party in a modal dialog, and the bar can be
made to **stall at a named point** — the count halts, the segment turns red,
and the dialog says why. It fires from a flag and from nothing else; there is
no roll behind it, so a stall is always something the fiction chose:

```js
effects:[ { flag:"division_stalled" } ]
```

Set it and the next division pauses on the bell while the Clerk recounts the
functional bench. Clear it with `{unflag:"division_stalled"}` when the scene
that wanted it is over — nothing clears it for you, and a permanent stall is
just a slow game.

## Whose voice a block is in

Text arrives a character at a time, with a key-press sound pitched to the
**register** of whoever is speaking. The register comes from the speaker by
default — the press sounds like a press wire, the House sounds like a room,
the President makes no sound at all — so most blocks need nothing. Override it
on the block when the default is wrong:

```js
{ id:"...", speaker:"ceyhan", register:"broadcast", body:`...` }
```

`office` · `press` · `primer` · `broadcast` · `silent`. Use `silent` when the
text should land without a voice; it is a choice, not an absence.

## Building a decision without writing its prose

`brief` is a field on an event, a choice, a bill — anything carrying a
passage. It is **not** on the prose whitelist, so no player ever reads it.
`npm run prose` emits it as a `#` note above the passage it describes, and
`npm run prose:in` strips it on the way back.

```js
{ id:"f1_water", chapter:2, weight:60,
  brief:"A funding decision whose consequence is a month away.",
  title:"The recycling line",
  body:`placeholder`,
  ... }
```

A bare `brief` describes the node's **primary** passage — the `body` of an
event, the `result` of a choice. For any other field, name it:

```js
  briefs:{ title:"Three words. It is a line item, not a crisis.",
           label:"The cheap answer, phrased as thrift rather than neglect." },
```

That is the channel for the division of labour this project runs on: the
mechanism is built and described, the prose is written over it. The brief
lives in the repository, so it comes back every time `prose.txt` is
generated — unlike a note typed into that file, which is generated and
gitignored and lost on the next run.
