// E2E fixture helper. Loads the current-v2-plan JSON fixture into the page's
// sessionStorage *before* the React island hydrates, so the screenshots show
// a fully-populated report instead of empty placeholders.
//
// Mirrors the storage key in src/lib/storage.ts (STORAGE_KEY).

import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(__dirname, '..', 'tests', 'fixtures', 'current-v2-plan.json');

const STORAGE_KEY = 'cyberResponseState';

let cachedPayload: string | null = null;
function payload(): string {
  if (cachedPayload == null) {
    cachedPayload = readFileSync(FIXTURE, 'utf8');
  }
  return cachedPayload;
}

/** Seed sessionStorage with the v2 fixture, then navigate. Use before each
 *  test that needs a populated incident. */
export async function gotoWithFixture(page: Page, path: string): Promise<void> {
  await page.addInitScript(
    ({ key, value }) => {
      // addInitScript runs in the page context before any JS, so the React
      // islands hydrate against this state.
      sessionStorage.setItem(key, value);
    },
    { key: STORAGE_KEY, value: payload() },
  );
  await page.goto(path);
}
