/* =============================================================
   MUSIC — the adaptive bed.

   Japanese jazz-funk at 100 BPM, home key D dorian, synthesised from
   oscillators and one noise buffer. No assets, same as the cues.

   ---------------------------------------------------------------
   WHY THIS IS NOT A LOOP WITH A VOLUME MIXER ON IT

   The first two versions were: a fixed form, six layers, and a swell
   was a layer fading in. That can express "more" and "less" and it
   cannot express SURPRISE, which is the thing this score is actually
   for. A government does not get gradually louder when it loses a
   division. Something happens, and then you are somewhere else.

   So the sequencer has three powers a mixer does not:

     SECTIONS. The form is four eight-bar sections and an itinerary
     through them. An event can redirect the arrangement — take the
     dark section NOW — and it lands at the next bar line, which is
     what makes an abrupt change read as composed rather than broken.

     TRANSPOSITION. The whole form can be moved in semitones, at a
     bar line, affecting every voice at once. Carrying a bill lifts
     the key. Losing one drops it. Nothing else in the game can make
     the player feel a run of good or bad sittings in their chest.

     GESTURES. One-shot figures scheduled in absolute time and
     belonging to no layer: a unison line, an ascending run, a
     chromatic approach, a stop. These are the interruptions.

   THE KEY IS A READOUT. Because carries lift and defeats drop, the
   key drifts with the government's fortunes, bounded, and prorogation
   returns it home. That is the barometer idea built out of the
   music's own vocabulary rather than bolted on as a filter sweep, and
   it is the one place the score tells the player something the
   interface does not.

   THE FORM NEVER CADENCES, EXCEPT ONCE. Dorian i-IV has no cadence
   available, which is what lets sixty-four bars pass without
   announcing a loop. The single exception is prorogation: the session
   ends, the music resolves, the key goes home. It is the only full
   stop in the score and it has to stay that way to mean anything.

   ---------------------------------------------------------------
   THE HARD RULE, from js/audio.js, applies here too: music is
   started and swelled by USER ACTIONS and ENGINE OUTCOMES only, never
   from a draw function. The sequencer schedules ahead of the clock;
   a redraw must not touch it.

   NEVER DRAW FROM THE GAME'S PRNG HERE. Engine.draw() advances the
   save's seed, so a bar that asked it for a variation would change
   which events fire. Music must not be able to affect the game. The
   arrangement is therefore composed, not shuffled.

   NOTHING HERE MAY THROW. Web Audio may be absent, blocked, or
   suspended; every entry point checks and returns. The context and
   the music bus are borrowed from Sound once it has built them.
   ============================================================= */
const Music = (function () {
  "use strict";

  const BPM = 100, BEATS = 4;
  const SPB = 60 / BPM;        /* seconds per beat */
  const DIV = 4;               /* sixteenths per beat */
  const STEP = SPB / DIV;      /* one sixteenth */
  const PER_BAR = BEATS * DIV; /* 16 steps in a bar */
  const SWING = STEP * 0.08;   /* barely anything. this band is tight */

  const LAYERS = [
    { id: "pad",   level: 0.05 },
    { id: "bass",  level: 0.24 },
    { id: "keys",  level: 0.09 },
    { id: "clav",  level: 0.10 },
    { id: "reed",  level: 0.09 },
    { id: "drums", level: 0.13 },
    { id: "lead",  level: 0.15 }
  ];
  /* WHAT IS ALWAYS PLAYING. The kit is in here: funk with no drums is a
     chord loop, so a swell makes it louder rather than making it exist.
     The horn stays out, because it is the voice that says something. */
  const BED = ["bass", "drums", "keys", "clav", "pad", "reed"];

  /* ---------------------------------------------------------------
     THE HOOK, AND THE LINE IT GROWS INTO.

     D - F - G - B: root, flat third, fourth, and the natural sixth
     that is dorian's whole signature. It works over both chords of the
     vamp — the thirteenth of Dm11 and the third of G13 — which is what
     a vamp hook must do.

     UNISON is the hook opened out and brought back down, played by the
     horn, the keys and the bass together in octaves. Unison writing is
     the single most recognisable texture in this genre and it is the
     right sound for a government agreeing on something: several
     instruments that were doing different things, briefly doing one.
     --------------------------------------------------------------- */
  const MOTIF  = [62, 65, 67, 71];
  const UNISON = [62, 65, 67, 71, 72, 71, 67, 65];
  /* an ascending run through the mode, one bar of sixteenths, used as a
     lift into a section rather than as a melody */
  const RUN = [50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76];

  /* ---------------------------------------------------------------
     THE FORM.

     Voicings are ROOTLESS — the bass carries the root, which is why
     Dm11 and Fmaj9 are the same four notes over different feet. That
     is not a trick for its own sake: it means a section can change
     colour completely by moving one voice.

     ch: the voicing (MIDI). bass: [root, fifth, approach]. reed: the
     long tone. h: the horn line, [midi, beat, beats]. q: a quiet bar,
     no comping. chr: this bar leaves the mode on purpose.
     --------------------------------------------------------------- */
  const DM11   = [57, 60, 64, 67];   /* A C E G  — over D, and over F */
  const G13    = [53, 59, 62, 64];   /* F B D E  — the dorian major IV */
  const CMAJ9  = [55, 59, 62, 64];   /* G B D E */
  const EM11   = [55, 59, 62, 69];   /* G B D A */
  const AM11   = [55, 60, 62, 64];   /* G C D E */
  const BBMAJ9 = [57, 60, 62, 65];   /* A C D F  — over Bb */
  const EBMAJ9 = [55, 58, 62, 65];   /* G Bb D F — over Eb */
  const AM7B5  = [60, 63, 67, 70];   /* C Eb G Bb — over A. the dark one */

  const SECTIONS = {
    /* A — THE VAMP. Home. Dm11 against G13 and nothing else. */
    A: [
      { ch:DM11, bass:[38,45,43], reed:62, q:false, h:null },
      { ch:DM11, bass:[38,45,41], reed:60, q:true,  h:null },
      { ch:DM11, bass:[38,45,43], reed:69, q:false, h:null },
      { ch:G13,  bass:[43,50,48], reed:67, q:false, h:[[71,2,1.5]] },
      { ch:DM11, bass:[38,45,43], reed:62, q:true,  h:null },
      { ch:DM11, bass:[38,45,40], reed:65, q:false, h:null },
      { ch:G13,  bass:[43,50,45], reed:62, q:false, h:null },
      { ch:G13,  bass:[43,50,48], reed:59, q:true,  h:null }
    ],
    /* B — THE LIFT. The same four notes on brighter feet. Nothing has
       modulated; the bass walked somewhere better. */
    B: [
      { ch:DM11,  bass:[41,48,45], reed:65, q:false, h:null },
      { ch:DM11,  bass:[41,48,43], reed:64, q:true,  h:null },
      { ch:CMAJ9, bass:[36,43,41], reed:64, q:false, h:null },
      { ch:CMAJ9, bass:[36,43,38], reed:71, q:true,  h:[[67,1,2]] },
      { ch:EM11,  bass:[40,47,45], reed:67, q:false, h:null },
      { ch:EM11,  bass:[40,47,43], reed:62, q:true,  h:null },
      { ch:AM11,  bass:[45,52,50], reed:69, q:false, h:null },
      { ch:G13,   bass:[43,50,45], reed:59, q:false, h:[[62,2,1.5]] }
    ],
    /* C — THE DARK ONE. Flatward, out of the mode, and it does not
       belong to the vamp at all. This is where a defeat sends you, and
       the last two bars are the way back rather than a resolution. */
    C: [
      { ch:BBMAJ9, bass:[46,53,50], reed:62, q:false, h:null, chr:true },
      { ch:BBMAJ9, bass:[46,53,48], reed:65, q:true,  h:null, chr:true },
      { ch:EBMAJ9, bass:[39,46,43], reed:58, q:false, h:null, chr:true },
      { ch:EBMAJ9, bass:[39,46,41], reed:62, q:true,  h:null, chr:true },
      { ch:AM7B5,  bass:[45,51,48], reed:63, q:false, h:null, chr:true },
      { ch:AM7B5,  bass:[45,51,43], reed:70, q:true,  h:null, chr:true },
      { ch:G13,    bass:[43,50,48], reed:65, q:false, h:null },
      { ch:G13,    bass:[43,50,45], reed:62, q:false, h:[[59,2,2]] }
    ],
    /* D — THE HEAD. The hook stated outright over the vamp. This is
       where a carried bill sends you, and it is the only section that
       sounds like a tune rather than a groove. */
    D: [
      { ch:DM11, bass:[38,45,43], reed:62, q:false,
        h:[[62,0,0.75],[65,1,0.75],[67,2,0.75],[71,3,1]] },
      { ch:DM11, bass:[38,45,41], reed:71, q:true,  h:null },
      { ch:DM11, bass:[38,45,43], reed:69, q:false,
        h:[[72,0,0.5],[71,1,0.5],[67,2,1],[65,3,1]] },
      { ch:G13,  bass:[43,50,48], reed:67, q:false, h:null },
      { ch:DM11, bass:[38,45,43], reed:62, q:true,  h:null },
      { ch:DM11, bass:[38,45,40], reed:65, q:false, h:[[62,2,2]] },
      { ch:G13,  bass:[43,50,45], reed:59, q:false, h:null },
      { ch:G13,  bass:[43,50,48], reed:62, q:true,  h:null }
    ]
  };

  /* THE ARRANGEMENT, and it is written rather than shuffled. Sixty-four
     bars, two and a half minutes, and the head arrives once at the end
     so it stays an event. Events redirect this; left alone it cycles. */
  const ITINERARY = ["A", "A", "B", "A", "C", "A", "B", "D"];

  /* THE BASS LINE, and it is the tune. [step, length in steps, amp,
     which] where which indexes [root, fifth, approach, root+12]. */
  const BASS_T = [
    [0,  3, 1.00, 0],
    [3,  1, 0.70, 3],
    [6,  2, 0.92, 0],
    [10, 1, 0.80, 1],
    [11, 1, 0.62, 0],
    [14, 2, 0.85, 2]
  ];

  const KICK  = [0, 6, 10];
  const SNARE = [4, 12];          /* the backbeat, non-negotiable */
  const GHOST = [7, 11, 15];
  const CLAV  = [2, 7, 11];
  const KEYS  = [6, 13];
  /* HALF TIME is how the score slows down without changing tempo, which
     is forbidden here and would be wrong anyway: the band does not slow
     down, it plays fewer things. Kick on one, backbeat on three. */
  const KICK_H  = [0], SNARE_H = [8], GHOST_H = [];

  /* How far the key may drift. Below this the bass leaves the speaker;
     above it the sax gets shrill and the whole thing sounds anxious for
     the wrong reason. Five semitones of good news is plenty. */
  const KEY_MIN = -4, KEY_MAX = 5;

  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  let ctx = null, out = null, send = null, gains = {}, NOISE = null;
  let playing = false, step = 0, nextTime = 0, timer = null;

  /* where the arrangement is, and where it has been told to go */
  let secIdx = 0, barIdx = 0, current = null;
  let jumpTo = null, keyNow = 0, keyNext = null, halfTime = false;

  function pref(k) {
    if (typeof Shell !== "undefined" && Shell.opt) {
      const v = Shell.opt(k);
      if (v !== undefined) return v;
    }
    return undefined;
  }
  const level = id => { const l = LAYERS.find(x => x.id === id); return l ? l.level : 0; };
  const clampKey = k => Math.max(KEY_MIN, Math.min(KEY_MAX, k));
  /* the effective key for anything scheduled AHEAD of the next bar line */
  const soonKey = () => (keyNext == null ? keyNow : keyNext);
  const f = (m, k) => hz(m + (k == null ? keyNow : k));

  /* ---------- the graph ---------- */
  function build() {
    ctx = Sound.context(); out = Sound.musicOut();
    if (!ctx || !out) return false;
    const delay = ctx.createDelay(2), fb = ctx.createGain(), wet = ctx.createGain();
    delay.delayTime.value = SPB * 0.75; fb.gain.value = 0.24; wet.gain.value = 0.14;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(out);
    send = delay;
    LAYERS.forEach(l => {
      const g = ctx.createGain();
      g.gain.value = 0;
      /* ANCHOR THE TIMELINE, AND THIS LINE IS THE WHOLE BED.

         Every layer gain is written through ramp() and nothing else, and
         ramp() finishes with linearRampToValueAtTime. A linear ramp takes
         its START value from the previous event on the automation
         timeline — and these params had no events on them at all. An
         assigned .value is not an event, and cancelAndHoldAtTime cannot
         invent one to hold when the timeline is empty.

         Where that resolves the wrong way every layer stays at zero: the
         sequencer runs, every oscillator starts and stops on time, the
         graph is connected, and the output is SILENCE. The cues were
         never affected because every one of them calls setValueAtTime
         before it ramps, which is exactly the anchor this was missing. */
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.connect(out);
      gains[l.id] = g;
    });
    gains.reed.connect(send); gains.lead.connect(send); gains.clav.connect(send);
    NOISE = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = NOISE.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  /* Ramps are scheduled AHEAD as well as now — moment() books its own
     release four bars out — so this cannot simply stamp the current value
     at t: that would cancel the ramp running into it. The hold preserves
     it, and build() guarantees there is always something to hold. */
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
     DETUNE IS MOST OF THE TIMBRE. Two oscillators a few cents apart beat
     against each other slowly, and that beating is most of what the ear
     hears as "an instrument" rather than "a tone". Gains are halved
     wherever a voice doubles, so this is colour and not level. */
  const DETUNE = 6;

  function pair(t, fr, type, cents) {
    const a = ctx.createOscillator(), b = ctx.createOscillator();
    a.type = b.type = type;
    a.frequency.value = b.frequency.value = fr;
    a.detune.value = -(cents || DETUNE); b.detune.value = (cents || DETUNE);
    return [a, b];
  }

  /* THE BASS. A fingered electric: a sawtooth through a resonant lowpass
     that snaps shut in a tenth of a second, over a sine that survives a
     laptop speaker. The filter envelope is the pluck, and the pluck is
     the difference between a bass line and a bass note. */
  function bass(t, fr, dur, amp) {
    const o = ctx.createOscillator(), sub = ctx.createOscillator();
    const lp = ctx.createBiquadFilter(), g = ctx.createGain(), sg = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = fr;
    sub.type = "sine";   sub.frequency.value = fr; sg.gain.value = 0.55;
    lp.type = "lowpass"; lp.Q.value = 5;
    lp.frequency.setValueAtTime(Math.min(2400, fr * 14), t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(180, fr * 2.2), t + 0.13);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(amp, t + 0.012);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, amp * 0.45), t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.06);
    o.connect(lp); lp.connect(g); sub.connect(sg); sg.connect(g); g.connect(gains.bass);
    o.start(t); sub.start(t); o.stop(t + dur + 0.1); sub.stop(t + dur + 0.1);
  }

  function pad(t, freqs, dur) {
    freqs.forEach(fr => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.028, t + 1.1);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      g.connect(gains.pad);
      pair(t, fr, "sine", 5).forEach(o => { o.connect(g); o.start(t); o.stop(t + dur + 0.1); });
    });
  }

  /* THE KEYS. An electric piano: a sine fundamental with a bell partial
     four octaves up that decays much faster than the note does. That
     ratio is the whole character. */
  function key(t, fr, dur, amp) {
    const o = ctx.createOscillator(), b = ctx.createOscillator();
    const g = ctx.createGain(), bg = ctx.createGain();
    const pk = amp || 0.30;
    o.type = "sine"; o.frequency.value = fr;
    b.type = "sine"; b.frequency.value = fr * 4.02;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(pk, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    bg.gain.setValueAtTime(0.0001, t);
    bg.gain.exponentialRampToValueAtTime(pk * 0.25, t + 0.005);
    bg.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.35);
    o.connect(g); b.connect(bg); bg.connect(g); g.connect(gains.keys);
    o.start(t); b.start(t); o.stop(t + dur + 0.05); b.stop(t + dur + 0.05);
  }

  /* THE CLAV. Short, bright, off the beat — the texture that says funk
     before any other voice has played a note. */
  function clav(t, freqs, amp) {
    freqs.forEach((fr, i) => {
      const o = ctx.createOscillator(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      const at = t + i * 0.004;
      o.type = "square"; o.frequency.value = fr;
      bp.type = "bandpass"; bp.frequency.value = fr * 2.4; bp.Q.value = 3.2;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(amp || 0.085, at + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.11);
      o.connect(bp); bp.connect(g); g.connect(gains.clav);
      o.start(at); o.stop(at + 0.14);
    });
  }

  /* the reed: a soft saxophone, a long tone with vibrato */
  function reed(t, fr, dur) {
    const lp = ctx.createBiquadFilter(), g = ctx.createGain();
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    lp.type = "lowpass"; lp.frequency.value = 950; lp.Q.value = 0.6;
    vib.frequency.value = 4.6; vg.gain.value = fr * 0.004;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.065, t + 0.3);
    g.gain.linearRampToValueAtTime(0.05, t + dur * 0.65);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    pair(t, fr, "sawtooth", 7).forEach(o => {
      vib.connect(vg); vg.connect(o.frequency);
      o.connect(lp); o.start(t); o.stop(t + dur + 0.1);
    });
    lp.connect(g); g.connect(gains.reed);
    vib.start(t); vib.stop(t + dur + 0.1);
  }

  /* the lead: a brighter horn, held back for the swells and the gestures */
  function lead(t, fr, dur, amp) {
    const lp = ctx.createBiquadFilter(), g = ctx.createGain();
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    lp.type = "lowpass"; lp.frequency.value = 2100;
    vib.frequency.value = 5.3; vg.gain.value = fr * 0.006;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(amp || 0.08, t + 0.05);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    pair(t, fr, "sawtooth", 8).forEach(o => {
      vib.connect(vg); vg.connect(o.frequency);
      o.connect(lp); o.start(t); o.stop(t + dur + 0.1);
    });
    lp.connect(g); g.connect(gains.lead);
    vib.start(t); vib.stop(t + dur + 0.1);
  }

  function kick(t, amp) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(125, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp || 0.8, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g); g.connect(gains.drums);
    o.start(t); o.stop(t + 0.25);
  }
  function snare(t, amp) {
    const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    const o = ctx.createOscillator(), og = ctx.createGain();
    s.buffer = NOISE;
    bp.type = "bandpass"; bp.frequency.value = 1900; bp.Q.value = 0.8;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (amp > 0.1 ? 0.15 : 0.06));
    o.type = "triangle"; o.frequency.value = 185;
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(amp * 0.4, t + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    s.connect(bp); bp.connect(g); g.connect(gains.drums);
    o.connect(og); og.connect(gains.drums);
    s.start(t); s.stop(t + 0.2); o.start(t); o.stop(t + 0.1);
  }
  function hat(t, lvl) {
    const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = NOISE;
    hp.type = "highpass"; hp.frequency.value = 7600;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(lvl, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    s.connect(hp); hp.connect(g); g.connect(gains.drums);
    s.start(t); s.stop(t + 0.06);
  }
  /* a crash, for the top of a section that has arrived rather than begun */
  function crash(t, amp) {
    const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = NOISE;
    hp.type = "highpass"; hp.frequency.value = 3200;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp || 0.22, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    s.connect(hp); hp.connect(g); g.connect(gains.drums);
    s.start(t); s.stop(t + 1.2);
  }

  /* ---------- the arrangement ---------- */

  /* Called at every bar line, and it is the only place the arrangement
     moves. A jump requested mid-bar lands HERE, which is what makes an
     abrupt change sound deliberate: it is abrupt AND on the grid. */
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
  }

  function scheduleStep(s, t0) {
    const st = s % PER_BAR;
    if (st === 0) turnBar();
    const c = current; if (!c) return;
    const t = t0 + (st % 2 ? SWING : 0);

    BASS_T.forEach(([b, len, a, which]) => {
      if (b !== st) return;
      if (halfTime && (b === 3 || b === 11)) return;   /* fewer things, same tempo */
      const m = which === 3 ? c.bass[0] + 12 : c.bass[which];
      bass(t, f(m), len * STEP, a * 0.5);
    });

    const kk = halfTime ? KICK_H : KICK;
    const sn = halfTime ? SNARE_H : SNARE;
    const gh = halfTime ? GHOST_H : GHOST;
    if (kk.indexOf(st) >= 0) kick(t, st === 0 ? 0.85 : 0.6);
    if (sn.indexOf(st) >= 0) snare(t, 0.30);
    if (gh.indexOf(st) >= 0) snare(t, 0.055);
    if (!halfTime || st % 4 === 0)
      hat(t, st % 4 === 0 ? 0.05 : st % 2 === 0 ? 0.03 : 0.018);

    /* A quiet bar drops the comping. Every bar used to carry every voice,
       which is the fastest way to make a long form feel short: with
       nothing ever absent there is nothing to notice returning. */
    if (!c.q && !halfTime) {
      if (CLAV.indexOf(st) >= 0) clav(t, c.ch.map(m => f(m + 12)));
      if (KEYS.indexOf(st) >= 0) c.ch.forEach((m, i) => key(t + i * 0.01, f(m), SPB * 0.9));
    }

    if (st === 0) reed(t, f(c.reed), SPB * 3.2);
    if (st === 0) pad(t, c.ch.map(m => f(m)), SPB * BEATS);
    if (c.h) c.h.forEach(([m, b, d]) => {
      if (Math.abs(b * DIV - st) < 0.001) lead(t, f(m), d * SPB);
    });
  }

  function loop() {
    if (!playing || !ctx) return;
    while (nextTime < ctx.currentTime + 0.3) {
      scheduleStep(step, nextTime);
      nextTime += STEP; step++;
    }
    timer = setTimeout(loop, 40);
  }

  /* ---------- where the grid is ----------
     A gesture fires the moment a player clicks, and a player does not
     click on the beat. Everything triggered by an action is pushed onto
     the grid the sequencer has already laid down — 150ms away at most,
     inaudible as a delay, and the difference between a bed the game
     plays over and a bed the game plays WITH. */
  function nextStepTime() {
    if (!ctx) return 0;
    if (!playing) return ctx.currentTime;
    let t = nextTime, now = ctx.currentTime;
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

  /* ---------- the gestures ----------
     One-shot figures belonging to no layer. They are scheduled in
     absolute time and they do not touch the sequencer, so a gesture can
     never desynchronise the bed or leave state behind if it throws. */

  /* THE UNISON LINE. Horn, keys and bass on the same notes in three
     octaves. Several instruments that were doing different things,
     briefly doing one — which is what agreement sounds like. */
  function unison(at, k) {
    if (!ctx) return;
    UNISON.forEach((m, i) => {
      const t = at + i * STEP;
      lead(t, hz(m + k), STEP * 1.6, 0.13);
      key(t, hz(m - 12 + k), STEP * 1.4, 0.20);
      bass(t, hz(m - 24 + k), STEP * 1.2, 0.30);
    });
  }
  /* THE RUN. A bar of sixteenths up the mode, used as a lift INTO
     something rather than as a melody in its own right. */
  function runUp(at, k) {
    if (!ctx) return;
    RUN.forEach((m, i) => {
      const t = at + i * STEP;
      lead(t, hz(m + k), STEP * 1.3, 0.07 + i * 0.004);
      if (i % 4 === 0) hat(t, 0.035);
    });
  }
  /* CHROMATIC APPROACH. The chord arrives from three semitones below in
     three stabs, landing on the bar line. Planing, and the cheapest way
     to make a bar line feel like an arrival. */
  function plane(at, k, chord) {
    if (!ctx) return;
    [-3, -2, -1].forEach((off, i) => {
      const t = at - (3 - i) * STEP;
      if (t < ctx.currentTime) return;
      clav(t, chord.map(m => hz(m + 12 + k + off)), 0.09);
    });
  }
  /* ONE HIT. The whole band on a single note, and then nothing. */
  function hit(at, k, chord) {
    if (!ctx) return;
    clav(at, chord.map(m => hz(m + 12 + k)), 0.12);
    key(at, hz(chord[0] + k), SPB * 0.6, 0.26);
    bass(at, hz(chord[0] - 24 + k), SPB * 0.5, 0.34);
    kick(at, 0.7);
  }

  /* ---------- transport ---------- */
  function start() {
    if (playing || !ctx || !out) return;
    if (ctx.state === "suspended" && ctx.resume) { try { ctx.resume(); } catch (e) {} }
    playing = true; step = 0; nextTime = ctx.currentTime + 0.1;
    secIdx = 0; barIdx = 0; current = null; jumpTo = null;
    keyNow = 0; keyNext = null; halfTime = false;
    BED.forEach(id => ramp(id, level(id), ctx.currentTime, 1.5));
    loop();
  }
  function stop() {
    playing = false;
    if (timer) { clearTimeout(timer); timer = null; }
    if (!ctx) return;
    LAYERS.forEach(l => ramp(l.id, 0, ctx.currentTime, 0.6));
  }

  const sectionIndex = name => {
    const i = ITINERARY.indexOf(name);
    return i < 0 ? 0 : i;
  };
  function restore(t, glide) { BED.forEach(id => ramp(id, level(id), t, glide || 1.0)); }

  /* ---------- the moods ----------
     Each one is a device rather than a fade: what the band DOES when
     this happens. They are called from user actions and engine outcomes
     in js/ui.js and js/shell.js, and tools/uxtest.js fails any mood
     defined here that nothing fires. */

  /* A DIVISION IS CALLED — STOP TIME. This gets under three seconds
     before the result overrides it, and a kit entering needs bars to
     establish. Subtraction reads instantly where addition does not: the
     room empties, the feel halves, and what is left is bass and a
     backbeat. Which is what the House doing the same thing sounds like. */
  function tension() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime;
    halfTime = true;
    ramp("pad",  0, t, 0.25);
    ramp("keys", 0, t, 0.2);
    ramp("clav", 0, t, 0.2);
    ramp("reed", 0, t, 0.3);
    ramp("drums", level("drums") * 0.8, t, 0.3);
  }

  /* A BILL CARRIES — MODULATE UP AND TAKE THE HEAD. The key goes up a
     whole tone AND STAYS THERE, the arrangement jumps to the head at the
     next bar, and the band plays the hook in unison on the way in. This
     is the loudest thing the score can do and it must not be spent on
     anything smaller. */
  function moment() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, bar = nextBarTime();
    halfTime = false;
    keyNext = clampKey(keyNow + 2);
    jumpTo = sectionIndex("D");
    restore(t, 0.4);
    ramp("drums", 0.19, t, 0.35);
    ramp("lead",  0.17, t, 0.35);
    unison(nextStepTime(), soonKey());
    crash(bar, 0.20);
    const back = bar + 4 * BEATS * SPB;
    ramp("drums", level("drums"), back, 0.9);
    ramp("lead",  0, back, 0.9);
  }

  /* A BILL IS LOST — SLIP FLATWARD. Down a minor third and into the dark
     section, which is out of the mode and does not belong to the vamp at
     all. The player does not need to be told the government is somewhere
     worse; they are listening to somewhere worse. */
  function defeat() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime;
    halfTime = false;
    keyNext = clampKey(keyNow - 3);
    jumpTo = sectionIndex("C");
    ramp("lead",  0, t, 0.4);
    ramp("clav",  0, t, 0.5);
    ramp("keys",  0, t, 0.5);
    ramp("drums", level("drums") * 0.6, t, 0.6);
    restore(t + 2 * BEATS * SPB, 1.6);
  }

  /* A GOVERNMENT OPENS — RUN INTO THE TOP. A bar of ascending sixteenths,
     a crash on the bar line, and the arrangement starts again from the
     vamp in the home key. */
  function rise() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, bar = nextBarTime();
    halfTime = false;
    keyNext = 0;
    jumpTo = sectionIndex("A");
    runUp(Math.max(t, bar - PER_BAR * STEP), soonKey());
    crash(bar, 0.24);
    restore(t, 1.2);
    ramp("drums", 0.18, t, 1.0);
    ramp("lead",  0.15, t, 1.0);
    const back = bar + 6 * BEATS * SPB;
    ramp("drums", level("drums"), back, 1.0);
    ramp("lead",  0, back, 1.0);
  }

  /* THE GOVERNMENT HAS FALLEN. Half time, everything ornamental gone,
     and the key walks back to home rather than jumping — this is the one
     event that is allowed to take its time. */
  function sombre() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime;
    halfTime = true;
    jumpTo = sectionIndex("C");
    keyNext = 0;
    ramp("lead",  0, t, 0.4);
    ramp("clav",  0, t, 0.6);
    ramp("keys",  0, t, 0.8);
    ramp("drums", 0, t, 1.4);
    ramp("reed",  level("reed") * 0.5, t, 1.0);
    restore(t + 8, 3.0);
  }

  /* AN UNDERTAKING IS ENTERED. One hit on the next sixteenth and
     nothing else — the score notes it and carries on, which is exactly
     what the order paper does. No key change, no section jump: an
     undertaking is a promise, not an outcome. */
  function undertake() {
    if (!playing || !ctx || !current) return;
    hit(nextStepTime(), keyNow, current.ch);
  }

  /* AN ORDER IS MADE. A statutory instrument is in force the moment it
     is signed, so the music arrives rather than builds: the chord planes
     up chromatically into the next bar line and lands. */
  function order() {
    if (!playing || !ctx || !current) return;
    const bar = nextBarTime();
    plane(bar, keyNow, current.ch);
    hit(bar, keyNow, current.ch);
  }

  /* PROROGATION — THE ONE CADENCE.

     The form is modal and cannot resolve, which is what lets it run for
     two and a half minutes without announcing a loop. This is the single
     exception in the whole score: the session ends, the dominant finally
     appears, it resolves to the tonic, the key goes home and the
     arrangement restarts. It is the only full stop available and it
     stays that way, or it stops meaning anything. */
  function prorogue() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, bar = nextBarTime();
    halfTime = false;
    /* A7 into Dm, in the home key, whatever key we had drifted to. */
    const A7 = [57, 61, 64, 67], DM = [57, 62, 65, 69];
    /* the dominant sits just before the bar line, so it has to still be
       in the future when we get here or it lands on top of the tonic */
    const pre = Math.max(t, bar - 2 * STEP);
    key(pre, hz(45), SPB, 0.22);
    A7.forEach((m, i) => key(pre + i * 0.012, hz(m), SPB * 0.9, 0.24));
    hit(bar, 0, DM);
    DM.forEach((m, i) => key(bar + i * 0.014, hz(m), SPB * 2.4, 0.26));
    crash(bar, 0.18);
    keyNext = 0;
    jumpTo = sectionIndex("A");
    ramp("lead", 0, t, 0.3);
    restore(bar + BEATS * SPB, 1.6);
  }

  /* the Options toggle: a start/stop. The volume is the music bus gain,
     which Sound.apply already carries. */
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
    /* for the checks and for the diagnostic readout: what the band is
       actually doing, as opposed to what it was told to do */
    state: () => ({
      playing: playing,
      context: ctx ? ctx.state : null,
      section: playing && current ? ITINERARY[secIdx] : null,
      bar: playing && current ? barIdx + 1 : null,
      key: NOTE[((2 + keyNow) % 12 + 12) % 12] + (keyNow ? (keyNow > 0 ? " +" : " ") + keyNow : ""),
      semitones: keyNow,
      halfTime: halfTime,
      levels: LAYERS.reduce((o, l) => {
        o[l.id] = gains[l.id] ? Math.round(gains[l.id].gain.value * 1000) / 1000 : null;
        return o;
      }, {})
    }),
    /* the form is hand-typed MIDI and a mistyped number is a wrong note
       that no static check can see and nobody hears until the
       arrangement happens to reach that bar */
    __form: { SECTIONS: SECTIONS, ITINERARY: ITINERARY, MOTIF: MOTIF,
              UNISON: UNISON, RUN: RUN, BPM: BPM, BEATS: BEATS, PER_BAR: PER_BAR,
              KEY_MIN: KEY_MIN, KEY_MAX: KEY_MAX, BED: BED,
              LAYERS: LAYERS.map(l => l.id),
              MOODS: ["tension","moment","defeat","rise","sombre",
                      "undertake","order","prorogue"] }
  };
})();

if (typeof module !== "undefined") module.exports = Music;
