# SpecPact: System Mode
# ─────────────────────────────────────────────────────────────────────────────
# This file defines how you operate when working on a system-mode spec.
# System mode is for: architectural changes, new services, data model overhauls,
# infrastructure changes, or any decision that affects multiple components.
# Rules are numbered by priority. When rules conflict, lower numbers win.
# ─────────────────────────────────────────────────────────────────────────────

## What system mode means

A system change modifies the structure of the system itself — not just its
behaviour. When it is done, architecture.md must be updated to reflect
the new reality. If architecture.md would not change, this is probably a
feature spec, not a system spec.

System changes are the highest-risk changes in the codebase. They must be
implemented in phases. No system spec should be implemented in a single pass.

---

## Rules (in priority order)

### Rule 1 — Load complete context before anything else
Before reading code or writing code, read ALL of these in order:
1. `.sdd/memory/AGENTS.md`
2. `.sdd/memory/architecture.md`
3. `.sdd/memory/decisions.md`
4. `.sdd/specs/[spec-id]/spec.md`
5. `.sdd/specs/[spec-id]/notes.md` (if it exists — skip silently if not)

Do not proceed until all five are read. Missing AGENTS.md, architecture.md,
or spec.md is a hard stop — tell the developer before doing anything else.

### Rule 2 — Confirm the decision rationale before acting
The spec references an ADR entry in decisions.md. Read that entry.
Then output:
- A one-paragraph restatement of the architectural decision in your own words
- Your understanding of the primary reason the decision was made
- The migration path you will follow, restated as numbered steps

Do not begin any implementation until the developer confirms your
restatement is correct. A misunderstood system decision is costly to reverse.

**When Rule 2 conflicts with Rule 1:** Rule 1 wins — load context first.

### Rule 3 — Work in phases — never attempt the full change in one pass
The spec defines a migration path. Follow it phase by phase. After each
phase, stop and confirm with the developer before proceeding to the next.

If the spec does not define phases, propose them before starting. A system
change without phases is a system change that cannot be safely reviewed.

**Each phase must leave the system in a working state.** If a phase would
leave the system broken mid-migration, redesign the phases before starting.

### Rule 4 — Guard every affected boundary
The spec lists affected components in its "Affected boundaries" table.
For each component listed:
- Identify all existing consumers of its current interface
- Confirm those consumers will not break after the change
- If a consumer would break, flag it before making the change

Do not change a component's interface without accounting for its consumers.
Silence here causes production incidents.

**When Rule 4 conflicts with Rule 3:** Rule 4 wins — a broken boundary
cannot be fixed by phases alone.

### Rule 5 — Treat constraints as absolute guardrails
The spec's "Constraints and non-negotiables" section defines what must
remain true throughout the entire migration — not just at the end.
If a phase would temporarily violate a constraint, redesign the phase.

### Rule 6 — Surface risks before they materialise
The spec lists known risks. As you implement, watch for those risks
becoming real. If a listed risk begins to materialise — or if you
discover a new risk not in the spec — stop and report it before continuing.

**When Rule 6 conflicts with Rule 3:** Rule 6 wins — surface the risk
before proceeding to the next phase.

### Rule 7 — Stay in scope
The "Out of scope" section is especially important in system mode. System
changes often reveal adjacent problems that feel urgent. They are not your
job in this spec. Note them in your completion summary. Do not act on them.

### Rule 8 — Resolve all open questions before Phase 1
System specs must have zero unresolved open questions before implementation
begins. If open questions remain, list them, ask the most critical one,
and wait. An unresolved question in a system spec means the decision is
not yet made — not that it can be decided during implementation.

### Rule 9 — Update architecture.md as a final step
When the full migration is complete, propose specific edits to
`.sdd/memory/architecture.md` to reflect the new state of the system.
Show the proposed changes clearly before applying them.

Do not update architecture.md during implementation — only after the
migration is complete and verified.

### Rule 10 — Complete with a full system report
When all phases are done, output:
```
System change report: [spec-id]

Contracts:
  1. [contract] → ✓ SATISFIED / ~ PARTIAL / ✗ NOT MET
     [cite evidence]

Phases completed:
  Phase 1: [description] → DONE
  Phase 2: [description] → DONE

Affected boundaries:
  [component]: interface changed as specified → YES / NO
  [component]: existing consumers verified   → YES / NO

architecture.md update proposed: YES — [summary of changes]
Recommended status: stable / needs more work
```