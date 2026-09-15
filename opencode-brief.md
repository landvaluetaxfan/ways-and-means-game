# OPENCODE — WORK ORDER

**Written 15 September 2026 by Claude Code, for opencode to pick up.**
This file is the async channel between the two agents: the author is often at
a phone with access to one of us and not the other, so a task that cannot be
spoken is committed here instead. If this file and a live instruction from the
author disagree, the author wins and this file is stale — say so and move on.

**Check the git log before starting.** If the commits below are already in, the
work is done and this file should have been deleted.

---

## Lane

`content/*.js` and prose. Do not touch `js/`, `tools/` or `test.js` —
Claude Code is working in `js/engine.js` and `js/ui.js` concurrently.

Nothing here needs an engine change. **The editor's serialiser writes every key
it finds rather than a fixed list** (`js/serialise.js` `list()` → `val()`), so
new fields on a bill survive a round-trip even though the editor has no form
for them. That was verified, not assumed.

`npm run check` after every task. Commit per task.

---

## T1 — Bills get people on them

A bill carries `owner`, which is a **party**. There is no person anywhere on a
bill. Fifty-four characters exist and exactly one has ever appeared in an
event, so nobody in this parliament has put their name to legislation.

Add to each of the seven bills in `content/bills.js`:

```js
author:     "character_id",        // the member in whose name it stands
cosponsors: ["character_id", …],   // 0–4
```

Rules that make this load-bearing rather than decorative:

- **The author is a person and `owner` stays the party, and they may
  disagree.** A backbencher's bill that their own party is lukewarm on is the
  most interesting case available and there should be at least one.
- **At least two bills take a cosponsor from outside the author's party.**
  Cross-party sponsorship is the cheapest possible signal of where a measure
  actually sits, and the only cheap way to show the chamber agreeing on
  anything.
- A **minister** as author means the government owns it. A **backbencher**
  means it does not. Use both.
- §2.7: the character roster is FROZEN. Every id must exist in
  `content/characters.js`. Do not invent a person.

## T2 — Descriptions that explain the politics, not the mechanism

A bill has `summary` (what it does) and `effectNote` (what follows). A player
reads *"Changes the law on divergence threshold hours"* and learns nothing
about why anyone cares.

Keep both, add a third:

```js
contested: "…"        // one short paragraph
```

**The case for and the case against, and neither written to win.** Name who
benefits, who pays, and what the honest objection is. If a reader can tell
which side the writer is on, it is not finished.

The register, from bible §9.1 on the player's own party:

> the Commons Union's restrictionism is a correct reading of material interest
> rather than prejudice, which is exactly what makes the player's own party
> uncomfortable rather than villainous

Both things true at once, and the game declining to resolve it.

§2.6 still binds: `contested` explains the politics of a mechanism already
introduced. It must not introduce a second mechanism.

## T3 — The references that make it a document

While in each bill, check `ref` reads like a real paper number and `title`
follows §3.9's naming scheme. The bill dossier is going to be headed like an
in-world instrument and these are the lines that will sit under the letterhead.

---

## Do not

- **Do not touch the `stances` block.** The vote arithmetic is Claude's lane
  and is moving underneath you: abstention landed on 14 Sep and pairing on the
  15th. A bill's stances now distinguish `for` / `against` / `abstain`, and a
  fourth state — **absent** — is produced by pairing rather than authored.
- **Do not add a letterhead or image field.** `js/artifacts.js` owns slot
  declarations; the slot has to exist there first.
- Do not renumber or reorder the bills.
