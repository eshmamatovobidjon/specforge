---
id: fix-duplicate-spec-error-message
title: Improve duplicate spec ID error message
mode: nano
status: stable
created: 2026-02-14
updated: 2026-02-14
author: specpact-core
---

# Improve duplicate spec ID error message

## What & why
When `new-spec.sh` is called with an ID that already exists, it exits with
a generic "spec already exists" message. Developers do not know what to do
next — they must look up the docs to find the correct command. The error
message should tell them directly.

## Change contract
- [x] The duplicate ID error message includes the exact path of the existing spec folder
- [x] The error message ends with: "To update it, run: .sdd/scripts/update-spec.sh <id>"

## Scope boundary
- NOT changing: the exit code (stays 1)
- NOT changing: the duplicate detection logic itself
- NOT changing: any other error messages in new-spec.sh

## Verification
Run `.sdd/scripts/new-spec.sh feature new-spec-command` (a spec that already exists)
and confirm the output includes the existing path and the update-spec.sh suggestion.

---
<!-- Status flow: draft → in-progress → stable → deprecated -->