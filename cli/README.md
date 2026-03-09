# SpecForge CLI

> Spec-Driven Development workflow tool — install, create, list, verify, and upgrade specs from the command line.

## Installation

```sh
# Run without installing (recommended for first use):
npx specforge init

# Or install globally:
npm install -g specforge
specforge init
```

**Requires:** Node.js 18+. Works on macOS, Linux, and Windows (cmd, PowerShell, Git Bash).

---

## Quick start

```sh
cd your-project
npx specforge init
```

`init` installs SpecForge into the current directory and runs a four-question setup wizard to configure your Memory Bank.

---

## Commands

### `specforge init`

Install SpecForge into the current directory.

```sh
specforge init
specforge init --no-claude    # skip Claude Code slash commands
specforge init --no-copilot  # skip GitHub Copilot agents
specforge init --force        # reinstall over existing .sdd/
```

**What it installs:**

| Directory | Contents |
|-----------|---------|
| `.sdd/` | Core workflow: scripts, modes, memory, templates, example specs |
| `.claude/commands/` | Claude Code slash commands (`/spec-load`, `/spec-new`, etc.) |
| `.github/agents/` + `.github/prompts/` | GitHub Copilot agent definitions |

### `specforge new <mode> <spec-id>`

Create a new spec from the appropriate template.

```sh
specforge new nano   fix-null-carrier-id   # bug fix
specforge new feature user-auth-flow       # new capability
specforge new system migrate-to-postgres   # architecture change
```

- `mode`: `nano` | `feature` | `system`
- `spec-id`: kebab-case, e.g. `fix-null-carrier-id`

### `specforge list`

List all specs with ANSI colour by status.

```sh
specforge list
```

### `specforge verify <spec-id>`

Output the structured verification prompt to stdout. Paste it into your AI tool.

```sh
specforge verify user-auth-flow
```

### `specforge update <spec-id> [status]`

Update a spec's status. Prompts to delete `notes.md` when reaching `stable`.

```sh
specforge update user-auth-flow in-progress
specforge update user-auth-flow stable
specforge update user-auth-flow deprecated
```

Valid statuses: `draft` | `in-progress` | `stable` | `deprecated`

### `specforge upgrade`

*(Phase 3)* Compare installed `.sdd/scripts/` and `.sdd/modes/` against the version bundled in this CLI package and apply updates.

```sh
specforge upgrade
specforge upgrade --dry-run   # show what would change
specforge upgrade --yes       # skip confirmation (CI)
```

---

## Directory structure after `init`

```
.sdd/
├── memory/
│   ├── AGENTS.md          ← Always loaded. Stack, conventions, anti-patterns.
│   ├── architecture.md    ← Service topology, data flow, boundaries.
│   └── decisions.md       ← ADR log.
├── specs/
│   ├── _example/          ← Feature spec example (read first)
│   └── _example-nano/     ← Nano spec example
├── modes/
│   ├── nano.md
│   ├── feature.md
│   └── system.md
├── scripts/
│   ├── new-spec.sh
│   ├── list-specs.sh
│   ├── verify.sh
│   └── update-spec.sh
└── templates/
    ├── spec-nano.md
    ├── spec-feature.md
    ├── spec-system.md
    └── notes.md

.claude/commands/
├── spec-load.md
├── spec-new.md
├── spec-verify.md
└── spec-update.md

.github/
├── agents/
│   ├── spec-load.agent.md
│   ├── spec-new.agent.md
│   ├── spec-verify.agent.md
│   └── spec-update.agent.md
└── prompts/
    ├── spec-load.prompt.md
    ├── spec-new.prompt.md
    ├── spec-verify.prompt.md
    └── spec-update.prompt.md
```

---

## License

MIT