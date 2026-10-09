"use strict";
const assert=require("node:assert/strict");
const A=require("./consequence.js"),{analyze}=A;
function run(){
  let failed=0;
  function check(name,fn){try{fn();console.log("chain contract: "+name+" passes");}
    catch(e){failed++;console.log("chain contract: "+name+" FAIL: "+e.message);}}
  const row=(C,key,source="")=>analyze(C,source).find(r=>r.k===key);
  const moved=key=>({choices:[{effects:[{move:{[key]:1}}]}]});
  check("policy rule is a price mover",()=>{
    const r=row({setup:{priceRules:[{k:"rent",base:110}]},events:[{when:{priceAbove:{rent:105}}}]},"price.rent");
    assert.ok(r.m>0);assert.equal(r.verdict,"ok");
  });
  check("House business is live feedback",()=>{
    const r=row({events:[moved("standing")],business:[{when:{scalarBelow:{standing:30}}}]},"scalar.standing");
    assert.equal(r.verdict,"ok");
  });
  check("docket alerts read scalars",()=>{
    const r=row({events:[moved("heat")],setup:{alerts:[{when:{scalarBelow:{heat:8}}}]}},"scalar.heat");
    assert.equal(r.verdict,"ok");
  });
  check("indirect rule reaches a gate",()=>{
    const r=row({events:[moved("price.heat"),{when:{priceAbove:{rent:105}}}],setup:{priceRules:[
      {k:"rent",base:100,terms:[{from:"price.heat",per:0.4}]}]}},"price.heat");
    assert.equal(r.verdict,"ok");assert.ok(r.path.includes("price.rent"));
  });
  check("coupling reaches a gate",()=>{
    const r=row({events:[moved("pressure"),{when:{scalarBelow:{heat:8}}}],
      setup:{couplings:[{meter:"pressure",above:40,drag:{heat:-1}}]}},"scalar.pressure");
    assert.equal(r.verdict,"ok");assert.ok(r.path.includes("scalar.heat"));
  });
  check("suspension reaches a station gate",()=>{
    const r=row({events:[moved("price.rent"),{when:{suspendedAbove:{all:10000}}}],
      setup:{suspension:{price:"rent"}}},"price.rent");
    assert.equal(r.verdict,"ok");assert.ok(r.path.includes("station.suspended"));
  });
  check("a rule cycle is not feedback",()=>{
    const C={events:[moved("price.a")],setup:{priceRules:[
      {k:"b",terms:[{from:"price.a",per:1}]},{k:"a",terms:[{from:"price.b",per:1}]}]}};
    assert.equal(row(C,"price.a").verdict,"NUMBER NOBODY SEES");
  });
  check("a zero coefficient creates no reader",()=>{
    const C={events:[moved("price.a"),{when:{priceAbove:{b:1}}}],
      setup:{priceRules:[{k:"b",terms:[{from:"price.a",per:0}]}]}};
    assert.equal(row(C,"price.a").verdict,"NUMBER NOBODY SEES");
  });
  check("a gate without movement still fails",()=>{
    assert.equal(row({events:[{when:{priceAbove:{dead:1}}}]},"price.dead").verdict,"EVENT NEVER FIRES");
  });
  check("engine scalar reader is mechanical feedback",()=>{
    assert.equal(row({events:[moved("loyalty")]},"scalar.loyalty",
      "function loss(st){return st.scalars.loyalty<15;}").verdict,"ok (read by the engine)");
  });
  check("an assignment is not a reader",()=>{
    assert.equal(row({events:[moved("loyalty")]},"scalar.loyalty",
      "function set(st){st.scalars.loyalty=50;}").verdict,"NUMBER NOBODY SEES");
  });
  check("a comment is not a law reader",()=>{
    assert.equal(row({events:[{choices:[{effects:[{law:{unused:true}}]}]}]},"law.unused",
      "/* st.law.unused */").verdict,"NUMBER NOBODY SEES");
  });
  check("a dynamic fiscal rate is a real reader",()=>{
    const r=row({events:[{choices:[{effects:[{law:{rate_volume:"high"}}]}]}],
      setup:{fiscal:{bases:[{k:"volume"}]}}},"law.rate_volume",
      'function rate(st,k){return (st.law||{})["rate_"+k];}');
    assert.equal(r.verdict,"ok (read by the engine)");
  });
  check("a display read cannot satisfy the price rule",()=>{
    assert.equal(row({events:[moved("price.rent")]},"price.rent",
      "function shown(st){return st.prices.rent;}").verdict,"NUMBER NOBODY SEES");
  });
  check("bad input does not silently pass",()=>{
    assert.throws(()=>analyze({events:null,setup:{priceRules:"bad"}},""));
  });
  check("closure feedback cannot excuse another station field",()=>{
    const C={events:[{choices:[{effects:[{station:{one:{unknown:1}}}]}]}]};
    const r=analyze(C,"",{edges:[],feedback:["station.closure"]}).find(r=>r.k==="station.unknown");
    assert.ok(r,"station fields retain separate identities");
    assert.equal(r.verdict,"NUMBER NOBODY SEES");
  });
  check("lint isolates campaigns and excludes parked variants",()=>{
    const cp=require("node:child_process"),path=require("node:path");
    const script=`const L=require('./tools/loadcontent.js'),load=L.loadContent;
      L.loadContent=()=>{const C=load();
        C.events.push({id:'chain_probe_move',campaign:'chain_probe_a',choices:[{effects:[{price:{probe:1}}]}]},
          {id:'chain_probe_gate',campaign:'chain_probe_b',when:{priceAbove:{probe:1}}},
          {id:'chain_retired_gate',campaign:'parked',when:{priceAbove:{probe:1}}});
        for(const id of ['chain_probe_a','chain_probe_b','chain_retired_variant'])
          C.administrations.push({id,campaign:id==='chain_retired_variant'?'parked':id,
            setup:{macro:null,priceRules:[],couplings:[],alerts:[],suspension:null}});
        return C;};require('./tools/lint.js');`;
    const r=cp.spawnSync(process.execPath,["-e",script],{cwd:path.join(__dirname,".."),encoding:"utf8",windowsHide:true});
    assert.equal(r.status,1,"independent campaign gaps make the real lint fail");
    const chain=r.stdout.split("CONSEQUENCE CHAIN (7.9)")[1]?.split("ARTIFACT IMAGES")[0];
    assert.ok(chain,"lint printed its chain: "+r.stderr);
    assert.match(chain,/chain_probe_a: price\.probe[^\n]*NUMBER NOBODY SEES/);
    assert.match(chain,/chain_probe_b: price\.probe[^\n]*EVENT NEVER FIRES/);
    assert.doesNotMatch(chain,/chain_retired_variant|parked:/);
  });
  check("lint fails closed on a malformed dependency graph",()=>{
    const cp=require("node:child_process"),path=require("node:path");
    const script=`const L=require('./tools/loadcontent.js'),load=L.loadContent;
      L.loadContent=()=>{const C=load();C.administrations[0].setup.priceRules={bad:true};return C;};
      require('./tools/lint.js');`;
    const r=cp.spawnSync(process.execPath,["-e",script],{cwd:path.join(__dirname,".."),encoding:"utf8",windowsHide:true});
    assert.equal(r.status,1,"lint refuses a graph it could not audit");
    assert.match(r.stdout,/audit: [^\n]*priceRules must be an array[^\n]*CANNOT AUDIT/);
  });
  check("real price-to-vote and closure-to-wire paths are measured",()=>{
    assert.equal(typeof A.observeMechanics,"function","runtime consequence observer is required");
    const E=require("../js/engine.js"),C=require("./loadcontent.js").loadContent().forCampaign("flash_i");
    const before=JSON.stringify(C),proof=A.observeMechanics(C,E);
    for(const price of ["thermal","substrate","volume","transit"])
      assert.ok(proof.edges.some(([from,to])=>from==="price."+price&&to==="macro.inflation"),price+" affects inflation");
    assert.ok(proof.edges.some(([from,to])=>from==="macro.inflation"&&to==="scalar.public_standing"));
    assert.ok(proof.feedback.includes("station.closure"),"closure has a real wire consequence");
    assert.ok(proof.feedback.includes("station.suspended"),"suspension has a real wire consequence");
    assert.equal(JSON.stringify(C),before,"audit probes leave authored data unchanged");
    const live=A.analyze(C,require("fs").readFileSync(require("path").join(__dirname,"../js/engine.js"),"utf8"),proof);
    for(const key of ["price.volume","station.closure"])
      assert.equal(live.find(r=>r.k===key).verdict,"ok",key+" has proven feedback");
  });
  check("unrelated price news is not suspension feedback",()=>{
    const fs=require("fs"),path=require("path"),Module=require("node:module");
    const file=path.join(__dirname,"../js/engine.js"),box=new Module(file,module);
    box.filename=file;box.paths=Module._nodeModulePaths(path.dirname(file));
    const source=fs.readFileSync(file,"utf8")
      .replace('marks.push(s.name + " passes ten thousand suspended")','void(s.name)')
      .replace('marks.push(s.name + " falls below ten thousand suspended")','void(s.name)')
      .replace('const P = st.prices, marks = [];',
        'const P = st.prices, marks = [];if(P[C.setup.suspension.price]>150)marks.push("Price probe");');
    box._compile(source,file);
    const C=require("./loadcontent.js").loadContent().forCampaign("flash_i");
    C.setup={...C.setup,startDate:"2080-05-05"};
    assert.equal(A.observeMechanics(C,box.exports).feedback.includes("station.suspended"),false,
      "suspension news was removed; unrelated price news must not fill its place");
  });
  assert.equal(failed,0,"consequence contracts failed");
}
module.exports={run};
if(require.main===module)run();
