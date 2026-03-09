/**
 * upgrade.js — specpact upgrade
 *
 * Compares the .sdd/scripts/ and .sdd/modes/ directories in the current
 * project against the versions bundled in the installed CLI package.
 * Shows a unified diff and, on confirmation, applies only the changed files.
 *
 * Protected directories (NEVER touched by upgrade):
 *   .sdd/memory/    — user's Memory Bank
 *   .sdd/specs/     — user's spec files
 *   .sdd/templates/ — spec templates
 *
 * Flags:
 *   --dry-run   show what would change without writing anything
 *   --yes       skip confirmation prompt (for CI / scripted use)
 */

import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';

import { ok, err, warn, info, hint, spacer, header } from '../lib/printer.js';
import { buildUpgradePlan } from '../lib/upgrader.js';
import { writeVersionStamp } from '../lib/installer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const pkg = JSON.parse(
  readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8')
);

/**
 * Handler for `specpact upgrade [--dry-run] [--yes]`.
 *
 * @param {object} options
 * @param {boolean} options.dryRun
 * @param {boolean} options.yes
 */
export async function upgradeCommand(options) {
  const projectRoot    = process.cwd();
  const bundledVersion = pkg.version;

  // ─── Guard: .sdd/ must exist ──────────────────────────────────────────────
  if (!existsSync(join(projectRoot, '.sdd'))) {
    err('.sdd/ not found. Run `specpact init` first.');
    process.exit(1);
  }

  // ─── Build diff plan ──────────────────────────────────────────────────────
  let plan;
  try {
    plan = buildUpgradePlan(projectRoot, bundledVersion);
  } catch (e) {
    err(`Failed to build upgrade plan: ${e.message}`);
    process.exit(1);
  }

  const { diffs, toApply, installedVersion } = plan;

  // ─── Version header ───────────────────────────────────────────────────────
  spacer();
  if (installedVersion === 'unknown') {
    warn('No version stamp found in .sdd/.specpact-version');
    hint('  This project may have been installed before versioning was added.');
    hint(`  Bundled version: v${bundledVersion}`);
  } else if (installedVersion === bundledVersion) {
    info(`Already up to date (v${bundledVersion})`);
  } else {
    info(`Installed: v${installedVersion}  →  Available: v${bundledVersion}`);
  }
  spacer();

  // ─── Nothing to do ────────────────────────────────────────────────────────
  if (toApply.length === 0) {
    ok('All scripts and modes are up to date. Nothing to upgrade.');
    spacer();
    return;
  }

  // ─── Print diff summary ───────────────────────────────────────────────────
  header(`Changes (${toApply.length} file${toApply.length === 1 ? '' : 's'})`);
  spacer();

  for (const diff of diffs) {
    if (diff.status === 'MODIFIED') {
      console.log(chalk.yellow(`  ~ MODIFIED  .sdd/${diff.relPath}`));
      if (diff.hunks && diff.hunks.length > 0) {
        printHunks(diff.hunks);
      }
    } else if (diff.status === 'NEW') {
      console.log(chalk.green(`  + NEW       .sdd/${diff.relPath}`));
    } else if (diff.status === 'EXTRA') {
      console.log(chalk.dim(`  ? EXTRA     .sdd/${diff.relPath} (not in bundled version — left untouched)`));
    }
    // UNCHANGED files are not shown
  }

  spacer();
  info('Your specs and memory bank will NOT be changed.');
  spacer();

  // ─── Dry-run exit ─────────────────────────────────────────────────────────
  if (options.dryRun) {
    hint('Dry run — no files were modified.');
    spacer();
    return;
  }

  // ─── Confirmation ─────────────────────────────────────────────────────────
  let confirmed = options.yes;

  if (!confirmed) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Apply ${toApply.length} update${toApply.length === 1 ? '' : 's'}?`,
        default: true,
      },
    ]);
    confirmed = answer.confirmed;
  }

  if (!confirmed) {
    info('Upgrade cancelled.');
    spacer();
    return;
  }

  // ─── Apply changes ────────────────────────────────────────────────────────
  spacer();
  let applied = 0;
  let failed  = 0;

  for (const diff of toApply) {
    const destPath = join(projectRoot, '.sdd', diff.relPath);
    try {
      mkdirSync(dirname(destPath), { recursive: true });
      copyFileSync(diff.bundledPath, destPath);
      ok(`.sdd/${diff.relPath}`);
      applied++;
    } catch (e) {
      err(`Failed to update .sdd/${diff.relPath}: ${e.message}`);
      failed++;
    }
  }

  // ─── Write new version stamp ──────────────────────────────────────────────
  if (applied > 0) {
    writeVersionStamp(projectRoot, bundledVersion);
  }

  spacer();

  if (failed > 0) {
    warn(`Upgrade partially complete: ${applied} updated, ${failed} failed.`);
  } else {
    ok(`Upgrade complete — ${applied} file${applied === 1 ? '' : 's'} updated to v${bundledVersion}.`);
  }

  spacer();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Print unified-diff style hunks for a modified file.
 * @param {Array} hunks
 */
function printHunks(hunks) {
  for (const hunk of hunks) {
    console.log(chalk.dim(`    @@ -${hunk.startInstalled} +${hunk.startBundled} @@`));
    for (const line of hunk.lines) {
      if (line.type === '+') {
        console.log(chalk.green(`    + ${line.text}`));
      } else if (line.type === '-') {
        console.log(chalk.red(`    - ${line.text}`));
      } else {
        console.log(chalk.dim(`      ${line.text}`));
      }
    }
  }
}