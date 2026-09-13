/* =============================================================
   MUSIC — the adaptive score.

   Japanese jazz fusion at 124 BPM, home key D dorian, synthesised
   from oscillators. No assets, same as the cues.

   ---------------------------------------------------------------
   WHAT SEPARATES THIS FROM FUNK WITH JAZZ CHORDS

   Three earlier versions were a two-chord vamp with a good bass line
   on it, and no amount of mixing was going to make that read as
   fusion. The differences are specific and none of them is timbre:

     HARMONIC RHYTHM. A vamp holds one chord for a bar or two. The
     head here changes twice a bar and moves through three key
     centres in sixteen bars — home in D dorian, up to G and A major
     in the middle eight, chromatically back. Changes are what make
     it jazz; the groove is what makes it funk; it needs both.

     A TUNE. Not a four-note motif — a written sixteen-bar melody
     with leaps, syncopation and chromatic approach notes, played by
     the guitar and the electric piano IN UNISON, which is the single
     most identifiable texture in this music.

     THE DRUMMER IS A PLAYER. Every fourth bar ends in a fill and the
     next one starts on a crash. A kit that plays the identical bar
     eighty-eight times is the loudest possible announcement that
     this is a loop.

   And one that IS timbre, because it is the sound of the genre:

     FM SYNTHESIS. The electric piano and the horn are frequency
     modulation — one oscillator driving another's frequency —
     because that is literally what the instruments being imitated
     were. It is four nodes and it does more for the register than
     every filter in the file.

   THE SOLO IS PLAYED, NOT WRITTEN. Sixteen bars where the lead
   improvises over the head's changes from the chord scale, with a
   contour and a local random source. So the score genuinely never
   repeats, and the one section that is different every time is the
   one a human player would also be making up.

   ---------------------------------------------------------------
   THE ADAPTIVE PART. The arrangement is sections plus an itinerary,
   and a mood can redirect it at the next bar line — abrupt AND on
   the grid, which is what makes an interruption read as composed.
   The whole form transposes in semitones, so carrying a bill lifts
   the key and losing one drops it, bounded, and prorogation brings
   it home. The key is the one thing the score tells the player that
   the interface does not.

   THE FORM NEVER CADENCES, EXCEPT ONCE. Every ii-V inside the head
   resolves; the form itself does not, which is what lets three
   minutes pass without announcing a loop. The single exception is
   prorogation. It is the only full stop in the score and it stays
   that way, or it stops meaning anything.

   ---------------------------------------------------------------
   THE HARD RULE, from js/audio.js: music is started and swelled by
   USER ACTIONS and ENGINE OUTCOMES only, never from a draw function.

   NEVER DRAW FROM THE GAME'S PRNG. Engine.draw() advances the save's
   seed, so a solo that asked it for a note would change which events
   fire. The improviser below has its OWN generator for exactly this
   reason; music must not be able to affect the game.

   NOTHING HERE MAY THROW. Web Audio may be absent, blocked, or
   suspended; every entry point checks and returns.
   ============================================================= */
const Music = (function () {
  "use strict";

  const BPM = 124, BEATS = 4;
  const SPB = 60 / BPM;
  const DIV = 4;                 /* sixteenths */
  const STEP = SPB / DIV;
  const PER_BAR = BEATS * DIV;   /* 16 */
  const SWING = STEP * 0.07;     /* barely anything. this band is tight */

  const LAYERS = [
    { id: "pad",   level: 0.04 },
    { id: "bass",  level: 0.23 },
    { id: "keys",  level: 0.11 },   /* the FM electric piano */
    { id: "gtr",   level: 0.11 },   /* clean electric, comping and unison */
    { id: "reed",  level: 0.06 },   /* the sax, kept from the first version */
    { id: "drums", level: 0.14 },
    { id: "lead",  level: 0.14 }    /* FM horn: solos and the loud moods */
  ];
  const BED = ["bass", "drums", "keys", "gtr", "pad", "reed"];

  /* ---------------------------------------------------------------
     HARMONY.

     A chord is a root and a type. The type carries two things: the
     four intervals the comping voices (rootless — the bass has the
     root, which is why the same shape works over different feet) and
     the SCALE, which is what the melody and the improviser are
     allowed to use. Those scales are the actual chord-scale
     relationships, not one mode for the whole tune, and they are why
     the head can modulate without anything sounding wrong.
     --------------------------------------------------------------- */
  const TYPE = {
    /*            voicing (rootless)   scale                          */
    m11:      { v: [3, 7, 10, 2],  s: [0, 2, 3, 5, 7, 9, 10] },      /* dorian */
    maj9:     { v: [4, 7, 11, 2],  s: [0, 2, 4, 5, 7, 9, 11] },      /* ionian */
    maj7s11:  { v: [4, 6, 11, 2],  s: [0, 2, 4, 6, 7, 9, 11] },      /* lydian */
    dom13:    { v: [4, 9, 10, 2],  s: [0, 2, 4, 6, 7, 9, 10] },      /* lydian dominant */
    sus13:    { v: [5, 9, 10, 2],  s: [0, 2, 4, 5, 7, 9, 10] },      /* mixolydian */
    dom7b9:   { v: [4, 10, 1, 6],  s: [0, 1, 3, 4, 6, 7, 9, 10] },   /* half-whole */
    m7b5:     { v: [3, 6, 10, 5],  s: [0, 2, 3, 5, 6, 8, 10] }       /* locrian nat 2 */
  };

  const CH = {
    Dm11:[2,"m11"],      Em11:[4,"m11"],       Am11:[9,"m11"],    Bm11:[11,"m11"],
    Fmaj7s11:[5,"maj7s11"], Cmaj7s11:[0,"maj7s11"], Abmaj7s11:[8,"maj7s11"],
    Cmaj9:[0,"maj9"],    Gmaj9:[7,"maj9"],     Amaj9:[9,"maj9"],
    Bbmaj9:[10,"maj9"],  Ebmaj9:[3,"maj9"],
    G13:[7,"dom13"],     E13:[4,"dom13"],      D13sus:[2,"sus13"],
    E7b9:[4,"dom7b9"],   A7b9:[9,"dom7b9"],
    Bm7b5:[11,"m7b5"],   Fsm7b5:[6,"m7b5"],    Am7b5:[9,"m7b5"]
  };

  /* ---------------------------------------------------------------
     THE HEAD. Sixteen bars, two chords a bar where it moves, and it
     goes somewhere: D dorian for eight, up to G major and A major for
     four, back through a chromatic Cmaj7#11 and a ii-V. Every note of
     the melody is in the scale of the chord under it, asserted in
     test.js, because that is the difference between jazz and wrong.
     --------------------------------------------------------------- */
  const HEAD = [
    { c:["Dm11"],           m:[[69,0.5,.5],[72,1,.5],[74,1.5,1],[72,3,.5],[69,3.5,.5]] },
    { c:["Dm11","Em11"],    m:[[67,0,1],[65,1,.5],[64,1.5,.5],[62,2,1],[64,3,1]] },
    { c:["Fmaj7s11"],       m:[[65,0,.5],[69,.5,.5],[72,1,.5],[76,1.5,1.5],[74,3,1]] },
    { c:["Fmaj7s11","G13"], m:[[72,0,.5],[71,.5,.5],[69,1,1],[67,2,.5],[71,2.5,.5],[74,3,1]] },
    { c:["Cmaj9"],          m:[[72,0,1.5],[76,1.5,.5],[79,2,1],[76,3,1]] },
    { c:["Cmaj9","Am11"],   m:[[76,0,.5],[74,.5,.5],[72,1,1],[71,2,.5],[69,2.5,.5],[67,3,1]] },
    { c:["Bm7b5","E7b9"],   m:[[71,0,.5],[74,.5,.5],[77,1,1],[76,2,.5],[73,2.5,.5],[71,3,1]] },
    { c:["Am11","D13sus"],  m:[[72,0,1],[69,1,1],[67,2,.5],[69,2.5,.5],[72,3,1]] },
    { c:["Gmaj9"],          m:[[74,0,.5],[78,.5,.5],[81,1,1.5],[79,2.5,.5],[78,3,1]] },
    { c:["Gmaj9","Fsm7b5"], m:[[76,0,.5],[74,.5,.5],[71,1,1],[74,2,.5],[72,2.5,.5],[71,3,1]] },
    { c:["Bm11","E13"],     m:[[74,0,.5],[78,.5,.5],[81,1,1],[80,2,.5],[78,2.5,.5],[76,3,1]] },
    { c:["Amaj9"],          m:[[81,0,1],[76,1,.5],[73,1.5,.5],[76,2,1],[81,3,1]] },
    { c:["Cmaj7s11"],       m:[[79,0,.5],[76,.5,.5],[74,1,1],[78,2,.5],[76,2.5,.5],[72,3,1]] },
    { c:["Bm11","E7b9"],    m:[[74,0,.5],[76,.5,.5],[78,1,1],[76,2,.5],[74,2.5,.5],[73,3,1]] },
    { c:["Am11","D13sus"],  m:[[72,0,.5],[69,.5,.5],[67,1,1],[69,2,.5],[72,2.5,.5],[74,3,1]] },
    { c:["Dm11"],           m:[[74,0,2],[69,2,2]] }
  ];

  /* THE VAMP. Where the game sits most of the time, and the one place
     the harmony stands still enough to read a decision over. */
  const VAMP = [
    { c:["Dm11"] }, { c:["Dm11"] }, { c:["Dm11","Em11"] }, { c:["G13"] },
    { c:["Dm11"] }, { c:["Dm11","Fmaj7s11"] }, { c:["G13"] }, { c:["G13"] }
  ];

  /* THE BRIDGE. Flatward and out of the home key entirely — where a
     defeat sends you, and it does not belong to the vamp at all. */
  const BRIDGE = [
    { c:["Bbmaj9"] }, { c:["Bbmaj9","Am7b5"] }, { c:["Ebmaj9"] },
    { c:["Ebmaj9","D13sus"] }, { c:["Abmaj7s11"] },
    { c:["Abmaj7s11","G13"] }, { c:["Cmaj7s11"] }, { c:["G13"] }
  ];

  /* THE SOLO. The head's changes with the tune taken off, so the
     improviser has something worth playing over rather than a vamp. */
  const SOLO = HEAD.map(b => ({ c: b.c, solo: true }));

  const SECTIONS = { VAMP: VAMP, HEAD: HEAD, BRIDGE: BRIDGE, SOLO: SOLO };
  /* Written, not shuffled. The head opens and closes it; the solo sits
     in the middle where a fusion record would put it. */
  const ITINERARY = ["HEAD", "VAMP", "VAMP", "SOLO", "VAMP", "BRIDGE", "VAMP", "HEAD"];

  /* ---------------------------------------------------------------
     THE RHYTHM SECTION.

     Four bass cells rather than one pattern, chosen by bar so the line
     is composed and still different every bar. which: 0 root, 1 fifth,
     2 approach, 3 root an octave up.
     --------------------------------------------------------------- */
  const CELLS = [
    [[0,3,1.00,0],[3,1,0.70,3],[6,2,0.92,0],[10,1,0.80,1],[11,1,0.62,0],[14,2,0.85,2]],
    [[0,2,1.00,0],[2,1,0.60,0],[5,1,0.80,3],[6,2,0.90,1],[10,2,0.85,0],[13,1,0.70,2],[14,1,0.70,0]],
    [[0,4,1.00,0],[6,1,0.75,3],[8,2,0.90,1],[11,1,0.70,0],[14,2,0.80,2]],
    [[0,1,1.00,0],[1,1,0.50,0],[3,2,0.85,3],[6,1,0.90,0],[8,2,0.80,1],[12,2,0.90,0],[15,1,0.70,2]]
  ];

  const KICK  = [0, 6, 10], SNARE = [4, 12], GHOST = [7, 11, 15];
  const GTR   = [2, 7, 11, 14];        /* the skank, off the beat */
  const KEYS  = [6, 13];
  const KICK_H = [0], SNARE_H = [8];   /* half time: fewer things, same tempo */
  /* the fill: toms down and a snare flam across the last beat */
  const FILL  = [[12,"t",240],[13,"t",200],[14,"s",0.26],[14.5,"t",165],[15,"s",0.32]];

  /* THE SIGNATURE LICK IS THE HEAD'S OWN OPENING, straightened into
     sixteenths. A band quotes its own tune; a separate four-note motif
     would be a second idea competing with the first. */
  const MOTIF  = [69, 72, 74, 72];
  const UNISON = [69, 72, 74, 72, 69, 67, 65, 62];
  const RUN    = [50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76];

  const KEY_MIN = -4, KEY_MAX = 5;

  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const pc = n => ((n % 12) + 12) % 12;

  let ctx = null, out = null, send = null, gains = {}, NOISE = null;
  let playing = false, step = 0, nextTime = 0, timer = null;
  let secIdx = 0, barIdx = 0, current = null, barCount = 0;
  let jumpTo = null, keyNow = 0, keyNext = null, halfTime = false;
  let lastVoicing = null;

  /* THE IMPROVISER'S OWN RANDOM SOURCE. Separate from Engine.draw() on
     purpose and permanently: the game's PRNG is save state, and a solo
     that consumed it would change which events fire. Seeded from a
     constant so a test can drive it, advanced continuously so a
     session never hears the same sixteen bars twice. */
  let rng = 0x9e3779b9;
  function rnd() {
    rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5; rng >>>= 0;
    return rng / 4294967296;
  }

  function pref(k) {
    if (typeof Shell !== "undefined" && Shell.opt) {
      const v = Shell.opt(k);
      if (v !== undefined) return v;
    }
    return undefined;
  }
  const level = id => { const l = LAYERS.find(x => x.id === id); return l ? l.level : 0; };
  const clampKey = k => Math.max(KEY_MIN, Math.min(KEY_MAX, k));
  const soonKey = () => (keyNext == null ? keyNow : keyNext);

  /* which chord is sounding at this sixteenth. Two chords in a bar
     split at the half, which is where the ear expects them. */
  function chordAt(bar, st) {
    const c = bar.c;
    return CH[c.length > 1 && st >= PER_BAR / 2 ? c[1] : c[0]];
  }

  /* ---------------------------------------------------------------
     VOICE LEADING.

     Fixed voicings jump: the same shape transposed to each new root,
     which is what a beginner does and what the last version did. A
     comping player moves as little as possible, so this picks the
     inversion nearest the previous chord. It is four lines and it is
     the difference between chords and a keyboard part.
     --------------------------------------------------------------- */
  function voicing(root, type) {
    const t = TYPE[type] || TYPE.m11;
    const set = t.v.map(i => pc(root + i));
    let best = null, bestCost = Infinity;
    for (let inv = 0; inv <= set.length; inv++) {
      const cand = set.map(p => 55 + pc(p - 55)).sort((a, b) => a - b);
      for (let i = 0; i < inv && i < cand.length; i++) cand[i] += 12;
      cand.sort((a, b) => a - b);
      for (let sh = -12; sh <= 12; sh += 12) {
        const v = cand.map(x => x + sh);
        if (v[0] < 52 || v[v.length - 1] > 79) continue;
        const cost = lastVoicing
          ? v.reduce((n, x, i) => n + Math.abs(x - lastVoicing[i]), 0)
          : Math.abs(v[0] - 57);
        if (cost < bestCost) { bestCost = cost; best = v; }
      }
    }
    return best || set.map(p => 55 + pc(p - 55));
  }

  /* ---------- the graph ---------- */
  function build() {
    ctx = Sound.context(); out = Sound.musicOut();
    if (!ctx || !out) return false;
    const delay = ctx.createDelay(2), fb = ctx.createGain(), wet = ctx.createGain();
    delay.delayTime.value = SPB * 0.75; fb.gain.value = 0.22; wet.gain.value = 0.12;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(out);
    send = delay;
    LAYERS.forEach(l => {
      const g = ctx.createGain();
      g.gain.value = 0;
      /* ANCHOR THE TIMELINE, AND THIS LINE IS THE WHOLE BED. A linear
         ramp takes its START value from the previous event, an assigned
         .value is not an event, and cancelAndHoldAtTime cannot invent
         one to hold. Where that resolves the wrong way every layer stays
         at zero: the sequencer runs, every oscillator starts on time,
         and the output is silence. The cues were never affected because
         every one of them calls setValueAtTime before it ramps. */
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.connect(out);
      gains[l.id] = g;
    });
    gains.gtr.connect(send); gains.lead.connect(send); gains.reed.connect(send);
    NOISE = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = NOISE.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  function ramp(id, target, t, glide) {
    const g = gains[id]; if (!g || !ctx) return;
    const now = ctx.currentTime;
    if (t < now) t = now;
    const v = g.gain.value;
    try {
      if (g.gain.cancelAndHoldAtTime) g.gain.cancelAndHoldAtTime(t);
      else { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(v, t); }
    } catch (e) {
      try { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(v, t); } catch (e2) {}
    }
    try { g.gain.linearRampToValueAtTime(target, t + (glide || 0.4)); } catch (e) {}
  }

  /* ---------------------------------------------------------------
     VOICES.

     FM FIRST, because it is the sound of this music. One oscillator
     drives another's frequency; the RATIO sets the harmonic character
     and the INDEX envelope sets how the tone changes as the note
     decays. A high ratio with a fast-decaying index is a struck tine —
     an electric piano. A ratio of one with an index that rises into
     the note is a blown horn. Four nodes, and it does more for the
     register than every filter in this file.
     --------------------------------------------------------------- */
  function fm(t, freq, dur, opt) {
    const car = ctx.createOscillator(), mod = ctx.createOscillator();
    const mg = ctx.createGain(), g = ctx.createGain();
    const ratio = opt.ratio, peak = opt.peak, idx = opt.index;
    car.type = "sine"; car.frequency.value = freq;
    mod.type = "sine"; mod.frequency.value = freq * ratio;
    mg.gain.setValueAtTime(freq * idx * (opt.idxFrom == null ? 1 : opt.idxFrom), t);
    mg.gain.exponentialRampToValueAtTime(
      Math.max(0.01, freq * idx * (opt.idxTo == null ? 0.02 : opt.idxTo)),
      t + (opt.idxTime || dur * 0.5));
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + (opt.attack || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    mod.connect(mg); mg.connect(car.frequency); car.connect(g);
    g.connect(gains[opt.to]);
    mod.start(t); car.start(t);
    mod.stop(t + dur + 0.05); car.stop(t + dur + 0.05);
  }

  /* the electric piano: a struck tine, ratio fourteen, index gone in
     eighty milliseconds, leaving a near-sine body behind it */
  const rhodes = (t, f, dur, amp) => fm(t, f, dur, {
    to: "keys", ratio: 14, peak: amp || 0.24, index: 1.4,
    idxFrom: 1, idxTo: 0.015, idxTime: 0.08, attack: 0.004 });
  /* the horn: ratio one, index rising INTO the note, which is what a
     brass player's embouchure does and why it sounds blown */
  const horn = (t, f, dur, amp) => fm(t, f, dur, {
    to: "lead", ratio: 1, peak: amp || 0.11, index: 0.9,
    idxFrom: 0.25, idxTo: 1.0, idxTime: Math.min(0.14, dur * 0.6), attack: 0.03 });

  const DETUNE = 6;
  function pair(t, fr, type, cents) {
    const a = ctx.createOscillator(), b = ctx.createOscillator();
    a.type = b.type = type;
    a.frequency.value = b.frequency.value = fr;
    a.detune.value = -(cents || DETUNE); b.detune.value = (cents || DETUNE);
    return [a, b];
  }

  /* THE GUITAR. A clean electric: two slightly detuned saws through a
     lowpass that closes as the note dies, short and articulate. It
     does the off-beat skank and it plays the head in unison with the
     piano, which is the texture this whole score is aiming at. */
  function gtr(t, fr, dur, amp) {
    const lp = ctx.createBiquadFilter(), g = ctx.createGain();
    lp.type = "lowpass"; lp.Q.value = 1.6;
    lp.frequency.setValueAtTime(Math.min(5200, fr * 9), t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(400, fr * 2.4), t + Math.min(0.3, dur));
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp || 0.13, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    pair(t, fr, "sawtooth", 7).forEach(o => { o.connect(lp); o.start(t); o.stop(t + dur + 0.05); });
    lp.connect(g); g.connect(gains.gtr);
  }

  function bass(t, fr, dur, amp) {
    const o = ctx.createOscillator(), sub = ctx.createOscillator();
    const lp = ctx.createBiquadFilter(), g = ctx.createGain(), sg = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = fr;
    sub.type = "sine";   sub.frequency.value = fr; sg.gain.value = 0.55;
    lp.type = "lowpass"; lp.Q.value = 5;
    lp.frequency.setValueAtTime(Math.min(2600, fr * 15), t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(180, fr * 2.2), t + 0.11);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(amp, t + 0.010);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, amp * 0.45), t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    o.connect(lp); lp.connect(g); sub.connect(sg); sg.connect(g); g.connect(gains.bass);
    o.start(t); sub.start(t); o.stop(t + dur + 0.08); sub.stop(t + dur + 0.08);
  }

  function pad(t, freqs, dur) {
    freqs.forEach(fr => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.026, t + 0.9);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      g.connect(gains.pad);
      pair(t, fr, "sine", 5).forEach(o => { o.connect(g); o.start(t); o.stop(t + dur + 0.1); });
    });
  }

  function reed(t, fr, dur) {
    const lp = ctx.createBiquadFilter(), g = ctx.createGain();
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    lp.type = "lowpass"; lp.frequency.value = 950; lp.Q.value = 0.6;
    vib.frequency.value = 4.6; vg.gain.value = fr * 0.004;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.3);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    pair(t, fr, "sawtooth", 7).forEach(o => {
      vib.connect(vg); vg.connect(o.frequency);
      o.connect(lp); o.start(t); o.stop(t + dur + 0.1);
    });
    lp.connect(g); g.connect(gains.reed);
    vib.start(t); vib.stop(t + dur + 0.1);
  }

  /* ---------- the kit ---------- */
  function kick(t, amp) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(125, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp || 0.8, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g); g.connect(gains.drums);
    o.start(t); o.stop(t + 0.23);
  }
  function snare(t, amp) {
    const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    const o = ctx.createOscillator(), og = ctx.createGain();
    s.buffer = NOISE;
    bp.type = "bandpass"; bp.frequency.value = 1900; bp.Q.value = 0.8;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (amp > 0.1 ? 0.13 : 0.05));
    o.type = "triangle"; o.frequency.value = 185;
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(amp * 0.4, t + 0.003);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    s.connect(bp); bp.connect(g); g.connect(gains.drums);
    o.connect(og); og.connect(gains.drums);
    s.start(t); s.stop(t + 0.18); o.start(t); o.stop(t + 0.09);
  }
  function tom(t, f, amp) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.62, t + 0.16);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp || 0.3, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g); g.connect(gains.drums);
    o.start(t); o.stop(t + 0.22);
  }
  function hat(t, lvl, open) {
    const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = NOISE;
    hp.type = "highpass"; hp.frequency.value = open ? 6200 : 7600;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(lvl, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (open ? 0.22 : 0.035));
    s.connect(hp); hp.connect(g); g.connect(gains.drums);
    s.start(t); s.stop(t + (open ? 0.25 : 0.05));
  }
  function crash(t, amp) {
    const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = NOISE;
    hp.type = "highpass"; hp.frequency.value = 3000;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp || 0.2, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    s.connect(hp); hp.connect(g); g.connect(gains.drums);
    s.start(t); s.stop(t + 1.3);
  }

  /* ---------- the improviser ----------
     Over the solo section the lead plays a line built from the chord
     scale under it, with a contour that walks rather than jumps and
     an occasional rest, because a soloist who never stops is a
     sequencer. Deterministic given the generator, and the generator
     is nobody else's. */
  /* Pull a note onto the nearest member of a chord's own scale. This is
     the only place the score makes a musical decision at runtime rather
     than reading one off the page, so it is exported and tested: a
     wrong answer here is a wrong note over every chord in the solo. */
  function snap(n, root, scale) {
    let best = n, bestD = 99;
    for (let o = -6; o <= 6; o++) {
      const cand = n + o;
      if (scale.indexOf(pc(cand - root)) < 0) continue;
      const d = Math.abs(o);
      if (d < bestD) { bestD = d; best = cand; }
    }
    return best;
  }

  let soloNote = 69;
  function improvise(t, chord, st) {
    if (st % 2) return;                       /* eighths and offbeat sixteenths */
    if (rnd() < 0.22) return;                 /* space */
    const [root, type] = chord;
    const scale = TYPE[type].s;
    const dir = rnd() < 0.5 ? -1 : 1;
    const leap = rnd() < 0.18 ? 3 : 1;
    const n = Math.max(64, Math.min(86,
      snap(soloNote + dir * leap * (1 + Math.floor(rnd() * 2)), root, scale)));
    soloNote = n;
    horn(t, hz(n + keyNow), STEP * (rnd() < 0.3 ? 3.4 : 1.7), 0.10);
  }

  /* ---------- the arrangement ---------- */
  function turnBar() {
    if (current === null) { secIdx = 0; barIdx = 0; }
    else if (jumpTo != null) { secIdx = jumpTo; barIdx = 0; jumpTo = null; }
    else {
      barIdx++;
      if (barIdx >= SECTIONS[ITINERARY[secIdx]].length) {
        secIdx = (secIdx + 1) % ITINERARY.length; barIdx = 0;
      }
    }
    if (keyNext != null) { keyNow = clampKey(keyNext); keyNext = null; }
    current = SECTIONS[ITINERARY[secIdx]][barIdx];
    barCount++;
  }

  function scheduleStep(s, t0) {
    const st = s % PER_BAR;
    if (st === 0) turnBar();
    const b = current; if (!b) return;
    const t = t0 + (st % 2 ? SWING : 0);
    const ch = chordAt(b, st);
    /* the chord's root in the bass's own register, MIDI 33 to 44, so a
       modulation never drops the low end off the bottom of a speaker */
    const root = 33 + pc(ch[0] - 9);

    if (st === 0 || (b.c.length > 1 && st === PER_BAR / 2))
      lastVoicing = voicing(ch[0], ch[1]);
    const V = lastVoicing || [57, 60, 64, 67];

    /* THE BASS, from one of four cells rather than one pattern. */
    const cell = CELLS[barCount % CELLS.length];
    cell.forEach(([at, len, a, which]) => {
      if (at !== st) return;
      if (halfTime && (at % 4)) return;
      let m = which === 3 ? root + 12
            : which === 1 ? root + 7
            : which === 2 ? root - 1 : root;
      /* A BASS PLAYER TAKES THE OCTAVE UP RATHER THAN THE NOTE THAT IS
         NOT THERE. Four semitones down from a root already at A1 leaves
         the low end under the bottom of a laptop speaker and, worse,
         under most of the mixes it has to sit in. */
      while (m + keyNow < 31) m += 12;
      bass(t, hz(m + keyNow), len * STEP, a * 0.5);
    });

    /* THE KIT, and every fourth bar it plays a fill instead of a bar. */
    const filling = !halfTime && (barCount % 4 === 0) && st >= 12;
    if (filling) {
      FILL.forEach(([at, kind, v]) => {
        if (Math.abs(at - st) > 0.001 && Math.abs(at - 0.5 - st) > 0.001) return;
        const ft = t + (at % 1 ? STEP / 2 : 0);
        if (kind === "t") tom(ft, v, 0.3); else snare(ft, v);
      });
    } else {
      const kk = halfTime ? KICK_H : KICK, sn = halfTime ? SNARE_H : SNARE;
      if (kk.indexOf(st) >= 0) kick(t, st === 0 ? 0.85 : 0.6);
      if (sn.indexOf(st) >= 0) snare(t, 0.30);
      if (!halfTime && GHOST.indexOf(st) >= 0) snare(t, 0.05);
    }
    if (!halfTime || st % 4 === 0)
      hat(t, st % 4 === 0 ? 0.048 : st % 2 === 0 ? 0.028 : 0.016, st === 14 && !filling);
    if (st === 0 && barCount % 8 === 1) crash(t, 0.13);

    /* COMPING. The guitar skanks off the beat, the piano answers. */
    if (!halfTime) {
      if (GTR.indexOf(st) >= 0) V.forEach((m, i) => gtr(t + i * 0.005, hz(m + 12 + keyNow), 0.16, 0.075));
      if (KEYS.indexOf(st) >= 0) V.forEach((m, i) => rhodes(t + i * 0.008, hz(m + keyNow), SPB * 0.8, 0.16));
    }
    if (st === 0) pad(t, V.map(m => hz(m + keyNow)), SPB * BEATS);
    if (st === 0 && !b.m && !b.solo) reed(t, hz(V[V.length - 1] + keyNow), SPB * 3);

    /* THE TUNE, guitar and electric piano in unison — the texture. */
    if (b.m) b.m.forEach(([m, beat, d]) => {
      if (Math.abs(beat * DIV - st) > 0.001) return;
      gtr(t, hz(m + keyNow), d * SPB * 0.9, 0.15);
      rhodes(t, hz(m - 12 + keyNow), d * SPB * 0.9, 0.18);
      horn(t, hz(m + keyNow), d * SPB * 0.85, 0.05);
    });
    if (b.solo) improvise(t, ch, st);
  }

  function loop() {
    if (!playing || !ctx) return;
    while (nextTime < ctx.currentTime + 0.3) {
      scheduleStep(step, nextTime);
      nextTime += STEP; step++;
    }
    timer = setTimeout(loop, 40);
  }

  /* ---------- where the grid is ---------- */
  function nextStepTime() {
    if (!ctx) return 0;
    if (!playing) return ctx.currentTime;
    let t = nextTime; const now = ctx.currentTime;
    while (t < now) t += STEP;
    while (t - now > STEP) t -= STEP;
    return t;
  }
  function nextBarTime() {
    if (!ctx) return 0;
    if (!playing) return ctx.currentTime;
    const away = (PER_BAR - (step % PER_BAR)) % PER_BAR;
    return Math.max(ctx.currentTime, nextTime + away * STEP);
  }

  /* ---------- the gestures ---------- */
  function unison(at, k) {
    if (!ctx) return;
    UNISON.forEach((m, i) => {
      const t = at + i * STEP;
      gtr(t, hz(m + k), STEP * 1.5, 0.15);
      rhodes(t, hz(m - 12 + k), STEP * 1.4, 0.20);
      horn(t, hz(m + 12 + k), STEP * 1.4, 0.10);
      bass(t, hz(m - 24 + k), STEP * 1.2, 0.28);
    });
  }
  function runUp(at, k) {
    if (!ctx) return;
    RUN.forEach((m, i) => {
      const t = at + i * STEP;
      gtr(t, hz(m + k), STEP * 1.2, 0.06 + i * 0.005);
      if (i % 4 === 0) hat(t, 0.03);
    });
  }
  function plane(at, k, V) {
    if (!ctx) return;
    [-3, -2, -1].forEach((off, i) => {
      const t = at - (3 - i) * STEP;
      if (t < ctx.currentTime) return;
      V.forEach((m, j) => gtr(t + j * 0.004, hz(m + 12 + k + off), 0.12, 0.09));
    });
  }
  function hit(at, k, V) {
    if (!ctx) return;
    V.forEach((m, j) => gtr(at + j * 0.004, hz(m + 12 + k), 0.2, 0.13));
    rhodes(at, hz(V[0] + k), SPB * 0.6, 0.24);
    bass(at, hz(V[0] - 24 + k), SPB * 0.5, 0.32);
    kick(at, 0.7);
  }

  /* ---------- transport ---------- */
  function start() {
    if (playing || !ctx || !out) return;
    if (ctx.state === "suspended" && ctx.resume) { try { ctx.resume(); } catch (e) {} }
    playing = true; step = 0; nextTime = ctx.currentTime + 0.1;
    secIdx = 0; barIdx = 0; current = null; barCount = 0; jumpTo = null;
    keyNow = 0; keyNext = null; halfTime = false; lastVoicing = null;
    BED.forEach(id => ramp(id, level(id), ctx.currentTime, 1.5));
    loop();
  }
  function stop() {
    playing = false;
    if (timer) { clearTimeout(timer); timer = null; }
    if (!ctx) return;
    LAYERS.forEach(l => ramp(l.id, 0, ctx.currentTime, 0.6));
  }

  const sectionIndex = name => { const i = ITINERARY.indexOf(name); return i < 0 ? 0 : i; };
  function restore(t, glide) { BED.forEach(id => ramp(id, level(id), t, glide || 1.0)); }
  const V = () => lastVoicing || [57, 60, 64, 67];

  /* ---------- the moods ----------
     Each is a device rather than a fade: what the band DOES. Fired
     from js/ui.js and js/shell.js; tools/uxtest.js takes this list
     from the module and fails any mood nothing fires. */

  function tension() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime;
    halfTime = true;
    ramp("pad", 0, t, 0.25); ramp("keys", 0, t, 0.2);
    ramp("gtr", 0, t, 0.2);  ramp("reed", 0, t, 0.3);
    ramp("drums", level("drums") * 0.8, t, 0.3);
  }

  /* A BILL CARRIES. Up a whole tone AND IT STAYS THERE, straight into
     the head, unison hook on the way in. The loudest thing the score
     can do and it must not be spent on anything smaller. */
  function moment() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, bar = nextBarTime();
    halfTime = false;
    keyNext = clampKey(keyNow + 2);
    jumpTo = sectionIndex("HEAD");
    restore(t, 0.4);
    ramp("drums", 0.19, t, 0.35);
    ramp("lead", 0.17, t, 0.35);
    unison(nextStepTime(), soonKey());
    crash(bar, 0.20);
    const back = bar + 4 * BEATS * SPB;
    ramp("drums", level("drums"), back, 0.9);
    ramp("lead", 0, back, 0.9);
  }

  /* A BILL IS LOST. Down a minor third and into the bridge, which is
     out of the home key entirely. */
  function defeat() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime;
    halfTime = false;
    keyNext = clampKey(keyNow - 3);
    jumpTo = sectionIndex("BRIDGE");
    ramp("lead", 0, t, 0.4); ramp("gtr", 0, t, 0.5); ramp("keys", 0, t, 0.5);
    ramp("drums", level("drums") * 0.6, t, 0.6);
    restore(t + 2 * BEATS * SPB, 1.6);
  }

  function rise() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, bar = nextBarTime();
    halfTime = false;
    keyNext = 0;
    jumpTo = sectionIndex("HEAD");
    runUp(Math.max(t, bar - PER_BAR * STEP), soonKey());
    crash(bar, 0.24);
    restore(t, 1.2);
    ramp("drums", 0.18, t, 1.0); ramp("lead", 0.15, t, 1.0);
    const back = bar + 6 * BEATS * SPB;
    ramp("drums", level("drums"), back, 1.0);
    ramp("lead", 0, back, 1.0);
  }

  function sombre() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime;
    halfTime = true;
    jumpTo = sectionIndex("BRIDGE");
    keyNext = 0;
    ramp("lead", 0, t, 0.4); ramp("gtr", 0, t, 0.6); ramp("keys", 0, t, 0.8);
    ramp("drums", 0, t, 1.4);
    ramp("reed", level("reed") * 0.5, t, 1.0);
    restore(t + 8, 3.0);
  }

  /* A promise is not an outcome: one hit, no key change, no jump. */
  function undertake() {
    if (!playing || !ctx) return;
    hit(nextStepTime(), keyNow, V());
  }
  /* An order is in force the moment it is signed, so it arrives rather
     than builds: the chord planes up chromatically and lands. */
  function order() {
    if (!playing || !ctx) return;
    const bar = nextBarTime();
    plane(bar, keyNow, V());
    hit(bar, keyNow, V());
  }

  /* PROROGATION — THE ONE CADENCE. Every ii-V inside the head resolves;
     the FORM does not, which is what lets three minutes pass without
     announcing a loop. This is the single exception: the session ends,
     the dominant finally lands on the tonic, the key goes home. */
  function prorogue() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, bar = nextBarTime();
    halfTime = false;
    const A7 = voicing(9, "dom7b9"), DM = voicing(2, "m11");
    const pre = Math.max(t, bar - 2 * STEP);
    A7.forEach((m, i) => rhodes(pre + i * 0.01, hz(m), SPB, 0.22));
    bass(pre, hz(33), SPB * 0.9, 0.3);
    hit(bar, 0, DM);
    DM.forEach((m, i) => rhodes(bar + i * 0.012, hz(m), SPB * 2.4, 0.24));
    crash(bar, 0.18);
    keyNext = 0;
    jumpTo = sectionIndex("VAMP");
    ramp("lead", 0, t, 0.3);
    restore(bar + BEATS * SPB, 1.6);
  }

  function apply() {
    if (!ctx) return;
    if (pref("music") === false) { if (playing) stop(); }
    else if (!playing) start();
  }
  function init() {
    if (typeof Sound === "undefined") return;
    Sound.onReady(() => { if (build()) { if (pref("music") !== false) start(); } });
  }

  const NOTE = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

  return {
    init: init, start: start, stop: stop, apply: apply,
    tension: tension, moment: moment, defeat: defeat, rise: rise, sombre: sombre,
    undertake: undertake, order: order, prorogue: prorogue,
    available: () => !!ctx,
    state: () => ({
      playing: playing,
      context: ctx ? ctx.state : null,
      section: playing && current ? ITINERARY[secIdx] : null,
      bar: playing && current ? barIdx + 1 : null,
      chord: playing && current ? current.c[0] : null,
      key: NOTE[pc(2 + keyNow)] + (keyNow ? (keyNow > 0 ? " +" : " ") + keyNow : ""),
      semitones: keyNow,
      halfTime: halfTime,
      levels: LAYERS.reduce((o, l) => {
        o[l.id] = gains[l.id] ? Math.round(gains[l.id].gain.value * 1000) / 1000 : null;
        return o;
      }, {})
    }),
    __form: { SECTIONS: SECTIONS, ITINERARY: ITINERARY, CH: CH, TYPE: TYPE,
              MOTIF: MOTIF, UNISON: UNISON, RUN: RUN, CELLS: CELLS,
              BPM: BPM, BEATS: BEATS, PER_BAR: PER_BAR,
              KEY_MIN: KEY_MIN, KEY_MAX: KEY_MAX, BED: BED,
              LAYERS: LAYERS.map(l => l.id),
              MOODS: ["tension","moment","defeat","rise","sombre",
                      "undertake","order","prorogue"],
              voicing: voicing, snap: snap }
  };
})();

if (typeof module !== "undefined") module.exports = Music;
