/* Tools-only policies. Read live advice; act through the engine; never
   write simulation state. Memory is private to one headless run. */
"use strict";

function dispatch(E, st, C, remedy, approval = false) {
  const t = remedy.target;
  switch (t.kind) {
    case "initiative": return E.take(st,C,t.id,t.tempo || 0);
    case "instrument": return approval ? E.approveInstrument(st,C,t.id) : E.makeInstrument(st,C,t.id);
    case "bill": return st.bills[t.id].stage === E.DIVIDES_AT ? E.divide(st,C,t.id) : E.grantSlot(st,C,t.id);
    case "money": return E.borrow(st,C,remedy.amount,t.id);
    default: throw new Error("unknown advice target kind: " + t.kind);
  }
}

function attempt(E, st, C, matter, remedy, gate, extra = {}) {
  const kinds = ["initiative","instrument","bill","money"];
  if (!kinds.includes(remedy.target.kind)) throw new Error("unknown advice target kind: " + remedy.target.kind);
  const row = Object.assign({sitting:st.sitting,matter:matter.id,remedy:remedy.id,
    kind:remedy.target.kind,action:extra.approval ? "approve" : remedy.target.kind,
    status:"refused",reason:gate.reason || null,slots:0,reserveDelta:0},extra);
  if (!gate.ok) return row;
  const used=st.slots.used, cash=st.scalars.solvency;
  const result=dispatch(E,st,C,remedy,!!extra.approval);
  if (!result) throw new Error("advice action returned no result");
  row.slots=st.slots.used-used; row.reserveDelta=st.scalars.solvency-cash;
  if (result.ok === false) {row.reason=result.reason;return row;}
  row.reason=null;
  row.status=result.approved === false || (result.result && !result.result.carries) ? "defeated"
    : result.inForce === false ? "pending" : "acted";
  return row;
}

function actOnAdvice(E, st, C, mode, memory) {
  if (!["first","owner","dissent"].includes(mode)) throw new Error("unknown advice policy: " + mode);
  // A repeated call in one sitting cannot buy a second advice action.
  if (memory.at === st.sitting) return [];
  memory.at=st.sitting;
  if (memory.pending) {
    const p=memory.pending, t=p.remedy.target, si=(st.instruments || {})[t.id];
    if(t.kind === "bill") {
      const b=(st.bills || {})[t.id], at=b ? E.STAGE_ORDER.indexOf(b.stage) : -1;
      if(b && !b.dead && at>=0 && at<=E.STAGE_ORDER.indexOf(E.DIVIDES_AT)) {
        // grantSlot owns its validation; canGrant is deliberately private.
        const gate=b.stage===E.DIVIDES_AT ? E.canDivide(st,C,t.id) : {ok:true};
         const row=attempt(E,st,C,p.matter,p.remedy,gate,{fallback:p.fallback,counselPost:p.counselPost,
           contested:p.contested,continuation:true});
        if(b.dead || E.STAGE_ORDER.indexOf(b.stage)<0) delete memory.pending;
        return [row];
      }
    }
    if (si && si.awaitingApproval) {
      const row=attempt(E,st,C,p.matter,p.remedy,E.canApprove(st,C,p.remedy.target.id),
        {approval:true,fallback:p.fallback,counselPost:p.counselPost,contested:p.contested,continuation:true});
      if (!si.awaitingApproval) delete memory.pending;
      return [row];
    }
    delete memory.pending;
  }
  const m=E.matters(st,C).find(m=>!m.underway);
  if (!m) return [];
  const contested=(m.counsel || []).some(c=>c.holder && c.post===m.owner) &&
    (m.counsel || []).some(c=>c.holder && c.post!==m.owner);
  const counsel=(m.counsel || []).find(c=>c.holder &&
    (mode === "owner" ? c.post === m.owner : mode === "dissent" && c.post !== m.owner));
  const fallback=mode !== "first" && !counsel;
  const r=counsel ? m.remedies.find(r=>r.id===counsel.remedy) : m.remedies.find(r=>r.ok);
  if (counsel && !r) throw new Error("counsel names no remedy: " + counsel.remedy);
  if (!r) return [{sitting:st.sitting,matter:m.id,remedy:null,kind:null,action:"wait",
    status:"refused",reason:m.remedies.map(r=>r.reason).filter(Boolean).join("; ") || "no executable remedy",
     fallback,contested,continuation:false,slots:0,reserveDelta:0}];
  const row=attempt(E,st,C,m,r,r,{fallback,counselPost:counsel ? counsel.post : null,contested,continuation:false});
  if (row.status === "pending" || (row.status === "acted" && r.target.kind === "bill" &&
      E.STAGE_ORDER.includes(st.bills[r.target.id].stage)))
    memory.pending={matter:{id:m.id},remedy:r,fallback,counselPost:row.counselPost,contested};
  return [row];
}

function reservedTime(E,st,C) {
  const supply=(C.bills || []).find(b=>b.test === "supply"), bs=supply && st.bills[supply.id];
  const stage=bs ? E.STAGE_ORDER.indexOf(bs.stage) : -1, division=E.STAGE_ORDER.indexOf(E.DIVIDES_AT);
  const supplySlots=bs && !bs.dead && stage>=0 && stage<=division ? division-stage+1 : 0;
  const pending=(C.instruments || []).some(i=>(st.instruments[i.id] || {}).awaitingApproval) ? 1 : 0;
  const ladder=E.today(st,C,false).items.filter(i=>i.kind === "ladder").reduce((n,i)=>Math.max(n,i.need || 0),0);
  return supplySlots+Math.max(pending,ladder);
}

function pullLevers(E,st,C,memory) {
  if (memory.at === st.sitting) return [];
  memory.at=st.sitting;
  const records=[];
  // Content owns the ladder: its alerts name rungs, never a typed id list.
  const raised=(C.setup.alerts || []).map(a=>a.raises).filter(Boolean);
  const emergency=new Set((C.instruments || []).filter(i=>[].concat(i.effects || [])
    .some(e=>e.move && raised.some(k=>(e.move[k] || 0)>0))).map(i=>i.id));
  const room=()=>st.slots.total-st.slots.used-reservedTime(E,st,C);
  const pending=(C.instruments || []).find(i=>!emergency.has(i.id) && (st.instruments[i.id] || {}).awaitingApproval);
  if (pending) {
    if (room()>=0) records.push(attempt(E,st,C,{id:null},{id:pending.id,target:{kind:"instrument",id:pending.id}},
      E.canApprove(st,C,pending.id),{approval:true}));
  } else {
    const order=(C.instruments || []).find(i=>!emergency.has(i.id) && E.canMake(st,C,i.id).ok &&
      (i.procedure !== "affirmative" || room()>0));
    if (order) records.push(attempt(E,st,C,{id:null},{id:order.id,target:{kind:"instrument",id:order.id}},E.canMake(st,C,order.id)));
  }
  const offered=E.initiatives(st,C).find(i=>i.ok && i.cost + (((i.tempo || [])[0] || {}).cost || 0) <= room());
  if (offered) records.push(attempt(E,st,C,{id:null},{id:offered.id,target:{kind:"initiative",id:offered.id,tempo:0}},offered));
  return records;
}

module.exports={actOnAdvice,pullLevers,reservedTime};
