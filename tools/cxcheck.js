/* Concordance integrity: does every [[link]] and see-also resolve? */
const fs=require("fs"), vm=require("vm"), path=require("path"), root=path.join(__dirname,"..");
const files=["setup","parties","stations","constituencies","cabinet","instruments","initiatives","minutes","characters","bills","events","glossary","encyclopedia"]
  .map(f=>path.join(root,"content",f+".js"));
vm.runInThisContext(files.map(f=>fs.readFileSync(f,"utf8")).join("\n")+
  "\n;globalThis.__G={ENCYCLOPEDIA,PARTIES,STATIONS,BILLS,CHARACTERS,GLOSSARY};");
const {ENCYCLOPEDIA,PARTIES,STATIONS,BILLS,CHARACTERS,GLOSSARY}=globalThis.__G;

const ids=new Set();
ENCYCLOPEDIA.articles.forEach(a=>ids.add(a.id));
PARTIES.forEach(p=>ids.add(p.id));
STATIONS.forEach(s=>ids.add(s.id));
BILLS.forEach(b=>ids.add("bill_"+b.id));
CHARACTERS.forEach(c=>ids.add("person_"+c.id));
GLOSSARY.forEach(g=>{const t=g.term.toLowerCase().replace(/\s+/g,"_");ids.add("term_"+t);ids.add(t);});

const bad=[], counts={hand:ENCYCLOPEDIA.articles.length,gen:0};
counts.gen = PARTIES.length+STATIONS.length+BILLS.length+CHARACTERS.length+GLOSSARY.length;

ENCYCLOPEDIA.articles.forEach(a=>{
  const text=[a.summary,...(a.sections||[]).map(s=>s.body)].join(" ");
  /* hyphens included, matching the renderer: write-off is a term and the old
     class stopped at the hyphen and reported the first half as broken */
  [...text.matchAll(/\[\[([a-z0-9_-]+)/gi)].forEach(m=>{ if(!ids.has(m[1])) bad.push(a.id+" → [["+m[1]+"]]"); });
  (a.see||[]).forEach(s=>{ if(!ids.has(s)) bad.push(a.id+" → see:"+s); });
  (a.banners||[]).forEach(b=>{ if(!ENCYCLOPEDIA.banners[b]) bad.push(a.id+" → banner:"+b); });
});

/* =============================================================
   THE REGISTER: AN ENCYCLOPEDIA DOES NOT KNOW IT IS IN A GAME.

   The Concordance printed `characters[].note` as a person article's first
   paragraph, and those notes are the AUTHOR'S design notes -- "Liabilities,
   not buffs. Her record is the thing that can be dug up", "This is the
   sharpest tool in the game", "Shares your economics, despises your
   personhood line". Second person, and game vocabulary, in an in-world
   reference work. Nothing could see it because no check read the prose the
   Concordance actually draws, only the links between articles.

   Two things are faults here and nothing else is:

     SECOND PERSON   "you", "your". A reference work addresses nobody. It is
                     the single clearest tell that a passage was written as
                     a briefing to the player rather than as an article.
     GAME VOCABULARY the words that only exist outside the fiction. "buff",
                     "the player", "the game", a "stat" or a "mechanic".

   Quoted speech is exempt: an article may quote somebody who said "you",
   and a glossary handle may be a phrase of dialogue. So the test skips
   anything inside quotation marks.
   ============================================================= */
const OUT_OF_WORLD = [
  [/\byou\b|\byour\b|\byours\b/i, "addresses the reader"],
  [/\bbuffs?\b|\bdebuffs?\b|\bthe player\b|\bthe game\b|\bgameplay\b|\bstat block\b/i,
   "names the game from inside the world"]
];
const voice = [];
function readsOutOfWorld(where, text) {
  if (!text) return;
  /* strip quoted speech before testing: a quotation may say anything */
  const t = String(text).replace(/[\u201c"][^\u201d"]*[\u201d"]/g, " ");
  OUT_OF_WORLD.forEach(([re, why]) => {
    const m = t.match(re);
    if (m) voice.push({ where, why, hit: m[0], text: String(text).trim().slice(0, 96) });
  });
}
ENCYCLOPEDIA.articles.forEach(a => {
  readsOutOfWorld(a.id + "/summary", a.summary);
  (a.sections || []).forEach((sec, i) =>
    readsOutOfWorld(a.id + "/sections/" + i, sec.body));
});
/* And the content the GENERATORS pull into articles, which is where the
   fault actually was. */
PARTIES.forEach(p => readsOutOfWorld("parties/" + p.id + "/note", p.note));
GLOSSARY.forEach(g => readsOutOfWorld("glossary/" + g.term + "/gloss", g.gloss));

console.log("CONCORDANCE CHECK");
console.log("=".repeat(50));
console.log("  hand-written articles:", counts.hand);
console.log("  generated articles:   ", counts.gen);
console.log("  total:                ", counts.hand+counts.gen);
console.log("");
const cats={};
ENCYCLOPEDIA.articles.forEach(a=>cats[a.category]=(cats[a.category]||0)+1);
console.log("  hand-written by category:");
Object.keys(cats).sort().forEach(k=>console.log("    "+k.padEnd(24)+cats[k]));
console.log("");
const banners={};
ENCYCLOPEDIA.articles.forEach(a=>(a.banners||[]).forEach(b=>banners[b]=(banners[b]||0)+1));
console.log("  maintenance banners in use:");
Object.keys(banners).sort().forEach(k=>console.log("    "+k.padEnd(24)+banners[k]));
console.log("");
if(voice.length){
  console.log("  PROSE THAT READS OUT OF WORLD");
  voice.forEach(v => console.log("    " + v.where + "\n      " + v.why +
    " (\"" + v.hit + "\")\n      " + v.text));
  console.log("");
}
if(bad.length || voice.length){
  if(bad.length){ console.log("BROKEN REFERENCES"); bad.forEach(b=>console.log("  "+b)); }
  process.exitCode = 1;
} else console.log("all links resolve, all banners resolve, and the register holds");
