# 45 — The prose does not explain

26 Sep 2026. Asked for before the Concordance is redone. The author gave
three examples and one comparison:

> "Outgoings exceed receipts. The gap is met from the reserve every day,
> whether or not anybody votes on it. The Commonwealth owes nothing.
> Everything it holds is its own, which is a stronger position at a
> negotiation than it looks on a ledger. [...]" The player is thrown all
> this explanation and yet, what do they actually get from it? [...] Think,
> a financial writer, would they write like this to explain the situation?

> "A works station built by the Bellamy concern and absorbed by Cordell,
> which kept the name because the name is the brand." Minor, but noticeably
> falls into an unwanted pattern.

> "The elevator [...] was established by international treaty, whose title
> is its formal name." It isn't clear to the reader that it's referring to
> the elevator as "it", and what exactly it means by formal name.

> Overall a lot of the written stuff in the Foreign Affairs tab is
> noticeably and significantly better.

## The verdict

**Yes, there is a wider issue, and it isn't a matter of tone.** A large
share of the Reference and Interface prose is written for a reader who
already knows the world. It points at facts instead of stating them. It
characterises an institution with an epigram instead of describing it. It
gives a verdict ("the reserve is deep enough") without the figure behind
it, or a figure ("discipline 29") without saying what the figure means.
The recently written Foreign Affairs prose (the anchor-host notes, the
forums, the resolutions, the Security Council) does the opposite, which is
why it reads better: it says what a thing is, gives the figures and the
dates, and says what happens next.

Two of the causes are structural, not stylistic:

- **The Underwriters' outlook cannot say a number.** It is 27 fixed
  sentences, chosen by thresholds (`Engine.outlook`), so "Outgoings exceed
  receipts" is printed for a gap of CW$40m and for one of CW$40bn alike. No
  rewording fixes that. The engine has to supply the figures, as
  `Engine.seatText` already does for the constituencies.
- **Several generated Concordance articles have nothing to say.** The
  Prime Minister's own article is two sentences of prose ("As of sitting
  1, they serve as Prime Minister"), although bible §3.8 carries a career.
  The glossary articles are one-line fragments ("Voter ID, for a world
  where copies are cheap").

**And design/42 was wrong about this.** It said "the weakness is not the
sentences" and that the Reference prose "reads cleanly". That pass checked
whether the prose agreed with the game, not whether it explained anything.
The register passes before it removed habits and added no substance. All
three of the author's examples are in text those passes approved.

## Four faults

### 1. The epigram where the explanation should be

The sentence is shaped to sound knowing instead of carrying a fact:
chiasmus, tautology, paradox, personification, or a closing twist.

| passage | the device | what the reader needed |
|---|---|---|
| "which kept the name because the name is the brand" | tautology | what the station is and makes |
| "It does not hurry, because it cannot lose, and it does not threaten, because it does not have to." (the anchor company) | paired negation | what it owns, what it charges, what it can do to the government |
| "It does not campaign, because the numbers do." (the Underwriters) | a twist on a known phrase | what it insures, what it has lent, how its rating moves the rate |
| "Its politics is a schedule and a cold chain." (the consumables consortium) | metaphor as definition | what it supplies, to whom, and what stopping would cost |
| "It cannot be whipped, it is not elected, and it remembers." (the Tribunal) | tricolon and personification | what it rules on and how its disposition is read |
| "It does not vote. It decides what the wire prints." (tooltip, standing) | paradox | what standing changes: the count, and which events fire |
| "The margin improves because the standard was the margin." (rung 7) | chiasmus | how many points of margin, and what lowering the grade risks |
| "Whoever produces the number will have to live with it." (an initiative) | closing twist | what the review costs and what it changes |

The guide already forbids all of this ("no aphorism, no sign-off", "no
metaphor, no personification"). It persists because none of the scanner's
patterns match these shapes.

### 2. Pointing at a fact instead of stating it

The writer has the fact in mind and writes a sentence that refers to it.

- "established by international treaty, whose title is its formal name":
  the name is International Earth-Orbit Elevator, and the sentence makes
  the reader find it three clauses back and resolve "whose" and "its".
- "kept the name": which name? The station is the *Bellamy* Almanac Works,
  and the reader has to know that.
- "Whether it should come in [...] is the question the session is for."
- "In 2080 the Treasurer's remit raised the target above two per cent":
  to what?
- "The threshold stands where it stood, and the schedule is not reopened"
  (a settlement's summary): which threshold, and which schedule?
- "The Bench that hears what the orders do" (the Tribunal's tooltip): it
  hears challenges to statutory instruments.

### 3. A figure without its meaning, or a verdict without its figure

- The outlook throughout: "deep enough", "small enough to service",
  "close to where they opened", "inside a point of the target".
- The generated party article: "its discipline is recorded at 48";
  "Trades Left, 32 members at a discipline of 29". Nothing says it is out
  of 100, or that 29 means about 82 of every 100 members vote with the
  whip. The screen also calls this number **loyalty**, so the article has
  given one quantity a second name (the Interface rule "use the words on
  the screen").
- The party article's position: "economic: strongly public · authority:
  liberal · personhood: restrictionist · sovereignty: federal · trade:
  closurist" is the axis shorthand PROSE_REGISTER.md says is not prose.

### 4. The stub

- **Person articles.** Fifty-five of them, generated. Flash's has a party,
  a seat and two offices. Her career (Governor of the Reserve Bank
  2071–2076, Treasurer from outside the House 2076–2080, then the
  leadership and First Spin at a by-election) is in the bible and nowhere
  in the game. The generator uses "they" for everyone. That is the right
  default while characters carry no pronoun, but it reads oddly beside the
  author's own prose, which calls Flash "she".
- **Glossary articles.** Thirty of them: one line in lower case and a
  quip. "attestation is a term of Commonwealth politics. Proof of being
  one unique person. Required to vote or to post."

## Measured

All 2,704 player-facing passages (`js/prosemap.js`, 58,130 words), plus
the 317 Concordance articles rendered as a player sees them at the
opening. Events are left out: they are Voice, where a character may speak
in epigrams. Cabinet post notes are left out too, because nothing prints
them. Two counts per surface:

- **facts**: a figure, a year, or a proper name after a sentence's first
  word, per hundred words;
- **devices**: the shapes in fault 1 (a short `because` clause,
  personification, "the X is the Y", the paired negation, "which is
  how/why", vague "somebody/nobody", antithesis, and a closing sentence of
  eight words or fewer with no fact in it), per thousand words.

| surface | words | facts /100w | devices /1000w |
|---|---:|---:|---:|
| **Foreign Affairs (the baseline)** | 1,148 | **15.7** | **0** |
| lender terms | 505 | 9.7 | 0 |
| Concordance: anchors, lenders, forums | 2,923 | 20 | 0 |
| constituencies (rewritten 26 Sep) | 11,035 | 5.6 | 0.4 |
| the Almanac Works' note and grievance | 114 | 4.4 | 35.1 |
| glossary | 224 | 1.8 | 22.3 |
| actors | 624 | 6.3 | 16.0 |
| orders (the ladder among them) | 902 | 5.7 | 15.5 |
| party organisation | 744 | 3.6 | 9.4 |
| bills' notes and the case against | 2,439 | 3.3 | 8.6 |
| tooltips | 2,462 | 4.5 | 8.1 |
| the Underwriters' outlook | 768 | 3.4 | 7.8 |
| functional seats | 806 | 10.4 | 7.4 |
| hand-written Concordance articles | 4,095 | 7.5 | 4.2 |

The counts are a map, not a verdict. A tooltip needs fewer facts than an
atlas entry. So a seeded random sample of 57 passages across eleven
Reference and Interface surfaces was also read and judged one by one:

- **33 sound**;
- **12 an epigram where the explanation should be** (fault 1);
- **7 pointing at a fact instead of stating it** (fault 2);
- **5 too thin to explain anything** (fault 4).

The faults cluster by surface. The currents, the glossary's definitions,
the hand-written articles and most tooltips were rewritten in the register
passes and are mostly sound. The actors, the orders, the bills' notes, the
functional seats' notes, the grievances, the initiatives' notes and the
settlement summaries were never rewritten.

## Why it happens

1. **§2.6 is applied where it should be reversed.** "Explanation cost is
   the real budget" is right for an event, where the player is deciding
   and every word of setting is a cost. The Concordance and the Economy
   briefing are where that cost is *meant* to be paid, so an event can stay
   short and link to them. Written under the same economy, they compress,
   and compressed prose alludes.
2. **The outlook is filed as Voice.** `tools/register.js` and
   PROSE_REGISTER.md class it with events, as "the world speaking". Its
   comment in `content/setup.js` asks for "the register of somebody who
   prices risk for a living", so it was written as a wry insider. Its job
   is to explain the economy to the player, which is analysis.
3. **Every rule in the guide is a prohibition.** Contrast, aphorism,
   ranking, jargon, metaphor: the guide says what to take out and never
   what a passage owes the reader. The register passes followed it, so
   they subtracted. The Kenya note passes every rule and still makes the
   reader work out what "its formal name" is.
4. **The writer knew the fact.** Every pointing sentence was written by
   someone holding the fact it points at. Nothing in the guide or the
   checks asks for it on the page.

## What a financial writer would write

The outlook at the opening of Flash I, with the engine's own figures
(`Engine.budget`, `Engine.macro`, `Engine.taylorRate`):

> **was**
> Outgoings exceed receipts. The gap is met from the reserve every day,
> whether or not anybody votes on it. The Commonwealth owes nothing.
> Everything it holds is its own, which is a stronger position at a
> negotiation than it looks on a ledger. The four prices are close to
> where they opened. Nothing the government has done has reached a
> household yet. Inflation is inside a point of the Reserve Bank's target.
> The Bank has no reason to surprise anybody at its next meeting, which is
> worth more to a borrower than any rate it could set.
>
> **could be**
> **The account.** The Commonwealth spends CW$224bn a year and collects
> CW$220bn, a deficit of CW$4bn, or 0.7% of output. The reserve covers it:
> at CW$52bn it would last thirteen years at this rate, so money is not
> this session's constraint. Four-fifths of spending (CW$176bn) is standing
> commitments that run without a vote. The appropriation decides the other
> CW$48bn, and the four tax rates decide the receipts.
>
> **Borrowing.** The Commonwealth owes nothing. Both standing facilities
> are signed and undrawn, so the Treasury can borrow without new
> legislation if the reserve runs down.
>
> **Prices and the Bank.** Inflation is 2.8% against a target of 2%, and
> the market expects 2.5%. The Bank's rule points to a cash rate of 4.7%
> against 4.5% today, so expect a quarter-point rise at the meeting on
> 6 May. A rise makes the Treasury's borrowing dearer and cools an economy
> running 1% above its capacity. The dollar buys US$0.84, down from parity
> in 2073, which makes everything bought from Earth dearer.

Every figure there is a placeholder the engine fills, and every sentence
says what the figure means for the player's next decision.

The three reference examples:

> **was** A works station built by the Bellamy concern and absorbed by
> Cordell, which kept the name because the name is the brand.
>
> **could be** The Bellamy Almanac Works is an industrial platform of
> 184,000 people, 97,000 of them employed, on Tether 2, whose anchor
> stands at Malindi in Kenya. It was built by the Bellamy concern, which
> Cordell later bought, keeping the Bellamy name on the station.
>
> (What the Works *produces* is not in canon. The old sentence spent its
> clause on where the name came from, in the one place a reader needed to
> be told what the station is for. That fact is the author's to supply.)

> **was** The elevator serves Anchorage and the Bellamy Almanac Works, and
> was established by international treaty, whose title is its formal name.
>
> **could be** The elevator serves Anchorage and the Bellamy Almanac Works.
> Its formal name, the International Earth-Orbit Elevator, is the title of
> the treaty that established it.

> **was** (the Underwriters, an actor) Prices the risk that a person stops
> running, and holds the only complete numbers in the Commonwealth. It does
> not campaign, because the numbers do.
>
> **could be** The Circumterrestrial Underwriters is the insurance market
> of the Commonwealth: the syndicates and mutuals on the Bourse that insure
> habitats, stations and substrate against failure. Because it insures
> against a person ceasing to run, it holds the most complete figures on
> margins, suspensions and default of any body in the Commonwealth. Seven
> of its members have committed CW$36bn to the Treasury through the
> Commonwealth Reserve Notes, whose coupon rises as the federal thermal
> margin falls. It asks that substrate risk pricing not be capped by
> statute.

And a generated figure:

> **was** Trades Left, 32 members at a discipline of 29.
>
> **could be** The Trades Left has 32 members, and its loyalty to the
> party leadership stands at 29 of 100: on a whipped vote about 82 of every
> 100 of its members vote with the party.

## What would change

Proposed, for the author to take, change or refuse:

1. **Positive rules in PROSE_REGISTER.md**, for Reference and Interface:
   - **State what you refer to.** A sentence that mentions a name, a figure,
     a date or a law says it.
   - **One antecedent per pronoun.**
   - **A figure carries its scale, and a judgement carries its figure.**
   - **Say the mechanism**: what causes it, what it changes, and what the
     player can do about it.
   - **Describe an institution by what it has and does**: members, money,
     powers, record. Never by its temperament.
   - **Write for a reader who arrived from a link**, not one who has read
     everything before it.
2. **The outlook becomes Interface, with the engine's figures.** A new
   `{deficit}`-style vocabulary filled by the engine, as `seatText` fills a
   seat's `{electorate}`. The keys stay content's and the words stay the
   author's. The engine gains readings, not sentences.
3. **§2.6 gains a sentence** (it is LOCKED, so this is the author's call):
   the budget is an event's, and the Concordance and the briefings are
   where the cost is paid.
4. **Generated articles get something to say.** A person needs authored
   biography: `note` is the author's design notes and is rightly not
   printed. So this needs a new field (`bio`, say), and deciding whether to
   add one is the author's call. It would also be the place for a pronoun
   if the author wants articles to use one. Party figures would carry their
   scale and use the screen's word, *loyalty*. The axis shorthand would be
   written out as policy, and glossary articles would be definitions,
   written as sentences.
5. **A scanner that sees it.** `npm run register` gains the devices above
   and the facts-per-hundred-words report per surface. It stays
   report-only, as it is now.

## The order for the do-over

1. The rules (1 and 3 above), because every rewrite after them follows
   them.
2. The outlook, because it is printed every sitting and it needs the
   engine to supply figures.
3. The generated articles, because one change to a generator fixes every
   article it builds (fifty-five person articles, thirty glossary articles,
   twelve party articles).
4. The authored Reference: actors, orders, bills' notes and the case
   against, functional seats, party organisation, grievances, initiatives,
   settlement summaries.
5. Then the country descriptions for every clickable country, which the
   author asked for, written in the register this settles.

## Fixed in this pass

**Thirty-seven constituency articles named the wrong member.** A seat's
article read the roll's `member`, the backbencher the roll was drafted
with. Where a roster character sits for the seat, the lede and infobox
named somebody who is not in the world, and the prose under them named
the character: Anselm Proper was "held by Kofi Ashworth" and "the seat of
the Leader of the Opposition, Darren Watkins Jr." on one page. The article
now asks `Engine.seatMember`, the reader the seat's prose already uses,
and links the member to their own article. `tools/uitest.js` checks every
such seat. Reverting the fix makes it fail, naming three of them. The
roll's stale `member` stays: lint reads it as the list of names nobody may
print.

---

## Built (26–27 Sep), and what is left

The author approved every proposal above ("do whatever is best ... and so
on and so forth for everything else"). In the order built, each commit
on `claude/affectionate-cerf-htlo8t`:

1. **The rules** (`b2993e1`). PROSE_REGISTER.md, *What a passage owes the
   reader*; the outlook reclassified as a briefing; bible §2.6's reversal;
   `npm run register` reports `epigram` and a short `because`, and
   `--density` prints facts per hundred words by surface.
2. **The briefing** (`5b87158`). `Engine.briefing` fills the figures and
   `Engine.outlook` the words; one paragraph a topic; every claim checked
   against the rule it describes. Lint fails on an unknown figure.
3. **The generated articles** (`3f774ac`). People (`bio`, `pronouns`,
   `descriptor`), parties (policy wording from the schema's `says`,
   loyalty with its scale via `Engine.holdsOnWhip`, the twelve notes as
   sentences), terms (`article`). A glossary tooltip links its article
   and shows its analogy; both were silently dropped before.
4. **Actors, stations and the Works** (`14c9592`), and the Works' product
   into bible §11.1.
5. **The last scanner faults**, and the prose map learned the new fields
   (`bio`, `descriptor`, `article`, `handle`), so the prose export carries
   them and the scanner reads them. `npm run register` stands at zero
   faults.

**What is left is what only reading finds.** The scanner is at zero and
the surfaces below still carry pointing, thin or epigrammatic passages
that no pattern matches. Each was seen in the 57-passage sample or the
full reads above. Method, per surface: print it (`node tools/register.js
<prefix> --notes`, or the prose export), read each passage against the six
rules, check every claim against the content or the engine before
writing it, rewrite, then `npm run prose`, `npm run check`, `npm run
guards`, commit.

| surface | what to fix | examples |
|---|---|---|
| `instruments` (the ladder) | epigram and contrast in summaries and effect notes | rung 2 "a long weekend. In fact it is a wage cut"; rung 4 "built for exactly this and has never been spent on it"; rung 6 "The third rail is not the drawdown"; rung 8 "It suspends nobody. It takes the power to suspend"; si_2080_47 "Packing one board is a manoeuvre"; si_2080_51 "Anselm Ring notices" |
| `bills` notes and `contested` | the case against as rhetoric; clause notes that point | thermal2 "remembers the invoice"; continuity "a right to be heard is not a right to be kept"; the insurance levels |
| `functional` | notes that insinuate | fc_substrate "Six of them were incorporated in the same week"; fc_transit "Takes Kessler risk more seriously than the chamber does"; fc_consumables "Neither can leave and neither can win outright" |
| `partyOrg` | officers and bodies by quip | "That is the party, stated as an organogram"; "Four seats do not need an organogram"; "Meets fortnightly and has read everything" |
| `initiatives`, `achievements` | closing twists | commission_review "Whoever produces the number will have to live with it"; act_indemnity "worth what it is worth" |
| `settlements` summaries | pointing and fragments | restriction "The threshold stands where it stood"; f1_joint "mild voter apathy" |
| `cabinet` candidates (printed in the vacancy panel) | quips | "Inside the tent, he cannot count them"; "Knows the file, and is owed nothing" |
| `tips` | the few flagged in the sample | public_standing "It does not vote. It decides what the wire prints"; tribunal "hears what the orders do" |
| `encyclopedia` (hand-written) | pointing | reserve_bank "raised the target above two per cent" (to what?); biological_majority "because the body is equipment" |
| `js/ui.js` literals on the Economy tab | two notes in the old style | the prices note "None of these four is a market..." (it also overclaims: the prices read the margin and the reserve), and the productive-economy note "Participation answers to..." |

Then, per the author, **the general descriptions for every clickable
country**, written in this register, modelled on the anchor-host notes.
