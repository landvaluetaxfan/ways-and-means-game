/* =============================================================
   MUSIC — the adaptive score.

   Japanese jazz fusion at 124 BPM, home key D dorian, synthesised
   from oscillators. No assets, same as the cues.

   ---------------------------------------------------------------
   THE ONE IDEA, AND WHY THE LAST VERSION DID NOT HAVE ONE

   The previous score was built in four passes — detune, then
   sections, then a head, then FM — and the result was a file where
   the harmony was designed at one point, the melody at another, the
   bass at another and the drums at another. NONE OF THEM KNEW ABOUT
   ANY OF THE OTHERS. Measured: sixteen bars of head containing
   sixteen distinct melodic shapes, a bass indexed off a global bar
   counter, and fills firing on that same counter so they landed in
   the middle of melodic phrases. That is what "no reason to it"
   sounds like, and no amount of mixing was going to fix it.

   Everything here comes from ONE CELL.

     THE CELL is six notes over two bars, written as DEGREES of the
     chord's own scale rather than as pitches. Playing it over a
     different chord is therefore a real diatonic sequence, not a
     transposition: A C D C A F becomes C E F E C A becomes
     G B C B G E. Same shape, new harmony, and the ear follows it.

     THE TUNE is that cell three times over three chord areas and
     then an answering figure that climbs and comes down — a a a b,
     twice, sixteen bars. Repetition is what makes a melody a melody;
     the last one had none and that was the whole problem.

     THE RHYTHM SECTION AGREES WITH IT. Kick, bass and comping all
     accent one shared set of positions, and three of those six
     coincide with the cell's own onsets. Not unison — the band
     agrees about where the push is and differs about the rest,
     which is what an arrangement is.

     THE DRUMMER PLAYS PHRASES. Fills land on the last bar of each
     four-bar phrase WITHIN a section, not every fourth bar of an
     endless count, so a fill marks the end of an idea.

   DENSITY IS A COMPOSITIONAL PARAMETER, not a mixing one. The vamp
   is where the player actually reads three hundred words of
   parliamentary prose, so it is sparse on purpose and it is most of
   the record. The tune is an event; the solo is the loud part. A
   score that plays its head over and over at full density is
   exhausting in a text game whatever it sounds like in isolation.

   ---------------------------------------------------------------
   THE ADAPTIVE PART. Sections plus an itinerary, and a mood can
   redirect it at the next bar line — abrupt AND on the grid, which
   is what makes an interruption read as composed. The whole form
   transposes, so carrying a bill lifts the key and losing one drops
   it, bounded, and prorogation brings it home. The key is the one
   thing the score tells the player that the interface does not.

   THE FORM NEVER CADENCES, EXCEPT ONCE. Every ii-V inside the head
   resolves; the form does not. The single exception is prorogation,
   and it is the only full stop in the score.

   ---------------------------------------------------------------
   THE HARD RULE, from js/audio.js: music is started and swelled by
   USER ACTIONS and ENGINE OUTCOMES only, never from a draw function.

   NEVER DRAW FROM THE GAME'S PRNG. Engine.draw() advances the save's
   seed, so a solo that asked it for a note would change which events
   fire. The improviser has its OWN generator for exactly that reason.

   NOTHING HERE MAY THROW. Web Audio may be absent, blocked or
   suspended; every entry point checks and returns.
   ============================================================= */
const Music = (function () {
  "use strict";

  const BPM = 124, BEATS = 4;
  const SPB = 60 / BPM;
  const DIV = 4;
  const STEP = SPB / DIV;
  const PER_BAR = BEATS * DIV;      /* 16 */
  const SWING = STEP * 0.07;

  const LAYERS = [
    { id: "pad",   level: 0.04 },
    { id: "bass",  level: 0.23 },
    { id: "keys",  level: 0.11 },
    { id: "gtr",   level: 0.11 },
    { id: "reed",  level: 0.06 },
    { id: "drums", level: 0.14 },
    { id: "lead",  level: 0.14 }
  ];
  const BED = ["bass", "drums", "keys", "gtr", "pad", "reed"];

  /* ---------------------------------------------------------------
     HARMONY. A chord is a root and a type; the type carries the four
     intervals the comping voices (rootless — the bass has the root)
     and the SCALE, which is what the melody and the improviser are
     allowed to use. Real chord-scale relationships, not one mode for
     the whole tune, which is why the head can modulate.
     --------------------------------------------------------------- */
  const TYPE = {
    m11:     { v: [3, 7, 10, 2], s: [0, 2, 3, 5, 7, 9, 10] },      /* dorian */
    maj9:    { v: [4, 7, 11, 2], s: [0, 2, 4, 5, 7, 9, 11] },      /* ionian */
    maj7s11: { v: [4, 6, 11, 2], s: [0, 2, 4, 6, 7, 9, 11] },      /* lydian */
    dom13:   { v: [4, 9, 10, 2], s: [0, 2, 4, 6, 7, 9, 10] },      /* lydian dominant */
    sus13:   { v: [5, 9, 10, 2], s: [0, 2, 4, 5, 7, 9, 10] },      /* mixolydian */
    dom7b9:  { v: [4, 10, 1, 6], s: [0, 1, 3, 4, 6, 7, 9, 10] },   /* half-whole */
    m7b5:    { v: [3, 6, 10, 5], s: [0, 2, 3, 5, 6, 8, 10] }       /* locrian nat 2 */
  };
  const CH = {
    Dm11:[2,"m11"], Em11:[4,"m11"], Am11:[9,"m11"], Bm11:[11,"m11"],
    Fmaj7s11:[5,"maj7s11"], Cmaj7s11:[0,"maj7s11"], Abmaj7s11:[8,"maj7s11"],
    Cmaj9:[0,"maj9"], Gmaj9:[7,"maj9"], Amaj9:[9,"maj9"],
    Bbmaj9:[10,"maj9"], Ebmaj9:[3,"maj9"],
    G13:[7,"dom13"], E13:[4,"dom13"], D13sus:[2,"sus13"],
    E7b9:[4,"dom7b9"], A7b9:[9,"dom7b9"],
    Bm7b5:[11,"m7b5"], Fsm7b5:[6,"m7b5"], Am7b5:[9,"m7b5"]
  };

  /* ---------------------------------------------------------------
     THE CELL, and the answer to it.

     [beat within a two-bar span, DEGREE of the chord's scale,
      duration in beats]

     `a` rises a fourth and falls back — six notes, one long one to
     finish on. `b` is the answer: it starts where `a` ended up, climbs
     an octave above it and walks down, which is what makes eight bars
     feel closed without a cadence.
     --------------------------------------------------------------- */
  const FIGS = {
    a: [[0.5,4,0.5],[1,6,1.5],[2.5,7,0.5],[3,6,1],[4,4,1.5],[5.5,2,2.5]],
    b: [[0,7,0.5],[0.5,8,0.5],[1,9,1.5],[2.5,8,0.5],[3,7,1],[4,6,1.5],[5.5,4,2.5]]
  };

  /* THE SHARED ACCENTS, over the same two-bar span in sixteenths.
     Kick, bass and comping all key off these. Three of the six fall
     on the cell's own onsets, so the band agrees about where the push
     is and differs about the rest. */
  const ACC   = [0, 6, 10, 16, 22, 26];
  const KICKA = [0, 6, 16, 22];
  const COMPA = [6, 10, 22, 26];
  const SNARE = [4, 12];                /* the backbeat is the grid */
  const GHOST = [7, 15];
  const FILL  = [[12,"t",240],[13,"t",200],[14,"s",0.26],[14.5,"t",165],[15,"s",0.32]];

  const MOTIF  = [69, 72, 74, 72];
  const UNISON = [69, 72, 74, 72, 69, 67, 65, 62];
  const RUN    = [50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76];
  const KEY_MIN = -4, KEY_MAX = 5;

  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const pc = n => ((n % 12) + 12) % 12;

  /* ---------------------------------------------------------------
     THE FORM. `c` is the chord or chords in the bar; `f` marks the
     first bar of a two-bar figure; `d` is the density.

     THE VAMP IS MOST OF THE RECORD, on purpose. It is where three
     hundred words of parliamentary prose get read.
     --------------------------------------------------------------- */
  const HEAD = [
    { c:["Dm11"], f:"a" },          { c:["Dm11","Em11"] },
    { c:["Fmaj7s11"], f:"a" },      { c:["Fmaj7s11","G13"] },
    { c:["Cmaj9"], f:"a" },         { c:["Cmaj9","Am11"] },
    { c:["Bm7b5","E7b9"], f:"b" },  { c:["Am11","D13sus"] },
    { c:["Gmaj9"], f:"a" },         { c:["Gmaj9","Fsm7b5"] },
    { c:["Bm11"], f:"a" },          { c:["Bm11","E13"] },
    { c:["Amaj9"], f:"a" },         { c:["Cmaj7s11"] },
    { c:["Bm11","E7b9"], f:"b" },   { c:["Am11","D13sus"] }
  ];
  const VAMP = [
    { c:["Dm11"] }, { c:["Dm11"] }, { c:["Dm11","Em11"] }, { c:["G13"] },
    { c:["Dm11"] }, { c:["Dm11","Fmaj7s11"] }, { c:["G13"] }, { c:["G13"] }
  ];
  const BRIDGE = [
    { c:["Bbmaj9"] }, { c:["Bbmaj9","Am7b5"] }, { c:["Ebmaj9"] },
    { c:["Ebmaj9","D13sus"] }, { c:["Abmaj7s11"] },
    { c:["Abmaj7s11","G13"] }, { c:["Cmaj7s11"] }, { c:["G13"] }
  ];
  const SOLO = HEAD.map(b => ({ c: b.c, solo: true }));

  const SECTIONS = {
    VAMP:   { bars: VAMP,   d: 1 },   /* sparse. the reading room */
    BRIDGE: { bars: BRIDGE, d: 2 },
    SOLO:   { bars: SOLO,   d: 2 },
    HEAD:   { bars: HEAD,   d: 3 }    /* the tune, and it is an event */
  };
  const ITINERARY = ["HEAD","VAMP","VAMP","BRIDGE","VAMP",
                     "SOLO","VAMP","VAMP","HEAD","VAMP"];

  /* ---------------------------------------------------------------
     RENDERING THE CELL.

     A degree becomes a pitch through the scale of whatever chord is
     sounding at that beat, so the tune adapts to the changes as it
     goes. The octave of the WHOLE two-bar phrase is normalised
     together, never note by note, or the contour breaks in the
     middle — and only when the phrase has actually drifted out of a
     singable register, so a sequence does not jump an octave between
     one repetition and the next.
     --------------------------------------------------------------- */
  function chordOf(bar, beat) {
    return CH[bar.c.length > 1 && beat >= BEATS / 2 ? bar.c[1] : bar.c[0]];
  }
  function renderFigure(fig, bars, i) {
    const out = fig.map(([b, d, dur]) => {
      const bar = bars[i + (b >= BEATS ? 1 : 0)];
      if (!bar) return null;
      const ch = chordOf(bar, b % BEATS);
      const sc = TYPE[ch[1]].s;
      const k = ((d % sc.length) + sc.length) % sc.length;
      return [b, 60 + ch[0] + sc[k] + 12 * Math.floor(d / sc.length), dur];
    }).filter(Boolean);
    if (!out.length) return out;
    const mean = out.reduce((n, x) => n + x[1], 0) / out.length;
    let sh = 0;
    if (mean < 66) sh = 12 * Math.ceil((66 - mean) / 12);
    else if (mean > 82) sh = -12 * Math.ceil((mean - 82) / 12);
    return out.map(([b, m, d]) => [b, m + sh, d]);
  }
  /* Attach the rendered tune to each bar once, at load, so the
     sequencer stays a sequencer and the checks can read the melody. */
  Object.keys(SECTIONS).forEach(name => {
    const bars = SECTIONS[name].bars;
    bars.forEach((bar, i) => {
      if (!bar.f) return;
      renderFigure(FIGS[bar.f], bars, i).forEach(([b, m, d]) => {
        const at = bars[i + (b >= BEATS ? 1 : 0)];
        (at.m || (at.m = [])).push([m, b % BEATS, d]);
      });
    });
  });

  let ctx = null, out = null, send = null, gains = {}, NOISE = null;
  let playing = false, step = 0, nextTime = 0, timer = null;
  let secIdx = 0, barIdx = 0, current = null, dens = 1, barCount = 0;
  let jumpTo = null, keyNow = 0, keyNext = null, halfTime = false;
  let lastVoicing = null;

  /* The improviser's own random source, permanently separate from
     Engine.draw(): the game's PRNG is save state and a solo that
     consumed it would change which events fire. */
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

  /* VOICE LEADING. Fixed shapes jump; a player moves as little as
     possible. Pick the inversion nearest the previous chord. */
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
  /* Pull a note onto the nearest member of a chord's scale. The only
     musical decision made at runtime, so it is exported and tested. */
  function snap(n, root, scale) {
    let best = n, bestD = 99;
    for (let o = -6; o <= 6; o++) {
      if (scale.indexOf(pc(n + o - root)) < 0) continue;
      if (Math.abs(o) < bestD) { bestD = Math.abs(o); best = n + o; }
    }
    return best;
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
         ramp takes its START value from the previous event; an assigned
         .value is not an event and cancelAndHoldAtTime cannot invent one
         to hold. Where that resolves the wrong way every layer stays at
         zero: the sequencer runs, every oscillator starts on time, and
         the output is silence. */
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

  /* ---------- voices ----------
     FM FIRST, because it is the sound of this music. One oscillator
     drives another's frequency; the RATIO sets the harmonic character
     and the INDEX envelope sets how the tone changes as the note
     decays. A high ratio with a fast-decaying index is a struck tine.
     A ratio of one with an index rising into the note is a blown horn. */
  function fm(t, freq, dur, o) {
    const car = ctx.createOscillator(), mod = ctx.createOscillator();
    const mg = ctx.createGain(), g = ctx.createGain();
    car.type = "sine"; car.frequency.value = freq;
    mod.type = "sine"; mod.frequency.value = freq * o.ratio;
    mg.gain.setValueAtTime(freq * o.index * (o.idxFrom == null ? 1 : o.idxFrom), t);
    mg.gain.exponentialRampToValueAtTime(
      Math.max(0.01, freq * o.index * (o.idxTo == null ? 0.02 : o.idxTo)),
      t + (o.idxTime || dur * 0.5));
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.peak, t + (o.attack || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    mod.connect(mg); mg.connect(car.frequency); car.connect(g); g.connect(gains[o.to]);
    mod.start(t); car.start(t); mod.stop(t + dur + 0.05); car.stop(t + dur + 0.05);
  }
  const rhodes = (t, f, dur, amp) => fm(t, f, dur, {
    to: "keys", ratio: 14, peak: amp || 0.24, index: 1.4,
    idxFrom: 1, idxTo: 0.015, idxTime: 0.08, attack: 0.004 });
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
    sub.type = "sine"; sub.frequency.value = fr; sg.gain.value = 0.55;
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
  function kick(t, amp) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(125, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp || 0.8, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g); g.connect(gains.drums); o.start(t); o.stop(t + 0.23);
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
    o.connect(g); g.connect(gains.drums); o.start(t); o.stop(t + 0.22);
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

  /* ---------- the improviser ---------- */
  let soloNote = 72;
  function improvise(t, chord, st) {
    if (st % 2) return;
    if (rnd() < 0.24) return;
    const scale = TYPE[chord[1]].s;
    const dir = rnd() < 0.5 ? -1 : 1;
    const leap = rnd() < 0.18 ? 3 : 1;
    const n = Math.max(64, Math.min(86,
      snap(soloNote + dir * leap * (1 + Math.floor(rnd() * 2)), chord[0], scale)));
    soloNote = n;
    horn(t, hz(n + keyNow), STEP * (rnd() < 0.3 ? 3.4 : 1.7), 0.10);
  }

  /* ---------- the arrangement ---------- */
  function turnBar() {
    if (current === null) { secIdx = 0; barIdx = 0; }
    else if (jumpTo != null) { secIdx = jumpTo; barIdx = 0; jumpTo = null; }
    else {
      barIdx++;
      if (barIdx >= SECTIONS[ITINERARY[secIdx]].bars.length) {
        secIdx = (secIdx + 1) % ITINERARY.length; barIdx = 0;
      }
    }
    if (keyNext != null) { keyNow = clampKey(keyNext); keyNext = null; }
    const sec = SECTIONS[ITINERARY[secIdx]];
    current = sec.bars[barIdx]; dens = sec.d; barCount++;
  }

  function scheduleStep(s, t0) {
    const st = s % PER_BAR;
    if (st === 0) turnBar();
    const b = current; if (!b) return;
    const t = t0 + (st % 2 ? SWING : 0);
    const ch = chordOf(b, st / DIV);
    const root = 33 + pc(ch[0] - 9);
    /* the shared accents run over TWO bars, so which half we are in
       decides which of them apply here */
    const half = (barIdx % 2) * PER_BAR;
    const acc = a => ACC.indexOf(a + half) >= 0;

    if (st === 0 || (b.c.length > 1 && st === PER_BAR / 2))
      lastVoicing = voicing(ch[0], ch[1]);
    const V = lastVoicing || [57, 60, 64, 67];

    /* THE BASS on the shared accents, root and fifth, with a chromatic
       approach into the next bar. It agrees with the kick because they
       read the same list. */
    if (acc(st) || (!halfTime && st === 14 && barIdx % 2)) {
      let m = st === 14 ? root - 1 : (st === 10 || st === 26 - half) ? root + 7 : root;
      while (m + keyNow < 31) m += 12;                 /* the octave up, never the hole */
      bass(t, hz(m + keyNow), (st === 0 ? 3 : 2) * STEP, (st === 0 ? 0.5 : 0.4));
    }

    /* THE KIT. A fill on the LAST BAR OF A FOUR-BAR PHRASE inside this
       section, so it marks the end of an idea rather than the end of a
       count that nothing else knows about. */
    const filling = !halfTime && dens >= 2 && barIdx % 4 === 3 && st >= 12;
    if (filling) {
      FILL.forEach(([at, kind, v]) => {
        if (Math.abs(at - st) > 0.001 && Math.abs(at - 0.5 - st) > 0.001) return;
        const ft = t + (at % 1 ? STEP / 2 : 0);
        if (kind === "t") tom(ft, v, 0.3); else snare(ft, v);
      });
    } else if (halfTime) {
      if (st === 0) kick(t, 0.85);
      if (st === 8) snare(t, 0.3);
    } else {
      if (KICKA.indexOf(st + half) >= 0) kick(t, st === 0 ? 0.85 : 0.6);
      if (SNARE.indexOf(st) >= 0) snare(t, 0.3);
      if (dens >= 2 && GHOST.indexOf(st) >= 0) snare(t, 0.05);
    }
    /* DENSITY IS COMPOSITIONAL. The vamp is where the player reads. */
    if (halfTime) { if (st % 4 === 0) hat(t, 0.03); }
    else if (dens === 1) { if (st % 2 === 0) hat(t, st % 4 === 0 ? 0.042 : 0.024); }
    else hat(t, st % 4 === 0 ? 0.048 : st % 2 === 0 ? 0.028 : 0.016, st === 14 && !filling);
    if (st === 0 && barIdx === 0 && dens >= 2) crash(t, 0.14);

    /* COMPING on the shared accents, thinned by density. */
    if (!halfTime && COMPA.indexOf(st + half) >= 0 &&
        (dens >= 2 || (st + half) === COMPA[1] || (st + half) === COMPA[3]))
      V.forEach((m, i) => gtr(t + i * 0.005, hz(m + 12 + keyNow), 0.16, 0.075));
    if (!halfTime && dens >= 2 && (st === 6 || st === 13))
      V.forEach((m, i) => rhodes(t + i * 0.008, hz(m + keyNow), SPB * 0.8, 0.15));
    if (st === 0) pad(t, V.map(m => hz(m + keyNow)), SPB * BEATS);
    if (st === 0 && dens >= 3 && !b.m) reed(t, hz(V[V.length - 1] + keyNow), SPB * 3);

    /* THE TUNE, guitar and electric piano in unison. */
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

  const sectionIndex = n => { const i = ITINERARY.indexOf(n); return i < 0 ? 0 : i; };
  function restore(t, glide) { BED.forEach(id => ramp(id, level(id), t, glide || 1.0)); }
  const V = () => lastVoicing || [57, 60, 64, 67];

  /* ---------- the moods ---------- */
  function tension() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime;
    halfTime = true;
    ramp("pad", 0, t, 0.25); ramp("keys", 0, t, 0.2);
    ramp("gtr", 0, t, 0.2); ramp("reed", 0, t, 0.3);
    ramp("drums", level("drums") * 0.8, t, 0.3);
  }
  function moment() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, bar = nextBarTime();
    halfTime = false;
    keyNext = clampKey(keyNow + 2);
    jumpTo = sectionIndex("HEAD");
    restore(t, 0.4);
    ramp("drums", 0.19, t, 0.35); ramp("lead", 0.17, t, 0.35);
    unison(nextStepTime(), soonKey());
    crash(bar, 0.20);
    const back = bar + 4 * BEATS * SPB;
    ramp("drums", level("drums"), back, 0.9);
    ramp("lead", 0, back, 0.9);
  }
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
    halfTime = false; keyNext = 0;
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
    halfTime = true; keyNext = 0;
    jumpTo = sectionIndex("BRIDGE");
    ramp("lead", 0, t, 0.4); ramp("gtr", 0, t, 0.6); ramp("keys", 0, t, 0.8);
    ramp("drums", 0, t, 1.4);
    ramp("reed", level("reed") * 0.5, t, 1.0);
    restore(t + 8, 3.0);
  }
  function undertake() {
    if (!playing || !ctx) return;
    hit(nextStepTime(), keyNow, V());
  }
  function order() {
    if (!playing || !ctx) return;
    const bar = nextBarTime();
    plane(bar, keyNow, V()); hit(bar, keyNow, V());
  }
  /* PROROGATION — THE ONE CADENCE. Every ii-V inside the head resolves;
     the FORM does not, which is what lets three minutes pass without
     announcing a loop. This is the single exception. */
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
    keyNext = 0; jumpTo = sectionIndex("VAMP");
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
      density: playing && current ? dens : null,
      key: NOTE[pc(2 + keyNow)] + (keyNow ? (keyNow > 0 ? " +" : " ") + keyNow : ""),
      semitones: keyNow, halfTime: halfTime,
      levels: LAYERS.reduce((o, l) => {
        o[l.id] = gains[l.id] ? Math.round(gains[l.id].gain.value * 1000) / 1000 : null;
        return o;
      }, {})
    }),
    __form: { SECTIONS: SECTIONS, ITINERARY: ITINERARY, CH: CH, TYPE: TYPE, FIGS: FIGS,
              ACC: ACC, KICKA: KICKA, COMPA: COMPA,
              MOTIF: MOTIF, UNISON: UNISON, RUN: RUN,
              BPM: BPM, BEATS: BEATS, PER_BAR: PER_BAR,
              KEY_MIN: KEY_MIN, KEY_MAX: KEY_MAX, BED: BED,
              LAYERS: LAYERS.map(l => l.id),
              MOODS: ["tension","moment","defeat","rise","sombre",
                      "undertake","order","prorogue"],
              voicing: voicing, snap: snap }
  };
})();

if (typeof module !== "undefined") module.exports = Music;
