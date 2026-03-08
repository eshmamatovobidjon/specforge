---
description: Propose edits to spec.md when the implementation has legitimately diverged from the original spec, keeping the spec honest as a living contract.
---

## User Input

```text
$ARGUMENTS
```

The first argument is the **spec ID** (required). An optional second argument may be a new status value: `draft | in-progress | stable | deprecated`.

## Goal

Keep the spec honest. When implementation diverges from the original spec — because of a discovered constraint, a better approach found during coding, or a deliberate scope change — this command proposes the minimal edits required to bring the spec back into alignment. It never silently overwrites the original intent; all changes are shown as a diff and require explicit user approval.

## Execution Steps

### 1. Resolve Paths

```
SPEC    = .sdd/specs/<spec-id>/spec.md
NOTES   = .sdd/specs/<spec-id>/notes.md  (optional)
```

If `SPEC` does not exist, abort with:

> "No spec found at `.sdd/specs/<spec-id>/spec.md`."

### 2. Load Current State

Read `spec.md` in full. Read `notes.md` if present (ephemeral context may explain known divergences).

### 3. Inspect Implementation

Identify the relevant implementation files from the spec's **Contracts** and **Files Touched** sections. Read the current state of those files.

### 4. Detect Divergences

Compare the implementation against each contract. Identify:

- **Additions** — behaviour implemented but not in the spec (may need a new contract)
- **Modifications** — behaviour differs from spec in a legitimate, intentional way
- **Removals** — a contract was dropped or deferred
- **Status change only** — no contract changes, user just wants to update status

### 5. Propose Edits

For each divergence, propose the minimal spec edit as an explicit diff block. Never rewrite sections wholesale.

Format:

---

## Proposed Spec Updates: `<spec-id>`

### Change 1 — <short description>

**Reason:** <Why the spec needs to change — what was discovered or decided>

```diff
- Original contract text
+ Updated contract text
```

### Change 2 — <short description>

**Reason:** <…>

```diff
- …
+ …
```

### Status Change (if applicable)

Proposed new status: `<status>`
Reason: <Why this status is appropriate now>

---

**Apply these changes?** Reply `yes` to apply, `no` to discard, or describe edits you want to make to the proposal.

---

### 6. Wait for Approval

Do **not** modify `spec.md` until the user confirms. If the user modifies the proposal, incorporate their changes and show the revised diff before applying.

### 7. Apply Approved Changes

Once confirmed, apply the approved diff to `spec.md` only. Do not modify any implementation files.

If the status changed to `stable`, also offer:

> "`notes.md` exists. Delete it now that the spec is stable? Reply `yes` to delete."

Confirm after each file operation.

## Operating Principles

- **Specs are honest records.** A spec that no longer matches the code is worse than no spec.
- **Minimal edits only.** Propose the smallest change that makes the spec accurate — do not use this as an opportunity to restructure or improve phrasing.
- **Never auto-apply.** All changes require explicit user approval, even obvious ones.
- **Preserve original intent.** If a contract was changed, the diff must show what was removed, not just what was added.
- **Deprecation is permanent.** If the user wants to mark a spec `deprecated`, confirm that this means the feature has been removed. Deprecated specs are never deleted.