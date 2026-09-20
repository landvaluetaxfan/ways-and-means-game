/* =============================================================
   MUSIC — the adaptive bed.

   A slow sixteen-bar form at 72 BPM in D minor, synthesised from
   oscillators and one noise buffer. No assets, same as the cues.

   VERTICAL REMIXING. The form is split into layers, each on its own
   gain. The BED is pad, bass, Rhodes, guitar, keys, reed and shaker;
   the special bars add the kit and a brighter trumpet lead. Nothing
   changes tempo, which is the whole point: a swell is a layer entering,
   not the band speeding up.

   THE HARD RULE, from js/audio.js, applies here too: music is
   started and swelled by USER ACTIONS and ENGINE EFFECTS only, never
   from a draw function. The sequencer schedules ahead of the clock;
   a redraw must not touch it.

   NOTHING HERE MAY THROW. Web Audio may be absent, blocked, or
   suspended; every entry point checks and returns. The context and
   the music bus are borrowed from Sound once it has built them, so
   the module sits idle until the first gesture.
   ============================================================= */
const Music = (function () {
  "use strict";

  const BPM = 72, BEATS = 4, BARS = 16;
  const SPB = 60 / BPM;        /* seconds per beat */
  const STEP = SPB / 2;        /* one eighth note */
  const SWING = SPB * 0.17;    /* push the off-beats late */

  const LAYERS = [
    { id: "pad",    level: 0.07 },
    { id: "bass",   level: 0.22 },
    { id: "rhodes", level: 0.09 },
    { id: "guitar", level: 0.08 },
    { id: "keys",   level: 0.11 },
    { id: "reed",   level: 0.10 },
    { id: "shaker", level: 0.05 },
    { id: "drums",  level: 0.18 },
    { id: "lead",   level: 0.15 }
  ];

  /* SIXTEEN BARS, IN TWO HALVES. The A half is the statement; the B half lifts
     to Fmaj7 and brings the guitar in, so the loop has an arc instead of
     resetting to the same texture every eight bars. ch: chord (MIDI).
     bass: [root, fifth, approach]. reed: a long tone, one per bar.
     h: the lead line, as [beat, midi, dur in beats]. */
  const PROG = [
    /* A — the statement */
    { ch: [50,53,57,60], bass: [38,45,41], reed: 53, h: [[69,0,1.5],[72,2.5,1]] },
    { ch: [50,53,57,60], bass: [38,45,43], reed: 57, h: null },
    { ch: [55,58,62,65], bass: [43,50,46], reed: 58, h: [[74,1,1.5],[72,3,1]] },
    { ch: [55,58,62,65], bass: [43,50,45], reed: 62, h: null },
    { ch: [58,62,65,69], bass: [46,53,50], reed: 65, h: [[70,0,1.5],[69,2.5,1]] },
    { ch: [57,61,64,67], bass: [45,52,49], reed: 64, h: [[67,0,2]] },
    { ch: [50,53,57,60], bass: [38,45,40], reed: 57, h: null },
    { ch: [57,61,64,67], bass: [45,52,43], reed: 61, h: [[65,1,1],[67,2.5,1.5]] },
    /* B — the lift, and where the guitar enters */
    { ch: [53,57,60,65], bass: [41,48,53], reed: 60, h: [[72,0,1.5],[74,2.5,1]] },
    { ch: [53,57,60,65], bass: [41,48,50], reed: 65, h: null },
    { ch: [55,58,62,65], bass: [43,50,46], reed: 58, h: [[77,1,1.5],[74,3,1]] },
    { ch: [57,61,64,67], bass: [45,52,49], reed: 61, h: [[76,0,2]] },
    { ch: [58,62,65,69], bass: [46,53,50], reed: 65, h: [[74,0,1.5],[72,2.5,1]] },
    { ch: [55,58,62,65], bass: [43,50,45], reed: 62, h: null },
    { ch: [57,61,64,67], bass: [45,52,49], reed: 64, h: [[69,1,1],[72,2.5,1.5]] },
    { ch: [57,61,64,67], bass: [45,43,41], reed: 61, h: null }
  ];

  /* the bass rhythm: [beat, duration in beats, amp]. Root, fifth, approach,
     so it is not the same note at the same interval every time. */
  const BASS_T = [[0, 1.5, 1.0], [2, 0.7, 0.85], [3, 0.5, 0.7]];

  /* THE HOOK. A - F - E: the fifth, the third, and a semitone down onto
     the ninth of the dominant. Three notes, stated by the trumpet when a
     bill carries, and nowhere else. */
  const MOTIF = [69, 65, 64];

  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  let ctx = null, out = null, send = null, gains = {}, NOISE = null;
  let playing = false, step = 0, nextTime = 0, timer = null;
  /* THE ONE RECORDED PIECE. It is not a layer: a buffer source cannot be
     remixed bar by bar, so it owns a gain of its own on the music bus and
     the bed steps aside while it plays. */
  let anthemId = null, anthemSrc = null, anthemGain = null, anthemToken = 0;
  /* A track that is asked for but not yet decoded still owns the bus, so
     rise() must not swell the bed over a recording that is one frame away. */
  let anthemWanted = false;

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
    /* Idempotent, because the anthem may need the graph before the onReady
       callback that normally builds it has run — the click that starts a
       government is also the gesture that creates the context. */
    if (ctx && out) return true;
    ctx = Sound.context(); out = Sound.musicOut();
    if (!ctx || !out) return false;
    /* a dotted-eighth echo, so the bed is not dry */
    const delay = ctx.createDelay(2), fb = ctx.createGain(), wet = ctx.createGain();
    delay.delayTime.value = SPB * 0.75; fb.gain.value = 0.28; wet.gain.value = 0.16;
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
         graph is connected, and the output is SILENCE while the cues
         keep working — because every cue calls setValueAtTime before it
         ramps, which is exactly the anchor this was missing. Reported as
         "no music on mobile". */
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.connect(out);
      gains[l.id] = g;
    });
    gains.reed.connect(send); gains.lead.connect(send); gains.guitar.connect(send);
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

  /* ---------- voices ---------- */

  /* the bass: pure sines, no filter sweep, a soft attack and a long release so
     the notes run into each other rather than starting fresh. */
  function bass(t, f, dur, amp) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g2 = ctx.createGain(),
          lp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = f;
    o2.type = "sine"; o2.frequency.value = f * 2; g2.gain.value = 0.12;
    lp.type = "lowpass"; lp.frequency.value = 650;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(amp, t + 0.1);
    g.gain.linearRampToValueAtTime(amp * 0.9, t + 0.5);
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.2);
    o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(gains.bass);
    o.start(t); o2.start(t); o.stop(t + dur + 0.3); o2.stop(t + dur + 0.3);
  }
  function pad(t, freqs, dur) {
    freqs.forEach(f => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.05, t + 1.1);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(gains.pad);
      o.start(t); o.stop(t + dur + 0.1);
    });
  }
  function key(t, f, dur) {
    const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = f;
    lp.type = "lowpass"; lp.frequency.value = 2000;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(gains.keys);
    o.start(t); o.stop(t + dur + 0.05);
  }
  /* the rhodes: a warm electric piano. A short bell two octaves up over a round
     sine body, comping one chord a bar under the sax. Part of the bed. */
  function rhodes(t, ch, dur) {
    ch.forEach((m, i) => {
      const f = hz(m + 12), at = t + i * 0.012;
      const o = ctx.createOscillator(), bell = ctx.createOscillator(),
            bg = ctx.createGain(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = f;
      bell.type = "sine"; bell.frequency.value = f * 2;
      lp.type = "lowpass"; lp.frequency.value = 1700;
      bg.gain.setValueAtTime(0.4, at);
      bg.gain.exponentialRampToValueAtTime(0.0001, at + 0.4);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(0.07, at + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(lp); bell.connect(bg); bg.connect(lp); lp.connect(g); g.connect(gains.rhodes);
      o.start(at); bell.start(at); o.stop(at + dur + 0.1); bell.stop(at + dur + 0.1);
    });
  }
  /* the guitar: a clean electric — two slightly detuned saws through a warm
     filter, plucked. It enters only in the B half, so the form lifts. */
  function guitar(t, f, dur) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(),
          lp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = f;
    o2.type = "sawtooth"; o2.frequency.value = f * 1.006;
    lp.type = "lowpass"; lp.frequency.value = 1500; lp.Q.value = 0.7;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.1, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(gains.guitar);
    o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  /* the reed: a soft saxophone, a long tone with vibrato. Part of the bed. */
  function reed(t, f, dur) {
    const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = f;
    lp.type = "lowpass"; lp.frequency.value = 900; lp.Q.value = 0.6;
    vib.frequency.value = 4.6; vg.gain.value = f * 0.004;
    vib.connect(vg); vg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.13, t + 0.3);
    g.gain.linearRampToValueAtTime(0.10, t + dur * 0.65);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(gains.reed);
    o.start(t); vib.start(t); o.stop(t + dur + 0.1); vib.stop(t + dur + 0.1);
  }
  /* the lead: a brighter trumpet, held back for the special bars */
  function lead(t, f, dur) {
    const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = f;
    lp.type = "lowpass"; lp.frequency.value = 1800;
    vib.frequency.value = 5.3; vg.gain.value = f * 0.006;
    vib.connect(vg); vg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.09);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(gains.lead);
    o.start(t); vib.start(t); o.stop(t + dur + 0.1); vib.stop(t + dur + 0.1);
  }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(115, t);
    o.frequency.exponentialRampToValueAtTime(44, t + 0.13);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.75, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g); g.connect(gains.drums);
    o.start(t); o.stop(t + 0.34);
  }
  function brush(t) {
    const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = NOISE;
    bp.type = "bandpass"; bp.frequency.value = 2300; bp.Q.value = 0.7;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.34, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    s.connect(bp); bp.connect(g); g.connect(gains.drums);
    s.start(t); s.stop(t + 0.27);
  }
  function hat(t, lvl) {
    const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = NOISE;
    hp.type = "highpass"; hp.frequency.value = 7200;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(lvl || 0.05, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    s.connect(hp); hp.connect(g); g.connect(gains.drums);
    s.start(t); s.stop(t + 0.07);
  }

  /* the shaker: a soft off-beat pulse that belongs to the bed rather than to
     the kit, so the room has a heartbeat even when no event is running. */
  function shaker(t, lvl) {
    const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = NOISE;
    hp.type = "highpass"; hp.frequency.value = 5200;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(lvl || 0.035, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    s.connect(hp); hp.connect(g); g.connect(gains.shaker);
    s.start(t); s.stop(t + 0.09);
  }

  /* the ride: the jazz pulse, part of the kit rather than the bed, so it
     arrives with the drums and leaves with them. */
  function ride(t, lvl) {
    const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = NOISE;
    hp.type = "highpass"; hp.frequency.value = 4800;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(lvl || 0.03, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    s.connect(hp); hp.connect(g); g.connect(gains.drums);
    s.start(t); s.stop(t + 0.35);
  }

  /* ---------- the sequencer ---------- */
  function scheduleStep(s, t0) {
    const bar = Math.floor(s / 8) % BARS;
    const st = s % 8;                       /* eighth step in the bar */
    const t = t0 + (st % 2 ? SWING : 0);    /* swing the off-beats */
    const chord = PROG[bar];

    BASS_T.forEach(([b, d, a], i) => {
      if (Math.abs(b - st / 2) < 0.001) bass(t, hz(chord.bass[i]), d * SPB, a * 0.5);
    });
    if (st === 0 && bar !== 6) reed(t, hz(chord.reed), SPB * 3.4);
    if (st === 4) rhodes(t, chord.ch, SPB * 1.3);
    if (st % 2 === 1) shaker(t, 0.035);
    /* the guitar enters in the B half: an off-beat arpeggio up the chord */
    if (bar >= 8) {
      const n = chord.ch;
      if (st === 1) guitar(t, hz(n[1] + 12), SPB * 0.9);
      if (st === 3) guitar(t, hz(n[2] + 12), SPB * 0.9);
      if (st === 5) guitar(t, hz(n[3] + 12), SPB * 0.9);
      if (st === 7) guitar(t, hz(n[0] + 24), SPB * 0.9);
    }
    /* the kit, when it is in */
    if (st === 0) kick(t);
    if (st === 2 || st === 6) brush(t);
    if (st === 0 || st === 2 || st === 4 || st === 6) ride(t, 0.026);
    if (st === 3 || st === 7) ride(t, 0.034);
    if (st % 2 === 0) hat(t, 0.05);
    if (st === 3 || st === 7) hat(t, 0.028);
    if (st === 3 || st === 5) chord.ch.forEach((m, i) => key(t + i * 0.012, hz(m + 12), SPB * 0.6));
    if (st === 0) pad(t, chord.ch.map(hz), SPB * BEATS);
    if (chord.h) chord.h.forEach(([m, b, d]) => {
      if (Math.abs(b - st / 2) < 0.001) lead(t, hz(m), d * SPB);
    });
    /* THE HOOK IN THE BED. Once per form, at the end of the A half, the sax
       states the three notes the trumpet plays when a bill carries — so the
       player has heard the tune before it ever means anything. */
    if (bar === 6 && st === 0) MOTIF.forEach((m, i) => reed(t + i * SPB * 0.75, hz(m), SPB * 0.7));
  }

  function loop() {
    if (!playing || !ctx) return;
    while (nextTime < ctx.currentTime + 0.2) {
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
    /* A recording that is already up owns the bus: the bed does not climb
       back over it when the player toggles music on mid-anthem. */
    ["pad", "bass", "rhodes", "guitar", "keys", "reed", "shaker"]
      .forEach(id => ramp(id, anthemSrc ? 0 : level(id), ctx.currentTime, 1.5));
    loop();
  }
  function stop() {
    playing = false;
    if (timer) { clearTimeout(timer); timer = null; }
    /* ramp() guards on ctx, but ctx.currentTime is read BEFORE the call, so
       the guard never runs. stop() is exported, and build() leaves ctx null
       when Web Audio is absent or blocked — which is precisely the machine
       this module promises not to throw on. */
    if (!ctx) return;
    LAYERS.forEach(l => ramp(l.id, 0, ctx.currentTime, 0.6));
    anthemOff(0.6);
  }

  /* ---------------------------------------------------------------
     THE NEXT EIGHTH.

     A gesture fires the moment a player clicks, and a player does not
     click on the beat, so a figure entering at an arbitrary offset
     reads as a second piece of music starting over the first.
     Everything below is pushed onto the grid the sequencer has already
     laid down — under a fifth of a second away at this tempo, inaudible
     as a delay, and the difference between a bed the game plays over
     and a bed the game plays WITH.
     --------------------------------------------------------------- */
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
    const away = (8 - (step % 8)) % 8;
    return Math.max(ctx.currentTime, nextTime + away * STEP);
  }
  /* the chord under the bar we are in, for a gesture to land on */
  function nowChord() { return PROG[Math.floor(step / 8) % BARS]; }

  /* ---------------------------------------------------------------
     THE SMALL INTERRUPTIONS.

     Five things happen to the player that the bed used to ignore
     completely. None of them is a swell: a swell is for a division and
     an election, and if everything swells then nothing does. These are
     gestures — a figure, on the grid, and then the bed carries on.
     --------------------------------------------------------------- */

  /* one chord, whole band, and gone. "Noted." */
  function stab(t, ch, amp) {
    if (!ctx) return;
    ch.forEach((m, i) => key(t + i * 0.012, hz(m + 12), SPB * 0.5));
    bass(t, hz(ch[0] - 12), SPB * 0.45, (amp || 0.35));
    kick(t);
  }

  /* AN UNDERTAKING IS ENTERED. A promise is not an outcome, so the
     score notes it and carries on — which is exactly what the order
     paper does with it. */
  function undertake() {
    if (!playing || !ctx) return;
    stab(nextStepTime(), nowChord().ch, 0.3);
  }

  /* AN ORDER IS MADE. A statutory instrument is in force the moment it
     is signed, so the music ARRIVES rather than builds: the chord walks
     up chromatically into the bar line and lands on it. */
  function order() {
    if (!playing || !ctx) return;
    const bar = nextBarTime(), ch = nowChord().ch;
    [-3, -2, -1].forEach((off, i) => {
      const t = bar - (3 - i) * STEP;
      if (t < ctx.currentTime) return;
      ch.forEach((m, j) => key(t + j * 0.008, hz(m + 12 + off), SPB * 0.22));
    });
    stab(bar, ch, 0.38);
  }

  /* AND ITS OPPOSITE. A prayer carried against an order takes it out of
     force, so the same figure runs DOWNWARD and lands on nothing. The
     one gesture in the score that is another gesture reversed. */
  function revoke() {
    if (!playing || !ctx) return;
    const bar = nextBarTime(), ch = nowChord().ch, t0 = ctx.currentTime;
    [3, 2, 1].forEach((off, i) => {
      const t = bar - (3 - i) * STEP;
      if (t < t0) return;
      ch.forEach((m, j) => key(t + j * 0.008, hz(m + 12 + off), SPB * 0.22));
    });
    ramp("keys", level("keys") * 0.4, bar, 0.4);
    ramp("keys", level("keys"), bar + 3 * SPB, 1.4);
  }

  /* THE SIGNATURES REACH THE BALLOT THRESHOLD. The most dramatic thing
     that can happen to the player short of losing, and the bed did not
     notice it at all.

     It is NOT a defeat — nothing has been lost yet — so nothing swells
     and nothing resolves. The sax goes, the pad thins, and a low
     chromatic figure walks down underneath. Something is coming. */
  /* A BUILD. Every other interruption jumps between plateaus; this one CLIMBS.
     Over N bars the drums come up, the shaker doubles, the lead arrives on the
     last bar, and the bass walks a step a bar. It is the missing shape in the
     score, and it is reserved for the one thing in the game that is genuinely
     on its way rather than simply happening: the signatures reaching the
     threshold. */
  function swell(bars) {
    if (!playing || !ctx) return;
    const n = Math.max(2, bars || 4), t = ctx.currentTime, bar = nextBarTime();
    const dur = n * BEATS * SPB;
    ramp("drums",  0.24, t, dur * 0.7);
    ramp("shaker", level("shaker") * 1.8, t, dur * 0.6);
    ramp("lead",   0.16, t + (n - 1) * BEATS * SPB, 0.9);
    for (let i = 0; i < n; i++)
      bass(bar + i * BEATS * SPB, hz(38 + i * 2), SPB * 0.9, 0.30 + i * 0.03);
    ramp("drums",  0, t + dur, 1.4);
    ramp("lead",   0, t + dur, 1.4);
    ramp("shaker", level("shaker"), t + dur, 1.4);
  }

  function threat() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime;
    ramp("reed", 0, t, 0.6);
    ramp("keys", 0, t, 0.8);
    ramp("pad", level("pad") * 0.5, t, 0.8);
    swell(3);
    ramp("reed", level("reed"), t + 10, 2.5);
    ramp("keys", level("keys"), t + 10, 2.5);
    ramp("pad", level("pad"), t + 10, 2.5);
  }

  /* PROROGATION. The session ends, and this is the only place the bed
     is allowed to sound finished: the dominant lands on the tonic, the
     trumpet takes the third, and everything comes back after it. It is
     the one full stop in the score and it stays that way, or it stops
     meaning anything. */
  function prorogue() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, bar = nextBarTime();
    const A7 = [57, 61, 64, 67], DM = [50, 57, 62, 65];
    const pre = Math.max(t, bar - 2 * STEP);
    A7.forEach((m, i) => key(pre + i * 0.012, hz(m), SPB * 0.8));
    bass(pre, hz(45), SPB * 0.8, 0.34);
    stab(bar, DM, 0.42);
    lead(bar, hz(65), SPB * 2.2);
    ramp("lead", 0.14, bar, 0.2);
    ramp("lead", 0, bar + 3 * SPB, 1.2);
  }

  /* a division is called: the drums enter, and stay until the result */
  function tension() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime;
    ramp("drums", 0.22, t, 0.5);
    ramp("pad",   level("pad") * 0.6, t, 0.5);
  }
  /* a bill carries: the trumpet enters over the drums for four bars */
  function moment() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, dur = 4 * BEATS * SPB;
    ramp("drums", 0.24, t, 0.4);
    ramp("lead",  0.17, t, 0.4);
    ramp("pad",   level("pad") * 0.5, t, 0.4);
    /* the trumpet states the hook ON THE BEAT rather than at whatever
       offset the click happened to land on — the one place the player
       is meant to recognise something */
    const b0 = nextStepTime();
    MOTIF.forEach((m, i) => lead(b0 + i * SPB * 0.75, hz(m), SPB * 0.7));
    ramp("drums", 0, t + dur - 0.9, 0.9);
    ramp("lead",  0, t + dur - 0.9, 0.9);
    ramp("pad",   level("pad"), t + dur - 0.9, 0.9);
  }
  /* a bill is lost: the drums and trumpet drop and the keys go out for two bars */
  function defeat() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, dur = 2 * BEATS * SPB;
    ramp("drums", 0, t, 0.4);
    ramp("lead",  0, t, 0.4);
    ramp("keys",  0, t, 0.4);
    ramp("pad",   level("pad") * 0.6, t, 0.5);
    ramp("keys",  level("keys"), t + dur, 1.2);
    ramp("pad",   level("pad"), t + dur, 1.2);
  }
  /* a government opens: the whole bed comes up, drums and trumpet with it, then
     they settle back and leave the room */
  function rise() {
    if (!playing || !ctx) return;
    /* The anthem is the opening while it is up; nothing swells over it. */
    if (anthemSrc || anthemWanted) return;
    const t = ctx.currentTime, dur = 6 * BEATS * SPB;
    ["pad", "bass", "keys", "reed"].forEach(id => ramp(id, level(id), t, 1.5));
    ramp("drums", 0.20, t, 1.0);
    ramp("lead",  0.15, t, 1.0);
    ramp("drums", 0, t + dur - 1.0, 1.0);
    ramp("lead",  0, t + dur - 1.0, 1.0);
  }
  /* the government has fallen: thin the bed out, then let it return */
  function sombre() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime;
    ramp("drums", 0, t, 0.4);
    ramp("lead",  0, t, 0.4);
    ramp("keys",  level("keys") * 0.4, t, 0.6);
    ramp("keys",  level("keys"), t + 5, 2.5);
  }

  /* ---------------------------------------------------------------
     THE ANTHEM.

     One recorded track, named by content and embedded as base64 because
     file:// will not fetch a file. It is NOT a bed: a bed is remixed
     bar by bar and a recording cannot be, so the recording takes a gain
     of its own on the music bus and the bed steps out of its way. The
     transition in both directions is a fade, and the sequencer is never
     stopped — so coming back out of an anthem the bed resumes mid-phrase
     rather than restarting, which is what makes it seamless.

     NOTHING HERE MAY THROW, like everything else in this file. A missing
     recording, absent Web Audio, a blocked context or a browser without
     atob all resolve to "the bed carries on".
     --------------------------------------------------------------- */
  function trackFor(id) {
    const A = (typeof ANTHEM !== "undefined" && ANTHEM) || {};
    return (id && A[id]) || null;
  }
  /* base64 -> ArrayBuffer, for decodeAudioData. */
  function b64buf(b64) {
    if (typeof atob !== "function") return null;
    const bin = atob(b64), n = bin.length, u = new Uint8Array(n);
    for (let i = 0; i < n; i++) u[i] = bin.charCodeAt(i);
    return u.buffer;
  }
  /* The bed steps back or returns, as a whole, on the one glide. */
  function bed(factor, glide) {
    if (!ctx) return;
    const now = ctx.currentTime;
    LAYERS.forEach(l => ramp(l.id, level(l.id) * factor, now, glide || 1.2));
  }
  /* a fade on any gain node, holding the value it is actually at — an
     assigned .value is not an event, and cancelScheduledValues alone
     would snap a ramp in flight back to its start. */
  function fade(gain, target, glide) {
    if (!gain || !ctx) return;
    const now = ctx.currentTime, v = gain.gain.value;
    try {
      if (gain.gain.cancelAndHoldAtTime) gain.gain.cancelAndHoldAtTime(now);
      else { gain.gain.cancelScheduledValues(now); gain.gain.setValueAtTime(v, now); }
    } catch (e) {
      try { gain.gain.cancelScheduledValues(now); gain.gain.setValueAtTime(v, now); } catch (e2) {}
    }
    try { gain.gain.linearRampToValueAtTime(target, now + (glide || 1.2)); } catch (e) {}
  }
  /* keepBed: a caller replacing one anthem with another must not un-duck
     the bed in the gap between them. */
  function anthemOff(glide, keepBed) {
    const g = glide || 1.2;
    anthemToken++;                              /* a decode still in flight is dead */
    anthemWanted = false;
    const src = anthemSrc, gain = anthemGain;
    anthemSrc = null; anthemGain = null; anthemId = null;
    if (src && gain && ctx) {
      fade(gain, 0.0001, g);
      try { src.stop(ctx.currentTime + g + 0.05); } catch (e) {}
    }
    if (playing && !keepBed) bed(1, g);
    return true;
  }
  /* anthem(id) plays a track and ducks the bed; anthem(null) fades the
     track out and brings the bed back. Returns false when there is no
     recording, so the caller can fall back to a mood. */
  function anthem(id) {
    if (!id) return anthemOff();
    const t = trackFor(id);
    if (!t || !t.data) return false;            /* not encoded yet: the bed carries */
    if (pref("music") === false) return false;
    /* ONE RECORDING AT A TIME. Starting a second without stopping the
       first left the first looping for ever — the stack heard after
       returning to the menu and beginning another government. */
    if (anthemSrc || anthemWanted) anthemOff(0.4, true);
    const my = ++anthemToken;
    anthemWanted = true;
    const begin = () => {
      if (my !== anthemToken) return;
      /* THE CLICK THAT STARTS A GOVERNMENT IS ALSO THE GESTURE THAT BUILDS
         THE GRAPH, and build() is normally queued behind the context's own
         resume(). Build it here if it is not up yet; if even Sound has no
         context, wait for the one that unlocks it. */
      if (!build()) {
        if (typeof Sound !== "undefined" && Sound.onReady && !Sound.available())
          Sound.onReady(begin);
        else anthemWanted = false;
        return;
      }
      let buf;
      try { buf = b64buf(t.data); } catch (e) { return; }
      if (!buf) return;
      /* ONCE, WHICHEVER WAY IT ARRIVES. decodeAudioData fires the legacy
         callbacks AND resolves its promise, so play ran twice: two looping
         sources, one of them untracked and therefore unstoppable — which
         is why the recording outlived the page that started it. */
      let played = false;
      const play = audio => {
        if (played) return;
        played = true;
        if (my !== anthemToken || !ctx || !out) return;
        try {
          const src = ctx.createBufferSource(), g = ctx.createGain();
          src.buffer = audio; src.loop = true;
          /* IN GENTLY. The recording is a full-scale master and the bed is
             mixed quiet, so it also sits well below the bus. */
          const now = ctx.currentTime, target = t.level || 0.3;
          g.gain.setValueAtTime(0.0001, now);
          g.gain.linearRampToValueAtTime(target, now + 2.0);
          src.connect(g); g.connect(out);
          src.start();
          anthemSrc = src; anthemGain = g; anthemId = id;
          bed(0, 2.0);
        } catch (e) {}
      };
      try {
        const p = ctx.decodeAudioData(buf, play, () => {});
        if (p && p.then) p.then(play, () => {});
      } catch (e) {}
    };
    begin();
    return true;
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
    undertake: undertake, order: order, revoke: revoke, threat: threat,
    prorogue: prorogue, swell: swell,
    /* the one recorded track; null stops it and returns the bed */
    anthem: anthem,
    available: () => !!ctx,
    /* for the checks and for the Options readout: what the bed is
       actually doing, as opposed to what it was told to do */
    state: () => ({
      playing: playing,
      context: ctx ? ctx.state : null,
      bar: playing ? (Math.floor(step / 8) % BARS) + 1 : null,
      anthem: anthemId,
      anthemLevel: anthemGain ? Math.round(anthemGain.gain.value * 1000) / 1000 : null,
      levels: LAYERS.reduce((o, l) => {
        o[l.id] = gains[l.id] ? Math.round(gains[l.id].gain.value * 1000) / 1000 : null;
        return o;
      }, {})
    }),
    /* the form is hand-typed MIDI and a mistyped number is a wrong note
       that no static check can see and nobody hears until the loop
       happens to reach that bar */
    __form: { PROG: PROG, MOTIF: MOTIF, BARS: BARS, BPM: BPM, BEATS: BEATS,
              LAYERS: LAYERS.map(l => l.id),
              MOODS: ["tension","moment","defeat","rise","sombre",
                      "undertake","order","revoke","threat","prorogue"] }
  };
})();

if (typeof module !== "undefined") module.exports = Music;
