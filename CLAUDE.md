# Working on this repo

A text-based narrative political thriller with real electoral mechanics, set in a
federated republic of orbital habitats. No build step, no framework, no bundler.
Open `index.html` in a browser to play, `editor.html` to author.

## HANDOFF — opencode, 11 Sep 2026 (dialogs, Concordance offices, chamber)

opencode worked on `main` at the author's direction and touched files outside its
usual lane. **Read this before editing `js/` or `content/encyclopedia.js`.** The
two features are in `git log` as *"Replace the browser's dialogs with the
terminal's own"* and *"Derive Concordance offices and party leaders from the
cabinet"*, both pushed.

**Native dialogs are gone.** New `js/dialog.js` draws `alert`/`confirm`/`prompt`
in the terminal's own chrome and answers through callbacks, not promises:

```
Dialog.alert(msg, opts?, done?)        done()
Dialog.confirm(msg, opts?, answer?)    answer(true|false)
Dialog.prompt(msg, opts?, answer?)     answer(string|null)
```

Every call site in `js/shell.js`, `js/ui.js` and `js/editor.js` now uses it; the
host is `#dlgdlg` and the CSS is `.dlg-*` in `terminal.css`. **The test harnesses
answer it through the same callbacks** (`tools/harness.js`, `tools/edtest.js`
override `Dialog.confirm/prompt/alert`), so if you change the signature you must
change those too or `npm run ui`/`ux`/`editor` stop booting. A dev-only check for
the module itself was left in `%TEMP%\opencode\dlgtest.js`, not in the repo.

**The Concordance derives offices now.** `js/encyclopedia.js` reads who holds
what from `C.cabinet` and `C.parties[].leader` (`officesOf`/`mainOffice`/
`officeLine`) instead of trusting a typed `role`. Person articles gained a
wikibox (Party / Seat / **Offices held**); the lede follows the office. Party
articles gained Leader + Leader's office + a Leadership section. Infobox rows
support a section header as `["", "Offices held", "head"]`. `js/refs.js`
`characterRefs` now follows `cabinet[].holder` and `parties[].leader`, so a
rename reaches both.

**New content fields to know about:** `parties[].leader` (a character id; `null`
for `ind`) and `cabinet[].title` (the *minister's* title, e.g. "Treasurer" or
"Leader of the House", distinct from the ministry `name`). The editor does not
expose either yet but serialises them unchanged.

**Content corrections made in the same pass:** Marin is Minister for Persons and
Continuity again (Abadi keeps `fc_medicine`, backbench); Anselm Ring's
composition was rebalanced so the population-weighted composition is the bible's
64/28/4/4; and stale facts in `content/encyclopedia.js` were fixed (station
count, functional-electorate range, the full cabinet ministry list, "two
Congregational Democratic Alliance Ministers", a doubled "the").

**Both inconsistencies that were open here are now closed** (checked 20 Sep 2026,
by measuring rather than by reading a commit message): `content/labour.js`
`embodied` weights to **46.1%** of jobs against bible §6.10's **46%**, and both
population figures are **7,086,000**. Leaving the paragraph as a record that they
were real, and that content fixed them.

**Also landed since that handoff:** row selection is now the gold tint in every
table (`.sel` was the dark inverted block; the `#cons-table` override is gone and
`tools/uxtest.js` was updated to match); a member-table tooltip widens to 360px
(`#tipcard.wide`) so a full office title fits on one line; and three Liberal
functional-seat MPs now hold shadow briefs — Quintana/Substrate, Ijaz/Transit,
Estévez/Anchors — with Otrione, Caillet and Nadeau backbenched. `js/ui.js` gained
`officeText()` for the full office in the functional tooltip.

**More since:** Gecko gets a drawn scrollbar (`decorateScrollers()` in `js/ui.js`
wraps `.p-cons`/`.p-doss` bodies in `.sbwrap` and appends `.sbar`; WebKit/Blink
keep their native bar — the check is `CSS.supports("selector(::-webkit-scrollbar)")`);
the whip's `MOVE` column is a segmented `.whipbar` (one block per whippable seat),
not a range input; and the orbit tab dropped the `p-cond` panel — the constituency
dossier is now an expandable `.consdet` row inside `#cons-table` (`consOpen` state,
`constituencyDetail()`), with `p-doss` spanning the full right column. Next up,
per the author: constituency prose (description, voting tendencies) in the expanded
row, then a capital designation.

**The capital is in:** `content/stations.js` has `winter_garden` (The Winter
Garden, ring band, 80k, one seat) and `content/constituencies.js` has
`capital_territory` (Capital Territory, `at_large`, `nonVoting: true`). The engine
reads `nonVoting`: `seedRoll`/`reconcile` carry the flag into the roll, and
`syncRoll`, `partyDistrict`, `vacantSeats`, `tierCheck`, `apportionment` and
`generalElection` all skip it, so the seat has a member and a page but sits outside
the 140-seat tier, the 280 chamber and every division. `test.js` was updated
(141 constituencies, 140 voting; station seats 141) and the `commonwealth` article's
station count moved to thirty. One fiction wrinkle left: the capital's electorate
(49,200) is excluded from the district-roll sum in `test.js`, so its adults are not
inside the bible's 4,149,803 and the districts were not rebalanced.

**Do not commit** the untracked root duplicates (`events.js`, `glossary.js`,
`lint.js`, `encyclopedia_content.js`, `encyclopedia_renderer.js`, `js/codex.js`)
or the `tools/dither.sh` mode change — they are pre-existing and left alone.

## CLOSED — the divergent branch is reconciled (21 Sep 2026)

`opencode/party-rename-and-economy` was a line of work committed from a stale
clone and left unrebased for eleven days. **It is landed.** Nothing is owed on
that branch and it can be deleted; the one commit that carried content was
`fee015a`, and what came across is below. Its engine half was written against
`STATE_VERSION 5` against today's 26, so it was cherry-picked rather than
merged, and **the party rename and the `gb` split were dropped** because both
were already here — which is what the old version of this section instructed.

**The four categorical axes are now five signed ones.** `ownership` became
`economic` and `closure` became `trade` (a signed axis needs a name that reads
in both directions — "ownership −0.75" says nothing), `authority` is new, and
positions are numbers from −1 to +1. Bible §8.1 is rewritten for it.

- **`null` is not zero, and the distinction is load-bearing.** Zero is the
  centre and a position content took; `null` is no position at all. Converting
  the sixteen currents, a near-zero number was written where the old value was
  `null` — and the canon forecast moved from 130 to 131, because six
  independents who had no view on personhood had been given a faint one.
  Restoring the nulls restored the number. `test.js` asserts 130.
- **Agreement is the cosine over the shared axes**, not `1 - |a - b|` as on the
  branch. That formula is biased: two positions on −1..+1 sit 0.67 apart on
  average, so it scores the mean party-bill pair at +0.412 where the old
  categorical scoring scored 0, and `inferStance` and the whip bands both cut
  at ±0.25 on the old basis. `a * b` centres correctly but compresses. Cosine
  centres at +0.064 and does not compress. §8.1 carries the table.
- **The engine still names no axis**, deliberately against the branch, which
  introduced `const AXES = [...]`. The dimensions are whatever a party and a
  bill both declare. `js/schema.js` holds the names and the poles, and
  **`index.html` now loads `js/schema.js`** so the interface can draw
  "strongly public" instead of "−0.75" without a second copy of the poles.

**§7.10 the productive economy is in**, at `STATE_VERSION 26`:
`st.economy = {participation, trade, private}`, an `economy` effect verb,
`economyAbove`/`economyBelow`, and `economyHistory` on the same sixty-sitting
window as the prices. Opening figures are in `content/setup.js`, not the
engine. `private` is authored and never drifts, so it keeps no curve.
Participation moves on the divergence threshold: cut it to forty hours and
participation goes 39 → **47.9** over twenty-six sittings against **39.0** if
it is left alone (48.1 before the opening came to rest in design/40; 49.2 and
40.1 before the dollar, while the reserve filled every sitting), and
`test.js` asserts both so the canon cannot rot.

`ROADMAP.md` and `AUTHORING_FORMAT.md` came across too, each with a header
saying what in it is out of date — the roadmap was written against a nine-tab
interface that still had **Papers**.

**The party table is still a useful record**, since the ids are the initials of
the pre-rename names and are therefore a poor guide to what a party is called:

| id | name | short |
|---|---|---|
| cu | Party of Socialists and Democrats | PSD |
| cl | Liberal Party | LIB |
| psa | New Progressive Party | NPP |
| sc | Home Rule | HR |
| hul | Association of Engineers and Systems | AES |
| rv | Congregational Democratic Alliance | CDA |
| fh | Freehold Party | FH |
| gb | Alliance of Business and Government | ABG |
| des | One-G | ONE |
| geo | Single Tax Party | STP |
| upl | Uplift Alliance | UPA |
| ind | Independents | IND |

Three were renamed again on 14 Sep 2026 under bible §8.3's rule that a party
names itself for who it is and not for what it opposes: `fh` was the *Party of
Property Owners*, which is what a tax form calls them; `rv` was the *Democratic
Centre*, which described neither their economics nor their faith; `upl` was
*Common Kind*, a good phrase that identified nobody. Read
`content/parties.js`.

## THE CANON DATE IS 2080 AND THE HISTORY IS TWO DECADES (22 Sep 2026)

The world was drafted two hundred years old and dated to 2287. The author
moved the campaign to **11 April 2080** and then, when the sweep turned up
the contradiction, compressed the history to match: **two decades, not two
centuries**, on the argument that halfway to post-scarcity means enormous
manufacturing capacity, and enormous manufacturing capacity is what puts
seven million people in orbit inside twenty years. Automation is the CAUSE of
the colonisation rather than something that happened long before it.

**`bible.md` §11.1 carries the timeline and it is LOCKED.** Read it before
dating anything. The short version: Earth settles personhood and automation
in the 2040s, orbital industry reaches scale ~2058, *The Spindle* and the
treaty organisation 2061, the rising 2063, **the Perigee Charter 2064**, the
anchors 2065 and 2068, Flash comes up 2070 and takes the Bank 2071, and the
campaign opens in 2080 with the Commonwealth sixteen years old.

**What the sweep touched.** 67 year references shifted by −207 (2287→2080 and
so on down), 30 `si_2287_*` id references renamed `si_2080_*` (`npm run
rename` confirms behaviour-preserving), and then a second pass re-anchored
the eight dates that −207 had put either in the future or before orbital
settlement: the judge's emulation, the rising, the certification cohort, the
Spindle's founding **and its issue number** (No. 31,884 was 87 years of
dailies the paper has not had; it is No. 6,884), the Secretary-General's last
use, and the three Earth-side notes in `world.js`.

**And seven duration claims that assumed an old world**, which a year sweep
cannot see because they carry no digits: `names.js`'s "two centuries of
orbital habitation blended the founding populations" (twenty years blends
nothing — the populations arrived already mixed, because orbital industry
recruited everywhere at once and recruited fast), `labour.js`'s "automation
took bulk production two centuries ago", the consumables floor "settled
generations ago", leases held "for four generations", a mutual "older than
the party by two generations", firms "closely held two centuries after they
were founded", and **bible §2.1 itself**. Three more were left alone on
purpose: §14.3 is notes on the Mars trilogy and §15's predator line belongs
to another setting's appendix, so neither is Commonwealth history.

**§2.1 came out stronger.** Its principle is that whatever is radical is
already settled, and it bought that with "two or three generations", which
twenty years cannot supply. A young polity founded on OLD EARTH SETTLEMENTS
buys it outright: the personhood fight happened on Earth before anybody came
up, so nobody in the chamber won it and nobody in the chamber owns it.

**Flash's career needed no change, and that is the confirmation.** Arriving
in 2070 and governing the Reserve Bank in 2071 reads as absurd in a
two-century-old republic and as obvious in a sixteen-year-old one standing up
its first institutions. (Her years were corrected 25 Sep, design/40 E13:
Governor 2071-2076, Treasurer from outside the House 2076-2080, bible §3.8,
then the leadership and First Spin at a by-election.) Her introduction was
already written for this world — she banks through "the latter half of a
century defined by an upheaval in the institutions of the old order as
climate change forced their hand", for a firm called Alphabet-JPMorgan Omni.

**If a new date is being written, check it against §11.1 first.** The window
is narrow now: anything Commonwealth is 2058–2080, anything Earth may be
earlier, and nothing is generations old.

## THE TABS, AS OF 24 SEPTEMBER 2026

Ten, and the arrangement is younger than most of this file, so trust this
list over any older sentence here that implies a different one:

| | |
|---|---|
| **Sitting** | the event, the docket (the polls, once the writs are out: design/38), the calendar, and the one indicator panel |
| **Government** | instruments · the document · what it can do · the ledger and cabinet, with the Tribunal and the Presidency folded at the edge |
| **Chamber** | order-paper time, the order paper, the House, the whip, and who is counted |
| **Economy** | *Rebuilt for the dollar 25 Sep 2026 (design/39): six panels.* Top: **the account** (a year's budget in dollars: held, receipts, spending, the balance, each lender in its own money, the debt against output), **what everything is priced in**, and **the Reserve Bank and the dollar** (inflation, the cash rate with what its rule asks and when it meets, the dollar, growth against capacity, credibility). Band: **what the Underwriters say**, the chart, and **what is made and who makes it**. *What follows is the 21 Sep refresh, still true of the bases panel:* Four panels on four subjects and a band: **the account** (a stock and its flows), **what everything is priced in**, **what is made and who makes it**, and — in the bottom band beside the chart — **what the Underwriters say**. The middle panel is three former ones, because `TAX_BASES` and `PRICE_META` in the engine are the SAME FOUR THINGS (volume, thermal, substrate, transit): Scarcity, What sets the prices and Ways and means were three facts about one set of four rows, in two different columns, with a third panel between two steps of one sum — `receipts()` computes each yield AS `rate × price/100 × weight`, and §7.9 says outright that the four prices are the appropriation's. One row each now: price, trend, the clause that sets it, the rate, the yield. `inflation` is that table's footing, not the account's, being a reading of those four and nothing else. §7.10's three readings and `content/labour.js` are one panel for the same reason — `st.economy.participation` and `LABOUR.totals.participation` are one fact — with the eighteen categories folded, since they are reference and not a working readout. The chart takes two columns **at either of two timescales** — the engine's per-sitting curve, or `setup.history`'s annual record 2073–2080, whose last point IS the opening value so the two join. The live window is about fifteen weeks (four sitting days a week), which is the right resolution for a price and far too short to show anything structural; that is what the record is for. **Nothing on the tab scrolls at any of the seven measured shapes** — see the layout note below. |
| **Party** | *your own party (the author, 24 Sep: the tab "focuses on other parties instead of your party").* Three columns: **the benches** (one selectable row per current of the player's party: seats from `currentSeats`, live loyalty, posts held, names on the paper, and the party's figures as their footing, since `party_loyalty` IS their weighted mean), **one current** (content's description, its loyalty and where it leaves the party line in words, its named members with their LIVE office from `st.cabinet` and where each stands with you, and how many of its members vote with the party on each live measure, read off `Engine.division`'s `benches` before the whip), and **the leadership** (the loyalty meter against `thresholds.leadershipChallenge`, the paper against `thresholds.ballot`, `Engine.ballot` as the forecast, and once `paper_opened` the members closest to signing with Ask). **The paper moved here from under the whip on the Chamber tab**; it is drawn once. **Willingness decides an Ask** (24 Sep): a member at or above `thresholds.signsAt` signs, one below refuses, comes off the paper for good (`st.refusedBy`, lazy like `st.signedBy`) and firms their current by `thresholds.refusalLoyalty`. Every member asked used to sign, "will not" included, so Ask could only lose the Prime Minister a member. **And a name can be won back** (design/26 #14): a signed member under `thresholds.winBackBelow` withdraws for a slot and a PROMISE, an undertaking (`signs: <id>`) of time before the House rises for the live measure their current agrees with most, discharged by `{slot: bill}`. Kept, they stay off the paper; broken, `breakUndertaking` puts the name back, the one number a breach moves in the engine, because the paper is the engine's own. Member links are `person_<id>`: a bare character id is not an article, and `npm run ui` now checks each one resolves. |
| **Relations** | *interparty affairs and nothing else (the author, 23 Sep: it "was built on false assumptions that it was supposed to be for all parties"); what the Party tab was until 24 Sep, with every id renamed `rel-` so none outlives its tab.* Three columns: **the arrangement** (every other party grouped by relation — in government, confidence and supply, outside — with seats, loyalty, the ledger and whether the government survives their going; your own party is on the roster for the arithmetic, and its "yours" mark opens the Party tab), **one relationship** (the terms, their leader and where you stand with them, what they want from you — their own bills, each opening where time is given to it — what you have promised their members, and where they part from you, measure by measure), and **who they vote with**. Who a party IS went to its Concordance article: members (a wikitable, `section.table`), organisation and branches (`CONTENT.partyOrg`), currents. The currents are counted on the Chamber's composition table. |
| **Orbit**, **World**, **Record** | unchanged |
| **Concordance** | *the reference work, and it can only know what the world knows.* Articles are generated from content, which is authored for the WHOLE campaign — so anything staged for later showed up at sitting one. The four bills that open in `drafting` (the Almanac Works (Annexation) Bill among them, which is the act the campaign is about) each had a full page with a division forecast for a measure nobody had laid before the House, and the page contradicted itself saying so: "A measure before the House of Delegates. Stage: drafting." `drafting` is the engine's own word for not introduced, so it is the line: `build()` skips those and the page appears the moment the bill is set down. **The gate belongs on the surface, not in the content** — the content is right, the bill SHOULD be sitting in `drafting` waiting for `f1_dilemma`. Worth re-checking whenever a new reference surface reads a content list whole. |

**THE CONCORDANCE WAS REFRESHED 22 Sep 2026 — the register, and liveness.**

*The register.* The hand-written articles had Wikipedia's voice and the
generated ones did not, and that split was the whole of "it does not read
like an encyclopedia". The party article opened *"A party of the House of
Delegates holding 82 of 280 seats"* — a sentence with no subject in it,
which is a caption — and the person article opened with a fragment. Four
rules now, applied by four helpers at the top of `js/encyclopedia.js`:
`lede()` (the subject in bold, then a verb saying what it is — Wikipedia
does this without exception), `asOf()` (a figure the engine can move carries
its sitting), `axisProse()` (SCHEMA's poles, so "strongly public" and not
"−0.75", and it **counts** the axes rather than naming a number — "the four
axes" was written when there were four and survived the conversion to five),
and `categoriesOf()` (an article closes on what kind of thing it is).

*Liveness.* A section may carry `when`, gated by the same `Engine.matches`
events use, so a hand-written article gains a paragraph when the thing it
describes happens. The worked example is in `content/encyclopedia.js`: the
Commonwealth article says nothing about the Almanac Works until the House
annexes it. Sections are filtered **once**, before the contents list and the
body are built, or the two disagree and the contents points at a heading
that is not there.

*And the encyclopedia no longer knows it is in a game.* `characters[].note`
is the AUTHOR'S design notes — "Liabilities, not buffs. Her record is the
thing that can be dug up", "This is the sharpest tool in the game" — and was
printed verbatim as a person article's first paragraph. It is not printed at
all now; the article is derived, which is also what keeps it true through a
reshuffle. `npm run cx` gained a register check for second person and game
vocabulary in player-facing prose (quoted speech exempt), which found four
more and now fails the build on a fifth.

**Papers is gone**, folded into Government — an instrument, the register it
lands in, the court that can quash it and the office that assents to it are one
subject. Nothing named `pap` survives; `js/engine.js` used to emit `tab:"pap"`
targets and now emits `"gov"`.

**The indicator panel is on the Sitting screen and there is only one.** It used
to be drawn on Government and copied here by a `MutationObserver`. Do not
reintroduce the copy.

**THE COALITION ROSTER IS DRAWN ONCE, ON RELATIONS** (the Party tab until 24 Sep). It was drawn three
times until 21 Sep: Chamber's *Coalition* as party/seats/loyalty,
Government's *Coalition ledger* as partner/ledger/loyalty, and the refocused
Party tab with all four columns for all twelve parties grouped by relation —
which strictly contained both of the others. Both are gone.

- **Chamber kept the margin and lost the roster.** That panel is now
  *Confidence*, holding `#gov-margin` alone — the dual-majority bar and the
  working-majority reading, which is the number the government dies on and the
  one thing on that panel Chamber uniquely needed. The Composition table two
  panels down already drew all twelve with the partners marked `govrow`.
- **Government lost the ledger**, which left it *the act, the text, the power,
  the people*: instruments, the register, the document, order-paper time,
  undertakings, cabinet. Six panels in four columns. A per-partner credit
  account is interparty affairs, and this tab is the executive — that mismatch
  was most of what "lacking cohesion" meant.
- **The tips moved with the data.** `ledger` is on Relations' `Cr` column
  and `gov`/`cs` are on its relation headings. An inline tip there restating
  the `ledger` key's own words was dropped: two explanations of one thing can
  drift apart, and `js/tips.js` already owned it.

**Two faults surfaced doing it, both worth the space:**

- **`#gov-coalition` had a dead pulse.** The panel moved to the Chamber when
  the coalition arithmetic did and kept its `gov-` prefix, while
  `flashChanged` still gated it on `screen === "gov"` — so a loyalty change
  pulsed a row on a screen the player could not be on when the gate allowed
  it. An id that outlives the tab it was named for is how that hides. Both
  pulses now follow the data to `#party-table`.
- **One stray `</div>`** left by the removal unbalanced `#s-gov`, the parser
  reflowed the document, and the STATUS BAR fell outside `#shell` — so
  `chapter`, `rise`, `slots`, `signatures`, `confidence` and `margin` all
  reported as tips anchored to nothing. Six orphans from one tag. `npm run ux`
  caught it; the div counts per screen are the quickest confirmation.

Three things worth knowing before you touch the engine:

- `Engine.budget(st, C)` is the whole account a YEAR (receipts, spending,
  interest, the balance and the debt as shares of output), and
  `Engine.receipts(st, C)` its revenue side (bible §7.3). **Both take C now**:
  the bases and rates are content's (`setup.fiscal`). `tick()` charges the
  account for the days since the last tick; borrowing (`borrow`, the `loan.`
  move) is the only other thing that adds to `solvency`.
- `Engine.benchRoll(st, C)` seats the whole House without a division. It is the
  first half of `rollCall` lifted out; do not write a second way to seat it.
- `CONTENT.partyOrg` is the party outside Parliament, printed in the party's
  Concordance article since 23 Sep. Officers are deliberately
  NOT in `content/characters.js` — they hold no seat — but `namesTaken` reads
  them so the list-tier name generator cannot reuse one.

## Finding things without reading everything

`bible.md` is ~1,700 lines and `textbook.md` ~750. Reading either in full to
answer one question is the most expensive habit available here.

- `bible.md` carries a generated section index at the top, with a line number
  per section. Read the index, then the range: `sed -n '274,296p' bible.md`.
  `npm run toc` rebuilds it; `npm run tocheck` (part of `npm run check`) fails
  if it has gone stale. Never hand-edit the index block.
- `node tools/toc.js --index textbook.md` prints the same thing for the
  textbook without touching the file. Its `## CONTENTS` is in-world prose
  written by Charnock and takes no line numbers.
- Section status is in the index: **LOCKED** is settled canon, **OPEN** is
  genuinely undecided, **LEANING** is a working answer that may move.

Where the answer lives, when it is not obvious:

| Question | Look in |
|---|---|
| what a rule *is* | `bible.md`, via the index |
| what a number *is* | `bible.md` §11 named canon, or the content file itself |
| how it *reads* in-world | `textbook.md` |
| which seats exist, who holds them | `content/constituencies.js` — the roll |
| what a station is | `content/stations.js` |
| what an effect verb does | `js/schema.js`, then `EFFECTS` in `js/engine.js` |
| what is being built now | `sweep-brief.md` |

## Before changing anything

Read the relevant sections of `bible.md`. It is canon and it is long. In
particular:

- **§2.7 generation drift** — the station roster, the person roster and the
  glossary are frozen lists. Do not invent a station, a character or a setting
  term. Add to canon deliberately, in the content files, not in passing.
- **§1.5 engine constraints** — six or seven orthogonal scalars, deterministic
  resolution. **Do not add randomness to event selection.** Determinism is what
  makes balance testable.
- **§2.6 explanation cost** — one concept cluster per event. `tools/lint.js`
  enforces it.

`textbook.md` is in-world and knows nothing about the game. Where it disagrees
with the bible on a number, the bible wins. Where it disagrees on tone, it wins.

## The one architectural rule

**`js/engine.js` names no event, no party, no station.** Content is data in
`content/*.js`, conforming to schemas the engine defines. If you find yourself
editing the engine to add content, stop — the thing you want is a new entry in a
content file, or rarely a new verb in `EFFECTS`/`CONDITIONS` plus a matching
entry in `js/schema.js` so the editor can author it.

Content is `.js` rather than `.json` on purpose: `fetch()` is blocked on
`file://`, `<script src>` is not, so the game opens from disk with no server.

## Run the checks

```
npm install      # once, for jsdom
npm run check    # all thirteen, about two minutes
```

`uxtest` is about seventy seconds of that and `edtest` about twenty-five
(it opens every entry in the editor, design/34); the other eleven take a few
seconds between them. Run one on its own with `npm run <name>`.

| | |
|---|---|
| `test.js` | the ENGINE on the world's content alone: chamber arithmetic against the bible, tier reconciliation, instrument acceptance, 40-sitting smoke test. Plays no campaign |
| `tools/guards.js` | each campaign's own promises, in `content/campaigns/<id>/guards.js`: Flash I's chain, Act, tiers, pivots and canon run |
| `tools/lint.js` | legibility: concept load per event, terms used before taught |
| `tools/cxcheck.js` | Concordance links, see-alsos, banners |
| `tools/roundtrip.js` | the serialiser: serialise → reload → identical play AND identical data |
| `tools/renametest.js` | renaming every id preserves behaviour, and leaves no old id anywhere |
| `tools/edtest.js` | editor boots, every tab works, and opening an entry changes nothing |
| `tools/uitest.js` | menu into a running game, every screen renders, saves round-trip |
| `tools/uxtest.js` | focus, tips, audio, streaming, the division dialog |
| `tools/toc.js --check` | the bible's section index is current |
| `tools/enccheck.js` | every source file is UTF-8, no BOM, LF, no bad decode |
| `tools/prose.js --check` | the prose export round-trips |
| `tools/storymap.js --check` | every view's story map draws (`npm run storymap` writes them to `storymap/`, which is not committed) |

`tools/lint.js` is also where references are checked: every id a gate,
effect, promise, initiative or award names must exist (design/34).

**Run them after any content change.** They are the only playtester this project
has until a human one arrives.

### And one that is not in `check`

```
npm run layout   # needs a real browser; measures what jsdom cannot
```

**Install the narrow face first, or it measures the wrong interface:**

```
apt-get install -y fonts-liberation-sans-narrow
```

`--f-ui` is the terminal's own face and carries every label and table column.
Its stack is `Liberation Sans Narrow, Arial Narrow, Arial, Helvetica,
sans-serif`, and a runner with none of those installed falls all the way to
the generic and measures full-width Liberation Sans — **21.9% wider** than
the author sees (2562.7 against 2101.7 for a fixed test string). Passing
stayed sound, since measuring wide and finding no overflow implies none when
narrow, but the tool was reporting on a different typeface than the game
renders and nothing said so. Every run now prints the face it resolved for
each stack and flags a fallback, so read that block before trusting a width.
Segoe UI, Georgia and Bodoni MT are absent here too and always will be —
those fallbacks are expected, and the narrow one was not.

`tools/laycheck.js` boots the game in headless Chromium, measures the main menu,
walks all ten in-game tabs
and reports content that is **clipped** (the player never sees it) or that
**escapes its own border**. Every CSS trap listed below was found by measuring
rather than reading, and jsdom has no layout engine — `npm run ui` can prove a
panel exists and never that it fits. It is out of `npm run check` deliberately:
the ten there need only node and jsdom, and a check that silently skips when a
runner has no browser reads as coverage and is not. Run it when you touch the
stylesheet or a panel, and before a playtest build.

## Layout

```
index.html            the game
editor.html           the content editor
bible.md              canon, out-of-world. Read this first.
textbook.md           canon, in-world. Charnock's primer.
sweep-brief.md        the current build phase
content/*.js          everything authored: the world's
content/campaigns/<id>/  one campaign's story, one file per kind
js/engine.js          rules. Names nothing concrete.
js/ui.js              game rendering
js/editor.js          the editor
js/schema.js          the content vocabulary, machine-readable
js/refs.js            reference tracking for safe rename
js/coverage.js        what-to-do-next analysis
js/orbitchart.js      the habitat schematic
js/shell.js           main menu, save slots, options, player preferences
js/audio.js           the sound bus. Read its header before adding a cue.
js/focus.js           what survives a re-render: focus, selection, scroll.
                      The only selection store. Read its header first.
js/stream.js          text arriving a character at a time. Never called
                      from a renderer; see its header for why.
js/wait.js            the three ways the terminal says it is thinking.
js/tips.js            what the abbreviations mean. Explains the TERMINAL;
                      defers to the Concordance for the WORLD.
js/artifacts.js       named image slots. Reusable: key on a slot name, not
                      a path, and never make it menu-specific.
tools/harness.js      one jsdom, shared by uitest and uxtest
tools/                checks, index generator, image pipeline, bundle
tools/storymap.js     the story's wiring as a page: `npm run storymap`,
                      then open storymap/index.html. Generated, ignored.
```

## Things that have already gone wrong

One line each, kept because they will otherwise happen again. The long
version of any of them is in the header of the file it names.

**Content and state**

- `payWhips` clears the plan, so a caller that divided afterwards charged for
  nothing. Always use `Engine.divide()`.
- `apportionment_ratio` was stored beside seats and population and the three
  diverged. Derived, never stored.
- The district tier summed to 56 while parties held 140. `test.js` reconciles
  both directions.
- Bump `STATE_VERSION` when the state shape changes, and write the migration
  guard ASCENDING, one block per bump — a descending guard let a v1 save match
  `< 4`, get stamped 4, and skip every earlier block.
- Content owns identity (name, band, form, seats); the save owns simulation
  (closure, suspended, attested). `Engine.reconcile()` runs on every load
  because a new station used to leave older saves with a hole in `st.stations`.
- Player preferences go in `Shell.opts`; world state goes in the save. Mute in
  a save file silences somebody else's machine on import.
- `CONTENT.encyclopedia` is an object — `meta`, `banners`, `articles` — not a
  list.
- **Test a new gate against the OPENING state as well as the state it wants.**
  A chapter-four event was gated `scalarBelow:{public_standing:46}` to mean
  "the government has been weakened" — and standing OPENS at 44, so the gate
  was true from the first sitting and the event would have fired the moment
  the chapter began, whatever had happened. `Engine.matches(newGame(C), when)`
  answers this in one line. Deliberately NOT a check: 17 events legitimately
  match at the opening, because a `flagsAbsent` once-gate is supposed to, and
  Czarnecki's group opens at loyalty 12 on purpose. A checker here would cry
  wolf seventeen times, which is worse than none.
- **THE PLAYTEST MISREPORTED THE BUDGET, and it is the tool every balance
  question goes through.** `tools/playtest.js` read `r.carries` off
  `Engine.divide()`, which returns `{ok:false, reason}` or `{result, paid,
  assent}` — never `carries` — so every call was logged "lost". The
  transcript showed the Appropriation "lost" thirteen sittings running, which
  read as the budget failing thirteen divisions; a defeated bill is DEAD and
  would have been skipped, so every one was the House declining to divide,
  with its reason sitting unread in `r.reason`. Underneath that, "supply
  first" was not keeping supply's vote: **passing the budget costs five of
  the session's six slots** (four grants from first reading, one for the
  division), and once supply sat at third reading the loop spent the last
  slot on the next bill down — so two supply-first strategies fell on supply
  at the rise, refused twenty-two times for "no order-paper time left". A
  budget-first strategy now reserves what supply still needs. Result: all
  five supply-first strategies pass supply and reach the election; only
  *programme first* and *governs not at all* lose on it, which is the choice
  §7.7 is about. The same file printed every choice as "#1" because it read
  `.text` where choices carry `label`. **Two fields read by names the data
  does not use, both falling back to a placeholder without a word.**
- **DECIDED: ONE SESSION OF THREE SITTING PERIODS OF SIXTEEN** (22-23 Sep
  2026; `periodsPerSession: 3`, `sittingsPerPeriod: 16`,
  `sessionsPerParliament: 1` in `content/setup.js`, whose comment carries the
  measurements). For a day the three blocks were SESSIONS, which killed every
  bill not carried at a recess, made the prose's eighty-one "this session"s
  mean sixteen sittings, and broke the unpayable loan mid-run; a recess now
  refills order-paper time and ends nothing, the session's end (the last
  rise) is when bills fall and promises owed "before the House rises" come
  due, and the status bar reads SESS 4.2. `st.sessionEnds` is `st.risesAt`
  (the next rise, of either kind) at `STATE_VERSION 28`, and a save from the
  three-session day migrates to session 4, period 2. The blocks' length was
  chosen on these measurements: One session of twenty-four ran 31 sittings and met 29
  events, reached 48% of the authored set across all strategies, and no
  Flash I ending landed in any strategy but the scripted one, because
  `f1_joint` lands at sitting 47. Three of sixteen runs about 52 sittings,
  meets 43 events, reaches 61%, and lands `f1_joint` in three strategies.
  Two of twenty-four measured about the same but produced a cascade loss,
  and 3 × 24 produced five losses. Supply is carried ONCE per run and costs
  five of a session's six slots, so more, shorter sessions give more free
  slots after it. **The election ends the run and nothing comes after the
  count.** That was the author's decision on 20 Sep (`design/32-the-arc.md`,
  "canon decided here"), restated 22 Sep; §1.7 still said "mid-game" until
  it was corrected that day, and a plan was drafted from the stale section
  before the design note was read. **Read `design/32` before planning the
  run's shape.** It is written against one session of 24, so its sitting
  numbers are stale and its decisions are not.
- **THE ANNEXATION ACT HAD A ONE-SITTING MARGIN** — resolved 22 Sep by
  re-dating the Flash I chain for three sessions: stranded at 14, the survey
  four sittings, the law officer's opinion three, so the dilemma lands at 21
  with twelve sittings before the rise. Flash I's guards assert at least eight, so a
  longer chapter one cannot quietly spend the margin again.
- **THE BIBLE COPIES CONTENT, AND THE COPIES ROT.** The v5 audit (22 Sep)
  compared every section with the built game: all 34 station lines in §11.3
  matched content to the digit, while the party table carried five names
  from before the renames, §5.3 "LOCKED" a constituency schema nothing used,
  §12.4 listed six screens, §15.5 six checks, and §16 gated foreign affairs
  on a chapter-one size §1.7's own budget forbids. Where the bible restates a
  roster or a count, content owns it (§11.2 now says so); where the bible
  states a RULE, read `design/` for a later decision before obeying it.
- **CHAPTERS THREE AND FOUR WERE ALTERNATIVES, NOT A SEQUENCE** — folded 22
  Sep. A run that settled entered chapter four and ended at the dissolution
  with no campaign; one that dissolved first never saw the aftermath. The
  aftermath now plays in chapter two after the crisis result, while the House
  sits, each beat chained on the last with the `seen` condition (a
  chapter-two sequence has no prologue to order it). Every run that passes
  supply now goes to the country, and `test.js` asserts no chapter after the
  third and that the aftermath stops at the writs.
- **THE TWO SETTLEMENT FAMILIES RACED, AND FOUR ENDINGS WERE UNEARNABLE.**
  `checkSettlement` ranked the four personhood answers and Flash I's five
  tiers together and recorded only the winner, and only the tier marked
  `terminal:false` reached `resolvedAs`, which is what the achievements and
  the election beat read. Two channels now: `crisis: true` lands in
  `resolvedAs` once and stays, the rest in `settledAs`. Also: the `settled`
  condition compared truthiness, so `settled:"restriction"` was true of ANY
  settlement; it and the new `resolved` take an id or a boolean. And the
  interface announced an ending once per KIND, so a crisis result after an
  answer was never shown and the count never was: it keys on the ending now.
- **CRISIS TIME LEAKED, AND THE TOOL DID NOT SPEND IT.** The dilemma's five
  slots went into the general pool (the bills listed earlier took them) and
  stayed for good (eleven slots every later session). Reserved time,
  `{slots:{reserve:{bill:n}}}`, is spent only by that bill and goes at the
  rise, at `STATE_VERSION 27`. Then the playtest's own loop stopped when the
  GENERAL pool was empty, so it never spent the reserve either; fixed, and
  for the first time the generic strategies carry the Act and reach the debt
  trap by play (sitting 33). They then cascade at 41, because they never lay
  an emergency order: after the debt trap, holding the country is the game.
  The canon script had to put the ladder first for the same reason — six
  slots carry a programme or hold the country, not both.
- **THE EMERGENCY LOAN WAS UNREPAYABLE, AND ITS DEBT WAS NEVER CALLED** —
  both fixed 23 Sep on the author's decision that it is repayable.
  `f1_loan`'s undertaking had no `discharge`, and its breach named
  `f1_debt_called`, which was not an event, so it always broke and nothing
  followed. Now `repay_facility` (an initiative costing no order-paper time)
  settles it in cash, when the reserve can meet 19,800, or against the
  Cordell leases. If it is still owed when the House rises, `f1_debt_called`
  asks for 21,600 or the leases. The cash way is closed by a TEMPO `when`, a
  field an initiative's tempo can now carry.
- **AN AFFIRMATIVE ORDER COULD BE LAID AND NEVER APPROVED.** `makeInstrument`
  set `awaitingApproval`, charged the political cost, and nothing in the
  engine ever read the flag again — five orders were paid for and could
  never take effect, and since rung 4 of the thermal ladder is one of them
  and every rung above is gated on its flag, the emergency ladder stopped at
  rung 3 for everybody. One session hid it: the thermal drain after the debt
  trap could not reach zero before the House rose. Three sessions reached
  it and the canon run cascaded at sitting 42. `approveInstrument` /
  `canApprove` / `approvalForecast` are the missing half (a division, one
  slot, counted like a prayer the other way round; refused, the order
  lapses and may be laid again), with an Approve control on the
  Government tab. **A state flag that is set and never read is a mechanic
  somebody started.** `grep` for its readers the day it is written.
- **A CABINET EFFECT NAMING NO POST DOES NOTHING, SILENTLY.** `appoint`
  answers an unknown post with `{ok:false}` and effects discard results, so
  the vacant-Treasury event's "Fill it" — which the §7.6 rename had
  rewritten to `cabinet:{solvency:…}`, the post's scalar and not the post —
  left the Treasury empty and printed TREASURY BRIEF FILLED. `test.js` now
  resolves every `cabinet` effect in content against the posts and the
  person roster. A sweep renaming a scalar must leave alone a post id that
  happened to share the scalar's old name.
- **THE EDITOR REWROTE WHAT IT OPENED.** `commit()` runs on every click
  away, and the event form built a FRESH object from the fields it draws, so
  browsing the list deleted `at`, `maxFires`, briefs, a choice's gate, act
  and cost, and every condition the schema does not describe. It changed 73
  of 108 events, `f1_stranded`'s `at:14` among them. A `<select>` whose value
  is not among its options shows the first option and reads it back, which
  retargeted every `actor.`, `trend.` and `standing.` move. A form edits a
  clone of its entry now, and `tools/edtest.js` opens every entry of every
  tab and requires nothing to change. **A form that cannot draw a field
  must still carry it.**
- **A CHECK THAT ASKS ITS SUBJECT CANNOT FAIL** (design/34 §6). Put a gate
  on a bill that does not exist, or a breach naming no event, through
  `npm run check`: until 23 Sep every check passed both.
  - The rename test asked `js/refs.js` whether `js/refs.js` had missed
    anything; 32 kinds of reference had been missed.
  - The round trip compared forty sittings of play, not the data.
  - lint's flag audit did not read the awards.
  - One assertion was `Engine.agreement ? true : true`.

  Before trusting a check, break its subject and watch it fail.
- **A NAME READ THAT NOTHING WRITES IS A FEATURE THAT ISN'T THERE.**
  - The Party tab read `st.loyalty`, which does not exist, so every loyalty
    it printed was the opening one.
  - A division discharge read `lastDivision.carried` where the engine writes
    `carries`.
  - `characters[].current` is read in three places and authored nowhere.

  The same shape as the affirmative order above, from the other side.
- **A SETTLEMENT RECORDS AND DOES NOT INTERRUPT** (design/31 §4, built 23
  Sep). The engine writes a log and wire line when either kind lands. The
  interface opens no dialog and writes nothing to the session log, which is
  for finished governments. The closing prose is read on the last page,
  after the count.
- **A CASCADE DURING THE CAMPAIGN IS A LOSS** (the author, 23 Sep). It was
  OPEN: `checkEnd` read the election branch before any loss, so the margin
  could sit at zero through the campaign. `checkLoss` now knows the House is
  dissolved. After dissolution only the physical ends a run: no confidence
  vote, no leadership loss, but the cascade does. Before that change it also
  judged a dissolved House's majority, so the interface declared a
  government that lost seats at the count "fallen". A debt-trap government
  must now hold the country through the campaign, which is why
  `seek_terms` exists.
- **Chapter budgets are in bible §1.7 and worth reading before generating.**
  12-15 · 23-28 · 6-8 events since 22 Sep: chapter two now carries the
  result and its aftermath while the House still sits, and chapter three is
  the writs, the campaign and the count. Measured under three sessions before
  that change: chapter one meets 8 and chapter two about 39. Size a content
  round against the chapter, not the run total.
- **A CAMPAIGN HAS ONE CANON ENDING, AND THE NEXT CAMPAIGN OPENS ON IT**
  (bible §1.8, the author's decision of 22 Sep). The player can reach any
  ending; the next leader's campaign assumes the canon one, so a narrative
  runs across parliaments. **Flash I's canon is the debt trap, decided 23
  Sep: "a middle ground between perfect and failure".** It returns the PSD to
  government with austerity to come. Since design/40 (25 Sep) the canon
  reaches the count on 15 August, sitting 57, at standing 42: the PSD holds
  87 of 280 and the government's side 149, a narrow majority. The crisis is
  financed and now felt: it owes CW$44.9bn in Treasury bills (three quarters
  of the authority, 7% of output), with the dollar near 0.79 and headline
  inflation 5.8% against 3.0% underlying, which the vote reads. The canon
  government climbs the emergency ladder, keeps its last order-paper time to
  approve the emergency appropriation before the House rises (see
  `approvalFloor` below), asks Earth's banks for terms once the result is in,
  lays no order it cannot pay for, and reaches the count with the thermal
  margin at 8 and its payments current. The guard prints the margin, the
  side, the epilogue and the account. (25 Sep: it had been CW$16.8bn in
  arrears through the campaign, which cost nothing until that day; see
  ARREARS below.) (Before design/40: 103 seats, 165 of 280
  at standing 58, margin about five.) Flash I's guards
  (`content/campaigns/flash_i/guards.js`) assert that the canon ending is
  reachable by play and goes to the count; keep that true whatever else
  moves, until the author rewrites the canon.
- **AN EVENT INSERTED MID-LIST CHANGES EVERY RUN.** The pool's seeded lean
  is keyed on an event's POSITION in `EVENTS` (so renaming preserves runs).
  Inserting two events before `f1_meltdown` moved three playtest strategies
  from the debt trap at 34 to the joint mandate at 23. New events go at the
  END of the list, and the playtest before and after is the proof.
- **A SCALAR MOVES BY ONE RULE.** `move`, the trends, the couplings and the
  idleness drag each clamped to 0-100 themselves, and only `move` knew that
  solvency has no ceiling. So a solvency trend, or the debt trap's coupling,
  took the reserve from 52,000 to 100 in one sitting, every sitting it
  applied, and the debt trap's own gate (solvency under 35,000) was met by
  that bug. `bumpScalar` is the one writer now.
- **ONE LOYALTY PER BENCH** (the author, 23 Sep). A party with currents
  stores only the currents. Its own figure, and for the government's party
  the Party loyalty meter, are their member-weighted mean (`syncLoyalty`).
  A move on the party or the meter moves every current. The meter opens at
  48 where setup said 38, and the CDA reads 54 where `parties.js` said 23
  against currents averaging 54. `shiftLoyalty` is the only writer.
- **FOUR LAWS DID NOTHING, AND THE CHAIN AUDIT COULD NOT SEE THREE OF
  THEM.** `civic_clock_minimum`, `suspension_debt_accrual`,
  `shed_order_authority` and `tier_ratio_district` were in the law from the
  first draft. The first three now have bills and mechanics; the fourth was
  a copy of the roll's own count and is gone. The audit read events,
  initiatives and instruments as movers and never a bill, so a law only an
  Act sets looked unmoved. It reads bills now. A law the engine reads counts
  as seen through the price it sets.
- **THE DEBT HAS NAMED CREDITORS** (23 Sep, `STATE_VERSION 29`). It was one
  principal owed to Earth, and the Alliance's emergency facility, the one
  debt the campaign is built around, was a sum of money and a promise that
  the account could not see. `st.debt.owed` is keyed by lender; the terms
  (rate fixed or the quarrel's, cap, `serviced`, `repayable`, the account's
  note) are `setup.lenders`; an effect moves a balance with
  `{move:{"debt.<id>": n}}` and the reserve's side separately, since a loan
  is both. A promise to repay is `discharge:{repaid:"<id>"}`. The facility
  is 19,800 on the account (principal and printed rate, no service until
  the term) and `ec_borrow_case`'s draw, which added 16,000 and owed
  nothing, owes it to Earth now.
- **TWO STANDING LENDERS, AND THEIR TERMS ARE CONTENT** (24 Sep, the
  author's decision; design/13 §8.3's "no lender" is retired). Earth's
  banks lend through the **Standby Facility**, a syndicated facility of
  60,000 signed in 2078 with eight named banks; the **Underwriters** lend
  at home through **Commonwealth Reserve Notes**, 36,000 with seven named
  syndicates and mutuals. Both are `setup.lenders` entries: a rate built
  of `steps` that apply while a condition holds (a margin grid on
  friction; a coupon on the thermal margin; default interest under the
  reserve covenant), `limits` that lower the cap (the sanctions clause
  `suspends` the tagged European lenders, so their 20,000 is the
  syndicate's own sum and not a second number), and `onDraw` for what a
  drawing does besides the money. **`borrow` had Earth's politics written
  in** (friction +5, legitimacy −3, "EARTH MARKETS" on the wire) and would
  have made a placement with the Commonwealth's own insurers a quarrel
  with Earth; it applies the lender's `onDraw` now and names nobody. The
  Economy account has a Draw control per facility, each lender with
  `terms` gets a generated `lender_<id>` article, and `test.js` holds the
  commitments to the cap. The canon run and every playtest strategy were
  unchanged by it. **The expropriation clause is wired into Flash I**: a
  flag the world's terms name (`standby_default`: a drawstop and default
  interest; `standby_waiver`: half a point on the margin) and Flash I's
  `f1_standby_notice`, due once the Works is annexed with its bonds unpaid.
  Paying the bond (the notice's own choice, or `fa_conciliate`) cures it.
  The notice takes a sitting's event, so the canon count moved from sitting
  58 to 56 and its thermal margin from 4 to 6, both printed by the guard;
  the First and Cheapest playtest strategies still cascade, a sitting
  earlier.
- **EVERY SITTING PERIOD AFTER THE FIRST SAT SEVENTEEN** (found 25 Sep,
  design/37). `recess()` counted sixteen on from a sitting that was already
  the new period's first, so a session of "three periods of sixteen" sat 16,
  17 and 17 and dissolved at 51, while `sessionEndsAt()` dated everything
  owed "before the House rises" at 48. Every measurement above that says a
  run is about 52 sittings was taken on it. Corrected, and `test.js` holds
  each period to `sittingsPerPeriod`. (The canon's numbers have moved again
  since; the canon paragraph above has them.)
- **THE COMMONWEALTH DOLLAR** (25 Sep, `STATE_VERSION 31`; design/39
  option C, the author's decision; bible §7.5.3–§7.5.4).
  - **The account runs by the calendar.** Every flow is a rate a year and
    `tick()` charges the days since the last, so a recess counts. The
    appropriation is charged (it never was), interest is a year's and not a
    month's every sitting, and the bases are content's (`setup.fiscal`).
    The reserve used to RISE in every run that governed; it runs a CW$4bn
    deficit a year at the opening now, which is what the record shows.
  - **The unit is the million dollars, one for one with the MW-year**, so
    no sum in content moved. Print money with `Engine.money(C, n, cur)`
    (`cw()` in the interface), never `toLocaleString`.
  - **`st.macro`** is output, potential, inflation, expectations,
    credibility, the cash rate, the dollar and the Bank's reserves, run by
    `runEconomy` over the same days. The Bank meets every 42 days by a
    printed Taylor rule; a `law.reserve_direction` overrides it at a price.
    Every constant is `setup.macro`.
  - **The demand side reads the fiscal STANCE, not the balance.** The first
    cut read the balance, so the thermal price's drift (receipts on dearer
    heat) read as the government tightening and the Bank cut into rising
    inflation. `stance()` holds prices and output at the opening.
  - **A payment the reserve cannot meet is tendered as Treasury bills**
    (`automatic` lenders, `coverShortfall` in `bumpScalar`), up to the
    authority; past it, `st.macro.arrears`. Before this, spending at a zero
    reserve was free.
  - **A lender with a `currency` is owed in it.** `debtOf(st, id)` is the
    lender's own money; `debtHome(st, C)` converts. `{move:{"loan.<id>": n}}`
    borrows both sides at the day's rate; `debt.` stays literal.
  - **No new effect verb.** The `economy` verb moves the Bank's readings too
    (credibility, expected, inflation, shock, fx, reserves, rate), and
    `economyAbove`/`economyBelow` read them (plus `gap`, `debt`, `balance`,
    `overshoot`, `arrears`). `js/schema.js` lists both vocabularies, and lint checks
    names against it.
  - **The Economy tab has six panels**: the Reserve Bank and the dollar took
    the top of the third column, and the productive economy moved into the
    band. Below the collapse the panels are unplaced (`#s-econ .g-econ >
    .panel`): their id placements used to survive into one column and draw
    two of them two pixels wide.
  - **`T.noRevenue` freezes the whole account** (`st.macro = null`), because
    levying nothing no longer keeps the reserve still.
- **THE PRICE RULES ARE CONTENT'S** (25 Sep; design/39 §6). What moves the
  four prices and the productive economy is `setup.priceRules` and
  `setup.economyRules`: a base plus linear terms reading `from` a meter,
  "price.k" (a list sums), "law.k" (a number, or a `map` of level words),
  "rate.k" (weight defaults to the base's `passthrough`) or "economy.k".
  The engine names no price. **Proved byte-identical** against the old
  engine on the canon, the playtest and 126 probes. Two traps on the way:
  term keys named `scalar`/`price` matched lint's retired-verb scan (hence
  `from`), and the chain audit had to learn that a law a rule reads is
  seen.
- **THE LADDER IS ON THE DOCKET** (25 Sep; design/38 §7). `setup.alerts`
  puts a content-declared warning on the order of the day, and one that
  `raises` a scalar names the next order to lay or approve, found by what
  the orders do. The THERMAL chip reads the same alert. The thermal events
  offer the first rungs as choices. The playtest's strategies climb by
  reading the docket (`climbs`), and *First option, never climbs* keeps the
  case that ignores it. Costliest used to cascade and now reaches the count.
  **And the docket says how much TIME the ladder needs** (25 Sep): while a
  meter an alert `raises` drains past the alert's line before the House
  next rises (`Engine.meterDrift`: its trend plus the couplings dragging
  it), a `ladder` item counts the affirmative orders that raise it, laid or
  next, against the order-paper time left. Climbing strategies keep that
  much time, and Cheapest now reaches the count too; First option still
  spends its kept slot on a first-option choice and cascades.
  **A choice appended to an event still moves every strategy that picks by
  position** (Cycles, Programme first). Only the canon script's named picks
  are stable.
- **THE DESIGN AUDIT (design/37) left fourteen decisions with the author**,
  answered 25 Sep in design/38 (built) and design/39 (the economy, proposed).
- **THE SECOND AUDIT (design/40, 25 Sep) is built, E1–E14** (its
  "Answered" table says how). The parts to know before touching things:
  - **The world opens at rest.** A price rule's `ref: "opening"` measures
    an input from where the world opened; every base is the opening price.
    An event gated on a price must be gated where PLAY takes the price:
    three fired only on the old drift and were re-gated.
  - **Inflation is core plus pass-through** (`phillips.passThrough`, `lag`),
    and the pass-through reads CHANGES, so a price that stays up moves the
    level once. The Taylor rule reads `m.core`; the vote reads the headline.
    `m.inflation` is rebuilt every tick, so the `economy` verb's
    `inflation` lands on core. Growth is the quarter's, from `outputLog`.
    `STATE_VERSION 32`.
  - **Tax steps are a tenth and a fifth** (`setup.fiscal.rates`: relief,
    low, standard, high, surcharge; `none` stays for probes, no bill offers
    it). `Engine.costing(st, C, effects)` is the Treasury's costing of any
    law a level writes.
  - **`Engine.economyVote`** is the one reading of what the economy costs
    the government; `Engine.believed` is legitimacy's weight at the count
    (`setup.election.legitimacy`).
  - **Postures.** Every decision choice carries `posture`; the Sitting
    screen sorts by it and the engine keeps the authored index. See
    CONTENT_GUIDE.md.
  - **The opening House is 147** (five district seats moved, bible §8.4),
    and partners leave in two steps (`thresholds.supplyWithdrawn`).
  - **`approvalFloor`** on an instrument is how much of a government bench
    holds on its approval whatever its loyalty (default 0.75; 0.9 on the
    emergency appropriation and the standards order). Without it the
    canon's own benches refused the fourth rung by two votes.
- **THE BANK'S MEETINGS ARE DATES, NOT SITTINGS** (design/40 F1). A
  `bank` deadline carries the meeting's own `date` and counts `away` to the
  first sitting after it (`sittingFrom`), so it can tint a weekend. Anything
  that reads `deadlines()` must take `date` from the mark, never from
  `dateOfSitting(m.sitting)`.
- **A CHECK THAT READS A RETIRED CLASS PASSES BY ITS OTHER BRANCH.**
  `uxtest`'s rise check OR-ed the calendar grid's `.m-rises` (gone since the
  kind became the day's tint) with the next-three list, so it was really
  asserting "the rise is among the next three things", and the Bank's
  meetings ended that. An OR in an assertion is two checks, and each needs
  breaking on its own.
- **THE COUNT IS TAKEN AT THE END OF THE CAMPAIGN, AND IT LISTENS** (design/38
  §1).
  - `dissolve()` records the House that went to the country. `count()`
    takes the vote when `campaign_done` is set (inside `apply()`) or when
    `campaignSittings` run out, and `checkEnd` waits for `counted()`.
    **Never put the election back into `dissolve()`**: that is how the
    campaign became decoration.
  - A district's holder had a fixed 0.68 share, so no swing took a seat and
    the whole meter moved the PSD fifteen seats. Now a district has a
    notional result from `parties[].vote` and the roll. The holder's margin
    is ranked within its OWN party's seats; ranked across the House, the
    big party came out all safe.
  - `Engine.forecast()` is the count on a copy, and it feeds the polls.
  - The Single Tax Party could not hold three list seats under 4% and
    D'Hondt, so it holds four and the Liberals eighteen (the author, 25
    Sep). At standing 50 the count returns the opening House exactly, and
    `test.js` holds it to that.
- **STANDING FADES** (design/38 §1). 61 of 125 events offered free standing,
  and a greedy player hit 100 before the writs and won every count.
  `setup.standingDrift` pulls every band 5% a sitting toward 45, so standing
  has to be kept, not banked. **An event that adds standing and costs nothing
  is worth less than it was; one late in the run is worth more.**
- **A LOST MAJORITY IS A MOTION, NOT A VERDICT** (design/38 §3).
  - Partners walk out at `thresholds.partnerLeaves` and come back at
    `partnerReturns`.
  - A government below the majority faces a motion `motionAfter` sittings
    out. `checkLoss` no longer ends the run on the arithmetic.
  - `court` moves every partner that walked; `withdrawn` asks whether one
    has. `setup.onPartnerWithdraws` names the event; the engine names none.
- **AGING THE EVENT POOL WAS MEASURED AND LEFT OFF** (design/38 §4). The pool
  is over-subscribed (about twenty eligible for one slot), and aging only
  made runs alike. Question Time every eight sittings did what aging could
  not. `ageWeight` is 0 in setup.
- **THE RECESS TAKES DAYS, AND A GOVERNMENT HAS ITS OWN SEED** (design/38
  §5).
  - `recessDays` moves only the dates; `walkSittings()` is the one calendar.
  - The shell draws a seed at a new government, and the harness pins
    `Math.random` so the UI tests stay reproducible.
  - `Engine.newGame(C)` with no seed is still 20287, which is what the
    tests and the playtest use.
- **A STYLE THAT NAMES A PANEL WHICH NO LONGER EXISTS DOES NOTHING,
  SILENTLY.** The composition table listed a party's currents twice when
  it was opened with a measure named: the detail that opens with the
  party, and the division's faction rows, drawn under every party. The
  second set drew full size because the rule that indents them still named
  `#breakdown`, the panel they came from before it was merged. One set of
  rows now, under an opened party only. When a panel is merged or renamed,
  `grep` the stylesheet for its id.
- **A CAMPAIGN IS A UNIT** (23 Sep, `STATE_VERSION 30`; design/36 §3). The
  author writes the campaigns; Flash I is the proof of concept. An entry
  with `campaign:"<id>"` belongs to that campaign only; untagged is the
  world's. `CONTENT.forCampaign(admin)` builds a campaign's view (its
  entries, rebuilt indexes, setup merged one level deep, `opening`
  effects), and the shell, the tests and the playtest all play through it:
  **never hand the engine raw `CONTENT` for a game.** `st.campaign` and the
  `campaign` condition say which one is running. Lint checks tags and that
  no campaign can see an entry naming another campaign's id. That check was
  vacuous with one campaign, so it was proved by adding a probe
  administration and tagging a shared bill: eight hits, and none without
  the fault.
- **A CAMPAIGN IS A FOLDER** (23 Sep). Flash I's story is
  `content/campaigns/flash_i/`, one file per kind, each a
  `campaign("flash_i", { events: [...] })` call. `campaign()` is in
  `content/setup.js`: it tags every entry and pushes it onto the world's
  list, so nothing downstream learned a new place to look. The folder's
  files load after the world's and before `content/index.js` on BOTH
  pages. `ADMINISTRATIONS` in setup.js is empty on purpose; the menu's
  order is the folders' load order. Two tools had to learn the folders,
  and each was proved by breaking it: the editor's export
  (`Serialise.files` writes a kind as the world's file plus one per
  campaign, and `tools/roundtrip.js` and `tools/edtest.js` assert the
  split), and the prose write-back (`tools/prose.js` looks in the entry's
  campaign file first, then the world's, then every campaign file, since
  administrations are not tagged).
- **THE ENGINE'S TESTS PLAYED A CAMPAIGN** (23 Sep). `test.js` played
  Flash I and asserted its story among the engine's rules, so a rewrite of
  the story (which is what the author means to do) would throw at the first
  assertion naming a removed event and take every engine test after it
  down. The engine's tests play the world's view now (`tools/testkit.js`
  `world()`), and each campaign's story is asserted in its folder
  (`content/campaigns/<id>/guards.js`, `npm run guards`), each block in a
  `guard()` that cannot take the next one with it. Proved by rewriting
  Flash I in a scratch edit: `test.js` stayed green and two guards failed,
  each saying why. Two traps in the move, both measured: an engine feature
  whose only test used a Flash I fixture (reserved time, named creditors,
  the crisis channel, an event's own effects) got a probe test in
  `test.js`; and a check that sweeps CONTENT for well-formedness ("no event
  opens a fourth chapter", "the count fits the campaign") went quietly
  narrower on the world's view, so those sweep `ALL` or every view
  (`T.views()`). The second found nothing broken; Flash I's canon election
  is the tenth chapter-three beat in a twelve-sitting campaign.
- **COUPLINGS HAVE GROUPS** (24 Sep, mutual vulnerability). One line
  applied across ALL couplings, so a second consequence of friction (Earth
  paying for its own blockade) could only replace the blockade's drag. The
  highest line applies per `group` now (default: the meter, so nothing
  written earlier changed), and a line may carry a `when`. The canon run and
  every playtest strategy were unchanged by it, and `test.js` breaks when
  the grouping does.
- **AN EVENT'S OWN `effects` WERE APPLIED BY NOTHING** (found 23 Sep).
  Content put the accounts freeze's flag on the event, "because the
  accounts freeze in the body", and `choose()` applied only the choice's.
  So `f1_frozen` was never set: the Systemic Meltdown was unreachable in
  every run, and the indemnity's two paying branches could never pay.
  Lint's flag audit counted the flag as set, because it reads every effects
  array. `choose()` applies the event's effects, then the choice's. The
  editor had the same blind spot for `{flag:{x:false}}`, the only way to
  clear a flag: it drew one flag name and wrote "[object Object]" back. A
  value the form cannot draw is a raw JSON row now.
- **`characters[].current` is authored now** (23 Sep). It was read by the
  bench roll, the members list, the signature count and the reshuffle, and
  carried by nobody. `test.js` asserts every popular-seat member of a party
  with currents has one of their own party's.
- **ARREARS COST NOTHING, AND THE CANON RAN ON THEM** (25 Sep). Past the
  bill authority `coverShortfall` wrote `st.macro.arrears` and nothing read
  it, so spending past the cap was free, and the canon ran CW$16.8bn unpaid
  for its last seven sittings. Its policy's "last days before the rise"
  test stayed true after the dissolution, so it laid a CW$32bn rung during
  the campaign. Now:
  - money coming in pays arrears first (`credit()`: receipts, loans and
    drawings alike);
  - a coupling may read an economy reading (`meter: "economy.arrears"`), and
    content's two lines cost standing, legitimacy and loyalty;
  - the bills and the notes add a point while in arrears;
  - `economyBelow:{headroom:n}` reads the room left under the tender;
  - two alerts (`bill_authority`, `arrears`) carry a `how` in words and an
    `id` on the docket item, which the canon policy reads.

  Lint now checks couplings and alerts, which it never read before.
- **A SECOND `function` OF THE SAME NAME REPLACES THE FIRST EVERYWHERE.**
  The engine is one closure, and a function declaration is hoisted, so a
  new `function drift(st, C, k)` for the docket silently replaced the
  price rules' `function drift(now, target)` two thousand lines up. Every
  price and economy rule read the wrong function, and the only symptom was
  a playtest strategy that never calls the new code cascading four
  sittings early. `grep -n "function <name>"` before naming one; the
  docket's is `meterDrift`.

**CSS and layout traps, every one found by measuring rather than reading**

- An id outranks `.screen{display:none}`, so `#s-orb.screen{display:block}` put
  the habitat map on every tab at once. Any rule whose subject is a `#s-…`
  screen must include `.on`.
- Setting `scrollbar-color` or `scrollbar-width` makes Chromium silently ignore
  every `::-webkit-scrollbar` rule for that element. The standard properties are
  fenced behind `@supports not selector(::-webkit-scrollbar)`.
- `overflow-x:auto` forces `overflow-y:auto` too. Anything that scrolls in one
  axis says so in both.
- An inline `<svg>` with a viewBox and no width fills its container, so
  shrinking the coordinate space only magnifies the drawing.
- A class named for an appearance gets borrowed for anything wanting that
  appearance: `.sel` came to mean four things at once. It now means selection
  only; `.warn`, `.inforce`, `.vacant` and the editor's `.here` say what they
  mean, and differ in form as well as hue.
- The same trap from the other side: reusing an EXISTING component's class
  name for a new component. The main menu's ticker was nested in `.ticker`,
  whose `.ticker div` rule sets `padding-left:100%`, so every headline was
  pushed exactly one screen right and off the edge — rendering correctly,
  present in the DOM, invisible. Found by measuring: a span at x=1195 in a
  container ending at x=1195. Check whether a class exists before taking it.
- A fix for a column that must FIT is a bug in a column that SCROLLS. `.panel`
  carries `min-height:0` and `overflow:hidden` so it shrinks-and-clips instead
  of painting over its neighbour — correct in a grid row, wrong inside
  `#s-gov .stack`, which scrolls: the panels gave up their height to the column
  and then clipped what no longer fit. Undertakings measured 14px of content
  cut off inside a 14px box. Panels in a scrolling column are `flex:0 0 auto`.
- `.panel` clipping is only safe because "every `.pbody` is a scroller" — and
  `.pbody` carried no flex sizing, so it kept its content height as its basis
  and the PANEL clipped instead of the BODY scrolling. The content became
  unreachable, which is the one outcome that construction exists to prevent.
  `.panel > .pbody.scrolls` is `flex:1 1 auto;min-height:0`.
- **A COLUMN THAT SCROLLS IS A COLUMN WHOSE CONTENTS WERE NEVER SIZED.** The
  Economy tab had eight panels in three `.stack.scrolls` columns, and all
  eight of them scrolled at 1366x768. Column scrolling hid the real fault
  instead of showing it: the first column needed 706px and the second 397px,
  so one scrolled while the other held eighty pixels of air, because panels
  had been placed by what they were ABOUT and never by how big they were. The
  fix was not CSS — it was measuring each panel's content need (250 / 282 /
  230 / 154 / 221), merging the three that were about the same four things,
  and PLACING five panels in named grid cells so no column has anything to
  divide. **Measure the content need, not the box:** a `.pbody` with
  `flex:1 1 auto` is GROWN to fill its panel, so `scrollHeight` reports the
  box and not the need, and every fitting panel looks exactly full. Sum the
  in-flow children instead.
- **And "no scrollbars" is a matter of FITTING, never of removing `scrolls`.**
  Every `.pbody` keeps it: an `overflow:auto` box with nothing overflowing
  draws no bar, and the class is the net that stops a squeezed panel clipping
  content nobody can reach. Taking it off to guarantee no bar guarantees the
  one outcome the construction exists to prevent.
- **Rows go `auto` then `1fr`, not `1fr` then a cap.** With the Economy's top
  row on `1fr` all three panels fitted and each held about 200px of trailing
  grey. Content-size the row that holds tables and let the band take the
  slack — a bar chart's extra height is amplitude, which is what the panel is
  for.
- **A heading that gains a control is no longer only words.** `.panel > h2` is
  a nowrap flex row; the chart's title, subtitle and two timescale buttons
  came to 429px in a 397px panel at 820px wide, so a button was drawn 32px
  outside its own frame. Scoped `flex-wrap` on that one heading — a rule whose
  subject is every heading in the interface is not the way to fix the one
  heading that holds a control. (The control was under the plot before, where
  it cost the panel 37px it had never been given and the chart scrolled by
  exactly the height of those two buttons at EVERY window, the author's
  included.)
- **`flex:1 1 0` with no cap means one data point fills the plot.** A first
  sitting's single bar was drawn the full width at 2% height — a rule across
  the bottom of the panel, not a chart. `max-width:26px` costs a full
  sixty-bar series nothing at 1,000px and leaves a partial one growing from
  the left, which is what a series does.
- `npm run layout` measures all of the above. It also learned not to cry wolf:
  `scrollHeight` counts absolutely positioned children, and this interface
  hangs things proud on purpose (the dual-majority threshold tick sits at
  `top:-2px`), so a fault is confirmed against IN-FLOW children only.

**Interface**

- **A NUMBER THE INTERFACE PRINTS IS CONTENT'S NUMBER — three found in two
  days.** The chart's record button read `2280-2287` as literal text while
  `setup.history` owns the span, so moving the canon date left a control
  naming years the data no longer covered; `tools/uitest.js` had the same
  literal as `/228\d/` and was the one assertion the date sweep broke. Both
  derive from `setup.history` now. The third is below.
- **A NUMBER THE INTERFACE PRINTS IS CONTENT'S NUMBER.** The status bar had
  `SIGNATURES n/9` and reddened at 7 as literals, while
  `setup.thresholds.ballot` is **12** and `signaturePanel` fifty lines down
  reads it properly — so the bar told the player a ballot needed nine names
  when it needs twelve, and went red five short of the number that actually
  matters. Two places holding one number is the `apportionment_ratio` lesson
  from the other direction, and a hardcoded threshold is invisible to every
  check that does not compare it against its source. Found while checking a
  fact for a prose rewrite, which is an argument for doing that checking.
- **AN ADMINISTRATION'S `setup` OVERRIDES ARE THE SESSION'S, not one call's.**
  `Shell.contentFor(admin)` merges them and was handed to `Engine.newGame`
  and then THROWN AWAY, so the opening STATE was built from Flash I's
  `startDate: "2080-04-11"` while every engine call afterwards got the
  unmerged `C`, whose placeholder is 2287. 207 years apart. `sittingOfDate`
  counts forward from `C.setup.startDate`, so every day of the campaign's own
  month was "before the start" and returned null: not one day in the calendar
  carried a sitting number, `past`/`today` were false for every day so the
  calendar never marked today at all, and the hover card told the player the
  House does not sit on any Monday in April. It hid because the two halves
  disagree SILENTLY — the day cell tints off `d.sits` (a weekday test, right)
  and the card reads `d.sitting` (the count, null) — so the grid looked
  correct and only its tooltips lied. Three entry points needed it: a new
  government, a loaded slot (resolve the admin from the save's own `admin`
  field) and an imported file. `contentFor` is exported so nobody writes a
  second merge, and `UI.content()` exists beside `UI.state()` so the two can
  be compared: nothing could see both at once, which is why it survived.
- **A predicate and its negation are not always two cases.** The calendar
  card branched on `d.sitting != null` and said "the House sits four days in
  seven, this is not one of them" for everything else — including a Monday
  before the session opened, which is one of them. Three cases: numbered,
  a sitting day outside this session, and not a sitting day.
- **A HIDDEN LEGEND IS NOT AN EXPLAINED ONE.** The calendar key was hidden to
  save height on the grounds that "the colours are already explained by the
  hover card". A hover card explains THE DAY IT IS ON, not what a colour
  means, so the only way to learn that a pip is a division was to find a day
  carrying one. It cost nineteen pixels of a panel that had given up two
  hundred.
- **A TRUTHY GUARD AROUND A MISSING FUNCTION IS SILENCE.** `js/ui.js` called
  `Concordance.knows(id)` behind `Concordance.knows ? … : false`, and `knows`
  was never written — so it answered false for everything and EVERY
  `[data-go]` outside the Concordance tab did nothing. A party name on the
  Chamber tab, a station on the orbit table, a constituency in the roll: all
  inert, which is the exact fault the comment there says the attribute exists
  to fix. Same class as the miss `tools/edtest.js` was written for.
- **`data-go` BELONGS TO TWO SYSTEMS**, so the handler is scoped to `#shell`
  positively rather than by excluding `#menu`. The main menu has used the
  attribute since before the Concordance existed (`new`, `load`, `awards`,
  `options`, `credits`, and `root` on every sub-screen) and `root` IS an
  article id — so the moment `knows` answered truthfully, the menu's own Back
  button would have jumped into the Concordance.
- **A CONTAINER'S ONLY CHILD IS NOT THE CONTAINER.** The Concordance search
  wrote its results into `#cx-body`, whose only child is `#cx-article` — the
  element every article render targets. One search destroyed it,
  `drawArticle` set `.innerHTML` on null, and the Concordance became a
  one-way trip: nav links, the search hits themselves and the back button
  were all dead, because all three end at the same `goCx`. `drawNav` runs
  before `drawArticle`, so the nav highlight moved while the page under it
  never changed — the interface said it had navigated.
- **THE HARNESS MUST RUN THE SCRIPTS THE PAGE RUNS, and it was not.**
  `tools/harness.js` kept a hand-maintained list of forty-odd filenames
  beside `index.html`'s own forty-odd `<script src>` tags, and they drifted:
  `js/schema.js` was added to the page when the axes became signed and never
  added to the harness. So `SCHEMA` was undefined under test while defined
  for every player, the Concordance's `typeof SCHEMA !== "undefined"` guard
  took its fallback branch, and every party article showed `economic: -0.75`
  in `npm run ui` and *strongly public* in Chromium — **the harness was
  measuring an interface nobody has ever seen**, and neither list could
  report the drift because neither knew about the other. The list is DERIVED
  from `index.html` now, in document order. Also: a top-level `const` in a
  classic script shares the global lexical environment in a browser but does
  NOT cross jsdom's separate script evaluations, so a module meant for both
  assigns to `window` explicitly the way it already assigns to `module`.
- **jsdom's `HTMLAnchorElement.click()` does not dispatch**, so a probe using
  it reported the Concordance nav as broken when it was not. Anchors are
  exercised with a real `MouseEvent`; a "bug" found only through `.click()`
  on an `<a>` is the harness, not the game.
- Renderers replace containers wholesale, so focus falls to `document.body` on
  every state change. `js/focus.js` restores it by DATA KEY, never by index, and
  owns the only selection store — selection used to live in four places and the
  order paper hardcoded its highlight as a result.
- `.focus()` scrolls its target into view and will undo a scroll restore
  standing next to it. Restore with `{preventScroll:true}`, scroll after, and
  `scrollIntoView` only on a move the player asked for.
- Two listeners for one action is not twice as safe: `[data-go]` was bound in
  both `js/ui.js` and `js/encyclopedia.js` and every click rendered twice,
  invisibly. A keyboard path reaches the existing handler (`el.click()`).
- Sound comes from engine effects and user actions ONLY — never from `drawAll()`
  or anything reachable from it. Streaming text obeys this too: the renderer
  puts the finished text up silently and the ACTION HANDLERS reveal it.
- A division resolves on the click, before its dialog opens. That is what makes
  skipping safe and "muted reaches the same state" testable.
- Blanking text to type it out collapses the block; measure and hold the height.
- `js/tips.js` explains the TERMINAL; the Concordance and glossary explain the
  WORLD, and a tip with no body falls through to them, so nothing restates canon
  (§2.7). `?` is the keyboard trade: annotated readouts enter the tab order on
  the visible screen only. The Concordance screen itself carries no annotations
  on purpose — it is not government chrome, and it is where tips send you.
  `tools/uxtest.js` asserts an explanation nobody anchors is a failure, because
  it reads as coverage and is not.
- There is NO ASSET LOADING and cannot easily be: on `file://`, `fetch()` and
  `XMLHttpRequest` both fail. Base64 in a `.js` file through `atob` into
  `decodeAudioData` is the route that works.
- **The globe's do-over was three faults and none of them was speed.** Measured
  before touching it: a globe redraw is **4.9ms** (the drag calls only
  `c.innerHTML = World.render()`, not `drawAll()`, which is 42ms) so dragging
  had three times the 60fps budget spare. The real ones were: an anchor
  compared `a.host` ("Brazil") against a selection (`"BRA"`), so
  `.w-anchor.sel` sat in the stylesheet unreachable and selecting a country
  never lit its anchor; **152 selectable country paths and not one tab stop**,
  on a screen whose siblings are all keyboard-navigable; and `view.zoom`, read
  in four places and written by nothing, so the projection supported
  magnification the interface never offered. Anchors now carry an `iso`, a
  7px transparent hit disc (`fill:transparent`, since `fill:none` is not
  hit-testable) and a tab stop each — twelve, or however many face the
  viewer, against 152 paths that stay mouse-only.

**Text and encoding**

- A console that misreads UTF-8 will talk you into corrupting a file. PowerShell
  5.1 printed a correct em dash as the three characters U+00E2 U+20AC U+201D;
  the `Set-Content` "fix" for that phantom wrote the mojibake in for real, with
  a BOM, and `js/ui.js` shipped with `TONE_MARK`'s `−` and `·` expanded into
  that wreckage — so the live dossier printed it between every field. Never
  judge bytes by what a terminal drew. `npm run enc` is the only verdict.
  (This file names the damage by code point on purpose: prose that spells it
  out literally IS mojibake, and trips the check it is trying to explain.)
- The obvious test for that corruption is wrong, which is how it shipped after
  being verified: a scan for `Ã` in DECODED text finds nothing, because
  double-encoded UTF-8 decodes to `Â`. `Ã` is the raw-byte spelling. So
  `tools/enccheck.js` reverses the damage rather than matching it — a run is
  mojibake iff re-encoding it as CP1252 yields one valid non-ASCII character —
  and the reversal is also the repair. It works per RUN, not per file, because
  `js/ui.js` was only partly mangled and a whole-file reversal would have
  destroyed what was still right.

Every one of these is asserted somewhere in `npm run check`. Three of the checks
exist because of a specific miss: `tools/edtest.js` because a form function was
referenced in the editor and never defined, `tools/uitest.js` because a blank
screen is invisible to every static check, and `tools/enccheck.js` because
mojibake is invisible to a reviewer reading the same broken console.

## Authoring

See `CONTENT_GUIDE.md`. The short version: copy an existing entry in
`content/events.js` and change it. Effects and conditions are a closed
vocabulary — if it grows past about twenty verbs, content is leaking into the
engine.
