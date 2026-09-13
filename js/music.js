/* =============================================================
   MUSIC — the adaptive bed.

   A slow eight-bar loop at 72 BPM in D minor, synthesised from
   oscillators and one noise buffer. No assets, same as the cues.

   VERTICAL REMIXING. The loop is split into layers, each on its own
   gain. The BED is pad, bass, keys and reed — a smooth saxophone
   line of long tones. The special bars add the drums and a brighter
   trumpet lead. Nothing changes tempo, which is the whole point: a
   swell is a layer entering, not the band speeding up.

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
    { id: "bass",  level: 0.24 },
    { id: "keys",  level: 0.11 },
    { id: "reed",  level: 0.10 },
    { id: "drums", level: 0.18 },
    { id: "lead",  level: 0.15 }
  ];

  /* 8 bars. ch: chord (MIDI). bass: [root, fifth, approach]. reed: a long
     tone, one per bar. h: the lead line, as [beat, midi, dur in beats]. */
  const PROG = [
    { ch: [50,53,57,60], bass: [38,45,41], reed: 53, h: [[69,0,1.5],[72,2.5,1]] },
    { ch: [50,53,57,60], bass: [38,45,43], reed: 57, h: null },
    { ch: [55,58,62,65], bass: [43,50,46], reed: 58, h: [[74,1,1.5],[72,3,1]] },
    { ch: [55,58,62,65], bass: [43,50,45], reed: 62, h: null },
    { ch: [58,62,65,69], bass: [46,53,50], reed: 65, h: [[70,0,1.5],[69,2.5,1]] },
    { ch: [57,61,64,67], bass: [45,52,48], reed: 64, h: [[67,0,2]] },
    { ch: [50,53,57,60], bass: [38,45,40], reed: 57, h: null },
    { ch: [57,61,64,67], bass: [45,52,43], reed: 61, h: [[65,1,1],[67,2.5,1.5]] }
  ];

  /* the bass rhythm: [beat, duration in beats, amp]. Root, fifth, approach,
     so it is not the same note at the same interval every time. */
  const BASS_T = [[0, 1.5, 1.0], [2, 1.0, 0.85], [3.5, 0.5, 0.7]];

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
    gains.reed.connect(send); gains.lead.connect(send);
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

  /* the bass: legato and rounded, a filter that opens and closes, so it reads
     as a double bass rather than a series of plucks. */
  function bass(t, f, dur, amp) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(),
          lp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = f;
    o2.type = "sine"; o2.frequency.value = f;
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(300, t);
    lp.frequency.linearRampToValueAtTime(520, t + 0.14);
    lp.frequency.linearRampToValueAtTime(250, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(amp, t + 0.06);
    g.gain.linearRampToValueAtTime(amp * 0.85, t + dur * 0.6);
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
  /* the reed: a soft saxophone, a long tone with vibrato. Part of the bed. */
  function reed(t, f, dur) {
    const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = f;
    lp.type = "lowpass"; lp.frequency.value = 900; lp.Q.value = 0.6;
    vib.frequency.value = 4.6; vg.gain.value = f * 0.004;
    vib.connect(vg); vg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.13, t + 0.45);
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

  /* ---------- the sequencer ---------- */
  function scheduleStep(s, t0) {
    const bar = Math.floor(s / 8) % BARS;
    const st = s % 8;                       /* eighth step in the bar */
    const t = t0 + (st % 2 ? SWING : 0);    /* swing the off-beats */
    const chord = PROG[bar];

    BASS_T.forEach(([b, d, a], i) => {
      if (Math.abs(b - st / 2) < 0.001) bass(t, hz(chord.bass[i]), d * SPB, a * 0.5);
    });
    if (st === 0) reed(t, hz(chord.reed), SPB * 3.4);
    if (st === 0) kick(t);
    if (st === 2 || st === 6) brush(t);
    if (st % 2 === 0) hat(t, 0.05);
    if (st === 3 || st === 7) hat(t, 0.028);
    if (st === 3 || st === 5) chord.ch.forEach((m, i) => key(t + i * 0.012, hz(m + 12), SPB * 0.6));
    if (st === 0) pad(t, chord.ch.map(hz), SPB * BEATS);
    if (chord.h) chord.h.forEach(([m, b, d]) => {
      if (Math.abs(b - st / 2) < 0.001) lead(t, hz(m), d * SPB);
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
    ["pad", "bass", "keys", "reed"].forEach(id => ramp(id, level(id), ctx.currentTime, 1.5));
    loop();
  }
  function stop() {
    playing = false;
    if (timer) { clearTimeout(timer); timer = null; }
    LAYERS.forEach(l => ramp(l.id, 0, ctx.currentTime, 0.6));
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
    available: () => !!ctx
  };
})();
