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

### 1. ~~Friction runs away~~ — FIXED 20 Sep

Trends applied every sitting for ever, so `{trend.friction:+3}` drove the
annexation line to friction 100 and solvency 0. They now step toward zero
every `setup.trendDecay` sittings (four). Friction peaks at 65.

Fixing it put the canon ending out of reach, because `f1_pyrrhic` wants
friction above 65 and only the runaway ever delivered it — the tiers had been
tuned against broken behaviour. Annexing now costs {friction:+12} at once,
because Earth reacts that week, and the +3 trend is the deterioration after.

### 2. The endgame is a dialog box

`afterAction()` calls `checkEnd`, and a settlement shows its `closing` prose
through `Dialog` — the terminal's own alert. The design calls for a full panel
with the settlement text, the session board behind it, and a way back to the
menu. This is the LAST THING A PLAYTESTER SEES and it currently looks like an
error message. The content exists and is waiting; this is interface work only.

### 3. ~~The whips' forecast~~ — measured and cleared, but it found a real bug

The forecast is fine. Measured across three bills the error is +2, +2 and +5,
small and OPTIMISTIC — not the pessimism suspected.

What the measurement actually found: `annexation` reported `carries:false` on
the TRUE division with popular 129 of 121, because **domain consent** blocked
it. A bill's `touches` names domains; the functional constituencies whose
interest matches are the concerned benches; a majority of THOSE seats against
makes the domain object. It is not a functional majority — the bill now
carries on 13 of 40 — and `touches` is therefore not decoration, it names who
can stop you. Fixed by turning the Liberals' functional bench.

### 3a. STILL OPEN — should crisis slots be earmarked?

`f1_dilemma` grants five order-paper slots for the annexation, and they go
into the COMMON POOL, where bills declared earlier in `content/bills.js` take
them first. So the Act is set down at sitting thirteen and never reaches a
division in an indifferent run. A player who wants it gives it the time.

Decide whether a measure that brings its own time should have that time
earmarked to it. Until then the three annexation settlements stay gated on the
intention (`f1_annexing`) rather than the Act (`almanac_annexed`), and moving
that gate will fail the canon-ending test.

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
