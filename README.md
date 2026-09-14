<br>

![Obsidian](https://img.shields.io/badge/obsidian-%237C3AED.svg?style=for-the-badge&logo=obsidian&logoColor=white) ![Claude](https://img.shields.io/badge/claude-%23D97757.svg?style=for-the-badge&logo=claude&logoColor=white) ![Markdown](https://img.shields.io/badge/markdown-%23000000.svg?style=for-the-badge&logo=markdown&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black) ![Mermaid](https://img.shields.io/badge/mermaid-%23FF3670.svg?style=for-the-badge&logo=mermaid&logoColor=white)

<h1 align="center">

Claude Knowledgebase

</h1>

An Obsidian vault that holds your project's design — what it is, why it's shaped that way, and what you've decided — as a single source of truth that you and your Claude agent both read.

Your agent starts every session knowing nothing about the last one. You don't. That gap is why you re-explain the same architecture every week, why your agent keeps proposing the thing you rejected in July, and why your docs quietly go stale until they mislead you instead of helping. This closes it three ways: the design lives in files your agent reads in full before it advises you, every decision is recorded next to the reasoning behind it, and a guard script catches the countable kinds of drift so you never have to hunt for them by re-reading.

It's plain Markdown, so it works in any editor — but it's built for [Obsidian](https://obsidian.md), which renders the `[[wikilinks]]`, Mermaid diagrams and callouts as intended. You'll also want [Claude Code](https://claude.com/claude-code) and Node.js 18+ for the guard.

## How to use it

**Fill in the four fields in `Overview/Project Charter.md` first.** Your project's name, what it does in one sentence, who it's for, and the domain it lives in. Nothing else works until you do — the guard fails on purpose until those are filled, because a vault that passes its own checks while nobody has said what it documents is a vault where every later note is guessing. Your agent is instructed never to guess a value for one.

**Start every session with `/sync`.** Your agent reads every note in order, then tells you what it loaded, what the guard says, what decisions are waiting on you, and any contradictions it found. Skip this and you get design advice from a blank slate, which is exactly how you end up talked into contradicting yourself.

**Talk it through in chat.** Conversation is the default; writing to the vault is the exception. Your agent proposes, it doesn't file.

**When you actually decide something, record it.** Copy `_templates/ADR.md` into `Decisions/`, take the next number, fill in the context, the decision, the consequences and what you considered instead. Add a row to `Decisions/_ADR Index.md`. The row says what you chose; the body says why — and the why is what tells you later whether a new idea contradicts it.

**Nothing gets accepted without you.** Every decision record your agent writes starts as `status: draft` and stays there until you rule on it. Drafts get no row in the index and can't be cited as settled. The guard lists them on every run, so nothing sits unread and hardens into a decision you never made.

**Everything that isn't a decision gets edited in place.** Change the note, bump its `updated:` date, keep its links honest. Don't rewrite a living note from scratch to change it.

**Re-run the guard after any structural change:**

```bash
node "_meta/check-vault.mjs"
```

## How to keep your documentation true

This part transfers anywhere. `CONVENTIONS.md` and the guard enforce it here, but the reasoning holds for any docs you and an agent share.

### 1. Keep decisions and living notes strictly apart

Everything you write is one of two things, and it determines how you're allowed to change it:

|  | **A decision** | **A living note** |
|---|---|---|
| Answers | *Why* you chose what you chose | *What* the system is now |
| Changing it | Never — supersede it with a new one | Edit it, bump the date |

A decision records a moment, so it stays true forever. A living note describes the present, so correct it rather than appending to it. Blur the two and you get something that's neither reliable history nor an accurate present.

When a living note and a decision disagree, either the note is stale or you decided something without recording it. Both are defects — surface the collision, don't quietly pick a winner.

### 2. Write each fact once and link to it

A fact stored in two places gets corrected in one. The half-corrected version is the dangerous one: it carries the fix *and* the old copy side by side, so it looks updated and you trust it.

Your project's name, scope and audience live in the Charter and nowhere else. Do the same with anything that recurs — pick one home, link to it from everywhere else. When a change ripples, grep the term across every file and fix all of it in one pass.

### 3. Don't keep anything transient

No handoffs, build plans, roadmaps, phase plans, to-do lists, session notes, progress snapshots, "current state" briefs, open-questions notes, parking lots or backlogs. Any filename, any folder.

Each one is accurate the day you write it and progressively false afterward, and nothing ever goes back to retire a line. You end up with a second source of truth that disagrees with the first — and gets read as current.

Build status belongs in your code repo. An open question stays in conversation until you settle it, and then only the answer gets written down.

**The register of undecided things is the one that tempts everybody, and it's the worst of them.** It reads like a live agenda and behaves like a stale one: you answer a question in passing, the row stays standing, and your agent proposes work you settled a month ago. If you've deliberately deferred a choice, that deferral *is* a decision — record it as one, naming what's deferred and what would end it. That version carries your reasoning, and whatever settles the question later supersedes it cleanly.

### 4. Never let a note describe its own maturity

Don't write how complete something is, how new it is, or what it's missing. The test is mechanical: **a line guaranteed to need overwriting is drift by construction — and if nobody overwrites it, the drift shipped silently.**

"Not started", "still small", "as this grows", "at the time of writing", an initialization date — each describes one day rather than the subject. Write what is, not what's missing. Your indexes and the guard already report what exists, and they can't silently disagree with the files.

Naming a gap in **the system you're designing** is fine: "the retry path is unspecified" stays true until you specify it. It's describing the *document* that rots.

### 5. Date anything that rots without being touched

Most drift comes from an edit. One kind comes from the calendar: API pricing, rate limits, quotas, platform policy, vendor behavior. Notes carrying those use `type: platform` and must have `verified:` and `sources:`. An undated platform claim is worse than none, because you'll trust it. The guard fails a platform note missing either field and warns you when a verification passes 90 days.

### 6. Keep diagrams in text

Use Mermaid in fenced code blocks, never pasted images. It renders for you and reads losslessly for your agent, which can't see inside a screenshot. The ban is on the content, not the extension — a drawing stored as JSON inside a Markdown file is still a drawing.

Same logic more broadly: the vault carries the verbal half of design. Token values, format requirements, voice specifications, pipeline stages — those belong here. The rendered artifact doesn't.

### 7. You decide; the record proves it was you

An agent proposing something and an agent recording it are different acts, and collapsing them is the failure this whole setup exists to prevent. A proposal written in the voice of settled record launders an opinion into permanence — the log says *decided*, and six months later you can't tell your own call from a suggestion you never ruled on.

So your agent drafts, you accept, and only what you accepted gets a row.

### 8. Make countable facts script-checkable, never eyeball-checkable

`_meta/check-vault.mjs` verifies decision numbering and status, that every wikilink resolves, the frontmatter schema, platform dating and staleness, folder structure against the manifest, the absence of images and transient files, maturity prose, unfilled Charter fields, and that every `§` citation points at a real section.

The rule that keeps it worth having: **if you ever hand-fix a countable fact, add a check for it in the same pass.** Anything a script can verify should never be verified by reading again.

What it can't do is read prose for meaning. Passing means the numbers agree — a contradiction between two sentences still needs you, or an agent that has read everything, which is the other half of `/sync`.

### 9. Keep build status out of the design

Whether something is *built* is a claim about code, and it belongs in your code repo. A design note asserting it's done is repeating a claim it can't check, and a stale green checkmark retires work you still have to do.

## Making it your own

The conventions are opinionated on purpose, and they're yours to change — just edit `CONVENTIONS.md` and the guard together so the rules and their enforcement never disagree. Three pieces are worth keeping whatever else you rework:

- **`CLAUDE.md`** — what makes your agent load full context instead of guessing from the shape of your question.
- **The draft-then-accept split** — what keeps your agent's reasoning out of your record.
- **The guard script** — what makes a rule real rather than aspirational.

## Where to start

- [Project Charter](Overview/Project%20Charter.md) — what your vault is about. Fill this in first.
- [Home](Home.md) — the map of content
- [CONVENTIONS](CONVENTIONS.md) — the full authoring contract
- [Vault manifest](_meta/manifest.md) — what exists, and the reading order
- [ADR Index](Decisions/_ADR%20Index.md) — the decision log
