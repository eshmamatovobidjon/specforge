/**
 * smoke.test.js — SpecPact CLI smoke tests
 *
 * Verifies that every command:
 *   1. Exits with the expected code
 *   2. Produces expected output (stdout or stderr)
 *
 * Uses Node's built-in test runner (node:test) — zero extra dependencies.
 * All tests run against a temporary directory so the real project is never touched.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, readFileSync, cpSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BIN = resolve(__dirname, '..', 'bin', 'specpact.js');

// ── Helper: run the CLI in a given directory ──────────────────────────────────

function run(args, { cwd = process.cwd(), expectFail = false } = {}) {
  const result = spawnSync(process.execPath, [BIN, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });

  if (!expectFail && result.status !== 0) {
    throw new Error(
      `CLI exited ${result.status}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`
    );
  }

  return result;
}

// ── Helper: set up a minimal .sdd/ structure in a temp dir ───────────────────

function scaffoldSdd(dir) {
  // Copy templates from the bundled location into the temp dir
  const templatesDir = resolve(__dirname, '..', 'templates');
  cpSync(join(templatesDir, '.sdd'), join(dir, '.sdd'), { recursive: true });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('specpact --version', () => {
  it('prints the version string', () => {
    const result = run(['--version']);
    assert.match(result.stdout, /\d+\.\d+\.\d+/);
    assert.equal(result.status, 0);
  });
});

describe('specpact --help', () => {
  it('prints usage information', () => {
    const result = run(['--help']);
    assert.match(result.stdout, /specpact/i);
    assert.match(result.stdout, /init/);
    assert.match(result.stdout, /new/);
    assert.match(result.stdout, /list/);
    assert.match(result.stdout, /verify/);
    assert.match(result.stdout, /update/);
    assert.equal(result.status, 0);
  });
});

describe('specpact new', () => {
  let tmpDir;

  before(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'specpact-test-'));
    scaffoldSdd(tmpDir);
  });

  after(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates a nano spec', () => {
    run(['new', 'nano', 'fix-test-bug'], { cwd: tmpDir });
    assert.ok(existsSync(join(tmpDir, '.sdd', 'specs', 'fix-test-bug', 'spec.md')));
  });

  it('creates a feature spec with notes.md', () => {
    run(['new', 'feature', 'my-feature'], { cwd: tmpDir });
    assert.ok(existsSync(join(tmpDir, '.sdd', 'specs', 'my-feature', 'spec.md')));
    assert.ok(existsSync(join(tmpDir, '.sdd', 'specs', 'my-feature', 'notes.md')));
  });

  it('creates a system spec with notes.md', () => {
    run(['new', 'system', 'my-arch'], { cwd: tmpDir });
    assert.ok(existsSync(join(tmpDir, '.sdd', 'specs', 'my-arch', 'spec.md')));
    assert.ok(existsSync(join(tmpDir, '.sdd', 'specs', 'my-arch', 'notes.md')));
  });

  it('stamps the spec with today\'s date', () => {
    run(['new', 'nano', 'date-check'], { cwd: tmpDir });
    const content = readFileSync(
      join(tmpDir, '.sdd', 'specs', 'date-check', 'spec.md'), 'utf8'
    );
    const today = new Date().toISOString().slice(0, 10);
    assert.ok(content.includes(today), `spec.md should contain today's date ${today}`);
  });

  it('stamps the spec with the provided spec-id', () => {
    const specId = 'id-stamp-check';
    run(['new', 'nano', specId], { cwd: tmpDir });
    const content = readFileSync(
      join(tmpDir, '.sdd', 'specs', specId, 'spec.md'), 'utf8'
    );
    assert.ok(content.includes(specId), `spec.md should contain spec-id ${specId}`);
    assert.ok(!content.includes('[SPEC_ID]'), 'spec.md should not contain [SPEC_ID] placeholder');
  });

  it('rejects an invalid mode', () => {
    const result = run(['new', 'invalid-mode', 'some-spec'], { cwd: tmpDir, expectFail: true });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /unknown mode/i);
  });

  it('rejects an invalid spec-id', () => {
    const result = run(['new', 'nano', 'Invalid_ID'], { cwd: tmpDir, expectFail: true });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /invalid spec-id/i);
  });

  it('rejects a duplicate spec-id', () => {
    run(['new', 'nano', 'duplicate-spec'], { cwd: tmpDir });
    const result = run(['new', 'nano', 'duplicate-spec'], { cwd: tmpDir, expectFail: true });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /already exists/i);
  });
});

describe('specpact list', () => {
  let tmpDir;

  before(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'specpact-test-'));
    scaffoldSdd(tmpDir);
  });

  after(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('runs without error when no user specs exist', () => {
    const result = run(['list'], { cwd: tmpDir });
    assert.equal(result.status, 0);
  });

  it('shows created specs', () => {
    run(['new', 'nano', 'listed-spec'], { cwd: tmpDir });
    const result = run(['list'], { cwd: tmpDir });
    assert.match(result.stdout, /listed-spec/);
    assert.equal(result.status, 0);
  });
});

describe('specpact verify', () => {
  let tmpDir;

  before(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'specpact-test-'));
    scaffoldSdd(tmpDir);
    run(['new', 'nano', 'verify-me'], { cwd: tmpDir });
  });

  after(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('outputs a verification prompt to stdout', () => {
    const result = run(['verify', 'verify-me'], { cwd: tmpDir });
    assert.match(result.stdout, /Verification Prompt/i);
    assert.match(result.stdout, /verify-me/);
    assert.equal(result.status, 0);
  });

  it('exits 1 for a non-existent spec', () => {
    const result = run(['verify', 'does-not-exist'], { cwd: tmpDir, expectFail: true });
    assert.equal(result.status, 1);
  });
});

describe('specpact update', () => {
  let tmpDir;

  before(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'specpact-test-'));
    scaffoldSdd(tmpDir);
    run(['new', 'nano', 'update-me'], { cwd: tmpDir });
  });

  after(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('shows current status when no status arg given', () => {
    const result = run(['update', 'update-me'], { cwd: tmpDir });
    assert.match(result.stdout, /draft/i);
    assert.equal(result.status, 0);
  });

  it('updates status to in-progress', () => {
    run(['update', 'update-me', 'in-progress'], { cwd: tmpDir });
    const content = readFileSync(
      join(tmpDir, '.sdd', 'specs', 'update-me', 'spec.md'), 'utf8'
    );
    assert.match(content, /in-progress/);
  });

  it('rejects an invalid status', () => {
    const result = run(['update', 'update-me', 'invalid-status'], { cwd: tmpDir, expectFail: true });
    assert.equal(result.status, 1);
  });

  it('exits 1 for a non-existent spec', () => {
    const result = run(['update', 'does-not-exist', 'stable'], { cwd: tmpDir, expectFail: true });
    assert.equal(result.status, 1);
  });
});
