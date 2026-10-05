# Ways & Means

*A Space Story About Politics and Governance.*

A text-based narrative political thriller with a real electoral simulation, set in the Circumterrestrial Commonwealth, which is a federated republic of thirty orbital habitats bound together by trade, shared infrastructure, and mutual dependence, population 7,086,000. You lead a party in a 280-seat Parliament. The Commonwealth has a near-post-scarcity economy, making manufactured goods abundant, while habitable volume, thermal capacity, substrate, and transportation remain tightly constrained—creating a high-value market in access to the infrastructure that sustains life. The result is a sophisticated rentier economy where private consortiums, public utilities, and federal institutions compete to manage the Commonwealth’s most vital resources. Navigate interparty relations, your governmental coalition, parliament, and foreign affairs to keep this sophisticated nation and economy running.

---

## Run it

Play it in the browser at (https://landvaluetaxfan.github.io/ways-and-means-game/). I might get my own domain eventually. Or download at releases once I get around to doing that. There might also be an itch.io page someday. Who knows.

From a clone, open `index.html`. `file://` is supported.

## Cut a restricted playtest

Once, create an itch.io project as a draft HTML game with restricted access and a password. Set its viewport to about 1366 × 768 and enable the fullscreen button. Create an itch.io API key. In this GitHub repository's Settings → Secrets and variables → Actions, add the key as the repository secret `BUTLER_API_KEY` and add `<user>/<game>:html5-playtest` as the repository variable `ITCH_TARGET`.

After the desired commit has landed on `main`, run `git push origin main:playtest`. A push to that branch runs the checks, builds the single-file slice, packages it as `index.html`, and uploads it to the itch.io `html5-playtest` channel. The playtest branch is a pointer to a main commit; do not develop on it. The workflow can also be started manually from GitHub Actions.

## Where things are

```
index.html            the game
editor.html           the content editor
content/              everything authored; content/campaigns/<id>/ is one campaign
js/                   the engine (js/engine.js names nothing concrete), the interface, the editor
tools/                the checks, the playtest, the build
bible.md              canon, out-of-world
textbook.md           canon, in-world
CONTENT_GUIDE.md      how to author content
PROSE.md              how the prose is written
AGENTS.md             instructions for the AI agents that work on it
briefs/               the work in progress, one task per file
design/               why things are the way they are, as dated records
```
