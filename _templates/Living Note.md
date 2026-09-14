---
title: Note Title
type: strategy | engine | architecture | data | operations | charter | glossary
status: draft
updated: YYYY-MM-DD
tags: []
related: ["[[Other Note]]"]
---

# Note Title

<!--
  A LIVING NOTE is edited in place, forever. It describes the system AS IT IS
  NOW, and derives its authority from the ADRs beneath it (CONVENTIONS §2).

  - To change it: edit it and bump `updated:`. Never recreate it.
  - Link the ADR for every non-obvious choice it describes — the why lives
    there, the what lives here.
  - If it contradicts an accepted ADR, that is a defect: either this note is
    stale, or a decision was made without an ADR. Surface it; do not pick a
    winner silently.
-->

> **Purpose:** One sentence — what this note is for and what depends on it.

## Overview

What this is, in plain language, before any detail.

## Responsibilities

Inputs, outputs, and what this owns. Be explicit — Claude treats unstated things as unknown, not implied.

## Detail

The substance. Diagrams are Mermaid in fenced blocks ([[CONVENTIONS]] §4), never images.

## Assumptions

What this takes for granted, and what breaks if any of it is wrong.

## Non-goals

What this deliberately does not do. As load-bearing as the goals.

## Decisions

The ADRs this note implements. `[[ADR-NNNN - title]]`
