#!/usr/bin/env node
/**
 * check-vault.mjs — the vault's mechanical drift guard.
 *
 * WHY THIS EXISTS
 * ---------------
 * The defect this guards against is a fact stated in two places and corrected in
 * one. The result is worse than an outright error: the note LOOKS updated, because
 * it carries the correction and an uncorrected copy side by side, and the next
 * reader trusts it. An eye-scan catches some of those; a script catches every
 * countable one, every time, at no cost.
 *
 * It checks only what a machine can check against the FILES. It does not read prose
 * for meaning, and it never claims the vault is drift-free. Passing means the
 * NUMBERS agree; a semantic contradiction still needs a human or an eye-scan.
 *
 * RUN:  node "_meta/check-vault.mjs"
 * Exit 0 = all checks pass. Exit 1 = at least one FAIL.
 *
 * ADDING A CHECK: if you ever hand-fix a countable fact, add it here instead —
 * that is the whole point (CONVENTIONS §8). A fact this script can verify must
 * never again be verified by reading.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const SKIP_DIRS = new Set([".obsidian", ".claude", ".git", "node_modules", ".trash"]);

let failures = 0, warnings = 0;
const pass = (m) => console.log("  ✓ " + m);
const fail = (m) => { failures++; console.log("  ✗ FAIL  " + m); };
const warn = (m) => { warnings++; console.log("  ⚠ WARN  " + m); };
const info = (m) => console.log("  · " + m);
const head = (m) => console.log("\n" + m);

// ---------------------------------------------------------------- file walk
const allFiles = [];
const allDirs = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (SKIP_DIRS.has(e.name)) continue; allDirs.push(p); walk(p); }
    else allFiles.push(p);
  }
})(ROOT);
const rel = (f) => path.relative(ROOT, f).split(path.sep).join("/");
const read = (f) => fs.readFileSync(f, "utf8");
const notes = allFiles.filter((f) => f.endsWith(".md"));
// `CLAUDE.md` is an agent instruction file, not a design note — it is addressed to
// the harness, carries no `type`, and is deliberately outside the frontmatter schema.
// `README.md` is exempt for the same reason in the other direction: it is addressed to
// a person arriving at the repository, is rendered by GitHub rather than Obsidian, and
// states nothing about what any particular vault documents (CONVENTIONS §8). A YAML
// block would be the first thing a visitor sees, and `status:` on a front door means
// nothing. Both files stay inside checks 8 and 11 below — the maturity-prose ban and
// the §-citation check apply to anything that teaches this standard.
// `_templates/` holds unfilled placeholders whose frontmatter is intentionally invalid.
const AGENT_OR_FRONT_DOOR = new Set(["CLAUDE.md", "README.md"]);
const NOT_DESIGN = (r) => r.startsWith("_templates/") || AGENT_OR_FRONT_DOOR.has(r);
const designNotes = notes.filter((f) => !NOT_DESIGN(rel(f)));

console.log(`vault guard — ${notes.length} notes, ${allDirs.length} folders`);

// --------------------------------------------------------- 1 · the ADR log
head("1 · ADR log — numbering and status, read from the files");
const adrDir = path.join(ROOT, "Decisions");
const adrFiles = fs.existsSync(adrDir)
  ? fs.readdirSync(adrDir).filter((f) => /^ADR-\d{4} - .*\.md$/.test(f))
  : [];
let accepted = 0, superseded = 0;
const drafts = [];
const otherStatus = [];
for (const f of adrFiles) {
  const m = read(path.join(adrDir, f)).match(/^status:\s*(\S+)/m);
  const s = m ? m[1] : "(none)";
  if (s === "accepted") accepted++;
  else if (s === "superseded") superseded++;
  else if (s === "draft") drafts.push(f);
  else otherStatus.push(`${f} -> ${s}`);
}
const total = adrFiles.length;
info(`files: ${total}  ·  accepted: ${accepted}  ·  superseded: ${superseded}  ·  draft: ${drafts.length}`);
if (otherStatus.length) fail("ADR with a status outside the CONVENTIONS §1 enum: " + otherStatus.join(", "));
else pass("every ADR carries a status the enum allows");

// A DRAFT ADR IS NOT A FAILURE. Claude writes every ADR as a draft and never
// accepts one; only the human does, after reading it (CONVENTIONS §3). So a
// draft is the normal first state. It is warned rather than passed over
// because it is work sitting on the human's desk: unwarned, drafts pile up
// unread and become the register of the undecided this vault refuses to keep
// (CONVENTIONS §6). This is also why drafts get no row in the ADR index —
// the list lives here, where it is read from the files and cannot go stale.
if (drafts.length) {
  for (const f of drafts) warn(`awaiting your review: ${f}`);
  info("a draft ADR is a proposal, not a decision. Only the human sets status: accepted.");
} else info("no ADR is awaiting review");

// Numbering contiguous 0001..N — a gap means a lost or misnumbered decision.
if (total === 0) {
  pass("no ADRs — numbering trivially contiguous");
} else {
  const nums = adrFiles.map((f) => parseInt(f.slice(4, 8), 10)).sort((a, b) => a - b);
  const max = nums[nums.length - 1];
  const gaps = [];
  for (let i = 1; i <= max; i++) if (!nums.includes(i)) gaps.push(i);
  if (gaps.length) fail("ADR numbering gap(s): " + gaps.join(", "));
  else pass(`ADR numbering contiguous 0001–${String(max).padStart(4, "0")}`);
}

// NO TALLY SITES, DELIBERATELY. This check once verified a written ADR count in
// three notes. That count existed for an agent doing a PARTIAL read, and partial
// reads are gone: /sync reads every file every session, so the number told an
// agent what it had just finished counting. Worse, the loop verified the CLAIMS
// against the files rather than the vault against itself — delete the claims and
// nothing was left to check. Three drift sites and a self-justifying check, for a
// fact every reader already had. Derive counts; do not write them down
// (CONVENTIONS §6.1). The two checks above survive because they read Decisions/
// directly and catch real defects: a lost or misnumbered ADR, or one left proposed.

// ------------------------------------------------ 2 · wikilink resolution
head("2 · Wikilinks — every [[link]] resolves (frontmatter included)");
const names = new Set(), rels = new Set();
for (const f of allFiles) {
  const b = path.basename(f);
  names.add(b); names.add(b.replace(/\.md$/, ""));
  const r = rel(f); rels.add(r); rels.add(r.replace(/\.md$/, ""));
}
// Syntax illustrations, not links — CONVENTIONS and the templates teach the [[…]] form.
const LINK_ALLOWLIST = new Set([
  "Other Note", "wikilink", "wikilinks", "…",
  "ADR-NNNN - title", "ADR-NNNN - short title",
]);
const dangling = new Map();
for (const f of designNotes) {
  // Obsidian does not resolve a wikilink inside code, and neither do we: strip
  // fenced blocks and inline-code spans before looking for links.
  const txt = read(f)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/`[^`\n]*`/g, "");
  for (const m of txt.matchAll(/\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]/g)) {
    const t = m[1].trim();
    if (!t || LINK_ALLOWLIST.has(t)) continue;
    if ([t, t + ".md"].some((c) => names.has(c) || rels.has(c) || names.has(path.basename(c)))) continue;
    if (!dangling.has(t)) dangling.set(t, new Set());
    dangling.get(t).add(rel(f));
  }
}
if (dangling.size) {
  for (const [t, where] of dangling) fail(`dangling [[${t}]] — in ${[...where].join(", ")}`);
} else pass("all wikilinks resolve");

// ------------------------------------------------------- 3 · frontmatter
head("3 · Frontmatter — schema per CONVENTIONS §1");
const TYPES = new Set(["charter","strategy","engine","architecture","data","platform","operations","flow","adr","glossary","meta"]);
const STATUSES = new Set(["draft","accepted","implemented","deprecated"]);
let fmOk = 0;
const fmOf = (f) => {
  const m = read(f).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const o = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) o[kv[1]] = kv[2].trim();
  }
  return o;
};
for (const f of designNotes) {
  const r = rel(f);
  const fm = fmOf(f);
  if (!fm) { fail(`${r} — no frontmatter`); continue; }
  const problems = [];
  if (!fm.title) problems.push("missing title");
  if (!fm.type) problems.push("missing type");
  else if (!TYPES.has(fm.type)) problems.push(`type "${fm.type}" not in the CONVENTIONS §1 enum`);
  if (!fm.status) problems.push("missing status");
  else if (!STATUSES.has(fm.status)) problems.push(`status "${fm.status}" not in the enum`);
  if (!fm.updated) problems.push("missing updated");
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.updated)) problems.push(`updated "${fm.updated}" is not YYYY-MM-DD`);
  if (problems.length) fail(`${r} — ${problems.join("; ")}`);
  else fmOk++;
}
if (fmOk === designNotes.length) pass(`all ${fmOk} notes carry valid frontmatter`);

// ------------------------------------ 4 · platform notes carry a verified date
head("4 · Platform facts — verified: + sources: present, and not stale");
const STALE_DAYS = 90;
const platformNotes = designNotes.filter((f) => (fmOf(f) || {}).type === "platform");
if (!platformNotes.length) {
  info("no type:platform notes");
} else {
  for (const f of platformNotes) {
    const r = rel(f), fm = fmOf(f);
    if (!fm.verified) { fail(`${r} — type:platform without verified: (CONVENTIONS §1)`); continue; }
    if (!fm.sources || fm.sources === "[]") fail(`${r} — type:platform without sources:`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.verified)) { fail(`${r} — verified "${fm.verified}" is not YYYY-MM-DD`); continue; }
    const age = Math.floor((Date.now() - Date.parse(fm.verified)) / 86400000);
    if (age > STALE_DAYS) warn(`${r} — verified ${age} days ago; re-check before relying on it`);
    else pass(`${r} — verified ${age}d ago`);
  }
}

// ------------------------------------------------- 5 · folders flat + mapped
head("5 · Structure — folders flat (depth 1) and present in the manifest map");
const manifestPath = path.join(ROOT, "_meta/manifest.md");
const manifestTxt = fs.existsSync(manifestPath) ? read(manifestPath) : "";
for (const d of allDirs) {
  const r = rel(d);
  if (r.split("/").length > 1) fail(`folder deeper than one level: ${r} (CONVENTIONS §5)`);
}
if (!allDirs.some((d) => rel(d).includes("/"))) pass("every folder is exactly one level deep");
const unmapped = allDirs
  .map(rel)
  .filter((r) => !r.includes("/"))
  .filter((r) => !manifestTxt.includes("`" + r + "`"));
if (unmapped.length) fail("folder(s) missing from the manifest folder map: " + unmapped.join(", "));
else pass("every folder appears in the manifest folder map");
// Scope note: this check validates FOLDERS, not individual notes. Extending it to
// assert every note is named in the map is the natural next increment.

// ------------------------------------------------------------ 6 · no visuals
head("6 · No visual design in the vault (CONVENTIONS §7)");
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|bmp|tiff?|psd|ai|sketch|fig|xd|mp4|mov|canvas|excalidraw)$/i;
// Counted locally: a check's own verdict must never depend on an unrelated check
// having failed first, or a passing section prints nothing and reads as skipped.
const before6 = failures;
const offenders = allFiles.map(rel).filter((r) => IMAGE_EXT.test(r));
for (const r of offenders) fail(`visual/binary asset in the vault: ${r}`);
// Test the CONTENT, not the extension — a drawing stored as JSON inside a .md is
// still a drawing, and an extension test alone leaves that loophole wide open.
for (const f of notes) {
  const t = read(f);
  if (/"type"\s*:\s*"excalidraw"/.test(t) || /excalidraw-plugin\s*:/.test(t))
    fail(`embedded drawing scene in ${rel(f)}`);
}
const pluginsFile = path.join(ROOT, ".obsidian/community-plugins.json");
if (fs.existsSync(pluginsFile)) {
  const plugins = read(pluginsFile);
  for (const p of ["excalidraw", "canvas", "tldraw", "diagrams"])
    if (plugins.toLowerCase().includes(p)) fail(`drawing plugin enabled: ${p}`);
}
if (failures === before6) pass("no drawings, scenes, images or drawing plugins");

// -------------------------------------------------------- 7 · no transients
head("7 · Nothing transient in the vault (CONVENTIONS §6)");
const BANNED = /(^|[ _\-])(temp|tmp|wip|handoff|todo|to-do|checklist|scratch|session[ _-]?notes?|progress|roadmap|build[ _-]?plan|phase[ _-]?plan|worklist|open[ _-]?questions?|parking[ _-]?lot|backlog)([ _\-.]|$)/i;
const transients = notes.map(rel).filter((r) => BANNED.test(path.basename(r, ".md")));
if (transients.length) for (const r of transients) fail(`transient document: ${r} — belongs in the scratch dir or the code repo`);
else pass("no handoffs, plans, checklists, parking lots or session notes");

// --------------------------------------- 8 · no note describes its own maturity
head("8 · No self-describing maturity prose (CONVENTIONS §6.1)");
// A line that is guaranteed to need overwriting is drift surface by construction,
// and if it is NOT overwritten the drift shipped silently. These phrasings read as
// documentation and behave as a to-do list. A current-state claim is permitted
// only when a check here fails the moment it disagrees with the files — and even
// then, deriving the fact beats writing it down. This vault writes none.
//
// ADR bodies are exempt: an ADR is a dated record of a moment, so describing the
// circumstances at decision time is exactly its job and stays permanently true.
const MATURITY = [
  [/\bnot yet (written|created|documented|decided|specified|exist)/i, '"not yet …"'],
  [/\b(none|nothing) (yet|so far)\b/i, '"none yet" / "nothing so far"'],
  [/\b(does|do) not exist yet\b/i, '"does not exist yet"'],
  [/\b(currently|still) (near-)?empty\b/i, '"currently/still empty"'],
  [/\bnear-empty\b/i, '"near-empty"'],
  [/\bfor now\b/i, '"for now"'],
  [/\bso far\b/i, '"so far"'],
  [/\bat present\b/i, '"at present"'],
  [/\bat the time of writing\b/i, '"at the time of writing"'],
  [/\bas the vault (grows|fills)\b/i, '"as the vault grows"'],
  [/\bonce (the vault|folders|notes|this) [a-z]+\b/i, '"once … , do …" (an instruction to a future editor)'],
  [/\bre-measure\b/i, '"re-measure this later"'],
  [/\bbarely started\b/i, '"barely started"'],
  [/\b(design|work|documentation):? not started\b/i, '"not started"'],
  [/\bvault (was )?initialized\b/i, '"the vault was initialized …" (a status snapshot)'],
  [/\bthis will change when\b/i, '"this will change when …"'],
  [/\bTODO\b/, '"TODO"'],
];
let maturityHits = 0;
for (const f of notes) {
  const r = rel(f);
  if (NOT_DESIGN(r) && !AGENT_OR_FRONT_DOOR.has(r)) continue;  // templates out, CLAUDE.md + README.md in
  if (/^Decisions\/ADR-\d{4}/.test(r)) continue;      // dated records are exempt
  const lines = read(f).split(/\r?\n/);
  lines.forEach((line, i) => {
    // A note that TEACHES this rule has to quote the vocabulary it bans — §6.1's
    // own table, and the one-line summaries in Home.md and CLAUDE.md. The tell is
    // punctuation: teaching puts the phrase in quotes, violating uses it bare. So
    // strip quoted spans and inline code before testing, exactly as check 2 strips
    // code before looking for wikilinks.
    const bare = line
      .replace(/"[^"]*"/g, "")
      .replace(/[“][^”]*[”]/g, "")
      .replace(/`[^`]*`/g, "");
    for (const [re, label] of MATURITY) {
      if (re.test(bare)) { fail(`${r}:${i + 1} — maturity prose ${label}`); maturityHits++; break; }
    }
  });
}
if (!maturityHits) pass("no note describes its own maturity, recency or size");

// ------------------------------------------------------- 9 · updated vs mtime
head("9 · updated: vs. file mtime");
info("advisory only — this vault lives in Dropbox, which rewrites mtimes on sync");
let drifted = 0;
for (const f of designNotes) {
  const fm = fmOf(f);
  if (!fm || !fm.updated || !/^\d{4}-\d{2}-\d{2}$/.test(fm.updated)) continue;
  const mtime = fs.statSync(f).mtime;
  const days = Math.floor((mtime - Date.parse(fm.updated)) / 86400000);
  if (days > 1) { warn(`${rel(f)} — modified ${days}d after its updated: date (${fm.updated})`); drifted++; }
}
if (!drifted) pass("no note is modified meaningfully after its updated: date");

// ------------------------------------------ 10 · the vault states its subject
head("10 · Project Charter — the subject is stated, and stated once");
const before10 = failures;
// This vault ships as a TEMPLATE, with the Project Charter unfilled. A fresh
// clone MUST fail here until its owner writes down what the vault is about: a
// vault that passes its own guard while nobody has said what it documents is a
// vault whose every later note is guessing. Filling the fields is the act that
// turns the template into a vault, so the guard is the thing that asks for it.
const charterPath = path.join(ROOT, "Overview/Project Charter.md");
if (!fs.existsSync(charterPath)) {
  fail("Overview/Project Charter.md is missing — it is this vault's only statement of what it is for (CONVENTIONS §8)");
} else {
  const unfilled = new Map();
  for (const f of designNotes) {
    // Backticked spans and fenced blocks TEACH the ⟨…⟩ form (the Charter's own
    // callout, CLAUDE.md's rule). Only a BARE token is an unfilled field — the
    // same punctuation tell check 8 uses to separate teaching from violating.
    const txt = read(f)
      .replace(/```[^]*?```/g, "")
      .replace(/<!--[^]*?-->/g, "")
      .replace(/`[^`]*?`/g, "");
    const toks = [...txt.matchAll(/⟨[^⟩]{0,120}⟩/g)].map((m) => m[0]);
    if (toks.length) unfilled.set(rel(f), toks);
  }
  if (unfilled.size) {
    for (const [r, toks] of unfilled) fail(`${r} — unfilled field(s): ${toks.join("  ")}`);
    info("this vault has no subject yet. Fill the fields in Overview/Project Charter.md —");
    info("that note is the ONLY place the project's name, scope and audience are written.");
  } else pass("every ⟨field⟩ is filled in");
}
const charterFails = failures - before10;

// ------------------------------- 11 · CONVENTIONS §-references resolve
head("11 · CONVENTIONS §-references — every citation names a real section");
const before11 = failures;
const convPath = path.join(ROOT, "CONVENTIONS.md");
if (!fs.existsSync(convPath)) {
  fail("CONVENTIONS.md is missing — it is the contract every other note cites");
} else {
  // Deleting or renumbering a section silently invalidates every citation of it,
  // and a citation left pointing at the WRONG section still READS as correct —
  // the signature defect this guard exists for (CONVENTIONS §8). Every note, the
  // agent instruction files and this script all cite the contract by number, so
  // the numbers are checked here and never verified by reading again.
  const sections = new Set(
    [...read(convPath).matchAll(/^#{2,6}\s+(\d+(?:\.\d+)*)\.?\s/gm)].map((m) => m[1])
  );
  const tops = [...sections].filter((s) => !s.includes(".")).map(Number).sort((a, b) => a - b);
  // A gap means a section was deleted without renumbering; a renumber without
  // fixing citations shows up as an unresolved §-reference below. Both are drift.
  if (tops.some((n, i) => n !== i + 1))
    fail(`CONVENTIONS.md top-level sections are not contiguous from 1: ${tops.join(", ")}`);

  // `.claude/` is skipped by the main walk, but the skills there cite the contract
  // too — an agent reads them as instructions, so a stale number misleads exactly
  // the reader this guard protects.
  const citing = [...notes, path.join(HERE, "check-vault.mjs")];
  const agentDir = path.join(ROOT, ".claude");
  if (fs.existsSync(agentDir)) (function walkAgent(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walkAgent(p);
      else if (p.endsWith(".md")) citing.push(p);
    }
  })(agentDir);

  for (const f of citing) {
    read(f).split(/\r?\n/).forEach((line, i) => {
      for (const m of line.matchAll(/§(\d+(?:\.\d+)*)/g))
        if (!sections.has(m[1]))
          fail(`${rel(f)}:${i + 1} — cites §${m[1]}, which CONVENTIONS.md has no section for`);
    });
  }
  if (failures === before11)
    pass(`every §-citation resolves — ${[...sections].length} sections, ${citing.length} files scanned`);
}

const onlyUnconfigured = failures > 0 && charterFails === failures;

// ---------------------------------------------------------------- verdict
head("─".repeat(60));
if (onlyUnconfigured)
  console.log(`RESULT: UNCONFIGURED — every other check passes; this vault has not yet been told what it is about.
        Fill the ⟨fields⟩ in Overview/Project Charter.md. That is the whole setup.`);
else if (failures) console.log(`RESULT: ${failures} FAIL, ${warnings} warn — drift. Report it; do not re-derive it by reading.`);
else console.log(`RESULT: pass${warnings ? `, ${warnings} warn` : ""}. The numbers agree — a semantic contradiction still needs an eye-scan.`);
process.exit(failures ? 1 : 0);
