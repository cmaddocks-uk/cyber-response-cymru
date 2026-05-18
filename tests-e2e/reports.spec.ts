// Visual-regression smoke tests against the production build.
//
//   npm run e2e             # run tests
//   npm run e2e:update      # accept current rendering as the new baseline
//
// Each test:
//   1. Seeds sessionStorage with tests/fixtures/current-v2-plan.json so
//      the page hydrates against a fully-populated incident.
//   2. Waits for the rendered document.
//   3. Takes a full-page screenshot of the .plan-doc surface — that's the
//      executive-report canvas. Excluding the toolbar / TOC keeps the
//      baseline focused on the rendered report, not on chrome that might
//      change for unrelated reasons.

import { expect, test } from '@playwright/test';
import { gotoWithFixture } from './fixtures';

test.describe('Document renderer · screen output', () => {
  test('Governor / Trustee report', async ({ page }) => {
    await gotoWithFixture(page, 'governor');
    const doc = page.locator('.plan-doc').first();
    await expect(doc).toBeVisible();
    await expect(doc).toHaveScreenshot('governor.png');
  });

  test('Prioritised Action Plan', async ({ page }) => {
    await gotoWithFixture(page, 'action-plan');
    const doc = page.locator('.plan-doc').first();
    await expect(doc).toBeVisible();
    await expect(doc).toHaveScreenshot('action-plan.png');
  });

  test('First 30 Minutes laminate card', async ({ page }) => {
    // First 30 deliberately uses the bespoke single-A4 laminate card on
    // screen, not the unified DocumentRenderer. Target `.first30-card`.
    await gotoWithFixture(page, 'first-30');
    const card = page.locator('.first30-card').first();
    await expect(card).toBeVisible();
    await expect(card).toHaveScreenshot('first-30.png');
  });

  test('Your Plan (output)', async ({ page }) => {
    await gotoWithFixture(page, 'output');
    const doc = page.locator('.plan-doc').first();
    await expect(doc).toBeVisible();
    await expect(doc).toHaveScreenshot('your-plan.png');
  });
});

test.describe('Cover page · editorial v2.5.2 contract', () => {
  test('cover renders the editorial slots: hero (logo, title, school, prepared-for, meta row) + footer (rule + prepared-by)', async ({ page }) => {
    await gotoWithFixture(page, 'governor');
    const cover = page.locator('.doc-cover').first();
    await expect(cover).toBeVisible();
    await expect(cover.locator('.doc-cover-title')).toBeVisible();
    await expect(cover.locator('.doc-cover-subtitle')).toBeVisible();
    await expect(cover.locator('.doc-cover-preparedfor')).toBeVisible();
    await expect(cover.locator('.doc-cover-meta')).toBeVisible();
    await expect(cover.locator('.doc-cover-rule')).toBeVisible();
    await expect(cover.locator('.doc-cover-preparedby')).toBeVisible();
  });

  test('cover does NOT render dashboard / SaaS-export elements', async ({ page }) => {
    await gotoWithFixture(page, 'governor');
    const cover = page.locator('.doc-cover').first();
    // Eyebrow, readiness statement, operational statement, next-review line,
    // snapshot tag, v2.4 strip, v2.5.1 confidentiality — all retired.
    await expect(cover.locator('.doc-cover-eyebrow')).toHaveCount(0);
    await expect(cover.locator('.doc-cover-readiness')).toHaveCount(0);
    await expect(cover.locator('.doc-cover-statement')).toHaveCount(0);
    await expect(cover.locator('.doc-cover-nextreview')).toHaveCount(0);
    await expect(cover.locator('.doc-cover-strip')).toHaveCount(0);
    await expect(cover.locator('.doc-cover-summary')).toHaveCount(0);
    await expect(cover.locator('.doc-cover-snapshot-tag')).toHaveCount(0);
    await expect(cover.locator('.doc-cover-confidential')).toHaveCount(0);
    await expect(cover.locator('.doc-cover-attribution')).toHaveCount(0);
    await expect(cover.locator('.doc-cover-date')).toHaveCount(0);
  });
});
