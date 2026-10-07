/* =============================================================
   PACKAGE FOR ITCH.IO. Builds the release page and zips it.

     node tools/package-itch.js

   Writes dist/ways-and-means-itch.zip holding `index.html` and nothing else:
   itch.io serves a zip of an HTML5 game with index.html at its root, and the
   single file keeps the page working with no server. The page is the release
   build (tools/build.js --release): no dev scripts, no world story, the
   commit and date stamped in. tools/itchtest.js checks the zip.
   ============================================================= */
const fs = require("fs"), path = require("path"), cp = require("child_process");
const zip = require("./minizip.js");
const root = path.join(__dirname, ".."), dist = path.join(root, "dist");

cp.execFileSync(process.execPath, [path.join(__dirname, "build.js"), "--release"], { cwd: root, stdio: "inherit" });
const page = fs.readFileSync(path.join(dist, "ways-and-means.html"));
const file = path.join(dist, "ways-and-means-itch.zip");
fs.writeFileSync(file, zip.write([{ name: "index.html", data: page }]));
console.log(`\n  ${path.relative(root, file)}  ${(fs.statSync(file).size / 1048576).toFixed(1)} MB  (index.html ${(page.length / 1048576).toFixed(1)} MB)`);
