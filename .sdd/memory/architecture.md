# architecture.md
# ─────────────────────────────────────────────────────────────────────────────
# PURPOSE
# Describes the structural shape of the system — how it is divided, how data
# flows through it, and what the boundaries are between its parts.
#
# This file is loaded into every AI coding session alongside AGENTS.md.
# It tells the AI WHERE things live and HOW they connect — so it does not
# invent new structure or violate existing boundaries.
#
# UPDATE CADENCE
# • Update immediately after any system-mode spec reaches "stable"
# • Review quarterly even if no system changes have occurred
# ─────────────────────────────────────────────────────────────────────────────

## System overview
<!-- Write one short paragraph (3–5 sentences) describing the whole system.
     What it is, what it does, who uses it, and how it is deployed.
     Do not describe individual services here — save that for the next section. -->

[SYSTEM_OVERVIEW]
<!-- Example:
     "YukHub is a three-service logistics platform deployed on a single VPS via Docker Compose.
      A Telegram Collector microservice scrapes freight postings from Telegram groups and stores
      them via a FastAPI backend. A React frontend allows carriers and shippers to browse and
      match on freight. All services share a single PostgreSQL database." -->


## Services / modules
<!-- One subsection per major component. Copy the template below for each one.
     For a single-service project, describe modules (e.g. auth, billing, notifications) instead. -->

### [SERVICE_OR_MODULE_NAME]
- **Owns:**     [The data, domain, or responsibility this component is solely responsible for]
- **Exposes:**  [Its public interface — HTTP endpoints, events published, queue messages sent]
- **Consumes:** [What it reads from — other services, queues, external APIs]
- **Must NOT:** [Hard boundary rules — what it is explicitly forbidden from touching]
- **Tech:**     [Language, framework, key libraries specific to this component]

<!-- Add more ### sections as needed. One per service or major module. -->


## Data flow
<!-- Describe the key paths that data takes through the system.
     Focus on the 2–4 most important flows. Use plain English or simple diagrams.
     Example format:
       1. User submits freight post → POST /api/freight → stored in freight_posts table
       2. Collector scrapes Telegram → raw message saved → LLM enrichment queued → enriched data saved
-->

1. [DATA_FLOW_1]
2. [DATA_FLOW_2]
<!-- Add more as needed -->


## Core data models
<!-- List the most important entities in the system.
     Not every column — just the shape, key fields, and relationships.
     The goal is for the AI to understand the domain model without reading the database schema. -->

### [ENTITY_NAME]
```
[ENTITY_NAME] {
  id:         UUID
  [field]:    [type]   -- [brief note if not obvious]
  [relation]: [type]   -- belongs to / has many [other entity]
}
```
<!-- Copy the block above for each core entity. -->


## External dependencies
<!-- Third-party services, APIs, queues, storage — anything outside your own codebase.
     The AI needs to know these exist and what they are used for. -->

| Dependency | Purpose | Notes |
|---|---|---|
| [NAME] | [what it is used for] | [auth method, rate limits, or key constraints] |
<!-- Example rows:
     | OpenAI API       | LLM enrichment of freight text     | GPT-4o-mini, key via env var  |
     | Telegram MTProto | Scraping freight groups            | Telethon library, session auth |
     | SendGrid         | Transactional email                | API key via env var           | -->


## Infrastructure
<!-- How is the system deployed and operated? -->

- **Deployment:**  [DEPLOYMENT_METHOD]
<!-- Example: "Docker Compose on a single Ubuntu 22 VPS. No Kubernetes." -->

- **Environments:** [ENVIRONMENTS]
<!-- Example: "local (Docker Compose), staging (VPS), production (VPS)." -->

- **Config:**      [CONFIG_METHOD]
<!-- Example: "All config via .env files. Never committed. Template in .env.example." -->


## Known constraints
<!-- Technical limits, scale targets, regulatory requirements, or deliberate simplifications
     that the AI must be aware of when designing solutions. -->

- [CONSTRAINT_1]
<!-- Examples:
     "Single-VPS deployment — no horizontal scaling in v1."
     "All user data must remain within Uzbekistan jurisdiction."
     "The system must handle 1,000 concurrent connections at peak." -->