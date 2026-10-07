/* =============================================================
   THE WORLD — the globe, and the map it can become.

   Route B of the design: an ORTHOGRAPHIC projection on SVG, not WebGL.
   A sphere with drag-to-turn and a slow spin, country outlines from
   Natural Earth, the anchors of the twelve elevators and a stub of
   tether standing off each one — and, one projection away, the same
   renderer as a flat map. The toggle is a projection change and not a
   second implementation, which is the whole argument for doing it this
   way: no texture to vendor, no CORS under file://, a hundred kilobytes
   instead of a megabyte, and it is drawn in the terminal's own hand.

   WHAT IT DELIBERATELY IS NOT. It does not simulate orbits. A station is
   not at a point on Earth and pretending otherwise would be a lie the
   rest of the game does not tell; the stations are counted, named and
   priced in text, and the globe is the GROUND. What it fixes is the one
   thing the fiction has asserted twelve times and never shown: the
   anchors stand on somebody else's soil.
   ============================================================= */

const World = (function () {
  "use strict";
  let st = null, C = null;
  const D2R = Math.PI / 180;
  /* THE GLOBE IS STILL UNTIL IT IS ASKED TO TURN. It spun on arrival, which
     moves the thing the player is trying to click and makes the first
     impression of the tab a toy rather than a map. Spinning is one button
     away and is remembered for the session once asked for. */
  const view = { lat: 14, lng: 18, mode: "globe", auto: false, sel: null,
                 anchor: null, zoom: 1 };
  let W = 720, H = 480, R = 200;

  /* THREE OUTLINES CAME WITHOUT A CODE. Natural Earth leaves the ISO field
     blank for France, Norway and Kosovo (the first two for their overseas
     parts, the third for its status), so their paths were drawn with an
     empty `data-iso` and a click on them selected nothing. France's outline
     carries French Guiana, where the Kourou anchor stands, so the host of a
     tether could not be selected from its own ground. The file is generated
     and is not edited by hand; the codes are given here, once, as it loads.
     Northern Cyprus and Somaliland stay blank on purpose: the Commonwealth
     has no view on either, and a code would claim one. */
  const ISO_BY_NAME = { France: "FRA", Norway: "NOR", Kosovo: "XKX" };
  if (typeof WORLD_COUNTRIES !== "undefined")
    WORLD_COUNTRIES.forEach(c => { if (!c.i && ISO_BY_NAME[c.n]) c.i = ISO_BY_NAME[c.n]; });

  function set(state, content) { st = state; C = content; }

  /* ZOOM WAS PLUMBED AND NEVER DRIVEN. `view.zoom` is read in four places —
     the projection, the ocean's radius and both tether lengths — and was
     written nowhere, so it sat at 1 for the life of the file and the globe
     had no magnification at all. On a small screen that is most of what made
     the tab feel awkward: São Tomé's anchor and Gabon's are four pixels
     apart at zoom 1 and there was no way to separate them.

     It scales about the CENTRE, which is why it composes with the drag: zoom
     in, then turn the thing you want under the middle. The floor is 1 because
     below it the drawing is smaller than its own frame. */
  const ZOOM_MIN = 1, ZOOM_MAX = 4;
  function zoom(z) {
    if (z == null) return view.zoom;
    view.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(z * 100) / 100));
    return view.zoom;
  }
  function zoomBy(f) { return zoom((view.zoom || 1) * f); }
  function canZoom(f) {
    const z = (view.zoom || 1) * f;
    return z >= ZOOM_MIN - 1e-9 && z <= ZOOM_MAX + 1e-9 && Math.abs(z - view.zoom) > 1e-9;
  }
  function mode() { return view.mode; }
  function toggle() {
    view.mode = view.mode === "globe" ? "map" : "globe";
    /* SWITCHING TO THE GLOBE USED TO START IT SPINNING, which quietly
       overrode the player's own choice every time they changed view. The
       mode and the motion are two decisions and only one of them is being
       taken here. */
    return view.mode;
  }
  function selected() { return view.sel; }
  /* THE SELECTION NOTIFIES, and it is the same notification a click gives. A
     caller that selects from outside (a test, a link) must redraw the panel
     beside the globe exactly as a click would, or the drawing and the window
     disagree — which is precisely what happened when a harness set the
     selection directly and the reference column went on showing the roster. */
  let onChange = null;
  function select(iso) {
    view.body = null; view.anchor = null;
    view.sel = (iso && iso !== view.sel) ? iso : (iso === view.sel ? null : iso);
    if (onChange) onChange();
    return view.sel;
  }
  /* THE CAMPAIGN'S SUBJECT IS SELECTABLE TOO. A foreign body is not a country
     and not an anchor: it is the thing the session is about, and clicking its
     mark opens it in the same window a country uses. */
  /* AN ANCHOR IS ITS OWN SUBJECT. Clicking the mark selected its HOST, which
     is a different thing: a tether has a name, a formal designation, a site,
     the station it serves and whether the Commonwealth holds it, leases it or
     does not have it — none of which is a fact about Brazil. Three kinds of
     selection now, and each clears the other two, because the window beside
     the globe shows one thing at a time. */
  function selectAnchor(id) {
    view.sel = null; view.body = null;
    view.anchor = (id && id !== view.anchor) ? id : (id === view.anchor ? null : id);
    if (onChange) onChange();
    return view.anchor;
  }
  function selectedAnchor() { return view.anchor || null; }

  function selectBody(id) {
    view.sel = null; view.anchor = null;
    view.body = (id && id !== view.body) ? id : (id === view.body ? null : id);
    if (onChange) onChange();
    return view.body;
  }
  function selectedBody() { return view.body || null; }
  function onSelect(fn) { onChange = fn; }
  function auto(on) { view.auto = on === undefined ? !view.auto : !!on; return view.auto; }

  /* ---------- projection ---------- */
  /* Orthographic: the unit sphere turned to the view, then flattened. The
     visible hemisphere is cos(c) > 0, c the angular distance from the centre
     of the view, and that sign is the only clipping the globe needs. */
  function cosc(lng, lat) {
    const lam = (lng - view.lng) * D2R, phi = lat * D2R, phi0 = view.lat * D2R;
    return Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lam);
  }
  function project(lng, lat) {
    if (view.mode === "map") {
      let dl = lng - view.lng;
      while (dl > 180) dl -= 360;
      while (dl < -180) dl += 360;
      const k = W / 360;
      return { x: W / 2 + dl * k, y: H / 2 - lat * k, vis: true, lng: lng, lat: lat };
    }
    const lam = (lng - view.lng) * D2R, phi = lat * D2R, phi0 = view.lat * D2R;
    const x = R * Math.cos(phi) * Math.sin(lam);
    const y = R * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lam));
    return { x: W / 2 + x * view.zoom, y: H / 2 - y * view.zoom, vis: cosc(lng, lat) > 0 };
  }
  /* Where the segment a->b crosses the limb, by bisection. Twelve halvings is
     half a kilometre at this scale, which is finer than the path is drawn. */
  function limb(a, b) {
    let lo = 0, hi = 1;
    const av = cosc(a[0], a[1]) > 0;
    for (let i = 0; i < 12; i++) {
      const m = (lo + hi) / 2;
      const v = cosc(a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m) > 0;
      if (v === av) lo = m; else hi = m;
    }
    const m = (lo + hi) / 2;
    return [a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m];
  }
  const pt = p => p.x.toFixed(1) + " " + p.y.toFixed(1);

  /* A ring as an SVG path, broken at the limb. Every edge is walked and the
     path is lifted whenever it crosses: a coast that runs off the far side of
     the world has to stop, or the fill closes across the middle of the globe. */
  function ringD(ring) {
    if (!ring || ring.length < 3) return "";
    let d = "", pen = false;
    const n = ring.length;
    for (let i = 0; i < n; i++) {
      const a = ring[i], b = ring[(i + 1) % n];
      if (view.mode === "map") {
        const p = project(b[0], b[1]);
        const jump = Math.abs(p.x - project(a[0], a[1]).x) > W / 3;
        d += (pen && !jump ? "L" : "M") + pt(p);
        pen = true;
        continue;
      }
      const av = cosc(a[0], a[1]) > 0, bv = cosc(b[0], b[1]) > 0;
      if (av && bv) { d += (pen ? "L" : "M") + pt(project(b[0], b[1])); pen = true; }
      else if (av && !bv) { d += (pen ? "L" : "M") + pt(project(...limb(a, b))); pen = false; }
      else if (!av && bv) {
        d += "M" + pt(project(...limb(b, a)));
        d += "L" + pt(project(b[0], b[1]));
        pen = true;
      }
    }
    return d;
  }

  /* A COUNTRY'S FILL, CLIPPED TO THE NEAR SIDE. `ringD` lifts the pen where a
     coast runs off the far side and starts again where it comes back, and an
     SVG fill closes each piece with a straight chord. A country that crosses
     the horizon (Russia, Canada, Antarctica) lost the sliver between that chord
     and the horizon, which showed as a dark wedge cut through the land. The
     boundary of the visible part follows the horizon where the coast leaves
     it: each visible run is joined to the next entry point met travelling
     round the limb with the country on the same hand, and the loop is closed
     there.

     Which hand is the ring's own: a ring that winds counter-clockwise on the
     map has its inside on the left, and so does the visible disc when it is
     walked counter-clockwise. A ring wholly on the near side is drawn as it
     stands, and one wholly on the far side is not drawn. (A ring that wraps the
     entire visible disc without a vertex on it would need its own case; no
     outline in the data does.) */
  const WIND = typeof WeakMap === "function" ? new WeakMap() : null;
  function winding(ring) {
    if (WIND && WIND.has(ring)) return WIND.get(ring);
    let a = 0, px = ring[0][0], py = ring[0][1], net = 0, south = 0;
    for (let i = 1; i <= ring.length; i++) {
      const c = ring[i % ring.length];
      let x = c[0];
      while (x - px > 180) x -= 360;
      while (x - px < -180) x += 360;
      a += px * c[1] - x * py;
      net += x - px; south += c[1];
      px = x; py = c[1];
    }
    /* A ring that goes right round the Earth encloses a pole, and the area it
       sweeps on the flat map says nothing of which side is the inside: the
       inside is the pole's. Travelling east round the south pole keeps it on
       the right hand, and round the north pole on the left. Antarctica is the
       only outline in the data that does this. */
    const w = Math.abs(net) > 180 ? (net > 0 === south < 0 ? -1 : 1) : a >= 0 ? 1 : -1;
    if (WIND) WIND.set(ring, w);
    return w;
  }
  function ringFill(ring) {
    if (!ring || ring.length < 3) return "";
    if (view.mode === "map") return ringD(ring);
    const n = ring.length, cx = W / 2, cy = H / 2, Rz = R * view.zoom;
    const vis = ring.map(c => cosc(c[0], c[1]) > 0);
    const near = vis.reduce((k, v) => k + (v ? 1 : 0), 0);
    if (!near) return "";
    /* a crossing, put exactly on the circle so the arc and the coast meet */
    const onLimb = (a, b) => {
      const q = project(...limb(a, b));
      const dx = q.x - cx, dy = q.y - cy, m = Math.hypot(dx, dy) || 1;
      return { x: cx + dx / m * Rz, y: cy + dy / m * Rz };
    };
    if (near === n) {
      let d = "";
      ring.forEach((c, i) => { d += (i ? "L" : "M") + pt(project(c[0], c[1])); });
      return d + "Z";
    }
    const i0 = vis.indexOf(false), runs = [];
    let run = null;
    for (let k = 0; k < n; k++) {
      const ia = (i0 + k) % n, ib = (i0 + k + 1) % n, a = ring[ia], b = ring[ib];
      if (!vis[ia] && vis[ib]) run = [onLimb(b, a), project(b[0], b[1])];
      else if (vis[ia] && vis[ib]) { if (run) run.push(project(b[0], b[1])); }
      else if (vis[ia] && !vis[ib]) { if (run) { run.push(onLimb(a, b)); runs.push(run); run = null; } }
    }
    /* A run that never rises a pixel off the horizon is a sliver of coast
       clipping the edge of the disc. It covers under a pixel, and its entry and
       exit are so close that their order is noise: guessed wrongly, the arc went
       round the whole globe and filled it. It is left out. */
    const kept = runs.filter(r => r.some(q => Rz - Math.hypot(q.x - cx, q.y - cy) > 1));
    runs.length = 0;
    kept.forEach(r => runs.push(r));
    if (!runs.length) return "";
    const ang = q => Math.atan2(q.y - cy, q.x - cx);
    /* screen y points down, so a ring that winds counter-clockwise on the map
       walks the limb with the raw angle falling */
    const dir = winding(ring) > 0 ? -1 : 1, TAU = Math.PI * 2;
    /* An entry a hair behind an exit is the same point found twice, to the
       precision of the crossings. */
    const travel = (from, to) => {
      let t = ((to - from) * dir) % TAU;
      if (t < 0) t += TAU;
      return t > TAU - 3.5e-4 ? 0 : t;
    };
    const next = runs.map(r => {
      const e = ang(r[r.length - 1]);
      let best = 0, bt = Infinity;
      runs.forEach((o, j) => { const t = travel(e, ang(o[0])); if (t < bt) { bt = t; best = j; } });
      return best;
    });
    const arc = (r, to) => {
      const from = ang(r[r.length - 1]), t = travel(from, ang(to)), steps = Math.max(1, Math.ceil(t / (Math.PI / 45)));
      let s = "";
      for (let k = 1; k < steps; k++) {
        const th = from + dir * t * k / steps;
        s += "L" + pt({ x: cx + Rz * Math.cos(th), y: cy + Rz * Math.sin(th) });
      }
      return s;
    };
    const done = runs.map(() => false);
    let d = "";
    runs.forEach((r0, i) => {
      if (done[i]) return;
      let j = i, first = true;
      while (!done[j]) {
        done[j] = true;
        const r = runs[j];
        r.forEach((q, k) => { d += (first && !k ? "M" : "L") + pt(q); });
        first = false;
        d += arc(r, runs[next[j]][0]);
        j = next[j];
      }
      d += "Z";
    });
    return d;
  }

  /* ---------- the things on it ---------- */
  function graticule() {
    let d = "";
    for (let lng = -180; lng < 180; lng += 30) {
      const ring = [];
      for (let lat = -90; lat <= 90; lat += 3) ring.push([lng, lat]);
      d += ringD(ring) + " ";
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const ring = [];
      for (let lng = -180; lng <= 180; lng += 3) ring.push([lng, lat]);
      d += ringD(ring) + " ";
    }
    return d;
  }

  /* WHERE A MARK AND ITS TETHER'S TIP STAND, or null off the near side. The tip
     is `len` pixels outward from the ground: radially in globe mode, up in map
     mode. Anchors, the labels and the foreign body all ask the same question,
     so it is asked here. */
  function geom(lng, lat, len) {
    const p = project(lng, lat);
    if (!p.vis) return null;
    const L = len * (view.zoom || 1);
    const dx = view.mode === "globe" ? (p.x - W / 2) : 0;
    const dy = view.mode === "globe" ? (p.y - H / 2) : -1;
    const m = Math.hypot(dx, dy) || 1;
    const ux = dx / m, uy = view.mode === "globe" ? dy / m : -1;
    return { p: p, q: { x: p.x + ux * L, y: p.y + uy * L }, ux: ux };
  }

  /* LABELS. The marks were twelve rings with no names, four of them gold, so the
     only way to learn which tether was which was to click each one (the
     author's audit, 6 Oct 2026). A label stands beside the tip of each tether.
     They are placed greedily and in order of importance, because on the near
     side of the globe the East African tethers stand within a few pixels of
     each other: the selection first, then the Commonwealth's, then the
     foreign body, then the rest. Each takes the first spot that touches no
     label already placed and, for the rest, no other mark; a foreign anchor
     that fits nowhere goes unlabelled until a turn, a zoom or a click gives
     it room, and the Commonwealth's own never does. */
  const LAB = { cw: 5.5, up: 8, down: 2 };
  function labelText(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : ""; }
  /* A LABEL KEEPS ITS PLACE. Laid out afresh every frame, with no memory, a
     label hopped 12 to 36 pixels whenever a neighbour's tip crossed its
     preferred spot, and flipped from one side of its tether to the other as the
     globe turned (the author, 6 Oct 2026: the text "shift[s] in position
     rapidly when you move the globe"). So the spot a label last took is tried
     first and kept for as long as it is clear; a label that was showing is
     placed before one that was not, so a newcomer cannot take its spot; and a
     label that was not showing needs a margin to appear, so one that only just
     fits does not flicker in and out. It moves only when something is truly in
     its way. */
  const lastSpot = {};
  let lastMode = null;
  function placeLabels() {
    if (lastMode !== view.mode) { Object.keys(lastSpot).forEach(k => delete lastSpot[k]); lastMode = view.mode; }
    const items = [];
    (WORLD.anchors || []).forEach(a => {
      const g = geom(a.lng, a.lat, 26);
      if (!g) return;
      const sel = (view.anchor && a.id === view.anchor) || (view.sel && a.iso === view.sel);
      items.push({ key: a.id, text: labelText(a.tether || a.id), g: g, rank: sel ? 0 : a.mine ? 1 : 3 });
    });
    (WORLD.foreign || []).forEach(b => {
      const g = geom(b.lng, b.lat, 44);
      if (!g) return;
      items.push({ key: b.id, text: labelText((b.short || b.name || b.id).replace(/^the /i, "")),
                   g: g, rank: 2 });
    });
    const marks = [];
    items.forEach(it => {
      marks.push({ key: it.key, x0: it.g.p.x - 4, x1: it.g.p.x + 4, y0: it.g.p.y - 4, y1: it.g.p.y + 4 });
      marks.push({ key: it.key, x0: it.g.q.x - 4, x1: it.g.q.x + 4, y0: it.g.q.y - 4, y1: it.g.q.y + 4 });
    });
    /* A LABEL NEVER SITS ON ITS OWN TETHER. The tip is the label's anchor, so the
       last step of the line is left out, but the rest of it and its foot are an
       obstacle for every spot, a retained one included. Near the limb the tether
       lies along the text, and without this a mark showed through "The Male
       line" (the author, 7 Oct 2026: the text on the globe is still wrong). */
    const leader = {};
    items.forEach(it => {
      const p = it.g.p, q = it.g.q, n = Math.max(1, Math.floor(Math.hypot(q.x - p.x, q.y - p.y) / 5)), bx = [];
      for (let k = 0; k < n; k++) {
        const x = p.x + (q.x - p.x) * k / n, y = p.y + (q.y - p.y) * k / n;
        bx.push({ x0: x - 2.5, x1: x + 2.5, y0: y - 2.5, y1: y + 2.5 });
      }
      leader[it.key] = bx;
    });
    const was = Object.assign({}, lastSpot);
    Object.keys(lastSpot).forEach(k => delete lastSpot[k]);
    const placed = [], out = {};
    /* The Commonwealth's own and the selection are the ones that must be named:
       they try for a spot clear of every mark, and failing that take one that
       keeps clear of the labels already placed. The others need the first. */
    const hit = (r, it, bare) => placed.concat(bare ? [] : marks.filter(m => m.key !== it.key), leader[it.key] || []).some(o =>
      r.x0 < o.x1 && r.x1 > o.x0 && r.y0 < o.y1 && r.y1 > o.y0);
    const grow = (r, m) => ({ x0: r.x0 - m, x1: r.x1 + m, y0: r.y0 - m, y1: r.y1 + m });
    items.forEach((it, i) => { it.i = i; });
    items.slice().sort((x, y) => x.rank - y.rank || (was[x.key] ? 0 : 1) - (was[y.key] ? 0 : 1) || x.i - y.i)
      .forEach(it => {
      /* The name hangs from the tether's tip. When the globe is zoomed and the tip
         is out of view while the foot is not, a name that must be shown hangs from
         the foot instead, so that it is still there and still next to its mark. */
      const inView = P => P.x >= 0 && P.x <= W && P.y >= 0 && P.y <= H;
      const q = inView(it.g.q) ? it.g.q : it.rank <= 1 && inView(it.g.p) ? it.g.p : null;
      if (!q) return;
      const w = it.text.length * LAB.cw;
      const first = it.g.ux >= 0 ? "R" : "L";
      const at = (side, dy) => ({ id: side + dy, a: side === "R" ? "start" : "end",
                                  x: q.x + (side === "R" ? 6 : -6), y: q.y + dy });
      const flip = side => side === "R" ? "L" : "R", other = flip(first);
      let spots = [at(first, 3), at(other, 3),
        { id: "U", a: "middle", x: q.x, y: q.y - 7 }, { id: "D", a: "middle", x: q.x, y: q.y + 14 }];
      if (it.rank <= 1) [15, -9, 27, -21].forEach(dy => spots.push(at(first, dy), at(other, dy)));
      const prior = was[it.key];
      if (prior) spots = spots.filter(s => s.id === prior).concat(spots.filter(s => s.id !== prior));
      const box = s => {
        const x0 = s.a === "start" ? s.x : s.a === "end" ? s.x - w : s.x - w / 2;
        return { x0: x0 - 1, x1: x0 + w + 1, y0: s.y - LAB.up, y1: s.y + LAB.down };
      };
      const inside = r => r.x0 >= 2 && r.x1 <= W - 2 && r.y0 >= 2 && r.y1 <= H - 2;
      const margin = prior ? 0 : 5;
      /* A label that is already up stays where it is unless another LABEL is in
         its way. A tether's tip drifting under the text is a small fault, and
         the label hopping clear of it is a large one. */
      let pick = prior && spots[0].id === prior && inside(box(spots[0])) && !hit(box(spots[0]), it, true)
        ? spots[0] : null;
      if (!pick) pick = spots.find(s => { const r = grow(box(s), margin); return inside(box(s)) && !hit(r, it); });
      if (!pick && it.rank <= 1) {
        pick = spots.find(s => { const r = box(s); return inside(r) && !hit(r, it, true); });
        /* No spot fits whole. The name still has to be there, so the best spot is
           slid into view instead of being left to run off the edge and be cut
           mid-word, as "The Beanstalk" was when the globe was zoomed. A tether
           that is itself out of view is not named from the edge. */
        if (!pick) {
          const s = spots.find(c => !hit(box(c), it, true)) || spots[0], r = box(s);
          const dx = r.x0 < 2 ? 2 - r.x0 : r.x1 > W - 2 ? W - 2 - r.x1 : 0;
          const dy = r.y0 < 2 ? 2 - r.y0 : r.y1 > H - 2 ? H - 2 - r.y1 : 0;
          pick = Object.assign({}, s, { x: s.x + dx, y: s.y + dy });
        }
      }
      if (!pick) return;
      placed.push(box(pick));
      lastSpot[it.key] = pick.id;
      out[it.key] = { a: pick.a, x: pick.x, y: pick.y, text: it.text };
    });
    return out;
  }
  function labelSvg(l) {
    return l ? `<text class="w-lab" x="${l.x.toFixed(1)}" y="${l.y.toFixed(1)}" text-anchor="${l.a}">` +
      `${l.text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>` : "";
  }

  /* An anchor: a mark on the ground, and a stub of tether standing off it.
     The stub points away from the centre of the globe in globe mode — that is
     the radial direction, which is what a geostationary tether does — and
     straight up in map mode, where there is no centre. */
  function anchorMark(a, labels) {
    const g = geom(a.lng, a.lat, 26);
    if (!g) return "";
    const p = g.p, q = g.q;
    const mine = a.mine;
    /* `a.iso` AND NOT `a.host`. This read `a.host === view.sel`, and host is a
       display name — "Brazil", "the Maldives" — while a selection is a code
       like BRA. The two were never equal, so `.w-anchor.sel` has been in the
       stylesheet unreachable since it was written and selecting a country
       never lit the anchor standing on it. content/world.js now carries an
       `iso` on every anchor, which is also what makes the mark clickable. */
    const cls = "w-anchor" + (mine ? " mine" : "") +
      ((view.sel && a.iso === view.sel) || (view.anchor && a.id === view.anchor) ? " sel" : "");
    /* AND THE MARK IS THE TARGET, which it was not before. Selecting a host
       meant clicking its country OUTLINE — fine for Brazil, most of a
       fiction for São Tomé, whose whole territory is two pixels of island.
       The anchor is the thing the globe exists to show (see the header), so
       it carries the `data-iso` and a tab stop: twelve of them, against the
       152 country paths that stay mouse-only decoration. */
    const label = (a.tether || a.id) + (a.host ? ", " + a.host : "");
    return `<g class="${cls}" data-anchor="${a.id}" data-iso="${a.iso || ""}" tabindex="0" ` +
      `role="button" aria-label="${label.replace(/"/g, "")}">` +
      `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}"/>` +
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${mine ? 3.1 : 2.2}"/>` +
      `<circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="1.8"/>` +
      `<circle class="w-hit" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="7"/>` +
      labelSvg(labels[a.id]) +
      `</g>`;
  }

  /* ---------- the whole drawing ---------- */
  function render(state, content) {
    if (state) set(state, content);
    const anchors = (WORLD.anchors || []);
    const sel = view.sel;
    let countries = "";
    (typeof WORLD_COUNTRIES !== "undefined" ? WORLD_COUNTRIES : []).forEach(c => {
      const lit = !!sel && c.i === sel;
      /* A STATE IS MARKED WHEN IT IS AN ACTOR IN PLAY, and not before. This
         also marked every anchor host, which is most of the map and none of
         it interesting: an anchor is a fact about the Commonwealth's
         dependencies, not a power taking a position. And the four powers
         are gated behind the station question, so marking them before that
         presents the foreign game as the game before the story has
         introduced it — the side panel has always obeyed that gate and the
         map did not. */
      const open = !!(st && st.flags && st.flags.station_issue);
      const has = open && !!((WORLD.states || {})[c.i] || {}).actor;
      let d = "";
      (c.g || []).forEach(rings => rings.forEach(r => d += ringFill(r) + " "));
      if (!d.trim()) return;
      countries += `<path class="w-c${lit ? " sel" : ""}${has ? " has" : ""}" ` +
        `data-iso="${c.i}" data-name="${(c.n || "").replace(/"/g, "")}" d="${d.trim()}"/>`;
    });

    const ocean = view.mode === "globe"
      ? `<circle class="w-ocean" cx="${W / 2}" cy="${H / 2}" r="${(R * view.zoom).toFixed(1)}"/>`
      : `<rect class="w-ocean" x="0" y="0" width="${W}" height="${H}"/>`;

    const labels = placeLabels();
    return `<svg id="world-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="The Earth, and where the elevators stand">` +
      ocean +
      `<path class="w-grat" d="${graticule()}"/>` +
      countries +
      anchors.map(a => anchorMark(a, labels)).join("") +
      ((WORLD.foreign || []).map(b => foreignMark(b, labels)).join("")) +
      `</svg>`;
  }

  /* A FOREIGN BODY IS NOT AN ANCHOR. The Bellamy Almanac Works is the object of
     the campaign: it is orbital, so it is drawn standing OFF its tether's base
     rather than as a pin in a country, and it is drawn in the warning colour
     because it is the one thing here that is not yet the Commonwealth's. Annex
     it and it turns gold — the story told in one colour change. */
  function foreignMark(b, labels) {
    const g = geom(b.lng, b.lat, 44);
    if (!g) return "";
    const p = g.p, q = g.q;
    const home = !!(st && st.flags && st.flags["annexed_" + b.id]);
    return `<g class="w-body${home ? " in" : ""}" data-body="${b.id}">` +
      `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}"/>` +
      `<circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="4.2"/>` +
      labelSvg(labels[b.id]) +
      `</g>`;
  }

  /* THE KEY, under the drawing, and only for what the drawing holds: a campaign
     with no leased anchor says "held", and one with no foreign body shows no
     orange. The swatches are the marks themselves, so the stylesheet that
     colours the globe colours the key. */
  function key() {
    const A = WORLD.anchors || [], F = WORLD.foreign || [];
    const sw = (cls, ring) => `<svg class="w-sw" viewBox="0 0 22 12" aria-hidden="true"><g class="${cls}">` +
      `<line x1="3" y1="9" x2="15" y2="3"/><circle cx="3" cy="9" r="2.6"/>` +
      (ring ? `<circle cx="15" cy="3" r="1.8"/>` : "") + `</g></svg>`;
    const item = (cls, ring, text) => `<span class="w-ki">${sw(cls, ring)}${text}</span>`;
    const esc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    let h = "";
    if (A.some(a => a.mine))
      h += item("w-anchor mine", true, A.some(a => a.mine && a.leased)
        ? "Held or leased by the Commonwealth" : "Held by the Commonwealth");
    if (A.some(a => !a.mine)) h += item("w-anchor", true, "Not the Commonwealth\u2019s");
    F.forEach(b => { h += item("w-body", false, esc(labelText((b.short || b.name || b.id).replace(/^the /i, "")))); });
    return h ? `<div class="w-key">${h}</div>` : "";
  }

  /* ---------- the turn and the spin ---------- */
  /* Drag turns the view; the spin is one degree a frame and stops under
     no-motion, the same rule every other animation in the terminal follows. */
  function wire(root, redraw) {
    if (!root) return;
    let dragging = false, moved = false, spinPaused = false, downTarget = null, lx = 0, ly = 0;
    const motion = () => typeof Shell === "undefined" || !Shell.opt
      ? true : Shell.opt("chamberMotion") !== false;
    root.addEventListener("pointerdown", e => {
      if (!root.querySelector("#world-svg")) return;
      dragging = true; moved = false; lx = e.clientX; ly = e.clientY;
      downTarget = e.target;
      /* THE SPIN STOPS UNDER THE POINTER. The globe replaces its whole SVG every
         90ms while it turns, so between the press and the click the element the
         player pressed was destroyed and rebuilt two or three times. The click
         then fired on the container — `closest("[data-iso]")` on the container
         finds nothing — and selecting a country did nothing at all. The spin
         pauses for the press and resumes on release, so the thing that was
         clicked is still there when the click lands. */
      spinPaused = true;
      if (root.setPointerCapture) try { root.setPointerCapture(e.pointerId); } catch (x) {}
    });
    /* A CLICK IS NOT A DRAG. Every press set `dragging`, and the first
       `pointermove` — which even a stationary click produces, because a real
       pointer jitters a pixel — called redraw() and replaced the whole SVG.
       The node the click was aimed at was gone by the time the click event
       fired, so `e.target.closest("[data-iso]")` found nothing and selecting a
       country did nothing at all. The drag now starts only past a threshold,
       and a press that never crosses it leaves the drawing alone so the click
       lands on the thing that was clicked. */
    root.addEventListener("pointermove", e => {
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
      moved = true;
      lx = e.clientX; ly = e.clientY;
      const k = view.mode === "map" ? 0.25 : 0.3;
      view.lng -= dx * k;
      if (view.mode === "globe") view.lat = Math.max(-85, Math.min(85, view.lat + dy * k));
      while (view.lng > 180) view.lng -= 360;
      while (view.lng < -180) view.lng += 360;
      redraw();
    });
    const up = e => {
      if (dragging && !moved && downTarget) {
        /* SELECT ON THE RELEASE, not on the click event. A click is two events
           the browser agrees to fire on a common ancestor, and it does not owe
           us one: the spin had already replaced the element between press and
           release once, and a pointer sequence that ends on a repainted node
           can land the click on the container. The press that never crossed the
           drag threshold selects what it pressed — the target is remembered from
           the pointerdown, so it is the right element even if the drawing was
           repainted underneath. */
        /* THE ANCHOR WINS OVER ITS HOST. The mark carries both, because the
           country is still worth reaching from it, but a click aimed at a
           tether means the tether — the author's note: selecting it
           "automatically defaults to the country instead of the anchor". */
        const an = downTarget.closest && downTarget.closest("[data-anchor]");
        const b = downTarget.closest && downTarget.closest("[data-body]");
        if (an) selectAnchor(an.dataset.anchor);
        else if (b) selectBody(b.dataset.body);
        else {
          const p = downTarget.closest && downTarget.closest("[data-iso]");
          if (p) select(p.dataset.iso);
        }
      }
      dragging = false; spinPaused = false; downTarget = null;
    };
    root.addEventListener("pointerup", up);

    /* THE KEYBOARD REACHES THE SAME SELECT. The globe was mouse-only: 152
       selectable country paths and not one tab stop, on a screen whose
       siblings are all navigable (tools/uxtest.js asserts it of the
       Concordance). The twelve anchors are focusable now and Enter or Space
       goes through `select`, which is the path the pointer uses — one way in,
       so a keyboard selection cannot diverge from a clicked one. */
    root.addEventListener("keydown", e => {
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
      const an = e.target.closest && e.target.closest("[data-anchor]");
      if (an) { e.preventDefault(); selectAnchor(an.dataset.anchor); redraw(); return; }
      const g = e.target.closest && e.target.closest("[data-iso]");
      if (!g || !g.dataset.iso) return;
      e.preventDefault();
      select(g.dataset.iso);
      redraw();
    });

    /* AND THE WHEEL ZOOMS, now that there is a zoom to drive. passive:false
       because the page must not scroll under the globe while the pointer is
       over it, and preventDefault needs a non-passive listener to do it. */
    root.addEventListener("wheel", e => {
      if (!root.querySelector("#world-svg")) return;
      const f = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      if (!canZoom(f)) return;
      e.preventDefault();
      zoomBy(f);
      redraw();
    }, { passive: false });
    root.addEventListener("pointercancel", () => {
      dragging = false; spinPaused = false; downTarget = null;
    });

    let t = null;
    if (view.auto && motion() && typeof setInterval === "function") {
      t = setInterval(() => {
        if (!view.auto || !motion()) return;
        if (spinPaused) return;        /* the pointer is down: the drawing holds still */
        if (typeof document !== "undefined" && document.hidden) return;
        view.lng += 1.2;
        while (view.lng > 180) view.lng -= 360;
        redraw();
      }, 90);
    }
    return () => { if (t) clearInterval(t); };
  }

  return { render, key, wire, set, __ringFill: ringFill, toggle, mode, selected, select, selectBody, selectedBody, onSelect, auto, view,
           selectAnchor, selectedAnchor,
           zoom, zoomBy, canZoom, ZOOM_MIN, ZOOM_MAX };
})();
