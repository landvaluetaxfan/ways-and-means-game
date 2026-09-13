/* =============================================================
   MUSIC — the adaptive bed.

   A thirty-two bar vamp at 100 BPM in D dorian, synthesised from
   oscillators and one noise buffer. No assets, same as the cues.

   THE REGISTER, AND WHY IT MOVED. This started as slow noir jazz —
   72 BPM, swung eighths, brushes, a sax over minor sevenths. Good,
   and slightly cosy for a game about people dying in a shed order.
   It is now the neighbouring room: institutional jazz-funk, the
   register of a seventies procedural. Same key centre, same sax,
   same delay; a different rhythm section under them.

   Four things carry that and each one is load-bearing:

     STRAIGHT SIXTEENTHS, not swung eighths. A shuffle is the single
     strongest signal of the old register, so the grid is four times
     finer and the swing is a light 16th push rather than a lope.

     THE BASS IS THE LEAD INSTRUMENT. In the noir version it laid
     down roots and fifths under the harmony. Here it is syncopated,
     plucked, octave-popping and locked to the kick, which is the
     one thing funk cannot be assembled without.

     THE KIT IS IN THE BED. It used to be a swell layer, held back
     for a division. A funk bed with no drums is a chord loop, so
     the kit is always present and a swell makes it louder rather
     than making it exist.

     THE HARMONY STOPPED RESOLVING. Dorian i-IV, Dm11 against G13,
     which is a vamp rather than a progression. It cannot cadence
     because there is nothing to cadence to, and that is exactly
     what lets thirty-two bars pass without announcing a loop.

   VERTICAL REMIXING. The loop is split into layers, each on its own
   gain. Nothing changes tempo, which is the whole point: a swell is
   a layer entering, not the band speeding up.

   THE HARD RULE, from js/audio.js, applies here too: music is
   started and swelled by USER ACTIONS and ENGINE EFFECTS only, never
   from a draw function. The sequencer schedules ahead of the clock;
   a redraw must not touch it.

   NEVER DRAW FROM THE GAME'S PRNG HERE. Engine.draw() advances the
   save's seed, so a bar that asked it for a variation would change
   which events fire. Music must not be able to affect the game.

   NOTHING HERE MAY THROW. Web Audio may be absent, blocked, or
   suspended; every entry point checks and returns. The context and
   the music bus are borrowed from Sound once it has built them, so
   the module sits idle until the first gesture.
   ============================================================= */
const Music = (function () {
  "use strict";

  const BPM = 100, BEATS = 4;
  const SPB = 60 / BPM;        /* seconds per beat */
  const DIV = 4;               /* sixteenths per beat */
  const STEP = SPB / DIV;      /* one sixteenth */
  const PER_BAR = BEATS * DIV; /* 16 steps in a bar */
  const SWING = STEP * 0.10;   /* a light push on the odd sixteenths */

  const LAYERS = [
    { id: "pad",   level: 0.05 },
    { id: "bass",  level: 0.24 },
    { id: "keys",  level: 0.09 },
    { id: "clav",  level: 0.10 },
    { id: "reed",  level: 0.09 },
    { id: "drums", level: 0.13 },
    { id: "lead",  level: 0.15 }
  ];

  /* WHAT IS ALWAYS PLAYING. The kit is in here now; see the header. */
  const BED = ["bass", "drums", "keys", "clav", "pad", "reed"];

  /* THE HOOK. D - F - G - B: root, flat third, fourth, and the natural
     sixth that is dorian's whole signature. It works over both chords of
     the vamp — the thirteenth of Dm11 and the third of G13 — which is
     what a vamp hook has to do. It is also the clearest single break
     from the old register, where the sixth was flat and the figure fell
     instead of rising. */
  const MOTIF = [62, 65, 67, 71];

  /* ------------------------------------------------------------------
     THE FORM. Thirty-two bars, four sections, seventy-seven seconds.

     A modal vamp rather than a progression. The old form cadenced A7
     into Dm at the loop point, which announces the join: the ear learns
     it in two passes and hears nothing else afterwards. Dorian i-IV has
     no cadence available, so the last bar is G13 sliding into the first
     bar's Dm11 exactly as it does eight other times in the loop, and the
     join is indistinguishable from the vamp.

     Voicings are rootless — the bass carries the root, which is why
     Dm11 and Fmaj9 are the same four notes over different feet.

     ch: the voicing (MIDI). bass: [root, fifth, approach]. reed: the
     long tone. h: the horn line, [midi, beat, beats]. q: a quiet bar —
     no keys, no clav. chr: the bass root is deliberately out of the mode.
     ------------------------------------------------------------------ */
  const DM11  = [57, 60, 64, 67];   /* A C E G  — over D, F or A */
  const G13   = [53, 59, 62, 64];   /* F B D E  — the dorian major IV */
  const CMAJ9 = [55, 59, 62, 64];   /* G B D E */
  const EM11  = [55, 59, 62, 69];   /* G B D A */
  const AM11  = [55, 60, 62, 64];   /* G C D E */
  const BBMAJ9= [57, 60, 62, 65];   /* A C D F */

  const PROG = [
    /* A — the vamp */
    { ch:DM11,  bass:[38,45,43], reed:62, q:false, h:null },
    { ch:DM11,  bass:[38,45,41], reed:60, q:true,  h:null },
    { ch:DM11,  bass:[38,45,43], reed:69, q:false, h:null },
    { ch:G13,   bass:[43,50,48], reed:67, q:false, h:[[71,2,1.5]] },
    { ch:DM11,  bass:[38,45,43], reed:62, q:true,  h:null },
    { ch:DM11,  bass:[38,45,40], reed:65, q:false, h:null },
    { ch:G13,   bass:[43,50,45], reed:62, q:false, h:null },
    { ch:G13,   bass:[43,50,48], reed:59, q:true,  h:null },
    /* A' — the lift, same voicing on new feet */
    { ch:DM11,  bass:[41,48,45], reed:65, q:false, h:null },
    { ch:DM11,  bass:[41,48,43], reed:64, q:true,  h:null },
    { ch:CMAJ9, bass:[36,43,41], reed:64, q:false, h:null },
    { ch:CMAJ9, bass:[36,43,38], reed:71, q:true,  h:[[67,1,2]] },
    { ch:EM11,  bass:[40,47,45], reed:67, q:false, h:null },
    { ch:EM11,  bass:[40,47,43], reed:62, q:true,  h:null },
    { ch:G13,   bass:[43,50,48], reed:65, q:false, h:null },
    { ch:G13,   bass:[43,50,45], reed:59, q:false, h:[[62,2,1.5]] },
    /* B — the bridge. One borrowed chord, which is the nod back to the
       room this came from: a flat sixth is the only noir left in it. */
    { ch:BBMAJ9,bass:[46,53,50], reed:62, q:false, h:null, chr:true },
    { ch:BBMAJ9,bass:[46,53,48], reed:65, q:true,  h:null, chr:true },
    { ch:AM11,  bass:[45,52,50], reed:67, q:false, h:null },
    { ch:AM11,  bass:[45,52,48], reed:64, q:true,  h:null },
    { ch:CMAJ9, bass:[36,43,41], reed:71, q:false, h:null },
    { ch:CMAJ9, bass:[36,43,38], reed:67, q:true,  h:null },
    { ch:G13,   bass:[43,50,48], reed:65, q:false, h:null },
    { ch:G13,   bass:[43,50,45], reed:62, q:false, h:[[59,2,2]] },
    /* A'' — the return, and the hook stated outright */
    { ch:DM11,  bass:[38,45,43], reed:62, q:false, h:[[62,0,0.75],[65,1,0.75],[67,2,0.75],[71,3,1]] },
    { ch:DM11,  bass:[38,45,41], reed:60, q:true,  h:null },
    { ch:DM11,  bass:[38,45,43], reed:69, q:false, h:null },
    { ch:G13,   bass:[43,50,48], reed:71, q:false, h:null },
    { ch:DM11,  bass:[38,45,43], reed:65, q:true,  h:null },
    { ch:DM11,  bass:[38,45,40], reed:62, q:false, h:null },
    { ch:G13,   bass:[43,50,45], reed:59, q:false, h:null },
    { ch:G13,   bass:[43,50,48], reed:62, q:true,  h:null }
  ];
  const BARS = PROG.length;

  /* THE BASS LINE, and it is the tune. [step, length in steps, amp, which]
     where which indexes [root, fifth, approach, root an octave up].
     Strong one, an octave pop off the beat, a syncopated push before
     three, and a walk into the next bar. */
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
  const GHOST = [7, 11, 15];      /* under it, barely there */
  const CLAV  = [2, 7, 11];       /* off-beat stabs */
  const KEYS  = [6, 13];

  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  let ctx = null, out = null, send = null, gains = {}, NOISE = null;
  let playing = false, step = 0, nextTime = 0, timer = null;

  function pref(k) {
    if (typeof Shell !== "undefined" && Shell.opt) {
      const v = Shell.opt(k);
      if (v !== undefined) return v;
    }
    return undefined;
  }
  const level = id => { const l = LAYERS.find(x => x.id === id); return l ? l.level : 0; };

  /* ---------- the graph ---------- */
  function build() {
    ctx = Sound.context(); out = Sound.musicOut();
    if (!ctx || !out) return false;
    /* a dotted-eighth echo, so the bed is not dry */
    const delay = ctx.createDelay(2), fb = ctx.createGain(), wet = ctx.createGain();
    delay.delayTime.value = SPB * 0.75; fb.gain.value = 0.24; wet.gain.value = 0.14;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(out);
    send = delay;
    LAYERS.forEach(l => {
      const g = ctx.createGain();
      g.gain.value = 0;
      /* ANCHOR THE TIMELINE, AND THIS LINE IS THE WHOLE BED.

         Every layer gain in this module is written through ramp() and
         through nothing else, and ramp() finishes with
         linearRampToValueAtTime. A linear ramp takes its START value from
         the previous event on the automation timeline — and these params
         had no events on them at all, only an assigned .value, which is
         not an event. That case is under-specified in practice, and
         cancelAndHoldAtTime does not reliably insert an event to hold
         when there is nothing on the timeline to hold.

         Where it resolves the wrong way every layer stays at zero: the
         sequencer runs, every oscillator starts and stops on time, the
         graph is connected, and the output is SILENCE. The cues are
         unaffected because every one of them calls setValueAtTime before
         it ramps, which is exactly the anchor this was missing.

         One scheduled zero at the start of time, and the timeline is
         never empty again. */
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
     at t: that would cancel the ramp running into it. The hold is what
     preserves that, and build() guarantees there is always something on
     the timeline for it to hold. The fallback path anchors explicitly,
     and a browser that throws on either gets the ramp anyway. */
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

     DETUNE IS MOST OF THE TIMBRE. Every sustained voice was one clean
     oscillator, which is why the bed read as a synthesiser playing jazz
     rather than as a room with players in it. Two oscillators a few
     cents apart beat against each other slowly, and that beating is
     most of what the ear hears as "an instrument" rather than "a tone".
     The gain is halved wherever a voice doubles, so this is colour and
     not level. */
  const DETUNE = 6;

  function pair(t, f, type, cents) {
    const a = ctx.createOscillator(), b = ctx.createOscillator();
    a.type = b.type = type;
    a.frequency.value = b.frequency.value = f;
    a.detune.value = -(cents || DETUNE); b.detune.value = (cents || DETUNE);
    return [a, b];
  }

  /* THE BASS. A fingered electric, not the sine pillow it was: a
     sawtooth through a resonant lowpass that snaps shut in a tenth of a
     second, over a sine at the fundamental so it still lands on a laptop
     speaker. The filter envelope is the pluck, and the pluck is the
     difference between a bass line and a bass note. */
  function bass(t, f, dur, amp) {
    const o = ctx.createOscillator(), sub = ctx.createOscillator();
    const lp = ctx.createBiquadFilter(), g = ctx.createGain(), sg = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = f;
    sub.type = "sine";   sub.frequency.value = f; sg.gain.value = 0.55;
    lp.type = "lowpass"; lp.Q.value = 5;
    lp.frequency.setValueAtTime(Math.min(2400, f * 14), t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(180, f * 2.2), t + 0.13);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(amp, t + 0.012);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, amp * 0.45), t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.06);
    o.connect(lp); lp.connect(g); sub.connect(sg); sg.connect(g); g.connect(gains.bass);
    o.start(t); sub.start(t); o.stop(t + dur + 0.1); sub.stop(t + dur + 0.1);
  }

  function pad(t, freqs, dur) {
    freqs.forEach(f => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.028, t + 1.1);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      g.connect(gains.pad);
      pair(t, f, "sine", 5).forEach(o => { o.connect(g); o.start(t); o.stop(t + dur + 0.1); });
    });
  }

  /* THE KEYS. An electric piano rather than a filtered triangle: a sine
     fundamental with a bell partial four octaves up that decays much
     faster than the note does. That ratio is the whole character. */
  function key(t, f, dur) {
    const o = ctx.createOscillator(), b = ctx.createOscillator();
    const g = ctx.createGain(), bg = ctx.createGain();
    o.type = "sine"; o.frequency.value = f;
    b.type = "sine"; b.frequency.value = f * 4.02;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.30, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    bg.gain.setValueAtTime(0.0001, t);
    bg.gain.exponentialRampToValueAtTime(0.075, t + 0.005);
    bg.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.35);
    o.connect(g); b.connect(bg); bg.connect(g); g.connect(gains.keys);
    o.start(t); b.start(t); o.stop(t + dur + 0.05); b.stop(t + dur + 0.05);
  }

  /* THE CLAV. Short, bright, off the beat — the texture that says funk
     before any other voice has played a note. Squares through a narrow
     bandpass, gone in a tenth of a second. */
  function clav(t, freqs) {
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = "square"; o.frequency.value = f;
      bp.type = "bandpass"; bp.frequency.value = f * 2.4; bp.Q.value = 3.2;
      g.gain.setValueAtTime(0.0001, t + i * 0.004);
      g.gain.exponentialRampToValueAtTime(0.085, t + i * 0.004 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.004 + 0.11);
      o.connect(bp); bp.connect(g); g.connect(gains.clav);
      o.start(t + i * 0.004); o.stop(t + i * 0.004 + 0.14);
    });
  }

  /* the reed: a soft saxophone, a long tone with vibrato. opencode's, kept. */
  function reed(t, f, dur) {
    const lp = ctx.createBiquadFilter(), g = ctx.createGain();
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    lp.type = "lowpass"; lp.frequency.value = 950; lp.Q.value = 0.6;
    vib.frequency.value = 4.6; vg.gain.value = f * 0.004;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.065, t + 0.3);
    g.gain.linearRampToValueAtTime(0.05, t + dur * 0.65);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    pair(t, f, "sawtooth", 7).forEach(o => {
      vib.connect(vg); vg.connect(o.frequency);
      o.connect(lp); o.start(t); o.stop(t + dur + 0.1);
    });
    lp.connect(g); g.connect(gains.reed);
    vib.start(t); vib.stop(t + dur + 0.1);
  }

  /* the lead: a brighter horn, held back for the swells */
  function lead(t, f, dur) {
    const lp = ctx.createBiquadFilter(), g = ctx.createGain();
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    lp.type = "lowpass"; lp.frequency.value = 2100;
    vib.frequency.value = 5.3; vg.gain.value = f * 0.006;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.08, t + 0.05);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    pair(t, f, "sawtooth", 8).forEach(o => {
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
  /* the backbeat. A noise body with a tone under it, tighter than the
     brush it replaces, because a funk two and four has to be an event. */
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

  /* ---------- the sequencer ---------- */
  function scheduleStep(s, t0) {
    const bar = Math.floor(s / PER_BAR) % BARS;
    const st = s % PER_BAR;                 /* sixteenth within the bar */
    const t = t0 + (st % 2 ? SWING : 0);    /* the light push */
    const c = PROG[bar];

    BASS_T.forEach(([b, len, a, which]) => {
      if (b !== st) return;
      const m = which === 3 ? c.bass[0] + 12 : c.bass[which];
      bass(t, hz(m), len * STEP, a * 0.5);
    });

    if (KICK.indexOf(st) >= 0) kick(t, st === 0 ? 0.85 : 0.6);
    if (SNARE.indexOf(st) >= 0) snare(t, 0.30);
    if (GHOST.indexOf(st) >= 0) snare(t, 0.055);
    hat(t, st % 4 === 0 ? 0.05 : st % 2 === 0 ? 0.03 : 0.018);

    /* A quiet bar drops the comping. Every bar used to carry every
       voice, which is the fastest way to make eighty seconds feel like
       eight: with nothing ever absent there is nothing to notice
       returning. The groove stays; the chords breathe. */
    if (!c.q) {
      if (CLAV.indexOf(st) >= 0) clav(t, c.ch.map(m => hz(m + 12)));
      if (KEYS.indexOf(st) >= 0) c.ch.forEach((m, i) => key(t + i * 0.01, hz(m), SPB * 0.9));
    }

    if (st === 0) reed(t, hz(c.reed), SPB * 3.2);
    if (st === 0) pad(t, c.ch.map(hz), SPB * BEATS);
    if (c.h) c.h.forEach(([m, b, d]) => {
      if (Math.abs(b * DIV - st) < 0.001) lead(t, hz(m), d * SPB);
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

  /* ---------- transport ---------- */
  function start() {
    if (playing || !ctx || !out) return;
    if (ctx.state === "suspended" && ctx.resume) { try { ctx.resume(); } catch (e) {} }
    playing = true; step = 0; nextTime = ctx.currentTime + 0.1;
    BED.forEach(id => ramp(id, level(id), ctx.currentTime, 1.5));
    loop();
  }
  function stop() {
    playing = false;
    if (timer) { clearTimeout(timer); timer = null; }
    /* ramp() guards on ctx, but ctx.currentTime is read BEFORE the call,
       so the guard never runs. stop() is exported, and build() leaves ctx
       null when Web Audio is absent or blocked — which is precisely the
       machine this module promises not to throw on. */
    if (!ctx) return;
    LAYERS.forEach(l => ramp(l.id, 0, ctx.currentTime, 0.6));
  }

  /* THE NEXT SIXTEENTH. A swell fires the moment a player clicks, and a
     player does not click on the beat, so a horn entering at an arbitrary
     offset reads as a second piece of music starting over the first.
     Everything triggered by an action is pushed to the next step the
     sequencer has already scheduled — 150ms away at most, inaudible as a
     delay, and the difference between a bed the game plays over and a bed
     the game plays WITH. */
  function nextBeat() {
    if (!ctx) return 0;
    const now = ctx.currentTime;
    if (!playing) return now;
    let t = nextTime;
    while (t < now) t += STEP;
    while (t - now > STEP) t -= STEP;
    return t;
  }

  /* A DIVISION IS CALLED. This gets under three seconds: the reading of
     the result runs about that, and then moment() or defeat() overrides
     everything here.

     SUBTRACTION READS INSTANTLY WHERE ADDITION DOES NOT. The old version
     brought a kit in, which needs bars to establish and had none, so the
     swell was inaudible in the only place it ever fired. Now the room
     empties instead: the comping, the pad and the sax go, the kick drops
     to the backbeat, and what is left is bass and a hat. Which is what
     the House doing the same thing sounds like. */
  function tension() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime;
    ramp("pad",  0, t, 0.25);
    ramp("keys", 0, t, 0.2);
    ramp("clav", 0, t, 0.2);
    ramp("reed", 0, t, 0.3);
    ramp("drums", level("drums") * 0.7, t, 0.3);
  }

  /* the whole bed is back, whatever tension() took from it */
  function restore(t, glide) {
    BED.forEach(id => ramp(id, level(id), t, glide || 1.0));
  }

  /* a bill carries: the horn enters over a louder kit and states the hook */
  function moment() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, dur = 4 * BEATS * SPB;
    restore(t, 0.5);
    ramp("drums", 0.19, t, 0.4);
    ramp("lead",  0.17, t, 0.4);

    /* The hook, on the grid, rather than whatever the horn line happens
       to hold in whichever bar the click landed in. This is the one place
       the player is meant to recognise something. */
    const b = nextBeat();
    MOTIF.forEach((m, i) => lead(b + i * SPB * 0.5, hz(m), SPB * 0.45));

    ramp("drums", level("drums"), t + dur - 0.9, 0.9);
    ramp("lead",  0, t + dur - 0.9, 0.9);
  }

  /* a bill is lost: everything ornamental goes and comes back slowly */
  function defeat() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, dur = 2 * BEATS * SPB;
    ramp("lead",  0, t, 0.4);
    ramp("clav",  0, t, 0.4);
    ramp("keys",  0, t, 0.4);
    ramp("drums", level("drums") * 0.5, t, 0.5);
    /* tension() emptied the room and every path out of it must refill it,
       or a lost division leaves the bed permanently missing its sax. */
    restore(t + dur, 1.4);
  }

  /* a government opens: the whole bed comes up, the horn with it, then it
     settles back and leaves the room */
  function rise() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, dur = 6 * BEATS * SPB;
    restore(t, 1.5);
    ramp("drums", 0.18, t, 1.0);
    ramp("lead",  0.15, t, 1.0);
    ramp("drums", level("drums"), t + dur - 1.0, 1.0);
    ramp("lead",  0, t + dur - 1.0, 1.0);
  }

  /* the government has fallen: thin the bed right out, then let it return */
  function sombre() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime;
    ramp("lead",  0, t, 0.4);
    ramp("clav",  0, t, 0.6);
    ramp("drums", 0, t, 1.2);
    ramp("keys",  level("keys") * 0.4, t, 0.6);
    restore(t + 6, 3.0);
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

  return {
    init: init, start: start, stop: stop,
    tension: tension, moment: moment, defeat: defeat, rise: rise, sombre: sombre, apply: apply,
    available: () => !!ctx,
    /* for the checks and for the diagnostic readout: what the mixer is
       actually doing, as opposed to what it was told to do */
    state: () => ({
      playing: playing,
      context: ctx ? ctx.state : null,
      bar: ctx && playing ? (Math.floor(step / PER_BAR) % BARS) + 1 : null,
      levels: LAYERS.reduce((o, l) => {
        o[l.id] = gains[l.id] ? Math.round(gains[l.id].gain.value * 1000) / 1000 : null;
        return o;
      }, {})
    }),
    /* For the checks only. The form is hand-typed MIDI, and a mistyped
       number is a wrong note that no static check can see and nobody
       hears until the loop happens to reach that bar. */
    __form: { PROG: PROG, MOTIF: MOTIF, BARS: BARS, BPM: BPM, BEATS: BEATS,
              BED: BED, LAYERS: LAYERS.map(l => l.id) }
  };
})();

if (typeof module !== "undefined") module.exports = Music;
