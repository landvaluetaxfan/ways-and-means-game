# 42 — The prose pass: an assessment

26 Sep 2026. Every player-facing passage read, 2,702 of them and 57,900
words, from the prose export (`npm run prose`). Then the faults fixed,
the constituencies rewritten in the register the author set, and checks added
so the two worst classes cannot come back. The numbers below were measured
over the export, not estimated.

---

## The verdict

The writing is better than its faults suggest. The events have a real voice:
dry, specific, political, with characters who sound like themselves (the Chief
Whip, Hatt, Tanako, Castellane), and the best results end on a fact that lands
("You answered the three, and the fourteen behind them. The House went home
late and nobody said the government was hiding."). The Reference prose has
been through two passes already and reads cleanly. The appropriation's rate
notes, the lenders' terms and the country notes are as good as anything in
the game.

**The weakness is not the sentences. It is that the prose does not know what
the rest of the game knows.** Almost every serious fault found was the prose
disagreeing with content, canon or the rules as they stand now: a name that
was changed elsewhere, a number copied when it should have been read, a rule
that has moved since the sentence was written, a year a sixteen-year-old
polity cannot have. The game changes fast, the prose is written once, and
until today nothing compared the two.

---

## What was wrong, ranked by harm

### 1. The prose said things content contradicts (all fixed)

The worst of them, because each one tells a player something false:

| where | said | true |
|---|---|---|
| the ratio tooltip | above 1 is **under**-represented | above 1 is **over**-represented (the engine divides seats by electors); the tooltip had the ratio backwards against the engine, the Orbit chips and every constituency |
| the simple-majority tooltip | the functional forty's votes count in the same total | a simple-majority bill is decided on the 240 popular members alone |
| the status tooltip | you lose office if confidence falls below a majority | since design/38 a lost majority is a motion; the losses are the motion, the ballot, supply and the cascade |
| the wire tooltip | "everything here follows from something you did" | the Bank, Earth and the drift print wires too |
| `ch2_carveout_price` | the bill fails on the second bench "12 to 40" | the second bench has forty seats |
| `f1_pyrrhic_election` | "saving three hundred thousand people" | 184,000, everywhere else (the author's plan said 300k before the Works was settled) |
| `thermal2` | "Ember Ridge is four thousand two hundred people" | 213,000 |
| `the_agricultural_deck` | Harvest's closure 0.44, "the other forty" stations | 0.69, and thirty stations |
| the Concordance, *Commonwealth* | "*Commonwealther* is the most-used demonym" | bible §11.1, LOCKED: **no demonym** |
| `the_paper` | "Twelve and I am the leader of the opposition" | Czarnecki is in the Prime Minister's party; twelve forces a ballot |
| the Mars events and award | the eleven-sitting gap "is what the light-lag means" | Mars is minutes away by light (§2.2); the gap is the Republic taking three weeks to agree with itself, which the actor note already implied |
| `the_pairing_offer` | a Liberal "member for Hardie" | Hardie is a PSD seat; the member is now for Cable End |
| `tr_reference` | the Tribunal asks the question `the_old_judge` just answered | it fires only after that answer, so it now asks the next question: by what test |
| three money lines | "eight points", "nine points", "costs three" | the reserve is in dollars since design/39 |
| the station count | "thirty-four" (three places) | thirty stations and five external, thirty-five |
| Aster Skye's role | "Treasurer" | the Treasury opens vacant; Skye was the deputy. The Orbit row now shows a member's live office |

Also: sessions where the rules now have sitting periods (eight places), four
events whose speaker was not the minister the scene is for (Hatt as
Treasurer, Marin for Labour), and the `f1_referendum` body broken into two
paragraphs mid-sentence.

### 2. The prose did not follow the renames (fixed; lint now fails on it)

Seventeen passages still used a name content had retired: **Okarie** for Anil
Devi (four), **Vellan** for Vidyasagar, **Halloran** for Czarnecki, **Vantage
High** for Ember Ridge (three wires), **Ashfield** for Homestead (three),
**Tsiolkovsky** for Farstead, **Kepler** for Anchorage, **Sinter** for
Colonnade, **PSA** for the NPP, and **the Martian Concord**, design/29's
placeholder, in six passages of the two Mars events. A rename edits the entry;
nothing read the prose that talks about it.

`npm run lint` now reads every passage a player can see for any word of an id
that its entry's name no longer contains, any party id that is not its short
name, and the named retirements. Proved by putting three back: it fails on all
three. Four words are allowed, each with its reason in `ALLOW`.

*Not changed, and worth a decision:* "the Substrate Left" is the NPP's canon
press nickname (bible §8.3), and the wires keep it. But the PSD's four
currents are the Trades, Soft, Station and Hard Left, so a player meets a
fifth "Left" and takes it for a PSD current. The narration now says "the New
Progressive Party"; the wires still say the nickname.

### 3. The constituencies copied what they should read (all 141 rewritten)

Every tendency wrote its roll and ratio out, and **thirty-six named a member
who does not hold the seat**, three party leaders' own seats among them: when roster characters were seated, the
character won the seat and the prose went on naming the backbencher it
displaced. Anselm Proper's tendency said Kofi Ashworth; Darren Watkins, the
Leader of the Opposition, sits for it. The independents' current for
Colonnade named Brennan Kettering; Adam King sits for it. 128 of 141
descriptions ended on the same formula, "The recorded interests are X and Y",
which the dossier prints beside them anyway.

All 141 are rewritten in the author's register (the Rookworks Centre model):
the description says what the place is and what it hosts, with a detail of
the place where one fitted; the tendency says who lives there, what they vote
on, the figures, the seat's history and its member. The figures and the member
are placeholders now, `{electorate}`, `{ratio}`, `{represented}` and
`{member}`, filled by `Engine.seatText` where the text is drawn. Lint fails on
an unknown placeholder, a figure written out, or a displaced member named
anywhere. CONTENT_GUIDE.md has the format.

**One correction to the model.** The author's example called a ratio of 1.10
"moderately overrepresented", and that is right: the ratio is seats per
elector. The tooltip said the opposite, and has been corrected to match.

Five seats changed hands in 2076 (bible §8.4), and their tendencies say so.
There have been four elections, 2064 to 2076, so "since the Charter" and "at
all four elections" are the same claim throughout.

### 4. Thirteen scenes were never written (written; the briefs are kept)

`ec_participation_report`, `ec_participation_stalls`, `ec_trade_surplus`,
`ec_trade_deficit`, `ec_privatisation_offer`, `ec_subsidy_reckoning`,
`ec_sold_and_asked`, `ec_borrow_case`, `ch4_tested`, `ch4_structural`,
`ch4_what_for`, `ch4_rises_on_it` and Flash I's `f1_water` shipped as a
`brief` describing the scene and a one-line placeholder body, with one-line
results. A player met "The trade balance is in surplus and the surplus is
substrate-hours sold to people who cannot make them." and nothing else. Each is
now a scene written to its brief, with its speaker corrected where the brief
wanted someone else (Herrera for participation, Trottier for the coalition's
undertaking). The briefs are untouched, so each can be compared with its scene.

### 5. A sixteen-year-old polity with old things in it (fixed)

"Thirty years watching copies undercut their wages", a mutual that "kept a
list for thirty years", "the band it has held for a generation", a board that
"has outlasted forty ministries", a college whose "membership is ancient", a
panel chair "of forty years' standing" (kept, with the first half of them on
Earth). §11.1 gives the Commonwealth sixteen years; each now fits it.

### 6. The game speaking in the world's voice (fixed)

The Concordance printed an actor note calling the PSD "the player's own
party", an order's note said "the most margin in the game", a functional
seat's note cited "the board-packing lever in 4.6.4" (a bible section), and
the residual constituency's rules opened in the capitals of a design note.

### 7. Habits, measured

Over the player-facing prose less the constituencies, per 10,000 words:

| habit | before | after | note |
|---|---|---|---|
| "eleven" as the default specific number | 40 uses | 25 | ten 10, twelve 10, seven 7; the remaining 25 are canon (Mars, 11,400, the paper) |
| "nobody" / "everyone" | 17.3 | 14.4 | the heaviest habit left; most remaining are in speech or are literal |
| ", which is the / what / how" | 9.7 | 8.7 | |
| a note the result repeats | 7 | 1 | the note says what a choice costs; the result now says what happened (the seventh is the sandbox console) |
| "which from him is a statement" | 2 | 0 | |
| "that is what X is for" | 4 | 3 | |

The register scanner (`npm run register`) reads zero faults in Reference and
Interface. Voice keeps its notes, as decided on 24 Sep.

---

## What I did not change, and why

- **Flash I's six closings.** `content/campaigns/flash_i/settlements.js` says
  "PROSE IS THE AUTHOR'S": they are two flat sentences each so the mechanism
  can be played. They are the weakest prose in the game for where they sit —
  the canon ending is two sentences on the last page after the count, next to
  world endings of three paragraphs — so drafts are below, for the author to
  take, change or ignore.
- **The introduction.** It is the author's. Three things in it are worth a
  look, and none was touched:
  1. "they lead a somewhat convincing minority government". The coalition
     holds 141 of 280 on its own, a majority of one, and 147 with the
     independents' confidence and supply. It is a majority government, a thin
     one.
  2. "which occasionally mitigates the two facts; occasionally it exemplifies
     it": the second "it" wants "them", or the sentence wants one subject.
  3. "But it's not like every capable leader was evidently destined to do it
     beforehand." The one colloquial sentence in a formal page; if the
     register shift is meant, it works, and if not it reads as a draft.
- **Character notes and cabinet notes.** The author's design notes, not
  printed. "This is the sharpest tool in the game" is still there, correctly.
- **The world's settlements.** Rich, and they hold. One aphoristic closer was
  cut from the chapter-two aftermath ("That is what a settlement is for.").

---

## Drafts: Flash I's closings

Each is written as though it were the only ending, as the file's header asks,
and each keeps the facts of the author's plan (design/35).

**Orbital Powerhouse (`f1_triumph`)**

> The Almanac Works is Commonwealth territory by Act of the House, and Earth
> has dropped its claims on the Works' debt rather than find out what the
> Commonwealth would do with the tethers it holds and the power it relays.
> The bonds were left where Cordell dropped them.
>
> The Works' yards are the Commonwealth's now, and with them the heaviest
> fabrication capacity in orbit. The stations that could not build their own
> radiators have somewhere to order them.
>
> Earth has lifted its measures and kept its grievance. Kenya reviews the
> International's concession every quarter now, and every state that holds an
> anchor has learned what the Commonwealth will do with one.

**Maritime Charter (`f1_maritime`)**

> An international court has recognised the salvage, and the Almanac Works is
> Commonwealth territory in law. It took a year of the Law Officer's time and
> the Foreign Office's patience, and the bill for both is on the estimates.
> Growth will be slower for it.
>
> What it bought is a precedent: a company that abandons a platform abandons
> its claim with it, and a state that rescues the people inherits the platform
> by right. Earth's own courts said so, and the Earth states that disliked the
> answer accepted it because their courts gave it.

**Sovereign Debt Trap (`f1_pyrrhic`, the canon)**

> The Almanac Works is Commonwealth territory, and its hundred and
> eighty-four thousand people are Commonwealth persons. The price was
> Cordell's debt: the defaulted bonds the wind-up left behind are the
> Commonwealth's now.
>
> There was no war and no blockade, and the country approved of both. The next
> three years' estimates are written around the debt, and the stations feel it
> first, in the lift schedules, the works and the maintenance lines the
> appropriation used to carry. The Cordell leases are for sale to pay the
> interest.
>
> The next Parliament opens with the debt on its first page.

**UN/Orbital Joint Mandate (`f1_joint`)**

> The Almanac Works is a free trade zone under a joint mandate, administered by
> the Commonwealth and an international commission and owned by neither. There
> is no embargo and no new territory, and the people on the Works keep their
> air, their jobs and their Earth passports.
>
> The country took the arrangement with a shrug. Turnout at the count was the
> lowest since the Charter.

**Corporate Re-Entry (`f1_capitulation`)**

> The Commonwealth declined the Works' referendum, and Cordell's security came
> back aboard under Earth's protection. The Works was cleared deck by deck, and
> its people were put on Kenya's two-year schedule.
>
> There was no embargo. The outer habitats struck the week the referendum was
> declined: the maintenance unions walked off the rims and the yards, and the
> lift crews joined them on the second day. The strikes are over. The
> grievance is not.

**Unfinished Business (`f1_open`)**

> The House rose with the Works' future unsettled. Its people are on emergency
> terms: the Commonwealth pays for their air, Earth's banks price the question,
> and the title to the platform is claimed by three parties and held by none.
>
> The next government inherits the question, and Earth's lawyers inherit the
> time.

---

## Decisions left with the author

1. **The Flash I closings**: take the drafts, or write them.
2. **Hatt's role.** He leads a party that sits only in the functional tier, and
   twelve events use him as the government's voice on money, some of them
   ("they could read the numbers and we could not") as though he were inside
   it. With the Treasury vacant at the opening, the game has no Treasurer's
   voice; Hatt has been filling the gap. Either that is the design (the
   Alliance is the government's banker, which `f1_loan` supports) and a line
   in the bible should say so, or the Treasury wants a speaker.
3. **The NPP's nickname** in wires, above.
4. **Events that assert what the engine does not do.** `ch4_rises_on_it`'s
   "rise early" prints HOUSE RISES EARLY and the House sits on. Small, and the
   kind of thing a playtester notices.
5. **"UN/Orbital Joint Mandate".** The United Nations in 2080 is a fact about
   Earth's politics the bible does not state; the ending's name is the only
   place it appears.

## How to keep it from coming back

- Run `npm run lint` after any rename. It reads the prose now.
- Write a seat's figures and member as placeholders.
- After editing a content file by hand, run `npm run prose` before the next
  `npm run prose:in`, or the write-back reverts the hand edit. It did once
  during this pass.
- When a rule changes, grep the prose for its old words ("session", "slots",
  "points") the same day. The mechanics moved three times in a week and the
  prose followed none of them.
