// Smoke tests for the new v2.3 block types — exercising the Word renderer
// path so the dispatcher doesn't silently drop a block kind it doesn't know
// about. Each test builds a minimal report containing one of the new blocks
// and verifies exportReportToWord resolves without throwing.

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Packer } from 'docx';
import { exportReportToWord } from '~/lib/document-model/word';
import type { IncidentReport } from '~/lib/document-model/types';

beforeEach(() => {
  HTMLAnchorElement.prototype.click = vi.fn();
  URL.createObjectURL = vi.fn(() => 'blob:stub');
  URL.revokeObjectURL = vi.fn();
});

function makeReport(body: IncidentReport['sections'][number]): IncidentReport {
  return {
    documentTitle: 'Blocks Test',
    filenameBase: 'blocks',
    sections: [
      { kind: 'cover', eyebrow: 'Test', title: 'Test', logo: '', meta: [] },
      body,
    ],
  };
}

describe('v2.3 block types — Word renderer', () => {
  it('metricCards builds without throwing', async () => {
    await expect(
      exportReportToWord(makeReport({
        kind: 'body',
        title: 'Cards',
        blocks: [
          {
            kind: 'metricCards',
            cards: [
              { label: 'Readiness', value: '78%', severity: 'green', hint: 'of 16' },
              { label: 'Red gaps', value: '2', severity: 'red' },
            ],
          },
        ],
      })),
    ).resolves.toBeUndefined();
  });

  it('progress builds without throwing', async () => {
    await expect(
      exportReportToWord(makeReport({
        kind: 'body',
        title: 'Progress',
        blocks: [
          { kind: 'progress', label: 'Readiness', value: 0.78, severity: 'amber', trailing: '12/16' },
          { kind: 'progress', label: 'Out of range', value: -0.5 },
          { kind: 'progress', label: 'Saturated', value: 99 },
        ],
      })),
    ).resolves.toBeUndefined();
  });

  it('timeline builds without throwing', async () => {
    await expect(
      exportReportToWord(makeReport({
        kind: 'body',
        title: 'Timeline',
        blocks: [
          {
            kind: 'timeline',
            events: [
              { time: '08:41', title: 'Phishing email received', severity: 'red', body: 'First reported by Y8 form tutor.' },
              { time: '09:12', title: 'Compromise confirmed', severity: 'amber' },
              { time: '10:05', title: 'Password reset enforced', severity: 'green' },
            ],
          },
        ],
      })),
    ).resolves.toBeUndefined();
  });

  it('callout block builds (severity + title + body)', async () => {
    await expect(
      exportReportToWord(makeReport({
        kind: 'body',
        title: 'Callout',
        blocks: [
          { kind: 'callout', severity: 'red', title: 'Critical', body: 'Backups have not been tested in 9 months.' },
          { kind: 'callout', severity: 'green', body: 'CIRT is fully populated.' },
        ],
      })),
    ).resolves.toBeUndefined();
  });

  it('divider with and without label', async () => {
    await expect(
      exportReportToWord(makeReport({
        kind: 'body',
        title: 'Dividers',
        blocks: [
          { kind: 'divider' },
          { kind: 'divider', label: 'Section 2 · CIRT' },
        ],
      })),
    ).resolves.toBeUndefined();
  });

  it('metricCards with no severity uses neutral navy treatment', async () => {
    await expect(
      exportReportToWord(makeReport({
        kind: 'body',
        title: 'Cards',
        blocks: [{ kind: 'metricCards', cards: [{ label: 'A', value: '1' }] }],
      })),
    ).resolves.toBeUndefined();
  });
});
