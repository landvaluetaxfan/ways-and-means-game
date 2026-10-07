/* =============================================================
   ACT WALK. Play the real Flash I through the page, as a first-time player
   would, printing each page and decision as the Sitting screen draws it.

     node tools/actwalk.js                          take the first answer every time
     PICKS='{"5":1,"6":1}' node tools/actwalk.js     the answer to take at a sitting (by
                                                    the order the screen lists them)
     NOTE=1     print the open choice's note, effects and promise
     W=900      how many characters of each page to print (default 900)
     FULL=1     print the whole Sitting panel (the log, the Owed list, the calendar)
     HTML=5     print one sitting's decision as markup
     CHAMBER=1  give the estimates time from sitting 5 and divide when the House will,
                so the walk reaches a carried rise and the last page

   A decision's own text is typed onto the screen by js/stream.js and is empty
   in the headless page, so what this prints for a decision is its choices; read
   its body in content/campaigns/flash_i/events.js. It is the first-time-player
   read-through of briefs/act-one.md's exit gate, and a way to see what the
   interface does with a scene before the author does.
   ============================================================= */
process.env.HARNESS_REAL = "1";
const H = require("./harness.js");
const { w, $ } = H;
const picks = JSON.parse(process.env.PICKS || "{}");
H.boot(); H.newGame();
const txt = sel => { const n = w.document.querySelector(sel); return n ? n.textContent.replace(/\s+/g, " ").trim() : ""; };
let sitting = -1, steps = 0;
for (let guard = 0; guard < 120 && steps < 60; guard++) {
  const s = w.eval("UI.state().sitting");
  const body = w.document.querySelector("#sitting-body");
  const go = body && (body.querySelector("[data-sp-go]") || body.querySelector("#btn-pass"));
  const heads = body ? [...body.querySelectorAll(".ch-head")] : [];
  const adv = $("#btn-advance");
  if (go) {
    console.log(`\n--- sitting ${s}: PAGE ---\n` + txt("#sitting-body").slice(0, +process.env.W || 900));
    go.click(); steps++; continue;
  }
  if (heads.length) {
    const id = w.eval("(UI.state().log[0]||{}).eventId||''");
    const ev = txt("#sitting-body").slice(0, +process.env.W || 900);
    const bodyEl = w.document.querySelector("#sitting-body .sit-event-body, #sitting-body .evbody, #sitting-body .ev-body, #sitting-body .event-text");
    console.log(`\n--- sitting ${s}: DECISION (${heads.length} choices) ---\n` + ev);
    if (process.env.IDS) console.log([...w.document.querySelectorAll("#sitting-body > *")].map(n=>n.tagName+"."+n.className).join(" | "));
    if (process.env.HTML && String(s)===process.env.HTML) console.log("HTML:", w.document.querySelector("#sitting-body").innerHTML.replace(/\s+/g," ").slice(0,2500));
    if (process.env.FULL) console.log("FULLTEXT:", w.document.querySelector("#s-sit").textContent.replace(/\s+/g," ").slice(0,3000));
    const want = picks[s] != null ? picks[s] : 0;
    const head = heads[Math.min(want, heads.length - 1)]; head.click();
    const commit = w.document.querySelector("#sitting-body .btn.commit");
    console.log("   picked:", txt(".ch.open .ch-label"));
    if (process.env.NOTE) console.log("   note:", txt(".ch.open .ch-note"), "\n   effects:", [...w.document.querySelectorAll(".ch.open .ch-eff li")].map(l=>l.textContent).join(" | "), "\n   owed:", txt(".ch.open .ch-sec.owed"));
    if (commit) commit.click(); steps++; continue;
  }
  if (adv) {
    console.log(`\n--- sitting ${s}: rise ---`);
    if (process.env.CHAMBER) w.eval(`(function(){ var st = UI.state(), C = UI.content(), b = st.bills.appropriation;
      if (st.sitting >= 5 && b && !b.dead && b.stage !== "assented" && b.stage !== "awaiting_assent") {
        if (b.stage === Engine.DIVIDES_AT) { try { Engine.divide(st, C, "appropriation"); } catch (e) { /* not yet */ } }
        else Engine.grantSlot(st, C, "appropriation"); } })()`);
    adv.click(); steps++; continue;
  }
  console.log("stuck", [...w.document.querySelectorAll("#sitting-body button, #sitting-body [data-ack], #sitting-body [data-sp]")].map(b=>b.outerHTML.slice(0,140)).join("\n")); break;
}
console.log("\nTHE SCREEN NOW (sitting " + w.eval("UI.state().sitting") + "):\n" +
  txt("#sitting-body").slice(0, +process.env.LAST || 2600));
process.exit(0);
