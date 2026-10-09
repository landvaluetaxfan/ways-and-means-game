/* Reservations must expire when a real reader is added. */
"use strict";
const assert = require("node:assert/strict"), cp = require("node:child_process"), path = require("node:path");
function audit(extra) {
  const script = `const fs=require('fs'),read=fs.readFileSync;
    fs.readFileSync=function(file,...args){const out=read.call(this,file,...args);
      if(String(file).replace(/\\\\/g,'/').endsWith('content/campaigns/flash_i/business.js'))
        return out+${JSON.stringify(extra || "")};return out;};require('./tools/flagaudit.js');`;
  return cp.spawnSync(process.execPath,["-e",script],{
    cwd:path.join(__dirname,".."),encoding:"utf8",windowsHide:true
  });
}
function run() {
  const normal = audit();
  assert.equal(normal.status,0,"approved later-act reservations pass: "+normal.stdout+normal.stderr);
  for (const flag of ["led_on_competence","led_on_continuity","led_on_break"]) {
    const read = audit(`\nconst live_reader_probe={when:{flags:["${flag}"]}};`);
    assert.equal(read.status,1,"a live reader must retire its reservation: "+flag);
    assert.match(read.stdout,new RegExp(flag+" is read now; take it off the held list"));
  }
  const comment=audit('\n/* led_on_competence is waiting for a callback. */');
  assert.equal(comment.status,0,"a comment cannot retire a reservation: "+comment.stdout+comment.stderr);
  const unwatched = audit('\nconst unreserved_writer_probe={flag:"unreserved_probe"};');
  assert.equal(unwatched.status,1,"new unreserved flags still fail");
  assert.match(unwatched.stdout,/unreserved_probe.*read nowhere/);
  const mentioned=audit('\nconst comment_only_writer={flag:"comment_only_probe"}; /* comment_only_probe */');
  assert.equal(mentioned.status,1,"a comment is not a flag reader");
  assert.match(mentioned.stdout,/comment_only_probe.*read nowhere/);
  console.log("flag reservations: live readers expire them; unreserved writers fail");
}
module.exports={run};
if(require.main===module)run();
