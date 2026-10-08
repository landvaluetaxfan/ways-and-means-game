/* The suite scheduler must overlap readers, retain every check and fail
   when any child fails. Exercise real child processes, not a fake spawn. */
const assert = require("assert"), fs = require("fs"), os = require("os"), path = require("path");

async function main() {
  let run;
  try { ({ run } = require("./check.js")); }
  catch (e) { if (e.code !== "MODULE_NOT_FOUND") throw e;
    console.error("FAIL: the parallel check runner is not implemented"); process.exitCode = 1; return; }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wm-check-runner-"));
  const events = path.join(dir, "events.txt");
  const source = `const fs=require('fs'), file=process.argv[1], id=process.argv[2];
    fs.appendFileSync(file,'start '+id+'\\n');
    const until=Date.now()+10000;
    function finish(){
      if(Number(id)<2 && fs.readFileSync(file,'utf8').split('start ').length<3){
        if(Date.now()>until)process.exit(27); return setTimeout(finish,10);
      }
      fs.appendFileSync(file,'end '+id+'\\n');
      console.log('finished '+id); console.error('stderr '+id);
      process.exit(Number(id)===2?4:0);
    } setTimeout(finish,50);`;
  try {
    const jobs = [0, 1, 2, 3].map(id => ({ name: String(id), commands: [["-e", source, events, String(id)]] }));
    const results = await run(jobs, { concurrency: 2, report: () => {} });
    assert.deepStrictEqual(results.map(r => r.name).sort(), ["0", "1", "2", "3"], "every check runs exactly once, including after a failure");
    assert.deepStrictEqual(results.map(r => r.code).sort(), [0, 0, 0, 4], "a child failure survives the scheduler");
    for (const r of results) {
      assert(r.output.includes("finished " + r.name), "stdout retained");
      assert(r.output.includes("stderr " + r.name), "stderr retained");
    }
    let active = 0, peak = 0;
    for (const line of fs.readFileSync(events, "utf8").trim().split("\n")) {
      active += line.startsWith("start ") ? 1 : -1; peak = Math.max(peak, active);
    }
    assert.strictEqual(active, 0, "all children finish before the runner returns");
    assert.strictEqual(peak, 2, "readers overlap within the concurrency limit");
    await assert.rejects(run(jobs, { concurrency: 0 }), /concurrency/, "bad limits must not silently skip checks");
    console.log("check runner: real children overlap, all run, failures and output survive");
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
