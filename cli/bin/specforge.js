#!/usr/bin/env node
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { program } from 'commander';

import { initCommand }    from '../src/commands/init.js';
import { newCommand }     from '../src/commands/new.js';
import { listCommand }    from '../src/commands/list.js';
import { verifyCommand }  from '../src/commands/verify.js';
import { updateCommand }  from '../src/commands/update.js';
import { upgradeCommand } from '../src/commands/upgrade.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const pkg = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
);

program
  .name('specforge')
  .description('Spec-Driven Development workflow tool')
  .version(pkg.version, '-v, --version', 'output the current version')
  .addHelpText('after', `
Examples:
  $ specforge init                        install SpecForge into the current project
  $ specforge new nano  fix-null-pointer  create a bug-fix spec
  $ specforge new feature user-auth       create a feature spec
  $ specforge list                        show all specs with status
  $ specforge verify user-auth            generate a verification prompt
  $ specforge update user-auth stable     mark a spec stable
  $ specforge upgrade                     update scripts/modes to the latest version

Docs: https://github.com/eshmamatovobidjon/specforge`);

// ── specforge init ────────────────────────────────────────────────────────────
program
  .command('init')
  .description('Install SpecForge into the current directory and run the Memory Bank setup wizard')
  .option('--no-claude',  'skip .claude/commands/ installation')
  .option('--no-copilot', 'skip .github/agents/ and .github/prompts/ installation')
  .option('--force',      'overwrite existing .sdd/ (dangerous — prompts for confirmation)')
  .addHelpText('after', `
Examples:
  $ specforge init                 standard install — installs .sdd/, .claude/, .github/
  $ specforge init --no-claude     skip Claude Code slash commands
  $ specforge init --no-copilot    skip GitHub Copilot agents
  $ specforge init --force         reinstall over an existing .sdd/ (prompts first)`)
  .action(initCommand);

// ── specforge new <mode> <spec-id> ───────────────────────────────────────────
program
  .command('new <mode> <spec-id>')
  .description('Create a new spec from the appropriate template (nano | feature | system)')
  .addHelpText('after', `
Arguments:
  mode     nano | feature | system
  spec-id  kebab-case identifier, e.g. fix-null-carrier-id

Examples:
  $ specforge new nano    fix-null-carrier-id   bug fix or small tweak
  $ specforge new feature freight-matching      new capability
  $ specforge new system  migrate-to-postgres   architectural change`)
  .action(newCommand);

// ── specforge list ────────────────────────────────────────────────────────────
program
  .command('list')
  .description('List all specs with status, mode, and created date')
  .addHelpText('after', `
Output is colour-coded by status:
  yellow  draft
  blue    in-progress
  green   stable
  dim     deprecated

Example:
  $ specforge list`)
  .action(listCommand);

// ── specforge verify <spec-id> ────────────────────────────────────────────────
program
  .command('verify <spec-id>')
  .description('Output the structured verification prompt for a spec to stdout')
  .addHelpText('after', `
The prompt instructs the AI to audit every contract with a ✓/~/✗/? verdict.
Diagnostic messages go to stderr so the prompt can be safely piped.

Examples:
  $ specforge verify freight-matching            print to terminal
  $ specforge verify freight-matching | pbcopy   copy to clipboard (macOS)
  $ specforge verify freight-matching > p.md     save to file`)
  .action(verifyCommand);

// ── specforge update <spec-id> [status] ───────────────────────────────────────
program
  .command('update <spec-id> [status]')
  .description('Update a spec\'s status (draft | in-progress | stable | deprecated)')
  .addHelpText('after', `
Valid statuses: draft | in-progress | stable | deprecated

  Omitting [status] prints the current status without making changes.
  Reaching 'stable' with notes.md present prompts to delete it.

Examples:
  $ specforge update freight-matching              show current status
  $ specforge update freight-matching in-progress  mark as in-progress
  $ specforge update freight-matching stable       mark stable (prompts for notes.md)
  $ specforge update freight-matching deprecated   archive the spec`)
  .action(updateCommand);

// ── specforge upgrade ─────────────────────────────────────────────────────────
program
  .command('upgrade')
  .description('Update .sdd/scripts/ and .sdd/modes/ from the bundled version')
  .option('--dry-run', 'show what would change without applying')
  .option('--yes',     'skip confirmation prompt (for CI)')
  .addHelpText('after', `
Only .sdd/scripts/ and .sdd/modes/ are ever written.
.sdd/memory/ and .sdd/specs/ are never touched.

Examples:
  $ specforge upgrade            show diff, confirm, apply
  $ specforge upgrade --dry-run  show diff only — nothing is written
  $ specforge upgrade --yes      apply without prompting (CI-safe)`)
  .action(upgradeCommand);

program.parse(process.argv);