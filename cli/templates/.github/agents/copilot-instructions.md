# GitHub Copilot Instructions
# ─────────────────────────────────────────────────────────────────────────────
# This file is loaded into every GitHub Copilot session in this project.
# It teaches Copilot to work within the SpecPact spec-driven workflow.
# ─────────────────────────────────────────────────────────────────────────────

## You are working in a SpecPact project

This project uses spec-driven development. Specifications in `.sdd/specs/` are
the source of truth for what should be built. Your role is to implement what
the spec says — not to interpret the task title or add what seems natural.

---

## Before implementing any task

**Step 1 — Check for a spec.**
Look in `.sdd/specs/` for a folder whose name matches the feature, fix, or
change you have been asked to implement. Spec IDs are kebab-case (e.g. `freight-matching`).

If a spec exists, read it before writing any code:
- `.sdd/specs/[spec-id]/spec.md` — the contract (always read this)
- `.sdd/specs/[spec-id]/notes.md` — implementation context (read if it exists)

**Step 2 — Read the Memory Bank.**
Always read `.sdd/memory/AGENTS.md` before writing code for this project.
For feature and architectural work, also read `.sdd/memory/architecture.md`.

**Step 3 — Read the mode rules.**
The spec's front matter contains a `mode` field: `nano`, `feature`, or `system`.
Read the corresponding rules file:
- `.sdd/modes/nano.md`
- `.sdd/modes/feature.md`
- `.sdd/modes/system.md`

These rules define how you must behave. The rules are prioritised — when they
conflict, lower-numbered rules take precedence.

---

## While implementing

**Implement against contracts, not the title.**
The spec's `Contracts` section (or `Change contract` for nano) defines what
must be true when the work is done. Satisfy those outcomes exactly.

**Respect the scope boundary.**
The spec's `Out of scope` or `Scope boundary` section lists things this spec
does not cover. Do not implement them, even partially. If you see a gap,
note it in your response — do not fill it.

**Respect constraints.**
The spec's `Constraints` section is non-negotiable. If a constraint makes a
clean implementation difficult, say so and wait for guidance. Do not work
around constraints silently.

**Match declared interfaces exactly.**
The spec's `Interfaces` section declares what is exposed and consumed.
Do not add undocumented endpoints, parameters, or response fields.

**Follow AGENTS.md conventions in all code.**
Every file you create or modify must follow the naming, structure, error
handling, and testing conventions in `.sdd/memory/AGENTS.md`.

---

## If no spec exists for the task

For a one-line fix or trivial change: proceed, but note that no spec covers this change.

For anything larger:
- Suggest creating a spec first: `.sdd/scripts/new-spec.sh [mode] [id]`
- Explain which mode is appropriate (nano / feature / system)
- Do not implement until the spec exists and is in `in-progress` status

---

## When your implementation is complete

For every task with a spec, output a brief contract check:

```
Contract check — [spec-id]:
  [✓/~/✗]  [contract item 1]
  [✓/~/✗]  [contract item 2]
  ...

Scope respected: yes / no
Constraints respected: yes / no
```

If anything is `~` or `✗`, describe what still needs to be done.

---

## Key files in this project

```
.sdd/memory/AGENTS.md          — Always read. Stack, conventions, anti-patterns.
.sdd/memory/architecture.md    — Read for feature/system work. Service topology.
.sdd/memory/decisions.md       — Read for system work. Why decisions were made.
.sdd/specs/[id]/spec.md        — The contract for the feature you are implementing.
.sdd/specs/[id]/notes.md       — Implementation context (ephemeral, may not exist).
.sdd/modes/nano.md             — Rules for nano-mode tasks.
.sdd/modes/feature.md          — Rules for feature-mode tasks.
.sdd/modes/system.md           — Rules for system-mode tasks.
.sdd/specs/_example/spec.md    — A complete example of a filled feature spec.
.sdd/specs/_example-nano/spec.md — A complete example of a filled nano spec.
```