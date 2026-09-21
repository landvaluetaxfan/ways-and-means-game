/* Loading the content files outside a browser.
 *
 * The content files are plain `<script src>` files, not modules: each opens
 * with `const SETUP = {...}` and `content/index.js` at the end collects those
 * bindings into `CONTENT`. `require()` therefore CANNOT load them — every file
 * would get its own module scope and `index.js` would throw on the first name.
 * They have to be concatenated and run in ONE context, which is exactly what a
 * browser does with twenty script tags.
 *
 * Extracted from tools/prose.js so tools/register.js gets the same content and
 * the file list has one home. Anything that needs the authored content in node
 * requires this.
 */
"use strict";
const fs = require("fs"), vm = require("vm"), path = require("path");
const root = path.join(__dirname, "..");

/* index.js last: it is the file that reads the others' bindings. */
const files = ["content/setup.js","content/parties.js","content/stations.js",
  "content/constituencies.js","content/cabinet.js","content/instruments.js",
  "content/initiatives.js","content/minutes.js","content/functional.js",
  "content/labour.js","content/names.js","content/characters.js",
  "content/bills.js","content/events.js","content/glossary.js",
  "content/encyclopedia.js","content/artifacts.js","content/business.js",
  "content/settlements.js","content/actors.js","content/achievements.js",
  "content/world.js","content/index.js"];

/* THE TOOLTIPS ARE PROSE TOO, and they are not in content/. js/tips.js
   carries a few hundred sentences explaining the terminal, in a plain object
   keyed by tip id, and they were invisible to the prose tool because it only
   walked the content files — so the answer to "are the tooltips editable?"
   was no, and I had said yes.

   It loads under a stub DOM because the module only touches the document
   inside wire(), which nothing calls here. If that ever stops being true the
   round-trip check fails loudly rather than the tips quietly vanishing. */
function loadTips() {
  const stub = {
    document: { addEventListener() {}, querySelector() { return null },
                createElement() { return { style: {}, classList: { add() {}, remove() {} },
                                           appendChild() {} }; },
                body: { appendChild() {} } },
    CSS: { supports() { return true; } }
  };
  stub.window = stub;
  try {
    vm.runInNewContext(fs.readFileSync(path.join(root, "js", "tips.js"), "utf8") +
      "\n;__T = (typeof Tips !== 'undefined' && Tips.TIPS) || null;", stub);
    return stub.__T || null;
  } catch (e) { return null; }
}

function loadContent() {
  const src = files.filter(f => fs.existsSync(path.join(root, f)))
    .map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n");
  const ctx = {};
  vm.runInNewContext(src + "\n;__C = CONTENT;", ctx);
  const C = ctx.__C;
  const tips = loadTips();
  if (tips) C.tips = tips;          /* a pseudo-collection, home js/tips.js */
  return C;
}

module.exports = { files, loadTips, loadContent, root };
