# OPENCODE — WORK ORDER

**Written 19 September 2026 by Claude Code, for opencode to pick up.**
This file is the async channel between the two agents: the author is often at
a phone with access to one of us and not the other, so a task that cannot be
spoken is committed here instead. If this file and a live instruction from the
author disagree, the author wins and this file is stale — say so and move on.

**Check the git log before starting.** Tasks are marked `[ ]` / `[x]`. Tick one
as you land it and commit the tick with the work, so the next run of you knows
where it is. When every box is ticked, delete this file.

The previous work order (T1–T20, 15 Sep) is closed. Every box was ticked and
the file has been replaced by this one. The aim now is a **playtest build**:
something a human can be handed without an apology.

---

# PART 0 — READ THIS FIRST: WE SHIPPED CORRUPTED TEXT

Not a warning about something that might happen. It happened, it went live,
and it was declared fixed twice while still broken. You need to know the shape
of it, because the trap is set for you exactly as it was for the last agent.

## What happened

1. **A terminal lied.** PowerShell 5.1 decodes UTF-8 as Windows-1252, so a file
   containing a correct em dash `—` *displays* as three junk characters. The
   file was fine. The screen was wrong.
2. **An agent believed the screen and "fixed" it.** Rewriting the file through
   that same codec wrote the junk in for real and added a BOM. Correct text
   became corrupt text at the moment of the fix.
3. **It shipped.** `js/ui.js` went live with `TONE_MARK`'s minus and middle dot
   each expanded into four characters, so the dossier printed wreckage between
   every field. 187 sequences in that file, 4 more in a content example.
4. **The verification could not have worked.** The test that cleared it searched
   the *decoded* text for `Ã`. Decoded, double-encoded UTF-8 reads `Â`; `Ã` is
   the raw-byte spelling. The test looked for something that is never there,
   matched zero, and reported a mangled file clean. Twice.

Point 4 is the one to remember. The bug was cheap. The **false confidence** was
expensive: it cost two sessions and a live deploy, because everyone believed a
number that could only ever have been zero.

## The rule, and it is not negotiable

**Never read or write source through a Windows shell.** Not `Get-Content`, not
`Select-String`, not `Set-Content`, not `Out-File`. Read with your editor's read
tool or `node -e`; write with your edit/write tools or `node`. `AGENTS.md` has
the long version.

**Never hand-roll a test for this.** There is one:

```
npm run enc              # every tracked text file
node tools/enccheck.js --fix   # and it repairs what it finds
```

`tools/enccheck.js` does not pattern-match the damage — it **reverses** it. A
run is mojibake if and only if re-encoding it as CP1252 yields bytes that decode
as one valid non-ASCII character. That is decidable, it cannot produce the false
negative above, and the reversal is also the repair. It runs per *run*, not per
file, because `js/ui.js` was only partly mangled and a whole-file reversal would
have destroyed the characters that were still right.

It is in `npm run check`, so it now gates **CI, the Pages deploy, and your own
pushes** — `.github/workflows/opencode.yml` runs `npm run check` before it
pushes anything you wrote. You cannot ship this again. Do not route around it.

**One more thing that will catch you out:** prose that spells the damage out
literally *is* the damage, and will fail the check. If you need to describe
mojibake in a comment or a doc, name the code points (U+00E2 U+20AC U+201D), as
`CLAUDE.md` and `tools/enccheck.js` now do.

## What else changed while this was being cleaned up

- **`.gitattributes`** — `* text=auto eol=lf`. A Windows checkout had been
  rewriting the tree to CRLF, which broke `tools/toc.js` and, because Pages runs
  the checks before it deploys, **silently held the live site back for weeks**
  while every local run looked fine. Line endings are settled in the repository
  now, not in each clone's config.
- **`npm run layout`** (`tools/laycheck.js`) — boots the game in real headless
  Chromium, walks all eight tabs, and reports content that is clipped or drawn
  outside its own border. jsdom has no layout engine, so `npm run ui` could only
  ever prove a panel *exists*, never that it *fits*. Not in `npm run check` (it
  needs a browser binary); run it if you touch anything visual.

`npm run check` is now **ten** checks. All ten must pass.

---

# PART 1 — WHERE THE BUILD ACTUALLY IS

Measured today against `7b7588f`, not inferred. Re-take any of it by playing
the engine headlessly the way `test.js` does.

## Content inventory

| | |
|---|---|
| events | **81** |
| bills | 8 |
| instruments | 13 |
| initiatives | 7 |
| quiet business | 80 |
| settlements | 9 |
| characters | 54 |
| actors | 15 |

## The shape of a run

A session is **24 sittings**. The House rises, the parliament dissolves, chapter
three *is* the campaign and runs about 12 more sittings, and the count ends the
run. So a full run is roughly **36 sittings** and fires **20–28 events**.

## The number that matters

**Events by chapter: ch1 = 22, ch2 = 55, ch3 = 3, ch4 = 1.**

Chapter two is 68% of the game. **Chapters three and four are four events
between them** — and they are the campaign, the count and the aftermath, which
is to say they are the part a playtester will remember. The ending is the
thinnest and least exercised thing in the build.

Four mechanical strategies over 60 sittings reached **37 of 81** events. The
other 44 did not fire. **That is not the same as unreachable** — most are gated
on states a blind strategy never creates (low standing, a vacancy, a pairing
offer, a particular settlement). Do not treat the list below as dead content.
Treat it as the question *"can a player actually get here, and is it worth the
trip?"*

Never fired in those runs, by chapter:

- **ch1 (11)** — `the_rules_of_the_house`, `guild_answers`, `review_reports`,
  `position_lands`, `fa_mars_reply`, `quota_forward_settles`,
  `indemnity_settles`, `volume_charter_settles`, `substrate_debt_settles`,
  `the_deck_again`, `tr_ruling`
- **ch2 (32)** — `ch2_carveout_price`, `ch2_psa_conference`, `party_fracture`,
  `standing_low`, `threshold_consequence`, `leadership_ballot`,
  `minister_resignation`, `substrate_drift`, `order_paper_empty`,
  `the_vacant_post`, `signatures_build`, `the_licensing_reaction`,
  `the_delegation`, `the_federal_option`, `the_opposition_asks`,
  `the_engineers_write`, `one_g_waiting`, `f1_water`, `f1_meltdown`,
  `f1_accounts_freeze`, `fa_anchor_withdrawn`, `fa_two_fronts`,
  `the_floor_presses`, `the_minimum_berth`, `the_sublet_market`,
  `the_agricultural_deck`, `the_congregations`, `the_pairing_offer`,
  `the_pairing_kept`, `tr_reference`, `tr_challenge_lodged`, `the_paper`
- **ch3 (1)** — `f1_pyrrhic_election`

**The aftermath is fine — do not go looking for a bug there.** An earlier draft
of this brief said `ch4_settled` and `ch4_after` never fire. That was wrong, and
it was wrong for an instructive reason: the measuring harness was not calling
`Engine.checkEnd()`, and `checkEnd` is what sets `st.settledAs`, which is what
the `settled:true` gate reads. Drive it the way `afterAction()` does and both
events fire, chapter four is reached, and a settlement lands (`f1_joint` on two
of the four strategies). The gate is correct; the probe was not. Corrected here
rather than quietly, because a work order that sends you hunting a phantom is
the same failure as the encoding test in Part 0 — a measurement that could only
ever have returned the answer it returned.

---

# PART 2 — THE TASKS

Your lane is `content/*.js` and prose. Do not touch `js/`, `tools/` or
`test.js`. Nothing below needs an engine change; if you find one that does,
stop and write it under OPEN REQUESTS rather than reaching for the engine.

## T21 — [ ] The ending is four events deep. Make it a chapter.

The highest-value content work in the repo. Chapters three and four hold four
events while chapter two holds 55, and the run *ends* there — it is the last
thing a playtester reads and the thing they will describe to you afterwards.

Chapter three is the campaign and the count; chapter four is the aftermath.
Write toward **8–10 events for ch3 and 5–6 for ch4**, drawn from what the run
actually did: the settlement reached (or not), the seats lost, the undertakings
kept and broken, who was in the cabinet at the rise. The machinery to read all
of that already exists — `settled`, `dissolved`, `campaign_done`, `resolvedIs`
and the undertaking ledger are all conditions you can gate on today.

Nothing is broken here; there is simply almost nothing written. Chapter four is
one event long, and it is the last page of the game. Two of the four measured
strategies reached a settlement (`f1_joint`) and two ended at the count with no
settlement at all — those are two different endings and both currently read
almost identically. Start there: make the settled ending and the unsettled one
feel like different outcomes.

## T22 — [ ] Find out which of the 42 are reachable, and prune or open the rest

Go down the list in Part 1. For each, answer one question: **what state does a
player have to be in for this to fire, and can they get there?** Three outcomes:

- reachable and good → leave it, note the state that reaches it
- reachable only through a state the game cannot produce → loosen the `when`
- authored against a mechanism that changed underneath it → rewrite or delete

Write the answers into the event as a comment. The next agent should not have
to re-derive this.

## T23 — [ ] A run repeats itself before it ends

`fa_window_closes` fired six times across the four measured runs — three times
inside a single 24-sitting session — while 44 other events never fired at all.
A weighted pool with no memory reaches for the same high-weight event
whenever its condition holds, so the tail of the pool is never seen — that is
the "nothing new is happening" feeling in a build that has 81 events in it.

`once` and `maxFires` are the instruments and they are already in the schema.
Audit the chapter-two pool: anything narrative should be `once`, anything
atmospheric should carry a `maxFires` and a lower weight. This is a content
pass, not an engine change.

## T24 — [ ] Chapter one is 22 events and teaches the game

It is the tutorial chapter and it is loss-proofed (`design/21` §5). Read it as a
first-time player: does it teach the order paper, the whip, supply and the
Concordance *before* chapter two starts spending them? `the_rules_of_the_house`
is in the never-fired list and it is, by its name, the one that teaches the
rules. Find out why it does not fire.

---

# PART 3 — WHAT CLAUDE IS DOING, SO YOU DO NOT COLLIDE

Engine lane, in this order:

1. **The clock.** The author's standing complaint is that *the loop has no
   concrete time schedule*. The programme motion (`design/25` §2), so the player
   tables her own dates, and the Flash I chain firing **by date rather than by
   weight**. This will change how events are selected — it is the engine half of
   your T23, so expect the pool to behave differently underneath you.
2. **The layout findings** `npm run layout` now reports: three panels clipping
   on the Government tab at 1000px, `#p-whip` at 1280px, `.dmbar` drawing
   outside its border at every width.
3. **Reviewing the endgame code** that was written in the content lane on
   17 Sep — `afterAction()` → `checkEnd` → `Dialog`. It works; it wants the
   screen the design describes rather than a dialog. Your T21 prose will land
   on it, so write the prose as though it has room.

## Do not

- **Do not touch the `stances` block.** Vote arithmetic is Claude's lane.
- **Do not add a letterhead or image field.** `js/artifacts.js` owns slot
  declarations; the slot has to exist there first.
- Do not renumber or reorder the bills.
- Do not invent a station, a character or a glossary term (§2.7).
- Do not read or write source through a Windows shell. See Part 0.

---

# WHEN EVERY BOX IS TICKED

Delete this file, and say so in the commit. Then the next thing is not on any
list: **play it**. Start a new game, take it through the rise, the campaign and
the count, and write down every place the prose says something the mechanism
does not do, or the mechanism does something the prose never mentions. That
list is worth more than another ten events, and no check in the repo can
produce it.

---

# OPEN REQUESTS

Anything you needed and could not have. Claude reads this before the next
engine pass. Write the content you wanted to author, not the verb you think
would deliver it — the verb is the engine's problem and there may be a cheaper
one.

*(empty — add here)*

---

# T25 — [ ] THE ALMANAC WORKS: the premise, the name, and the Act

**Added 19 September by Claude Code, mid-task, at the author's direction.**
Engine side is landed; what is left is prose and balance, which is your lane.
Read the git log entry *"Annexation is a bill, a crisis brings its own time"*
first — it says what is built and, more usefully, what was built and reverted.

## 25.1 Ashen Reach is a placeholder. The subject is the Bellamy Almanac Works.

Confirmed by the author. This is **not a find-and-replace** — the two have
different premises and the numbers do not match:

| | Ashen Reach (in `content/events.js` today) | The Bellamy Almanac Works (`content/world.js`, design/29) |
|---|---|---|
| what it is | a platform **abandoned** by its operator | an **operating** works station and company town |
| people | 300,000 stranded, two months of air | 184,000 residents, 97,000 workforce |
| operator | Halcyon Extraction Group | **Cordell** (design/29 §4 is titled "The corporation: Cordell") |
| the question | rescue before they suffocate | should the charter be surrendered and the Works come in, and on what terms |

`content/world.js` already holds the Almanac as a foreign body with all its
real figures, and its own header says "whether it should come in — and on what
terms, and who pays for the charter to be surrendered — is the question the
session is for." That is the premise. The three chain events
(`f1_stranded`, `f1_referendum`, `f1_dilemma`) still tell the other one.

**ANSWERED BY THE AUTHOR, 19 September.** Both were placeholders, and both
resolve:

| placeholder | the real name |
|---|---|
| the Ashen Reach platform | **The Bellamy Almanac Works, Brant & Vane** |
| Halcyon Extraction Group | **Cordell** |

So `content/actors.js`'s metanational actor is Cordell, and design/29 §4 —
"The corporation: Cordell" — is the canon for how it is named. §4.1 gives it
four names and says which is used where: **Cordell** on the hull plates and in
the House, *The Cordell Extraction Company* on the charter, *Cordell Group
S.A.* in the annual report. Use the short form unless the sentence is about a
contract or a filing.

One wrinkle to leave alone: design/29 §4.1 still contains the sentence
"Cordell Group S.A. confirms that Ashen Reach Operations was a separate legal
person", naming the wound-up subsidiary. Do not rename that in the design
document — a subsidiary keeps the name it was registered under, and a company
that named its ring-fenced vehicle after a different platform is exactly the
kind of detail the fiction wants. If it needs renaming it is the author's
call, not a consistency sweep.

## 25.2 The Act cannot yet be carried, and the settlements are waiting on it

The Annexation Bill (`annexation`, HC 4/163) is in `content/bills.js` and the
dilemma sets it down and grants five slots for it. Traced over a full run it
still **stalls at second reading**, with friction reaching 100 and solvency 0,
so it never assents.

The three annexation settlements therefore still gate on `f1_annexing` — the
flag the Prime Minister sets by *deciding*. They should gate on
`almanac_annexed`, which the bill's `onPass` sets when it assents. That is two
words in `content/settlements.js` and the reasoning is written into the file
above the tiers. **Do not make that change until the bill can actually be
carried**, or the canon ending becomes unreachable instead of earned; it was
made and reverted once for exactly that reason.

So the task is balance, in this order:

1. Find out why it stalls. Slots, the whips' forecast (`Engine.reported`
   returned `carries: false` while the true division carried 129/240), or the
   friction ramp making the House ungovernable by sitting 20.
2. Fix it in content — the stances, the crisis slot grant, or the scalar costs
   on the dilemma's own choice.
3. **Then** add `almanac_annexed` to the three tiers and confirm
   `npm run check` still reports the canon ending reachable by play.

A warning from this session: `test.js`'s balance run grants order-paper time in
content order and divides on the whips' forecast. It is a deliberately
indifferent player. Making it smarter to get a pass is the wrong move — it
changed which settlement landed first and broke the test in a different way.
Change the content, not the player.

## 25.3 The prose pass

The author has said a lot of the written prose reads too AI, and wants a
do-over. Do not start it here — the mechanics under these three events are
still moving. But when it happens, this chain is the place to start, because
rewriting it for the Almanac premise is a rewrite anyway.

