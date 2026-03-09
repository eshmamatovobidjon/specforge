---
description: Audit the codebase against a spec's contracts and output a structured verification report with a pass/partial/fail/unknown verdict per contract.
---

## User Input

```text
$ARGUMENTS
```

The first argument is the **spec ID** (required). Example: `user-auth-flow`.

## Goal

Produce an honest, contract-by-contract audit of whether the current implementation satisfies the spec. This command is **read-only** — it never modifies files. The verdict is AI-generated; the human decides whether to mark the spec stable.

## Execution Steps

### 1. Resolve and Load Paths

```
SPEC    = .sdd/specs/<spec-id>/spec.md
NOTES   = .sdd/specs/<spec-id>/notes.md  (optional)
AGENTS  = .sdd/memory/AGENTS.md
```

If `SPEC` does not exist, abort with:

> "No spec found at `.sdd/specs/<spec-id>/spec.md`. Cannot verify."

Read `spec.md` fully. Extract every numbered contract from the **Contracts** section.

### 2. Locate Implementation Artefacts

From the spec's **Contracts** and **Files Touched** sections (if present), identify which files to inspect. Also scan:

- Any file path mentioned verbatim in the spec
- Any component, function, or module name mentioned in the contracts
- Test files related to the above

Do not audit the entire codebase — focus on what the spec defines as in scope.

### 3. Audit Each Contract

For each contract, assign one verdict:

| Symbol | Meaning |
|--------|---------|
| ✓ | **PASS** — Implementation clearly satisfies the contract. Cite the exact file and line range. |
| ~ | **PARTIAL** — Implementation partially satisfies the contract. Describe what is missing. |
| ✗ | **FAIL** — Implementation does not satisfy the contract, or the contract is contradicted. Describe the gap. |
| ? | **UNKNOWN** — Cannot determine from available code (e.g. runtime behaviour, external dependency). Describe why. |

### 4. Check AGENTS.md Compliance

Review the implementation against the constraints in `AGENTS.md`. Report any violations as additional findings separate from the contract audit.

### 5. Output Verification Report

Produce a Markdown report in this format:

---

## Verification Report: `<spec-id>`

**Date:** `<YYYY-MM-DD>`
**Mode:** `<nano | feature | system>`

### Contract Audit

| # | Contract | Verdict | Evidence / Notes |
|---|----------|---------|-----------------|
| 1 | <contract text> | ✓ | `src/auth.ts:42–67` — token validation matches spec |
| 2 | <contract text> | ~ | Partial: happy path works; error branch missing |
| 3 | <contract text> | ✗ | Not implemented. No handler found for 401 case. |
| 4 | <contract text> | ? | Requires runtime test — cannot verify statically. |

### AGENTS.md Compliance

| Constraint | Status | Notes |
|-----------|--------|-------|
| <constraint> | ✓ Compliant | |
| <constraint> | ✗ Violation | `src/legacy.js` uses jQuery (prohibited) |

### Summary

- **Contracts:** X total — Y pass, Y partial, Y fail, Y unknown
- **AGENTS.md:** X constraints checked — Y compliant, Y violations
- **Overall verdict:** `PASS` / `PARTIAL` / `FAIL`

### Next Steps

<If PASS>
All contracts satisfied. Run `/spec-update <spec-id> stable` to mark this spec stable and remove `notes.md`.

<If PARTIAL or FAIL>
Resolve the following before marking stable:
- Contract N: <specific action required>
- Contract N: <specific action required>

Re-run `/spec-verify <spec-id>` after addressing the gaps.

---

## Operating Principles

- **Read-only.** Never modify any file during verification.
- **Cite evidence.** Every ✓ verdict must reference a file and line range. Unsupported ✓ verdicts are not permitted.
- **Be conservative with ✓.** When in doubt between ✓ and ~, choose ~.
- **? is honest.** Use it freely for runtime behaviour, network calls, or anything not statically verifiable.
- **Human decides stable.** The report is input to a human judgement — do not automatically update spec status.