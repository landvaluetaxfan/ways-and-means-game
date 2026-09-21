/* =============================================================
   THE PROSE WORKBENCH.

   Open prose.html. Every sentence in the game on the left, the one you are
   editing in the middle, and what the player will see on the right.

   IT EDITS A COPY AND HANDS YOU A FILE. There is no server and `file://`
   cannot write to disk, so the page holds your changes in memory, marks
   what you have touched, and downloads a prose.txt. `npm run prose:in` puts
   that back into the content files, surgically, leaving every comment where
   it was. That round trip is asserted in `npm run check`.

   THE TREE AND THE FILE ARE THE SAME WALK. js/prosemap.js does it, and
   tools/prose.js runs the same module in node — an address that resolved
   here and not there would silently drop an author's work on the way back
   in, which is the one failure this cannot have.

   THE PREVIEW IS THE GAME'S OWN MARKUP, not an impression of it: the
   terminal's stylesheet, and js/setpiece.js for anything that takes the
   screen. It renders from the EDITED text, so what you are reading is what
   you have just written rather than what is on disk.
   ============================================================= */
(function () {
  "use strict";

  var C = CONTENT;
  if (typeof Tips !== "undefined" && Tips.TIPS) C.tips = Tips.TIPS;

  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  };

  var rows = ProseMap.collect(C);
  var byAddr = {};
  rows.forEach(function (r) { byAddr[r.addr] = r; });
  var edited = {};             /* addr -> new text, only where changed */
  var current = null;

  /* ---------- the tree ----------
     Collection, then entry, then field. Grouping by the same heading the
     file uses, so the two read the same way and a passage found in one is
     findable in the other. */
  function groups(filter) {
    var g = {}, order = [];
    rows.forEach(function (r) {
      if (filter) {
        var hay = (r.addr + " " + text(r.addr)).toLowerCase();
        if (hay.indexOf(filter) < 0) return;
      }
      var coll = r.addr.split("/")[0];
      var head = ProseMap.heading(C, r.addr);
      if (!g[coll]) { g[coll] = { name: coll, ents: {}, order: [] }; order.push(coll); }
      if (!g[coll].ents[head]) { g[coll].ents[head] = []; g[coll].order.push(head); }
      g[coll].ents[head].push(r);
    });
    return { g: g, order: order };
  }

  function text(addr) {
    return edited[addr] != null ? edited[addr] : (byAddr[addr] || {}).text || "";
  }
  function isDirty(addr) {
    return edited[addr] != null && edited[addr] !== byAddr[addr].text;
  }

  function drawTree() {
    var filter = ($("#find").value || "").trim().toLowerCase();
    var res = groups(filter), html = "";
    res.order.forEach(function (coll) {
      var G = res.g[coll], n = 0;
      G.order.forEach(function (h) { n += G.ents[h].length; });
      html += '<div class="grp" data-grp="' + esc(coll) + '">' +
        '<div class="ghead">' + esc(coll) + ' <i>' + n + '</i></div><div class="gbody">';
      G.order.forEach(function (h) {
        html += '<div class="ent" data-ent="' + esc(h) + '">' +
          '<div class="ehead">' + esc(h.replace(/^[a-z]+ · /, "")) + '</div>' +
          '<div class="fields">';
        G.ents[h].forEach(function (r) {
          var tail = r.addr.split("/").slice(2).join("/") || r.field;
          html += '<button class="f' + (isDirty(r.addr) ? " dirty" : "") +
            (current === r.addr ? " on" : "") + '" data-a="' + esc(r.addr) + '">' +
            esc(tail) + ' <i>' + text(r.addr).length + '</i></button>';
        });
        html += '</div></div>';
      });
      html += '</div></div>';
    });
    $("#tree").innerHTML = html || '<div class="note">Nothing matches.</div>';
    $("#treecount").textContent = filter
      ? document.querySelectorAll("#tree button.f").length + " matching"
      : rows.length + " passages";

    $("#tree").querySelectorAll(".ghead").forEach(function (h) {
      h.addEventListener("click", function () { h.parentNode.classList.toggle("open"); });
    });
    $("#tree").querySelectorAll(".ehead").forEach(function (h) {
      h.addEventListener("click", function () { h.parentNode.classList.toggle("open"); });
    });
    $("#tree").querySelectorAll("button.f").forEach(function (b) {
      b.addEventListener("click", function () { open(b.dataset.a); });
    });
    /* a filter opens what it found, because a search that hides its results
       behind two clicks is not a search */
    if (filter) $("#tree").querySelectorAll(".grp,.ent").forEach(function (e) {
      e.classList.add("open");
    });
    if (current) {
      var on = $('#tree button.f[data-a="' + current + '"]');
      if (on) {
        var e = on.closest(".ent"), g = on.closest(".grp");
        if (e) e.classList.add("open");
        if (g) g.classList.add("open");
      }
    }
  }

  function countDirty() {
    var n = Object.keys(edited).filter(isDirty).length;
    $("#dirty").innerHTML = n ? '<span class="dirtyN">' + n + " edited</span>" : "";
    return n;
  }

  /* ---------- the editor ---------- */
  function open(addr) {
    current = addr;
    var r = byAddr[addr];
    $("#where").textContent = ProseMap.heading(C, addr);
    $("#field").textContent = r.field;
    $("#addr").textContent = addr;
    $("#text").value = text(addr);
    meta();
    drawTree();
    preview();
  }

  function meta() {
    if (!current) { $("#meta").textContent = ""; return; }
    var v = $("#text").value;
    var words = (v.match(/\S+/g) || []).length;
    $("#meta").textContent = v.length + " characters · " + words + " words" +
      (isDirty(current) ? " · edited, not yet saved to a file" : "");
  }

  $("#text").addEventListener("input", function () {
    if (!current) return;
    edited[current] = $("#text").value;
    meta(); countDirty();
    var b = $('#tree button.f[data-a="' + current + '"]');
    if (b) b.classList.toggle("dirty", isDirty(current));
    preview();
  });

  $("#revert").addEventListener("click", function () {
    if (!current) return;
    delete edited[current];
    $("#text").value = byAddr[current].text;
    meta(); countDirty(); drawTree(); preview();
  });

  $("#find").addEventListener("input", drawTree);

  /* ---------- the preview ----------
     The event as the game draws it, from the EDITED text. An entry that is
     not an event previews as the passage in the terminal's own reading
     block, which is what most of them are. */
  function liveEvent(id) {
    var ev = (C.events || []).find(function (e) { return e.id === id; });
    if (!ev) return null;
    var copy = JSON.parse(JSON.stringify(ev));
    /* paint every edit belonging to this event onto the copy */
    Object.keys(edited).forEach(function (a) {
      var p = a.split("/");
      if (p[0] !== "events" || p[1] !== id) return;
      var node = copy, i;
      for (i = 2; i < p.length - 1; i++) node = node && node[p[i]];
      if (node) node[p[p.length - 1]] = edited[a];
    });
    return copy;
  }

  function preview() {
    var box = $("#prevwrap"), note = $("#prevnote");
    if (!current) { box.innerHTML = ""; note.textContent = ""; return; }
    var p = current.split("/");

    if (p[0] === "events") {
      var ev = liveEvent(p[1]);
      if (ev) {
        if (typeof SetPiece !== "undefined" && SetPiece.is(ev)) {
          note.textContent = "a set piece — it takes the screen";
          box.innerHTML = '<div class="setpiece-preview">' +
            SetPiece.html(ev, {}).html + "</div>";
          return;
        }
        note.textContent = "the sitting page";
        box.innerHTML =
          '<div class="ev">' +
          (ev.title ? '<h3 class="ev-t">' + esc(ev.title) + "</h3>" : "") +
          '<div class="ev-b">' + para(ev.body) + "</div>" +
          (ev.choices || []).map(function (c) {
            return '<div class="ch"><div class="ch-h"><b>' + esc(c.label || c.text || "") +
              "</b></div>" +
              (c.note ? '<div class="note">' + esc(c.note) + "</div>" : "") +
              (c.result ? '<div class="note res">&rarr; ' + esc(c.result) + "</div>" : "") +
              "</div>";
          }).join("") + "</div>";
        return;
      }
    }

    if (p[0] === "tips") {
      note.textContent = "a tooltip";
      var t = C.tips[p[1]] || {};
      box.innerHTML = '<div class="tipcard-preview"><b>' +
        esc(current.indexOf("/title") > 0 ? text(current) : t.title || p[1]) + "</b>" +
        "<div>" + esc(current.indexOf("/body") > 0 ? text(current) : t.body || "") +
        "</div></div>";
      return;
    }

    note.textContent = "the passage, set as the terminal sets it";
    box.innerHTML = '<div class="ev"><div class="ev-b">' + para(text(current)) + "</div></div>";
  }

  function para(s) {
    return String(s == null ? "" : s).split(/\n\s*\n/)
      .map(function (x) { return "<p>" + esc(x.trim()) + "</p>"; })
      .filter(function (x) { return x !== "<p></p>"; }).join("");
  }

  /* ---------- the file ---------- */
  $("#save").addEventListener("click", function () {
    var out = rows.map(function (r) {
      return { addr: r.addr, text: text(r.addr) };
    });
    var blob = new Blob([ProseMap.format(C, out)], { type: "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "prose.txt";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });

  $("#load").addEventListener("click", function () { $("#file").click(); });
  $("#file").addEventListener("change", function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      var got = ProseMap.parse(rd.result, byAddr);
      var n = 0, unknown = 0;
      got.forEach(function (p) {
        if (!byAddr[p.addr]) { unknown++; return; }
        if (p.text !== byAddr[p.addr].text) { edited[p.addr] = p.text; n++; }
      });
      countDirty(); drawTree();
      if (current) open(current);
      $("#count").textContent = "loaded " + got.length + " passages, " + n +
        " differ" + (unknown ? ", " + unknown + " unknown addresses ignored" : "");
    };
    rd.readAsText(f);
  });

  /* ---------- go ---------- */
  $("#count").textContent = rows.length + " passages, " +
    rows.reduce(function (n, r) { return n + r.text.length; }, 0).toLocaleString() +
    " characters";
  drawTree();
})();
