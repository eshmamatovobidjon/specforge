#!/usr/bin/env node
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { program } from 'commander';

import { initCommand } from '../src/commands/init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json
const pkg = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
);

program
  .name('specforge')
  .description('Spec-Driven Development workflow tool')
  .version(pkg.version, '-v, --version', 'output the current version');

// specforge init
program
  .command('init')
  .description('Install SpecForge into the current directory and run the Memory Bank setup wizard')
  .option('--no-claude', 'skip .claude/commands/ installation')
  .option('--no-copilot', 'skip .github/agents/ and .github/prompts/ installation')
  .option('--force', 'overwrite existing .sdd/ (dangerous — prompts for confirmation)')
  .action(initCommand);

program.parse(process.argv);