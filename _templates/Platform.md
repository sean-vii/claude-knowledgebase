---
title: Platform Name
type: platform
status: draft
updated: YYYY-MM-DD
verified: YYYY-MM-DD
sources: ["https://…"]
tags: [platform]
related: ["[[_meta/manifest|manifest]]"]
---

# Platform Name

<!--
  `verified:` and `sources:` are MANDATORY on this type (CONVENTIONS §1).
  These are the only claims in the vault that become false without anyone
  editing the note — the calendar does it. check-vault.mjs fails if either
  field is missing and warns when `verified` goes stale.

  Never quietly extend `verified:` — re-check against the source, or leave
  the old date and let the guard flag it.
-->

> **Purpose:** One sentence — what this platform is to the system this vault designs, and what depends on these facts.

## Capabilities

| Capability | Supported | Preconditions | Notes |
|---|---|---|---|
| Publish | | | |
| Reply | | | |
| Like / react | | | |
| Search / read | | | |
| Metrics | | | |

## Constraints

Quotas, rate limits, media requirements, approval or audit gates. **State the date each was checked** where it differs from `verified:`.

## Cost

Per-action or per-tier pricing, with the date.

## Policy

What the platform's terms permit and forbid, in its own framing. Note where the stated *spirit* of a policy is broader than its letter.

## What this forces in the design

The half that is actually load-bearing: which designs this platform rules out, and which it makes cheap. Link the ADRs that were decided because of it.
