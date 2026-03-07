# _example — SpecForge example specs

This folder contains reference specs that demonstrate correct usage of the
SpecForge spec format. They are **not** processed by any script — they exist
only for you to read and learn from.

## What these examples show

Both examples describe SpecForge itself — the tool you are using right now.
This is intentional. A self-referential example means:

1. The domain is already familiar — you know what `new-spec.sh` does
2. The example stays accurate as SpecForge evolves
3. You can compare the spec against the actual implementation

## Examples in this folder

| Folder | Mode | What it shows |
|---|---|---|
| `_example/` | feature | How a feature spec looks when fully filled in and marked stable |
| `_example-nano/` | nano | How a nano spec looks — compact, one-screen, zero ceremony |

## How to use these

Before writing your first spec, read both `spec.md` files and notice:

- How the **Intent** section describes value, not implementation
- How **Contracts** are observable outcomes, not tasks
- How **Out of scope** is explicit and not empty
- How the nano spec is genuinely short — 20 lines of content
- How both specs fit on a single screen

Then run:
```bash
.sdd/scripts/new-spec.sh feature my-first-feature
```

And fill in your own spec using these as a guide.

## What NOT to copy

- Do not copy the `author: specforge-core` field — use your own handle
- Do not copy the `status: stable` field — new specs start as `draft`
- Do not copy the `adr:` field unless you are writing a system-mode spec