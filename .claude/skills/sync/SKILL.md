---
name: sync
description: Load the entire design vault into context and report current state + any conflicts. Run at the start of a design session so Claude advises with full, unadulterated context. Use when the user types /sync, asks Claude to "load context", "sync up", "read everything", or starts substantive design work from a cold session.
---

# /sync — load full vault context

The purpose of this skill is to guarantee that, before giving any design guidance, you have read the **entire** design vault — not the auto-memory index, not a guess, the actual files. The vault is the single source of truth. The user has explicitly opted into this exhaustive load for the sake of collaboration quality.

## Steps

1. **Load the subject and the map.** Read `Overview/Project Charter.md` first — it is the only note that says what this vault is for (name, capability, audience, domain). Then `_meta/manifest.md` and `CONVENTIONS.md` — the folder map, the reading order, and the authoring contract.

2. **Read every design note.** Read every `.md` file in the design folders, plus `Home.md`, **in the order `_meta/manifest.md` gives** — the manifest's *Reading order* section is the authority, because folder names carry subject, not sequence. Do not sample — read them in full. Skip only `.obsidian/`, `_templates/` (unfilled placeholders, not design — read it only if a template question arises), and binary files. ⚠ **Depth is never a judgment call:** read every design note in full, every session, however narrow the task looks. There are no canvases or drawings to skip — the vault holds **no visual design at all** ([[CONVENTIONS]] §7). Use Glob (`**/*.md`) to enumerate, then read each. Reading them in parallel is fine.

3. **Build the state picture.** As you read, track:
   - Accepted **ADRs** (from `Decisions/`) — the immutable decisions.
   - Each note's `status` (`draft` / `accepted` / `implemented` / `deprecated`) — how much to trust it. A `draft` ADR is a proposal awaiting the human's ruling, never a decision.
   - The `related:` graph — how notes connect.
   - ⚠ **Every `type: platform` note's `verified:` date.** These are the only claims in the vault that go false without anyone editing them. Note any that are stale.

4. **Run the mechanical guard FIRST — before scanning by eye.** `node "_meta/check-vault.mjs"`. It verifies, against the files, what a human keeps getting wrong by re-reading: **ADR numbering** contiguity and every ADR carrying a settled status · every **`[[wikilink]]`** resolving, frontmatter included · **frontmatter schema** on every note · **platform notes carrying `verified:` + `sources:`**, and warning when a verification goes stale · **folders flat (depth one) and present in the manifest map** · **no drawing, scene or image file — and no drawing plugin — anywhere** ([[CONVENTIONS]] §7) · **no transient documents** ([[CONVENTIONS]] §6) · **`updated:` vs. mtime** (advisory — Dropbox rewrites mtimes) · **every `⟨field⟩` in the Project Charter filled in**.
   - **A FAIL is drift — report it, do not re-derive it by reading.**
   - **If you hand-fix a countable fact, add a check for it here in the same pass.** That is the standing rule ([[CONVENTIONS]] §8). A fact this script can verify must never again be verified by reading.
   - The guard cannot read prose for meaning. It proves the *numbers* agree; step 5 is still needed for a semantic contradiction.

5. **Run a conflict / drift scan** (the part no script can do). Actively look for:
   - Two notes that assert contradictory things (e.g. an `accepted` decision a `draft` note ignores).
   - **A living note that contradicts an accepted ADR.** Either the note is stale or a decision was made without an ADR — both are defects ([[CONVENTIONS]] §2). Surface it; do not pick a winner.
   - A note whose `related:` links are stale, missing, or point to renamed notes.
   - A decision the human has made that no ADR records.
   - The manifest's folder map or reading order disagreeing with the files on disk.
   - **Anything written in the voice of a decision that no ADR records.** A proposal formatted as settled record is the defect this standard exists to prevent — flag any note asserting a choice that `Decisions/` does not contain.
   - **The project's name, scope or audience restated outside `Overview/Project Charter.md`** ([[CONVENTIONS]] §8). One subject, one site; a second copy is drift waiting to happen.

6. **Report back** to the user, concisely:
   - ✅ Confirmation that the full vault is loaded (and roughly how many notes) — **and say honestly what you did NOT read.**
   - ✅ The **guard's verdict** (step 4) — pass, or the exact failures.
   - **Draft ADRs awaiting the human's review**, by name and what each decides. These are proposals, not decisions.
   - ⚠️ **Conflicts / drift** found in step 5 — or "none found." Surface these; do not silently fix.

## Rules

- **Vault beats memory.** If anything in the files contradicts your assumptions or the auto-memory, the files win — say so.
- **Surface, don't silently fix.** Report conflicts and let the user decide. Only edit when asked.
- **Never write a decision the user has not made.** A proposal stays in **conversation** — never `Decisions/`, and never a parking-lot note ([[CONVENTIONS]] §3). This vault keeps no register of the undecided; do not create one.
- Keep the final report tight and scannable — the reading is exhaustive, the summary should not be.
