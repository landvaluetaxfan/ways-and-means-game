/* =============================================================
   THE STORY MAP.

     npm run storymap            storymap/<view>.html for the world and
                                 every administration, and an index
     npm run storymap:check      build every map in memory, and fail if
                                 one cannot be drawn (part of `check`)

   WHAT IT IS FOR. A campaign is wired through a hundred small facts that
   live in a dozen files: this choice sets a flag, that gate reads it, this
   initiative queues its answer in two sittings, that tier is read by an
   award. Nobody can hold it in their head, and an author rewriting a
   campaign has to, because every beat they cut or move pulls on the ones
   around it. This draws it: the chain as a graph, every event in chapter
   order with where it comes from and where it leads, every flag with who
   sets it and who reads it, and the loose ends.

   IT READS, IT NEVER WRITES CONTENT. The page is generated from the same
   view the game plays (CONTENT.forCampaign), so it is always the story as
   built, never as remembered. The output is not committed: storymap/ is
   ignored, and the map is redrawn whenever it is wanted.

   It is a picture, not a verdict. `npm run lint` is where a gate nothing
   can open is a failure; here it is a loose end to look at.
   ============================================================= */
"use strict";
const fs = require("fs"), path = require("path");
const T = require("./testkit.js");
const root = T.LC.root;

/* ---------- small things ---------- */
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const arr = v => v == null ? [] : [].concat(v);
const num = n => typeof n === "number" ? (Math.abs(n) >= 1000 ? n.toLocaleString("en-GB") : String(n)) : String(n);
const signed = n => typeof n === "number" ? (n > 0 ? "+" : n < 0 ? "\u2212" : "") + num(Math.abs(n)) : String(n);

/* ---------- conditions, in words ---------- */
const CMP = { Above: ">", Below: "<", AtLeast: "\u2265" };
function whenText(w) {
  if (!w || typeof w !== "object") return "";
  const out = [];
  Object.keys(w).forEach(k => {
    const v = w[k];
    const m = /^(.*?)(Above|Below|AtLeast)$/.exec(k);
    if (k === "flags") out.push(arr(v).map(f => "flag " + f).join(" and "));
    else if (k === "flagsAbsent") out.push(arr(v).map(f => "not " + f).join(", "));
    else if (k === "flagsAny") out.push("any of " + arr(v).join(", "));
    else if (k === "minSitting") out.push("sitting \u2265 " + v);
    else if (k === "maxSitting") out.push("sitting \u2264 " + v);
    else if (k === "chapterIs") out.push("chapter " + v);
    else if (k === "seen") out.push("after " + arr(v).join(", "));
    else if (k === "resolvedIs") out.push("the result is " + v);
    else if (k === "resolved") out.push(v === true ? "a result is in" : v === false ? "no result yet" : "the result is " + v);
    else if (k === "settled") out.push(v === true ? "an answer is in" : v === false ? "no answer yet" : "the answer is " + v);
    else if (k === "billStage") Object.keys(v).forEach(b => out.push(b + " at " + String(v[b]).replace(/_/g, " ")));
    else if (k === "lawIs") Object.keys(v).forEach(l => out.push(l + " = " + v[l]));
    else if (k === "dissolved") out.push(v ? "the House is dissolved" : "the House sits");
    else if (k === "campaign") out.push("campaign " + arr(v).join(" or "));
    else if (m && v && typeof v === "object" && !Array.isArray(v))
      Object.keys(v).forEach(x => out.push((m[1] && m[1] !== "scalar" ? m[1] + " " : "") + x + " " + CMP[m[2]] + " " + num(v[x])));
    else if (m) out.push(m[1] + " " + CMP[m[2]] + " " + num(v));
    else out.push(k + " " + (typeof v === "object" ? JSON.stringify(v) : String(v)));
  });
  return out.join("; ");
}

/* ---------- effects, in words ---------- */
function flagOps(f) {
  if (typeof f === "string") return [{ flag: f, on: true }];
  if (Array.isArray(f)) return f.map(x => ({ flag: x, on: true }));
  if (f && typeof f === "object") return Object.keys(f).map(x => ({ flag: x, on: !!f[x] }));
  return [];
}
function effText(e) {
  if (!e || typeof e !== "object") return "";
  const k = Object.keys(e)[0], v = e[k];
  switch (k) {
    case "flag": return flagOps(v).map(o => (o.on ? "sets " : "clears ") + o.flag).join(", ");
    case "move": return Object.keys(v).map(x => {
      const t = /^trend\.(.*)$/.exec(x), d = /^debt\.(.*)$/.exec(x);
      return t ? t[1] + " trend " + signed(v[x]) : d ? "owed to " + d[1] + " " + signed(v[x]) : x + " " + signed(v[x]);
    }).join(", ");
    case "queue": return arr(v).map(q => q.event ? "queues " + q.event + " in " + (q.after == null ? 1 : q.after)
                                          : "later (" + (q.after == null ? 1 : q.after) + "): " + arr(q.effects).map(effText).join(", ")).join(", ");
    case "bill": return Object.keys(v).map(b => "bill " + b + " \u2192 " +
      (v[b] && typeof v[b] === "object" ? String(v[b].stage || JSON.stringify(v[b])) : String(v[b])).replace(/_/g, " ")).join(", ");
    case "slots": return v && v.reserve ? Object.keys(v.reserve).map(b => "reserves " + v.reserve[b] + " slots for " + b).join(", ") : "order-paper time";
    case "undertake": return arr(v).map(u => "promises " + u.id + (u.onBreach ? " (broken: " + u.onBreach + ")" : "")).join(", ");
    case "discharge": return "keeps " + arr(v).join(", ");
    case "chapter": return "opens chapter " + v;
    case "cabinet": return Object.keys(v).map(p => p + (v[p] === null ? " vacated" : " filled")).join(", ");
    case "si": return "makes " + arr(v).join(", ");
    case "law": return Object.keys(v).map(l => "law " + l + " = " + v[l]).join(", ");
    case "wire": return "";
    default: return k;
  }
}
const effectsText = list => arr(list).map(effText).filter(Boolean).join("; ");

/* ---------- the model: nodes, writers, readers, edges ---------- */
function build(K, id) {
  const nodes = new Map(), edges = [];
  const flags = {};                    /* flag -> {set:[], clear:[], need:[], absent:[]} */
  const F = f => flags[f] || (flags[f] = { set: [], clear: [], need: [], absent: [], rules: false });
  const mine = x => x && x.campaign != null && arr(x.campaign).indexOf(K.campaign) >= 0;
  const add = (key, kind, x, extra) => nodes.set(key, Object.assign({ key, kind, id: x.id,
    title: x.title || x.name || x.label || x.id, own: mine(x), x }, extra || {}));

  K.events.forEach((e, i) => add("e:" + e.id, "event", e, { pos: i }));
  (K.initiatives || []).forEach(x => add("i:" + x.id, "initiative", x));
  (K.bills || []).forEach(x => add("b:" + x.id, "bill", x));
  (K.settlements || []).forEach(x => add("t:" + x.id, "settlement", x, { title: x.name || x.id }));
  (K.instruments || []).forEach(x => add("s:" + x.id, "instrument", x));
  if ((K.opening || []).length) nodes.set("o:opening", { key: "o:opening", kind: "opening", id: "opening",
    title: "The campaign's opening", own: true, x: { effects: K.opening } });

  /* who WRITES: every effect list a node owns */
  const writes = (from, list, via) => arr(list).forEach(e => {
    if (!e || typeof e !== "object") return;
    const k = Object.keys(e)[0], v = e[k];
    if (k === "flag") flagOps(v).forEach(o => F(o.flag)[o.on ? "set" : "clear"].push({ from, via }));
    if (k === "queue") arr(v).forEach(q => {
      if (q.event) edges.push({ from, to: "e:" + q.event, kind: "queue", label: "in " + (q.after == null ? 1 : q.after), via });
      writes(from, q.effects, via);
    });
    if (k === "bill") Object.keys(v).forEach(b => edges.push({ from, to: "b:" + b, kind: "bill", label: String((v[b] && v[b].stage) || v[b]).replace(/_/g, " "), via }));
    if (k === "undertake") arr(v).forEach(u => { if (u.onBreach) edges.push({ from, to: "e:" + u.onBreach, kind: "breach", label: "if " + u.id + " is broken", via }); });
    if (k === "si") arr(v).forEach(s => edges.push({ from, to: "s:" + s, kind: "makes", label: "makes", via }));
  });
  K.events.forEach(e => {
    writes("e:" + e.id, e.effects, null);
    (e.choices || []).forEach((c, i) => writes("e:" + e.id, c.effects, i));
  });
  (K.initiatives || []).forEach(x => {
    (x.tempo || []).forEach((t, i) => {
      writes("i:" + x.id, t.effects, i);
      if (x.event) edges.push({ from: "i:" + x.id, to: "e:" + x.event, kind: "answer",
                                label: (t.label || "tempo " + (i + 1)) + ", in " + (t.after || 3), via: i });
    });
    if (x.event && !(x.tempo || []).length)
      edges.push({ from: "i:" + x.id, to: "e:" + x.event, kind: "answer", label: "in 3", via: null });
  });
  (K.bills || []).forEach(x => { writes("b:" + x.id, x.onPass, "passes"); writes("b:" + x.id, x.onFail, "fails"); });
  (K.instruments || []).forEach(x => writes("s:" + x.id, x.effects, null));
  (K.settlements || []).forEach(x => writes("t:" + x.id, x.effects, null));
  writes("o:opening", K.opening, null);
  (K.sandbox || []).forEach(x => arr(x.effects).forEach(e => {
    if (e && e.flag !== undefined) flagOps(e.flag).forEach(o => F(o.flag)[o.on ? "set" : "clear"].push({ from: "x:sandbox", via: x.label || x.id }));
  }));

  /* who READS: every gate */
  const reads = (to, w, via) => {
    if (!w || typeof w !== "object") return;
    arr(w.flags).concat(arr(w.flagsAny)).forEach(f => F(f).need.push({ to, via }));
    arr(w.flagsAbsent).forEach(f => F(f).absent.push({ to, via }));
    if (w.seen) arr(w.seen).forEach(s => edges.push({ from: "e:" + s, to, kind: "seen", label: "after", via }));
    ["resolvedIs", "resolved", "settled"].forEach(k => {
      if (typeof w[k] === "string") edges.push({ from: "t:" + w[k], to, kind: "result", label: "on " + w[k], via });
    });
    if (w.billStage) Object.keys(w.billStage).forEach(b => edges.push({ from: "b:" + b, to, kind: "stage", label: "at " + String(w.billStage[b]).replace(/_/g, " "), via }));
    if (w.siInForce) arr(w.siInForce).forEach(s => edges.push({ from: "s:" + s, to, kind: "stage", label: "in force", via }));
  };
  K.events.forEach(e => {
    reads("e:" + e.id, e.when, null);
    (e.choices || []).forEach((c, i) => reads("e:" + e.id, c.when, i));
  });
  (K.initiatives || []).forEach(x => { reads("i:" + x.id, x.when, null); (x.tempo || []).forEach((t, i) => reads("i:" + x.id, t.when, i)); });
  (K.settlements || []).forEach(x => reads("t:" + x.id, x.when, null));
  (K.bills || []).forEach(x => reads("b:" + x.id, x.when, null));
  (K.instruments || []).forEach(x => reads("s:" + x.id, x.when, null));
  const awards = (K.achievements || []).map(a => ({ id: a.id, name: a.name, own: mine(a), when: a.when || {} }));
  awards.forEach(a => {
    arr(a.when.flags).concat(arr(a.when.flagsAny)).forEach(f => F(f).need.push({ to: "a:" + a.id, via: null }));
    arr(a.when.flagsAbsent).forEach(f => F(f).absent.push({ to: "a:" + a.id, via: null }));
  });

  /* THE RULES SET AND READ SOME FLAGS THEMSELVES (lint's flag audit reads
     them the same way): a flag only the engine sets is not unsettable, and
     one only the interface reads is not a dead end. */
  const js = fs.readdirSync(path.join(root, "js")).filter(f => /\.js$/.test(f))
    .map(f => fs.readFileSync(path.join(root, "js", f), "utf8")).join("\n");
  const eng = fs.readFileSync(path.join(root, "js", "engine.js"), "utf8");
  for (const m of eng.matchAll(/flags(?:\.([A-Za-z_]\w*)|\[["']([\w]+)["']\])\s*=[^=]/g))
    F(m[1] || m[2]).set.push({ from: "rules", via: null });
  Object.keys(flags).forEach(f => {
    if (new RegExp("flags(\\." + f + "\\b|\\[[\"']" + f + "[\"']\\])").test(js)) flags[f].rules = true;
  });

  /* flag edges: every writer of a flag to every reader of it */
  Object.keys(flags).forEach(f => {
    const g = flags[f];
    const at = r => r.via != null ? f + " (choice " + (r.via + 1) + ")" : f;
    g.set.forEach(w => g.need.forEach(r => { if (!/^a:/.test(r.to) && w.from !== "rules" && w.from !== "x:sandbox")
      edges.push({ from: w.from, to: r.to, kind: "flag", label: at(r), via: w.via }); }));
    g.set.forEach(w => g.absent.forEach(r => { if (!/^a:/.test(r.to) && w.from !== "rules" && w.from !== "x:sandbox")
      edges.push({ from: w.from, to: r.to, kind: "shuts", label: at(r), via: w.via }); }));
  });
  const real = edges.filter(e => nodes.has(e.from) && nodes.has(e.to) && e.from !== e.to);
  const broken = edges.filter(e => !nodes.has(e.from) || !nodes.has(e.to))
    .filter(e => !/^x:|^rules$/.test(e.from));

  /* THE LOOSE ENDS */
  const incoming = key => real.some(e => e.to === key && /queue|answer|breach/.test(e.kind));
  const loose = [];
  /* An event setup names in an `on…` hook is queued by the rules
     (setup.onPartnerWithdraws, design/38 §3). */
  const hooked = new Set(Object.keys(K.setup || {}).filter(k => /^on[A-Z]/.test(k))
    .map(k => K.setup[k]).filter(v => typeof v === "string"));
  K.events.forEach(e => {
    if (e.queuedOnly && !incoming("e:" + e.id) && !hooked.has(e.id))
      loose.push({ key: "e:" + e.id, what: "queued only, and nothing queues it" });
    arr((e.when || {}).flags).forEach(f => { if (!flags[f].set.length)
      loose.push({ key: "e:" + e.id, what: "waits on " + f + ", which nothing sets" }); });
  });
  (K.settlements || []).forEach(x => arr((x.when || {}).flags).forEach(f => { if (!flags[f].set.length)
    loose.push({ key: "t:" + x.id, what: "waits on " + f + ", which nothing sets" }); }));
  (K.initiatives || []).forEach(x => { if (x.event && !nodes.has("e:" + x.event))
    loose.push({ key: "i:" + x.id, what: "answers with " + x.event + ", which this campaign does not have" }); });
  broken.forEach(e => loose.push({ key: e.from, what: e.kind + " names " + e.to.replace(/^\w:/, "") + ", which this campaign does not have" }));
  const deadEnds = Object.keys(flags).filter(f => flags[f].set.length && !flags[f].need.length &&
    !flags[f].absent.length && !flags[f].rules).sort();

  return { id, K, nodes, edges: real, flags, awards, loose, deadEnds };
}

/* ---------- the graph: the campaign's own story and what it touches ---------- */
function layout(M) {
  const own = [...M.nodes.values()].filter(n => n.own).map(n => n.key);
  const keep = new Set(own);
  /* One step out, so a campaign's beats are seen landing in the world: the
     world's entries its story writes to or reads from. The world's view
     has no own story, so it draws the chains among its own events. */
  if (own.length) M.edges.forEach(e => {
    if (e.kind === "shuts") return;
    if (keep.has(e.from) && own.indexOf(e.to) < 0 && own.indexOf(e.from) >= 0) keep.add(e.to);
    if (own.indexOf(e.to) >= 0 && own.indexOf(e.from) < 0) keep.add(e.from);
  });
  else M.edges.forEach(e => { if (/queue|answer|seen|breach/.test(e.kind)) { keep.add(e.from); keep.add(e.to); } });
  /* A HUB IS NOT DRAWN AS A FAN. The sandbox's test console sets flags half
     the story reads, and forty lines out of one box hide every other line on
     the page; so a node whose flags reach more than HUB entries keeps its
     card's full list and draws none of them here, and says how many. */
  const HUB = 5, fan = {};
  M.edges.forEach(e => { if (e.kind === "flag") (fan[e.from] = fan[e.from] || new Set()).add(e.to); });
  const hubs = new Set(Object.keys(fan).filter(k => fan[k].size > HUB));
  const ks = [...keep];
  const E = M.edges.filter(e => keep.has(e.from) && keep.has(e.to) && e.kind !== "shuts" &&
                                !(e.kind === "flag" && hubs.has(e.from)));
  /* merge parallel edges: one line per pair and kind, labels joined */
  const pair = new Map();
  E.forEach(e => {
    const k = e.from + ">" + e.to + ">" + e.kind;
    if (!pair.has(k)) pair.set(k, Object.assign({}, e, { labels: new Set([e.label]) }));
    else pair.get(k).labels.add(e.label);
  });
  const L = [...pair.values()];

  /* layers: longest path from the sources, back edges ignored */
  const out = {}, inn = {};
  ks.forEach(k => { out[k] = []; inn[k] = []; });
  const state = {}, back = new Set();
  const dfs = k => { state[k] = 1; out[k].forEach(e => {
      if (state[e.to] === 1) back.add(e); else if (!state[e.to]) dfs(e.to); }); state[k] = 2; };
  L.forEach(e => { out[e.from].push(e); inn[e.to].push(e); });
  /* start from what the story opens with: dated and prologue beats first */
  const startOrder = ks.slice().sort((a, b) => order(M, a) - order(M, b));
  startOrder.forEach(k => { if (!state[k]) dfs(k); });
  const layer = {};
  const depth = k => {
    if (layer[k] != null) return layer[k];
    layer[k] = 0;
    const ps = inn[k].filter(e => !back.has(e));
    layer[k] = ps.length ? Math.max(...ps.map(e => depth(e.from) + 1)) : 0;
    return layer[k];
  };
  ks.forEach(depth);
  const cols = [];
  ks.forEach(k => (cols[layer[k]] = cols[layer[k]] || []).push(k));
  cols.forEach(c => c.sort((a, b) => order(M, a) - order(M, b)));
  /* two barycentre sweeps, so a line crosses as few others as it can */
  const posOf = {};
  const index = () => cols.forEach(c => c.forEach((k, i) => { posOf[k] = i; }));
  index();
  for (let sweep = 0; sweep < 4; sweep++) {
    cols.forEach((c, ci) => {
      if (!ci) return;
      const bc = k => { const ps = inn[k].filter(e => layer[e.from] < ci).map(e => posOf[e.from]);
                        return ps.length ? ps.reduce((a, b) => a + b, 0) / ps.length : posOf[k]; };
      c.sort((a, b) => bc(a) - bc(b)); index();
    });
  }
  const W = 250, H = 46, GX = 90, GY = 14, PAD = 20;
  const xy = {};
  cols.forEach((c, ci) => c.forEach((k, ri) => { xy[k] = { x: PAD + ci * (W + GX), y: PAD + ri * (H + GY) }; }));
  const width = PAD * 2 + cols.length * (W + GX) - GX;
  const height = PAD * 2 + Math.max(1, ...cols.map(c => c.length)) * (H + GY) - GY;
  return { ks, L, xy, W, H, width, height, back, hubs, fan };
}
/* An event with no chapter is eligible in every chapter (the engine skips
   only a chapter that does not match); a prologue beat with none is the
   first chapter's. */
const chapterOf = x => x.chapter != null ? x.chapter : x.prologue ? 1 : 9;
const chapterName = c => c === 9 ? "Any chapter" : "Chapter " + c;
function order(M, key) {
  const n = M.nodes.get(key);
  if (!n) return 1e9;
  const x = n.x;
  if (n.kind === "event") return chapterOf(x) * 1e6 + (x.prologue ? x.prologue * 10 : x.at ? x.at * 100 : 5e5 - (x.weight || 50)) + (n.pos || 0) / 1000;
  return ({ opening: 0, initiative: 3e6, bill: 2.5e6, settlement: 3.5e6, instrument: 2.8e6 }[n.kind] || 4e6);
}
const KIND_LABEL = { event: "event", initiative: "initiative", bill: "bill", settlement: "result",
                     instrument: "order", opening: "opening" };
function svg(M) {
  const G = layout(M);
  if (!G.ks.length) return "<p class=\"quiet\">Nothing to draw.</p>";
  const parts = [];
  parts.push(`<svg class="graph" viewBox="0 0 ${G.width} ${G.height}" width="${G.width}" height="${G.height}" role="img" aria-label="The story's wiring">`);
  parts.push(`<defs>${["queue", "answer", "flag", "seen", "result", "bill", "stage", "breach", "makes"].map(k =>
    `<marker id="ah-${k}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" class="ah ${k}"/></marker>`).join("")}</defs>`);
  G.L.forEach(e => {
    const a = G.xy[e.from], b = G.xy[e.to];
    const x1 = a.x + G.W, y1 = a.y + G.H / 2, x2 = b.x, y2 = b.y + G.H / 2;
    let d;
    if (x2 > x1) { const m = (x1 + x2) / 2; d = `M${x1},${y1} C${m},${y1} ${m},${y2} ${x2},${y2}`; }
    else { const dy = Math.max(a.y, b.y) + G.H + 24; d = `M${a.x + G.W / 2},${a.y + G.H} C${a.x + G.W / 2},${dy} ${b.x + G.W / 2},${dy} ${b.x + G.W / 2},${b.y + G.H}`; }
    const t = [...e.labels].join(", ");
    parts.push(`<path d="${d}" class="edge ${e.kind}" marker-end="url(#ah-${e.kind})"><title>${esc(e.from.slice(2) + " \u2192 " + e.to.slice(2) + " (" + e.kind + ": " + t + ")")}</title></path>`);
  });
  G.ks.forEach(k => {
    const n = M.nodes.get(k), p = G.xy[k];
    const x = n.x, badge = (G.hubs.has(k) ? "flags \u2192 " + G.fan[k].size + "  " : "") +
      (n.kind === "event" ? (x.prologue ? "P" + x.prologue : x.at ? "@" + x.at : x.queuedOnly ? "queued" : "w" + (x.weight || 50)) : KIND_LABEL[n.kind]);
    /* the title gives way to the badge: about 6.3px a character at this size */
    const room = Math.floor((G.W - 24 - badge.length * 6.8) / 6.3);
    const title = String(n.title).length > room ? String(n.title).slice(0, room - 1) + "\u2026" : n.title;
    parts.push(`<a href="#${esc(k)}"><g class="node ${n.kind}${n.own ? " own" : ""}"><rect x="${p.x}" y="${p.y}" width="${G.W}" height="${G.H}" rx="4"/>` +
      `<text x="${p.x + 8}" y="${p.y + 18}" class="nid">${esc(n.id.length > 24 ? n.id.slice(0, 23) + "\u2026" : n.id)}</text>` +
      `<text x="${p.x + G.W - 8}" y="${p.y + 36}" class="nbadge" text-anchor="end">${esc(badge)}</text>` +
      `<text x="${p.x + 8}" y="${p.y + 36}" class="ntitle">${esc(title)}</text><title>${esc(n.title)}</title></g></a>`);
  });
  parts.push("</svg>");
  return parts.join("\n");
}

/* ---------- the page ---------- */
function linkTo(M, key) {
  const n = M.nodes.get(key);
  if (!n) return key === "rules" ? "<i>the rules</i>" : key === "x:sandbox" ? "<i>the sandbox</i>" :
                 /^a:/.test(key) ? "award " + esc(key.slice(2)) : esc(key.replace(/^\w:/, ""));
  return `<a href="#${esc(key)}" class="ln ${n.kind}${n.own ? " own" : ""}">${esc(n.id)}</a>`;
}
function flowLists(M, key) {
  const from = M.edges.filter(e => e.to === key), to = M.edges.filter(e => e.from === key);
  const li = (list, end) => {
    const g = new Map();
    list.forEach(e => { const k = e[end] + "|" + e.kind; if (!g.has(k)) g.set(k, { e, labels: new Set() }); g.get(k).labels.add(e.label); });
    return [...g.values()].map(({ e, labels }) => `<li><span class="k ${e.kind}">${e.kind}</span> ${linkTo(M, e[end])} <span class="lab">${esc([...labels].join(", "))}</span></li>`).join("");
  };
  return (from.length ? `<div class="flow"><h5>Comes from</h5><ul>${li(from, "from")}</ul></div>` : "") +
         (to.length ? `<div class="flow"><h5>Leads to</h5><ul>${li(to, "to")}</ul></div>` : "");
}
function badges(n) {
  const x = n.x, b = [];
  if (n.own) b.push(`<span class="b own">${esc(arr(x.campaign).join(", "))}</span>`);
  if (n.kind === "event") {
    b.push(`<span class="b">${chapterOf(x) === 9 ? "any chapter" : "chapter " + chapterOf(x)}</span>`);
    if (x.prologue) b.push(`<span class="b">prologue ${x.prologue}</span>`);
    if (x.at) b.push(`<span class="b">dated ${x.at}</span>`);
    if (x.queuedOnly) b.push(`<span class="b">queued only</span>`);
    else if (!x.prologue) b.push(`<span class="b">weight ${x.weight || 50}</span>`);
    if (x.once) b.push(`<span class="b">once</span>`);
    if (x.maxFires) b.push(`<span class="b">at most ${x.maxFires}</span>`);
  }
  if (n.kind === "settlement") b.push(`<span class="b">${x.crisis ? "crisis result" : "answer"}</span>`, `<span class="b">rank ${x.rank}</span>`);
  if (n.kind === "bill") b.push(`<span class="b">opens at ${esc(String(x.stage).replace(/_/g, " "))}</span>`);
  return b.join("");
}
function card(M, n) {
  const x = n.x, gate = whenText(x.when);
  let body = "";
  if (gate) body += `<p class="gate"><b>When</b> ${esc(gate)}</p>`;
  if (n.kind === "event") {
    if (effectsText(x.effects)) body += `<p class="gate"><b>On arrival</b> ${esc(effectsText(x.effects))}</p>`;
    body += `<ol class="choices">${(x.choices || []).map(c => `<li><span class="cl">${esc(c.label)}</span>` +
      (c.when ? ` <span class="cw">if ${esc(whenText(c.when))}</span>` : "") +
      (effectsText(c.effects) ? `<br><span class="ce">${esc(effectsText(c.effects))}</span>` : "") + `</li>`).join("")}</ol>`;
  }
  if (n.kind === "initiative") body += `<ol class="choices">${(x.tempo || []).map(t => `<li><span class="cl">${esc(t.label || "")}</span>, answered in ${t.after || 3}` +
      (t.when ? ` <span class="cw">if ${esc(whenText(t.when))}</span>` : "") +
      (effectsText(t.effects) ? `<br><span class="ce">${esc(effectsText(t.effects))}</span>` : "") + `</li>`).join("")}</ol>` +
      (x.event ? `<p class="gate"><b>Answered by</b> ${linkTo(M, "e:" + x.event)}</p>` : "");
  if (n.kind === "bill") body += (effectsText(x.onPass) ? `<p class="gate"><b>Carried</b> ${esc(effectsText(x.onPass))}</p>` : "") +
      (effectsText(x.onFail) ? `<p class="gate"><b>Lost</b> ${esc(effectsText(x.onFail))}</p>` : "");
  if ((n.kind === "instrument" || n.kind === "opening" || n.kind === "settlement") && effectsText(x.effects))
    body += `<p class="gate"><b>Does</b> ${esc(effectsText(x.effects))}</p>`;
  return `<details class="card ${n.kind}${n.own ? " own" : " world"}" id="${esc(n.key)}"${n.own ? " open" : ""}>` +
    `<summary><code>${esc(n.id)}</code> <span class="t">${esc(n.title)}</span> ${badges(n)}</summary>` +
    `<div class="cb">${body}${flowLists(M, n.key)}</div></details>`;
}

function page(M, all) {
  const K = M.K;
  const nodes = [...M.nodes.values()];
  const own = nodes.filter(n => n.own);
  const admins = (T.all().administrations || []).filter(a => (a.campaign || a.id) === K.campaign);
  const name = M.id === "world" ? "The world" : (admins.find(a => a.id === M.id) || {}).id || M.id;
  const heading = M.id === "world" ? "The world's content, with no campaign" :
    "Campaign " + esc(K.campaign) + (M.id !== K.campaign ? " (as " + esc(M.id) + " plays it)" : "");
  const events = nodes.filter(n => n.kind === "event");
  const byCh = {};
  events.slice().sort((a, b) => order(M, a.key) - order(M, b.key)).forEach(n => (byCh[chapterOf(n.x)] = byCh[chapterOf(n.x)] || []).push(n));
  const others = k => nodes.filter(n => n.kind === k).sort((a, b) => (b.own - a.own) || String(a.id).localeCompare(b.id));
  const flagRows = Object.keys(M.flags).sort().map(f => {
    const g = M.flags[f];
    const who = list => [...new Set(list.map(x => x.from || x.to))].map(k => linkTo(M, k)).join(", ");
    const ownF = [...g.set, ...g.clear].map(x => x.from).concat([...g.need, ...g.absent].map(x => x.to))
      .some(k => (M.nodes.get(k) || {}).own);
    const status = !g.set.length && (g.need.length) ? `<span class="bad">nothing sets it</span>` :
                   M.deadEnds.indexOf(f) >= 0 ? `<span class="warn">nothing reads it</span>` : "";
    return `<tr class="${ownF ? "own" : "world"}"><td><code>${esc(f)}</code></td><td>${who(g.set)}</td><td>${who(g.clear)}</td>` +
      `<td>${who(g.need)}${g.rules ? (g.need.length ? ", " : "") + "<i>the interface or rules</i>" : ""}</td><td>${who(g.absent)}</td><td>${status}</td></tr>`;
  }).join("");
  const counts = `${events.filter(n => n.own).length} events, ${own.filter(n => n.kind === "initiative").length} initiatives, ` +
    `${own.filter(n => n.kind === "bill").length} bills and ${own.filter(n => n.kind === "settlement").length} results of its own`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Story map: ${esc(name)}</title>
<style>
:root{--bg:#f6f4ef;--panel:#fffdf8;--ink:#1d1b17;--dim:#6b665c;--line:#d9d3c7;--own:#8a5a00;--ownbg:#fff3d6;
--queue:#2f6fb3;--answer:#2f6fb3;--flag:#3b8a4a;--seen:#7a5fb0;--result:#b0432f;--bill:#9a6a12;--stage:#9a6a12;--breach:#b0432f;--makes:#6b665c;--shuts:#b0432f;--bad:#b0432f;--warn:#8a5a00}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#15140f;--panel:#1e1c16;--ink:#ece6d8;--dim:#a39c8c;--line:#3a362c;--own:#f0b848;--ownbg:#3a2e12;
--queue:#6fa8e6;--answer:#6fa8e6;--flag:#6cc27c;--seen:#b39ae6;--result:#e8806b;--bill:#e0b060;--stage:#e0b060;--breach:#e8806b;--makes:#a39c8c;--shuts:#e8806b;--bad:#e8806b;--warn:#f0b848}}
:root[data-theme="dark"]{--bg:#15140f;--panel:#1e1c16;--ink:#ece6d8;--dim:#a39c8c;--line:#3a362c;--own:#f0b848;--ownbg:#3a2e12;
--queue:#6fa8e6;--answer:#6fa8e6;--flag:#6cc27c;--seen:#b39ae6;--result:#e8806b;--bill:#e0b060;--stage:#e0b060;--breach:#e8806b;--makes:#a39c8c;--shuts:#e8806b;--bad:#e8806b;--warn:#f0b848}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 Georgia,"Times New Roman",serif}
header,main{max-width:1180px;margin:0 auto;padding:16px}
h1{font-size:26px;margin:8px 0 4px}h2{font-size:19px;margin:28px 0 8px;border-bottom:1px solid var(--line);padding-bottom:4px}
h3{font-size:16px;margin:18px 0 6px;color:var(--dim)}h5{margin:6px 0 2px;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--dim)}
code{font:13px/1.3 ui-monospace,Menlo,Consolas,monospace}
.quiet,.lede{color:var(--dim)}nav a{margin-right:14px}a{color:inherit}
.views a{margin-right:10px}
.graphwrap{overflow:auto;border:1px solid var(--line);background:var(--panel);border-radius:6px;max-height:78vh}
svg.graph{display:block;font:12px ui-monospace,Menlo,Consolas,monospace}
.node rect{fill:var(--panel);stroke:var(--line)}.node.own rect{fill:var(--ownbg);stroke:var(--own)}
.node .nid{fill:var(--ink);font-weight:bold}.node .ntitle{fill:var(--dim);font-family:Georgia,serif;font-size:12px}.node .nbadge{fill:var(--dim);font-size:11px}
.node.settlement rect{stroke-dasharray:4 2}.node.initiative rect{stroke-width:2}
.edge{fill:none;stroke-width:1.6;opacity:.85}
.edge.queue,.edge.answer{stroke:var(--queue)}.edge.flag{stroke:var(--flag);stroke-dasharray:6 3}.edge.seen{stroke:var(--seen);stroke-dasharray:2 3}
.edge.result{stroke:var(--result)}.edge.bill,.edge.stage{stroke:var(--bill)}.edge.breach{stroke:var(--breach);stroke-dasharray:8 3}.edge.makes{stroke:var(--makes)}
.ah.queue,.ah.answer{fill:var(--queue)}.ah.flag{fill:var(--flag)}.ah.seen{fill:var(--seen)}.ah.result{fill:var(--result)}.ah.bill,.ah.stage{fill:var(--bill)}.ah.breach{fill:var(--breach)}.ah.makes{fill:var(--makes)}
.legend span{display:inline-block;margin-right:14px;font-size:13px}.legend i{display:inline-block;width:26px;height:0;border-top:2px solid;vertical-align:middle;margin-right:5px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:6px;margin:6px 0;padding:0}
.card.own{border-left:4px solid var(--own)}
.card>summary{cursor:pointer;padding:8px 10px;list-style:none}.card>summary::-webkit-details-marker{display:none}
.card .t{font-weight:bold}.cb{padding:0 12px 10px}
.b{display:inline-block;font:11px ui-monospace,Menlo,Consolas,monospace;border:1px solid var(--line);border-radius:3px;padding:0 5px;margin:0 2px;color:var(--dim)}
.b.own{border-color:var(--own);color:var(--own)}
.gate{margin:4px 0}.choices{margin:6px 0;padding-left:22px}.cl{font-weight:bold}.cw{color:var(--dim);font-style:italic}.ce{font:12.5px/1.4 ui-monospace,Menlo,Consolas,monospace;color:var(--dim)}
.flow{display:inline-block;vertical-align:top;min-width:260px;margin-right:24px}.flow ul{margin:0;padding-left:0;list-style:none}.flow li{margin:2px 0}
.k{display:inline-block;min-width:54px;font:11px ui-monospace,Menlo,Consolas,monospace;color:var(--dim)}
.k.queue,.k.answer{color:var(--queue)}.k.flag{color:var(--flag)}.k.seen{color:var(--seen)}.k.result,.k.breach,.k.shuts{color:var(--result)}.k.bill,.k.stage{color:var(--bill)}
.lab{color:var(--dim);font-size:13px}.ln.own{color:var(--own);font-weight:bold}
table{border-collapse:collapse;width:100%;background:var(--panel);font-size:13.5px}th,td{border:1px solid var(--line);padding:4px 6px;text-align:left;vertical-align:top}
tr.own td:first-child{border-left:4px solid var(--own)}.bad{color:var(--bad);font-weight:bold}.warn{color:var(--warn)}
.tablewrap{overflow-x:auto}
body.onlyown .world{display:none}
label.toggle{display:inline-block;margin:6px 0;font-size:14px}
@media (max-width:640px){header,main{padding:12px 16px}.flow{min-width:0;display:block}}
</style></head>
<body${own.length ? ' class="onlyown"' : ""}>
<header>
<p class="views">${all.map(v => v.id === M.id ? `<b>${esc(v.id)}</b>` : `<a href="${esc(v.id)}.html">${esc(v.id)}</a>`).join(" ")}</p>
<h1>Story map: ${esc(name)}</h1>
<p class="lede">${heading}. ${own.length ? counts + ", played beside " + (events.length - events.filter(n => n.own).length) + " of the world's events." : events.length + " events."}
Generated from content by <code>npm run storymap</code>; redraw it after an edit.</p>
<nav><a href="#graph">The wiring</a><a href="#chapters">Chapters</a><a href="#others">Initiatives, bills, results</a><a href="#flags">Flags</a><a href="#loose">Loose ends</a></nav>
${own.length ? `<label class="toggle"><input type="checkbox" id="onlyown" checked> Only this campaign's own entries</label>` : ""}
</header>
<main>
<h2 id="graph">The wiring</h2>
<p class="quiet">${own.length ? "The campaign's own entries (outlined) and the world's entries they touch, laid out left to right by what leads to what." : "The world's chains: everything a queue, an answer, a breach or an <i>after</i> joins."} Click a box for its card.</p>
<p class="legend"><span><i style="border-color:var(--queue)"></i>queues or answers</span><span><i style="border-color:var(--flag);border-top-style:dashed"></i>sets a flag it reads</span><span><i style="border-color:var(--seen);border-top-style:dotted"></i>comes after</span><span><i style="border-color:var(--result)"></i>reads the result</span><span><i style="border-color:var(--bill)"></i>moves a bill</span><span><i style="border-color:var(--breach);border-top-style:dashed"></i>if a promise is broken</span></p>
<div class="graphwrap">${svg(M)}</div>

<h2 id="chapters">Chapters</h2>
${Object.keys(byCh).map(Number).sort((a, b) => a - b).map(c => `<h3 class="${byCh[c].some(n => n.own) ? "" : "world"}">${esc(chapterName(c))}</h3>` + byCh[c].map(n => card(M, n)).join("")).join("\n")}

<h2 id="others">Initiatives, bills, results</h2>
<h3>Initiatives</h3>${others("initiative").map(n => card(M, n)).join("")}
<h3>Bills</h3>${others("bill").map(n => card(M, n)).join("")}
<h3>Results</h3>${others("settlement").map(n => card(M, n)).join("")}
${M.nodes.has("o:opening") ? `<h3>Opening</h3>${card(M, M.nodes.get("o:opening"))}` : ""}

<h2 id="flags">Flags</h2>
<p class="quiet">Every flag in play: who sets it, who clears it, whose gate needs it, whose gate it shuts. Awards read flags too; they are named, not linked.</p>
<div class="tablewrap"><table><thead><tr><th>Flag</th><th>Set by</th><th>Cleared by</th><th>Needed by</th><th>Shuts</th><th></th></tr></thead><tbody>${flagRows}</tbody></table></div>

<h2 id="loose">Loose ends</h2>
${M.loose.length ? `<ul>${M.loose.map(l => `<li class="${(M.nodes.get(l.key) || {}).own ? "own" : "world"}">${linkTo(M, l.key)}: ${esc(l.what)}</li>`).join("")}</ul>` : `<p class="quiet">None: every queued event is queued by something, and every gate waits on a flag something sets.</p>`}
${M.deadEnds.length ? `<p class="quiet">Set and never read (a consequence a choice promises and the game never delivers, or one waiting for its reader): ${M.deadEnds.map(f => `<code>${esc(f)}</code>`).join(", ")}.</p>` : ""}
</main>
<script>
(function(){var b=document.getElementById("onlyown");if(!b)return;
function set(){document.body.classList.toggle("onlyown",b.checked);}
b.addEventListener("change",set);set();
window.addEventListener("hashchange",function(){var t=document.getElementById(decodeURIComponent(location.hash.slice(1)));
if(t&&t.classList.contains("world")&&b.checked){b.checked=false;set();t.scrollIntoView();}
if(t&&t.tagName==="DETAILS")t.open=true;});})();
</script>
</body></html>
`;
}

/* ---------- the command ---------- */
const views = T.views();
const maps = views.map(v => build(v.C, v.id));
const check = process.argv.includes("--check");
let bad = 0;
maps.forEach(M => {
  let html = null, err = null;
  try { html = page(M, views); } catch (e) { err = e; }
  const own = [...M.nodes.values()].filter(n => n.own);
  const drawn = html && own.every(n => html.indexOf('id="' + n.key + '"') >= 0);
  if (err || !drawn) bad++;
  console.log((err || !drawn ? "  FAIL " : "  ok   ") + M.id.padEnd(10) +
    (err ? " " + err.message : " " + M.nodes.size + " entries, " + M.edges.length + " links, " +
     own.length + " its own, " + M.loose.length + " loose ends"));
  if (!check && html) {
    const dir = path.join(root, "storymap");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, M.id + ".html"), html, "utf8");
  }
});
if (!check) {
  fs.writeFileSync(path.join(root, "storymap", "index.html"),
    `<!doctype html><meta charset="utf-8"><title>Story maps</title><meta http-equiv="refresh" content="0; url=${esc(views[1] ? views[1].id : "world")}.html">` +
    `<p>${views.map(v => `<a href="${esc(v.id)}.html">${esc(v.id)}</a>`).join(" \u00b7 ")}</p>`, "utf8");
  console.log("\nwritten to storymap/ (open storymap/index.html)");
}
if (bad) { console.log("\n" + bad + " STORY MAP FAILURES"); process.exit(1); }
if (check) console.log("\nevery story map draws");
