---
id: [SPEC_ID]
title: [SPEC_TITLE]
mode: system
status: draft
created: [SPEC_DATE]
updated: [SPEC_DATE]
author: [SPEC_AUTHOR]
adr: ADR-[ADR_NUMBER]
---

# [SPEC_TITLE]

<!--
  SYSTEM MODE — use this for: new services, architectural changes, data model overhauls,
  significant infrastructure changes, or decisions that affect multiple components.

  Rule of thumb: if this change requires updating architecture.md when it is done,
  it is a system spec. Write the corresponding ADR entry in decisions.md in parallel.

  Target: this spec should be readable in under 5 minutes. If it is longer,
  the change is too broad — break it into phases.
-->


## Context
<!--
  What is the current state of the system, and why is it no longer sufficient?
  What situation, growth, or constraint is forcing this architectural change?
  One paragraph. Be honest about the problem — not just the solution.
-->



## Decision
<!--
  What architectural change is being made?
  One clear paragraph describing WHAT is changing — not HOW it will be implemented.
  The "how" belongs in the migration path below.
-->



## Contracts
<!--
  System-level guarantees that must hold after this change is complete.
  Focus on guarantees that span components or affect the whole system.
  Think: availability, consistency, backward compatibility, performance.

  3–5 contracts. Use [ ] checkboxes for verification.
-->
- [ ]
- [ ]
- [ ]


## Affected boundaries
<!--
  Which components change as a result of this decision?
  For each: what is different before vs after.
  The "After" column describes the target state — not the steps to get there.
-->

| Component | Before | After |
|---|---|---|
| [component name] | [current state] | [target state] |


## Migration path
<!--
  How do we move from the current state to the target state safely?
  Break it into numbered phases. Each phase should be independently deployable
  and leave the system in a working state.

  Maximum 5 phases. If you need more, this change is too large.
  If it is a greenfield (nothing to migrate), write "Greenfield — no migration required."
-->

1. [Phase 1: what is done, what is the system state after this phase]
2. [Phase 2: ...]


## Constraints and non-negotiables
<!--
  What must remain true throughout the migration?
  Performance floors, backward compatibility guarantees, data integrity requirements.
  These are the guardrails the implementation cannot cross.
-->
-


## Risks
<!--
  What could go wrong? For each risk: how likely, and what is the mitigation?
  Do not list hypothetical risks — only risks that are realistic given this change.
-->

| Risk | Likelihood | Mitigation |
|---|---|---|
| [risk description] | low / medium / high | [how it is mitigated] |


## Out of scope
<!--
  Architectural concerns that are deliberately deferred to a future system spec.
  Be explicit — if it is not listed here, the implementation may attempt it.
-->
-


## Open questions
<!--
  Must be resolved before status changes to "in-progress".
  Unresolved system-mode specs must not be implemented.
  Format: [ ] Question — who resolves it and by when?
-->
- [ ]

---
<!-- Status flow: draft → in-progress → stable → deprecated -->
<!-- Remember: update decisions.md (ADR-[ADR_NUMBER]) in parallel with this spec. -->
<!-- Remember: update architecture.md when this spec reaches stable. -->