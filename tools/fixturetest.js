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
  console.log("fixture profiles: ordered rules, independent setup and fresh copies pass");
}
module.exports = {run};
if (require.main === module) run();
