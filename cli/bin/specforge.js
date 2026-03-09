#!/usr/bin/env node
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { program } from 'commander';

import { initCommand }   from '../src/commands/init.js';
import { newCommand }    from '../src/commands/new.js';
import { listCommand }   from '../src/commands/list.js';
import { verifyCommand } from '../src/commands/verify.js';
import { updateCommand } from '../src/commands/update.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const pkg = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
);

program
  .name('specforge')
  .description('Spec-Driven Development workflow tool')
  .version(pkg.version, '-v, --version', 'output the current version');

// ── specforge init ────────────────────────────────────────────────────────────
program
  .command('init')
  .description('Install SpecForge into the current directory and run the Memory Bank setup wizard')
  .option('--no-claude',  'skip .claude/commands/ installation')
  .option('--no-copilot', 'skip .github/agents/ and .github/prompts/ installation')
  .option('--force',      'overwrite existing .sdd/ (dangerous — prompts for confirmation)')
  .action(initCommand);

// ── specforge new <mode> <spec-id> ───────────────────────────────────────────
program
  .command('new <mode> <spec-id>')
  .description('Create a new spec from the appropriate template')
  .action(newCommand);

// ── specforge list ────────────────────────────────────────────────────────────
program
  .command('list')
  .description('List all specs with status, mode, and created date')
  .action(listCommand);

// ── specforge verify <spec-id> ────────────────────────────────────────────────
program
  .command('verify <spec-id>')
  .description('Output the structured verification prompt for a spec to stdout')
  .action(verifyCommand);

// ── specforge update <spec-id> [status] ───────────────────────────────────────
program
  .command('update <spec-id> [status]')
  .description('Update a spec\'s status (draft | in-progress | stable | deprecated)')
  .action(updateCommand);

program.parse(process.argv);