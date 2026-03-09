---
id: new-spec-command
title: new-spec.sh — spec bootstrapping command
mode: feature
status: stable
created: 2026-01-10
updated: 2026-03-01
author: specpact-core
---

# new-spec.sh — spec bootstrapping command

## Intent
Developers starting a new piece of work need a way to create a correctly
structured spec without copying templates manually or remembering placeholder
formats. The `new-spec.sh` command bootstraps a spec folder from the right
template, stamps all front matter fields, and guides the developer on what
to do next — removing all friction from the start of a spec-driven workflow.

## Contracts
- [x] Running `.sdd/scripts/new-spec.sh <mode> <id>` creates `.sdd/specs/<id>/` with the correct files
- [x] An invalid mode (anything other than nano, feature, system) exits with code 1 and a clear error message
- [x] An invalid spec ID (not matching `^[a-z0-9]+(-[a-z0-9]+)*$`) exits with code 1 and a clear error message
- [x] A duplicate spec ID (folder already exists) exits with code 1 and suggests `update-spec.sh` instead
- [x] The created `spec.md` front matter contains: id, title, mode, status (draft), created, updated, author — all pre-filled
- [x] Nano mode creates only `spec.md`; feature and system modes create `spec.md` and `notes.md`
- [x] System mode front matter includes the `adr` field pre-filled with `ADR-[ADR_NUMBER]`
- [x] The command prints the path of each created file and the next step (how to load into AI tool)

## Constraints
- No runtime dependencies beyond Bash 3.2 and standard POSIX tools
- `sed` usage must be compatible with both BSD sed (macOS) and GNU sed (Linux) using the `-i.bak` pattern
- The script must resolve its own path via `${BASH_SOURCE[0]}` — no hardcoded paths
- `set -euo pipefail` must be present at the top of the script

## Interfaces

### Exposes
```
CLI: .sdd/scripts/new-spec.sh <mode> <spec-id>

Arguments:
  mode     — nano | feature | system
  spec-id  — kebab-case string matching ^[a-z0-9]+(-[a-z0-9]+)*$

Exit codes:
  0 — spec created successfully
  1 — invalid arguments, duplicate ID, or filesystem error

Stdout (success):
  ✓ New <mode> spec created: .sdd/specs/<id>/
  Files: [list of created files]
  Next step: how to load into AI tool

Stdout (error):
  ✗ [description of error]
  [how to fix it]
```

### Consumes
```
Templates: .sdd/templates/spec-<mode>.md
           .sdd/templates/notes.md (feature and system only)

Filesystem: .sdd/specs/ directory (must exist)
```

## Data shape
```
Placeholders replaced by sed:
  [SPEC_ID]     → the spec-id argument value
  [SPEC_TITLE]  → spec-id with hyphens replaced by spaces
  [SPEC_DATE]   → current date in YYYY-MM-DD format (both created and updated)
  [SPEC_AUTHOR] → left as [SPEC_AUTHOR] for developer to fill in
  [ADR_NUMBER]  → left as [ADR_NUMBER] for developer to fill in (system mode only)
```

## Out of scope
- Auto-detecting the correct mode from the task description (future CLI feature)
- Creating specs from a guided interview (that is the /spec-new Claude Code command)
- Populating spec content beyond front matter and template structure
- Git operations (branching, committing) — SpecPact does not manage git

## Open questions
- None.

---
<!-- Status flow: draft → in-progress → stable → deprecated -->