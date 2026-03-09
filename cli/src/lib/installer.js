/**
 * installer.js — Copies SpecForge templates into the target project directory.
 *
 * Handles three template groups:
 *   .sdd/       — core workflow files (scripts, modes, memory, templates, specs examples)
 *   .claude/    — Claude Code slash commands
 *   .github/    — GitHub Copilot agents and prompts
 *
 * Merge strategy:
 *   - .sdd/     : always installed; if --force was passed, overwrite
 *   - .claude/  : merged file-by-file; never clobbers existing user files
 *   - .github/  : merged file-by-file; never clobbers existing user files
 */

import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Absolute path to the bundled templates directory
const TEMPLATES_DIR = join(__dirname, '..', '..', 'templates');

/**
 * Recursively copy all files from src into dest.
 * If merge=true, skip files that already exist in dest.
 *
 * @param {string} src  - source directory (inside templates/)
 * @param {string} dest - destination directory in target project
 * @param {object} options
 * @param {boolean} options.merge   - skip existing files when true
 * @param {boolean} options.force  - overwrite all existing files when true
 * @returns {{ copied: string[], skipped: string[] }}
 */
export function copyDirectory(src, dest, { merge = false, force = false } = {}) {
  const result = { copied: [], skipped: [] };

  if (!existsSync(src)) return result;

  walkAndCopy(src, dest, src, { merge, force }, result);
  return result;
}

function walkAndCopy(src, dest, rootSrc, options, result) {
  mkdirSync(dest, { recursive: true });

  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      walkAndCopy(srcPath, destPath, rootSrc, options, result);
    } else {
      const relPath = relative(rootSrc, srcPath);

      if (options.merge && !options.force && existsSync(destPath)) {
        result.skipped.push(relPath);
      } else {
        mkdirSync(dirname(destPath), { recursive: true });
        copyFileSync(srcPath, destPath);
        result.copied.push(relPath);
      }
    }
  }
}

/**
 * Install .sdd/ into target directory.
 *
 * @param {string} targetDir - absolute path to the project root
 * @param {object} options
 * @param {boolean} options.force
 * @returns {{ copied: string[], skipped: string[] }}
 */
export function installSdd(targetDir, { force = false } = {}) {
  const src = join(TEMPLATES_DIR, '.sdd');
  const dest = join(targetDir, '.sdd');
  return copyDirectory(src, dest, { merge: false, force });
}

/**
 * Install .claude/ into target directory (merge — never clobber).
 *
 * @param {string} targetDir
 * @returns {{ copied: string[], skipped: string[] }}
 */
export function installClaude(targetDir) {
  const src = join(TEMPLATES_DIR, '.claude');
  const dest = join(targetDir, '.claude');
  return copyDirectory(src, dest, { merge: true });
}

/**
 * Install .github/ agents and prompts into target directory (merge — never clobber).
 *
 * @param {string} targetDir
 * @returns {{ copied: string[], skipped: string[] }}
 */
export function installGitHub(targetDir) {
  const src = join(TEMPLATES_DIR, '.github');
  const dest = join(targetDir, '.github');
  return copyDirectory(src, dest, { merge: true });
}

/**
 * Stamp the SpecForge version into .sdd/.specforge-version.
 *
 * @param {string} targetDir
 * @param {string} version
 */
export function writeVersionStamp(targetDir, version) {
  const versionFile = join(targetDir, '.sdd', '.specforge-version');
  writeFileSync(versionFile, version, 'utf8');
}

/**
 * Read the installed SpecForge version from .sdd/.specforge-version.
 * Returns null if the file does not exist.
 *
 * @param {string} targetDir
 * @returns {string|null}
 */
export function readVersionStamp(targetDir) {
  const versionFile = join(targetDir, '.sdd', '.specforge-version');
  if (!existsSync(versionFile)) return null;
  return readFileSync(versionFile, 'utf8').trim();
}