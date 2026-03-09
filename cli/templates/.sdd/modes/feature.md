# SpecPact: Feature Mode
# ─────────────────────────────────────────────────────────────────────────────
# This file defines how you operate when working on a feature-mode spec.
# Feature mode is for: new user-facing or system-facing capabilities.
# Rules are numbered by priority. When rules conflict, lower numbers win.
# ─────────────────────────────────────────────────────────────────────────────

## What feature mode means

A feature change adds a capability that did not exist before. When it is
complete, something new is true about the system. The spec defines exactly
what that new truth is through its contracts.

Your job is to implement the contracts — not to interpret the title, not to
build what you think the feature should be, and not to add anything beyond
what the contracts specify.

---

## Rules (in priority order)

### Rule 1 — Load full context before touching anything
Before reading code or writing code, read these files in this exact order:
1. `.sdd/memory/AGENTS.md`
2. `.sdd/memory/architecture.md`
3. `.sdd/specs/[spec-id]/spec.md`
4. `.sdd/specs/[spec-id]/notes.md` (if it exists — skip silently if not)

Do not proceed until all available files are read. If AGENTS.md or spec.md
is missing, stop and tell the developer.

### Rule 2 — Restate intent and list contracts before acting
After reading all context, output:
- A one-sentence restatement of the feature's intent in your own words
- A numbered list of the contracts you will implement
- Any open questions from the spec that are not yet resolved

Do not begin implementation until the developer confirms your restatement
is correct and all open questions are resolved.

**When Rule 2 conflicts with Rule 1:** Rule 1 wins — always load context first.

### Rule 3 — Implement against contracts, not against the title
The spec's "Contracts" section defines what must be true when you are done.
Implement to satisfy those specific, observable outcomes. If a contract is
ambiguous, ask one clarifying question — do not guess.

If you find yourself doing work that satisfies none of the contracts, stop.
You may be building something that was not requested.

### Rule 4 — Respect declared interfaces exactly
The spec's "Interfaces" section defines what this feature exposes and consumes.
Implement those signatures exactly as written. Do not:
- Add undocumented endpoints or parameters
- Change a response shape from what the spec defines
- Publish events or write to queues not listed in the spec
- Consume inputs not listed in the spec

**When Rule 4 conflicts with Rule 3:** Rule 3 wins — contracts define correctness;
interfaces define the surface. If they conflict, flag it.

### Rule 5 — Treat constraints as non-negotiable
The spec's "Constraints" section lists rules the implementation must respect.
These are not suggestions. If a constraint makes a clean implementation
difficult, do not work around it silently — tell the developer what the
tension is and wait for guidance.

### Rule 6 — Out of scope means stop
The spec's "Out of scope" section lists things this feature deliberately
does not include. Do not implement those things partially, optionally, or
"just to lay the groundwork." If you see a natural extension that seems
obviously needed, mention it in your completion summary so it becomes its
own spec.

**When Rule 6 conflicts with Rule 3:** Rule 6 wins — staying out of scope
takes priority over being helpful beyond the contracts.

### Rule 7 — Follow AGENTS.md conventions in all code written
Every file you touch or create must follow the naming, structure, error
handling, and testing conventions in AGENTS.md. If you are uncertain whether
a convention applies, apply it and note the assumption.

### Rule 8 — Resolve all open questions before writing code
If the spec has unresolved open questions, do not begin implementation.
List the unresolved questions, ask the most important one, and wait for
the answer before continuing.

### Rule 9 — Complete with a full contract report
When implementation is done, output a structured report:
```
Contract verification:
  1. [contract] → ✓ SATISFIED — [cite file:line or function name]
                  ~ PARTIAL   — [what is missing]
                  ✗ NOT MET   — [what needs to be done]

Constraints respected: YES / NO — [if NO, explain each violation]
Out of scope respected: YES / NO — [if NO, explain what was added and why]
Open questions resolved: YES / NO — [list any that remain]
Recommended status: in-progress → stable / needs more work
```