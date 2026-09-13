# 16 — THE SCORE

*What Casiopea actually does, which of it survives our constraints, and an
audit of every interruption the build currently has.*

**Reference track: "Tears of the Star" (ティアーズ・オブ・ザ・スター), Issei Noro,
1979; the known reading is the *Mint Jams* live cut, 4:29.** G minor. The
transcriptions in circulation give two readings of the changes — `Gm7 · Fm7 ·
C · C7` and `Gm7 · C · Dm7 · Eb7` — and they agree on the important thing.

**A caveat that governs this whole document: I cannot hear the track, or the
build.** Everything below is either measured from the repository, taken from
published analysis, or reasoning about structure. Every claim about how
something *sounds* is the author's to check.

---

## 1. The reference, and what it actually tells us

The choice of *this* track over *Asayake* or *Domino Line* is the most useful
instruction in the whole brief, and it points the opposite way from the last
three commits.

`Gm7 · C · Dm7 · Eb7` is **i · IV · v · ♭VI7** — a dorian minor with a major
fourth and a borrowed flat sixth used as a chromatic lift. That is *exactly*
the harmonic language already in the build: D dorian, a major IV (`G13`), and a
`Bbmaj9` flat sixth in the bridge. **The harmony is not the problem.**

What is different is everything else. Tears of the Star is spacious, slow
enough to breathe, and built around a guitar that *sings* one melody. It is
four and a half minutes long and it is not in a hurry. The current build is
124 BPM with sixteenth-note hats and a sixteen-bar head that modulates through
three key centres in thirty seconds.

> **The reference is simpler than what we have, not more complex.**

That reframes the whole problem, and it happens to be the right answer for this
application for an independent reason:

> **The player is reading three hundred words of parliamentary prose.** The bed
> must be spacious. The complexity budget belongs in the INTERRUPTIONS, where
> the player has just done something and is looking up.

---

## 2. Casiopea's devices, and which survive our constraints

From published analysis of the band (Hooktheory's corpus statistics; the
general style literature) plus what is audible in the repertoire.

| device | what it is | can we? | note |
|---|---|---|---|
| **Extended rootless voicings** | 9ths, 11ths, ♯11s, 13ths, root left to the bass | **yes, done** | already in `TYPE[].v` |
| **Borrowed / chromatic chords** | ♭VI, ♭III, chords from outside the key as colour | **yes, done** | the bridge |
| **High progression novelty** | Hooktheory scores Casiopea's progressions as unusually uncommon | **yes, partly** | our head modulates; could go further |
| **Modal frameworks over functional cadences** | dorian and lydian centres, few real V–i | **yes, done** | the form never cadences except at prorogation |
| **Unison lines** | guitar + keys + bass on one fast line, often 16th triplets | **yes, done** | `unison()` — but only fires on one mood |
| **Clean, precise, undistorted tone** | note clarity over effects; a light touch | **partly** | detuned saws get "clean electric"; not a real pickup |
| **Layered roles** | keys on pads/arpeggios, guitar on chordal rhythm or melody, bass outlining extensions | **yes, partly** | roles are assigned; the bass does *not* outline extensions, only root/fifth |
| **Dynamic shifts between sections** | sparse textures building to full ensemble | **NO — ABSENT** | see §4.1. This is the biggest gap |
| **Explosive, intricate drumming** | ghost notes at several dynamics, ride wash, open hats | **partly** | we have kick/snare/ghost/hat/tom/crash and no ride, one ghost level |
| **Head–solos–head form** | the tune, then blowing, then the tune | **yes, done** | `HEAD VAMP … SOLO … HEAD` |
| **Shout chorus / ensemble hits** | the whole band on a written figure, usually the climax | **NO — ABSENT** | §4.3 |
| **Stop-time** | accented attacks alternating with *silence*, not a fade | **NO — MISNAMED** | §4.4 |
| **Trading fours / drum feature** | soloist and drummer alternate four-bar phrases | **NO — ABSENT** | §4.6 |
| **16th-note triplet phrases** | the signature unison rhythm | **yes, cheap** | not currently used anywhere |

**Three hard limits, stated plainly so nobody re-litigates them:**

1. **Drums.** Synthesised noise bursts can imitate a kit; they cannot imitate a
   drummer. Ghost notes at three dynamics, a ride with a building wash, hi-hat
   opening under the foot — these are sampling problems, and `fetch()` is
   blocked on `file://` so there is no sampling. **This will always be the tell.**
2. **Guitar tone.** Compression, chorus and pick attack with real string noise
   are what make Noro's tone; two detuned saws through a closing filter get
   "clean electric" and stop there.
3. **Ensemble feel.** Four humans pushing and pulling against each other is not
   available from a quantised scheduler, and the light 7% swing is the whole of
   our answer to it.

---

## 3. THE INTERRUPTION AUDIT

Every musical response the build currently makes, measured from
`js/music.js` and `js/ui.js`.

### 3.1 The gesture inventory — five figures exist

| gesture | what it plays | used by |
|---|---|---|
| `unison()` | 8 sixteenths, the head's opening, on guitar + Rhodes + horn + bass in four octaves | `moment` only |
| `runUp()` | 16 ascending sixteenths through the mode, one bar, guitar | `rise` only |
| `plane()` | the chord approached from 3 semitones below in 3 stabs | `order` only |
| `hit()` | whole band on one chord: guitar, Rhodes, bass, kick | `undertake`, `order`, `prorogue` |
| `crash()` | a cymbal | `moment`, `rise`, `prorogue`, and bar 1 of any dense section |

### 3.2 The eight moods, and what each actually does

| mood | fires on | key | jumps to | feel | gesture | layers moved |
|---|---|---|---|---|---|---|
| `tension` | a division is called | — | — | half-time | — | pad, keys, gtr, reed → 0; drums ×0.8 |
| `moment` | a bill carries | **+2** | HEAD | — | UNISON, CRASH | drums↑, lead↑, all restored |
| `defeat` | a bill fails | **−3** | BRIDGE | — | — | lead, gtr, keys → 0; drums ×0.6 |
| `rise` | a government opens | **→0** | HEAD | — | RUN, CRASH | drums↑, lead↑ |
| `sombre` | the government falls | **→0** | BRIDGE | half-time | — | lead, gtr, keys, drums → 0 |
| `undertake` | an undertaking is entered | — | — | — | HIT | — |
| `order` | an instrument is made | — | — | — | PLANE, HIT | — |
| `prorogue` | the session ends | **→0** | VAMP | — | HIT, CRASH | the one cadence |

### 3.3 Coverage: 8 wired, 12 silent

**Has a musical response:** division called · bill carries · bill fails ·
government opens · government falls · undertaking entered · instrument made ·
prorogation.

**Makes no sound at all:** a slot granted to a bill · a bill advancing a stage ·
an appointment filled · a prayer carried against an order · an order revoked ·
an MP crossing the floor · **signatures reaching the ballot threshold** · a
station falling below reserve · a suspension beginning · a chapter turning ·
an election called · an election result.

Twelve of twenty. The starred one is the leadership challenge — the single most
dramatic thing that can happen to the player short of losing — and the score
does not notice it.

---

## 4. WHAT IS MISSING — measured, not guessed

### 4.1 There is no crescendo anywhere in the score. None.

**This is the headline and it answers the question directly.**

A grep for any voice call whose amplitude is a function of position, section,
density or time returns **four results, and all four are false positives** —
they are `i * 0.005` stagger offsets on the *attack time* of a strummed chord,
not amplitude.

Every one of the twenty-six voice calls in the file passes a **hardcoded
constant** as its level. The only dynamic mechanism in the entire module is
`ramp()` on the seven layer gains, and it is called *only from the eight moods*.

So: the score can jump between loudness plateaus when an event fires, and it can
do nothing else. It cannot swell into a section, build across a solo, lift a
final chorus, or push into a fill. **The thing the brief asked about by name
does not exist in any form.**

### 4.2 The solo does not build

`improvise()` is one line of output: `horn(t, hz(n + keyNow), …, 0.10)`. Fixed
amplitude. The note-choosing is a random walk with a fixed rest probability
(24%) and a fixed leap probability (18%), and **nothing in it refers to
`barIdx`**. Bar 1 of the solo and bar 16 of the solo are statistically identical.

A real solo starts low and sparse and ends high and busy. Ours is a flat
sixteen bars of noodling, which is the most common way an algorithmic solo
sounds wrong.

### 4.3 The two statements of the head are byte-identical

`HEAD` is one array played at itinerary positions 0 and 8. No last-chorus lift,
no added voice, no shout chorus, no altered ending. In every fusion record the *last*
head is the biggest thing on the track; here it is a repeat.

### 4.4 "Stop-time" is a fade, not stop-time

`tension()` ramps four layers to zero over 200–300ms and drops the kit to
half-time. That is a **mute**, not stop-time. Stop-time is *accented attacks
alternating with silence* — the band hits beat one and leaves the bar empty.
The current gesture is the correct instinct implemented as a mixer move.

### 4.5 Fills mark phrases but never transitions

Fills fire on `barIdx % 4 === 3` inside a section. There is **no fill into a
section change and no fill into a mood** — a mood jumps to a new section at the
next bar line with nothing announcing it but, sometimes, a crash *on* the
downbeat. A fill is how a real band tells you a change is coming; ours arrive
unannounced.

### 4.6 No trading, no drum feature, no ensemble hits

Three standard fusion devices, all absent, all cheap:
- **trading fours** — soloist and drums alternating four-bar phrases;
- **a drum feature** — the band drops out and the kit plays alone;
- **ensemble hits** — the whole band on a written rhythmic figure.

The last of these is the natural shape for a *big* game event and we have
nothing like it.

### 4.7 Key change is one size regardless of the event

`moment` is always +2 and `defeat` is always −3, whether the bill was the
government's flagship or a minor instrument, whether it carried by one vote or
a hundred. The engine *knows* the margin — `division()` returns `aye`, `need`
and `total` for both tiers — and the score does not ask.

### 4.8 The bass does not outline extensions

Published analysis names "basslines frequently outline chord extensions" as a
Casiopea trait. Ours plays root, fifth, and a chromatic approach. It never
touches the 9th, the 7th or the 13th, which is most of what makes a fusion bass
line sound like one rather than like a funk line under a jazz chord.

### 4.9 Nothing accumulates

`barCount` appears three times in the file and none of them affects the music
any more. There is no state that says "this has been going on a while" — so a
player forty sittings in hears exactly the arrangement a player at sitting one
hears.

---

## 5. THE RECOMMENDATION

> **Simplify the bed toward the reference. Spend everything saved, and more, on
> the interruptions.**

That is one decision serving two masters at once: it is what the reference
track actually sounds like, *and* it is what a game whose player is reading
needs. The current build has it backwards — a busy bed and eight interruptions
that are mostly layer fades.

### 5.1 The bed, simplified

- **Tempo down** to around 108. 124 with sixteenth hats is a burner; the
  reference is not.
- **The vamp thinner still** — currently density 1 already, but it should lose
  the Rhodes entirely and let the guitar and bass carry it.
- **Fewer statements of the head, and the head shorter** — sixteen bars that
  modulate twice is a lot of tune. Eight, with one modulation, states the idea
  and gets out.

### 5.2 The interruptions, in priority order

| # | what | why it is first | cost |
|---|---|---|---|
| 1 | **A crescendo primitive** — an amplitude that is a function of position, and a `swell(bars)` that ramps the whole ensemble | Nothing else on this list is possible without it. It is the missing verb. | small |
| 2 | **The solo builds** — register, density and amplitude all rise across its sixteen bars | The flattest-sounding thing in the build, and the fix is three expressions | small |
| 3 | **Transition fills** — a fill *into* every section change and every mood jump | The reason changes currently sound like edits rather than arrivals | small |
| 4 | **Real stop-time for `tension`** — band hits one, silence, hits one | A division should feel like the room going quiet, not like a fader | small |
| 5 | **A shout chorus** — the whole band on a written figure, reserved for the biggest event | Gives `moment` somewhere bigger to go than "+2 and the head" | medium |
| 6 | **Key change scaled to the margin** — `division()` already returns it | Makes the barometer honest: a squeaker should not sound like a landslide | small |
| 7 | **The last head is the big one** — a variation flag, not a second array | Standard, and it is what makes a form feel like it ended | medium |
| 8 | **Wire the twelve silent moments**, starting with the leadership challenge | The most dramatic thing in the game is currently silent | medium |
| 9 | **Bass outlines extensions** — 9ths and 7ths in the line, not just root and fifth | Named in the analysis as a defining trait; ours is a funk line | small |
| 10 | **Trading fours in the solo** — four bars of horn, four of kit | Cheap once the fill vocabulary exists | small |

### 5.3 Deliberately NOT recommended

- **Sampled drums.** Impossible under `file://` and the reason is architectural.
- **Tempo changes.** The module's own rule, and correct for a government
  terminal: a swell is a layer entering, not the band speeding up.
- **More harmonic complexity.** The reference is simpler than what we have. The
  chord vocabulary is already right and going further makes it less like the
  track, not more.
- **A second solo instrument.** Trading guitar and keys is very Casiopea and it
  doubles the improviser's surface for one texture.

---

## 6. Acceptance

Before this document can be called closed, in `npm run check`:

- A crescendo exists and is measurable: a voice's amplitude differs between the
  first and last bar of a build, asserted by driving the sequencer.
- The solo's mean register and note count both rise across its sixteen bars.
- Every section change and every mood jump is preceded by a fill.
- `tension` produces attacks separated by measured silence, not a monotonic
  ramp to zero.
- The key change from a carried bill differs between a one-vote margin and a
  hundred-vote margin.
- Fewer than six of the twenty game moments are silent.
- The last statement of the head differs measurably from the first.
