/* EVERY CAMPAIGN'S GUARDS.

     npm run guards              all of them
     npm run guards -- flash_i   one

   A campaign is a folder, content/campaigns/<id>/, and what its story
   promises is asserted in that folder's guards.js (tools/testkit.js says
   why the story's tests are not in test.js). The campaigns are the ones the
   game loads, read off index.html like every other list here, so a folder
   the page does not name is not a campaign and is not run.

   Each campaign runs in its own process: one campaign's guards throwing,
   or leaving a global behind, cannot touch another's. A campaign with no
   guards is reported and does not fail: a campaign being started has none
   yet, and saying so is the point. */
"use strict";
const fs = require("fs"), path = require("path"), { spawnSync } = require("child_process");
const LC = require("./loadcontent.js");

const ids = [...new Set(LC.files
  .map(f => (/^content\/campaigns\/([^/]+)\//.exec(f) || [])[1])
  .filter(Boolean))];
const only = process.argv.slice(2).filter(a => !/^-/.test(a));
const run = only.length ? ids.filter(id => only.indexOf(id) >= 0) : ids;

if (only.length && run.length < only.length) {
  console.log("no such campaign: " + only.filter(id => ids.indexOf(id) < 0).join(", ") +
              " (the page loads " + (ids.join(", ") || "none") + ")");
  process.exit(1);
}

let failed = 0;
const none = [];
run.forEach(id => {
  const f = path.join(LC.root, "content", "campaigns", id, "guards.js");
  if (!fs.existsSync(f)) { none.push(id); return; }
  const r = spawnSync(process.execPath, [f], { stdio: "inherit", cwd: LC.root });
  if (r.status !== 0) failed++;
  console.log("");
});

console.log("CAMPAIGN GUARDS");
console.log("=".repeat(58));
console.log("  " + run.length + " campaign" + (run.length === 1 ? "" : "s") + ": " + run.join(", "));
if (none.length) console.log("  no guards yet: " + none.join(", "));
if (!run.length) console.log("  (the page loads no campaign)");
console.log(failed ? "\n" + failed + " CAMPAIGN(S) BREAK A PROMISE" : "\nevery campaign keeps its promises");
process.exit(failed ? 1 : 0);
