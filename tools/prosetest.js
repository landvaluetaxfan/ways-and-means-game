/* =============================================================
   THE PROSE WORKBENCH BOOTS, AND EVERY PART OF IT WORKS.

   prose.html is a page with no tests behind it and no way to notice it has
   broken: it is opened by hand, once in a while, by the one person whose
   work it holds. A page that renders an empty tree looks exactly like a page
   with nothing selected.

   It needs a real browser, like tools/laycheck.js, and for the same reason:
   the tree is built by script and jsdom would prove it EXISTS without
   proving anything renders. It is out of `npm run check` on the same terms —
   a check that silently skips when a runner has no browser reads as coverage
   and is not.

     npm run prosepad
   ============================================================= */
const fs = require("fs"), path = require("path"), cp = require("child_process");
const root = path.join(__dirname, "..");

const CHROME = [
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
  "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome",
  process.env.CHROME
].filter(Boolean).find(p => { try { return fs.existsSync(p); } catch { return false; } });

if (!CHROME) {
  console.log("SKIP: no Chromium found. Set CHROME=/path/to/chrome.");
  process.exit(0);
}

const PROBE = `
(function(){var out=document.getElementById("probe-out");var r={};
 try{
  r.passages=document.querySelectorAll("#tree button.f").length;
  r.header=document.getElementById("count").textContent;
  var g=document.querySelector('#tree .grp[data-grp="events"] .ghead'); if(g)g.click();
  var e=document.querySelector('#tree .grp[data-grp="events"] .ehead'); if(e)e.click();
  var b=document.querySelector('#tree .grp[data-grp="events"] button.f');
  r.opened=!!b; if(b)b.click();
  r.addr=document.getElementById("addr").textContent;
  r.textLen=(document.getElementById("text").value||"").length;
  r.previewLen=(document.getElementById("prevwrap").textContent||"").trim().length;
  var ta=document.getElementById("text");
  ta.value="EDITED SENTINEL PHRASE"; ta.dispatchEvent(new Event("input"));
  r.dirty=document.getElementById("dirty").textContent;
  r.previewFollows=(document.getElementById("prevwrap").textContent||"").indexOf("EDITED SENTINEL")>=0;
  document.getElementById("revert").click();
  r.reverted=(document.getElementById("text").value||"").indexOf("EDITED SENTINEL")<0;
  r.clean=document.getElementById("dirty").textContent;
  var f=document.getElementById("find");
  f.value="treasury"; f.dispatchEvent(new Event("input"));
  r.filtered=document.querySelectorAll("#tree button.f").length;
  f.value=""; f.dispatchEvent(new Event("input"));
  r.unfiltered=document.querySelectorAll("#tree button.f").length;
  r.tipGroup=!!document.querySelector('#tree .grp[data-grp="tips"]');
  /* a set piece previews through the game's own frame */
  var sp=null;
  (CONTENT.events||[]).forEach(function(ev){ if(!sp && SetPiece.is(ev)) sp=ev; });
  r.setpieceInContent=!!sp;
 }catch(err){r.error=err.message;}
 out.textContent=JSON.stringify(r);})();`;

const tmp = path.join(root, "_prosetest." + process.pid + ".html");
fs.writeFileSync(tmp, fs.readFileSync(path.join(root, "prose.html"), "utf8")
  .replace("</body>", '<pre id="probe-out"></pre><script>' + PROBE + "</script></body>"));
let dom = "";
try {
  dom = cp.execSync(`"${CHROME}" --headless --disable-gpu --no-sandbox --hide-scrollbars ` +
    `--allow-file-access-from-files --virtual-time-budget=20000 ` +
    `--window-size=1600,1000 --dump-dom "${tmp}" 2>/dev/null`,
    { maxBuffer: 64 * 1024 * 1024 }).toString();
} finally { try { fs.unlinkSync(tmp); } catch {} }

const m = dom.match(/<pre id="probe-out">([\s\S]*?)<\/pre>/);
let bad = 0;
const ok = (l, c, extra) => { if (!c) bad++;
  console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

console.log("THE PROSE WORKBENCH");
console.log("=".repeat(58));
if (!m) { console.log("  FAIL the page produced nothing"); process.exit(1); }
const r = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
if (r.error) { console.log("  FAIL the page threw: " + r.error); process.exit(1); }

ok("it draws every passage in the game", r.passages > 1500, r.passages + " in the tree");
ok("and says how much there is to read", /passages/.test(r.header), r.header);
ok("the tooltips are in the tree, not only in the file", r.tipGroup);
ok("a passage opens", r.opened && r.textLen > 0, r.addr + ", " + r.textLen + " chars");
ok("and it is previewed as the player will see it", r.previewLen > 40,
   r.previewLen + " characters drawn");
ok("editing marks it", /edited/.test(r.dirty), r.dirty);
ok("and the preview follows the edit, not the file", r.previewFollows);
ok("reverting puts it back", r.reverted && !/edited/.test(r.clean), r.clean || "clean");
ok("the filter narrows the tree", r.filtered > 0 && r.filtered < r.passages,
   r.filtered + " of " + r.passages);
ok("and clearing it restores everything", r.unfiltered === r.passages,
   r.unfiltered + " of " + r.passages);
ok("the game still has a set piece for the frame to draw", r.setpieceInContent);

console.log("");
if (bad) { console.log(bad + " WORKBENCH FAILURES"); process.exit(1); }
console.log("the workbench works");
