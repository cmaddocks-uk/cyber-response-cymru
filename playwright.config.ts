// Playwright config for visual-regression smoke tests against the production
// build. Boots `astro preview` once per run, then drives Chromium against
// http://localhost:4322/cyber-response-cymru/ to capture screenshots of the
// document-renderer output for Governor + Action Plan reports.
//
// Baselines are platform-specific by design (Playwright suffixes them with
// `-${platform}`). The first run for each platform must be acknowledged with
// `npx playwright test --update-snapshots`. CI failures from font rendering
// differences are NOT a regression — they're a baseline mismatch.

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests-e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 30_000,
  expect: {
    // 1.5 % pixel diff tolerance — generous enough to absorb sub-pixel font
    // rasterisation differences between Chromium versions.
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.015,
      animations: 'disabled',
    },
  },
  use: {
    // Trailing slash so `page.goto('governor')` resolves under the
    // /cyber-response-cymru/ base path used by the GitHub-Pages-style deploy.
    baseURL: 'http://localhost:4322/cyber-response-cymru/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 900 },
    locale: 'en-GB',
    timezoneId: 'Europe/London',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // Pin the preview port so Playwright and the server always agree.
    // `astro preview` would otherwise auto-pick the next free port if 4321
    // was in use, leaving Playwright waiting on the wrong URL.
    command: 'npx astro preview --port 4322',
    url: 'http://localhost:4322/cyber-response-cymru',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
