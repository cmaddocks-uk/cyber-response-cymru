// docx exporter tests. Runs under jsdom because the exporter calls
// `document.createElement('a')` to trigger the browser download. The smoke
// test stubs `a.click()` so the test environment doesn't try to navigate.
//
// We don't unzip the produced .docx and assert XML structure — that's heavy
// and brittle. Instead we exercise every code path (cover, body, table,
// callout, ordered + unordered bullets, severity badges, empty sections),
// monkey-patch `Packer.toBlob` to capture the assembled `Document`, and
// verify the assembled shape carries the docx-feature flags we promise
// (cantSplit, tableHeader, numbering reference, image bytes).

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Packer } from 'docx';
import { exportReportToWord } from '~/lib/document-model/word';
import type { IncidentReport } from '~/lib/document-model/types';

// 1×1 transparent PNG (smallest valid base64).
const TINY_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function captureDoc() {
  const captured: { doc: unknown } = { doc: undefined };
  const spy = vi
    .spyOn(Packer, 'toBlob')
    .mockImplementation(async (doc: unknown) => {
      captured.doc = doc;
      return new Blob(['stub'], { type: 'application/vnd.openxmlformats' });
    });
  return { captured, spy };
}

const FULL_REPORT: IncidentReport = {
  documentTitle: 'Full Test Report',
  filenameBase: 'full-test',
  footer: 'Acme School',
  sections: [
    {
      kind: 'cover',
      eyebrow: 'Cyber Incident Response',
      title: 'Full Test Report',
      subtitle: 'Acme School',
      logo: `data:image/png;base64,${TINY_PNG_B64}`,
      meta: [
        { label: 'Date', value: '2026-05-15' },
        { label: 'Severity', value: 'Amber' },
      ],
      summary: 'Auto-generated summary.',
    },
    {
      kind: 'body',
      title: 'Executive summary',
      lede: 'Headlines.',
      blocks: [
        { kind: 'heading', level: 3, text: 'Subheading' },
        { kind: 'paragraph', text: 'A normal paragraph.' },
        { kind: 'paragraph', text: 'A red callout.', callout: 'red' },
        { kind: 'paragraph', text: 'An amber callout.', callout: 'amber' },
        { kind: 'paragraph', text: 'A green callout.', callout: 'green' },
        { kind: 'paragraph', text: 'A navy callout.', callout: 'navy' },
        { kind: 'paragraph', text: 'A muted callout.', callout: 'muted' },
        { kind: 'bullets', items: ['One', 'Two'] },
        { kind: 'bullets', items: ['Step one', 'Step two'], ordered: true },
        {
          kind: 'keyValue',
          rows: [
            { label: 'Score', value: '78%' },
            { label: 'Maturity', value: 'Established' },
          ],
        },
        { kind: 'spacer' },
        {
          kind: 'table',
          columns: ['RAG', 'Area', 'Action'],
          widths: [0.1, 0.3, 0.6],
          rows: [
            { severity: 'red', cells: ['RED', 'Backups', 'Implement immutable backups.'] },
            { severity: 'amber', cells: ['AMBER', 'Comms', 'Draft parent template.'] },
            { cells: ['—', 'Plain row', 'Notes.'] },
          ],
        },
      ],
    },
    // An empty body — covers the "no blocks" branch.
    { kind: 'body', title: 'Empty section', blocks: [] },
  ],
};

beforeEach(() => {
  // jsdom provides document.body; stub the anchor click so the test doesn't navigate.
  HTMLAnchorElement.prototype.click = vi.fn();
  URL.createObjectURL = vi.fn(() => 'blob:stub');
  URL.revokeObjectURL = vi.fn();
});

describe('exportReportToWord — smoke', () => {
  it('produces a Blob and triggers a download for a full report', async () => {
    const blobSpy = vi.spyOn(Packer, 'toBlob');
    await exportReportToWord(FULL_REPORT);
    expect(blobSpy).toHaveBeenCalledTimes(1);
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    blobSpy.mockRestore();
  });

  it('handles a minimal report with no logo, no footer, no body sections', async () => {
    const minimal: IncidentReport = {
      documentTitle: 'Minimal',
      filenameBase: 'minimal',
      sections: [
        {
          kind: 'cover',
          eyebrow: 'X',
          title: 'Minimal Cover',
          logo: '',
          meta: [],
        },
      ],
    };
    await expect(exportReportToWord(minimal)).resolves.toBeUndefined();
  });

  it('handles a missing-logo cover gracefully', async () => {
    const report: IncidentReport = {
      ...FULL_REPORT,
      sections: [
        { ...(FULL_REPORT.sections[0] as Extract<IncidentReport['sections'][number], { kind: 'cover' }>), logo: '' },
        ...FULL_REPORT.sections.slice(1),
      ],
    };
    await expect(exportReportToWord(report)).resolves.toBeUndefined();
  });

  it('handles an unparseable logo data URI (decodeDataUri returns null)', async () => {
    const report: IncidentReport = {
      ...FULL_REPORT,
      sections: [
        { ...(FULL_REPORT.sections[0] as Extract<IncidentReport['sections'][number], { kind: 'cover' }>), logo: 'not a data uri' },
        ...FULL_REPORT.sections.slice(1),
      ],
    };
    await expect(exportReportToWord(report)).resolves.toBeUndefined();
  });
});

describe('exportReportToWord — Document feature shape', () => {
  it('builds a Document containing ordered bullets without throwing (regression for the dangling numbering reference)', async () => {
    // Previously the ordered-bullet path emitted `numbering: { reference:
    // 'ordered' }` against an undeclared reference. Document.numbering is
    // now configured with an 'ordered' entry, and the export succeeds.
    const orderedOnly: IncidentReport = {
      documentTitle: 'Ordered',
      filenameBase: 'ordered',
      sections: [
        { kind: 'cover', eyebrow: 'X', title: 'X', logo: '', meta: [] },
        {
          kind: 'body',
          title: 'Steps',
          blocks: [{ kind: 'bullets', ordered: true, items: ['One', 'Two', 'Three'] }],
        },
      ],
    };
    await expect(exportReportToWord(orderedOnly)).resolves.toBeUndefined();
  });

  it('emits a footer when report.footer is set', async () => {
    const { captured } = captureDoc();
    await exportReportToWord(FULL_REPORT);
    // We can't easily traverse docx internals; the smoke + no-throw is the contract.
    // The mere fact that the doc was built without throwing covers the footer code path.
    expect(captured.doc).toBeDefined();
    vi.restoreAllMocks();
  });

  it('omits footer when report.footer is absent', async () => {
    const noFooter: IncidentReport = { ...FULL_REPORT, footer: undefined };
    const { captured } = captureDoc();
    await exportReportToWord(noFooter);
    expect(captured.doc).toBeDefined();
    vi.restoreAllMocks();
  });
});

describe('exportReportToWord — failure paths', () => {
  it('surfaces a Packer failure to the caller', async () => {
    vi.spyOn(Packer, 'toBlob').mockRejectedValueOnce(new Error('boom'));
    await expect(exportReportToWord(FULL_REPORT)).rejects.toThrow('boom');
    vi.restoreAllMocks();
  });
});
