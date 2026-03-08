# /spec-verify
#
# Audits the current codebase against a spec's contracts.
# This is an inspection task only — no code is written.
#
# Usage: /spec-verify <spec-id>
# Example: /spec-verify freight-matching

You are running a SpecForge verification audit for spec: **$ARGUMENTS**

This is a **read-only audit**. You must not write, modify, or delete any code or files.
Your only output is an honest assessment of whether the implementation matches the spec.

Follow these steps exactly, in order.

---

## Step 1 — Locate and read the spec

Read: `.sdd/specs/$ARGUMENTS/spec.md`

If this file does not exist:
- Output: `✗ No spec found at .sdd/specs/$ARGUMENTS/spec.md`
- Output: `Check available specs with: .sdd/scripts/list-specs.sh`
- Stop.

Also read: `.sdd/memory/AGENTS.md`

If a `notes.md` exists at `.sdd/specs/$ARGUMENTS/notes.md`, read it too.

---

## Step 2 — Extract what you are auditing

From the spec, identify and list internally:
- All items in the **Contracts** section (feature/system) or **Change contract** section (nano)
- All items in the **Constraints** section (or **Constraints and non-negotiables** for system)
- The **Interfaces** declared (feature/system)
- The **Out of scope** items
- Any **Open questions** that were not checked off

---

## Step 3 — Inspect the codebase

Without writing any code, examine the codebase to determine the implementation state.

For **each contract item**, find the evidence:
- Which file and function/line satisfies it (if satisfied)?
- What is missing or incorrect (if not satisfied)?
- Is it something that cannot be determined from static inspection alone?

For **each constraint**, check:
- Does the implementation respect it?
- Is there any code that violates it?

For **each declared interface**:
- Does the actual implementation match the declared signature?
- Are there undocumented parameters, response fields, or side effects?

---

## Step 4 — Output the audit report

Output the following structure exactly. Do not add narrative before it.

```
─────────────────────────────────────────────────────────────────
SpecForge verification: $ARGUMENTS
─────────────────────────────────────────────────────────────────
Spec:    [title]
Mode:    [mode]
Status:  [current status]
─────────────────────────────────────────────────────────────────

CONTRACT AUDIT
──────────────
```

For **each contract item**, output one line in this exact format:
```
[symbol]  [contract text]
          [evidence or explanation — file:line or function name if satisfied]
```

Where symbol is one of:
- `✓` — SATISFIED: fully and correctly implemented
- `~` — PARTIAL: implemented but incomplete or incorrect in a specific way
- `✗` — NOT MET: not implemented, or the implementation is wrong
- `?` — UNVERIFIABLE: cannot be determined from static code inspection alone

Then output:

```
CONSTRAINT CHECK
────────────────
```

For each constraint, output:
```
✓ / ✗  [constraint text]
        [explanation if violated]
```

Then output:

```
INTERFACE AUDIT
───────────────
```

For each declared interface item:
```
✓ / ~ / ✗  [interface name or endpoint]
            [actual vs declared if they differ]
```

Then output:

```
UNDOCUMENTED BEHAVIOUR
──────────────────────
```

List any implementation that exists but is **not described in the spec**. These are either:
- Scope creep that should be removed
- Legitimate additions that should be added to the spec

Format each as:
```
  [file:line or function]  — [description of undocumented behaviour]
```

If none found, write: `None found.`

Then output:

```
OPEN QUESTIONS STATUS
─────────────────────
```

For each open question in the spec:
```
[ ] [question] — still unresolved
[x] [question] — resolved (evidence: [how])
```

If there were no open questions, write: `No open questions in this spec.`

Then output the recommendation:

```
─────────────────────────────────────────────────────────────────
RECOMMENDATION
─────────────────────────────────────────────────────────────────
```

Choose exactly one:

**If all contracts are ✓ and no constraint violations and no significant undocumented behaviour:**
```
→ Ready for stable
  All contracts satisfied. No violations found.
  Run: .sdd/scripts/update-spec.sh $ARGUMENTS stable
```

**If any contracts are ✗ or ~ or constraints are violated:**
```
→ Needs work before stable
  Required before marking stable:
    1. [specific thing that must be fixed]
    2. [specific thing that must be fixed]
  Re-run /spec-verify $ARGUMENTS after fixing.
```

**If the implementation is correct but diverged from the spec (undocumented behaviour, changed interfaces):**
```
→ Spec needs updating
  The implementation is functionally complete but spec.md no longer reflects
  what was built. Update the spec before marking stable:
  Use: /spec-update $ARGUMENTS
```

**If both code work is needed AND spec needs updating:**
```
→ Needs work + spec update required
  Code issues: [list]
  Spec issues: [list]
```

```
─────────────────────────────────────────────────────────────────
```

---

## Step 5 — Do not suggest code changes

You may describe what is wrong. You must not write the fix.
If the developer wants to fix a failing contract, they should use `/spec-load $ARGUMENTS`
which will re-implement under the spec's constraints.