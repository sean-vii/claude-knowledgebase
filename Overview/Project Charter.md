---
title: Project Charter
type: charter
status: accepted
updated: 2026-09-14
tags: [charter, scope]
related: ["[[Home]]", "[[CONVENTIONS]]", "[[_ADR Index]]", "[[_meta/manifest|manifest]]"]
---

# Project Charter

> **Purpose:** The one place this vault states what project it is for. Every other note points here and asserts nothing about the subject itself, so no two notes in this vault can disagree about what is being designed.

> [!important] **This note is the human's.** Claude reads it before anything else and defers to it completely — but does not author it or extend it without explicit permission. Never infer a value for a field left open. Everything downstream is written against what this note says, which is why a guessed value here is worse than an empty one: it propagates silently into every proposal that follows.

> [!warning] **Each `⟨…⟩` below is an unfilled field.** `_meta/check-vault.mjs` check 10 fails while a bare `⟨…⟩` token remains anywhere in the vault — so a vault whose subject nobody has written down cannot pass its own guard. Filling these four fields is what turns this template into a vault.

## Identity

| Field             | Value                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **Project**       | ⟨name⟩                                                                                      |
| **What it is**    | ⟨one sentence, stated as a capability: what the system does, end to end⟩                    |
| **Who it is for** | ⟨the operator or audience every design choice is made against⟩                              |
| **Domain**        | ⟨the subject matter this vault designs — what a reader must understand to judge a proposal⟩ |

**Why these four, and no more.** Each one changes what an agent should propose. The name settles what to call things. The capability sentence settles scope — what is inside the system and what is merely adjacent to it. The audience settles who a tradeoff gets resolved in favour of. The domain settles which constraints are even relevant to raise. A fifth field that does not change a proposal is padding, and belongs in the living note that actually uses it.

## What does not belong here

| Not this | Where it goes |
|---|---|
| An open choice, an option, a recommendation | conversation — it is never written to the vault ([[CONVENTIONS]] §3) |
| The reasoning behind a decision | the ADR that records it, in `Decisions/` |
| A project-wide fact an ADR has settled | the ADR itself, listed in [[_ADR Index]] — read them, never copy them here |
| What the system currently *is*, in detail | the living note that owns that area |
| A requirement, a behavior, an interface | the living note that specifies it — a charter states scope, never specification |
| Anything transient — plans, progress, status | outside the vault entirely ([[CONVENTIONS]] §6) |



