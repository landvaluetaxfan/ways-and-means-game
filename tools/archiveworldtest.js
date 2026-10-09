/* Archive writer contracts: preserve raw chunks, keep shared entries, fail
   before cutting source when a destination is unavailable, and repeat safely. */
"use strict";
const fs = require("fs"), path = require("path"), os = require("os");
const assert = require("node:assert/strict");
const A = require("./archiveworld.js");
const old = '\n/* retained comment */ {id:"old", body:`line one\nline two`},';
const tagged = '\n{id:"world_only", campaign:"world", when:function(){return true;}},';
const live = '\n{id:"shared", campaign:["world","flash_i"]},\n{id:"live", campaign:"flash_i"}';
const source = "const EVENTS = [" + old + tagged + live + "];\n";
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ways-archive-test-"));
  fs.mkdirSync(path.join(root, "content"));
  fs.writeFileSync(path.join(root, "content/events.js"), source);
  return root;
}
function snapshot(root) {
  const out = {};
  function walk(dir) {
    for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
      const p = path.join(dir,e.name);
      if (e.isDirectory()) walk(p);
      else out[path.relative(root,p)] = fs.readFileSync(p).toString("hex");
    }
  }
  walk(root); return out;
}
function run(only) {
  const cases = {
    preserve() {
      const root = fixture();
      assert.deepEqual(A.inventory(root).filter(x=>!x.shared).map(x=>x.id), ["old","world_only"]);
      A.write(root);
      assert.equal(fs.readFileSync(path.join(root,"content/events.js"),"utf8"), "const EVENTS = ["+live+"];\n");
      assert.deepEqual(A.archivedChunks(root,"events"), [old,tagged], "archive retains exact comments, literals and functions");
      assert.equal(A.verify(root), true);
    },
    commentedSeparator() {
      const P=require("./park.js");
      for(const comment of [" /* trailing comment */", " // trailing comment\n"]) {
        const root=fixture(),file=path.join(root,"content/events.js");
        const retired='\n{id:"old"}'+comment+',';
        const survivor='\n{id:"shared",campaign:["world","flash_i"]}';
        fs.writeFileSync(file,'const EVENTS = ['+retired+survivor+'];\n');
        A.write(root);
        const src=fs.readFileSync(file,"utf8"),arr=P.findArray(P.parse(src),{file,list:"EVENTS"});
        assert.ok(arr.elements.every(Boolean),"comment before separator must not leave an array hole");
        assert.deepEqual(arr.elements.map(P.idOf),["shared"]);
        assert.equal(src,'const EVENTS = ['+survivor+'];\n',"survivor remains byte exact");
        assert.deepEqual(A.archivedChunks(root,"events"),[retired],"trailing comment and separator travel with retired entry");
        assert.equal(A.verify(root),true);
      }
    },
    hole() {
      const root=fixture(),file=path.join(root,"content/events.js");
      fs.writeFileSync(file,'const EVENTS = [,{id:"old"}];\n');
      const before=snapshot(root);
      assert.throws(()=>A.write(root),/array holes are unsupported/);
      assert.deepEqual(snapshot(root),before,"existing array holes fail before any archive or source write");
    },
    repeat() {
      const root = fixture(); A.write(root);
      const before = snapshot(root); A.write(root);
      assert.deepEqual(snapshot(root), before, "repeat leaves archive, manifest and source unchanged");
    },
    unavailable() {
      const root = fixture();
      fs.mkdirSync(path.join(root,"content/archive"));
      fs.writeFileSync(path.join(root,"content/archive/world"), "blocked destination");
      assert.throws(()=>A.write(root));
      assert.equal(fs.readFileSync(path.join(root,"content/events.js"),"utf8"), source,
                   "unavailable archive destination never cuts source");
    },
    collision() {
      const root = fixture(), dir = path.join(root,"content/archive/world");
      fs.mkdirSync(dir,{recursive:true});
      fs.writeFileSync(path.join(dir,"events.js"), "preserved earlier archive");
      const before = snapshot(root);
      assert.throws(()=>A.write(root), /existing archive/, "existing archive is never overwritten");
      assert.deepEqual(snapshot(root), before);
    },
    unsupported() {
      const root = fixture();
      fs.writeFileSync(path.join(root,"content/events.js"), 'const EVENTS = [{id:"bad",campaign:getCampaign()}];');
      assert.throws(()=>A.inventory(root), /unsupported campaign/);
    },
    spread() {
      const root = fixture();
      fs.writeFileSync(path.join(root,"content/events.js"), 'const EVENTS = [{id:"bad",...campaignFields}];');
      assert.throws(()=>A.inventory(root), /unsupported campaign/, "spread cannot conceal a live campaign tag");
    },
    ambiguousTags() {
      const root = fixture();
      fs.writeFileSync(path.join(root,"content/events.js"), 'const EVENTS = [{id:"live",campaign:"world",campaign:"flash_i"}];');
      assert.throws(()=>A.inventory(root), /duplicate campaign/, "duplicate tags cannot hide a live entry");
    },
    duplicate() {
      const root = fixture();
      fs.writeFileSync(path.join(root,"content/events.js"), 'const EVENTS = [{id:"same"},{id:"same"}];');
      const before = snapshot(root);
      assert.throws(()=>A.write(root), /duplicate/);
      assert.deepEqual(snapshot(root),before);
    },
    tamper() {
      const root = fixture(); A.write(root);
      const file = path.join(root,"content/archive/world/events.js");
      fs.writeFileSync(file,fs.readFileSync(file,"utf8").replace("retained comment","changed comment"));
      assert.throws(()=>A.verify(root), /archived bytes changed/, "changed archive comment is detected");
    }
  };
  for (const [name,test] of Object.entries(cases)) if (!only || only===name) {
    test(); console.log("archive contract: "+name+" passes");
  }
}
module.exports = {run};
if (require.main === module) run(process.argv[2]);
