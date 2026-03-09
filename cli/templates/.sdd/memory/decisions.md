# decisions.md
# ─────────────────────────────────────────────────────────────────────────────
# PURPOSE
# A running log of significant architectural and technical decisions.
# Each entry records what was decided, why, and what trade-offs were accepted.
#
# This file prevents the team from relitigating past decisions and helps the AI
# understand the reasoning behind choices that might otherwise look arbitrary.
#
# WHEN TO ADD AN ENTRY
# Add an ADR whenever a decision:
#   • Affects multiple parts of the codebase
#   • Involves a real trade-off between viable alternatives
#   • Is likely to be questioned or reconsidered in the future
#   • Involves a technology choice, pattern adoption, or architectural boundary
#
# WHEN NOT TO ADD AN ENTRY
# Do not add ADRs for:
#   • Implementation details that don't affect other components
#   • Obvious choices with no real alternatives
#   • Decisions that are fully captured in a spec
#
# STATUS VALUES
#   accepted    — the decision stands and is in effect
#   superseded  — replaced by a later ADR (reference it)
#   deprecated  — no longer applicable (note why)
#
# UPDATE CADENCE
# Add an entry immediately when a significant decision is made.
# Review existing entries when starting a system-mode spec.
# ─────────────────────────────────────────────────────────────────────────────

## ADR template
<!-- Copy this block for each new decision. Number sequentially. -->

<!--
## ADR-NNN | YYYY-MM-DD | [Decision title]
**Status:** accepted

**Context:**
[What situation, problem, or constraint forced this decision?
 What were the competing options? 1–3 sentences.]

**Decision:**
[What was chosen, in one clear sentence.]

**Reasons:**
- [Reason 1]
- [Reason 2]

**Trade-offs accepted:**
- [What is worse because of this decision, and why that is acceptable]

**Consequences:**
- [What else changes as a result of this decision]
-->

---

<!-- Add your first ADR below this line. -->
<!-- Example entry shown — replace with your own. -->

## ADR-001 | [YYYY-MM-DD] | [Your first decision title]
**Status:** accepted

**Context:**
[Describe the situation that led to this decision.]

**Decision:**
[What was decided.]

**Reasons:**
- [Why this was the right choice]

**Trade-offs accepted:**
- [What was given up or made harder]