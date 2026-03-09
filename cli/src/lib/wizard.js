/**
 * wizard.js — Four-question Memory Bank setup wizard.
 *
 * Asks the developer four questions and returns their answers for
 * stamping into .sdd/memory/AGENTS.md after installation.
 *
 * Questions:
 *   1. Project name
 *   2. Project type  (web-app | api | library | cli | mobile | other)
 *   3. Primary language / stack
 *   4. One-sentence project purpose
 */

import inquirer from 'inquirer';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { info, hint, spacer } from './printer.js';

const PROJECT_TYPES = [
  { name: 'Web application  (React, Vue, Next.js, etc.)', value: 'web-app' },
  { name: 'API / backend service', value: 'api' },
  { name: 'Library / SDK', value: 'library' },
  { name: 'CLI tool', value: 'cli' },
  { name: 'Mobile application', value: 'mobile' },
  { name: 'Other', value: 'other' },
];

/**
 * Run the interactive Memory Bank wizard.
 *
 * @returns {Promise<{ name: string, type: string, language: string, purpose: string }>}
 */
export async function runWizard() {
  spacer();
  info('Memory Bank setup — answer four questions to personalise SpecForge for this project.');
  hint('  You can edit these answers later in .sdd/memory/AGENTS.md');
  spacer();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      validate: (input) => input.trim().length > 0 || 'Project name cannot be empty.',
    },
    {
      type: 'list',
      name: 'type',
      message: 'Project type:',
      choices: PROJECT_TYPES,
    },
    {
      type: 'input',
      name: 'language',
      message: 'Primary language / stack (e.g. "TypeScript, Node.js, PostgreSQL"):',
      validate: (input) => input.trim().length > 0 || 'Please describe your stack.',
    },
    {
      type: 'input',
      name: 'purpose',
      message: 'One-sentence description of what this project does:',
      validate: (input) => input.trim().length > 0 || 'Please describe the project purpose.',
    },
  ]);

  return {
    name: answers.name.trim(),
    type: answers.type,
    language: answers.language.trim(),
    purpose: answers.purpose.trim(),
  };
}

/**
 * Stamp wizard answers into the installed AGENTS.md.
 *
 * Replaces placeholder tokens that match the template's markers.
 *
 * @param {string} targetDir - absolute path to project root
 * @param {{ name: string, type: string, language: string, purpose: string }} answers
 */
export function stampAgents(targetDir, answers) {
  const agentsPath = join(targetDir, '.sdd', 'memory', 'AGENTS.md');

  if (!existsSync(agentsPath)) return;

  let content = readFileSync(agentsPath, 'utf8');

  content = content
    .replace(/\[PROJECT_NAME\]/g, answers.name)
    .replace(/\[PROJECT_TYPE\]/g, answers.type)
    .replace(/\[PRIMARY_LANGUAGES\]/g, answers.language)
    .replace(/\[PROJECT_PURPOSE\]/g, answers.purpose);

  writeFileSync(agentsPath, content, 'utf8');
}