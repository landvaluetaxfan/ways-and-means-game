# 43 — The General Assembly, and a Foreign Affairs tab

26 Sep 2026. The author's proposal, taken up from design/42's open question
about "UN/Orbital Joint Mandate", the one place the United Nations appeared
in canon.

## Decided by the author

1. **The United Nations, by name.** It exists in 2080 and it is the UN.
2. **The Commonwealth is a full member**, with a vote, the right to table,
   and diplomatic power and standing to use.
3. **The European Union is a caucus, and its members keep their votes.** The
   Union agrees a line and its twenty-seven states vote on it, each with its
   own seat; they do not trade twenty-seven votes for one.
4. **Whether Flash I's endings go through the Assembly** was left to Claude,
   and the answer is yes for the two shaped like it (below).

## What it is in play

The House is where the government whips. The General Assembly is where it
asks. The same arithmetic runs the other way round: the Commonwealth has one
vote among 194, and the rest belong to states and blocs it can court and
cannot command.

### The forum

A **forum** is content (`content/forums.js`): members, a schedule, a rule for
carrying. The engine names no forum, and the General Assembly is the first
one written; a court, a treaty conference or a second assembly would use the
same machinery.

- **Members** are states or blocs, each with a number of votes, a position on
  the forum's axes, a **standing** toward the Commonwealth and, for a bloc, a
  **cohesion**: the share of its votes that follow its line. The rest abstain.
  This is the House's party-and-loyalty model in small, and it is how the
  Union's twenty-seven keep their votes: a caucus of 27 with a cohesion of
  0.8 casts about 22 votes on its line.
- **A member with an actor** (the Union, Kenya) reads and moves that actor's
  standing, so the powers panel and the Assembly agree.
- **It sits on dates**, like the Reserve Bank's meetings: `firstAfter` days
  from the campaign's opening, then every `every` days. Every resolution on
  the agenda is voted at the next sitting.
- **Carrying**: a majority of those present and voting, or two thirds for an
  important question. Abstentions count for nothing, as in the real Assembly.

### How a member votes

Deterministic, and printed as the mission's count before the sitting:

    score = projection of the member's position onto the resolution's
          + the Commonwealth's direction x (standing - 50) / 50 x weight
          + the Commonwealth's direction x the forum's climate

The **projection** (the member's conviction along the resolution's
direction) is used rather than the House's cosine, because a bloc with weak
views should abstain and the cosine gives a faint position full strength.
**Direction** is +1 when the Commonwealth votes for, -1 against, 0 when it
abstains. The **climate** is content's: the General Assembly reads diplomatic
friction, so a Commonwealth in a quarrel with Earth finds every vote harder.
A score beyond +/-0.15 is a line for or against; inside it, the member
abstains.

### What the government can do

- **Table** a resolution the Commonwealth sponsors, once its `when` holds.
- **Vote** the Commonwealth's seat: for, against or abstain, on anything on
  the agenda it did not table.
- **Work the floor**: an initiative whose tempos spend something real (anchor
  fees remitted to the host states, compute at cost to the developing blocs,
  a public campaign) to raise members' standing before a sitting.

### The vocabulary

One effect verb and one condition, so EFFECTS stays near twenty:

- `{resolution:{<id>:"table" | "withdraw" | "for" | "against" | "abstain"}}`
- `{move:{"member.<id>": n}}`, the member's standing
- `resolutionIs:{<id>: "draft" | "tabled" | "adopted" | "rejected" | "withdrawn"}`

## Flash I's four resolutions

| resolution | sponsor | opens | if adopted |
|---|---|---|---|
| Self-determination of the residents of the Almanac Works | the Commonwealth | the referendum recognised | legitimacy +5, friction −4; rejected, legitimacy −4, friction +3 |
| Measures concerning the Almanac Works | the Union, tabled by the move to annex | | legitimacy −3; rejected, legitimacy +3, friction −2 |
| A request for the International Court's opinion on salvage in orbit | the Commonwealth | the Annexation Act assented | the Court answers four sittings later |
| A United Nations administration of the Almanac Works (two thirds) | the Commonwealth | the referendum recognised and the line held | the joint mandate, friction −6 |

How each reaches the player:

- **The Union tables its measures in the dilemma's own choice.** "Move to
  annex" puts them on the agenda for the Assembly's next sitting and queues
  *The Union's resolution* for the sitting after: the government's reply
  (vote against and leave it, work the floor at CW$2.5bn, or answer with the
  self-determination resolution).
- **The mission's cable** (*One vote in a hundred and ninety-four*) is queued
  two sittings after the referendum is recognised, before the dilemma, since
  one way out of the dilemma runs through the Assembly.
- **The World Court's question is an answer to the bondholders' notice**, not
  an event: *Dispute it, and ask the General Assembly to ask the World Court*
  is the notice's fourth choice.
- **Kenya's proposal** is queued the sitting after the government holds the
  line, and tables the administration.
- Any of the Commonwealth's three may also be tabled from the Foreign
  Affairs tab once its gate holds.

**Two endings now go through the Assembly.** The Maritime Charter needs the
Court's opinion for the salvage ("international courts recognise salvage
rights"), and the Joint Mandate needs the administration adopted ("a
co-administered international free trade zone"). The canon, the debt trap,
does not touch the Assembly and is unchanged; the Critical Triumph and the
Corporate Re-Entry are unchanged too.

The Assembly sits every third Tuesday from 11 June 2080 (`firstAfter: 61`),
four times in a run: after the dilemma, twice while the House sits, and once
in the campaign. A Tuesday is a sitting day of the House, so the count and
the House's business land on the same square of the calendar.

## Measured, 26 Sep 2026

Four things the first draft got wrong, each found by running the canon and
the playtest rather than by reading.

1. **Friction is the wrong consequence for the Union's call.** At +8 the
   canon cascaded at sitting 47. Friction feeds the thermal drain, so any
   friction step in an annexing run tips the playtest's supply-first
   strategies: +2 cascaded Costliest and +3 did not, which is a knife edge,
   not a consequence. The call asks members to *keep* measures the Union
   already has, so it does not escalate the quarrel. What it costs is the
   world's belief in the Commonwealth, and legitimacy alone is stable from −1
   to −4 across every strategy.
2. **The chapter-two pool is saturated.** It takes the heaviest eligible
   event from about twenty (median weight 70). At 78–85 the Assembly's events
   took the emergency loan's and the anchor state's sittings and moved every
   strategy; at 50–60 they fired in one run of 120. So they are queued by the
   choice that makes them true, as the Flash I chain is.
3. **A queued sitting still displaces something.** The Court's question,
   queued the day after the Act, took the canon's thermal margin from 8 to 1
   at any delay from one to six sittings, and back to 8 at eight: it moved
   `reserve_low` from sitting 27 to 38 and reordered the Reserve Bank's
   events. That is luck, so the question became the notice's fourth answer
   and spends no sitting at all.
4. **The Assembly sat on Saturdays.** `firstAfter: 58` fell on a Saturday
   and every three weeks keeps the weekday. Tuesday is a sitting day.

The canon after all four: the count at sitting 56 with the thermal margin at
9, the PSD on 87 and the government's side on 149 of 280 at standing 42,
CW$44.8bn in bills and inflation 5.7. Before the Assembly: sitting 57, margin
8, 87 and 149 at 42, CW$44.9bn, 5.8. The Union's measures are adopted in the
canon (11 June, about 60 to 52 with 82 abstaining) and cost it three points
of legitimacy it can spare.

The playtest's outcomes are the baseline's: First option and First option,
never climbs cascade; Last, Cycles, Cheapest and Costliest reach the count;
Programme first and Answers lose supply. Costliest's crisis result moved from
the debt trap at 31 to the question left open at 44, since the three points
keep its legitimacy under the tier's line of 65.

## The members

194 votes: the Commonwealth; the European Union's 27; the eleven other anchor
hosts one by one (France holds Tether 4 and sits in the Union's caucus); and
the rest of the world as the UN's five regional groups, less the states
already drawn out. The positions are on two axes the Assembly declares:

| axis | -1 | +1 |
|---|---|---|
| `orbital` | Earth's jurisdiction over orbit | self-determination for orbital polities |
| `creditors` | rescue before repayment | creditors' rights |

Each member's position, standing and cohesion is in `content/forums.js` with
a line saying why. Gabon, whose sovereign fund owns Cordell, opens hostile;
Kiribati and São Tomé, whose revenue is the Commonwealth's lease, open
friendly; the African Group leans toward self-determination and debt relief;
the Western European and Others Group leans toward creditors.

## Deferred

- **The Security Council.** Sanctions and administrations are the Council's
  in the real UN. Modelling it means naming its permanent members in 2080,
  which is the author's canon to write. The Assembly is written so a Council
  could be a second forum with a veto rule.
- **Emergency special sessions**, which would let the government call a
  sitting. A later lever.

## The tab

**World becomes Foreign Affairs.** The globe stays; the powers stay, ordered
by delay; the General Assembly gets its own panel (the next sitting, the
agenda with each resolution's count drawn like a division, the Commonwealth's
vote, and Table where a resolution can be tabled); and the selection window
shows a resolution's member-by-member count when one is selected.
