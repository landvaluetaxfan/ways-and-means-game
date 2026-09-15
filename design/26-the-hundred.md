# 26 — THE HUNDRED

**15 September 2026.** A hundred things the game could add or change, written
for picking from rather than for building. Nothing here is decided and nothing
here is ordered by merit; the point is coverage, so that what gets built is
chosen against the field rather than against whatever was thought of last.

**Reading the marks.** `E` is engine (Claude), `C` is content (opencode), `B`
is a bible or design decision that must be made before either can start. A `£`
is expensive — a week, not an afternoon. A `!` is something I think is load-
bearing and would argue for.

Two constraints to hold while reading. **The effects vocabulary is at 21 verbs
against §15.5's line of twenty**, so anything below needing a new verb is
paying a real price; most of these deliberately need a *condition* or a
*reader* instead, which are not capped. And **§7.6 is LOCKED** — shallow
simulation, deep consequence — so an idea that needs the player to open a
second window is wrong however good it sounds.

---

## THE VERDICTS — 15 September 2026

The author went through all hundred in one pass. The dispositions are marked
inline: **`IN`** build it, **`OUT`** decided against, **`?`** undecided,
**`IN·watch`** wanted but flagged as a feature-bloat risk, **`IN·mod`** wanted
with a stated change to what is written above.

**Ninety-six in, one out, one undecided, three on watch.** That is not a triage
result, it is an endorsement of the field, and it means the constraint from here
is capacity and ordering rather than selection. `design/27` carries the four
threads the pass opened up, each of which is bigger than the idea that prompted
it.

| | |
|---|---|
| **`OUT` 8** | **No second chamber. The legislature is unicameral.** Now canon — see bible §3. This kills nothing else on the list; it settles a question that was open. |
| **`?` 3** | Guillotine and closure. Held. |
| **`IN·watch` 9, 16, 27** | Urgent questions, the payroll vote, procurement. All three wanted, all three flagged. 9 survives the flag on the author's own reasoning — *"gives the opposition some teeth"* — which is the strongest argument available for any of them, because the opposition currently has none. |
| **`IN·mod` 4** | The casting vote is **the Speaker's**. The Chair is already a property of the seat (`speaker:true` in `content/characters.js`) rather than of a person, so the engine has somewhere to put it. |
| **`IN·mod` 15** | Independents get a **wide range of opinion**, and an IND bloc modelled on the Australian teals — independents who are not a party, do not whip, and vote together anyway. |
| **`IN·mod` 17** | Deselection becomes **preselection**, placed before the mid-game election, where it demonstrates public opinion moving into the second term. |

---

## I. PROCEDURE AND THE CHAMBER

1. `IN` **`E!` Amendments that are read.** Every bill carries an amendments field
   and the engine has never once read it. The cheapest real procedure in the
   project: an amendment is a bill's stance table edited in exchange for votes.
2. `IN` **`E!` Supply.** `confidenceSupply` is a promise to vote through a budget
   that does not exist. Two parties are holding the government up on a
   condition the game never tests.
3. `?` **`E` Guillotine and closure.** A government that cannot win on time buys
   the time. Costs standing, costs loyalty, and is the most Westminster thing
   available.
4. `IN·mod` **`E` The casting vote.** A tie in a chamber of 280 with an absolute
   majority rule is possible and currently unhandled.
5. `IN` **`C` Private members' bills.** A slot the government does not control, one
   per session, drawn by ballot among backbenchers.
6. `IN` **`E` Committee stage as a real stage.** A bill in committee is currently a
   bill waiting. Give it a composition, a chair and the power to report
   amended.
7. `IN` **`E` Points of order.** A one-click procedural interruption that costs
   nothing and achieves nothing, available always. A parliament without
   pointless procedure does not read as one.
8. `OUT` **`B` The second chamber.** The bible has no revising body. Deciding there
   isn't one is as good as inventing one, but it should be decided.
9. `IN·watch` **`C` Urgent questions.** An opposition instrument that forces a minister to
   the despatch box on the day, consuming order-paper time the government
   wanted.
10. `IN` **`E` Divisions that can be challenged.** A voice vote taken, then
    challenged, then walked through — two clicks where there was one, and the
    challenge itself is information.

## II. PARTIES, FACTIONS, MEMBERS

11. `IN` **`E!£` The named backbencher.** The whip currently moves a number of
    seats. Moving *Okonjo* instead, who has a constituency and a grudge, is the
    single largest immersion return available and the largest piece of work.
12. `IN` **`C` Currents with leaders.** A faction whose spokesman can be bought,
    promoted or destroyed separately from the party.
13. `IN` **`E` Defection.** A member who crosses is currently a `cross` effect on a
    count. A member who crosses and is *named* is a news story for three
    sittings.
14. `IN` **`E` The letter.** Signatures already exist (`signaturesAtLeast`). Let the
    player see who signed, and let a signature be withdrawn at a price.
15. `IN·mod` **`C` A party that is not a party.** A registered independents' group with
    a convenor and no whip — `ind` holds six seats and behaves like a bloc.
16. `IN·watch` **`E` The payroll vote.** Ministers and their aides cannot rebel. Counting
    them separately makes every reshuffle a vote calculation.
17. `IN·mod` **`C` Deselection.** A local party that can sack its own member between
    elections, which is a threat the leadership does not control.
18. `IN` **`E` Loyalty per member, not per party.** The deep version of 11; probably
    too deep for §7.6, listed so the line can be drawn deliberately.
19. `IN` **`C` The awkward squad.** Four or five members who vote against on
    principle, reliably, and whose support therefore means something.
20. `IN` **`E` A whip who can fail.** `payWhips` always works. A whip operation that
    can be refused, publicly, is a much better scene.

## III. MONEY, LOBBYING, INTERESTS

21. `IN` **`E!` The actor store.** `design/24` A1. Bodies outside the chamber with
    resources, patience and an agenda. The prerequisite for 22–28.
22. `IN` **`E!` Lobbying.** `design/24` A2. Substrate neutrality is currently
    unreachable by any means the player controls; lobbying is the mechanism
    that makes an ending purchasable at a cost.
23. `IN` **`C` The register of interests.** Who each member is paid by, published,
    and readable by the player before a division.
24. `IN` **`E` Donations with a memory.** Money taken in session one that is an
    embarrassment in session three.
25. `IN` **`E` The revolving door.** A minister who leaves for the body they
    regulated. A slow, quiet scandal generator that needs no new verb.
26. `IN` **`C` Trade unions as actors.** `content/labour.js` already models the
    workforce and nothing represents it politically.
27. `IN·watch` **`E` Procurement.** A contract is the cheapest way to move a station's
    opinion and the easiest thing to be caught doing.
28. `IN` **`B` Whether the player can be personally corrupt.** The bible is silent.
    It changes the tone of the whole game and should be answered on purpose.
29. `IN` **`C` The think tank.** An actor that produces *numbers* rather than votes,
    and whose numbers the player may cite or dispute.
30. `IN` **`E` Capital that decays.** The ledger (`setup.capital`) never rots. A
    favour owed forever is not a favour.

## IV. THE PUBLIC, MEDIA, OPINION

31. `IN` **`E!` The pollster.** `design/24` A3. `reported()` already applies
    per-party error; generalising it is most of a polling system.
32. `IN` **`E` Polls that can be wrong in a direction.** A house effect per pollster
    is one field and turns a number into a source.
33. `IN` **`C` The press, with mastheads.** A wire item attributed to a paper with a
    known lean reads completely differently from an unattributed one.
34. `IN` **`E` A leak.** State the player can see arriving in the press before they
    have acted on it.
35. `IN` **`C` The interview.** An event type where the choice is a *form of words*
    and the effect is what gets quoted.
36. `IN` **`E` Salience, not just position.** The public may agree with the player
    and not care. Salience is the field that makes a popular policy losable.
37. `IN` **`C` Public opinion that is regional.** Station-level opinion exists in
    the model and is barely surfaced.
38. `IN` **`E` The by-election as a poll.** One seat, real result, disproportionate
    meaning.
39. `IN` **`C` Vox pops.** Three lines from a named nobody on a station, after a
    division. Cheap, and the only place an ordinary person speaks.
40. `IN` **`E` A scandal clock.** A story that decays unless fed, so the player's
    choice is whether to feed it.

## V. ELECTIONS AND THE FRANCHISE

41. `IN` **`E!` The parliament ends.** Three sessions, then dissolution. There is
    currently no cap: a run that does not settle runs forever, and I measured
    190 empty sittings.
42. `IN` **`E` The campaign as a chapter.** `design/10` specifies it; nothing
    implements it.
43. `IN` **`E` Manifesto commitments.** An undertaking made to the electorate rather
    than to a party, tested at the next election rather than by a date.
44. `IN` **`C` The franchise itself as a bill.** Who counts as a person is the
    game's subject; who counts as a *voter* is barely touched.
45. `IN` **`E` Boundary review.** `apportionment` already exists. A commission that
    redraws seats between parliaments is an enormous lever nobody is pulling.
46. `IN` **`E` Electoral system change.** `district_divisor` and `list_divisor` are
    already fields and already tunable by a bill. Almost free.
47. `IN` **`C` Turnout.** A number the player can move and which moves results in a
    direction they may not like.
48. `IN` **`E` The threshold as a weapon.** `threshold_pct` is 4. A bill that moves
    it to 6 kills two parties and is entirely legal.
49. `IN` **`C` Coalition negotiation after the election.** The president has a
    `formation` power that has never been exercised.
50. `IN` **`E` Losing the election and continuing.** Opposition is a game state the
    engine cannot currently represent.

## VI. THE EXECUTIVE, THE PRESIDENT, THE STATE

51. `IN` **`E` The reshuffle as a scene.** `cabinet` and `vacate` exist; appointing
    is a fill-a-post click with no politics in it.
52. `IN` **`E!` Collective responsibility.** A minister who disagrees must resign or
    lie. This is the executive/legislature split the Chamber tab now makes
    visible, given teeth.
53. `IN` **`C` The civil service.** An institution that has views, tenure, and
    advice the player may reject at a cost.
54. `IN` **`E` The president's referral power.** Listed in `setup.president.powers`
    and never used.
55. `IN` **`E` Dissolution as a threat.** The president holds it; the player should
    be able to fear it.
56. `IN` **`C` The permanent secretary's note.** A document that tells the player
    what the department thinks, which is not what the minister thinks.
57. `IN` **`E` Emergency powers.** `shed_order_authority` is already a law field
    pointing at the engineering authority. That is a constitutional crisis
    waiting in a config line.
58. `IN` **`E` Judicial review.** An Act struck down after passing is the strongest
    possible argument for drafting carefully.
59. `IN` **`C` The inquiry.** Established under pressure, reports two sessions
    later, and by then the question has changed.
60. `IN` **`E` Confidence as a motion, not only a count.** The opposition tabling it
    is a scene; a scalar dropping below a line is not.

## VII. STATIONS, FEDERALISM, FOREIGN

61. `IN` **`C` Station governments with names.** Thirty stations, no local
    politicians.
62. `IN` **`E` A station that legislates.** The federal settlement is an *ending*;
    federalism should be a live tension before then.
63. `IN` **`E` Internal migration.** `federal_fudge`'s own summary says the cost is
    paid in migration, which the engine does not model.
64. `IN` **`C` The station that secedes.** Or threatens to, credibly, once.
65. `IN` **`E` Thermal as politics.** `thermal_margin` is a loss condition and
    nothing else. Heat is the setting's scarcest resource and its least
    political one.
66. `IN` **`E` Trade with somewhere.** `design/11` exists; foreign affairs does not.
67. `IN` **`C` The anchorage concession.** `anchor_kepler` is a bill at assent about
    a treaty nobody has met.
68. `IN` **`E` Supply chains that can be cut.** `consumables` at 71 and falling is a
    crisis the game cannot currently stage.
69. `IN` **`C` The capital.** The Winter Garden exists, has one non-voting seat, and
    has never appeared in a sentence.
70. `IN` **`E` Station closure as a decision, not a defeat.** Closing one is
    currently something that happens to the player.

## VIII. TRANSHUMANIST MECHANICS THIS SETTING OWNS

*Kept deliberately closer to procedure than to spectacle: the author's note of
14 September was that these lean too far into science fiction and away from
government. The test each one has to pass is whether it would be recognisable
to a clerk.*

71. `IN` **`E!` Subjective time as a resource.** A legislator running fast reads
    every bill (§6 of the bible, on running hot). Regulated clock speeds for
    officeholders is a *procedural* rule about a transhumanist fact, which is
    exactly the register this setting is best in.
72. `IN` **`C` The proxy vote for an instance.** Who votes when a member is forked
    is a standing-orders question, not a metaphysical one.
73. `IN` **`E` Continuity of membership.** A member who dies and is restored — are
    they the same member, and does their seat fall vacant? A by-election
    hinges on an ontological answer.
74. `IN` **`C` The register of persons.** `continuity_registration` is a drafting
    bill about exactly this and has no content around it.
75. `IN` **`E` Quorum with instances.** Forty members and two hundred instances.
76. `IN` **`E` Pairing across substrates.** Pairing landed this week; a pair between
    an embodied member and an instance is where the courtesy breaks.
77. `IN` **`C` The oath.** What a new member swears to, and who cannot swear it.
78. `IN` **`B` Whether an instance can hold office.** Not whether it is a person —
    whether it can be Treasurer.
79. `IN` **`E` Time-limited terms in subjective years.** The bible names
    subjective-time term limits; nothing implements them.
80. `IN` **`C` Committee work done by fast staff.** Named in the bible as a quiet
    practice. A scandal in waiting, and a procedural one.

## IX. INTERFACE, FEEDBACK, LEGIBILITY

81. `IN` **`E!` The vote held until dismissed.** Owed from the author's 14 September
    list: the diagram stays as a record of the division until the caption is
    closed.
82. `IN` **`E!` Abstention and absence, shown.** The three-way count landed in the
    engine on the 14th and the UI still renders two.
83. `IN` **`E` The pairing UI.** Engine landed 15 September, no control exists.
84. `IN` **`E` A bill's history.** Every stage, every division, every amendment, on
    one page.
85. `IN` **`C` The letterhead.** The bill dossier headed as an in-world instrument.
    Needs a slot in `js/artifacts.js` first.
86. `IN` **`E` The diff.** After an event, what changed, in two lines. `acted()`
    already reports moves; generalise it.
87. `IN` **`E` A search.** Fifty-four characters, 141 seats, thirty stations and no
    way to find one.
88. `IN` **`E` The clock, everywhere.** `dayLine()` shows the day's divisions in one
    place; sittings-until-rise belongs in the topbar.
89. `IN` **`C` Tips that teach procedure.** `js/tips.js` explains the terminal.
    Nothing explains what a second reading is *for*.
90. `IN` **`E` Undo, once.** §12.13 gave every action a report; a report the player
    can act on is better than one they can only read.

## X. RUN SHAPE AND REPLAY

91. `IN` **`E!` The settlement floor.** Measured this week: a settlement fires at
    sitting 7 on one play policy. An ending must be *carried*, not reached.
92. `IN` **`E` Events that fire more than once.** Twenty of twenty-four are `once`,
    which is why the pool goes dry at sitting 9.
93. `IN` **`B` What a second run is for.** Four endings is the current answer.
    `design/14` §6's second leader is a better one.
94. `IN` **`C` A different opening.** Same parliament, different portfolio.
95. `IN` **`E` Difficulty as arithmetic, not as multipliers.** A tighter majority is
    a harder game and needs no difficulty setting.
96. `IN` **`E` The record between runs.** What the last Commonwealth settled on,
    shown at the start of the next.
97. `IN` **`C` An epilogue per station.** Where the settlement landed, locally.
98. `IN` **`E` A run that can be abandoned honourably.** Resignation as an ending
    rather than a quit.
99. `IN` **`B` Whether the player can be wrong.** The author rejected the
    right-once/wrong-once rule as too reductive; the question it was answering
    is still open.
100. `IN` **`E` A named seed.** Determinism is already total (§1.5). Surfacing the
     seed makes a run a thing two people can compare.

---

## WHAT I WOULD PICK

If the hundred had to become six, and holding the 45-minute floor as the thing
that matters most:

**91** the settlement floor and **41** the parliament ending, because without
them the run has no length at all and every other number is guesswork. **82**
and **81**, because the engine already does the work and the screen is lying
about it. **2** supply, because two parties are currently propping up a
government on a promise the game never collects. And **11**, the named
backbencher, because it is the only one on the list that changes what the game
*is* rather than how much of it there is — and it is the one I would want a
week for.
