# Prose

How every sentence a player reads is written. This is the one home for the
rules; `design/45` and `design/51` hold the reasoning, and the verdicts at the
end hold what has been settled.

Two tools hold the rules:

- **`npm run lint`** fails an event page, a decision or a choice that breaks
  the explanation rules (`tools/pagecheck.js`).
- **`npm run register`** reports habits (contrast framing, epigrams, thin
  passages) by register. It is not in `npm run check`: a style check that
  fails a build ends up disabled, and the judgement it stands in for is the
  author's.

## The author's standard

It applies everywhere, and it was learned from the author reading real
passages.

- **The model is an in-world newspaper of record**, like the New York Times:
  straightforward, digestible, informative, and occasionally evocative.
- **Give the cause of every fact.** Explain why and how: why the help is two
  years away, how the residents asked, why the return to Earth is a medical
  programme.
- **Name every conflict** and say who did what, and how: who imposed the
  sanctions and by what means.
- **List concrete things**, not figures of speech: "cooks, trainers,
  administrative staff and middle managers", not "the people who feed, treat
  and teach them".
- **No habits of generated prose:**
  - no paired negations ("no treaty with it and no duty to it");
  - no `not X but Y`, `X rather than Y` or `X, not Y`;
  - no epigram, and no closing line that comments on what came before;
  - no vague framing.
- **The chamber is Parliament**, or the House for short. Never the House of
  Delegates.
- **Invent no canon.** No new station, character or setting term (bible
  §2.7), and dates within bible §11.1's timeline.
- **Use only pronouns the content has established** for a person. Otherwise
  use the name.

**The author's second round (28 Sep 2026).** These came from reading a
slate of examples, and apply everywhere.

- **No game numbers in the fiction.** A meter's value never appears in
  in-world prose: not "standing below 40", not "loyalty 48". Say what it is
  in the world: "polling below 40 per cent", "more of its own members are
  voting against the whips". A quantity the world measures is fine with its
  unit: the thermal margin "below 30 per cent".
- **Explain as a reporter would.** Give the mechanism in plain steps. Don't
  compress it into a paradox ("paid for twice: once in money and once in
  delay") or a figure ("three floors under the government"). Such lines
  sound simple and leave the reader to decode them.
- **A choice's note speaks to the player, subject first.** Write "By asking
  in person, you can bring five members round", not "A Prime Minister asking
  in person turns five abstentions into votes". Say what you do, who notices,
  and what it does not change. Don't stack glosses in the middle of a
  sentence ("the Trades Left, the current of your party that speaks for the
  maintenance unions, and Czarnecki's Hard Left notice"). Gloss by a short
  clause, or where the term first appears on the page. Lint counts a gloss
  once for the whole decision (body, then each choice), so gloss once, in
  the shortest form that says what the thing is: "the Trades Left, your
  party's union wing".
- **People talk like politicians and officials.** They are plain, practical
  and sometimes blunt. They give numbers and names, hedge, and use
  contractions where a speaker would. They don't speak in epigrams,
  antitheses ("I am obliged to appoint... I am not obliged to believe") or
  closing lines. Save a dramatic line for the moment that earns it: at most
  one a chapter.
- **A speaker never explains what the listener already knows.** A member
  does not define the shed order to the Prime Minister. The narration
  explains, next to the line.
- **Epigraphs speak to the story or the politics.** An epigraph chosen for
  the theatre motif alone ("All the world's a stage") says nothing.

## Registers

| register | what it is for | where it is used |
|---|---|---|
| **News** | what happened | event pages (an entry with `setpiece`) |
| **Decision** | the business before the Prime Minister, and what each answer does | a decision's body, and every choice's label, note and result |
| **Reference** | what a thing is | the Concordance; country notes; currents; parties, stations, constituencies, cabinet posts, functional seats, actors, lenders, bills' summaries, the glossary |
| **Interface** | what a control or a number does | tooltips (`js/tips.js`), refusals, initiatives' notes, awards, status lines, the sandbox |
| **Briefing** | figures and what they mean for the government | the Underwriters' outlook on the Economy tab |
| **Voice** | a person speaking | quotations in any of the above; `textbook.md`, which is Charnock's and keeps his cadence |

`tools/register.js` maps every surface to its register. Add a new surface to
it the day it is written.

## Rules for every register

- **Say what a thing is and does.** Never define a thing by what it is not.
  If a difference matters, state both facts, each positively, in their own
  sentences.
- **No ranking against a set the reader cannot see.** Not "the least
  committed of the four": say what this one thinks.
- **Use plain words for positions.** The five axes' pole names are the
  engine's shorthand, not prose:

  | axis | low end, in words | high end, in words |
  |---|---|---|
  | economic | public ownership | private ownership |
  | authority | civil liberties, limits on state power | a stronger state, firmer powers |
  | personhood | opposes extending legal personhood | supports extending legal personhood |
  | sovereignty | more self-government for the stations | a stronger federal government |
  | trade | limits on trade with Earth | open trade with Earth |

### What a passage owes the reader

1. **State what you refer to.** A name, figure, date, law or question says
   which one it is.
2. **One antecedent per pronoun.**
3. **A figure carries its scale, and a judgement carries its figure.** "A
   loyalty of 29" means nothing until the reader knows it is out of 100 and
   what 29 does. "Deep enough" is a verdict: give the number it was drawn
   from.
4. **Say the mechanism**: what causes it, what it changes, and what the
   player can do about it.
5. **Describe an institution by what it has and does**: its members, money,
   powers and record. Never by its temperament ("it does not hurry").
6. **Write for a reader who arrived from a link.** Define a thing before
   using it, or link it.

Explaining is not padding. A tooltip is still two or three sentences, and
one that needs more says where to read it.

## News: event pages

An event page is a news report, and lint fails one that does not explain
(`checkPage`):

- **A headline in `setpiece.title`** saying what happened, 14 words at most.
- **A lede of 12 to 45 words** saying what happened, to whom, and why.
- **Short sentences**: none over 40 words, and an average of 24 at most.
- **The third person.** "You" appears only inside quotations, and no
  interface word ("tab") appears at all.
- **Every name introduced where it first appears.**
  - Each name in `INTRODUCE` (`tools/pagecheck.js`) needs its gloss in the
    sentence that first uses it, or in the next one.
  - A person's first mention carries their office.
  - "Sanctions" says whose.
  - A conflict names its place.

  **Add a new company, institution or setting term to `INTRODUCE` the day a
  page names it.**

The speaker is the portrait's caption, not a byline. The story goes in
`body`, where lint reads it; `sections` add voices and documents.

## Decision: decisions and their choices

A decision is held to the same rules less the news ones (`checkDecision`):
no headline or lede, and "you" is allowed, since the player is the Prime
Minister. Glossary terms are exempt, because the game footnotes them where
they first appear.

Each choice is read in order after the body (`checkChoices`), so a name
glossed once in that reading is glossed:

- **The label** says concretely what the Prime Minister says or does. Name
  the bill, the order, the station or the person, and say what it would do.
- **The note** says what the choice does, who gains and who loses, and why,
  in at least 25 words. A label alone is a slogan the player has to decode.
- **The result** reports what happened, in the news register.

The effects panel prints the numbers, so the note gives the reasons for
them.

## Reference

The register of an encyclopedia or an atlas, modelled on a Wikipedia lead
section.

1. The first sentence defines the subject: its name, *is*, what kind of
   thing it is, and what distinguishes it. "The Trades Left is the largest
   current in the Party of Socialists and Democrats."
2. Then the facts, in this order: what it consists of, what it does or
   supports, dates and figures, its present position.
3. One fact per sentence or clause, usually fifteen to twenty-five words.
4. Be specific: a date, a figure, a place, a name.
5. Use neutral verbs: *says*, *holds*, *supports*, *opposes*. Not *insists*
   or *concedes*.
6. No metaphor and no personification.
7. Use "the only" or a superlative only when it is a checkable fact with the
   set named.

**The Concordance** has Wikipedia's furniture: a defining lead,
sentence-case headings, an infobox, See also, the third person, and plain
short sentences. Its maintenance banners are the one place for in-world
wit.

**Constituencies** take the register of an election desk.

- `description` is what the place is, then what it hosts. A detail of the
  place is welcome; new canon is not.
- `tendency` is who lives there, what they vote on, the figures, the seat's
  history and its member.

The figures and the member are placeholders, filled by `Engine.seatText`.
Lint fails a figure or a member's name written out.

| placeholder | becomes |
|---|---|
| `{electorate}` | the roll, as "26,685" |
| `{ratio}` | the apportionment ratio, as "1.11" (seats per elector against the average; above 1 is over-represented) |
| `{represented}` | "heavily over-represented", "close to parity", "moderately under-represented", and so on |
| `{member}` | the sitting member |

There have been four general elections (2064, 2068, 2072, 2076), and five
seats changed hands in 2076 (bible §8.4).

**Stations** are described at the scale of the station: what it is, how it
lives, and what it is for.

## Interface

The register of good software help.

1. **Answer three questions, in order, and stop.** What is this? What
   changes it? What can you do about it?
2. **Use the words on the screen.** A second name for the same thing makes
   two things.
3. **Use the second person** for what the player does, in the present
   tense.
4. **State rules as rules.** "Only the House can remove her" may say
   *only*.
5. **Numbers come from content**, with their units. Never type a number in
   prose that content could change.
6. **Keep it short**: two or three sentences, under sixty words.
7. **The world's lore belongs to the Concordance.** A tooltip explains the
   terminal and says where to read more.
8. **A heading's tail is a fact, an instruction, or nothing.** "6 of 6 left
   this period", "session 4", "if counted today" and "click the globe" say
   something the title does not. "Advice while there is time to act" and
   "four bases, four prices, one row each" restate the title or sell the
   panel, and are cut. This is the slogan under a label that a model adds
   by reflex (the author, 4 Oct 2026: "slop flavour text"). If the tail
   could be deleted and the reader would lose nothing, delete it. The design's
   theory ("advice is cheaper early") belongs in the design record, not on the
   screen: the screen shows the matter, and the player learns the rest by
   playing.
9. **An empty state says what will appear, not that nothing has.** "No
   minister has raised a matter" is true and teaches nothing. Say what the
   panel is for, and when it fills, in one sentence.

## Briefing: the Underwriters' outlook

`setup.outlook` in `content/setup.js`. The engine decides which readings
apply (`Engine.outlook`) and fills their figures (`Engine.briefing`); every
word is content's.

- **Lead with the figure.**
- **Then say what it means for the government**, with the date where there
  is one.
- **Then what would change it**, where the player holds the lever.
- **Two or three sentences a reading**, one paragraph per `topic`
  (`account`, `borrowing`, `prices`, `bank`).

Never restate a threshold a lender's terms own. `{lenderWhy}` and
`{earthWhy}` read them. Lint fails a figure the engine does not fill, and a
reading with no topic.

| figure | becomes |
|---|---|
| `{receipts}` `{spending}` `{outgoings}` | a year's receipts; spending; spending with interest |
| `{standing}` `{voted}` | spending outside the appropriation, and what it votes |
| `{balance}` `{balancePct}` | the deficit or surplus, unsigned, and its share of output |
| `{reserve}` `{runway}` | the reserve, and how long it lasts at the present deficit |
| `{output}` `{debt}` `{debtPct}` `{service}` | output; the debt, its share of output, a year's interest |
| `{facilities}` | what can be drawn today, each in its own money |
| `{bills}` `{headroom}` `{arrears}` | Treasury bills out, the room under their authority, payments missed |
| `{earthLender}` `{earthRate}` `{earthBase}` `{earthWhy}` | the dearest off-world lender, its rate, its base, the margins in force |
| `{pricesVs}` `{thermal}` `{substrate}` `{volume}` `{transit}` | the four prices against the opening, and each index |
| `{volumeYield}` `{volumeForgone}` | the volume levy's yield, and what the standard rate would add |
| `{inflation}` `{core}` `{expected}` `{target}` | headline, underlying, expected, and the remit |
| `{rate}` `{ruleRate}` `{bankMove}` `{meeting}` | the cash rate, what the rule asks, the move to expect, the meeting's date |
| `{directed}` `{credibility}` | a direction in force, and the Bank's credibility |
| `{fx}` `{fxOpen}` `{fxChange}` `{fxFirst}` `{fxFirstYear}` | the dollar, where it opened, the change since, and the record's first year |
| `{gap}` `{gapWords}` `{growth}` | output against capacity, and growth |

A reading about one lender, `owed_<id>`, may also name `{lender}`,
`{lenderOwed}`, `{lenderRate}`, `{lenderBase}` and `{lenderWhy}`.

## Voice

A person speaking may sound like themselves, and that includes a contrast
when the character would draw one. `npm run register` reports contrasts in
Voice as notes, never as faults. The narration around a quotation follows
its own register.

## Editing prose: the prose file

```
npm run prose        write prose.txt: every player-facing passage, by address
npm run prose:in     put an edited prose.txt back into the content files
npm run prose:check  the round trip (part of npm run check)
```

`prose.html` does the same in a browser. The importer replaces each passage
surgically and keeps every comment and effect where it was.

- **Never re-serialise a content file.** It destroys the comments, which are
  half of what this repo knows.
- **Run `npm run prose` after any hand edit to content**, or the next
  `prose:in` reverts the edit.
- A line starting `# ` inside a block is a note, and it is dropped on the
  way in.

## How the rules are tuned

1. The author marks passages, right or wrong and why.
2. The complaint becomes a checkable pattern, in `tools/pagecheck.js` or
   `tools/register.js`.
3. The check is run over everything, and its hits are read before anything
   is rewritten. A pattern that flags correct prose is a bad rule.
4. A few passages are rewritten as a calibration set and shown to the
   author.
5. Only when those read right is the rest swept.

### Settled verdicts

- **Contrast framing reads as generated prose** (24 Sep). It is a fault in
  every register except Voice, where it is a note.
- **A reference work names a thing and then uses the name.** Elegant
  variation is not a virtue here (21 Sep).
- **Currents, country notes and constituencies are Reference** (24 and 26
  Sep). Their models are the Soft Left's description and the Rookworks
  Centre constituency.
- **The outlook is a Briefing, not Voice** (26 Sep). Its readings lead with
  the engine's figures.
- **Event pages are news reports** (27 Sep), and **decisions and choices
  follow the same rules** (27 Sep).

```
npm run register                    every passage with a fault, by register
npm run register -- reference       one register
npm run register -- contrast        one habit
npm run register -- currents        one surface (an address prefix)
npm run register -- --notes         Voice notes as well as faults
npm run register -- --density       checkable facts per hundred words, by surface
```
