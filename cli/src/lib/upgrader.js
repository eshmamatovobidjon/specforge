/**
 * upgrader.js — Diff bundled SpecPact templates against installed versions.
 *
 * Upgrade scope (only these two directories are ever written):
 *   .sdd/scripts/   — shell scripts that wrap CLI workflow commands
 *   .sdd/modes/     — AI mode rule files (nano.md, feature.md, system.md)
 *
 * Protected forever (never read or written by upgrader):
 *   .sdd/memory/    — user's project context (AGENTS.md, architecture, decisions)
 *   .sdd/specs/     — user's spec files
 *   .sdd/templates/ — spec templates (change rarely; user may customise them)
 *
 * Diff categories per file:
 *   MODIFIED  — file exists in both, content differs
 *   NEW       — file exists in bundled templates but not in installed project
 *   UNCHANGED — file exists in both, content identical
 *   EXTRA     — file exists in installed project but not in bundled templates
 *               (reported only; never deleted)
 *
 * Line-ending normalisation: CRLF → LF before comparison so Windows-authored
 * files don't show as changed on macOS/Linux and vice versa.
 *
 * Diff algorithm: Myers shortest-edit-script, implemented in pure Node.js.
 * No shell exec, no external diff binary, no npm packages.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const TEMPLATES_DIR = join(__dirname, '..', '..', 'templates');
const UPGRADE_SCOPE = ['scripts', 'modes'];
const CONTEXT_LINES = 3;

// ─── Primary export ───────────────────────────────────────────────────────────

export function buildUpgradePlan(projectRoot, bundledVersion) {
  const sddInstalled = join(projectRoot, '.sdd');
  const sddBundled   = join(TEMPLATES_DIR, '.sdd');
  const versionFile  = join(sddInstalled, '.specpact-version');

  const installedVersion = existsSync(versionFile)
    ? readFileSync(versionFile, 'utf8').trim()
    : 'unknown';

  const diffs = [];

  for (const scope of UPGRADE_SCOPE) {
    const bundledDir   = join(sddBundled,   scope);
    const installedDir = join(sddInstalled, scope);

    const bundledFiles   = existsSync(bundledDir)   ? collectFiles(bundledDir,   bundledDir)   : [];
    const installedFiles = existsSync(installedDir) ? collectFiles(installedDir, installedDir) : [];

    const bundledSet   = new Set(bundledFiles.map(f => f.rel));
    const installedSet = new Set(installedFiles.map(f => f.rel));

    for (const { rel, abs: bundledAbs } of bundledFiles) {
      const installedAbs = join(installedDir, rel);
      const relPath      = join(scope, rel);

      if (!installedSet.has(rel)) {
        diffs.push({ relPath, status: 'NEW', bundledPath: bundledAbs, installedPath: installedAbs, hunks: null });
      } else {
        const bundledContent   = normalise(readFileSync(bundledAbs,   'utf8'));
        const installedContent = normalise(readFileSync(installedAbs, 'utf8'));

        if (bundledContent === installedContent) {
          diffs.push({ relPath, status: 'UNCHANGED', bundledPath: bundledAbs, installedPath: installedAbs, hunks: null });
        } else {
          diffs.push({ relPath, status: 'MODIFIED',  bundledPath: bundledAbs, installedPath: installedAbs,
                       hunks: computeHunks(installedContent, bundledContent) });
        }
      }
    }

    for (const { rel, abs: installedAbs } of installedFiles) {
      if (!bundledSet.has(rel)) {
        diffs.push({ relPath: join(scope, rel), status: 'EXTRA', bundledPath: null, installedPath: installedAbs, hunks: null });
      }
    }
  }

  const order = { MODIFIED: 0, NEW: 1, UNCHANGED: 2, EXTRA: 3 };
  diffs.sort((a, b) => order[a.status] - order[b.status] || a.relPath.localeCompare(b.relPath));

  const toApply = diffs.filter(d => d.status === 'MODIFIED' || d.status === 'NEW');
  return { diffs, toApply, installedVersion, bundledVersion };
}

// ─── Diff computation ─────────────────────────────────────────────────────────

export function computeHunks(oldText, newText) {
  const splitLines = (t) => {
    const lines = (t || '').split('\n');
    if (lines.length && lines[lines.length - 1] === '') lines.pop();
    return lines;
  };
  const oldLines = splitLines(oldText);
  const newLines = splitLines(newText);
  const editOps  = myersDiff(oldLines, newLines);
  return editOps.length ? buildHunkGroups(editOps, oldLines, newLines) : [];
}

// ─── Myers diff ───────────────────────────────────────────────────────────────

function myersDiff(a, b) {
  const N = a.length, M = b.length, MAX = N + M;
  if (MAX === 0) return [];

  const V     = new Array(2 * MAX + 2).fill(0);
  const trace = [];

  outer: for (let d = 0; d <= MAX; d++) {
    trace.push(V.slice());
    for (let k = -d; k <= d; k += 2) {
      const ki = k + MAX;
      let x = (k === -d || (k !== d && V[ki - 1] < V[ki + 1])) ? V[ki + 1] : V[ki - 1] + 1;
      let y = x - k;
      while (x < N && y < M && a[x] === b[y]) { x++; y++; }
      V[ki] = x;
      if (x >= N && y >= M) break outer;
    }
  }

  // Backtrack
  const path = [];
  let x = a.length, y = b.length;
  for (let d = trace.length - 1; d >= 0; d--) {
    const Vd = trace[d];
    const k  = x - y;
    const ki = k + MAX;
    const prevK = (k === -d || (k !== d && Vd[ki - 1] < Vd[ki + 1])) ? k + 1 : k - 1;
    const prevX = Vd[prevK + MAX];
    const prevY = prevX - prevK;
    path.unshift({ d, k, prevK, x, y, prevX, prevY });
    x = prevX; y = prevY;
  }

  // Convert path to operations
  const ops = [];
  for (const { d, k, prevK, x, y, prevX, prevY } of path) {
    if (d > 0) {
      if (prevK === k - 1) {
        // delete: right move from (prevX, prevY) to (prevX+1, prevY)
        ops.push({ type: 'delete', oldIdx: prevX });
        for (let i = 0; i < x - prevX - 1; i++)
          ops.push({ type: 'equal', oldIdx: prevX + 1 + i, newIdx: prevY + i });
      } else {
        // insert: down move from (prevX, prevY) to (prevX, prevY+1)
        ops.push({ type: 'insert', newIdx: prevY });
        for (let i = 0; i < x - prevX; i++)
          ops.push({ type: 'equal', oldIdx: prevX + i, newIdx: prevY + 1 + i });
      }
    } else {
      for (let i = 0; i < x; i++)
        ops.push({ type: 'equal', oldIdx: i, newIdx: i });
    }
  }
  return ops;
}

// ─── Hunk builder ─────────────────────────────────────────────────────────────

function buildHunkGroups(ops, oldLines, newLines) {
  const flat = ops.map(op => {
    if (op.type === 'equal')  return { type: ' ', text: oldLines[op.oldIdx], oldIdx: op.oldIdx, newIdx: op.newIdx };
    if (op.type === 'delete') return { type: '-', text: oldLines[op.oldIdx], oldIdx: op.oldIdx, newIdx: undefined };
    return                           { type: '+', text: newLines[op.newIdx], oldIdx: undefined,  newIdx: op.newIdx };
  });

  const changedIdx = flat.map((l, i) => l.type !== ' ' ? i : -1).filter(i => i !== -1);
  if (changedIdx.length === 0) return [];

  const ranges = [];
  let s = Math.max(0, changedIdx[0] - CONTEXT_LINES);
  let e = Math.min(flat.length - 1, changedIdx[0] + CONTEXT_LINES);

  for (let i = 1; i < changedIdx.length; i++) {
    const ci = changedIdx[i];
    if (ci - CONTEXT_LINES <= e + 1) {
      e = Math.min(flat.length - 1, ci + CONTEXT_LINES);
    } else {
      ranges.push([s, e]);
      s = Math.max(0, ci - CONTEXT_LINES);
      e = Math.min(flat.length - 1, ci + CONTEXT_LINES);
    }
  }
  ranges.push([s, e]);

  return ranges.map(([start, end]) => {
    const lines    = flat.slice(start, end + 1);
    const firstOld = lines.find(l => l.oldIdx !== undefined);
    const firstNew = lines.find(l => l.newIdx !== undefined);
    return {
      startBundled:   (firstNew?.newIdx ?? 0) + 1,
      startInstalled: (firstOld?.oldIdx ?? 0) + 1,
      lines: lines.map(l => ({ type: l.type, text: l.text })),
    };
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function collectFiles(dir, rootDir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const abs  = join(dir, entry);
    const stat = statSync(abs);
    if (stat.isDirectory()) {
      results.push(...collectFiles(abs, rootDir));
    } else {
      results.push({ rel: relative(rootDir, abs), abs });
    }
  }
  return results;
}

function normalise(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}