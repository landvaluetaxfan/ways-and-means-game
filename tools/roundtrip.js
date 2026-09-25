/* Round-trip: serialise every content file, re-evaluate it, and confirm the
   game is byte-for-byte unchanged in behaviour and the data field for field.
   This is the SERIALISER. The editor's forms are a second way to corrupt
   content and are proved by tools/edtest.js, which opens every entry. */
const fs=require("fs"), vm=require("vm"), path=require("path"), root=path.join(__dirname,"..");
/* the content files index.html loads, in its order (tools/loadcontent.js) */
const src=require("./loadcontent.js").source();
vm.runInThisContext(src+"\n;globalThis.__A={SETUP,PARTIES,CURRENTS,STATIONS,CHARACTERS,BILLS,EVENTS,GLOSSARY,ENCYCLOPEDIA,CONSTITUENCIES,SETTLEMENTS,INITIATIVES,ACHIEVEMENTS,ADMINISTRATIONS};");
const A=globalThis.__A;
const Serialise=require("../js/serialise.js");
const Engine=require("../js/engine.js");

function mkContent(o){
  const C={setup:o.SETUP,parties:o.PARTIES,currents:o.CURRENTS,stations:o.STATIONS,
           characters:o.CHARACTERS,bills:o.BILLS,events:o.EVENTS,glossary:o.GLOSSARY};
  const idx=a=>a.reduce((m,x)=>(m[x.id]=x,m),{});
  C.partyById=idx(o.PARTIES);C.currentById=idx(o.CURRENTS);C.stationById=idx(o.STATIONS);
  C.characterById=idx(o.CHARACTERS);C.billById=idx(o.BILLS);C.eventById=idx(o.EVENTS);
  return C;
}
function play(C,n){
  let s=Engine.newGame(C), out=[], k=0;
  for(let i=0;i<n;i++){
    const e=Engine.nextEvent(s,C);
    if(e){ out.push(s.sitting+":"+e.id); Engine.choose(s,C,e,(k++)%e.choices.length); }
    else out.push(s.sitting+":-");
    Engine.advance(s);
  }
  return {trace:out.join("|"), scalars:JSON.stringify(s.scalars),
          div:JSON.stringify(Engine.division(s,C,"divergence"))};
}

const before=play(mkContent(A),40);

/* serialise → re-evaluate. EVERY FILE A KIND IS KEPT IN: a campaign's
   entries go to content/campaigns/<id>/<kind>.js, not the world's file, and
   they come back through `campaign()` in setup.js, so setup.js goes first
   and the campaign files after the world's lists, as the page loads them. */
const files=k=>Serialise.files(k,A[k.toUpperCase()]);
const out=[].concat(files("glossary"),
  [{path:"content/parties.js",text:Serialise.partiesFile(A.PARTIES,A.CURRENTS)}],
  files("stations"),files("characters"),files("bills"),files("constituencies"),files("events"),
  /* a campaign's own kinds, which the editor writes since 25 Sep */
  files("settlements"),files("initiatives"),files("achievements"),
  /* and the campaign record, which is not untagged: its `campaign` says
     which campaign it plays */
  Serialise.administrationsFiles(A.ADMINISTRATIONS));
const world=out.filter(f=>!/campaigns\//.test(f.path)), camp=out.filter(f=>/campaigns\//.test(f.path));
const regen =
  fs.readFileSync(path.join(root,"content","setup.js"),"utf8")+"\n"+
  world.map(f=>f.text).join("\n")+"\n"+camp.map(f=>f.text).join("\n");
const ctx={};
vm.runInNewContext(regen+"\n;__B={SETUP,PARTIES,CURRENTS,STATIONS,CHARACTERS,BILLS,EVENTS,GLOSSARY,CONSTITUENCIES,SETTLEMENTS,INITIATIVES,ACHIEVEMENTS,ADMINISTRATIONS};",ctx);
const B=ctx.__B;

const after=play(mkContent(B),40);

let fail=0;
const eq=(l,a,b)=>{ const ok=a===b; if(!ok)fail++;
  console.log((ok?"  ok  ":"  FAIL")+" "+l); if(!ok){console.log("    before: "+String(a).slice(0,160));console.log("    after:  "+String(b).slice(0,160));} };

console.log("ROUND-TRIP: content → serialiser → content");
console.log("=".repeat(52));
console.log("  regenerated size:", regen.length, "chars, in", out.length, "files ("+camp.length+" a campaign's)");
/* The split is the point: a campaign's entry written into the world's file
   as well would load twice, and one written only there would lose its folder. */
const tagged=[].concat(A.EVENTS,A.BILLS,A.SETTLEMENTS,A.INITIATIVES,A.ACHIEVEMENTS)
  .filter(e=>e.campaign).map(e=>'id:"'+e.id+'"');
eq("no campaign entry written to a world file",
   tagged.filter(t=>world.some(f=>f.text.indexOf(t)>=0)).join(" "), "");
eq("every campaign's entries written to its folder",
   camp.length>0 && A.EVENTS.filter(e=>e.campaign).length===B.EVENTS.filter(e=>e.campaign).length, true);
eq("event counts", A.EVENTS.length, B.EVENTS.length);
eq("party counts", A.PARTIES.length, B.PARTIES.length);
eq("station counts", A.STATIONS.length, B.STATIONS.length);
eq("glossary counts", A.GLOSSARY.length, B.GLOSSARY.length);
eq("40-sitting trace identical", before.trace, after.trace);
eq("final scalars identical", before.scalars, after.scalars);
eq("division identical", before.div, after.div);
/* AND THE DATA ITSELF. The checks above compare counts and forty sittings of
   one play-through, so a field the serialiser dropped that no event in those
   forty sittings happens to read -- `maxFires`, a late `at`, a brief -- came
   back "lossless". It was in fact lossless (design/34 measured it), which
   makes this free to assert and the only line here that can see a dropped
   field. It does NOT cover the editor's forms; tools/edtest.js does. */
["SETUP","PARTIES","CURRENTS","STATIONS","CHARACTERS","BILLS","EVENTS","GLOSSARY","CONSTITUENCIES",
 "SETTLEMENTS","INITIATIVES","ACHIEVEMENTS","ADMINISTRATIONS"]
  .forEach(k => eq(k.toLowerCase() + " identical, field for field",
                   JSON.stringify(A[k]), JSON.stringify(B[k])));
console.log("");
console.log(fail?fail+" FAILURES — the editor would corrupt content":"round-trip is lossless");
