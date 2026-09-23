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

/* ONE LIST, AND IT IS THE PAGE'S. This file kept its own list of content
   files, and so did test.js, the lint, the playtest, the editor test, the
   round trip, the Concordance check and the bundle: a dozen lists, each
   edited by hand, and a new file (a new campaign's, say) had to be added to
   every one of them or a check measured content the game does not play.
   The game loads what index.html's <script> tags name, in their order, so
   that is the list: a file is added to the page and every tool sees it.

   ASSETS are left out: the recorded anthem and the country outlines are
   megabytes of base64 and coordinates that no check reads. */
const ASSET = /content\/(anthem\.js|geo\/)/;
function scriptsOf(page) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  return [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)].map(m => m[1]);
}
/* index.js last in the page as well: it reads the others' bindings. */
const files = scriptsOf("index.html").filter(f => /^content\//.test(f) && !ASSET.test(f));

/* What the editor loads besides: `archetypes.js` is the editor's alone.
   The union, in the page's order with the editor's extras before index.js,
   is the whole model an author edits (the rename test reads it). */
const editorFiles = scriptsOf("editor.html").filter(f => /^content\//.test(f) && !ASSET.test(f));
const modelFiles = files.filter(f => !/index\.js$/.test(f))
  .concat(editorFiles.filter(f => files.indexOf(f) < 0))
  .concat(files.filter(f => /index\.js$/.test(f)));

/* The content's source as one script, for tools that want the bindings
   themselves (the lint reads EVENTS, not CONTENT). */
function source(list) {
  return (list || files).filter(f => fs.existsSync(path.join(root, f)))
    .map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n");
}

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
  const ctx = {};
  vm.runInNewContext(source() + "\n;__C = CONTENT;", ctx);
  const C = ctx.__C;
  const tips = loadTips();
  if (tips) C.tips = tips;          /* a pseudo-collection, home js/tips.js */
  return C;
}

/* EVERY .js FILE UNDER content/, the campaign folders included, as paths
   relative to the root. For the checks that read content as TEXT (a retired
   verb, a party's old name, a phrase an award reads): three of them listed
   content/ with readdirSync, which does not descend, and went on passing
   without reading a line of a campaign's folder the day Flash I moved into
   one. What the pages load is `files`; this is what is in the directory. */
function contentFiles(dir) {
  const d = dir || "content";
  return fs.readdirSync(path.join(root, d), { withFileTypes: true })
    .reduce((out, e) => e.isDirectory() ? out.concat(contentFiles(d + "/" + e.name))
                       : /\.js$/.test(e.name) ? out.concat(d + "/" + e.name) : out, []);
}

module.exports = { files, editorFiles, modelFiles, source, scriptsOf, loadTips, loadContent,
                   contentFiles, root, ASSET };
