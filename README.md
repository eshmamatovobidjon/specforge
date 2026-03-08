# SpecForge

> Spec-Driven Development that fits how you actually work.

SpecForge is a zero-dependency SDD system that lives inside your repository as shell scripts and markdown files. No proprietary CLI to install, no cloud service, no lock-in. It works with Claude Code and GitHub Copilot out of the box, and with any other AI tool that can read a text file.

---

## Why SpecForge

AI coding assistants are powerful, but they forget everything between sessions. They implement what the prompt implies, not what the spec requires. They treat a bug fix and an architectural change with the same ceremony. SpecForge fixes this.

| Problem | SpecForge's answer |
|---|---|
| AI forgets project context between sessions | **Memory Bank** — three files loaded into every session |
| Specs die when the PR merges | Specs are **permanent** — deprecated when removed, never deleted |
| One verbose workflow for every change size | **Three tiered modes** — nano, feature, system |
| AI implements beyond the spec boundary | **Mode rules** — numbered, prioritised, enforced per session |
| Unclear whether implementation matches the spec | **Verify command** — structured audit prompt, human-judged verdict |
| External CLI tool to install and upgrade | **Zero dependencies** — Bash 3.2 + standard tools only |

---

## How it works

Every SpecForge project has a `.sdd/` directory at the repo root. It contains three things:

**Memory Bank** — files that load into every AI session, every time.
```
.sdd/memory/AGENTS.md        ← your stack, conventions, anti-patterns
.sdd/memory/architecture.md  ← service topology and boundaries
.sdd/memory/decisions.md     ← why key decisions were made
```

**Specs** — one folder per feature, maintained for the feature's lifetime.
```
.sdd/specs/freight-matching/
  spec.md    ← the contract (permanent, never deleted)
  notes.md   ← implementation context (deleted when spec reaches stable)
```

**Mode rules** — numbered, prioritised instructions for your AI tool.
```
.sdd/modes/nano.md     ← bug fixes and small tweaks
.sdd/modes/feature.md  ← new capabilities
.sdd/modes/system.md   ← architectural changes
```

The workflow for any change is the same:

1. Create a spec (`new-spec.sh`)
2. Fill it in (you write the contracts)
3. Load it into your AI tool (`/spec-load` or paste the mode file)
4. Implement (AI follows the spec, not the prompt)
5. Verify (`verify.sh` generates the audit prompt)
6. Mark stable (`update-spec.sh`)

---

## Installation

**Requires:** Bash 3.2+, git, and standard Unix tools (sed, grep, awk, date).
Works on macOS, Linux, and Windows via Git Bash or WSL.

Copy `.sdd/` into your repository root:

```bash
git clone https://github.com/specforge/specforge /tmp/specforge
cp -r /tmp/specforge/.sdd .
cp -r /tmp/specforge/.claude .   # optional: Claude Code slash commands
cp -r /tmp/specforge/.github .   # optional: GitHub Copilot instructions
rm -rf /tmp/specforge
```

Make scripts executable and run the setup wizard:

```bash
chmod +x .sdd/scripts/*.sh
.sdd/scripts/init.sh
```

The wizard asks four questions (project name, type, language, and purpose) and stamps your Memory Bank. The whole process takes under two minutes.

---

## Your first spec in 5 minutes

Follow these steps exactly. No prior knowledge required.

**Step 1 — Install (1 minute)**

```bash
cd your-project-root
git clone https://github.com/specforge/specforge /tmp/specforge
cp -r /tmp/specforge/.sdd .
chmod +x .sdd/scripts/*.sh
rm -rf /tmp/specforge
```

**Step 2 — Initialise (1 minute)**

```bash
.sdd/scripts/init.sh
```

Answer the four prompts. You can change these answers later by editing `.sdd/memory/AGENTS.md`.

**Step 3 — Fill in your Memory Bank (2 minutes)**

Open `.sdd/memory/AGENTS.md` and fill in the remaining placeholders:
- What is your backend stack?
- What are your naming conventions?
- What should the AI never do in your codebase?

You don't need architecture.md yet. Come back to it after your first spec.

**Step 4 — Create your first spec (30 seconds)**

```bash
# For a bug fix:
.sdd/scripts/new-spec.sh nano fix-my-bug

# For a new feature:
.sdd/scripts/new-spec.sh feature my-feature

# For an architectural change:
.sdd/scripts/new-spec.sh system my-architecture-change
```

**Step 5 — Fill in the spec and start implementing (30 seconds)**

Open `.sdd/specs/fix-my-bug/spec.md` and fill in each section. Then load it into your AI tool:

- **Claude Code:** `/spec-load fix-my-bug`
- **Any other tool:** paste `.sdd/modes/nano.md` followed by your `spec.md` into the context

That's it. Your AI now has the contracts, constraints, and scope boundary before it writes a single line of code.

---

## Commands

```bash
# Create a new spec
.sdd/scripts/new-spec.sh <mode> <spec-id>
  mode:     nano | feature | system
  spec-id:  kebab-case, e.g. fix-null-carrier-id

# List all specs and their status
.sdd/scripts/list-specs.sh

# Generate a verification prompt for a spec
.sdd/scripts/verify.sh <spec-id>

# Update a spec's status (and manage notes.md lifecycle)
.sdd/scripts/update-spec.sh <spec-id> [new-status]
  status:   draft | in-progress | stable | deprecated

# One-time project setup
.sdd/scripts/init.sh
```

---

## Claude Code slash commands

If you use Claude Code, SpecForge ships four slash commands in `.claude/commands/`:

| Command | What it does |
|---|---|
| `/spec-new` | Guided interview to create a spec — no shell script required |
| `/spec-load <id>` | Loads spec + Memory Bank, restates intent, waits for confirmation before coding |
| `/spec-verify <id>` | Audits codebase against spec contracts, outputs ✓/~/✗/? per contract |
| `/spec-update <id>` | Proposes spec.md edits when implementation diverged from the spec |

`/spec-load` includes a mandatory confirmation step. The AI reads the spec, restates what it understands, lists every contract it will implement, and **waits for your "correct, begin" before writing any code.** This is not optional.

---

## GitHub Copilot

Copy `.github/copilot-instructions.md` into your project. Copilot will read this file before every session and will:
- Look for a spec in `.sdd/specs/` before implementing
- Read AGENTS.md for conventions
- Route to the correct mode rules file based on the spec's `mode` field
- Output a contract check when implementation is complete

---

## Directory structure

```
.sdd/
├── memory/
│   ├── AGENTS.md          ← Always loaded. Stack, conventions, anti-patterns.
│   ├── architecture.md    ← Service topology, data flow, boundaries.
│   └── decisions.md       ← ADR log. Why X was chosen over Y.
├── specs/
│   ├── README.md          ← Explains the _example folders.
│   ├── _example/          ← Complete feature spec example (read this first).
│   │   └── spec.md
│   ├── _example-nano/     ← Complete nano spec example.
│   │   └── spec.md
│   └── _example-nano-2/   ← A second nano example (different bug scenario).
│       └── spec.md
├── modes/
│   ├── nano.md            ← 7 prioritised rules for nano-mode work.
│   ├── feature.md         ← 9 prioritised rules for feature-mode work.
│   └── system.md          ← 10 prioritised rules for system-mode work.
├── scripts/
│   ├── init.sh            ← One-time setup wizard.
│   ├── new-spec.sh        ← Bootstrap a new spec from a template.
│   ├── list-specs.sh      ← Registry view with ANSI colour output.
│   ├── verify.sh          ← Generate a verification audit prompt.
│   └── update-spec.sh     ← Update status and manage notes.md lifecycle.
└── templates/
    ├── spec-nano.md        ← Nano spec template.
    ├── spec-feature.md     ← Feature spec template.
    ├── spec-system.md      ← System spec template.
    └── notes.md            ← Notes template (ephemeral context file).

.claude/commands/
├── spec-new.md            ← /spec-new
├── spec-load.md           ← /spec-load <id>
├── spec-verify.md         ← /spec-verify <id>
└── spec-update.md         ← /spec-update <id>

.github/
└── copilot-instructions.md
```

---

## Example specs

Two nano examples are included in `.sdd/specs/`:

**`_example-nano/`** — Improving an error message in `new-spec.sh`. The spec defines exactly which words must appear in the output, what must not change, and how to verify in one command. 20 lines total.

**`_example-nano-2/`** — Fixing a health endpoint that returns HTTP 200 even when the database is unreachable. Shows how to specify observable outcomes (status codes, response fields, timeout) without describing implementation.

**`_example/`** — A full feature spec for `new-spec.sh` itself. Shows all seven sections, good contract phrasing, interface signatures, and a data shape block.

---

## Spec status lifecycle

```
draft ──► in-progress ──► stable ──► deprecated
```

- **draft** — spec is written, work has not started
- **in-progress** — implementation is underway
- **stable** — all contracts verified, notes.md deleted
- **deprecated** — feature removed; spec kept as permanent record

Transitions are made with `update-spec.sh`. Specs are never deleted.

---

## Philosophy

1. **Specs are contracts, not documents.** They are compact (one screen), verifiable, and honest about what they exclude.
2. **Specs outlive branches.** A spec lives in `main` and is maintained across the feature's entire life — not discarded after the PR merges.
3. **Ceremony matches change size.** A bug fix takes a 20-line nano spec. An architectural change gets a system spec with a migration path and a risk table.
4. **Memory Bank loads always; specs load on demand.** Every session gets the project context. Only the relevant spec gets loaded for each task.
5. **Verification is human-triggered.** SpecForge generates the audit prompt. You decide what the result means and when to mark a spec stable.
6. **Zero dependencies.** Bash 3.2 and standard Unix tools. No package manager, no cloud service, no binary to install.
7. **Adoptable incrementally.** You can add SpecForge to an existing repo in under five minutes. Use it for one spec first. Expand when it proves its value.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT