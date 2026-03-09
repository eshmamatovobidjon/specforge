/**
 * verify.js — specforge verify <spec-id>
 *
 * Reads the spec file and outputs a structured verification prompt to stdout.
 * The developer pastes this output into their AI tool.
 *
 * Full Node.js reimplementation of .sdd/scripts/verify.sh — no shell exec.
 *
 * Output goes to stdout so it can be piped or redirected:
 *   specforge verify my-spec | pbcopy
 *   specforge verify my-spec > verify-prompt.md
 *
 * Diagnostic messages (guards, errors) go to stderr so they don't pollute
 * the prompt when piped.
 */

import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

import { err, hint } from '../lib/printer.js';
import { readSpec } from '../lib/specReader.js';

/**
 * Handler for `specforge verify <spec-id>`.
 *
 * @param {string} specId
 */
export function verifyCommand(specId) {
  const projectRoot = resolve(process.cwd());
  const specsDir    = join(projectRoot, '.sdd', 'specs');
  const specFile    = join(specsDir, specId, 'spec.md');

  // ─── Guard: spec must exist ───────────────────────────────────────────────
  if (!existsSync(specFile)) {
    err(`No spec found at .sdd/specs/${specId}/spec.md`);
    hint(`Run 'specforge list' to see available specs.`);
    process.exit(1);
  }

  // ─── Read spec ────────────────────────────────────────────────────────────
  let parsed;
  try {
    parsed = readSpec(specFile);
  } catch (e) {
    err(`Failed to read spec: ${e.message}`);
    process.exit(1);
  }

  // Also read AGENTS.md if it exists — append it so the AI tool has context
  const agentsFile = join(projectRoot, '.sdd', 'memory', 'AGENTS.md');
  const hasAgents  = existsSync(agentsFile);
  const agentsContent = hasAgents ? readFileSync(agentsFile, 'utf8') : null;

  // ─── Emit prompt to stdout ────────────────────────────────────────────────
  // Everything below goes to stdout. Diagnostic output above uses stderr via
  // printer.js (console.error).  This means `specforge verify id | pbcopy`
  // captures only the prompt, not the error decorations.

  const lines = [];

  lines.push(`# Verification Prompt: ${specId}`);
  lines.push('');
  lines.push('Paste the following into your AI tool to verify the implementation.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('Read the spec below and audit the current codebase against every');
  lines.push('numbered contract. For each contract, assign one verdict:');
  lines.push('');
  lines.push('  ✓  PASS    — implementation clearly satisfies the contract (cite file:line)');
  lines.push('  ~  PARTIAL — partially satisfied (describe what is missing)');
  lines.push('  ✗  FAIL    — not satisfied or contradicted (describe the gap)');
  lines.push('  ?  UNKNOWN — cannot verify statically (explain why)');
  lines.push('');
  lines.push('Then check the implementation files against every constraint in AGENTS.md.');
  lines.push('');
  lines.push('Output a Markdown report with:');
  lines.push('  1. Contract audit table: # | Contract | Verdict | Evidence / Notes');
  lines.push('  2. AGENTS.md compliance table: Constraint | Status | Notes');
  lines.push('  3. Summary: total contracts, pass/partial/fail/unknown counts, overall verdict');
  lines.push('  4. Next steps (what to fix before marking stable, or confirm ready)');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`## Spec: ${specId}`);
  lines.push('');
  // Emit the raw spec content exactly (including its own front matter)
  lines.push(parsed.raw.trimEnd());

  if (agentsContent) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## AGENTS.md (project conventions)');
    lines.push('');
    lines.push(agentsContent.trimEnd());
  }

  // Write to stdout directly — bypasses console.log so no trailing newline issues
  process.stdout.write(lines.join('\n') + '\n');
}