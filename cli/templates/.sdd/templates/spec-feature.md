---
id: [SPEC_ID]
title: [SPEC_TITLE]
mode: feature
status: draft
created: [SPEC_DATE]
updated: [SPEC_DATE]
author: [SPEC_AUTHOR]
---

# [SPEC_TITLE]

<!--
  FEATURE MODE — use this for: new user-facing or system-facing capabilities.
  Rule of thumb: a feature is something that, when complete, can be described as
  "users can now do X" or "the system now does Y".
  Target: this spec should be fully readable in under 3 minutes.
-->

## Intent
<!--
  Why does this feature exist? What problem does it solve and for whom?
  Write from the perspective of value — not implementation.
  2–4 sentences maximum. No technical details here.

  ✓ Good: "Carriers browsing YukHub need to find freight loads that match their
           route and capacity without reading every post manually."
  ✗ Bad:  "We need to build a GET endpoint that queries the freight_posts table."
-->



## Contracts
<!--
  What must be true when this feature is fully working?
  Each contract is an observable, testable outcome — not a task or a step.
  Write them as statements that are either true or false at any point in time.

  ✓ Good: "GET /api/v1/matches returns results ordered by match_score descending."
  ✗ Bad:  "Implement the matching algorithm and sort the results."

  Aim for 3–7 contracts. If you need more than 8, split this into two features.
  Use [ ] checkboxes — they will be used during verification.
-->
- [ ]
- [ ]
- [ ]


## Constraints
<!--
  Technical or product constraints the implementation must respect.
  These are non-negotiable. If a constraint makes clean implementation difficult,
  the developer must be told — not silently worked around.

  Examples:
  - "Rule-based scoring only — no ML model in this version."
  - "Read-only endpoint — no mutations allowed."
  - "Response time must be under 500ms for up to 1,000 active records."
-->
-


## Interfaces
<!--
  What does this feature expose or consume?
  List API endpoints, events published, queues consumed, or UI surfaces.
  Write signatures only — no implementation detail.
  If this feature neither exposes nor consumes an interface, write "Internal only."
-->

### Exposes
```
[METHOD] [PATH]
  [parameter or body description]
  [success response]
  [error response(s)]
```

### Consumes
```
[What external input does this feature read — event, queue, API call?]
```


## Data shape
<!--
  What are the key data structures this feature works with?
  List the essential fields and their types. Not every column — just the shape
  that matters for understanding the feature's behaviour.
  Use pseudocode notation — no need for actual language syntax here.
-->
```
[EntityName] {
  [field]: [type]   -- [brief note if not obvious]
}
```


## Out of scope
<!--
  What is this spec deliberately NOT covering?
  Be explicit. An omission here is an invitation for scope creep.
  At least two entries required — think about the obvious "next features" and list them here.
-->
-
-


## Open questions
<!--
  Unresolved decisions that would block a correct implementation.
  Every open question must be resolved before status changes to "in-progress".
  If there are none, write "None." — do not leave this section empty.

  Format: [ ] Question — who is responsible for resolving it?
-->
- [ ]

---
<!-- Status flow: draft → in-progress → stable → deprecated -->