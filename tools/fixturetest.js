/* Independent scenario contracts. Called by test.js and directly. */
"use strict";
const assert = require("node:assert/strict"), fs = require("fs"), path = require("path");
function run() {
  const file = path.join(__dirname, "fixtures", "index.js");
  assert.ok(fs.existsSync(file), "independent fixture builder is required");
  const F = require(file), baseline = require("./fixtures/contracts.js");
  const authored = require("./loadcontent.js").loadContent();
  for (const key of ["onPartnerWithdraws","onPartnerStandsAside"])
    assert.equal(authored.setup[key],undefined,"global setup must not enqueue archived pages: "+key);
  const plain = x => JSON.parse(JSON.stringify(x));
  for (const profile of ["engine", "interface"]) {
    const a = F.build(authored, profile), b = F.build(authored, profile);
    for (const k of F.kinds) {
      assert.deepEqual(a[k].map(x => x.id), baseline[profile].ids[k], profile+" "+k+" order");
      assert.equal(F.fingerprint(a[k]), baseline[profile].rules[k], profile+" "+k+" rules");
      assert.notEqual(a[k], b[k], profile+" fresh array "+k);
      if (a[k].length) assert.notEqual(a[k][0], b[k][0], profile+" fresh entry "+k);
    }
    assert.equal(F.fingerprint(a.setup), baseline[profile].setup, profile+" own setup");
    assert.deepEqual(plain(a.events[0].choices[0].effects), baseline[profile].firstChoiceEffects);
    a.events[0].choices[0].effects.push({flag:"fixture_isolation_probe"});
    assert.equal(b.events[0].choices[0].effects.some(x => x.flag === "fixture_isolation_probe"), false);
    const old = authored.events[0].when;
    authored.events[0].when = {flags:["authored_probe"]};
    assert.equal(F.fingerprint(F.build(authored, profile).events), baseline[profile].rules.events,
                 profile+" independent of authored story");
    authored.events[0].when = old;
    const admin = authored.administrations.find(x => x.id === "flash_i"), saved = admin.setup;
    admin.setup = {actEnd:{sitting:1}, locks:{orders:true}, opening:[{flag:"changed"}]};
    assert.equal(F.fingerprint(F.build(authored, profile).setup), baseline[profile].setup,
                 profile+" independent of campaign setup");
    admin.setup = saved;
    authored.fixtureFunctionProbe = () => 7;
    assert.equal(F.build(authored,profile).fixtureFunctionProbe(), 7, "function survives copy");
    delete authored.fixtureFunctionProbe;
  }
  const gov = F.build(authored,"interface").administrations.find(x => x.id === "harness");
  for (const key of ["actEnd","locks","reveals"])
    assert.equal(gov.setup[key], undefined, "interface government has no "+key);
  assert.throws(() => F.build(authored,"unknown"), /unknown fixture profile/);
  const T = require("./testkit.js"), live = T.all();
  const realIds = T.view("flash_i").events.map(x => x.id);
  const id = baseline.engine.ids.events[0], before = T.world().eventById[id].when;
  let event = live.events.find(x => x.id === id), added = !event;
  if (added) {event = {id, campaign:"world"}; live.events.push(event);}
  const oldWhen = event.when;
  try {
    event.when = {flags:["authored_loader_probe"]};
    assert.deepEqual(plain(T.world().eventById[id].when || null), plain(before || null),
                     "engine loader is independent of authored world story");
    assert.deepEqual(T.view("flash_i").events.map(x => x.id), realIds,
                     "fixture loader leaves real campaign view unchanged");
  } finally {
    event.when = oldWhen;
    if (added) live.events.splice(live.events.indexOf(event),1);
  }
  console.log("fixture profiles: ordered rules, independent setup and fresh copies pass");
  runArchive();
  require("./flagaudittest.js").run();
  require("./consequencetest.js").run();
  runRelease();
}
/* Independent of the package builder and of the fixture's own kind list. */
const storyKinds = ["events","bills","instruments","initiatives","matters",
  "settlements","achievements","business","minutes","resolutions"];
function assertNoStoryLeaks(C,label) {
  for (const k of storyKinds) {
    assert.ok(Array.isArray(C[k]),label+": missing story array "+k);
    for (const x of C[k]) assert.ok(x && x.campaign != null &&
      ![].concat(x.campaign).every(c=>c==="world"),label+": story leak "+k+"/"+(x&&x.id));
  }
}
function assertNoTestScripts(paths,label) {
  for (const p of paths) {
    const normalized = new URL(decodeURIComponent(p).replace(/\\/g,"/"),"https://probe.invalid/").pathname;
    assert.ok(!/(?:^|\/)tools\/fixtures\/|(?:^|\/)content\/archive\/world\//.test(normalized),
              label+": test-only script "+p);
  }
}
function releaseScriptPaths(html) {
  const {JSDOM} = require("jsdom"), dom = new JSDOM(html);
  try {
    return [...dom.window.document.scripts].map(s=>s.getAttribute("src") ||
      ((s.textContent.match(/^\s*\/\*\s*([^*\n]+)\s*\*\//)||[])[1]||"").trim()).filter(Boolean);
  } finally {dom.window.close();}
}
function runRelease() {
  const L = require("./loadcontent.js"), vm = require("vm");
  const live = Object.fromEntries(storyKinds.map(k=>[k,[{id:k,campaign:"live"}]]));
  assertNoStoryLeaks(live,"tagged probe");
  for (const k of storyKinds) {
    for (const tag of [null,undefined,"world",["world"],[]]) {
      const C = {...live,[k]:[{id:"leak",campaign:tag}]};
      assert.throws(()=>assertNoStoryLeaks(C,"probe"),/story leak/,k+" world-only leak rejected");
    }
    assertNoStoryLeaks({...live,[k]:[{id:"shared",campaign:["world","live"]}]},"shared probe");
    assert.throws(()=>assertNoStoryLeaks({...live,[k]:null},"probe"),/missing story array/,
                  k+" missing collection fails closed");
  }
  for (const p of ["tools/fixtures/index.js","content/archive/world/events.js",
    "./tools/fixtures/index.js?v=1","content/archive/x/../world/events.js",
    "tools\\fixtures\\index.js","%74ools/fixtures/index.js"]) {
    assert.throws(()=>assertNoTestScripts([p],"probe"),/test-only script/,p+" script leak rejected");
    assert.throws(()=>assertNoTestScripts(releaseScriptPaths('<script src="'+p+'"></script>'),"probe"),
                  /test-only script/,"external bundle script leak rejected");
    assert.throws(()=>assertNoTestScripts(releaseScriptPaths('<script>\n/* '+p+' */\nvar probe=1;</script>'),"probe"),
                  /test-only script/,"inline bundle script leak rejected");
  }
  assertNoTestScripts(["content/events.js","content/campaigns/flash_i/events.js"],"live scripts");
  for (const page of ["index.html","editor.html"])
    assertNoTestScripts(releaseScriptPaths(fs.readFileSync(path.join(L.root,page),"utf8")),page);
  assertNoTestScripts(L.modelFiles,"editor model graph");
  assertNoStoryLeaks(L.loadContent(),"source page");
  const ctx = {};
  vm.runInNewContext(L.source(L.modelFiles)+"\n;__C=CONTENT;",ctx);
  assertNoStoryLeaks(ctx.__C,"editor model");
  console.log("release boundary: source/model data, scripts and isolated leak probes pass");
}
function runArchive() {
  const A = require("./archiveworld.js"), crypto = require("crypto");
  const root = path.join(__dirname,"..");
  const original = require("./fixtures/archive-contracts.js");
  const manifest = require("../content/archive/world/manifest.js");
  assert.deepEqual(manifest,original.filter(x=>!x.shared).map(({shared,...x})=>x),
                   "archive manifest keeps original identities, order and hashes");
  A.verify(root);
  const live = A.inventory(root);
  for (const spec of A.KINDS) {
    const expected = original.filter(x=>x.kind===spec.kind&&x.shared);
    const actual = live.filter(x=>x.kind===spec.kind);
    assert.deepEqual(actual.map(x=>x.id),expected.map(x=>x.id),
                     spec.kind+" shared survivors retain original order");
    for (let i=0;i<actual.length;i++) assert.equal(
      crypto.createHash("sha256").update(actual[i].raw).digest("hex"),expected[i].sha256,
      spec.kind+"/"+actual[i].id+" shared source remains byte exact");
  }
  require("./archiveworldtest.js").run();
  console.log("archive boundary: original chunks, shared entries and writer contracts pass");
}
function runHarness() {
  const H = require("./harness.js"), F = require("./fixtures/index.js");
  try {
    if (process.env.HARNESS_REAL) {
      const real = require("./loadcontent.js").loadContent().forCampaign("flash_i");
      const shown = H.CONTENT.forCampaign("flash_i");
      assert.equal(H.CONTENT.administrations.some(x => x.id === "harness"), false,
                   "real harness must not inject a fixture government");
      for (const k of F.kinds) assert.equal(F.fingerprint(shown[k]),F.fingerprint(real[k]),
                                           "real harness keeps authored "+k);
    } else {
      const expected = require("./fixtures/contracts.js").interface;
      const shown = H.CONTENT.forCampaign({id:"world"});
      for (const k of F.kinds) assert.equal(F.fingerprint(shown[k]),expected.rules[k],
                                           "DOM harness owns fixture "+k);
    }
    console.log("fixture harness boundary passes");
  } finally { H.w.close(); }
}
function runHarnessPair() {
  const cp = require("node:child_process");
  for (const real of ["", "1"]) {
    const out = cp.execFileSync(process.execPath,[__filename,"--harness"],{
      env:Object.assign({},process.env,{HARNESS_REAL:real}),encoding:"utf8"
    });
    process.stdout.write(out);
  }
}
module.exports = {run,runArchive,runHarness,runHarnessPair,runRelease,
  assertNoStoryLeaks,assertNoTestScripts,releaseScriptPaths};
if (require.main === module) process.argv.includes("--release") ? runRelease()
  : process.argv.includes("--harness") ? runHarness()
  : process.argv.includes("--archive") ? runArchive() : run();
