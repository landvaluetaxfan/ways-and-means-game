# The register

How the prose in this game is written, stated so it can be checked rather
than felt. Revised 24 September 2026 after the author read the currents'
tooltips and the World tab's country notes and said: still AI-sounding, with
the contrast and the "X vs Y", confusing in its language, not close enough
to the encyclopedic feel wanted.

The first version (21 September) applied one set of rules to every passage
in the game. That was the flaw. A country note, a tooltip and a character's
line of dialogue are three different kinds of writing, and a habit that is a
fault in one is a voice in another. So the rules are now **per register**,
each register is **tied to the surfaces that use it**, and the scanner reads
each passage against its own register.

## The three registers

| register | what it is for | where it is used |
|---|---|---|
| **Reference** | telling a reader what a thing is | the Concordance; country notes; currents; parties, stations, constituencies, cabinet posts, functional seats, actors, lenders, bills' summaries, the glossary, party organisation |
| **Interface** | telling a player what a control or number does, and what the numbers mean together | tooltips (`js/tips.js`); a refusal's reason; initiatives' notes; awards; status lines; the sandbox; **the Underwriters' outlook**, which is a briefing (below) |
| **Voice** | the world speaking | events (body, result), minutes, the introduction, wire lines, `textbook.md` |

The scanner knows which surface a passage comes from (`npm run register`
prints the register beside each hit). A new surface is added to the map in
`tools/register.js` the day it is written.

## Rules for every register

- **Say what a thing is and does.** Never define a thing by what it is not.
- **No contrast framing.** `not X but Y`, `X rather than Y`, `X, not Y`,
  `It is not X. It is Y.`, `instead of`, `unlike`, `where X, Y`. A reader
  who meets a denial has to hold two ideas to get one fact, and the
  construction is the single most recognisable tell of generated prose.
  State the fact that is true. If the difference genuinely matters, state
  both facts, each positively, in their own sentences.
- **No closing line that comments on what came before.** No aphorism, no
  sign-off, no "which is the point". End on a fact.
- **No ranking against a set the reader cannot see.** "The least committed
  of the four", "the most opposed in the party" make the reader work out
  what the four think. Say what this one thinks.
- **Plain words for positions.** The five axes are the engine's shorthand,
  and their pole names are not prose. Write the policy:

  | axis | low end, in words | high end, in words |
  |---|---|---|
  | economic | public ownership (of essential systems, of the economy) | private ownership |
  | authority | civil liberties, limits on state power | a stronger state, firmer powers |
  | personhood | opposes extending legal personhood | supports extending legal personhood |
  | sovereignty | more self-government for the stations | a stronger federal government |
  | trade | limits on trade with Earth | open trade with Earth |

  "Closed trade", "widening personhood", "for a federal Commonwealth" and
  "the station against the federation" are the shorthand leaking out.

## What a passage owes the reader

*Reference and Interface. Added 26 September 2026 (design/45).* Every rule
above is a prohibition, and a passage can obey all of them and still tell
the reader nothing: the passes that applied them removed habits and added
no information. These six say what a passage must put on the page. They
came from the author's three examples and the Foreign Affairs prose the
author singled out as better.

1. **State what you refer to.** A sentence that mentions a name, a figure, a
   date, a law or a question says which. The reader should never have to
   look back three clauses, or already know.

   > was: established by international treaty, whose title is its formal name.
   >
   > now: Its formal name, the International Earth-Orbit Elevator, is the
   > title of the treaty that established it.

2. **One antecedent per pronoun.** If *it* could be either of two things,
   name the thing.
3. **A figure carries its scale, and a judgement carries its figure.** "A
   loyalty of 29" says nothing until the reader knows it is out of 100 and
   what 29 does. "Deep enough", "small", "close to where they opened" are
   verdicts, and the reader needs the number the verdict was drawn from.

   > was: Trades Left, 32 members at a discipline of 29.
   >
   > now: The Trades Left has 32 members, and its loyalty to the party
   > leadership stands at 29 of 100: on a whipped vote about 82 of every 100
   > vote with the party.

4. **Say the mechanism.** What causes it, what it changes, and what the
   player can do about it, in the game's terms. A consequence without its
   cause is a mood.
5. **Describe an institution by what it has and does**: its members, its
   money, its powers, its record, what it wants. Never by its temperament
   ("it does not hurry", "it remembers", "its politics is a schedule").
6. **Write for a reader who arrived from a link.** A Concordance article, a
   tooltip or a briefing is often the first thing a player has read on the
   subject. Define the thing before using it, or link it.

**Explaining is not padding.** The Interface limits stand: a tooltip is
still two or three sentences, and one that needs more says where to read
it. An explanation that grows long has usually found a second subject,
which belongs in its own article.

**The epigram is the habit this replaces.** A sentence shaped to sound
knowing (a tautology, a chiasmus, a paradox, a paired negation, a closing
twist) is almost always standing where a fact should be. The scanner
reports the shapes as `epigram` and the thin passages as `thin`.

## Reference

The register of an encyclopedia or an atlas. The model is a Wikipedia lead
section: it defines its subject in the first sentence and then gives facts
in the order a reader needs them.

1. **The first sentence defines the subject.** Its name, then *is* or
   *are*, then what kind of thing it is, then the fact that distinguishes
   it. "The Trades Left is the largest current in the Party of Socialists
   and Democrats."
2. **Then the facts, in this order**: what it consists of, what it does or
   supports, dates and figures, its present position.
3. **One fact per sentence, or per clause.** Fifteen to twenty-five words is
   the usual sentence.
4. **Specific over general.** A date, a figure, a place, a name. "Since the
   1950s", not "for generations".
5. **Neutral verbs.** *Says*, *states*, *holds*, *supports*, *opposes*. Not
   *insists*, *admits*, *concedes*, *claims*.
6. **No metaphor, no personification.** A tether stands on a site; it does
   not bear a grievance.
7. **"The only" and superlatives only when they are a checkable fact with
   the set named**, and then stated flatly: "It is the one inland anchor in
   the dozen." Never as the hook of a sentence.

**The constituency and station descriptions are Reference** in the style of
an election desk: the roll and the ratio, the interests, the lean, one
specific observation.

**A model**, the current the author flagged:

> was: The leadership's current. For public ownership and a federal
> Commonwealth, against widening personhood, and the least committed of the
> four to closing the Commonwealth to trade.
>
> now: The Soft Left is the current of the party leadership, and includes
> Imre Whitlam, the Leader of the House. It supports public ownership and a
> strong federal government, and it opposes extending legal personhood. It
> favours only modest limits on trade with Earth.

## Interface

The register of good software help: descriptive, straightforward, and
impossible to misread. A tooltip is read by a player in the middle of doing
something, who wants one answer.

1. **Answer three questions, in this order, and stop.** What is this? What
   changes it? What can you do about it? Leave out any that do not apply.
2. **Use the words on the screen.** If the label says *Slots*, the tooltip
   says *slots*. A tooltip that introduces a second name for the same thing
   has made two things.
3. **Second person for what the player does**, present tense: "You can
   dismiss a minister from your own party."
4. **Rules are stated as rules.** "Only the House can remove her" is a rule,
   and a rule may say *only*. What is banned is the contrast used as a hook.
5. **Numbers come from content, with their units**: never a literal in the
   prose that content could change.
6. **Short.** Most tooltips are two or three sentences and under sixty words.
7. **The world's lore belongs to the Concordance.** A tooltip explains the
   terminal and says where to read more.

**A model**:

> was: The factions inside a party, with how many members each carries and
> how loyal each is to its leadership. A party's own row is an average of
> these; a division is not.
>
> now: The organised factions inside a party. The triangle opens a party's
> row to list its currents, with the number of members in each and their
> loyalty to the party leadership. The party's loyalty is the average of its
> currents', weighted by size.

### Briefings

The Underwriters' outlook on the Economy tab is a **briefing**: the
register of a good financial column or a central bank's statement. It was
filed as Voice until 26 September, which licensed a wry insider ("which is
worth more to a borrower than any rate it could set") and no figures at
all, because its readings were fixed sentences.

1. **Every reading leads with the figure**, filled by the engine (`{deficit}`,
   `{reserve}`, `{rate}`: CONTENT_GUIDE.md lists them), never typed.
2. **Then what it means for the government**, in the next sitting or the
   next meeting of the Bank, with the date where there is one.
3. **Then what would change it**, where the player holds the lever.
4. **Two or three sentences a reading**, grouped by subject (the account,
   borrowing, prices, the Bank and the dollar), so the panel reads as one
   briefing.

> was: Outgoings exceed receipts. The gap is met from the reserve every
> day, whether or not anybody votes on it.
>
> now: The Commonwealth spends CW$224bn a year and collects CW$220bn, a
> deficit of CW$4bn or 0.7% of output. The reserve of CW$52bn would cover it
> for about thirteen years at this rate, so money is not this session's
> constraint.

## Voice

Events, minutes and the introduction are the world speaking, and they are
the author's to write. The narration around a scene follows the common
rules above. **A character speaking may sound like themselves**, and that
includes a contrast when the character would draw one; the scanner reports
contrasts in Voice as a note, never as a fault. `textbook.md` is Charnock's
and keeps his cadence.

## How the register is tuned

The rules above came from the author reading real passages and saying what
was wrong with them. That is the method, and it is repeatable:

1. **The author marks passages.** Right, or wrong and why, in a sentence.
2. **The complaint is turned into a checkable pattern** in
   `tools/register.js`, with the register or registers it applies to.
3. **The scanner is run over every passage.** The hits are read before
   anything is rewritten, because a pattern that flags correct prose is a
   bad rule (four of the first seven were, and were deleted).
4. **A handful are rewritten as a calibration set** and shown to the
   author. Only when those read right is the rest of that register swept.
5. **The verdicts are recorded here**, so the next pass does not re-argue
   them.

## Verdicts

- **21 Sep.** The empty explanatory tail, the vague quantity and the
  em-dash sandwich are faults everywhere. Elegant variation was deleted as a
  rule: a reference work names a thing and then uses the name.
- **22 Sep.** Eleven corrective pairs read; five rewritten and six kept as
  informative denials.
- **24 Sep.** **Superseded.** The author finds contrast framing
  AI-sounding as a class, including the "rather than" that the 21 Sep pass
  defended in four constituency notes, and the six kept pairs. Contrast is
  now a fault in Reference and Interface and a note in Voice. The six pairs
  kept on 22 Sep are Voice (two events, a minute) or Reference (the Prime
  Minister's article, the European Union's note) and are to be read again
  under this rule; the Voice ones may stay.
- **24 Sep.** Currents are Reference. Their descriptions were lists of axis
  poles ("for closed trade, and against widening personhood") with rankings
  against the rest of the party; all nineteen are rewritten as the first
  calibration set.
- **24 Sep.** Country notes are Reference, in an atlas's register. All
  twelve rewritten: the place, the anchor, the economy, the dates. What a
  country has to do with the crisis is a separate note, shown once the
  story has raised it.
- **24 Sep.** The calibration set was accepted (the Soft Left, the
  instrument and currents tooltips, Gabon), and the author asked for the
  rest of the register to be swept. The fifty remaining Reference contrasts
  were rewritten: constituency tendencies, the Concordance, actors, the
  glossary, functional franchises, party organisation. Each now states the
  fact that is true and drops the thing it was set against; where the
  dropped half carried information, the rewrite says it positively ("each
  vote weighted by the voter's share of tether capacity", "the division
  list is the only record of it"). Reference and Interface stand at zero
  faults. Voice keeps its contrasts as notes, as decided.

- **26 Sep.** The author gave a model for the constituencies ("The centre of
  the Rookworks district, and a commercial hub. Rookworks Centre hosts the
  berth offices that work the Anselm locks.") and asked for all of them in
  that register, with occasional worldbuilding. All 141 are rewritten:
  description as what the place is and what it hosts; tendency as who lives
  there, what they vote on, the figures, the seat's history and its member.
  The figures and the member are placeholders now (CONTENT_GUIDE.md), and the
  formula every description ended on ("The recorded interests are X and Y",
  128 of 141) is gone, since the dossier prints the interests beside it.

- **26 Sep.** **The prose did not explain** (design/45). The author's
  three examples (the outlook, the Bellamy line, the Kenya note) were one
  fault: prose written for a reader who already knows. It pointed at facts,
  put an epigram where the explanation should be, and gave verdicts without
  figures. The Foreign Affairs prose did not, and the author said it read
  better: it carried 15.7 checkable facts per hundred words against 3 to 6
  on the surfaces never rewritten. The six rules in *What a passage owes
  the reader* were added. The outlook became a briefing with the engine's
  figures, and the Reference and Interface surfaces were swept against the
  new rules.

## Using it

```
npm run register                    every passage with a fault, by register
npm run register -- reference       one register
npm run register -- contrast        one habit
npm run register -- currents        one surface (an address prefix)
npm run register -- --notes         the Voice notes as well as the faults
npm run register -- --density       checkable facts per hundred words, by surface
```

It reports and never rewrites. It is not in `npm run check`: a style check
that fails a build turns into a style check that gets disabled, and the
judgement it stands in for is the author's.
