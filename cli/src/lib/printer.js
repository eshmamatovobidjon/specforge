/**
 * printer.js — ANSI colour helpers for SpecForge CLI output.
 *
 * Provides four semantic output functions:
 *   ok   — green   — success / completion
 *   err  — red     — fatal errors
 *   warn — yellow  — non-fatal warnings
 *   info — blue    — informational messages
 *   hint — dim     — secondary / supplementary text
 */

import chalk from 'chalk';

/**
 * Print a success message (green ✓ prefix).
 * @param {string} message
 */
export function ok(message) {
  console.log(`${chalk.green('✓')} ${message}`);
}

/**
 * Print an error message (red ✗ prefix) and optionally exit.
 * @param {string} message
 * @param {object} [options]
 * @param {boolean} [options.exit=false] - If true, calls process.exit(1) after printing.
 */
export function err(message, { exit: shouldExit = false } = {}) {
  console.error(`${chalk.red('✗')} ${chalk.red(message)}`);
  if (shouldExit) process.exit(1);
}

/**
 * Print a warning message (yellow ⚠ prefix).
 * @param {string} message
 */
export function warn(message) {
  console.warn(`${chalk.yellow('⚠')} ${chalk.yellow(message)}`);
}

/**
 * Print an informational message (blue ℹ prefix).
 * @param {string} message
 */
export function info(message) {
  console.log(`${chalk.blue('ℹ')} ${message}`);
}

/**
 * Print a dimmed hint / secondary text (no prefix).
 * @param {string} message
 */
export function hint(message) {
  console.log(chalk.dim(message));
}

/**
 * Print a blank line.
 */
export function spacer() {
  console.log('');
}

/**
 * Print a section header (bold, underlined).
 * @param {string} title
 */
export function header(title) {
  console.log('');
  console.log(chalk.bold.underline(title));
}