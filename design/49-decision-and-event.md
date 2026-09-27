# 49 — A decision is the sitting's; an event arrives

**27 September 2026.** The author, answering the question design/48 asked:

> For decisions I meant only 1, what the player does on sitting. For
> "event" I mean popups that occur, either as a special outcome, from
> weighted RNG, or when a threshold is reached, that is purposefully
> visually special to indicate importance and detailed. Think the intro
> screen.

design/48 had read four kinds off each entry's choices (decision, notice,
outcome, conditional). That answered a different question: how many answers
are open. It made a one-button entry a "notice" whether or not anything had
happened. This note replaces its kinds with the author's two.

## The two words

| | what it is | how it looks | when it comes |
|---|---|---|---|
| **decision** | the sitting's business: what the player does at a sitting | the ordinary Sitting panel, with the speaker's portrait, the prose and the answer rows | one a sitting |
| **event** | something that happened | a page that takes the screen: a dateline, the title, a picture, the page's sections, then the government's answer | before the sitting's decision, without taking its place |

**The distinction is authored, not derived.** An entry is an event when it
carries `setpiece`, which is its page:

- `setpiece: true` is an event whose page is its body. The first paragraph is
  the lede and the rest is the body.
- `setpiece: { mood, art, sections }` is a page the author has written. That
  was design/31's shape, and f1_stranded already had one.

`Engine.isEvent(e)` and `SetPiece.is(e)` both read that one field, and
`test.js` holds them to agree on every entry in content.

The internal name stays `events`, for the file, the list, `nextEvent`, and
queue and `seen` references. Renaming it would touch every save, tool and
campaign file and change nothing a player or author sees. Where the author
sees a word, it is theirs: the sandbox lists **Decisions and events**, and
the editor's form has a **Kind** field.

## How an event arrives

The three triggers the author named are the three the engine already had.
What changed is that an event no longer takes the sitting's decision.

| trigger | how content says it |
|---|---|
| a special outcome | a choice, an initiative or a resolution queues it (`queue`, an initiative's `event`); it arrives when due |
| weighted RNG | `chance` is the dice, rolled once when the event first becomes eligible, from the government's seed; `weight` orders events eligible together |
| a threshold | its `when`; it arrives at the first sitting its gate holds |

**A sitting opens with its events, then the decision.** In `nextEvent`:

1. **A due event is taken off the queue ahead of a due decision** queued
   before it.
2. **In the pool, an eligible event outranks every decision**, whatever the
   weights, because an event whose gate holds is something that has
   happened. Among events, the weight and the seeded lean order them as
   before.
3. **Nothing is offered twice in one sitting** (`st.lastFired`). An event
   leaves the decision still to come, so the sitting asks again, and an
   entry that is neither `once` nor capped would otherwise answer itself
   forever.

`Engine.playSitting(st, C, pick)` plays a sitting the way a player meets it:
every event, then one decision. It returns what was met. The playtest, the
canon run, the chain probes, the round trip and the rename test use it now,
so they measure the game a player plays. The prologue and dated entries keep
their order. A decision queued or dated for a sitting is still that
sitting's decision.

## How it looks

"Think the intro screen." The introduction is a picture, an epigraph and a
page of prose at reading size. An event now reads the same way:

- **The dateline**: "Sitting 14 · Monday 6 May 2080", because an event is
  news.
- **The title**, then the **speaker's byline** where there is one.
- **A picture**: the page's art slot if the author set one; otherwise the
  event's plate; otherwise the speaker's portrait, with the registry
  silhouette standing in where none is drawn yet.
- **The page**: its sections, or its body as lede and body. It is set at the
  introduction's size (16px lede, 14.5px body). The event page used to be
  set smaller than the introduction, which made the one surface meant to
  stop the player the one they had to lean in to read.
- **Your answer**: the ordinary answer rows, headed *Your answer* rather
  than *Decision*. A one-answer event is still a row that expands to show
  what it does.
- Answered, it offers **Continue to the sitting's business**, or **Rise**
  when nothing else is before the House that day. The sitting does not
  advance.
- **The mood** (`setpiece.mood`, one of `SCHEMA.vocab.moods`, which
  `test.js` holds to the score's own list) is cued by the action that
  brought the page: Rise, Continue or Sit until there is business, and the
  sandbox's Show. It is never cued by the draw.

## What was marked

Twenty-two entries became events, plus f1_stranded. They are the thirteen
one-answer entries and seven state-picked ones that design/48 found. Each is
something that happens rather than something the government weighs:

- the writs, the count, the question closed and its aftermath;
- the no-confidence motion, the cascade and the mandate;
- the answers to initiatives: the emergency order, the leases, the fees,
  the resignation, the relays and the mission's report;
- the forwards, leases, indemnity and debt coming to term;
- the ruling, Earth's answer and the Court's opinion;
- two consequences that arrive with a choice in them: the facility is
  called, and the dollar's line is tested.

Six have a mood: a threat (the motion, the facility called), an order made,
and the tension of a verdict (the ruling, the Court, the line tested).

Two entries that design/48 called conditional stay decisions: *The case for
the facility* and *The question on the ballot*. They are proposals the
government weighs, not things that happened.

No prose was written. Every page is the body the author already approved,
except f1_stranded's, which had its own sections. `setpiece: true` makes an
event show its body as the page, until the author writes sections.

## What it moved

An event no longer takes a sitting, so every sitting that met one now also
meets a decision. A crisis run makes 62 choices instead of 54, and reach
rises from 39% to 44% of the authored set.

**Flash I's canon** still lands the debt trap and reaches the count:

| | before | after |
|---|---|---|
| the count | sitting 57, 15 August | sitting 55, 13 August |
| thermal margin | 17 | 6 |
| PSD seats | 87 | 107 |
| the government's side | 149 of 280, narrow | 171 of 280, working |
| standing | 42 | 56 |
| Treasury bills owed | CW$52.6bn | CW$33.6bn |
| inflation (core) | 5.4 (2.9) | 5.9 (3.0) |

**Across eighty seeds** (640 runs) the crisis strategies lose far less:

| strategy | reaches the count, before → after | loses, before → after |
|---|---|---|
| First option, supply first | 40 → 62 | 40 → 18 |
| First option, never climbs | 3 → 21 | 77 → 59 |
| Cheapest option | 45 → 74 | 35 → 6 |
| Costliest option | 33 → 64 | 47 → 16 |
| Last option, Cycles, Programme first, Governs not at all | unchanged within the reshuffle | |

**The game is easier because a player now meets a decision every sitting**,
and the decisions are where standing, ladder rungs and partners are won. That
is a balance question for the author, and it is left open. Two ways to answer
it without touching this rule:

- make some decisions cost more;
- give a few events a `chance` below one, so that they are rarer.

The no-confidence motion (weight 6) used to be buried under the pool and now
arrives when its gate holds. It is the clearest case of a threshold event
that the old pool never let fire.

## Found on the way

- **The set-piece screen never had a height.** Hiding the side columns set
  the grid to `display:block`, so a long page grew the panel past the window
  and the whole screen scrolled, status bar and all. f1_stranded was short
  enough to hide it. A page with a portrait and four paragraphs showed it in
  a 1366×768 laptop's browser window. The grid is a flex column now, and
  `#sitting-body` scrolls inside its panel.
- **Sit until there is business lost a queued answer.** It read `nextEvent`,
  threw the answer away, and drew the sitting, which asked again. A queued
  item is taken off the queue by the first asking, so an answer arriving
  that way never appeared. It keeps what it found now. uxtest proves it with
  a stub that gives each state its item once, and fails with the old line
  put back.
- **An entry with every answer shut left the Sitting screen with no way on.**
  It drew a heading and nothing under it. It is passed over for the sitting
  now (`Engine.passOver`), with a button that continues or rises. The loops
  that answered by testing `choose()` for a result also read an open answer
  with no `result` line as a refusal, and would have taken the next answer
  too. No choice in content lacks one today, but the editor allows it.
- **The editor's event form read the page's section bodies as the event's
  own body.** Every page section has a `body` field, and the form looked
  the body up by name. Opening f1_stranded rewrote its body with the page's
  lede. edtest's open-everything sweep caught it. The body is read by id.

## Checks

- **test.js**:
  - an event outranks every decision;
  - it does not take the sitting;
  - `playSitting` meets the events, then one decision;
  - an event that may recur comes once a sitting;
  - a queued event comes before a decision queued ahead of it;
  - an event with no answer open is passed over and the decision still
    comes, and an answer with no result line is taken once;
  - the engine and the page agree on every entry;
  - every event has a page to draw;
  - the schema's moods are the music's.

  Each engine rule was broken in turn and its test failed.
- **uitest**: the Events filter finds only events; one shown takes the
  screen, dated, headed *Your answer*; answered, it continues and not rises;
  and the decision follows on the same sitting in the ordinary panel. It was
  proved by breaking Continue. A probe event with every answer shut still
  has a way on, and the decision follows it.
- **uxtest**: Sit until there is business shows what it found.
- **edtest**: the Kind field makes a decision an event with its body as the
  page; a mood and a section make a page of its own and leave the body
  alone; back to a decision drops the page. The open-everything sweep keeps
  every event's page intact.
- **lint**: an event's mood is one the score knows and its sections are of
  a kind the page draws (proved with a bad mood). The posture rule is
  restated by competing answers (two or more open whatever the state), which
  applies to decisions and events alike.
- **`npm run layout`** measures two event pages at every shape: one with
  written sections, and one drawn from its body under a speaker.

## Superseded

- **design/48's four kinds.** `Engine.eventKind` returns `event` or
  `decision`.
- **design/31 §3's budget of one set piece a chapter.** The author's
  definition makes an event whatever happens: a special outcome, a
  threshold, a roll of the dice. Rarity is now a matter of what content
  marks, not a quota.
- **design/31 §6's "the engine stays ignorant of it".** The engine reads the
  field to know that an event does not take the sitting. The page is still
  drawn by `js/setpiece.js` alone, and the engine gained no verb.
