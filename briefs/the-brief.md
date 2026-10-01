**Lane: Codex.** Written 29 Sep 2026 by Claude from the author's decisions.
Do it after `tabs-overhaul.md`.

**Read `design/62-why-the-overhaul.md` first.** It gives the objectives of
these changes and the reasons behind every design decision they carry out.
When this brief does not cover a case, decide it by that record's tests.
**Codex's questions are answered in `design/64-answers-to-codex.md`,**
and those answers win over this brief where they differ.

The brief is the answer to the author's question that started
`design/57`: "when will a player know they should do something … by
themself?" Read `design/58-the-game-on-one-page.md` in full first, above
all "Knowing when to act", "The screens" and "A sitting". Then read
`design/61` on the Sitting, and `LESSONS.md` "Engine" and "Interface".

Build the **engine and interface for the brief**, with a **thin slice of
three Flash I matters**. It is Stage 2 of design/58's build order.
`briefs/engine-people.md` and `briefs/lever-playtest.md` fold into this
work: read both and take in what serves the brief.

## What the brief is

It is a list of **matters** that ministers raise while there is still time
to act. A matter goes through three stages, and each is costlier than the
last:
1. **The brief.** The owner raises it, with its remedies and how long each
   takes. Acting here is cheapest.
2. **The decision.** If nothing is done by its point, the owner brings it as
   the sitting's decision, with fewer and worse options.
3. **The page.** If it is still not dealt with, it happens.

The rules, all decided:
- **Up to four open at once, and at most one new a sitting.** When a fifth
  wants in, the least urgent waits. It may reach the player later as the
  sitting's decision instead.
- **Set aside:** marked noted, a matter leaves the brief and keeps its own
  clock. If nothing is done, it comes back as the decision.
- **The owner's post:** a matter whose owning post is vacant is not raised.
- **Rise counts only what is owed.** The brief is advice and Rise leaves it
  off the count (`Engine.today()` stays obligations only).
- **Levers are open, matter first.** Each remedy names its lever: an
  initiative, instrument, bill, order or money call. Its button opens that
  lever where it lives. Nothing in the brief is a new way to act.
- **Determinism** (`AGENTS.md`): no randomness except the seeded
  `perSitting` roll.

## Content shape

Add a collection `matters` to content and to `js/schema.js`, with its
editor support, as every collection has. Each matter has:
- `id` and `campaign`;
- `owner`: a cabinet post id;
- `raise`: a condition, for when it is raised;
- `note`: the minister's short note, in their own voice ("From the
  Financial Secretary: …");
- `figures`: readouts shown under the note, each a scalar with its words;
- `remedies`: a list of `{ lever, takes, note }`, where `takes` is in
  sittings;
- `due`: how many sittings the brief stage lasts, or a condition;
- `late`: the event id that becomes the sitting's decision;
- `page`: the event id of what happens;
- `settled`: the condition that closes it.

The engine names no matter (`AGENTS.md`). New verbs or conditions go in
`EFFECTS`/`CONDITIONS` with their schema entries.

The state holds the open, waiting and noted matters and when each was
raised. **Bump `STATE_VERSION`** with a migration guard. A save from before
has no brief, and reconciliation raises whatever is due.

## The thin slice

Three matters for Flash I, in `content/campaigns/flash_i/`:
- **The heat:** the thermal margin falling.
- **The reserve:** the account running down.
- **The Works' air:** the existing Bellamy chain, with its air deadline
  and the payment for the shipment. Grep "Bellamy" and `f1_air`.

`setup.alerts` already holds three alerts that `Engine.today()` reads. They
are the nearest thing to matters now. Convert them rather than build
beside them, and keep what `today()` owes the player.

Choose each matter's owner from `content/cabinet.js` by design/58's
interests: the Treasury for money, the grid's minister for the heat, and
the owner of the air chain for the air. Write each note plainly. **Claude
writes the register later**, so name the notes in the commit message.

## Advice is contested (design/58, Round I)

**One of the three matters must be contested.** Two credible ministers ask
for different remedies, and neither is simply wrong. The suggested case is
**the heat**:
- the grid's minister would spend now to protect the margin;
- the Treasury would protect the reserve and accept the risk.

Give the matter shape a `counsel` list for this: `[{ post, remedy, note }]`,
each a minister's own recommendation. The interface shows both notes side
by side.

**The playtest must not assume that the first remedy is right.** Add two
strategies:
- **"the owner's counsel"**;
- **"the dissent"**.

Report both. A contested matter is working if neither strategy dominates
across seeds.

## Interface

- **The Sitting's right column becomes the brief** (design/61), above the
  calendar. Today and the docket fold into it.
- Each matter shows:
  - the owner's note;
  - its figures (words, with the figure on hover);
  - its remedies, each with a button that opens its lever;
  - "Set aside".
- **Badges:** call the dot hook left by `tabs-overhaul.md` step 9 with the
  tabs where open matters' levers live.
- **Economy:** the account's Draw buttons become money calls that matters
  name as remedies (design/61, Economy). The Economy tab lists the calls
  open now, each linked to the matter that raised it.

## Measure

Run `node tools/playtest.js --seeds 80` before and after, and put both in
the commit message. `AGENTS.md` has today's figures: the four crisis
strategies lose 33, 54, 21 and 25 of 80, all to a late thermal cascade.

Add a playtest strategy, **"follows the brief"**: each sitting it takes the
owner's remedy for the most urgent matter. For a contested matter, see
the two strategies above. design/58's target is that it
reaches the count in most seeds. Report its losses. Do not tune balance to
hit the target; report it, and Claude and the author decide.

`npm run guards` must still reach the canon. If the canon figures move,
update them in `AGENTS.md`.

## Approved implementation decision — 1 October 2026

The author has authorized the generic matter foundation and the three-matter
slice (roadmap steps 2 and 3). The broader playtest-strategy acceptance and
ten-sitting slice remain a subsequent batch; keep this brief until its remaining
acceptance work is finished.

**Works' air: the rescue decision moves before the deaths.** The author
approved the following direction in chat on 1 October.
`f1_air_fails` currently combines a failure page and a rescue decision at
sitting 40. Its body already reports eleven deaths; its CW$2.4bn payment and
political penalties explicitly respond to those deaths. It cannot serve as
both the pre-failure `late` decision and the choice-free `page` required by
design/64, answers 3 and 4.

Make a plain last-chance
decision before failure, retain CW$2.4bn as the late shipment price, and use the
existing failure narrative as the consequence page if the matter remains
unsettled two sittings after that decision. Death-related penalties would occur
only after the deaths. This replaces the fixed sitting-40 failure with the
matter's grace clock, so a competing dated decision may postpone it. Keep the
existing early shipment and manufacturing remedies and their costs. Draft new
decision wording plainly for Claude's later register pass, rather than treating
the old post-failure wording as a pre-failure decision.

## Approved scope addition — 1 October 2026

Task 3's air settlement needs an OR: `works_air_paid`, `almanac_annexed`,
or an existing crisis result must each close the matter independently.
Ordinary engine conditions currently combine keys with AND. `flagsAny`
exists only in award conditions, and cannot also express a crisis result.
Using a paid-only settlement would wrongly leave the death page pending
after annexation or a joint mandate.

The author approved a generic `anyOf: [condition, ...]` condition, with
engine, schema, editor, reference/rename and validation support and tests,
before continuing the three-matter content batch. Each branch retains AND
between its keys, as do sibling keys outside `anyOf`. Empty or malformed
alternative lists must fail validation. This expresses the existing approved
settlement alternatives without naming the Works in the engine or adding
new story outcomes. It expands Task 3's file list; no new canon or economic
effects are proposed.

## Later, not here

These are decided in design/58 but belong to later stages:
- forecasts, and whether each came true;
- the minister's reputation;
- a crossed minister advising later;
- the Opposition's moves as matters;
- summits;
- the election screen.

Leave the matter shape open for a `forecast` field, and do not build it.

Delete this brief in the commit that finishes it.
