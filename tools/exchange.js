#!/usr/bin/env node
/* THE AGENTS' EXCHANGE. Claude Code, Codex and opencode share one repository
   and nothing else, so what they say to each other is files here.

     node tools/exchange.js inbox --as codex          what is waiting for me
     node tools/exchange.js post --from claude --to codex --re economy-chart "text"
     node tools/exchange.js show <id>                 one message in full
     node tools/exchange.js close <id> [--as lane "reply"]
     node tools/exchange.js claim <brief> --lane codex --files js/ui.js,css/terminal.css
     node tools/exchange.js release <brief>
     node tools/exchange.js status                    claims and open messages
     node tools/exchange.js check [--as lane]         structure, stale claims, overlaps

   One file per message and one per claim, so two agents writing at once never
   merge-conflict. Nothing here touches git: commit exchange/ on its own and
   push it to main at once, so the others can see it. Protocol: exchange/README.md */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const ROOT = path.join(__dirname, ".."), DIR = path.join(ROOT, "exchange");
const MSG = path.join(DIR, "messages"), CLM = path.join(DIR, "claims");
const LANES = ["claude", "codex", "opencode", "author", "all"];
const KINDS = ["note", "question", "answer", "finding", "review", "blocker", "decision", "done"];
const STALE_DAYS = 7;

const argv = process.argv.slice(2), cmd = argv.shift();
const flags = {}, pos = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) {
    const k = argv[i].slice(2);
    flags[k] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
  } else pos.push(argv[i]);
}
const die = m => { console.error(m); process.exit(1); };
const lane = (v, what) => { if (!LANES.includes(v)) die(what + " must be one of " + LANES.join(", ")); return v; };
const read = f => fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");

function parseMsg(file) {
  const t = read(path.join(MSG, file)), i = t.indexOf("\n---\n");
  const head = {}, bad = [];
  (i < 0 ? t : t.slice(0, i)).split("\n").forEach(l => {
    const m = l.match(/^([a-z-]+): ?(.*)$/);
    if (m) head[m[1]] = m[2].trim(); else if (l.trim()) bad.push(l);
  });
  return { file, id: file.replace(/\.md$/, ""), head, body: i < 0 ? "" : t.slice(i + 5).trim(), bad, hasRule: i >= 0 };
}
const messages = () => fs.existsSync(MSG)
  ? fs.readdirSync(MSG).filter(f => f.endsWith(".md")).sort().map(parseMsg) : [];
const claims = () => fs.existsSync(CLM)
  ? fs.readdirSync(CLM).filter(f => f.endsWith(".json")).sort().map(f => {
      try { return Object.assign({ file: f }, JSON.parse(read(path.join(CLM, f)))); }
      catch (e) { return { file: f, broken: e.message }; }
    }) : [];
const first = m => (m.body.split("\n")[0] || "").slice(0, 110);
const days = iso => Math.floor((Date.now() - Date.parse(iso)) / 864e5);
const pick = prefix => {
  const hit = messages().filter(m => m.id === prefix || m.id.startsWith(prefix));
  if (hit.length !== 1) die(hit.length ? "ambiguous id: " + hit.map(m => m.id).join(", ") : "no message " + prefix);
  return hit[0];
};

function post() {
  const from = lane(flags.from, "--from"), to = lane(flags.to, "--to");
  const kind = flags.kind || "note";
  if (!KINDS.includes(kind)) die("--kind must be one of " + KINDS.join(", "));
  const body = (pos.join(" ") || "").trim();
  if (!body) die("say something: post --from claude --to codex \"text\"");
  const d = new Date().toISOString(), stamp = d.slice(0, 10).replace(/-/g, "") + "-" + d.slice(11, 16).replace(":", "");
  let id = [stamp, from, to].join("-"), n = 1;
  while (fs.existsSync(path.join(MSG, id + ".md"))) id = [stamp, from, to, ++n].join("-");
  const head = ["from: " + from, "to: " + to, "kind: " + kind, "status: open"];
  if (flags.re && flags.re !== true) head.push("re: " + flags.re);
  if (flags["in-reply-to"]) head.push("in-reply-to: " + flags["in-reply-to"]);
  fs.mkdirSync(MSG, { recursive: true });
  fs.writeFileSync(path.join(MSG, id + ".md"), head.join("\n") + "\n---\n" + body + "\n");
  console.log("posted " + id + "\ncommit exchange/ on its own and push it to main.");
  return id;
}

function inbox() {
  const me = lane(flags.as, "--as");
  const mine = messages().filter(m => m.head.status === "open" &&
    (m.head.to === me || m.head.to === "all") && m.head.from !== me);
  const others = claims().filter(c => !c.broken && c.lane !== me);
  if (flags.quiet && !mine.length && !others.length) return;
  console.log("Exchange for " + me + ": " + (mine.length ? mine.length + " open message" + (mine.length === 1 ? "" : "s") : "no open messages"));
  mine.forEach(m => console.log("  " + m.id + "  [" + m.head.kind + (m.head.re ? " · " + m.head.re : "") + "]  " + first(m)));
  if (mine.length) console.log("  read one: node tools/exchange.js show <id>;  answer: close <id> --as " + me + " \"reply\"");
  if (others.length) {
    console.log("Held by others (keep out of these files, or say so in a message):");
    others.forEach(c => console.log("  " + c.brief + "  " + c.lane + ", since " + c.since + ", " + (c.files || []).join(", ") +
      (days(c.since) >= STALE_DAYS ? "  [STALE: " + days(c.since) + " days]" : "")));
  }
}

function show() {
  const m = pick(pos[0]);
  console.log(Object.entries(m.head).map(([k, v]) => k + ": " + v).join("\n") + "\n\n" + m.body);
}

function close() {
  const m = pick(pos[0]), f = path.join(MSG, m.file);
  fs.writeFileSync(f, read(f).replace(/^status: open$/m, "status: closed"));
  console.log("closed " + m.id);
  const reply = pos.slice(1).join(" ").trim();
  if (reply) {
    flags.from = lane(flags.as || m.head.to, "--as"); flags.to = m.head.from;
    flags.kind = flags.kind || "answer"; flags["in-reply-to"] = m.id; flags.re = m.head.re || "";
    pos.length = 0; pos.push(reply); post();
  }
}

function claim() {
  const brief = pos[0], l = lane(flags.lane, "--lane");
  if (!brief) die("claim <brief> --lane codex --files a,b");
  if (!fs.existsSync(path.join(ROOT, "briefs", brief + ".md"))) die("no brief briefs/" + brief + ".md");
  const f = path.join(CLM, brief + ".json");
  if (fs.existsSync(f)) { const c = JSON.parse(read(f)); if (c.lane !== l) die(brief + " is held by " + c.lane + " since " + c.since); }
  const files = typeof flags.files === "string" ? flags.files.split(",").map(s => s.trim()).filter(Boolean) : [];
  fs.mkdirSync(CLM, { recursive: true });
  fs.writeFileSync(f, JSON.stringify({ brief, lane: l, since: new Date().toISOString().slice(0, 10), files,
    note: typeof flags.note === "string" ? flags.note : "" }, null, 2) + "\n");
  console.log("claimed " + brief + " for " + l + "\ncommit exchange/ on its own and push it to main now.");
}

function release() {
  const f = path.join(CLM, pos[0] + ".json");
  if (!fs.existsSync(f)) die("no claim on " + pos[0]);
  fs.unlinkSync(f); console.log("released " + pos[0] + ": commit that with the work.");
}

function status() {
  const cs = claims();
  console.log(cs.length ? "Claims:" : "No claims.");
  cs.forEach(c => console.log("  " + (c.brief || c.file) + "  " + (c.lane || "?") + ", since " + (c.since || "?") + "  " + (c.files || []).join(", ")));
  const open = messages().filter(m => m.head.status === "open");
  console.log("Open messages: " + (open.length ? "" : "none"));
  LANES.forEach(l => { const n = open.filter(m => m.head.to === l).length; if (n) console.log("  to " + l + ": " + n); });
}

function check() {
  const errs = [], warns = [];
  messages().forEach(m => {
    const h = m.head;
    if (!m.hasRule) errs.push(m.file + ": no '---' line between the header and the text");
    if (m.bad.length) errs.push(m.file + ": header line that is not 'key: value': " + m.bad[0]);
    if (!LANES.includes(h.from) || !LANES.includes(h.to)) errs.push(m.file + ": from/to must be one of " + LANES.join(", "));
    if (!KINDS.includes(h.kind)) errs.push(m.file + ": kind must be one of " + KINDS.join(", "));
    if (!["open", "closed"].includes(h.status)) errs.push(m.file + ": status must be open or closed");
    if (!m.body) errs.push(m.file + ": empty message");
  });
  claims().forEach(c => {
    if (c.broken) return errs.push("claims/" + c.file + ": not JSON (" + c.broken + ")");
    if (!LANES.includes(c.lane) || !c.brief || !c.since) errs.push("claims/" + c.file + ": needs brief, lane and since");
    else if (!fs.existsSync(path.join(ROOT, "briefs", c.brief + ".md")))
      errs.push("claims/" + c.file + ": its brief is gone, so the work has landed: run `node tools/exchange.js release " + c.brief + "`");
    else if (days(c.since) >= STALE_DAYS) warns.push(c.brief + " has been held by " + c.lane + " for " + days(c.since) + " days");
  });
  /* Advisory: files changed here that another lane has claimed. */
  try {
    const me = flags.as && flags.as !== true ? flags.as : null;
    const changed = new Set(cp.execSync("git diff --name-only origin/main; git ls-files --others --exclude-standard",
      { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().split("\n").filter(Boolean));
    claims().filter(c => !c.broken && c.lane !== me).forEach(c => (c.files || []).forEach(f => {
      if (me && changed.has(f)) warns.push("you changed " + f + ", which " + c.lane + " holds for " + c.brief + ": say so with a message");
    }));
  } catch (e) { /* no git, no overlap check */ }
  warns.forEach(w => console.log("  note  " + w));
  errs.forEach(e => console.log("  FAIL  " + e));
  console.log(errs.length ? errs.length + " FAILURES" : "the exchange is in order  " + messages().length + " messages, " + claims().length + " claims");
  process.exit(errs.length ? 1 : 0);
}

({ post, inbox, show, close, claim, release, status, check }[cmd] ||
  (() => die("commands: inbox, post, show, close, claim, release, status, check")))();
