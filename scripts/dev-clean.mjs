// Wipes Vite's optimised-deps cache and Astro's content cache, then boots
// astro dev. The recurring "blank tabs after restructure" symptom we hit
// across the v2.x sessions is always a stale module graph in
// node_modules/.vite/deps — wiping it before each session-after-pull
// fixes it deterministically.
//
//   npm run dev:clean   ← use after pulling, after npm install, or any time
//                         islands hydrate blank
//   npm run dev         ← skip this dance on regular edits

import { rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const PATHS = ['node_modules/.vite', '.astro'];

for (const rel of PATHS) {
  const full = resolve(REPO_ROOT, rel);
  rmSync(full, { recursive: true, force: true });
  console.log(' wiped', rel);
}

console.log('Starting astro dev...');

// Forward the rest of process.argv so flags like --host are honoured.
// Node 24 requires shell:true to resolve `.cmd` on Windows; the deprecation
// warning is harmless given we're invoking a known dev tool, not arbitrary
// user input.
const forwarded = process.argv.slice(2).join(' ');
const cmdLine = `npx astro dev${forwarded ? ' ' + forwarded : ''}`;
const child = spawn(cmdLine, {
  cwd: REPO_ROOT,
  stdio: 'inherit',
  shell: true,
});
child.on('exit', (code) => process.exit(code ?? 0));
