/* Renaming must be behaviour-preserving. If a reference is missed, the game
   changes silently — a stance keyed to a party that no longer exists falls
   through to axis inference and the division comes out different.

   So: play 40 sittings, rename everything, play again, compare. */
const fs=require("fs"), vm=require("vm"), path=require("path"), root=path.join(__dirname,"..");
const CF=["setup","parties","stations","constituencies","cabinet","instruments","initiatives","minutes","functional","characters","bills","glossary","archetypes","names","events","encyclopedia","settlements","business","actors"];
const src=CF.map(f=>fs.readFileSync(path.join(root,"content",f+".js"),"utf8")).join("\n");
const indexSrc=fs.readFileSync(path.join(root,"content","index.js"),"utf8");

/* THE WHOLE MODEL, AND THE WHOLE GAME. This loaded eleven collections and
   played them through a hand-built content object with no instruments,
   initiatives, settlements, business, actors or cabinet, and called
   advance() without content at all -- so it proved renames safe in a game
   nobody plays, while a renamed station left all its constituencies
   pointing at nothing (design/34). The model now holds every collection a
   reference can live in, and the game is assembled by content/index.js
   itself from the renamed model, which is what the page does. */
const GLOBALS={setup:"SETUP",parties:"PARTIES",currents:"CURRENTS",stations:"STATIONS",
  constituencies:"CONSTITUENCIES",functional:"FUNCTIONAL",characters:"CHARACTERS",bills:"BILLS",
  glossary:"GLOSSARY",events:"EVENTS",encyclopedia:"ENCYCLOPEDIA",cabinet:"CABINET",
  instruments:"INSTRUMENTS",initiatives:"INITIATIVES",minutes:"MINUTES",settlements:"SETTLEMENTS",
  business:"BUSINESS",actors:"ACTORS",administrations:"ADMINISTRATIONS",
  archetypes:"ARCHETYPES",names:"NAMELISTS"};
function loadModel(){
  const c={}; vm.runInNewContext(src+";__={"+Object.values(GLOBALS).join(",")+"};",c);
  const M={}; Object.keys(GLOBALS).forEach(k=>M[k]=c.__[GLOBALS[k]]);
  return M;
}
const r={}; vm.runInNewContext(fs.readFileSync(path.join(root,"js/refs.js"),"utf8")+";__R=Refs;",r);
const Refs=r.__R, Engine=require("../js/engine.js");

function content(M){
  const ctx={}; Object.keys(GLOBALS).forEach(k=>ctx[GLOBALS[k]]=M[k]);
  vm.runInNewContext(indexSrc+";__C=CONTENT;",ctx);
  return ctx.__C;
}
function play(M,n){
  const C=content(M); let s=Engine.newGame(C), out=[], k=0;
  for(let i=0;i<n;i++){
    const e=Engine.nextEvent(s,C);
    if(e){ out.push(s.sitting+":"+(M.__map&&M.__map[e.id]||e.id)); Engine.choose(s,C,e,(k++)%e.choices.length); }
    else out.push(s.sitting+":-");
    Engine.advance(s,C);
  }
  const caps=Object.keys(s.capital).sort().map(k2=>(M.__cap&&M.__cap[k2]||k2)+"="+s.capital[k2]).join(",");
  return { trace: out.join("|"),
           scalars: JSON.stringify(s.scalars),
           capital: caps,
           div: JSON.stringify(Engine.division(s,C,M.__bill||"divergence").popular),
           loy: M.parties.map(p=>(M.__party&&M.__party[p.id]||p.id)+":"+s.parties[p.id].loyalty).sort().join(",") };
}

const A=loadModel(); const before=play(A,40);

/* rename every entity of every kind */
const B=loadModel();
const map={party:{},station:{},bill:{},event:{},character:{},current:{}};
let total=0;
[["parties","party"],["stations","station"],["bills","bill"],
 ["events","event"],["characters","character"],["currents","current"]].forEach(([kind,tag])=>{
  const arr=kind==="currents"?B.currents:B[kind];
  arr.slice().forEach(o=>{
    const from=o.id, to="x_"+tag+"_"+from;
    total+=Refs.rename(B,kind==="currents"?"currents":kind,from,to,o);
    map[tag][to]=from;
  });
});
/* map renamed ids back for comparison */
B.__map=map.event; B.__cap=map.party; B.__party=map.party;
B.__bill=Object.keys(map.bill).find(k=>map.bill[k]==="divergence");

const after=play(B,40);

let fail=0;
const eq=(l,a,b)=>{const ok=a===b; if(!ok)fail++;
  console.log((ok?"  ok   ":"  FAIL ")+l);
  if(!ok){console.log("    before: "+String(a).slice(0,180));console.log("    after:  "+String(b).slice(0,180));}};

console.log("RENAME FIDELITY");
console.log("=".repeat(52));
console.log("  entities renamed: "+Object.values(map).reduce((n,m)=>n+Object.keys(m).length,0));
console.log("  references rewritten: "+total);
console.log("");
eq("40-sitting event trace", before.trace, after.trace);
eq("final scalars", before.scalars, after.scalars);
eq("coalition ledger", before.capital, after.capital);
eq("party loyalties", before.loy, after.loy);
eq("division on the threshold bill", before.div, after.div);

/* no stale ids anywhere */
/* Ask the reference finder rather than scanning for strings: a tag that
   happens to share a word with an id is not a reference to it. */
const stale=[];
[["parties","party"],["stations","station"],["bills","bill"],
 ["events","event"],["characters","character"],["currents","current"]].forEach(([kind,tag])=>{
  Object.values(map[tag]).forEach(old=>{
    const n=Refs.find(B,kind,old).length;
    if(n) stale.push(kind+" "+old+" ×"+n);
  });
});
if(stale.length){fail++;console.log("  FAIL stale ids remain: "+stale.join(", "));}
else console.log("  ok   the reference finder finds no stale ids");

/* AND LOOKING WITHOUT THE FINDER. The check above asks js/refs.js whether
   js/refs.js missed anything, which it cannot answer: a site it does not
   know is a site it does not look in, and 32 of them passed it. This walks
   the renamed model itself and reports any old id still standing as a
   value or a key -- outside prose, which carries names on purpose, and
   outside the tag fields refs.js reports as loose rather than rewriting. */
const oldIds={};
Object.keys(map).forEach(tag=>Object.values(map[tag]).forEach(o=>oldIds[o]=tag));
const PROSE=new Set(["body","text","note","summary","result","label","title","name","caption",
  "tendency","description","lede","heading","brief","closing","gloss","role","seat","effect_note",
  "effectNote","intro","wants","touches","interest","material_interest","ref","short","official"]);
const left={};
(function walk(o,p){
  if(o==null) return;
  if(typeof o==="string"){ if(oldIds[o]) (left[p]=left[p]||new Set()).add(oldIds[o]+" "+o); return; }
  if(typeof o!=="object") return;
  if(Array.isArray(o)) return o.forEach(x=>walk(x,p+"[]"));
  Object.keys(o).forEach(k=>{
    if(PROSE.has(k)||k.startsWith("__")) return;
    if(oldIds[k]) (left[p+".{key}"]=left[p+".{key}"]||new Set()).add(oldIds[k]+" "+k);
    walk(o[k],p+"."+k);
  });
})(Object.fromEntries(Object.keys(GLOBALS).filter(k=>k!=="names"&&k!=="archetypes").map(k=>[k,B[k]])),"model");
const leftRows=Object.keys(left).map(k=>k+" ("+[...left[k]].slice(0,2).join(", ")+")");
if(leftRows.length){fail++;console.log("  FAIL an old id survives the rename at "+leftRows.length+" site(s):");
  leftRows.slice(0,12).forEach(l=>console.log("         "+l));}
else console.log("  ok   and no old id survives anywhere in the model");

console.log("");
console.log(fail?fail+" FAILURES — renaming would corrupt content":"renaming is behaviour-preserving");
process.exit(fail?1:0);
