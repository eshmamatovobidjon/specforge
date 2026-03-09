---
description: Load a spec and the Memory Bank into context, restate intent, and wait for explicit confirmation before writing any code.
---

## User Input

```text
$ARGUMENTS
```

The first argument is the **spec ID** (required). Example: `user-auth-flow`.

## Goal

Establish a shared, unambiguous understanding of what will be implemented before a single line of code is written. This command enforces the mandatory confirmation gate that prevents scope drift.

## Execution Steps

### 1. Resolve Paths

```
SPEC    = .sdd/specs/<spec-id>/spec.md
NOTES   = .sdd/specs/<spec-id>/notes.md   (optional — load if present)
AGENTS  = .sdd/memory/AGENTS.md
ARCH    = .sdd/memory/architecture.md     (optional — load if present)
DECISIONS = .sdd/memory/decisions.md      (optional — load if present)
```

If `SPEC` does not exist, abort with:

> "No spec found at `.sdd/specs/<spec-id>/spec.md`. Run `/spec-new` to create one first."

### 2. Load Memory Bank

Read `AGENTS.md` fully. This file defines:

- The project stack and tooling
- Naming and coding conventions
- Anti-patterns the AI must never introduce

Read `architecture.md` and `decisions.md` if present. These provide system topology and ADR context.

### 3. Load Spec (and Notes)

Read `spec.md` fully.

If `notes.md` exists, read it. Notes contain ephemeral implementation context (in-progress discoveries, unresolved questions). Treat notes as lower-authority than the spec — they inform but do not override contracts.

### 4. Restate Intent (Mandatory)

Output a structured restatement in this exact format:

---

**Spec loaded: `<spec-id>`**
**Mode:** `<nano | feature | system>`
**Status:** `<draft | in-progress | stable>`

**What I understand this change to be:**
<2–4 sentence plain-English summary of the problem and the intended outcome>

**Contracts I will implement (in priority order):**
1. <Contract 1 — verbatim or faithfully paraphrased from spec>
2. <Contract 2>
…

**Constraints from AGENTS.md I will respect:**
- <Relevant constraint 1>
- <Relevant constraint 2>
…

**What is explicitly out of scope:**
- <Out-of-scope item 1>
- <Out-of-scope item 2>
…

**I will NOT begin implementing until you reply: "correct, begin"**

---

### 5. Wait

Do not write any code, create any files, or modify any existing files until the user replies with explicit confirmation.

Accepted confirmation phrases (case-insensitive): `correct, begin` / `yes, begin` / `begin` / `go ahead` / `confirmed`.

If the user replies with a correction instead of confirmation, update your understanding and restate the relevant sections. Repeat until confirmed.

### 6. Implement

Once confirmed, implement strictly within the spec boundary. Do not implement anything not covered by a contract. Do not refactor code outside the spec's stated scope.

After completing implementation, output:

> "Implementation complete. Run `/spec-verify <spec-id>` to audit the result against the spec contracts."

## Operating Principles

- **The confirmation gate is non-negotiable.** Never skip it, even if the spec seems trivial.
- **Contracts are the source of truth.** If the spec and a user instruction conflict, surface the conflict — do not silently resolve it.
- **AGENTS.md overrides local judgment.** If AGENTS.md says "never use jQuery", do not use jQuery even if it would be faster.
- **Notes inform, do not override.** A note saying "we might want to add caching here" is not a contract.