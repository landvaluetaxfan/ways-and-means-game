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

  const BPM = 72, BEATS = 4;
  const SPB = 60 / BPM;        /* seconds per beat */
  const STEP = SPB / 2;        /* one eighth note */
  const SWING = SPB * 0.17;    /* push the off-beats late */

  const LAYERS = [
    { id: "pad",   level: 0.07 },
    { id: "bass",  level: 0.22 },
    { id: "keys",  level: 0.11 },
    { id: "reed",  level: 0.10 },
    { id: "drums", level: 0.18 },
    { id: "lead",  level: 0.15 }
  ];

  /* THE HOOK. Up a minor sixth, down a semitone: D - Bb - A. It is stated
     slowly by the reed across the opening three bars, restated in one bar
     at the top of the last section, and quoted outright by the trumpet
     when a bill carries. A bed with no motif is wallpaper; the point of a
     motif is that the player can hear the game remember something. */
  const MOTIF = [62, 70, 69];

  /* ------------------------------------------------------------------
     THE FORM. Twenty-four bars, three sections, eighty seconds.

     It was eight bars — twenty-seven seconds — and it ended A7 -> Dm, a
     perfect cadence straight back into bar one. A closed cadence at the
     loop point ANNOUNCES the loop: the ear learns the join in two passes
     and hears nothing else afterwards. Every reference soundtrack that
     survives a long session avoids exactly this, either by wandering
     (Balatro) or by never cadencing at all (Cookie Clicker).

     So: A states it and moves sideways to Gm rather than resolving. B
     goes flatward into Cm - F - Ebmaj7 and the half-diminished, which is
     the darker room. C comes home and still will not land — the last bar
     is the tonic chord over the subdominant bass, which slides into bar
     one as a plagal drift instead of a cadence.

     ch: chord (MIDI). bass: [root, fifth, approach]. reed: the long tone.
     h: the trumpet line, [midi, beat, beats]. q: a quiet bar, no keys —
     silence is a layer and every bar used to be full.
     ------------------------------------------------------------------ */
  const PROG = [
    /* A — the statement */
    { ch:[50,53,57,64], bass:[38,45,41], reed:62, q:false, h:[[62,0,2]] },
    { ch:[50,53,57,64], bass:[38,45,43], reed:70, q:true,  h:null },
    { ch:[55,58,62,65], bass:[43,50,46], reed:69, q:false, h:null },
    { ch:[55,58,62,65], bass:[43,50,45], reed:65, q:true,  h:[[67,2,1.5]] },
    { ch:[58,62,65,69], bass:[46,53,50], reed:65, q:false, h:null },
    { ch:[57,61,64,70], bass:[45,52,49], reed:64, q:false, h:[[70,1,1],[69,2.5,1.5]] },
    { ch:[50,53,57,64], bass:[38,45,40], reed:57, q:true,  h:null },
    { ch:[55,58,62,65], bass:[43,50,45], reed:62, q:false, h:null },
    /* B — flatward, and darker */
    { ch:[48,51,55,58], bass:[36,43,39], reed:63, q:false, h:null },
    { ch:[48,51,55,58], bass:[36,43,41], reed:58, q:true,  h:null },
    { ch:[53,57,60,64], bass:[41,48,43], reed:60, q:false, h:null },
    { ch:[53,57,60,64], bass:[41,48,46], reed:64, q:true,  h:[[65,1,2]] },
    { ch:[51,55,58,62], bass:[39,46,44], reed:62, q:false, h:null },
    { ch:[51,55,58,62], bass:[39,46,41], reed:58, q:true,  h:null },
    { ch:[57,60,63,67], bass:[45,51,43], reed:63, q:false, h:null },
    { ch:[57,61,64,70], bass:[45,52,49], reed:61, q:false, h:[[70,0,1.5],[69,2,2]] },
    /* C — home, and it will not land */
    { ch:[50,53,57,64], bass:[38,45,41], reed:62, q:false, h:[[62,0,1],[70,1.5,1],[69,3,1]] },
    { ch:[50,53,57,64], bass:[38,45,43], reed:57, q:true,  h:null },
    { ch:[55,58,62,65], bass:[43,50,46], reed:65, q:false, h:null },
    { ch:[52,55,58,62], bass:[40,46,43], reed:58, q:true,  h:null },
    { ch:[57,62,64,67], bass:[45,52,50], reed:64, q:false, h:null },
    { ch:[57,61,64,70], bass:[45,52,49], reed:61, q:false, h:[[69,2,2]] },
    { ch:[50,53,57,64], bass:[38,45,40], reed:62, q:true,  h:null },
    { ch:[50,53,57,64], bass:[43,50,45], reed:60, q:false, h:null }
  ];
  const BARS = PROG.length;

  /* the bass rhythm: [beat, duration in beats, amp]. Root, fifth, approach,
     so it is not the same note at the same interval every time. */
  const BASS_T = [[0, 1.5, 1.0], [2, 0.7, 0.85], [3, 0.5, 0.7]];

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
  /* DETUNE IS THE WHOLE TIMBRE. Every sustained voice here was one clean
     oscillator, which is why the bed read as a synthesiser playing jazz
     rather than as a room with players in it. Two oscillators a few cents
     apart beat against each other slowly, and that beating is most of
     what the ear hears as "an instrument" rather than "a tone". It is
     also the specific woozy quality the reference soundtrack has.

     The gain is halved wherever a voice doubles, so this changes the
     colour and not the level. */
  const DETUNE = 6;

  function pair(t, f, type, cents) {
    const a = ctx.createOscillator(), b = ctx.createOscillator();
    a.type = b.type = type;
    a.frequency.value = b.frequency.value = f;
    a.detune.value = -(cents || DETUNE); b.detune.value = (cents || DETUNE);
    return [a, b];
  }

  function pad(t, freqs, dur) {
    freqs.forEach(f => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.028, t + 1.1);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      g.connect(gains.pad);
      pair(t, f, "sine", 5).forEach(o => {
        o.connect(g); o.start(t); o.stop(t + dur + 0.1);
      });
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
    const lp = ctx.createBiquadFilter(), g = ctx.createGain();
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    lp.type = "lowpass"; lp.frequency.value = 900; lp.Q.value = 0.6;
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
  /* the lead: a brighter trumpet, held back for the special bars */
  function lead(t, f, dur) {
    const lp = ctx.createBiquadFilter(), g = ctx.createGain();
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    lp.type = "lowpass"; lp.frequency.value = 1800;
    vib.frequency.value = 5.3; vg.gain.value = f * 0.006;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.08, t + 0.09);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    pair(t, f, "sawtooth", 8).forEach(o => {
      vib.connect(vg); vg.connect(o.frequency);
      o.connect(lp); o.start(t); o.stop(t + dur + 0.1);
    });
    lp.connect(g); g.connect(gains.lead);
    vib.start(t); vib.stop(t + dur + 0.1);
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
    /* A quiet bar drops the keys. Every bar used to carry every voice,
       which is the fastest way to make eighty seconds feel like eight:
       with nothing ever absent there is nothing to notice returning. */
    if (!chord.q && (st === 3 || st === 5))
      chord.ch.forEach((m, i) => key(t + i * 0.012, hz(m + 12), SPB * 0.6));
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
    /* ramp() guards on ctx, but ctx.currentTime is read BEFORE the call, so
       the guard never runs. stop() is exported, and build() leaves ctx null
       when Web Audio is absent or blocked — which is precisely the machine
       this module promises not to throw on. */
    if (!ctx) return;
    LAYERS.forEach(l => ramp(l.id, 0, ctx.currentTime, 0.6));
  }

  /* A DIVISION IS CALLED. This gets less than three beats: the reading of
     the result runs about two and a half seconds, and then moment() or
     defeat() overrides everything here. A drum kit entering needs bars to
     establish and had none, so the swell was inaudible in the only place
     it ever fired.

     SUBTRACTION READS INSTANTLY WHERE ADDITION DOES NOT. Take the pad,
     the keys and the sax out and leave the bass and a hat, and the room
     goes quiet inside one beat — which is what the House doing the same
     thing sounds like. The kit comes up under it as a pulse rather than
     as an arrival. */
  function tension() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime;
    ramp("pad",   0, t, 0.25);
    ramp("keys",  0, t, 0.2);
    ramp("reed",  0, t, 0.3);
    ramp("drums", 0.20, t, 0.35);
  }
  /* THE NEXT EIGHTH. A swell fires the moment a player clicks, and a
     player does not click on the beat, so a trumpet entering at an
     arbitrary offset reads as a second piece of music starting over the
     first. Everything triggered by an action is pushed to the next step
     boundary the sequencer has already scheduled — under a tenth of a
     second away at this tempo, inaudible as a delay, and the difference
     between a bed the game plays over and a bed the game plays WITH. */
  function nextBeat() {
    if (!ctx) return 0;
    const now = ctx.currentTime;
    if (!playing) return now;
    let t = nextTime;
    while (t < now) t += STEP;         /* the scheduler runs ahead; catch up */
    while (t - now > STEP) t -= STEP;  /* and never more than one step out */
    return t;
  }

  /* a bill carries: the trumpet enters over the drums and quotes the hook */
  function moment() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, dur = 4 * BEATS * SPB;
    ramp("drums", 0.24, t, 0.4);
    ramp("lead",  0.17, t, 0.4);
    ramp("pad",   level("pad") * 0.5, t, 0.4);

    /* The hook, on the beat, rather than whatever the lead line happens to
       hold in whichever bar the click landed in. This is the one place the
       player is meant to recognise something. */
    const b = nextBeat();
    MOTIF.forEach((m, i) => lead(b + i * SPB * 0.75, hz(m), SPB * 0.7));

    ramp("drums", 0, t + dur - 0.9, 0.9);
    ramp("lead",  0, t + dur - 0.9, 0.9);
    ramp("pad",   level("pad"), t + dur - 0.9, 0.9);
    /* likewise: whatever tension() took, this puts back */
    ramp("keys",  level("keys"), t + 0.6, 1.0);
    ramp("reed",  level("reed"), t + 0.6, 1.0);
  }
  /* a bill is lost: the drums and trumpet drop and the keys go out for two bars */
  function defeat() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime, dur = 2 * BEATS * SPB;
    ramp("drums", 0, t, 0.4);
    ramp("lead",  0, t, 0.4);
    ramp("keys",  0, t, 0.4);
    ramp("pad",   level("pad") * 0.6, t, 0.5);
    /* tension() emptied the room and every path out of it must refill it,
       or a lost division leaves the bed permanently missing its sax. */
    ramp("keys",  level("keys"), t + dur, 1.2);
    ramp("pad",   level("pad"),  t + dur, 1.2);
    ramp("reed",  level("reed"), t + dur, 1.2);
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
    available: () => !!ctx,
    /* For the checks only. The form is hand-typed MIDI, and a mistyped
       number is a wrong note that no static check can see and nobody
       hears until the loop happens to reach that bar. */
    __form: { PROG: PROG, MOTIF: MOTIF, BARS: BARS, BPM: BPM, BEATS: BEATS,
              LAYERS: LAYERS.map(l => l.id) }
  };
})();

if (typeof module !== "undefined") module.exports = Music;
