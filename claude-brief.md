# CLAUDE CODE — WORK ORDER

**Written 20 September 2026 by Claude Code, for the next run of Claude Code.**
The mirror of `opencode-brief.md`: that file is the content lane, this is the
engine and interface lane (`js/`, `tools/`, `test.js`, schema, CSS). If this
file and a live instruction from the author disagree, the author wins.

Read `CLAUDE.md` and `AGENTS.md` first. Everything below is measured against
`0a54674`, not inferred — the commands to re-take any of it are given.

---

## WHAT LANDED 19 SEPTEMBER, so it is not redone

| | |
|---|---|
| `tools/enccheck.js` | mojibake REVERSED, not pattern-matched. In `npm run check`, so it gates CI, Pages and opencode's pushes |
| `.gitattributes` | `eol=lf`. CRLF had been silently blocking the Pages deploy for weeks |
| `tools/laycheck.js` | real-browser layout measurement, `npm run layout`, not in `check` |
| layout | crushed Government panels, `.pbody` that never scrolled — clean at 1000/1280/1600 |
| `at: N` | an event can hold a sitting. `nextScheduled()` between prologue and the weighted pool |
| calendar | every deadline carries `{tab, how, focus}`; the next-three list AND the grid navigate |
| foreign | light-lag is real — `reportedActor()` returns what was reported, dated. STATE_VERSION 20 |
| annexation | HC 4/163 is a real bill, set down by `f1_dilemma`, which grants five crisis slots |
| settlements | can now land after dissolution — the campaign was a dead zone no settlement could reach |

---

## THE THREE THAT MATTER, in order

### 1. Friction runs away and nothing damps it

Traced over a full playthrough taking the annexation line: the run ends at
**friction 100, solvency 0**. `f1_dilemma`'s annex choice sets
`{move:{"trend.friction":3}}` — a TREND — and nothing ever pulls it back.
Trends have no decay, no ceiling behaviour and no counter-pressure.

A player who does the central thing the campaign asks of them ends up
governing a House that is arithmetically impossible. That reads as a broken
game rather than a hard one.

It is also the root cause of **T25.2** in `opencode-brief.md` (the Annexation
Act stalls at second reading), so fixing this unblocks the settlement gate
that is waiting on it. Do this before anything else.

Re-take it: play 45 sittings headlessly the way `test.js`'s balance block
does, taking choice 0 on the `f1_` chain, and print `st.scalars` each sitting.

### 2. The endgame is a dialog box

`afterAction()` calls `checkEnd`, and a settlement shows its `closing` prose
through `Dialog` — the terminal's own alert. The design calls for a full panel
with the settlement text, the session board behind it, and a way back to the
menu. This is the LAST THING A PLAYTESTER SEES and it currently looks like an
error message. The content exists and is waiting; this is interface work only.

### 3. The whips' forecast may be miscalibrated

`Engine.reported()` returned `carries: false` on the annexation bill while the
true division carried **129 of 240**. The forecast is supposed to carry an
error (design/08 §7) and that is deliberate — but if it is systematically
pessimistic the player cannot plan, and whipping stops being a decision.

Measure the error's distribution across every bill before changing anything.
It may be correct and merely unlucky on this one.

---

## SECOND TIER

- **Commencement** (design/25 §3). A bill assents and is never brought into
  force. The design calls it "the best betrayal in the game. Cost: almost
  nothing" — the deferred queue already does the mechanism. It now has a
  target worth betraying: the Annexation Act.
- **The dispatch UI.** The light-lag is real but the foreign panel is
  read-only: you can see what Mars said eleven sittings ago and cannot send
  anything back. Lag is only interesting if you can act into it. Use `queue`
  with a label — design/11 §3's `dispatch` verb is not needed and the verb
  ceiling below says not to add one.
- **The tab restructure.** Eight tabs organised by constitutional category
  rather than by the question the player is asking. Proposal: six — Sitting /
  Business (order paper + Papers + initiatives + calendar) / The House
  (chamber, whip, division, margin, currents) / Government (cabinet,
  coalition, undertakings) / Commonwealth (Orbit + World, one geography at two
  scales) / Concordance, with Record becoming a fold. **Re-measure first**: the
  calendar became clickable on 19 Sep and may have absorbed some of the need.

---

## THE CONSTRAINT ON ALL OF IT

**The effect vocabulary is at 20 verbs and §15.5 calls that the line.** Most
remaining design/25 items — the guillotine, collective responsibility, the
ministerial direction — each want a new one. They must not have one.

Annexation stayed inside the ceiling by reusing `bill` and `queue` rather than
inventing `annex`, and that is the pattern. If a feature seems to need a verb,
the thing it actually needs is usually a content entry plus an existing verb.
A growing vocabulary is content leaking into the engine, which is the one
architectural rule here.

---

## TWO LESSONS FROM THAT SESSION, both paid for

**A check that has never been shown to fail is not evidence.** The encoding
corruption shipped after being "verified" by a test that could only ever
return zero. When you add a check, run it against the real broken input and
watch it go red before you trust it green.

**When a balance test fails, change the CONTENT, not the test's player.**
`test.js`'s balance run grants order-paper time in content order and divides
on the whips' forecast. It is a deliberately indifferent player. Making it
smarter to get a pass changed which settlement landed first and broke the test
a different way.
