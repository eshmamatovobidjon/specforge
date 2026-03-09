# AGENTS.md
# ─────────────────────────────────────────────────────────────────────────────
# PURPOSE
# This file is loaded into EVERY AI coding session for this project.
# It is the AI's always-on rulebook. Keep it accurate. Keep it current.
# If something in here conflicts with what you see in the codebase, flag it —
# do not silently resolve the conflict.
#
# UPDATE CADENCE
# • Tech stack / conventions: update when the stack changes
# • Current focus: update every week or at the start of every sprint
# • What NOT to do: add to this whenever a mistake is made or a pattern is rejected
# ─────────────────────────────────────────────────────────────────────────────

## Project identity

- **Name:**            [PROJECT_NAME]
- **Type:**            [PROJECT_TYPE]
<!-- PROJECT_TYPE examples: web app, REST API, CLI tool, mobile app, microservice, library -->

- **Primary language(s):** [PRIMARY_LANGUAGES]
<!-- Example: Java 21, TypeScript 5.4, Python 3.12 -->

- **One-line purpose:** [PROJECT_PURPOSE]
<!-- Write this as a single sentence from the user's perspective. -->
<!-- Example: "Matches freight loads to available trucks in the Central Asian market." -->


## Tech stack
<!-- Be specific about versions. Vague entries ("uses React") are useless to the AI. -->

- **Backend:**         [BACKEND_STACK]
- **Frontend:**        [FRONTEND_STACK]
- **Database:**        [DATABASE_STACK]
- **Infra / deploy:**  [INFRA_STACK]
- **Key libraries:**   [KEY_LIBRARIES]
<!-- List only libraries with project-wide impact — auth, ORM, HTTP client, queue, etc. -->


## Architectural principles
<!-- These are the non-negotiables. The AI must apply them to every change.
     Write them as positive statements of what is always true.
     Aim for 3–6. More than 8 means you have conventions, not principles. -->

1. [PRINCIPLE_1]
2. [PRINCIPLE_2]
3. [PRINCIPLE_3]
<!-- Example principles:
     "All business logic lives in the service layer — never in controllers or repositories."
     "Every public API endpoint has a corresponding integration test."
     "Configuration is injected via environment variables — never hardcoded." -->


## Conventions
<!-- Specific rules the AI must follow when writing code for this project.
     These are not principles (why) — they are rules (how). -->

### Naming
<!-- File names, class names, function names, variable names, database columns. -->
- [NAMING_RULE_1]
<!-- Example: "Files use kebab-case. Classes use PascalCase. Functions use camelCase." -->

### Package / module structure
<!-- Where do things live? What is the folder layout rule? -->
- [STRUCTURE_RULE_1]
<!-- Example: "Feature folders under src/features/. Each folder owns its routes, service, and repo." -->

### Error handling
<!-- How are errors surfaced, logged, and returned to callers? -->
- [ERROR_HANDLING_RULE_1]
<!-- Example: "All errors extend AppError. HTTP handlers never throw — they always return Result<T>." -->

### Testing
<!-- What test types exist? What must be tested? What is the naming convention? -->
- [TESTING_RULE_1]
<!-- Example: "Unit tests co-located with source. Integration tests under /tests/integration/." -->

### API responses
<!-- What shape do API responses take? Envelope pattern? Direct payload? Error format? -->
- [API_RESPONSE_RULE_1]
<!-- Example: "All responses wrapped in { data, error, meta }. Never return raw objects." -->


## What NOT to do
<!-- Explicit anti-patterns for this codebase.
     Add an entry whenever a mistake is made, a PR is rejected for pattern reasons,
     or a technical decision is deliberately ruled out. -->

- Do NOT [ANTI_PATTERN_1]
- Do NOT [ANTI_PATTERN_2]
<!-- Examples:
     "Do NOT use raw SQL strings — always use the ORM query builder."
     "Do NOT commit .env files or any file containing credentials."
     "Do NOT add new npm dependencies without a team discussion." -->


## Service boundaries
<!-- Fill this section only for multi-service / multi-module projects.
     For each service: what it owns, what it must never do, what it exposes. -->

<!-- Single-service project: replace this block with "Single service — not applicable." -->

### [SERVICE_NAME_1]
- **Owns:**    [what data / domain this service is responsible for]
- **Exposes:** [its public interface — API, events, queues]
- **Must NOT:** [what it must never touch or know about]

### [SERVICE_NAME_2]
- **Owns:**    [what data / domain]
- **Exposes:** [public interface]
- **Must NOT:** [cross-boundary rules]


## Current focus
<!-- Update this at the start of every week or sprint.
     The AI uses this to understand what is actively in flight. -->

- [CURRENT_FOCUS_1]
<!-- Example: "Building the freight-matching endpoint (spec: freight-matching)." -->
<!-- Example: "Migrating authentication from session-based to JWT (spec: auth-jwt-migration)." -->