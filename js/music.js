/* =============================================================
   MUSIC — the adaptive bed.

   A slow eight-bar loop at 72 BPM in D minor, synthesised from
   oscillators and one noise buffer. No assets, same as the cues.

   VERTICAL REMIXING. The loop is split into layers — pad, bass,
   keys, drums, horn — each on its own gain. The bed is pad, bass
   and keys; a moment fades the drums and horn in for four bars and
   drops them back. Nothing changes tempo, which is the whole point:
   a swell is a layer entering, not the band speeding up.

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

  const BPM = 72, BEATS = 4, BARS = 8;
  const SPB = 60 / BPM;        /* seconds per beat */
  const STEP = SPB / 2;        /* one eighth note */
  const SWING = SPB * 0.17;    /* push the off-beats late */

  const LAYERS = [
    { id: "pad",   level: 0.07 },
    { id: "bass",  level: 0.26 },
    { id: "keys",  level: 0.12 },
    { id: "drums", level: 0.20 },
    { id: "horn",  level: 0.15 }
  ];

  /* 8 bars: chord (MIDI), walking bass (one per beat), horn (beat, dur in beats) */
  const PROG = [
    { ch: [50,53,57,60], b: [38,45,50,48], h: [[69,0,1.5],[72,2.5,1]] },
    { ch: [50,53,57,60], b: [50,48,45,43], h: null },
    { ch: [55,58,62,65], b: [43,50,55,53], h: [[74,1,1.5],[72,3,1]] },
    { ch: [55,58,62,65], b: [55,53,50,48], h: null },
    { ch: [58,62,65,69], b: [46,53,58,57], h: [[70,0,1.5],[69,2.5,1]] },
    { ch: [57,61,64,67], b: [45,52,57,55], h: [[67,0,2]] },
    { ch: [50,53,57,60], b: [38,45,50,52], h: null },
    { ch: [57,61,64,67], b: [45,43,41,40], h: [[65,1,1],[67,2.5,1.5]] }
  ];

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
    delay.delayTime.value = SPB * 0.75; fb.gain.value = 0.28; wet.gain.value = 0.16;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(out);
    send = delay;
    LAYERS.forEach(l => {
      const g = ctx.createGain(); g.gain.value = 0; g.connect(out);
      gains[l.id] = g;
    });
    gains.keys.connect(send); gains.horn.connect(send);
    NOISE = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = NOISE.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  function ramp(id, target, t, glide) {
    const g = gains[id]; if (!g || !ctx) return;
    const now = ctx.currentTime;
    if (t < now) t = now;
    if (g.gain.cancelAndHoldAtTime) g.gain.cancelAndHoldAtTime(t);
    else { const v = g.gain.value; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(v, t); }
    g.gain.linearRampToValueAtTime(target, t + (glide || 0.4));
  }

  /* ---------- voices ---------- */
  function bass(t, f, dur) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(),
          lp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = f;
    o2.type = "sine"; o2.frequency.value = f / 2;
    lp.type = "lowpass"; lp.frequency.value = 520;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(gains.bass);
    o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
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
  function horn(t, f, dur) {
    const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = f;
    lp.type = "lowpass"; lp.frequency.value = 1250;
    vib.frequency.value = 5.1; vg.gain.value = f * 0.006;
    vib.connect(vg); vg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.2, t + 0.13);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(gains.horn);
    o.start(t); vib.start(t); o.stop(t + dur + 0.1); vib.stop(t + dur + 0.1);
  }

  /* ---------- the sequencer ---------- */
  function scheduleStep(s, t0) {
    const bar = Math.floor(s / 8) % BARS;
    const st = s % 8;                       /* eighth step in the bar */
    const t = t0 + (st % 2 ? SWING : 0);    /* swing the off-beats */
    const chord = PROG[bar];

    if (st % 2 === 0) bass(t, hz(chord.b[st / 2]), SPB * 0.9);
    if (st === 0) kick(t);
    if (st === 2 || st === 6) brush(t);
    if (st % 2 === 0) hat(t, 0.05);
    if (st === 3 || st === 7) hat(t, 0.028);
    if (st === 3 || st === 5) chord.ch.forEach((m, i) => key(t + i * 0.012, hz(m + 12), SPB * 0.6));
    if (st === 0) pad(t, chord.ch.map(hz), SPB * BEATS);
    if (chord.h) chord.h.forEach(([m, b, d]) => {
      if (Math.abs(b - st / 2) < 0.001) horn(t, hz(m), d * SPB);
    });
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
    ["pad", "bass", "keys"].forEach(id => ramp(id, level(id), ctx.currentTime, 1.5));
    loop();
  }
  function stop() {
    playing = false;
    if (timer) { clearTimeout(timer); timer = null; }
    LAYERS.forEach(l => ramp(l.id, 0, ctx.currentTime, 0.6));
  }

  /* a bill carries: the drums and horn enter for four bars, the pad steps back */
  function moment() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, dur = 4 * BEATS * SPB;
    ramp("drums", 0.30, t, 0.4);
    ramp("horn",  0.24, t, 0.4);
    ramp("pad",   level("pad") * 0.5, t, 0.4);
    ramp("drums", 0, t + dur - 0.9, 0.9);
    ramp("horn",  0, t + dur - 0.9, 0.9);
    ramp("pad",   level("pad"), t + dur - 0.9, 0.9);
  }
  /* the government has fallen: thin the bed out, then let it return */
  function sombre() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime;
    ramp("drums", 0, t, 0.4);
    ramp("horn",  0, t, 0.4);
    ramp("keys",  level("keys") * 0.4, t, 0.6);
    ramp("keys",  level("keys"), t + 5, 2.5);
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
    init: init, start: start, stop: stop, moment: moment, sombre: sombre, apply: apply,
    available: () => !!ctx
  };
})();
