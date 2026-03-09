---
description: Guided interview to create a new SpecPact spec file without requiring shell script access.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). If a spec ID and mode are provided, skip the interview steps for those fields.

## Goal

Run a structured interview to gather the minimum required information for a new spec, then bootstrap the spec file at the correct path and populate it with the user's answers.

## Execution Steps

### 1. Determine Mode

Ask the user which mode applies to this change:

- **nano** — bug fix or small tweak (under ~50 lines changed, no new abstractions)
- **feature** — new capability or user-facing behaviour
- **system** — architectural change, new service boundary, or data model migration

If the user input already contains a mode, skip this question.

### 2. Collect Spec ID

Ask for a kebab-case spec ID that describes the work (e.g. `fix-null-carrier-id`, `user-auth-flow`, `migrate-to-postgres`).

If the user input already contains an ID, skip this question.

### 3. Run Mode-Appropriate Interview

#### Nano interview (5 questions)
1. What is the exact observable problem? (What does a user or system see that is wrong?)
2. What is the single file or function where the fix lives?
3. What is the exact expected outcome after the fix? (Be specific — error message text, status code, return value.)
4. What must NOT change as a result of this fix?
5. What is the one shell command or manual step that proves the fix works?

#### Feature interview (7 questions)
1. What user action or system event triggers this feature?
2. What is the primary outcome the user receives?
3. List up to 5 acceptance criteria. (Each should be independently verifiable.)
4. What are the non-functional requirements? (Performance budget, security constraints, accessibility level.)
5. What existing components or services does this feature touch?
6. What is explicitly out of scope for this spec?
7. What edge cases or failure modes must be handled?

#### System interview (9 questions)
1. What problem in the current architecture does this change solve?
2. What is the new structure or boundary being introduced?
3. Which existing services, modules, or data stores are affected?
4. What is the migration path from current state to target state?
5. What must remain unchanged for dependants of the affected components?
6. What are the rollback criteria if this change must be reverted?
7. What monitoring or observability must be in place before this ships?
8. What are the performance or scalability constraints on the new design?
9. List up to 3 architectural risks and their mitigations.

### 4. Derive Target Path

```
TARGET = .sdd/specs/<spec-id>/spec.md
```

Check whether `TARGET` already exists. If it does, warn the user and ask whether to overwrite or choose a new ID.

### 5. Select Template

Load the appropriate template from:

- Nano: `.sdd/templates/spec-nano.md`
- Feature: `.sdd/templates/spec-feature.md`
- System: `.sdd/templates/spec-system.md`

If the template file does not exist, output the spec inline using the structure below as a fallback:

```
# Spec: <spec-id>
mode: <mode>
status: draft
created: <YYYY-MM-DD>

## Problem
<answer from interview>

## Contracts
<numbered list of verifiable statements>

## Out of Scope
<explicit exclusions>

## Verification
<how to confirm the work is complete>
```

### 6. Populate and Write

Substitute interview answers into the template. Write the populated file to `TARGET`.

Confirm with the user: "Spec created at `TARGET`. Review it now, then run `/spec-load <spec-id>` when you are ready to implement."

### 7. Offer Next Step

Ask: "Would you like me to load this spec into context now with `/spec-load <spec-id>`?"

## Operating Principles

- **Never start coding** until the spec is written and the user has confirmed it is correct.
- **Ask one question at a time** if the user seems unfamiliar with SDD; batch all questions in one message if they are clearly experienced.
- **Do not infer answers** to interview questions — ask explicitly.
- **Spec IDs are permanent** — warn the user that renaming a spec after creation requires manual file moves.