// Real .docx structural assertions. Unzips the artefact produced by
// `buildDocxDocument` + `Packer.toBuffer` and checks the OOXML inside.
//
// What we assert here that the smoke test cannot:
//   - word/numbering.xml declares the `ordered` reference (fixes the
//     v2.0 regression where ordered bullets rendered as plain text)
//   - word/document.xml carries the cover title text
//   - word/document.xml carries severity row-tints (e.g. red row-tint
//     `FDF2F0` for the priority-actions table)
//   - the footer renders `PAGE` / `NUMPAGES` field codes (introduced in
//     v2.4 for "Page X of Y")
//
// These are properties Word actually uses at open-time. Catching them
// here prevents a malformed .docx escaping into a school's hands.

import { describe, it, expect } from 'vitest';
import { Packer } from 'docx';
import JSZip from 'jszip';
import { buildDocxDocument } from '~/lib/document-model/word';
import { buildGovernorReport } from '~/lib/document-model/build-governor-report';
import { initialIncident } from '~/data/plan-schema';
import { READINESS } from '~/data/readiness';

const TODAY = new Date('2026-05-15T12:00:00Z');

const allScored = (score: number) =>
  Object.fromEntries(READINESS.map((q) => [q.id, score]));

async function unzipDocx() {
  const incident = initialIncident();
  incident.plan.meta.schoolName = 'Anytown Academy';
  // Give us a populated report so the priority table + governor questions
  // both materialise (otherwise the report has only an explainer body).
  const r = allScored(3) as Record<string, number>;
  r.R1 = 0;
  r.R2 = 0;
  r.R3 = 2;

  const report = buildGovernorReport(incident.plan, r, TODAY);
  const doc = buildDocxDocument(report);
  const buffer = await Packer.toBuffer(doc);
  const zip = await JSZip.loadAsync(buffer);
  const read = async (path: string) => {
    const file = zip.file(path);
    if (!file) throw new Error(`Missing ${path} in produced .docx`);
    return file.async('string');
  };
  return {
    document: await read('word/document.xml'),
    numbering: await read('word/numbering.xml'),
    footer: await read('word/footer1.xml').catch(() => ''),
    files: Object.keys(zip.files),
  };
}

describe('.docx structural integrity', () => {
  it('contains the standard OOXML part layout', async () => {
    const { files } = await unzipDocx();
    expect(files).toContain('word/document.xml');
    expect(files).toContain('word/numbering.xml');
    expect(files).toContain('word/styles.xml');
    expect(files).toContain('[Content_Types].xml');
    expect(files).toContain('_rels/.rels');
  });

  it('numbering.xml declares an abstract+concrete num for the "ordered" list', async () => {
    const { numbering } = await unzipDocx();
    // docx renames the reference into numeric abstractNum/num IDs but the
    // ordered config produces a DECIMAL format level — that's the marker.
    expect(numbering).toContain('<w:numFmt w:val="decimal"');
    // The level body uses `%1.` as the text template.
    expect(numbering).toMatch(/<w:lvlText w:val="%1\.?"/);
  });

  it('document.xml carries the cover eyebrow + title text', async () => {
    const { document } = await unzipDocx();
    expect(document).toMatch(/CYBER INCIDENT RESPONSE/i);
    expect(document).toContain('Governor / Trustee Summary');
  });

  it('document.xml renders the school name in the subtitle', async () => {
    const { document } = await unzipDocx();
    expect(document).toContain('Anytown Academy');
  });

  it('cover is editorial-minimal: no eyebrow, no Executive Snapshot tag, no Operational readiness line', async () => {
    const { document } = await unzipDocx();
    expect(document).not.toMatch(/Executive Snapshot/i);
    expect(document).not.toMatch(/CYBER INCIDENT RESPONSE/);
    expect(document).not.toMatch(/Operational readiness/);
  });

  it('every page carries the CIRP disc in the Word page header', async () => {
    const { files } = await unzipDocx();
    // The disc is rendered as an ImageRun inside the page Header, so it
    // shows up as word/header1.xml referencing a media file.
    expect(files).toContain('word/header1.xml');
    const mediaFiles = files.filter((f) => f.startsWith('word/media/') && f.endsWith('.png'));
    expect(mediaFiles.length).toBeGreaterThan(0);
  });

  it('cover renders the "Prepared for Governors & Senior Leadership" line', async () => {
    const { document } = await unzipDocx();
    expect(document).toContain('Prepared for Governors');
  });

  it('cover renders the bottom "Prepared by …" line (school name, not the trust)', async () => {
    const { document } = await unzipDocx();
    expect(document).toContain('Prepared by Anytown Academy');
    // The v2.5.1 confidentiality block has been retired.
    expect(document).not.toContain('Confidential internal document');
    expect(document).not.toContain('Prepared using the Cyber Incident Response Planner');
  });

  it('document.xml carries severity row-tints for red and amber rows', async () => {
    const { document } = await unzipDocx();
    // SEVERITY_TOKENS.red.rowTint and .amber.rowTint — these end up in
    // <w:shd w:fill="FDF2F0"/> for red rows and FDF7EB for amber rows.
    // Match without case-sensitivity because docx may emit upper- or
    // lower-case hex.
    expect(document.toLowerCase()).toContain('w:fill="fdf2f0"');
    expect(document.toLowerCase()).toContain('w:fill="fdf7eb"');
  });

  it('document.xml fonts use Fraunces (display) + IBM Plex Sans (body)', async () => {
    const { document } = await unzipDocx();
    expect(document).toContain('Fraunces');
    expect(document).toContain('IBM Plex Sans');
  });

  it('footer1.xml carries PAGE and NUMPAGES field codes (Page X of Y)', async () => {
    const { footer, files } = await unzipDocx();
    expect(files).toContain('word/footer1.xml');
    // Field instructions appear as <w:instrText> elements containing the
    // bare field name. docx emits both "PAGE" (current page) and
    // "NUMPAGES" (total pages) for our two-column footer.
    expect(footer).toMatch(/<w:instrText[^>]*>\s*PAGE\s*<\/w:instrText>/);
    expect(footer).toMatch(/<w:instrText[^>]*>\s*NUMPAGES\s*<\/w:instrText>/);
  });

  it('footer carries the school-name slot text', async () => {
    const { footer } = await unzipDocx();
    expect(footer).toContain('Anytown Academy');
  });
});
