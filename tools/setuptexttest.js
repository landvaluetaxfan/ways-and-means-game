/* E5: real resolver, recorded history and page boundaries. Removing any
   boundary must leave a template visible or change an already-recorded value. */
const assert = require("assert/strict"), Engine = require("../js/engine.js");
assert.equal(typeof Engine.text, "function", "setup text resolver exists");
const C = { setup:{ slotsPerSession:6, zero:0, macro:{meetingEvery:42,
  heat:{line:15},rule:{inflation:0.5,gap:0.25}} } };
assert.equal(Engine.text("{{setup.slotsPerSession}} slots; {{setup.zero}}", C), "6 slots; 0");
assert.equal(Engine.text("{{setup.macro.rule.gap|percent}} per cent", C), "25 per cent");
assert.equal(Engine.text("{{setup.macro.rule.inflation|percent}} per cent", C), "50 per cent");
assert.equal(Engine.text("Plain text", null), "Plain text");
assert.equal(Engine.text('{"move":{"rel.president":5}}',C),'{"move":{"rel.president":5}}');
assert.equal(Engine.text('{"move":{"label":"{{setup.zero}}"}}',C),'{"move":{"label":"0"}}');
assert.equal(Engine.text("On {date}, {{setup.slotsPerSession}} slots; {value}", C), "On {date}, 6 slots; {value}");
assert.equal(Engine.text(null, C), "");
for (const token of ["{{setup.missing}}", "{{state.slots.total}}", "{{setup}}",
  "{{setup.macro}}", "{{setup.zero|unknown}}", "{{setup.__proto__.zero}}",
  "{{setup.zero", "{{setup.zero}}}"]) {
  assert.throws(() => Engine.text(token, C), /setup text/, token);
}
for (const value of [NaN, Infinity, "6", false, null]) {
  assert.throws(() => Engine.text("{{setup.bad}}", {setup:{bad:value}}), /setup text/);
}
const inherited = Object.create({bad:3});
assert.throws(() => Engine.text("{{setup.bad}}", {setup:inherited}), /setup text/);
const raw = {title:"{{setup.slotsPerSession}} slots", choices:[{label:"Use {{setup.zero}}"}]};
const rendered = Engine.textView(raw,C);
assert.equal(rendered.title,"6 slots"); assert.equal(rendered.choices[0].label,"Use 0");
assert.equal(raw.title,"{{setup.slotsPerSession}} slots");
const vm = require("vm"), Serialise = require("../js/serialise.js");
const model = require("./loadcontent.js").loadContent();
model.events.push({id:"setup_export_probe",title:raw.title,body:raw.title,choices:[]});
const Map = require("../js/prosemap.js");
const rows = Map.collect(model), page = Map.format(model,rows);
assert.ok(page.includes("{{setup.slotsPerSession}} slots"));
const parsed = Map.parse(page,Object.fromEntries(rows.map(r => [r.addr,true])));
assert.equal(parsed.find(r => r.addr === "events/setup_export_probe/body").text,raw.title);
const out = Serialise.files("events",[{id:"setup_export_probe",title:raw.title,body:raw.title,choices:[]}]);
const restored = {};
vm.runInNewContext(out[0].text+";this.events=EVENTS;",restored);
assert.equal(restored.events[0].body,raw.title);
if (process.argv.includes("--unit")) { console.log("setup text unit contracts pass"); process.exit(0); }

/* Exercise the real lint with source injected only into its child process.
   Campaign-only setup must not be judged against the unfiltered world. */
const cp = require("child_process"), path = require("path");
for (const [token,ok] of [["{{setup.reviewOnly}}",true],
  ["{{setup.missing_for_gate}}",false],["{{setup.reviewOnly",false]]) {
  const injected = "ADMINISTRATIONS[0].setup.reviewOnly=17;" +
    "EVENTS.find(e=>[].concat(e.campaign||[]).includes('flash_i')).body += " + JSON.stringify(" "+token) + ";";
  const script = `const vm=require('vm'),LC=require('./tools/loadcontent.js'),source=LC.source;
    LC.source=()=>source()+${JSON.stringify(injected)};
    LC.loadContent=()=>{const ctx={};vm.runInNewContext(LC.source()+';this.C=CONTENT;',ctx);
      ctx.C.tips=LC.loadTips();return ctx.C;};require('./tools/lint.js');`;
  const run = cp.spawnSync(process.execPath,["-e",script],{cwd:path.join(__dirname,".."),encoding:"utf8",windowsHide:true});
  assert.equal(run.status===0,ok,"lint ownership/token gate: "+token+"\n"+run.stdout.slice(-700)+run.stderr);
  if (!ok) assert.match(run.stdout,/INVALID SETUP TEXT[\s\S]*(Unknown|Malformed) setup text/);
}

const H = require("./harness.js"), {w,$,boot,newGame} = H;
boot(); newGame();
const UI = w.eval("UI"), E = w.eval("Engine"), Tips = w.eval("Tips");
const active = UI.content(), s = UI.state();
active.setup.slotsPerSession = 9;
const event = {id:"setup_text_probe",title:"{{setup.slotsPerSession}} slots",
  body:"There are {{setup.slotsPerSession}} slots.",choices:[{label:"Use {{setup.zero}} slots",
    note:"{{setup.slotsPerSession}} remain",result:"{{setup.slotsPerSession}} were available",effects:[]}]};
active.setup.zero = 0;
assert.equal(E.choose(s,active,event,0),"9 were available");
assert.equal(s.log[0].text,"9 slots — Use 0 slots");
active.setup.slotsPerSession = 7;
assert.equal(s.log[0].text,"9 slots — Use 0 slots");
assert.equal(E.load(E.save(s),active).log[0].text,"9 slots — Use 0 slots");
E.apply(s,active,[{wire:"Recorded {{setup.slotsPerSession}} slots"}]);
assert.equal(s.wire[0].text,"Recorded 7 slots");
active.setup.slotsPerSession = 11;
assert.equal(s.wire[0].text,"Recorded 7 slots");
active.setup.slotsPerSession = 7;
const reviewBill = active.bills[0], oldTitle = reviewBill.title;
reviewBill.title = "{{setup.slotsPerSession}} slots";
s.bills[reviewBill.id].stage = "referred";
s.bills[reviewBill.id].returnsAt = s.sitting;
s.bills[reviewBill.id].contested = false;
E.reviewReturns(s,active);
assert.equal(s.wire[0].text,"REVIEW UPHOLDS 7 SLOTS; ACT SIGNED");
active.setup.slotsPerSession = 11;
assert.equal(s.wire[0].text,"REVIEW UPHOLDS 7 SLOTS; ACT SIGNED");
active.setup.slotsPerSession = 7;
reviewBill.title = oldTitle;
reviewBill.amendments = [{id:"setup_amend_probe",label:"{{setup.slotsPerSession}} slots",effects:[]}];
s.bills[reviewBill.id].stage = "committee"; s.bills[reviewBill.id].dead = false;
assert.equal(E.amendBill(s,active,reviewBill.id,"setup_amend_probe").ok,true);
assert.equal(s.bills[reviewBill.id].history[0].text,"Amended: 7 slots");
assert.equal(s.bills[reviewBill.id].amendments.at(-1).label,"7 slots");
E.apply(s,active,[{undertake:{id:"setup_promise_probe",text:"{{setup.slotsPerSession}} slots",by:14}}]);
assert.equal(s.undertakings.find(u=>u.id==="setup_promise_probe").text,"7 slots");
active.events.push(event); active.eventById[event.id] = event;
s.flags.sandbox = true;
UI.sandboxShow(event.id);
assert.match($("#sitting-body").textContent,/There are 7 slots/);
assert.match($("#sitting-body").textContent,/Use 0 slots/);
assert.ok(!$("#sitting-body").textContent.includes("{{setup."));
const frame = w.eval("SetPiece").html({title:"{{setup.slotsPerSession}} slots",body:"{{setup.zero}} used",
  setpiece:{kind:"page"}}).html;
assert.ok(frame.includes("7 slots")); assert.ok(frame.includes("0 used"));
assert.ok(!frame.includes("{{setup."));
const article = active.encyclopedia.articles[0];
article.summary = "{{setup.slotsPerSession}} slots";
article.title = "{{setup.slotsPerSession}} slots";
article.sections = [{heading:"{{setup.zero}} used",text:"{{setup.slotsPerSession}} slots"}];
w.eval("Concordance").render(s,active,article.id,false);
assert.ok($("#s-cx").textContent.includes("7 slots"));
assert.ok(!$("#s-cx").textContent.includes("{{setup."));
assert.equal($("#cx-article .cx-title").textContent,"7 slots");
active.setup.macro.meetingEvery = 35; active.setup.macro.heat.line = 23;
active.setup.macro.rule.inflation = 0.3; active.setup.macro.rule.gap = 0.2;
active.setup.law.threshold_pct = 7; active.setup.law.tier_ratio_list = 88;
UI.redraw();
assert.match($("#p-bank h2").textContent,/35 days/);
assert.match($("#p-bank .note").textContent,/30 per cent of its miss/);
assert.match($("#p-bank .note").textContent,/20 per cent of the output gap/);
for (const [key,want] of [["growth","23"],["reservebank","35 days"],["list","88 seats"],["seats","88 from party lists"],["list","7 per cent"],
  ["rate","30 per cent"],["rate","20 per cent"]]) {
  const el = w.document.createElement("span"); el.dataset.tip = key; el.tabIndex = 0;
  w.document.querySelector("#sitting-body").appendChild(el); el.focus();
  assert.ok($("#tipcard").textContent.includes(want),key+": "+want);
}
active.setup.macro.rule.dualGap = 0.4; s.law.bank_mandate = "dual";
UI.redraw();
assert.match($("#p-bank .note").textContent,/40 per cent of the output gap/);
s.flags.sandbox = false;
w.__NO_TUTORIAL = false;
$("#p-acct").getBoundingClientRect = () => ({left:40,top:40,right:340,bottom:140,width:300,height:100});
w.eval("Shell.setOpt('motion',false); Shell.setOpt('tutorial','on'); Shell.setOpt('taught','')");
active.setup.tutorial = [{id:"setup_tutorial_probe",onTab:"econ",region:"account",
  title:"{{setup.slotsPerSession}} slots",body:"{{setup.zero}} used"}];
UI.openTab("econ"); w.eval("Tutorial").refresh();
assert.equal($("#tut.on h3").textContent,"7 slots");
assert.equal($("#tut.on .tut-body").textContent,"0 used");
console.log("setup text: resolver, history and display contracts pass");
H.finish("setup text is healthy");
