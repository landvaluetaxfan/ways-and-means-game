/* Independent scenario contracts. Called by test.js and directly. */
"use strict";
const assert = require("node:assert/strict"), fs = require("fs"), path = require("path");
function run() {
  const file = path.join(__dirname, "fixtures", "index.js");
  assert.ok(fs.existsSync(file), "independent fixture builder is required");
  const F = require(file), baseline = require("./fixtures/contracts.js");
  const authored = require("./loadcontent.js").loadContent();
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
module.exports = {run,runArchive,runHarness,runHarnessPair};
if (require.main === module) process.argv.includes("--harness") ? runHarness()
  : process.argv.includes("--archive") ? runArchive() : run();
