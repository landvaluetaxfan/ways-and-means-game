/* E10: bounded parallel readers, with no shortened check or shared window.
   prose:check can restore source after a damaged round trip, so runs alone.
   Commands come from package.json: individual npm scripts stay authoritative. */
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");

async function run(jobs, { concurrency = 4, cwd = path.join(__dirname, ".."), report = () => {} } = {}) {
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error("concurrency must be a positive integer");
  const results = [], resources = new Map();
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, async () => {
    while (next < jobs.length) {
      const job = jobs[next++], previous = job.resource && resources.get(job.resource);
      let release = () => {};
      if (job.resource) resources.set(job.resource, new Promise(resolve => { release = resolve; }));
      if (previous) await previous;
      const start = performance.now();
      try {
      let output = "", code = 0;
      for (const args of job.commands) {
        code = await new Promise(resolve => {
          const child = cp.spawn(process.execPath, args, { cwd, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
          child.stdout.on("data", chunk => { output += chunk; });
          child.stderr.on("data", chunk => { output += chunk; });
          child.on("error", e => { output += e.message + "\n"; });
          child.on("close", status => resolve(status === null ? 1 : status));
        });
        if (code !== 0) break;
      }
      const result = { name: job.name, code, output, seconds: (performance.now() - start) / 1000 };
      results.push(result); report(result);
      } finally { release(); }
    }
  }));
  return results;
}

async function main() {
  const root = path.join(__dirname, ".."), pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  // Start the long DOM checks first. Every former check remains a full process.
  const names = ["ui", "ux", "editor", "itchtest", "test", "guards", "lint", "cx", "roundtrip", "rename",
    "tocheck", "enc", "exchange:check", "storymap:check", "fidget", "flags", "tutorial", "notices"];
  const job = name => ({ name, resource: name === "ui" || name === "itchtest" ? "bundle" : undefined,
    commands: pkg.scripts[name].split(/\s*&&\s*/).map(command => {
    // These scripts use only Node, paths without spaces, and plain flags.
    // Refuse a new shell construct rather than quietly change its meaning.
    if (!/^node [\w./:-]+(?: [\w./:-]+)*$/.test(command)) throw new Error("unsupported check command: " + command);
    return command.slice(5).split(" ");
  }) });
  const concurrency = process.env.CHECK_JOBS === undefined
    ? Math.max(1, Math.min(4, (os.availableParallelism ? os.availableParallelism() : os.cpus().length) - 1))
    : Number(process.env.CHECK_JOBS);
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error("CHECK_JOBS concurrency must be a positive integer");
  const start = performance.now();
  const report = r => console.log("\n[" + r.name + "] " + (r.code ? "FAIL" : "PASS") + " " + r.seconds.toFixed(2) + "s\n" + r.output.trimEnd());
  const preflight = await run([job("prose:check")], { concurrency: 1, report });
  if (preflight[0].code) { process.exitCode = 1; return; }
  const results = await run(names.map(job), { concurrency, report });
  const failed = results.filter(r => r.code);
  const total = names.length + preflight.length;
  console.log("\n" + (total - failed.length) + "/" + total + " checks passed in " + ((performance.now() - start) / 1000).toFixed(2) +
    "s (" + concurrency + " parallel readers)" + (failed.length ? "; failed: " + failed.map(r => r.name).join(", ") : ""));
  process.exitCode = failed.length ? 1 : 0;
}

module.exports = { run };
if (require.main === module) main().catch(e => { console.error(e); process.exitCode = 1; });
