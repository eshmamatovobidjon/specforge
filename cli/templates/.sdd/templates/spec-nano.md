---
id: [SPEC_ID]
title: [SPEC_TITLE]
mode: nano
status: draft
created: [SPEC_DATE]
updated: [SPEC_DATE]
author: [SPEC_AUTHOR]
---

# [SPEC_TITLE]

<!--
  NANO MODE — use this for: bug fixes, small tweaks, targeted refactors.
  Rule of thumb: if this change touches more than 3 files, it is probably a feature, not a nano.
  A completed nano spec should be readable in under 90 seconds.
-->

## What & why
<!--
  Two sentences maximum.
  Sentence 1: What is broken, missing, or suboptimal?
  Sentence 2: Why does it matter — what goes wrong if left unfixed?
  Do NOT describe the solution here. That belongs in the change contract below.
-->



## Change contract
<!--
  What must be true after this change is complete?
  Write each item as an observable, verifiable statement — not a task.
  ✓ Good: "The /health endpoint returns 200 when the database is reachable."
  ✗ Bad:  "Fix the health endpoint."
  Aim for 2–4 items. If you need more than 5, this is a feature, not a nano.
-->
- [ ]
- [ ]


## Scope boundary
<!--
  What is explicitly NOT being changed in this fix?
  This prevents scope creep and tells the AI what to leave alone.
  At least one entry is required.
-->
- NOT changing:


## Verification
<!--
  One sentence: how will you confirm this is done?
  This should be something you can check in under 2 minutes.
  Example: "Run the test suite and confirm no new failures on the /health endpoint tests."
-->


---
<!-- Status flow: draft → in-progress → stable → deprecated -->