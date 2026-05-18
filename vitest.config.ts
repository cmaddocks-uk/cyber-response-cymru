import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Vitest config kept minimal. Tests are TS run under jsdom only where they
// need DOM/browser globals — most tests are pure-function and use 'node'.
//
// Path alias `~/` mirrors tsconfig.json so test imports look the same as
// the source they exercise.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Only the deterministic layers we actually own. React components,
      // Astro pages and bundled vendor code are deliberately excluded —
      // their coverage would dilute the engine/selector/document-model
      // signal that this report exists to track.
      include: [
        'src/lib/engine/**/*.ts',
        'src/lib/selectors/**/*.ts',
        'src/lib/document-model/**/*.ts',
        'src/lib/schema.ts',
        'src/lib/plan-fields.ts',
        'src/lib/logo.ts',
        'src/lib/download.ts',
        'src/lib/escape.ts',
      ],
      exclude: [
        'src/lib/document-model/word.ts', // exercised by smoke test only
      ],
    },
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
