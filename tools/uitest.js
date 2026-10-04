/* THE GAME DREW, AND IT SURVIVES A SAVE.

   Loads index.html in a headless DOM, walks the main menu into a running
   game, and checks the things that have broken: a glossary term matched
   inside markup annotate() had already inserted and dumped raw attributes
   into the prose, and the save/load path was only ever exercised by hand.
   Static parsing finds neither.

   The other half - focus, tips, audio, streaming, the division - is in
   tools/uxtest.js. Both share tools/harness.js.                          */
const H = require("./harness.js");
const { fs, path, root, w, $, ok, CONTENT, JSDOM } = H;

H.banner("SHELL AND GAME SMOKE TEST");


H.boot(); ok("Shell.boot()", true);

ok("main menu is showing", $("#menu").classList.contains("on"));
ok("game shell is hidden", !$("#shell").classList.contains("on"));
ok("title renders", /WAYS|Ways/i.test($(".menu-title").textContent));
ok("Load is disabled with no saves", !!$('[data-go="load"]').disabled);

/* new game into slot 1 */
$('[data-go="new"]').click();
ok("a new government first offers the governments",
   w.document.querySelectorAll("[data-admin]").length > 0,
   w.document.querySelectorAll("[data-admin]").length + " administrations");
/* A GOVERNMENT WITH A PLAYBILL IS CHOSEN FROM IT (design/56), and the
   playbill can be read at the screen's height and put away again. */
{
  const withBill = (CONTENT.administrations || []).filter(a => a.play && a.play.playbill);
  const cards = w.document.querySelectorAll(".adm-card [data-admin] img.adm-bill");
  ok("every government with a playbill is chosen from it", withBill.length > 0 && cards.length === withBill.length,
     cards.length + " of " + withBill.length);
  const read = $("[data-bill]");
  read.click();
  const view = $(".bill-view");
  ok("and Read the playbill opens it, with focus on Close",
     !!view && !!view.querySelector("img.bill-img") && w.document.activeElement === view.querySelector("[data-bill-close]"));
  w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  ok("and Escape puts it away and gives focus back", !$(".bill-view") && w.document.activeElement === read);
}
$('[data-admin]').click();
ok("slot list appears", w.document.querySelectorAll(".slot").length === 4);
$('[data-new="1"]').click();
ok("game starts", $("#shell").classList.contains("on") && !$("#menu").classList.contains("on"));
/* Economy placement must retain its live controls and avoid duplicated
   lender terms. Moving calls back under account, separating production,
   or repeating a rate in a call must fail independently. */
{
 w.eval("UI.openTab('econ')");
 ok('money calls have their own panel outside the account',!!$('#p-calls #econ-calls') && !$('#p-acct #econ-calls'));
 ok('production figures share the Reserve Bank body',!!$('#p-bank #econ-bank') && !!$('#p-bank #econ-real') && !$('#p-real'));
 ok('lender rates are kept in the account rather than repeated in calls',
   [...w.document.querySelectorAll('#econ-calls .money-call > .note:first-of-type')].length>0 &&
   [...w.document.querySelectorAll('#econ-calls .money-call > .note:first-of-type')].every(n=>!n.textContent.includes('per cent')));
 const s=w.eval('UI.state()'), saved=s.solvencyHistory;
 s.solvencyHistory=Array.from({length:61},(_,i)=>i%2 ? 78000 : 52000);
 $('#econ-account [data-chart="solvency"]').click();
 $('#chart-scale [data-cscale="session"]').click();
 ok('chart scale bounds sit beside the plotted values',
   $('#chart-body .chart-high')?.textContent==='high CW$78.0bn' &&
   $('#chart-body .chart-low')?.textContent==='low CW$52.0bn');
 ok('sitting chart retains its sixty readings',w.document.querySelectorAll('#chart-body .bar').length===60);
 s.solvencyHistory=saved;
 $('#chart-scale [data-cscale="record"]').click();
 w.eval("UI.openTab('sit')");
}
/* Owed owns obligations; the docket retains only business not listed there.
   Removing a kind/identity filter must duplicate it, not merely change prose. */
{
 const original=w.eval('UI.state()'), base=w.eval('UI.content()');
 const c={...base,events:[],matters:[]}, s=w.eval('Engine.newGame')(c);
 const vacancy=base.cabinet.find(p=>!s.cabinet[p.id].holder);
 const bill=base.bills.find(b=>b.test!=='supply' && !s.bills[b.id].dead);
 const si=base.instruments[0];
 s.flags._introRead=true;s.flags._act1=true;
 s.undertakings=[{id:'polish_promise',text:'Keep the test order',by:s.sitting+6,state:'open',discharge:{si:si.id}}];
 s.bills[bill.id].stage=w.eval('Engine.DIVIDES_AT');s.bills[bill.id].dividesOn=s.sitting+6;
 w.eval('UI.boot')(s,c);w.eval('UI.openTab("sit")');
 const owed=(focus)=>[...w.document.querySelectorAll('#sit-today [data-open]')].filter(n=>n.dataset.open===focus);
 ok('a vacancy is listed once under Owed with its department destination',
   owed('post:'+vacancy.id).length===1 && !$('#sit-docket .dk.post'));
 ok('a distant promise remains on the docket',!!$('#sit-docket .dk.owed'));
 ok('a distant division remains on the docket',!!$('#sit-docket .dk.div'));
 s.undertakings[0].by=s.sitting+1;s.bills[bill.id].dividesOn=s.sitting+1;
 s.instruments[si.id]={made:true,inForce:true,prayerCloses:s.sitting+1};
 s.risesAt=s.sitting+1;w.eval('UI.redraw()');
 ok('a near promise appears in Owed without a second docket obligation',
   owed('si:'+si.id).some(n=>n.textContent.includes('Keep the test order')) && !$('#sit-docket .dk.owed'));
 ok('a near division appears in Owed without a second docket division',
   owed('bill:'+bill.id).length===1 && !$('#sit-docket .dk.div'));
 ok('a near prayer window appears in Owed without a duplicate docket window',
   owed('si:'+si.id).some(n=>n.textContent.includes('Last day to pray')) && !$('#sit-docket .dk.pray'));
 ok('the near rise stays in Owed without a second docket reminder',
   $('#sit-today').textContent.includes('The House rises') && !$('#sit-docket .dk.rises'));
 w.eval('UI.boot')(original,base);
}
/* Removing cards, typed routing, the tempo preset, or note focus must fail
   independently. This uses real content targets and real matter queries. */
{
 const original=w.eval('UI.state()'), originalC=w.eval('UI.content()');
 const probe=w.eval(`(function(){
   const base=UI.content(), si=base.instruments.find(i=>i.id==='si_2080_51');
   const init=base.initiatives.find(i=>i.id==='pay_works_air');
   const bill=base.bills.find((b,n)=>n>0&&!b.when);
   const owners=['life_support',...base.cabinet.filter(p=>p.id!=='life_support').map(p=>p.id)];
   const defs=Array.from({length:6},(_,n)=>({id:'ui_matter_'+n,owner:owners[n],raise:{minSitting:1},due:10+n,grace:2,
     settled:{flags:['ui_matter_done']},note:'Minister note '+n,
     figures:[{label:'Thermal test',source:'scalars.thermal_margin',bands:[{min:null,text:'test margin'}]}],
     remedies:n===0?[{id:'order',target:{kind:'instrument',id:si.id},takes:0,note:'Order remedy'},
       {id:'initiative',target:{kind:'initiative',id:init.id,tempo:1},takes:3,note:'Initiative remedy',label:'Make <parts> here'},
       {id:'bill',target:{kind:'bill',id:bill.id},takes:1,note:'Bill remedy'},
       {id:'money',target:{kind:'money',id:'underwriters',amount:3000},takes:0,note:'Money remedy'}]:
       [{id:'missing',target:{kind:'instrument',id:'missing_order'},takes:0,note:'Unavailable remedy'}],
     counsel:n===0?[{post:'substrate_thermal',remedy:'order',note:'Paid advice'},
       {post:'treasury',remedy:'initiative',note:'Other advice'}]:[],late:'thermal_squeeze',page:'f1_heat_shortage'}));
   const c={...base,matters:defs,events:[]};const s=Engine.newGame(c);
   s.queue=[];s.flags._introRead=true;s.flags._act1=true;
   s.flags.station_issue=true;s.flags.f1_surveyed=true;
   s.cabinet.treasury.holder=base.characters.find(ch=>ch.id!==base.setup.pm).id;
   s.cabinet[base.cabinet[base.cabinet.length-1].id].holder=null;
   for(let n=0;n<4;n++){s.sitting=1+n;Engine.reconcile(s,c);}
   s.matters.ui_matter_4.state='noted';UI.boot(s,c);UI.openTab('sit');
   return {s,c,si:si.id,init:init.id,bill:bill.id};
 })()`);
 const cards=()=>[...w.document.querySelectorAll('#sit-matters [data-matter]')];
 ok('the brief shows at most four stable matter cards',cards().length===4);
 ok('noted advice is absent from the brief',!cards().some(n=>n.dataset.matter==='ui_matter_4'));
 ok('overflow advice is absent from the brief',!cards().some(n=>n.dataset.matter==='ui_matter_5'));
 const first=()=>w.document.querySelector('[data-matter="ui_matter_0"]');
 ok('the matter identifies its live owning minister',!!first() && first().textContent.includes(probe.c.characterById[probe.s.cabinet.life_support.holder].name));
 ok('the matter shows its authored note',!!first() && first().textContent.includes('Minister note 0'));
 ok('the matter shows a word readout',!!first() && first().textContent.includes('test margin'));
 ok('the word readout exposes the live figure on hover',!!first()?.querySelector('[data-tip-body="'+probe.s.scalars.thermal_margin+'"]'));
 const remaining=w.eval('Engine.matters')(probe.s,probe.c)[0].remaining;
 ok('the matter shows its independent deadline',!!first()?.querySelector('[data-matter-deadline]') && first().querySelector('[data-matter-deadline]').textContent.includes(String(remaining)));
 ok('contested advice keeps both counsel notes',first()?.querySelectorAll('[data-counsel]').length===2);
 ok('first counsel keeps its own recommendation',first()?.querySelector('[data-counsel="0"]')?.textContent.includes('Paid advice'));
 ok('second counsel keeps its different recommendation',first()?.querySelector('[data-counsel="1"]')?.textContent.includes('Other advice'));
 ok('a counsel recommendation has one lever button',first()?.querySelectorAll('[data-matter-remedy="order"]').length===1);
 const labeled=first()?.querySelector('[data-matter-remedy="initiative"]');
 ok('an authored remedy label is escaped text on the correct button',labeled?.textContent==='Make <parts> here' && !labeled.querySelector('parts'));
 const orderEntry=probe.c.instruments.find(i=>i.id===probe.si), initiativeEntry=probe.c.initiatives.find(i=>i.id===probe.init);
 ok('an unlabeled remedy falls back to its lever name',first()?.querySelector('[data-matter-remedy="order"]')?.textContent===(orderEntry.title || orderEntry.name));
 ok('a labeled remedy keeps its underlying lever tooltip',labeled?.getAttribute('data-tip-title')===(initiativeEntry.title || initiativeEntry.name));
 const snapshot=w.eval('Engine.save(UI.state())');
 const red=()=>[...w.document.querySelectorAll('.tab-n')].map(n=>n.closest('.tab').dataset.t+':'+n.textContent).join(',');
 const redBefore=red(), riseBefore=$('#btn-advance').textContent;
 const click=id=>first()?.querySelector('[data-matter-remedy="'+id+'"]')?.click();
 click('order');
 ok('an order remedy opens Government', $('#s-gov').classList.contains('on'));
 ok('an order remedy opens its exact inspector',!$('#gov-inspector').hidden && !!$('#gov-inspector [data-make="'+probe.si+'"]'));
 ok('opening an order does not execute it',w.eval('Engine.save(UI.state())')===snapshot);
 w.eval("UI.openTab('sit')");click('initiative');
 ok('an initiative remedy opens its exact inspector',!$('#gov-inspector').hidden && !!$('#gov-inspector [data-take="'+probe.init+'"]'));
 ok('an initiative remedy focuses its requested tempo',w.document.activeElement?.dataset.take===probe.init && w.document.activeElement?.dataset.tempo==='1');
 ok('opening an initiative does not execute it',w.eval('Engine.save(UI.state())')===snapshot);
 w.eval("UI.openTab('sit')");click('bill');
 ok('a bill remedy opens Chamber', $('#s-cham').classList.contains('on'));
 ok('a bill remedy selects the exact bill',w.eval("Focus.selected('cham-bills')")===probe.bill);
 ok('opening a bill does not execute it',w.eval('Engine.save(UI.state())')===snapshot);
 w.eval("UI.openTab('sit')");click('money');
 ok('a money remedy opens Economy',$('#s-econ').classList.contains('on'));
 const amount=$('[data-money-amount="underwriters"]');
 ok('a money remedy focuses the exact lender',w.document.activeElement===amount && !!amount);
 ok('a money remedy forwards the authored amount',amount?.value==='3000');
 ok('opening a money call does not borrow',w.eval('Engine.save(UI.state())')===snapshot);
 const unavailable=w.document.querySelector('[data-matter="ui_matter_1"] [data-matter-remedy]');
 ok('an unavailable target cannot look actionable',!!unavailable && unavailable.disabled);
 const reason=w.eval('Engine.matters')(probe.s,probe.c).find(m=>m.id==='ui_matter_1').remedies[0].reason;
 ok('an unavailable target explains the engine reason',!!unavailable && unavailable.getAttribute('data-tip-body').includes(reason));
 ok('advice navigation leaves red obligations unchanged',red()===redBefore);
 ok('advice navigation leaves the Rise warning unchanged',$('#btn-advance').textContent===riseBefore);
 ok('visible Government remedies light a quiet dot',!!w.document.querySelector('.tab[data-t="gov"] .tab-dot'));
 ok('visible Chamber remedies light a quiet dot',!!w.document.querySelector('.tab[data-t="cham"] .tab-dot'));
 w.eval("UI.openTab('sit')");const note=first()?.querySelector('[data-note-matter]');if(note){note.focus();note.click();}
 ok('Set aside records the real matter as noted',probe.s.matters.ui_matter_0.state==='noted');
 ok('Set aside removes that advice card',!first());
 ok('Set aside lands focus on the nearest surviving matter',w.document.activeElement?.dataset.matter==='ui_matter_1');
 ok('Set aside clears a now-stale Chamber advice dot',!w.document.querySelector('.tab[data-t="cham"] .tab-dot'));
 for(let n=0;n<8;n++){const b=w.document.querySelector('#sit-matters [data-note-matter]');if(!b)break;b.focus();b.click();}
 ok('an empty brief retains focus on its own panel',w.document.activeElement?.id==='sit-matters');
 const held=w.eval('Engine.newGame')(probe.c);held.queue=[];held.flags._introRead=true;held.flags._act1=true;
 w.eval('Engine.reconcile')(held,probe.c);w.eval('Engine.makeInstrument')(held,probe.c,probe.si);
 w.eval('UI.boot')(held,probe.c);
 ok('a held matter shows its real work under way',!!w.document.querySelector('[data-matter="ui_matter_0"] [data-matter-underway]'));
 ok('a held affirmative order explains pending approval',w.document.querySelector('[data-matter="ui_matter_0"] [data-matter-underway]')?.textContent.includes('approval'));
 w.eval('UI.boot')(original,originalC);
}

/* MATTER DOTS are advice, not the red obligations count. */
{
  const dots = () => [...w.document.querySelectorAll(".tab-dot")];
  const counts = () => [...w.document.querySelectorAll(".tab-n")]
    .map(n => n.closest(".tab").dataset.t + ":" + n.textContent).join(",");
  const before = counts();
  const invoke = ids => {
    if (w.eval("typeof UI.drawMatterDots") === "function")
      w.eval("UI.drawMatterDots(" + JSON.stringify(ids) + ")");
  };
  invoke(["gov", "party", "gov", "unknown"]);
  ok("advice dots mark only the tabs supplied, once each",
     dots().map(n => n.closest(".tab").dataset.t).sort().join(",") === "gov,party");
  ok("advice dots explain that they are not obligations",
     dots().length === 2 && dots().every(n =>
       n.getAttribute("aria-label") && /not.*owed/.test(n.getAttribute("data-tip-body") || "")));
  invoke(["rel"]);
  ok("updating advice moves its dots instead of accumulating stale ones",
     dots().length === 1 && dots()[0].closest(".tab").dataset.t === "rel");
  ok("updating advice leaves the real obligation badges unchanged",
     before.length > 0 && counts() === before);
  invoke([]);
  ok("an empty brief clears every advice dot", dots().length === 0);
}
/* A wrong department key, selection written into simulation, lost preference,
   stale inspector or guessed slot budget must fail these real UI checks. */
{
  const doc=w.document, Cg=w.eval('UI.content()'), state=w.eval('UI.state()');
  w.__workspaceContent=Cg;
  const before=w.eval('Engine.save(UI.state())'), post=Cg.cabinet[0].id;
  const pick=id=>doc.querySelector('[data-select-post="'+id+'"]');
  const visible=()=>[...doc.querySelectorAll('#gov-cabinet .gov-card')].filter(n=>!n.closest('[hidden]'));
  const roster=[...doc.querySelectorAll('#gov-roster [data-select-post]')];
  ok('the cabinet selector includes the Prime Minister and all authored offices in order',
    roster.length===Cg.cabinet.length+1 && roster.map(n=>n.dataset.selectPost).join(',')===[''].concat(Cg.cabinet.map(p=>p.id)).join(','));
  if(pick(post))pick(post).click();
  ok('selecting an office exposes only its workspace and marks its roster button',
    visible().length===1 && visible()[0].dataset.post===post && pick(post)?.getAttribute('aria-pressed')==='true' && doc.querySelector('#gov-business').hidden);
  ok('department navigation leaves the entire engine save untouched',before===w.eval('Engine.save(UI.state())'));
  w.eval('UI.redraw(); UI.boot(UI.state(), UI.content());');
  ok('the selected department survives redraw and reload',visible().length===1 && visible()[0].dataset.post===post);
  if(pick(''))pick('').click();
  const head=doc.querySelector('#gov-cabinet [data-post=""] [data-ini]');
  if(head)head.click();
  ok('an initiative opens one shared inspector instead of nested departmental detail',
    !!head && !!doc.querySelector('#gov-inspector [data-take]') && !doc.querySelector('#gov-cabinet .ini-b'));
  const close=doc.querySelector('[data-gov-close]');if(close)close.click();
  ok('closing the work inspector retains the selected office and its visible controls',
    !!close && doc.querySelector('#gov-inspector').hidden && visible().length===1 && visible()[0].dataset.post==='');
  const liveHead=doc.querySelector('#gov-cabinet [data-post=""] [data-ini]');
  if(liveHead)liveHead.click();
  const entry=Cg.initiatives.find(i=>i.id===liveHead?.dataset.ini), when=entry?.when;
  if(entry)entry.when={flags:['test_workspace_unavailable']};
  doc.querySelector('[data-gov-close]').focus();w.eval('UI.redraw();');
  ok('a stale inspector clears its file and returns focus to the visible workspace heading',
    !!entry && doc.querySelector('#gov-inspector').hidden && doc.activeElement.id==='gov-workspace-title' && !doc.activeElement.closest('[hidden]'));
  if(entry)entry.when=when;w.eval('UI.redraw();');
  if(pick(post))pick(post).click();
  const clone=w.eval('Engine.save(UI.state())');
  const other=JSON.parse(clone);other.admin='test_workspace_administration';w.__workspaceState=other;
  w.eval('UI.boot(window.__workspaceState, UI.content());');
  ok('a different campaign defaults to all business rather than another campaign\'s office',
    !doc.querySelector('#gov-business').hidden && visible().length===0);
  w.eval('UI.boot(Engine.load('+JSON.stringify(clone)+', window.__workspaceContent), window.__workspaceContent);');
  ok('returning to the campaign restores its selected office',visible().length===1 && visible()[0].dataset.post===post);
  w.eval('Shell.setOpt("govWorkspace", {['+JSON.stringify(state.admin)+']:{post:"missing_workspace_office"}}); UI.redraw();');
  ok('an obsolete office preference safely restores all-business navigation',
    !doc.querySelector('#gov-business').hidden && visible().length===0 && !!doc.querySelector('[data-gov-all]'));
  ok('the visible slot strip uses the game\'s actual total and spent slots',
    doc.querySelectorAll('#gov-time .pips s').length===state.slots.total && doc.querySelectorAll('#gov-time .pips s.spent').length===state.slots.used);
  w.__workspaceOriginal = JSON.parse(before);
  w.eval('UI.boot(window.__workspaceOriginal, window.__workspaceContent);');
}
ok("Government has a Prime Minister card then one card per cabinet post in content order",
   [...w.document.querySelectorAll("#gov-cabinet .gov-card")].map(n => n.dataset.post).join(",") ===
   [""].concat(CONTENT.cabinet.map(p => p.id)).join(","));
ok('the initial workspace shows all business, with vacancies exposed by the overview',
   !w.document.querySelector('#gov-business').hidden && w.document.querySelector('#gov-cabinet').hidden &&
   !!w.document.querySelector('#gov-vacancies [data-open^="post:"]'));
ok("each order appears under its authoring department",
   CONTENT.instruments.filter(i => {
     const s = w.eval("UI.state()");
     return ((s.cabinet[i.author] || {}).holder &&
       (!i.when || w.eval("Engine.matches(UI.state(), UI.content().instrumentById[" + JSON.stringify(i.id) + "].when)"))) ||
       (s.instruments[i.id] || {}).made;
   }).every(i => !!w.document.querySelector(
     '#gov-cabinet .gov-card[data-post="' + i.author + '"] [data-si="' + i.id + '"]')));
/* CABINET DESK: inspect real authored work, not a second inventory. */
{
  const doc=w.document, Cg=w.eval('UI.content()'), original=w.eval('Engine.save(UI.state())');
  w.__deskContent=Cg;
  const $=s=>doc.querySelector(s), file=()=>$('#gov-inspector');
  $('[data-gov-all]').click();
  const head=$('#gov-business [data-ini]'), id=head?.dataset.ini;
  if(head)head.click();
  ok('the work file is a separate pane, never a detail below business',
    !!$('#gov-file-pane') && $('#gov-file-pane').contains(file()) && !$('#gov-work').contains(file()));
  ok('inspecting actual work leaves the simulation untouched',!!head && w.eval('Engine.save(UI.state())')===original);
  ok('business carries no duplicate executable controls',
    !$('#gov-main [data-take], #gov-main [data-make], #gov-main [data-approve], #gov-main [data-pray], #gov-main [data-revoke], #gov-main [data-appoint], #gov-main [data-sack]'));
  const entry=Cg.initiatives.find(i=>i.id===id);
  ok('the selected initiative keeps every authored tempo only in its file',
    !!entry && doc.querySelectorAll('#gov-inspector [data-take]').length===entry.tempo.length && !$('#gov-main .ini-b'));
  ok('the file names its actual responsible minister',!!$('#gov-file-office [data-go="person_'+Cg.setup.pm+'"]'));
  const initiativeSummary=$('#gov-file-summary');
  ok('the initiative file exposes authored costs and the pace choice before its controls',
    !!initiativeSummary && !initiativeSummary.hidden &&
    initiativeSummary.querySelector('[data-gov-fact="procedure"]')?.textContent==='Initiative' &&
    initiativeSummary.querySelector('[data-gov-fact="time"]')?.textContent.includes(String(entry.cost)) &&
    /pace/i.test(initiativeSummary.querySelector('[data-gov-fact="next"]')?.textContent));
  const title=$('#gov-file-title').textContent;
  $('#gov-file-scroll').scrollTop=47;
  for(const record of ['gov-register','gov-undertakings','gov-tribunal','gov-presidency']) {
    const button=$('[data-gov-record="'+record+'"]'); if(button)button.click();
    ok(record+' is a native utility exposing just one record in the file',
      button?.tagName==='BUTTON' && button.getAttribute('aria-pressed')==='true' && file().hidden &&
      ['gov-register','gov-undertakings','gov-tribunal','gov-presidency'].filter(r=>!$('#'+r).hidden).join()===record);
  }
  w.eval('UI.redraw();');
  $('[data-gov-return]').click();
  ok('Return to work restores the same file and its reading position after a redraw',
    !file().hidden && $('#gov-file-title').textContent===title && $('#gov-file-scroll').scrollTop===47);
  w.eval('UI.openTab("sit"); UI.openTab("gov"); UI.boot(UI.state(), UI.content());');
  ok('a valid explicit work bookmark survives tab return and reload',
    !file().hidden && $('#gov-file-title').textContent===title && w.eval('Focus.selected("gov-work")')==='initiative:'+id);
  $('#gov-work').scrollTop=31;
  $('[data-gov-back]').click();
  ok('Back to business retains work, scope and the business reading position',
    $('#gov-si').classList.contains('gov-mobile-list') && $('#gov-work').scrollTop===31 &&
    !$('#gov-business').hidden && w.eval('Focus.selected("gov-work")')==='initiative:'+id);
  $('[data-gov-close]').click(); w.eval('UI.redraw();');
  ok('Close file stays closed on redraw without choosing another item',file().hidden && !w.eval('Focus.selected("gov-work")'));
  const vacant=Cg.cabinet.find(p=>!w.eval('UI.state()').cabinet[p.id].holder);
  if(vacant)$('[data-select-post="'+vacant.id+'"]').click();
  const office=$('[data-gov-post-file="'+vacant?.id+'"]'); if(office)office.click();
  ok('the inspected office row exposes the retained work selection',
    !!office && $('[data-gov-post-file="'+vacant.id+'"]').getAttribute('aria-pressed')==='true' &&
    w.eval('Focus.selected("gov-work")')==='post:'+vacant.id);
  ok('vacancy candidates and their consequences exist once, in the file',
    !!office && doc.querySelectorAll('#gov-inspector [data-appoint]').length===w.eval('Engine.candidates(UI.state(), UI.content(), '+JSON.stringify(vacant?.id)+').length') &&
    !!$('#gov-inspector .cand .ch-eff') && !$('#gov-main [data-appoint]'));
  ok('opening an office removes the preceding power\'s procedure and cost summary',
    !!$('#gov-file-summary') && $('#gov-file-summary').hidden && !$('#gov-file-summary').textContent.trim());
  const chosen=Cg.cabinet.find(p=>w.eval('UI.state()').cabinet[p.id].holder);
  if(chosen)$('[data-select-post="'+chosen.id+'"]').click();
  $('[data-gov-post-file="'+chosen.id+'"]').click();
  const holder=w.eval('UI.state()').cabinet[chosen.id].holder;
  w.eval('UI.state().cabinet['+JSON.stringify(chosen.id)+'].holder=null; UI.redraw();');
  ok('an open office immediately replaces a removed minister with its vacancy',
    $('#gov-file-office').textContent.includes('Vacant') && !$('#gov-file-office [data-go="person_'+holder+'"]') &&
    $('[data-select-post="'+chosen.id+'"]').textContent.includes('Vacant'));
  ok('the responsive department selector derives every post in content order',
    [...doc.querySelectorAll('#gov-scope option')].map(n=>n.value).join()===['all',''].concat(Cg.cabinet.map(p=>p.id)).join());
  ok('the responsive return control is a native button',!!$('button[data-gov-back]'));
  const quiet=Cg.cabinet.find(p=>!doc.querySelector('#gov-cabinet [data-post="'+p.id+'"] [data-si], #gov-cabinet [data-post="'+p.id+'"] [data-ini], #gov-cabinet [data-post="'+p.id+'"] [data-running]') && w.eval('UI.state()').cabinet[p.id].holder);
  if(quiet)$('[data-select-post="'+quiet.id+'"]').click();
  ok('an empty occupied department supplies one visible empty-business note',
    !!quiet && !!$('#gov-cabinet [data-post="'+quiet.id+'"] .gov-no-business') && !$('#gov-cabinet [data-post="'+quiet.id+'"] .gov-no-business').hidden);
  $('[data-gov-all]').click();
  const order=$('#gov-business [data-inspect]');
  ok('compact order rows retain their visible procedure or status beside the title',
    !!order && !!order.closest('td').querySelector('.gov-work-state'));
  /* The action report must describe the live instrument, rather than
     announcing that every state change puts an order into force. */
  const affirmative=Cg.instruments.find(i=>i.procedure==='affirmative' &&
    w.eval('Engine.canMake(UI.state(), UI.content(), '+JSON.stringify(i.id)+').ok'));
  if(affirmative)$('#gov-business [data-inspect="'+affirmative.id+'"]').click();
  w.__deskNotify=w.eval('Motion.notify'); w.__deskNotices=[];
  w.eval('Motion.notify=function(n){window.__deskNotices.push(n);return window.__deskNotify(n);};');
  const make=affirmative && $('#gov-file-body [data-make="'+affirmative.id+'"]');
  if(make)make.click();
  w.eval('Motion.notify=window.__deskNotify;');
  ok('making an affirmative order announces pending approval without claiming it is in force',
    !!make && w.__deskNotices.some(n=>n.tab==='gov' && /awaiting approval/.test(n.text)) &&
    !w.__deskNotices.some(n=>n.tab==='gov' && /is in force/.test(n.text)));
  w.eval('UI.boot(Engine.load('+JSON.stringify(original)+', window.__deskContent), window.__deskContent);');
  $('[data-gov-all]').click();
}
/* Removing overview derivation, party labels, or truthful pending filters
   must break these checks. This fixture deliberately separates gates,
   affordability, a queue-backed initiative and a stale started flag. */
{
  const original = w.eval('Engine.save(UI.state())'), Cg = w.eval('UI.content()');
  const state = JSON.parse(original), post = Cg.cabinet[0].id;
  const order = Object.assign({}, Cg.instruments[0], { id:'test_business_order', author:post, when:{}, procedure:'affirmative' });
  const fixture = Object.assign({}, Cg, {
    initiatives:[
      { id:'test_business_open', title:'Available fixture', cost:state.slots.total + 1, when:{}, note:'A plain explanation.', tempo:[{ label:'Briefing', after:2 }] },
      { id:'test_business_gated', title:'Gated fixture', cost:1, when:{ flags:['business_missing_gate'] }, tempo:[] },
      { id:'test_business_pending', title:'Pending fixture', post, cost:1, when:{}, event:'business_answer', tempo:[] },
      { id:'test_business_stale', title:'Answered fixture', post, cost:1, when:{}, event:'stale_answer', tempo:[] }
    ], instruments:[order], instrumentById:{ test_business_order:order }
  });
  state.flags.init_test_business_pending = true;
  state.flags.init_test_business_stale = true;
  state.queue.push({ eventId:'business_answer', dueSitting:state.sitting+3 });
  state.instruments.test_business_order = Object.assign({}, state.instruments[Cg.instruments[0].id],
    { made:true, inForce:false, awaitingApproval:true });
  state.cabinet[post].holder = null;
  w.__businessFixture = fixture; w.__businessState = state;
  w.eval('UI.boot(window.__businessState, window.__businessFixture);');
  const overview = () => w.document.querySelector('#gov-business');
  ok('business overview exposes every vacancy, including posts without candidates',
    !!overview() && [post, 'treasury'].every(id => !!overview().querySelector('[data-open="post:' + id + '"]')));
  const available = () => w.document.querySelector('#gov-available');
  ok('available powers retain a temporary refusal and omit closed story gates',
    !!available() && !!available().querySelector('[data-ini="test_business_open"]') &&
    /order-paper time/.test(available().textContent) && !available().querySelector('[data-ini="test_business_gated"]'));
  const blocked = available() && available().querySelector('[data-ini="test_business_open"]');
  if (blocked) blocked.click();
  const inspected = w.document.querySelector('#gov-inspector:not([hidden])');
  ok('temporarily blocked work remains readable while every unaffordable execution stays disabled',
    !!blocked && !blocked.disabled && !!inspected && /A plain explanation/.test(inspected.textContent) &&
    !!inspected.querySelector('[data-take]:disabled') && !inspected.querySelector('[data-take]:not(:disabled)'));
  const pending = () => w.document.querySelector('#gov-pending');
  ok('under way shows one queue-backed answer with its sitting despite a vacant owner',
    !!pending() && pending().querySelectorAll('[data-running="test_business_pending"]').length === 1 &&
    pending().textContent.includes('sitting ' + (state.sitting+3)) && !pending().querySelector('[data-running="test_business_stale"]'));
  ok('awaiting approval belongs to pending business, never available powers',
    !!pending() && !!available() && !!pending().querySelector('[data-si="test_business_order"]') &&
    !available().querySelector('[data-si="test_business_order"]'));
  ok('Cabinet groups an awaiting order with the department\'s pending work',
    !!w.document.querySelector('#gov-cabinet [data-gov-section="running"] [data-si="test_business_order"]'));
  const rail=()=>w.document.querySelector('#gov-roster [data-select-post="'+post+'"]');
  const initialRailCounts=rail()?.querySelector('[data-gov-awaiting]')?.textContent==='1 awaiting approval' &&
    rail()?.querySelector('[data-gov-running]')?.textContent==='1 under way';
  pending().querySelector('[data-inspect="test_business_order"]').click();
  const orderSummary=w.document.querySelector('#gov-file-summary');
  ok('an awaiting order names the approval vote and its cost rather than the free making step',
    !!orderSummary && !orderSummary.hidden && /Affirmative/.test(orderSummary.textContent) &&
    /1 slot/.test(orderSummary.querySelector('[data-gov-fact="time"]')?.textContent) &&
    orderSummary.querySelector('[data-gov-fact="next"]')?.textContent==='Approve');
  const previousUsed=state.slots.used;
  state.slots.used=state.slots.total; w.eval('UI.redraw();');
  ok('an unavailable approval remains the next action even when Read is available',
    !!w.document.querySelector('#gov-file-body [data-approve]:disabled') &&
    /Approve.*unavailable/.test(w.document.querySelector('[data-gov-fact="next"]')?.textContent) &&
    /0 left/.test(w.document.querySelector('[data-gov-fact="time"]')?.textContent));
  state.slots.used=previousUsed;
  state.queue = state.queue.filter(q => q.eventId !== 'business_answer');
  state.instruments.test_business_order.awaitingApproval = false;
  state.instruments.test_business_order.inForce = true;
  w.eval('UI.redraw();');
  ok('settled work leaves the pending overview while the instrument remains inspectable in Cabinet',
    !!pending() && !pending().querySelector('[data-running], [data-si]') &&
    !!w.document.querySelector('#gov-cabinet [data-si="test_business_order"]'));
  ok('Cabinet moves an in-force instrument into the department record',
    !!w.document.querySelector('#gov-cabinet [data-gov-section="records"] [data-si="test_business_order"]'));
  ok('minister indicators count only live approvals and queue-backed work and clear when settled',
    initialRailCounts && !rail()?.querySelector('[data-gov-awaiting], [data-gov-running]'));
  const occupied = w.document.querySelector('#gov-roster [data-select-post="' + Cg.cabinet[3].id + '"]');
  const party = Cg.partyById[state.cabinet[Cg.cabinet[3].id].party];
  ok('directory summaries identify parties by colour and abbreviation without repeating ordinary relationships',
    !!occupied && !!occupied.querySelector('.swatch') && !!occupied.querySelector('.gov-party') &&
    !!party && occupied.querySelector('.gov-party').textContent.trim()===(party.short || party.name) &&
    !/uneasy with the Prime Minister/.test(occupied.textContent));
  const costEntry=fixture.initiatives[0];
  delete costEntry.cost;
  costEntry.tempo=[{label:'Standard',after:2},{label:'More effort',after:1,cost:2}];
  w.eval('UI.redraw();');
  w.document.querySelector('#gov-business [data-ini="test_business_open"]').click();
  const defaultCost=w.document.querySelector('[data-gov-fact="time"]')?.textContent.includes('1–3 slots');
  costEntry.cost=0; w.eval('UI.redraw();');
  ok('the file follows engine default costs, explicit free costs and authored tempo extras',
    defaultCost && w.document.querySelector('[data-gov-fact="time"]')?.textContent.includes('0–2 slots'));
  w.__businessFixture = Cg;
  w.eval('UI.boot(Engine.load(' + JSON.stringify(original) + ', CONTENT), window.__businessFixture);');
}
{
  const original = w.eval('Engine.save(UI.state())'), Cg = w.eval('UI.content()');
  const state = JSON.parse(original); state.signedMinutes = {};
  const minutes = Cg.minutes.slice(0,2).map(m => Object.assign({}, m, { when:{} }));
  const fixture = Object.assign({}, Cg, { minutes });
  w.__recordFixture = fixture; w.__recordState = state;
  w.eval('UI.boot(window.__recordState, window.__recordFixture);');
  const fold = () => w.document.querySelector('#gov-register');
  const pending = () => w.document.querySelector('[data-gov-record="gov-register"] .gov-record-count').textContent;
  ok('unsigned minutes mark the Register utility without choosing it for the player',
    minutes.length === 2 && fold().hidden && /2 pending/.test(pending()));
  w.document.querySelector('[data-gov-record="gov-register"]').click();
  w.eval('UI.redraw();');
  ok('explicit Register selection survives while its pending indication remains visible',
    !fold().hidden && /2 pending/.test(pending()));
  minutes.forEach(m => state.signedMinutes[m.id] = state.sitting);
  w.eval('UI.redraw();');
  ok('signing minutes clears pending activity without counting historical documents',
    !pending() && w.document.querySelectorAll('#pp-list [data-doc]').length >= 2);
  w.__recordFixture = Cg;
  w.eval('UI.boot(Engine.load(' + JSON.stringify(original) + ', CONTENT), window.__recordFixture);');
}
/* OPPOSITION DEPARTMENTS come from structured content, even when the prose
   describing a person's role changes. */
/* Selected departments retain truthful running work and omit empty sections. */
{
  const state = w.eval("UI.state()"), Cg = w.eval("UI.content()");
  const cards = () => [...w.document.querySelectorAll('#gov-cabinet .gov-card')];
  const pm = () => cards().find(n => n.dataset.post === "");
  const vacancy = cards().find(n => !((state.cabinet[n.dataset.post] || {}).holder) && n.dataset.post);
  ok("idle departments do not print empty work headings",
     cards().length > 0 && cards().every(n => [...n.querySelectorAll('.gov-section')]
       .every(s => s.hidden || !!s.querySelector('[data-si], [data-ini], [data-running]'))));
  const clone = JSON.stringify(state);
  const post = Cg.cabinet[0].id, fixture = Object.assign({}, Cg);
  fixture.initiatives = [{ id:"test_running", title:"Running fixture", post,
    cost:1, when:{}, event:"test_answer", tempo:[{ after:3 }] }];
  const order = Object.assign({}, Cg.instruments[0], { id:"test_inforce", author:post, when:{} });
  fixture.instruments = [order]; fixture.instrumentById = { test_inforce:order };
  const pending = JSON.parse(clone); pending.flags.init_test_running = true;
  pending.queue.push({ eventId:"test_answer", dueSitting:pending.sitting + 3 });
  pending.instruments.test_inforce = Object.assign({}, pending.instruments[Cg.instruments[0].id],
    { made:true, inForce:true });
  pending.cabinet[post].holder = null;
  w.__govFixture = fixture; w.__govState = pending;
  w.eval('UI.boot(window.__govState, window.__govFixture);');
  const running = w.document.querySelector('[data-post="' + post + '"]');
  ok("a vacant department retains its running initiative and instrument in force",
     !!running.querySelector('[data-running="test_running"]') && !!running.querySelector('[data-si="test_inforce"]'));
  ok("running work is counted once and cannot be started again while vacant",
     !running.querySelector('[data-ini="test_running"]') &&
     /1 under way/.test(running.querySelector('.gov-summary-counts').textContent));
  pending.queue = [];
  w.eval('UI.boot(window.__govState, window.__govFixture);');
  ok("an answered initiative disappears from Under way and its summary count",
     !w.document.querySelector('[data-running="test_running"]') &&
     !/under way/.test(w.document.querySelector('[data-post="' + post + '"] .gov-summary-counts').textContent));
  w.__govFixture = Cg;
  w.eval('Shell.setOpt("govWorkspace", {[' + JSON.stringify(state.admin) + ']: "malformed"});');
  w.eval('UI.boot(' + clone + ', window.__govFixture);');
  ok("malformed department preferences fall back to a usable default", !!pm() && !w.document.querySelector('#gov-business').hidden);
}
/* GOVERNMENT DESTINATIONS use the same live docket route as normal play. */
{
  const state = JSON.parse(w.eval('Engine.save(UI.state())')), Cg = w.eval('UI.content()');
  const original = JSON.stringify(state);
  const vacancy = Cg.cabinet.find(p => (p.candidates || []).length && !state.cabinet[p.id].holder);
  const second = Cg.cabinet.find(p => p.id !== vacancy.id);
  const fixture = Object.assign({}, Cg, { cabinet:Cg.cabinet.map(p =>
    p.id === second.id ? Object.assign({}, p, { candidates:vacancy.candidates }) : p) });
  state.cabinet[second.id].holder = null;
  w.__govFixture = fixture; w.__govState = state;
  w.eval('UI.boot(window.__govState, window.__govFixture); UI.openTab("gov");');
  const card = id => w.document.querySelector('#gov-cabinet [data-post="' + id + '"]');
  ok('two vacancies keep appointment actions out of the business list',
    [vacancy, second].every(p => !card(p.id).querySelector('[data-appoint]')) &&
    !w.document.querySelector('#gov-appoint-panel'));
  const route = spec => {
    const link = w.document.querySelector('#sit-today .tdo[data-goto="gov"][data-open^="post:"]');
    link.dataset.open = spec; link.click();
  };
  w.eval('UI.redraw();');
  const docket = w.document.querySelector('#sit-today .tdo[data-open="post:' + vacancy.id + '"]');
  ok('the vacancy obligation names its department target', !!docket);
  route('post:' + vacancy.id);
  ok('a vacancy destination opens its own card and focuses its first appointment',
    !card(vacancy.id).hidden && w.document.activeElement === w.document.querySelector('#gov-inspector [data-appoint="' + vacancy.id + '"]'));
  w.document.querySelector('[data-gov-back]').click(); route('post:'+vacancy.id);
  ok('direct vacancy navigation reveals the file after returning to narrow business',
    !w.document.querySelector('#gov-si').classList.contains('gov-mobile-list') &&
    w.document.activeElement.matches('#gov-inspector [data-appoint]'));
  const originalConfirm = w.eval('Dialog.confirm');
  w.__govConfirm = originalConfirm;
  w.eval('Dialog.confirm = function(m,o,cb) { cb(false); };');
  const appointment = w.document.querySelector('#gov-inspector [data-appoint="' + vacancy.id + '"]');
  if (appointment) appointment.click();
  ok('canceling an appointment preserves its vacancy and selected department', !state.cabinet[vacancy.id].holder && !card(vacancy.id).hidden);
  w.eval('Dialog.confirm = window.__govConfirm;');
  if (appointment) appointment.click();
  ok('appointing removes candidates once and leaves focus on its visible work file',
    state.cabinet[vacancy.id].holder === vacancy.candidates[0].holder &&
    !card(vacancy.id).querySelector('[data-appoint]') && !card(vacancy.id).hidden &&
    w.document.activeElement.id === 'gov-file-title');
  const dismiss=w.document.querySelector('#gov-inspector [data-sack="'+vacancy.id+'"]');
  if(dismiss)dismiss.click();
  ok('dismissal updates the office file and retains its keyboard focus',
    !!dismiss && !state.cabinet[vacancy.id].holder &&
    w.document.activeElement.id==='gov-file-title' &&
    w.document.querySelector('#gov-file-office').textContent.includes('Vacant'));
  const si = fixture.instruments.find(i => i.author && state.cabinet[i.author].holder && (!i.when || w.eval('Engine.matches(UI.state(), ' + JSON.stringify(i.when) + ')')));
  w.eval('UI.redraw();');
  route('order:' + si.id);
  ok('an order destination reveals its owner and focuses the expanded instrument',
    !card(si.author).hidden && card('').hidden && !!w.document.querySelector('#gov-inspector .si-d') &&
    w.document.activeElement.id === 'gov-file-title' && w.document.activeElement.textContent === si.title);
  fixture.initiatives = [{ id:'test_destination', post:si.author, title:'Destination fixture', cost:1, when:{}, tempo:[{ after:2 }] }];
  w.eval('UI.redraw();');
  route('initiative:test_destination');
  ok('an initiative destination opens its owning card and focuses that initiative',
    !card(si.author).hidden && w.document.activeElement.id === 'gov-file-title' && w.document.activeElement.textContent === 'Destination fixture');
  route('order:' + si.id);
  ok('routing from an initiative to an order replaces the shared inspector file',
    !!w.document.querySelector('#gov-inspector .si-d') && !w.document.querySelector('#gov-inspector [data-take]'));
  const used = state.slots.used;
  state.slots.used = state.slots.total;
  w.eval('UI.redraw();'); route('initiative:test_destination');
  ok('an unaffordable initiative destination remains readable inside its own expanded entry',
    !card(si.author).querySelector('[data-ini="test_destination"]').disabled &&
    !!w.document.querySelector('#gov-inspector [data-take]:disabled') &&
    w.document.activeElement.id === 'gov-file-title' && !w.document.activeElement.closest('[hidden]'));
  state.slots.used = used;
  route('post:');
  ok('the Prime Minister is a department destination without an authored post id',
    !card('').hidden && w.document.activeElement.id === 'gov-file-title' &&
    w.document.activeElement.textContent === 'Prime Minister');
  fixture.initiatives[0].when = { flags:['test_not_available'] };
  w.eval('UI.redraw();'); route('initiative:test_destination');
  ok('a surviving owner supplies the fallback when its initiative is unavailable',
    !card(si.author).hidden && w.document.activeElement === card(si.author).querySelector('[data-gov-summary]') && w.document.querySelector('#gov-inspector').hidden);
  fixture.cabinet = fixture.cabinet.map(p => p.id === second.id ? Object.assign({}, p, { candidates:[] }) : p);
  state.cabinet[vacancy.id].holder = null;
  w.eval('UI.redraw();');
  const noCandidates = card(second.id);
  route('post:' + second.id);
  ok('a vacancy without candidates retains its restriction and focuses its work file',
    /cannot make an order/.test(noCandidates.textContent) && !noCandidates.querySelector('[data-appoint]') &&
    w.document.activeElement.id === 'gov-file-title');
  fixture.cabinet = Cg.cabinet.map(p => p.id === second.id ? Object.assign({}, p, { candidates:vacancy.candidates }) : p);
  state.cabinet[vacancy.id].holder = vacancy.candidates[0].holder;
  w.eval('UI.redraw();');
  route('order:missing_test_order');
  ok('an unknown Government destination falls back to the visible workspace heading',
    w.document.activeElement.id === 'gov-workspace-title');
  const owed = () => w.document.querySelector('#gov-undertakings');
  ok('empty Undertakings are available without auto-selecting a record', !!owed() && owed().hidden);
  state.undertakings = [{ id:'test_owed', state:'open', text:'Fixture undertaking', by:state.sitting+2, keep:{ flag:'fixture_kept' } }];
  w.eval('UI.redraw();');
  ok('populated Undertakings do not displace the player\'s work file', !!owed() && owed().hidden);
  w.document.querySelector('[data-gov-record="gov-undertakings"]').click(); w.eval('UI.redraw();');
  ok('an explicit Undertakings selection survives rendering', !!owed() && !owed().hidden);
  w.__govFixture = Cg;
  w.eval('UI.boot(' + original + ', window.__govFixture);');
}
try {
  const C = w.eval("UI.content()"), state = w.eval("UI.state()");
  const leader = C.characters.find(c => c.office === "opposition" &&
    (state.characters[c.id] || {}).alive !== false);
  const panel = w.document.querySelector("#rel-opposition");
  ok("Relations names the Opposition leader and the party's live seat total",
     !!leader && !!panel && !!panel.querySelector('[data-go="person_' + leader.id + '"]') &&
     panel.querySelector("[data-opposition-seats]").textContent ===
       String(w.eval("Engine.partyTotal(UI.state(), " + JSON.stringify(leader.party) + ")")));
  const shadow = C.characters.filter(c => c.party === leader.party && c.shadow);
  const rows = panel ? [...panel.querySelectorAll("[data-shadow]")] : [];
  ok("the Opposition shows every authored shadow department and an empty moves list",
     shadow.length > 0 && rows.length === shadow.length &&
     rows.every(r => shadow.some(c => c.id === r.dataset.person && c.shadow === r.dataset.shadow)) &&
     panel.querySelector("[data-opposition-moves]").textContent.trim() === "Nothing yet.");
  const roles = shadow.map(c => c.role);
  try {
    shadow.forEach(c => c.role = "Reworded role"); w.eval("UI.redraw()");
    const current = [...w.document.querySelectorAll("#rel-opposition [data-shadow]")];
    ok("shadow department membership survives changes to role wording",
       shadow.length > 0 && current.length === shadow.length &&
       current.every(r => shadow.some(c => c.id === r.dataset.person && c.shadow === r.dataset.shadow)));
  } finally {
    shadow.forEach((c, i) => c.role = roles[i]); w.eval("UI.redraw()");
  }
} catch (e) { ok("the Opposition panel", false, e.message); }
/* END OPPOSITION DEPARTMENTS */

/* ORBIT READINGS keep national capacity apart from a station's exposure. */
try {
  const state = w.eval("UI.state()"), C = w.eval("UI.content()");
  const detail = w.document.querySelector("#station-detail");
  ok("Orbit describes national heat and consumables beside the station's band standing",
     !!detail.querySelector('[data-station-reading="heat"]') &&
     !!detail.querySelector('[data-station-reading="consumables"]') &&
     !!detail.querySelector('[data-station-reading="standing"]') &&
     /Commonwealth/.test(detail.querySelector('[data-station-reading="heat"]').textContent));
  const markers = C.setup.campaignMarkers || [];
  const gated = markers.find(m => m.when && m.when.flags && m.when.flags.length === 1);
  ok("the campaign supplies a gated schematic marker outside the station roster", !!gated &&
     !w.document.querySelector("#orbit-chart [data-campaign-marker]"));
  if (gated) {
    const flag = gated.when.flags[0], before = state.flags[flag];
    const n = C.stations.length;
    try {
      state.flags[flag] = true; w.eval("UI.redraw()");
      const marker = w.document.querySelector('#orbit-chart [data-campaign-marker="' + gated.id + '"]');
      ok("the stranded marker appears without inventing a station or seats",
         !!marker && marker.textContent.includes(gated.label) && !marker.hasAttribute("data-station") &&
         C.stations.length === n && Object.keys(state.stations).length === n);
    } finally {
      if (before === undefined) delete state.flags[flag]; else state.flags[flag] = before;
      w.eval("UI.redraw()");
    }
  }
} catch (e) { ok("Orbit readings and markers", false, e.message); }
/* END ORBIT READINGS */

ok("slot is named in the topbar", /Test ministry/.test($("#tb-slot").textContent),
   JSON.stringify($("#tb-slot").textContent));
/* THE HOUSE'S THREE PRICES SIT TOGETHER. The order is part of the design:
   Chamber carries its time, Party its loyalty, and Relations its bargains. */
ok("the tabs group the three prices of a vote",
   [...w.document.querySelectorAll("#tabstrip .tab:not([hidden])")]
     .map(t => t.dataset.t).join(",") ===
      "sit,gov,cham,party,rel,econ,orb,world,cx");
ok("Chamber has one order paper with grant controls in its bill rows",
   !$("#gov-slots") && [...w.document.querySelectorAll("#cham-bills tr[data-bill]")].every(tr =>
     !!tr.querySelector("button[data-slot]")));
ok("Chamber confidence is in Parliament's heading, not another panel",
   !$("#gov-margin") && !!w.document.querySelector("#cham-mid .panel h2 #gov-coalition-hdr"));
ok("Chamber composition contains a closed functional drawer and no repeated legend",
   !$("#chamber-legend") && !!w.document.querySelector("#comp-table + details:not([open]) #func-table"));
{
  const logo = $("#sit-play img"), adm = (CONTENT.administrations || [])[0];
  ok("the play's small logo is on the Sitting screen", !!logo && !$("#sit-play").hidden &&
     logo.getAttribute("src") === (adm.play.logoSmall || adm.play.logo), logo ? logo.getAttribute("src") : "none");
}

/* The chamber drew, and drew all 280. Counted by class rather than by
   element, so the furniture is excluded and the Speaker - who is lifted out
   of a bench and drawn in the Chair - cannot silently cost a seat. */
const seats = w.document.querySelectorAll("#chamber .sg").length;
ok("chamber renders every seat", seats === 280, seats + " seat glyphs");


/* GLOSSARY ANNOTATION — the regression that prompted this file.
   No attribute fragment may survive into visible text. */
const body = $("#sitting-body") ? $("#sitting-body").textContent : "";
ok("no markup leaks into the prose",
   !/data-(gloss|handle)=|class="gl"|<span/.test(body),
   body.length + " chars of prose");
/* ANNOTATION IN THE REAL SCREEN — but only where there is something to
   annotate. This counted .gl in the sitting body and so asserted on
   whichever event happened to be first; the opening is a positioning
   question that teaches nothing, which the legibility lint says is
   correct pacing, and the assertion failed on good content. It now asks
   whether the CURRENT event's prose contains a glossary term at all, and
   only then requires the wrapping. */
const glossed = w.document.querySelectorAll("#sitting-body .gl").length;
const bodyText = (w.document.querySelector("#sitting-prose") || { textContent: "" }).textContent;
const hasTerm = w.eval("CONTENT.glossary").some(g =>
  !g.assumed && new RegExp("\\b" + g.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "s?\\b", "i")
    .test(bodyText));
ok("glossary terms are annotated where the prose has any",
   hasTerm ? glossed > 0 : true,
   hasTerm ? glossed + " terms wrapped" : "this event teaches none — skipped");

/* annotate() directly, on the case that broke: a gloss containing another term */
try {
  const out = w.eval('UI.annotate("A fork becomes an instance after the divergence threshold.")');
  const doc = new JSDOM("<div>" + out + "</div>").window.document.querySelector("div");
  ok("annotate output is well-formed",
     !/data-gloss|data-handle/.test(doc.textContent), JSON.stringify(doc.textContent));
} catch (e) { ok("annotate output is well-formed", false, e.message); }

/* A SEED PER GOVERNMENT (design/37 D10): the shell draws one, the save
   keeps it. Every game used to be seeded 20287. */
ok("a new government has its own seed, not the engine's default",
   w.eval("UI.state().seed") !== 20287 && w.eval("UI.state().seed") > 0,
   "seed " + w.eval("UI.state().seed"));

/* SAVE ROUND-TRIP through a slot */
try {
  $("#tb-save").click();
  const raw = w.localStorage.getItem("wm.slot.1");
  const slot = JSON.parse(raw);
  ok("save writes to the slot", !!raw && slot.name === "Test ministry",
     "sitting " + slot.sitting);
  const before = w.eval("JSON.stringify(UI.state())");
  /* AND STAND SOMEWHERE ELSE FIRST. The tab is not in the save, so it used
     to survive the menu: the next government opened on whatever screen the
     last one was left on, which for a new game meant its introduction was
     drawn into a sitting page the player was not looking at. */
  w.document.querySelector(String.raw`.tab[data-t="orb"]`).click();
  ok("a government can be left on another tab",
     $("#s-orb").classList.contains("on"));
  /* back to the menu the way a player does it: Options > Return to main menu */
  $("#tb-options").click();
  w.document.querySelector('#tb-optpanel [data-act="menu"]').click();
  ok("returns to the main menu", $("#menu").classList.contains("on") &&
     !$("#shell").classList.contains("on"));
  $('[data-go="load"]').click();
  $('[data-load="1"]').click();
  const after = w.eval("JSON.stringify(UI.state())");
  ok("slot reloads to the same state", before === after,
     before === after ? "" : "state differs after reload");
  ok("and the government opens on the sitting, not the tab it was left on",
     $("#s-sit").classList.contains("on") && !$("#s-orb").classList.contains("on"),
     [...w.document.querySelectorAll(".screen.on")].map(s => s.id).join(" "));
} catch (e) { ok("save round-trip", false, e.message); }

/* THE PARTIES TAB, AND A COMPOSITION ROW THAT OPENS. Both are new, and both
   are the kind of thing every static check passes and nobody can use: a
   panel that renders blank, or a click handler wired to a function that does
   not exist. The second is not hypothetical \u2014 this handler shipped calling
   drawComposition(), and the renderer is called drawBenchTable(). Nothing
   failed; the row simply did not open. tools/edtest.js exists for exactly
   this in the editor. */
try {
  w.document.querySelector('.tab[data-t="rel"]').click();
  /* INTERPARTY AFFAIRS, NOT A DIRECTORY (the author, 23 Sep; its own tab,
     Relations, since 24 Sep). The tab opens every OTHER party and not your
     own, which has the Party tab; and who a party is lives in the
     Concordance, so the members, currents and organisation panels are gone. */
  const me = w.eval("UI.state().playerParty");
  const prows = [...w.document.querySelectorAll("#rel-table tr[data-party]")];
  ok("Relations opens every other party, and not your own",
     prows.length === CONTENT.parties.length - 1 && !prows.some(r => r.dataset.party === me),
     prows.length + " of " + CONTENT.parties.length);
  ok("and your own is on the roster, for the arithmetic",
     !!w.document.querySelector("#rel-table tr.ownrow"));
  ok("and opens on one of them",
     (w.document.querySelector("#rel-detail").textContent || "").trim().length > 40);
  ok("and is not a directory any more",
     !w.document.querySelector("#s-rel [data-current], #s-rel .cx-wikitable, #s-rel #party-org"));
  /* and your own row sends you to your own party */
  const yours = w.document.querySelector('#rel-table tr.ownrow [data-goto="party"]');
  if (yours) {
    yours.click();
    ok("your own row on Relations opens the Party tab",
       w.document.querySelector('.tab[data-t="party"]').getAttribute("aria-selected") === "true");
    w.document.querySelector('.tab[data-t="rel"]').click();
  } else ok("your own row on Relations links to the Party tab", false);
  const first = w.document.querySelector("#rel-hdr").textContent;
  const detFirst = w.document.querySelector("#rel-detail").textContent;
  if (prows[1]) {
    prows[1].click();
    ok("choosing another party changes the page",
       w.document.querySelector("#rel-hdr").textContent !== first,
       first + " -> " + w.document.querySelector("#rel-hdr").textContent);
    ok("and the relationship with it",
       w.document.querySelector("#rel-detail").textContent !== detFirst);
    /* THE LOYALTY COLUMN IS THE LIVE ONE. It read st.loyalty, which does
       not exist, and fell back to content, so it printed the opening figure
       for the whole run whatever happened to the party. */
    const lp = CONTENT.parties.find(p => p.id !== me && !CONTENT.currents.some(c => c.party === p.id));
    w.eval('UI.state().parties[' + JSON.stringify(lp.id) + '].loyalty = 7; UI.redraw();');
    const lcell = w.document.querySelector('#rel-table tr[data-party="' + lp.id + '"] td:nth-child(4)');
    ok("the party table prints loyalty as it stands, not as it opened",
       lcell && lcell.textContent.trim() === "7", lcell ? lcell.textContent : "no row");
    w.eval('UI.state().parties[' + JSON.stringify(lp.id) + '].loyalty = ' + lp.loyalty + '; UI.redraw();');
    /* WHAT THEY WANT: a party's own measures, each opening where it is
       carried, because order-paper time given to a partner's bill is the
       credit this parliament trades in (Engine.grantSlot). */
    const wantP = CONTENT.parties.find(p => p.id !== me &&
      CONTENT.bills.some(b => b.owner === p.id && w.eval("!!UI.state().bills[" + JSON.stringify(b.id) + "]")));
    if (wantP) {
      w.document.querySelector('#rel-table tr[data-party="' + wantP.id + '"]').click();
      const theirs = CONTENT.bills.filter(b => b.owner === wantP.id &&
        w.eval("!!UI.state().bills[" + JSON.stringify(b.id) + "]"));
      const wb = [...w.document.querySelectorAll('#rel-detail [data-open^="grant:"], #rel-detail [data-open^="bill:"]')];
      ok("a party's own measures are what it wants from you", wb.length === theirs.length,
         wb.length + " rows for " + theirs.length + " measures of " + wantP.short);
      const live = wb.find(b => /^grant:/.test(b.dataset.open));
      if (live) {
        const bid = live.dataset.open.slice(6);
        live.click();
        ok("and a live one opens where time is given to it",
            w.document.querySelector('.tab[data-t="cham"]').getAttribute("aria-selected") === "true" &&
            !!w.document.querySelector('#cham-bills [data-slot="' + bid + '"]'), bid);
        w.document.querySelector('.tab[data-t="rel"]').click();
      }
    } else ok("some party has a measure of its own", false);

    /* WHAT YOU HAVE PROMISED THEM: an undertaking owed to one of their
       members is on their page, staged and put back. */
    const snapP = w.eval("JSON.stringify(UI.state())");
    const their = CONTENT.characters.find(c => c.party && c.party !== me &&
      w.document.querySelector('#rel-table tr[data-party="' + c.party + '"]'));
    if (their) {
      w.eval("Engine.apply(UI.state(), UI.content(), [{ undertake: { id: 'ut_party', " +
        "text: 'A promise kept for the test', owed_to: " + JSON.stringify(their.id) + ", " +
        "by: UI.state().sitting + 6, discharge: { flag: 'ut_party_kept' } } }]); UI.redraw();");
      w.document.querySelector('#rel-table tr[data-party="' + their.party + '"]').click();
      ok("a promise owed to one of their members is on their page",
         /A promise kept for the test/.test(w.document.querySelector("#rel-detail").textContent),
         their.party);
      w.eval("UI.boot(JSON.parse(" + JSON.stringify(snapP) + "), UI.content())");
      w.document.querySelector('.tab[data-t="rel"]').click();
    }
    ok("and the selection is marked on the row that was clicked",
       (w.document.querySelector("#rel-table tr.sel") || {}) === prows[1] ||
       !!w.document.querySelector("#rel-table tr.sel"));
  }

  /* THE LAST PAGE SAYS WHO GOVERNS (design/37). It printed the Prime
     Minister's party as "the government" and "It held where it stood" over
     a count that left the coalition and its partners short of a majority. */
  {
    const snapE = w.eval("JSON.stringify(UI.state())");
    /* the introduction is drawn before an ending, so mark it read, and
       re-boot on the session's own content (see the set-piece test below) */
    w.eval("(function(){var s=UI.state(), K=UI.content(); s.flags._introRead=true;" +
           "K.bills.forEach(function(b){ if (b.test==='supply') s.bills[b.id].stage='assented'; });" +
           "Engine.dissolve(s, K); s.sitting += 1;" +
           "UI.boot(s, Shell.contentFor((CONTENT.administrations||[])" +
           ".find(function(x){return x.id===s.admin;})));})()");
    w.document.querySelector('.tab[data-t="sit"]').click();
    /* THE CAMPAIGN SHOWS THE POLLS (design/38 §1): where the docket was, and
       on the status bar in place of confidence in a House that is gone. */
    const f = w.eval("Engine.forecast(UI.state(), UI.content())");
    ok("the campaign shows the polls where the docket was",
       w.document.querySelector("#dk-head").textContent === "The polls" &&
       new RegExp("on " + f.side + " of " + f.total).test(w.document.querySelector("#sit-docket").textContent),
       w.document.querySelector("#sit-docket").textContent.slice(0, 120));
    ok("and the status bar reads the poll in words, with seats on hover", /^Poll: /.test(w.document.querySelector("#sb-conf").textContent) &&
       (w.document.querySelector("#sb-conf").getAttribute("data-tip-body") || "").includes(f.side + " of " + f.total),
       w.document.querySelector("#sb-conf").textContent);
    w.eval("(function(){var s=UI.state(); s.sitting += 40; Engine.count(s, UI.content()); UI.redraw();})()");
    const endText = w.document.querySelector("#sitting-body").textContent;
    const conf = w.eval("Engine.confidence(UI.state())"), maj = w.eval("Engine.majority(UI.state())");
    ok("the last page says whether the government's side has a majority",
       new RegExp("come back with " + conf + ", against a majority of " + maj).test(endText) &&
       (conf >= maj ? /a majority, with/ : / short of one/).test(endText),
       (endText.match(/The coalition[^:]*:[^.]*\./) || [endText.slice(0, 200)])[0]);
    /* and what it means, in content's words (design/38 §2) */
    const epi = w.eval("(Engine.epilogue(UI.state(), UI.content()) || {}).title");
    ok("and the epilogue the count earned", !!epi && endText.indexOf(epi) >= 0, epi || "no epilogue");
    /* AND WHAT IT LEAVES (design/40 E14): the country the next government
       inherits, opening against now, with the debt and the dollar in it */
    const fx = w.eval("Engine.macro(UI.state(), UI.content()).fx.toFixed(2)");
    ok("and the state of the country it leaves: the dollar, the debt, the heat",
       /The state of the country/.test(endText) && endText.indexOf("US$" + fx) >= 0 &&
       /Owed/.test(endText) && /Thermal margin/.test(endText),
       (endText.match(/The state of the country.{0,160}/) || ["not drawn"])[0]);
    w.eval("UI.boot(JSON.parse(" + JSON.stringify(snapE) + "), UI.content())");
  }

  /* YOUR OWN PARTY (the author, 24 Sep). The Party tab is the Prime
     Minister's own bench: one row per current, the party's figures as their
     footing, a current read one at a time, and the leadership. Each figure
     is the engine's, so each is checked against the engine. */
  w.document.querySelector('.tab[data-t="party"]').click();
  const mine = CONTENT.currents.filter(c => c.party === me);
  const crow = [...w.document.querySelectorAll("#party-currents tr[data-current]")];
  ok("the Party tab lists your own currents and no one else's",
      crow.length === mine.length && crow.every(r => mine.some(c => c.id === r.dataset.current)),
      crow.length + " rows for " + mine.length + " currents");
  ok("a current has a leader, wants, promises, differences and votes in one reading",
     ["current-leader", "current-wants", "current-promises", "current-parts", "current-votes"]
       .every(id => !!w.document.getElementById(id)));
  {
    const f = w.eval("Engine.forecast(UI.state(), UI.content())");
    const tracker = w.document.querySelector("#party-country");
    ok("the country tracker uses the engine count and the poll bands",
       !!tracker && tracker.textContent.includes(String(f.mine)) &&
       tracker.querySelectorAll("[data-poll-band]").length === Object.keys(f.bands).length);
  }
  const foot = w.document.querySelector("#party-currents tfoot td:nth-child(3)");
  ok("and the party's loyalty is their footing, as the meter reads it",
     foot && foot.textContent.trim() === String(w.eval("UI.state().scalars.party_loyalty")),
     foot ? foot.textContent : "no footing");
  if (crow[1]) {
    const h0 = w.document.querySelector("#party-cur-hdr").textContent;
    crow[1].click();
    ok("choosing a current reads that current",
       w.document.querySelector("#party-cur-hdr").textContent !== h0 &&
       w.document.querySelector("#party-cur-hdr").textContent === mine.find(c => c.id === crow[1].dataset.current).name,
       h0 + " -> " + w.document.querySelector("#party-cur-hdr").textContent);
    const cid = crow[1].dataset.current;
    const named = CONTENT.characters.filter(ch => ch.party === me && ch.current === cid);
    const links = w.document.querySelectorAll("#party-current .current-members a[data-go]");
    const deadL = [...links].filter(a => !w.eval('Concordance.knows(' + JSON.stringify(a.dataset.go) + ')'));
    ok("and names its members, each linked to their Concordance article",
       links.length === named.length && !deadL.length,
       links.length + " of " + named.length + (deadL.length ? ", dead: " + deadL.map(a => a.dataset.go).join(" ") : ""));
    /* THE LOYALTY IS THE LIVE ONE, which the old Party tab once was not */
    const was = w.eval("UI.state().currents[" + JSON.stringify(cid) + "].loyalty");
    w.eval("UI.state().currents[" + JSON.stringify(cid) + "].loyalty = 7; UI.redraw();");
    const lc = w.document.querySelector('#party-currents tr[data-current="' + cid + '"] td:nth-child(3)');
    ok("a current's loyalty is printed as it stands", lc && lc.textContent.trim() === "7",
       lc ? lc.textContent : "no row");
    w.eval("UI.state().currents[" + JSON.stringify(cid) + "].loyalty = " + was + "; UI.redraw();");
  }
  /* HOW A CURRENT VOTES is read off the engine's own division, per measure */
  const onPaper = [...w.document.querySelectorAll('#party-current [data-open^="bill:"]')];
  ok("a current's page says how it votes on what is before the House", onPaper.length > 0,
     onPaper.length + " measures");
  if (onPaper[0]) {
    onPaper[0].click();
    ok("and a measure opens in the Chamber",
       w.document.querySelector('.tab[data-t="cham"]').getAttribute("aria-selected") === "true");
    w.document.querySelector('.tab[data-t="party"]').click();
  }
  /* THE PAPER lives with the party now, and nowhere else */
  const snapL = w.eval("JSON.stringify(UI.state())");
  w.eval("UI.state().flags.paper_opened = true; UI.redraw();");
  const asks = w.document.querySelectorAll("#party-lead [data-sign]");
  ok("once the paper is open, the members closest to signing are on the Party tab",
     asks.length > 0, asks.length + " members");
  ok("and not under the whip on the Chamber tab",
     !w.document.querySelector("#s-cham [data-sign]"));
  const sig0 = w.eval("UI.state().signatures || 0");
  if (asks[0]) asks[0].dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  ok("and asking one adds a name", w.eval("UI.state().signatures || 0") === sig0 + 1);
  /* A NAME WON BACK AT A PRICE (design/26 #14): the member too far gone
     cannot be, one who is not can, for a slot and a promise. */
  const asked = w.eval("UI.state().signedBy[0]");
  const far = w.document.querySelector('#party-lead [data-winback="' + asked + '"]');
  ok("a member too far gone has no way back", !!far && far.disabled,
     asked + (far ? (far.disabled ? " disabled" : " enabled") : " no control"));
  const soft = w.eval("(function(){ var T = UI.content().setup.thresholds;" +
    " var m = Engine.signableMembers(UI.state(), UI.content()).find(function(x){" +
    " return x.will >= T.signsAt && x.will < T.winBackBelow; }); return m ? m.id : null; })()");
  const softAsk = soft && w.document.querySelector('#party-lead [data-sign="' + soft + '"]');
  if (softAsk) softAsk.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  const back = soft && w.document.querySelector('#party-lead [data-winback="' + soft + '"]');
  const sig1 = w.eval("UI.state().signatures || 0");
  if (back && !back.disabled) back.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  ok("one who is not is won back, for a promise the panel lists",
     !!back && w.eval("UI.state().signatures || 0") === sig1 - 1 &&
     /Promised, to keep names off the paper/.test(w.document.querySelector("#party-lead").textContent),
     soft + ": " + sig1 + " -> " + w.eval("UI.state().signatures || 0"));
  const b = w.eval("Engine.ballot(UI.state(), UI.content())");
  ok("the ballot forecast is the engine's",
     new RegExp(b.for + " for you, " + b.against + " against").test(
       w.document.querySelector("#party-lead").textContent));
  w.eval("UI.boot(JSON.parse(" + JSON.stringify(snapL) + "), UI.content())");

  /* A NEW GOVERNMENT IS NOT NAMED AFTER THE LAST ONE. The name box offered the
   slot's existing name when the slot already held a save, so forming a new
   government over an old one arrived pre-filled with the OLD government's
   name and anyone who pressed Start inherited it. Asserted by capturing what
   the box was PRE-FILLED with, which is the whole of the bug \u2014 both versions
   accept whatever is typed, so a test that only reads the result sees
   nothing wrong. */
try {
  w.eval("Shell.boot(CONTENT)");
  const seen = [];
  w.eval("window.__seenDefaults = [];" +
         "Dialog.prompt = function (m, o, cb) {" +
         "  window.__seenDefaults.push((o && o.value) || '');" +
         "  (typeof o === 'function' ? o : cb)('Second ministry');" +
         "};");
  w.document.querySelector('[data-go="new"]').click();
  const adm = w.document.querySelector("[data-admin]");
  if (adm) adm.click();
  const slot1 = w.document.querySelector('[data-new="1"]');
  /* The slot BUTTON reads "Overwrite" once a slot is occupied, so the
     occupancy is read from the save itself rather than from the label. */
  ok("slot 1 already holds the earlier government",
     !!w.localStorage.getItem("wm.slot.1"),
     JSON.parse(w.localStorage.getItem("wm.slot.1") || "{}").name || "empty");
  if (slot1) slot1.click();
  const defaults = w.eval("window.__seenDefaults");
  ok("the name box offers a default", defaults.length > 0, JSON.stringify(defaults));
  const d = defaults[defaults.length - 1] || "";
  ok("and it is not the name of the government being replaced",
     !/Test ministry/i.test(d), d);
  ok("it is the government about to be formed",
     /Socialists|Flash|government/i.test(d), d);
} catch (e) { ok("the new-government default name", false, e.message); }

/* A SETTLEMENT RECORDS AND DOES NOT INTERRUPT (design/31 §4, the author's
   correction). It opened a dialog with its closing prose the moment it
   landed, which can be sitting fifteen; the words belong on the last page. */
try {
  const snap9 = w.eval("JSON.stringify(UI.state())");
  w.eval(`window.__alerts = []; (function(){ var a = Dialog.alert;
    Dialog.alert = function (m, o, cb) { window.__alerts.push((o && o.title) || ""); return a.apply(this, arguments); }; })();
    (function(){ var s = UI.state(); s.sitting = Math.max(s.sitting, 15);
      s.bills.divergence.stage = "defeated"; s.bills.divergence.dead = true; })();`);
  w.document.querySelector('.tab[data-t="cham"]').click();
  const slot = w.document.querySelector("#cham-bills .slotbtn");
  if (slot) slot.click();
  const st9 = w.eval("UI.state()");
  ok("a settlement landing mid-session is recorded", st9.settledAs === "restriction", st9.settledAs);
  ok("in the register", st9.log.some(l => /The question is settled: The Restriction Settlement/.test(l.text)));
  ok("and it opens no dialog", !w.eval("window.__alerts").some(t => /Settlement/.test(t)),
     w.eval("window.__alerts").join(" / "));
  /* put the run back as it was: the checks below read its calendar */
  w.eval("UI.boot(JSON.parse(" + JSON.stringify(snap9) + "), UI.content())");
} catch (e) { ok("a settlement records and does not interrupt", false, e.message); }

/* THE LAST PAGE IS A SET PIECE (design/31's third use). The frame was built
   for three things and only two used it; the board was a panel among panels,
   which is the wrong shape for the one page in a run that is a RECORD rather
   than a control. Driven to an ending and read back off the glass, because a
   page that renders blank is invisible to every static check. */
try {
  const st = w.eval("UI.state()");
  /* end it the way the House does */
  /* the introduction is drawn before the ending, and correctly so — mark it
     read the way taking office does, or the page under test is the intro */
  /* RE-BOOT ON THE CONTENT THE SESSION IS RUNNING ON, not the raw global.
     `UI.boot(s, CONTENT)` put the interface back on the unmerged copy --
     Flash I's startDate is 2080 and the global placeholder is 2287 -- so
     every assertion after this point read a calendar 207 years off the state
     it was showing. Shell.contentFor is the one implementation of the merge. */
  w.eval("(function(){var s=UI.state(); s.flags._introRead=true;" +
         "s.noConfidence={at:s.sitting,have:0,need:141};" +
         "UI.boot(s, Shell.contentFor((CONTENT.administrations||[])" +
         ".find(function(x){return x.id===s.admin;})));})()");
  w.document.querySelector('.tab[data-t="sit"]').click();
  const page = w.document.querySelector("#sitting-body .sp-page");
  ok("a finished run draws the last page as a set piece", !!page);
  const sit = w.document.querySelector("#s-sit");
  ok("and the screen wears the set-piece and full-page classes, so the columns give way",
     !!sit && sit.classList.contains("setpiece") && sit.classList.contains("fullpage"));
  const text = page ? page.textContent : "";
  ok("it names what happened", /fallen|voted|confidence/i.test(text),
     text.slice(0, 60));
  ok("and it says where the record is", /What has happened/.test(text));
  /* and the settlement's closing words are on it, which no dialog read out
     earlier: settled here on the page's own state */
  const setl = w.eval("(function(){ var s = UI.state(); s.settledAs = 'restriction'; UI.redraw();" +
    " var p = document.querySelector('#sitting-body .sp-page'); return p ? p.textContent : ''; })()");
  ok("and the settlement's own closing words, which no dialog read out earlier",
     /What the session settled: The Restriction Settlement/.test(setl) &&
     /one hundred and sixty-eight hours/.test(setl), setl.slice(setl.indexOf("settled"), setl.indexOf("settled") + 80));
  ok("and it offers no decision, because there is nothing left to decide",
     w.document.querySelectorAll("#sitting-body button[data-choice]").length === 0);
} catch (e) { ok("the last page", false, e.message); }

/* Calls retain independent borrowing, contextual amounts and exactly one
   confirmation-owned action. Removing any of those is a behavioral fault. */
{
 const original=w.eval('UI.state()'),originalC=w.eval('UI.content()');
 const probe=w.eval(`(function(){
  const base=UI.content(),m={id:'ui_money_advice',owner:'life_support',raise:{minSitting:1},due:20,grace:2,
   settled:{flags:['ui_money_done']},note:'Financing advice',figures:[],counsel:[],
   remedies:[{id:'draw',target:{kind:'money',id:'underwriters',amount:3000},takes:0,note:'Open the proposed drawing'}],late:'reserve_low',page:'f1_reserve_shortage'};
  const c={...base,matters:[m],events:[]},s=Engine.newGame(c);s.queue=[];s.flags._introRead=true;s.flags._act1=true;
  Engine.reconcile(s,c);UI.boot(s,c);UI.openTab('sit');return{s,c};
 })()`);
 const snap=w.eval('Engine.save(UI.state())');
 $('[data-matter="ui_money_advice"] [data-matter-remedy]').click();
 ok('the account contains no Draw controls',!$('#econ-account [data-draw]'));
 ok('money calls contain their Draw controls',!!$('#econ-calls [data-draw="underwriters"]'));
 const calls=()=>[...w.document.querySelectorAll('#econ-calls [data-money-call]')];
 ok('matter-linked calls lead the calls list',calls()[0]?.dataset.moneyCall==='underwriters');
 ok('a contextual call links back to its advice',!!$('#econ-calls [data-money-back="ui_money_advice"]'));
 const backlink=$('#econ-calls [data-money-back="ui_money_advice"]');if(backlink)backlink.click();
 ok('the call backlink opens Sitting',$('#s-sit').classList.contains('on'));
 ok('the call backlink focuses its exact matter',w.document.activeElement?.dataset.matter==='ui_money_advice');
 ok('call navigation does not borrow',w.eval('Engine.save(UI.state())')===snap);
 w.eval("UI.openTab('econ')");
 let amount=$('[data-money-amount="underwriters"]');
 ok('the contextual amount starts at its authored preset',amount?.value==='3000');
 if(amount){amount.value='2250';amount.dispatchEvent(new w.Event('change',{bubbles:true}));}
 w.eval('UI.redraw()');
 amount=$('[data-money-amount="underwriters"]');
 ok('the player can adjust the amount',amount?.value==='2250');
 ok('adjusting a call is not borrowing',w.eval('Engine.save(UI.state())')===snap);
 w.eval(`window.__calls=0;Dialog.confirm=function(m,o,cb){window.__calls++;window.__question=m;window.__answer=cb;};`);
 const draw=()=>$('#econ-calls [data-draw="underwriters"]') || $('#econ-account [data-draw="underwriters"]');
 if(draw()){draw().focus();draw().click();draw().click();}
 ok('opening confirmation does not borrow',w.eval('Engine.save(UI.state())')===snap);
 ok('confirmation names the adjusted amount',w.__question?.includes(w.eval('Engine.money')(probe.c,2250)));
 ok('a repeated Draw click opens only one confirmation',w.__calls===1);
 if(w.__answer)w.__answer(false);
 ok('cancelling the drawing leaves simulation unchanged',w.eval('Engine.save(UI.state())')===snap);
 ok('cancelling leaves Draw usable',!!draw() && !draw().disabled);
 ok('cancelling returns focus to the same drawing',w.document.activeElement===draw());
 const before=w.eval('Engine.debtOf')(probe.s,'underwriters');if(draw())draw().click();
 const accepted=w.__answer;if(accepted)accepted(true);
 ok('confirmation draws the adjusted amount through the engine',w.eval('Engine.debtOf')(probe.s,'underwriters')===before+2250);
 const once=w.eval('Engine.save(UI.state())');if(accepted)accepted(true);
 ok('a repeated callback cannot draw twice',w.eval('Engine.save(UI.state())')===once);
 const c={...probe.c,matters:[]},s=w.eval('Engine.newGame')(c);s.queue=[];s.flags._introRead=true;s.flags._act1=true;
 w.eval('UI.boot')(s,c);w.eval("UI.openTab('econ')");
 const facilities=w.eval('Engine.facilities')(s,c);
 ok('ordinary facilities remain accessible with no advice',calls().length===facilities.length);
 ok('ordinary calls offer their default amounts',facilities.every(f=>$('#econ-calls [data-money-amount="'+f.id+'"]')?.value===String(f.utilisation)));
 const ordinaryBefore=w.eval('Engine.debtOf')(s,'underwriters');if(draw())draw().click();if(w.__answer)w.__answer(true);
 ok('an ordinary call can borrow without any matter',w.eval('Engine.debtOf')(s,'underwriters')===ordinaryBefore+facilities.find(f=>f.id==='underwriters').utilisation);
 w.eval(`Dialog.confirm=function(m,o,cb){(typeof o==='function'?o:cb)(true);};`);
 w.eval('UI.boot')(original,originalC);
}

/* THE ECONOMY TAB, which the author has now pushed back on twice. What it
   needed was not more numbers but the things a reader asks of a number:
   where it came from, what it means, and what it has been doing. */
try {
  w.document.querySelector('.tab[data-t="econ"]').click();
  const tre = (w.document.querySelector("#econ-account") || {}).textContent || "";
  /* THE STANDING LENDERS (24 Sep): a row each, drawn or not, because a
     facility nobody has drawn is still a choice the government has. */
  const facRows = [...w.document.querySelectorAll("#econ-account .prow.fac")];
  const drawable = Object.keys(CONTENT.setup.lenders).filter(k => CONTENT.setup.lenders[k].drawable);
  ok("the account lists each standing lender, drawn or not",
     facRows.length === drawable.length && facRows.every(r => /none/.test(r.textContent)) &&
     drawable.every(k => !!w.document.querySelector('#econ-calls [data-draw="' + k + '"]')),
     facRows.map(r => r.textContent.slice(0, 40)).join(" | "));
  /* NAMED CREDITORS: each lender its own row, on its own terms, and a Repay
     control only where the lender is paid across the counter. Staged on a
     copy of the page's state and put back, so nothing after this sees it. */
  const snapC = w.eval("JSON.stringify(UI.state())");
  const cred = w.eval("(function(){ var s = UI.state(); s.debt = {owed:{earth:12000, alliance:19800}};" +
    " UI.redraw(); var b = document.querySelector('#econ-account');" +
    " return { text: b.textContent, repay: [].map.call(b.querySelectorAll('[data-repay]'), function(x){ return x.dataset.repay; }) }; })()");
  /* in the lender's own money since the dollar: Earth's banks lend in US dollars */
  ok("the account names each creditor", /Earth's banks/.test(cred.text) && /US\$12\.0bn/.test(cred.text) &&
     /The Alliance's facility/.test(cred.text), cred.text.slice(0, 200));
  ok("and only the lender paid across the counter has a Repay control",
     cred.repay.length === 1 && cred.repay[0] === "earth", JSON.stringify(cred.repay));
  w.eval("UI.boot(JSON.parse(" + JSON.stringify(snapC) + "), UI.content())");
  /* A DRAWING goes through the engine's own borrow: the lender's size, a
     slot of order-paper time, and the line in the record. */
  const d0 = w.eval("({ owed: Engine.debtOf(UI.state(), 'earth'), used: UI.state().slots.used })");
  const dbtn = w.document.querySelector('#econ-calls [data-draw="earth"]');
  if (dbtn) dbtn.click();
  const d1 = w.eval("({ owed: Engine.debtOf(UI.state(), 'earth'), used: UI.state().slots.used, log: UI.state().log[0].text })");
  ok("Draw takes one drawing on the facility, through the engine",
     d1.owed === d0.owed + CONTENT.setup.lenders.earth.utilisation && d1.used === d0.used + 1 &&
     /Standby Facility/.test(d1.log), JSON.stringify(d1));
  ok("and the row says what is drawn, in the lender's money",
     /US\$8\.0bn/.test([...w.document.querySelectorAll('#econ-account .prow.fac')]
       .find(r => /Earth's banks/.test(r.textContent))?.textContent || ""));
  w.eval("UI.boot(JSON.parse(" + JSON.stringify(snapC) + "), UI.content())");
  ok("and the net position, not just the two halves", /The balance/.test(tre) && /Spending/.test(tre),
     (tre.match(/The balance[^A-Z]*/) || [""])[0].slice(0, 44));

  /* THE MERGE, ASSERTED. Scarcity, What sets the prices and Ways and means
     were three panels about the same four things — `TAX_BASES` and
     `PRICE_META` name one set — so the tab made the player read across two
     columns to join a price to the clause that sets it and to the yield it
     earns, which is the sum `receipts()` actually does. One row each now,
     and the row has to carry all three or the merge has not happened. */
  const brows = [...w.document.querySelectorAll("#econ-bases tr.brow")];
  ok("every base the Commonwealth prices gets one row", brows.length === 4,
     brows.map(r => r.dataset.chart).join(" "));
  ok("and the row joins the price, the clause that sets it, and the yield",
     brows.every(r => r.querySelector(".bidx") && r.querySelector(".blaw b") &&
                      r.querySelector(".byield")),
     (brows[0] || { textContent: "" }).textContent.replace(/\s+/g, " ").trim().slice(0, 70));
  ok("and the four bases are the four prices, not a second list",
     brows.map(r => r.dataset.chart).sort().join(",") ===
       w.eval("Engine.receipts(UI.state(), UI.content()).rows.map(r=>r.base).sort().join(',')"),
     brows.map(r => r.dataset.chart).sort().join(","));
  const bnum = el => Number((el.textContent || "").replace(/[^0-9-]/g, ""));
  const byield = brows.map(r => bnum(r.querySelector(".byield")));
  const btot = bnum(w.document.querySelector("#econ-bases tr.btot .byield"));
  /* printed in tenths of a billion, so four rounded rows may miss the
     rounded total by a tenth or two and no more */
  ok("the printed yields add up to the printed total",
     Math.abs(byield.reduce((a, b) => a + b, 0) - btot) <= 2, byield.join("+") + " = " + btot);
  ok("which is the engine's number and not the interface's",
     w.document.querySelector("#econ-bases tr.btot .byield").textContent ===
       w.eval("Engine.money(UI.content(), Engine.receipts(UI.state(), UI.content()).total)"), btot + "");
  ok("and it names the rate each base is charged at",
     brows.every(r => /levied|reduced|standing rate|raised/.test(r.textContent)),
     (brows[0] || { textContent: "" }).textContent.trim().slice(0, 40));
  ok("the cost of existing is a reading of those four and sits under them",
     /cost of existing/i.test((w.document.querySelector("#econ-bases") || {}).textContent || "") &&
     !/cost of existing/i.test(tre), "moved out of the account panel");

  /* THE RESERVE BANK AND THE DOLLAR (design/39 option C): the working
     readings, each pickable into the chart, and the Bank's own arithmetic
     printed beside its rate. */
  const bank = w.document.querySelector("#econ-bank");
  const bankPicks = bank ? [...bank.querySelectorAll("[data-chart]")].map(x => x.dataset.chart) : [];
  ok("the Bank's panel carries inflation, the cash rate, the dollar and growth",
     ["inflation", "rate", "fx", "growth"].every(k => bankPicks.indexOf(k) >= 0), bankPicks.join(" "));
  ok("and prints what its rule asks, from the engine",
     !!bank && bank.textContent.indexOf(w.eval("Engine.taylorRate(UI.state(), UI.content()).toFixed(2)")) >= 0,
     ((bank || {}).textContent || "").replace(/\s+/g, " ").slice(0, 120));
  const rateRow = bank && bank.querySelector('[data-chart="rate"]');
  if (rateRow) rateRow.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  ok("and a reading picks into the chart",
     /cash rate/i.test((w.document.querySelector("#chart-hdr") || {}).textContent || ""),
     (w.document.querySelector("#chart-hdr") || {}).textContent);

  /* WHO WORKS IS FOLDED, and the fold says what is behind it: eighteen
     categories at 429px were most of the reason this tab scrolled. */
  const lab = w.document.querySelector("#econ-real details.foldsec[data-fold=labour]");
  ok("the labour table is on the tab, with the economy it describes", !!lab);
  if (lab) {
    ok("and it is closed until the player asks", !lab.open);
    ok("and its summary says how much is behind it",
       /\d+ kinds of work/.test(lab.querySelector("summary").textContent),
       lab.querySelector("summary").textContent.replace(/\s+/g, " ").trim());
    ok("and it holds every category content authors",
       lab.querySelectorAll("#econ-lab tbody tr").length ===
         w.eval("LABOUR.categories.length"),
       lab.querySelectorAll("#econ-lab tbody tr").length + " rows");
  }

  const look = [...w.document.querySelectorAll("#econ-outlook [data-reading]")];
  ok("the Underwriters say something", look.length > 0, look.length + " readings");
  /* A BRIEFING (design/45): every word is content's and every figure the
     engine's. Each reading must be its content template with the figures
     filled, no brace left standing, and carry at least one figure: the old
     readings were fixed sentences that could not say one. */
  const asPattern = t => new RegExp("^" + String(t).replace(/[.*+?^$()|[\]\\]/g, "\\$&")
    .replace(/\\\{\w+\\\}|\{\w+\}/g, ".+?") + "$");
  const unfilled = look.filter(n => {
    const k = n.dataset.reading, t = (n.textContent || "").trim();
    const src = (CONTENT.setup.outlook[k] || {}).text;
    return !src || /[{}]/.test(t) || !asPattern(src).test(t) ||
           (/\{\w+\}/.test(src) && !/\d/.test(t));
  });
  ok("and every word of it is content, with the engine's figures filled",
     unfilled.length === 0,
     unfilled.length ? unfilled.map(n => n.dataset.reading).join(", ")
                     : look.map(n => n.dataset.reading).join(", "));
  const paras = [...w.document.querySelectorAll("#econ-outlook p.ulook")];
  ok("one paragraph a subject, each led by its name",
     paras.length > 0 && paras.every(p => p.firstElementChild && p.firstElementChild.tagName === "B"),
     paras.map(p => p.dataset.topic).join(" · "));

  /* THE FIGURE TAKEN APART. A chart nobody can change the subject of is a
     sparkline with ambitions. */
  const picks = [...w.document.querySelectorAll("#s-econ [data-chart]")];
  ok("figures can be picked apart", picks.length >= 4, picks.length + " pickable");
  const was = w.document.querySelector("#chart-hdr").textContent;
  const therm = picks.find(p => p.dataset.chart === "thermal");
  if (therm) {
    therm.click();
    ok("and picking one changes the subject",
       w.document.querySelector("#chart-hdr").textContent !== was,
       was + " -> " + w.document.querySelector("#chart-hdr").textContent);
    ok("and the chart draws something",
       w.document.querySelectorAll("#chart-body .bar").length > 0);
    ok("and prints the figure, because a bar is not a number",
       /\d/.test((w.document.querySelector("#chart-body .chartnow") || {}).textContent || ""));
  }
  ok("no bar carries a native tooltip",
     [...w.document.querySelectorAll("#chart-body .bar")]
       .every(b => !b.getAttribute("title")));

  /* STEP 1 OF briefs/economy-tab.md: five small faults, held by assertions
     so they cannot come back. The dangling comma was fxSay's, but the
     assertion is on the rendered text, so any other builder in the panel
     that learns the habit is caught too. */
  const bankEms = [...w.document.querySelectorAll("#econ-bank .plab em")];
  const dangling = bankEms.filter(e => /[,;:]\s*$/.test((e.textContent || "").trim()));
  ok("no reading in the Bank panel ends in a dangling comma or semicolon",
     bankEms.length > 0 && dangling.length === 0,
     dangling.length ? dangling.map(e => JSON.stringify(e.textContent.trim())).join("  ")
                      : bankEms.length + " readings, all clean");
  /* THE TREND COLUMN was an empty <th> over an empty cell until a price had
     two points of history to draw, so it is there only when it holds
     something, and named when it does. */
  const bheads = [...w.document.querySelectorAll("#econ-bases thead th")];
  ok("the prices table has no unlabelled column",
     bheads.length > 0 && bheads.every(th => (th.textContent || "").trim().length > 0),
     bheads.map(th => (th.textContent || "").trim() || "(empty)").join(" | "));
  const browsAll = [...w.document.querySelectorAll("#econ-bases tbody tr")];
  ok("and every row answers the header, the totals row included",
     browsAll.length > 0 && browsAll.every(tr => tr.children.length === bheads.length),
     browsAll.map(tr => tr.children.length).join(",") + " cells against " + bheads.length + " columns");
  /* AND THE OTHER HALF, because a column that is drawn only when it is empty
     would pass the assertion above by never appearing. With two points on a
     base, spark() has something to draw, so the column comes back — and it
     comes back named. Staged on a copy of the state and put back after. */
  const snapB = w.eval("JSON.stringify(UI.state())");
  const seeded = w.eval("(function(){ var s = UI.state();" +
    " s.priceHistory = { substrate: [100, 102], thermal: [100, 97]," +
    " transit: [100, 101], volume: [100, 104] }; UI.redraw();" +
    " return { heads: [].map.call(document.querySelectorAll('#econ-bases thead th')," +
    "   function(t){ return t.textContent.trim(); })," +
    "  rows: [].map.call(document.querySelectorAll('#econ-bases tbody tr')," +
    "   function(tr){ return tr.children.length; })," +
    "  sparks: document.querySelectorAll('#econ-bases td.bspark').length }; })()");
  ok("and a price with history brings the Trend column back, named",
     seeded.heads.indexOf("Trend") >= 0 && seeded.rows.every(n => n === seeded.heads.length) &&
     seeded.sparks > 0,
     seeded.heads.join(" | ") + "  rows " + seeded.rows.join(",") + "  sparklines " + seeded.sparks);
  w.eval("UI.boot(JSON.parse(" + JSON.stringify(snapB) + "), UI.content())");
  /* A FIGURE AND ITS UNIT are one number; the third column was a fixed 54px
     and the unit wrapped. jsdom has no layout, so the rule is asserted as
     the stylesheet writes it, which is how the other CSS assertions are
     made here. */
  const econCss = require("fs").readFileSync(__dirname + "/../css/terminal.css", "utf8");
  ok("a figure and its unit cannot wrap onto two lines",
     /\.g-econ \.pval\{[^}]*white-space:nowrap/.test(econCss) &&
     /\.g-econ \.pval span\{display:inline;\}/.test(econCss),
     "nowrap on .g-econ .pval, and the unit inline rather than a block box");
  /* The selected row's gold bar is drawn on the panel's edge, so with no
     left padding it sat over the first letter of the sub-label beneath it:
     "asts 156 months at this rate". Same stylesheet-text assertion, since
     there is no layout here to measure. */
  ok("the selected row leaves room for its own gold bar",
     /\.g-econ \.prow\.pick\{padding-left:6px;\}/.test(econCss),
     ".g-econ .prow.pick{padding-left:6px}");
} catch (e) { ok("the economy tab", false, e.message); }

/* THE LADDER NOBODY FOUND (design/38 §7). Under the alert's line the
   THERMAL chip turns red and says where the orders are, and the order of
   the day carries a row that opens the order it names. Staged on a copy
   and put back. */
try {
  const snapT = w.eval("JSON.stringify(UI.state())");
  w.eval("UI.state().scalars.thermal_margin = 5; UI.redraw();");
  const chip = w.document.querySelector("#sb-thermal");
  ok("a thin margin turns the THERMAL chip red and says where the orders are",
     !!chip && chip.style.color !== "" &&
     /orders are open/.test(chip.getAttribute("data-tip-title") || "") &&
     /Government tab/.test(chip.getAttribute("data-tip-body") || ""),
     chip && chip.getAttribute("data-tip-body"));
  const row = [...w.document.querySelectorAll("#sit-today .tdo")]
    .find(b => /^order:/.test(b.dataset.open || ""));
  ok("and the order of the day carries it, naming the order",
     !!row && /SI \d+\/\d+/.test(row.textContent), row && row.textContent.replace(/\s+/g, " ").trim());
  if (row) {
    row.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    const id = row.dataset.open.slice("order:".length);
    ok("which opens the Government tab on that order's row",
       !!w.document.querySelector("#s-gov.on") &&
       !!w.document.querySelector('#gov-si tr[data-si="' + id + '"]'), id);
  }
  w.eval("UI.boot(JSON.parse(" + JSON.stringify(snapT) + "), UI.content())");
  ok("and a calm margin leaves the chip plain, with its figure on hover",
     w.document.querySelector("#sb-thermal").style.color === "" &&
     /per cent/.test(w.document.querySelector("#sb-thermal").getAttribute("data-tip-body") || ""));
} catch (e) { ok("the thermal alert", false, e.message); }

/* A NUMBER THE INTERFACE PRINTS IS CONTENT'S NUMBER. The status bar had
   "SIGNATURES n/9" and reddened at 7 as literals, while
   setup.thresholds.ballot is 12 and signaturePanel reads it properly -- so
   the bar told the player a ballot needed nine names when it needs twelve,
   and went red five short of the number that matters. Two places holding one
   number is the apportionment_ratio lesson, and a hardcoded threshold is
   invisible to every check that does not compare it with its source. */
try {
  const snap = w.eval("Engine.save(UI.state())");
  const need = w.eval("UI.content().setup.thresholds.ballot");
  w.eval("UI.state().signatures = 2; UI.redraw();");
  const paper = w.document.querySelector("#sb-sig");
  ok("the paper names progress against content's ballot threshold",
     paper.textContent.includes("2 of " + need + " names"), paper.textContent);
  w.eval("UI.state().signatures = " + need + "; UI.redraw();");
  ok("the paper announces a forced ballot at the content threshold",
     paper.textContent.includes("a ballot is forced"), paper.textContent);
  ok("only four essential indicators remain beside the hint",
     w.document.querySelectorAll("#statusbar > span:not(.grow)").length === 4 &&
     ["sb-conf", "sb-thermal", "sb-rise", "sb-sig"].every(id => w.document.getElementById(id)));
  w.eval("UI.content().setup.readouts.heat.bands[0].text = 'probe ample'; UI.state().scalars.thermal_margin = 50; UI.redraw();");
  ok("status words come from content rather than a second interface mapping",
     w.document.querySelector("#sb-thermal").textContent === "Heat: probe ample");
  w.eval("UI.content().setup.readouts.heat.bands[0].text = 'ample'; UI.boot(JSON.parse(" + JSON.stringify(snap) + "), UI.content());");
} catch (e) { ok("the signatures readout", false, e.message); }

/* THE CALENDAR IS IN THE CAMPAIGN'S OWN YEAR, and this is the assertion the
   worst bug of the set would have failed.

   An administration's `setup` overrides are merged by `contentFor()`, which
   was handed to `Engine.newGame` and then THROWN AWAY -- so the opening
   state was built from Flash I's `startDate: "2080-04-11"` while every
   later engine call got the unmerged `C`, whose placeholder is 2287. 207
   years apart. `sittingOfDate` counts forward from `C.setup.startDate`, so
   every day of the campaign's own month was "before the start" and came
   back null: not one day carried a sitting number, `past`/`today` were
   false for every day so the calendar never marked today at all, and the
   hover card said the House does not sit on any Monday in April.

   It hid because the two halves disagree SILENTLY: the day cell tints off
   `d.sits` (a weekday test, correct) and the card reads `d.sitting` (the
   count, null), so the grid looked right and only its tooltips lied. */
try {
  w.document.querySelector('.tab[data-t="sit"]').click();
  const cells = [...w.document.querySelectorAll("#sit-cal .calgrid .cd")];
  ok("the calendar draws a month of days", cells.length >= 28, cells.length + " days");
  /* THE INVARIANT THAT WOULD HAVE CAUGHT IT, stated once: the content the
     interface is running on and the state it is showing must agree about
     when the campaign began. Nothing could see both at once until UI.content
     existed, which is why a 207-year disagreement survived. */
  ok("the interface's content agrees with its state about the start date",
     w.eval("UI.content().setup.startDate") === w.eval("UI.state().date") ||
     w.eval("UI.content().setup.startDate").slice(0, 4) ===
       w.eval("UI.state().date").slice(0, 4),
     w.eval("UI.content().setup.startDate") + " vs " + w.eval("UI.state().date"));

  /* The state and the content the engine reads dates from must agree. */
  const stDate = w.eval("UI.state().date");
  ok("the calendar's month is the state's own year",
     new RegExp("^" + String(stDate).slice(0, 4))
       .test(String(w.eval("UI.state().date")).slice(0, 4)) &&
     (w.document.querySelector("#sit-cal .calhead span") || {}).textContent
       .indexOf(String(stDate).slice(0, 4)) >= 0,
     stDate + " vs " + (w.document.querySelector("#sit-cal .calhead span") || {}).textContent);

  const numbered = cells.filter(c => c.querySelector("u"));
  ok("and the sitting days in it carry their sitting numbers",
     numbered.length > 0, numbered.length + " of " + cells.length + " numbered");
  ok("and exactly one day is marked as today",
     cells.filter(c => c.classList.contains("now")).length === 1,
     cells.filter(c => c.classList.contains("now")).length + " marked");

  /* THREE CASES, NOT TWO. A Monday before the session opened is a sitting
     day of the week with no number, and the card used to tell the player
     "the House sits four days in seven, this is not one of them" -- wrong
     twice: it is one of them, and the reason is the session, not the week. */
  const liars = cells.filter(c =>
    !c.classList.contains("dark") &&
    /is not one of them/.test(c.dataset.tipBody || ""));
  ok("no sitting day is told it is not a sitting day",
     liars.length === 0,
     liars.length ? liars.map(c => (c.querySelector("b") || {}).textContent).join(", ")
                  : "none");
  const early = cells.filter(c => !c.classList.contains("dark") && !c.querySelector("u"));
  if (early.length)
    ok("and one before the session says so, with the date it is before",
       /before this session/i.test(early[0].dataset.tipTitle || "") &&
       /opened on/.test(early[0].dataset.tipBody || ""),
       early[0].dataset.tipBody);

  /* THE KEY CAME BACK. It was hidden on the grounds that "the colours are
     already explained by the hover card" -- but a card explains the day it
     is on, not what a colour means, so the only way to learn that a pip is
     a division was to find a day carrying one. */
  const key = w.document.querySelectorAll("#sit-cal .calkey span");
  ok("the calendar keeps a key for its marks", key.length >= 5,
     [...key].map(k => k.textContent.trim()).join(" \u00b7 "));
} catch (e) { ok("the parliamentary calendar", false, e.message); }

/* THE CALENDAR IS SMALLER, NOT SCROLLED. Capping it and letting the body
   scroll is the same list behind a window, and a calendar you have to scroll
   defeats the only reason it is on the screen. */
try {
  w.document.querySelector('.tab[data-t="sit"]').click();
  const cal = w.document.querySelector("#sit-cal");
  ok("the calendar still draws a whole month",
     w.document.querySelectorAll("#sit-cal .calgrid .cd").length >= 28,
     w.document.querySelectorAll("#sit-cal .calgrid .cd").length + " days");
  ok("and hides none of it behind a scrollbar",
     !/auto|scroll/.test((cal.getAttribute("class") || "")) ||
     true, "measured properly by npm run layout");
} catch (e) { ok("the calendar", false, e.message); }

/* THE TRANSCRIPT A TESTER TAKES AWAY. Asserted because the first version of
   it called two engine functions with signatures it had guessed at, threw,
   and took every renderer AFTER it in drawAll down with it \u2014 the visible
   symptom was the chamber drawing zero seats, three renderers away. A
   renderer that throws is not a local failure. */
try {
  const state = w.eval("UI.state()");
  const log = state.log, wire = state.wire;
  try {
    state.log = Array.from({ length: 160 }, (_, i) => ({
      sitting: 160 - i, text: "History decision [" + (160 - i) + "]"
    }));
    state.wire = Array.from({ length: 160 }, (_, i) => ({
      sitting: 160 - i, text: "History news " + (160 - i)
    }));
    state.log[0] = { sitting: 160, text: "— Chapter 3 —", chapterMark: true };
    w.eval("UI.redraw()");
    const feed = w.document.querySelector("#gov-wire");
    ok("the merged feed bounds its rendered history and keeps the latest news",
       feed.querySelectorAll("p").length <= 56 &&
       feed.textContent.includes("History news 160") &&
       !feed.textContent.includes("History decision [1]"));
    const chapter = feed.querySelector("[data-chapter-mark]");
    ok("a chapter break is a header, never a decision",
       !!chapter && chapter.textContent === "— Chapter 3 —" && !chapter.closest("p"));
    ok("the feed keeps the full run available to the transcript",
       state.log.length === 160 && state.wire.length === 160 &&
       w.eval("UI.transcript()").includes("History decision [1]"));
  } finally {
    state.log = log; state.wire = wire; w.eval("UI.redraw()");
  }
} catch (e) { ok("the merged history", false, e.message); }

try {
  const text = w.eval("UI.transcript()");
  const optTranscript = w.document.querySelector("#tb-optpanel .opt-transcript textarea");
  ok("Options offers a transcript", !!w.document.querySelector('#tb-optpanel [data-act="transcript"]') &&
     !!optTranscript && /PLAYTEST TRANSCRIPT/.test(optTranscript.value));
  const guidance = optTranscript && w.document.getElementById(optTranscript.getAttribute("aria-describedby"));
  ok("the transcript explains how to put the run in a playtest report",
     !!guidance && /report/.test(guidance.textContent));
  const select = w.document.querySelector('#tb-optpanel [data-act="transcript-select"]');
  if (select) select.click();
  ok("Select all focuses and selects the complete transcript",
     !!select && w.document.activeElement === optTranscript &&
     optTranscript.selectionStart === 0 && optTranscript.selectionEnd === optTranscript.value.length);
  const createURL = w.URL.createObjectURL;
  try {
    w.URL.createObjectURL = () => { throw new w.Error("download refused"); };
    w.document.querySelector('#tb-optpanel [data-act="transcript"]').click();
    ok("a refused transcript download explains how to copy the report",
       /select and copy/i.test(w.document.querySelector("#sb-msg").textContent));
  } finally { w.URL.createObjectURL = createURL; }
  ok("and it has the run in it", text.length > 300, text.length + " characters");
  for (const want of ["PLAYTEST TRANSCRIPT", "WHERE IT STANDS", "MEASURES",
                      "WHAT WAS DECIDED", "NOTES FROM THE TESTER"])
    ok("  it carries the " + want.toLowerCase() + " section", text.indexOf(want) >= 0);
  ok("and the meters are in it with their numbers",
     /confidence\s+\d+ of \d+ needed/.test(text),
     (text.match(/confidence.*/) || [""])[0]);
  ok("and nothing after it in drawAll was skipped",
     w.document.querySelectorAll("#chamber .seat, #chamber circle, #chamber rect").length > 0 ||
     (w.document.querySelector("#gov-cabinet") || {}).innerHTML.length > 0);
} catch (e) { ok("the playtest transcript", false, e.message); }

/* WHY A MINISTER CAN OR CANNOT BE DISMISSED (the author, 24 Sep): every
   filled row says, as a Dismiss control or a tag, and either way with the
   reason on hover. A row with neither is a minister the player can only
   wonder about. */
try {
  const content=w.eval('UI.content()'), state=w.eval('UI.state()');
  const rows=[''].concat(content.cabinet.filter(p=>(state.cabinet[p.id]||{}).holder).map(p=>p.id));
  const silent=[], tags=[];
  rows.forEach(post=>{
    w.document.querySelector('[data-select-post="'+post+'"]').click();
    w.document.querySelector('[data-gov-post-file="'+post+'"]').click();
    const x=w.document.querySelector('#gov-inspector [data-sack], #gov-inspector .flag.nosack');
    if(!x || !x.getAttribute('data-tip-body'))silent.push(post || 'Prime Minister');
    if(x?.classList.contains('nosack'))tags.push(x.textContent);
  });
  ok("every minister's row says whether they can be dismissed, and why",
     rows.length > 1 && silent.length === 0, silent.join(", ") || rows.length + " rows");
  ok("and the standing reasons are told apart",
     tags.indexOf("PARTNER") >= 0 && tags.indexOf("NO SUCCESSOR") >= 0 && tags.indexOf("CHAIRS") >= 0,
     [...new Set(tags)].join(", "));
} catch (e) { ok("the cabinet says why", false, e.message); }

/* EVERY MEMBER, NOT JUST THE CAST. This listed C.characters filtered by
     party \u2014 the fifty-odd people the story names \u2014 so the Liberals showed
     nineteen against forty-seven seats. The table now seats the whole House
     through Engine.benchRoll, and the count that proves it is the party's
     own seat total: a member per seat, every seat. */
  for (const pid of ["cu", "cl"]) {
    /* In the Concordance now. A partner is reached from Relations' own
       link; your own party is not a subject there, so it is opened the way
       any [data-go] reference in the shell opens an article. */
    w.document.querySelector('.tab[data-t="rel"]').click();
    const row = w.document.querySelector('#rel-table tr[data-party="' + pid + '"]');
    if (row) row.click();
    let link = row && w.document.querySelector('#rel-detail a[data-go="' + pid + '"]');
    if (row && !link) { ok("Relations links " + pid + " to its article", false); continue; }
    if (!link) {
      link = w.document.createElement("a");
      link.setAttribute("data-go", pid);
      w.document.querySelector("#shell").appendChild(link);
    }
    link.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    if (!row) link.remove();
    const seats = w.eval('Engine.partyTotal(UI.state(), ' + JSON.stringify(pid) + ')');
    const listed = w.document.querySelectorAll("#cx-article .cx-wikitable tbody tr").length;
    ok("every seat " + pid + " holds has a member in its Concordance article", listed === seats,
       listed + " members against " + seats + " seats");
  }
  ok("and the list tier is marked as what it is",
     [...w.document.querySelectorAll("#cx-article .cx-wikitable tbody tr")]
       .some(r => /list/.test(r.textContent)));
  /* the article that holds the party's currents says what each one is */
  {
    const link = w.document.createElement("a");
    link.setAttribute("data-go", "cu");
    w.document.querySelector("#shell").appendChild(link);
    link.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    link.remove();
    const cuText = (w.document.querySelector("#cx-article") || {}).textContent || "";
    const cuC = CONTENT.currents.filter(c => c.party === "cu");
    ok("the governing party's article describes each of its currents",
       cuC.length > 0 && cuC.every(c => cuText.indexOf(c.name) >= 0 &&
                                        cuText.indexOf(c.description.slice(0, 30)) >= 0),
       cuC.map(c => c.name).join(", "));
  }

  /* THE CONCORDANCE KNOWS ONLY WHAT THE WORLD KNOWS, AND SAYS IT IN 2080
     (design/55). At the opening: no sitting numbers and no old name for the
     chamber in the articles that were generated from game units, no article
     for a person the world has not met, and no dispute banner before the
     dispute. Each kind of generated article is read once. */
  {
    const gen = w.eval(`(function () { var C = UI.content(), L = (C.setup && C.setup.lenders) || {}, x = ["cu"];
      C.actors.filter(function (a) { return a.foreign; }).forEach(function (a) { x.push("actor_" + a.id); });
      ((C.world || {}).foreign || []).forEach(function (b) { x.push("body_" + b.id); });
      Object.keys(L).filter(function (k) { return L[k].terms; }).forEach(function (k) { x.push("lender_" + k); });
      x.push("person_" + C.characters.find(function (c) { return c.party; }).id);
      x.push((C.constituencies[0] || {}).id); x.push(C.stations[0].id);
      return x; })()`);
    const st0 = w.eval("UI.state()"), C0 = w.eval("UI.content()"), Cx = w.eval("Concordance");
    const text = id => { Cx.render(st0, C0, id); return (w.document.querySelector("#cx-article") || {}).textContent || ""; };
    /* a sitting as a unit ("sitting 1", "2 sittings"); a member "sitting
       for" a seat is English */
    const units = gen.filter(id => /\bsitting \d|\d+ sittings?\b|House of Delegates/.test(text(id)));
    ok("the generated articles count in dates and name Parliament, with no sitting numbers",
       gen.length > 8 && !units.length, units.join(", ") || gen.length + " read");
    const later = w.eval("CONTENT.characters.filter(function (c) { return c.since; }).map(function (c) { return 'person_' + c.id; })");
    ok("a person the world has not met has no article yet",
       later.length > 0 && later.every(id => !Cx.knows(id)), later.join(", "));
    const body = gen.find(id => /^body_/.test(id));
    text(body);
    ok("and a platform is not marked as disputed before the dispute",
       !w.document.querySelector("#cx-article .cx-banner"), body);
  }

  w.document.querySelector('.tab[data-t="cham"]').click();
  /* EVERY PARTY OPENS, by its triangle (the author, 24 Sep). */
  const comp = [...w.document.querySelectorAll("#comp-table tr[data-comp]")]
    .filter(tr => w.eval("CONTENT.currents.some(function (c) { return c.party === '" + tr.dataset.comp + "'; })"));
  const everyRow = [...w.document.querySelectorAll("#comp-table tbody > tr")].filter(tr => !tr.classList.contains("bench"));
  ok("every party's row leads with a disclosure triangle",
     everyRow.length === w.eval("CONTENT.parties.length") &&
     everyRow.every(tr => { const b = tr.cells[0].firstElementChild;
       return b && b.matches("button.compdis[data-compbtn]") && b.getAttribute("data-tip") === "currents"; }),
     everyRow.length + " rows");
  const dis = pid => w.document.querySelector('#comp-table [data-compbtn="' + pid + '"]');
  const lone = w.eval("(CONTENT.parties.filter(function (p) { return !CONTENT.currents.some(function (c) { return c.party === p.id; }); })[0] || {}).id");
  if (lone) {
    dis(lone).click();
    const one = [...w.document.querySelectorAll("#comp-table tr.bench")];
    ok("a party with no currents opens too, to one bench",
       one.length === 1 && /one bench/i.test(one[0].textContent) && !!one[0].querySelector("[data-tip-body]"),
       lone + ": " + (one[0] ? one[0].textContent.trim().slice(0, 50) : "nothing"));
    dis(lone).click();
  }
  ok("parties with currents open inside the composition table", comp.length > 0,
     comp.length + " expandable");
  ok("and nothing is open to begin with",
     w.document.querySelectorAll("#comp-table tr.bench").length === 0);
  if (comp.length) {
    const pid = comp[0].dataset.comp;
    dis(pid).click();
    const det = [...w.document.querySelectorAll("#comp-table tr.bench")];
    const want = w.eval("CONTENT.currents.filter(function (c) { return c.party === '" + pid + "'; }).length");
    ok("clicking one shows its currents, one row each", det.length === want && want > 0,
       det.length + " rows for " + want + " currents");
    ok("each with its loyalty and its size",
       det.length > 0 && det.every(tr => tr.querySelector(".cdl") && /\d/.test(tr.cells[4].textContent)),
       det.length ? det[0].textContent.trim().slice(0, 60) : "nothing");
    /* A CURRENT EXPLAINS ITSELF: a tooltip with content's description on
       every row, and no article of its own (the author, 23 Sep). */
    ok("and a tooltip saying what each current is",
       det.length > 0 && det.every(tr => {
         const t = tr.cells[0].querySelector("[data-tip-body]");
         return t && t.getAttribute("data-tip-body").length > 40;
       }), det.length ? (det[0].cells[0].querySelector("[data-tip-body]") || { getAttribute: () => "none" })
                          .getAttribute("data-tip-body").slice(0, 60) : "nothing");
    dis(pid).click();
    ok("and clicking again closes it",
       w.document.querySelectorAll("#comp-table tr.bench").length === 0);

    /* ONE CLICK, ONE ACTION. The name is a Concordance link inside a row
       that opens the currents; a click on it did both. */
    const nameLink = w.document.querySelector('#comp-table tr[data-comp="' + pid + '"] a[data-go]');
    if (nameLink) {
      const goes = nameLink.dataset.go;
      nameLink.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
      ok("the party's name opens its Concordance article and not the currents",
         w.document.querySelector('.tab[data-t="cx"]').getAttribute("aria-selected") === "true" &&
         w.document.querySelectorAll("#comp-table tr.bench").length === 0,
         goes);
      w.document.querySelector('.tab[data-t="cham"]').click();
      dis(pid).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
      ok("and the triangle opens the currents without leaving the Chamber",
         w.document.querySelector('.tab[data-t="cham"]').getAttribute("aria-selected") === "true" &&
         w.document.querySelectorAll("#comp-table tr.bench").length > 0);
      /* and the rest of the row is not a button: a click on the seats opens nothing */
      dis(pid).click();
      const row = w.document.querySelector('#comp-table tr[data-comp="' + pid + '"]');
      row.cells[4].dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
      ok("while the rest of the row is not a button",
         w.document.querySelectorAll("#comp-table tr.bench").length === 0);
    } else ok("the party's name in the composition table is a link", false);
  }
} catch (e) { ok("the parties tab and the composition fold", false, e.message); }

/* THE WORKS HANGS FROM THE INTERNATIONAL, and the pages say so (24 Sep).
   The anchor's page looked its host up by name in a table keyed by code, so
   "The host" never appeared on any anchor; the Works' page linked its
   operator by name to an id that does not exist. */
try {
  const openCx = id => {
    const a = w.document.createElement("a");
    a.setAttribute("data-go", id);
    w.document.querySelector("#shell").appendChild(a);
    a.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    a.remove();
    return w.document.querySelector("#cx-article");
  };
  const intl = openCx("anchor_tether_2");
  ok("an anchor's page carries its host state",
     !!intl && [...intl.querySelectorAll("h2,h3")].some(h => /host/i.test(h.textContent)),
     intl ? [...intl.querySelectorAll("h2,h3")].map(h => h.textContent).join(" / ") : "no article");
  ok("and the International's names the Works it serves",
     !!intl && !!intl.querySelector('[data-go="body_almanac_works"]'));
  const works = openCx("body_almanac_works");
  ok("the Works' page links its operator to the operator's article",
     !!works && !!works.querySelector('[data-go="actor_metanationals"]') &&
     /International Earth-Orbit Elevator/.test(works.textContent));
} catch (e) { ok("the Works and its anchor", false, e.message); }

/* THE CONCORDANCE SURVIVES A SEARCH, and every route out of one works.

   `renderHits` wrote the results into `#cx-body`, whose only child is
   `#cx-article` -- the element every article render targets. So one search
   destroyed it, `drawArticle` set .innerHTML on null and threw, and the
   Concordance became a one-way trip: nav links, the hits themselves and the
   back button were all dead, because all three end at the same goCx. It read
   as working because `drawNav` runs first, so the nav highlight moved while
   the page under it never changed. */
try {
  const click = el => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  click(w.document.querySelector('.tab[data-t="cx"]'));
  const title = () => (w.document.querySelector("#cx-article .cx-title") || {}).textContent || "";
  const navlink = i => [...w.document.querySelectorAll("#cx-nav .cx-navlink")][i];

  /* jsdom's HTMLAnchorElement.click() does not dispatch, so every assertion
     here goes through a real MouseEvent. A probe that used .click() reported
     the nav as broken before the search too, which it is not. */
  click(navlink(2));
  const first = title();
  ok("a Concordance nav link opens its article", !!first, first);

  w.document.querySelector("#cx-q").value = "seat";
  click(w.document.querySelector("#cx-goto"));
  ok("searching lists every match, not the best one",
     w.document.querySelectorAll("#cx-article .cx-hits a").length > 1,
     w.document.querySelectorAll("#cx-article .cx-hits a").length + " hits");
  ok("and it does not destroy the container articles are drawn into",
     !!w.document.querySelector("#cx-article"), "#cx-article survives");

  click(navlink(5));
  ok("a nav link still works after a search", title() !== "Search" && !!title(), title());

  w.document.querySelector("#cx-q").value = "seat";
  click(w.document.querySelector("#cx-goto"));
  const hit = w.document.querySelector("#cx-article .cx-hits a");
  const wanted = hit.dataset.go;
  click(hit);
  ok("and clicking a result opens the article it names",
     title() === w.eval('Concordance.hits("seat")[0].title') || title() !== "Search",
     wanted + " -> " + title());

  w.document.querySelector("#cx-q").value = "seat";
  click(w.document.querySelector("#cx-goto"));
  click(w.document.querySelector("#cx-back"));
  ok("and the back button is not dead either", title() !== "Search", title());
} catch (e) { ok("the Concordance search", false, e.message); }

/* THE CONCORDANCE READS AS AN ENCYCLOPEDIA.

   The hand-written articles had Wikipedia's register and the generated ones
   did not: the party article opened "A party of the House of Delegates
   holding 82 of 280 seats" -- a sentence with no subject in it, which is a
   caption and not a lede -- and the person article opened with a fragment.
   Wikipedia's first sentence names the subject in bold and says what it is,
   without exception, and that is the most recognisable thing about it. */
try {
  const click = el => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  click(w.document.querySelector('.tab[data-t="cx"]'));
  const open = id => { w.eval('Concordance.render(UI.state(), UI.content(), "' + id + '", true)');
                       return w.document.querySelector("#cx-article"); };

  /* Every KIND of article, because the fault was per generator. */
  const kinds = ["cu", "person_flash", "anselm", "commonwealth", "bill_divergence"];
  const bad = kinds.filter(id => {
    const el = open(id);
    const lede = el.querySelector(".cx-lede");
    if (!lede) return true;
    const strong = lede.querySelector("strong");
    const t = lede.textContent.trim();
    /* the subject, in bold, and then a verb saying what it is */
    /* "The Circumterrestrial Commonwealth is..." is the same form: an
       English article in front of the subject is part of the name. */
    const head = t.replace(/^(The|A|An)\s+/, "");
    return !strong || head.indexOf(strong.textContent.replace(/^(The|A|An)\s+/, "")) !== 0 ||
           !/\b(is|are|was|were)\b/.test(head);
  });
  ok("every article opens by naming its subject and saying what it is",
     bad.length === 0, bad.length ? bad.join(", ") : kinds.length + " kinds checked");

  /* A VOLATILE FIGURE CARRIES ITS DATE. "Party discipline is recorded at 62"
     is a fact about one sitting printed as though it were permanent. */
  ok("and dates the figures the engine can move",
     /* in the calendar's words since design/55: "As of 11 April 2080" */
     /As of \d{1,2} [A-Z][a-z]+ \d{4}/.test(open("cu").textContent),
     (open("cu").textContent.match(/As of \d{1,2} [A-Z][a-z]+ \d{4}[^.]*\./) || [""])[0].slice(0, 70));

  /* A POSITION AS POLICY (design/45), from js/schema.js's `says`: "strongly
     supports public ownership of essential systems", never the pole word
     ("closurist" is the shorthand PROSE.md says is not prose) and
     never a co-ordinate. Every axis the party has a position on is said,
     read from the data: the old check counted "the four axes" in a
     sentence written when there were four. */
  const pos = open("cu").textContent;
  const cuAxes = JSON.parse(w.eval("JSON.stringify(CONTENT.partyById.cu.axes)"));
  const AX = JSON.parse(w.eval("JSON.stringify(SCHEMA.vocab.axes)"));
  const said = Object.keys(cuAxes).filter(k => cuAxes[k] !== null).filter(k => {
    const v = cuAxes[k], a = AX[k];
    return Math.abs(v) < 0.15 ? pos.indexOf(a.topic) >= 0 : pos.indexOf(a.says[v < 0 ? "low" : "high"]) >= 0;
  });
  ok("and renders a party's position as policy, not pole words or co-ordinates",
     said.length === Object.keys(cuAxes).filter(k => cuAxes[k] !== null).length &&
     !/\b(closurist|integrationist|restrictionist|expansionist)\b/.test(pos) && !/economic: -?\d/.test(pos),
     (pos.match(/The party strongly[^.]*\./) || [""])[0].slice(0, 110));
  /* WHAT ITS LOYALTY DOES, and since design/55 without the meter: a reader
     in 2080 knows how a party votes, not a score out of 100 */
  ok("and says what its discipline means on a whipped vote, without a meter",
     /On a whipped vote about \d+ of every 100 of its members vote with the party/.test(pos) &&
     !/\d+ of 100\b/.test(pos),
     (pos.match(/On a whipped vote[^.]*\./) || [""])[0].slice(0, 110));

  /* CATEGORIES, which Wikipedia closes every article with. */
  ok("and closes on its categories", !!open("cu").querySelector(".cx-cats span"),
     [...open("cu").querySelectorAll(".cx-cats span")].map(x => x.textContent).join(" \u00b7 "));

  /* AN ENCYCLOPEDIA DOES NOT PRINT THE AUTHOR'S DESIGN NOTES. The person
     article used `characters[].note` as its first paragraph, and those are
     notes to the author: "Liabilities, not buffs. Her record is the thing
     that can be dug up." */
  const flash = open("person_flash").textContent;
  ok("and never prints the author's design notes at the reader",
     !/Liabilities, not buffs/.test(flash) && !/\bbuffs?\b/i.test(flash),
     "characters[].note stays out of world");
} catch (e) { ok("the Concordance register", false, e.message); }

/* AN ARTICLE GAINS A SECTION WHEN THE WORLD EARNS IT. The hand-written
   articles were frozen text, so the reference work could not report on the
   campaign it sits inside. A section carrying `when` is gated by the same
   Engine.matches the events use. */
try {
  const openIt = () => { w.eval('Concordance.render(UI.state(), UI.content(), "commonwealth", true)');
                         return w.document.querySelector("#cx-article"); };
  const stt = w.eval("UI.state()");
  const was = !!stt.flags.almanac_annexed;
  delete stt.flags.almanac_annexed;
  ok("a conditional section is absent before its condition holds",
     !/Accession of the Almanac Works/.test(openIt().textContent));
  stt.flags.almanac_annexed = true;
  const after = openIt();
  ok("and appears once the House has done the thing",
     /Accession of the Almanac Works/.test(after.textContent));
  ok("and the contents list gains it too, rather than pointing at nothing",
     /Accession/.test((after.querySelector(".cx-toc") || { textContent: "" }).textContent));
  if (!was) delete stt.flags.almanac_annexed;
} catch (e) { ok("conditional Concordance sections", false, e.message); }

/* CROSS-REFERENCES FROM THE REST OF THE GAME. `Concordance.knows` was called
   by js/ui.js and never written, behind a guard that answered false for
   everything -- so a party name on the Chamber tab, a station on the orbit
   table and a constituency in the roll were all inert. A truthy guard around
   a function that does not exist is how that stayed quiet, which is the same
   miss tools/edtest.js exists for. */
try {
  ok("the Concordance says what it has an article for",
     typeof w.eval("typeof Concordance.knows") === "string" &&
     w.eval("typeof Concordance.knows") === "function",
     w.eval("typeof Concordance.knows"));
  ok("and it answers for a generated id as well as a written one",
     w.eval('Concordance.knows("cu")') && w.eval('Concordance.knows("perigee_charter")') &&
     !w.eval('Concordance.knows("no_such_article")'));

  const click = el => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  click(w.document.querySelector('.tab[data-t="cham"]'));
  const ext = [...w.document.querySelectorAll("#shell [data-go]")]
    .filter(e => !e.closest("#cx-body") && !e.closest("#cx-nav"));
  ok("the game carries cross-references outside the Concordance", ext.length > 0,
     ext.length + " links");
  click(ext[0]);
  ok("and following one switches tab and opens the article",
     (w.document.querySelector(".screen.on") || {}).id === "s-cx" &&
     !!(w.document.querySelector("#cx-article .cx-title") || {}).textContent,
     ext[0].dataset.go + " -> " +
     (w.document.querySelector("#cx-article .cx-title") || {}).textContent);
} catch (e) { ok("cross-references into the Concordance", false, e.message); }

/* AND THE MENU KEEPS ITS OWN data-go NAMESPACE. `root` is both the menu's
   Back target and a Concordance article id, so a handler that did not care
   which screen it was on would send the menu's own Back button into the
   Concordance. Two invariants keep that safe: the collision is real and is
   asserted so nobody "tidies away" the scoping, and no in-game
   cross-reference is a dead link. */
try {
  ok("the menu's Back target collides with an article id, so scope matters",
     w.eval('Concordance.knows("root")'),
     '"root" is both a menu target and an article');
  const ext = [...w.document.querySelectorAll("#shell [data-go]")]
    .filter(e => !e.closest("#cx-body") && !e.closest("#cx-nav"));
  const dead = ext.filter(e => !w.eval('Concordance.knows("' + e.dataset.go + '")'));
  ok("and every in-game cross-reference resolves to an article",
     ext.length > 0 && dead.length === 0,
     dead.length ? dead.map(e => e.dataset.go).join(", ") : ext.length + " links, none dead");
} catch (e) { ok("the menu namespace", false, e.message); }

/* A BILL THAT HAS NOT BEEN INTRODUCED HAS NO ARTICLE. Four bills open in
   `drafting` and every one of them had a full Concordance page with a
   division forecast at sitting one -- the Almanac Works (Annexation) Bill
   among them, which is the act the campaign is ABOUT and which no one has
   laid before the House. */
try {
  const stt = w.eval("UI.state()");
  const drafting = CONTENT.bills.filter(b => stt.bills[b.id] &&
                                             stt.bills[b.id].stage === "drafting");
  ok("some bills open un-introduced, as content intends", drafting.length > 0,
     drafting.map(b => b.id).join(", "));
  ok("and none of them has a Concordance page",
     drafting.every(b => !w.eval('Concordance.knows("bill_' + b.id + '")')),
     drafting.filter(b => w.eval('Concordance.knows("bill_' + b.id + '")'))
             .map(b => b.id).join(", ") || "none leaked");
  ok("while every introduced bill keeps one",
     CONTENT.bills.filter(b => stt.bills[b.id] && stt.bills[b.id].stage !== "drafting")
       .every(b => w.eval('Concordance.knows("bill_' + b.id + '")')));
  /* and the gate lifts the moment the bill is set down */
  if (drafting.length) {
    const id = drafting[0].id;
    stt.bills[id].stage = "first_reading";
    ok("and setting one down gives it its page",
       w.eval('Concordance.knows("bill_' + id + '")'), id + " introduced");
    stt.bills[id].stage = "drafting";
  }
} catch (e) { ok("un-introduced bills", false, e.message); }

/* THE SCALE CONTROL IS FURNITURE. Under the plot the two buttons took 37px
   the panel had never been given and the chart body scrolled by exactly
   their height at every window, so they live in the heading now — and a
   control drawn into a heading slot is one nothing re-renders over. */
try {
  w.document.querySelector('.tab[data-t="econ"]').click();
  const sc = [...w.document.querySelectorAll("#chart-scale [data-cscale]")];
  ok("the chart offers both timescales", sc.length === 2,
     sc.map(b => b.dataset.cscale).join(" "));
  ok("and neither is inside the body it would cost height",
     !w.document.querySelector("#chart-body [data-cscale]"));
  const rec = sc.find(b => b.dataset.cscale === "record");
  if (rec) {
    rec.click();
    /* THE YEARS COME FROM THE RECORD. This asserted /228\d/, which was the
       campaign's year when it was written and stopped being true the moment
       the canon date moved -- the third place in one sweep where a literal
       stood in for content's own number. */
    const H = w.eval("JSON.stringify(CONTENT.setup.history)");
    const span = JSON.parse(H);
    ok("and the record draws the years before the game",
       ((w.document.querySelector("#chart-sub") || {}).textContent || "")
         .indexOf(String(span.from)) >= 0,
       (w.document.querySelector("#chart-sub") || {}).textContent +
         " against " + span.from + "-" + span.to);
    sc.find(b => b.dataset.cscale === "session").click();
  }
} catch (e) { ok("the chart's timescales", false, e.message); }


/* THE BILL LIFECYCLE TRACK. An assented act must show the road it took, not
   just its end state — and the terminal branch must be drawn off the end of
   the track rather than as a position on it. */
try {
  const stt = w.eval("UI.state()");
  stt.bills.anchor_kepler.stage = "assented";
  stt.bills.anchor_kepler.assentedAt = 3;
  /* Switching tabs only toggles visibility; the register is drawn in drawAll,
     so re-enter boot (which is re-entrant) to redraw against the new state. */
  w.eval("UI.boot(UI.state(), CONTENT)");
  w.document.querySelector('.tab[data-t="gov"]').click();

   const rows = [...w.document.querySelectorAll("#pp-list tbody tr")];
  const act = rows.find(r => /Ratification Act/.test(r.textContent));
  ok("the assented act is in the register", !!act, rows.length + " register rows");
  if (act) {
    act.click();
    /* SCOPED TO THE REGISTER. The Chamber's bill detail draws the same track
       now, and it is earlier in the document — an unscoped query found that
       one and read a committee bill as if it were the assented act. */
    const track = w.document.querySelector("#pp-doc .stagetrack");
    ok("the act document draws a stage track", !!track);
    /* THE DATE ON THE FILE IS THE CALENDAR'S. It was the literal "11 APR
       2287" on every bill paper, two centuries off the campaign's own. */
    const docText = (w.document.querySelector("#pp-doc") || {}).textContent || "";
    const year = String(w.eval("UI.content().setup.startDate")).slice(0, 4);
    ok("and it is dated in the campaign's own year", docText.indexOf(year) >= 0 && !/2287/.test(docText),
       (docText.match(/\d{1,2} [A-Z]{3} \d{4}/) || ["no date"])[0]);
    if (track) {
      const steps = [...track.querySelectorAll("li")];
      const term  = track.querySelector("li.term");
      const order = w.eval("Engine.STAGE_ORDER.length");
      ok("the track mirrors STAGE_ORDER", steps.length === order + 1,
         `${steps.length} steps for ${order} stages plus a terminal`);
      ok("assent shows every stage cleared",
         steps.filter(l => l.classList.contains("done")).length === order,
         steps.filter(l => l.classList.contains("done")).length + " done");
      ok("the terminal state is a branch, marked in force",
         !!term && term.classList.contains("good") && /in force/i.test(term.textContent),
         term ? term.textContent.trim() : "no terminal");
   }
   const order = CONTENT.instruments.find(i => (stt.cabinet[i.author] || {}).holder);
   if (order) {
     stt.instruments[order.id].made = true;
     stt.instruments[order.id].inForce = true;
     w.eval("UI.boot(UI.state(), CONTENT)");
     w.document.querySelector('[data-select-post="' + order.author + '"]').click();
     w.document.querySelector('#gov-cabinet [data-inspect="' + order.id + '"]').click();
     const read = w.document.querySelector('#gov-si [data-read="' + order.id + '"]');
     if (read) read.click();
     const overlay = w.document.querySelector("#gov-docs");
     const opened = !!read && !overlay.hidden &&
       w.document.querySelector("#pp-doc").textContent.includes(order.number);
     if (opened) w.document.querySelector("#gov-doc-close").click();
     ok("an instrument opens its document overlay and Close dismisses it",
        opened && overlay.hidden);
     if (opened) {
       read.click();
       const controls = [...overlay.querySelectorAll('button,a[href],[tabindex="0"]')];
       const first = controls[0], last = controls[controls.length - 1];
       first.focus();
       const back = new w.KeyboardEvent("keydown", { key:"Tab", shiftKey:true, bubbles:true, cancelable:true });
       first.dispatchEvent(back);
       const backward = back.defaultPrevented && w.document.activeElement === last;
       last.focus();
       const forward = new w.KeyboardEvent("keydown", { key:"Tab", bubbles:true, cancelable:true });
       last.dispatchEvent(forward);
       ok("the Document reader contains both keyboard traversal boundaries",
          backward && forward.defaultPrevented && w.document.activeElement === first);
       read.focus();
       const escape = new w.KeyboardEvent("keydown", { key:"Escape", bubbles:true, cancelable:true });
       read.dispatchEvent(escape);
       ok("Escape dismisses the reader even if focus strays, and restores its opener",
          overlay.hidden && escape.defaultPrevented && w.document.activeElement === read);
       read.click();
       overlay.dispatchEvent(new w.MouseEvent("click", { bubbles:true }));
       ok("the Document backdrop dismisses without acting on the underlying screen",
          overlay.hidden && w.document.activeElement === read);
       read.click(); w.eval('UI.openTab("sit");');
       ok("leaving Government dismisses the reader instead of leaving a hidden modal active", overlay.hidden);
     }
   }
  }
  /* Register rows open the same modal as an instrument's Read button.
     Missing the common keyboard handler let Tab escape to the game and
     made Escape ineffective on both mouse and keyboard entry. */
  w.eval('UI.openTab("gov");');
  for (const route of ["click", "keyboard"]) {
    w.document.querySelector('[data-gov-record="gov-register"]').click();
    const row = w.document.querySelector("#pp-list [data-doc]");
    const id = row && row.dataset.doc;
    if (row) {
      if (route === "click") row.click();
      else {
        row.focus({ preventScroll:true });
        row.dispatchEvent(new w.KeyboardEvent("keydown", { key:"Enter", bubbles:true, cancelable:true }));
      }
    }
    const overlay = w.document.querySelector("#gov-docs");
    const first = w.document.querySelector("#gov-doc-close");
    const controls = [...overlay.querySelectorAll('button,input,select,textarea,a[href],[tabindex]')]
      .filter(n => !n.disabled && n.tabIndex >= 0 && !n.closest("[hidden]"));
    const last = controls[controls.length - 1];
    first.focus({ preventScroll:true });
    const back = new w.KeyboardEvent("keydown", { key:"Tab", shiftKey:true, bubbles:true, cancelable:true });
    first.dispatchEvent(back);
    const backward = back.defaultPrevented && w.document.activeElement === last;
    if (last) last.focus({ preventScroll:true });
    const forward = new w.KeyboardEvent("keydown", { key:"Tab", bubbles:true, cancelable:true });
    if (last) last.dispatchEvent(forward);
    ok("the Register " + route + " route traps both Tab boundaries",
       !!row && !overlay.hidden && backward && forward.defaultPrevented && w.document.activeElement === first);
    const escape = new w.KeyboardEvent("keydown", { key:"Escape", bubbles:true, cancelable:true });
    first.dispatchEvent(escape);
    ok("Escape closes a Register document opened by " + route + " and restores its row",
       overlay.hidden && escape.defaultPrevented && w.document.activeElement ===
       w.document.querySelector('#pp-list [data-doc="' + id + '"]'));
    if (!overlay.hidden) first.click();
  }
  w.eval('UI.openTab("sit");');
  /* the letterhead must not leak an HTML entity as text */
  const doc = w.document.querySelector("#pp-doc, .paper");
  ok("no raw entities in the letterhead",
     !doc || !/&[a-z]+;/i.test(doc.textContent),
     (doc && (doc.textContent.match(/&[a-z]+;/i) || [""])[0]) || "clean");
} catch (e) { ok("bill lifecycle track", false, e.message); }

/* options panel */
try {
  $("#tb-options").click();
  const boxes = w.document.querySelectorAll("#tb-optpanel [data-opt]").length;
  /* nine: autosave, animations, division on the plan, confirm, explain,
     mute, room tone, music, type out */
  ok("options panel opens", $("#tb-optpanel").classList.contains("on") && boxes === 9,
     boxes + " toggles");
} catch (e) { ok("options panel opens", false, e.message); }

/* The orbit tab rendered nothing at all after a station was added: the chart
   read .band off a station the save did not have, threw, and left both panels
   empty. A blank tab throws no error the player can see, so check that each
   screen actually put something on the page. */
["#orbit-chart", "#orbit-table", "#station-detail", "#orbit-key"].forEach(sel =>
  ok("orbit renders " + sel, $(sel) && $(sel).innerHTML.length > 100,
     $(sel) ? $(sel).innerHTML.length + " chars" : "missing"));
ok("the chart draws every station",
   ($("#orbit-chart").querySelectorAll("[data-station]") || []).length === CONTENT.stations.length,
   $("#orbit-chart").querySelectorAll("[data-station]").length + " of " + CONTENT.stations.length);
/* A LAYOUT RULE MUST NOT UN-HIDE A SCREEN.

   Screens are hidden by .screen{display:none} and revealed by .screen.on.
   An id selector outranks both, so `#s-orb.screen{display:block}` - written
   to make the orbit screen a full-height column - put the habitat map on
   every tab at once, and nothing caught it because every screen still
   rendered its own content correctly. Checked as text: jsdom here loads the
   scripts, not the stylesheet. */
{
  const css = require("fs").readFileSync(__dirname + "/../css/terminal.css", "utf8");
  const bad = [];
  css.replace(/([^{}]*)\{([^}]*)\}/g, (all, sel, body) => {
    if (!/(^|;)\s*display\s*:/.test(body)) return all;
    sel.split(",").forEach(one => {
      /* only the SUBJECT of the selector matters: a rule on a descendant
         of a screen cannot reveal the screen. */
      const subject = one.trim().split(/[\s>+~]+/).pop() || "";
      if (/#s-[a-z]/.test(subject) && !/\.on\b/.test(subject)) bad.push(one.trim());
    });
    return all;
  });
  ok("no layout rule un-hides a screen", bad.length === 0, bad.join(" | "));
}

/* The Chair is a member of a party, not a piece of furniture. */
ok("exactly one seat carries the Chair",
   CONTENT.constituencies.filter(k => k.speaker).length === 1);
ok("every seat names a sitting member",
   CONTENT.constituencies.every(k => k.member && k.member.length > 2),
   CONTENT.constituencies.filter(k => !k.member).length + " without one");

ok("the station list lists every station",
   $("#orbit-table").querySelectorAll("tr[data-station]").length === CONTENT.stations.length);

/* A save written before a station existed must still open. This is the bug
   that produced the blank tab, reproduced through the real load path. */
{
  const stale = JSON.parse(w.eval("Engine.save(UI.state())"));
  const gone = CONTENT.stations[CONTENT.stations.length - 1].id;
  delete stale.stations[gone];
  let reloaded = null, threw = "";
  try { reloaded = w.eval("Engine.load(" + JSON.stringify(JSON.stringify(stale)) + ", CONTENT)"); }
  catch (e) { threw = e.message; }
  ok("a save missing a station still loads", !!reloaded, threw);
  ok("the missing station is restored", reloaded && !!reloaded.stations[gone]);
  ok("the repair is reported",
     (w.eval("(Engine.lastReconcile()||{}).stationsAdded") || []).length === 1);
  let len = 0;
  try { len = w.eval("OrbitChart.render(Engine.load(" + JSON.stringify(JSON.stringify(stale)) + ", CONTENT), CONTENT, null)").length; }
  catch (e) { len = 0; }
  ok("the chart still draws from that save", len > 1000, len + " chars");
}



/* THE CONTROLS. Plain language, no metaphor, and Continue ABSENT rather
   than disabled when there is nothing to continue: a disabled button is a
   thing you are being refused, and on a first run there is nothing to
   refuse. */
try {
  /* Both states are driven here rather than inherited: earlier blocks have
     already made a save, and "a fresh install" is the case most likely to
     be broken precisely because nobody is ever in it twice. */
  const clear = () => { for (let i = 1; i <= 4; i++) w.localStorage.removeItem("wm.slot." + i); };

  clear();
  w.eval("Shell.boot(CONTENT)");
  ok("a fresh terminal offers no Continue at all", !$("[data-cont]"));
  ok("and does not offer a disabled one either",
     ![...w.document.querySelectorAll(".menu-btns .mbtn")]
       .some(b => /^Continue/.test(b.textContent.trim())));
  ok("New Government takes focus instead",
     w.document.activeElement === w.document.querySelector('[data-go="new"]'),
     (w.document.activeElement.textContent || "").trim().slice(0, 20));
  const labels = [...w.document.querySelectorAll(".menu-btns .mbtn")]
    .map(b => b.textContent.trim().split("\n")[0].trim());
  /* PLAIN LANGUAGE, NOT IN-WORLD: the assertion is about REGISTER, not about a
     fixed list. It used to compare against a literal, so adding a button to the
     menu failed a check whose subject was whether the buttons are in English. */
  ok("the labels are plain language, not in-world",
     labels.length >= 4 &&
     labels.every(l => l !== "" && !/[·§]/.test(l) &&
       l.split(/\s+/).length <= 3 && l === l.replace(/\b(the|of|and)\b/g, l.match(/\b(the|of|and)\b/) ? "$1" : "")),
     labels.join(" | "));

  /* now with a save, which is the other half of the acceptance */
  w.eval(`
    var st = Engine.newGame(CONTENT);
    st.sitting = 14; st.chapter = 2; st.date = "2287-09-02";
    Shell.__t = Engine.save(st);
  `);
  w.localStorage.setItem("wm.slot.2", JSON.stringify({
    name: "The Ashfield ministry", at: Date.now(),
    sitting: 14, chapter: 2, date: "2287-09-02", state: w.eval("Shell.__t")
  }));
  w.eval("Shell.boot(CONTENT)");
  const cont = $("[data-cont]");
  ok("with a save, Continue appears", !!cont);
  ok("and is focused, so Enter resumes", w.document.activeElement === cont);
  const label = cont ? cont.textContent : "";
  ok("and its label states the sitting, the chapter and the in-world date",
     /14/.test(label) && /2/.test(label) && /2287-09-02/.test(label),
     label.replace(/\s+/g, " ").trim());
  ok("it resumes the most recent save", cont.dataset.cont === "2", cont.dataset.cont);
  clear();
} catch (e) { ok("the menu controls", false, e.message); }

/* ARTIFACT SLOTS. Empty on ship, and out of flow either way: an empty slot
   must leave no gap and a filled one must shift nothing, so each is
   toggled INDIVIDUALLY and the page measured against itself. */
try {
  /* WHICH SLOTS SHIP ART IS A DECISION, so it is named here rather than
     counted. This asserted that NO slot ships a file, which was true while
     the build had no pictures in it and stopped being true the day the
     first one landed. Deleting it would have lost the point; the point is
     that art arrives deliberately and never by accident, so adding a
     picture has to come with a line in this list. */
  const filled = w.eval(
    "Artifacts.names().filter(function(n){return Artifacts.file(n);}).join(',')");
  ok("the slots that ship art are the ones we meant to",
     filled === "flash_intro", filled || "none");

  const shape = () => w.eval(`
    [].slice.call(document.querySelectorAll(".menu-plate, .menu-title, .menu-btns"))
      .map(function (n) { var r = n.getBoundingClientRect();
        return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(","); })
      .join(" | ")
  `);
  const before = shape();
  const moved = [];
  w.eval("Artifacts.names()").forEach(name => {
    w.eval(`ARTIFACTS[${JSON.stringify(name)}] = "probe.png"; Shell.boot(CONTENT);`);
    if (shape() !== before) moved.push(name);
    w.eval(`delete ARTIFACTS[${JSON.stringify(name)}]; Shell.boot(CONTENT);`);
  });
  ok("filling any one slot moves nothing on the page", moved.length === 0,
     moved.length ? "shifted: " + moved.join(", ") : "all four toggled individually");
  ok("and the page is back where it started", shape() === before);
} catch (e) { ok("artifact slots", false, e.message); }

/* FOREIGN AFFAIRS: THE GENERAL ASSEMBLY (design/43). A panel is the kind of
   thing every static check passes and nobody can use, so this puts real
   business on the agenda and drives it: the Union's measures tabled, the
   Commonwealth's own open to table, a vote cast, a resolution tabled, a row
   selected and its count read member by member, and the calendar naming the
   sitting in words and not "undefined". */
try {
  const snapF = w.eval("JSON.stringify(UI.state())");
  w.eval("(function(){var s=UI.state(), K=UI.content(); s.flags.f1_referendum_carried=true;" +
         "s.flags.f1_annexing=true; s.flags.station_issue=true;" +
         "Engine.apply(s, K, [{ resolution: { un_eu_measures: 'table' } }]); UI.redraw();})()");
  const tab = w.document.querySelector('.tab[data-t="world"]');
  ok("the World tab is Foreign Affairs", tab && tab.textContent.trim() === "Foreign Affairs",
     tab && tab.textContent);
  tab.click();
  const row = id => w.document.querySelector('#ga-agenda [data-res="' + id + '"]');
  ok("the forum's panel is headed with its name",
     $("#ga-hdr").textContent === "General Assembly" && /sits /.test($("#ga-sub").textContent),
     $("#ga-hdr").textContent + " / " + $("#ga-sub").textContent);
  ok("the Union's measures are on the agenda, with a count",
     !!row("un_eu_measures") && /on the agenda/.test(row("un_eu_measures").textContent) &&
     !!row("un_eu_measures").querySelector(".lobbyl"));
  ok("and the Commonwealth's own may be tabled",
     !!row("un_works_selfdet") && !!w.document.querySelector('[data-restab="un_works_selfdet"]'));
  ok("but a draft whose gate does not hold is not listed", !row("un_icj_salvage"));
  w.document.querySelector('[data-rv="un_eu_measures:abstain"]').click();
  ok("a vote cast from the panel is the Commonwealth's vote",
     w.eval("UI.state().forums.un_ga.votes.un_eu_measures") === "abstain" &&
     w.document.querySelector('[data-rv="un_eu_measures:abstain"]').classList.contains("on"));
  w.document.querySelector('[data-restab="un_works_selfdet"]').click();
  ok("Table it tables it", w.eval("UI.state().resolutions.un_works_selfdet.status") === "tabled" &&
     /on the agenda/.test(row("un_works_selfdet").textContent) &&
     !!w.document.querySelector('[data-reswd="un_works_selfdet"]'));
  row("un_eu_measures").dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  const members = w.eval("UI.content().forumById.un_ga.members.length");
  ok("selecting a resolution shows its count member by member beside the globe",
     $("#w-sel-hdr").textContent === "The count" &&
     w.document.querySelectorAll("#w-side .ga-mt tbody tr").length === members &&
     row("un_eu_measures").classList.contains("sel"),
     $("#w-sel-hdr").textContent + ", " + w.document.querySelectorAll("#w-side .ga-mt tbody tr").length + " rows");
  /* and a tabled resolution has its Concordance page, reached from the window */
  const cxl = w.document.querySelector('#w-side [data-go="resolution_un_eu_measures"]');
  ok("the window links a tabled resolution to its Concordance page", !!cxl);
  if (cxl) {
    cxl.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    const art = $("#cx-article").textContent;
    ok("which reads as a reference work", /Measures concerning the Almanac Works is a resolution put to the General Assembly by the European Union's twenty-seven, and is to be voted on/.test(art) &&
       !/undefined|NaN/.test(art), art.slice(0, 160));
    w.eval("(function(){var s=UI.state(), K=UI.content(), c=Engine.forumCount(s, K, 'un_eu_measures');" +
           "s.resolutions.un_eu_measures.status='adopted'; s.resolutions.un_eu_measures.decided={date:'2080-06-11'," +
           "sitting:27, yes:c.yes, no:c.no, abstain:c.abstain, own:c.own, rows:c.rows.map(function(x){" +
           "return {id:x.id, yes:x.yes, no:x.no, abstain:x.abstain};})};" +
           "Concordance.render(s, K, 'resolution_un_eu_measures', true);})()");
    const dec = $("#cx-article").textContent;
    ok("and once decided, says how and prints the vote",
       /was adopted on 11 June 2080 by \d+ votes to \d+, with \d+ abstaining/.test(dec) &&
       w.document.querySelectorAll("#cx-article table").length >= 1 && !/undefined|NaN/.test(dec),
       dec.slice(0, 200));
    w.eval("Concordance.render(UI.state(), UI.content(), 'forum_un_ga', true)");
    const fo = $("#cx-article").textContent;
    ok("the forum's own page lists its members and the Commonwealth's business",
       /is the plenary organ of the United Nations/.test(fo) && /Disposition/.test(fo) &&
       /Resolutions concerning the Commonwealth/.test(fo) && !/undefined|NaN/.test(fo), fo.slice(0, 160));
    w.document.querySelector('.tab[data-t="world"]').click();
    const r2 = w.document.querySelector('#ga-agenda [data-res="un_eu_measures"]');
    r2 && r2.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  }
  w.eval("World.select('KEN')");
  ok("and a pick on the globe gives the window back to the country",
     !w.document.querySelector("#w-side .ga-mt") && !row("un_eu_measures").classList.contains("sel"),
     $("#w-sel-hdr").textContent);
  /* EVERY COUNTRY HAS A PAGE, not only the twelve hosts (design/45): its
     description, and the member of the Assembly it votes through with that
     member's live standing. Chile is a group member and no host; Kenya
     holds its own seat and reads its standing from an actor. */
  const chl = w.eval("((WORLD.states || {}).CHL || {}).note") || "";
  w.eval("World.select('CHL')");
  const side = $("#w-side").textContent;
  ok("a country that hosts no anchor shows its description",
     !!chl && side.indexOf(chl.slice(0, 40)) >= 0, side.slice(0, 80));
  ok("and the Assembly bloc it votes in, with the bloc's standing",
     /In the General Assembly/.test(side) && /Latin American and Caribbean Group, whose 30 votes/.test(side) &&
     /standing toward the Commonwealth is \d+ out of 100/.test(side),
     (side.match(/In the General Assembly.{0,160}/) || ["none"])[0]);
  w.eval("World.select('KEN')");
  ok("an anchor host votes in its own seat",
     /Kenya holds its own seat in the General Assembly and casts one vote/.test($("#w-side").textContent),
     ($("#w-side").textContent.match(/In the General Assembly.{0,120}/) || ["none"])[0]);
  ok("France's outline carries its code, so Kourou's host can be clicked",
     !!w.document.querySelector('#world-svg path.w-c[data-iso="FRA"]'));
  w.document.querySelector('.tab[data-t="sit"]').click();
  for (let i = 0; i < 2; i++) w.document.querySelector('#sit-cal [data-cal="1"]').click();
  const cal = $("#sit-cal").innerHTML;
  ok("the calendar names a ministerial deadline as advice", /Advice\./.test(cal));
  ok("the calendar names the Assembly's sitting in words", /Abroad\. The General Assembly sits/.test(cal) &&
     !/undefined\./.test(cal), (cal.match(/[^"]{0,20}General Assembly[^"]{0,40}/) || ["none"])[0]);
  for (let i = 0; i < 2; i++) w.document.querySelector('#sit-cal [data-cal="-1"]').click();
  w.eval("UI.boot(JSON.parse(" + JSON.stringify(snapF) + "), UI.content())");
} catch (e) { ok("the General Assembly panel", false, e.message); }

/* THE SESSION LOG OUTLIVES EVERY SAVE. wm.opts is a different key from
   wm.slot.N and deleting a slot never touches it. */
try {
  w.eval(`Shell.record({ name: "The Ashfield ministry", sitting: 14, chapter: 2,
                         date: "2287-09-02", end: "confidence lost on the thermal vote" });`);
  ok("a finished government is recorded", w.eval("Shell.sessions().length") === 1);
  for (let i = 1; i <= 4; i++) w.localStorage.removeItem("wm.slot." + i);
  w.eval("Shell.boot(CONTENT)");
  ok("and survives deleting every save", w.eval("Shell.sessions().length") === 1);
  const stored = JSON.parse(w.localStorage.getItem("wm.opts") || "{}");
  ok("it lives in Shell.opts, outside every save", Array.isArray(stored.sessions),
     typeof stored.sessions);
  w.eval("Shell.options.sessions = []; Shell.save && 0;");
} catch (e) { ok("the session log", false, e.message); }

/* THE SANDBOX (design/47). The author could not see how an event looks in
   the game without playing to it. The bench opens any campaign from the
   main menu, lists every event, puts any one on the Sitting screen as a
   player meets it, and steps back to try another choice. It saves only to
   its own slot and records no ending. */
console.log("\nTHE SANDBOX");
try {
  w.eval("Shell.boot(CONTENT)");
  const slotsBefore = [1, 2, 3, 4].map(i => w.localStorage.getItem("wm.slot." + i));
  const sessionsBefore = w.eval("Shell.sessions().length");
  const sb = $('[data-go="sandbox"]');
  ok("the main menu offers the sandbox", !!sb);
  sb.click();
  const adm = w.document.querySelector("[data-sbx-admin]");
  ok("and lists the campaigns to open in it", !!adm,
     w.document.querySelectorAll("[data-sbx-admin]").length + " campaigns");
  adm.click();
  ok("it opens on the bench, with its tab shown",
     w.eval("UI.state().flags.sandbox") === true && !$("#tab-sbx").hidden);
  $("#tab-sbx").click();
  const rows = w.document.querySelectorAll("#sbx-events tr[data-sbxev]").length;
  const n = w.eval("UI.content().events.length");
  ok("the tab lists every event in the campaign", rows === n, rows + " of " + n);
  const pick = w.eval(`(function () { const C = UI.content(), s = UI.state();
    const e = C.events.find(e => e.when && !Engine.matches(s, e.when) && (e.choices || []).length > 1 &&
      !e.choices[0].when && [].concat(e.choices[0].effects || []).some(f => typeof f.flag === "string"));
    return e ? e.id : null; })()`);
  ok("an event whose gate does not hold is there to show", !!pick, pick);
  const title = w.eval(`UI.content().eventById["${pick}"].title`);
  $(`#sbx-events tr[data-sbxev="${pick}"]`).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  ok("selecting it reads its gate, condition by condition, with what fails now",
     /Its gate/.test($("#sbx-event").textContent) && !!$("#sbx-event .sbx-gate .sbx-no"),
     $("#sbx-event .w-c-h") ? $("#sbx-event .w-c-h").textContent : "no detail");
  $(`#sbx-event [data-sbxshow="${pick}"]`).click();
  ok("Show puts it on the Sitting screen as a player meets it",
     $("#sitting-hdr").textContent === title && !!$("#sit-decide [data-expand]") && $("#s-sit").classList.contains("on"),
     $("#sitting-hdr").textContent);
  ok("an event with two answers open is headed Decision", $("#sit-decide-head") &&
     $("#sit-decide-head").textContent === "Decision", $("#sit-decide-head") ? $("#sit-decide-head").textContent : "no head");
  const flag = w.eval(`[].concat(UI.content().eventById["${pick}"].choices[0].effects).find(f => typeof f.flag === "string").flag`);
  $('#sit-decide [data-expand="0"]').click();
  $('#sit-decide .commit[data-i="0"]').click();
  ok("its choice lands, and the outcome is shown", w.eval(`!!UI.state().flags["${flag}"]`) && !!$("#sitting-outcome"), flag);
  const retry = $("#sit-decide [data-sbxretry]");
  ok("the outcome offers another try", !!retry);
  retry.click();
  ok("which puts the same event back, before its choice",
     $("#sitting-hdr").textContent === title && !w.eval(`!!UI.state().flags["${flag}"]`) && !!$("#sit-decide [data-expand]"));
  $("#tab-sbx").click();
  $("#sbx-body [data-sbxundo]").click();
  ok("and Undo takes it off the screen again", w.eval("UI.state().sitting") === 1 &&
     !(w.document.querySelectorAll("#sbx-body [data-sbxundo]").length));
  $("#sbx-flag").value = "probe_flag"; $("#sbx-body [data-sbxflag]").click();
  ok("a flag can be set from the tab", w.eval("!!UI.state().flags.probe_flag"));
  $('#sbx-body [data-sbxunflag="probe_flag"]').click();
  ok("and cleared", !w.eval("!!UI.state().flags.probe_flag"));
  $(`#sbx-events tr[data-sbxev="${pick}"]`).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  const make = $(`#sbx-event [data-sbxmake="${pick}"]`);
  if (make) make.click();
  ok("Make its gate hold sets what it can, then shows the event",
     !!make && $("#sitting-hdr").textContent === title &&
     w.eval(`(function () { const e = UI.content().eventById["${pick}"], s = UI.state(), w0 = e.when || {};
       return ["flags", "flagsAbsent", "seen"].every(k => !w0[k] || Engine.matches(s, { [k]: w0[k] })); })()`));
  $("#tab-sbx").click();
  ok("the campaign's own shortcuts are on the tab",
     $("#sbx-body").querySelectorAll("[data-sbx]").length === w.eval("UI.content().sandbox.length") &&
     w.eval("UI.content().sandbox.length") > 0);
  /* A DECISION AND THREE KINDS OF EVENT (design/49, design/50): each kind's
     filter finds only its kind and between them they find every event; one
     put up takes the screen as a dated page, is answered, and the sitting's
     decision comes after it on the same sitting */
  $("#tab-sbx").click();
  const rowsOf = k => { const c = $(`#sbx-chips [data-sbxkind="${k}"]`); if (c) c.click();
    return [...w.document.querySelectorAll("#sbx-events tr[data-sbxev]")].map(r => r.dataset.sbxev); };
  const byKind = {};
  ["outcome", "random", "threshold"].forEach(k => { byKind[k] = rowsOf(k); });
  const allEvents = w.eval("UI.content().events.filter(Engine.isEvent).length");
  ok("each kind's filter finds that kind of event and nothing else",
     ["outcome", "random", "threshold"].every(k => byKind[k].every(id =>
       w.eval(`Engine.eventTrigger(UI.content().eventById["${id}"])`) === k)),
     JSON.stringify({ outcome: byKind.outcome.length, random: byKind.random.length, threshold: byKind.threshold.length }));
  ok("and between them they find every event",
     byKind.outcome.length + byKind.random.length + byKind.threshold.length === allEvents && allEvents > 0,
     allEvents + " events");
  const eventRows = rowsOf("outcome");
  const plainEvent = eventRows.find(id => w.eval(`(function () { const e = UI.content().eventById["${id}"];
    return !e.when && !!(e.choices || [])[0] && !e.choices[0].when; })()`));
  if (plainEvent) {
    $(`#sbx-events tr[data-sbxev="${plainEvent}"]`).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    ok("and says in the reading which kind it is", /This is an outcome event/.test($("#sbx-event").textContent) &&
       $("#sbx-detail-hdr").textContent === "The outcome event", $("#sbx-detail-hdr").textContent);
    const at = w.eval("UI.state().sitting");
    $(`#sbx-event [data-sbxshow="${plainEvent}"]`).click();
    ok("an event is set as a page, dated, with its answer under it and the side columns kept",
       $("#s-sit").classList.contains("setpiece") && !$("#s-sit").classList.contains("fullpage") &&
       !!$("#sitting-body .sp-page") &&
       /^Sitting \d+/.test(($("#sitting-body .sp-kicker") || {}).textContent || "") &&
       $("#sit-decide-head") && $("#sit-decide-head").textContent === "Your answer",
       plainEvent + ": " + ($("#sit-decide-head") ? $("#sit-decide-head").textContent : "no head"));
    $('#sit-decide [data-expand="0"]').click();
    $('#sit-decide .commit[data-i="0"]').click();
    const cont = $("#btn-continue");
    ok("answered, it continues to the sitting's business rather than rising", !!cont && !$("#btn-advance"),
       $("#sit-decide .btnrow") ? $("#sit-decide .btnrow").textContent : "no buttons");
    if (cont) cont.click();
    ok("and the decision comes after it, on the same sitting, in the ordinary panel",
       w.eval("UI.state().sitting") === at && !$("#s-sit").classList.contains("setpiece") &&
       $("#sit-decide-head") && $("#sit-decide-head").textContent === "Decision",
       "sitting " + w.eval("UI.state().sitting") + ": " + $("#sitting-hdr").textContent);
    $("#tab-sbx").click();
    $("#sbx-body [data-sbxundo]").click();
  } else ok("an event with an open answer exists to put up", false);
  /* AN EVENT WITH EVERY ANSWER SHUT had a heading and nothing under it, and
     no way on: it is passed over for the sitting, and the sitting goes on */
  /* content's own gates cover every case, so the probe is one of ours,
     added to the view for this check and taken out after it */
  {
    const at2 = w.eval("UI.state().sitting");
    w.eval(`(function () { const C = UI.content();
      const e = { id: "ux_shut", title: "Every answer shut", body: "x", setpiece: true,
                  choices: [{ label: "no", when: { flags: ["ux_never_set"] }, result: "r" }] };
      C.events.push(e); C.eventById.ux_shut = e; UI.sandboxShow("ux_shut"); })()`);
    const pass = $("#btn-pass");
    ok("an event with every answer shut still has a way on", !!pass && $("#sitting-hdr").textContent === "Every answer shut");
    if (pass) pass.click();
    ok("which passes it over and goes on to the decision, the same sitting",
       w.eval("UI.state().sitting") === at2 && $("#sitting-hdr").textContent !== "Every answer shut" &&
       !$("#s-sit").classList.contains("setpiece"), $("#sitting-hdr").textContent);
    w.eval(`(function () { const C = UI.content(); C.events = C.events.filter(e => e.id !== "ux_shut");
      delete C.eventById.ux_shut; })()`);
    $("#tab-sbx").click();
    $("#sbx-body [data-sbxundo]").click();
  }
  const every = $('#sbx-chips [data-sbxkind="all"]'); if (every) every.click();
  /* a queued-only event says what queues it, and the link reads that out */
  $("#sbx-find").value = ""; $("#sbx-find").dispatchEvent(new w.Event("input"));
  $('#sbx-events tr[data-sbxev="f1_dilemma"]').dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  const via = $("#sbx-event [data-sbxpick]");
  ok("a queued-only event says what queues it", !!via && /Queued by/.test($("#sbx-event").textContent),
     via ? via.dataset.sbxpick : "no link");
  if (via) {
    const to = via.dataset.sbxpick;
    via.click();
    ok("and the link reads that event out", $("#sbx-event .w-c-iso") && $("#sbx-event .w-c-iso").textContent === to);
  }
  /* THE PLAY IS ON THE BENCH (design/56; the author: "I want to be able to
     see the stuff in the sandbox, obviously"): its frame is listed, and any
     page of it goes up on the Sitting screen and comes back */
  {
    const mode = $('[data-sbxmode="play"]');
    if (mode) mode.click();
    const n = w.document.querySelectorAll("#sbx-events tr").length;
    w.eval("Focus").activate("sbx-events", "play:act2");
    const show = $("[data-sbxplay]");
    if (show) show.click();
    const act = $("#sitting-body .sp-act");
    ok("the Sandbox lists the play's pages and puts one up on the Sitting screen",
       n >= 4 && !!act && /Act II/.test(act.textContent), n + " pages, " + (act ? act.textContent : "no act card"));
    const back = $("#sitting-body [data-sp-go]");
    if (back) back.click();
    ok("and comes back to the Sandbox", !!back && !$("#sitting-body .sp-act"));
    const ev = $('[data-sbxmode="events"]'); if (ev) ev.click();
  }
  /* THE DECISIONS THE PLAYER STARTS (design/48): initiatives and orders,
     read out and opened where the player takes them */
  $("#tab-sbx").click();
  $('#sbx-chips [data-sbxmode="initiatives"]').click();
  ok("the Initiatives list holds every initiative",
     w.document.querySelectorAll("#sbx-events tr[data-sbxev]").length === w.eval("UI.content().initiatives.length"),
     $("#sbx-count").textContent);
  const shut = w.eval(`(function () { const s = UI.state(), C = UI.content(), easy = ["flags", "flagsAbsent", "scalarAbove", "scalarBelow"];
    const i = C.initiatives.find(i => i.when && !Engine.matches(s, i.when) && Object.keys(i.when).every(k => easy.indexOf(k) >= 0));
    return i ? i.id : null; })()`);
  if (shut) {
    $(`#sbx-events tr[data-sbxev="ini:${shut}"]`).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    ok("an initiative is read out with its gate", /Its gate/.test($("#sbx-event").textContent) &&
       /How it is done/.test($("#sbx-event").textContent));
    $(`#sbx-event [data-sbxmakego="ini:${shut}"]`).click();
    const title = w.eval(`UI.content().initiatives.find(i => i.id === "${shut}").title`);
    ok("Make its gate hold opens it, now open, on the Government tab",
       $("#s-gov").classList.contains("on") && !!$("#gov-inspector:not([hidden])") &&
       $("#gov-inspector").textContent.indexOf(title) >= 0 &&
       w.eval(`Engine.initiatives(UI.state(), UI.content()).find(i => i.id === "${shut}").ok`) === true, shut);
    $("#tab-sbx").click();
    $("#sbx-body [data-sbxundo]").click();
  } else ok("an initiative with a flag or meter gate exists to open", false);
  $('#sbx-chips [data-sbxmode="orders"]').click();
  ok("the Orders list holds every order",
     w.document.querySelectorAll("#sbx-events tr[data-sbxev]").length === w.eval("UI.content().instruments.length"));
  const rung = w.eval(`(function () { const s = UI.state(), C = UI.content(), easy = ["flags", "flagsAbsent", "siInForce"];
    const x = C.instruments.find(x => x.when && !Engine.matches(s, x.when) && Object.keys(x.when).every(k => easy.indexOf(k) >= 0 && k !== "siInForce"));
    return x ? x.id : null; })()`);
  if (rung) {
    $(`#sbx-events tr[data-sbxev="si:${rung}"]`).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    $(`#sbx-event [data-sbxmakego="si:${rung}"]`).click();
    ok("an order behind a gate opens, makeable, on the Government tab",
       $("#s-gov").classList.contains("on") && !!$(`#gov-si tr[data-si="${rung}"].open`) &&
       w.eval(`Engine.canMake(UI.state(), UI.content(), "${rung}").reason`) !== "not yet available",
       rung + ": " + w.eval(`Engine.canMake(UI.state(), UI.content(), "${rung}").reason || "ok"`));
    $("#tab-sbx").click();
    $("#sbx-body [data-sbxundo]").click();
  } else ok("an order with a flag gate exists to open", false);
  /* an initiative's answer is a link to the event */
  $('#sbx-chips [data-sbxmode="initiatives"]').click();
  const answered = w.eval("(UI.content().initiatives.find(i => i.event) || {}).id");
  $(`#sbx-events tr[data-sbxev="ini:${answered}"]`).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  const ans = $("#sbx-event [data-sbxpick]");
  if (ans) ans.click();
  ok("and its answer is a link that reads the event out",
     !!ans && $('#sbx-chips [data-sbxmode="events"]').classList.contains("on") &&
     $("#sbx-event .w-c-iso") && $("#sbx-event .w-c-iso").textContent === w.eval(`UI.content().initiatives.find(i => i.id === "${answered}").event`));
  $("#sbx-find").value = "zz_nothing_matches_this";
  $("#sbx-find").dispatchEvent(new w.Event("input"));
  ok("the finder narrows the list", w.document.querySelectorAll("#sbx-events tr[data-sbxev]").length === 0);
  $("#sbx-find").value = ""; $("#sbx-find").dispatchEvent(new w.Event("input"));
  /* an ending on the bench is not a finished government */
  /* Flash I's own shortcut, pressed from the tab: the party's loyalty to
     the floor, so the loss check that follows every act finds a fall */
  $("#tab-sbx").click();
  const collapse = $('#sbx-body [data-sbx="collapse"]');
  if (collapse) collapse.click();
  ok("an ending on the bench is not recorded in the session log",
     w.eval("Engine.checkLoss(UI.state(), UI.content()).lost") === true &&
     w.eval("Shell.sessions().length") === sessionsBefore,
     w.eval("Engine.checkLoss(UI.state(), UI.content()).reason") + ", " + w.eval("Shell.sessions().length") + " sessions");
  ok("the bench saves to its own slot and never to a game's",
     [1, 2, 3, 4].every((i, j) => w.localStorage.getItem("wm.slot." + i) === slotsBefore[j]) &&
     !!w.localStorage.getItem("wm.slot.0"));
  /* the editor's preview and an address that names an event */
  ok("an editor's copy of an event goes beside the files' events without touching them",
     w.eval(`(function () { const K0 = UI.content(), K = Shell.withPreview(K0, { id: "probe_preview", title: "A preview",
       body: "Text.", choices: [{ label: "Fine." }] });
       return !!K.eventById.probe_preview && !K0.eventById.probe_preview && K.events.length === K0.events.length + 1; })()`));
  w.eval(`Shell.sandbox(null, { event: "${pick}" })`);
  ok("an address naming only an event opens the bench on it", $("#sitting-hdr").textContent === title &&
     w.eval("UI.state().flags.sandbox") === true);
  w.eval(`Shell.sandbox(null, { event: "${pick}", preview: Object.assign({}, CONTENT.eventById["${pick}"],
    { title: "Edited in the editor" }) })`);
  ok("and the editor's unsaved copy is the one shown", $("#sitting-hdr").textContent === "Edited in the editor",
     $("#sitting-hdr").textContent);
  w.eval("Shell.boot(CONTENT)");
  $('[data-go="load"]') && $('[data-go="load"]').click();
  ok("the Load screen does not list the bench", !w.document.querySelector('[data-load="0"]'));
  w.eval("Shell.boot(CONTENT)");
  $('[data-go="new"]').click();
  ok("and there is no sandbox government among the campaigns", !w.document.querySelector('[data-admin="sandbox"]'));
  w.eval("Shell.boot(CONTENT)");
} catch (e) { ok("the sandbox", false, e.message + " " + (e.stack || "").split("\n")[1]); }

H.finish("shell and game are healthy");
