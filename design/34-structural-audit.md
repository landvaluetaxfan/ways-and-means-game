# 34 — THE STRUCTURAL AUDIT

**Status: RUN, 23 Sep 2026.** One pass across the codebase, by class of
fault, with a mechanical detector for each class and only the hits read by
hand. What follows is ranked: what was fixed (each with the check that now
holds it), what needs the author, what the content round inherits, and what
was noted and left. The eight classes and how each was measured are at the
end.

## Why

The game was built by several authors: the author, Opus 5, DeepSeek v4 and
v4.1 flash, and Claude. The faults found in the week of 20-23 Sep clustered
at the SEAMS between them rather than inside anyone's work: a flag one author
set and nothing read, a rename sweep that broke another author's reference,
a decision written into a design note and never built, one number held in
three places, and tools that measured a different game from the one players
see. The pass looked for those classes on purpose.

## The short version

- **The editor destroyed what it opened.** Clicking through the events list
  changed 73 of 108 events, among them `f1_stranded`, whose `at:14` starts
  the whole Flash I chain. Nothing noticed, because nothing compared an entry
  before and after. Fixed; `tools/edtest.js` now opens every entry of every
  tab and requires nothing to change.
- **The Party tab printed every loyalty as it stood at sitting one**, for
  the whole run. It read `st.loyalty`, which does not exist, and fell back to
  content. Fixed.
- **The checks could not see most of what was found.** A mutation of each
  kind of fault passed every check but one. The rename test asked the rename
  tracker whether the rename tracker had missed anything; the round trip
  compared a play trace, not the data; one assertion read
  `Engine.agreement ? true : true`. Each is replaced by a detector that fails
  when its subject is broken, and was shown to fail.
- **Six decisions for the author**, chief among them the emergency loan: it
  can never be repaid, and its breach names an event nobody wrote, so the
  debt is never called.
- **Saves are clean.** Every final state of all seven playtest strategies,
  and a state from mid-run, round-trip through save and load identically.

---

## 1. Fixed, with the check that holds it

Ranked by how much of the game each one touched.

| # | Fault | Fix | Held by |
|---|---|---|---|
| 1 | **The editor rewrote every entry it opened.** `commit()` runs on every click away, and `readEvent()` built a fresh object from the form's fields, so it dropped `at`, `maxFires`, `brief`, `setpiece`, `every`, event-level effects, and a choice's `when`, `act` and `cost`. It also dropped every gate the schema does not describe (22 conditions), drew only the first key of a map gate, and turned an `undertake` into `{move:{undefined:0}}`. Any value a `<select>` did not list became the list's first option, so `actor.*`, `trend.*` and `standing.*` moves, and six laws, were silently retargeted. Other tabs lost stances shaped `{abstain, absent}`, `office:"deputy"`, the independents' empty axes, `dualMajority`, and glossary handles. | `readEvent` edits a clone of the entry; a select keeps a value it does not list; conditions and verbs the form cannot draw survive as written; the move picker gains the three namespaces; laws come from setup | edtest: *opening every entry changes none of them*, per tab |
| 2 | **The Party tab's loyalty never moved.** Four sites read `st.loyalty`. | `Engine.loyaltyOf(st, id)`, one reader | uitest: *prints loyalty as it stands* |
| 3 | **Renaming left 32 kinds of reference dangling** (a station's 35 constituencies, instruments' prayer stances, initiatives' answering events, cabinet parties and candidates, bill authors, undertakings' `owed_to` and `onBreach`, and more). **Renaming a party in the editor crashed**, because the tracker read `M.setup`, which the editor's model does not hold. | `js/refs.js` walks every effect list and gate in every collection and follows each named site. The editor's rename dialog lists references in files it does not write. | renametest: the whole model, the real game via `content/index.js`, and a structural scan for any old id left. It fails on 30 sites against the old tracker, while the play trace alone stays identical. edtest: *renaming a party lists what it cannot change* |
| 4 | **The two carve-out awards were inverted.** "The Order Was Laid" read two log phrases that appear nowhere, so it went to anyone who made the promise, including those who broke it. "Never Laid" read a flag nothing sets. | `kept` / `breached` in the award matcher, reading the undertaking's own state | uxtest *awards read the run*; lint checks every award's keys, flags, promises and log phrases |
| 5 | **A promise to carry the threshold bill could not be kept.** `carry_threshold` had no discharge. Behind it: a division discharge read `lastDivision.carried`, while the engine writes `carries`; and a stage discharge ranked every post-division stage as -1. | Discharge added; `met()` reads `carries`; `stageRank()` | test.js *a promise can be kept* |
| 6 | **A settlement interrupted the run** (design/31 §4, the author's correction, unbuilt): a dialog with the closing prose at sitting fifteen. It was also logged as a *finished government*, so one run went into the session log three times. | The engine writes a log and wire line when either kind lands; no dialog; the last page prints both settlements' closing prose | test.js *a mark in the register*; uitest *opens no dialog*, *the settlement's own closing words* |
| 7 | **The transit subsidy had two vocabularies.** The appropriation writes `"none"/"anchors"/"all"`, which the price tick and the panel read; two economy events wrote `1` and `0`, which subsidised nothing. | The events write the law's words | lint: *a law written in two types* |
| 8 | **The editor's bill stages were wrong.** It offered `lords`, which no bill is ever in, and lacked third reading and everything after, so a gate built there could never open. | The list is every stage the engine or content uses | test.js holds it to `STAGE_ORDER`, the engine's writes and content's |
| 9 | **The editor called real content broken** (seven verbs, 22 conditions "unknown") and its "+ effect" button inserted `scalar`, a verb `apply()` throws on. | The validator asks the engine; the button inserts `move` | edtest: *the validator knows every verb and condition* |
| 10 | **The dismissed minister's current never took it personally** (the -18 went to `st.loyalty`). | Writes `st.currents` | test.js (with a test-only current; see decision D3) |
| 11 | **Every bill paper was dated "11 APR 2287".** | Dated from the calendar | uitest *dated in the campaign's own year* |
| 12 | **The score's "threat" cue fired on nine signatures** after the status bar learned the threshold is twelve. | Follows `setup.thresholds.ballot` | — |
| 13 | **Losing the House to a motion earned no award** ("no confidence" against "confidence"). | The award takes both | uxtest |
| 14 | **The rule panel printed "three sittings"** for `setup.supplyDelaySittings`. | Derived | — |
| 15 | **`content/index.js` declared the four pre-conversion axes** (`ownership`, `closure`); nothing read them, and a test asserted they existed. | Removed; the test asserts the engine names no axis and scores a sixth | test.js |
| 16 | The docket's hint for an order stripped `" Order 2287"` and had no branch for a division discharge. | `/ Order \d{4}$/`; division branch | — |

**New detectors, kept as checks:**

- **lint, IDS THAT NAME NOTHING.** Every id a gate, effect, promise,
  initiative or award names is resolved against its roster. It also checks
  every stage, every law value's type, and every log phrase an award reads.
  Eight mutations were put through it and it caught all seven that are
  hard failures.
- **lint's flag audit reads awards, business, and the engine's own flags.**
  It never read awards, which is why the carve-out award was invisible.
- **lint, promises that cannot be kept (advisory).** It lists the loan.
- **lint, flags set that nothing reads (advisory).** Prints a count;
  `--unread-flags` lists them (83).
- **roundtrip compares the data field for field.** The serialiser was in fact
  lossless, so this was free, and it is the only line there that can see a
  dropped field.
- **The cost.** `npm run check` now takes about two minutes. The fidelity
  pass adds about 23 of them; `uxtest` was already about 70. CLAUDE.md's
  "about three seconds" was out of date before this pass.

## 2. Decisions for the author

**Answered 23 Sep, the same day.**
- D1: the loan is repayable, and built.
- D3: the MPs are assigned to currents.
- D4: the freeze follows the debt trap, and the collapse follows the freeze.
- The campaign cascade is a loss.
- The debt trap is Flash I's canon (bible §1.8, §3.5).

Later the same day:
- D2: the loyalties are linked.
- D6: the laws are real bills, and a fourth dead law was found once the
  chain audit counted bills.

D5 is under discussion. The text below is as the report first put it.

- **D1. The emergency loan (`f1_loan`)** undertakes to honour the facility
  with no discharge, so it always breaks. Its breach names `f1_debt_called`,
  which is not an event, so when it breaks the Treasurer resigns and nothing
  else happens: **the debt is never called.** `CLAUDE.md` said it was. It
  falls due at the session's end, which is dissolution. Choose among: make it
  repayable (`discharge`), write the called-debt event, or drop the breach.
  lint prints both halves every run.
- **D2. The government's own caucus has two loyalties that never meet.** The
  meter `party_loyalty` is what whipping costs and what calls a leadership
  ballot. `parties.cu` and its currents are what decides how the PSD votes.
  Measured on the "last option" strategy: the meter ended at 80 while the
  Maintenance current sat at 7. Keep them distinct (the caucus's regard
  against its discipline), or derive one from the other.
- **D3. No character carries `current`.** The field is read in three
  places: the bench roll, the reshuffle, and the members list, which prints
  "no current" beside every named MP. Which MP sits in which current is
  content.
- **D4. The pyrrhic path's escalation beats cannot be reached by the
  annexation alone.** The abatement rule stops the annexation's friction
  ramp at exactly 70. `f1_accounts_freeze` needs more than 70 and
  `f1_meltdown` more than 85. Move the gates or the ramp.
- **D5. Plans never built, and no later note cuts them:**
  - blocs and opinion (design/04);
  - knowledge and scandal (design/09; bible §13.2 holds the spine "for a
    late-game arc", which reads as Flash II or later);
  - the `amended`, `siChallenged` and `rulingIs` conditions (07, 30, all
    optional);
  - station severance (11).

  Keep, cut, or schedule.
- **D6. Three laws do nothing.** `suspension_debt_accrual` and
  `tier_ratio_district` are read by nothing, and the editor offers them to
  authors. `civic_clock_minimum` is only a cabinet brief's subject. Give
  them mechanics, or retire them.
- (Still open from before: whether a thermal cascade during the campaign is
  a loss.)

## 3. For the content round

- **83 flags a choice sets and nothing reads.** Each is a consequence the
  choice implies and the game never delivers; run
  `node tools/lint.js --unread-flags` for the list.
- **Stale facts in prose:**
  - `events.js` "A session holds six slots" is now true of a sitting
    period;
  - "Thirty-four stations" should be thirty;
  - Halloran's "count is nine … needs nine" should follow the threshold of
    twelve.
  - **"One-session government" is TRUE again** under one session of three
    periods. An earlier list called it stale; it is not.
- **Two spellings of a bill that became law:** content writes `"passed"`,
  the engine `"assented"`. The papers list only the second. `stageRank`
  treats both as law.
- **The 40 events no strategy reaches.** None is impossible now that item 7
  is fixed:
  - 7 answer initiatives no strategy takes;
  - about 10 are open in their chapter and outcompeted by weight;
  - 5 wait on extremes of the economy the runs never reach (participation
    under 37, trade over 118 or under 84);
  - 2 wait on signatures, which never rise;
  - 2 are D4;
  - the rest are campaign beats whose conditional gates never coincide,
    plus the sandbox.

## 4. Noted and left

- **Constitutional numbers in `tips.js`** (280, 141, 240, 140, 100, 40) and
  the chamber caption are literals. They are stable while the tiers are
  fixed; derive them when next touched.
- **The same four goods are named twice, differently.** `TAX_BASES` (engine)
  and `PRICE_META` (interface) say "Substrate-hours / Substrate rent" and
  "Mass to orbit / Transit".
- **Awards have a matcher of their own** (`Shell.meets`, 11 keys) beside the
  engine's 46 conditions. lint now lists its vocabulary.
- **Vestigial state.** `characters.*.alive` is never false,
  `actors.*.lastAct` is never written, and `log.chapterMark` and three
  `lastElection` fields are never read.
- **`js/schema.js` describes 7 fewer verbs and 22 fewer conditions than the
  engine has.** The editor now preserves and validates them all, but can
  draw a form for none of them.

## 5. The design notes, against the code

Each note's named artefacts were grepped for; only the missing ones were
read.

| | status |
|---|---|
| 01 vocabulary | built. Acceptance "an author never types `loyalty.psa`" met only now (item 1) |
| 02 undertakings, 03 consequence chain, 05 campaigns, 06 variance, 08 actors, 10 election, 13 money, 15 calendar, 17, 19, 22–27, 29, 31, 33 | built |
| 04 blocs | **not built** (D5) |
| 07 bargaining | built, amendments in `bills.js`; `amended` condition not built |
| 09 knowledge | **not built** (D5) |
| 11 foreign affairs | built as actors with `reportedActor`; severance not built |
| 12 sitting screen | built (`briefsTouched` exists as the cabinet view) |
| 14, 20, 21 | briefs (writing, score, tutorial), not engine |
| 15, 18, 21 | name `sittingsPerSession`, which is `sittingsPerPeriod` now |
| 16 score | describes music code since rewritten |
| 28 economy | built; the contracts landed as initiatives, which the note allowed |
| 30 tribunal | built on flags; the two optional conditions not built |
| 31 set piece | built; §4.1 built in this pass (item 6) |
| 32 arc | E1, E4, E5 and the fold built; E2 completed here (item 6); `campaignSittings` 18 not taken |

## 6. The eight classes, and how each was measured

1. **Written, never read.** Final states of all seven strategies were
   walked and every field grepped for readers. Findings: the vestigial
   fields, the inert laws (D6), the 83 flags.
2. **Read, never written.** Every name read off state, content or a flag
   was checked for a writer. Findings: `st.loyalty` (items 2, 10),
   `lastDivision.carried` (item 5), `characters[].current` (D3),
   `f1_debt_called` (D1), the award's flag and phrases (item 4).
3. **Promises and gates that cannot resolve.** Every gate in content was
   resolved against its rosters and every undertaking checked for a
   discharge. Findings: item 5, D1, the assent spellings.
4. **One fact in two places.** Items 7, 8, 11, 12, 14, 15, D2, and the
   literals noted in §4.
5. **Decided, not built.** All 34 notes (§5).
6. **Checks that cannot fail.** Mutations of every fault class above were
   put through `npm run check`; only a move target naming nothing was
   caught. The rename test, the round trip, the editor test, one
   tautological assertion and lint's flag audit are fixed (§1).
7. **Reachability.** Each of the 40 unreached events had every condition
   evaluated at every sitting of every strategy (§3).
8. **Saves.** Clean.
