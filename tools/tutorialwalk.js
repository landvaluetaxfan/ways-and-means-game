/* Real campaign tutorial audit. Walk pages and first answers (promise Ivarsen the spare slot to exercise
   Owed), carry supply, and inspect each lesson on
   introduction. SNAPSHOTS=<path> optionally saves the introduced states for browser screenshots. */
process.env.HARNESS_REAL = "1"; process.env.TUTORIAL = "1";
const fs = require("fs"), H = require("./harness.js"), { w } = H;
const q = s => w.document.querySelector(s);
const tick = () => new Promise(r => w.setTimeout(r, 20));
(async () => {
  w.eval(`Element.prototype.getBoundingClientRect = function(){return {left:40,top:40,right:340,bottom:140,width:300,height:100}}`);
  H.boot(); H.newGame();
  w.eval("Shell.setOpt('motion',false); Shell.setOpt('tutorial','on'); Shell.setOpt('taught',''); Shell.setOpt('tutorialMet','')");
  const records = {}, snapshots = {};
  for (let n = 0; n < 150; n++) {
    w.eval("UI.openTab('sit'); Tutorial.refresh()"); await tick();
    const steps = w.eval("UI.content().setup.tutorial");
    for (const step of steps) {
      if (records[step.id]) continue;
      const eligible = w.eval(`(()=>{const s=UI.content().setup.tutorial.find(s=>s.id===${JSON.stringify(step.id)}),r=Tutorial.REGIONS[s.region];return s.when?Engine.matches(UI.state(),s.when):!!document.querySelector('#s-'+r.tab+' '+r.sel)})()`);
      if (!eligible) continue;
      const before = w.eval("Engine.save(UI.state())");
      snapshots[step.id] = before;
      w.eval(`Shell.setOpt('taught',UI.content().setup.tutorial.filter(s=>s.id!==${JSON.stringify(step.id)}).map(s=>s.id).join(',')); Tutorial.replay(${JSON.stringify(step.id)})`);
      if (w.eval("typeof Tutorial.open === 'function'")) w.eval(`Tutorial.open(${JSON.stringify(step.id)})`);
      else { w.eval(`UI.openTab(${JSON.stringify(step.onTab)})`); if (["clauses", "division", "whip"].includes(step.id)) w.eval("Focus.activate('cham-bills','appropriation')"); }
      await tick(); w.eval("Tutorial.refresh()");
      const shown = w.eval("Tutorial.shown() && Tutorial.shown().id");
      records[step.id] = { sitting:w.eval("UI.state().sitting"), reached:shown === step.id };
      H.ok(step.id + " reaches its target on introduction", shown === step.id, JSON.stringify(records[step.id]));
      H.ok(step.id + " navigation changes no simulation state", before === w.eval("Engine.save(UI.state())"));
    }
    w.eval("Shell.setOpt('taught',UI.content().setup.tutorial.map(s=>s.id).join(',')); UI.openTab('sit'); Tutorial.refresh()");
    const body = q("#sitting-body"), go = body && body.querySelector("[data-sp-go], #btn-pass");
    if (go) { go.click(); continue; }
    const heads = body ? [...body.querySelectorAll(".ch-head")] : [];
    const head = heads.find(h => /Promise Marit Ivarsen the spare slot/.test(h.textContent)) || heads[0];
    if (head) { head.click(); const commit = body.querySelector(".btn.commit"); if (commit) commit.click(); continue; }
    const advance = q("#btn-advance");
    if (!advance) break;
    w.eval(`(()=>{const st=UI.state(),C=UI.content(),b=st.bills.appropriation;
      if(st.sitting>=5&&b&&!b.dead&&!['assented','awaiting_assent'].includes(b.stage)) {
        if(b.stage===Engine.DIVIDES_AT) Engine.divide(st,C,'appropriation'); else Engine.grantSlot(st,C,'appropriation');
      }})()`);
    advance.click();
  }
  const ids = w.eval("UI.content().setup.tutorial.map(s=>s.id)");
  H.ok("the carried route introduces every campaign lesson", ids.every(id=>records[id]), ids.filter(id=>!records[id]).join(","));
  H.ok("the route ends at Bellamy with carried supply and no automatic teaching",
    w.eval("Engine.checkEnd(UI.state(),UI.content()).kind === 'act' && Engine.checkEnd(UI.state(),UI.content()).curtain.event === 'a1_works_abandoned' && UI.state().flags.supply_granted && UI.state().bills.appropriation.carriedAt > 0") &&
    !w.eval("Tutorial.pick()"));
  snapshots.ending = w.eval("Engine.save(UI.state())");
  if (process.env.SNAPSHOTS) fs.writeFileSync(process.env.SNAPSHOTS, JSON.stringify(snapshots));
  console.log(JSON.stringify(records));
  H.finish("the real campaign tutorial route is healthy");
})();
