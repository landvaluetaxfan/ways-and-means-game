# 20 — THE COMMISSION

*What to buy, in what order, and the contract a composer can sign against.*

> **STATUS, 14 September 2026 — THIS IS A BRIEF, NOT A BUILD.**
>
> The score in the build is synthesised (`js/music.js`): oscillator voices,
> no samples, because `fetch()` is blocked on `file://` and the game opens
> straight from disk. `design/16` measured it and specified its gestures.
> This document is about the version where the music is *recorded* — what a
> composer must deliver, what the engine already has names for, and the order
> to buy it in.

---

## 1. The position: the institution's own music

The bed is the **Commonwealth's self-image**: modern, efficient, immaculate,
engineering-run. Jazz fusion is the right frame not because the game is about
musicians working together but because fusion *sounds* like a competent
institution sounds to itself — virtuosic, tight, faintly corporate.

That gives the score its one idea, and it is the same idea the images already
use (`CONTENT_GUIDE.md`, "Images"): **the palette says who made the picture.**
The bed is the institution's own music. The interruptions are the world's —
a withdrawal, a defeat, a station going dark. Same split, applied to sound:
the bed is *them*, the gestures are *what happened*.

The horror is the irony, and it should not be scored darkly: the appropriation
and the shed order are played by the same clean band. Noir jazz would tell the
player the story is grim. Bright fusion tells them the *government* is not,
which is more disturbing and more true.

## 2. The bed is not where the fusion lives

The reference is *"Tears of the Star"* (the *Mint Jams* reading), and `design/16`
already drew the conclusion: **the bed is spacious and the complexity lives in
the interruptions**, because the player is reading three hundred words of
parliamentary prose. Casiopea's density under a paragraph is fatiguing and it
competes with the reading.

So the split is load-bearing:

| | is | register | how many |
|---|---|---|---|
| **the bed** | the institution running | sparse: bass, Rhodes, light kit, a little guitar | one, loopable, 16–32 bars |
| **the interruptions** | what happened | dense: unison lines, shout chorus, fills, solos | one per gesture |

The engine already has this shape. The commission fills it.

## 3. The stem contract

**A composer is not delivering a track. They are delivering stems.** Write the
brief in these terms and it saves a second commission. Every line here is a
thing that cannot be fixed after the fact.

**Audio**

- Every layer as a **separate WAV**, 48 kHz / 24-bit.
- **Same length, same tempo, all starting at bar 1** at the same sample offset.
- **Loop points** marked, or the file length an exact whole number of bars.
- **No fades baked in**, no printed reverb, no shared bus compression or
  limiting. Peaks around **−6 dBFS**. Reverb, if any, as separate returns.
- A **full mixdown** for reference, *and* a **bed-only mixdown**.

**Musical**

- **One fixed tempo** for everything (no rubato, or a rubato version that is
  never layered).
- **A stated key and mode**, and a **form map in bars**.
- A **layer map**: which file is which, in the names §4 uses.
- Stems must be **additive**: no layer carries the only statement of the
  melody, and only bass + keys are load-bearing for the harmony. Any
  combination of layers must sound like a band, not like a dropped-out mix.

**Rights**

- Perpetual, worldwide, all media, including the right to **edit, re-sequence,
  transpose, loop and combine** the stems, and to ship them inside the game.
  Adaptive music *is* derivatives; without this the stems you paid for cannot
  be used.

## 4. The layer map

The engine has layer names already (`js/music.js`). The commissioned stems map
onto them with no new vocabulary.

| stem | engine layer | in the bed? | enters on |
|---|---|---|---|
| `bass` | bass | always | — |
| `rhodes` | rhodes | always | — |
| `guitar` | guitar | always (sparse) | — |
| `kit` | drums | always (light) | — |
| `perc` | shaker | always | — |
| `pad` | pad | optional | a state of the government |
| `vox` | lead | no | `moment`, `rise` |
| `horn` | reed | no | `order`, `undertake`, `threat` |
| `keys2` | keys | no | `moment`, `sombre` |
| `kit2` | drums (busy) | no | any dense interruption |

## 5. The gesture vocabulary

Every musical response the build already makes, plus the ones `design/16` named
as missing. Each is a **short module** at the same tempo and key as the bed.

| gesture | fires on | is | cost |
|---|---|---|---|
| `hit` | `undertake`, `order`, `prorogue` | whole band on one chord | one bar |
| `unison` | `moment` | the signature sixteenth line, guitar + Rhodes + horn + bass | one bar |
| `plane` | `order` | the chord approached from below in three stabs | one bar |
| `runup` | `rise` | sixteen ascending sixteenths | one bar |
| `crash` | `moment`, `rise`, `prorogue` | a cymbal | one bar |
| `fill` | **into** every section change and mood jump | drum fill | one bar |
| `riser` | **into** a big mood | a crescendo across the bar | 1–2 bars |
| `stop` | `tension` | stop-time: attack, silence, attack | 2–4 bars |
| `shout` | the biggest events only | the whole band on a written figure | 4–8 bars |
| `solo` | a carried flagship bill | a soloist over the bed changes | 16 bars |
| `shift_up` | a bill carried | the pivot to the fourth-up key | 2 bars |
| `shift_down` | a bill lost | the pivot to the flat-six key | 2 bars |

**`shout` is the one big-ticket item.** It is where a *government-falls* or a
*flagship-carries* goes when "+2 and the head" is not enough.

## 6. THE SHOPPING LIST

Bought in this order. Each tier is usable on its own; stop after any one and
the engine still has more than it has today.

### Tier 0 — free, and already built
The synthesised score (`js/music.js`). It stays, as the **fallback and the
offline tier**: `file://` builds and any build with no stems present get it.
Nothing to buy.

### Tier 1 — THE PAID TEST — one cue
Buy this before anything else, and judge it in the running game.

- **1 × bed**, 32 bars, loopable, ~90–120 s, sparse.
- **The core gestures**: `hit`, `unison`, `crash`, `fill`, `riser`, `stop`.
- **1 × shout chorus**, 8 bars.
- **1 × solo section**, 16 bars over the bed changes.
- **1 × full mixdown + 1 × bed-only**, for reference.

At **one tempo and one key**. This proves the stem workflow, the layer map and
the mixing before you commit to a set.

### Tier 2 — the transpositions
Only if the key-change-on-event idea survives Tier 1.

- The **same stems transposed** up a tone (`shift_up`) and down a minor third
  (`shift_down`), **plus the 2-bar pivots**. This doubles or triples the bed
  session, so it is the expensive layer. The cheaper alternative is in §8.

### Tier 3 — the quiet and the loud
- **A half-time sparse bed** for `tension` and `sombre` (the division and the
  fall), so those two do not merely mute the normal bed.
- **An endgame bed** for the settlement, one per settlement if the budget runs
  to it and one bed + tone if it does not.

### Tier 4 — polish
- `vox`, `horn`, `keys2`, `kit2` as separately recorded event layers, so the
  dense interruptions are a real ensemble rather than a stack.
- A second soloist (guitar *and* keys, trading), which is very Casiopea and is
  the last thing to buy, not the first.

## 7. The architecture fork

Commissioned audio changes the delivery model, and this is the decision to make
before the cheque, not after.

- The synth score works from `file://`. **Recorded stems do not** — decoding
  audio for tight, tempo-locked mixing needs `fetch`, which `file://` blocks.
- A real cue cannot be inlined into the 2.3 MB single-file build.

So: **served builds** (the Pages site) get the recorded score; **`file://` and
single-file builds** fall back to the synth. The engine already degrades to
nothing when an asset is missing (`CONTENT_GUIDE.md`, "Images"), so the hook
exists; the work is to make each layer's voice a choice between an oscillator
and an `AudioBuffer`, and to load the buffer set only when present.

## 8. Deliberately not commissioned

- **Rubato or tempo changes.** A swell is a layer entering, not the band
  speeding up. `design/16` states the rule and it holds.
- **A full transposed bed for every mood.** Modes are cheaper than keys: a
  `D dorian → D aeolian` shift is an overdub, not a re-record, and it is
  arguably more sophisticated than a mechanical modulation.
- **Sampled drums as the *bed*.** The bed's kit can be programmed; it is the
  **fills and the solo** where a real drummer is audible and worth paying for.
- **A second soloist first.** Texture, not substance. Tier 4.

## 9. Acceptance

- The running game plays a commissioned bed with at least three layers that
  enter and leave on state, and every layer is a separate file.
- A build with no stems present falls back to the synth score and sounds
  complete, not broken.
- Every gesture in §5 fires from a game moment, and no two gestures fight for
  the same moment.
- The bed-only mixdown and full mixdown differ, and the bed-only one is what a
  player reads prose to.
- The stem contract in §3 is a document a composer signed, and the delivery
  matches it.
