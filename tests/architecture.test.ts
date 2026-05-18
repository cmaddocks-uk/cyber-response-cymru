// Architecture fitness tests. Enforce the layering rules described in
// MIGRATION.md / the architecture review:
//
//   - data/  and  lib/  must not import React.
//   - sessionStorage must be touched only in lib/storage.ts.
//   - Components must not call getState() directly — go via hooks so
//     subscription semantics are preserved.
//   - The "engine" reorganisation must not leave stragglers at lib/ root.
//
// These run under Node, no JSDOM. The tests walk the source tree with fs.
// Any new violation here points to a concrete file/line — fix it rather
// than relaxing the rule without thinking.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(REPO_ROOT, 'src');

function walk(dir: string, exts: readonly string[]): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full, exts));
    } else if (exts.some((e) => entry.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

function relSrc(file: string): string {
  return relative(SRC, file).split(sep).join('/');
}

function read(file: string): string {
  return readFileSync(file, 'utf8');
}

// Returns the file's source with line and block comments stripped out, so a
// code-block comment that mentions a forbidden token (e.g. "Components must
// not call getState()") doesn't trip the fitness checks.
function stripComments(source: string): string {
  // Block comments first (greedy across lines), then line comments.
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

// ---------------------------------------------------------------------------

describe('architecture fitness', () => {
  it('lib/ and data/ must not import React', () => {
    const files = [
      ...walk(join(SRC, 'lib'), ['.ts', '.tsx']),
      ...walk(join(SRC, 'data'), ['.ts', '.tsx']),
    ];
    const offenders: string[] = [];
    const reactImport = /from\s+['"]react['"]/;
    for (const file of files) {
      if (reactImport.test(stripComments(read(file)))) offenders.push(relSrc(file));
    }
    expect(offenders, `React imports leaking into lib/ or data/: ${offenders.join(', ')}`).toEqual([]);
  });

  it('sessionStorage is touched only inside lib/storage.ts', () => {
    const files = walk(SRC, ['.ts', '.tsx']);
    const offenders: string[] = [];
    const allowed = join('lib', 'storage.ts').split(sep).join('/');
    for (const file of files) {
      const rel = relSrc(file);
      if (rel === allowed) continue;
      const content = stripComments(read(file));
      if (/\bsessionStorage\s*\./.test(content)) offenders.push(rel);
      if (/\bsessionStorage\s*\[/.test(content)) offenders.push(rel);
    }
    expect(offenders, `sessionStorage accessed outside lib/storage.ts: ${offenders.join(', ')}`).toEqual([]);
  });

  it('components must not call getState() directly — go via hooks', () => {
    const files = walk(join(SRC, 'components'), ['.ts', '.tsx']);
    const offenders: string[] = [];
    for (const file of files) {
      const content = stripComments(read(file));
      if (/\bgetState\s*\(\s*\)/.test(content)) offenders.push(relSrc(file));
    }
    expect(offenders, `Components calling getState() directly: ${offenders.join(', ')}`).toEqual([]);
  });

  it('engine and selectors are reachable; no legacy duplicates at lib/ root', () => {
    const legacyPaths = [
      'cyber-essentials.ts',
      'governor-verdict.ts',
      'plan-completion.ts',
    ];
    const offenders: string[] = [];
    const files = readdirSync(join(SRC, 'lib'));
    for (const legacy of legacyPaths) {
      if (files.includes(legacy)) offenders.push(legacy);
    }
    expect(offenders, `Legacy lib/ files still present: ${offenders.join(', ')}`).toEqual([]);
  });

  it('selectors must not import from React (pure functions only)', () => {
    const dir = join(SRC, 'lib', 'selectors');
    const files = walk(dir, ['.ts']);
    const offenders: string[] = [];
    for (const file of files) {
      if (/from\s+['"]react['"]/.test(read(file))) offenders.push(relSrc(file));
    }
    expect(offenders, `Selectors importing React: ${offenders.join(', ')}`).toEqual([]);
  });

  it('engine must not import from selectors or components (one-way dependency)', () => {
    const files = walk(join(SRC, 'lib', 'engine'), ['.ts']);
    const offenders: string[] = [];
    for (const file of files) {
      const content = read(file);
      if (/from\s+['"]~?\/?lib\/selectors/.test(content)) offenders.push(`${relSrc(file)} → selectors`);
      if (/from\s+['"]~?\/?components/.test(content)) offenders.push(`${relSrc(file)} → components`);
      if (/from\s+['"]~?\/?state\//.test(content)) offenders.push(`${relSrc(file)} → state`);
    }
    expect(offenders, `Engine reaching upward: ${offenders.join(', ')}`).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Components consume selectors only — never the engine or data/readiness
  // directly. The selectors/plan-status module re-exports the few helpers
  // that components legitimately need (ragForScore, getCeStatusSummary,
  // getOverallCompletion, getSectionCompletion). Components calling those
  // engine functions directly bypass the layering and break the rule that
  // "if the test fails, fix the file/line — don't relax the rule."
  // -------------------------------------------------------------------------
  it('components must not import from ~/lib/engine/* directly', () => {
    const files = walk(join(SRC, 'components'), ['.ts', '.tsx']);
    const offenders: string[] = [];
    const re = /from\s+['"]~\/lib\/engine\//;
    for (const file of files) {
      if (re.test(stripComments(read(file)))) offenders.push(relSrc(file));
    }
    expect(
      offenders,
      `Components importing from ~/lib/engine: ${offenders.join(', ')}`,
    ).toEqual([]);
  });

  it('components must not import ragForScore from ~/data/readiness (use plan-status selector)', () => {
    const files = walk(join(SRC, 'components'), ['.ts', '.tsx']);
    const offenders: string[] = [];
    // Importing the static metadata (FRAMEWORK_META, READINESS, type
    // ReadinessQuestion / Framework / RagBand) from ~/data/readiness is
    // fine — these are pure data and types. Only the rule function
    // `ragForScore` is forbidden in components.
    const re = /import\s+\{[^}]*\bragForScore\b[^}]*\}\s+from\s+['"]~\/data\/readiness['"]/;
    for (const file of files) {
      if (re.test(stripComments(read(file)))) offenders.push(relSrc(file));
    }
    expect(
      offenders,
      `Components importing ragForScore from data/readiness: ${offenders.join(', ')}`,
    ).toEqual([]);
  });

  it('tabletop components consume the tabletop-run selector, not plan-fields helpers', () => {
    const dir = join(SRC, 'components', 'tabletop');
    const files = walk(dir, ['.ts', '.tsx']);
    const offenders: string[] = [];
    const re = /from\s+['"]~\/lib\/plan-fields['"]/;
    for (const file of files) {
      if (re.test(stripComments(read(file)))) offenders.push(relSrc(file));
    }
    expect(
      offenders,
      `Tabletop components importing plan-fields directly: ${offenders.join(', ')}`,
    ).toEqual([]);
  });

  it('toolbars must not query the DOM for business state (.plan-empty / placeholder counters)', () => {
    // Specifically: no `querySelector*('.plan-empty')`. The gap count
    // belongs in the selector layer (getOverallStatus(plan).total - filled).
    const files = walk(join(SRC, 'components'), ['.ts', '.tsx']);
    const offenders: string[] = [];
    const re = /querySelector(?:All)?\s*\(\s*['"`]\.plan-empty/;
    for (const file of files) {
      if (re.test(stripComments(read(file)))) offenders.push(relSrc(file));
    }
    expect(
      offenders,
      `Components querying .plan-empty for business state: ${offenders.join(', ')}`,
    ).toEqual([]);
  });

  it('only one Word export pipeline exists (no src/lib/word-export.ts)', () => {
    const legacy = join(SRC, 'lib', 'word-export.ts');
    const files = readdirSync(join(SRC, 'lib'));
    expect(files).not.toContain('word-export.ts');
    void legacy;
  });
});
