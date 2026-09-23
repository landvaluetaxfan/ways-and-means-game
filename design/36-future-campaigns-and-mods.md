# 36 — FUTURE CAMPAIGNS AND MODS

*An assessment, 23 Sep 2026, asked for by the author: is the engine being
built for Flash I, or will it carry campaigns on other subjects, and could
somebody else write one? Every figure below was measured on the tree that
day, not recalled.*

**The short answer.** The engine is campaign-neutral and setting-bound, and
the content is single-campaign. Future Commonwealth campaigns fit the engine
as it stands, but they cannot yet sit beside Flash I, because nothing
separates one campaign's content from another's. Mods have good foundations,
and no way in except by editing the game's own files.

---

## 1. The rules: campaign-neutral

- `js/engine.js` (6,401 lines) names Flash I fifteen times, **all in
  comments**. No code path names an event, a party or a station.
  `isAnnexed` reads a generic `annexed_<id>` flag. The interface's code
  names no campaign content either.
- Everything a campaign does goes through a closed vocabulary: **22
  effects and 44 conditions**. The effects are a couple over the soft cap
  of about twenty that CLAUDE.md sets. That is a watch item, not a fault.
- The mechanisms are all general: bills and stages, divisions and the dual
  majority, whips and lobbying, negative and affirmative instruments,
  undertakings, initiatives, the two settlement channels, chapters, periods
  and the session, the election, currents, lenders, laws, trends and
  couplings. Flash I is expressed entirely in content through these.

## 2. The setting: hard-wired, as it should mostly be

These are the Commonwealth's rules, not Flash I's. Every campaign in this
world keeps them. A total conversion to another setting would not.

- **The four prices and tax bases** (`TAX_BASES`, `PRICE_META`: volume,
  thermal, substrate, transit, with their weights) live in the engine.
- **What the scalars mean.** `thermal_margin` at nought is a loss (the
  cascade). `friction` prices Earth's lending and rises when the state
  borrows. `legitimacy` moves on borrowing, repayment and motions.
  `public_standing` is derived from the bands. `consumables` drifts with
  closure.
- **Earth as the default lender**, overridable in `setup.lenders`.
- **The chamber**: 280 seats, three tiers and the dual majority, which is
  §4.

Moving the numbers among these into `setup` would be cheap: the tax bases,
and the loss conditions as data (`losses: [{scalar, atOrBelow, reason}]`).
The rest is the setting's grammar and should stay.

## 3. Content: one campaign's worth, loaded for every campaign

This is the gap that matters for Flash II.

- `index.html` loads one content set through fixed `<script>` tags, for
  every government the menu offers. `ADMINISTRATIONS` (`flash_i`,
  `sandbox`) can override **only** `setup`, shallowly, and the
  introduction.
- **47 of the 113 events are Flash I's**, by id (`f1_`, `fa_`, `ec_`,
  `ch3_`, `ch4_`) or by gate. So are:
  - the Annexation Act;
  - the five crisis tiers;
  - `repay_facility` and `seek_terms`;
  - the Alliance as a lender;
  - the crisis achievements;
  - the annual record 2073–2080.

  All of it is global.
- **No condition asks which campaign is running.** A second campaign
  would draw Flash I's weighted pool events (`fa_*`, `ec_*`) unless every
  one were gated by hand. Flags, chapter numbers and achievements share
  one namespace across campaigns.
- **Canon carry-over has no mechanism.** Bible §1.8 says the next campaign
  opens on the canon ending. Nothing can declare "opens on the debt trap":
  the PSD on 84 to 88 seats, the austerity, the Cordell leases gone.
  Somebody would hand-write a new opening state.

**What it needs:**
- a `campaign` field on content entries, or campaign packs over a shared
  base;
- a `campaign` condition;
- administrations that can override the opening state, not only `setup`:
  seats, scalars, flags and the chapter.

That is moderate engine work plus mechanical tagging of Flash I's content.

**Built, 23 Sep 2026.**
- **Tags:** `campaign` on any entry.
- **The view:** `CONTENT.forCampaign(admin)` filters every collection,
  rebuilds the indexes, merges setup one level deep and carries the
  `opening` effects.
- **The state:** `st.campaign` is saved at `STATE_VERSION 30`, and the
  `campaign` condition reads it.
- **Editor and lint:** the editor has a Campaign field on events and bills;
  lint checks tags and cross-campaign references.
- **Flash I's story is tagged:** 16 events, the Annexation Act, the five
  tiers, four initiatives, eight awards and the Alliance lender. Its runs
  are unchanged, and a campaign on the world's content alone plays thirty
  sittings in `test.js`.
- **What the opening does not do yet:** reseat the House. A campaign after
  an election needs its own roll, which is content, not engine.

## 4. Tooling: strong, and partly Flash I's own

- **General:**
  - eleven checks;
  - lint resolves every id a gate, effect, promise, initiative or award
    names;
  - the rename test proves renaming is safe;
  - the round trip proves the serialiser loses nothing;
  - the editor authors every collection and preserves fields it cannot
    draw;
  - `STATE_VERSION` migrations and `reconcile()` keep old saves loading
    across content changes.
- **Flash I's own:** `test.js` (4,875 lines) carries the canon script and
  its guards, and `tools/playtest.js` and `tools/prose.js` read Flash I's
  content. A new campaign needs its own canon script. It can copy the
  shape.

## 5. Mods

**Good foundations:**
- content is data (one computed sandbox event aside);
- the vocabulary is machine-readable (`js/schema.js`);
- there is an editor;
- the checks a modder would want already exist;
- runs are deterministic, so a mod's balance is testable;
- saves record their administration.

**The barriers, in order:**

1. **No way in.** Content enters through `<script src>` tags, so a modder
   edits the game. On `file://`, `fetch()` is blocked but `FileReader`
   works: the menu already imports saves that way. Because content is
   data, a campaign pack could be one file chosen from the menu.
2. **No partitioning** (§3). A modded campaign would collide with Flash I.
3. **The setting's semantics are code** (§2). A mod cannot change what
   loses the game or what the state taxes.
4. **The seeded lean is keyed on an event's position.** Appending keeps
   Flash I's runs. Merging two campaigns' lists in any other order changes
   them. Keying the lean on the id would free it.
5. **Saves do not record which content made them.** A save loaded under
   different content reconciles stations and silently mismatches events
   and flags.
6. **The authors' guides are partly stale.** `AUTHORING_FORMAT.md` says so
   in its own header. They could be generated from `js/schema.js`.
7. **The checks need node and jsdom.** A modder without them has the
   editor's validator only.

## 6. The order this suggests

1. Partitioning and a richer opening state (§3). This is needed before
   Flash II, mods or no mods.
2. The setting's numbers into `setup` (§2), which is cheap.
3. Campaign packs through the menu's file import, with the save recording
   the pack and its version (§5.1, §5.5).
4. The seeded lean keyed on id (§5.4).
5. An authoring guide generated from the schema (§5.6).
