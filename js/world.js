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
  const view = { lat: 14, lng: 18, mode: "globe", auto: false, sel: null, zoom: 1 };
  let W = 720, H = 480, R = 200;

  function set(state, content) { st = state; C = content; }
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
    view.body = null;
    view.sel = (iso && iso !== view.sel) ? iso : (iso === view.sel ? null : iso);
    if (onChange) onChange();
    return view.sel;
  }
  /* THE CAMPAIGN'S SUBJECT IS SELECTABLE TOO. A foreign body is not a country
     and not an anchor: it is the thing the session is about, and clicking its
     mark opens it in the same window a country uses. */
  function selectBody(id) {
    view.sel = null;
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

  /* An anchor: a mark on the ground, and a stub of tether standing off it.
     The stub points away from the centre of the globe in globe mode — that is
     the radial direction, which is what a geostationary tether does — and
     straight up in map mode, where there is no centre. */
  function anchorMark(a) {
    const p = project(a.lng, a.lat);
    if (!p.vis) return "";
    const mine = a.mine;
    const len = 26 * (view.zoom || 1);
    const dx = view.mode === "globe" ? (p.x - W / 2) : 0;
    const dy = view.mode === "globe" ? (p.y - H / 2) : -1;
    const m = Math.hypot(dx, dy) || 1;
    const ux = dx / m, uy = view.mode === "globe" ? dy / m : -1;
    const q = { x: p.x + ux * len, y: p.y + uy * len };
    const cls = "w-anchor" + (mine ? " mine" : "") + (view.sel && a.host === view.sel ? " sel" : "");
    return `<g class="${cls}">` +
      `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}"/>` +
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${mine ? 3.1 : 2.2}"/>` +
      `<circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="1.8"/>` +
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
      (c.g || []).forEach(rings => rings.forEach(r => d += ringD(r) + " "));
      if (!d.trim()) return;
      countries += `<path class="w-c${lit ? " sel" : ""}${has ? " has" : ""}" ` +
        `data-iso="${c.i}" data-name="${(c.n || "").replace(/"/g, "")}" d="${d.trim()}"/>`;
    });

    const ocean = view.mode === "globe"
      ? `<circle class="w-ocean" cx="${W / 2}" cy="${H / 2}" r="${(R * view.zoom).toFixed(1)}"/>`
      : `<rect class="w-ocean" x="0" y="0" width="${W}" height="${H}"/>`;

    return `<svg id="world-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="The Earth, and where the elevators stand">` +
      ocean +
      `<path class="w-grat" d="${graticule()}"/>` +
      countries +
      anchors.map(anchorMark).join("") +
      ((WORLD.foreign || []).map(foreignMark).join("")) +
      `</svg>`;
  }

  /* A FOREIGN BODY IS NOT AN ANCHOR. The Bellamy Almanac Works is the object of
     the campaign: it is orbital, so it is drawn standing OFF its tether's base
     rather than as a pin in a country, and it is drawn in the warning colour
     because it is the one thing here that is not yet the Commonwealth's. Annex
     it and it turns gold — the story told in one colour change. */
  function foreignMark(b) {
    const p = project(b.lng, b.lat);
    if (!p.vis) return "";
    const home = !!(st && st.flags && st.flags["annexed_" + b.id]);
    const len = 44 * (view.zoom || 1);
    const dx = view.mode === "globe" ? (p.x - W / 2) : 0;
    const dy = view.mode === "globe" ? (p.y - H / 2) : -1;
    const m = Math.hypot(dx, dy) || 1;
    const ux = dx / m, uy = view.mode === "globe" ? dy / m : -1;
    const q = { x: p.x + ux * len, y: p.y + uy * len };
    return `<g class="w-body${home ? " in" : ""}" data-body="${b.id}">` +
      `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}"/>` +
      `<circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="4.2"/>` +
      `</g>`;
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
        const b = downTarget.closest && downTarget.closest("[data-body]");
        if (b) selectBody(b.dataset.body);
        else {
          const p = downTarget.closest && downTarget.closest("[data-iso]");
          if (p) select(p.dataset.iso);
        }
      }
      dragging = false; spinPaused = false; downTarget = null;
    };
    root.addEventListener("pointerup", up);
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

  return { render, wire, set, toggle, mode, selected, select, selectBody, selectedBody, onSelect, auto, view };
})();
