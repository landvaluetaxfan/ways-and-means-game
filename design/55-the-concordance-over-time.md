# 55 — The Concordance over time

**Built 28 September 2026.** The author asked for the Concordance to start
with a wealth of information and to update as the game goes on, with some
sign of what changed. They also asked for it to be written in-universe, to
follow in-universe changes, and to reflect the game's variables without
becoming convoluted. This replaces `briefs/concordance-over-time.md`.

## What was wrong

At the opening, on 11 April 2080, the Concordance held 317 articles and
50,000 words. Most were generated from data, and three faults ran through
them.

- **It knew the future.** The European Union "has sanctioned the
  Commonwealth", although the sanctions are months away. Kenya "opposes any
  annexation", Cordell "abandoned the Almanac Works", and the Standby
  Facility's article described "the European Union's measures against the
  Commonwealth". The Works' representatives had articles before the Works
  was stranded.
- **It spoke in game units.** "As of sitting 1", "reaches the chamber 2
  sittings after it is sent", "Delay 2 sittings", "closure 0.44". An
  encyclopedia in 2080 counts in dates and days.
- **It used the old name.** "House of Delegates" appeared in 198 articles.

## The system

An article is written on a date, by someone in 2080. Every sentence in it is
one of three kinds, and the author marks which.

| kind | mark | shown | tense | example |
|---|---|---|---|---|
| **standing** | nothing | always | present, true on 11 April 2080 | what Kenya is; the Facility's covenants |
| **history** | `since: {condition}` | from the day the condition first holds, and ever after | past, dated | "Cordell wound up the Works' operator on 5 May 2080." |
| **state** | `while: {condition}` | only while the condition holds | present | "The European lenders' commitments are suspended." |

The conditions are the ones events use (`Engine.matches`), so an author
learns one grammar. A condition may name a flag, an event seen, a bill's
stage or a scalar, so gameplay variables move the Concordance through the
same words as the story. A scalar enters as a state: "friction above 40"
becomes the sentence that says the sanctions are in force, and it goes
again when they lapse. `when` is kept as a synonym for `while`.

`since` and `while` work on:

- a **section** of any article, hand-written or generated. Generated
  articles take their sections from a `cx` list on the content entry
  (foreign powers, the foreign platform) or, for lenders, from `terms`;
- a whole **article**, and a **character** (`since` on the entry). The
  article does not exist until the world knows its subject;
- a **banner**, as `{ id, since }` or `{ id, while }`: an article is marked
  as contested only once there is a dispute.

**History is dated by the engine.** At the end of every sitting,
`Engine.noteSince` records the sitting on which each `since` condition first
held (`st.since`, in the save). A history section prints that date, and it
stays even if the condition later lapses, because what happened has
happened. `content/index.js` collects the conditions into `C.sinceConds`,
so the engine reads a list and names nothing.

**The change is the edit history.** A wiki already has an in-world device
for change: its revision record. An article's footer lists its dated
revisions ("Revised 1 June 2080: Accession of the Almanac Works"). An
article revised since the player last read it is marked in the navigation,
and its new sections are highlighted briefly when it opens. The record of
what has been read is `st.cxRead`, in the save. Scalar states come and go
and are not revisions; history is.

**Figures carry dates, never sittings.** The generators print "As of 6 May
2080". Delays are in days ("news from Brussels arrives about five days
after the event"), computed from the calendar.

## The rules for writing

1. Standing text must be true on the opening day, before anything the
   player does or the story brings.
2. Everything later is a `since` section, written in the past tense with
   the fact's cause, as the news register would give it.
3. A state that can reverse is a `while` section, written in the present
   tense.
4. No game units: no sittings, meters, scores or axes. The figure it models
   is said as the thing: a date, a count of days, dollars, people.
5. The Concordance knows what the world knows: what Commonwealth readers
   could know that day. It knows the Standby Facility's expropriation
   clause, which was published in 2078. It does not know that the clause
   will be triggered.

## The follow-ups (done the same day)

- **History for parties and persons.** The engine's log entries about a
  party or a person carry who they are `about` and `cx`, a clause in the
  Concordance's register: an appointment, a resignation or dismissal, a
  partner walking out of or returning to the government, a member crossing
  the floor, the leadership ballot and the general election. Party and
  person articles gain an "In this Parliament" section of those entries,
  dated, which counts as a revision. A person's offices are now read from
  the save's cabinet, so a dismissed minister no longer holds the post in
  the article.
- **The generated articles.** Party articles give their seats once, say
  what a whipped vote does instead of printing loyalty out of 100, and
  describe each current as loyal, restive or at odds with the leadership.
  Station articles read closure as a share of the material cycle and set
  the dependency and grievance as a profile. District articles lost the
  closing line that repeated the lead and the infobox, and an internal id
  that the edit note printed. Small counts are in words, and a party's name
  takes its article ("The Liberal Party", "Home Rule").
- **The hand-written articles**, read against PROSE.md's Reference rules.
  Paired contrasts and metaphors were rewritten. The Cabinet article cited a
  division on the threshold that the player may not have held; the example
  is gone. Volume leases now state option C's tenure (design/54), and the
  Perigee Charter is dated 2064.

## Still to do

- Other histories the chronicle could carry: bills a member sponsored,
  a station's shed order or a change to its closure.
