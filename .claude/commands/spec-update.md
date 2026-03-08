# /spec-update
#
# Brings spec.md in sync with what was actually implemented.
# Use this when the implementation diverged from the spec during development.
#
# Usage: /spec-update <spec-id>
# Example: /spec-update freight-matching
#
# When to use this command:
#   - /spec-verify reported "Spec needs updating"
#   - You added a parameter or changed a response shape during implementation
#   - A constraint turned out to be impractical and was modified
#   - New contracts were met that were not in the original spec
#
# When NOT to use this command:
#   - When code needs to be fixed to match the spec (use /spec-load instead)
#   - When the spec's intent or title is wrong (edit spec.md manually)
#   - When the feature is being significantly redesigned (write a new spec)

You are running a SpecForge spec sync for: **$ARGUMENTS**

This command brings `spec.md` in sync with what was actually built.
It does **not** change code. It only proposes edits to the spec file.

Follow these steps exactly.

---

## Step 1 — Load context

Read these files:
1. `.sdd/memory/AGENTS.md`
2. `.sdd/specs/$ARGUMENTS/spec.md`

If spec.md does not exist:
- Output: `✗ No spec found at .sdd/specs/$ARGUMENTS/spec.md`
- Stop.

---

## Step 2 — Inspect the current implementation

Examine the codebase to understand what was actually built.
Focus specifically on the areas covered by this spec — do not audit the entire codebase.

Look for:
- Actual API signatures vs declared interfaces in the spec
- Actual data shapes vs declared data shapes
- Behaviour that satisfies contracts not listed in the spec
- Constraints that were changed or relaxed during implementation
- Anything in the spec that was never implemented and should be removed

---

## Step 3 — Identify the differences

Build an internal list of every difference between spec.md and the implementation.
Categorise each difference as one of:

- **ADD_CONTRACT** — a contract is met but not documented in the spec
- **REMOVE_CONTRACT** — a contract is in the spec but the implementation does not meet it and never will (was intentionally dropped, not a bug)
- **UPDATE_INTERFACE** — an interface signature changed (different parameter, different response shape)
- **UPDATE_DATA_SHAPE** — a data structure changed
- **UPDATE_CONSTRAINT** — a constraint was relaxed, tightened, or made more specific
- **REMOVE_OUT_OF_SCOPE** — something listed as out-of-scope was actually implemented

Do **not** categorise these as differences:
- A contract that is unimplemented because it is a bug (that is a code issue, not a spec issue)
- A constraint that was violated (that is also a code issue)

---

## Step 4 — Present the proposed changes

If there are no differences: output:
```
✓ spec.md is already in sync with the implementation.
  No changes needed.
```
Then stop.

If there are differences, output:

```
─────────────────────────────────────────────────────────────────
SpecForge spec sync: $ARGUMENTS
─────────────────────────────────────────────────────────────────
I found [N] difference(s) between spec.md and the implementation.
─────────────────────────────────────────────────────────────────

Proposed changes to spec.md:
```

For each difference, show a clear before → after:

```
[N]. [CATEGORY] — [section name in spec.md]

  BEFORE:
    [exact current text in spec.md, or "not present"]

  AFTER:
    [proposed replacement text, or "remove this line"]

  Reason: [one sentence explaining why this change is correct]
```

Then output:

```
─────────────────────────────────────────────────────────────────
Rules I am following for these changes:
  ✓ Not changing the spec's intent or title
  ✓ Not removing contracts that are still met by the implementation
  ✓ Only adding contracts that are verifiably met
  ✓ Correcting interface signatures to match what was built
  ✓ Keeping the spec compact (must fit on one screen)
─────────────────────────────────────────────────────────────────

Apply these [N] change(s) to spec.md? 
Type "apply" to confirm, "skip [N]" to skip a specific change, or tell me what to adjust.
```

Wait for the developer's response before making any changes.

---

## Step 5 — Apply confirmed changes

Apply only the changes the developer confirmed.

For each applied change, edit spec.md directly.
Also update the `updated:` date in the front matter to today's date.

After applying all confirmed changes, output:

```
✓ spec.md updated — [N] change(s) applied.

Updated: [today's date]
Spec file: .sdd/specs/$ARGUMENTS/spec.md

Next steps:
  Review the updated spec.md to confirm it reads correctly.
  Then: .sdd/scripts/update-spec.sh $ARGUMENTS [new-status]
```

---

## Step 6 — What this command does not do

- It does not change status. Use `.sdd/scripts/update-spec.sh $ARGUMENTS [status]` for that.
- It does not delete notes.md. The `update-spec.sh` script handles that when you mark stable.
- It does not fix code. If code needs to match the spec, use `/spec-load $ARGUMENTS`.