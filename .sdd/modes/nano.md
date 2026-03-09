# SpecPact: Nano Mode
# ─────────────────────────────────────────────────────────────────────────────
# This file defines how you operate when working on a nano-mode spec.
# Nano mode is for: bug fixes, small tweaks, targeted refactors.
# Rules are numbered by priority. When rules conflict, lower numbers win.
# ─────────────────────────────────────────────────────────────────────────────

## What nano mode means

A nano change is small, focused, and leaves the codebase structurally unchanged.
If you find yourself wanting to improve architecture, refactor broadly, or add
functionality beyond the scope boundary — stop. That is a different spec.

---

## Rules (in priority order)

### Rule 1 — Load context before touching anything
Before reading any code or writing any code, read these files in order:
1. `.sdd/memory/AGENTS.md`
2. The spec file for this task: `.sdd/specs/[spec-id]/spec.md`

Do not proceed until you have read both. If either file is missing, stop and
tell the developer what is missing.

### Rule 2 — Restate the change contract before acting
After reading the spec, output the change contract items as a numbered list
in your own words. Do not begin implementation until the developer confirms
your restatement is correct.

If any contract item is ambiguous, ask one clarifying question before proceeding.
Ask only one question at a time. Do not proceed with ambiguous contracts.

### Rule 3 — Respect the scope boundary absolutely
The spec's "Scope boundary" section lists what must NOT change. Treat these
as hard stops. Do not modify those areas even if you see a problem there.
If you notice a real issue in an out-of-scope area, mention it in your
completion summary so it can become its own nano spec.

### Rule 4 — Follow existing patterns — do not introduce new ones
Nano changes must match the patterns already in the codebase. Look at
adjacent code before writing. If there is an established way to do something,
use it — even if you would design it differently.

**When Rule 4 conflicts with Rule 1:** Rule 1 wins — always load context first.
**When Rule 4 conflicts with Rule 3:** Rule 3 wins — scope boundary is absolute.

### Rule 5 — Stay small
A nano change should touch at most 3 files. If you find yourself needing
to change more than 3 files, stop and tell the developer. The change may
have been misclassified as nano when it is actually a feature.

### Rule 6 — Do not touch tests unless the spec says so
Do not add, remove, or modify tests unless explicitly listed in the change
contract. If a test fails because of your change, report it — do not fix
it silently, as silent test fixes expand scope.

**Exception:** If the spec's verification section explicitly requires a test
to be written or updated, do so — that is within scope.

### Rule 7 — Complete with a contract report
When implementation is done, output a brief report:
```
Change contract verification:
  1. [contract item 1] → DONE / NOT DONE — [one line explanation]
  2. [contract item 2] → DONE / NOT DONE — [one line explanation]

Files changed: [list of files]
Scope boundary respected: YES / NO — [if NO, explain]
```

Do not mark a contract item as DONE if you are not certain it is satisfied.