#!/usr/bin/env node
"use strict";
const assert = require("assert/strict");
const T = require("./testkit.js"), E = require("../js/engine.js");

/* Independent inventory: raw simulation roots read by the nine tab
   renderers and their engine readouts. This deliberately does not import
   the production snapshot or route table. Bookkeeping is separately named;
   any new state root fails closed until its display dependencies are audited.
   Mutable Foreign Affairs data includes actors, foreign, forums and resolutions.
   Flags are included: they gate visible business and leadership controls. */
const DISPLAYED = new Set(("sitting session period date inGovernment pm playerParty scalars law standing " +
  "parties currents stations characters bills coalition confidenceSupply capital slots divisionsToday grantsToday " +
  "signatures cabinet instruments whips trends pairs actors foreign lobby clauses prices priceHistory economy " +
  "economyHistory macro president flags undertakings grievances risesAt queue interval roll functional forums " +
  "resolutions debts withdrawn stoodAside polls ballot signedBy refusedBy signedMinutes matters motion " +
  "dissolved resolvedAs settledAs solvencyHistory debt boards closureIndex lastElection electionsHeld " +
  "lastResignation noConfidence pairsKept pendingCeremony resolvedAt slotsGranted supplyLost").split(" "));
const BOOKKEEPING = new Set(("version seed admin campaign chapter since cxRead seen lastFired wire log " +
  "actedThisSitting idleSittings parliamentOpenedAt intervalCourse standingCarry accountCarry " +
  "rolled rolledToday pooled waited rollReseeded functionalReseeded").split(" "));

function independent(st,C) {
  const output = {}, todo = [];
  for (const key of Object.keys(st)) {
    assert(DISPLAYED.has(key) || BOOKKEEPING.has(key), "unclassified state root: " + key);
    if (!DISPLAYED.has(key) || st[key] === undefined) continue;
    const value = key === "undertakings" ? Object.fromEntries((st[key] || []).map(u => [u.id,u]))
      : key === "flags" ? Object.fromEntries(Object.entries(st.flags || {}).filter(([k]) =>
        k === "paper_opened" || k === "pair_offered" || k === "station_issue" || k.startsWith("init_")))
      : key === "actors" ? Object.fromEntries(Object.entries(st.actors || {}).map(([id,a]) => [id,{...a,standing:E.reportedActor(st,id).standing}]))
      : key === "foreign" ? Object.fromEntries(Object.keys(st.foreign || {}).map(id => [id,E.reportedActor(st,id)])) : st[key];
    todo.push(["/" + key,value]);
  }
  if(C) {
    for(const body of C.world?.foreign || []) todo.push(["/worldBodies/"+body.id+"/annexed",!!st.flags["annexed_"+body.id]]);
    for(const r of C.resolutions || []) todo.push(["/controls/resolution:"+r.id+"/ready",E.canTable(st,C,r.id).ok]);
    for(const key of Object.keys(C.setup.locks || {})) todo.push(["/availability/locks/"+key,!!E.lockOf(st,C,key)]);
    for(const key of Object.keys(C.setup.reveals || {})) todo.push(["/availability/reveals/"+key,E.revealed(st,C,key)]);
    // Mirror the renderer's visible controls, not the production projection.
    // Private flags matter only through a control's observable state.
    for(const si of C.instruments || []) {
      const visible = !!st.instruments[si.id]?.made ||
        ((!si.author || !!st.cabinet[si.author]?.holder) && E.matches(st,si.when));
      const item = visible ? {visible:true,make:E.canMake(st,C,si.id).ok,approve:E.canApprove(st,C,si.id).ok} : {visible:false};
      todo.push(["/controls/si:"+si.id,item]);
    }
    for(const i of C.initiatives || []) {
      const visible = !st.flags["init_"+i.id] && E.matches(st,i.when) && (!i.post || !!st.cabinet[i.post]?.holder);
      const left = st.slots.total-st.slots.used, base = i.cost ?? 1;
      todo.push(["/controls/initiative:"+i.id,visible ? {visible:true,ready:base<=left,
        tempo:(i.tempo || []).map(t => E.matches(st,t.when) && base+(t.cost || 0)<=left)} : {visible:false}]);
    }
  }
  while (todo.length) {
    const [path,value] = todo.pop();
    const keys = value && typeof value === "object" ? Object.keys(value) : [];
    if (!value || typeof value !== "object") output[path] = JSON.stringify(value);
    else for (const key of keys) {
      if (value[key] !== undefined) todo.push([path + "/" + key.replaceAll("~","~0").replaceAll("/","~1"),value[key]]);
    }
  }
  return output;
}
function covered(before,after,notices,where,C) {
  const paths = new Set(notices.flatMap(n => {
    assert(["sit","gov","cham","party","rel","econ","orb","world"].includes(n.tab), "invalid notice destination");
    assert(n.kind && n.id && typeof n.summary === "string" && n.summary.length, "incomplete notice contract");
    return n.fields || [];
  }));
  for (const path of new Set([...Object.keys(before),...Object.keys(after)])) {
    if (before[path] === after[path]) continue;
    assert(paths.has(path), where + ": no notice for " + path);
    if (!C) continue;
    const [root,id] = path.slice(1).split("/").map(s=>s.replaceAll("~1","/").replaceAll("~0","~"));
    let tab, open;
    const items={bills:["cham","bill"],clauses:["cham","bill"],cabinet:["gov","post"],
      instruments:["gov","si"],undertakings:["gov","promise"],stations:["orb","station"],
      currents:["party","current"],debts:["econ","money"],matters:["sit","matter"]};
    if (items[root]) { [tab,open]=items[root];open += ":"+id; }
    const panels={
      'econ:economy':'macro economy debt trends','econ:history':'priceHistory economyHistory solvencyHistory',
      'cham:time':'slots grantsToday slotsGranted','cham:composition':'roll functional boards lastElection pairsKept',
      'cham:confidence':'motion inGovernment noConfidence','cham:division':'divisionsToday','cham:law':'law',
      'party:leadership':'signatures signedBy refusedBy ballot playerParty','party:forecast':'standing polls',
      'rel:coalition':'coalition confidenceSupply withdrawn stoodAside supplyLost',
      'sit:calendar':'queue interval risesAt sitting session period date electionsHeld',
      'sit:ending':'dissolved resolvedAs settledAs resolvedAt','sit:business':'flags availability',
      'orb:stations':'grievances closureIndex','gov:cabinet':'pm lastResignation',
      'gov:presidency':'president pendingCeremony','gov:register':'signedMinutes'
    };
    for(const [dest,roots] of Object.entries(panels)) if(roots.split(' ').includes(root)) {
      [tab,open]=dest.split(':');open+=':'+root;
    }
    const keyed={scalars:['sit','figure'],prices:['econ','price'],capital:['rel','ledger'],
      whips:['cham','bill'],pairs:['cham','bill'],lobby:['cham','bill'],forums:['world','forum'],resolutions:['world','resolution']};
    if(keyed[root]) {[tab,open]=keyed[root];open+=':'+id;}
    if(root==='parties') {
      const own=JSON.parse(after['/playerParty']);tab=id===own ? 'party' : 'rel';
      open=(id===own ? 'ownparty:' : 'party:')+id;
    }
    if (root === "controls") { tab=id.startsWith("resolution:") ? "world" : "gov";open=id; }
    if (root === "worldBodies") {tab="world";open="body:"+id;}
    if(root === "availability") {
      const key=path.split('/')[3].replaceAll('~1','/').replaceAll('~0','~');
      const bill=key.startsWith('clause:') && C.bills.find(b=>(b.clauses || []).some(cl=>cl.id===key.slice(7)));
      tab=key==='money' ? 'econ' : 'cham';
      open=bill ? 'bill:'+bill.id : (key==='money' ? 'moneycontrols:' : 'chambercontrols:')+key;
    }
    if (root === "characters") {
      const person=C.characters.find(p=>p.id===id), own=JSON.parse(after["/playerParty"]);
      const post=C.cabinet.find(p=>after["/cabinet/"+p.id+"/holder"]===JSON.stringify(id));
      const party=C.parties.find(p=>p.leader===id);
      if(post) {tab="gov";open="post:"+post.id;}
      else if(person?.party===own && person.current) {tab="party";open="current:"+person.current;}
      else if(party && party.id!==own) {tab="rel";open="party:"+party.id;}
      else if(id===C.setup.president?.id) {tab="gov";open="presidency:"+id;}
      else if(person?.party!==own) {tab="rel";open="opposition:"+id;}
      else {tab="party";open="leadership:"+id;}
    }
    if(root === "actors" || root === "foreign") {
      const actor=C.actors.find(a=>a.id===id);
      tab=root === "foreign" || actor?.foreign ? "world" : actor?.kind === "court" ? "gov" : "cham";
      open=(tab === "gov" ? "tribunal:" : "actor:")+id;
    }
    assert(tab,"unclassified destination for "+path);
    assert(notices.some(n=>n.fields?.includes(path) && n.tab===tab && n.open===open),
      where+": wrong destination for "+path+"; expected "+tab+" "+open);
  }
}

function sampled() {
  const C = T.view("flash_i"), seeds = Number(process.env.NOTICE_SEEDS || 8);
  let answers = 0;
  const strategies = ["first","last","earned","promiser","refuser"];
  for (let seed = 1; seed <= seeds; seed++) for (const strategy of strategies) {
    const st = E.newGame(C,seed);
    for (let sitting = 0; sitting < 40 && !E.checkEnd(st,C).over; sitting++) {
      E.playSitting(st,C,(event,current) => {
        const legal = (event.choices || []).map((ch,i) => ({ch,i})).filter(x => E.choiceOpen(current,C,x.ch));
        for (const {i} of legal) {
          const branch = E.load(E.save(current),C), before = independent(branch,C);
          const result = E.chooseWithNotices(branch,C,event,i);
          covered(before,independent(branch,C),result.notices,"seed " + seed + " " + strategy + " " + event.id + " choice " + i,C);
          answers++;
        }
        const hasPromise = ch => [].concat(ch.effects || []).some(x => x.undertake);
        const wanted = strategy === "last" ? legal[legal.length-1] : strategy === "earned" ? legal.find(x => x.ch.because)
          : strategy === "promiser" ? legal.find(x => hasPromise(x.ch)) : strategy === "refuser" ? legal.find(x => !hasPromise(x.ch)) : null;
        return (wanted || legal[0] || {i:0}).i;
      });
      if (!E.checkEnd(st,C).over) E.advance(st,C);
    }
    assert(E.checkEnd(st,C).over, "sampled path must reach a recorded ending");
  }
  assert(answers > 0, "coverage must exercise legal decision branches");
  console.log("notice coverage: " + answers + " legal answer branches, " + seeds + " seeds, five strategies");
}

function contracts() {
  const verbs = new Set("move court motion economy resolution law station seats functional flag bill coalition wire chapter queue cross vacate_seat election cabinet signatures si slots undertake clause whip discharge".split(" "));
  assert.deepEqual(new Set(Object.keys(require("../js/schema.js").effects)),verbs,"every effect verb has a reviewed displayed-state classification");
  assert.equal(typeof E.noticeSnapshot, "function", "engine exposes detached notice snapshots");
  assert.equal(typeof E.noticeChanges, "function", "engine returns actual displayed-state changes");
  assert.equal(typeof E.chooseWithNotices, "function", "decisions return notices without changing choose's result");
  const C = T.world(), s = E.newGame(C, 1), bill = C.bills[0], post = C.cabinet[0];
  const originalStage = s.bills[bill.id].stage, before = E.noticeSnapshot(s,C);
  s.bills[bill.id].stage = originalStage === "committee" ? "third_reading" : "committee";
  s.clauses[bill.id] = Object.assign({}, s.clauses[bill.id], {notice_probe:"changed"});
  s.cabinet[post.id].holder = null;
  const ns = E.noticeChanges(before,E.noticeSnapshot(s,C),C);
  assert(ns.some(n => n.kind === "bill" && n.tab === "cham" && n.id === bill.id), "bill stage has an item notice");
  assert(ns.some(n => n.kind === "clause" && n.tab === "cham" && n.id === bill.id), "clause-only changes have an item notice");
  assert(ns.some(n => n.kind === "post" && n.tab === "gov" && n.id === post.id), "vacated posts have a notice");
  assert.equal(before.bills[bill.id].stage, originalStage, "notice snapshot does not retain live objects");
  assert.deepEqual(E.noticeChanges(before,before,C), [], "unchanged projections do not announce success");
  const applied = E.apply(s,C,[{signatures:1}]);
  assert(applied.some(n => n.fields.includes("/signatures")), "apply returns notices for actual writes");
  assert.deepEqual(E.apply(s,C,[]), [], "empty effects produce no notice");
  s.scalars.standing = 100;
  assert.deepEqual(E.apply(s,C,[{move:{standing:5}}]), [], "clamped effects do not announce success");
  const e = {id:"notice_probe",title:"Probe",choices:[{label:"Probe",result:"Same result",effects:[{signatures:1}]}]};
  const a = E.newGame(C,2), b = E.newGame(C,2);
  const result = E.choose(a,C,e,0), wrapped = E.chooseWithNotices(b,C,e,0);
  assert.equal(wrapped.result,result, "wrapper preserves choose result");
  assert.equal(E.save(a),E.save(b), "wrapper preserves simulation and save shape");
  assert(wrapped.notices.some(n => n.fields.includes("/signatures")), "decision owns its complete change collection");
  assert.throws(() => independent(Object.assign({},s,{newDisplayedField:1})), /unclassified state root/, "inventory fails closed");
  assert.throws(() => covered({"/signatures":"0"},{"/signatures":"1"},[],"mutation"), /no notice for \/signatures/, "coverage rejects missing notices");
  assert.throws(()=>covered({'/scalars/standing':'1'},{'/scalars/standing':'2'},
    [{kind:'figure',tab:'world',id:'standing',summary:'Probe',open:'figure:standing',fields:['/scalars/standing']}],
    'wrong panel',C),/wrong destination/,"all displayed roots require their own destination");
  const faults = [];
  function regression(name, run) { try { run(); } catch (e) { faults.push(name + ": " + e.message); } }
  regression("instrument condition gates have item notices", () => {
    const st = E.newGame(C,3), si = C.instruments.find(x => st.cabinet[x.author]?.holder);
    const entry = {...si,when:{flags:["notice_control_probe"]}};
    const view = {...C,instruments:[entry],instrumentById:{...C.instrumentById,[si.id]:entry}};
    const before = E.noticeSnapshot(st,view); st.flags.notice_control_probe = true;
    const notices = E.noticeChanges(before,E.noticeSnapshot(st,view),view);
    assert(notices.some(n => n.tab === "gov" && n.open === "si:"+si.id && !n.numeric));
    const displayed = independent(st,view), path = "/controls/si:"+si.id+"/visible";
    assert.equal(displayed[path],"true","independent inventory sees a newly visible instrument");
    assert.throws(() => covered({...displayed,[path]:"false"},displayed,[],"gate",view),/no notice/);
    assert.throws(() => covered({...displayed,[path]:"false"},displayed,
      [{kind:"si",id:si.id,tab:"world",open:"actor:"+si.id,summary:"Probe",fields:[path]}],"gate",view),/wrong destination/);
  });
  regression("initiative tempo gates have item notices", () => {
    const st = E.newGame(C,3), i = C.initiatives.find(x => !x.post || st.cabinet[x.post]?.holder);
    const view = {...C,initiatives:[{...i,when:null,tempo:[{after:1,when:{flags:["notice_control_probe"]}}]}]};
    const before = E.noticeSnapshot(st,view); st.flags.notice_control_probe = true;
    assert(E.noticeChanges(before,E.noticeSnapshot(st,view),view).some(n => n.open === "initiative:"+i.id && !n.numeric));
  });
  regression("Cabinet relationships route to their department", () => {
    const st = E.newGame(C,3), [id,p] = Object.entries(st.cabinet).find(([,p]) => p.holder && p.holder !== st.pm);
    const before = E.noticeSnapshot(st,C); st.characters[p.holder].relationship++;
    assert(E.noticeChanges(before,E.noticeSnapshot(st,C),C).some(n => n.kind === "person" && n.id === p.holder && n.tab === "gov" && n.open === "post:"+id));
  });
  regression("other party leaders route to Relations", () => {
    const st = E.newGame(C,3), p = C.parties.find(p => p.id !== st.playerParty && p.leader &&
      !Object.values(st.cabinet).some(x => x.holder === p.leader));
    const before = E.noticeSnapshot(st,C); st.characters[p.leader].relationship++;
    assert(E.noticeChanges(before,E.noticeSnapshot(st,C),C).some(n => n.id === p.leader && n.tab === "rel" && n.open === "party:"+p.id));
  });
  regression("court standing routes to the Tribunal", () => {
    const st = E.newGame(C,3), actor = C.actors.find(a => a.kind === "court");
    const before = E.noticeSnapshot(st,C); st.actors[actor.id].standing++;
    assert(E.noticeChanges(before,E.noticeSnapshot(st,C),C).some(n => n.id === actor.id && n.tab === "gov" && n.open === "tribunal:"+actor.id));
  });
  regression("enacted bills are not described as fallen", () => {
    const st=E.newGame(C,3), before=E.noticeSnapshot(st,C);
    st.bills[bill.id].stage="assented";st.bills[bill.id].dead=true;
    const notice=E.noticeChanges(before,E.noticeSnapshot(st,C),C).find(n=>n.kind==='bill' && n.id===bill.id);
    assert(notice && !/fallen/.test(notice.summary));
  });
  regression("an instrument and its control produce one item card", () => {
    const st=E.newGame(C,3), si=C.instruments.find(x=>st.cabinet[x.author]?.holder), before=E.noticeSnapshot(st,C);
    st.instruments[si.id].made=true;
    assert.equal(E.noticeChanges(before,E.noticeSnapshot(st,C),C).filter(n=>n.kind==='si' && n.id===si.id).length,1);
  });
  regression("world-body designation has a map notice", () => {
    const st=E.newGame(C,3), body=C.world.foreign[0], before=independent(st,C);
    const ns=E.apply(st,C,[{flag:{['annexed_'+body.id]:true}}]);
    assert(ns.some(n=>n.tab==='world' && n.open==='body:'+body.id));
    assert.equal(independent(st,C)['/worldBodies/'+body.id+'/annexed'],'true');
    assert.throws(()=>covered(before,independent(st,C),[],"map",C),/no notice/);
  });
  regression("resolution condition gates have agenda notices", () => {
    const st=E.newGame(C,3), forum=C.forums.find(f=>f.members.some(m=>m.self));
    const r={id:'notice_resolution',forum:forum.id,sponsor:forum.members.find(m=>m.self).id};
    const entry={...r,when:{flags:['notice_control_probe']}},view={...C,resolutions:[entry],resolutionById:{[r.id]:entry}};
    const before=E.noticeSnapshot(st,view);st.flags.notice_control_probe=true;
    assert(E.noticeChanges(before,E.noticeSnapshot(st,view),view).some(n=>n.tab==='world' && n.open==='resolution:'+r.id));
    assert.equal(independent(st,view)['/controls/resolution:'+r.id+'/ready'],'true');
  });
  regression("money unlocks navigate to the money controls", () => {
    const st=E.newGame(C,3),view={...C,setup:{...C.setup,locks:{money:{when:{flags:['notice_control_probe']}}}}};
    const before=E.noticeSnapshot(st,view);st.flags.notice_control_probe=true;
    assert(E.noticeChanges(before,E.noticeSnapshot(st,view),view).some(n=>n.tab==='econ' && n.open==='moneycontrols:money'));
  });
  assert.deepEqual(faults,[],"notice routing and control regressions");
  console.log("notice contracts: healthy");
}

if (require.main === module) { contracts(); if (!process.env.NOTICE_CONTRACTS_ONLY) sampled(); }
module.exports = {contracts,independent,covered,sampled};
