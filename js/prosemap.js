/* =============================================================
   THE PROSE MAP — which strings in the content are prose, what each one's
   address is, and how the prose file is written and read.

   ONE SOURCE, TWO CALLERS. tools/prose.js runs this in node to write and
   read prose.txt; prose.html runs it in the browser to draw the tree and
   the editor. Writing the walk twice would mean an address that resolves in
   one and not the other, which is the whole thing this file exists to make
   impossible.

   It knows nothing about files, nothing about the DOM, and does no I/O.
   ============================================================= */
var ProseMap = (function () {
  "use strict";

  /* A WHITELIST ON PURPOSE. Walking for "any long string" swept up ids,
     party short names, file names and effect keys, and an author editing
     those silently breaks the game. These are the fields a PLAYER reads. */
  var PROSE = ["body", "title", "label", "text", "note", "result", "summary",
    "closing", "contested", "description", "tendency", "gloss", "grievance",
    "effect_note", "wire", "note_franchise", "head", "source", "said", "hint",
    "lede", "epigraph", "caption", "blurb", "why", "asks", "answer", "question"];

  /* Keys whose value is a name or an id and never prose, even where the key
     is on the list above (a party's `label` is "PSD"). */
  var NEVER = ["id", "ref", "kind", "art", "mood", "speaker", "party",
    "holder", "leader", "station", "seat", "band", "form", "tier", "franchise"];

  function isProse(k) { return PROSE.indexOf(k) >= 0 && NEVER.indexOf(k) < 0; }

  /* A step is an id where the thing has one and an index where it does not,
     because a choice has no id and never has. */
  function step(node, key) {
    if (Object.prototype.toString.call(node) === "[object Array]") {
      var item = node[key];
      return (item && item.id) ? String(item.id) : String(key);
    }
    return String(key);
  }

  function collect(C) {
    var out = [], seen = {};

    function walk(node, addr, depth) {
      if (node == null || depth > 8) return;
      if (Object.prototype.toString.call(node) === "[object Array]") {
        for (var i = 0; i < node.length; i++)
          walk(node[i], addr.concat(step(node, i)), depth + 1);
        return;
      }
      if (typeof node !== "object") return;
      Object.keys(node).forEach(function (k) {
        var v = node[k], here = addr.concat(k), a;
        if (typeof v === "string") {
          if (!isProse(k) || !v.trim()) return;
          a = here.join("/");
          if (seen[a]) return;
          seen[a] = 1; out.push({ addr: a, text: v, field: k });
          return;
        }
        if (Object.prototype.toString.call(v) === "[object Array]" &&
            v.length && v.every(function (x) { return typeof x === "string"; })) {
          if (!isProse(k)) return;
          v.forEach(function (s, i) {
            if (!s.trim()) return;
            var b = here.concat(String(i)).join("/");
            if (seen[b]) return;
            seen[b] = 1; out.push({ addr: b, text: s, field: k });
          });
          return;
        }
        walk(v, here, depth + 1);
      });
    }

    Object.keys(C).filter(function (k) { return !/ById$|ByTerm$/.test(k); })
      .sort()
      .forEach(function (k) { walk(C[k], [k], 0); });
    return out;
  }

  /* The heading a human reads to know where they are. */
  function heading(C, addr) {
    var parts = addr.split("/"), coll = parts[0], id = parts[1];
    var list = C[coll];
    if (Object.prototype.toString.call(list) !== "[object Array]") {
      /* a keyed table, like the tooltips */
      var item0 = list && list[id];
      if (item0 && (item0.title || item0.name)) return coll + " · " + (item0.title || item0.name);
      return coll + (id ? " · " + id : "");
    }
    var item = null, i;
    for (i = 0; i < list.length; i++)
      if (list[i] && String(list[i].id) === id) { item = list[i]; break; }
    if (!item && /^\d+$/.test(id)) item = list[Number(id)];
    if (!item) return coll + " · " + id;
    return coll + " · " + (item.title || item.name || item.id || id);
  }

  /* ---------- the file ---------- */
  function format(C, rows) {
    var L = [], lastHead = null;
    /* THE HEADER IS AN INSTRUCTION SHEET, because the file gets handed to
       somebody. The author edits it and gives it to whichever agent is
       working the content lane, and that agent should not need a separate
       message explaining what to do with it \u2014 the file says. */
    L.push("THE PROSE OF WAYS AND MEANS");
    L.push(new Array(71).join("="));
    L.push("");
    L.push(rows.length + " passages, " +
           rows.reduce(function (n, r) { return n + r.text.length; }, 0)
             .toLocaleString() + " characters: every sentence a player reads.");
    L.push("");
    L.push("FOR THE AUTHOR");
    L.push("  Edit the prose freely. Leave the @ lines exactly as they are \u2014");
    L.push("  they are the addresses, and they are how this goes back into");
    L.push("  the game. Blank lines are paragraph breaks and are kept.");
    L.push("  A line starting with # is a note and is dropped on the way in,");
    L.push("  so it is a safe place to leave a question or a reminder.");
    L.push("");
    L.push("FOR WHOEVER IS APPLYING THIS");
    L.push("  Put this file at the repository root as prose.txt and run:");
    L.push("");
    L.push("      npm run prose:in");
    L.push("");
    L.push("  That is the whole job. It replaces each passage in its own");
    L.push("  content file, surgically, leaving every comment and every");
    L.push("  effect exactly where it was. Do NOT hand-edit the content");
    L.push("  files from this, and do NOT re-serialise them: the importer");
    L.push("  exists because re-serialising produces valid JavaScript and");
    L.push("  destroys every comment in it.");
    L.push("");
    L.push("  It reports anything it cannot place unambiguously and refuses");
    L.push("  to guess. Those are the only ones to do by hand, and it names");
    L.push("  them. Afterwards run npm run check.");
    L.push("");
    rows.forEach(function (r) {
      var h = heading(C, r.addr);
      if (h !== lastHead) {
        L.push("");
        L.push(new Array(71).join("="));
        L.push("== " + h);
        L.push(new Array(71).join("="));
        lastHead = h;
      }
      L.push("");
      L.push("@ " + r.addr);
      L.push(r.text);
    });
    L.push("");
    return L.join("\n");
  }

  /* A line is a marker only if it starts `@ ` AND the rest is an address the
     content actually has, so prose that begins with an at sign is safe. */
  function parse(text, known) {
    var lines = String(text).split(/\r?\n/), out = [], cur = null, buf = [];
    function flush() {
      if (cur === null) return;
      while (buf.length && !buf[0].trim()) buf.shift();
      while (buf.length && !buf[buf.length - 1].trim()) buf.pop();
      out.push({ addr: cur, text: buf.join("\n") });
      cur = null; buf = [];
    }
    lines.forEach(function (line) {
      var m = /^@ (\S+)\s*$/.exec(line);
      if (m && known[m[1]]) { flush(); cur = m[1]; return; }
      /* A block also ends at a heading: the ==== rules and the == title
         between entries are furniture, not prose. */
      if (/^={10,}$/.test(line) || /^== /.test(line)) { flush(); return; }
      if (cur === null) return;                      /* preamble */
      if (/^# /.test(line)) return;                  /* a note, not prose */
      buf.push(line);
    });
    flush();
    return out;
  }

  return { PROSE: PROSE, NEVER: NEVER, isProse: isProse,
           collect: collect, heading: heading, format: format, parse: parse };
})();

if (typeof module !== "undefined") module.exports = ProseMap;
