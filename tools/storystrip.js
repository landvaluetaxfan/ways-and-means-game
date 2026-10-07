/* =============================================================
   STORY STRIP. Takes the world's untagged story out of a release page.

   Flash I plays only the story tagged for it (content/index.js, STORY). The
   world's untagged story is what test.js plays on, so it stays in the
   repository, and until the engine has a fixture of its own it also stays in
   index.html, where it ships inside the page unseen. A playtest build must not
   carry the retired writing, seen or not (briefs/act-one.md, "How old text
   leaves the build"), so the release build removes those entries from the
   source text of the files it inlines.

   It reads the file as text, finds each story array (`const EVENTS = [`) and
   keeps the elements tagged for a campaign other than the world. It does not
   parse JavaScript; it counts brackets outside strings, template literals and
   comments, which is all a content file uses. A file it cannot read that way
   is a build failure, not a silent pass-through.
   ============================================================= */
"use strict";

const STORY = ["EVENTS", "BILLS", "INSTRUMENTS", "INITIATIVES", "MATTERS", "SETTLEMENTS",
               "ACHIEVEMENTS", "BUSINESS", "MINUTES", "RESOLUTIONS"];

/* The index one past the end of the string, template or comment that starts at i, or -1. */
function skip(s, i) {
  const c = s[i], d = s[i + 1];
  if (c === "/" && d === "/") { const e = s.indexOf("\n", i); return e < 0 ? s.length : e; }
  if (c === "/" && d === "*") { const e = s.indexOf("*/", i + 2); return e < 0 ? s.length : e + 2; }
  if (c === '"' || c === "'") {
    for (let j = i + 1; j < s.length; j++) {
      if (s[j] === "\\") j++; else if (s[j] === c) return j + 1; else if (s[j] === "\n") return -2;
    }
    return -2;
  }
  if (c === "`") {
    for (let j = i + 1; j < s.length; j++) {
      if (s[j] === "\\") j++; else if (s[j] === "`") return j + 1;
      else if (s[j] === "$" && s[j + 1] === "{") throw new Error("template substitution in a story array");
    }
    return -2;
  }
  return -1;
}

/* The elements of the array whose "[" is at open: [{from, to}] and the index of the "]". */
function elements(s, open) {
  const out = []; let depth = 0, start = open + 1;
  for (let i = open + 1; i < s.length;) {
    const k = skip(s, i);
    if (k === -2) throw new Error("unterminated string near " + s.slice(i, i + 40));
    if (k > 0) { i = k; continue; }
    const c = s[i];
    if (c === "{" || c === "[" || c === "(") depth++;
    else if (c === "}" || c === ")" || (c === "]" && depth > 0)) depth--;
    else if (c === "]" && depth === 0) { push(i); return { list: out, close: i }; }
    else if (c === "," && depth === 0) push(i);
    i++;
  }
  throw new Error("unterminated array");
  function push(end) {
    /* the element's text without the comments that precede it */
    let a = start, t = s.slice(a, end);
    const body = t.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "").trim();
    if (body) out.push({ text: t, body });
    start = end + 1;
  }
}

/* An entry is kept when it is tagged for a campaign other than the world, or is not an object literal. */
function keep(body) {
  if (body[0] !== "{") return true;
  const m = body.match(/(?:^|[\s,{])campaign\s*:\s*(\[[^\]]*\]|"[^"]*"|'[^']*')/);
  if (!m) return false;
  return /["'](?!world["'])[a-z_0-9]+["']/.test(m[1]);
}

function strip(src) {
  const gone = {}, cut = [];
  let out = src;
  STORY.forEach(name => {
    const re = new RegExp("^(?:const|let|var)\\s+" + name + "\\s*=\\s*\\[", "m");
    const m = re.exec(out);
    if (!m) return;
    const open = m.index + m[0].length - 1;
    const { list, close } = elements(out, open);
    const kept = list.filter(e => keep(e.body));
    gone[name] = list.length - kept.length;
    list.forEach(e => { if (!keep(e.body)) cut.push(e.body); });
    out = out.slice(0, open + 1) + "\n" + kept.map(e => e.body).join(",\n") + "\n" + out.slice(close);
  });
  return { src: out, gone, cut };
}

module.exports = { strip, STORY };
