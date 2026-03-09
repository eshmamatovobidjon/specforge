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

Create a new spec from the appropriate template. Pure Node.js — no shell required.

```sh
specforge new nano   fix-null-carrier-id   # bug fix or small tweak
specforge new feature user-auth-flow       # new capability
specforge new system migrate-to-postgres   # architecture change
```

**Validation:**
- `mode` must be `nano`, `feature`, or `system`
- `spec-id` must be kebab-case: `^[a-z0-9]+(-[a-z0-9]+)*$`
- Blocks if a spec with that ID already exists

**What it creates:**
- All modes: `.sdd/specs/<spec-id>/spec.md` — populated from the mode template, with today's date and spec-id stamped in
- `feature` + `system` modes also create `.sdd/specs/<spec-id>/notes.md` for ephemeral implementation context

### `specforge list`

List all specs with ANSI colour by status. Skips `_`-prefixed example directories.

```sh
specforge list
```

Output is a fixed-width table with columns: `SPEC ID`, `MODE`, `STATUS`, `CREATED`.

| Colour | Status |
|--------|--------|
| Yellow | `draft` |
| Blue   | `in-progress` |
| Green  | `stable` |
| Dim    | `deprecated` |

### `specforge verify <spec-id>`

Generate the structured verification prompt and write it to stdout. Paste into your AI tool, or pipe/redirect it.

```sh
specforge verify user-auth-flow           # print to terminal
specforge verify user-auth-flow | pbcopy  # copy to clipboard (macOS)
specforge verify user-auth-flow > prompt.md  # save to file
```

The prompt instructs the AI to audit every numbered contract with a `✓ / ~ / ✗ / ?` verdict, check AGENTS.md compliance, and output a structured Markdown report. AGENTS.md is automatically appended to the prompt when present.

Diagnostic error messages go to stderr so piping captures only the prompt.

### `specforge update <spec-id> [status]`

Update a spec's status. Pure Node.js front-matter surgery — cross-platform, no `sed`.

```sh
specforge update user-auth-flow              # print current status
specforge update user-auth-flow in-progress  # mark as in progress
specforge update user-auth-flow stable       # mark stable (prompts to delete notes.md)
specforge update user-auth-flow deprecated   # mark deprecated (permanent record kept)
```

Valid statuses: `draft` | `in-progress` | `stable` | `deprecated`

**Behaviours:**
- No status arg → prints current status and valid options
- Same status as current → warns, makes no change
- Backwards transition → warns but does not block
- Reaching `stable` with `notes.md` present → interactive prompt to delete it

### `specforge upgrade`

Compare installed `.sdd/scripts/` and `.sdd/modes/` against the version bundled in this CLI and apply surgical updates. Pure Node.js diff — no external `diff` binary, no shell exec.

```sh
specforge upgrade              # interactive: show diff, confirm, apply
specforge upgrade --dry-run    # show diff and exit without writing anything
specforge upgrade --yes        # skip confirmation (for CI pipelines)
```

**Scope — only these directories are ever written:**

| Directory | Upgraded |
|-----------|---------|
| `.sdd/scripts/` | ✓ |
| `.sdd/modes/` | ✓ |
| `.sdd/memory/` | ✗ never touched |
| `.sdd/specs/` | ✗ never touched |
| `.sdd/templates/` | ✗ never touched |

**Output per file:**
- `MODIFIED` (yellow) — file exists in both, content changed. Shows a coloured unified diff with `+`/`-`/context lines.
- `NEW` (green) — file exists in bundled version but not in your install. Will be added.
- `UNCHANGED` (dim) — file is identical. Skipped.
- `EXTRA` (reported only) — file in your install but not in the bundle. Never deleted.

**Version stamp:** `.sdd/.specforge-version` is written on `init` and updated on every successful `upgrade`. The upgrade report shows installed vs bundled version.

**Line-ending normalisation:** CRLF and LF are treated as equal during comparison so Windows-authored files don't show false changes on macOS/Linux.

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