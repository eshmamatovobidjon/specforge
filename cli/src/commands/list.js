/**
 * list.js — specpact list
 *
 * Lists all specs in .sdd/specs/ with ANSI colour by status.
 * Full Node.js reimplementation of .sdd/scripts/list-specs.sh — no shell exec.
 *
 * Colour scheme (matches shell script):
 *   draft       → yellow
 *   in-progress → blue
 *   stable      → green
 *   deprecated  → dim
 *   unknown     → default
 *
 * Behaviour:
 *   - Skips directories whose name begins with '_' (example specs)
 *   - Skips directories that contain no spec.md
 *   - Sorts output alphabetically by spec-id
 *   - Prints a helpful hint when no specs exist
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import chalk from 'chalk';

import { err, hint, spacer } from '../lib/printer.js';
import { readSpec } from '../lib/specReader.js';

// Column widths — must match what the shell script uses so output is aligned
const COL_ID      = 30;
const COL_MODE    = 10;
const COL_STATUS  = 14;  // 'in-progress' is 11 chars, give a bit of room
const COL_CREATED = 10;

/**
 * Colour a full row string by its status value.
 *
 * @param {string} line
 * @param {string} status
 * @returns {string}
 */
function colourByStatus(line, status) {
  switch (status) {
    case 'draft':       return chalk.yellow(line);
    case 'in-progress': return chalk.blue(line);
    case 'stable':      return chalk.green(line);
    case 'deprecated':  return chalk.dim(line);
    default:            return line;
  }
}

/**
 * Left-pad a string to a fixed column width (truncating if over).
 *
 * @param {string} str
 * @param {number} width
 * @returns {string}
 */
function col(str, width) {
  if (str.length >= width) return str.slice(0, width - 1) + ' ';
  return str.padEnd(width, ' ');
}

/**
 * Handler for `specpact list`.
 */
export function listCommand() {
  const projectRoot = resolve(process.cwd());
  const specsDir    = join(projectRoot, '.sdd', 'specs');

  // ─── Guard: .sdd/specs/ must exist ───────────────────────────────────────
  if (!existsSync(specsDir)) {
    err('No specs directory found at .sdd/specs/');
    hint('Run `specpact init` first, then `specpact new nano <spec-id>` to create a spec.');
    process.exit(1);
  }

  // ─── Collect spec entries ─────────────────────────────────────────────────
  const entries = readdirSync(specsDir)
    .filter((name) => {
      // Skip _-prefixed example directories
      if (name.startsWith('_')) return false;
      // Skip non-directories
      const fullPath = join(specsDir, name);
      if (!statSync(fullPath).isDirectory()) return false;
      // Skip directories without a spec.md
      if (!existsSync(join(fullPath, 'spec.md'))) return false;
      return true;
    })
    .sort(); // Alphabetical order

  // ─── Header ──────────────────────────────────────────────────────────────
  spacer();
  const header =
    col('SPEC ID', COL_ID) +
    col('MODE', COL_MODE) +
    col('STATUS', COL_STATUS) +
    'CREATED';
  const divider =
    col('-'.repeat(COL_ID - 1), COL_ID) +
    col('-'.repeat(COL_MODE - 1), COL_MODE) +
    col('-'.repeat(COL_STATUS - 1), COL_STATUS) +
    '-'.repeat(COL_CREATED);

  console.log(chalk.bold(header));
  console.log(chalk.dim(divider));

  // ─── Rows ─────────────────────────────────────────────────────────────────
  if (entries.length === 0) {
    spacer();
    hint("No specs found. Run 'specpact new nano <spec-id>' to create your first spec.");
    spacer();
    return;
  }

  for (const specId of entries) {
    const specFile = join(specsDir, specId, 'spec.md');
    let mode    = '?';
    let status  = '?';
    let created = '?';

    try {
      const parsed = readSpec(specFile);
      mode    = parsed.data.mode;
      status  = parsed.data.status;
      created = parsed.data.created;
    } catch {
      // If the spec can't be parsed, show '?' fields rather than crashing
    }

    const row =
      col(specId, COL_ID) +
      col(mode, COL_MODE) +
      col(status, COL_STATUS) +
      created;

    console.log(colourByStatus(row, status));
  }

  spacer();
  hint(`${entries.length} spec${entries.length === 1 ? '' : 's'} found.`);
  spacer();
}