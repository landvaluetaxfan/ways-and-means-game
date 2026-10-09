/* Audit one playable campaign. A dependency counts only when it reaches feedback. */
"use strict";
const acorn=require("acorn");
function engineReaders(source){
  const readers=new Set(),tree=acorn.parse(source,{ecmaVersion:"latest",sourceType:"script"});
  const prop=n=>n&&n.type==="MemberExpression"&&!n.computed&&n.property.type==="Identifier"?n.property.name:
    n&&n.type==="MemberExpression"&&n.computed&&n.property.type==="Literal"?n.property.value:
    n&&n.type==="MemberExpression"&&n.computed&&n.property.type==="BinaryExpression"&&
      n.property.operator==="+"&&n.property.left.type==="Literal"&&n.property.left.value==="rate_"?"rate_*":null;
  const namespace=n=>n&&n.type==="LogicalExpression"?namespace(n.left)||namespace(n.right):prop(n);
  function visit(n,parent){
    if(!n||typeof n!=="object")return;
    if(n.type==="MemberExpression"){
      const key=prop(n),ns=namespace(n.object);
      const writeOnly=parent&&parent.type==="AssignmentExpression"&&parent.left===n&&parent.operator==="=";
      if(!writeOnly&&typeof key==="string"&&(ns==="law"||ns==="scalars"))
        readers.add((ns==="scalars"?"scalar":ns)+"."+key);
    }
    for(const key of Object.keys(n)){
      const x=n[key];if(Array.isArray(x))x.forEach(c=>visit(c,n));
      else if(x&&typeof x==="object")visit(x,n);
    }
  }
  visit(tree,null);return readers;
}
/* These edges are measured on fresh counterfactual states using the actual engine,
   not inferred from a field name. No authored object or saved game is changed. */
function observeMechanics(C,E){
  const proof={edges:[],feedback:[]},S=C.setup||{};
  if(!S.macro)return proof;
  const P=Object.assign({},C,{setup:Object.assign({},S,{priceRules:[]})});
  function pair(){return [E.newGame(P,1),E.newGame(P,1)];}
  function later(a,b){a.date=b.date=E.dateOfSitting(P,a.sitting+5);}
  const [voteA,voteB]=pair();
  voteB.macro.inflation+=100;
  const inflationVotes=E.economyVote(voteA,P).pull!==E.economyVote(voteB,P).pull;
  for(const base of S.fiscal&&S.fiscal.bases||[]){
    const [a,b]=pair();
    if(a.prices[base.k]==null)continue;
    b.prices[base.k]+=100;later(a,b);E.tick(a,P);E.tick(b,P);
    if(inflationVotes&&a.macro.inflation!==b.macro.inflation&&
       a.scalars.public_standing!==b.scalars.public_standing){
      proof.edges.push(["price."+base.k,"macro.inflation"],
        ["macro.inflation","scalar.public_standing"]);
    }
  }
  const [a,b]=pair();E.tick(a,P);E.tick(b,P);
  const station=(C.stations||[]).find(s=>b.stations[s.id].closure<0.7&&b.stations[s.id].population>100000);
  if(station){
    b.stations[station.id].closure+=0.1;
    E.advance(a,P);E.advance(b,P);
    const before=a.wire.map(x=>x.text),after=b.wire.map(x=>x.text);
    if(a.scalars.consumables!==b.scalars.consumables&&after.some(mark=>!before.includes(mark)))
      proof.feedback.push("station.closure");
    const price=S.suspension&&S.suspension.price;
    if(price){
      const [low,high]=pair();
      /* Hold prices equal: otherwise unrelated price-driven news could be
         mistaken for a suspension consequence. Only one count crosses. */
      low.stations[station.id].suspended=10001;
      high.stations[station.id].suspended=9999;
      low.prices[price]+=100;high.prices[price]+=100;
      E.advance(low,P);E.advance(high,P);
      const quiet=low.wire.map(x=>x.text),news=high.wire.map(x=>x.text);
      if(high.stations[station.id].suspended>9999&&
         news.some(mark=>!quiet.includes(mark)))proof.feedback.push("station.suspended");
    }
  }
  return proof;
}
function analyze(C,engineSource,proof={edges:[],feedback:[]}){
  const moved=new Map(),gated=new Map(),edges=new Map(),ruleReads=new Set();
  const engine=engineReaders(engineSource),S=C.setup||{};
  if(engine.has("law.rate_*"))for(const b of S.fiscal&&S.fiscal.bases||[])engine.add("law.rate_"+b.k);
  const bump=(map,key)=>map.set(key,(map.get(key)||0)+1);
  const keyOf=x=>x.includes(".")?(x.startsWith("rate.")?"law.rate_"+x.slice(5):x):"scalar."+x;
  const link=(from,to)=>{if(!edges.has(from))edges.set(from,new Set());edges.get(from).add(to);};
  const list=(obj,key)=>{
    if(obj[key]==null)return [];
    if(!Array.isArray(obj[key]))throw new Error("consequence audit: "+key+" must be an array");
    return obj[key];
  };
  function effects(eff){
    for(const e of [].concat(eff||[])){
      for(const ns of ["price","scalar","law"])
        Object.keys(e[ns]||{}).forEach(k=>bump(moved,ns+"."+k));
      for(const fields of Object.values(e.station||{}))
        Object.keys(fields).forEach(field=>bump(moved,"station."+field));
      for(const k of Object.keys(e.move||{})){
        const key=keyOf(k);
        if(/^(price|scalar)\./.test(key))bump(moved,key);
        else if(key.startsWith("trend."))bump(moved,"scalar."+key.slice(6));
      }
    }
  }
  function when(w,terminal=true){
    if(!w||typeof w!=="object")return [];
    const keys=[];
    for(const k of Object.keys(w)){
      if(k==="anyOf")for(const child of w[k])keys.push(...when(child,terminal));
      const ns=/^price(Above|Below)$/.test(k)?"price":/^scalar(Above|Below)$/.test(k)?"scalar":
        /^law(Is|Above|Below)$/.test(k)?"law":/^economy(Above|Below)$/.test(k)?"economy":null;
      if(ns)for(const x of Object.keys(w[k])){const key=ns+"."+x;if(terminal)bump(gated,key);keys.push(key);}
      const stationFields=k==="stationBelow"?[...new Set(Object.values(w[k]).flatMap(x=>Object.keys(x)))]:
        ["suspendedAbove","suspendedBelow"].includes(k)?["suspended"]:[];
      for(const field of stationFields){const key="station."+field;if(terminal)bump(gated,key);keys.push(key);}
    }
    return keys;
  }
  for(const e of list(C,"events")){
    when(e.when);effects(e.effects);
    for(const c of e.choices||[]){effects(c.effects);when(c.when);}
  }
  for(const i of list(C,"initiatives")){
    when(i.when);effects(i.effects);
    for(const t of i.tempo||[]){effects(t.effects);when(t.when);}
  }
  for(const m of list(C,"matters")){
    when(m.raise);when(m.settled);
    if(m.due&&typeof m.due==="object")when("after" in m.due||"when" in m.due?m.due.when:m.due);
  }
  for(const i of list(C,"instruments")){effects(i.effects);when(i.when);}
  for(const b of list(C,"bills")){
    effects(b.onPass);effects(b.onFail);
    for(const a of b.amendments||[]){effects(a.effects);when(a.when);}
    for(const cl of b.clauses||[])for(const lv of cl.levels||[]){effects(lv.effects);when(lv.when);}
  }
  for(const r of list(C,"resolutions")){when(r.when);effects(r.onTable);effects(r.onPass);effects(r.onFail);}
  for(const b of list(C,"business")){when(b.when);effects(b.effects);}
  for(const a of list(S,"alerts")){when(a.when);when(a.urgent);}
  for(const [field,ns] of [["priceRules","price"],["economyRules","economy"]]){
    for(const r of list(S,field)){
      const target=ns+"."+r.k;bump(moved,target);
      for(const t of r.terms||[]){
        const inputs=[].concat(t.from||[]);
        const first=inputs[0]||"";
        const rate=first.startsWith("rate.")&&(S.fiscal&&S.fiscal.bases||[]).find(b=>"rate."+b.k===first);
        const active=t.map?Object.values(t.map).some(x=>+x!==0):!!(t.per==null?rate&&rate.passthrough:t.per);
        if(!active)continue;
        for(const name of t.map?inputs.slice(0,1):inputs){
          const input=keyOf(name);ruleReads.add(input);link(input,target);
        }
      }
    }
  }
  for(const cp of list(S,"couplings")){
    const inputs=when(cp.when,false);
    if(cp.meter)inputs.push(keyOf(cp.meter));
    for(const k of Object.keys(cp.drag||{}))if(cp.drag[k]){
      const target="scalar."+k;bump(moved,target);inputs.forEach(input=>link(input,target));
    }
  }
  if(S.suspension&&S.suspension.price){
    link("price."+S.suspension.price,"station.suspended");bump(moved,"station.suspended");
  }
  for(const [from,to] of proof.edges)link(from,to);
  for(const key of proof.feedback)bump(gated,key);
  /* Walk to a real condition, not merely to another output or a cycle. Engine
     scalar/law readers count mechanical consequences; a price display never does. */
  function pathToGate(start){
    const queue=[[start]],seen=new Set();
    while(queue.length){const path=queue.shift(),key=path[path.length-1];
      if(gated.has(key))return path;
      if(seen.has(key))continue;seen.add(key);
      for(const to of edges.get(key)||[])queue.push(path.concat(to));
    }
    return null;
  }
  const keys=[...new Set([...moved.keys(),...gated.keys()])].filter(k=>/^(price|scalar|law|station)\./.test(k)).sort();
  return keys.map(k=>{
    const m=moved.get(k)||0,g=gated.get(k)||0,path=pathToGate(k);
    let verdict="ok";
    if(m&&!path){
      if(/^(law|scalar)\./.test(k)&&engine.has(k))verdict="ok (read by the engine)";
      else if(k.startsWith("law.")&&ruleReads.has(k))verdict="ok (read by a policy rule)";
      else verdict="NUMBER NOBODY SEES";
    }else if(!m&&g)verdict="EVENT NEVER FIRES";
    return {k,m,g,verdict,path};
  });
}
module.exports={analyze,observeMechanics};
