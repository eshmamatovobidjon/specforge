# /spec-new
#
# Guided interview to create a new spec.
# Asks targeted questions and writes spec.md directly — no shell scripts required.
#
# Usage: /spec-new
# (No arguments — the interview collects everything needed)

You are running the SpecPact spec creation interview.
Your job is to ask focused questions, collect the developer's answers, and
write a complete, valid spec.md file to the correct location.

Do not write any code. Do not implement anything.
This command creates a specification only.

---

## Phase 1 — Determine mode

Ask this question first. Wait for the answer before asking anything else.

```
What kind of change is this?

  nano    — bug fix, small tweak, or targeted refactor (touches ≤ 3 files)
  feature — new user-facing or system-facing capability
  system  — architectural change, new service, or data model overhaul

  Rule of thumb:
    nano:    "something is broken or suboptimal — I need to fix it"
    feature: "users/the system will be able to do something new"
    system:  "the structure of how the system works is changing"

Type: nano / feature / system
```

Wait for the answer. Record it as MODE.

---

## Phase 2 — Collect the spec ID

Ask:

```
Give this spec a kebab-case ID.

Rules:
  • Lowercase letters, numbers, and hyphens only
  • Must start and end with a letter or number
  • Should describe the change, not the ticket number

Examples:
  fix-null-carrier-id
  freight-matching
  collector-v2-architecture

Spec ID:
```

Wait for the answer. Validate it matches `^[a-z0-9]+(-[a-z0-9]+)*$`.

If the ID is invalid, explain why and ask again. Do not continue with an invalid ID.

Check whether `.sdd/specs/[id]/spec.md` already exists.
If it does, output:
```
✗ A spec with that ID already exists at .sdd/specs/[id]/spec.md
  To update it, use: /spec-update [id]
  Or choose a different ID.
```
Then ask for a new ID.

Record the valid ID as SPEC_ID.

---

## Phase 3 — Mode-specific interview

Run the interview section that matches MODE. Ask one question at a time.
Wait for each answer before asking the next.

### If MODE is nano:

**Question N1:**
```
What is broken, missing, or suboptimal?
And why does it matter — what goes wrong if it stays this way?

(Two sentences maximum. Describe the problem, not the solution.)
```
Record as NANO_WHAT_WHY.

**Question N2:**
```
What must be true after this change is complete?
Write 2–4 observable statements — things that are either true or false.

✓ Good: "The /health endpoint returns 200 when the database is reachable."
✗ Bad:  "Fix the health endpoint."

List them one per line:
```
Record as NANO_CONTRACTS (list).

**Question N3:**
```
What is explicitly NOT being changed?
(This prevents scope creep. At least one item required.)

List them as: "NOT changing: [what]"
```
Record as NANO_SCOPE_BOUNDARY (list).

**Question N4:**
```
How will you verify this is done?
(One sentence. Should be checkable in under 2 minutes.)
```
Record as NANO_VERIFICATION.

### If MODE is feature:

**Question F1:**
```
Why does this feature exist — what problem does it solve and for whom?
Write from the perspective of value, not implementation. 2–4 sentences maximum.

✓ Good: "Carriers browsing YukHub need to find freight loads that match
         their route without reading every post manually."
✗ Bad:  "We need to build a GET /matches endpoint."
```
Record as FEATURE_INTENT.

**Question F2:**
```
What must be true when this feature is fully working?
Write 3–7 observable, testable outcomes — not tasks.

Each should be a statement that is either true or false at any moment.

✓ Good: "GET /api/v1/matches returns results ordered by match_score descending."
✗ Bad:  "Implement the sorting logic."

If you have more than 8, the feature is too large — split it.
List them one per line:
```
Record as FEATURE_CONTRACTS (list).

**Question F3:**
```
What technical or product constraints must the implementation respect?
These are non-negotiable rules the AI must not work around silently.

Examples:
  - "Rule-based scoring only — no ML in this version."
  - "Read-only — no mutations."
  - "Response time < 500ms for 1,000 records."

List them (or say "None" if there are no constraints):
```
Record as FEATURE_CONSTRAINTS (list).

**Question F4:**
```
What interface does this feature expose or consume?

Expose: API endpoints, events published, UI surfaces
Consume: external inputs, queues read, APIs called

Write just the signatures — no implementation detail.
If internal only, say "Internal only."
```
Record as FEATURE_INTERFACES.

**Question F5:**
```
What are the key data structures this feature works with?
List the essential fields and types — not every column.

Example:
  FreightMatch { freight_id: UUID, origin: string, match_score: float }

(Or say "None" if no new data structures are involved.)
```
Record as FEATURE_DATA_SHAPE.

**Question F6:**
```
What is explicitly OUT OF SCOPE for this spec?
Think: what are the obvious "next features" someone might try to add?
At least two items required.

List them:
```
Record as FEATURE_OUT_OF_SCOPE (list).

**Question F7:**
```
Are there any unresolved questions that would block a correct implementation?
These must be answered before work can begin.

Format each as: "[ ] Question — who resolves it?"

(Or say "None" if everything is clear.)
```
Record as FEATURE_OPEN_QUESTIONS.

### If MODE is system:

**Question S1:**
```
What is the current state of the system, and why is it no longer sufficient?
What situation or constraint is forcing this architectural change?
(One honest paragraph.)
```
Record as SYSTEM_CONTEXT.

**Question S2:**
```
What architectural change is being made?
One paragraph describing WHAT is changing — not how it will be implemented.
```
Record as SYSTEM_DECISION.

**Question S3:**
```
What system-level guarantees must hold after this change?
Write 3–5 contracts (cross-component guarantees, availability, consistency).

List them:
```
Record as SYSTEM_CONTRACTS (list).

**Question S4:**
```
Which components are affected? For each, what changes?

Format as:
  Component name | Before state | After state

(One row per affected component.)
```
Record as SYSTEM_BOUNDARIES (table rows).

**Question S5:**
```
How do we migrate from the current state to the target state safely?
Break it into numbered phases. Each phase must leave the system working.
Maximum 5 phases.

(Or say "Greenfield — no migration required.")
```
Record as SYSTEM_MIGRATION (numbered list).

**Question S6:**
```
What must remain true throughout the entire migration?
(Performance floors, backward compatibility, data integrity.)

List them:
```
Record as SYSTEM_CONSTRAINTS (list).

**Question S7:**
```
What could go wrong? For each risk: how likely, and what is the mitigation?

Format as:
  Risk | Likelihood (low/medium/high) | Mitigation
```
Record as SYSTEM_RISKS (table rows).

**Question S8:**
```
What architectural concerns are deliberately deferred to a future spec?
```
Record as SYSTEM_OUT_OF_SCOPE (list).

**Question S9:**
```
What ADR number should this decision be recorded as?
(Check .sdd/memory/decisions.md for the next available number.)

ADR number:
```
Record as SYSTEM_ADR_NUMBER.

**Question S10:**
```
Are there unresolved questions that must be answered before Phase 1 begins?
These are hard blockers — system specs must not start with open questions.

(Or say "None.")
```
Record as SYSTEM_OPEN_QUESTIONS.

---

## Phase 4 — Confirm before writing

Before creating any files, present a one-paragraph summary of the spec:

```
Here is what I am about to write:

  ID:    [SPEC_ID]
  Mode:  [MODE]
  Title: [derived from SPEC_ID]

  [2–3 sentence summary of the spec content]

Shall I create .sdd/specs/[SPEC_ID]/spec.md with this content?
Type "yes" to confirm, or tell me what to change.
```

Wait for confirmation. If the developer requests changes, update your understanding and confirm again before writing.

---

## Phase 5 — Write the spec files

Once confirmed, write the files as follows.

**For all modes — write `.sdd/specs/[SPEC_ID]/spec.md`:**

Use today's date for `created` and `updated` (YYYY-MM-DD format).
Set `status: draft`.
Set `author: [SPEC_AUTHOR]` — leave as the literal placeholder; the developer will fill it in.

Fill in all sections with the answers collected in Phase 3.
For list items, format each as `- [ ] [item]` in Contracts/Change contract/Open questions sections.
For other sections, format as `- [item]`.
Remove the HTML comment blocks (`<!-- ... -->`) from the template — replace them with actual content.
Keep the inline comment at the bottom: `<!-- Status flow: draft → in-progress → stable → deprecated -->`

**For feature and system modes — also write `.sdd/specs/[SPEC_ID]/notes.md`:**

Use the template structure from `.sdd/templates/notes.md`.
Stamp `[SPEC_ID]` with the actual spec ID.
Leave all sections empty (the developer fills in notes.md — you do not have that information yet).

Do not run any shell scripts to do this. Write the files directly.

---

## Phase 6 — Confirm creation and give next steps

After writing the files, output:

```
✓ Spec created: .sdd/specs/[SPEC_ID]/spec.md
[✓ Notes file:  .sdd/specs/[SPEC_ID]/notes.md]  (feature/system only)

Before you start implementing:
  [if nano]    → Review the spec, then: /spec-load [SPEC_ID]
  [if feature] → Fill in author in spec.md
                 Resolve any open questions
                 Then: /spec-load [SPEC_ID]
  [if system]  → Fill in author in spec.md
                 Add ADR-[number] entry to .sdd/memory/decisions.md
                 Resolve all open questions (system specs must have none)
                 Then: /spec-load [SPEC_ID]

Status: draft
To change status: .sdd/scripts/update-spec.sh [SPEC_ID] in-progress
```