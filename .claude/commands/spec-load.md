# /spec-load
#
# Loads a spec into context and prepares for implementation.
# The WAIT step is mandatory — do not skip it under any circumstances.
#
# Usage: /spec-load <spec-id>
# Example: /spec-load freight-matching

You are about to implement a spec-driven task using SpecPact.
The spec-id you are working with is: **$ARGUMENTS**

Follow these steps exactly, in order. Do not skip any step.
Do not write any code until Step 5 explicitly tells you to wait for the developer.

---

## Step 1 — Determine the spec path

The spec file is at: `.sdd/specs/$ARGUMENTS/spec.md`

If this file does not exist:
- Output: `✗ No spec found at .sdd/specs/$ARGUMENTS/spec.md`
- Output: `Run .sdd/scripts/new-spec.sh to create it, or check the ID with .sdd/scripts/list-specs.sh`
- Stop. Do not proceed.

---

## Step 2 — Read all required context files

Read the following files **in this exact order**. Do not skip any.

**Always required:**
1. `.sdd/memory/AGENTS.md` — project conventions, stack, anti-patterns
2. `.sdd/specs/$ARGUMENTS/spec.md` — the feature contract you will implement

**Read the mode field from the spec front matter, then:**

If mode is `nano`:
- That is all. Proceed to Step 3.

If mode is `feature`:
- 3. `.sdd/memory/architecture.md` — service topology and boundaries
- 4. `.sdd/specs/$ARGUMENTS/notes.md` — if this file exists, read it. If it does not exist, skip silently.

If mode is `system`:
- 3. `.sdd/memory/architecture.md`
- 4. `.sdd/memory/decisions.md`
- 5. `.sdd/specs/$ARGUMENTS/notes.md` — if this file exists, read it. If it does not exist, skip silently.

If any **required** file (AGENTS.md, spec.md, architecture.md for feature/system, decisions.md for system) is missing:
- Output: `✗ Required file missing: [filename]`
- Output: `The .sdd/ directory may be incomplete. Do not proceed until the file exists.`
- Stop.

---

## Step 3 — Read the mode rules

Read the mode rules file that corresponds to this spec's mode:
- nano mode:    `.sdd/modes/nano.md`
- feature mode: `.sdd/modes/feature.md`
- system mode:  `.sdd/modes/system.md`

These rules govern how you must behave during implementation.
They override your defaults. The rules are numbered by priority — when they conflict, lower numbers win.

---

## Step 4 — Produce the context confirmation

Output **exactly** the following structure. Do not add commentary before it.
Do not begin implementation yet.

```
─────────────────────────────────────────
SpecPact: context loaded
─────────────────────────────────────────
Spec:    [title from spec front matter]
ID:      $ARGUMENTS
Mode:    [mode from spec front matter]
Status:  [status from spec front matter]

Intent (my understanding):
  [One sentence restating the feature's intent in your own words.
   Do not copy the spec text — paraphrase it.
   If you cannot restate it clearly, the spec's Intent section needs work.]

Contracts I will implement:
  1. [first contract item, verbatim from spec]
  2. [second contract item, verbatim from spec]
  [... all contract items listed]

Constraints I will respect:
  - [each constraint from the spec, verbatim]

Out of scope (I will not implement these):
  - [each out-of-scope item, verbatim]

Open questions that must be resolved before I start:
  [List any [ ] items from the Open questions section that are not checked off.]
  [If all are resolved or there are none: "None — ready to proceed."]

Files I have read:
  ✓ .sdd/memory/AGENTS.md
  ✓ .sdd/specs/$ARGUMENTS/spec.md
  [list other files read]
─────────────────────────────────────────
```

---

## Step 5 — WAIT FOR DEVELOPER CONFIRMATION

**This step is mandatory. You must not skip it.**

After outputting the context confirmation above, output this exact message and then stop:

```
⏸  Waiting for your confirmation before I write any code.

Please review the context confirmation above and tell me one of:
  → "correct, begin"      — everything is right, start implementing
  → "correct, begin phase 1" — (system mode) start the first phase only
  → [correction]          — if my understanding is wrong, tell me what to fix

I will not write any code until you respond.
```

Do not write any code. Do not begin any analysis of the codebase. Wait.

---

## Step 6 — After the developer confirms

Only proceed here after the developer has explicitly confirmed or corrected.

**If the developer said "correct, begin" (or equivalent):**

- If there are unresolved open questions: do not implement. Repeat the open questions and ask the first one.
- If there are no unresolved open questions: begin implementation following the mode rules in `.sdd/modes/[mode].md`

**If the developer corrected your understanding:**
- Acknowledge the correction
- Output an updated context confirmation (Step 4 format)
- Wait again (Step 5) — do not proceed without a second confirmation

**If the developer is in system mode and said "correct, begin phase 1":**
- Implement only Phase 1 from the migration path
- Stop after Phase 1 and output a phase completion summary
- Wait for "begin phase 2" before continuing

---

## Step 7 — Implementation completion

When implementation is complete, output the contract report specified in the mode rules file:
- nano:    the "Change contract verification" report format from `.sdd/modes/nano.md` Rule 7
- feature: the full contract report format from `.sdd/modes/feature.md` Rule 9
- system:  the full system report format from `.sdd/modes/system.md` Rule 10

End the report with:
```
Next step: run .sdd/scripts/verify.sh $ARGUMENTS
           then .sdd/scripts/update-spec.sh $ARGUMENTS [new-status]
```